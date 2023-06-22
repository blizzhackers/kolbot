/**
*  @filename    Duriel.js
*  @author      kolton, theBGuy
*  @desc        kill Duriel
*
*/

function Duriel () {
  const killDuriel = function () {
    let target = Misc.poll(function () {
      return Game.getMonster(sdk.monsters.Duriel);
    }, 1000, 200);
    if (!target) throw new Error("Duriel not found.");

    if (Config.MFLeader && Pather.makePortal()) {
      say("kill " + sdk.monsters.Duriel);
    }

    for (let i = 0; i < 300 && target.attackable; i += 1) {
      ClassAttack.doAttack(target);
      target.distance <= 10 && Pather.moveTo(22638, me.y < target.y ? 15722 : 15693);
    }

    return target.dead;
  };

  if (!me.inArea(sdk.areas.CanyonofMagic)) {
    Town.doChores();
    Pather.useWaypoint(sdk.areas.CanyonofMagic);
  }

  Precast.doPrecast(true);

  if (!Pather.moveToExit(getRoom().correcttomb, true)) {
    throw new Error("Failed to move to Tal Rasha's Tomb");
  }
  /** @type {ObjectUnit} */
  let lairEntrance = null;
  if (!Pather.moveToPresetObject(me.area, sdk.quest.chest.HoradricStaffHolder,
    { offX: -11, offY: 3, callback: function () {
      lairEntrance = Game.getObject(sdk.objects.PortaltoDurielsLair);
      return lairEntrance && lairEntrance.distance < 20;
    } })) {
    throw new Error("Failed to move to Orifice");
  }

  // me.hardcore && !me.sorceress && Attack.clear(5);
  if (lairEntrance && Skill.useTK(lairEntrance)) {
    if (lairEntrance.distance > 20) {
      Attack.getIntoPosition(lairEntrance, 20, sdk.collision.LineOfSight);
    }
    Misc.poll(function () {
      Packet.telekinesis(lairEntrance) && delay(100);
      return me.inArea(sdk.areas.DurielsLair);
    }, 1000, 200);
  }

  let [type, id, target] = [
    sdk.unittype.Object, sdk.objects.PortaltoDurielsLair, sdk.areas.DurielsLair
  ];

  if (!me.inArea(sdk.areas.DurielsLair)
    && !Pather.useUnit(type, id, target)) {
    Attack.clear(10);
    Pather.useUnit(type, id, target);
  }

  if (!me.inArea(sdk.areas.DurielsLair)) {
    throw new Error("Failed to move to Duriel");
  }

  me.sorceress && me.classic
    ? killDuriel()
    : Attack.kill(sdk.monsters.Duriel);
  Pickit.pickItems();

  return true;
}
