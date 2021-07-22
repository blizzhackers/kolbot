/*
*	@filename	MiscOverrides.js
*	@author		isid0re
*	@desc		Misc.js fixes to improve functionality and Merc Hiring/Autoequip
*/

if (!isIncluded("common/Misc.js")) {
	include("common/Misc.js");
}

if (!isIncluded("SoloLeveling/Tools/Developer.js")) {
	include("SoloLeveling/Tools/Developer.js");
}

// Cast a skill on self, Unit or coords. Always use packet casting for caster skills becasue it's more stable.
if (Developer.forcePacketCasting) {
	Skill.cast = function (skillId, hand, x, y, item) {
		var casterSkills = [36, 38, 39, 44, 45, 47, 48, 49, 53, 54, 55, 56, 59, 64, 84, 87, 92, 93, 101, 112, 121, 130, 137, 138, 146, 149, 154, 155, 225, 229, 230, 234, 240, 244, 249, 250, 251, 256, 261, 262, 271, 276];

		if (me.inTown && !this.townSkill(skillId)) {
			return false;
		}

		if (!item && !me.getSkill(skillId, 1)) {
			return false;
		}

		if (!this.wereFormCheck(skillId)) {
			return false;
		}

		// Check mana cost, charged skills don't use mana
		if (!item && this.getManaCost(skillId) > me.mp) {
			// Maybe delay on ALL skills that we don't have enough mana for?
			if (Config.AttackSkill.concat([42, 54]).concat(Config.LowManaSkill).indexOf(skillId) > -1) {
				delay(300);
			}

			return false;
		}

		if (skillId === undefined) {
			throw new Error("Skill.cast: Must supply a skill ID");
		}

		var i, n, clickType, shift;

		if (hand === undefined) {
			hand = 0;
		}

		if (x === undefined) {
			x = me.x;
		}

		if (y === undefined) {
			y = me.y;
		}

		if (!this.setSkill(skillId, hand, item)) {
			return false;
		}

		if ((casterSkills.indexOf(skillId) > -1) || Config.PacketCasting > 1) {
			switch (typeof x) {
			case "number":
				Packet.castSkill(hand, x, y);
				delay(250);

				break;
			case "object":
				Packet.unitCast(hand, x);
				delay(250);

				break;
			}
		} else {
			switch (hand) {
			case 0: // Right hand + No Shift
				clickType = 3;
				shift = 0;

				break;
			case 1: // Left hand + Shift
				clickType = 0;
				shift = 1;

				break;
			case 2: // Left hand + No Shift
				clickType = 0;
				shift = 0;

				break;
			case 3: // Right hand + Shift
				clickType = 3;
				shift = 1;

				break;
			}

			MainLoop:
			for (n = 0; n < 3; n += 1) {
				if (typeof x === "object") {
					clickMap(clickType, shift, x);
				} else {
					clickMap(clickType, shift, x, y);
				}

				delay(20);

				if (typeof x === "object") {
					clickMap(clickType + 2, shift, x);
				} else {
					clickMap(clickType + 2, shift, x, y);
				}

				for (i = 0; i < 8; i += 1) {
					if (me.attacking) {
						break MainLoop;
					}

					delay(20);
				}
			}

			while (me.attacking) {
				delay(10);
			}
		}

		if (this.isTimed(skillId)) { // account for lag, state 121 doesn't kick in immediately
			for (i = 0; i < 10; i += 1) {
				if ([4, 9].indexOf(me.mode) > -1) {
					break;
				}

				if (me.getState(121)) {
					break;
				}

				delay(10);
			}
		}

		return true;
	};
}

