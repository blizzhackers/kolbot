/**
*  @filename    Cubing.js
*  @author      kolton
*  @desc        transmute Horadric Cube recipes
*
*/

const Roll = {
	All: 0,
	Eth: 1,
	NonEth: 2
};

const Recipe = {
	Gem: 0,
	HitPower: {
		Helm: 1,
		Boots: 2,
		Gloves: 3,
		Belt: 4,
		Shield: 5,
		Body: 6,
		Amulet: 7,
		Ring: 8,
		Weapon: 9
	},
	Blood: {
		Helm: 10,
		Boots: 11,
		Gloves: 12,
		Belt: 13,
		Shield: 14,
		Body: 15,
		Amulet: 16,
		Ring: 17,
		Weapon: 18
	},
	Caster: {
		Helm: 19,
		Boots: 20,
		Gloves: 21,
		Belt: 22,
		Shield: 23,
		Body: 24,
		Amulet: 25,
		Ring: 26,
		Weapon: 27
	},
	Safety: {
		Helm: 28,
		Boots: 29,
		Gloves: 30,
		Belt: 31,
		Shield: 32,
		Body: 33,
		Amulet: 34,
		Ring: 35,
		Weapon: 36
	},
	Unique: {
		Weapon: {
			ToExceptional: 37,
			ToElite: 38
		},
		Armor: {
			ToExceptional: 39,
			ToElite: 40
		}
	},
	Rare: {
		Weapon: {
			ToExceptional: 41,
			ToElite: 42
		},
		Armor: {
			ToExceptional: 43,
			ToElite: 44
		}
	},
	Socket: {
		Shield: 45,
		Weapon: 46,
		Armor: 47,
		Helm: 48
	},
	Reroll: {
		Magic: 49,
		Rare: 50,
		HighRare: 51
	},
	Rune: 52,
	Token: 53,
	LowToNorm: {
		Armor: 54,
		Weapon: 55
	}
};

