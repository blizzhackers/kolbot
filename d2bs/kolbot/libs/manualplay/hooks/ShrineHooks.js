/*
*	@filename	ShrineHooks.js
*	@author		theBGuy
*	@desc		Shrine hooks for MapThread
*/

const ShrineHooks = {
	enabled: true,
	hooks: [],
	shrines: {
		1: "Refilling",
		2: "Health",
		3: "Mana",
		4: "Health Exchange",
		5: "Mana Exchange",
		6: "Armor",
		7: "Combat",
		8: "Resist Fire",
		9: "Resist Cold",
		10: "Resist Lightning",
		11: "Resist Poison",
		12: "Skill",
		13: "Mana Recharge",
		14: "Stamina",
		15: "Experience",
		16: "Enirhs",
		17: "Portal",
		18: "Gem",
		19: "Fire",
		20: "Monster",
		21: "Exploding",
		22: "Poison"
	},

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
				if (shrine.mode === 0) {
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
		if (!shrine.objtype) {
			return;
		}

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
