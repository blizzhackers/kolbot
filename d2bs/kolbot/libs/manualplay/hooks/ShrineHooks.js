/**
*  @filename    ShrineHooks.js
*  @author      theBGuy
*  @desc        Shrine hooks for MapThread
*
*/

const ShrineHooks = {
	enabled: true,
	hooks: [],
	shrines: {},

	check: function () {
		if (!this.enabled || me.inTown) {
			this.flush();

			return;
		}

		for (let i = 0; i < this.hooks.length; i++) {
			if (!copyUnit(this.hooks[i].shrine).objtype) {
				this.hooks[i].hook[0].remove();
				this.hooks.splice(i, 1);

				i -= 1;
			}
		}

		let shrine = Game.getObject("shrine");

		if (shrine) {
			do {
				if (shrine.mode === sdk.objects.mode.Inactive) {
					if (!this.getHook(shrine)) {
						this.add(shrine);
					}
				} else {
					this.remove(shrine);
				}
			} while (shrine.getNext());
		}
	},

	newHook: function (shrine) {
		let arr = [];
		let typeName;

		typeName = this.shrines[shrine.objtype];
		typeName && arr.push(new Text(typeName, shrine.x, shrine.y, 4, 6, 2, true));

		return arr;
	},

	add: function (shrine) {
		if (!shrine.objtype) return;

		this.hooks.push({
			shrine: copyUnit(shrine),
			hook: this.newHook(shrine)
		});
	},

	getHook: function (shrine) {
		for (let i = 0; i < this.hooks.length; i++) {
			if (this.hooks[i].shrine.gid === shrine.gid) {
				return this.hooks[i].hook;
			}
		}

		return false;
	},

	remove: function (shrine) {
		for (let i = 0; i < this.hooks.length; i++) {
			if (this.hooks[i].shrine.gid === shrine.gid) {
				this.hooks[i].hook[0].remove();
				this.hooks.splice(i, 1);

				return true;
			}
		}

		return false;
	},

	flush: function () {
		while (this.hooks.length) {
			this.hooks[0].hook[0].remove();
			this.hooks.shift();
		}
	}
};

ShrineHooks.shrines[sdk.shrines.Refilling] = "Refilling";
ShrineHooks.shrines[sdk.shrines.Health] = "Health";
ShrineHooks.shrines[sdk.shrines.Mana] = "Mana";
ShrineHooks.shrines[sdk.shrines.HealthExchange] = "Health Exchange";
ShrineHooks.shrines[sdk.shrines.ManaExchange] = "Mana Exchange";
ShrineHooks.shrines[sdk.shrines.Armor] = "Armor";
ShrineHooks.shrines[sdk.shrines.Combat] = "Combat";
ShrineHooks.shrines[sdk.shrines.ResistFire] = "Resist Fire";
ShrineHooks.shrines[sdk.shrines.ResistCold] = "Resist Cold";
ShrineHooks.shrines[sdk.shrines.ResistLightning] = "Resist Lightning";
ShrineHooks.shrines[sdk.shrines.ResistPoison] = "Resist Poison";
ShrineHooks.shrines[sdk.shrines.Skill] = "Skill";
ShrineHooks.shrines[sdk.shrines.ManaRecharge] = "Mana Recharge";
ShrineHooks.shrines[sdk.shrines.Stamina] = "Stamina";
ShrineHooks.shrines[sdk.shrines.Experience] = "Experience";
ShrineHooks.shrines[sdk.shrines.Enirhs] = "Enirhs";
ShrineHooks.shrines[sdk.shrines.Portal] = "Portal";
ShrineHooks.shrines[sdk.shrines.Gem] = "Gem";
ShrineHooks.shrines[sdk.shrines.Fire] = "Fire";
ShrineHooks.shrines[sdk.shrines.Monster] = "Monster";
ShrineHooks.shrines[sdk.shrines.Exploding] = "Exploding";
ShrineHooks.shrines[sdk.shrines.Poison] = "Poison";
