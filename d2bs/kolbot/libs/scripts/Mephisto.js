/**
*  @filename    Mephisto.js
*  @author      kolton, njomnjomnjom
*  @desc        kill Mephisto
*
*/

function Mephisto () {
  // eslint-disable-next-line no-unused-vars
  const killMephisto = function () {
    let pos = {};
    let attackCount = 0;
    let meph = Game.getMonster(sdk.monsters.Mephisto);
    if (!meph) throw new Error("Mephisto not found!");

    Config.MFLeader && Pather.makePortal() && say("kill " + meph.classid);

    while (attackCount < 300 && meph.attackable(meph)) {
      if (meph.mode === sdk.monsters.mode.Attacking2) {
        let angle = Math.round(Math.atan2(me.y - meph.y, me.x - meph.x) * 180 / Math.PI);
        let angles = me.y > meph.y ? [-30, -60, -90] : [30, 60, 90];

        for (let i = 0; i < angles.length; i += 1) {
          pos.dist = 18;
          pos.x = Math.round((Math.cos((angle + angles[i]) * Math.PI / 180)) * pos.dist + meph.x);
          pos.y = Math.round((Math.sin((angle + angles[i]) * Math.PI / 180)) * pos.dist + meph.y);

          if (Attack.validSpot(pos.x, pos.y)) {
            me.overhead("move, bitch!");
            Pather.moveTo(pos.x, pos.y);

            break;
          }
        }
      }

      if (ClassAttack.doAttack(meph) < 2) {
        break;
      }

      attackCount += 1;
    }

    return meph.dead;
  };

  const moat = function () {
    /**
     * @param {number} x 
     * @param {number} y 
     * @param {number} duration 
     * @returns {{ x: number, y: number, duration: number }}
     */
    const _posObj = (x, y, duration) => ({ x: x, y: y, duration: duration });

    delay(350);
    Pather.moveTo(17563, 8072);

    let mephisto = Game.getMonster(sdk.monsters.Mephisto);
    if (!mephisto) throw new Error("Mephisto not found.");

    delay(350);
    [
      _posObj(17575, 8086, 350), _posObj(17584, 8091, 1200),
      _posObj(17600, 8095, 550), _posObj(17610, 8094, 2500)
    ].forEach(pos => Pather.moveTo(pos.x, pos.y) && delay(pos.duration));

    Attack.clear(10);
    Pather.moveTo(17610, 8094);

    const _lurePositions = [
      _posObj(17600, 8095, 150), _posObj(17584, 8091, 150),
      _posObj(17575, 8086, 150), _posObj(17563, 8072, 350),
      _posObj(17575, 8086, 350), _posObj(17584, 8091, 1200),
      _posObj(17600, 8095, 550), _posObj(17610, 8094, 2500)
    ];
    let count = 0;
    let distance = getDistance(me, mephisto);

    while (distance > 27) {
      count += 1;

      _lurePositions
        .forEach(pos => Pather.moveTo(pos.x, pos.y) && delay(pos.duration));
      Attack.clear(10);
      Pather.moveTo(17610, 8094);

      distance = getDistance(me, mephisto);

      if (count >= 5) {
        throw new Error("Failed to lure Mephisto.");
      }
    }

    return true;
  };

  const killCouncil = function () {
    const councilMembers = [sdk.monsters.Council1, sdk.monsters.Council2, sdk.monsters.Council3];
    const coords = [[17600, 8125], [17600, 8015], [17643, 8068]];

    for (let [x, y] of coords) {
      Pather.moveTo(x, y);
      Attack.clearList(Attack.getMob(councilMembers, 0, 40));
    }

    return true;
  };

  Town.doChores();
  Pather.useWaypoint(sdk.areas.DuranceofHateLvl2);
  Precast.doPrecast(true);

  if (!Pather.moveToExit(sdk.areas.DuranceofHateLvl3, true)) {
    throw new Error("Failed to move to Durance Level 3");
  }

  Config.Mephisto.KillCouncil && killCouncil();

  if (Config.Mephisto.TakeRedPortal) {
    Pather.moveTo(17590, 8068);
    delay(400); // Activate the bridge tile
  } else {
    Pather.moveTo(17566, 8069);
  }

  if (me.sorceress && Config.Mephisto.MoatTrick && Pather.canTeleport()) {
    moat();
    Skill.usePvpRange = true;
    Attack.kill(sdk.monsters.Mephisto);
    Skill.usePvpRange = false;
  } else {
    Attack.kill(sdk.monsters.Mephisto);
  }

  Pickit.pickItems();

  if (Config.OpenChests.Enabled) {
    Pather.moveTo(17572, 8011) && Attack.openChests(5);
    Pather.moveTo(17572, 8125) && Attack.openChests(5);
    Pather.moveTo(17515, 8061) && Attack.openChests(5);
  }

  if (Config.Mephisto.TakeRedPortal) {
    Pather.moveTo(17590, 8068);
    let tick = getTickCount(), time = 0;

    // Wait until bridge is there
    while (getCollision(me.area, 17601, 8070, 17590, 8068) !== 0
      && (time = getTickCount() - tick) < 2000) {
      Pather.moveTo(17590, 8068); // Activate it
      delay(3);
    }

    // If bridge is there, and we can move to the location
    if (time < 2000 && Pather.moveTo(17601, 8070)) {
      Pather.usePortal(null);
    }
  }

  return true;
}
