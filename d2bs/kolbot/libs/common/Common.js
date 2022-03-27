/**
*	@filename	Common.js
*	@author		theBGuy
*	@desc		collection of functions shared between muliple scripts
*/

const Common = {
	Diablo: {
		vizLayout: -1,
		seisLayout: -1,
		infLayout: -1,

		sort: function (a, b) {
			if (Config.BossPriority) {
				if ((a.spectype & 0x5) && (b.spectype & 0x5)) {
					return getDistance(me, a) - getDistance(me, b);
				}

				if (a.spectype & 0x5) return -1;
				if (b.spectype & 0x5) return 1;
			}

			// Entrance to Star / De Seis
			if (me.y > 5325 || me.y < 5260) {
				if (a.y > b.y) {
					return -1;
				}

				return 1;
			}

			// Vizier
			if (me.x < 7765) {
				if (a.x > b.x) {
					return -1;
				}

				return 1;
			}

			// Infector
			if (me.x > 7825) {
				if (!checkCollision(me, a, 0x1) && a.x < b.x) {
					return -1;
				}

				return 1;
			}

			return getDistance(me, a) - getDistance(me, b);
		},

		getLayout: function (seal, value) {
			let sealPreset = getPresetUnit(108, 2, seal);

			if (!seal) { throw new Error("Seal preset not found. Can't continue."); }

			if (sealPreset.roomy * 5 + sealPreset.y === value || sealPreset.roomx * 5 + sealPreset.x === value) {
				return 1;
			}

			return 2;
		},

		initLayout: function () {
			this.vizLayout = this.getLayout(396, 5275); 	// 1 = "Y", 2 = "L"
			this.seisLayout = this.getLayout(394, 7773);	// 1 = "2", 2 = "5"
			this.infLayout = this.getLayout(392, 7893);		// 1 = "I", 2 = "J"
		},

		tkSeal: function (seal) {
			if (!Skill.useTK(seal)) return false;

			for (let i = 0; i < 5; i++) {
				seal.distance > 13 && Attack.getIntoPosition(seal, 13, 0x4);
				Skill.cast(sdk.skills.Telekinesis, 0, seal);

				if (seal.mode) return true;
			}

			if (!seal.mode) {
				Pather.moveToUnit(seal) && sendPacket(1, 0x13, 4, seal.type, 4, seal.gid);
				Misc.poll(function () {
					seal.classid === 394 ? Misc.click(0, 0, seal) : seal.interact();
					return seal.mode;
					}, 3000, (250 + me.ping));
			}

			return seal.mode;
		},

		openSeal: function (classid) {
			let warn = Config.PublicMode && [396, 394, 392].includes(classid) && Loader.scriptName() === "Diablo";
			let usetk = Config.UseTelekinesis && me.getSkill(sdk.skills.Telekinesis, 1);

			for (let i = 0; i < 5; i += 1) {
				if (usetk) {
					Pather.moveNearPreset(108, 2, classid, 15);
				} else {
					Pather.moveToPreset(108, 2, classid, classid === 394 ? 5 : 2, classid === 394 ? 5 : 0);
				}

				let seal = Misc.poll(function () { return getUnit(sdk.unittype.Object, classid); }, 1000, 100);
				if (!seal) return false;

				if (seal.mode) {
					// for pubbies
					warn && say(Config.Diablo.SealWarning);

					return true;
				}

				// Clear around Infector seal, Any leftover abyss knights casting decrep is bad news with Infector
				if ([392, 393].includes(classid) || i > 1) {
					Attack.clear(25);
					// Move back to seal
					if (usetk) {
						Pather.moveNearUnit(seal, 15);
					} else {
						Pather.moveToUnit(seal, classid === 394 ? 5 : 2, classid === 394 ? 5 : 0);
					}
				}

				if (!this.tkSeal(seal)) {
					if (classid === 392 && me.assassin && this.infLayout === 1) {
						if (Config.UseTraps) {
							let check = ClassAttack.checkTraps({x: 7899, y: 5293});

							if (check) {
								ClassAttack.placeTraps({x: 7899, y: 5293}, check);
							}
						}
					}

					classid === 394 ? Misc.click(0, 0, seal) : seal.interact();
				}

				delay(classid === 394 ? 1000 + me.ping : 500 + me.ping);

				if (!seal.mode) {
					// de seis optimization
					if (classid === 394 && Attack.validSpot(seal.x + 15, seal.y)) {
						Pather.moveTo(seal.x + 15, seal.y);
					} else {
						Pather.moveTo(seal.x - 5, seal.y - 5);
					}

					delay(500);
				} else {
					return true;
				}
			}

			return false;
		},

		chaosPreattack: function (name, amount) {
			if (me.paladin && Config.AttackSkill[1] === sdk.skills.BlessedHammer) {
				let target = getUnit(1, name);

				if (!target) return;

				let positions = [[6, 11], [0, 8], [8, -1], [-9, 2], [0, -11], [8, -8]];

				for (let i = 0; i < positions.length; i += 1) {
					// check if we can move there
					if (Attack.validSpot(target.x + positions[i][0], target.y + positions[i][1])) {
						Pather.moveTo(target.x + positions[i][0], target.y + positions[i][1]);
						Skill.setSkill(Config.AttackSkill[2], 0);

						for (let n = 0; n < amount; n += 1) {
							Skill.cast(Config.AttackSkill[1], 1);
						}

						return;
					}
				}
			}
		},

		diabloPrep: function () {
			let trapCheck,
				tick = getTickCount();

			switch (me.classid) {
			case sdk.charclass.Amazon:
			case sdk.charclass.Sorceress:
			case sdk.charclass.Necromancer:
			case sdk.charclass.Assassin:
				Pather.moveNear(7791, 5293, (me.sorceress ? 35 : 25), {returnSpotOnError: true});

				break;
			case sdk.charclass.Paladin:
			case sdk.charclass.Druid:
			case sdk.charclass.Barbarian:
				Pather.moveTo(7788, 5292);

				break;
			}

			while (getTickCount() - tick < 30000) {
				if (getTickCount() - tick >= 8000) {
					switch (me.classid) {
					case sdk.charclass.Sorceress:
						if ([sdk.skills.Meteor, sdk.skills.Blizzard, sdk.skills.FrozenOrb, sdk.skills.FireWall].includes(Config.AttackSkill[1])) {
							if (me.getState(sdk.states.SkillDelay)) {
								delay(50);
							} else {
								Skill.cast(Config.AttackSkill[1], 0, 7793 + rand(-1, 1), 5293);
							}
						}

						delay(500);

						break;
					case sdk.charclass.Paladin:
						Skill.setSkill(Config.AttackSkill[2]);

						if (Config.AttackSkill[1] === sdk.skills.BlessedHammer) {
							Skill.cast(Config.AttackSkill[1], 1);
						}

						break;
					case sdk.charclass.Druid:
						if ([sdk.skills.Tornado, sdk.skills.Fissure, sdk.skills.Volcano].includes(Config.AttackSkill[3])) {
							Skill.cast(Config.AttackSkill[1], 0, 7793 + rand(-1, 1), 5293);

							break;
						}

						delay(500);

						break;
					case sdk.charclass.Assassin:
						if (Config.UseTraps) {
							trapCheck = ClassAttack.checkTraps({x: 7793, y: 5293});

							if (trapCheck) {
								ClassAttack.placeTraps({x: 7793, y: 5293, classid: 243}, trapCheck);
							}
						}

						if (Config.AttackSkill[1] === sdk.skills.ShockWeb) {
							Skill.cast(Config.AttackSkill[3], 0, 7793, 5293);
						}

						delay(500);

						break;
					default:
						delay(500);

						break;
					}
				} else {
					delay(500);
				}

				if (getUnit(1, 243)) {
					return true;
				}
			}

			throw new Error("Diablo not found");
		},
	},

	Baal: {
		checkHydra: function () {
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
		},

		checkThrone: function () {
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
		},

		clearThrone: function () {
			let monList = [];

			if (Config.AvoidDolls) {
				let monster = getUnit(1, 691);

				if (monster) {
					do {
						if (monster.x >= 15072 && monster.x <= 15118 && monster.y >= 5002 && monster.y <= 5079 && monster.attackable && Attack.skipCheck(monster)) {
							monList.push(copyUnit(monster));
						}
					} while (monster.getNext());
				}

				return monList.length > 0 && Attack.clearList(monList);
			}

			let pos = [
				{ x: 15097, y: 5054 }, { x: 15085, y: 5053 },
				{ x: 15085, y: 5040 }, { x: 15098, y: 5040 },
				{ x: 15099, y: 5022 }, { x: 15086, y: 5024 }
			];
			return pos.forEach((node) => {
				Pather.moveTo(node.x, node.y);
				Attack.clear(30);
			});
		},

		preattack: function () {
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
		},

		clearWaves: function () {
			Pather.moveTo(15094, me.paladin ? 5029 : 5038);

			let tick = getTickCount();
			let totalTick = getTickCount();

			MainLoop:
			while (true) {
				if (!getUnit(1, 543)) return true;

				switch (this.checkThrone()) {
				case 1:
					Attack.clearClassids(23, 62) && (tick = getTickCount());

					break;
				case 2:
					Attack.clearClassids(105, 381) && (tick = getTickCount());

					break;
				case 3:
					Attack.clearClassids(557) && (tick = getTickCount());
					this.checkHydra() && (tick = getTickCount());

					break;
				case 4:
					Attack.clearClassids(558) && (tick = getTickCount());

					break;
				case 5:
					Attack.clearClassids(571) && (tick = getTickCount());

					break MainLoop;
				default:
					if (getTickCount() - tick < 7e3) {
						if (me.paladin && me.getState(sdk.states.Poison)) {
							Skill.setSkill(sdk.skills.Cleansing, 0);
						}
					}

					if (getTickCount() - tick > 20000) {
						this.clearThrone();
						tick = getTickCount();
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

				// If we've been in the throne for 30 minutes that's way too long
				if (getTickCount() - totalTick > 30 * 60000) {
					return false;
				}

				delay(10);
			}

			this.clearThrone();

			return true;
		}
	},
};
