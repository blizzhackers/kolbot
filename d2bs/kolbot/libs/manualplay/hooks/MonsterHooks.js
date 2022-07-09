/*
*	@filename	MonsterHooks.js
*	@author		theBGuy
*	@credit		DetectiveSquirrel
*	@desc		Monster hooks for MapThread
*/

const MonsterHooks = {
	hooks: [],
	enabled: true,

	check: function () {
		if (!this.enabled || me.inTown) {
			this.flush();

			return;
		}

		for (let i = 0; i < this.hooks.length; i += 1) {
			if (!copyUnit(this.hooks[i].unit).x) {
				this.hooks[i].hook.remove();
				this.hooks.splice(i, 1);

				i -= 1;
			}
		}

		let unit = Game.getMonster();

		if (unit) {
			do {
				if (unit.attackable) {
					!this.getHook(unit) ? this.add(unit) : this.updateCoords(unit);
				} else {
					this.remove(unit);
				}
			} while (unit.getNext());
		}
	},

	// credit DetectiveSquirrel from his maphack https://github.com/DetectiveSquirrel/Kolbot-MapThread/blob/9c721a72a934518cfca1d1a05211b5e03b5b624f/kolbot/tools/MapThread.js#L2353
	specTypeColor: function (unit) {
		const spectype = {
			Boss: 0x04,
			Unique: 0x05,
			Magic: 0x06,
			Minion: 0x08
		};

		switch (unit.spectype) {
		case spectype.Minion:
			return 3;
		case spectype.Magic:
			return 9;
		case spectype.Boss:
			return 11;
		case spectype.Unique:
			return 2;
		default:
			return 8;
		}
	},

	add: function (unit) {
		this.hooks.push({
			unit: copyUnit(unit),
			hook: new Text((unit.spectype & 0xF ? "O" : "X"), unit.x, unit.y, this.specTypeColor(unit), 1, null, true)
		});
	},

	updateCoords: function (unit) {
		let hook = this.getHook(unit);

		if (!hook) {
			return false;
		}

		hook.x = unit.x;
		hook.y = unit.y;

		return true;
	},

	getHook: function (unit) {
		for (let i = 0; i < this.hooks.length; i += 1) {
			if (this.hooks[i].unit.gid === unit.gid) {
				return this.hooks[i].hook;
			}
		}

		return false;
	},

	remove: function (unit) {
		for (let i = 0; i < this.hooks.length; i += 1) {
			if (this.hooks[i].unit.gid === unit.gid) {
				this.hooks[i].hook.remove();
				this.hooks.splice(i, 1);

				return true;
			}
		}

		return false;
	},

	flush: function () {
		while (this.hooks.length) {
			this.hooks[0].hook.remove();
			this.hooks.shift();
		}
	}
};
