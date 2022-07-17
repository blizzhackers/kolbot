/**
*  @filename    ActionHooks.js
*  @author      theBGuy
*  @desc        Action hooks for MapThread
*
*/

const ActionHooks = {
	hooks: [],
	portals: [],
	frame: [],
	action: null,
	currArea: 0,
	enabled: true,
	prevAreas: [
		sdk.areas.None, sdk.areas.None, sdk.areas.RogueEncampment, sdk.areas.BloodMoor, sdk.areas.ColdPlains, sdk.areas.UndergroundPassageLvl1, sdk.areas.DarkWood, sdk.areas.BlackMarsh,
		sdk.areas.BloodMoor, sdk.areas.ColdPlains, sdk.areas.StonyField, sdk.areas.BlackMarsh, sdk.areas.TamoeHighland, sdk.areas.CaveLvl1, sdk.areas.UndergroundPassageLvl1, sdk.areas.HoleLvl1,
		sdk.areas.PitLvl1, sdk.areas.ColdPlains, sdk.areas.BurialGrounds, sdk.areas.BurialGrounds, sdk.areas.BlackMarsh, sdk.areas.ForgottenTower, sdk.areas.TowerCellarLvl1, sdk.areas.TowerCellarLvl2,
		sdk.areas.TowerCellarLvl3, sdk.areas.TowerCellarLvl4, sdk.areas.TamoeHighland, sdk.areas.MonasteryGate, sdk.areas.OuterCloister, sdk.areas.Barracks, sdk.areas.JailLvl1, sdk.areas.JailLvl2,
		sdk.areas.JailLvl3, sdk.areas.InnerCloister, sdk.areas.Cathedral, sdk.areas.CatacombsLvl1, sdk.areas.CatacombsLvl2, sdk.areas.CatacombsLvl3, sdk.areas.StonyField, sdk.areas.RogueEncampment,
		sdk.areas.RogueEncampment, sdk.areas.LutGholein, sdk.areas.RockyWaste, sdk.areas.DryHills, sdk.areas.FarOasis, sdk.areas.LostCity, sdk.areas.ArcaneSanctuary, sdk.areas.LutGholein,
		sdk.areas.A2SewersLvl1, sdk.areas.A2SewersLvl2, sdk.areas.LutGholein, sdk.areas.HaremLvl1, sdk.areas.HaremLvl2, sdk.areas.PalaceCellarLvl1, sdk.areas.PalaceCellarLvl2, sdk.areas.RockyWaste,
		sdk.areas.DryHills, sdk.areas.HallsoftheDeadLvl1, sdk.areas.ValleyofSnakes, sdk.areas.StonyTombLvl1, sdk.areas.HallsoftheDeadLvl2, sdk.areas.ClawViperTempleLvl1, sdk.areas.FarOasis,
		sdk.areas.MaggotLairLvl1, sdk.areas.MaggotLairLvl2, sdk.areas.LostCity, sdk.areas.CanyonofMagic, sdk.areas.CanyonofMagic, sdk.areas.CanyonofMagic, sdk.areas.CanyonofMagic, sdk.areas.CanyonofMagic,
		sdk.areas.CanyonofMagic, sdk.areas.CanyonofMagic, sdk.areas.RogueEncampment, sdk.areas.PalaceCellarLvl3, sdk.areas.RogueEncampment, sdk.areas.KurastDocktown, sdk.areas.SpiderForest,
		sdk.areas.SpiderForest, sdk.areas.FlayerJungle, sdk.areas.LowerKurast, sdk.areas.KurastBazaar, sdk.areas.UpperKurast, sdk.areas.KurastCauseway,
		sdk.areas.SpiderForest, sdk.areas.SpiderForest, sdk.areas.FlayerJungle, sdk.areas.SwampyPitLvl1, sdk.areas.FlayerJungle, sdk.areas.FlayerDungeonLvl1, sdk.areas.SwampyPitLvl2, sdk.areas.FlayerDungeonLvl2,
		sdk.areas.UpperKurast, sdk.areas.A3SewersLvl1, sdk.areas.KurastBazaar, sdk.areas.KurastBazaar, sdk.areas.UpperKurast, sdk.areas.UpperKurast, sdk.areas.KurastCauseway, sdk.areas.KurastCauseway,
		sdk.areas.Travincal, sdk.areas.DuranceofHateLvl1, sdk.areas.DuranceofHateLvl2, sdk.areas.DuranceofHateLvl3, sdk.areas.PandemoniumFortress, sdk.areas.OuterSteppes, sdk.areas.PlainsofDespair,
		sdk.areas.CityoftheDamned, sdk.areas.RiverofFlame, sdk.areas.PandemoniumFortress, sdk.areas.Harrogath, sdk.areas.BloodyFoothills, sdk.areas.FrigidHighlands, sdk.areas.ArreatPlateau,
		sdk.areas.CrystalizedPassage, sdk.areas.CrystalizedPassage, sdk.areas.GlacialTrail, sdk.areas.GlacialTrail, sdk.areas.FrozenTundra, sdk.areas.AncientsWay, sdk.areas.AncientsWay, sdk.areas.Harrogath,
		sdk.areas.NihlathaksTemple, sdk.areas.HallsofAnguish, sdk.areas.HallsofPain, sdk.areas.FrigidHighlands, sdk.areas.ArreatPlateau, sdk.areas.FrozenTundra, sdk.areas.ArreatSummit, sdk.areas.WorldstoneLvl1,
		sdk.areas.WorldstoneLvl2, sdk.areas.WorldstoneLvl3, sdk.areas.ThroneofDestruction, sdk.areas.Harrogath, sdk.areas.Harrogath, sdk.areas.Harrogath, sdk.areas.Harrogath
	],
	areaInfo: {
		133: {
			11: {x: 20023, y: 7643},
			20: {x: 20303, y: 7803},
			21: {x: 20263, y: 7683},
		},
		135: {
			14: {x: 20138, y: 14873},
			15: {x: 20138, y: 14563},
		},
	},
	ctrlObj: {
		0: {
			3: "moveItemFromInvoToTrade",
			5: "moveItemFromTradeToInvo"
		},
		1: {
			3: "moveItemFromInvoToStash",
			7: "moveItemFromStashToInvo"
		},
		2: {
			3: "moveItemFromInvoToCube",
			6: "moveItemFromCubeToInvo"
		},
		3: "sellItem"
	},
	blockKeyEventFlags: [
		sdk.uiflags.Inventory, sdk.uiflags.StatsWindow, sdk.uiflags.ChatBox, sdk.uiflags.EscMenu, sdk.uiflags.Shop, sdk.uiflags.Quest, sdk.uiflags.Waypoint,
		sdk.uiflags.TradePrompt, sdk.uiflags.Msgs, sdk.uiflags.Stash, sdk.uiflags.Cube, sdk.uiflags.Help, sdk.uiflags.MercScreen
	],

	event: function (keycode) {
		if ([sdk.keys.Shift, sdk.keys.Alt].some(k => k === keycode)) {
			return;
		}

		ActionHooks.action = keycode;
	},

	getOnScreenLocation: function () {
		let possibleLocs = [sdk.uiflags.TradePrompt, sdk.uiflags.Stash, sdk.uiflags.Cube, sdk.uiflags.Shop];

		for (let i = 0; i < possibleLocs.length; i++) {
			if (getUIFlag(possibleLocs[i])) {
				return possibleLocs.indexOf(possibleLocs[i]);
			}
		}

		return -1;
	},

	checkAction: function () {
		let hook;
		let unit, screenLoc;
		let obj = { type: false, dest: false, action: false };
		let qolObj = { type: "qol", dest: false, action: false };

		if (this.action) {
			switch (this.action) {
			case sdk.keys.Numpad0:
				hook = this.getHook("Next Area");

				break;
			case sdk.keys.Numpad1:
				hook = this.getHook("Previous Area");

				break;
			case sdk.keys.Numpad2:
				hook = this.getHook("Waypoint");

				break;
			case sdk.keys.Numpad3:
				hook = this.getHook("POI");

				break;
			case sdk.keys.Numpad4:
				hook = this.getHook("Side Area");

				break;
			case sdk.keys.Numpad5:
				switch (me.area) {
				case sdk.areas.RogueEncampment:
				case sdk.areas.Tristram:
				case sdk.areas.CanyonofMagic:
				case sdk.areas.SpiderForest:
				case sdk.areas.FlayerJungle:
				case sdk.areas.KurastBazaar:
				case sdk.areas.UpperKurast:
				case sdk.areas.KurastCauseway:
				case sdk.areas.ChaosSanctuary:
					hook = this.getHook("POI2");

					break;
				case sdk.areas.Harrogath:
					hook = this.getPortalHook("Matron's Den");

					break;
				}

				break;
			case sdk.keys.Numpad6:
				switch (me.area) {
				case sdk.areas.CanyonofMagic:
				case sdk.areas.SpiderForest:
				case sdk.areas.UpperKurast:
				case sdk.areas.KurastCauseway:
				case sdk.areas.ChaosSanctuary:
					hook = this.getHook("POI3");

					break;
				case sdk.areas.Harrogath:
					hook = this.getPortalHook("Sands");

					break;
				}

				break;
			case sdk.keys.Numpad7:
				switch (me.area) {
				case sdk.areas.CanyonofMagic:
				case sdk.areas.ChaosSanctuary:
					hook = this.getHook("POI4");

					break;
				case sdk.areas.Harrogath:
					hook = this.getPortalHook("Furnace");

					break;
				}
				
				break;
			case sdk.keys.Numpad8:
				hook = me.area === sdk.areas.CanyonofMagic ? this.getHook("POI5") : this.getPortalHook("Uber Tristam");

				break;
			case 188: // shift <
				hook = TextHooks.getHook("Previous Act", TextHooks.qolHooks);

				break;
			case 190: // shift >
				hook = TextHooks.getHook("Next Act", TextHooks.qolHooks);

				break;
			case sdk.keys.Ctrl:
				unit = Game.getSelectedUnit();

				if (!!unit) {
					screenLoc = this.getOnScreenLocation();

					switch (screenLoc) {
					case 0: // Trade screen
					case 1: // Stash
					case 2: // Cube
						qolObj.action = this.ctrlObj[screenLoc][unit.location];

						break;
					case 3: // Shop
						qolObj.action = "sellItem";

						break;
					default:
						break;
					}
				}

				break;
			case sdk.keys.Five:
				if (!me.inTown) {
					Town.getTpTool() && (qolObj.action = "makePortal");
				} else if (me.inTown) {
					if (!getUIFlag(sdk.uiflags.Stash) && !getUIFlag(sdk.uiflags.TradePrompt) && !getUIFlag(sdk.uiflags.Inventory)) {
						qolObj.action = "heal";
					}
				}

				break;
			case sdk.keys.Six:
				if (!me.inTown) {
					Town.getTpTool() && (qolObj.action = "takePortal");
				} else if (me.inTown) {
					if (!getUIFlag(sdk.uiflags.Stash) && !getUIFlag(sdk.uiflags.TradePrompt) && !getUIFlag(sdk.uiflags.Inventory)) {
						qolObj.action = "openStash";
					}
				}

				break;
			case sdk.keys.Seven:
				if (this.blockKeyEventFlags.some((flag) => getUIFlag(flag))) {
					break;
				}

				TextHooks.getHook("itemStatus", TextHooks.statusHooks).hook.text = "ÿc4Key 7ÿc0: " + (ItemHooks.enabled ? "Enable" : "Disable") + " Item Filter";
				ItemHooks.enabled = !ItemHooks.enabled;

				break;
			case sdk.keys.Eight:
				if (this.blockKeyEventFlags.some((flag) => getUIFlag(flag))) {
					break;
				}

				TextHooks.getHook("monsterStatus", TextHooks.statusHooks).hook.text = "ÿc4Key 8ÿc0: " + (MonsterHooks.enabled ? "Enable" : "Disable") + " Monsters";
				MonsterHooks.enabled = !MonsterHooks.enabled;

				break;
			case sdk.keys.Nine:
				if (this.blockKeyEventFlags.some((flag) => getUIFlag(flag))) {
					break;
				}

				TextHooks.getHook("vectorStatus", TextHooks.statusHooks).hook.text = "ÿc4Key 9ÿc0: " + (VectorHooks.enabled ? "Enable" : "Disable") + " Vectors";
				VectorHooks.enabled = !VectorHooks.enabled;

				break;
			case sdk.keys.NumpadDash:
				if (this.blockKeyEventFlags.some((flag) => getUIFlag(flag))) {
					break;
				}

				if (ItemHooks.pickitEnabled) {
					ItemHooks.pickitEnabled = false;
					TextHooks.getHook("pickitStatus", TextHooks.statusHooks).hook.text = "ÿc4Num -ÿc0: ÿc1Default Filter";
				} else {
					ItemHooks.pickitEnabled = true;
					ItemHooks.flush();
					TextHooks.getHook("pickitStatus", TextHooks.statusHooks).hook.text = "ÿc4Num -ÿc0: ÿc<Your Filter";

					if (!Hooks.saidMessage) {
						showConsole();
						print("ÿc<Notify :: ÿc0Item filter has switched to using your Pickit files, this is just to notify you of that. If you didn't add any nip files you probably should switch back.");
						print("ÿc<Notify :: ÿc0Close this console by pressing Home. You will not see this message again.");
						Hooks.saidMessage = true;
					}
				}

				break;
			case sdk.keys.Insert:
				if (me.inTown) {
					break;
				}

				qolObj.action = "clear";

				break;
			}

			if (hook) {
				Object.assign(obj, hook);
				Messaging.sendToScript(MapMode.mapHelperFilePath, JSON.stringify(obj));
			} else if (qolObj.action) {
				Messaging.sendToScript(MapMode.mapHelperFilePath, JSON.stringify(qolObj));
			}

			this.action = null;
		}
	},

	check: function () {
		if (!this.enabled) {
			return;
		}

		this.checkAction();

		if (me.area !== this.currArea) {
			this.flush();

			while (!me.area || !me.gameReady) {
				delay(150);
			}

			this.add(me.area);
			TextHooks.update(this.hooks.length);
			this.currArea = me.area;
		}
	},

	add: function (area) {
		let i, exits, wp, poi, nextCheck, infSeal, seisSeal, vizSeal, bossX;
		let nextAreas = [];

		// Specific area override
		nextAreas[sdk.areas.TamoeHighland] = sdk.areas.MonasteryGate;
		nextAreas[sdk.areas.SpiderForest] = sdk.areas.FlayerJungle;
		nextAreas[sdk.areas.GreatMarsh] = sdk.areas.FlayerJungle;
		nextAreas[sdk.areas.CrystalizedPassage] = sdk.areas.GlacialTrail;
		nextAreas[sdk.areas.GlacialTrail] = sdk.areas.FrozenTundra;
		nextAreas[sdk.areas.AncientsWay] = sdk.areas.ArreatSummit;
		me.area === sdk.areas.CanyonofMagic && (nextAreas[sdk.areas.CanyonofMagic] = getRoom().correcttomb);

		switch (me.area) {
		case sdk.areas.Tristram:
			this.hooks.push({
				name: "POI2",
				type: "unit",
				action: {do: "openChest", id: sdk.quest.chest.Wirt},
				dest: {x: 25048, y: 5177},
				hook: new Text("ÿc<Num 5: Wirt's Leg", Hooks.dashBoard.x + 5, 545 - (this.hooks.length * 10) + Hooks.resfix.y)
			});

			break;
		case sdk.areas.CanyonofMagic:
			{
				let correctTomb = getRoom().correcttomb;
				let currExits = getArea().exits
					.filter((ex) => ex.target !== correctTomb)
					.sort(function(a, b) {
						return a.target - b.target;
					}).reverse();
				
				let curr;
				for (let i = 8; i > 4; i--) {
					curr = currExits.shift();
					this.hooks.push({
						name: "POI" + (i - 3),
						type: "area",
						dest: curr.target,
						hook: new Text("ÿc<Num " + i + ": " + Pather.getAreaName(curr.target), Hooks.dashBoard.x + 5, 545 - (this.hooks.length * 10) + Hooks.resfix.y)
					});
				}

				curr = currExits.shift();
				this.hooks.push({
					name: "Side Area",
					type: "area",
					dest: curr.target,
					hook: new Text("ÿc<Num 4: " + Pather.getAreaName(curr.target), Hooks.dashBoard.x + 5, 545 - (this.hooks.length * 10) + Hooks.resfix.y)
				});

				curr = currExits.shift();
				this.hooks.push({
					name: "POI",
					type: "area",
					dest: curr.target,
					hook: new Text("ÿc<Num 3: " + Pather.getAreaName(curr.target), Hooks.dashBoard.x + 5, 545 - (this.hooks.length * 10) + Hooks.resfix.y)
				});
			}

			break;
		case sdk.areas.SpiderForest:
			this.hooks.push({
				name: "POI3",
				type: "area",
				dest: sdk.areas.GreatMarsh,
				hook: new Text("ÿc<Num 6: " + Pather.getAreaName(sdk.areas.GreatMarsh), Hooks.dashBoard.x + 5, 545 - (this.hooks.length * 10) + Hooks.resfix.y)
			});

			this.hooks.push({
				name: "POI2",
				type: "area",
				dest: 84,
				hook: new Text("ÿc<Num 5: " + Pather.getAreaName(84), Hooks.dashBoard.x + 5, 545 - (this.hooks.length * 10) + Hooks.resfix.y)
			});

			break;
		case sdk.areas.FlayerJungle:
			this.hooks.push({
				name: "POI2",
				type: "area",
				dest: 86,
				hook: new Text("ÿc<Num 5: Swampy Pit Level 1", Hooks.dashBoard.x + 5, 545 - (this.hooks.length * 10) + Hooks.resfix.y)
			});

			break;
		case sdk.areas.KurastBazaar:
			this.hooks.push({
				name: "POI2",
				type: "area",
				dest: 95,
				hook: new Text("ÿc<Num 5: " + Pather.getAreaName(95), Hooks.dashBoard.x + 5, 545 - (this.hooks.length * 10) + Hooks.resfix.y)
			});

			break;
		case sdk.areas.UpperKurast:
			this.hooks.push({
				name: "POI3",
				type: "area",
				dest: sdk.areas.ForgottenTemple,
				hook: new Text("ÿc<Num 6: " + Pather.getAreaName(sdk.areas.ForgottenTemple), Hooks.dashBoard.x + 5, 545 - (this.hooks.length * 10) + Hooks.resfix.y)
			});

			this.hooks.push({
				name: "POI2",
				type: "area",
				dest: sdk.areas.ForgottenReliquary,
				hook: new Text("ÿc<Num 5: " + Pather.getAreaName(sdk.areas.ForgottenReliquary), Hooks.dashBoard.x + 5, 545 - (this.hooks.length * 10) + Hooks.resfix.y)
			});

			break;
		case sdk.areas.KurastCauseway:
			this.hooks.push({
				name: "POI3",
				type: "area",
				dest: sdk.areas.RuinedFane,
				hook: new Text("ÿc<Num 6: " + Pather.getAreaName(sdk.areas.RuinedFane), Hooks.dashBoard.x + 5, 545 - (this.hooks.length * 10) + Hooks.resfix.y)
			});

			this.hooks.push({
				name: "POI2",
				type: "area",
				dest: sdk.areas.DisusedReliquary,
				hook: new Text("ÿc<Num 5: " + Pather.getAreaName(sdk.areas.DisusedReliquary), Hooks.dashBoard.x + 5, 545 - (this.hooks.length * 10) + Hooks.resfix.y)
			});

			break;
		case sdk.areas.ChaosSanctuary:
			infSeal = this.getDiabloSeals(sdk.units.DiabloSealInfector);

			if (infSeal) {
				this.hooks.push({
					name: "POI4",
					type: "unit",
					dest: {x: infSeal.x, y: infSeal.y},
					hook: new Text("ÿc<Num 7: Infector Seal", Hooks.dashBoard.x + 5, 545 - (this.hooks.length * 10) + Hooks.resfix.y)
				});
			}

			seisSeal = this.getDiabloSeals(sdk.units.DiabloSealSeis);

			if (seisSeal) {
				this.hooks.push({
					name: "POI3",
					type: "unit",
					dest: {x: seisSeal.x, y: seisSeal.y},
					hook: new Text("ÿc<Num 6: Seis Seal", Hooks.dashBoard.x + 5, 545 - (this.hooks.length * 10) + Hooks.resfix.y)
				});
			}

			vizSeal = this.getDiabloSeals(sdk.units.DiabloSealVizier);

			if (vizSeal) {
				this.hooks.push({
					name: "POI2",
					type: "unit",
					dest: {x: vizSeal.x, y: vizSeal.y},
					hook: new Text("ÿc<Num 5: Viz Seal", Hooks.dashBoard.x + 5, 545 - (this.hooks.length * 10) + Hooks.resfix.y)
				});
			}

			break;
		}

		let cowPortal = me.area === sdk.areas.RogueEncampment ? Game.getObject(sdk.units.RedPortal) : false;

		if (cowPortal && cowPortal.objtype === sdk.areas.MooMooFarm) {
			this.hooks.push({
				name: "POI2",
				type: "portal",
				dest: sdk.areas.MooMooFarm,
				hook: new Text("ÿc<Num 5: " + Pather.getAreaName(sdk.areas.MooMooFarm), Hooks.dashBoard.x + 5, 545 - (this.hooks.length * 10) + Hooks.resfix.y)
			});
		}

		switch (me.area) {
		case sdk.areas.BloodMoor:
			this.hooks.push({
				name: "Side Area",
				type: "area",
				dest: sdk.areas.DenofEvil,
				hook: new Text("ÿc3Num 4: " + Pather.getAreaName(sdk.areas.DenofEvil), Hooks.dashBoard.x + 5, 545 - (this.hooks.length * 10) + Hooks.resfix.y)
			});

			break;
		case sdk.areas.ColdPlains:
			this.hooks.push({
				name: "Side Area",
				type: "area",
				dest: sdk.areas.BurialGrounds,
				hook: new Text("ÿc3Num 4: " + Pather.getAreaName(sdk.areas.BurialGrounds), Hooks.dashBoard.x + 5, 545 - (this.hooks.length * 10) + Hooks.resfix.y)
			});

			break;
		case sdk.areas.BlackMarsh:
			this.hooks.push({
				name: "Side Area",
				type: "area",
				dest: sdk.areas.ForgottenTower,
				hook: new Text("ÿc3Num 4: " + Pather.getAreaName(sdk.areas.ForgottenTower), Hooks.dashBoard.x + 5, 545 - (this.hooks.length * 10) + Hooks.resfix.y)
			});

			break;
		case sdk.areas.TamoeHighland:
			this.hooks.push({
				name: "Side Area",
				type: "area",
				dest: sdk.areas.PitLvl1,
				hook: new Text("ÿc3Num 4: " + Pather.getAreaName(sdk.areas.PitLvl1), Hooks.dashBoard.x + 5, 545 - (this.hooks.length * 10) + Hooks.resfix.y)
			});

			break;
		case sdk.areas.UndergroundPassageLvl1:
			this.hooks.push({
				name: "Side Area",
				type: "area",
				dest: sdk.areas.UndergroundPassageLvl2,
				hook: new Text("ÿc3Num 4: " + Pather.getAreaName(sdk.areas.UndergroundPassageLvl2), Hooks.dashBoard.x + 5, 545 - (this.hooks.length * 10) + Hooks.resfix.y)
			});

			break;
		case sdk.areas.BurialGrounds:
			this.hooks.push({
				name: "Side Area",
				type: "area",
				dest: sdk.areas.Mausoleum,
				hook: new Text("ÿc3Num 4: " + Pather.getAreaName(sdk.areas.Mausoleum), Hooks.dashBoard.x + 5, 545 - (this.hooks.length * 10) + Hooks.resfix.y)
			});

			break;
		case sdk.areas.LutGholein:
			this.hooks.push({
				name: "Side Area",
				type: "area",
				dest: sdk.areas.HaremLvl1,
				hook: new Text("ÿc3Num 4: " + Pather.getAreaName(sdk.areas.HaremLvl1), Hooks.dashBoard.x + 5, 545 - (this.hooks.length * 10) + Hooks.resfix.y)
			});

			break;
		case sdk.areas.RockyWaste:
			this.hooks.push({
				name: "Side Area",
				type: "area",
				dest: sdk.areas.StonyTombLvl1,
				hook: new Text("ÿc3Num 4: " + Pather.getAreaName(sdk.areas.StonyTombLvl1), Hooks.dashBoard.x + 5, 545 - (this.hooks.length * 10) + Hooks.resfix.y)
			});

			break;
		case sdk.areas.DryHills:
			this.hooks.push({
				name: "Side Area",
				type: "area",
				dest: sdk.areas.HallsoftheDeadLvl1,
				hook: new Text("ÿc3Num 4: " + Pather.getAreaName(sdk.areas.HallsoftheDeadLvl1), Hooks.dashBoard.x + 5, 545 - (this.hooks.length * 10) + Hooks.resfix.y)
			});

			break;
		case sdk.areas.FarOasis:
			this.hooks.push({
				name: "Side Area",
				type: "area",
				dest: sdk.areas.MaggotLairLvl1,
				hook: new Text("ÿc3Num 4: " + Pather.getAreaName(sdk.areas.MaggotLairLvl1), Hooks.dashBoard.x + 5, 545 - (this.hooks.length * 10) + Hooks.resfix.y)
			});

			break;
		case sdk.areas.LostCity:
			this.hooks.push({
				name: "Side Area",
				type: "area",
				dest: sdk.areas.AncientTunnels,
				hook: new Text("ÿc3Num 4: " + Pather.getAreaName(sdk.areas.AncientTunnels), Hooks.dashBoard.x + 5, 545 - (this.hooks.length * 10) + Hooks.resfix.y)
			});

			break;
		case sdk.areas.SpiderForest:
			this.hooks.push({
				name: "Side Area",
				type: "area",
				dest: sdk.areas.SpiderCavern,
				hook: new Text("ÿc3Num 4: " + Pather.getAreaName(sdk.areas.SpiderCavern), Hooks.dashBoard.x + 5, 545 - (this.hooks.length * 10) + Hooks.resfix.y)
			});

			break;
		case sdk.areas.FlayerJungle:
			this.hooks.push({
				name: "Side Area",
				type: "area",
				dest: sdk.areas.FlayerDungeonLvl1,
				hook: new Text("ÿc3Num 4: " + Pather.getAreaName(sdk.areas.FlayerDungeonLvl1), Hooks.dashBoard.x + 5, 545 - (this.hooks.length * 10) + Hooks.resfix.y)
			});

			break;
		case sdk.areas.KurastBazaar:
			this.hooks.push({
				name: "Side Area",
				type: "area",
				dest: sdk.areas.RuinedTemple,
				hook: new Text("ÿc3Num 4: " + Pather.getAreaName(sdk.areas.RuinedTemple), Hooks.dashBoard.x + 5, 545 - (this.hooks.length * 10) + Hooks.resfix.y)
			});

			break;
		case sdk.areas.UpperKurast:
			this.hooks.push({
				name: "Side Area",
				type: "area",
				dest: sdk.areas.A3SewersLvl1,
				hook: new Text("ÿc3Num 4: " + Pather.getAreaName(sdk.areas.A3SewersLvl1), Hooks.dashBoard.x + 5, 545 - (this.hooks.length * 10) + Hooks.resfix.y)
			});

			break;
		case sdk.areas.KurastCauseway:
			this.hooks.push({
				name: "Side Area",
				type: "area",
				dest: sdk.areas.DisusedReliquary,
				hook: new Text("ÿc3Num 4: " + Pather.getAreaName(sdk.areas.A3SewersLvl1), Hooks.dashBoard.x + 5, 545 - (this.hooks.length * 10) + Hooks.resfix.y)
			});

			break;
		case sdk.areas.A3SewersLvl1:
			this.hooks.push({
				name: "Side Area",
				type: "area",
				dest: sdk.areas.KurastBazaar,
				hook: new Text("ÿc3Num 4: " + Pather.getAreaName(sdk.areas.KurastBazaar), Hooks.dashBoard.x + 5, 545 - (this.hooks.length * 10) + Hooks.resfix.y)
			});

			break;
		case sdk.areas.CrystalizedPassage:
			this.hooks.push({
				name: "Side Area",
				type: "area",
				dest: sdk.areas.FrozenRiver,
				hook: new Text("ÿc3Num 4: " + Pather.getAreaName(sdk.areas.FrozenRiver), Hooks.dashBoard.x + 5, 545 - (this.hooks.length * 10) + Hooks.resfix.y)
			});

			break;
		case sdk.areas.GlacialTrail:
			this.hooks.push({
				name: "Side Area",
				type: "area",
				dest: sdk.areas.DrifterCavern,
				hook: new Text("ÿc3Num 4: " + Pather.getAreaName(sdk.areas.DrifterCavern), Hooks.dashBoard.x + 5, 545 - (this.hooks.length * 10) + Hooks.resfix.y)
			});

			break;
		case sdk.areas.AncientsWay:
			this.hooks.push({
				name: "Side Area",
				type: "area",
				dest: sdk.areas.IcyCellar,
				hook: new Text("ÿc3Num 4: " + Pather.getAreaName(sdk.areas.IcyCellar), Hooks.dashBoard.x + 5, 545 - (this.hooks.length * 10) + Hooks.resfix.y)
			});

			break;
		}

		poi = VectorHooks.getPOI();

		if (poi) {
			this.hooks.push({
				name: "POI",
				type: "unit",
				action: poi.action || false,
				dest: {x: poi.x, y: poi.y},
				hook: new Text("ÿc<Num 3: " + poi.name, Hooks.dashBoard.x + 5, 545 - (this.hooks.length * 10) + Hooks.resfix.y)
			});
		}

		wp = VectorHooks.getWP();

		if (wp) {
			this.hooks.push({
				name: "Waypoint",
				type: "wp",
				dest: {x: wp.x, y: wp.y},
				hook: new Text("ÿc9Num 2: WP", Hooks.dashBoard.x + 5, 545 - (this.hooks.length * 10) + Hooks.resfix.y)
			});
		}

		let uberPortals = (me.area === sdk.areas.Harrogath && me.hell) ? getUnits(sdk.unittype.Object, sdk.units.RedPortal) : false;

		if (uberPortals && uberPortals.some((portal) => [sdk.areas.MatronsDen, sdk.areas.ForgottenSands, sdk.areas.FurnaceofPain, sdk.areas.UberTristram].includes(portal.objtype))) {
			TextHooks.displaySettings = false;
			this.frame.push({
				name: "portalbox",
				hook: new Box (Hooks.portalBoard.x - 8, Hooks.portalBoard.y + Hooks.resfix.y - 17, 190, 70, 0x0, 1, 0)
			});

			this.frame.push({
				name: "portalframe",
				hook: new Frame(Hooks.portalBoard.x - 8, Hooks.portalBoard.y + Hooks.resfix.y - 17, 190, 70, 0)
			});

			Pather.getPortal(sdk.areas.MatronsDen) && this.portals.push({
				name: "Matron's Den",
				type: "portal",
				dest: sdk.areas.MatronsDen,
				hook: new Text("ÿc1Num 5: Matron's Den", Hooks.portalBoard.x, Hooks.portalBoard.y + Hooks.resfix.y)
			});

			Pather.getPortal(sdk.areas.ForgottenSands) && this.portals.push({
				name: "Sands",
				type: "portal",
				dest: sdk.areas.ForgottenSands,
				hook: new Text("ÿc1Num 6: Forgotten Sands", Hooks.portalBoard.x, Hooks.portalBoard.y + Hooks.resfix.y + 15)
			});

			Pather.getPortal(sdk.areas.FurnaceofPain) && this.portals.push({
				name: "Furnace",
				type: "portal",
				dest: sdk.areas.FurnaceofPain,
				hook: new Text("ÿc1Num 7: Furnace of Pain", Hooks.portalBoard.x, Hooks.portalBoard.y + Hooks.resfix.y + 30)
			});

			Pather.getPortal(sdk.areas.UberTristram) && this.portals.push({
				name: "Uber Tristam",
				type: "portal",
				dest: sdk.areas.UberTristram,
				hook: new Text("ÿc1Num 8: Uber Tristam", Hooks.portalBoard.x, Hooks.portalBoard.y + Hooks.resfix.y + 45)
			});
		}

		let entrance = {x: 0, y: 0};

		switch (me.area) {
		case sdk.areas.Tristram:
			this.hooks.push({
				name: "Previous Area",
				type: "portal",
				dest: sdk.areas.StonyField,
				hook: new Text("ÿc1Num 1: " + Pather.getAreaName(sdk.areas.StonyField), Hooks.dashBoard.x + 5, 545 - (this.hooks.length * 10) + Hooks.resfix.y)
			});

			break;
		case sdk.areas.MooMooFarm:
			this.hooks.push({
				name: "Previous Area",
				type: "portal",
				dest: sdk.areas.RogueEncampment,
				hook: new Text("ÿc1Num 1: " + Pather.getAreaName(1), Hooks.dashBoard.x + 5, 545 - (this.hooks.length * 10) + Hooks.resfix.y)
			});

			break;
		case sdk.areas.CanyonofMagic:
			this.hooks.push({
				name: "Previous Area",
				type: "portal",
				dest: sdk.areas.ArcaneSanctuary,
				hook: new Text("ÿc1Num 1: " + Pather.getAreaName(sdk.areas.ArcaneSanctuary), Hooks.dashBoard.x + 5, 545 - (this.hooks.length * 10) + Hooks.resfix.y)
			});

			break;
		case sdk.areas.ArcaneSanctuary:
			this.hooks.push({
				name: "Previous Area",
				type: "area",
				dest: sdk.areas.PalaceCellarLvl3,
				hook: new Text("ÿc1Num 1: " + Pather.getAreaName(sdk.areas.PalaceCellarLvl3), Hooks.dashBoard.x + 5, 545 - (this.hooks.length * 10) + Hooks.resfix.y)
			});

			this.hooks.push({
				name: "Next Area",
				type: "area",
				dest: sdk.areas.CanyonofMagic,
				hook: new Text("Num 0: " + Pather.getAreaName(sdk.areas.CanyonofMagic), Hooks.dashBoard.x + 5, 545 - (this.hooks.length * 10) + Hooks.resfix.y)
			});

			break;
		case sdk.areas.NihlathaksTemple:
			this.hooks.push({
				name: "Previous Area",
				type: "unit",
				action: {do: "usePortal", id: sdk.areas.Harrogath},
				dest: {x: 10071, y: 13305},
				hook: new Text("ÿc1Num 1: " + Pather.getAreaName(sdk.areas.Harrogath), Hooks.dashBoard.x + 5, 545 - (this.hooks.length * 10) + Hooks.resfix.y)
			});

			break;
		case sdk.areas.Abaddon:
			this.hooks.push({
				name: "Previous Area",
				type: "portal",
				dest: sdk.areas.FrigidHighlands,
				hook: new Text("ÿc1Num 1: " + Pather.getAreaName(sdk.areas.FrigidHighlands), Hooks.dashBoard.x + 5, 545 - (this.hooks.length * 10) + Hooks.resfix.y)
			});

			break;
		case sdk.areas.PitofAcheron:
			this.hooks.push({
				name: "Previous Area",
				type: "portal",
				dest: sdk.areas.ArreatPlateau,
				hook: new Text("ÿc1Num 1: " + Pather.getAreaName(sdk.areas.ArreatPlateau), Hooks.dashBoard.x + 5, 545 - (this.hooks.length * 10) + Hooks.resfix.y)
			});

			break;
		case sdk.areas.InfernalPit:
			this.hooks.push({
				name: "Previous Area",
				type: "portal",
				dest: sdk.areas.FrozenTundra,
				hook: new Text("ÿc1Num 1: " + Pather.getAreaName(sdk.areas.FrozenTundra), Hooks.dashBoard.x + 5, 545 - (this.hooks.length * 10) + Hooks.resfix.y)
			});

			break;
		case sdk.areas.ForgottenSands:
			me.area === sdk.areas.ForgottenSands && (entrance = {x: 20193, y: 8693});
		// eslint-disable-next-line no-fallthrough
		case sdk.areas.MatronsDen:
		case sdk.areas.FurnaceofPain:
			bossX = Game.getPresetObject(me.area, sdk.units.SmallSparklyChest);
			bossX && (entrance = this.areaInfo[me.area][bossX.x]);
		// eslint-disable-next-line no-fallthrough
		case sdk.areas.UberTristram:
			me.area === sdk.areas.UberTristram && (entrance = {x: 25105, y: 5140});

			this.hooks.push({
				name: "Previous Area",
				type: "unit",
				action: {do: "usePortal", id: sdk.areas.Harrogath},
				dest: entrance,
				hook: new Text("ÿc1Num 1: " + Pather.getAreaName(sdk.areas.Harrogath), Hooks.dashBoard.x + 5, 545 - (this.hooks.length * 10) + Hooks.resfix.y)
			});

			break;
		}

		exits = getArea(area).exits;

		if (exits) {
			for (i = 0; i < exits.length; i += 1) {
				if (exits[i].target === this.prevAreas[me.area]) {
					this.hooks.push({
						name: "Previous Area",
						type: "area",
						dest: this.prevAreas[me.area],
						hook: new Text("ÿc1Num 1: " + Pather.getAreaName(this.prevAreas[me.area]), Hooks.dashBoard.x + 5, 545 - (this.hooks.length * 10) + Hooks.resfix.y)
					});

					break;
				}
			}

			// Check nextAreas first
			for (i = 0; i < exits.length; i += 1) {
				if (exits[i].target === nextAreas[me.area]) {
					this.hooks.push({
						name: "Next Area",
						type: "area",
						dest: nextAreas[me.area],
						hook: new Text("ÿc3Num 0: " + Pather.getAreaName(nextAreas[me.area]), Hooks.dashBoard.x + 5, 545 - (this.hooks.length * 10) + Hooks.resfix.y)
					});

					nextCheck = true;

					break;
				}
			}

			// In case the area isn't in nextAreas array, use this.prevAreas array
			if (!nextCheck) {
				for (i = 0; i < exits.length; i += 1) {
					if (exits[i].target === this.prevAreas.indexOf(me.area)) {
						this.hooks.push({
							name: "Next Area",
							type: "area",
							dest: this.prevAreas.indexOf(me.area),
							hook: new Text("Num 0: " + Pather.getAreaName(this.prevAreas.indexOf(me.area)), Hooks.dashBoard.x + 5, 545 - (this.hooks.length * 10) + Hooks.resfix.y)
						});

						break;
					}
				}
			}
		}

		if (poi && poi.name === "Orifice") {
			this.hooks.push({
				name: "Next Area",
				dest: sdk.areas.DurielsLair,
				type: "area",
				hook: new Text("Num 0: " + Pather.getAreaName(sdk.areas.DurielsLair), Hooks.dashBoard.x + 5, 545 - (this.hooks.length * 10) + Hooks.resfix.y)
			});
		}

		if (me.area === sdk.areas.DuranceofHateLvl3) {
			this.hooks.push({
				name: "Next Area",
				dest: sdk.areas.PandemoniumFortress,
				type: "area",
				hook: new Text("Num 0: " + Pather.getAreaName(sdk.areas.PandemoniumFortress), Hooks.dashBoard.x + 5, 545 - (this.hooks.length * 10) + Hooks.resfix.y)
			});
		}

		if (me.area === sdk.areas.ThroneofDestruction) {
			this.hooks.push({
				name: "Next Area",
				dest: sdk.areas.WorldstoneChamber,
				type: "portal",
				hook: new Text("ÿc3Num 0: " + Pather.getAreaName(sdk.areas.WorldstoneChamber), Hooks.dashBoard.x + 5, 545 - (this.hooks.length * 10) + Hooks.resfix.y)
			});
		}
	},

	getDiabloSeals: function (seal) {
		let unit = Game.getPresetObject(sdk.areas.ChaosSanctuary, seal);

		if (unit) {
			if (unit instanceof PresetUnit) {
				return {
					x: unit.roomx * 5 + unit.x,
					y: unit.roomy * 5 + unit.y,
				};
			}
			
			return {
				x: unit.x,
				y: unit.y,
			};
		}

		return false;
	},

	getHook: function (name) {
		for (let i = 0; i < this.hooks.length; i += 1) {
			if (this.hooks[i].name === name) {
				return this.hooks[i];
			}
		}

		return false;
	},

	getPortalHook: function (name) {
		for (let i = 0; i < this.portals.length; i += 1) {
			if (this.portals[i].name === name) {
				return this.portals[i];
			}
		}

		return false;
	},

	flush: function () {
		while (this.hooks.length) {
			this.hooks.shift().hook.remove();
		}

		while (this.portals.length) {
			this.portals.shift().hook.remove();
		}

		while (this.frame.length) {
			this.frame.shift().hook.remove();
		}

		this.currArea = 0;
	}
};
