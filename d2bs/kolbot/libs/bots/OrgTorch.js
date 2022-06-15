/**
*	@filename	OrgTorch.js
*	@author		kolton, theBGuy
*	@desc		Convert keys to organs and organs to torches. It can work with TorchSystem to get keys from other characters
*	@notes		Search for the word "START" and follow the comments if you want to know what this script does and when.
*/

/* todo:
* override Town.buyPots, usually uber killers have only a little invo space so they fail to buy/drink all the pregame pots
* change method to buy/drink one pot at a time
* add ability to team this, possible roles being:
* taxi (just tele killer around) or helper (goes in tp and actuallys kills mob), maybe config for specifc areas
* like if we use salvation to kill meph but have a helper who comes in with max fanat or conviction
* bo barb?
 */

function OrgTorch() {
	this.doneAreas = [];

	const OrgTorchData = {
		filePath: "logs/OrgTorch-" + me.profile + ".json",
		default: {gamename: me.gamename, doneAreas: []},

		create: function () {
			FileTools.writeText(this.filePath, JSON.stringify(this.default));
			return this.default;
		},

		read: function () {
			let obj = {}, string;
			try {
				string = FileTools.readText(this.filePath);
				obj = JSON.parse(string);
			} catch (e) {
				return this.default;
			}

			return obj;
		},

		update: function (newData) {
			let data = this.read();
			Object.assign(data, newData);

			FileTools.writeText(this.filePath, JSON.stringify(data));
		},

		remove: function () {
			return FileTools.remove(this.filePath);
		}
	};

	// Identify & mule
	this.checkTorch = function () {
		if (me.area === sdk.areas.UberTristram) {
			Pather.moveTo(25105, 5140);
			Pather.usePortal(sdk.areas.Harrogath);
		}

		Town.doChores();

		if (!Config.OrgTorch.MakeTorch) return false;

		let torch = me.checkItem({name: sdk.locale.items.HellfireTorch});

		if (torch.have && Pickit.checkItem(torch.item).result === 1) {
			if (AutoMule.getInfo() && AutoMule.getInfo().hasOwnProperty("torchMuleInfo")) {
				scriptBroadcast("muleTorch");
				scriptBroadcast("quit");
			}

			return true;
		}

		return false;
	};

	// Try to lure a monster - wait until it's close enough
	this.lure = function (bossId) {
		let unit = getUnit(1, bossId);

		if (unit) {
			let tick = getTickCount();

			while (getTickCount() - tick < 2000) {
				if (getDistance(me, unit) <= 10) {
					return true;
				}

				delay(50);
			}
		}

		return false;
	};

	// Check if we have complete sets of organs
	this.completeSetCheck = function () {
		let horns = me.findItems("dhn");
		let brains = me.findItems("mbr");
		let eyes = me.findItems("bey");

		if (!horns || !brains || !eyes) {
			return false;
		}

		// We just need one set to make a torch
		if (Config.OrgTorch.MakeTorch) {
			return horns.length && brains.length && eyes.length;
		}

		return horns.length === brains.length && horns.length === eyes.length && brains.length === eyes.length;
	};

	// Get fade in River of Flames - only works if we are wearing an item with ctc Fade
	// todo - equipping an item from storage if we have it
	this.getFade = function () {
		if (Config.OrgTorch.GetFade && !me.getState(sdk.states.Fade)
			&& me.haveSome([{name: sdk.locale.items.Treachery, equipped: true},
				{name: sdk.locale.items.LastWish, equipped: true}, {name: sdk.locale.items.SpiritWard, equipped: true}])) {
			console.log(sdk.colors.Orange + "OrgTorch :: " + sdk.colors.White + "Getting Fade");
			Pather.useWaypoint(sdk.areas.RiverofFlame);
			Precast.doPrecast(true);
			// check if item is on switch
			let mainSlot;
			let fadeItem = me.findFirst([
				{name: sdk.locale.items.LastWish, equipped: true},
				{name: sdk.locale.items.SpiritWard, equipped: true}]);

			Pather.moveTo(7811, 5872);
				
			if (fadeItem.have && fadeItem.item.isOnSwap && me.weaponswitch !== 1) {
				mainSlot = me.weaponswitch;
				me.switchWeapons(1);
			}

			me.paladin && me.getSkill(sdk.skills.Salvation, 1) && Skill.setSkill(sdk.skills.Salvation, 0);

			while (!me.getState(sdk.states.Fade)) {
				delay(100);
			}

			mainSlot !== undefined && me.weaponswitch !== mainSlot && me.switchWeapons(mainSlot);

			console.log(sdk.colors.Orange + "OrgTorch :: " + sdk.colors.Green + "Fade Achieved");
		}

		return true;
	};

	// Open a red portal. Mode 0 = mini ubers, mode 1 = Tristram
	this.openPortal = function (mode) {
		let item1 = mode === 0 ? me.findItem("pk1", 0) : me.findItem("dhn", 0);
		let item2 = mode === 0 ? me.findItem("pk2", 0) : me.findItem("bey", 0);
		let item3 = mode === 0 ? me.findItem("pk3", 0) : me.findItem("mbr", 0);

		Town.goToTown(5);
		Town.doChores();

		if (Town.openStash() && Cubing.emptyCube()) {
			if (!Storage.Cube.MoveTo(item1)
				|| !Storage.Cube.MoveTo(item2)
				|| !Storage.Cube.MoveTo(item3)
				|| !Cubing.openCube()) {
				return false;
			}

			transmute();
			delay(1000);

			let portal = getUnit(2, sdk.units.RedPortal);

			if (portal) {
				do {
					switch (mode) {
					case 0:
						if ([sdk.areas.MatronsDen, sdk.areas.ForgottenSands, sdk.areas.FurnaceofPain].includes(portal.objtype)
							&& this.doneAreas.indexOf(portal.objtype) === -1) {
							this.doneAreas.push(portal.objtype);

							return copyUnit(portal);
						}

						break;
					case 1:
						if (portal.objtype === sdk.areas.UberTristram) {
							return copyUnit(portal);
						}

						break;
					}
				} while (portal.getNext());
			}
		}

		return false;
	};

	this.matronsDen = function () {
		let dHorns = me.findItems(sdk.items.quest.DiablosHorn, sdk.itemmode.inStorage).length;

		Precast.doPrecast(true);
		Pather.moveToPreset(sdk.areas.MatronsDen, 2, 397, 2, 2);
		Attack.kill(sdk.monsters.Lilith);
		Pickit.pickItems();
		Town.goToTown();

		// we sucessfully picked up the horn
		return (me.findItems(sdk.items.quest.DiablosHorn, sdk.itemmode.inStorage).length > dHorns);
	};

	this.forgottenSands = function () {
		let bEyes = me.findItems(sdk.items.quest.BaalsEye, sdk.itemmode.inStorage).length;

		Precast.doPrecast(true);

		let nodes = [
			{x: 20196, y: 8694},
			{x: 20308, y: 8588},
			{x: 20187, y: 8639},
			{x: 20100, y: 8550},
			{x: 20103, y: 8688},
			{x: 20144, y: 8709},
			{x: 20263, y: 8811},
			{x: 20247, y: 8665},
		];

		try {
			for (let i = 0; i < nodes.length; i++) {
				Pather.moveTo(nodes[i].x, nodes[i].y);
				delay(500);

				if (getUnit(1, sdk.monsters.UberDuriel)) {
					break;
				}

				if (getUnit(4, sdk.items.quest.BaalsEye, sdk.itemmode.onGround)) {
					if (Pickit.pickItem(getUnit(4, sdk.items.quest.BaalsEye, sdk.itemmode.onGround))) throw new Error("Found an picked wanted organ");
				}
			}

			Attack.kill(sdk.monsters.UberDuriel);
			Pickit.pickItems();
			Town.goToTown();
		} catch (e) {
			//
		}

		// we sucessfully picked up the eye
		return (me.findItems(sdk.items.quest.BaalsEye, sdk.itemmode.inStorage).length > bEyes);
	};

	this.furnance = function () {
		let mBrain = me.findItems(sdk.items.quest.MephistosBrain, sdk.itemmode.inStorage).length;

		Precast.doPrecast(true);
		Pather.moveToPreset(135, 2, 397, 2, 2);
		Attack.kill(sdk.monsters.UberIzual);
		Pickit.pickItems();
		Town.goToTown();

		// we sucessfully picked up the brain
		return (me.findItems(sdk.items.quest.MephistosBrain, sdk.itemmode.inStorage).length > mBrain);
	};

	// re-write this, lure doesn't always work and other classes can do ubers
	this.uberTrist = function () {
		let skillBackup;

		Pather.moveTo(25068, 5078);
		Precast.doPrecast(true);

		let nodes = [
			{x: 25040, y: 5101},
			{x: 25040, y: 5166},
			{x: 25122, y: 5170},
		];

		for (let i = 0; i < nodes.length; i++) {
			Pather.moveTo(nodes[i].x, nodes[i].y);
		}

		me.paladin && Config.OrgTorch.UseSalvation && Skill.setSkill(125, 0);
		this.lure(sdk.monsters.UberMephisto);
		Pather.moveTo(25129, 5198);
		me.paladin && Config.OrgTorch.UseSalvation && Skill.setSkill(125, 0);
		this.lure(sdk.monsters.UberMephisto);

		if (!getUnit(1, sdk.monsters.UberMephisto)) {
			Pather.moveTo(25122, 5170);
		}

		if (Config.OrgTorch.UseSalvation && me.paladin && me.getSkill(125, 1)) {
			skillBackup = Config.AttackSkill[2];
			Config.AttackSkill[2] = 125;

			Attack.init();
		}

		Attack.kill(sdk.monsters.UberMephisto);

		if (skillBackup && me.paladin && me.getSkill(125, 1)) {
			Config.AttackSkill[2] = skillBackup;

			Attack.init();
		}

		Pather.moveTo(25162, 5141);
		delay(3250);

		if (!getUnit(1, sdk.monsters.UberDiablo)) {
			Pather.moveTo(25122, 5170);
		}

		Attack.kill(sdk.monsters.UberDiablo);

		if (!getUnit(1, sdk.monsters.UberBaal)) {
			Pather.moveTo(25122, 5170);
		}

		Attack.kill(sdk.monsters.UberBaal);
		Pickit.pickItems();
		currentGameInfo.doneAreas.push(sdk.areas.UberTristram) && OrgTorchData.update(currentGameInfo);
		this.checkTorch();
	};

	// Do mini ubers or Tristram based on area we're already in
	this.pandemoniumRun = function (portalId) {
		switch (me.area) {
		case sdk.areas.MatronsDen:
			if (this.matronsDen()) {
				currentGameInfo.doneAreas.push(portalId) && OrgTorchData.update(currentGameInfo);
			}

			break;
		case sdk.areas.ForgottenSands:
			if (this.forgottenSands()) {
				currentGameInfo.doneAreas.push(portalId) && OrgTorchData.update(currentGameInfo);
			}

			break;
		case sdk.areas.FurnaceofPain:
			if (this.furnance()) {
				currentGameInfo.doneAreas.push(portalId) && OrgTorchData.update(currentGameInfo);
			}

			break;
		case sdk.areas.UberTristram:
			this.uberTrist();

			break;
		}
	};

	this.runEvent = function (portal) {
		if (portal) {
			if (Config.OrgTorch.PreGame.Antidote.At.includes(portal.objtype) && Config.OrgTorch.PreGame.Antidote.Drink > 0) {
				Town.buyPots(Config.OrgTorch.PreGame.Antidote.Drink, "Antidote", true, true);
			}
			if (Config.OrgTorch.PreGame.Thawing.At.includes(portal.objtype) && Config.OrgTorch.PreGame.Thawing.Drink > 0) {
				Town.buyPots(Config.OrgTorch.PreGame.Thawing.Drink, "Thawing", true, true);
			}
			Town.move("stash");
			console.log("taking portal: " + portal.objtype);
			Pather.usePortal(null, null, portal);
			this.pandemoniumRun(portal.objtype);
		}
	};

	this.juvCheck = function () {
		let needJuvs = 0;
		let col = Town.checkColumns(Storage.BeltSize());

		for (let i = 0; i < 4; i += 1) {
			if (Config.BeltColumn[i] === "rv") {
				needJuvs += col[i];
			}
		}

		print("Need " + needJuvs + " juvs.");

		return needJuvs;
	};

	// ################# //
	/* ##### START ##### */
	// ################# //

	// make sure we are picking the organs
	NTIP.OpenFile("pickit/keyorg.nip", true);

	let currentGameInfo;

	if (FileTools.exists(OrgTorchData.filePath)) {
		currentGameInfo = OrgTorchData.read();
	}

	if (!!currentGameInfo && currentGameInfo.gamename === me.gamename) {
		currentGameInfo.doneAreas.length > 0 && (this.doneAreas = currentGameInfo.doneAreas.slice(0));
	} else {
		currentGameInfo = OrgTorchData.create();
	}

	let portal;
	let tkeys = me.findItems("pk1", 0).length || 0;
	let hkeys = me.findItems("pk2", 0).length || 0;
	let dkeys = me.findItems("pk3", 0).length || 0;
	let brains = me.findItems("mbr", 0).length || 0;
	let eyes = me.findItems("bey", 0).length || 0;
	let horns = me.findItems("dhn", 0).length || 0;

	// Do town chores and quit if MakeTorch is true and we have a torch.
	this.checkTorch();

	// Wait for other bots to drop off their keys. This works only if TorchSystem.js is configured properly.
	Config.OrgTorch.WaitForKeys && TorchSystem.waitForKeys();

	Town.goToTown(5);
	Town.move("stash");

	let redPortals = getUnits(2, 60).filter(el => [133, 134, 135, 136].includes(el.objtype));
	let miniPortals = 0;
	let keySetsReq = 3;
	let tristOpen = false;

	if (redPortals.length > 0) {
		redPortals.forEach(function (portal) {
			if ([133, 134, 135].includes(portal.objtype)) {
				miniPortals++;
				keySetsReq--;
			} else if (portal.objtype === 136) {
				tristOpen = true;
			}
		});
	} else {
		// possible same game name but different day and data file never got deleted
		if (this.doneAreas.length > 0) {
			this.doneAreas = [];
			currentGameInfo = OrgTorchData.create();
		}
	}

	// End the script if we don't have enough keys nor organs
	if ((tkeys < keySetsReq || hkeys < keySetsReq || dkeys < keySetsReq) && (brains < 1 || eyes < 1 || horns < 1) && !tristOpen) {
		console.log("Not enough keys or organs.");
		OrgTorchData.remove();

		return true;
	}

	Config.UseMerc = false;

	// We have enough keys, do mini ubers
	if (tkeys >= keySetsReq && hkeys >= keySetsReq && dkeys >= keySetsReq) {
		this.getFade();
		Town.goToTown(5);
		console.log("Making organs.");
		D2Bot.printToConsole("OrgTorch: Making organs.", 7);
		Town.move("stash");

		// there are already open portals lets check our info on them
		if (miniPortals > 0) {
			for (let i = 0; i < miniPortals; i++) {
				// mini-portal is up but its not in our done areas, probably chickend during it, lets try again
				if ([133, 134, 135].includes(redPortals[i].objtype) && !this.doneAreas.includes(redPortals[i].objtype)) {
					portal = redPortals[i];
					this.runEvent(portal);
				}
			}
		}

		for (let i = 0; i < keySetsReq; i += 1) {
			// Abort if we have a complete set of organs
			// If Config.OrgTorch.MakeTorch is false, check after at least one portal is made
			if ((Config.OrgTorch.MakeTorch || i > 0) && this.completeSetCheck()) {
				break;
			}

			portal = this.openPortal(0);
			this.runEvent(portal);
		}
	}

	// Don't make torches if not configured to OR if the char already has one
	if (!Config.OrgTorch.MakeTorch || this.checkTorch()) {
		OrgTorchData.remove();

		return true;
	}

	// Count organs
	brains = me.findItems("mbr", 0).length || 0;
	eyes = me.findItems("bey", 0).length || 0;
	horns = me.findItems("dhn", 0).length || 0;

	// We have enough organs, do Tristram - or trist is open we may have chickened and came back so check it
	// if trist was already open when we joined should we run that first?
	if ((brains && eyes && horns) || tristOpen) {
		this.getFade();
		Town.goToTown(5);
		Town.move("stash");

		if (!tristOpen) {
			console.log("Making torch");
			D2Bot.printToConsole("OrgTorch: Making torch.", 7);
			portal = this.openPortal(1);
		} else {
			portal = Pather.getPortal(sdk.areas.UberTristram);
		}

		this.runEvent(portal);
		OrgTorchData.remove();
	}

	return true;
}
