/**
*  @filename    Wakka.js
*  @author      kolton, theBGuy
*  @desc        walking Chaos Sanctuary leecher
*
*/

function Wakka() {
	let safeTP, portal, vizClear, seisClear, infClear, tick, timeout = Config.Wakka.Wait;
	let minDist = 50;
	let maxDist = 80;
	let leaderUnit = null;
	let leaderPartyUnit = null;
	let leader = "";

	this.checkMonsters = function (range, dodge) {
		let monList = [];
		let monster = getUnit(sdk.unittype.Monster);

		if (monster) {
			do {
				if (monster.y < 5565 && monster.attackable && getDistance(me, monster) <= range) {
					if (!dodge) return true;
					monList.push(copyUnit(monster));
				}
			} while (monster.getNext());
		}

		if (!monList.length) return false;

		monList.sort(Sort.units);

		if (getDistance(me, monList[0]) < 25 && !checkCollision(me, monList[0], 0x4)) {
			Attack.deploy(monList[0], 25, 5, 15);
		}

		return true;
	};

	this.coordsInit = false;

	this.getCoords = function () {
		if (!this.coordsInit) {
			Common.Diablo.initLayout();
			this.vizCoords = Common.Diablo.vizLayout === 1 ? [7707, 5274] : [7708, 5298];
			this.seisCoords = Common.Diablo.seisLayout === 1 ? [7812, 5223] : [7809, 5193];
			this.infCoords = Common.Diablo.infLayout === 1 ? [7868, 5294] : [7882, 5306];
			this.coordsInit = true;
		}
	};

	this.checkBoss = function (name) {
		let glow = Game.getObject(sdk.units.SealGlow);

		if (glow) {
			for (let i = 0; i < 10; i += 1) {
				let boss = Game.getMonster(name);

				if (boss && boss.mode === 12) {
					return true;
				}

				delay(500);
			}

			return true;
		}

		return false;
	};

	this.getCorpse = function () {
		me.dead && me.revive();

		let rval = false;
		let corpse = getUnit(0, me.name, 17);

		if (corpse) {
			do {
				if (getDistance(me, corpse) <= 15) {
					Pather.moveToUnit(corpse);
					corpse.interact();
					delay(500);

					rval = true;
				}
			} while (corpse.getNext());
		}

		return rval;
	};

	this.followPath = function (dest) {
		let path = getPath(me.area, me.x, me.y, dest[0], dest[1], 0, 10);

		if (!path) throw new Error("Failed go get path");

		while (path.length > 0) {
			if (me.mode === 17 || me.inTown) return false;
			!leaderUnit || !copyUnit(leaderUnit).x && (leaderUnit = getUnit(0, leader));

			if (leaderUnit) {
				// monsters nearby - don't move
				if (this.checkMonsters(45, true) && getDistance(me, leaderUnit) <= maxDist) {
					path = getPath(me.area, me.x, me.y, dest[0], dest[1], 0, 15);
					delay(200);

					continue;
				}

				// leader within minDist range - don't move
				if (getDistance(me, leaderUnit) <= minDist) {
					delay(200);

					continue;
				}
			} else {
				// leaderUnit out of getUnit range but leader is still within reasonable distance - check party unit's coords!
				leaderPartyUnit = getParty(leader);

				if (leaderPartyUnit) {
					// leader went to town - don't move
					if (leaderPartyUnit.area !== me.area) {
						delay(200);

						continue;
					}

					// if there's monsters between the leecher and leader, wait until monsters are dead or leader is out of maxDist range
					if (this.checkMonsters(45, true) && getDistance(me, leaderPartyUnit.x, leaderPartyUnit.y) <= maxDist) {
						path = getPath(me.area, me.x, me.y, dest[0], dest[1], 0, 15);

						delay(200);

						continue;
					}
				}
			}

			Pather.moveTo(path[0].x, path[0].y) && path.shift();
			// no mobs around us, so it's safe to pick
			!me.checkForMobs({range: 10, coll: (0x1 | 0x400 | 0x800)}) && Pickit.pickItems(5);
			this.getCorpse();
		}

		return true;
	};

	this.getLeaderUnitArea = function () {
		if (!leaderUnit || !copyUnit(leaderUnit).x) {
			leaderUnit = getUnit(0, leader);
		}

		return !!leaderUnit ? leaderUnit.area : getParty(leader).area;
	};

	// START
	Town.goToTown(4);
	Town.move("portalspot");

	if (Config.Leader) {
		leader = Config.Leader;
		if (!Misc.poll(() => Misc.inMyParty(leader), 30e3, 1000)) throw new Error("Wakka: Leader not partied");
	}

	!leader && (leader = Misc.autoLeaderDetect({destination: 108, quitIf: (area) => [sdk.areas.ThroneofDestruction, sdk.areas.WorldstoneChamber].includes(area), timeout: timeout * 60e3}));
	Town.doChores();

	if (leader) {
		const Worker = require('../modules/Worker');

		if (Config.Wakka.SkipIfBaal) {
			let leadTick = getTickCount();
			let killLeaderTracker = false;

			Worker.runInBackground.leaderTracker = function () {
				if (Common.Diablo.done || killLeaderTracker) return false;
				// check every 3 seconds
				if (getTickCount() - leadTick < 3000) return true;
				leadTick = getTickCount();

				// check again in another 3 seconds if game wasn't ready
				if (!me.gameReady) return true;
				if (Misc.getPlayerCount() <= 1) throw new Error("Empty game");

				// Player is in Throne of Destruction or Worldstone Chamber
				if ([sdk.areas.ThroneofDestruction, sdk.areas.WorldstoneChamber].includes(this.getLeaderUnitArea())) {
					if (Loader.scriptName() === "Wakka") {
						killLeaderTracker = true;
						throw new Error('Party leader is running baal');
					} else {
						// kill process
						return false;
					}
				}

				return true;
			};
		}

		let levelTick = getTickCount();
		let killLevelTracker = false;

		Worker.runInBackground.levelTracker = function () {
			if (Common.Diablo.done || killLevelTracker) return false;
			// check every 3 seconds
			if (getTickCount() - levelTick < 3000) return true;
			levelTick = getTickCount();

			// check again in another 3 seconds if game wasn't ready
			if (!me.gameReady) return true;

			if (me.charlvl >= Config.Wakka.StopAtLevel) {
				Config.Wakka.StopProfile && D2Bot.stop();

				if (Loader.scriptName() === "Wakka") {
					killLevelTracker = true;
					throw new Error('Reached wanted level');
				} else {
					// kill process
					return false;
				}
			}

			return true;
		};

		while (Misc.inMyParty(leader)) {
			try {
				switch (me.area) {
				case sdk.areas.PandemoniumFortress:
					portal = Pather.getPortal(sdk.areas.ChaosSanctuary, null);

					if (portal) {
						!safeTP && delay(5000);
						Pather.usePortal(sdk.areas.ChaosSanctuary, null);
						Precast.doPrecast(true);
					}

					break;
				case sdk.areas.ChaosSanctuary:
					if (!safeTP) {
						if (this.checkMonsters(25, false)) {
							me.overhead("hot tp");
							Pather.usePortal(sdk.areas.PandemoniumFortress, null);
							this.getCorpse();

							break;
						} else {
							this.getCoords();

							safeTP = true;
						}
					}

					if (!vizClear) {
						if (!this.followPath(this.vizCoords)) {
							break;
						}

						if (tick && getTickCount() - tick >= 5000) {
							vizClear = true;
							tick = false;

							break;
						}

						if (this.checkBoss(getLocaleString(2851))) {
							!tick && (tick = getTickCount());
							me.overhead("vizier dead");
							Precast.doPrecast(true);
						}

						break;
					}

					if (!seisClear) {
						if (!this.followPath(this.seisCoords)) {
							break;
						}

						if (tick && getTickCount() - tick >= 7000) {
							seisClear = true;
							tick = false;

							break;
						}
						

						if (this.checkBoss(getLocaleString(2852))) {
							!tick && (tick = getTickCount());
							me.overhead("seis dead");
							Precast.doPrecast(true);
						}

						break;
					}

					if (!infClear) {
						if (!this.followPath(this.infCoords)) {
							break;
						}

						if (tick && getTickCount() - tick >= 2000) {
							infClear = true;
							tick = false;

							break;
						}

						if (this.checkBoss(getLocaleString(2853))) {
							!tick && (tick = getTickCount());
							me.overhead("infector dead");
							Precast.doPrecast(true);
						}

						break;
					}

					Pather.moveTo(7767, 5263);

					let diablo = getUnit(1, 243);

					if (diablo && (diablo.mode === 0 || diablo.mode === 12)) {
						return true;
					}

					break;
				}

				me.dead && me.revive();

				delay(200);
			} catch (e) {
				console.errorReport(e);

				return true;
			}
		}
	} else {
		throw new Error("No leader found");
	}

	return true;
}
