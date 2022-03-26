/**
 *	@filename	Baal.js
 *	@author		kolton, YGM, theBGuy
 *	@desc		clear Throne of Destruction and kill Baal
 */

function Baal() {
	this.preattack = function () {
		let check;

		switch (me.classid) {
		case sdk.charclass.Sorceress:
			if ([sdk.skills.Meteor, sdk.skills.Blizzard, sdk.skills.FrozenOrb, sdk.skills.FireWall].includes(Config.AttackSkill[1])) {
				if (me.getState(sdk.states.SkillDelay)) {
					delay(50);
				} else {
					Skill.cast(Config.AttackSkill[1], 0, 15094 + rand(-1, 1), 5024);
				}
			}

			break;
		case sdk.charclass.Paladin:
			if (Config.AttackSkill[3] === sdk.skills.BlessedHammer) {
				Config.AttackSkill[4] > 0 && Skill.setSkill(Config.AttackSkill[4], 0);

				return Skill.cast(Config.AttackSkill[3], 1);
			}

			break;
		case sdk.charclass.Druid:
			if ([sdk.skills.Tornado, sdk.skills.Fissure, sdk.skills.Volcano].includes(Config.AttackSkill[3])) {
				Skill.cast(Config.AttackSkill[3], 0, 15094 + rand(-1, 1), 5029);

				return true;
			}

			break;
		case sdk.charclass.Assassin:
			if (Config.UseTraps) {
				check = ClassAttack.checkTraps({x: 15094, y: 5028});

				if (check) {
					return ClassAttack.placeTraps({x: 15094, y: 5028}, 5);
				}
			}

			if (Config.AttackSkill[3] === sdk.skills.ShockWeb) {
				return Skill.cast(Config.AttackSkill[3], 0, 15094, 5028);
			}

			break;
		}

		return false;
	};

	this.checkThrone = function () {
		let monster = getUnit(1);

		if (monster) {
			do {
				if (monster.attackable && monster.y < 5080) {
					switch (monster.classid) {
					case 23:
					case 62:
						return 1;
					case 105:
					case 381:
						return 2;
					case 557:
						return 3;
					case 558:
						return 4;
					case 571:
						return 5;
					default:
						Attack.getIntoPosition(monster, 10, 0x4);
						Attack.clear(15);

						return false;
					}
				}
			} while (monster.getNext());
		}

		return false;
	};

	this.clearThrone = function () {
		let monList = [],
			pos = [15094, 5022, 15094, 5041, 15094, 5060, 15094, 5041, 15094, 5022];

		if (Config.AvoidDolls) {
			let monster = getUnit(1, 691);

			if (monster) {
				do {
					if (monster.x >= 15072 && monster.x <= 15118 && monster.y >= 5002 && monster.y <= 5079 && monster.attackable && Attack.skipCheck(monster)) {
						monList.push(copyUnit(monster));
					}
				} while (monster.getNext());
			}

			if (monList.length) {
				Attack.clearList(monList);
			}
		}

		for (let i = 0; i < pos.length; i += 2) {
			Pather.moveTo(pos[i], pos[i + 1]);
			Attack.clear(25);
		}
	};

	this.checkHydra = function () {
		let hydra = getUnit(1, getLocaleString(3325));
		if (hydra) {
			do {
				if (hydra.mode !== 12 && hydra.getStat(172) !== 2) {
					Pather.moveTo(15072, 5002);
					while (hydra.mode !== 12) {
						delay(500);
						if (!copyUnit(hydra).x) {
							break;
						}
					}

					break;
				}
			} while (hydra.getNext());
		}

		return true;
	};

	this.announce = function () {
		let count, string, souls, dolls,
			monster = getUnit(1);

		if (monster) {
			count = 0;

			do {
				if (Attack.checkMonster(monster) && monster.y < 5094) {
					if (getDistance(me, monster) <= 40) {
						count += 1;
					}

					if (!souls && monster.classid === 641) {
						souls = true;
					}

					if (!dolls && monster.classid === 691) {
						dolls = true;
					}
				}
			} while (monster.getNext());
		}

		if (count > 30) {
			string = "DEADLY!!!" + " " + count + " monster" + (count > 1 ? "s " : " ") + "nearby.";
		} else if (count > 20) {
			string = "Lethal!" + " " + count + " monster" + (count > 1 ? "s " : " ") + "nearby.";
		} else if (count > 10) {
			string = "Dangerous!" + " " + count + " monster" + (count > 1 ? "s " : " ") + "nearby.";
		} else if (count > 0) {
			string = "Warm" + " " + count + " monster" + (count > 1 ? "s " : " ") + "nearby.";
		} else {
			string = "Cool TP. No immediate monsters.";
		}

		if (souls) {
			string += " Souls ";

			if (dolls) {
				string += "and Dolls ";
			}

			string += "in area.";
		} else if (dolls) {
			string += " Dolls in area.";
		}

		say(string);
	};

	Town.doChores();
	Pather.useWaypoint(Config.RandomPrecast ? "random" : sdk.areas.WorldstoneLvl2);
	Precast.doPrecast(true);

	me.area !== sdk.areas.WorldstoneLvl2 && Pather.useWaypoint(sdk.areas.WorldstoneLvl2);

	if (!Pather.moveToExit([sdk.areas.WorldstoneLvl3, sdk.areas.ThroneofDestruction], true)) {
		throw new Error("Failed to move to Throne of Destruction.");
	}

	Pather.moveTo(15095, 5029);

	if (Config.Baal.DollQuit && getUnit(1, 691)) {
		say("Dolls found! NG.");

		return true;
	}

	if (Config.Baal.SoulQuit && getUnit(1, 641)) {
		say("Souls found! NG.");

		return true;
	}

	if (Config.PublicMode) {
		this.announce();
		Pather.moveTo(15118, 5002);
		Pather.makePortal();
		say(Config.Baal.HotTPMessage);
		Attack.clear(15);
	}

	this.clearThrone();

	if (Config.PublicMode) {
		Pather.moveTo(15118, 5045);
		Pather.makePortal();
		say(Config.Baal.SafeTPMessage);
		Precast.doPrecast(true);
	}

	let tick = getTickCount();

	Pather.moveTo(15094, me.paladin ? 5029 : 5038);

	MainLoop:
	while (true) {
		if (!getUnit(1, 543)) {
			break MainLoop;
		}

		switch (this.checkThrone()) {
		case 1:
			Attack.clear(40);

			tick = getTickCount();

			Precast.doPrecast(true);

			break;
		case 2:
			Attack.clear(40);

			tick = getTickCount();

			break;
		case 4:
			Attack.clear(40);

			tick = getTickCount();

			break;
		case 3:
			Attack.clear(40);
			this.checkHydra();

			tick = getTickCount();

			break;
		case 5:
			Attack.clear(40);

			break MainLoop;
		default:
			if (getTickCount() - tick < 7e3) {
				if (me.paladin && me.getState(sdk.states.Poison)) {
					Skill.setSkill(sdk.skills.Cleansing, 0);
				}
			}

			if (getTickCount() - tick > 20000) {
				tick = getTickCount();
				this.clearThrone();
			}

			if (!this.preattack()) {
				delay(100);
			}

			break;
		}

		switch (me.classid) {
		case sdk.charclass.Amazon:
		case sdk.charclass.Sorceress:
		case sdk.charclass.Necromancer:
		case sdk.charclass.Assassin:
			[15116, 5026].distance > 3 && Pather.moveTo(15116, 5026);

			break;
		case sdk.charclass.Paladin:
			if (Config.AttackSkill[3] === sdk.skills.BlessedHammer) {
				[15094, 5029].distance > 3 && Pather.moveTo(15094, 5029);
				
				break;
			}
		case sdk.charclass.Druid:
			if ([sdk.skills.Fissure, sdk.skills.Volcano].includes(Config.AttackSkill[3])) {
				[15116, 5026].distance > 3 && Pather.moveTo(15116, 5026);

				break;
			}

			if (Config.AttackSkill[3] === sdk.skills.Tornado) {
				[15094, 5029].distance > 3 && Pather.moveTo(15094, 5029);
				
				break;
			}
		case sdk.charclass.Barbarian:
			[15112, 5062].distance > 3 && Pather.moveTo(15112, 5062);

			break;
		}

		delay(10);
	}

	if (Config.Baal.KillBaal) {
		Config.PublicMode && say(Config.Baal.BaalMessage);
		Pather.moveTo(15090, 5008);
		delay(5000);
		Precast.doPrecast(true);

		while (getUnit(1, 543)) {
			delay(500);
		}

		let portal = getUnit(2, 563);

		if (portal) {
			Pather.usePortal(null, null, portal);
		} else {
			throw new Error("Couldn't find portal.");
		}

		Pather.moveTo(15134, 5923);
		Attack.kill(544); // Baal
		Pickit.pickItems();
	}

	return true;
}
