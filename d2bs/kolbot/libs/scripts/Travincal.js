/**
*  @filename    Travincal.js
*  @author      kolton
*  @desc        kill Council members in Travincal
*
*/

function Travincal () {
  Town.doChores();
  Pather.useWaypoint(sdk.areas.Travincal);
  Precast.doPrecast(true);

  const [orgX, orgY] = [me.x, me.y];

  /** @param {Monster} mon */
  const councilMember = (mon) => (
    [sdk.monsters.Council1, sdk.monsters.Council2, sdk.monsters.Council3].includes(mon.classid)
  );

  if (Config.Travincal.PortalLeech) {
    Pather.moveTo(orgX + 85, orgY - 139);
    Attack.securePosition(orgX + 70, orgY - 139, 25, 2000);
    Attack.securePosition(orgX + 100, orgY - 139, 25, 2000);
    Attack.securePosition(orgX + 85, orgY - 139, 25, 5000);
    Pather.moveTo(orgX + 85, orgY - 139);
    Pather.makePortal();
    delay(1000);
    Precast.doPrecast(true);
  }

  if (Skill.canUse(sdk.skills.LeapAttack) && !Pather.canTeleport()) {
    const coords = [[60, -53], [64, -72], [78, -72], [74, -88]];

    for (let i = 0; i < coords.length; i++) {
      let [x, y] = coords[i];

      if (i % 2 === 0) {
        Pather.moveTo(orgX + x, orgY + y);
      } else {
        Skill.cast(sdk.skills.LeapAttack, sdk.skills.hand.Right, orgX + x, orgY + y);
        Attack.clearList(
          Attack.buildMonsterList(
            /** @param {Monster} mon */
            (mon) => councilMember(mon) && !checkCollision(me, mon, sdk.collision.BlockWall)
          )
        );
      }
    }

    Attack.clearList(Attack.buildMonsterList(councilMember));
  } else {
    Pather.moveTo(orgX + 101, orgY - 56);

    // Stack Merc
    if (me.barbarian && !Pather.canTeleport() && me.expansion) {
      Pather.moveToExit([sdk.areas.DuranceofHateLvl1, sdk.areas.Travincal], true);
    }

    if (Config.MFLeader) {
      Pather.makePortal();
      say("council " + me.area);
    }

    Attack.clearList(Attack.buildMonsterList(councilMember));
  }

  Config.MFLeader && Config.PublicMode && say("travdone");

  return true;
}
