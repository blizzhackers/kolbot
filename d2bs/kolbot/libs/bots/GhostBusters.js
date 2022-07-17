/**
*  @filename    GhostBusters.js
*  @author      kolton
*  @desc        who you gonna call?
*
*/

function GhostBusters() {
	this.clearGhosts = function () {
		let room = getRoom();
		if (!room) return false;

		let rooms = [];

		do {
			rooms.push([room.x * 5 + room.xsize / 2, room.y * 5 + room.ysize / 2]);
		} while (room.getNext());

		while (rooms.length > 0) {
			rooms.sort(Sort.points);
			room = rooms.shift();

			let result = Pather.getNearestWalkable(room[0], room[1], 15, 2);

			if (result) {
				Pather.moveTo(result[0], result[1], 3);

				let monList = [];
				let monster = Game.getMonster();

				if (monster) {
					do {
						if (monster.isGhost && monster.distance <= 30 && monster.attackable) {
							monList.push(copyUnit(monster));
						}
					} while (monster.getNext());
				}

				if (!Attack.clearList(monList)) {
					return false;
				}
			}
		}

		return true;
	};

	this.cellar = function () {
		Pather.useWaypoint(sdk.areas.BlackMarsh);
		Precast.doPrecast(true);

		for (let i = sdk.areas.ForgottenTower; i <= sdk.areas.TowerCellarLvl5; i += 1) {
			Pather.moveToExit(i, true) && this.clearGhosts();
		}

		return true;
	};

	this.jail = function () {
		// gonna use inner cloister wp and travel backwards
		Pather.useWaypoint(sdk.areas.InnerCloister);
		Precast.doPrecast(true);

		for (let i = sdk.areas.JailLvl3; i >= sdk.areas.JailLvl1; i -= 1) {
			Pather.moveToExit(i, true) && this.clearGhosts();
		}

		return true;
	};

	this.cathedral = function () {
		Pather.useWaypoint(sdk.areas.InnerCloister);
		Precast.doPrecast(true);
		Pather.moveToExit(sdk.areas.Cathedral, true);
		this.clearGhosts();

		return true;
	};

	this.tombs = function () {
		Pather.useWaypoint(sdk.areas.CanyonofMagic);
		Precast.doPrecast(true);

		for (let i = sdk.areas.TalRashasTomb1; i <= sdk.areas.TalRashasTomb7; i += 1) {
			Pather.moveToExit(i, true) && this.clearGhosts();
			Pather.moveToExit(sdk.areas.CanyonofMagic, true);
		}

		return true;
	};

	this.flayerDungeon = function () {
		let areas = [sdk.areas.FlayerDungeonLvl1, sdk.areas.FlayerDungeonLvl2, sdk.areas.FlayerDungeonLvl3];

		Pather.useWaypoint(sdk.areas.FlayerJungle);
		Precast.doPrecast(true);

		while (areas.length) {
			Pather.moveToExit(areas.shift(), true) && this.clearGhosts();
		}

		return true;
	};

	this.crystalinePassage = function () {
		Pather.useWaypoint(sdk.areas.CrystalizedPassage);
		Precast.doPrecast(true);
		this.clearGhosts();
		Pather.moveToExit(sdk.areas.FrozenRiver, true) && this.clearGhosts();

		return true;
	};

	this.glacialTrail = function () {
		Pather.useWaypoint(sdk.areas.GlacialTrail);
		Precast.doPrecast(true);
		this.clearGhosts();
		Pather.moveToExit(sdk.areas.DrifterCavern, true) && this.clearGhosts();

		return true;
	};

	this.icyCellar = function () {
		Pather.useWaypoint(sdk.areas.AncientsWay);
		Precast.doPrecast(true);
		Pather.moveToExit(sdk.areas.IcyCellar, true) && this.clearGhosts();

		return true;
	};

	let sequence = ["cellar", "jail", "cathedral", "tombs", "flayerDungeon", "crystalinePassage", "glacialTrail", "icyCellar"];

	for (let i = 0; i < sequence.length; i += 1) {
		Town.doChores();

		try {
			this[sequence[i]]();
		} finally {
			Town.goToTown();
		}
	}

	return true;
}
