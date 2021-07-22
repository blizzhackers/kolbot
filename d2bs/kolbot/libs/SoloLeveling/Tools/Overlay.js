/*
*	@filename	Overlay.js
*	@author		isid0re
*	@desc		overlay thread from SoloLeveling
*	@credits 	theBGuy and Adpist for first gen Overlay, laz for his manual play, dzik for his hookHandler, securitycat, kolton libs
*/

if (!isIncluded("SoloLeveling/Tools/Developer.js")) {
	include("SoloLeveling/Tools/Developer.js");
}

if (!isIncluded("SoloLeveling/Tools/Tracker.js")) {
	include("SoloLeveling/Tools/Tracker.js");
}

var Overlay = {
	resfixX: me.screensize ? 0 : -100,
	resfixY: me.screensize ? 0 : -120,
	questX: 12,
	questY: 302,
	dashboardX: 410,
	dashboardY: 480,
	text: {
		hooks: [],
		enabled: true,

		clock: function (name) {
			var GameTracker = Developer.readObj(Tracker.GTPath),
				PrettyTotal = Developer.formatTime(GameTracker.Total + Developer.Timer(GameTracker.LastSave)),
				PrettyIG = Developer.formatTime(GameTracker.InGame + Developer.Timer(GameTracker.LastSave));

			switch (name) {
			case "Total":
				return PrettyTotal;
			case "InGame":
				return PrettyIG;
			case "OOG":
				return Developer.formatTime(GameTracker.OOG);
			}

			return true;
		},

		getRes: function (resistance) {
			var penalty = [[0, 20, 50], [0, 40, 100]][me.gametype][me.diff];

			switch (resistance) {
			case "fire":
				return me.getStat(39) - penalty;
			case "cold":
				return me.getStat(43) - penalty;
			case "light":
				return me.getStat(41) - penalty;
			case "poison":
				return me.getStat(45) - penalty;
			case "gold":
				return me.getStat(14) + me.getStat(15);
			default:
				break;
			}

			return -1;
		},

		check: function () {
			if (!this.enabled) {
				this.flush();

				return;
			}

			if (!this.getHook("dashboard")) {
				this.add("dashboard");
			}

			if (!this.getHook("dashboardframe")) {
				this.add("dashboardframe");
			}

			if (!this.getHook("credits")) {
				this.add("credits");
			} else {
				this.getHook("credits").hook.text = "SoloLeveling by ÿc0 isidOre";
			}

			if (!this.getHook("times")) {
				this.add("times");
			} else {
				this.getHook("times").hook.text = "Total: ÿc0" + this.clock("Total") + "ÿc4 InGame: ÿc0" + this.clock("InGame") + "ÿc4 OOG: ÿc0" + this.clock("OOG");
			}

			if (!this.getHook("level")) {
				this.add("level");
			} else {
				this.getHook("level").hook.text = "Name: ÿc0" + me.name + "ÿc4  Diff: ÿc0" + Difficulty[me.diff] + "ÿc4  Level: ÿc0" + me.charlvl;
			}

			if (!this.getHook("resistances")) {
				this.add("resistances");
			} else {
				this.getHook("resistances").hook.text = "FR: ÿc1" + this.getRes("fire") + "ÿc4   CR: ÿc3" + this.getRes("cold") + "ÿc4   LR: ÿc9" + this.getRes("light") + "ÿc4   PR: ÿc2" + this.getRes("poison") + "ÿc4   Gold: ÿc0" + this.getRes("gold");
			}

			switch (me.act) {
			case 1:
				if (!this.getHook("questbox")) {
					this.add("questbox");
				}

				if (!this.getHook("questframe")) {
					this.add("questframe");
				}

				if (!this.getHook("questheader")) {
					this.add("questheader");
				} else {
					this.getHook("questheader").hook.text = "Quests in Act: ÿc0" + me.act;
				}

				if (!this.getHook("Den")) {
					this.add("Den");
				} else {
					this.getHook("Den").hook.text = "Den: " + (me.getQuest(1, 0) ? "ÿc2Complete" : "ÿc1Incomplete");
				}

				if (!this.getHook("BloodRaven")) {
					this.add("BloodRaven");
				} else {
					this.getHook("BloodRaven").hook.text = "Blood Raven: " + (me.getQuest(2, 0) ? "ÿc2Complete" : "ÿc1Incomplete");
				}

				if (!this.getHook("Tristram")) {
					this.add("Tristram");
				} else {
					this.getHook("Tristram").hook.text = "Tristram: " + (me.getQuest(4, 0) ? "ÿc2Complete" : "ÿc1Incomplete");
				}

				if (!this.getHook("Countess")) {
					this.add("Countess");
				} else {
					this.getHook("Countess").hook.text = "Countess: " + (me.getQuest(5, 0) ? "ÿc2Complete" : "ÿc1Incomplete");
				}

				if (!this.getHook("Smith")) {
					this.add("Smith");
				} else {
					this.getHook("Smith").hook.text = "Smith: " + (me.getQuest(3, 0) || me.getQuest(3, 1) ? "ÿc2Complete" : "ÿc1Incomplete");
				}

				if (!this.getHook("Andariel")) {
					this.add("Andariel");
				} else {
					this.getHook("Andariel").hook.text = "Andariel: " + (me.getQuest(6, 0) ? "ÿc2Complete" : "ÿc1Incomplete");
				}


				break;
			case 2:
				if (!this.getHook("questbox")) {
					this.add("questbox");
				}

				if (!this.getHook("questframe")) {
					this.add("questframe");
				}

				if (!this.getHook("questheader")) {
					this.add("questheader");
				} else {
					this.getHook("questheader").hook.text = "Quests in Act: ÿc0" + me.act;
				}

				if (!this.getHook("Cube")) {
					this.add("Cube");
				} else {
					this.getHook("Cube").hook.text = "Horadric Cube: " + (me.getItem(553) ? "ÿc2Complete" : "ÿc1Incomplete");
				}

				if (!this.getHook("Radament")) {
					this.add("Radament");
				} else {
					this.getHook("Radament").hook.text = "Radament: " + (me.getQuest(9, 0) ? "ÿc2Complete" : "ÿc1Incomplete");
				}

				if (!this.getHook("HoradricStaff")) {
					this.add("HoradricStaff");
				} else {
					this.getHook("HoradricStaff").hook.text = "Horadric Staff: " + (me.getQuest(10, 0) ? "ÿc2Complete" : "ÿc1Incomplete");
				}

				if (!this.getHook("Amulet")) {
					this.add("Amulet");
				} else {
					this.getHook("Amulet").hook.text = "Amulet: " + (me.getQuest(11, 0) ? "ÿc2Complete" : "ÿc1Incomplete");
				}

				if (!this.getHook("Summoner")) {
					this.add("Summoner");
				} else {
					this.getHook("Summoner").hook.text = "Summoner: " + (me.getQuest(13, 0) ? "ÿc2Complete" : "ÿc1Incomplete");
				}

				if (!this.getHook("Duriel")) {
					this.add("Duriel");
				} else {
					this.getHook("Duriel").hook.text = "Duriel: " + (me.getQuest(14, 0) ? "ÿc2Complete" : "ÿc1Incomplete");
				}

				break;
			case 3:
				if (!this.getHook("questbox")) {
					this.add("questbox");
				}

				if (!this.getHook("questframe")) {
					this.add("questframe");
				}

				if (!this.getHook("questheader")) {
					this.add("questheader");
				} else {
					this.getHook("questheader").hook.text = "Quests in Act: ÿc0" + me.act;
				}

				if (!this.getHook("GoldenBird")) {
					this.add("GoldenBird");
				} else {
					this.getHook("GoldenBird").hook.text = "Golden Bird: " + (me.getQuest(20, 0) ? "ÿc2Complete" : "ÿc1Incomplete");
				}

				if (!this.getHook("Khalim'sWill")) {
					this.add("Khalim'sWill");
				} else {
					this.getHook("Khalim'sWill").hook.text = "Khalim's Will: " + (me.getQuest(18, 0) ? "ÿc2Complete" : "ÿc1Incomplete");
				}

				if (!this.getHook("LamEsen")) {
					this.add("LamEsen");
				} else {
					this.getHook("LamEsen").hook.text = "LamEsen: " + (me.getQuest(17, 0) ? "ÿc2Complete" : "ÿc1Incomplete");
				}

				if (!this.getHook("Travincal")) {
					this.add("Travincal");
				} else {
					this.getHook("Travincal").hook.text = "Travincal: " + (me.getQuest(21, 0) ? "ÿc2Complete" : "ÿc1Incomplete");
				}

				if (!this.getHook("Mephisto")) {
					this.add("Mephisto");
				} else {
					this.getHook("Mephisto").hook.text = "Mephisto: " + (me.getQuest(22, 0) ? "ÿc2Complete" : "ÿc1Incomplete");
				}

				break;
			case 4:
				if (!this.getHook("questbox")) {
					this.add("questbox");
				}

				if (!this.getHook("questframe")) {
					this.add("questframe");
				}

				if (!this.getHook("questheader")) {
					this.add("questheader");
				} else {
					this.getHook("questheader").hook.text = "Quests in Act: ÿc0" + me.act;
				}

				if (!this.getHook("Izual")) {
					this.add("Izual");
				} else {
					this.getHook("Izual").hook.text = "Izual: " + (me.getQuest(25, 0) ? "ÿc2Complete" : "ÿc1Incomplete");
				}

				if (!this.getHook("HellForge")) {
					this.add("HellForge");
				} else {
					this.getHook("HellForge").hook.text = "HellForge: " + (me.getQuest(27, 0) ? "ÿc2Complete" : "ÿc1Incomplete");
				}

				if (!this.getHook("Diablo")) {
					this.add("Diablo");
				} else {
					this.getHook("Diablo").hook.text = "Diablo: " + (me.getQuest(26, 0) ? "ÿc2Complete" : "ÿc1Incomplete");
				}

				break;
			case 5:
				if (!this.getHook("questbox")) {
					this.add("questbox");
				}

				if (!this.getHook("questframe")) {
					this.add("questframe");
				}

				if (!this.getHook("questheader")) {
					this.add("questheader");
				} else {
					this.getHook("questheader").hook.text = "Quests in Act: ÿc0" + me.act;
				}

				if (!this.getHook("Shenk")) {
					this.add("Shenk");
				} else {
					this.getHook("Shenk").hook.text = "Shenk: " + ((me.getQuest(35, 0) || me.getQuest(35, 1)) ? "ÿc2Complete" : "ÿc1Incomplete");
				}

				if (!this.getHook("Barbies")) {
					this.add("Barbies");
				} else {
					this.getHook("Barbies").hook.text = "Barbies: " + (me.getQuest(36, 0) ? "ÿc2Complete" : "ÿc1Incomplete");
				}

				if (!this.getHook("Anya")) {
					this.add("Anya");
				} else {
					this.getHook("Anya").hook.text = "Anya: " + (me.getQuest(37, 0) ? "ÿc2Complete" : "ÿc1Incomplete");
				}

				if (!this.getHook("Ancients")) {
					this.add("Ancients");
				} else {
					this.getHook("Ancients").hook.text = "Ancients: " + (me.getQuest(39, 0) ? "ÿc2Complete" : "ÿc1Incomplete");
				}

				if (!this.getHook("Baal")) {
					this.add("Baal");
				} else {
					this.getHook("Baal").hook.text = "Baal: " + (me.getQuest(40, 0) ? "ÿc2Complete" : "ÿc1Incomplete");
				}

				break;
			}
		},

		add: function (name) {
			switch (name) {
			case "dashboard":
				this.hooks.push({
					name: "dashboard",
					hook: new Box(Overlay.dashboardX + Overlay.resfixX, Overlay.dashboardY + Overlay.resfixY, 370, 65, 0x0, 1, 2)
				});

				break;
			case "dashboardframe":
				this.hooks.push({
					name: "dashboardframe",
					hook: new Frame(Overlay.dashboardX + Overlay.resfixX, Overlay.dashboardY + Overlay.resfixY, 370, 65, 2)
				});

				break;
			case "questbox":
				this.hooks.push({
					name: "questbox",
					hook: new Box (Overlay.questX - 8, Overlay.questY + Overlay.resfixY - 17, 190, 10 + [0, 105, 90, 90, 60, 90][me.act], 0x0, 1, 0)
				});

				break;
			case "questframe":
				this.hooks.push({
					name: "questframe",
					hook: new Frame(Overlay.questX - 8, Overlay.questY + Overlay.resfixY - 17, 190, 10 + [0, 105, 90, 90, 60, 90][me.act], 0)
				});

				break;
			case "questheader":
				this.hooks.push({
					name: "questheader",
					hook: new Text("Quests in Act: ÿc0" + me.act, Overlay.questX, Overlay.questY + Overlay.resfixY, 4, 13, 0)
				});

				break;

			case "credits":
				this.hooks.push({
					name: "credits",
					hook: new Text("SoloLeveling by ÿc0 isidOre", Overlay.dashboardX + Overlay.resfixX, Overlay.dashboardY + Overlay.resfixY + 15, 4, 13, 2)
				});

				break;

			case "level":
				this.hooks.push({
					name: "level",
					hook: new Text("Name: ÿc0" + me.name + "ÿc4  Diff: ÿc0" + Difficulty[me.diff] + "ÿc4  Level: ÿc0" + me.charlvl, Overlay.dashboardX + Overlay.resfixX, Overlay.dashboardY + Overlay.resfixY + 30, 4, 13, 2)
				});

				break;
			case "times":
				this.hooks.push({
					name: "times",
					hook: new Text("Total: ÿc0" + this.clock("Total") + "ÿc4 InGame: ÿc0" + this.clock("InGame") + "ÿc4 OOG: ÿc0" + this.clock("OOG"), Overlay.dashboardX + Overlay.resfixX, Overlay.dashboardY + Overlay.resfixY + 60, 4, 13, 2)
				});

				break;
			case "resistances":
				this.hooks.push({
					name: "resistances",
					hook: new Text(
						"FR: ÿc1" + this.getRes("fire") + "ÿc4   CR: ÿc3" + this.getRes("cold") + "ÿc4   LR: ÿc9" + this.getRes("light") + "ÿc4   PR: ÿc2" + this.getRes("poison") + "ÿc4   Gold: ÿc0" + this.getRes("poison"), Overlay.dashboardX + Overlay.resfixX, Overlay.dashboardY + Overlay.resfixY + 45, 4, 13, 2)
				});

				break;
			case "Den":
				this.hooks.push({
					name: "Den",
					hook: new Text("Den: " + (me.getQuest(1, 0) ? "ÿc2Complete" : "ÿc1Incomplete"), Overlay.questX, Overlay.questY + Overlay.resfixY + 15, 4, 13, 0)
				});

				break;
			case "BloodRaven":
				this.hooks.push({
					name: "BloodRaven",
					hook: new Text("Blood Raven: " + (me.getQuest(2, 0) ? "ÿc2Complete" : "ÿc1Incomplete"), Overlay.questX, Overlay.questY + Overlay.resfixY + 30, 4, 13, 0)
				});

				break;
			case "Tristram":
				this.hooks.push({
					name: "Tristram",
					hook: new Text("Tristram: " + (me.getQuest(4, 0) ? "ÿc2Complete" : "ÿc1Incomplete"), Overlay.questX, Overlay.questY + Overlay.resfixY + 45, 4, 13, 0)
				});

				break;
			case "Countess":
				this.hooks.push({
					name: "Countess",
					hook: new Text("Countess: " + (me.getQuest(5, 0) ? "ÿc2Complete" : "ÿc1Incomplete"), Overlay.questX, Overlay.questY + Overlay.resfixY + 60, 4, 13, 0)
				});

				break;
			case "Smith":
				this.hooks.push({
					name: "Smith",
					hook: new Text("Smith: " + (me.getQuest(3, 0) || me.getQuest(3, 1) ? "ÿc2Complete" : "ÿc1Incomplete"), Overlay.questX, Overlay.questY + Overlay.resfixY + 75, 4, 13, 0)
				});

				break;
			case "Andariel":
				this.hooks.push({
					name: "Andariel",
					hook: new Text("Andariel: " + (me.getQuest(6, 0) ? "ÿc2Complete" : "ÿc1Incomplete"), Overlay.questX, Overlay.questY + Overlay.resfixY + 90, 4, 13, 0)
				});

				break;
			case "Radament":
				this.hooks.push({
					name: "Radament",
					hook: new Text("Radament: " + (me.getQuest(9, 0) ? "ÿc2Complete" : "ÿc1Incomplete"), Overlay.questX, Overlay.questY + Overlay.resfixY + 15, 4, 13, 0)
				});

				break;
			case "HoradricStaff":
				this.hooks.push({
					name: "HoradricStaff",
					hook: new Text("Horadric Staff: " + (me.getQuest(10, 0) ? "ÿc2Complete" : "ÿc1Incomplete"), Overlay.questX, Overlay.questY + Overlay.resfixY + 30, 4, 13, 0)
				});

				break;
			case "Amulet":
				this.hooks.push({
					name: "Amulet",
					hook: new Text("Amulet: " + (me.getQuest(11, 0) ? "ÿc2Complete" : "ÿc1Incomplete"), Overlay.questX, Overlay.questY + Overlay.resfixY + 45, 4, 13, 0)
				});

				break;
			case "Summoner":
				this.hooks.push({
					name: "Summoner",
					hook: new Text("Summoner: " + (me.getQuest(13, 0) ? "ÿc2Complete" : "ÿc1Incomplete"), Overlay.questX, Overlay.questY + Overlay.resfixY + 60, 4, 13, 0)
				});

				break;
			case "Duriel":
				this.hooks.push({
					name: "Duriel",
					hook: new Text("Duriel: " + (me.getQuest(14, 0) ? "ÿc2Complete" : "ÿc1Incomplete"), Overlay.questX, Overlay.questY + Overlay.resfixY + 75, 4, 13, 0)
				});

				break;
			case "GoldenBird":
				this.hooks.push({
					name: "GoldenBird",
					hook: new Text("Golden Bird: " + (me.getQuest(20, 0) ? "ÿc2Complete" : "ÿc1Incomplete"), Overlay.questX, Overlay.questY + Overlay.resfixY + 15, 4, 13, 0)
				});

				break;
			case "Khalim'sWill":
				this.hooks.push({
					name: "Khalim'sWill",
					hook: new Text("Khalim's Will: " + (me.getQuest(18, 0) ? "ÿc2Complete" : "ÿc1Incomplete"), Overlay.questX, Overlay.questY + Overlay.resfixY + 30, 4, 13, 0)
				});

				break;
			case "LamEsen":
				this.hooks.push({
					name: "LamEsen",
					hook: new Text("LamEsen: " + (me.getQuest(17, 0) ? "ÿc2Complete" : "ÿc1Incomplete"), Overlay.questX, Overlay.questY + Overlay.resfixY + 45, 4, 13, 0)
				});

				break;
			case "Travincal":
				this.hooks.push({
					name: "Travincal",
					hook: new Text("Travincal: " + (me.getQuest(21, 0) ? "ÿc2Complete" : "ÿc1Incomplete"), Overlay.questX, Overlay.questY + Overlay.resfixY + 60, 4, 13, 0)
				});

				break;
			case "Mephisto":
				this.hooks.push({
					name: "Mephisto",
					hook: new Text("Mephisto: " + (me.getQuest(22, 0) ? "ÿc2Complete" : "ÿc1Incomplete"), Overlay.questX, Overlay.questY + Overlay.resfixY + 75, 4, 13, 0)
				});

				break;
			case "Izual":
				this.hooks.push({
					name: "Izual",
					hook: new Text("Izual: " + (me.getQuest(25, 0) ? "ÿc2Complete" : "ÿc1Incomplete"), Overlay.questX, Overlay.questY + Overlay.resfixY + 15, 4, 13, 0)
				});

				break;
			case "HellForge":
				this.hooks.push({
					name: "HellForge",
					hook: new Text("HellForge: " + (me.getQuest(27, 0) ? "ÿc2Complete" : "ÿc1Incomplete"), Overlay.questX, Overlay.questY + Overlay.resfixY + 30, 4, 13, 0)
				});

				break;
			case "Diablo":
				this.hooks.push({
					name: "Diablo",
					hook: new Text("Diablo: " + (me.getQuest(26, 0) ? "ÿc2Complete" : "ÿc1Incomplete"), Overlay.questX, Overlay.questY + Overlay.resfixY + 45, 4, 13, 0)
				});

				break;
			case "Shenk":
				this.hooks.push({
					name: "Shenk",
					hook: new Text("Shenk: " + ((me.getQuest(35, 0) || me.getQuest(35, 1)) ? "ÿc2Complete" : "ÿc1Incomplete"), Overlay.questX, Overlay.questY + Overlay.resfixY + 15, 4, 13, 0)
				});

				break;
			case "Barbies":
				this.hooks.push({
					name: "Barbies",
					hook: new Text("Barbies: " + (me.getQuest(36, 0) ? "ÿc2Complete" : "ÿc1Incomplete"), Overlay.questX, Overlay.questY + Overlay.resfixY + 30, 4, 13, 0)
				});

				break;
			case "Anya":
				this.hooks.push({
					name: "Anya",
					hook: new Text("Anya: " + (me.getQuest(37, 0) ? "ÿc2Complete" : "ÿc1Incomplete"), Overlay.questX, Overlay.questY + Overlay.resfixY + 45, 4, 13, 0)
				});

				break;
			case "Ancients":
				this.hooks.push({
					name: "Ancients",
					hook: new Text("Ancients: " + (me.getQuest(39, 0) ? "ÿc2Complete" : "ÿc1Incomplete"), Overlay.questX, Overlay.questY + Overlay.resfixY + 60, 4, 13, 0)
				});

				break;
			case "Baal":
				this.hooks.push({
					name: "Baal",
					hook: new Text("Baal: " + (me.getQuest(26, 0) ? "ÿc2Complete" : "ÿc1Incomplete"), Overlay.questX, Overlay.questY + Overlay.resfixY + 75, 4, 13, 0)
				});

				break;
			}
		},

		getHook: function (name) {
			var i;

			for (i = 0; i < this.hooks.length; i += 1) {
				if (this.hooks[i].name === name) {
					return this.hooks[i];
				}
			}

			return false;
		},

		flush: function () {
			if (getUIFlag(0x0D)) {
				return;
			}

			while (this.hooks.length) {
				this.hooks.shift().hook.remove();
			}
		}
	},

	update: function (msg = false) {
		function status () {
			let hide = [0x01, 0x02, 0x03, 0x04, 0x05, 0x09, 0x0C, 0x0D, 0x0F, 0x14, 0x18, 0x19, 0x1A, 0x21, 0x24];

			if (!me.gameReady && !me.ingame && [1, 2, 3, 4, 5].indexOf(me.act) === -1) {
				Overlay.text.enabled = false;
			} else {
				for (let flag = 0; flag < hide.length; flag++) {
					if (getUIFlag(hide[flag])) {
						Overlay.text.enabled = false;
						break;
					} else {
						Overlay.text.enabled = true;
					}
				}
			}

			Overlay.text.check();
		}

		return msg ? true : me.gameReady && me.ingame && !me.dead ? status() : false;
	},

	flush: function () {
		this.text.flush();

		return true;
	},
};
