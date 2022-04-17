/**
*	@filename	Wakka.js
*	@author		kolton
*	@desc		walking Chaos Sanctuary leecher
*/

function Wakka() {
	let safeTP, portal, vizClear, seisClear, infClear, tick, timeout = Config.Wakka.Wait,
		minDist = 50,
		maxDist = 80,
		leaderUnit = null,
		leaderPartyUnit = null,
		leader = "";

	this.checkMonsters = function (range, dodge) {
		let monList = [],
			monster = getUnit(1);

		if (monster) {
			do {
				if (monster.y < 5565 && Attack.checkMonster(monster) && getDistance(me, monster) <= range) {
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

	this.getLayout = function (seal, value) {
		let sealPreset = getPresetUnit(108, 2, seal);

		if (!seal) { throw new Error("Seal preset not found. Can't continue."); }

		switch (seal) {
		case 396:
			if (sealPreset.roomy * 5 + sealPreset.y === value) {
				return 1;
			}

			break;
		case 394:
		case 392:
			if (sealPreset.roomx * 5 + sealPreset.x === value) {
				return 1;
			}

			break;
		}

		return 2;
	};

	this.getCoords = function () {
		this.vizCoords = this.getLayout(396, 5275) === 1 ? [7707, 5274] : [7708, 5298];
		this.seisCoords = this.getLayout(394, 7773) === 1 ? [7812, 5223] : [7809, 5193];
		this.infCoords = this.getLayout(392, 7893) === 1 ? [7868, 5294] : [7882, 5306];
	};

	this.checkBoss = function (name) {
		let glow = getUnit(2, 131);

		if (glow) {
			for (let i = 0; i < 10; i += 1) {
				if (me.charlvl >= Config.Wakka.StopAtLevel) {
					Config.Wakka.StopProfile && D2Bot.stop();
					return true;
				}

				if (Config.Wakka.SkipIfBaal && this.getLeaderUnitArea() === sdk.areas.ThroneofDestruction) return true;

				let boss = getUnit(1, name);

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

		if (!path) { throw new Error("Failed go get path"); }

		while (path.length > 0) {
			if (me.charlvl >= Config.Wakka.StopAtLevel) {
				Config.Wakka.StopProfile && D2Bot.stop();
				return true;
			}

			if (Config.Wakka.SkipIfBaal && this.getLeaderUnitArea() === sdk.areas.ThroneofDestruction) return true;
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
			getUnits(1).filter(mon => mon.distance <= 10 && mon.attackable).length === 0 && Pickit.pickItems(5);
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

	// start
	Town.goToTown(4);
	Town.move("portalspot");

	if (Config.Leader) {
		leader = Config.Leader;
		if (!Misc.poll(() => Misc.inMyParty(leader), 30e3, 1000)) throw new Error("Wakka: Leader not partied");
	}

	!leader && (leader = Misc.autoLeaderDetect({destination: 108, quitIf: (area) => [sdk.areas.ThroneofDestruction, sdk.areas.WorldstoneChamber].includes(area), timeout: timeout * 60e3}));
	Town.doChores();

	if (leader) {
		while (Misc.inMyParty(leader)) {
			if (me.charlvl >= Config.Wakka.StopAtLevel) {
				Config.Wakka.StopProfile && D2Bot.stop();
				return true;
			}

			if (Config.Wakka.SkipIfBaal && [sdk.areas.ThroneofDestruction, sdk.areas.WorldstoneChamber].includes(this.getLeaderUnitArea())) return true;

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
		}
	} else {
		throw new Error("No leader found");
	}

	return true;
}
