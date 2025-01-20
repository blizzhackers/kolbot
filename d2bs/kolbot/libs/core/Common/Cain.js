/**
*  @filename    Cain.js
*  @author      theBGuy
*  @desc        Complete cain quest
*
*/

(function (Common) {
  typeof Common !== "object" && (Common = {});
  Object.defineProperty(Common, "Cain", {
    value: {
      activateStone: function (stone) {
        for (let i = 0; i < 3; i++) {
          // don't use tk if we are right next to it
          let useTK = (stone.distance > 5 && Skill.useTK(stone) && i === 0);
          if (useTK) {
            stone.distance > 13 && Attack.getIntoPosition(stone, 13, sdk.collision.Ranged);
            if (!Packet.telekinesis(stone)) {
              console.debug("Failed to tk: attempt: " + i);
              continue;
            }
          } else {
            [(stone.x + 1), (stone.y + 2)].distance > 5 && Pather.moveTo(stone.x + 1, stone.y + 2, 3);
            Misc.click(0, 0, stone);
          }

          if (Misc.poll(() => stone.mode, 1000, 50)) {
            return true;
          }
          Packet.flash(me.gid);
        }

        // Click to stop walking in case we got stuck
        !me.idle && Misc.click(0, 0, me.x, me.y);

        return false;
      },

      run: function () {
        MainLoop:
        while (true) {
          switch (true) {
          case !Game.getItem(sdk.quest.item.ScrollofInifuss)
            && !Game.getItem(sdk.quest.item.KeytotheCairnStones)
            && !Misc.checkQuest(sdk.quest.id.TheSearchForCain, 4):
            Pather.useWaypoint(sdk.areas.DarkWood, true);
            Precast.doPrecast(true);

            if (!Pather.moveToPreset(sdk.areas.DarkWood, sdk.unittype.Object, sdk.quest.chest.InifussTree, 5, 5)) {
              throw new Error("Failed to move to Tree of Inifuss");
            }

            let tree = Game.getObject(sdk.quest.chest.InifussTree);
            !!tree && tree.distance > 5 && Pather.moveToUnit(tree);
            Misc.openChest(tree);
            let scroll = Misc.poll(() => Game.getItem(sdk.quest.item.ScrollofInifuss), 1000, 100);

            Pickit.pickItem(scroll);
            Town.goToTown();
            Town.npcInteract("Akara");
          
            break;
          case Game.getItem(sdk.quest.item.ScrollofInifuss):
            Town.goToTown(1);
            Town.npcInteract("Akara");

            break;
          case Game.getItem(sdk.quest.item.KeytotheCairnStones) && !me.inArea(sdk.areas.StonyField):
            Pather.journeyTo(sdk.areas.StonyField);
            Precast.doPrecast(true);

            break;
          case Game.getItem(sdk.quest.item.KeytotheCairnStones) && me.inArea(sdk.areas.StonyField):
            Pather.moveToPresetMonster(
              sdk.areas.StonyField,
              sdk.monsters.preset.Rakanishu,
              { offX: 10, offY: 10, pop: true }
            );
            Attack.securePosition(me.x, me.y, 40, 3000, true);
            Pather.moveToPresetObject(
              sdk.areas.StonyField,
              sdk.quest.chest.StoneAlpha,
              { clearSettings: { clearPath: true } }
            );
            let stones = [
              Game.getObject(sdk.quest.chest.StoneAlpha),
              Game.getObject(sdk.quest.chest.StoneBeta),
              Game.getObject(sdk.quest.chest.StoneGamma),
              Game.getObject(sdk.quest.chest.StoneDelta),
              Game.getObject(sdk.quest.chest.StoneLambda)
            ];

            while (stones.some((stone) => !stone.mode)) {
              for (let i = 0; i < stones.length; i++) {
                let stone = stones[i];

                if (this.activateStone(stone)) {
                  stones.splice(i, 1);
                  i--;
                }
                delay(10);
              }
            }

            let tick = getTickCount();
            // wait up to two minutes
            while (getTickCount() - tick < Time.minutes(2)) {
              if (Pather.getPortal(sdk.areas.Tristram)) {
                Pather.usePortal(sdk.areas.Tristram);
                  
                break;
              }
            }

            break;
          case me.inArea(sdk.areas.Tristram)
            && !Misc.checkQuest(sdk.quest.id.TheSearchForCain, sdk.quest.states.Completed):
            let gibbet = Game.getObject(sdk.quest.chest.CainsJail);

            if (gibbet && !gibbet.mode) {
              Pather.moveTo(gibbet.x, gibbet.y);
              if (Misc.poll(() => Misc.openChest(gibbet), 2000, 100)) {
                Town.goToTown(1);
                Town.npcInteract("Akara") && console.log("Akara done");
              }
            }

            break;
          default:
            break MainLoop;
          }
        }

        return true;
      }
    },
    configurable: true,
  });
})(Common);
