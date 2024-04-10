/**
*  @filename    GetFade.js
*  @author      theBGuy
*  @desc        Get fade in River of Flames - only works if we are wearing an item with ctc Fade
*
*/

const GetFade = new Runnable(
  function GetFade () {
    // Can't get use river if we can't access the act - TODO: use another area if we can't access river
    if (!me.accessToAct(4)) return false;
    // already have fade
    if (me.getState(sdk.states.Fade)) return true;

    /** @type {{ have: boolean, item: ItemUnit }} */
    const fadeItem = me.findFirst([
      { name: sdk.locale.items.Treachery, equipped: true },
      { name: sdk.locale.items.LastWish, equipped: true },
      { name: sdk.locale.items.SpiritWard, equipped: true }
    ]);
    if (!fadeItem) throw new Error("No item with ctc Fade equipped");

    console.log("Getting fade");
    me.overhead("Getting fade");

    Pather.useWaypoint(sdk.areas.RiverofFlame, true);
    Precast.doPrecast(true);

    // check if item is on switch
    let mainSlot;

    Pather.moveTo(7811, 5872);
      
    if (fadeItem.have && fadeItem.item.isOnSwap && me.weaponswitch !== sdk.player.slot.Secondary) {
      mainSlot = me.weaponswitch;
      me.switchWeapons(sdk.player.slot.Secondary);
    }

    Skill.canUse(sdk.skills.Salvation) && Skill.setSkill(sdk.skills.Salvation, sdk.skills.hand.Right);

    try {
      let retry = 0;
      let timeout = getTickCount() + Time.minutes(1);
      while (!me.getState(sdk.states.Fade)) {
        if (getTickCount() > timeout) {
          retry++;
          if (retry > 5) {
            throw new Error("Failed to get fade");
          }
          Pather.randMove();
          Pather.moveTo(7811, 5872);
          timeout = getTickCount() + Time.minutes(1);
        }
        delay(3);
      }
      return me.getState(sdk.states.Fade);
    } finally {
      mainSlot !== undefined && me.weaponswitch !== mainSlot && me.switchWeapons(mainSlot);
    }
  },
  sdk.areas.RiverofFlame
);
