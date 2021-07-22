/*
*	@filename	CubingOverrides.js
*	@author		isid0re
*	@desc		Cubing.js patch for offline ladder cubing
*	@credits	kolton
*/

Cubing.buildRecipes = function () {
	var i;

	this.recipes = [];

	for (i = 0; i < Config.Recipes.length; i += 1) {
		if (typeof Config.Recipes[i] !== "object" || (Config.Recipes[i].length > 2 && typeof Config.Recipes[i][2] !== "number") || Config.Recipes[i].length < 1) {
			throw new Error("Cubing.buildRecipes: Invalid recipe format.");
		}

		switch (Config.Recipes[i][0]) {
		case Recipe.Gem:
			this.recipes.push({Ingredients: [Config.Recipes[i][1], Config.Recipes[i][1], Config.Recipes[i][1]], Index: Recipe.Gem, AlwaysEnabled: true});

			break;
		case Recipe.HitPower.Helm:
			this.recipes.push({Ingredients: [Config.Recipes[i][1], 615, 643, 571], Level: 84, Index: Recipe.HitPower.Helm});

			break;
		case Recipe.HitPower.Boots:
			this.recipes.push({Ingredients: [Config.Recipes[i][1], 617, 643, 571], Level: 71, Index: Recipe.HitPower.Boots});

			break;
		case Recipe.HitPower.Gloves:
			this.recipes.push({Ingredients: [Config.Recipes[i][1], 618, 643, 571], Level: 79, Index: Recipe.HitPower.Gloves});

			break;
		case Recipe.HitPower.Belt:
			this.recipes.push({Ingredients: [Config.Recipes[i][1], 616, 643, 571], Level: 71, Index: Recipe.HitPower.Belt});

			break;
		case Recipe.HitPower.Shield:
			this.recipes.push({Ingredients: [Config.Recipes[i][1], 614, 643, 571], Level: 82, Index: Recipe.HitPower.Shield});

			break;
		case Recipe.HitPower.Body:
			this.recipes.push({Ingredients: [Config.Recipes[i][1], 613, 643, 571], Level: 85, Index: Recipe.HitPower.Body});

			break;
		case Recipe.HitPower.Amulet:
			this.recipes.push({Ingredients: [520, 619, 643, 571], Level: 90, Index: Recipe.HitPower.Amulet});

			break;
		case Recipe.HitPower.Ring:
			this.recipes.push({Ingredients: [522, 620, 643, 571], Level: 77, Index: Recipe.HitPower.Ring});

			break;
		case Recipe.HitPower.Weapon:
			this.recipes.push({Ingredients: [Config.Recipes[i][1], 612, 643, 571], Level: 85, Index: Recipe.HitPower.Weapon});

			break;
		case Recipe.Blood.Helm:
			this.recipes.push({Ingredients: [Config.Recipes[i][1], 617, 643, 581], Level: 84, Index: Recipe.Blood.Helm});

			break;
		case Recipe.Blood.Boots:
			this.recipes.push({Ingredients: [Config.Recipes[i][1], 614, 643, 581], Level: 71, Index: Recipe.Blood.Boots});

			break;
		case Recipe.Blood.Gloves:
			this.recipes.push({Ingredients: [Config.Recipes[i][1], 613, 643, 581], Level: 79, Index: Recipe.Blood.Gloves});

			break;
		case Recipe.Blood.Belt:
			this.recipes.push({Ingredients: [Config.Recipes[i][1], 616, 643, 581], Level: 71, Index: Recipe.Blood.Belt});

			break;
		case Recipe.Blood.Shield:
			this.recipes.push({Ingredients: [Config.Recipes[i][1], 615, 643, 581], Level: 82, Index: Recipe.Blood.Shield});

			break;
		case Recipe.Blood.Body:
			this.recipes.push({Ingredients: [Config.Recipes[i][1], 619, 643, 581], Level: 85, Index: Recipe.Blood.Body});

			break;
		case Recipe.Blood.Amulet:
			this.recipes.push({Ingredients: [520, 620, 643, 581], Level: 90, Index: Recipe.Blood.Amulet});

			break;
		case Recipe.Blood.Ring:
			this.recipes.push({Ingredients: [522, 621, 643, 581], Level: 77, Index: Recipe.Blood.Ring});

			break;
		case Recipe.Blood.Weapon:
			this.recipes.push({Ingredients: [Config.Recipes[i][1], 618, 643, 581], Level: 85, Index: Recipe.Blood.Weapon});

			break;
		case Recipe.Caster.Helm:
			this.recipes.push({Ingredients: [Config.Recipes[i][1], 613, 643, 561], Level: 84, Index: Recipe.Caster.Helm});

			break;
		case Recipe.Caster.Boots:
			this.recipes.push({Ingredients: [Config.Recipes[i][1], 619, 643, 561], Level: 71, Index: Recipe.Caster.Boots});

			break;
		case Recipe.Caster.Gloves:
			this.recipes.push({Ingredients: [Config.Recipes[i][1], 618, 643, 561], Level: 79, Index: Recipe.Caster.Gloves});

			break;
		case Recipe.Caster.Belt:
			this.recipes.push({Ingredients: [Config.Recipes[i][1], 615, 643, 561], Level: 71, Index: Recipe.Caster.Belt});

			break;
		case Recipe.Caster.Shield:
			this.recipes.push({Ingredients: [Config.Recipes[i][1], 614, 643, 561], Level: 82, Index: Recipe.Caster.Shield});

			break;
		case Recipe.Caster.Body:
			this.recipes.push({Ingredients: [Config.Recipes[i][1], 616, 643, 561], Level: 85, Index: Recipe.Caster.Body});

			break;
		case Recipe.Caster.Amulet:
			this.recipes.push({Ingredients: [520, 617, 643, 561], Level: 90, Index: Recipe.Caster.Amulet});

			break;
		case Recipe.Caster.Ring:
			this.recipes.push({Ingredients: [522, 620, 643, 561], Level: 77, Index: Recipe.Caster.Ring});

			break;
		case Recipe.Caster.Weapon:
			this.recipes.push({Ingredients: [Config.Recipes[i][1], 612, 643, 561], Level: 85, Index: Recipe.Caster.Weapon});

			break;
		case Recipe.Safety.Helm:
			this.recipes.push({Ingredients: [Config.Recipes[i][1], 615, 643, 576], Level: 84, Index: Recipe.Safety.Helm});

			break;
		case Recipe.Safety.Boots:
			this.recipes.push({Ingredients: [Config.Recipes[i][1], 618, 643, 576], Level: 71, Index: Recipe.Safety.Boots});

			break;
		case Recipe.Safety.Gloves:
			this.recipes.push({Ingredients: [Config.Recipes[i][1], 617, 643, 576], Level: 79, Index: Recipe.Safety.Gloves});

			break;
		case Recipe.Safety.Belt:
			this.recipes.push({Ingredients: [Config.Recipes[i][1], 616, 643, 576], Level: 71, Index: Recipe.Safety.Belt});

			break;
		case Recipe.Safety.Shield:
			this.recipes.push({Ingredients: [Config.Recipes[i][1], 613, 643, 576], Level: 82, Index: Recipe.Safety.Shield});

			break;
		case Recipe.Safety.Body:
			this.recipes.push({Ingredients: [Config.Recipes[i][1], 614, 643, 576], Level: 85, Index: Recipe.Safety.Body});

			break;
		case Recipe.Safety.Amulet:
			this.recipes.push({Ingredients: [520, 619, 643, 576], Level: 90, Index: Recipe.Safety.Amulet});

			break;
		case Recipe.Safety.Ring:
			this.recipes.push({Ingredients: [522, 620, 643, 576], Level: 77, Index: Recipe.Safety.Ring});

			break;
		case Recipe.Safety.Weapon:
			this.recipes.push({Ingredients: [Config.Recipes[i][1], 621, 643, 576], Level: 85, Index: Recipe.Safety.Weapon});

			break;
		case Recipe.Unique.Weapon.ToExceptional:
			this.recipes.push({Ingredients: [Config.Recipes[i][1], 617, 621, 576], Index: Recipe.Unique.Weapon.ToExceptional, Ethereal: Config.Recipes[i][2]});

			break;
		case Recipe.Unique.Weapon.ToElite: // Ladder only
			if (me.ladder || Developer.addLadderRW) {
				this.recipes.push({Ingredients: [Config.Recipes[i][1], 626, 630, 576], Index: Recipe.Unique.Weapon.ToElite, Ethereal: Config.Recipes[i][2]});
			}

			break;
		case Recipe.Unique.Armor.ToExceptional:
			this.recipes.push({Ingredients: [Config.Recipes[i][1], 616, 622, 586], Index: Recipe.Unique.Armor.ToExceptional, Ethereal: Config.Recipes[i][2]});

			break;
		case Recipe.Unique.Armor.ToElite: // Ladder only
			if (me.ladder || Developer.addLadderRW) {
				this.recipes.push({Ingredients: [Config.Recipes[i][1], 629, 627, 586], Index: Recipe.Unique.Armor.ToElite, Ethereal: Config.Recipes[i][2]});
			}

			break;
		case Recipe.Rare.Weapon.ToExceptional:
			this.recipes.push({Ingredients: [Config.Recipes[i][1], 618, 620, 571], Index: Recipe.Rare.Weapon.ToExceptional, Ethereal: Config.Recipes[i][2]});

			break;
		case Recipe.Rare.Weapon.ToElite:
			this.recipes.push({Ingredients: [Config.Recipes[i][1], 628, 631, 571], Index: Recipe.Rare.Weapon.ToElite, Ethereal: Config.Recipes[i][2]});

			break;
		case Recipe.Rare.Armor.ToExceptional:
			this.recipes.push({Ingredients: [Config.Recipes[i][1], 617, 619, 561], Index: Recipe.Rare.Armor.ToExceptional, Ethereal: Config.Recipes[i][2]});

			break;
		case Recipe.Rare.Armor.ToElite:
			this.recipes.push({Ingredients: [Config.Recipes[i][1], 627, 630, 561], Index: Recipe.Rare.Armor.ToElite, Ethereal: Config.Recipes[i][2]});

			break;
		case Recipe.Socket.Shield:
			this.recipes.push({Ingredients: [Config.Recipes[i][1], 616, 620, 581], Index: Recipe.Socket.Shield, Ethereal: Config.Recipes[i][2]});

			break;
		case Recipe.Socket.Weapon:
			this.recipes.push({Ingredients: [Config.Recipes[i][1], 617, 620, 561], Index: Recipe.Socket.Weapon, Ethereal: Config.Recipes[i][2]});

			break;
		case Recipe.Socket.Armor:
			this.recipes.push({Ingredients: [Config.Recipes[i][1], 616, 619, 566], Index: Recipe.Socket.Armor, Ethereal: Config.Recipes[i][2]});

			break;
		case Recipe.Socket.Helm:
			this.recipes.push({Ingredients: [Config.Recipes[i][1], 617, 619, 571], Index: Recipe.Socket.Helm, Ethereal: Config.Recipes[i][2]});

			break;
		case Recipe.Reroll.Magic: // Hacky solution ftw
			this.recipes.push({Ingredients: [Config.Recipes[i][1], "pgem", "pgem", "pgem"], Level: 91, Index: Recipe.Reroll.Magic});

			break;
		case Recipe.Reroll.Rare:
			this.recipes.push({Ingredients: [Config.Recipes[i][1], 601, 601, 601, 601, 601, 601], Index: Recipe.Reroll.Rare});

			break;
		case Recipe.Reroll.HighRare:
			this.recipes.push({Ingredients: [Config.Recipes[i][1], 601, 522], Index: Recipe.Reroll.HighRare, Enabled: false});

			break;
		case Recipe.LowToNorm.Weapon:
			this.recipes.push({Ingredients: [Config.Recipes[i][1], 611, "cgem"], Index: Recipe.LowToNorm.Weapon});

			break;
		case Recipe.LowToNorm.Armor:
			this.recipes.push({Ingredients: [Config.Recipes[i][1], 610, "cgem"], Index: Recipe.LowToNorm.Armor});

			break;
		case Recipe.Rune:
			switch (Config.Recipes[i][1]) {
			case 610: // el
			case 611: // eld
			case 612: // tir
			case 613: // nef
			case 614: // eth
			case 615: // ith
			case 616: // tal
			case 617: // ral
			case 618: // ort
				this.recipes.push({Ingredients: [Config.Recipes[i][1], Config.Recipes[i][1], Config.Recipes[i][1]], Index: Recipe.Rune, AlwaysEnabled: true});

				break;
			case 619: // thul->amn
				this.recipes.push({Ingredients: [619, 619, 619, 562], Index: Recipe.Rune});

				break;
			case 620: // amn->sol
				this.recipes.push({Ingredients: [620, 620, 620, 557], Index: Recipe.Rune});

				break;
			case 621: // sol->shael
				this.recipes.push({Ingredients: [621, 621, 621, 567], Index: Recipe.Rune});

				break;
			case 622: // shael->dol
				this.recipes.push({Ingredients: [622, 622, 622, 577], Index: Recipe.Rune});

				break;
			case 623: // dol->hel
				if (me.ladder || Developer.addLadderRW) {
					this.recipes.push({Ingredients: [623, 623, 623, 572], Index: Recipe.Rune});
				}

				break;
			case 624: // hel->io
				if (me.ladder || Developer.addLadderRW) {
					this.recipes.push({Ingredients: [624, 624, 624, 582], Index: Recipe.Rune});
				}

				break;
			case 625: // io->lum
				if (me.ladder || Developer.addLadderRW) {
					this.recipes.push({Ingredients: [625, 625, 625, 563], Index: Recipe.Rune});
				}

				break;
			case 626: // lum->ko
				if (me.ladder || Developer.addLadderRW) {
					this.recipes.push({Ingredients: [626, 626, 626, 558], Index: Recipe.Rune});
				}

				break;
			case 627: // ko->fal
				if (me.ladder || Developer.addLadderRW) {
					this.recipes.push({Ingredients: [627, 627, 627, 568], Index: Recipe.Rune});
				}

				break;
			case 628: // fal->lem
				if (me.ladder || Developer.addLadderRW) {
					this.recipes.push({Ingredients: [628, 628, 628, 578], Index: Recipe.Rune});
				}

				break;
			case 629: // lem->pul
				if (me.ladder || Developer.addLadderRW) {
					this.recipes.push({Ingredients: [629, 629, 629, 573], Index: Recipe.Rune});
				}

				break;
			case 630: // pul->um
				if (me.ladder || Developer.addLadderRW) {
					this.recipes.push({Ingredients: [630, 630, 583], Index: Recipe.Rune});
				}

				break;
			case 631: // um->mal
				if (me.ladder || Developer.addLadderRW) {
					this.recipes.push({Ingredients: [631, 631, 564], Index: Recipe.Rune});
				}

				break;
			case 632: // mal->ist
				if (me.ladder || Developer.addLadderRW) {
					this.recipes.push({Ingredients: [632, 632, 559], Index: Recipe.Rune});
				}

				break;
			case 633: // ist->gul
				if (me.ladder || Developer.addLadderRW) {
					this.recipes.push({Ingredients: [633, 633, 569], Index: Recipe.Rune});
				}

				break;
			case 634: // gul->vex
				if (me.ladder || Developer.addLadderRW) {
					this.recipes.push({Ingredients: [634, 634, 579], Index: Recipe.Rune});
				}

				break;
			case 635: // vex->ohm
				if (me.ladder || Developer.addLadderRW) {
					this.recipes.push({Ingredients: [635, 635, 574], Index: Recipe.Rune});
				}

				break;
			case 636: // ohm->lo
				if (me.ladder || Developer.addLadderRW) {
					this.recipes.push({Ingredients: [636, 636, 584], Index: Recipe.Rune});
				}

				break;
			case 637: // lo->sur
				if (me.ladder || Developer.addLadderRW) {
					this.recipes.push({Ingredients: [637, 637, 565], Index: Recipe.Rune});
				}

				break;
			case 638: // sur->ber
				if (me.ladder || Developer.addLadderRW) {
					this.recipes.push({Ingredients: [638, 638, 560], Index: Recipe.Rune});
				}

				break;
			case 639: // ber->jah
				if (me.ladder || Developer.addLadderRW) {
					this.recipes.push({Ingredients: [639, 639, 570], Index: Recipe.Rune});
				}

				break;
			case 640: // jah->cham
				if (me.ladder || Developer.addLadderRW) {
					this.recipes.push({Ingredients: [640, 640, 580], Index: Recipe.Rune});
				}

				break;
			case 641: // cham->zod
				if (me.ladder || Developer.addLadderRW) {
					this.recipes.push({Ingredients: [641, 641, 575], Index: Recipe.Rune});
				}

				break;
			}

			break;
		case Recipe.Token:
			this.recipes.push({Ingredients: [654, 655, 656, 657], Index: Recipe.Token, AlwaysEnabled: true});

			break;
		}
	}
};
