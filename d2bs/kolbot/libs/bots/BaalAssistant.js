/**
*  @filename    BaalAssistant.js
*  @author      kolton, modified by YGM, refactored by theBGuy
*  @desc        Help or Leech Baal Runs.
*
*/

function BaalAssistant() {
	let Leader = Config.Leader, // Not entriely needed in the configs.
		Helper = Config.BaalAssistant.Helper,
		hotCheck = false,
		safeCheck = false,
		baalCheck = false,
		ngCheck = false,
		ShrineStatus = false,
		secondAttempt = false,
		throneStatus = false,
		firstAttempt = true;

	addEventListener('chatmsg',
		function (nick, msg) {
			if (nick === Leader) {
				for (let i = 0; i < Config.BaalAssistant.HotTPMessage.length; i += 1) {
					if (msg.toLowerCase().includes(Config.BaalAssistant.HotTPMessage[i].toLowerCase())) {
						hotCheck = true;
						break;
					}
				}

				for (let i = 0; i < Config.BaalAssistant.SafeTPMessage.length; i += 1) {
					if (msg.toLowerCase().includes(Config.BaalAssistant.SafeTPMessage[i].toLowerCase())) {
						safeCheck = true;
						break;
					}
				}

				for (let i = 0; i < Config.BaalAssistant.BaalMessage.length; i += 1) {
					if (msg.toLowerCase().includes(Config.BaalAssistant.BaalMessage[i].toLowerCase())) {
						baalCheck = true;
						break;
					}
				}

				for (let i = 0; i < Config.BaalAssistant.NextGameMessage.length; i += 1) {
					if (msg.toLowerCase().includes(Config.BaalAssistant.NextGameMessage[i].toLowerCase())) {
						ngCheck = true;
						break;
					}
				}
			}
		});

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
						Helper && Attack.getIntoPosition(monster, 10, 0x4) && Attack.clear(15);
						return false;

					}
				}
			} while (monster.getNext());
		}
		return false;
	};

	this.checkParty = function () {
		for (let i = 0; i < Config.BaalAssistant.Wait; i += 1) {
			let partycheck = getParty();
			if (partycheck) {
				do {
					if (partycheck.area === 131) return false;
					if (partycheck.area === 107 || partycheck.area === 108) return true;
				} while (partycheck.getNext());
			}

			delay(1000);
		}

		return false;
	};

	// Start
	if (Leader) {
		if (!Misc.poll(() => Misc.inMyParty(Leader), 30e3, 1000)) throw new Error("BaalAssistant: Leader not partied");
	}

	!!Config.BaalAssistant.KillNihlathak && Loader.runScript("Nihlathak");
	!!Config.BaalAssistant.FastChaos && Loader.runScript("Diablo", () => Config.Diablo.Fast = true);

	Town.goToTown(5);
	Town.doChores();

	if (Leader || (Leader = Misc.autoLeaderDetect(109)) || (Leader = Misc.autoLeaderDetect(130)) || (Leader = Misc.autoLeaderDetect(131))) {
		print("ÿc<Leader: " + Leader);
		while (Misc.inMyParty(Leader)) {
			if (!secondAttempt && !safeCheck && !baalCheck && !ShrineStatus && !!Config.BaalAssistant.GetShrine && me.area === 109) {
				if (!!Config.BaalAssistant.GetShrineWaitForHotTP) {
					for (let i = 0; i < Config.BaalAssistant.Wait; i += 1) {
						if (hotCheck) {
							break;
						}
						delay(1000);
					}

					if (!hotCheck) {
						print("ÿc1" + "Leader didn't tell me to start hunting for an experience shrine.");
						ShrineStatus = true;
					}
				}

				if (!ShrineStatus) {
					Pather.useWaypoint(4);
					Precast.doPrecast(true);
					let i;

					for (i = 4; i > 1; i -= 1) {
						if (safeCheck) {
							break;
						}
						if (Misc.getShrinesInArea(i, 15, true)) {
							break;
						}
					}

					if (!safeCheck) {
						if (i === 1) {
							Town.goToTown();
							Pather.useWaypoint(5);
							Precast.doPrecast(true);

							for (i = 5; i < 8; i += 1) {
								if (safeCheck) {
									break;
								}
								if (Misc.getShrinesInArea(i, 15, true)) {
									break;
								}
							}
						}
					}
				}
				Town.goToTown(5);
				ShrineStatus = true;
			}

			if (firstAttempt && !secondAttempt && !safeCheck && !baalCheck && me.area !== 131 && me.area !== 132) {
				!!Config.RandomPrecast ? Pather.useWaypoint("random") && Precast.doPrecast(true) : Pather.useWaypoint(129) && Precast.doPrecast(true);
			}

			if (me.area !== 131 && me.area !== 132) {
				if (Config.BaalAssistant.SkipTP) {
					if (firstAttempt && !secondAttempt) {
						me.area !== 129 && Pather.useWaypoint(129);
						if (!Pather.moveToExit([130, 131], false)) throw new Error("Failed to move to WSK3.");

						this.checkParty();
						let entrance = Misc.poll(() => getUnit(5, 82), 1000, 200);
						entrance && Pather.moveTo(entrance.x > me.x ? entrance.x - 5 : entrance.x + 5, entrance.y > me.y ? entrance.y - 5 : entrance.y + 5);

						if (!Pather.moveToExit(131, true) || !Pather.moveTo(15118, 5002)) throw new Error("Failed to move to Throne of Destruction.");

						Pather.moveTo(15095, 5029);

						if ((Config.BaalAssistant.SoulQuit && getUnit(1, 641)) || (Config.BaalAssistant.DollQuit && getUnit(1, 691))) {
							print("Burning Souls or Undead Soul Killers found, ending script.");
							return true;
						}

						Pather.moveTo(15118, 5002);
						Helper ? Attack.clear(15) && Pather.moveTo(15118, 5002) : Pather.moveTo(15117, 5045);

						secondAttempt = true;
						safeCheck = true;
					} else {
						if (me.intown) {
							Town.move("portalspot");
							Pather.usePortal(131, null);
							me.mode === 17 && me.revive();
							Helper ? Attack.clear(15) && Pather.moveTo(15118, 5002) : Pather.moveTo(15117, 5045);
						}
					}
				} else {
					if (firstAttempt && !secondAttempt) {
						me.area !== 109 && Pather.useWaypoint(109);
						Town.move("portalspot");
						let i;

						if (Config.BaalAssistant.WaitForSafeTP) {
							for (i = 0; i < Config.BaalAssistant.Wait; i += 1) {
								if (safeCheck) {
									break;
								}
								delay(1000);
							}

							if (i === Config.BaalAssistant.Wait) throw new Error("No safe TP message.");
						}

						for (i = 0; i < Config.BaalAssistant.Wait; i += 1) {
							if (Pather.usePortal(131, null)) {
								break;
							}

							delay(1000);
						}

						if (i === Config.BaalAssistant.Wait) {
							throw new Error("No portals to Throne.");
						}

						if ((Config.BaalAssistant.SoulQuit && getUnit(1, 641)) || (Config.BaalAssistant.DollQuit && getUnit(1, 691))) {
							print("Burning Souls or Undead Soul Killers found, ending script.");
							return true;
						}

						Helper ? Attack.clear(15) && Pather.moveTo(15118, 5002) : Pather.moveTo(15117, 5045);
						secondAttempt = true;
						safeCheck = true;
					} else {
						if (me.intown) {
							Town.move("portalspot");
							Pather.usePortal(131, null);
							me.mode === 17 && me.revive();
							Helper ? Attack.clear(15) && Pather.moveTo(15118, 5002) : Pather.moveTo(15117, 5045);
						}
					}
				}
			}

			for (let i = 0; i < 5; i += 1) {
				if (ngCheck) {
					return true;
				}
				delay(100);
			}

			if (safeCheck && !baalCheck && me.area === 131) {
				if (!baalCheck && !throneStatus) {
					if (Helper) {
						Attack.clear(15);
						Common.Baal.clearThrone();
						Pather.moveTo(15094, me.classid === 3 ? 5029 : 5038);
						Precast.doPrecast(true);
					}

					let tick = getTickCount();

					MainLoop: while (true) {
						if (Helper) {
							if (getDistance(me, 15094, me.classid === 3 ? 5029 : 5038) > 3) {
								Pather.moveTo(15094, me.classid === 3 ? 5029 : 5038);
							}
						}

						if (!getUnit(1, 543)) {
							break;
						}

						switch (this.checkThrone()) {
						case 1:
							Helper && Attack.clear(40);
							tick = getTickCount();

							break;
						case 2:
							Helper && Attack.clear(40);
							tick = getTickCount();

							break;
						case 4:
							Helper && Attack.clear(40);
							tick = getTickCount();

							break;
						case 3:
							Helper && Attack.clear(40) && Common.Baal.checkHydra();
							tick = getTickCount();

							break;
						case 5:
							if (Helper) {
								Attack.clear(40);
							} else {
								while (getUnit(1, 571).attackable || getUnit(1, 572).attackable || getUnit(1, 573).attackable) {
									delay(1000);
								}
								delay(1000);
							}

							break MainLoop;
						default:
							if (getTickCount() - tick < 7e3) {
								me.getState(2) && Skill.setSkill(109, 0);

								break;
							}

							if (Helper) {
								if (!Common.Baal.preattack()) {
									delay(100);
								}
							}

							break;
						}
						delay(10);
					}
					throneStatus = true;
					baalCheck = true;
				}
			}

			for (let i = 0; i < 5; i += 1) {
				if (ngCheck) return true;
				delay(100);
			}

			if ((throneStatus || baalCheck) && Config.BaalAssistant.KillBaal && me.area === 131) {
				if (Helper) {
					Pather.moveTo(15090, 5008);
					delay(2000);
					Precast.doPrecast(true);
				} else {
					Pather.moveTo(15090, 5010);
					Precast.doPrecast(true);
				}

				while (getUnit(1, 543)) {
					delay(500);
				}

				let portal = getUnit(2, 563);

				if (portal) {
					Helper ? delay(1000) : delay(4000);
					Pather.usePortal(null, null, portal);
				} else {
					throw new Error("Couldn't find portal.");
				}

				me.mode === 17 && me.revive();
				let baal;

				if (Helper) {
					delay(1000);
					Pather.moveTo(15134, 5923);
					baal = getUnit(1, 544);
					Attack.kill(544);
					Pickit.pickItems();
					if (ngCheck) return true;
					if (!!baal && baal.dead) return true;
				} else {
					Pather.moveTo(15177, 5952);
					baal = getUnit(1, 544);
					while (baal) {
						delay(1000);
						if (ngCheck) return true;
						if (!!baal && baal.dead) return true;
					}
					return true;
				}

			} else {
				while (true) {
					if (ngCheck) return true;
					delay(500);
				}
			}

			delay(500);
		}
	} else {
		throw new Error("Empty game.");
	}

	return true;
}
