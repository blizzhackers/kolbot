/**
*  @filename    Smith.js
*  @author      theBGuy
*  @desc        Complete smith quest
*
*/

(function (Common) {
  typeof Common !== "object" && (Common = {});
  Object.defineProperty(Common, "Smith", {
    value: function () {
      if (!Pather.moveToPreset(sdk.areas.Barracks, sdk.unittype.Object, sdk.quest.chest.MalusHolder)) {
        throw new Error("Failed to move to the Smith");
      }

      Attack.kill(getLocaleString(sdk.locale.monsters.TheSmith));
      let malusChest = Game.getObject(sdk.quest.chest.MalusHolder);
      !!malusChest && malusChest.distance > 5 && Pather.moveToUnit(malusChest);
      Misc.openChest(malusChest);
      let malus = Misc.poll(() => Game.getItem(sdk.quest.item.HoradricMalus), 1000, 100);
      Pickit.pickItem(malus);
      Town.goToTown();
      Town.npcInteract("Charsi");
      
      return !!Misc.checkQuest(sdk.quest.id.ToolsoftheTrade, sdk.quest.states.ReqComplete);
    },
    configurable: true,
  });
})(Common);
