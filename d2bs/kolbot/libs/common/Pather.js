/**
*  @filename    Pather.js
*  @author      kolton, theBGuy
*  @desc        handle player movement
*
*/

// TODO: this needs to be re-worked
// Perform certain actions after moving to each node
const NodeAction = {
	// Run all the functions within NodeAction (except for itself)
	go: function (arg) {
		for (let i in this) {
			if (this.hasOwnProperty(i) && typeof this[i] === "function" && i !== "go") {
				this[i](arg);
			}
		}
	},

	// Kill monsters while pathing
	killMonsters: function (arg = {}) {
		let settings = Object.assign({}, {
			clearPath: false,
			specType: 0,
			range: 10,
			overrideConfig: false,
		}, arg);

		if (Config.Countess.KillGhosts && [21, 22, 23, 24, 25].includes(me.area)) {
			let monList = (Attack.getMob(38, 0, 30) || []);
			monList.length > 0 && Attack.clearList(monList);
		}

		if ((typeof Config.ClearPath === "number" || typeof Config.ClearPath === "object") && settings.clearPath === false && !settings.overrideConfig) {
			switch (typeof Config.ClearPath) {
			case "number":
				Attack.clear(30, Config.ClearPath);

				break;
			case "object":
				if (!Config.ClearPath.hasOwnProperty("Areas") || !Config.ClearPath.Areas.length || Config.ClearPath.Areas.includes(me.area)) {
					Attack.clear(Config.ClearPath.Range, Config.ClearPath.Spectype);
				}

				break;
			}

			return;
		}

		if (settings.clearPath !== false) {
			Attack.clear(settings.range, settings.specType);
		}
	},

	// Open chests while pathing
	popChests: function () {
		// fastPick check? should only open chests if surrounding monsters have been cleared or if fastPick is active
		// note: clear of surrounding monsters of the spectype we are set to clear
		Config.OpenChests.Enabled && Misc.openChests(Config.OpenChests.Range);
	},

	// Scan shrines while pathing
	getShrines: function () {
		Config.ScanShrines.length > 0 && Misc.scanShrines();
	}
};

const PathDebug = {
	hooks: [],
	enableHooks: false,

	drawPath: function (path) {
		if (!this.enableHooks) return;

		this.removeHooks();

		if (path.length < 2) return;

		for (let i = 0; i < path.length - 1; i += 1) {
			this.hooks.push(new Line(path[i].x, path[i].y, path[i + 1].x, path[i + 1].y, 0x84, true));
		}
	},

	removeHooks: function () {
		for (let i = 0; i < this.hooks.length; i += 1) {
			this.hooks[i].remove();
		}

		this.hooks = [];
	},

	coordsInPath: function (path, x, y) {
		for (let i = 0; i < path.length; i += 1) {
			if (getDistance(x, y, path[i].x, path[i].y) < 5) {
				return true;
			}
		}

		return false;
	}
};