Skill.getRange = function (skillId) {
	switch (skillId) {
	case 0: // Normal Attack
		return Attack.usingBow() ? 20 : 3;
	case 1: // Kick
	case 5: // Left Hand Swing
	case 10: // Jab
	case 14: // Power Strike
	case 19: // Impale
	case 24: // Charged Strike
	case 30: // Fend
	case 34: // Lightning Strike
	case 46: // Blaze
	case 73: // Poison Dagger
	case 96: // Sacrifice
	case 97: // Smite
	case 106: // Zeal
	case 111: // Vengeance
	case 112: // Blessed Hammer
	case 116: // Conversion
	case 126: // Bash
	case 131: // Find Potion
	case 133: // Double Swing
	case 139: // Stun
	case 142: // Find Item
	case 144: // Concentrate
	case 147: // Frenzy
	case 150: // Grim Ward
	case 152: // Berserk
	case 232: // Feral Rage
	case 233: // Maul
	case 238: // Rabies
	case 239: // Fire Claws
	case 242: // Hunger
	case 248: // Fury
	case 255: // Dragon Talon
	case 260: // Dragon Claw
	case 270: // Dragon Tail
		return 3;
	case 146: // Battle Cry
	case 154: // War Cry
		return 4;
	case 44: // Frost Nova
	case 240: // Twister
	case 245: // Tornado
	case 500: // Summoner
		return 5;
	case 38: // Charged Bolt
		if (this.usePvpRange) {
			return 11;
		}

		return 6;
	case 48: // Nova
	case 151: // Whirlwind
		return 7;
	case 92: // Poison Nova
		return 8;
	case 249: // Armageddon
		return 9;
	case 15: // Poison Javelin
	case 25: // Plague Javelin
	case 101: // Holy Bolt
	case 107: // Charge
	case 130: // Howl
	case 225: // Firestorm
	case 229: // Molten Boulder
	case 243: // Shock Wave
		return 10;
	case 8: // Inner Sight
	case 17: // Slow Missiles
		return 13;
	case 35: // Lightning Fury
	case 64: // Frozen Orb
	case 67: // Teeth
	case 234: // Fissure
	case 244: // Volcano
	case 251: // Fire Blast
	case 256: // Shock Web
	case 257: // Blade Sentinel
	case 266: // Blade Fury
		return 15;
	case 7: // Fire Arrow
	case 12: // Multiple Shot
	case 16: // Exploding Arrow
	case 22: // Guided Arrow
	case 27: // Immolation Arrow
	case 31: // Freezing Arrow
	case 95: // Revive
	case 121: // Fist of the Heavens
	case 140: // Double Throw
	case 253: // Psychic Hammer
	case 275: // Dragon Flight
		return 20;
	case 91: // Lower Resist
		return 50;
	// Variable range
	case 42: // Static Field
		return Math.floor((me.getSkill(42, 1) + 4) * 2 / 3);
	case 132: // Leap
		var leap = [4, 7, 8, 10, 11, 12, 12, 13, 14, 14, 14, 14, 15, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 17];

		return leap[Math.min(me.getSkill(132, 1) - 1, 24)];
	case 230: // Arctic Blast
		var arctic = [5, 6, 6, 6, 6, 7, 7, 8, 8, 8, 8, 9, 9, 10, 10, 10, 10, 11, 11, 12];

		return arctic[Math.min(me.getSkill(230, 1) - 1, 19)];
	case 49: // Lightning
	case 84: // Bone Spear
	case 93: // Bone Spirit
		if (this.usePvpRange) {
			return 30;
		}

		return 15;
	case 47: // Fire Ball
	case 51: // Fire Wall
	case 53: // Chain Lightning
	case 56: // Meteor
	case 59: // Blizzard
	case 273: // Mind Blast
		if (this.usePvpRange) {
			return 30;
		}

		return 20;
	}

	// Every other skill
	if (this.usePvpRange) {
		return 30;
	}

	return 20;
};

Misc.checkQuest = function (id, state) {
	sendPacket(1, 0x40);
	delay(500 + me.ping);

	return me.getQuest(id, state);
};

Misc.townCheck = function () {
	var i, potion, check,
		needhp = true,
		needmp = true;

	// Can't tp from uber trist or when dead
	if (me.area === 136 || me.dead) {
		return false;
	}

	if (Config.TownCheck && !me.inTown) {
		try {
			if (me.charlvl > 2 && me.gold > 500) {
				for (i = 0; i < 4; i += 1) {
					if (Config.BeltColumn[i] === "hp" && Config.MinColumn[i] > 0) {
						potion = me.getItem(-1, 2); // belt item

						if (potion) {
							do {
								if (potion.code.indexOf("hp") > -1) {
									needhp = false;

									break;
								}
							} while (potion.getNext());
						}

						if (needhp) {
							print("We need healing potions");

							check = true;
						}
					}

					if (Config.BeltColumn[i] === "mp" && Config.MinColumn[i] > 0) {
						potion = me.getItem(-1, 2); // belt item

						if (potion) {
							do {
								if (potion.code.indexOf("mp") > -1) {
									needmp = false;

									break;
								}
							} while (potion.getNext());
						}

						if (needmp) {
							print("We need mana potions");

							check = true;
						}
					}
				}
			}

			if (Config.OpenChests && Town.needKeys()) {
				check = true;
			}
		} catch (e) {
			check = false;
		}
	}

	if (check) {
		scriptBroadcast("townCheck");
		delay(500);

		return true;
	}

	return false;
};

