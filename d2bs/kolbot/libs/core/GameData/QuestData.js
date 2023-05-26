/**
*  @filename    QuestData.js
*  @author      theBGuy
*  @desc        quest data library, make checking quests easier
*
*/

(function (module) {
  /**
   * @todo Fill out more, items for quests, npcs, etc
   */
  const QuestData = (function () {
    let _lastRefresh = 0;

    /** @type {Set<number>} */
    const _specials = new Set();
    [
      sdk.quest.id.SpokeToWarriv, sdk.quest.id.AbleToGotoActII,
      sdk.quest.id.SpokeToJerhyn, sdk.quest.id.AbleToGotoActIII,
      sdk.quest.id.SpokeToHratli, sdk.quest.id.AbleToGotoActIV,
      sdk.quest.id.SpokeToTyrael, sdk.quest.id.AbleToGotoActV,
    ].forEach(questId => _specials.add(questId));

    const refresh = function () {
      if (getTickCount() - _lastRefresh > 500) {
        Packet.questRefresh();
        _lastRefresh = getTickCount();
      }
    };
    
    /**
     * @constructor
     * @param {number} questId 
     * @param {number} act 
     */
    function Quest (questId, act) {
      this.id = questId;
      this.act = act;
      this.states = new Array(16).fill(0); // todo figure a method to ensure the length is immutable
      this.completed = false;
      this.reqComplete = false;
      this.cannotComplete = false;
    }

    Quest.prototype.complete = function (reqCheck = false) {
      if (this.completed) return true;
      if (this.cannotComplete) return false;
      if (reqCheck && this.reqComplete) return true;
      refresh();

      let completedStatus = me.getQuest(this.id, sdk.quest.states.Completed);
      if (completedStatus) {
        this.completed = true;
        return true;
      }

      let cannotCompleteStatus = me.getQuest(this.id, sdk.quest.states.CannotComplete);
      if (cannotCompleteStatus) {
        this.cannotComplete = true;
        return false;
      }

      if (reqCheck) {
        let reqCompleteStatus = me.getQuest(this.id, sdk.quest.states.ReqComplete);
        if (reqCompleteStatus) {
          this.reqComplete = true;
          return true;
        }
      }

      return false;
    };

    /**
     * @param {number} state - quest state (0 - 15)
     * @param {boolean} complete - if true, will check if state bit is 1 (active) otherwise 0 (inactive)
     * @returns {boolean}
     */
    Quest.prototype.checkState = function (state, complete = true) {
      // handle the ones we already know
      if (state === sdk.quest.states.Completed && this.completed) return complete;
      if (state === sdk.quest.states.CannotComplete && this.cannotComplete) return complete;
      if (state === sdk.quest.states.ReqComplete && this.reqComplete) return complete;

      refresh();
      let val = me.getQuest(this.id, state);
      this.states[state] = val;
      return complete ? val === 1 : val === 0;
    };

    Quest.prototype.getStates = function () {
      refresh();

      // the non-visible quests can stop after 1
      let max = _specials.has(this.id) ? 1 : 16;

      for (let state = 0; state < max; state++) {
        this.states[state] = me.getQuest(this.id, state);
        delay(10);
      }

      this.completed = this.states[sdk.quest.states.Completed] === 1;
      this.cannotComplete = this.states[sdk.quest.states.CannotComplete] === 1;
      this.reqComplete = this.states[sdk.quest.states.ReqComplete] === 1;

      return this.states;
    };

    /** @type {Map<number, Quest>} */
    const questMap = new Map();
    [
      [
        sdk.quest.id.SpokeToWarriv, sdk.quest.id.DenofEvil,
        sdk.quest.id.SistersBurialGrounds, sdk.quest.id.ToolsoftheTrade,
        sdk.quest.id.TheSearchForCain, sdk.quest.id.ForgottenTower,
        sdk.quest.id.SistersToTheSlaughter, sdk.quest.id.Respec
      ],
      [
        sdk.quest.id.AbleToGotoActII, sdk.quest.id.SpokeToJerhyn,
        sdk.quest.id.RadamentsLair, sdk.quest.id.TheHoradricStaff,
        sdk.quest.id.TheTaintedSun, sdk.quest.id.TheSummoner,
        sdk.quest.id.TheArcaneSanctuary, sdk.quest.id.TheSevenTombs
      ],
      [
        sdk.quest.id.AbleToGotoActIII, sdk.quest.id.SpokeToHratli,
        sdk.quest.id.TheGoldenBird, sdk.quest.id.BladeoftheOldReligion,
        sdk.quest.id.LamEsensTome, sdk.quest.id.KhalimsWill,
        sdk.quest.id.TheBlackenedTemple, sdk.quest.id.TheGuardian,
      ],
      [
        sdk.quest.id.AbleToGotoActIV, sdk.quest.id.TheFallenAngel,
        sdk.quest.id.SpokeToTyrael, sdk.quest.id.HellsForge, sdk.quest.id.TerrorsEnd,
      ],
      [
        sdk.quest.id.AbleToGotoActV, sdk.quest.id.SiegeOnHarrogath,
        sdk.quest.id.RescueonMountArreat, sdk.quest.id.PrisonofIce,
        sdk.quest.id.BetrayalofHarrogath, sdk.quest.id.RiteofPassage, sdk.quest.id.EyeofDestruction,
      ]
    ].forEach((questIds, act) => {
      for (let questId of questIds) {
        questMap.set(questId, new Quest(questId, act + 1));
      }
    });
    
    return {
      /**
       * @param {number} questId 
       * @returns {Quest | undefined}
       */
      get: function (questId) {
        return questMap.get(questId);
      },

      /**
       * @param {number} questId 
       * @returns {boolean}
       */
      has: function (questId) {
        return questMap.has(questId);
      },

      init: function () {
        console.time("QuestData.init");
        questMap.forEach(quest => quest.getStates());
        console.timeEnd("QuestData.init");
      },

      /**
       * @param {number} questId 
       * @returns {number}
       */
      getActForQuest: function (questId) {
        return questMap.get(questId).act;
      },
    };
  })();

  module.exports = QuestData;
})(module);