const Pather = {
	initialized: false,
	teleport: true,
	walkDistance: 5,
	teleDistance: 40,
	cancelFlags: [0x01, 0x02, 0x04, 0x08, 0x14, 0x16, 0x0c, 0x0f, 0x17, 0x19, 0x1A],
	wpAreas: [1, 3, 4, 5, 6, 27, 29, 32, 35, 40, 48, 42, 57, 43, 44, 52, 74, 46, 75, 76, 77, 78, 79, 80, 81, 83, 101, 103, 106, 107, 109, 111, 112, 113, 115, 123, 117, 118, 129],
	nonTownWpAreas: [3, 4, 5, 6, 27, 29, 32, 35, 48, 42, 57, 43, 44, 52, 74, 46, 76, 77, 78, 79, 80, 81, 83, 101, 106, 107, 111, 112, 113, 115, 123, 117, 118, 129],
	nextAreas: {1: 2, 40: 41, 75: 76, 103: 104, 109: 110},
	recursion: true,
	lastPortalTick: 0,

	init: function () {
		if (!this.initialized) {
			!getWaypoint(1) && this.getWP(me.area);
			me.classic && (this.nonTownWpAreas = this.nonTownWpAreas.filter((wp) => wp < sdk.areas.Harrogath));
			me.cancelUIFlags();
			this.initialized = true;
		}
	},

	canTeleport: function () {
		return this.teleport && (me.getSkill(sdk.skills.Teleport, 1) || me.getStat(sdk.stats.OSkill, sdk.skills.Teleport));
	},

	useTeleport: function () {
		let manaTP = Skill.getManaCost(sdk.skills.Teleport);
		let numberOfTeleport = ~~(me.mpmax / manaTP);
		return !me.inTown && !Config.NoTele && !me.shapeshifted && this.canTeleport() && numberOfTeleport > 2;
	},

	spotOnDistance: function (spot, distance, givenSettings = {}) {
		let settings = Object.assign({}, {
			area: me.area,
			reductionType: 2,
			coll: (0x1 | 0x4 | 0x800 | 0x1000),
			returnSpotOnError: true
		}, givenSettings);

		let nodes = getPath(settings.area, me.x, me.y, spot.x, spot.y, settings.reductionType, 5);
		
		if (!nodes || !nodes.length) return (settings.returnSpotOnError ? spot : { x: me.x, y: me.y });

		return (nodes.find((node) => getDistance(spot.x, spot.y, node.x, node.y) < distance && Pather.checkSpot(node.x, node.y, settings.coll))
			|| (settings.returnSpotOnError ? spot : { x: me.x, y: me.y }));
	},

	moveNear: function (x, y, minDist, givenSettings = {}) {
		// Abort if dead
		if (me.dead) return false;
		let settings = Object.assign({}, {
			allowTeleport: true,
			clearSettings: {
				clearPath: false,
				range: 10,
				specType: 0,
			},
			pop: false,
			returnSpotOnError: true
		}, givenSettings);

		let cleared = false;
		let leaped = false;
		let invalidCheck = false;
		let node = {x: x, y: y};
		let fail = 0;

		for (let i = 0; i < this.cancelFlags.length; i += 1) {
			getUIFlag(this.cancelFlags[i]) && me.cancel();
		}

		if (x === undefined || y === undefined) return false; // I don't think this is a fatal error so just return false
		if (typeof x !== "number" || typeof y !== "number") throw new Error("moveNear: Coords must be numbers");

		let useTele = this.useTeleport() && settings.allowTeleport;
		let tpMana = Skill.getManaCost(sdk.skills.Teleport);
		minDist === undefined && (minDist = me.inTown ? 2 : 5);
		({x, y} = this.spotOnDistance(node, minDist, {returnSpotOnError: settings.returnSpotOnError, reductionType: (me.inTown ? 0 : 2)}));
		if ([x, y].distance < 2) return true;
		let annoyingArea = [sdk.areas.MaggotLairLvl1, sdk.areas.MaggotLairLvl2, sdk.areas.MaggotLairLvl3].includes(me.area);
		let path = getPath(me.area, x, y, me.x, me.y, useTele ? 1 : 0, useTele ? (annoyingArea ? 30 : this.teleDistance) : this.walkDistance);

		if (!path) throw new Error("moveNear: Failed to generate path.");

		!useTele && (settings.clearSettings.clearPath = true);

		path.reverse();
		settings.pop && path.pop();
		PathDebug.drawPath(path);
		useTele && Config.TeleSwitch && path.length > 5 && me.switchWeapons(Attack.getPrimarySlot() ^ 1);

		while (path.length > 0) {
			// Abort if dead
			if (me.dead) return false;

			for (let i = 0; i < this.cancelFlags.length; i += 1) {
				getUIFlag(this.cancelFlags[i]) && me.cancel();
			}

			node = path.shift();

			if (node.distance > 2) {
				fail >= 3 && fail % 3 === 0 && !Attack.validSpot(node.x, node.y) && (invalidCheck = true);
				if (annoyingArea || invalidCheck) {
					let adjustedNode = this.getNearestWalkable(node.x, node.y, 15, 3, 0x1 | 0x4 | 0x800 | 0x1000);

					if (adjustedNode) {
						node.x = adjustedNode[0];
						node.y = adjustedNode[1];
						invalidCheck && (invalidCheck = false);
					}
					
					settings.clearSettings.range = 5;
				}

				if (useTele && tpMana <= me.mp ? this.teleportTo(node.x, node.y) : this.walkTo(node.x, node.y, (fail > 0 || me.inTown) ? 2 : 4)) {
					if (!me.inTown) {
						if (this.recursion) {
							this.recursion = false;

							NodeAction.go(settings.clearSettings);

							node.distance > 5 && this.moveTo(node.x, node.y);

							this.recursion = true;
						}

						Misc.townCheck();
					}
				} else {
					if (!me.inTown) {
						if (!useTele && ((me.getMobCount(10) > 0 && Attack.clear(8)) || this.kickBarrels(node.x, node.y) || this.openDoors(node.x, node.y))) {
							continue;
						}

						if (fail > 0 && (!useTele || tpMana > me.mp)) {
							// Don't go berserk on longer paths
							if (!cleared && me.getMobCount(5) > 0 && Attack.clear(5)) {
								cleared = true;
							}

							// Only do this once
							if (fail > 1 && !leaped && me.getSkill(sdk.skills.LeapAttack, 1) && Skill.cast(sdk.skills.LeapAttack, 0, node.x, node.y)) {
								leaped = true;
							}
						}
					}

					path = getPath(me.area, x, y, me.x, me.y, useTele ? 1 : 0, useTele ? rand(25, 35) : rand(10, 15));
					if (!path) throw new Error("moveNear: Failed to generate path.");

					path.reverse();
					PathDebug.drawPath(path);
					settings.pop && path.pop();

					if (fail > 0) {
						console.debug("move retry " + fail);
						Packet.flash(me.gid);

						if (fail >= 15) {
							break;
						}
					}
					fail++;
				}
			}

			delay(5);
		}

		useTele && Config.TeleSwitch && me.switchWeapons(Attack.getPrimarySlot() ^ 1);
		PathDebug.removeHooks();

		return node.distance < 5;
	},

	// TODO: change this to accept an object with settings so we can better control what gets done and where
	// going to require re-writes of almost everything though
	/*
		Pather.moveTo(x, y, retry, clearPath, pop);
		x - the x coord to move to
		y - the y coord to move to
		retry - number of attempts before aborting
		clearPath - kill monsters while moving
		pop - remove last node
	*/
	moveTo: function (x, y, retry, clearPath = false, pop = false) {
		// Abort if dead
		if (me.dead) return false;

		if (x === undefined || y === undefined) throw new Error("moveTo: Function must be called with at least 2 arguments.");
		if (typeof x !== "number" || typeof y !== "number") throw new Error("moveTo: Coords must be numbers");
		if ([x, y].distance < 2) return true;

		for (let i = 0; i < this.cancelFlags.length; i += 1) {
			getUIFlag(this.cancelFlags[i]) && me.cancel();
		}

		let cleared = false;
		let leaped = false;
		let invalidCheck = false;
		let node = {x: x, y: y};
		let fail = 0;

		let useTeleport = this.useTeleport();
		let tpMana = Skill.getManaCost(sdk.skills.Teleport);
		let annoyingArea = [sdk.areas.MaggotLairLvl1, sdk.areas.MaggotLairLvl2, sdk.areas.MaggotLairLvl3].includes(me.area);
		let clearSettings = {
			clearPath: (clearPath || !useTeleport), // walking characters need to clear in front of them
			range: 10,
			specType: 0,
		};
		(!retry || (retry <= 3 && !useTeleport)) && (retry = useTeleport ? 5 : 15);
		let path = getPath(me.area, x, y, me.x, me.y, useTeleport ? 1 : 0, useTeleport ? (annoyingArea ? 30 : this.teleDistance) : this.walkDistance);

		if (!path) throw new Error("moveTo: Failed to generate path.");

		path.reverse();
		pop && path.pop();
		PathDebug.drawPath(path);
		useTeleport && Config.TeleSwitch && path.length > 5 && me.switchWeapons(Attack.getPrimarySlot() ^ 1);

		while (path.length > 0) {
			// Abort if dead
			if (me.dead) return false;

			for (let i = 0; i < this.cancelFlags.length; i += 1) {
				getUIFlag(this.cancelFlags[i]) && me.cancel();
			}

			node = path.shift();

			/* Right now getPath's first node is our own position so it's not necessary to take it into account
				This will be removed if getPath changes
			*/
			if (getDistance(me, node) > 2) {
				fail >= 3 && fail % 3 === 0 && !Attack.validSpot(node.x, node.y) && (invalidCheck = true);
				// Make life in Maggot Lair easier - should this include arcane as well?
				if (annoyingArea || invalidCheck) {
					let adjustedNode = this.getNearestWalkable(node.x, node.y, 15, 3, 0x1 | 0x4 | 0x800 | 0x1000);

					if (adjustedNode) {
						node.x = adjustedNode[0];
						node.y = adjustedNode[1];
						invalidCheck && (invalidCheck = false);
					}

					if (annoyingArea) {
						clearSettings.overrideConfig = true;
						clearSettings.range = 5;
					}

					retry <= 3 && !useTeleport && (retry = 15);
				}

				if (useTeleport && tpMana < me.mp ? this.teleportTo(node.x, node.y) : this.walkTo(node.x, node.y, (fail > 0 || me.inTown) ? 2 : 4)) {
					if (!me.inTown) {
						if (this.recursion) {
							this.recursion = false;

							NodeAction.go(clearSettings);

							// TODO: check whether we are closer to the next node than we are the node we were orignally moving to
							// and if so move to next node to prevent back tracking for no reason
							if (getDistance(me, node.x, node.y) > 5) {
								this.moveTo(node.x, node.y);
							}

							this.recursion = true;
						}

						Misc.townCheck();
					}
				} else {
					if (!me.inTown) {
						if (!useTeleport && ((me.getMobCount(10) > 0 && Attack.clear(8)) || this.kickBarrels(node.x, node.y) || this.openDoors(node.x, node.y))) {
							continue;
						}

						if (fail > 0 && (!useTeleport || tpMana > me.mp)) {
							// Don't go berserk on longer paths
							if (!cleared && me.getMobCount(5) > 0 && Attack.clear(5)) {
								cleared = true;
							}

							// Only do this once
							if (fail > 1 && !leaped && me.getSkill(sdk.skills.LeapAttack, 1) && Skill.cast(sdk.skills.LeapAttack, 0, node.x, node.y)) {
								leaped = true;
							}
						}
					}

					// Reduce node distance in new path
					path = getPath(me.area, x, y, me.x, me.y, useTeleport ? 1 : 0, useTeleport ? rand(25, 35) : rand(10, 15));
					if (!path) throw new Error("moveNear: Failed to generate path.");

					path.reverse();
					PathDebug.drawPath(path);
					pop && path.pop();

					if (fail > 0) {
						console.debug("move retry " + fail);
						Packet.flash(me.gid);

						if (fail >= retry) {
							break;
						}
					}
					fail++;
				}
			}

			delay(5);
		}

		useTeleport && Config.TeleSwitch && me.switchWeapons(Attack.getPrimarySlot() ^ 1);
		PathDebug.removeHooks();

		return node.distance < 5;
	},

	moveToEx: function (x, y, givenSettings = {}) {
		// Abort if dead
		if (me.dead) return false;
		let settings = Object.assign({}, {
			allowTeleport: true,
			clearSettings: {
				allowClearing: true,
				clearPath: false,
				range: 10,
				specType: 0,
			},
			pop: false,
			retry: 15
		}, givenSettings);

		let cleared = false;
		let leaped = false;
		let invalidCheck = false;
		let node = {x: x, y: y};
		let fail = 0;

		for (let i = 0; i < this.cancelFlags.length; i += 1) {
			getUIFlag(this.cancelFlags[i]) && me.cancel();
		}

		if (x === undefined || y === undefined) return false; // I don't think this is a fatal error so just return false
		if (typeof x !== "number" || typeof y !== "number") throw new Error("moveToEx: Coords must be numbers");

		let useTele = this.useTeleport() && settings.allowTeleport;
		let tpMana = Skill.getManaCost(sdk.skills.Teleport);
		if ([x, y].distance < 2) return true;
		let annoyingArea = [sdk.areas.MaggotLairLvl1, sdk.areas.MaggotLairLvl2, sdk.areas.MaggotLairLvl3].includes(me.area);
		let path = getPath(me.area, x, y, me.x, me.y, useTele ? 1 : 0, useTele ? (annoyingArea ? 30 : this.teleDistance) : this.walkDistance);

		if (!path) throw new Error("moveToEx: Failed to generate path.");

		!useTele && (settings.clearSettings.clearPath = true);

		path.reverse();
		settings.pop && path.pop();
		PathDebug.drawPath(path);
		useTele && Config.TeleSwitch && path.length > 5 && me.switchWeapons(Attack.getPrimarySlot() ^ 1);

		while (path.length > 0) {
			// Abort if dead
			if (me.dead) return false;

			for (let i = 0; i < this.cancelFlags.length; i += 1) {
				getUIFlag(this.cancelFlags[i]) && me.cancel();
			}

			node = path.shift();

			if (node.distance > 2) {
				fail >= 3 && fail % 3 === 0 && !Attack.validSpot(node.x, node.y) && (invalidCheck = true);
				if (annoyingArea || invalidCheck) {
					let adjustedNode = this.getNearestWalkable(node.x, node.y, 15, 3, 0x1 | 0x4 | 0x800 | 0x1000);

					if (adjustedNode) {
						node.x = adjustedNode[0];
						node.y = adjustedNode[1];
						invalidCheck && (invalidCheck = false);
					}
					
					settings.clearSettings.range = 5;
				}

				if (useTele && tpMana <= me.mp ? this.teleportTo(node.x, node.y) : this.walkTo(node.x, node.y, (fail > 0 || me.inTown) ? 2 : 4)) {
					if (!me.inTown) {
						if (settings.clearSettings.allowClearing && this.recursion) {
							this.recursion = false;

							NodeAction.go(settings.clearSettings);

							node.distance > 5 && this.moveToEx(node.x, node.y, settings);

							this.recursion = true;
						}

						Misc.townCheck();
					}
				} else {
					if (!me.inTown) {
						if (!useTele
							&& ((settings.clearSettings.allowClearing && me.getMobCount(10) > 0 && Attack.clear(8))
							|| this.kickBarrels(node.x, node.y)
							|| this.openDoors(node.x, node.y))) {
							continue;
						}

						if (fail > 0 && (!useTele || tpMana > me.mp)) {
							// Don't go berserk on longer paths
							if (!cleared && settings.clearSettings.allowClearing && me.getMobCount(5) > 0 && Attack.clear(5)) {
								cleared = true;
							}

							// Only do this once
							if (fail > 1 && !leaped && me.getSkill(sdk.skills.LeapAttack, 1) && Skill.cast(sdk.skills.LeapAttack, 0, node.x, node.y)) {
								leaped = true;
							}
						}
					}

					path = getPath(me.area, x, y, me.x, me.y, useTele ? 1 : 0, useTele ? rand(25, 35) : rand(10, 15));
					if (!path) throw new Error("moveToEx: Failed to generate path.");

					path.reverse();
					PathDebug.drawPath(path);
					settings.pop && path.pop();

					if (fail > 0) {
						console.debug("move retry " + fail);
						Packet.flash(me.gid);

						if (fail > 1 && !settings.clearSettings.allowClearing) {
							// override if we are failing to move
							settings.clearSettings.allowClearing = true;
						}

						if (fail >= settings.retry) {
							break;
						}
					}
					fail++;
				}
			}

			delay(5);
		}

		useTele && Config.TeleSwitch && me.switchWeapons(Attack.getPrimarySlot() ^ 1);
		PathDebug.removeHooks();

		return node.distance < 5;
	},

	/*
		Pather.teleportTo(x, y);
		x - the x coord to teleport to
		y - the y coord to teleport to
	*/
	// does this need a validLocation check?
	teleportTo: function (x, y, maxRange = 5) {
		for (let i = 0; i < 3; i += 1) {
			Config.PacketCasting > 0 ? Skill.setSkill(sdk.skills.Teleport, 0) && Packet.castSkill(0, x, y) : Skill.cast(sdk.skills.Teleport, 0, x, y);
			let tick = getTickCount();

			while (getTickCount() - tick < Math.max(500, me.ping * 2 + 200)) {
				if ([x, y].distance < maxRange) {
					return true;
				}

				delay(10);
			}
		}

		return false;
	},

	/*
		Pather.walkTo(x, y);
		x - the x coord to walk to
		y - the y coord to walk to
		minDist - minimal distance from x/y before returning true
	*/
	walkTo: function (x, y, minDist) {
		while (!me.gameReady) {
			delay(100);
		}

		if (x === undefined || y === undefined) return false;
		minDist === undefined && (minDist = me.inTown ? 2 : 4);

		let angle, angles, nTimer, whereToClick;
		let nFail = 0;
		let attemptCount = 0;

		// credit @Jaenster
		// Stamina handler and Charge
		if (!me.inTown && !me.dead) {
			// Check if I have a stamina potion and use it if I do
			if (me.staminaPercent <= 20) {
				let stam = me.getItemsEx().filter((i) => i.classid === sdk.items.StaminaPotion && i.isInInventory).first();
				!!stam && ![0, 17, 18].includes(me.mode) && stam.interact();
			}
			(me.runwalk === 1 && me.staminaPercent <= 15) && (me.runwalk = 0);
			// the less stamina you have, the more you wait to recover
			let recover = me.staminaMaxDuration < 30 ? 80 : 50;
			(me.runwalk === 0 && me.staminaPercent >= recover) && (me.runwalk = 1);
			if (Config.Charge && me.paladin && me.mp >= 9 && getDistance(me.x, me.y, x, y) > 8 && Skill.setSkill(sdk.skills.Charge, 1)) {
				if (Config.Vigor) {
					Skill.setSkill(sdk.skills.Vigor, 0);
				} else if (!Config.Vigor && !Attack.auradin && me.getSkill(sdk.skills.HolyFreeze, 1)) {
					// Useful in classic to keep mobs cold while you rush them
					Skill.setSkill(sdk.skills.HolyFreeze, 0);
				}
				Misc.click(0, 1, x, y);
				while (me.mode !== 1 && me.mode !== 5 && !me.dead) {
					delay(40);
				}
			}
		}

		(me.inTown && me.runwalk === 0) && (me.runwalk = 1);

		while (getDistance(me.x, me.y, x, y) > minDist && !me.dead) {
			me.paladin && Config.Vigor && Skill.setSkill(sdk.skills.Vigor, 0);
			me.paladin && !Config.Vigor && Skill.setSkill(Config.AttackSkill[2], 0);

			if (this.openDoors(x, y) && getDistance(me.x, me.y, x, y) <= minDist) {
				return true;
			}

			if (CollMap.checkColl(me, {x: x, y: y}, 0x1 | 0x800)) {
				this.openDoors(me.x, me.y);
			}

			Misc.click(0, 0, x, y);

			attemptCount += 1;
			nTimer = getTickCount();

			while (me.mode !== 2 && me.mode !== 3 && me.mode !== 6) {
				if (me.dead) return false;

				if ((getTickCount() - nTimer) > 500) {
					if (nFail >= 3) return false;

					nFail += 1;
					angle = Math.atan2(me.y - y, me.x - x);
					angles = [Math.PI / 2, -Math.PI / 2];

					for (let i = 0; i < angles.length; i += 1) {
						// TODO: might need rework into getnearestwalkable
						whereToClick = {
							x: Math.round(Math.cos(angle + angles[i]) * 5 + me.x),
							y: Math.round(Math.sin(angle + angles[i]) * 5 + me.y)
						};

						if (Attack.validSpot(whereToClick.x, whereToClick.y)) {
							Misc.click(0, 0, whereToClick.x, whereToClick.y);

							let tick = getTickCount();

							while (getDistance(me, whereToClick) > 2 && getTickCount() - tick < 1000) {
								delay(40);
							}

							break;
						}
					}

					break;
				}

				delay(10);
			}

			attemptCount > 1 && this.kickBarrels(x, y);

			// Wait until we're done walking - idle or dead
			while (getDistance(me.x, me.y, x, y) > minDist && me.mode !== 1 && me.mode !== 5 && !me.dead) {
				delay(10);
			}

			if (attemptCount >= 3) return false;
		}

		return !me.dead && getDistance(me.x, me.y, x, y) <= minDist;
	},

	/*
		Pather.openDoors(x, y);
		x - the x coord of the node close to the door
		y - the y coord of the node close to the door
	*/
	openDoors: function (x, y) {
		if (me.inTown) return false;

		typeof x !== "number" && (x = me.x);
		typeof y !== "number" && (y = me.y);

		// Regular doors
		let door = getUnit(sdk.unittype.Object, "door", 0);

		if (door) {
			do {
				if ((getDistance(door, x, y) < 4 && door.distance < 9) || door.distance < 4) {
					for (let i = 0; i < 3; i++) {
						Misc.click(0, 0, door);

						if (Misc.poll(() => door.mode === 2, 1000, 10 + me.ping)) {
							return true;
						}

						i === 2 && Packet.flash(me.gid);
					}
				}
			} while (door.getNext());
		}

		// Monsta doors (Barricaded)
		let monstadoor = getUnit(sdk.unittype.Monster, "barricaded door");

		if (monstadoor) {
			do {
				if (monstadoor.hp > 0 && (getDistance(monstadoor, x, y) < 4 && monstadoor.distance < 9) || monstadoor.distance < 4) {
					for (let p = 0; p < 20 && monstadoor.hp; p++) {
						Skill.cast(Config.AttackSkill[1], Skill.getHand(Config.AttackSkill[1]), monstadoor);
					}
				}
			} while (monstadoor.getNext());
		}

		let monstawall = getUnit(sdk.unittype.Monster, "barricade");
		
		if (monstawall) {
			do {
				if (monstawall.hp > 0 && (getDistance(monstawall, x, y) < 4 && monstawall.distance < 9) || monstawall.distance < 4) {
					for (let p = 0; p < 20 && monstawall.hp; p++) {
						Skill.cast(Config.AttackSkill[1], Skill.getHand(Config.AttackSkill[1]), monstawall);
					}
				}
			} while (monstawall.getNext());
		}

		return false;
	},

	/*
		Pather.kickBarrels(x, y);
		x - the x coord of the node close to the barrel
		y - the y coord of the node close to the barrel
	*/
	kickBarrels: function (x, y) {
		if (me.inTown) return false;

		typeof x !== "number" && (x = me.x);
		typeof y !== "number" && (y = me.y);

		// anything small and annoying really
		let barrels = getUnits(sdk.unittype.Object)
			.filter(function (el) {
				return (el.name && el.mode === 0
				&& ["ratnest", "goo pile", "barrel", "basket", "largeurn", "jar3", "jar2", "jar1", "urn", "jug", "barrel wilderness", "cocoon"].includes(el.name.toLowerCase())
				&& ((getDistance(el, x, y) < 4 && el.distance < 9) || el.distance < 4));
			});
		let brokeABarrel = false;

		while (barrels.length > 0) {
			barrels.sort(Sort.units);
			let unit = barrels.shift();

			if (unit && !checkCollision(me, unit, 0x5)) {
				try {
					for (let i = 0; i < 5; i++) {
						i < 3 ? sendPacket(1, 0x13, 4, unit.type, 4, unit.gid) : Misc.click(0, 0, unit);

						if (unit.mode) {
							brokeABarrel = true;
							break;
						}
					}
				} catch (e) {
					continue;
				}
			}
		}

		return brokeABarrel;
	},

	/*
		Pather.moveToUnit(unit, offX, offY, clearPath, pop);
		unit - a valid Unit or PresetUnit object
		offX - offset from unit's x coord
		offY - offset from unit's x coord
		clearPath - kill monsters while moving
		pop - remove last node
	*/
	moveToUnit: function (unit, offX, offY, clearPath, pop) {
		let useTeleport = this.useTeleport();

		offX === undefined && (offX = 0);
		offY === undefined && (offY = 0);
		clearPath === undefined && (clearPath = false);
		pop === undefined && (pop = false);

		if (!unit || !unit.hasOwnProperty("x") || !unit.hasOwnProperty("y")) throw new Error("moveToUnit: Invalid unit.");

		(unit instanceof PresetUnit) && (unit = {x: unit.roomx * 5 + unit.x, y: unit.roomy * 5 + unit.y});

		if (!useTeleport) {
			// The unit will most likely be moving so call the first walk with 'pop' parameter
			this.moveTo(unit.x + offX, unit.y + offY, 0, clearPath, true);
		}

		return this.moveTo(unit.x + offX, unit.y + offY, useTeleport && unit.type && unit.type === 1 ? 3 : 0, clearPath, pop);
	},

	moveNearUnit: function (unit, minDist, clearPath, pop = false) {
		let useTeleport = this.useTeleport();
		minDist === undefined && (minDist = me.inTown ? 2 : 5);

		if (!unit || !unit.hasOwnProperty("x") || !unit.hasOwnProperty("y")) throw new Error("moveNearUnit: Invalid unit.");

		(unit instanceof PresetUnit) && (unit = {x: unit.roomx * 5 + unit.x, y: unit.roomy * 5 + unit.y});

		if (!useTeleport) {
			// The unit will most likely be moving so call the first walk with 'pop' parameter
			this.moveNear(unit.x, unit.y, minDist, {clearSettings: {clearPath: clearPath}, pop: true});
		}

		return this.moveNear(unit.x, unit.y, minDist, {clearSettings: {clearPath: clearPath}, pop: pop});
	},

	moveNearPreset: function (area, unitType, unitId, minDist, clearPath = false, pop = false) {
		if (area === undefined || unitType === undefined || unitId === undefined) {
			throw new Error("moveNearPreset: Invalid parameters.");
		}

		area !== me.area && Pather.journeyTo(area);

		let presetUnit = getPresetUnit(area, unitType, unitId);

		if (!presetUnit) {
			throw new Error("moveNearPreset: Couldn't find preset unit - id: " + unitId + " unitType: " + unitType + " in area: " + this.getAreaName(area));
		}

		let unit = {x: presetUnit.roomx * 5 + presetUnit.x, y: presetUnit.roomy * 5 + presetUnit.y};

		return this.moveNear(unit.x, unit.y, minDist, {clearSettings: {clearPath: clearPath}, pop: pop});
	},

	/*
		Pather.moveToPreset(area, unitType, unitId, offX, offY, clearPath, pop);
		area - area of the preset unit
		unitType - type of the preset unit
		unitId - preset unit id
		offX - offset from unit's x coord
		offY - offset from unit's x coord
		clearPath - kill monsters while moving
		pop - remove last node
	*/
	moveToPreset: function (area, unitType, unitId, offX, offY, clearPath, pop) {
		if (area === undefined || unitType === undefined || unitId === undefined) {
			throw new Error("moveToPreset: Invalid parameters.");
		}

		offX === undefined && (offX = 0);
		offY === undefined && (offY = 0);
		clearPath === undefined && (clearPath = false);
		pop === undefined && (pop = false);

		me.area !== area && Pather.journeyTo(area);
		let presetUnit = getPresetUnit(area, unitType, unitId);

		if (!presetUnit) {
			throw new Error("moveToPreset: Couldn't find preset unit - id: " + unitId + " unitType: " + unitType + " in area: " + this.getAreaName(area));
		}

		return this.moveTo(presetUnit.roomx * 5 + presetUnit.x + offX, presetUnit.roomy * 5 + presetUnit.y + offY, 3, clearPath, pop);
	},

	/*
		Pather.moveToExit(targetArea, use, clearPath);
		targetArea - area id or array of area ids to move to
		use - enter target area or last area in the array
		clearPath - kill monsters while moving
	*/
	moveToExit: function (targetArea, use = false, clearPath = false) {
		if (targetArea === undefined) return false;

		let tick = getTickCount();
		console.log("ÿc7Start :: ÿc8(moveToExit)");
		let areas = Array.isArray(targetArea) ? targetArea : [targetArea];
		let finalDest = areas.last();

		for (let i = 0; i < areas.length; i += 1) {
			console.log("ÿc7(moveToExit) :: ÿc0Moving from: " + Pather.getAreaName(me.area) + " to " + Pather.getAreaName(areas[i]));
			
			let area = Misc.poll(() => getArea());

			if (!area) throw new Error("moveToExit: error in getArea()");

			let currTarget = areas[i];
			let exits = area.exits;
			let checkExits = [];

			if (!exits || !exits.length) return false;

			for (let j = 0; j < exits.length; j += 1) {
				if (!exits[j].hasOwnProperty("target") || exits[j].target !== currTarget) continue;
				let currCheckExit = {
					x: exits[j].x,
					y: exits[j].y,
					type: exits[j].type,
					target: exits[j].target,
					tileid: exits[j].tileid
				};

				currCheckExit.target === currTarget && checkExits.push(currCheckExit);
			}

			if (checkExits.length > 0) {
				// if there are multiple exits to the same location find the closest one
				let currExit = checkExits.length > 1
					? (() => {
						let useExit = checkExits.shift(); // assign the first exit as a possible result
						let dist = getDistance(me.x, me.y, useExit.x, useExit.y);
						while (checkExits.length > 0) {
							let exitDist = getDistance(me.x, me.y, checkExits[0].x, checkExits[0].y);
							if (exitDist < dist) {
								useExit = checkExits[0];
								dist = exitDist;
							}
							checkExits.shift();
						}
						return useExit;
						//checkExits.sort((a, b) => getDistance(me.x, me.y, a.x, a.y) - getDistance(me.x, me.y, b.x, b.y)).first()
					})()
					: checkExits[0];
				let dest = this.getNearestWalkable(currExit.x, currExit.y, 5, 1);

				if (!dest) return false;

				for (let retry = 0; retry < 3; retry++) {
					if (this.moveTo(dest[0], dest[1], 3, clearPath)) {
						break;
					}

					delay(200);
					console.log("ÿc7(moveToExit) :: ÿc0Retry: " + (retry + 1));
					Misc.poll(() => me.gameReady, 1000, 200);
				}

				/* i < areas.length - 1 is for crossing multiple areas.
					In that case we must use the exit before the last area.
				*/
				if (use || i < areas.length - 1) {
					switch (currExit.type) {
					case 1: // walk through
						let targetRoom = this.getNearestRoom(areas[i]);

						if (targetRoom) {
							this.moveTo(targetRoom[0], targetRoom[1]);
						} else {
							// might need adjustments
							return false;
						}

						break;
					case 2: // stairs
						if (!this.openExit(areas[i]) && !this.useUnit(5, currExit.tileid, areas[i])) {
							return false;
						}

						break;
					}
				}
			} else {
				// journey there?
				console.warn("Something broke");
			}
		}

		console.log("ÿc7End ÿc8(moveToExit) ÿc0:: ÿc7targetArea: ÿc0" + this.getAreaName(finalDest) + " ÿc7myArea: ÿc0" + this.getAreaName(me.area) + "ÿc0 - ÿc7Duration: ÿc0" + (formatTime(getTickCount() - tick)));
		delay(300);

		return (use && finalDest ? me.area === finalDest : true);
	},

	/*
		Pather.getNearestRoom(area);
		area - the id of area to search for the room nearest to the player character
	*/
	getNearestRoom: function (area) {
		let startTick = getTickCount();
		let x, y, minDist = 10000;

		let room = Misc.poll(() => getRoom(area), 1000, 200);
		if (!room) return false;

		do {
			let dist = getDistance(me, room.x * 5 + room.xsize / 2, room.y * 5 + room.ysize / 2);

			if (dist < minDist) {
				x = room.x * 5 + room.xsize / 2;
				y = room.y * 5 + room.ysize / 2;
				minDist = dist;
			}
		} while (room.getNext());

		room = getRoom(area, x, y);
		!!Config.DebugMode && console.log(room);

		if (room) {
			CollMap.addRoom(room);

			!!Config.DebugMode && console.log("ÿc7End ÿc8(getNearestOld) ÿc0 - ÿc7Duration: ÿc0" + (getTickCount() - startTick));
			return this.getNearestWalkable(x, y, 20, 4);
		}

		!!Config.DebugMode && console.log("ÿc7End ÿc8(getNearestOld) ÿc0 - ÿc7Duration: ÿc0" + (getTickCount() - startTick));
		return [x, y];
	},

	/*
		Pather.openExit(targetArea);
		targetArea - area id of where the unit leads to
	*/
	openExit: function (targetArea) {
		switch (true) {
		case targetArea === sdk.areas.AncientTunnels:
		case targetArea === sdk.areas.A2SewersLvl1 && !(me.area === sdk.areas.LutGholein && [5218, 5180].distance < 20):
			return this.useUnit(sdk.unittype.Object, sdk.units.TrapDoorA2, targetArea);
		case targetArea === sdk.areas.A3SewersLvl2:
			return this.useUnit(sdk.unittype.Object, sdk.units.SewerStairsA3, targetArea);
		case targetArea === sdk.areas.RuinedTemple:
		case targetArea === sdk.areas.DisusedFane:
		case targetArea === sdk.areas.ForgottenReliquary:
		case targetArea === sdk.areas.ForgottenTemple:
		case targetArea === sdk.areas.RuinedFane:
		case targetArea === sdk.areas.DisusedReliquary:
			return this.useUnit(sdk.unittype.Object, "stair", targetArea);
		case targetArea === sdk.areas.DuranceOfHateLvl1 && me.area === sdk.areas.Travincal:
			return this.useUnit(sdk.unittype.Object, sdk.units.DuranceEntryStairs, targetArea);
		case targetArea === sdk.areas.WorldstoneLvl1 && me.area === sdk.areas.ArreatSummit:
			return this.useUnit(sdk.unittype.Object, sdk.units.AncientsDoor, targetArea);
		}

		return false;
	},

	/*
		Pather.openUnit(id);
		type - type of the unit to open
		id - id of the unit to open
	*/
	openUnit: function (type, id) {
		let unit = Misc.poll(() => getUnit(type, id), 1000, 200);
		if (!unit) throw new Error("openUnit: Unit not found. ID: " + unit);
		if (unit.mode !== 0) return true;

		for (let i = 0; i < 3; i += 1) {
			unit.distance > 5 && this.moveToUnit(unit);

			delay(300);
			sendPacket(1, 0x13, 4, unit.type, 4, unit.gid);

			if (Misc.poll(() => unit.mode !== 0, 2000, 60)) {
				delay(100);

				return true;
			}

			let coord = CollMap.getRandCoordinate(me.x, -1, 1, me.y, -1, 1, 3);
			!!coord && this.moveTo(coord.x, coord.y);
		}

		return false;
	},

	/*
		Pather.useUnit(type, id, targetArea);
		type - type of the unit to use
		id - id of the unit to use
		targetArea - area id of where the unit leads to
	*/
	// should use an object as param, or be changed to able to take an already found unit as a param
	useUnit: function (type, id, targetArea) {
		let unit = Misc.poll(() => getUnit(type, id), 2000, 200);
		let preArea = me.area;

		if (!unit) {
			throw new Error("useUnit: Unit not found. TYPE: " + type + " ID: " + id + " MyArea: " + this.getAreaName(me.area) + (!!targetArea ? " TargetArea: " + Pather.getAreaName(targetArea) : ""));
		}

		for (let i = 0; i < 5; i += 1) {
			let usetk = (i < 2 && Skill.useTK(unit));
			
			if (unit.distance > 5) {
				usetk ? this.moveNearUnit(unit, 20) : this.moveToUnit(unit);
				// try to activate it once
				usetk && i === 0 && unit.mode === 0 && unit.distance < 21 && Skill.cast(sdk.skills.Telekinesis, 0, unit);
			}

			if (type === 2 && unit.mode === 0) {
				if ((me.area === sdk.areas.Travincal && targetArea === sdk.areas.DuranceofHateLvl1 && me.getQuest(21, 0) !== 1)
					|| (me.area === sdk.areas.ArreatSummit && targetArea === sdk.areas.WorldstoneLvl1 && me.getQuest(39, 0) !== 1)) {
					throw new Error("useUnit: Incomplete quest." + (!!targetArea ? " TargetArea: " + Pather.getAreaName(targetArea) : ""));
				}

				me.area === sdk.areas.A3SewersLvl1 ? this.openUnit(2, 367) : this.openUnit(2, id);
			}

			if (type === 2 && id === 342 && me.area === sdk.areas.DuranceofHateLvl3 && targetArea === sdk.areas.PandemoniumFortress && me.getQuest(22, 0) !== 1) {
				throw new Error("useUnit: Incomplete quest." + (!!targetArea ? " TargetArea: " + Pather.getAreaName(targetArea) : ""));
			}

			delay(300);
			type === 5 ? Misc.click(0, 0, unit) : usetk && unit.distance > 5 ? Skill.cast(sdk.skills.Telekinesis, 0, unit) : sendPacket(1, 0x13, 4, unit.type, 4, unit.gid);
			delay(300);

			let tick = getTickCount();

			while (getTickCount() - tick < 3000) {
				if ((!targetArea && me.area !== preArea) || me.area === targetArea) {
					delay(200);
					//Packet.flash(me.gid);

					return true;
				}

				delay(10);
			}

			i > 2 && Packet.flash(me.gid);
			let coord = CollMap.getRandCoordinate(me.x, -1, 1, me.y, -1, 1, 3);
			!!coord && this.moveTo(coord.x, coord.y);
		}

		return targetArea ? me.area === targetArea : me.area !== preArea;
	},

	/*
		Pather.useUnitEx(givenSettings = {});
		optional - use either or
		    givenSettings.unit - defined unit thats been found
		or
		    givenSettings.type - type of the unit to use
		    givenSettings.id - id of the unit to use
		targetArea - area id of where the unit leads to
	*/
	useUnitEx: function (givenSettings = {}, targetArea = undefined) {
		let settings = Object.assign({}, {
			unit: undefined,
			type: undefined,
			id: undefined,
		}, givenSettings);
		let unit = settings.unit ? settings.unit : (settings.type || settings.id) ? Misc.poll(() => getUnit(settings.type, settings.id), 2000, 200) : null;

		if (!unit) {
			throw new Error(
				"useUnit: Unit not found. TYPE: " + (settings.type ? settings.type : "")
				+ " ID: " + (settings.id ? settings.id : "")
				+ " MyArea: " + this.getAreaName(me.area) + (!!targetArea ? " TargetArea: " + Pather.getAreaName(targetArea) : "")
			);
		}

		let	preArea = me.area;
		let targetAreaCheck = (unit.objtype || 0);
		targetArea === undefined && targetAreaCheck > 0 && (targetArea = targetAreaCheck);
		let type = unit.type;
		let id = unit.classid;

		for (let i = 0; i < 5; i += 1) {
			let usetk = (i < 2 && Skill.useTK(unit));
			
			if (unit.distance > 5) {
				usetk ? this.moveNearUnit(unit, 20) : this.moveToUnit(unit);
				// try to activate it once
				usetk && i === 0 && unit.mode === 0 && unit.distance < 21 && Skill.cast(sdk.skills.Telekinesis, 0, unit);
			}

			if (type === 2 && unit.mode === 0) {
				if ((me.area === sdk.areas.Travincal && targetArea === sdk.areas.DuranceofHateLvl1 && me.getQuest(21, 0) !== 1)
					|| (me.area === sdk.areas.ArreatSummit && targetArea === sdk.areas.WorldstoneLvl1 && me.getQuest(39, 0) !== 1)) {
					throw new Error("useUnit: Incomplete quest." + (!!targetArea ? " TargetArea: " + Pather.getAreaName(targetArea) : ""));
				}

				me.area === sdk.areas.A3SewersLvl1 ? this.openUnit(2, 367) : this.openUnit(2, id);
			}

			if (type === 2 && id === 342 && me.area === sdk.areas.DuranceofHateLvl3 && targetArea === sdk.areas.PandemoniumFortress && me.getQuest(22, 0) !== 1) {
				throw new Error("useUnit: Incomplete quest." + (!!targetArea ? " TargetArea: " + Pather.getAreaName(targetArea) : ""));
			}

			delay(300);
			type === 5 ? Misc.click(0, 0, unit) : usetk && unit.distance > 5 ? Skill.cast(sdk.skills.Telekinesis, 0, unit) : sendPacket(1, 0x13, 4, unit.type, 4, unit.gid);
			delay(300);

			let tick = getTickCount();

			while (getTickCount() - tick < 3000) {
				if ((!targetArea && me.area !== preArea) || me.area === targetArea) {
					delay(200);
					//Packet.flash(me.gid);

					return true;
				}

				delay(10);
			}

			i > 2 && Packet.flash(me.gid);
			let coord = CollMap.getRandCoordinate(me.x, -1, 1, me.y, -1, 1, 3);
			!!coord && this.moveTo(coord.x, coord.y);
		}

		return targetArea ? me.area === targetArea : me.area !== preArea;
	},

	/*
		Pather.broadcastIntent(targetArea);
		targetArea - area id
	*/
	broadcastIntent: function broadcastIntent(targetArea) {
		if (Config.MFLeader) {
			let targetAct = sdk.areas.actOf(targetArea);
			me.act !== targetAct && say("goto A" + targetAct);
		}
	},

	/*
		Pather.moveTo(targetArea, check);
		targetArea - id of the area to enter
		check - force the waypoint menu
	*/
	useWaypoint: function useWaypoint(targetArea, check = false) {
		switch (targetArea) {
		case undefined:
			throw new Error("useWaypoint: Invalid targetArea parameter: " + targetArea);
		case null:
		case "random":
			check = true;

			break;
		default:
			if (typeof targetArea !== "number") throw new Error("useWaypoint: Invalid targetArea parameter");
			if (this.wpAreas.indexOf(targetArea) < 0) throw new Error("useWaypoint: Invalid area");

			break;
		}

		this.broadcastIntent(targetArea);
		console.log("ÿc7Start ÿc8(useWaypoint) ÿc0:: ÿc7targetArea: ÿc0" + this.getAreaName(targetArea) + " ÿc7myArea: ÿc0" + this.getAreaName(me.area));
		let wpTick = getTickCount();

		for (let i = 0; i < 12; i += 1) {
			if (me.area === targetArea || me.dead) {
				break;
			}

			if (me.inTown) {
				let npc = getUnit(1, NPC.Warriv);

				if (me.area === sdk.areas.LutGholein && !!npc && npc.distance < 50) {
					if (npc && npc.openMenu()) {
						Misc.useMenu(0x0D37);

						if (!Misc.poll(() => me.gameReady && me.area === 1, 2000, 100)) {
							throw new Error("Failed to go to act 1 using Warriv");
						}
					}
				}

				!getUIFlag(sdk.uiflags.Waypoint) && Town.move("waypoint");
			}

			let wp = getUnit(2, "waypoint");

			if (!!wp && wp.area === me.area) {
				let useTK = (Skill.useTK(wp) && i < 3);

				if (useTK && !getUIFlag(sdk.uiflags.Waypoint)) {
					wp.distance > 21 && Pather.moveNearUnit(wp, 20);
					Skill.cast(sdk.skills.Telekinesis, 0, wp);
				} else if (!me.inTown && wp.distance > 7) {
					this.moveToUnit(wp);
				}

				if (check || Config.WaypointMenu || !getWaypoint(0)) {
					if (!useTK && (wp.distance > 5 || !getUIFlag(sdk.uiflags.Waypoint))) {
						this.moveToUnit(wp) && Misc.click(0, 0, wp);
					}

					// handle getUnit bug
					if (!getUIFlag(sdk.uiflags.Waypoint) && wp.name.toLowerCase() === "dummy") {
						Town.getDistance("waypoint") > 5 && Town.move("waypoint");
						Misc.click(0, 0, wp);
					}

					let tick = getTickCount();

					while (getTickCount() - tick < Math.max(Math.round((i + 1) * 1000 / (i / 5 + 1)), me.ping * 2)) {
						// Waypoint screen is open
						if (getUIFlag(sdk.uiflags.Waypoint)) {
							delay(500);

							switch (targetArea) {
							case "random":
								while (true) {
									targetArea = this.nonTownWpAreas[rand(0, this.nonTownWpAreas.length - 1)];

									// get a valid wp, avoid towns
									if (getWaypoint(this.wpAreas.indexOf(targetArea))) {
										break;
									}

									delay(5);
								}

								break;
							case null:
								me.cancel();

								return true;
							}

							if (!getWaypoint(this.wpAreas.indexOf(targetArea))) {
								me.cancel();
								console.log("Trying to get the waypoint: " + this.getAreaName(targetArea));
								me.overhead("Trying to get the waypoint");

								if (this.getWP(targetArea)) {
									return true;
								}

								throw new Error("Pather.useWaypoint: Failed to go to waypoint " + this.getAreaName(targetArea));
							}

							break;
						}

						delay(10);
					}

					if (!getUIFlag(sdk.uiflags.Waypoint)) {
						console.warn("waypoint retry " + (i + 1));
						let retry = Math.min(i + 1, 5);
						let coord = CollMap.getRandCoordinate(me.x, -5 * retry, 5 * retry, me.y, -5 * retry, 5 * retry);
						!!coord && this.moveTo(coord.x, coord.y);
						delay(200 + me.ping);
						Packet.flash(me.gid);

						continue;
					}
				}

				if (!check || getUIFlag(sdk.uiflags.Waypoint)) {
					delay(200 + me.ping);
					wp.interact(targetArea);
					let tick = getTickCount();

					while (getTickCount() - tick < Math.max(Math.round((i + 1) * 1000 / (i / 5 + 1)), me.ping * 2)) {
						if (me.area === targetArea) {
							delay(1000);
							console.log("ÿc7End ÿc8(useWaypoint) ÿc0:: ÿc7targetArea: ÿc0" + this.getAreaName(targetArea) + " ÿc7myArea: ÿc0" + this.getAreaName(me.area) + "ÿc0 - ÿc7Duration: ÿc0" + (formatTime(getTickCount() - wpTick)));

							return true;
						}

						delay(20);
					}

					// In case lag causes the wp menu to stay open
					Misc.poll(() => me.gameReady, 2000, 100) && getUIFlag(sdk.uiflags.Waypoint) && me.cancelUIFlags();
				}

				Packet.flash(me.gid);
				// Activate check if we fail direct interact twice
				i > 1 && (check = true);
			} else {
				Packet.flash(me.gid);
			}

			// We can't seem to get the wp maybe attempt portal to town instead and try to use that wp
			i >= 10 && !me.inTown && Town.goToTown();
			delay(200);
		}

		if (me.area === targetArea) {
			// delay to allow act to init - helps with crashes
			delay(500);
			console.log("ÿc7End ÿc8(useWaypoint) ÿc0:: ÿc7targetArea: ÿc0" + this.getAreaName(targetArea) + " ÿc7myArea: ÿc0" + this.getAreaName(me.area) + "ÿc0 - ÿc7Duration: ÿc0" + (formatTime(getTickCount() - wpTick)));

			return true;
		}

		throw new Error("useWaypoint: Failed to use waypoint");
	},

	/*
		Pather.makePortal(use);
		use - use the portal that was made
	*/
	makePortal: function (use = false) {
		if (me.inTown) return true;

		let oldGid;

		for (let i = 0; i < 5; i += 1) {
			if (me.dead) {
				break;
			}

			let tpTool = Town.getTpTool();
			if (!tpTool) return false;

			let oldPortal = getUnits(sdk.unittype.Object, "portal")
				.filter((p) => p.getParent() === me.name)
				.first();

			!!oldPortal && (oldGid = oldPortal.gid);
			tpTool.interact();
			let tick = getTickCount();

			while (getTickCount() - tick < Math.max(500 + i * 100, me.ping * 2 + 100)) {
				let portal = getUnits(sdk.unittype.Object, "portal")
					.filter((p) => p.getParent() === me.name && p.gid !== oldGid)
					.first();

				if (portal) {
					if (use) {
						if (this.usePortal(null, null, copyUnit(portal))) {
							return true;
						}
						break; // don't spam usePortal
					} else {
						return copyUnit(portal);
					}
				}

				delay(10);
			}

			Packet.flash(me.gid);
			delay(200 + me.ping);
		}

		return false;
	},

	/*
		Pather.usePortal(targetArea, owner, unit);
		targetArea - id of the area the portal leads to
		owner - name of the portal's owner
		unit - use existing portal unit
	*/
	usePortal: function (targetArea, owner, unit) {
		// while (!me.gameReady) {
		// 	delay(30);
		// }

		if (targetArea && me.area === targetArea) return true;

		me.cancelUIFlags();

		let preArea = me.area;

		for (let i = 0; i < 10; i += 1) {
			if (me.dead) {
				break;
			}

			if (i > 0 && owner && me.inTown) {
				Town.move("portalspot");
			}

			let portal = unit ? copyUnit(unit) : this.getPortal(targetArea, owner);

			if (portal) {
				let redPortal = portal.classid === 60;

				if (portal.area === me.area) {
					if (Skill.useTK(portal) && i < 3) {
						portal.distance > 21 && (me.inTown && me.act === 5 ? Town.move("portalspot") : Pather.moveNearUnit(portal, 20));
						Skill.cast(sdk.skills.Telekinesis, 0, portal);
					} else {
						portal.distance > 5 && this.moveToUnit(portal);

						if (getTickCount() - this.lastPortalTick > 2500) {
							i < 2 ? sendPacket(1, 0x13, 4, 0x2, 4, portal.gid) : Misc.click(0, 0, portal);
							!!redPortal && delay(150);
						} else {
							delay(300 + me.ping);
							
							continue;
						}
					}
				}

				// Portal to/from Arcane
				if (portal.classid === 298 && portal.mode !== 2) {
					Misc.click(0, 0, portal);
					let tick = getTickCount();

					while (getTickCount() - tick < 2000) {
						if (portal.mode === 2 || me.area === sdk.areas.ArcaneSanctuary) {
							break;
						}

						delay(10);
					}
				}

				let tick = getTickCount();

				while (getTickCount() - tick < 500 + me.ping) {
					if (me.area !== preArea) {
						this.lastPortalTick = getTickCount();
						delay(100);

						return true;
					}

					delay(10);
				}

				if (i > 1) {
					Packet.flash(me.gid);
				}
			} else {
				Packet.flash(me.gid);
			}

			delay(200 + me.ping);
		}

		return (targetArea ? me.area === targetArea : me.area !== preArea);
	},

	/*
		Pather.getPortal(targetArea, owner, unit);
		targetArea - id of the area the portal leads to
		owner - name of the portal's owner
	*/
	getPortal: function (targetArea, owner) {
		let portal = getUnit(2, "portal");

		if (portal) {
			do {
				if (typeof targetArea !== "number" || portal.objtype === targetArea) {
					switch (owner) {
					case undefined: // Pather.usePortal(area) - red portal
						if (!portal.getParent()) {
							return copyUnit(portal);
						}

						break;
					case null: // Pather.usePortal(area, null) - any blue portal leading to area
						if (portal.getParent() === me.name || Misc.inMyParty(portal.getParent())) {
							return copyUnit(portal);
						}

						break;
					default: // Pather.usePortal(null, owner) - any blue portal belonging to owner OR Pather.usePortal(area, owner) - blue portal matching area and owner
						if (portal.getParent() === owner && (owner === me.name || Misc.inMyParty(owner))) {
							return copyUnit(portal);
						}

						break;
					}
				}
			} while (portal.getNext());
		}

		return false;
	},

	/*
		Pather.moveTo(x, y, range, step, coll);
		x - the starting x coord
		y - the starting y coord
		range - maximum allowed range from the starting coords
		step - distance between each checked dot on the grid
		coll - collision flag to avoid
	*/
	getNearestWalkable: function (x, y, range, step, coll, size) {
		!step && (step = 1);
		coll === undefined && (coll = 0x1);

		let distance = 1;
		let result = false;

		// Check if the original spot is valid
		if (this.checkSpot(x, y, coll, false, size)) {
			result = [x, y];
		}

		MainLoop:
		while (!result && distance < range) {
			for (let i = -distance; i <= distance; i += 1) {
				for (let j = -distance; j <= distance; j += 1) {
					// Check outer layer only (skip previously checked)
					if (Math.abs(i) >= Math.abs(distance) || Math.abs(j) >= Math.abs(distance)) {
						if (this.checkSpot(x + i, y + j, coll, false, size)) {
							result = [x + i, y + j];

							break MainLoop;
						}
					}
				}
			}

			distance += step;
		}

		CollMap.reset();

		return result;
	},

	/*
		Pather.moveTo(x, y, coll, cacheOnly);
		x - the x coord to check
		y - the y coord to check
		coll - collision flag to search for
		cacheOnly - use only cached room data
	*/
	checkSpot: function (x, y, coll, cacheOnly, size) {
		coll === undefined && (coll = 0x1);
		!size && (size = 1);

		for (let dx = -size; dx <= size; dx += 1) {
			for (let dy = -size; dy <= size; dy += 1) {
				if (Math.abs(dx) !== Math.abs(dy)) {
					let value = CollMap.getColl(x + dx, y + dy, cacheOnly);

					if (value & coll) {
						return false;
					}
				}
			}
		}

		return true;
	},

	/*
		Pather.accessToAct(act);
		act - the act number to check for access
	*/
	accessToAct: function (act) {
		switch (act) {
		// Act 1 is always accessible
		case 1:
			return true;
		// For the other acts, check the "Able to go to Act *" quests
		case 2:
			return me.getQuest(7, 0) === 1;
		case 3:
			return me.getQuest(15, 0) === 1;
		case 4:
			return me.getQuest(23, 0) === 1;
		case 5:
			return me.expansion && me.getQuest(28, 0) === 1;
		default:
			return false;
		}
	},

	/*
		Pather.getWP(area);
		area - the id of area to get the waypoint in
		clearPath - clear path
	*/
	getWP: function (area, clearPath) {
		let wpIDs = [119, 145, 156, 157, 237, 238, 288, 323, 324, 398, 402, 429, 494, 496, 511, 539];

		area !== me.area && this.journeyTo(area);

		for (let i = 0; i < wpIDs.length; i++) {
			let preset = getPresetUnit(area, 2, wpIDs[i]);

			if (preset) {
				Skill.haveTK ? this.moveNearUnit(preset, 20, {clearSettings: {clearPath: clearPath}}) : this.moveToUnit(preset, 0, 0, clearPath);

				let wp = getUnit(2, "waypoint");

				if (wp) {
					for (let j = 0; j < 10; j++) {
						if (!getUIFlag(sdk.uiflags.Waypoint)) {
							if (wp.distance > 5 && Skill.useTK(wp) && j < 3) {
								wp.distance > 21 && Attack.getIntoPosition(wp, 20, 0x4);
								Skill.cast(sdk.skills.Telekinesis, 0, wp);
							} else if (wp.distance > 5 || !getUIFlag(sdk.uiflags.Waypoint)) {
								this.moveToUnit(wp) && Misc.click(0, 0, wp);
							}
						}

						if (Misc.poll(() => me.gameReady && getUIFlag(sdk.uiflags.Waypoint), 1000, 150)) {
							delay(500);
							me.cancelUIFlags();

							return true;
						}

						// handle getUnit bug
						if (!getUIFlag(sdk.uiflags.Waypoint) && me.inTown && wp.name.toLowerCase() === "dummy") {
							Town.getDistance("waypoint") > 5 && Town.move("waypoint");
							Misc.click(0, 0, wp);
						}

						delay(500);
					}
				}
			}
		}

		return false;
	},

	/*
		Pather.journeyTo(area);
		area - the id of area to move to
	*/
	journeyTo: function (area) {
		if (area === undefined) return false;

		let unit, target, retry = 0;

		if (area !== sdk.areas.DurielsLair) {
			target = this.plotCourse(area, me.area);
		} else {
			target = {course: [sdk.areas.CanyonofMagic, sdk.areas.DurielsLair], useWP: false};
			this.wpAreas.indexOf(me.area) === -1 && (target.useWP = true);
		}

		console.log(target.course);
		area === sdk.areas.PandemoniumFortress && me.area === sdk.areas.DuranceofHateLvl3 && (target.useWP = false);
		target.useWP && Town.goToTown();

		// handle variable flayer jungle entrances
		if (target.course.includes(sdk.areas.FlayerJungle)) {
			Town.goToTown(3); // without initiated act, getArea().exits will crash
			let special = getArea(sdk.areas.FlayerJungle);

			if (special) {
				special = special.exits;

				for (let i = 0; i < special.length; i += 1) {
					if (special[i].target === sdk.areas.GreatMarsh) {
						// add great marsh if needed
						target.course.splice(target.course.indexOf(sdk.areas.FlayerJungle), 0, sdk.areas.GreatMarsh);

						break;
					}
				}
			}
		}

		while (target.course.length) {
			if (me.area === target.course[0] && target.course.shift()) {
				continue;
			}

			let currArea = me.area;

			console.log("ÿc7(journeyTo) :: ÿc0Moving from: " + Pather.getAreaName(currArea) + " to " + Pather.getAreaName(target.course[0]));

			if (!me.inTown) {
				Precast.doPrecast(false);
				
				if (this.wpAreas.includes(currArea) && !getWaypoint(this.wpAreas.indexOf(currArea))) {
					this.getWP(currArea);
				}
			}

			if (me.inTown && this.nextAreas[currArea] !== target.course[0] && this.wpAreas.includes(target.course[0]) && getWaypoint(this.wpAreas.indexOf(target.course[0]))) {
				this.useWaypoint(target.course[0], !this.plotCourse_openedWpMenu);
				Precast.doPrecast(false);
			} else if (currArea === sdk.areas.StonyField && target.course[0] === sdk.areas.Tristram) {
				// Stony Field -> Tristram
				this.moveToPreset(currArea, 1, 737, 0, 0, false, true);
				Misc.poll(() => this.usePortal(sdk.areas.Tristram), 5000, 1000);
			} else if (currArea === sdk.areas.LutGholein && target.course[0] === sdk.areas.A2SewersLvl1) {
				// Lut Gholein -> Sewers Level 1 (use Trapdoor)
				this.moveToPreset(currArea, 5, 19);
				this.useUnit(2, 74, sdk.areas.A2SewersLvl1);
			} else if (currArea === sdk.areas.A2SewersLvl2 && target.course[0] === sdk.areas.A2SewersLvl1) {
				// Sewers Level 2 -> Sewers Level 1
				Pather.moveToExit(target.course[0], false);
				this.useUnit(5, 22, 47);
			} else if (currArea === sdk.areas.PalaceCellarLvl3 && target.course[0] === sdk.areas.ArcaneSanctuary) {
				// Palace -> Arcane
				this.moveTo(10073, 8670);
				this.usePortal(null);
			} else if (currArea === sdk.areas.ArcaneSanctuary && target.course[0] === sdk.areas.PalaceCellarLvl3) {
				// Arcane Sanctuary -> Palace Cellar 3
				Skill.haveTK ? this.moveNearPreset(currArea, 2, 298, 20) : this.moveToPreset(currArea, 2, 298);
				unit = Misc.poll(() => getUnit(2, 298));
				unit && Pather.useUnit(2, 298, 54);
			} else if (currArea === sdk.areas.ArcaneSanctuary && target.course[0] === sdk.areas.CanyonofMagic) {
				// Arcane Sanctuary -> Canyon of the Magic
				this.moveToPreset(currArea, 2, 357);
				unit = getUnit(2, 60);

				if (!unit || !this.usePortal(null, null, unit)) {
					for (let i = 0; i < 5; i++) {
						unit = getUnit(2, 357);

						Misc.click(0, 0, unit);
						delay(1000);
						me.cancel();

						if (this.usePortal(46)) {
							break;
						}
					}
				}
			} else if (currArea === sdk.areas.CanyonofMagic && target.course[0] === sdk.areas.DurielsLair) {
				// Canyon -> Duriels Lair
				this.moveToExit(getRoom().correcttomb, true);
				this.moveToPreset(me.area, 2, 152);
				unit = Misc.poll(() => getUnit(2, 100));
				unit && Pather.useUnit(2, 100, 73);
			} else if (currArea === sdk.areas.Travincal && target.course[0] === sdk.areas.DuranceofHateLvl1) {
				// Trav -> Durance Lvl 1
				Pather.moveToPreset(me.area, 2, 386);
				this.useUnit(2, 386, sdk.areas.DuranceofHateLvl1);
			} else if (currArea === sdk.areas.DuranceofHateLvl3 && target.course[0] === sdk.areas.PandemoniumFortress) {
				// Durance Lvl 3 -> Pandemonium Fortress
				if (me.getQuest(22, 0) !== 1) {
					console.log(sdk.colors.Red + "(journeyTo) :: Incomplete Quest");
					return false;
				}

				Pather.moveTo(17581, 8070);
				delay(250 + me.ping * 2);
				this.useUnit(2, 342, sdk.areas.PandemoniumFortress);
			} else if (currArea === sdk.areas.Harrogath && target.course[0] === sdk.areas.BloodyFoothills) {
				// Harrogath -> Bloody Foothills
				this.moveTo(5026, 5095);
				this.openUnit(2, 449);
				this.moveToExit(target.course[0], true);
			} else if (currArea === sdk.areas.Harrogath && target.course[0] === sdk.areas.NihlathaksTemple) {
				// Harrogath -> Nihlathak's Temple
				Town.move(NPC.Anya);
				this.usePortal(sdk.areas.NihlathaksTemple);
			} else if (currArea === sdk.areas.FrigidHighlands && target.course[0] === sdk.areas.Abaddon) {
				// Abaddon
				this.moveToPreset(sdk.areas.FrigidHighlands, 2, 60);
				this.usePortal(sdk.areas.Abaddon);
			} else if (currArea === sdk.areas.ArreatPlateau && target.course[0] === sdk.areas.PitofAcheron) {
				// Pits of Archeon
				this.moveToPreset(sdk.areas.ArreatPlateau, 2, 60);
				this.usePortal(sdk.areas.PitofAcheron);
			} else if (currArea === sdk.areas.FrozenTundra && target.course[0] === sdk.areas.InfernalPit) {
				// Infernal Pit
				this.moveToPreset(sdk.areas.FrozenTundra, 2, 60);
				this.usePortal(sdk.areas.InfernalPit);
			} else if (target.course[0] === sdk.areas.MooMooFarm) {
				// Moo Moo farm
				currArea !== 1 && Town.goToTown(1);
				Town.move("stash") && (unit = this.getPortal(target.course[0]));
				unit && this.usePortal(null, null, unit);
			} else if ([sdk.areas.MatronsDen, sdk.areas.ForgottenSands, sdk.areas.FurnaceofPain, sdk.areas.UberTristram].includes(target.course[0])) {
				// Uber Portals
				currArea !== sdk.areas.Harrogath && Town.goToTown(5);
				Town.move("stash") && (unit = this.getPortal(target.course[0]));
				unit && this.usePortal(null, null, unit);
			} else {
				this.moveToExit(target.course[0], true);
			}

			// give time for act to load, increases stabilty of changing acts
			delay(500);

			if (me.area === target.course[0]) {
				target.course.shift();
				retry = 0;
			} else {
				if (retry > 3) {
					console.log(sdk.colors.Red + "Failed to journeyTo " + Pather.getAreaName(area) + " currentarea: " + Pather.getAreaName(me.area));
					return false;
				}
				retry++;
			}
		}

		return me.area === area;
	},

	plotCourse_openedWpMenu: false,

	/*
		Pather.plotCourse(dest, src);
		dest - destination area id
		src - starting area id
	*/
	plotCourse: function (dest, src) {
		let node, prevArea;
		let useWP = false;
		let arr = [];
		let previousAreas = [
			0, 0, 1, 2, 3, 10, 5, 6, 2, 3, 4, 6, 7, 9, 10, 11, 12, 3, 17, 17, 6, 20, 21, 22, 23, 24, 7, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 4, 1,
			1, 40, 41, 42, 43, 44, 74, 40, 47, 48, 40, 50, 51, 52, 53, 41, 42, 56, 45, 55, 57, 58, 43, 62, 63, 44, 46, 46, 46, 46, 46, 46, 46, 1, 54, 1,
			75, 76, 76, 78, 79, 80, 81, 82, 76, 76, 78, 86, 78, 88, 87, 89, 80, 92, 80, 80, 81, 81, 82, 82, 83, 100, 101, 1, 103, 104, 105, 106, 107, 1,
			109, 110, 111, 112, 113, 113, 115, 115, 117, 118, 118, 109, 121, 122, 123, 111, 112, 117, 120, 128, 129, 130, 131, 109, 109, 109, 109
		];
		let visitedNodes = [];
		let toVisitNodes = [{from: dest, to: null}];

		!src && (src = me.area);

		if (!this.plotCourse_openedWpMenu && me.inTown && this.nextAreas[me.area] !== dest && Pather.useWaypoint(null)) {
			this.plotCourse_openedWpMenu = true;
		}

		while (toVisitNodes.length > 0) {
			node = toVisitNodes[0];

			// If we've already visited it, just move on
			if (visitedNodes[node.from] === undefined) {
				visitedNodes[node.from] = node.to;

				if (this.areasConnected(node.from, node.to)) {
					// If we have this wp we can start from there
					if ((me.inTown || // check wp in town
							((src !== previousAreas[dest] && dest !== previousAreas[src]) && // check wp if areas aren't linked
								previousAreas[src] !== previousAreas[dest])) && // check wp if areas aren't linked with a common area
								Pather.wpAreas.indexOf(node.from) > 0 && getWaypoint(Pather.wpAreas.indexOf(node.from))
					) {
						if (node.from !== src) {
							useWP = true;
						}

						src = node.from;
					}

					// We found it, time to go
					if (node.from === src) {
						break;
					}

					if ((prevArea = previousAreas[node.from]) !== 0 && visitedNodes.indexOf(prevArea) === -1) {
						toVisitNodes.push({from: prevArea, to: node.from});
					}

					for (prevArea = 1; prevArea < previousAreas.length; prevArea += 1) {
						// Only interested in those connected to node
						if (previousAreas[prevArea] === node.from && visitedNodes.indexOf(prevArea) === -1) {
							toVisitNodes.push({from: prevArea, to: node.from});
						}
					}
				}

				toVisitNodes.shift();
			} else {
				useWP = true;
			}
		}

		arr.push(src);

		node = src;

		while (node !== dest && node !== undefined) {
			arr.push(node = visitedNodes[node]);
		}

		// Something failed
		if (node === undefined) {
			return false;
		}

		return {course: arr, useWP: useWP};
	},

	/*
		Pather.areasConnected(src, dest);
		dest - destination area id
		src - starting area id
	*/
	areasConnected: function (src, dest) {
		if (src === sdk.areas.CanyonofMagic && dest === sdk.areas.ArcaneSanctuary) {
			return false;
		}

		return true;
	},

	areaNames: [
		"None",
		"Rogue Encampment",
		"Blood Moor",
		"Cold Plains",
		"Stony Field",
		"Dark Wood",
		"Black Marsh",
		"Tamoe Highland",
		"Den Of Evil",
		"Cave Level 1",
		"Underground Passage Level 1",
		"Hole Level 1",
		"Pit Level 1",
		"Cave Level 2",
		"Underground Passage Level 2",
		"Hole Level 2",
		"Pit Level 2",
		"Burial Grounds",
		"Crypt",
		"Mausoleum",
		"Forgotten Tower",
		"Tower Cellar Level 1",
		"Tower Cellar Level 2",
		"Tower Cellar Level 3",
		"Tower Cellar Level 4",
		"Tower Cellar Level 5",
		"Monastery Gate",
		"Outer Cloister",
		"Barracks",
		"Jail Level 1",
		"Jail Level 2",
		"Jail Level 3",
		"Inner Cloister",
		"Cathedral",
		"Catacombs Level 1",
		"Catacombs Level 2",
		"Catacombs Level 3",
		"Catacombs Level 4",
		"Tristram",
		"Moo Moo Farm",
		"Lut Gholein",
		"Rocky Waste",
		"Dry Hills",
		"Far Oasis",
		"Lost City",
		"Valley Of Snakes",
		"Canyon Of The Magi",
		"Sewers Level 1",
		"Sewers Level 2",
		"Sewers Level 3",
		"Harem Level 1",
		"Harem Level 2",
		"Palace Cellar Level 1",
		"Palace Cellar Level 2",
		"Palace Cellar Level 3",
		"Stony Tomb Level 1",
		"Halls Of The Dead Level 1",
		"Halls Of The Dead Level 2",
		"Claw Viper Temple Level 1",
		"Stony Tomb Level 2",
		"Halls Of The Dead Level 3",
		"Claw Viper Temple Level 2",
		"Maggot Lair Level 1",
		"Maggot Lair Level 2",
		"Maggot Lair Level 3",
		"Ancient Tunnels",
		"Tal Rashas Tomb #1",
		"Tal Rashas Tomb #2",
		"Tal Rashas Tomb #3",
		"Tal Rashas Tomb #4",
		"Tal Rashas Tomb #5",
		"Tal Rashas Tomb #6",
		"Tal Rashas Tomb #7",
		"Duriels Lair",
		"Arcane Sanctuary",
		"Kurast Docktown",
		"Spider Forest",
		"Great Marsh",
		"Flayer Jungle",
		"Lower Kurast",
		"Kurast Bazaar",
		"Upper Kurast",
		"Kurast Causeway",
		"Travincal",
		"Spider Cave",
		"Spider Cavern",
		"Swampy Pit Level 1",
		"Swampy Pit Level 2",
		"Flayer Dungeon Level 1",
		"Flayer Dungeon Level 2",
		"Swampy Pit Level 3",
		"Flayer Dungeon Level 3",
		"Sewers Level 1",
		"Sewers Level 2",
		"Ruined Temple",
		"Disused Fane",
		"Forgotten Reliquary",
		"Forgotten Temple",
		"Ruined Fane",
		"Disused Reliquary",
		"Durance Of Hate Level 1",
		"Durance Of Hate Level 2",
		"Durance Of Hate Level 3",
		"The Pandemonium Fortress",
		"Outer Steppes",
		"Plains Of Despair",
		"City Of The Damned",
		"River Of Flame",
		"Chaos Sanctuary",
		"Harrogath",
		"Bloody Foothills",
		"Frigid Highlands",
		"Arreat Plateau",
		"Crystalline Passage",
		"Frozen River",
		"Glacial Trail",
		"Drifter Cavern",
		"Frozen Tundra",
		"Ancient's Way",
		"Icy Cellar",
		"Arreat Summit",
		"Nihlathak's Temple",
		"Halls Of Anguish",
		"Halls Of Pain",
		"Halls Of Vaught",
		"Abaddon",
		"Pit Of Acheron",
		"Infernal Pit",
		"Worldstone Keep Level 1",
		"Worldstone Keep Level 2",
		"Worldstone Keep Level 3",
		"Throne Of Destruction",
		"The Worldstone Chamber",
		"Matron's Den",
		"Forgotten Sands",
		"Furnace of Pain",
		"Tristram"
	],

	/*
		Pather.getAreaName(area);
		area - id of the area to get the name for
	*/
	getAreaName: function (area) {
		if (["number", "string"].indexOf(typeof area) === -1) return "undefined";
		if (typeof area === "string") return area;
		return (this.areaNames[area] || "undefined");
	},
};