const Cubing = {
	recipes: [],
	gemList: [],
	chippedGems: [
		sdk.items.gems.Chipped.Amethyst, sdk.items.gems.Chipped.Topaz, sdk.items.gems.Chipped.Sapphire, sdk.items.gems.Chipped.Emerald,
		sdk.items.gems.Chipped.Ruby, sdk.items.gems.Chipped.Diamond, sdk.items.gems.Chipped.Skull
	],

	init: function () {
		if (!Config.Cubing) return;

		//print("We have " + Config.Recipes.length + " cubing recipe(s).");

		for (let i = 0; i < Config.Recipes.length; i += 1) {
			if (Config.Recipes[i].length > 1 && isNaN(Config.Recipes[i][1])) {
				if (NTIPAliasClassID.hasOwnProperty(Config.Recipes[i][1].replace(/\s+/g, "").toLowerCase())) {
					Config.Recipes[i][1] = NTIPAliasClassID[Config.Recipes[i][1].replace(/\s+/g, "").toLowerCase()];
				} else {
					Misc.errorReport("ÿc1Invalid cubing entry:ÿc0 " + Config.Recipes[i][1]);
					Config.Recipes.splice(i, 1);

					i -= 1;
				}
			}
		}

		this.buildRecipes();
		this.buildGemList();
		this.buildLists();
	},

	buildGemList: function () {
		let gemList = [
			sdk.items.gems.Perfect.Amethyst, sdk.items.gems.Perfect.Topaz, sdk.items.gems.Perfect.Sapphire,
			sdk.items.gems.Perfect.Emerald, sdk.items.gems.Perfect.Ruby, sdk.items.gems.Perfect.Diamond, sdk.items.gems.Perfect.Skull
		];

		for (let i = 0; i < this.recipes.length; i += 1) {
			// Skip gems and other magic rerolling recipes
			if ([Recipe.Gem, Recipe.Reroll.Magic].indexOf(this.recipes[i].Index) === -1) {
				for (let j = 0; j < this.recipes[i].Ingredients.length; j += 1) {
					if (gemList.includes(this.recipes[i].Ingredients[j])) {
						gemList.splice(gemList.indexOf(this.recipes[i].Ingredients[j]), 1);
					}
				}
			}
		}

		this.gemList = gemList.slice(0);

		return true;
	},

	getCube: function () {
		// Don't activate from townchicken
		if (getScript(true).name === "tools\\townchicken.js") {
			return false;
		}

		console.log("Getting cube");
		me.overhead("Getting cube");
		let cube;

		Pather.useWaypoint(sdk.areas.HallsoftheDeadLvl2, true);
		Precast.doPrecast(true);

		if (Pather.moveToExit(sdk.areas.HallsoftheDeadLvl3, true) && Pather.moveToPreset(me.area, sdk.unittype.Object, sdk.quest.chest.HoradricCubeChest)) {
			let chest = Game.getObject(sdk.quest.chest.HoradricCubeChest);

			if (chest) {
				Misc.openChest(chest);
				Misc.poll(function () {
					cube = Game.getItem(sdk.quest.item.Cube);
					return !!cube && Pickit.pickItem(cube);
				}, 1000, 2000);
			}
		}

		Town.goToTown();
		cube = me.getItem(sdk.quest.item.Cube);

		return (!!cube && Storage.Stash.MoveTo(cube));
	},

	buildRecipes: function () {
		this.recipes = [];

		for (let i = 0; i < Config.Recipes.length; i += 1) {
			if (typeof Config.Recipes[i] !== "object" || (Config.Recipes[i].length > 2 && typeof Config.Recipes[i][2] !== "number") || Config.Recipes[i].length < 1) {
				throw new Error("Cubing.buildRecipes: Invalid recipe format.");
			}

			switch (Config.Recipes[i][0]) {
			case Recipe.Gem:
				this.recipes.push({Ingredients: [Config.Recipes[i][1], Config.Recipes[i][1], Config.Recipes[i][1]], Index: Recipe.Gem, AlwaysEnabled: true});

				break;
			case Recipe.HitPower.Helm:
				this.recipes.push({Ingredients: [Config.Recipes[i][1], sdk.items.runes.Ith, sdk.items.Jewel, sdk.items.gems.Perfect.Sapphire], Level: 84, Index: Recipe.HitPower.Helm});

				break;
			case Recipe.HitPower.Boots:
				this.recipes.push({Ingredients: [Config.Recipes[i][1], sdk.items.runes.Ral, sdk.items.Jewel, sdk.items.gems.Perfect.Sapphire], Level: 71, Index: Recipe.HitPower.Boots});

				break;
			case Recipe.HitPower.Gloves:
				this.recipes.push({Ingredients: [Config.Recipes[i][1], sdk.items.runes.Ort, sdk.items.Jewel, sdk.items.gems.Perfect.Sapphire], Level: 79, Index: Recipe.HitPower.Gloves});

				break;
			case Recipe.HitPower.Belt:
				this.recipes.push({Ingredients: [Config.Recipes[i][1], sdk.items.runes.Tal, sdk.items.Jewel, sdk.items.gems.Perfect.Sapphire], Level: 71, Index: Recipe.HitPower.Belt});

				break;
			case Recipe.HitPower.Shield:
				this.recipes.push({Ingredients: [Config.Recipes[i][1], sdk.items.runes.Eth, sdk.items.Jewel, sdk.items.gems.Perfect.Sapphire], Level: 82, Index: Recipe.HitPower.Shield});

				break;
			case Recipe.HitPower.Body:
				this.recipes.push({Ingredients: [Config.Recipes[i][1], sdk.items.runes.Nef, sdk.items.Jewel, sdk.items.gems.Perfect.Sapphire], Level: 85, Index: Recipe.HitPower.Body});

				break;
			case Recipe.HitPower.Amulet:
				this.recipes.push({Ingredients: [sdk.items.Amulet, sdk.items.runes.Thul, sdk.items.Jewel, sdk.items.gems.Perfect.Sapphire], Level: 90, Index: Recipe.HitPower.Amulet});

				break;
			case Recipe.HitPower.Ring:
				this.recipes.push({Ingredients: [sdk.items.Ring, sdk.items.runes.Amn, sdk.items.Jewel, sdk.items.gems.Perfect.Sapphire], Level: 77, Index: Recipe.HitPower.Ring});

				break;
			case Recipe.HitPower.Weapon:
				this.recipes.push({Ingredients: [Config.Recipes[i][1], sdk.items.runes.Tir, sdk.items.Jewel, sdk.items.gems.Perfect.Sapphire], Level: 85, Index: Recipe.HitPower.Weapon});

				break;
			case Recipe.Blood.Helm:
				this.recipes.push({Ingredients: [Config.Recipes[i][1], sdk.items.runes.Ral, sdk.items.Jewel, sdk.items.gems.Perfect.Ruby], Level: 84, Index: Recipe.Blood.Helm});

				break;
			case Recipe.Blood.Boots:
				this.recipes.push({Ingredients: [Config.Recipes[i][1], sdk.items.runes.Eth, sdk.items.Jewel, sdk.items.gems.Perfect.Ruby], Level: 71, Index: Recipe.Blood.Boots});

				break;
			case Recipe.Blood.Gloves:
				this.recipes.push({Ingredients: [Config.Recipes[i][1], sdk.items.runes.Nef, sdk.items.Jewel, sdk.items.gems.Perfect.Ruby], Level: 79, Index: Recipe.Blood.Gloves});

				break;
			case Recipe.Blood.Belt:
				this.recipes.push({Ingredients: [Config.Recipes[i][1], sdk.items.runes.Tal, sdk.items.Jewel, sdk.items.gems.Perfect.Ruby], Level: 71, Index: Recipe.Blood.Belt});

				break;
			case Recipe.Blood.Shield:
				this.recipes.push({Ingredients: [Config.Recipes[i][1], sdk.items.runes.Ith, sdk.items.Jewel, sdk.items.gems.Perfect.Ruby], Level: 82, Index: Recipe.Blood.Shield});

				break;
			case Recipe.Blood.Body:
				this.recipes.push({Ingredients: [Config.Recipes[i][1], sdk.items.runes.Thul, sdk.items.Jewel, sdk.items.gems.Perfect.Ruby], Level: 85, Index: Recipe.Blood.Body});

				break;
			case Recipe.Blood.Amulet:
				this.recipes.push({Ingredients: [sdk.items.Amulet, sdk.items.runes.Amn, sdk.items.Jewel, sdk.items.gems.Perfect.Ruby], Level: 90, Index: Recipe.Blood.Amulet});

				break;
			case Recipe.Blood.Ring:
				this.recipes.push({Ingredients: [sdk.items.Ring, sdk.items.runes.Sol, sdk.items.Jewel, sdk.items.gems.Perfect.Ruby], Level: 77, Index: Recipe.Blood.Ring});

				break;
			case Recipe.Blood.Weapon:
				this.recipes.push({Ingredients: [Config.Recipes[i][1], sdk.items.runes.Ort, sdk.items.Jewel, sdk.items.gems.Perfect.Ruby], Level: 85, Index: Recipe.Blood.Weapon});

				break;
			case Recipe.Caster.Helm:
				this.recipes.push({Ingredients: [Config.Recipes[i][1], sdk.items.runes.Nef, sdk.items.Jewel, sdk.items.gems.Perfect.Amethyst], Level: 84, Index: Recipe.Caster.Helm});

				break;
			case Recipe.Caster.Boots:
				this.recipes.push({Ingredients: [Config.Recipes[i][1], sdk.items.runes.Thul, sdk.items.Jewel, sdk.items.gems.Perfect.Amethyst], Level: 71, Index: Recipe.Caster.Boots});

				break;
			case Recipe.Caster.Gloves:
				this.recipes.push({Ingredients: [Config.Recipes[i][1], sdk.items.runes.Ort, sdk.items.Jewel, sdk.items.gems.Perfect.Amethyst], Level: 79, Index: Recipe.Caster.Gloves});

				break;
			case Recipe.Caster.Belt:
				this.recipes.push({Ingredients: [Config.Recipes[i][1], sdk.items.runes.Ith, sdk.items.Jewel, sdk.items.gems.Perfect.Amethyst], Level: 71, Index: Recipe.Caster.Belt});

				break;
			case Recipe.Caster.Shield:
				this.recipes.push({Ingredients: [Config.Recipes[i][1], sdk.items.runes.Eth, sdk.items.Jewel, sdk.items.gems.Perfect.Amethyst], Level: 82, Index: Recipe.Caster.Shield});

				break;
			case Recipe.Caster.Body:
				this.recipes.push({Ingredients: [Config.Recipes[i][1], sdk.items.runes.Tal, sdk.items.Jewel, sdk.items.gems.Perfect.Amethyst], Level: 85, Index: Recipe.Caster.Body});

				break;
			case Recipe.Caster.Amulet:
				this.recipes.push({Ingredients: [sdk.items.Amulet, sdk.items.runes.Ral, sdk.items.Jewel, sdk.items.gems.Perfect.Amethyst], Level: 90, Index: Recipe.Caster.Amulet});

				break;
			case Recipe.Caster.Ring:
				this.recipes.push({Ingredients: [sdk.items.Ring, sdk.items.runes.Amn, sdk.items.Jewel, sdk.items.gems.Perfect.Amethyst], Level: 77, Index: Recipe.Caster.Ring});

				break;
			case Recipe.Caster.Weapon:
				this.recipes.push({Ingredients: [Config.Recipes[i][1], sdk.items.runes.Tir, sdk.items.Jewel, sdk.items.gems.Perfect.Amethyst], Level: 85, Index: Recipe.Caster.Weapon});

				break;
			case Recipe.Safety.Helm:
				this.recipes.push({Ingredients: [Config.Recipes[i][1], sdk.items.runes.Ith, sdk.items.Jewel, sdk.items.gems.Perfect.Emerald], Level: 84, Index: Recipe.Safety.Helm});

				break;
			case Recipe.Safety.Boots:
				this.recipes.push({Ingredients: [Config.Recipes[i][1], sdk.items.runes.Ort, sdk.items.Jewel, sdk.items.gems.Perfect.Emerald], Level: 71, Index: Recipe.Safety.Boots});

				break;
			case Recipe.Safety.Gloves:
				this.recipes.push({Ingredients: [Config.Recipes[i][1], sdk.items.runes.Ral, sdk.items.Jewel, sdk.items.gems.Perfect.Emerald], Level: 79, Index: Recipe.Safety.Gloves});

				break;
			case Recipe.Safety.Belt:
				this.recipes.push({Ingredients: [Config.Recipes[i][1], sdk.items.runes.Tal, sdk.items.Jewel, sdk.items.gems.Perfect.Emerald], Level: 71, Index: Recipe.Safety.Belt});

				break;
			case Recipe.Safety.Shield:
				this.recipes.push({Ingredients: [Config.Recipes[i][1], sdk.items.runes.Nef, sdk.items.Jewel, sdk.items.gems.Perfect.Emerald], Level: 82, Index: Recipe.Safety.Shield});

				break;
			case Recipe.Safety.Body:
				this.recipes.push({Ingredients: [Config.Recipes[i][1], sdk.items.runes.Eth, sdk.items.Jewel, sdk.items.gems.Perfect.Emerald], Level: 85, Index: Recipe.Safety.Body});

				break;
			case Recipe.Safety.Amulet:
				this.recipes.push({Ingredients: [sdk.items.Amulet, sdk.items.runes.Thul, sdk.items.Jewel, sdk.items.gems.Perfect.Emerald], Level: 90, Index: Recipe.Safety.Amulet});

				break;
			case Recipe.Safety.Ring:
				this.recipes.push({Ingredients: [sdk.items.Ring, sdk.items.runes.Amn, sdk.items.Jewel, sdk.items.gems.Perfect.Emerald], Level: 77, Index: Recipe.Safety.Ring});

				break;
			case Recipe.Safety.Weapon:
				this.recipes.push({Ingredients: [Config.Recipes[i][1], sdk.items.runes.Sol, sdk.items.Jewel, sdk.items.gems.Perfect.Emerald], Level: 85, Index: Recipe.Safety.Weapon});

				break;
			case Recipe.Unique.Weapon.ToExceptional:
				this.recipes.push({Ingredients: [Config.Recipes[i][1], sdk.items.runes.Ral, sdk.items.runes.Sol, sdk.items.gems.Perfect.Emerald], Index: Recipe.Unique.Weapon.ToExceptional, Ethereal: Config.Recipes[i][2]});

				break;
			case Recipe.Unique.Weapon.ToElite: // Ladder only
				if (me.ladder) {
					this.recipes.push({Ingredients: [Config.Recipes[i][1], sdk.items.runes.Lum, sdk.items.runes.Pul, sdk.items.gems.Perfect.Emerald], Index: Recipe.Unique.Weapon.ToElite, Ethereal: Config.Recipes[i][2]});
				}

				break;
			case Recipe.Unique.Armor.ToExceptional:
				this.recipes.push({Ingredients: [Config.Recipes[i][1], sdk.items.runes.Tal, sdk.items.runes.Shael, sdk.items.gems.Perfect.Diamond], Index: Recipe.Unique.Armor.ToExceptional, Ethereal: Config.Recipes[i][2]});

				break;
			case Recipe.Unique.Armor.ToElite: // Ladder only
				if (me.ladder) {
					this.recipes.push({Ingredients: [Config.Recipes[i][1], sdk.items.runes.Lem, sdk.items.runes.Ko, sdk.items.gems.Perfect.Diamond], Index: Recipe.Unique.Armor.ToElite, Ethereal: Config.Recipes[i][2]});
				}

				break;
			case Recipe.Rare.Weapon.ToExceptional:
				this.recipes.push({Ingredients: [Config.Recipes[i][1], sdk.items.runes.Ort, sdk.items.runes.Amn, sdk.items.gems.Perfect.Sapphire], Index: Recipe.Rare.Weapon.ToExceptional, Ethereal: Config.Recipes[i][2]});

				break;
			case Recipe.Rare.Weapon.ToElite:
				this.recipes.push({Ingredients: [Config.Recipes[i][1], sdk.items.runes.Fal, sdk.items.runes.Um, sdk.items.gems.Perfect.Sapphire], Index: Recipe.Rare.Weapon.ToElite, Ethereal: Config.Recipes[i][2]});

				break;
			case Recipe.Rare.Armor.ToExceptional:
				this.recipes.push({Ingredients: [Config.Recipes[i][1], sdk.items.runes.Ral, sdk.items.runes.Thul, sdk.items.gems.Perfect.Amethyst], Index: Recipe.Rare.Armor.ToExceptional, Ethereal: Config.Recipes[i][2]});

				break;
			case Recipe.Rare.Armor.ToElite:
				this.recipes.push({Ingredients: [Config.Recipes[i][1], sdk.items.runes.Ko, sdk.items.runes.Pul, sdk.items.gems.Perfect.Amethyst], Index: Recipe.Rare.Armor.ToElite, Ethereal: Config.Recipes[i][2]});

				break;
			case Recipe.Socket.Shield:
				this.recipes.push({Ingredients: [Config.Recipes[i][1], sdk.items.runes.Tal, sdk.items.runes.Amn, sdk.items.gems.Perfect.Ruby], Index: Recipe.Socket.Shield, Ethereal: Config.Recipes[i][2]});

				break;
			case Recipe.Socket.Weapon:
				this.recipes.push({Ingredients: [Config.Recipes[i][1], sdk.items.runes.Ral, sdk.items.runes.Amn, sdk.items.gems.Perfect.Amethyst], Index: Recipe.Socket.Weapon, Ethereal: Config.Recipes[i][2]});

				break;
			case Recipe.Socket.Armor:
				this.recipes.push({Ingredients: [Config.Recipes[i][1], sdk.items.runes.Tal, sdk.items.runes.Thul, sdk.items.gems.Perfect.Topaz], Index: Recipe.Socket.Armor, Ethereal: Config.Recipes[i][2]});

				break;
			case Recipe.Socket.Helm:
				this.recipes.push({Ingredients: [Config.Recipes[i][1], sdk.items.runes.Ral, sdk.items.runes.Thul, sdk.items.gems.Perfect.Sapphire], Index: Recipe.Socket.Helm, Ethereal: Config.Recipes[i][2]});

				break;
			case Recipe.Reroll.Magic: // Hacky solution ftw
				this.recipes.push({Ingredients: [Config.Recipes[i][1], "pgem", "pgem", "pgem"], Level: 91, Index: Recipe.Reroll.Magic});

				break;
			case Recipe.Reroll.Rare:
				this.recipes.push({Ingredients: [Config.Recipes[i][1], sdk.items.gems.Perfect.Skull, sdk.items.gems.Perfect.Skull, sdk.items.gems.Perfect.Skull, sdk.items.gems.Perfect.Skull, sdk.items.gems.Perfect.Skull, sdk.items.gems.Perfect.Skull], Index: Recipe.Reroll.Rare});

				break;
			case Recipe.Reroll.HighRare:
				this.recipes.push({Ingredients: [Config.Recipes[i][1], sdk.items.gems.Perfect.Skull, sdk.items.Ring], Index: Recipe.Reroll.HighRare, Enabled: false});

				break;
			case Recipe.LowToNorm.Weapon:
				this.recipes.push({Ingredients: [Config.Recipes[i][1], sdk.items.runes.Eld, "cgem"], Index: Recipe.LowToNorm.Weapon});

				break;
			case Recipe.LowToNorm.Armor:
				this.recipes.push({Ingredients: [Config.Recipes[i][1], sdk.items.runes.El, "cgem"], Index: Recipe.LowToNorm.Armor});

				break;
			case Recipe.Rune:
				switch (Config.Recipes[i][1]) {
				case sdk.items.runes.El:
				case sdk.items.runes.Eld:
				case sdk.items.runes.Tir:
				case sdk.items.runes.Nef:
				case sdk.items.runes.Eth:
				case sdk.items.runes.Ith:
				case sdk.items.runes.Tal:
				case sdk.items.runes.Ral:
				case sdk.items.runes.Ort:
					this.recipes.push({Ingredients: [Config.Recipes[i][1], Config.Recipes[i][1], Config.Recipes[i][1]], Index: Recipe.Rune, AlwaysEnabled: true});

					break;
				case sdk.items.runes.Thul: // thul->amn
					this.recipes.push({Ingredients: [sdk.items.runes.Thul, sdk.items.runes.Thul, sdk.items.runes.Thul, sdk.items.gems.Chipped.Topaz], Index: Recipe.Rune});

					break;
				case sdk.items.runes.Amn: // amn->sol
					this.recipes.push({Ingredients: [sdk.items.runes.Amn, sdk.items.runes.Amn, sdk.items.runes.Amn, sdk.items.gems.Chipped.Amethyst], Index: Recipe.Rune});

					break;
				case sdk.items.runes.Sol: // sol->shael
					this.recipes.push({Ingredients: [sdk.items.runes.Sol, sdk.items.runes.Sol, sdk.items.runes.Sol, sdk.items.gems.Chipped.Sapphire], Index: Recipe.Rune});

					break;
				case sdk.items.runes.Shael: // shael->dol
					this.recipes.push({Ingredients: [sdk.items.runes.Shael, sdk.items.runes.Shael, sdk.items.runes.Shael, sdk.items.gems.Chipped.Ruby], Index: Recipe.Rune});

					break;
				case sdk.items.runes.Dol: // dol->hel
					if (me.ladder) {
						this.recipes.push({Ingredients: [sdk.items.runes.Dol, sdk.items.runes.Dol, sdk.items.runes.Dol, sdk.items.gems.Chipped.Emerald], Index: Recipe.Rune});
					}

					break;
				case sdk.items.runes.Hel: // hel->io
					if (me.ladder) {
						this.recipes.push({Ingredients: [sdk.items.runes.Hel, sdk.items.runes.Hel, sdk.items.runes.Hel, sdk.items.gems.Chipped.Diamond], Index: Recipe.Rune});
					}

					break;
				case sdk.items.runes.Io: // io->lum
					if (me.ladder) {
						this.recipes.push({Ingredients: [sdk.items.runes.Io, sdk.items.runes.Io, sdk.items.runes.Io, sdk.items.gems.Flawed.Topaz], Index: Recipe.Rune});
					}

					break;
				case sdk.items.runes.Lum: // lum->ko
					if (me.ladder) {
						this.recipes.push({Ingredients: [sdk.items.runes.Lum, sdk.items.runes.Lum, sdk.items.runes.Lum, sdk.items.gems.Flawed.Amethyst], Index: Recipe.Rune});
					}

					break;
				case sdk.items.runes.Ko: // ko->fal
					if (me.ladder) {
						this.recipes.push({Ingredients: [sdk.items.runes.Ko, sdk.items.runes.Ko, sdk.items.runes.Ko, sdk.items.gems.Flawed.Sapphire], Index: Recipe.Rune});
					}

					break;
				case sdk.items.runes.Fal: // fal->lem
					if (me.ladder) {
						this.recipes.push({Ingredients: [sdk.items.runes.Fal, sdk.items.runes.Fal, sdk.items.runes.Fal, sdk.items.gems.Flawed.Ruby], Index: Recipe.Rune});
					}

					break;
				case sdk.items.runes.Lem: // lem->pul
					if (me.ladder) {
						this.recipes.push({Ingredients: [sdk.items.runes.Lem, sdk.items.runes.Lem, sdk.items.runes.Lem, sdk.items.gems.Flawed.Emerald], Index: Recipe.Rune});
					}

					break;
				case sdk.items.runes.Pul: // pul->um
					if (me.ladder) {
						this.recipes.push({Ingredients: [sdk.items.runes.Pul, sdk.items.runes.Pul, sdk.items.gems.Flawed.Diamond], Index: Recipe.Rune});
					}

					break;
				case sdk.items.runes.Um: // um->mal
					if (me.ladder) {
						this.recipes.push({Ingredients: [sdk.items.runes.Um, sdk.items.runes.Um, sdk.items.gems.Normal.Topaz], Index: Recipe.Rune});
					}

					break;
				case sdk.items.runes.Mal: // mal->ist
					if (me.ladder) {
						this.recipes.push({Ingredients: [sdk.items.runes.Mal, sdk.items.runes.Mal, sdk.items.gems.Normal.Amethyst], Index: Recipe.Rune});
					}

					break;
				case sdk.items.runes.Ist: // ist->gul
					if (me.ladder) {
						this.recipes.push({Ingredients: [sdk.items.runes.Ist, sdk.items.runes.Ist, sdk.items.gems.Normal.Sapphire], Index: Recipe.Rune});
					}

					break;
				case sdk.items.runes.Gul: // gul->vex
					if (me.ladder) {
						this.recipes.push({Ingredients: [sdk.items.runes.Gul, sdk.items.runes.Gul, sdk.items.gems.Normal.Ruby], Index: Recipe.Rune});
					}

					break;
				case sdk.items.runes.Vex: // vex->ohm
					if (me.ladder) {
						this.recipes.push({Ingredients: [sdk.items.runes.Vex, sdk.items.runes.Vex, sdk.items.gems.Normal.Emerald], Index: Recipe.Rune});
					}

					break;
				case sdk.items.runes.Ohm: // ohm->lo
					if (me.ladder) {
						this.recipes.push({Ingredients: [sdk.items.runes.Ohm, sdk.items.runes.Ohm, sdk.items.gems.Normal.Diamond], Index: Recipe.Rune});
					}

					break;
				case sdk.items.runes.Lo: // lo->sur
					if (me.ladder) {
						this.recipes.push({Ingredients: [sdk.items.runes.Lo, sdk.items.runes.Lo, sdk.items.gems.Flawless.Topaz], Index: Recipe.Rune});
					}

					break;
				case sdk.items.runes.Sur: // sur->ber
					if (me.ladder) {
						this.recipes.push({Ingredients: [sdk.items.runes.Sur, sdk.items.runes.Sur, sdk.items.gems.Flawless.Amethyst], Index: Recipe.Rune});
					}

					break;
				case sdk.items.runes.Ber: // ber->jah
					if (me.ladder) {
						this.recipes.push({Ingredients: [sdk.items.runes.Ber, sdk.items.runes.Ber, sdk.items.gems.Flawless.Sapphire], Index: Recipe.Rune});
					}

					break;
				case sdk.items.runes.Jah: // jah->cham
					if (me.ladder) {
						this.recipes.push({Ingredients: [sdk.items.runes.Jah, sdk.items.runes.Jah, sdk.items.gems.Flawless.Ruby], Index: Recipe.Rune});
					}

					break;
				case sdk.items.runes.Cham: // cham->zod
					if (me.ladder) {
						this.recipes.push({Ingredients: [sdk.items.runes.Cham, sdk.items.runes.Cham, sdk.items.gems.Flawless.Emerald], Index: Recipe.Rune});
					}

					break;
				}

				break;
			case Recipe.Token:
				this.recipes.push({Ingredients: [sdk.quest.item.TwistedEssenceofSuffering, sdk.quest.item.ChargedEssenceofHatred, sdk.quest.item.BurningEssenceofTerror, sdk.quest.item.FesteringEssenceofDestruction], Index: Recipe.Token, AlwaysEnabled: true});

				break;
			}
		}
	},

	validIngredients: [], // What we have
	neededIngredients: [], // What we need
	subRecipes: [],

	buildLists: function () {
		CraftingSystem.checkSubrecipes();

		this.validIngredients = [];
		this.neededIngredients = [];
		let items = me.findItems(-1, sdk.items.mode.inStorage);

		for (let i = 0; i < this.recipes.length; i += 1) {
			// Set default Enabled property - true if recipe is always enabled, false otherwise
			this.recipes[i].Enabled = this.recipes[i].hasOwnProperty("AlwaysEnabled");

			IngredientLoop:
			for (let j = 0; j < this.recipes[i].Ingredients.length; j += 1) {
				for (let k = 0; k < items.length; k += 1) {
					if (((this.recipes[i].Ingredients[j] === "pgem" && this.gemList.includes(items[k].classid))
						|| (this.recipes[i].Ingredients[j] === "cgem" && this.chippedGems.includes(items[k].classid))
						|| items[k].classid === this.recipes[i].Ingredients[j]) && this.validItem(items[k], this.recipes[i])) {

						// push the item's info into the valid ingredients array. this will be used to find items when checking recipes
						this.validIngredients.push({classid: items[k].classid, gid: items[k].gid});

						// Remove from item list to prevent counting the same item more than once
						items.splice(k, 1);

						k -= 1;

						// Enable recipes for gem/jewel pickup
						if (this.recipes[i].Index !== Recipe.Rune || (this.recipes[i].Index === Recipe.Rune && j >= 1)) {
							// Enable rune recipe after 2 bases are found
							this.recipes[i].Enabled = true;
						}

						continue IngredientLoop;
					}
				}

				// add the item to needed list - enable pickup
				this.neededIngredients.push({classid: this.recipes[i].Ingredients[j], recipe: this.recipes[i]});

				// skip flawless gems adding if we don't have the main item (Recipe.Gem and Recipe.Rune for el-ort are always enabled)
				if (!this.recipes[i].Enabled) {
					break;
				}

				// if the recipe is enabled (we have the main item), add flawless gem recipes (if needed)

				// Make perf amethyst
				if (this.subRecipes.indexOf(sdk.items.gems.Perfect.Amethyst) === -1 && (this.recipes[i].Ingredients[j] === sdk.items.gems.Perfect.Amethyst || (this.recipes[i].Ingredients[j] === "pgem" && this.gemList.indexOf(sdk.items.gems.Perfect.Amethyst) > -1))) {
					this.recipes.push({Ingredients: [sdk.items.gems.Flawless.Amethyst, sdk.items.gems.Flawless.Amethyst, sdk.items.gems.Flawless.Amethyst], Index: Recipe.Gem, AlwaysEnabled: true, MainRecipe: this.recipes[i].Index});
					this.subRecipes.push(sdk.items.gems.Perfect.Amethyst);
				}

				// Make perf topaz
				if (this.subRecipes.indexOf(sdk.items.gems.Perfect.Topaz) === -1 && (this.recipes[i].Ingredients[j] === sdk.items.gems.Perfect.Topaz || (this.recipes[i].Ingredients[j] === "pgem" && this.gemList.indexOf(sdk.items.gems.Perfect.Topaz) > -1))) {
					this.recipes.push({Ingredients: [sdk.items.gems.Flawless.Topaz, sdk.items.gems.Flawless.Topaz, sdk.items.gems.Flawless.Topaz], Index: Recipe.Gem, AlwaysEnabled: true, MainRecipe: this.recipes[i].Index});
					this.subRecipes.push(sdk.items.gems.Perfect.Topaz);
				}

				// Make perf sapphire
				if (this.subRecipes.indexOf(sdk.items.gems.Perfect.Sapphire) === -1 && (this.recipes[i].Ingredients[j] === sdk.items.gems.Perfect.Sapphire || (this.recipes[i].Ingredients[j] === "pgem" && this.gemList.indexOf(sdk.items.gems.Perfect.Sapphire) > -1))) {
					this.recipes.push({Ingredients: [sdk.items.gems.Flawless.Sapphire, sdk.items.gems.Flawless.Sapphire, sdk.items.gems.Flawless.Sapphire], Index: Recipe.Gem, AlwaysEnabled: true, MainRecipe: this.recipes[i].Index});
					this.subRecipes.push(sdk.items.gems.Perfect.Sapphire);
				}

				// Make perf emerald
				if (this.subRecipes.indexOf(sdk.items.gems.Perfect.Emerald) === -1 && (this.recipes[i].Ingredients[j] === sdk.items.gems.Perfect.Emerald || (this.recipes[i].Ingredients[j] === "pgem" && this.gemList.indexOf(sdk.items.gems.Perfect.Emerald) > -1))) {
					this.recipes.push({Ingredients: [sdk.items.gems.Flawless.Emerald, sdk.items.gems.Flawless.Emerald, sdk.items.gems.Flawless.Emerald], Index: Recipe.Gem, AlwaysEnabled: true, MainRecipe: this.recipes[i].Index});
					this.subRecipes.push(sdk.items.gems.Perfect.Emerald);
				}

				// Make perf ruby
				if (this.subRecipes.indexOf(sdk.items.gems.Perfect.Ruby) === -1 && (this.recipes[i].Ingredients[j] === sdk.items.gems.Perfect.Ruby || (this.recipes[i].Ingredients[j] === "pgem" && this.gemList.indexOf(sdk.items.gems.Perfect.Ruby) > -1))) {
					this.recipes.push({Ingredients: [sdk.items.gems.Flawless.Ruby, sdk.items.gems.Flawless.Ruby, sdk.items.gems.Flawless.Ruby], Index: Recipe.Gem, AlwaysEnabled: true, MainRecipe: this.recipes[i].Index});
					this.subRecipes.push(sdk.items.gems.Perfect.Ruby);
				}

				// Make perf diamond
				if (this.subRecipes.indexOf(sdk.items.gems.Perfect.Diamond) === -1 && (this.recipes[i].Ingredients[j] === sdk.items.gems.Perfect.Diamond || (this.recipes[i].Ingredients[j] === "pgem" && this.gemList.indexOf(sdk.items.gems.Perfect.Diamond) > -1))) {
					this.recipes.push({Ingredients: [sdk.items.gems.Flawless.Diamond, sdk.items.gems.Flawless.Diamond, sdk.items.gems.Flawless.Diamond], Index: Recipe.Gem, AlwaysEnabled: true, MainRecipe: this.recipes[i].Index});
					this.subRecipes.push(sdk.items.gems.Perfect.Diamond);
				}

				// Make perf skull
				if (this.subRecipes.indexOf(sdk.items.gems.Perfect.Skull) === -1 && (this.recipes[i].Ingredients[j] === sdk.items.gems.Perfect.Skull || (this.recipes[i].Ingredients[j] === "pgem" && this.gemList.indexOf(sdk.items.gems.Perfect.Skull) > -1))) {
					this.recipes.push({Ingredients: [sdk.items.gems.Flawless.Skull, sdk.items.gems.Flawless.Skull, sdk.items.gems.Flawless.Skull], Index: Recipe.Gem, AlwaysEnabled: true, MainRecipe: this.recipes[i].Index});
					this.subRecipes.push(sdk.items.gems.Perfect.Skull);
				}
			}
		}
	},

	// Remove unneeded flawless gem recipes
	clearSubRecipes: function () {
		this.subRecipes = [];

		for (let i = 0; i < this.recipes.length; i += 1) {
			if (this.recipes[i].hasOwnProperty("MainRecipe")) {
				this.recipes.splice(i, 1);

				i -= 1;
			}
		}
	},

	update: function () {
		this.clearSubRecipes();
		this.buildLists();
	},

	checkRecipe: function (recipe) {
		let usedGids = [];
		let matchList = [];

		for (let i = 0; i < recipe.Ingredients.length; i += 1) {
			for (let j = 0; j < this.validIngredients.length; j += 1) {
				if (usedGids.indexOf(this.validIngredients[j].gid) === -1 && (
					this.validIngredients[j].classid === recipe.Ingredients[i]
						|| (recipe.Ingredients[i] === "pgem" && this.gemList.includes(this.validIngredients[j].classid))
						|| (recipe.Ingredients[i] === "cgem" && this.chippedGems.includes(this.validIngredients[j].classid))
				)) {
					let item = me.getItem(this.validIngredients[j].classid, -1, this.validIngredients[j].gid);

					// 26.11.2012. check if the item actually belongs to the given recipe
					if (item && this.validItem(item, recipe)) {
						// don't repeat the same item
						usedGids.push(this.validIngredients[j].gid);
						// push the item into the match list
						matchList.push(copyUnit(item));

						break;
					}
				}
			}

			// no new items in the match list = not enough ingredients
			if (matchList.length !== i + 1) return false;
		}

		// return the match list. these items go to cube
		return matchList;
	},

	// debug function - get what each recipe needs
	getRecipeNeeds: function (index) {
		let rval = " [";

		for (let i = 0; i < this.neededIngredients.length; i += 1) {
			if (this.neededIngredients[i].recipe.Index === index) {
				rval += this.neededIngredients[i].classid + (i === this.neededIngredients.length - 1 ? "" : " ");
			}
		}

		rval += "]";

		return rval;
	},

	// Check an item on ground for pickup
	checkItem: function (unit) {
		if (!Config.Cubing) return false;
		if (this.keepItem(unit)) return true;

		for (let i = 0; i < this.neededIngredients.length; i += 1) {
			if (unit.classid === this.neededIngredients[i].classid && this.validItem(unit, this.neededIngredients[i].recipe)) {
				//debugLog("Cubing: " + unit.name + " " + this.neededIngredients[i].recipe.Index + " " + (this.neededIngredients[i].recipe.hasOwnProperty("MainRecipe") ? this.neededIngredients[i].recipe.MainRecipe : "") + this.getRecipeNeeds(this.neededIngredients[i].recipe.Index));
				return true;
			}
		}

		return false;
	},

	// Don't drop an item from inventory if it's a part of cubing recipe
	keepItem: function (unit) {
		if (!Config.Cubing) return false;

		for (let i = 0; i < this.validIngredients.length; i += 1) {
			if (unit.mode === sdk.items.mode.inStorage && unit.gid === this.validIngredients[i].gid) {
				return true;
			}
		}

		return false;
	},

	validItem: function (unit, recipe) {
		// Excluded items
		// Don't use items in locked inventory space - or wanted by other systems
		if ((unit.isInInventory && Storage.Inventory.IsLocked(unit, Config.Inventory)
			|| Runewords.validGids.includes(unit.gid) || CraftingSystem.validGids.includes(unit.gid))) {
			return false;
		}

		// Gems and runes
		if ((unit.itemType >= sdk.items.type.Amethyst && unit.itemType <= sdk.items.type.Skull) || unit.itemType === sdk.items.type.Rune) {
			if (!recipe.Enabled && recipe.Ingredients[0] !== unit.classid && recipe.Ingredients[1] !== unit.classid) {
				return false;
			}

			return true;
		}
		
		// Token
		if (recipe.Index === Recipe.Token) return true;

		// START
		const ntipResult = NTIP.CheckItem(unit);

		if (recipe.Index >= Recipe.HitPower.Helm && recipe.Index <= Recipe.Safety.Weapon) {
			// Junk jewels (NOT matching a pickit entry)
			if (unit.itemType === sdk.items.type.Jewel) {
				if (recipe.Enabled && ntipResult === Pickit.Result.UNWANTED) {
					return true;
				}
			// Main item, NOT matching a pickit entry
			} else if (unit.magic && Math.floor(me.charlvl / 2) + Math.floor(unit.ilvl / 2) >= recipe.Level && ntipResult === Pickit.Result.UNWANTED) {
				return true;
			}

			return false;
		}

		let upgradeUnique = recipe.Index >= Recipe.Unique.Weapon.ToExceptional && recipe.Index <= Recipe.Unique.Armor.ToElite;
		let upgradeRare = recipe.Index >= Recipe.Rare.Weapon.ToExceptional && recipe.Index <= Recipe.Rare.Armor.ToElite;
		let socketNormal = recipe.Index >= Recipe.Socket.Shield && recipe.Index <= Recipe.Socket.Helm;

		if (upgradeUnique || upgradeRare || socketNormal) {
			switch (true) {
			case upgradeUnique && unit.unique && ntipResult === Pickit.Result.WANTED: // Unique item matching pickit entry
			case upgradeRare && unit.rare && ntipResult === Pickit.Result.WANTED: // Rare item matching pickit entry
			case socketNormal && unit.normal && unit.sockets === 0: // Normal item matching pickit entry, no sockets
				switch (recipe.Ethereal) {
				case Roll.All:
				case undefined:
					return ntipResult === Pickit.Result.WANTED;
				case Roll.Eth:
					return unit.ethereal && ntipResult === Pickit.Result.WANTED;
				case Roll.NonEth:
					return !unit.ethereal && ntipResult === Pickit.Result.WANTED;
				}

				return false;
			}

			return false;
		}

		if (recipe.Index === Recipe.Reroll.Magic) {
			return (unit.magic && unit.ilvl >= recipe.Level && ntipResult === Pickit.Result.UNWANTED);
		}

		if (recipe.Index === Recipe.Reroll.Rare) {
			return (unit.rare && ntipResult === Pickit.Result.UNWANTED);
		}

		if (recipe.Index === Recipe.Reroll.HighRare) {
			if (recipe.Ingredients[0] === unit.classid && unit.rare && ntipResult === Pickit.Result.UNWANTED) {
				recipe.Enabled = true;

				return true;
			}

			if (recipe.Enabled && recipe.Ingredients[2] === unit.classid && unit.itemType === sdk.items.type.Ring
				&& unit.getStat(sdk.stats.MaxManaPercent) && !Storage.Inventory.IsLocked(unit, Config.Inventory)) {
				return true;
			}

			return false;
		}

		if (recipe.Index === Recipe.LowToNorm.Armor || recipe.Index === Recipe.LowToNorm.Weapon) {
			return (unit.lowquality && ntipResult === Pickit.Result.UNWANTED);
		}

		return false;
	},

	doCubing: function () {
		if (!Config.Cubing) return false;
		if (!me.getItem(sdk.quest.item.Cube) && !this.getCube()) return false;

		this.update();
		// Randomize the recipe array to prevent recipe blocking (multiple caster items etc.)
		let tempArray = this.recipes.slice().shuffle();

		for (let i = 0; i < tempArray.length; i += 1) {
			let string = "Transmuting: ";
			let items = this.checkRecipe(tempArray[i]);

			if (items) {
				// If cube isn't open, attempt to open stash (the function returns true if stash is already open)
				if ((!getUIFlag(sdk.uiflags.Cube) && !Town.openStash()) || !this.emptyCube()) return false;

				this.cursorCheck();

				i = -1;

				while (items.length) {
					string += (items[0].name.trim() + (items.length > 1 ? " + " : ""));
					Storage.Cube.MoveTo(items[0]);
					items.shift();
				}

				if (!this.openCube()) return false;

				transmute();
				delay(700 + me.ping);
				print("ÿc4Cubing: " + string);
				Config.ShowCubingInfo && D2Bot.printToConsole(string, sdk.colors.D2Bot.Green);
				this.update();

				let cubeItems = me.findItems(-1, -1, sdk.storage.Cube);

				if (items) {
					for (let j = 0; j < cubeItems.length; j += 1) {
						let result = Pickit.checkItem(cubeItems[j]);

						switch (result.result) {
						case Pickit.Result.UNWANTED:
							Misc.itemLogger("Dropped", cubeItems[j], "doCubing");
							cubeItems[j].drop();

							break;
						case Pickit.Result.WANTED:
							Misc.itemLogger("Cubing Kept", cubeItems[j]);
							Misc.logItem("Cubing Kept", cubeItems[j], result.line);

							break;
						case Pickit.Result.CRAFTING:
							CraftingSystem.update(cubeItems[j]);

							break;
						}
					}
				}

				if (!this.emptyCube()) {
					break;
				}
			}
		}

		if (getUIFlag(sdk.uiflags.Cube) || getUIFlag(sdk.uiflags.Stash)) {
			delay(1000);

			while (getUIFlag(sdk.uiflags.Cube) || getUIFlag(sdk.uiflags.Stash)) {
				me.cancel();
				delay(300);
			}
		}

		return true;
	},

	cursorCheck: function () {
		if (me.itemoncursor) {
			let item = Game.getCursorUnit();

			if (item) {
				if (Storage.Inventory.CanFit(item) && Storage.Inventory.MoveTo(item)) return true;
				if (Storage.Stash.CanFit(item) && Storage.Stash.MoveTo(item)) return true;

				if (item.drop()) {
					Misc.itemLogger("Dropped", item, "cursorCheck");
					return true;
				}
			}

			return false;
		}

		return true;
	},

	openCube: function () {
		let cube = me.getItem(sdk.quest.item.Cube);

		if (!cube) return false;
		if (getUIFlag(sdk.uiflags.Cube)) return true;
		if (cube.isInStash && !Town.openStash()) return false;

		for (let i = 0; i < 3; i += 1) {
			cube.interact();
			let tick = getTickCount();

			while (getTickCount() - tick < 5000) {
				if (getUIFlag(sdk.uiflags.Cube)) {
					delay(100 + me.ping * 2); // allow UI to initialize

					return true;
				}

				delay(100);
			}
		}

		return false;
	},

	closeCube: function () {
		if (!getUIFlag(sdk.uiflags.Cube)) return true;

		for (let i = 0; i < 5; i++) {
			me.cancel();
			let tick = getTickCount();

			while (getTickCount() - tick < 3000) {
				if (!getUIFlag(sdk.uiflags.Cube)) {
					delay(250 + me.ping * 2); // allow UI to initialize
					return true;
				}

				delay(100);
			}
		}

		return false;
	},

	emptyCube: function () {
		let cube = me.getItem(sdk.quest.item.Cube);
		let items = me.findItems(-1, -1, sdk.storage.Cube);

		if (!cube) return false;
		if (!items) return true;

		while (items.length) {
			if (!Storage.Stash.MoveTo(items[0]) && !Storage.Inventory.MoveTo(items[0])) {
				return false;
			}

			items.shift();
		}

		return true;
	},

	makeRevPots: function () {
		let locations = {
			Belt: 2,
			Inventory: 3,
			Cube: 6,
			Stash: 7,
		};
		let origin = [], cube = me.getItem(sdk.quest.item.Cube), cubeInStash;

		// Get a list of all items - Filter out all those rev pots
		let revpots = me.getItemsEx().filter(item => item.classid === sdk.items.RejuvenationPotion);

		// Stop if less as 3 pots
		if (revpots.length < 3) {
			return;
		}

		// Go to town and open stash
		Town.goToTown() && Town.moveToSpot("stash");
		Town.openStash();

		// For reasons unclear, cubing goes wrong in stash in my test, so for ease, i put cube in inventory
		(cubeInStash = cube.location !== locations.Inventory) && Storage.Inventory.MoveTo(cube);
		me.cancel();
		me.cancel();

		// clear the cube, otherwise we cant transmute
		Cubing.emptyCube();

		// Remove excessive pots from the list. (only groups of 3)
		revpots.length -= revpots.length % 3;

		// Call this function for each pot
		revpots.forEach(function (pot, index) {

			// Add this to the original location array
			origin.push({location: pot.location, x: pot.x, y: pot.y});

			Town.openStash();

			// Move to inventory first (to avoid bugs)
			Storage.Inventory.MoveTo(pot);
			me.cancel(); // remove inventory/cube window
			me.cancel(); // remove inventory window (if it was cube)

			// Move the current pot to the cube
			Storage.Cube.MoveTo(pot);
			// For every third pot, excluding the first
			if (!index || (1 + index) % 3 !== 0) {
				me.cancel(); // remove cube window
				me.cancel(); // remove stash window
			} else {
				// press the transmute button
				Cubing.openCube() && transmute();

				// high delay here to avoid issues with ping spikes
				delay(me.ping * 5 + 1000); // <-- probably can be less

				// Find all items in the cube. (the full rev pot)
				let fullrev = me.findItem(-1, -1, sdk.storage.Cube);

				// Sort the original locations of the pots. Put a low location first (belt = 2, rest is higher).
				origin.sort((a, b) => a.location - b.location).some(function (orgin) { // Loop over all the original spots.

					// Loop trough all possible locations
					for (let i in locations) {
						// If location is matched with its orgin, we know the name of the spot
						locations[i] === orgin.location && (orgin.location = i); // Store the name of the location
					}

					Storage.Inventory.MoveTo(fullrev); // First put to inventory;
					me.cancel(); // cube
					me.cancel(); // inventory

					// If the storage location is known, put the pot to this location
					Storage[orgin.location] && Storage[orgin.location].MoveTo(fullrev);

					// If returned true, the prototype some stops looping.
					return fullrev.location !== locations.Cube;
				});

				// empty the array
				origin.length = 0;

				// Cube should be empty, but lets be sure
				Cubing.emptyCube();
			}
		});
		// Put cube back in stash, if it was when we started
		cubeInStash && Storage.Stash.MoveTo(cube);

		me.cancel();
		me.cancel();
	},
};