Misc.openChest = function (unit) {
	// Skip invalid and Countess chests
	if (!unit || unit.x === 12526 || unit.x === 12565) {
		return false;
	}

	// already open
	if (unit.mode) {
		return true;
	}

	// locked chest, no keys
	if (me.classid !== 6 && unit.islocked && !me.findItem(543, 0, 3)) {
		return false;
	}

	var i, tick;

	for (i = 0; i < 7; i += 1) {
		if (Pather.moveTo(unit.x + 1, unit.y + 2, 3) && getDistance(me, unit.x + 1, unit.y + 2) < 5) {
			//Misc.click(0, 0, unit);
			sendPacket(1, 0x13, 4, unit.type, 4, unit.gid);
		}

		tick = getTickCount();

		while (getTickCount() - tick < 1000) {
			if (unit.mode) {
				return true;
			}

			delay(10);
		}

		Packet.flash(me.gid);
	}

	if (!me.idle) {
		Misc.click(0, 0, me.x, me.y); // Click to stop walking in case we got stuck
	}

	return false;
};

Misc.openChests = function (range) {
	var unit,
		unitList = [],
		containers = [ "loose rock", "hidden stash", "loose boulder", "chest", "chest3", "armorstand", "holeanim", "weaponrack"],
		pita = ["barrel", "largeurn", "jar3", "jar2", "jar1", "urn", "jug"]; // pain in the ass

	if (!range) {
		range = 15;
	}

	if (Config.OpenChests === 2) {
		containers = [
			"chest", "loose rock", "hidden stash", "loose boulder", "corpseonstick", "casket", "armorstand", "weaponrack", "barrel", "holeanim", "tomb2", "tomb3", "roguecorpse", "ratnest", "corpse", "goo pile", "largeurn", "urn", "chest3", "jug", "skeleton", "guardcorpse", "sarcophagus", "object2", "cocoon", "basket", "stash", "hollow log", "hungskeleton", "pillar", "skullpile", "skull pile", "jar3", "jar2", "jar1", "bonechest", "woodchestl", "woodchestr", "barrel wilderness", "burialchestr", "burialchestl", "explodingchest", "chestl", "chestr", "groundtomb", "icecavejar1", "icecavejar2", "icecavejar3", "icecavejar4", "deadperson", "deadperson2", "evilurn", "tomb1l", "tomb3l", "groundtombl"
		];
	}

	unit = getUnit(2);

	if (unit) {
		do {
			if (unit.name && unit.mode === 0 && getDistance(me.x, me.y, unit.x, unit.y) <= range && containers.indexOf(unit.name.toLowerCase()) > -1) {
				unitList.push(copyUnit(unit));
			}

			if (unit.name && getDistance(me.x, me.y, unit.x, unit.y) <= 2 && pita.indexOf(unit.name.toLowerCase()) > -1) {
				unitList.push(copyUnit(unit));
			}

		} while (unit.getNext());
	}

	while (unitList.length > 0) {
		unitList.sort(Sort.units);
		unit = unitList.shift();

		if (unit && (Pather.useTeleport() || !checkCollision(me, unit, 0x4)) && this.openChest(unit)) {
			Pickit.pickItems();
		}
	}

	return true;
};

Misc.useWell = function (range) {
	let unit = getUnit(2, "Well", 0),
		unitList = [];

	if (!range) {
		range = 15;
	}

	if (unit) {
		do {
			if (unit.mode === 0 && getDistance(me, unit) <= range) {
				unitList.push(copyUnit(unit));
			}
		} while (unit.getNext());
	}

	while (unitList.length > 0) {
		unitList.sort(Sort.units);
		unit = unitList.shift();

		if (unit && (Pather.useTeleport() || !checkCollision(me, unit, 0x4))) {
			this.getWell(unit);
		}
	}

	return true;
};

Misc.getWell = function (unit) {
	if (unit.mode !== 0) {
		return true;
	}

	let i, tick;

	for (i = 0; i < 3; i += 1) {
		if (getDistance(me, unit) < 4 || Pather.moveToUnit(unit, 3, 0)) {
			Misc.click(0, 0, unit);
		}

		tick = getTickCount();

		while (getTickCount() - tick < 1000) {
			if (unit.mode !== 0) {
				return true;
			}

			delay(10);
		}
	}

	return false;
};

