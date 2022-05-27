/**
*  @filename    DiabloHelper.js
*  @author      kolton
*  @desc        help leading player in clearing Chaos Sanctuary and killing Diablo
*
*/

function DiabloHelper() {
	// general functions
	this.getBoss = function (name) {
		let glow;

		while (true) {
			if (!this.preattack(name)) {
				delay(500);
			}

			glow = getUnit(2, 131);

			if (glow) {
				break;
			}
		}

		for (let i = 0; i < 16; i += 1) {
			let boss = getUnit(1, name);

			if (boss) {
				return Attack.clear(40, 0, name, Common.Diablo.sort);
			}

			delay(250);
		}

		return !!glow;
	};

	this.vizierSeal = function () {
		this.followPath(Common.Diablo.vizLayout === 1 ? this.starToVizA : this.starToVizB, Common.Diablo.sort);

		if (Config.DiabloHelper.OpenSeals) {
			if (!Common.Diablo.openSeal(395) || !Common.Diablo.openSeal(396)) throw new Error("Failed to open Vizier seals.");
		}

		Common.Diablo.vizLayout === 1 ? Pather.moveTo(7691, 5292) : Pather.moveTo(7695, 5316);

		if (!this.getBoss(getLocaleString(2851))) throw new Error("Failed to kill Vizier");

		Config.FieldID.Enabled && Town.fieldID();

		return true;
	};

	this.seisSeal = function () {
		this.followPath(Common.Diablo.seisLayout === 1 ? this.starToSeisA : this.starToSeisB, Common.Diablo.sort);

		if (Config.DiabloHelper.OpenSeals) {
			if (!Common.Diablo.openSeal(394)) throw new Error("Failed to open de Seis seal.");
		}

		Common.Diablo.seisLayout === 1 ? Pather.moveTo(7771, 5196) : Pather.moveTo(7798, 5186);

		if (!this.getBoss(getLocaleString(2852))) throw new Error("Failed to kill de Seis");

		Config.FieldID.Enabled && Town.fieldID();

		return true;
	};

	this.infectorSeal = function () {
		Precast.doPrecast(true);
		this.followPath(Common.Diablo.infLayout === 1 ? this.starToInfA : this.starToInfB, Common.Diablo.sort);

		if (Config.DiabloHelper.OpenSeals) {
			if (!Common.Diablo.openSeal(392)) throw new Error("Failed to open Infector seals.");
		}

		if (Common.Diablo.infLayout === 1) {
			if (me.sorceress || me.assassin) {
				Pather.moveTo(7876, 5296);
			}

			delay(1 + me.ping);
		} else {
			delay(1 + me.ping);
			Pather.moveTo(7928, 5295);
		}

		if (!this.getBoss(getLocaleString(2853))) throw new Error("Failed to kill Infector");

		if (Config.DiabloHelper.OpenSeals) {
			if (!Common.Diablo.openSeal(393)) throw new Error("Failed to open Infector seals.");
		}

		Config.FieldID.Enabled && Town.fieldID();

		return true;
	};

	const clearSeals = () => {
		print("seal order: " + Config.DiabloHelper.SealOrder);
		let seals = {
			1: () => this.vizierSeal(),
			2: () => this.seisSeal(),
			3: () => this.infectorSeal(),
			"vizier": () => this.vizierSeal(),
			"seis": () => this.seisSeal(),
			"infector": () => this.infectorSeal(),
		};
		Config.DiabloHelper.SealOrder.forEach(seal => {seals[seal]();});
	};

	this.preattack = function (id) {
		let trapCheck,
			coords = [];

		switch (id) {
		case getLocaleString(2851):
			coords = Common.Diablo.vizLayout === 1 ? [7676, 5295] : [7684, 5318];

			break;
		case getLocaleString(2852):
			coords = Common.Diablo.seisLayout === 1 ? [7778, 5216] : [7775, 5208];

			break;
		case getLocaleString(2853):
			coords = Common.Diablo.infLayout === 1 ? [7913, 5292] : [7915, 5280];

			break;
		}

		switch (me.classid) {
		case 1:
			if ([56, 59, 64].indexOf(Config.AttackSkill[1]) > -1) {
				if (me.getState(121)) {
					delay(500);
				} else {
					Skill.cast(Config.AttackSkill[1], 0, coords[0], coords[1]);
				}

				return true;
			}

			break;
		case 3:
			break;
		case 6:
			if (Config.UseTraps) {
				trapCheck = ClassAttack.checkTraps({x: coords[0], y: coords[1]});

				if (trapCheck) {
					ClassAttack.placeTraps({x: coords[0], y: coords[1]}, 5);

					return true;
				}
			}

			break;
		}

		return false;
	};

	this.followPath = function (path) {
		for (let i = 0; i < path.length; i += 2) {
			this.cleared.length && this.clearStrays();
			
			// no monsters at the next node, skip it
			if ([path[i], path[i + 1]].distance < 40 && [path[i], path[i + 1]].mobCount({range: 35}) === 0) {
				continue;
			}

			Pather.moveTo(path[i], path[i + 1], 3, getDistance(me, path[i], path[i + 1]) > 50);
			Attack.clear(30, 0, false, Common.Diablo.sort);

			// Push cleared positions so they can be checked for strays
			this.cleared.push([path[i], path[i + 1]]);

			// After 5 nodes go back 2 nodes to check for monsters
			if (i === 10 && path.length > 16) {
				path = path.slice(6);
				i = 0;
			}
		}
	};

	this.clearStrays = function () {
		let oldPos = {x: me.x, y: me.y},
			monster = getUnit(1);

		if (monster) {
			do {
				if (monster.attackable) {
					for (let i = 0; i < this.cleared.length; i += 1) {
						if (getDistance(monster, this.cleared[i][0], this.cleared[i][1]) < 30 && Attack.validSpot(monster.x, monster.y)) {
							me.overhead("we got a stray");
							Pather.moveToUnit(monster);
							Attack.clear(15, 0, false, Common.Diablo.sort);

							break;
						}
					}
				}
			} while (monster.getNext());
		}

		getDistance(me, oldPos.x, oldPos.y) > 5 && Pather.moveTo(oldPos.x, oldPos.y);

		return true;
	};

	this.cleared = [];

	// path coordinates
	this.entranceToStar = [7794, 5517, 7791, 5491, 7768, 5459, 7775, 5424, 7817, 5458, 7777, 5408, 7769, 5379, 7777, 5357, 7809, 5359, 7805, 5330, 7780, 5317, 7774, 5305];
	this.starToVizA = [7759, 5295, 7734, 5295, 7716, 5295, 7718, 5276, 7697, 5292, 7678, 5293, 7665, 5276, 7662, 5314];
	this.starToVizB = [7759, 5295, 7734, 5295, 7716, 5295, 7701, 5315, 7666, 5313, 7653, 5284];
	this.starToSeisA = [7781, 5259, 7805, 5258, 7802, 5237, 7776, 5228, 7775, 5205, 7804, 5193, 7814, 5169, 7788, 5153];
	this.starToSeisB = [7781, 5259, 7805, 5258, 7802, 5237, 7776, 5228, 7811, 5218, 7807, 5194, 7779, 5193, 7774, 5160, 7803, 5154];
	this.starToInfA = [7809, 5268, 7834, 5306, 7852, 5280, 7852, 5310, 7869, 5294, 7895, 5295, 7919, 5290];
	this.starToInfB = [7809, 5268, 7834, 5306, 7852, 5280, 7852, 5310, 7869, 5294, 7895, 5274, 7927, 5275, 7932, 5297, 7923, 5313];

	let i, party;

	// start
	Town.doChores();

	// change this to run in background?
	if (Config.DiabloHelper.SkipIfBaal) {
		AreaInfoLoop:
		while (true) {
			me.overhead("Getting party area info");

			if (Misc.getPlayerCount() <= 1) {
				throw new Error("Empty game");
			}

			party = getParty();

			if (party) {
				do {
					if (party.name !== me.name && party.area) {
						// Can read player area
						break AreaInfoLoop;
					}
				} while (party.getNext());
			}

			delay(1000);
		}

		party = getParty();

		if (party) {
			do {
				// Player is in Throne of Destruction or Worldstone Chamber
				if (party.area === 131 || party.area === 132) {
					return false; // End script
				}
			} while (party.getNext());
		}
	}
	Config.DiabloHelper.SafePrecast && Precast.needOutOfTownCast() ? Precast.doRandomPrecast(true, sdk.areas.PandemoniumFortress) : Precast.doPrecast(true);

	if (Config.DiabloHelper.SkipTP) {
		me.area !== sdk.areas.RiverofFlame && Pather.useWaypoint(sdk.areas.RiverofFlame);

		if (!Pather.moveTo(7790, 5544)) {
			throw new Error("Failed to move to Chaos Sanctuary");
		}

		if (!Config.DiabloHelper.Entrance) {
			Pather.moveTo(7774, 5305);
		}

		CSLoop:
		for (i = 0; i < Config.DiabloHelper.Wait; i += 1) {
			party = getParty();

			if (party) {
				do {
					if (party.name !== me.name && party.area === 108 && (!Config.Leader || party.name === Config.Leader)) {
						break CSLoop;
					}
				} while (party.getNext());
			}

			Attack.clear(30, 0, false, Common.Diablo.sort);
			delay(1000);
		}

		if (i === Config.DiabloHelper.Wait) {
			throw new Error("Player wait timed out (" + (Config.Leader ? "Leader not" : "No players") + " found in Chaos)");
		}
	} else {
		Pather.useWaypoint(103);
		Town.move("portalspot");

		for (i = 0; i < Config.DiabloHelper.Wait; i += 1) {
			if (Pather.getPortal(108, Config.Leader || null) && Pather.usePortal(108, Config.Leader || null)) {
				break;
			}

			delay(1000);
		}

		if (i === Config.DiabloHelper.Wait) {
			throw new Error("Player wait timed out (" + (Config.Leader ? "No leader" : "No player") + " portals found)");
		}
	}

	Common.Diablo.initLayout();

	if (Config.DiabloHelper.Entrance) {
		Attack.clear(35, 0, false, Common.Diablo.sort);
		this.followPath(this.entranceToStar);
	} else {
		Pather.moveTo(7774, 5305);
		Attack.clear(35, 0, false, Common.Diablo.sort);
	}

	Pather.moveTo(7774, 5305);
	Attack.clear(35, 0, false, Common.Diablo.sort);
	clearSeals();

	try {
		print("Attempting to find Diablo");
		Common.Diablo.diabloPrep();
	} catch (error) {
		print("Diablo wasn't found");
		if (Config.DiabloHelper.RecheckSeals) {
			print("Rechecking seals");
			clearSeals();
			Common.Diablo.diabloPrep();
		}
	}

	Attack.kill(243); // Diablo
	Pickit.pickItems();

	return true;
}
