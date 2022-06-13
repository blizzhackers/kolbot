/**
*  @filename    Attack.js
*  @author      kolton, theBGuy
*  @desc        handle player attacks
*
*/

const Attack = {
	infinity: false,
	auradin: false,
	monsterObjects: [
		sdk.monsters.BarricadeDoor1, sdk.monsters.BarricadeDoor2, sdk.monsters.BarricadeWall1, sdk.monsters.BarricadeWall2,
		sdk.monsters.BarricadeTower, sdk.monsters.PrisonDoor
	],

	// Initialize attacks
	init: function () {
		if (Config.Wereform) {
			include("common/Attacks/wereform.js");
		} else if (Config.CustomClassAttack && FileTools.exists('libs/common/Attacks/' + Config.CustomClassAttack + '.js')) {
			print('Loading custom attack file');
			include('common/Attacks/' + Config.CustomClassAttack + '.js');
		} else {
			include("common/Attacks/" + sdk.charclass.nameOf(me.classid) + ".js");
		}

		if (Config.AttackSkill[1] < 0 || Config.AttackSkill[3] < 0) {
			showConsole();
			console.log("ÿc1Bad attack config. Don't expect your bot to attack.");
		}

		this.getPrimarySlot();
		Skill.init();

		if (me.expansion) {
			Precast.checkCTA();
			this.checkInfinity();
			this.checkAuradin();
		}
	},

	// check if slot has items
	checkSlot: function (slot = me.weaponswitch) {
		let item = me.getItem(-1, 1);

		if (item) {
			do {
				if (me.weaponswitch !== slot) {
					if (item.bodylocation === 11 || item.bodylocation === 12) {
						return true;
					}
				} else {
					if (item.bodylocation === 4 || item.bodylocation === 5) {
						return true;
					}
				}
			} while (item.getNext());
		}

		return false;
	},

	getPrimarySlot: function () {
		// determine primary slot if not set
		if (Config.PrimarySlot === -1) {
			if (me.classic) {
				Config.PrimarySlot = 0;
			} else {
				// Always start on main-hand
				me.weaponswitch !== 0 && me.switchWeapons(0);
				// have cta
				if ((Precast.haveCTA > -1) || Precast.checkCTA()) {
					// have item on non-cta slot - set non-cta slot as primary
					if (this.checkSlot(Precast.haveCTA ^ 1)) {
						Config.PrimarySlot = Precast.haveCTA ^ 1;
					} else {
						// other slot is empty - set cta as primary slot
						Config.PrimarySlot = Precast.haveCTA;
					}
				} else if (!this.checkSlot(0) && this.checkSlot(1)) {
					// only slot II has items
					Config.PrimarySlot = 1;
				} else {
					// both slots have items, both are empty, or only slot I has items
					Config.PrimarySlot = 0;
				}
			}
		}

		return Config.PrimarySlot;
	},

	getCustomAttack: function (unit) {
		// Check if unit got invalidated
		if (!unit || !unit.name || !copyUnit(unit).x) return false;

		for (let i in Config.CustomAttack) {
			if (Config.CustomAttack.hasOwnProperty(i)) {
				// if it contains numbers but is a string, convert to an int
				if (i.match(/\d+/g)) {
					i = parseInt(i, 10);
				}

				switch (typeof i) {
				case "string":
					if (unit.name.toLowerCase() === i.toLowerCase()) {
						return Config.CustomAttack[i];
					}

					break;
				case "number":
					if (unit.classid === i) {
						return Config.CustomAttack[i];
					}
				}
			}
		}

		return false;
	},

	// Get items with charges
	getCharges: function () {
		if (!Skill.charges) {
			Skill.charges = [];
		}

		let i, stats,
			item = me.getItem(-1, 1);

		if (item) {
			do {
				stats = item.getStat(-2);

				if (stats.hasOwnProperty(204)) {
					if (stats[204] instanceof Array) {
						for (i = 0; i < stats[204].length; i += 1) {
							if (stats[204][i] !== undefined) {
								Skill.charges.push({
									unit: copyUnit(item),
									gid: item.gid,
									skill: stats[204][i].skill,
									level: stats[204][i].level,
									charges: stats[204][i].charges,
									maxcharges: stats[204][i].maxcharges
								});
							}
						}
					} else {
						Skill.charges.push({
							unit: copyUnit(item),
							gid: item.gid,
							skill: stats[204].skill,
							level: stats[204].level,
							charges: stats[204].charges,
							maxcharges: stats[204].maxcharges
						});
					}
				}
			} while (item.getNext());
		}

		return true;
	},

	// Check if player or his merc are using Infinity, and adjust resistance checks based on that
	checkInfinity: function () {
		if (me.classic) return false;

		let merc;
		// check if we have a merc
		Config.UseMerc && (merc = Misc.poll(() => me.getMerc(), 1000, 100));

		// Check merc infinity
		!!merc && (this.infinity = merc.checkItem({name: sdk.locale.items.Infinity}).have);

		// Check player infinity - only check if merc doesn't have
		!this.infinity && (this.infinity = me.checkItem({name: sdk.locale.items.Infinity, equipped: true}).have);

		return this.infinity;
	},

	checkAuradin: function () {
		// Check player Dragon, Dream, HoJ, or Ice
		this.auradin = me.haveSome([
			{name: sdk.locale.items.Dragon, equipped: true}, {name: sdk.locale.items.Dream, equipped: true},
			{name: sdk.locale.items.HandofJustice, equipped: true}, {name: sdk.locale.items.Ice, equipped: true},
		]);
  
		return this.auradin;
	},

	// Kill a monster based on its classId, can pass a unit as well
	kill: function (classId) {
		if (!classId || Config.AttackSkill[1] < 0) return false;
		let target = (typeof classId === "object" ? classId : Misc.poll(() => getUnit(1, classId), 2000, 100));

		if (!target) {
			console.warn("Attack.kill: Target not found");
			return Attack.clear(10);
		}

		let retry = 0,
			errorInfo = "",
			attackCount = 0,
			gid = target.gid;

		let findTarget = function (gid, loc) {
			let path = getPath(me.area, me.x, me.y, loc.x, loc.y, 1, 5);
			if (!path) return false;

			if (path.some(function (node) {
				Pather.walkTo(node.x, node.y);
				return getUnit(1, -1, -1, gid);
			})) {
				return getUnit(1, -1, -1, gid);
			} else {
				return false;
			}
		};

		let lastLoc = {x: me.x, y: me.y};
		let tick = getTickCount();
		console.log("ÿc7Kill ÿc0:: " + (!!target.name ? target.name : classId));
		Config.MFLeader && Pather.makePortal() && say("kill " + classId);

		while (attackCount < Config.MaxAttackCount && target.attackable && !this.skipCheck(target)) {
			Misc.townCheck();
			
			// Check if unit got invalidated, happens if necro raises a skeleton from the boss's corpse.
			if (!target || !copyUnit(target).x) {
				target = getUnit(1, -1, -1, gid);
				!target && (target = findTarget(gid, lastLoc));

				if (!target) {
					break;
				}
			}

			// todo - dodge boss missiles
			Config.Dodge && me.hpPercent <= Config.DodgeHP && this.deploy(target, Config.DodgeRange, 5, 9);
			Config.MFSwitchPercent && target.hpPercent < Config.MFSwitchPercent && me.switchWeapons(this.getPrimarySlot() ^ 1);

			if (attackCount > 0 && attackCount % 15 === 0 && Skill.getRange(Config.AttackSkill[1]) < 4) {
				Packet.flash(me.gid);
			}

			let result = ClassAttack.doAttack(target, attackCount % 15 === 0);

			if (result === 0) {
				if (retry++ > 3) {
					errorInfo = " (doAttack failed)";

					break;
				}

				Packet.flash(me.gid);
			} else if (result === 2) {
				errorInfo = " (No valid attack skills)";

				break;
			} else if (result === 3) {
				continue;
			} else {
				retry = 0;
			}

			lastLoc = {x: me.x, y: me.y};
			attackCount++;
		}

		attackCount === Config.MaxAttackCount && (errorInfo = " (attackCount exceeded: " + attackCount + ")");
		Config.MFSwitchPercent && me.switchWeapons(this.getPrimarySlot());
		ClassAttack.afterAttack();
		Pickit.pickItems();

		if (!!target && target.attackable) {
			console.warn("Failed to kill " + target.name + errorInfo);
		} else {
			console.log("ÿc7Killed ÿc0:: " + (!!target.name ? target.name : classId) + "ÿc0 - ÿc7Duration: ÿc0" + formatTime(getTickCount() - tick));
		}

		return (!target || !copyUnit(target).x || target.dead || !target.attackable);
	},

	hurt: function (classId, percent) {
		if (!classId || !percent) return false;
		let target = (typeof classId === "object" ? classid : Misc.poll(() => getUnit(1, classId), 2000, 100));

		if (!target) {
			console.warn("Attack.hurt: Target not found");
			return false;
		}

		let retry = 0, attackCount = 0;

		while (attackCount < Config.MaxAttackCount && target.attackable && !Attack.skipCheck(target)) {
			let result = ClassAttack.doAttack(target, attackCount % 15 === 0);

			if (result === 0) {
				if (retry++ > 3) {
					break;
				}

				Packet.flash(me.gid);
			} else if (result === 2) {
				break;
			} else if (result === 3) {
				continue;
			} else {
				retry = 0;
			}

			if (!copyUnit(target).x) {
				return true;
			}

			attackCount += 1;

			if (target.hpPercent <= percent) {
				break;
			}
		}

		return true;
	},

	getScarinessLevel: function (unit) {
		let scariness = 0, ids = [58, 59, 60, 61, 62, 101, 102, 103, 104, 105, 278, 279, 280, 281, 282, 298, 299, 300, 645, 646, 647, 662, 663, 664, 667, 668, 669, 670, 675, 676];

		// Only handling monsters for now
		if (unit.type !== 1) return undefined;

		// Minion
		(unit.spectype & 0x08) && (scariness += 1);

		// Champion
		(unit.spectype & 0x02) && (scariness += 2);

		// Boss
		(unit.spectype & 0x04) && (scariness += 4);

		// Summoner or the like
		ids.includes(unit.classid) && (scariness += 8);

		return scariness;
	},

	// Clear monsters in a section based on range and spectype or clear monsters around a boss monster
	// probably going to change to passing an object
	clear: function (range, spectype, bossId, sortfunc, pickit) {
		while (!me.gameReady) {
			delay(40);
		}

		if (Config.AttackSkill[1] < 0 || Config.AttackSkill[3] < 0) return false;

		range === undefined && (range = 25);
		spectype === undefined && (spectype = 0);
		bossId === undefined && (bossId = false);
		sortfunc === undefined && (sortfunc = false);
		pickit === undefined && (pickit = true);
		!sortfunc && (sortfunc = this.sortMonsters);

		if (typeof (range) !== "number") throw new Error("Attack.clear: range must be a number.");

		let i, boss, orgx, orgy, start, skillCheck,
			retry = 0,
			gidAttack = [],
			attackCount = 0;

		if (bossId) {
			boss = Misc.poll(function () {
				switch (true) {
				case typeof bossId === "object":
					return bossId;
				case ((typeof bossId === "number" && bossId > 999)):
					return getUnit(1, -1, -1, bossId);
				default:
					return getUnit(1, bossId);
				}
			}, 2000, 100);

			if (!boss) {
				console.warn("Attack.clear: " + bossId + " not found");
				return Attack.clear(10);
			}

			({orgx, orgy} = {orgx: boss.x, orgy: boss.y});
			Config.MFLeader && !!bossId && Pather.makePortal() && say("clear " + bossId);
		} else {
			({orgx, orgy} = {orgx: me.x, orgy: me.y});
		}

		let monsterList = [];
		let target = getUnit(1);

		if (target) {
			do {
				if ((!spectype || (target.spectype & spectype)) && target.attackable && !this.skipCheck(target)) {
					// Speed optimization - don't go through monster list until there's at least one within clear range
					if (!start && getDistance(target, orgx, orgy) <= range &&
							(Pather.canTeleport() || !checkCollision(me, target, 0x5))) {
						start = true;
					}

					monsterList.push(copyUnit(target));
				}
			} while (target.getNext());
		}

		while (start && monsterList.length > 0 && attackCount < Config.MaxAttackCount) {
			if (me.dead) return false;
			
			boss && (({orgx, orgy} = {orgx: boss.x, orgy: boss.y}));
			monsterList.sort(sortfunc);
			target = copyUnit(monsterList[0]);

			if (target.x !== undefined && (getDistance(target, orgx, orgy) <= range || (this.getScarinessLevel(target) > 7 && target.distance <= range)) && target.attackable) {
				Config.Dodge && me.hpPercent <= Config.DodgeHP && this.deploy(target, Config.DodgeRange, 5, 9);
				Misc.townCheck(true);
				//me.overhead("attacking " + target.name + " spectype " + target.spectype + " id " + target.classid);

				let result = ClassAttack.doAttack(target, attackCount % 15 === 0);

				if (result) {
					retry = 0;

					if (result === 2) {
						monsterList.shift();

						continue;
					} else if (result === 3) {
						continue;
					}

					for (i = 0; i < gidAttack.length; i += 1) {
						if (gidAttack[i].gid === target.gid) {
							break;
						}
					}

					if (i === gidAttack.length) {
						gidAttack.push({gid: target.gid, attacks: 0, name: target.name});
					}

					gidAttack[i].attacks += 1;
					attackCount += 1;
					let secAttack = me.barbarian ? ((target.spectype & 0x7) ? 2 : 4) : 5;

					if (Config.AttackSkill[secAttack] > -1 && (!Attack.checkResist(target, Config.AttackSkill[(target.spectype & 0x7) ? 1 : 3]) ||
							(me.classid === 3 && Config.AttackSkill[(target.spectype & 0x7) ? 1 : 3] === 112 && !ClassAttack.getHammerPosition(target)))) {
						skillCheck = Config.AttackSkill[secAttack];
					} else {
						skillCheck = Config.AttackSkill[(target.spectype & 0x7) ? 1 : 3];
					}

					// Desync/bad position handler
					switch (skillCheck) {
					case 112:
						// Tele in random direction with Blessed Hammer
						if (gidAttack[i].attacks > 0 && gidAttack[i].attacks % ((target.spectype & 0x7) ? 4 : 2) === 0) {
							let coord = CollMap.getRandCoordinate(me.x, -1, 1, me.y, -1, 1, 5);
							Pather.moveTo(coord.x, coord.y);
						}

						break;
					default:
						// Flash with melee skills
						if (gidAttack[i].attacks > 0 && gidAttack[i].attacks % ((target.spectype & 0x7) ? 15 : 5) === 0 && Skill.getRange(skillCheck) < 4) {
							Packet.flash(me.gid);
						}

						break;
					}

					// Skip non-unique monsters after 15 attacks, except in Throne of Destruction
					if (me.area !== 131 && !(target.spectype & 0x7) && gidAttack[i].attacks > 15) {
						print("ÿc1Skipping " + target.name + " " + target.gid + " " + gidAttack[i].attacks);
						monsterList.shift();
					}

					if (target.mode === 0 || target.mode === 12 || Config.FastPick === 2) {
						Pickit.fastPick();
					}
				} else {
					if (retry++ > 3) {
						monsterList.shift();
						retry = 0;
					}

					Packet.flash(me.gid);
				}
			} else {
				monsterList.shift();
			}
		}

		if (attackCount > 0) {
			ClassAttack.afterAttack(pickit);
			this.openChests(range, orgx, orgy);
			pickit && Pickit.pickItems();
		} else {
			Precast.doPrecast(false); // we didn't attack anything but check if we need to precast. TODO: better method of keeping track of precast skills
		}

		return true;
	},

	clearClassids: function (...ids) {
		let monster = getUnit(1);

		if (monster) {
			let list = [];

			do {
				if (ids.includes(monster.classid) && monster.attackable) {
					list.push(copyUnit(monster));
				}
			} while (monster.getNext());

			Attack.clearList(list);
		}

		return true;
	},

	// Filter monsters based on classId, spectype and range
	getMob: function (classid, spectype, range, center) {
		let monsterList = [],
			monster = getUnit(1);

		range === undefined && (range = 25);
		!center && (center = me);

		switch (typeof classid) {
		case "number":
		case "string":
			monster = getUnit(1, classid);

			if (monster) {
				do {
					if (getDistance(center.x, center.y, monster.x, monster.y) <= range
							&& (!spectype || (monster.spectype & spectype)) && monster.attackable) {
						monsterList.push(copyUnit(monster));
					}
				} while (monster.getNext());
			}

			break;
		case "object":
			monster = getUnit(1);

			if (monster) {
				do {
					if (classid.includes(monster.classid) && getDistance(center.x, center.y, monster.x, monster.y) <= range
							&& (!spectype || (monster.spectype & spectype)) && monster.attackable) {
						monsterList.push(copyUnit(monster));
					}
				} while (monster.getNext());
			}

			break;
		}

		return monsterList;
	},

	// Clear an already formed array of monstas
	clearList: function (mainArg, sortFunc, refresh) {
		let i, target, monsterList,
			retry = 0,
			gidAttack = [],
			attackCount = 0;

		switch (typeof mainArg) {
		case "function":
			monsterList = mainArg.call();

			break;
		case "object":
			monsterList = mainArg.slice(0);

			break;
		case "boolean": // false from Attack.getMob()
			return false;
		default:
			throw new Error("clearList: Invalid argument");
		}

		!sortFunc && (sortFunc = this.sortMonsters);

		while (monsterList.length > 0 && attackCount < Config.MaxAttackCount) {
			if (refresh && attackCount > 0 && attackCount % refresh === 0) {
				monsterList = mainArg.call();
			}

			if (me.dead) return false;

			monsterList.sort(sortFunc);
			target = copyUnit(monsterList[0]);

			if (target.x !== undefined && target.attackable) {
				Config.Dodge && me.hpPercent <= Config.DodgeHP && this.deploy(target, Config.DodgeRange, 5, 9);
				Misc.townCheck(true);
				//me.overhead("attacking " + target.name + " spectype " + target.spectype + " id " + target.classid);

				let result = ClassAttack.doAttack(target, attackCount % 15 === 0);

				if (result) {
					retry = 0;

					if (result === 2) {
						monsterList.shift();

						continue;
					} else if (result === 3) {
						continue;
					}

					for (i = 0; i < gidAttack.length; i += 1) {
						if (gidAttack[i].gid === target.gid) {
							break;
						}
					}

					if (i === gidAttack.length) {
						gidAttack.push({gid: target.gid, attacks: 0});
					}

					gidAttack[i].attacks += 1;

					// Desync/bad position handler
					switch (Config.AttackSkill[(target.spectype & 0x7) ? 1 : 3]) {
					case 112:
						// Tele in random direction with Blessed Hammer
						if (gidAttack[i].attacks > 0 && gidAttack[i].attacks % ((target.spectype & 0x7) ? 5 : 15) === 0) {
							let coord = CollMap.getRandCoordinate(me.x, -1, 1, me.y, -1, 1, 4);
							Pather.moveTo(coord.x, coord.y);
						}

						break;
					default:
						// Flash with melee skills
						if (gidAttack[i].attacks > 0 && gidAttack[i].attacks % ((target.spectype & 0x7) ? 5 : 15) === 0 && Skill.getRange(Config.AttackSkill[(target.spectype & 0x7) ? 1 : 3]) < 4) {
							Packet.flash(me.gid);
						}

						break;
					}

					// Skip non-unique monsters after 15 attacks, except in Throne of Destruction
					if (me.area !== 131 && !(target.spectype & 0x7) && gidAttack[i].attacks > 15) {
						print("ÿc1Skipping " + target.name + " " + target.gid + " " + gidAttack[i].attacks);
						monsterList.shift();
					}

					attackCount += 1;

					if (target.mode === 0 || target.mode === 12 || Config.FastPick === 2) {
						Pickit.fastPick();
					}
				} else {
					if (retry++ > 3) {
						monsterList.shift();
						retry = 0;
					}

					Packet.flash(me.gid);
				}
			} else {
				monsterList.shift();
			}
		}

		if (attackCount > 0) {
			ClassAttack.afterAttack(true);
			this.openChests(Config.OpenChests.Range);
			Pickit.pickItems();
		} else {
			Precast.doPrecast(false); // we didn't attack anything but check if we need to precast. TODO: better method of keeping track of precast skills
		}

		return true;
	},

	securePosition: function (x, y, range, timer, skipBlocked, special) {
		let tick;

		x === undefined && (x = me.x);
		y === undefined && (y = me.y);
		timer === undefined && (timer = 3000);
		skipBlocked === true && (skipBlocked = 0x4);

		while (true) {
			[x, y].distance > 5 && Pather.moveTo(x, y);

			let monster = getUnit(1);
			let monList = [];

			if (monster) {
				do {
					if (getDistance(monster, x, y) <= range && monster.attackable && this.canAttack(monster) &&
							(!skipBlocked || !checkCollision(me, monster, skipBlocked)) &&
							(Pather.canTeleport() || !checkCollision(me, monster, 0x1))) {
						monList.push(copyUnit(monster));
					}
				} while (monster.getNext());
			}

			if (!monList.length) {
				!tick && (tick = getTickCount());

				// only return if it's been safe long enough
				if (getTickCount() - tick >= timer) {
					return;
				}
			} else {
				this.clearList(monList);

				// reset the timer when there's monsters in range
				tick && (tick = false);
			}

			if (special) {
				if (me.paladin && me.getSkill(sdk.skills.Redemption, 1)) {
					Skill.setSkill(sdk.skills.Redemption, 0);
					delay(1000);
				}
			}

			delay(100);
		}
	},

	// Draw lines around a room on minimap
	markRoom: function (room, color) {
		let arr = [];

		arr.push(new Line(room.x * 5, room.y * 5, room.x * 5, room.y * 5 + room.ysize, color, true));
		arr.push(new Line(room.x * 5, room.y * 5, room.x * 5 + room.xsize, room.y * 5, color, true));
		arr.push(new Line(room.x * 5 + room.xsize, room.y * 5, room.x * 5 + room.xsize, room.y * 5 + room.ysize, color, true));
		arr.push(new Line(room.x * 5, room.y * 5 + room.ysize, room.x * 5 + room.xsize, room.y * 5 + room.ysize, color, true));
	},

	countUniques: function () {
		!this.uniques && (this.uniques = 0);
		!this.ignoredGids && (this.ignoredGids = []);

		let monster = getUnit(1);

		if (monster) {
			do {
				if ((monster.spectype & 0x5) && this.ignoredGids.indexOf(monster.gid) === -1) {
					this.uniques += 1;
					this.ignoredGids.push(monster.gid);
				}
			} while (monster.getNext());
		}
	},

	storeStatistics: function (area) {
		if (!FileTools.exists("statistics.json")) {
			Misc.fileAction("statistics.json", 1, "{}");
		}

		let obj = JSON.parse(Misc.fileAction("statistics.json", 0));

		if (obj) {
			if (obj[area] === undefined) {
				obj[area] = {
					runs: 0,
					averageUniques: 0
				};
			}

			obj[area].averageUniques = ((obj[area].averageUniques * obj[area].runs + this.uniques) / (obj[area].runs + 1)).toFixed(4);
			obj[area].runs += 1;

			Misc.fileAction("statistics.json", 1, JSON.stringify(obj));
		}

		this.uniques = 0;
		this.ignoredGids = [];
	},

	// Clear an entire area based on monster spectype
	clearLevel: function (spectype) {
		function RoomSort(a, b) {
			return getDistance(myRoom[0], myRoom[1], a[0], a[1]) - getDistance(myRoom[0], myRoom[1], b[0], b[1]);
		}

		spectype === undefined && (spectype = 0);

		let room = getRoom();
		if (!room) return false;

		let tick = getTickCount();
		console.log("ÿc7Start ÿc8(clearLevel) ÿc0:: " + Pather.getAreaName(me.area));

		let myRoom, previousArea;
		let rooms = [];
		let currentArea = getArea().id;
		let breakClearLevelCheck = !!(Loader.scriptName() === "MFHelper" && Config.MFHelper.BreakClearLevel && Config.Leader !== "");

		do {
			rooms.push([room.x * 5 + room.xsize / 2, room.y * 5 + room.ysize / 2]);
		} while (room.getNext());
		
		if (Config.MFLeader && rooms.length > 0) {
			Pather.makePortal();
			// tombs exception
			if (me.area > 65 && me.area < 73) {
				say("clearlevel " + me.area);
			} else {
				say("clearlevel " + getArea().name);
			}
		}

		while (rooms.length > 0) {
			// get the first room + initialize myRoom var
			!myRoom && (room = getRoom(me.x, me.y));

			if (breakClearLevelCheck) {
				let leader = Misc.findPlayer(Config.Leader);

				if (leader && leader.area !== me.area && !leader.inTown) {
					me.overhead("break the clearing in " + getArea().name);

					return true;
				}
			}

			if (room) {
				// use previous room to calculate distance
				if (room instanceof Array) {
					myRoom = [room[0], room[1]];
				} else {
					// create a new room to calculate distance (first room, done only once)
					myRoom = [room.x * 5 + room.xsize / 2, room.y * 5 + room.ysize / 2];
				}
			}

			rooms.sort(RoomSort);
			room = rooms.shift();

			let result = Pather.getNearestWalkable(room[0], room[1], 18, 3);

			if (result) {
				Pather.moveTo(result[0], result[1], 3, spectype);
				previousArea = result;

				if (!this.clear(40, spectype)) {
					break;
				}
			} else if (currentArea !== getArea().id) {
				// Make sure bot does not get stuck in different area.
				Pather.moveTo(previousArea[0], previousArea[1], 3, spectype);
			}
		}

		//this.storeStatistics(Pather.getAreaName(me.area));
		console.log("ÿc7End ÿc8(clearLevel) ÿc0:: ÿc7" + Pather.getAreaName(currentArea) + "ÿc0 - ÿc7Duration: ÿc0" + (formatTime(getTickCount() - tick)));

		return true;
	},

	// Sort monsters based on distance, spectype and classId (summoners are attacked first)
	// Think this needs a collison check included for non tele chars, might prevent choosing closer mob that is actually behind a wall vs the one we pass trying to get behind the wall
	sortMonsters: function (unitA, unitB) {
		// No special sorting for were-form
		if (Config.Wereform) {
			return getDistance(me, unitA) - getDistance(me, unitB);
		}

		// sort main bosses first
		// Andy
		if (me.area === sdk.areas.CatacombsLvl4) {
			if (unitA.distance < 5 && unitA.classid === sdk.monsters.Andariel && !checkCollision(me, unitA, 0x4)) return -1;
		}

		// Meph
		if (me.area === sdk.areas.DuranceofHateLvl3) {
			if (unitA.distance < 5 && unitA.classid === sdk.monsters.Mephisto && !checkCollision(me, unitA, 0x4)) return -1;
		}

		// Baal
		if (me.area === sdk.areas.WorldstoneChamber) {
			if (unitA.classid === sdk.monsters.Baal) return -1;
		}

		// Barb optimization
		if (me.barbarian) {
			if (!Attack.checkResist(unitA, Attack.getSkillElement(Config.AttackSkill[(unitA.spectype & 0x7) ? 1 : 3]))) {
				return 1;
			}

			if (!Attack.checkResist(unitB, Attack.getSkillElement(Config.AttackSkill[(unitB.spectype & 0x7) ? 1 : 3]))) {
				return -1;
			}
		}

		// Put monsters under Attract curse at the end of the list - They are helping us
		if (unitA.getState(sdk.states.Attract)) return 1;
		if (unitB.getState(sdk.states.Attract)) return -1;

		let ids = [312, 58, 59, 60, 61, 62, 101, 102, 103, 104, 105, sdk.monsters.BloodRaven, 278, 279, 280, 281, 282, 298, 299, 300, 645, 646, 647, 662, 663, 664, 667, 668, 669, 670, 675, 676];

		if (me.area !== sdk.areas.ClawViperTempleLvl2 && ids.includes(unitA.classid) && ids.includes(unitB.classid)) {
			// Kill "scary" uniques first (like Bishibosh)
			if ((unitA.spectype & 0x04) && (unitB.spectype & 0x04)) {
				return getDistance(me, unitA) - getDistance(me, unitB);
			}

			if (unitA.spectype & 0x04) return -1;
			if (unitB.spectype & 0x04) return 1;

			return getDistance(me, unitA) - getDistance(me, unitB);
		}

		if (ids.includes(unitA.classid)) return -1;
		if (ids.includes(unitB.classid)) return 1;

		if (Config.BossPriority) {
			if ((unitA.spectype & 0x5) && (unitB.spectype & 0x5)) {
				return getDistance(me, unitA) - getDistance(me, unitB);
			}

			if (unitA.spectype & 0x5) return -1;
			if (unitB.spectype & 0x5) return 1;
		}

		return getDistance(me, unitA) - getDistance(me, unitB);
	},

	// Check if a set of coords is valid/accessable
	// re-work this for more info
	// casting skills can go over non-floors - excluding bliz/meteor - not sure if any others
	// physical skills can't, need to exclude monster objects though
	// splash skills can go through some objects, however some objects are cast blockers
	// hotfix for now, bugged with flying mobs (specters, ghosts, ect) apparently underneath them doesn't register as ground? so it fails the needFloor test
	// despite there being floor there. so for now check if its an area that doesn't have floor in some spots
	// better fix would be passing unit directly in instead of x and y, but that is going to need more changes all over
	validSpot: function (x, y, skill = -1) {
		// Just in case
		if (!me.area || !x || !y) return false;
		// for now this just returns true and we leave getting into position to the actual class attack files
		if (Skill.missileSkills.includes(skill)) return true;

		let result;
		let nonFloorAreas = [sdk.areas.ArcaneSanctuary, sdk.areas.RiverofFlame, sdk.areas.ChaosSanctuary, sdk.areas.Abaddon, sdk.areas.PitofAcheron, sdk.areas.InfernalPit];

		// Treat thrown errors as invalid spot
		try {
			result = getCollision(me.area, x, y);
		} catch (e) {
			return false;
		}

		if (result === undefined) return false;

		switch (true) {
		case Skill.needFloor.includes(skill) && nonFloorAreas.includes(me.area):
			let isFloor = !!(result & (0 | 0x1000));
			// this spot is not on the floor (lava (river/chaos, space (arcane), ect))
			if (!isFloor) {
				return false;
			}

			return !(result & 0x1); // outside lava area in abaddon returns coll 1
		default:
			// Avoid non-walkable spots, objects - this preserves the orignal function and also physical attack skills will get here
			if ((result & 0x1) || (result & 0x400)) return false;

			break;
		}

		return true;
	},

	// Open chests when clearing
	openChests: function (range, x, y) {
		if (!Config.OpenChests.Enabled) return false;
		x === undefined && (x = me.x);
		y === undefined && (y = me.y);

		let list = [];
		let ids = ["chest", "chest3", "weaponrack", "armorstand"];
		let unit = getUnit(2);

		if (unit) {
			do {
				if (unit.name && getDistance(unit, x, y) <= range && ids.includes(unit.name.toLowerCase())) {
					list.push(copyUnit(unit));
				}
			} while (unit.getNext());
		}

		while (list.length) {
			list.sort(Sort.units);

			if (Misc.openChest(list.shift())) {
				Pickit.pickItems();
			}
		}

		return true;
	},

	buildMonsterList: function () {
		let monList = [];
		let monster = getUnit(1);

		if (monster) {
			do {
				if (monster.attackable) {
					monList.push(copyUnit(monster));
				}
			} while (monster.getNext());
		}

		return monList;
	},

	findSafeSpot: function (unit, distance, spread, range) {
		if (arguments.length < 4) throw new Error("deploy: Not enough arguments supplied");

		let index;
		let monList = [];
		let count = 999;

		monList = this.buildMonsterList();
		monList.sort(Sort.units);
		if (this.getMonsterCount(me.x, me.y, 15, monList) === 0) return true;

		CollMap.getNearbyRooms(unit.x, unit.y);
		let grid = this.buildGrid(unit.x - distance, unit.x + distance, unit.y - distance, unit.y + distance, spread);

		if (!grid.length) return false;
		grid.sort((a, b) => getDistance(b.x, b.y, unit.x, unit.y) - getDistance(a.x, a.y, unit.x, unit.y));

		for (let i = 0; i < grid.length; i += 1) {
			if (!(CollMap.getColl(grid[i].x, grid[i].y, true) & 0x1) && !CollMap.checkColl(unit, {x: grid[i].x, y: grid[i].y}, 0x4)) {
				let currCount = this.getMonsterCount(grid[i].x, grid[i].y, range, monList);

				if (currCount < count) {
					index = i;
					count = currCount;
				}

				if (currCount === 0) {
					break;
				}
			}
		}

		if (typeof index === "number") {
			return {
				x: grid[index].x,
				y: grid[index].y,
			};
		}

		return false;
	},

	deploy: function (unit, distance, spread, range) {
		if (arguments.length < 4) {
			throw new Error("deploy: Not enough arguments supplied");
		}

		let safeLoc = this.findSafeSpot(unit, distance, spread, range);

		return (typeof safeLoc === "object" ? Pather.moveToUnit(safeLoc, 0) : false);
	},

	getMonsterCount: function (x, y, range, list) {
		let count = 0;
		let ignored = [sdk.monsters.Diablo]; // why is diablo ignored?

		for (let i = 0; i < list.length; i += 1) {
			if (ignored.indexOf(list[i].classid) === -1 && list[i].attackable && getDistance(x, y, list[i].x, list[i].y) <= range) {
				count += 1;
			}
		}

		// missile check?
		let fire = getUnit(2, "fire");

		if (fire) {
			do {
				if (getDistance(x, y, fire.x, fire.y) <= 4) {
					count += 100;
				}
			} while (fire.getNext());
		}

		return count;
	},

	buildGrid: function (xmin, xmax, ymin, ymax, spread) {
		if (xmin >= xmax || ymin >= ymax || spread < 1) {
			throw new Error("buildGrid: Bad parameters");
		}

		let grid = [];

		for (let i = xmin; i <= xmax; i += spread) {
			for (let j = ymin; j <= ymax; j += spread) {
				let coll = CollMap.getColl(i, j, true);

				if (typeof coll === "number") {
					grid.push({x: i, y: j, coll: coll});
				}
			}
		}

		return grid;
	},

	/**
	* @param unit
	* @desc checks if we should skip a monster
	* @returns {Boolean}
	*/
	skipCheck: function (unit) {
		if (me.area === sdk.areas.ThroneofDestruction) return false;
		if (unit.isSpecial && Config.SkipException && Config.SkipException.includes(unit.name)) {
			console.log("ÿc1Skip Exception: " + unit.name);
			return false;
		}

		let tempArray = [];

		// EnchantLoop: // Skip enchanted monsters
		for (let i = 0; i < Config.SkipEnchant.length; i += 1) {
			tempArray = Config.SkipEnchant[i].toLowerCase().split(" and ");

			for (let j = 0; j < tempArray.length; j += 1) {
				switch (tempArray[j]) {
				case "extra strong":
					tempArray[j] = sdk.enchant.ExtraStrong;

					break;
				case "extra fast":
					tempArray[j] = sdk.enchant.ExtraFast;

					break;
				case "cursed":
					tempArray[j] = sdk.enchant.Cursed;

					break;
				case "magic resistant":
					tempArray[j] = sdk.enchant.MagicResistant;

					break;
				case "fire enchanted":
					tempArray[j] = sdk.enchant.FireEnchanted;

					break;
				case "lightning enchanted":
					tempArray[j] = sdk.enchant.LightningEnchanted;

					break;
				case "cold enchanted":
					tempArray[j] = sdk.enchant.ColdEnchanted;

					break;
				case "mana burn":
					tempArray[j] = sdk.enchant.ManaBurn;

					break;
				case "teleportation":
					tempArray[j] = sdk.enchant.Teleportation;

					break;
				case "spectral hit":
					tempArray[j] = sdk.enchant.SpectralHit;

					break;
				case "stone skin":
					tempArray[j] = sdk.enchant.StoneSkin;

					break;
				case "multiple shots":
					tempArray[j] = sdk.enchant.MultipleShots;

					break;
				}
			}

			if (tempArray.every(enchant => unit.getEnchant(enchant))) {
				return true;
			}
		}

		// ImmuneLoop: // Skip immune monsters
		for (let i = 0; i < Config.SkipImmune.length; i += 1) {
			tempArray = Config.SkipImmune[i].toLowerCase().split(" and ");

			// Infinity calculations are built-in
			if (tempArray.every(immnue => !Attack.checkResist(unit, immnue))) {
				return true;
			}
		}

		// AuraLoop: // Skip monsters with auras
		for (let i = 0; i < Config.SkipAura.length; i += 1) {
			let aura = Config.SkipAura[i].toLowerCase();

			switch (true) {
			case aura === "might" && unit.getState(sdk.states.Might):
			case aura === "blessed aim" && unit.getState(sdk.states.BlessedAim):
			case aura === "fanaticism" && unit.getState(sdk.states.Fanaticism):
			case aura === "conviction" && unit.getState(sdk.states.Conviction):
			case aura === "holy fire" && unit.getState(sdk.states.HolyFire):
			case aura === "holy freeze" && unit.getState(sdk.states.HolyFreeze):
			case aura === "holy shock" && unit.getState(sdk.states.HolyShock):
				return true;
			default:
				break;
			}
		}

		return false;
	},

	// Get element by skill number
	getSkillElement: function (skillId) {
		this.elements = ["physical", "fire", "lightning", "magic", "cold", "poison", "none"];

		switch (skillId) {
		case sdk.skills.HolyFire:
			return "fire";
		case sdk.skills.HolyFreeze:
			return "cold";
		case sdk.skills.HolyShock:
			return "lightning";
		case sdk.skills.CorpseExplosion:
		case sdk.skills.Stun:
		case sdk.skills.Concentrate:
		case sdk.skills.Frenzy:
		case sdk.skills.MindBlast:
		case 500: // Summoner
			return "physical";
		case sdk.skills.HolyBolt:
			// no need to use this.elements array because it returns before going over the array
			return "holybolt";
		}

		let eType = getBaseStat("skills", skillId, "etype");

		return typeof (eType) === "number" ? this.elements[eType] : false;
	},

	// Get a monster's resistance to specified element
	getResist: function (unit, type) {
		// some scripts pass empty units in throne room
		if (!unit || !unit.getStat) return 100;
		if (unit.isPlayer) return 0;

		switch (type) {
		case "physical":
			return unit.getStat(sdk.stats.DamageResist);
		case "fire":
			return unit.getStat(sdk.stats.FireResist);
		case "lightning":
			return unit.getStat(sdk.stats.LightningResist);
		case "magic":
			return unit.getStat(sdk.stats.MagicResist);
		case "cold":
			return unit.getStat(sdk.stats.ColdResist);
		case "poison":
			return unit.getStat(sdk.stats.PoisonResist);
		case "none":
			return 0;
		case "holybolt": // check if a monster is undead
			if (getBaseStat("monstats", unit.classid, "lUndead") || getBaseStat("monstats", unit.classid, "hUndead")) {
				return 0;
			}

			return 100;
		}

		return 100;
	},

	getLowerResistPercent: function () {
		let calc = function (level) { return Math.floor(Math.min(25 + (45 * ((110 * level) / (level + 6)) / 100), 70));};
		if (me.getSkill(sdk.skills.LowerResist, 1)) {
			return calc(me.getSkill(sdk.skills.LowerResist, 1));
		}
		return 0;
	},

	getConvictionPercent: function () {
		let calc = function (level) { return Math.floor(Math.min(25 + (5 * level), 150));};
		if (me.expansion && this.checkInfinity()) {
			return calc(12);
		}
		if (me.getSkill(sdk.skills.Conviction, 1)) {
			return calc(me.getSkill(sdk.skills.Conviction, 1));
		}
		return 0;
	},

	// Check if a monster is immune to specified attack type
	checkResist: function (unit, val, maxres = 100) {
		if (!unit || !unit.type || unit.type === sdk.unittype.Player) return true;

		let damageType = typeof val === "number" ? this.getSkillElement(val) : val;
		let addLowerRes = !!(me.getSkill(sdk.skills.LowerResist, 1) && unit.curseable);

		// Static handler
		if (val === sdk.skills.StaticField && this.getResist(unit, damageType) < 100) {
			return unit.hpPercent > Config.CastStatic;
		}

		// TODO: sometimes unit is out of range of conviction so need to check that
		// baal in throne room doesn't have getState
		if (this.infinity && ["fire", "lightning", "cold"].includes(damageType) && unit.getState) {
			if (!unit.getState(sdk.states.Conviction)) {
				if (addLowerRes && !unit.getState(sdk.states.LowerResist)) {
					let lowerResPercent = this.getLowerResistPercent();
					return (this.getResist(unit, damageType) - (Math.floor((lowerResPercent + 85) / 5))) < 100;
				}
				return this.getResist(unit, damageType) < 117;
			}

			return this.getResist(unit, damageType) < maxres;
		}

		if (this.auradin && ["physical", "fire", "cold", "lightning"].includes(damageType) && me.getState(sdk.states.Conviction) && unit.getState) {
			let valid = false;

			// our main dps is not physical despite using zeal
			if (damageType === "physical") return true;

			if (!unit.getState(sdk.states.Conviction)) {
				return (this.getResist(unit, damageType) - (this.getConvictionPercent() / 5) < 100);
			}

			// check unit's fire resistance
			if (me.getState(sdk.states.HolyFire)) {
				valid = this.getResist(unit, "fire") < maxres;
			}

			// check unit's light resistance but only if the above check failed
			if (me.getState(sdk.states.HolyShock) && !valid) {
				valid = this.getResist(unit, "lightning") < maxres;
			}

			// check unit's cold resistance but only if the above checks failed - we might be using an Ice Bow
			if (me.getState(sdk.states.HolyFreeze) && !valid) {
				valid = this.getResist(unit, "cold") < maxres;
			}

			// TODO: maybe if still invalid at this point check physical resistance? Although if we are an auradin our physcial dps is low

			return valid;
		}

		if (addLowerRes && ["fire", "lightning", "cold", "poison"].includes(damageType) && unit.getState) {
			let lowerResPercent = this.getLowerResistPercent();
			if (!unit.getState(sdk.states.LowerResist)) {
				return (this.getResist(unit, damageType) - (Math.floor(lowerResPercent / 5)) < 100);
			}
		}

		return this.getResist(unit, damageType) < maxres;
	},

	// Check if we have valid skills to attack a monster
	canAttack: function (unit) {
		if (unit.type === sdk.unittype.Monster) {
			// Unique/Champion
			if (unit.isSpecial) {
				if (Attack.checkResist(unit, this.getSkillElement(Config.AttackSkill[1])) || Attack.checkResist(unit, this.getSkillElement(Config.AttackSkill[2]))) {
					return true;
				}
			} else {
				if (Attack.checkResist(unit, this.getSkillElement(Config.AttackSkill[3])) || Attack.checkResist(unit, this.getSkillElement(Config.AttackSkill[4]))) {
					return true;
				}
			}

			if (Config.AttackSkill.length === 7) {
				return Attack.checkResist(unit, this.getSkillElement(Config.AttackSkill[5])) || Attack.checkResist(unit, this.getSkillElement(Config.AttackSkill[6]));
			}
		}

		return false;
	},

	// Detect use of bows/crossbows
	usingBow: function () {
		let item = me.getItem(-1, 1);

		if (item) {
			do {
				if (item.bodylocation === 4 || item.bodylocation === 5) {
					switch (item.itemType) {
					case 27: // Bows
					case 85: // Amazon Bows
						return "bow";
					case 35: // Crossbows
						return "crossbow";
					}
				}
			} while (item.getNext());
		}

		return false;
	},

	// Find an optimal attack position and move or walk to it
	getIntoPosition: function (unit, distance, coll, walk) {
		if (!unit || !unit.x || !unit.y) return false;

		walk === true && (walk = 1);

		if (distance < 4 && (!unit.hasOwnProperty("mode") || (unit.mode !== 0 && unit.mode !== 12))) {
			//me.overhead("Short range");

			if (walk) {
				if (getDistance(me, unit) > 8 || checkCollision(me, unit, coll)) {
					Pather.walkTo(unit.x, unit.y, 3);
				}
			} else {
				Pather.moveTo(unit.x, unit.y, 0);
			}

			return !CollMap.checkColl(me, unit, coll);
		}

		let coords = [],
			fullDistance = distance,
			name = unit.hasOwnProperty("name") ? unit.name : "",
			angle = Math.round(Math.atan2(me.y - unit.y, me.x - unit.x) * 180 / Math.PI),
			angles = [0, 15, -15, 30, -30, 45, -45, 60, -60, 75, -75, 90, -90, 135, -135, 180];

		//let t = getTickCount();

		for (let n = 0; n < 3; n += 1) {
			if (n > 0) {
				distance -= Math.floor(fullDistance / 3 - 1);
			}

			for (let i = 0; i < angles.length; i += 1) {
				let cx = Math.round((Math.cos((angle + angles[i]) * Math.PI / 180)) * distance + unit.x);
				let cy = Math.round((Math.sin((angle + angles[i]) * Math.PI / 180)) * distance + unit.y);

				if (Pather.checkSpot(cx, cy, 0x1, false)) {
					coords.push({x: cx, y: cy});
				}
			}

			//print("ÿc9potential spots: ÿc2" + coords.length);

			if (coords.length > 0) {
				coords.sort(Sort.units);

				for (let i = 0; i < coords.length; i += 1) {
					// Valid position found
					if (!CollMap.checkColl({x: coords[i].x, y: coords[i].y}, unit, coll, 1)) {
						//print("ÿc9optimal pos build time: ÿc2" + (getTickCount() - t) + " ÿc9distance from target: ÿc2" + getDistance(cx, cy, unit.x, unit.y));

						switch (walk) {
						case 1:
							Pather.walkTo(coords[i].x, coords[i].y, 2);

							break;
						case 2:
							if (coords[i].distance < 6 && !CollMap.checkColl(me, coords[i], 0x5)) {
								Pather.walkTo(coords[i].x, coords[i].y, 2);
							} else {
								Pather.moveTo(coords[i].x, coords[i].y, 1);
							}

							break;
						default:
							Pather.moveTo(coords[i].x, coords[i].y, 1);

							break;
						}

						return true;
					}
				}
			}
		}

		!!name && print("ÿc4Attackÿc0: No valid positions for: " + name);

		return false;
	},

	getNearestMonster: function (givenSettings = {}) {
		let settings = Object.assign({}, {
			skipBlocked: true,
			skipImmune: true,
			skipGid: -1,
		}, givenSettings);

		let gid,
			monster = getUnit(1),
			range = 30;

		if (monster) {
			do {
				if (monster.attackable && !monster.getParent()) {
					let distance = getDistance(me, monster);

					if (distance < range
						&& (settings.skipGid === -1 || monster.gid !== settings.skipGid)
						&& (!settings.skipBlocked || !checkCollision(me, monster, 0x5))
						&& (!settings.skipImmune || Attack.canAttack(monster))) {
						range = distance;
						gid = monster.gid;
					}
				}
			} while (monster.getNext());
		}

		return !!gid ? getUnit(sdk.unittype.Monster, -1, -1, gid) : false;
	},

	checkCorpse: function (unit) {
		if (!unit || (unit.mode !== sdk.units.monsters.monstermode.Death && unit.mode !== sdk.units.monsters.monstermode.Dead)) return false;
		if (unit.classid <= 575 && !getBaseStat("monstats2", unit.classid, "corpseSel")) return false;
		return ([
			sdk.states.FrozenSolid, sdk.states.Revive, sdk.states.Redeemed,
			sdk.states.CorpseNoDraw, sdk.states.Shatter, sdk.states.RestInPeace, sdk.states.CorpseNoSelect
		].every(state => !unit.getState(state)));
	},

	checkNearCorpses: function (unit, range = 15) {
		let corpses = getUnits(sdk.unittype.Monster).filter(function (corpse) {
			return getDistance(corpse, unit) <= range && Attack.checkCorpse(corpse);
		});
		return corpses.length > 0 ? corpses : [];
	},

	whirlwind: function (unit) {
		if (!unit.attackable) return true;

		let angles = [180, 175, -175, 170, -170, 165, -165, 150, -150, 135, -135, 45, -45, 90, -90];

		unit.isSpecial && angles.unshift(120);

		me.runwalk = me.gametype;
		let angle = Math.round(Math.atan2(me.y - unit.y, me.x - unit.x) * 180 / Math.PI);

		// get a better spot
		for (let i = 0; i < angles.length; i += 1) {
			let coords = [Math.round((Math.cos((angle + angles[i]) * Math.PI / 180)) * 4 + unit.x), Math.round((Math.sin((angle + angles[i]) * Math.PI / 180)) * 4 + unit.y)];

			if (!CollMap.checkColl(me, {x: coords[0], y: coords[1]}, 0x1, 1)) {
				return Skill.cast(151, 0, coords[0], coords[1]);
			}
		}

		return (Attack.validSpot(unit.x, unit.y) && Skill.cast(151, Skill.getHand(151), me.x, me.y));
	}
};
