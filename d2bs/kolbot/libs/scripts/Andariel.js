/**
*  @filename    Andariel.js
*  @author      kolton, theBGuy
*  @desc        kill Andariel
*
*/

const Andariel = new Runnable(
  function Andariel () {
    const killAndariel = function () {
      let target = Game.getMonster(sdk.monsters.Andariel);
      if (!target) throw new Error("Andariel not found.");

      Config.MFLeader && Pather.makePortal() && say("kill " + sdk.monsters.Andariel);

      for (let i = 0; i < 300 && target.attackable; i += 1) {
        ClassAttack.doAttack(target);
        target.distance <= 10 && Pather.moveTo(me.x > 22548 ? 22535 : 22560, 9520);
      }

      return target.dead;
    };

    Pather.useWaypoint(sdk.areas.CatacombsLvl2);
    Precast.doPrecast(true);

    if (!Pather.moveToExit([sdk.areas.CatacombsLvl3, sdk.areas.CatacombsLvl4], true)) {
      throw new Error("Failed to move to Catacombs Level 4");
    }

    Pather.move(new PathNode(22549, 9520), { callback: function () {
      return Attack._killed.has(sdk.monsters.Andariel);
    } });
    me.sorceress && me.classic
      ? killAndariel()
      : Attack.kill(sdk.monsters.Andariel);

    delay(2000); // Wait for minions to die.
    Pickit.pickItems();

    return true;
  },
  {
    startArea: sdk.areas.CatacombsLvl2,
    bossid: sdk.monsters.Andariel,
  }
);
