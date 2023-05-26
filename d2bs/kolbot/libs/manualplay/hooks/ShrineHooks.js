/**
*  @filename    ShrineHooks.js
*  @author      theBGuy
*  @desc        Shrine hooks for MapThread
*
*/

const ShrineHooks = {
  enabled: true,
  hooks: [],
  shrines: new Map(),

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

    let shrine = Game.getObject();

    if (shrine) {
      do {
        if (this.shrines.has(shrine.objtype) && shrine.name.toLowerCase().includes("shrine")) {
          if (shrine.mode === sdk.objects.mode.Inactive) {
            if (!this.getHook(shrine)) {
              this.add(shrine);
            }
          } else {
            this.remove(shrine);
          }
        }
      } while (shrine.getNext());
    }
  },

  newHook: function (shrine) {
    let typeName = this.shrines.get(shrine.objtype);
    return typeName ? [new Text(typeName, shrine.x, shrine.y, 4, 6, 2, true)] : [];
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

ShrineHooks.shrines.set(sdk.shrines.Refilling, "Refilling");
ShrineHooks.shrines.set(sdk.shrines.Health, "Health");
ShrineHooks.shrines.set(sdk.shrines.Mana, "Mana");
ShrineHooks.shrines.set(sdk.shrines.HealthExchange, "Health Exchange");
ShrineHooks.shrines.set(sdk.shrines.ManaExchange, "Mana Exchange");
ShrineHooks.shrines.set(sdk.shrines.Armor, "Armor");
ShrineHooks.shrines.set(sdk.shrines.Combat, "Combat");
ShrineHooks.shrines.set(sdk.shrines.ResistFire, "Resist Fire");
ShrineHooks.shrines.set(sdk.shrines.ResistCold, "Resist Cold");
ShrineHooks.shrines.set(sdk.shrines.ResistLightning, "Resist Lightning");
ShrineHooks.shrines.set(sdk.shrines.ResistPoison, "Resist Poison");
ShrineHooks.shrines.set(sdk.shrines.Skill, "Skill");
ShrineHooks.shrines.set(sdk.shrines.ManaRecharge, "Mana Recharge");
ShrineHooks.shrines.set(sdk.shrines.Stamina, "Stamina");
ShrineHooks.shrines.set(sdk.shrines.Experience, "Experience");
ShrineHooks.shrines.set(sdk.shrines.Enirhs, "Enirhs");
ShrineHooks.shrines.set(sdk.shrines.Portal, "Portal");
ShrineHooks.shrines.set(sdk.shrines.Gem, "Gem");
ShrineHooks.shrines.set(sdk.shrines.Fire, "Fire");
ShrineHooks.shrines.set(sdk.shrines.Monster, "Monster");
ShrineHooks.shrines.set(sdk.shrines.Exploding, "Exploding");
ShrineHooks.shrines.set(sdk.shrines.Poison, "Poison");
