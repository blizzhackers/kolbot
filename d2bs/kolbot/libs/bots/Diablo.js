/**
*  @filename    Diablo.js
*  @author      kolton, theBGuy
*  @desc        clear Chaos Sanctuary and kill Diablo
*
*/

function Diablo() {
	this.cleared = [];

	// path coordinates
	this.entranceToStar = [7794, 5517, 7791, 5491, 7768, 5459, 7775, 5424, 7817, 5458, 7777, 5408, 7769, 5379, 7777, 5357, 7809, 5359, 7805, 5330, 7780, 5317, 7791, 5293];
	this.starToVizA = [7759, 5295, 7734, 5295, 7716, 5295, 7718, 5276, 7697, 5292, 7678, 5293, 7665, 5276, 7662, 5314];
	this.starToVizB = [7759, 5295, 7734, 5295, 7716, 5295, 7701, 5315, 7666, 5313, 7653, 5284];
	this.starToSeisA = [7781, 5259, 7805, 5258, 7802, 5237, 7776, 5228, 7775, 5205, 7804, 5193, 7814, 5169, 7788, 5153];
	this.starToSeisB = [7781, 5259, 7805, 5258, 7802, 5237, 7776, 5228, 7811, 5218, 7807, 5194, 7779, 5193, 7774, 5160, 7803, 5154];
	this.starToInfA = [7809, 5268, 7834, 5306, 7852, 5280, 7852, 5310, 7869, 5294, 7895, 5295, 7919, 5290];
	this.starToInfB = [7809, 5268, 7834, 5306, 7852, 5280, 7852, 5310, 7869, 5294, 7895, 5274, 7927, 5275, 7932, 5297, 7923, 5313];
	Pather._teleport = Pather.teleport;
	
	// general functions
	this.vizierSeal = function () {
		print("Viz layout " + Common.Diablo.vizLayout);
		this.followPath(Common.Diablo.vizLayout === 1 ? this.starToVizA : this.starToVizB);

		if (!Common.Diablo.openSeal(sdk.units.DiabloSealVizier2) || !Common.Diablo.openSeal(sdk.units.DiabloSealVizier)) {
			throw new Error("Failed to open Vizier seals.");
		}

		delay(1 + me.ping);
		Common.Diablo.vizLayout === 1 ? Pather.moveTo(7691, 5292) : Pather.moveTo(7695, 5316);

		if (!Common.Diablo.getBoss(getLocaleString(sdk.locale.monsters.GrandVizierofChaos))) {
			throw new Error("Failed to kill Vizier");
		}

		return true;
	};

	this.seisSeal = function () {
		print("Seis layout " + Common.Diablo.seisLayout);
		this.followPath(Common.Diablo.seisLayout === 1 ? this.starToSeisA : this.starToSeisB);

		if (!Common.Diablo.openSeal(sdk.units.DiabloSealSeis)) throw new Error("Failed to open de Seis seal.");

		Common.Diablo.seisLayout === 1 ? Pather.moveTo(7798, 5194) : Pather.moveTo(7796, 5155);

		if (!Common.Diablo.getBoss(getLocaleString(sdk.locale.monsters.LordDeSeis))) throw new Error("Failed to kill de Seis");

		return true;
	};

	this.infectorSeal = function () {
		Precast.doPrecast(true);
		print("Inf layout " + Common.Diablo.infLayout);
		this.followPath(Common.Diablo.infLayout === 1 ? this.starToInfA : this.starToInfB);

		if (!Common.Diablo.openSeal(sdk.units.DiabloSealInfector)) throw new Error("Failed to open Infector seals.");

		if (Common.Diablo.infLayout === 1) {
			if (me.sorceress || me.assassin) {
				Pather.moveTo(7876, 5296);
			}

			delay(1 + me.ping);
		} else {
			delay(1 + me.ping);
			Pather.moveTo(7928, 5295);
		}

		if (!Common.Diablo.getBoss(getLocaleString(sdk.locale.monsters.InfectorofSouls))) throw new Error("Failed to kill Infector");
		if (!Common.Diablo.openSeal(sdk.units.DiabloSealInfector2)) throw new Error("Failed to open Infector seals.");

		return true;
	};

	const openSeals = () => {
		print("seal order: " + Config.Diablo.SealOrder);
		let seals = {
			1: () => this.vizierSeal(),
			2: () => this.seisSeal(),
			3: () => this.infectorSeal(),
			"vizier": () => this.vizierSeal(),
			"seis": () => this.seisSeal(),
			"infector": () => this.infectorSeal(),
		};
		Config.Diablo.SealOrder.forEach(seal => {seals[seal]();});
	};

	this.followPath = function (path) {
		for (let i = 0; i < path.length; i += 2) {
			this.cleared.length > 0 && this.clearStrays();

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

	this.defendPlayers = function () {
		let oldPos = {x: me.x, y: me.y},
			monster = getUnit(1);

		if (monster) {
			do {
				if (monster.attackable) {
					let player = getUnit(0);

					if (player) {
						do {
							if (player.name !== me.name && Misc.inMyParty(player.name) && getDistance(monster, player) < 30) {
								Pather.moveToUnit(monster);
								Attack.clear(15, 0, false, Common.Diablo.sort);
							}
						} while (player.getNext());
					}
				}
			} while (monster.getNext());
		}

		getDistance(me, oldPos.x, oldPos.y) > 5 && Pather.moveTo(oldPos.x, oldPos.y);

		return true;
	};

	// start
	Town.doChores();
	!!Config.RandomPrecast ? Precast.doRandomPrecast(true, sdk.areas.RiverofFlame) : Pather.useWaypoint(sdk.areas.RiverofFlame) && Precast.doPrecast(true);
	me.area !== sdk.areas.RiverofFlame && Pather.useWaypoint(sdk.areas.RiverofFlame);

	if (!Pather.moveToExit(sdk.areas.ChaosSanctuary, true) && !Pather.moveTo(7790, 5544)) throw new Error("Failed to move to Chaos Sanctuary");

	Common.Diablo.initLayout();

	if (Config.Diablo.Entrance) {
		Attack.clear(30, 0, false, Common.Diablo.sort);
		Pather.moveTo(7790, 5544);

		if (Config.PublicMode) {
			Pather.makePortal();
			say(Config.Diablo.EntranceTP);
			Pather.teleport = !Config.Diablo.WalkClear && Pather._teleport;
		}

		Pather.moveTo(7790, 5544);
		Precast.doPrecast(true);
		Attack.clear(30, 0, false, Common.Diablo.sort);
		this.followPath(this.entranceToStar);
	} else {
		Pather.moveTo(7774, 5305);
		Attack.clear(15, 0, false, Common.Diablo.sort);
	}

	Pather.moveTo(7791, 5293);

	if (Config.PublicMode) {
		Pather.makePortal();
		say(Config.Diablo.StarTP);
		Pather.teleport = !Config.Diablo.WalkClear && Pather._teleport;
	}

	Attack.clear(30, 0, false, Common.Diablo.sort);

	try {
		openSeals();
		// maybe instead of throwing error if we fail to open seal, add it to an array to re-check before diabloPrep then if that fails throw and error
		Config.PublicMode && say(Config.Diablo.DiabloMsg);
		print("Attempting to find Diablo");
		Common.Diablo.diabloPrep();
	} catch (error) {
		print("Diablo wasn't found. Checking seals.");
		openSeals();
		Common.Diablo.diabloPrep();
	}

	Attack.kill(243); // Diablo
	Pickit.pickItems();

	Pather.teleport = Pather._teleport;

	return true;
}
