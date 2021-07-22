/*
*	@filename	Diablo.js
*	@author		isid0re
*	@desc		customized Diablo script
*/

function diablo () {
	this.getLayout = function (seal, value) {// Start Diablo Quest
		let sealPreset = getPresetUnit(108, 2, seal);

		if (!seal) {
			print("ÿc9SoloLevelingÿc0: Seal preset not found");
		}

		if (sealPreset.roomy * 5 + sealPreset.y === value || sealPreset.roomx * 5 + sealPreset.x === value) {
			return 1;
		}

		return 2;
	};

	this.initLayout = function () {
		this.vizLayout = this.getLayout(396, 5275);
		this.seisLayout = this.getLayout(394, 7773);
		this.infLayout = this.getLayout(392, 7893);
	};

	this.getBoss = function (name) {
		let glow = getUnit(2, 131);

		for (let bossbeating = 0; bossbeating < 24; bossbeating += 1) {
			let boss = getUnit(1, name);

			if (boss) {
				this.chaosPreattack(name, 8);

				try {
					if (boss && boss.hp > 0) {
						Attack.killTarget(name);
					}
				} catch (e) {
					Attack.clear(10, 0, name);
				}

				Pickit.pickItems();

				return true;
			}

			delay(250 + me.ping);
		}

		return !!glow;
	};

	this.chaosPreattack = function (name, amount) {
		let target, position;

		switch (me.classid) {
		case 0:
			break;
		case 1:
			break;
		case 2:
			break;
		case 3:
			target = getUnit(1, name);

			if (!target) {
				return;
			}

			position = [[6, 11], [0, 8], [8, -1], [-9, 2], [0, -11], [8, -8]];

			for (let attackspot = 0; attackspot < position.length; attackspot += 1) {
				if (Attack.validSpot(target.x + position[attackspot][0], target.y + position[attackspot][1])) { // check if we can move there
					Pather.moveTo(target.x + position[attackspot][0], target.y + position[attackspot][1]);
					Skill.setSkill(Config.AttackSkill[2], 0);

					for (let n = 0; n < amount; n += 1) {
						Skill.cast(Config.AttackSkill[1], 1);
					}

					break;
				}
			}

			break;
		case 4:
			break;
		case 5:
			break;
		case 6:
			break;
		}
	};

	this.diabloPrep = function () {
		let tick = getTickCount(), decoyDuration = (10 + me.getSkill(28, 1) * 5) * 1000;

		while (getTickCount() - tick < 17500) {
			if (getTickCount() - tick >= 8000) {
				switch (me.classid) {
				case 0: //Amazon
					if (me.getSkill(28, 1)) {
						let decoy = getUnit(1, 356);

						if (!decoy || (getTickCount() - tick >= decoyDuration)) {
							Skill.cast(28, 0, 7793, 5293);
						}
					}

					break;
				case 1: // Sorceress
					if ([56, 59, 64].indexOf(Config.AttackSkill[1]) > -1) {
						if (me.getState(121)) {
							delay(500 + me.ping);
						} else {
							Skill.cast(Config.AttackSkill[1], 0, 7793, 5293);
						}

						break;
					}

					delay(500 + me.ping);

					break;
				case 3: // Paladin
					Skill.setSkill(Config.AttackSkill[2]);
					Skill.cast(Config.AttackSkill[1], 1);

					break;
				case 5: // Druid
					if (Config.AttackSkill[1] === 245) {
						Skill.cast(Config.AttackSkill[1], 0, 7793, 5293);

						break;
					}

					delay(500 + me.ping);

					break;
				case 6: // Assassin
					if (Config.UseTraps) {
						let check = ClassAttack.checkTraps({x: 7793, y: 5293});

						if (check) {
							ClassAttack.placeTraps({x: 7793, y: 5293, classid: 243}, check);

							break;
						}
					}

					delay(500 + me.ping);

					break;
				default:
					delay(500 + me.ping);
				}
			} else {
				delay(500 + me.ping);
			}

			if (getUnit(1, 243)) {
				return true;
			}
		}

		return false;
	};

	this.openSeal = function (classid) {
		for (let sealspot = 0; sealspot < 5; sealspot += 1) {
			Pather.moveToPreset(108, 2, classid, classid === 394 ? 5 : 2, classid === 394 ? 5 : 0);

			if (sealspot > 1) {
				Attack.clear(15);
			}

			let seal = getUnit(2, classid);

			for (let z = 0; z < 3; z += 1) {

				if (seal) {
					break;
				}

				Packet.flash(me.gid);
				delay(100 + me.ping);
			}

			if (!seal) {
				print("ÿc9SoloLevelingÿc0: Seal not found. Attempting portal trick");
				Town.goToTown();
				delay(25);
				Pather.usePortal(null, me.name);

				for (let a = 0; a < 3; a += 1) {

					if (seal) {
						break;
					}

					Packet.flash(me.gid);
					delay(100 + me.ping);
				}

				if (!seal) {
					print("ÿc9SoloLevelingÿc0: Seal not found (id " + classid + ")");
					D2Bot.printToConsole("SoloLeveling: Seal not found (id " + classid + ")");
				}
			}

			if (seal === undefined || seal.mode) {
				return true;
			}

			if (classid === 394) {
				Misc.click(0, 0, seal);
			} else {
				seal.interact();
			}

			delay(classid === 394 ? 1000 + me.ping : 500 + me.ping);

			if (!seal.mode) {
				if (classid === 394 && Attack.validSpot(seal.x + 15, seal.y)) { // de seis optimization
					Pather.moveTo(seal.x + 15, seal.y);
				} else {
					Pather.moveTo(seal.x - 5, seal.y - 5);
				}

				delay(500 + me.ping);
			} else {
				return true;
			}
		}

		print("ÿc9SoloLevelingÿc0: Failed to open seal (id " + classid + ")");

		return true;
	};

	this.vizier = function () {
		this.openSeal(395);
		this.openSeal(396);

		if (this.vizLayout === 1) {
			Pather.moveTo(7691, 5292, 3, 30);
		} else {
			Pather.moveTo(7695, 5316, 3, 30);
		}

		if (!this.getBoss(getLocaleString(2851))) {
			print("ÿc9SoloLevelingÿc0: Failed Vizier");
		}
	};

	this.seis = function () {
		this.openSeal(394);

		if (this.seisLayout === 1) {
			// Pather.moveTo(7771, 5196);
			Pather.moveTo(7798, 5194, 3, 30); // safe location
		} else {
			// Pather.moveTo(7798, 5186);
			Pather.moveTo(7796, 5155, 3, 30); // safe location
		}

		if (!this.getBoss(getLocaleString(2852))) {
			print("ÿc9SoloLevelingÿc0: Failed Seis");
		}
	};

	this.infector = function () {
		this.openSeal(393);
		this.openSeal(392);

		if (this.infLayout === 1) {
			delay(1 + me.ping);
		} else {
			Pather.moveTo(7928, 5295, 3, 30); // temp
		}

		if (!this.getBoss(getLocaleString(2853))) {
			print("ÿc9SoloLevelingÿc0: Failed Infector");
		}
	};

	Town.townTasks();
	print('ÿc9SoloLevelingÿc0: starting diablo');
	me.overhead("diablo");

	if (!Pather.checkWP(107)) {
		Pather.getWP(107);
	} else {
		Pather.useWaypoint(107);
	}

	Precast.doPrecast(true);
	Pather.moveToExit(108, true);
	this.initLayout();
	this.vizier();
	this.seis();
	this.infector();
	Config.MercWatch = false;
	Pather.moveTo(7788, 5292, 3, 30);
	this.diabloPrep();
	let theD = getUnit(1, 243);

	if (!theD) {
		print("ÿc9SoloLevelingÿc0: Diablo not found. Checking seal bosses.");
		this.infector();
		this.seis();
		this.vizier();
		Pather.moveTo(7788, 5292, 3, 30);
		this.diabloPrep();
	}

	Attack.killTarget(243); //diablo
	Pickit.pickItems();

	if (me.classic) {
		return true;
	}

	try {
		Pather.changeAct();
	} catch (err) {
		Town.npcInteract("tyrael");
		me.cancel();
		delay(500 + me.ping);
		Pather.useUnit(2, 566, 109);
	}

	Config.MercWatch = true;

	return true;
}
