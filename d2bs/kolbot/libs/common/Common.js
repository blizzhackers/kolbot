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

			for (let i = 0; i < 3; i++) {
				seal.distance > 13 && Attack.getIntoPosition(seal, 13, 0x4);
				Skill.cast(43, 0, seal);

				if (seal.mode) return true;
			}

			if (!seal.mode) {
				Pather.moveTo(seal);
				seal.interact();
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

				let seal = Misc.poll(function () { return getUnit(sdk.unittype.Object, classid); });
				if (!seal) return false;

				if (seal.mode) {
					// for pubbies
					warn && say(Config.Diablo.SealWarning);

					return true;
				}

				// Clear around Infector seal, Any leftover abyss knights casting decrep is bad news with Infector
				if ([392, 393].indexOf(classid) > -1 || i > 1) {
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
};
