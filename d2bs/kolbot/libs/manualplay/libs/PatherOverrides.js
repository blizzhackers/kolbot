/*
*	@filename	PatherOverides.js
*	@author		theBGuy
*	@desc		Pather.js fixes to improve functionality for map mode
*/

if (!isIncluded("common/Pather.js")) { include("common/Pather.js"); }

Pather.stop = false;
Pather.stopEvent = function (key) {
	key === 105 && !me.idle && (Pather.stop = true);
};

Pather.changeAct = function (act) {
	let npc, npcUnit, loc;
	let wp, useWp = false;

	switch (act) {
	case 1:
		npc = "Warriv";
		loc = 1;

		break;
	case 2:
		loc = 40;
		npc = me.act === 1 ? "Warriv" : "Meshif";

		break;
	case 3:
		npc = "Meshif";
		loc = 75;

		break;
	case 5:
		npc = "Tyrael";
		loc = 109;

		break;
	}

	!me.inTown && Town.goToTown();
	
	if (npc) {
		npcUnit = Game.getNPC(NPC[npc]);
		wp = Game.getObject("waypoint");

		if (Pather.accessToAct(act)
			&& ((wp && !npcUnit)
				|| (wp && npcUnit && getDistance(me, wp) < getDistance(me, npcUnit))
				|| (Town.getDistance("waypoint") < Town.getDistance(NPC[npc])))) {
			useWp = true;
		}
	} else {
		useWp = true;
	}

	if (!npcUnit && !useWp) {
		let timeout = getTickCount() + 3000;

		while (!npcUnit) {
			if (timeout < getTickCount()) {
				break;
			}

			Town.move(NPC[npc]);
			Packet.flash(me.gid);
			delay(me.ping * 2 + 100);
			npcUnit = Game.getNPC(NPC[npc]);
		}
	}

	if (npcUnit && !useWp) {
		getDistance(me, npcUnit) > 5 && Town.move(NPC[npc]);

		for (let i = 0; i < 5; i += 1) {
			sendPacket(1, 56, 4, 0, 4, npcUnit.gid, 4, loc);
			delay(500 + me.ping);

			if (me.act === act) {
				break;
			}
		}
	} else if (useWp) {
		Town.goToTown(act);
	} else {
		print("Failed to move to " + npc);
		me.overhead("Failed to move to " + npc);
	}

	while (!me.gameReady) {
		delay(100);
	}

	return me.act === act;
};

Pather.getWP = function (area, clearPath) {
	let useTK = me.getSkill(sdk.skills.Telekinesis, sdk.skills.subindex.SoftPoints),
		wpIDs = [119, 145, 156, 157, 237, 238, 288, 323, 324, 398, 402, 429, 494, 496, 511, 539];

	area !== me.area && this.journeyTo(area);

	for (let i = 0; i < wpIDs.length; i++) {
		let preset = Game.getPresetObject(area, wpIDs[i]);

		if (preset) {
			useTK ? this.moveNearUnit(preset, 20, clearPath) : this.moveToUnit(preset, 0, 0, clearPath);

			let wp = Game.getObject("waypoint");

			if (wp) {
				for (let j = 0; j < 10; j++) {
					if (wp.distance > 5 && Skill.useTK(wp) && j < 3) {
						if (wp.distance > 21) {
							Attack.getIntoPosition(wp, 20, 0x4);
						}

						Skill.cast(sdk.skills.Telekinesis, 0, wp);
					} else if (wp.distance > 5 || !getUIFlag(sdk.uiflags.Waypoint)) {
						this.moveToUnit(wp) && Misc.click(0, 0, wp);
					}

					if (getUIFlag(sdk.uiflags.Waypoint)) {
						delay(500);

						// Keep wp menu open in town
						!me.inTown && me.cancel();

						return true;
					}

					delay(500);
				}
			}
		}
	}

	return false;
};

