/**
*  @filename    Ancients.js
*  @author      theBGuy
*  @desc        Handle Ancients quest
*
*/

(function (Common) {
  typeof Common !== "object" && (Common = {});
  Object.defineProperty(Common, "Ancients", {
    value: new function () {
      this.altarSpot = { x: 10047, y: 12622 };
      this.archway = { x: 10050, y: 12637 };
      this.talicStatue = { x: 10037, y: 12617 };
      this.madawcStatue = { x: 10048, y: 12607 };
      this.korlicStatue = { x: 10058, y: 12617 };
      this.lastPrep = 0;

      this.canAttack = function () {
        let ancient = Game.getMonster();

        if (ancient) {
          do {
            if (!ancient.getParent() && !Attack.canAttack(ancient)) {
              console.log("Can't attack ancients");
              return false;
            }
          } while (ancient.getNext());
        }

        return true;
      };

      this.touchAltar = function () {
        let altar = Misc.poll(() => Game.getObject(sdk.objects.AncientsAltar), 5000, 100);

        if (altar) {
          while (altar.mode !== sdk.objects.mode.Active) {
            if (Skill.haveTK) {
              (this.archway.distance > 1 || altar.distance > 20) && Pather.moveToUnit(this.archway);
              Packet.telekinesis(altar);
            } else {
              Pather.moveToUnit(altar);
              altar.interact();
            }
            delay(200 + me.ping);
            me.cancel();
          }

          // wait for ancients to spawn
          while (!Game.getMonster(sdk.monsters.TalictheDefender)) {
            delay(250 + me.ping);
          }

          return true;
        } else {
          Pather.moveNearUnit(this.altarSpot, (Skill.haveTK ? 19 : 5));
        }

        return false;
      };

      this.checkStatues = function () {
        let statues = getUnits(sdk.unittype.Object)
          .filter(u => [
            sdk.objects.KorlictheProtectorStatue,
            sdk.objects.TalictheDefenderStatue,
            sdk.objects.MadawctheGuardianStatue].includes(u.classid)
            && u.mode === sdk.objects.mode.Active);
        return statues.length === 3;
      };

      this.checkCorners = function () {
        let pos = [
          { x: 10036, y: 12592 }, { x: 10066, y: 12589 },
          { x: 10065, y: 12623 }, { x: 10058, y: 12648 },
          { x: 10040, y: 12660 }, { x: 10036, y: 12630 },
          { x: 10038, y: 12611 }
        ];
        Pather.moveToUnit(this.altarSpot);
        if (!this.checkStatues()) {
          return pos.forEach((node) => {
            // no mobs at that next, skip it
            if ([node.x, node.y].distance < 35 && [node.x, node.y].mobCount({ range: 30 }) === 0) {
              return;
            }
            Pather.moveTo(node.x, node.y);
            Attack.clear(30);
          });
        }

        return true;
      };

      this.killAncients = function (checkQuest = false) {
        let retry = 0;
        let attackRange = Skill.getRange(Config.AttackSkill[1]);
        Pather.moveNearUnit(this.altarSpot, attackRange);

        while (!this.checkStatues()) {
          if (retry > 5) {
            console.log("Failed to kill anicents.");
            
            break;
          }
          /**
           * @todo - far cast pwning the ancients
           */
          Attack.clearClassids(
            sdk.monsters.KorlictheProtector, sdk.monsters.TalictheDefender, sdk.monsters.MadawctheGuardian
          );
          delay(1000);

          if (checkQuest) {
            if (Misc.checkQuest(sdk.quest.id.RiteofPassage, sdk.quest.states.Completed)) {
              break;
            }
            console.log("Failed to kill anicents. Attempt: " + retry);
          }

          this.checkCorners();
          retry++;
        }
      };

      this.ancientsPrep = function () {
        Town.goToTown();
        Town.fillTome(sdk.items.TomeofTownPortal);
        [
          sdk.items.StaminaPotion, sdk.items.AntidotePotion, sdk.items.ThawingPotion
        ].forEach(p => Town.buyPots(10, p, true));
        Town.buyPotions();
        Pather.usePortal(sdk.areas.ArreatSummit, me.name);
        Common.Ancients.lastPrep = getTickCount();
      };

      this.startAncients = function (preTasks = false, checkQuest = false) {
        let retry = 0;
        this.touchAltar();

        while (!this.canAttack()) {
          if (retry > 10) throw new Error("I think I'm unable to complete ancients, I've rolled them 10 times");
          preTasks && getTickCount() - this.lastPrep > Time.minutes(1)
            ? this.ancientsPrep()
            : Pather.makePortal();
          this.touchAltar();
          retry++;
        }

        this.killAncients(checkQuest);
      };
    },
    configurable: true,
  });
})(Common);