Misc.getExpShrine = function (shrineLocs) {
	if (me.getState(137)) {
		return true;
	}

	for (let get = 0; get < shrineLocs.length; get++) {
		if (!Pather.checkWP(shrineLocs[get])) {
			Pather.getWP(shrineLocs[get]);
		} else {
			Pather.useWaypoint(shrineLocs[get]);
		}

		Precast.doPrecast(true);
		Misc.getShrinesInArea(shrineLocs[get], 15, true);

		if (me.getState(137)) {
			break;
		}

		if (!me.inTown) {
			Town.goToTown();
		}
	}

	return true;
};

Misc.gamePause = function () {
	let script = getScript("default.dbj");

	if (script) {
		if (script.running) {
			print("ÿc1Pausing.");
			script.pause();
		} else {
			print("ÿc2Resuming.");
			script.resume();
		}
	}

	return true;
};

Misc.gamePacket = function (bytes) {// various game events
	let diablo, tick, wave, waveMonster;

	switch (bytes[0]) {
	case 0x89: // den completion lights
		if (me.area === 8) {
			Misc.gamePause();
			Pickit.pickItems();

			if (!me.getItem(518)) {
				Pather.moveToExit([2, 3], true);
				Pather.getWP(3);
				Pather.useWaypoint(1);
			} else {
				Town.goToTown();
			}

			Town.npcInteract("akara");
			Misc.gamePause();
		}

		break;
		/*	case 0x4c: // diablo lightning dodge
		if (bytes[6] === 193 && !me.getSkill(54, 0)) {
			diablo = getUnit(1, 243);
			tick = getTickCount();
			Misc.gamePause();

			while (getTickCount() - tick < 2000) {
				if (me.y <= diablo.y) { // above D
					if (me.x <= diablo.x) { //move east
						Pather.moveTo(diablo.x + 3, diablo.y);
					}

					if (me.x > diablo.x) { //move south
						Pather.moveTo(diablo.x, diablo.y + 3);
					}
				}

				if (me.y > diablo.y) { // below D
					if (me.x >= diablo.x) { //move west
						Pather.moveTo(diablo.x - 3, diablo.y);
					}

					if (me.x < diablo.x) { //move north
						Pather.moveTo(diablo.x, diablo.y - 3);
					}
				}
			}

			Misc.gamePause();
		}

		break;	*/
	case 0xa4: //baalwave
		if (me.hell) {
			waveMonster = ((bytes[1]) | (bytes[2] << 8));
			wave = [23, 381, 557, 558, 571].indexOf(waveMonster);

			if (wave > -1) {
				Misc.gamePause();
				tick = getTickCount();
				print('ÿc9SoloLevelingÿc0: baal wave #' + (wave + 1));
				me.overhead("wave " + (wave + 1));

				while (getTickCount() - tick < 6500) { //prep
					Pather.moveTo(15092, 5073);
				}

				Config.NoTele = true;
				tick = getTickCount();

				while (getTickCount() - tick < 5000) { // 5 second delay (5000ms)
					Pather.moveTo(15098, 5082);	// leave throne
				}

				tick = getTickCount();
				Pather.moveTo(15099, 5078); // reenter throne

				while (getTickCount() - tick < 2000) {// 2 second delay (2000ms)
					Pather.moveTo(15098, 5082);
				}

				Pather.moveTo(15098, 5073);
				Config.NoTele = false;
				Misc.gamePause();
			}
		}

		break;
	default:
		break;
	}
};

Packet.openMenu = function (unit) { // singleplayer delay(0) fix
	if (unit.type !== 1) {
		throw new Error("openMenu: Must be used on NPCs.");
	}

	if (getUIFlag(0x08)) {
		return true;
	}

	var i, tick;

	for (i = 0; i < 5; i += 1) {
		if (getDistance(me, unit) > 4) {
			Pather.moveToUnit(unit);
		}

		sendPacket(1, 0x13, 4, 1, 4, unit.gid);
		tick = getTickCount();

		while (getTickCount() - tick < 5000) {
			if (getUIFlag(0x08)) {
				delay(Math.max(500, me.ping * 2));

				return true;
			}

			if (getInteractedNPC() && getTickCount() - tick > 1000) {
				me.cancel();
			}

			delay(100);
		}

		sendPacket(1, 0x2f, 4, 1, 4, unit.gid);
		delay(me.ping * 2 + 1);
		sendPacket(1, 0x30, 4, 1, 4, unit.gid);
		delay(me.ping * 2 + 1);
		this.flash(me.gid);
	}

	return false;
};