Pather.walkTo = function (x = undefined, y = undefined, minDist = undefined) {
	while (!me.gameReady) {
		delay(100);
	}

	if (!x || !y) return false;
	minDist === undefined && (minDist = me.inTown ? 2 : 4);

	let angle, angles, nTimer, whereToClick, _a,
		nFail = 0,
		attemptCount = 0;

	// credit @Jaenster
	// Stamina handler and Charge
	if (!me.inTown && !me.dead) {
		// Check if I have a stamina potion and use it if I do
		if (me.staminaPercent <= 20) {
			(_a = me.getItemsEx()
				.filter(function (i) { return i.classid === sdk.items.StaminaPotion && i.isInInventory; })
				.first()) === null || _a === void 0 ? void 0 : _a.interact();
		}
		(me.runwalk === 1 && me.staminaPercent <= 15) && (me.runwalk = 0);
		// the less stamina you have, the more you wait to recover
		let recover = me.staminaMaxDuration < 30 ? 80 : 50;
		(me.runwalk === 0 && me.staminaPercent >= recover) && (me.runwalk = 1);
		if (Config.Charge && me.paladin && me.mp >= 9 && getDistance(me.x, me.y, x, y) > 8 && Skill.setSkill(sdk.skills.Charge, sdk.skills.hand.Left)) {
			if (Config.Vigor) {
				Skill.setSkill(sdk.skills.Vigor, sdk.skills.hand.Right);
			} else if (!Config.Vigor && me.getSkill(sdk.skills.HolyFreeze, sdk.skills.subindex.SoftPoints)) {
				// Useful in classic to keep mobs cold while you rush them
				Skill.setSkill(sdk.skills.HolyFreeze, sdk.skills.hand.Right);
			}
			Misc.click(0, 1, x, y);
			while (me.mode !== 1 && me.mode !== 5 && !me.dead) {
				delay(40);
			}
		}
	}

	(me.inTown && me.runwalk === 0) && (me.runwalk = 1);

	while (getDistance(me.x, me.y, x, y) > minDist && !me.dead && !Pather.stop) {
		me.paladin && Config.Vigor && Skill.setSkill(sdk.skills.Vigor, sdk.skills.hand.Right);
		me.paladin && !Config.Vigor && Skill.setSkill(Config.AttackSkill[2], sdk.skills.hand.Right);

		if (this.openDoors(x, y) && getDistance(me.x, me.y, x, y) <= minDist) {
			return true;
		}

		Misc.click(0, 0, x, y);

		attemptCount += 1;
		nTimer = getTickCount();

		while (me.mode !== 2 && me.mode !== 3 && me.mode !== 6) {
			if (me.dead || Pather.stop) return false;

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

		// Wait until we're done walking - idle or dead
		while (getDistance(me.x, me.y, x, y) > minDist && me.mode !== 1 && me.mode !== 5 && !me.dead) {
			delay(10);
		}

		if (attemptCount >= 3) return false;
	}

	return !me.dead && getDistance(me.x, me.y, x, y) <= minDist;
};

Pather.teleportTo = function (x, y, maxRange = 5) {
	for (let i = 0; i < 3; i++) {
		Config.PacketCasting ? Skill.setSkill(sdk.skills.Teleport, sdk.skills.hand.Right) && Packet.castSkill(0, x, y) : Skill.cast(sdk.skills.Teleport, 0, x, y);
		let tick = getTickCount();

		while (getTickCount() - tick < Math.max(500, me.ping * 2 + 200)) {
			if (getDistance(me.x, me.y, x, y) < maxRange || Pather.stop) {
				return true;
			}

			delay(10);
		}
	}

	return false;
};

Pather.moveTo = function (x, y, retry, clearPath, pop) {
	// Abort if dead
	if (me.dead) return false;

	let path, adjustedNode, cleared, leaped = false,
		useTeleport = false,
		preSkill = me.getSkill(sdk.skills.get.RightId),
		node = {x: x, y: y},
		fail = 0;

	for (let i = 0; i < this.cancelFlags.length; i += 1) {
		getUIFlag(this.cancelFlags[i]) && me.cancel();
	}

	if (!x || !y) return false; // I don't think this is a fatal error so just return false
	if (typeof x !== "number" || typeof y !== "number") { throw new Error("moveTo: Coords must be numbers"); }
	if (getDistance(me, x, y) < 2) return true;

	useTeleport = this.useTeleport();
	retry === undefined && (retry = useTeleport ? 3 : 15);
	clearPath === undefined && (clearPath = Config.AttackSkill.some(skillId => skillId > 0) && !useTeleport ? true : false);
	pop === undefined && (pop = false);
	path = getPath(me.area, x, y, me.x, me.y, useTeleport ? 1 : 0, useTeleport ? ([62, 63, 64].indexOf(me.area) > -1 ? 30 : this.teleDistance) : this.walkDistance);

	if (!path) { throw new Error("moveTo: Failed to generate path."); }

	path.reverse();
	pop && path.pop();

	PathDebug.drawPath(path);

	if (useTeleport && Config.TeleSwitch && path.length > 5) {
		me.switchWeapons(Attack.getPrimarySlot() ^ 1);
	}

	while (path.length > 0) {
		// Abort if dead
		if (me.dead || Pather.stop) {
			Pather.stop = false;	// Reset value
			
			return false;
		}

		for (let i = 0; i < this.cancelFlags.length; i++) {
			getUIFlag(this.cancelFlags[i]) && me.cancel();
		}

		node = path.shift();

		/* Right now getPath's first node is our own position so it's not necessary to take it into account
			This will be removed if getPath changes
		*/
		if (getDistance(me, node) > 2) {
			// Make life in Maggot Lair easier
			if ([62, 63, 64].indexOf(me.area) > -1) {
				adjustedNode = this.getNearestWalkable(node.x, node.y, 15, 3, 0x1 | 0x4 | 0x800 | 0x1000);

				if (adjustedNode) {
					node.x = adjustedNode[0];
					node.y = adjustedNode[1];
				}
			}

			if (useTeleport ? this.teleportTo(node.x, node.y) : this.walkTo(node.x, node.y, (fail > 0 || me.inTown) ? 2 : 4)) {
				if (Pather.stop) {
					continue; // stops on next interation
				}
				
				if (!me.inTown) {
					if (this.recursion) {
						this.recursion = false;

						NodeAction.go({clearPath: clearPath});

						if (getDistance(me, node.x, node.y) > 5) {
							this.moveTo(node.x, node.y);
						}

						this.recursion = true;
					}

					Misc.townCheck();
				}
			} else {
				if (Pather.stop) {
					continue; // stops on next interation
				}

				if (fail > 0 && !useTeleport && !me.inTown) {
					// Don't go berserk on longer paths
					if (!cleared) {
						Attack.clear(5) && Misc.openChests(2);
						cleared = true;
					}

					// Only do this once
					if (fail > 1 && me.getSkill(143, sdk.skills.subindex.SoftPoints) && !leaped) {
						Skill.cast(143, 0, node.x, node.y);
						leaped = true;
					}
				}

				// Reduce node distance in new path
				path = getPath(me.area, x, y, me.x, me.y, useTeleport ? 1 : 0, useTeleport ? rand(25, 35) : rand(10, 15));
				fail += 1;

				if (!path) { throw new Error("moveTo: Failed to generate path."); }

				path.reverse();
				PathDebug.drawPath(path);
				pop && path.pop();

				print("move retry " + fail);

				if (fail > 0) {
					Packet.flash(me.gid);

					if (fail >= retry) {
						break;
					}
				}
			}
		}

		delay(5);
	}

	useTeleport && Config.TeleSwitch && me.switchWeapons(Attack.getPrimarySlot());
	me.getSkill(sdk.skills.get.RightId) !== preSkill && Skill.setSkill(preSkill, sdk.skills.hand.Right);
	PathDebug.removeHooks();

	return getDistance(me, node.x, node.y) < 5;
};
