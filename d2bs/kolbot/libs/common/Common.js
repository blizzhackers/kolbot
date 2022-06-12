/**
*  @filename    Common.js
*  @author      theBGuy
*  @desc        collection of functions shared between muliple scripts
*
*/

const Common = {
	Questing: {
		cain: function () {
			MainLoop:
			while (true) {
				switch (true) {
				case !item(sdk.quest.item.ScrollofInifuss) && !item(sdk.quest.item.KeytotheCairnStones) && !Misc.checkQuest(4, 4):
					Pather.useWaypoint(sdk.areas.DarkWood, true);
					Precast.doPrecast(true);

					if (!Pather.moveToPreset(sdk.areas.DarkWood, 2, 30, 5, 5)) {
						throw new Error("Failed to move to Tree of Inifuss");
					}

					let tree = object(sdk.quest.chest.InifussTree);
					!!tree && tree.distance > 5 && Pather.moveToUnit(tree);
					Misc.openChest(tree);
					let scroll = Misc.poll(() => item(sdk.quest.item.ScrollofInifuss), 1000, 100);

					Pickit.pickItem(scroll);
					Town.goToTown();
					Town.npcInteract("Akara");
				
					break;
				case item(sdk.quest.item.ScrollofInifuss):
					Town.goToTown(1);
					Town.npcInteract("Akara");

					break;
				case item(sdk.quest.item.KeytotheCairnStones) && me.area !== sdk.areas.StonyField:
					Pather.journeyTo(sdk.areas.StonyField);
					Precast.doPrecast(true);

					break;
				case item(sdk.quest.item.KeytotheCairnStones) && me.area === sdk.areas.StonyField:
					Pather.moveToPreset(sdk.areas.StonyField, 1, 737, 10, 10, false, true);
					Attack.securePosition(me.x, me.y, 40, 3000, true);
					Pather.moveToPreset(sdk.areas.StonyField, 2, 17, null, null, true);
					let stones = [
						object(sdk.quest.chest.StoneAlpha),
						object(sdk.quest.chest.StoneBeta),
						object(sdk.quest.chest.StoneGamma),
						object(sdk.quest.chest.StoneDelta),
						object(sdk.quest.chest.StoneLambda)
					];

					while (stones.some((stone) => !stone.mode)) {
						for (let i = 0; i < stones.length; i++) {
							let stone = stones[i];

							if (Misc.openChest(stone)) {
								stones.splice(i, 1);
								i--;
							}
							delay(10);
						}
					}

					let tick = getTickCount();
					// wait up to two minutes
					while (getTickCount() - tick < minutes(2)) {
						if (Pather.getPortal(sdk.areas.Tristram)) {
							Pather.usePortal(sdk.areas.Tristram);
								
							break;
						}
					}

					break;
				case me.area === sdk.areas.Tristram && !Misc.checkQuest(4, 0):
					let gibbet = object(sdk.quest.chest.CainsJail);

					if (gibbet && !gibbet.mode) {
						Pather.moveTo(gibbet.x, gibbet.y);
						if (Misc.poll(() => Misc.openChest(gibbet), 2000, 100)) {
							Town.goToTown(1);
							Town.npcInteract("Akara") && console.log("Akara done");
						}
					}

					break;
				default:
					break MainLoop;
				}
			}

			return true;
		},

		smith: function () {
			if (!Pather.moveToPreset(sdk.areas.Barracks, sdk.unittype.Object, sdk.quest.chest.MalusHolder)) {
				throw new Error("Failed to move to the Smith");
			}

			Attack.kill(getLocaleString(sdk.locale.monsters.TheSmith));
			let malusChest = object(sdk.quest.chest.MalusHolder);
			!!malusChest && malusChest.distance > 5 && Pather.moveToUnit(malusChest);
			Misc.openChest(malusChest);
			let malus = Misc.poll(() => item(sdk.quest.item.HoradricMalus), 1000, 100);
			Pickit.pickItem(malus);
			Town.goToTown();
			Town.npcInteract("Charsi");
		}
	},
	
	Cows: {
		buildCowRooms: function () {
			let finalRooms = [],
				indexes = [];

			let kingPreset = getPresetUnit(sdk.areas.MooMooFarm, sdk.unittype.Monster, sdk.monsters.preset.TheCowKing);
			let badRooms = getRoom(kingPreset.roomx * 5 + kingPreset.x, kingPreset.roomy * 5 + kingPreset.y).getNearby();

			for (let i = 0; i < badRooms.length; i += 1) {
				let badRooms2 = badRooms[i].getNearby();

				for (let j = 0; j < badRooms2.length; j += 1) {
					if (indexes.indexOf(badRooms2[j].x + "" + badRooms2[j].y) === -1) {
						indexes.push(badRooms2[j].x + "" + badRooms2[j].y);
					}
				}
			}

			let room = getRoom();

			do {
				if (indexes.indexOf(room.x + "" + room.y) === -1) {
					finalRooms.push([room.x * 5 + room.xsize / 2, room.y * 5 + room.ysize / 2]);
				}
			} while (room.getNext());

			return finalRooms;
		},

		clearCowLevel: function () {
			function roomSort(a, b) {
				return getDistance(myRoom[0], myRoom[1], a[0], a[1]) - getDistance(myRoom[0], myRoom[1], b[0], b[1]);
			}

			Config.MFLeader && Pather.makePortal() && say("cows");

			let myRoom,
				rooms = this.buildCowRooms();

			while (rooms.length > 0) {
				// get the first room + initialize myRoom var
				!myRoom && (room = getRoom(me.x, me.y));

				if (room) {
					// use previous room to calculate distance
					if (room instanceof Array) {
						myRoom = [room[0], room[1]];
					} else {
						// create a new room to calculate distance (first room, done only once)
						myRoom = [room.x * 5 + room.xsize / 2, room.y * 5 + room.ysize / 2];
					}
				}

				rooms.sort(roomSort);
				let room = rooms.shift();
				let result = Pather.getNearestWalkable(room[0], room[1], 10, 2);

				if (result) {
					Pather.moveTo(result[0], result[1], 3);

					if (!Attack.clear(30)) {
						return false;
					}
				}
			}

			return true;
		},
	},

	Diablo: {
		diabloSpawned: false,
		done: false,
		waitForGlow: false,
		sealOrder: [],
		vizLayout: -1,
		seisLayout: -1,
		infLayout: -1,
		entranceCoords: {x: 7790, y: 5544},
		starCoords: {x: 7791, y: 5293},
		// path coordinates
		entranceToStar: [7794, 5517, 7791, 5491, 7768, 5459, 7775, 5424, 7817, 5458, 7777, 5408, 7769, 5379, 7777, 5357, 7809, 5359, 7805, 5330, 7780, 5317, 7791, 5293],
		starToVizA: [7759, 5295, 7734, 5295, 7716, 5295, 7718, 5276, 7697, 5292, 7678, 5293, 7665, 5276, 7662, 5314],
		starToVizB: [7759, 5295, 7734, 5295, 7716, 5295, 7701, 5315, 7666, 5313, 7653, 5284],
		starToSeisA: [7781, 5259, 7805, 5258, 7802, 5237, 7776, 5228, 7775, 5205, 7804, 5193, 7814, 5169, 7788, 5153],
		starToSeisB: [7781, 5259, 7805, 5258, 7802, 5237, 7776, 5228, 7811, 5218, 7807, 5194, 7779, 5193, 7774, 5160, 7803, 5154],
		starToInfA: [7809, 5268, 7834, 5306, 7852, 5280, 7852, 5310, 7869, 5294, 7895, 5295, 7919, 5290],
		starToInfB: [7809, 5268, 7834, 5306, 7852, 5280, 7852, 5310, 7869, 5294, 7895, 5274, 7927, 5275, 7932, 5297, 7923, 5313],
		// check for strays array
		cleared: [],

		diabloLightsEvent: function (bytes) {
			if (me.area === sdk.areas.ChaosSanctuary && bytes && bytes.length && bytes[0] === 0x89) {
				Common.Diablo.diabloSpawned = true;
			}
		},

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
				return (a.y > b.y ? -1 : 1);
			}

			// Vizier
			if (me.x < 7765) {
				return (a.x > b.x ? -1 : 1);
			}

			// Infector
			if (me.x > 7825) {
				return (!checkCollision(me, a, 0x1) && a.x < b.x ? -1 : 1);
			}

			return getDistance(me, a) - getDistance(me, b);
		},

		getLayout: function (seal, value) {
			let sealPreset = getPresetUnit(sdk.areas.ChaosSanctuary, 2, seal);
			if (!seal) throw new Error("Seal preset not found. Can't continue.");

			if (sealPreset.roomy * 5 + sealPreset.y === value
				|| sealPreset.roomx * 5 + sealPreset.x === value) {
				return 1;
			}

			return 2;
		},

		initLayout: function () {
			// 1 = "Y", 2 = "L"
			this.vizLayout = this.getLayout(sdk.units.DiabloSealVizier, 5275);
			// 1 = "2", 2 = "5"
			this.seisLayout = this.getLayout(sdk.units.DiabloSealSeis, 7773);
			// 1 = "I", 2 = "J"
			this.infLayout = this.getLayout(sdk.units.DiabloSealInfector, 7893);
		},

		followPath: function (path) {
			for (let i = 0; i < path.length; i += 2) {
				this.cleared.length > 0 && this.clearStrays();

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
		},

		clearStrays: function () {
			let oldPos = {x: me.x, y: me.y};
			let monster = getUnit(1);

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
		},

		runSeals: function (sealOrder, openSeals = true) {
			print("seal order: " + sealOrder);
			this.sealOrder = sealOrder;
			let seals = {
				1: () => this.vizierSeal(openSeals),
				2: () => this.seisSeal(openSeals),
				3: () => this.infectorSeal(openSeals),
				"vizier": () => this.vizierSeal(openSeals),
				"seis": () => this.seisSeal(openSeals),
				"infector": () => this.infectorSeal(openSeals),
			};
			sealOrder.forEach(seal => {seals[seal]();});
		},

		tkSeal: function (seal) {
			if (!Skill.useTK(seal)) return false;

			for (let i = 0; i < 5; i++) {
				seal.distance > 13 && Attack.getIntoPosition(seal, 13, 0x4);
				
				if (Skill.cast(sdk.skills.Telekinesis, 0, seal) && Misc.poll(() => seal.mode, 1000, 100)) {
					break;
				}
			}

			return !!seal.mode;
		},

		openSeal: function (classid) {
			let warn = Config.PublicMode && [396, 394, 392].includes(classid) && Loader.scriptName() === "Diablo";
			let usetk = (Config.UseTelekinesis && Skill.haveTK && (classid !== 394 || this.seisLayout !== 1));
			let seal;

			for (let i = 0; i < 5; i++) {
				if (!seal) {
					usetk ? Pather.moveNearPreset(108, 2, classid, 15) : Pather.moveToPreset(108, 2, classid, classid === 394 ? 5 : 2, classid === 394 ? 5 : 0);
					seal = Misc.poll(() => getUnit(sdk.unittype.Object, classid), 1000, 100);
				}

				if (!seal) {
					console.debug("Couldn't find seal: " + classid);
					return false;
				}

				if (seal.mode) {
					warn && say(Config.Diablo.SealWarning);
					return true;
				}

				// Clear around Infector seal, Any leftover abyss knights casting decrep is bad news with Infector
				if (([392, 393].includes(classid) || i > 1) && me.getMobCount() > 1) {
					Attack.clear(15);
					// Move back to seal
					usetk ? Pather.moveNearUnit(seal, 15) : Pather.moveToUnit(seal, classid === 394 ? 5 : 2, classid === 394 ? 5 : 0);
				}

				if (usetk && this.tkSeal(seal)) {
					return seal.mode;
				} else {
					usetk && (usetk = false);

					if (classid === 392 && me.assassin && this.infLayout === 1) {
						if (Config.UseTraps) {
							let check = ClassAttack.checkTraps({x: 7899, y: 5293});
							check && ClassAttack.placeTraps({x: 7899, y: 5293}, check);
						}
					}

					classid === 394 ? Misc.poll(function () {
						// stupid diablo shit, walk around the de-seis seal clicking it until we find "the spot"...sigh
						if (!seal.mode) {
							Pather.walkTo(seal.x + (rand(-1, 1)), seal.y + (rand(-1, 1)));
							clickUnitAndWait(0, 0, seal) || seal.interact();
						}
						return !!seal.mode;
					}, 3000, 60) : seal.interact();

					// de seis optimization
					if (classid === 394 && Attack.validSpot(seal.x + 15, seal.y)) {
						Pather.walkTo(seal.x + 15, seal.y);
					} else {
						Pather.walkTo(seal.x - 5, seal.y - 5);
					}
				}

				delay(classid === 394 ? 1000 + me.ping : 500 + me.ping);

				if (seal.mode) {
					break;
				}
			}

			return (!!seal && seal.mode);
		},

		vizierSeal: function (openSeal = true) {
			print("Viz layout " + Common.Diablo.vizLayout);
			let path = (Common.Diablo.vizLayout === 1 ? this.starToVizA : this.starToVizB);
			let distCheck = {
				x: path[path.length - 2],
				y: (path.last())
			};

			if (Config.Diablo.SealLeader || Config.Diablo.Fast) {
				Common.Diablo.vizLayout === 1 ? Pather.moveTo(7708, 5269) : Pather.moveTo(7647, 5267);
				Config.Diablo.SealLeader && Attack.securePosition(me.x, me.y, 35, 3000, true);
				Config.Diablo.SealLeader && Pather.makePortal() && say("in");
			}

			distCheck.distance > 30 && this.followPath(Common.Diablo.vizLayout === 1 ? this.starToVizA : this.starToVizB);

			if (openSeal && (!Common.Diablo.openSeal(sdk.units.DiabloSealVizier2) || !Common.Diablo.openSeal(sdk.units.DiabloSealVizier))) {
				throw new Error("Failed to open Vizier seals.");
			}

			delay(1 + me.ping);
			Common.Diablo.vizLayout === 1 ? Pather.moveTo(7691, 5292) : Pather.moveTo(7695, 5316);

			if (!Common.Diablo.getBoss(getLocaleString(sdk.locale.monsters.GrandVizierofChaos))) {
				throw new Error("Failed to kill Vizier");
			}

			Config.Diablo.SealLeader && say("out");

			return true;
		},

		seisSeal: function (openSeal = true) {
			print("Seis layout " + Common.Diablo.seisLayout);
			let path = (Common.Diablo.seisLayout === 1 ? this.starToSeisA : this.starToSeisB);
			let distCheck = {
				x: path[path.length - 2],
				y: (path.last())
			};

			if (Config.Diablo.SealLeader || Config.Diablo.Fast) {
				Common.Diablo.seisLayout === 1 ? Pather.moveTo(7767, 5147) : Pather.moveTo(7820, 5147);
				Config.Diablo.SealLeader && Attack.securePosition(me.x, me.y, 35, 3000, true);
				Config.Diablo.SealLeader && Pather.makePortal() && say("in");
			}

			distCheck.distance > 30 && this.followPath(Common.Diablo.seisLayout === 1 ? this.starToSeisA : this.starToSeisB);

			if (openSeal && !Common.Diablo.openSeal(sdk.units.DiabloSealSeis)) throw new Error("Failed to open de Seis seal.");
			Common.Diablo.seisLayout === 1 ? Pather.moveTo(7798, 5194) : Pather.moveTo(7796, 5155);
			if (!Common.Diablo.getBoss(getLocaleString(sdk.locale.monsters.LordDeSeis))) throw new Error("Failed to kill de Seis");

			Config.Diablo.SealLeader && say("out");

			return true;
		},

		infectorSeal: function (openSeal = true) {
			Precast.doPrecast(true);
			print("Inf layout " + Common.Diablo.infLayout);
			let path = (Common.Diablo.infLayout === 1 ? this.starToInfA : this.starToInfB);
			let distCheck = {
				x: path[path.length - 2],
				y: (path.last())
			};

			if (Config.Diablo.SealLeader || Config.Diablo.Fast) {
				Common.Diablo.infLayout === 1 ? Pather.moveTo(7860, 5314) : Pather.moveTo(7909, 5317);
				Config.Diablo.SealLeader && Attack.securePosition(me.x, me.y, 35, 3000, true);
				Config.Diablo.SealLeader && Pather.makePortal() && say("in");
			}

			distCheck.distance > 70 && this.followPath(Common.Diablo.infLayout === 1 ? this.starToInfA : this.starToInfB);
			
			if (Config.Diablo.Fast) {
				if (openSeal && !Common.Diablo.openSeal(sdk.units.DiabloSealInfector2)) throw new Error("Failed to open Infector seals.");
				if (openSeal && !Common.Diablo.openSeal(sdk.units.DiabloSealInfector)) throw new Error("Failed to open Infector seals.");

				if (Common.Diablo.infLayout === 1) {
					(me.sorceress || me.assassin) && Pather.moveTo(7876, 5296);
					delay(1 + me.ping);
				} else {
					delay(1 + me.ping);
					Pather.moveTo(7928, 5295);
				}

				if (!Common.Diablo.getBoss(getLocaleString(sdk.locale.monsters.InfectorofSouls))) throw new Error("Failed to kill Infector");
			} else {
				if (openSeal && !Common.Diablo.openSeal(sdk.units.DiabloSealInfector)) throw new Error("Failed to open Infector seals.");

				if (Common.Diablo.infLayout === 1) {
					(me.sorceress || me.assassin) && Pather.moveTo(7876, 5296);
					delay(1 + me.ping);
				} else {
					delay(1 + me.ping);
					Pather.moveTo(7928, 5295);
				}

				if (!Common.Diablo.getBoss(getLocaleString(sdk.locale.monsters.InfectorofSouls))) throw new Error("Failed to kill Infector");
				if (openSeal && !Common.Diablo.openSeal(sdk.units.DiabloSealInfector2)) throw new Error("Failed to open Infector seals.");
				// wait until seal has been popped to avoid missing diablo due to wait time ending before he spawns, happens if leader does town chores after seal boss
				!openSeal && [3, "infector"].includes(Common.Diablo.sealOrder.last()) && Misc.poll(() => {
					if (Common.Diablo.diabloSpawned) return true;

					let lastSeal = object(sdk.units.DiabloSealInfector2);
					if (lastSeal && lastSeal.mode) {
						return true;
					}
					return false;
				}, minutes(3), 1000);
			}

			Config.Diablo.SealLeader && say("out");

			return true;
		},

		hammerdinPreAttack: function (name, amount) {
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

		preattack: function (id) {
			let coords = [];

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
			case sdk.charclass.Sorceress:
				if ([sdk.skills.Meteor, sdk.skills.Blizzard, sdk.skills.FrozenOrb, sdk.skills.FireWall].includes(Config.AttackSkill[1])) {
					me.skillDelay && delay(500);
					Skill.cast(Config.AttackSkill[1], 0, coords[0], coords[1]);

					return true;
				}

				break;
			case sdk.charclass.Paladin:
				this.hammerdinPreAttack(id, 8);

				break;
			case sdk.charclass.Assassin:
				if (Config.UseTraps) {
					let trapCheck = ClassAttack.checkTraps({x: coords[0], y: coords[1]});

					if (trapCheck) {
						ClassAttack.placeTraps({x: coords[0], y: coords[1]}, 5);

						return true;
					}
				}

				break;
			}

			return false;
		},

		getBoss: function (name) {
			let glow = object(sdk.units.SealGlow);

			if (this.waitForGlow) {
				while (true) {
					if (!this.preattack(name)) {
						delay(500);
					}

					glow = object(sdk.units.SealGlow);

					if (glow) {
						break;
					}
				}
			}

			for (let i = 0; i < 16; i += 1) {
				let boss = monster(name);

				if (boss) {
					Common.Diablo.hammerdinPreAttack(name, 8);
					return Attack.clear(40, 0, name, this.sort);
				}

				delay(250);
			}

			return !!glow;
		},

		diabloPrep: function () {
			if (Config.Diablo.SealLeader) {
				Pather.moveTo(7763, 5267);
				Pather.makePortal() && say("in");
				Pather.moveTo(7788, 5292);
			}

			let trapCheck, tick = getTickCount();

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
							Skill.cast(Config.AttackSkill[1], 0, 7793 + rand(-1, 1), 5293);
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

	Ancients: {
		altarSpot: {x: 10047, y: 12622},

		canAttack: function () {
			let ancient = getUnit(1);

			if (ancient) {
				do {
					if (!ancient.getParent() && !Attack.canAttack(ancient)) {
						console.log("Can't attack ancients");
						return false;
					}
				} while (ancient.getNext());
			}

			return true;
		},

		touchAltar: function () {
			let tick = getTickCount();

			while (getTickCount() - tick < 5000) {
				if (getUnit(2, sdk.units.AncientsAltar)) {
					break;
				}

				delay(20 + me.ping);
			}

			let altar = getUnit(2, sdk.units.AncientsAltar);

			if (altar) {
				while (altar.mode !== 2) {
					Pather.moveToUnit(altar);
					altar.interact();
					delay(200 + me.ping);
					me.cancel();
				}

				// wait for ancients to spawn
				while (!getUnit(sdk.unittype.Monster, sdk.monsters.TalictheDefender)) {
					delay(250 + me.ping);
				}

				return true;
			}

			return false;
		},

		checkStatues: function () {
			let statues = getUnits(2).filter(u => [474, 475, 476].includes(u.classid) && u.mode === 2);
			return statues.length === 3;
		},

		checkCorners: function () {
			let pos = [
				{ x: 10036, y: 12592 }, { x: 10066, y: 12589 },
				{ x: 10065, y: 12623 }, { x: 10058, y: 12648 },
				{ x: 10040, y: 12660 }, { x: 10036, y: 12630 },
				{ x: 10038, y: 12611 }
			];
			Pather.moveToUnit(this.altarSpot);
			if (!this.checkStatues()) {
				return pos.forEach((node) => {
					// no mobs at that next, skip it
					if ([node.x, node.y].distance < 35 && [node.x, node.y].mobCount({range: 30}) === 0) {
						return;
					}
					Pather.moveTo(node.x, node.y);
					Attack.clear(30);
				});
			}

			return true;
		},

		killAncients: function (checkQuest = false) {
			let retry = 0;
			Pather.moveToUnit(this.altarSpot);

			while (!this.checkStatues()) {
				if (retry > 5) {
					console.log("Failed to kill anicents.");
					
					break;
				}

				Attack.clearClassids(sdk.monsters.KorlictheProtector, sdk.monsters.TalictheDefender, sdk.monsters.MadawctheGuardian);
				delay(1000);

				if (checkQuest) {
					if (Misc.checkQuest(39, 0)) {
						break;
					} else {
						console.log("Failed to kill anicents. Attempt: " + retry);
					}
				}

				this.checkCorners();
				retry++;
			}
		},

		ancientsPrep: function () {
			Town.goToTown();
			Town.fillTome(sdk.items.TomeofTownPortal);
			[sdk.items.StaminaPotion, sdk.items.AntidotePotion, sdk.items.ThawingPotion].forEach(p => Town.buyPots(10, p, true));
			Town.buyPotions();
			Pather.usePortal(sdk.areas.ArreatSummit, me.name);
		},

		startAncients: function (preTasks = false) {
			let retry = 0;
			Pather.moveToUnit(this.altarSpot);
			this.touchAltar();

			while (!this.canAttack()) {
				if (retry > 10) throw new Error("I think I'm unable to complete ancients, I've rolled them 10 times");
				preTasks ? this.ancientsPrep() : Pather.makePortal();
				Pather.moveToUnit(this.altarSpot);
				this.touchAltar();
				retry++;
			}

			this.killAncients();
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
			if (!getUnit(sdk.unittype.Monster, sdk.monsters.ThroneBaal)) return true;

			let monList = [];

			if (Config.AvoidDolls) {
				let monster = getUnit(1, 691);

				if (monster) {
					do {
						if (monster.x >= 15072 && monster.x <= 15118 && monster.y >= 5002 && monster.y <= 5079 && monster.attackable && !Attack.skipCheck(monster)) {
							monList.push(copyUnit(monster));
						}
					} while (monster.getNext());
				}

				return monList.length > 0 && Attack.clearList(monList);
			}

			let pos = [
				{ x: 15097, y: 5054 }, { x: 15079, y: 5014 },
				{ x: 15085, y: 5053 }, { x: 15085, y: 5040 },
				{ x: 15098, y: 5040 }, { x: 15099, y: 5022 },
				{ x: 15086, y: 5024 }, { x: 15079, y: 5014 }
			];
			return pos.forEach((node) => {
				// no mobs at that next, skip it
				if ([node.x, node.y].distance < 35 && [node.x, node.y].mobCount({range: 30}) === 0) {
					return;
				}
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
				if (!getUnit(sdk.unittype.Monster, sdk.monsters.ThroneBaal)) return true;

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
				// eslint-disable-next-line no-fallthrough
				case sdk.charclass.Druid:
					if ([sdk.skills.Fissure, sdk.skills.Volcano].includes(Config.AttackSkill[3])) {
						[15116, 5026].distance > 3 && Pather.moveTo(15116, 5026);

						break;
					}

					if (Config.AttackSkill[3] === sdk.skills.Tornado) {
						[15094, 5029].distance > 3 && Pather.moveTo(15106, 5041);
						
						break;
					}
				// eslint-disable-next-line no-fallthrough
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
		},

		killBaal: function () {
			if (me.area === sdk.areas.ThroneofDestruction) {
				Config.PublicMode && Loader.scriptName() === "Baal" && say(Config.Baal.BaalMessage);
				me.getMobCount(30) > 0 && this.clearWaves(); // ensure waves are actually done
				Pather.moveTo(15090, 5008);
				delay(5000);
				Precast.doPrecast(true);
				Misc.poll(() => !monster(sdk.monsters.ThroneBaal), minutes(3), 1000);

				let portal = object(sdk.units.WorldstonePortal);

				if (portal) {
					Pather.usePortal(null, null, portal);
				} else {
					throw new Error("Couldn't find portal.");
				}
			}

			if (me.area === sdk.areas.WorldstoneChamber) {
				Pather.moveTo(15134, 5923);
				Attack.kill(sdk.monsters.Baal);
				Pickit.pickItems();
			}
		}
	},
};
