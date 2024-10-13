/**
*  @filename    CleanerConfig.js
*  @author      theBGuy
*  @desc        Configuration file for Cleaner system
*
*/

(function (module) {
  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
  // D2BotCleaner settings - for global settings @see libs/starter/StarterConfig.js
  // New Stuff:
  // DataCleaner - to delete old files associated with running kolbot or SoloPlay
  // SaveFiles - to save important SoloPlay files to SoloPlay/Data/ for performance review
  //***********************************************************************************************************************//
  //	DataCleaner and SaveFiles can both be used for cleaning/saving files without having to delete associated characters  //
  //***********************************************************************************************************************//
  const CleanerConfig = {
    /**
     * Always run this when re-using a profile with Kolbot-SoloPlay
     */
    DataCleaner: true,
    /**
     * NOTE: Only works on SoloPlay profiles.
     * Highly recommened to run this if using the peformance tracking system and wish to review them later
     */
    SaveFiles: false,
    /**
     * Seconds to wait before cleaning next account
     * If doing 10+ accounts recommended to increase this delay to rand(30, 60) prevent R/D
     */
    DelayBetweenAccounts: rand(15, 30),
  };

  /**
   * @todo this section should be in it's own config leaving this file only containing core logic
   * @example <caption>Format</caption>
   * "account1/password1/realm": ["charname1", "charname2"],
   * "account2/password2/realm": ["charnameX", "charnameY"],
   * "account3/password3/realm": ["all"]
   *
   * // To clean a full account, put "account/password/realm": ["all"]
   *
   * // realm = useast, uswest, europe, asia
   *
   * // for singleplayer follow format "singleplayer": ["charname1", "charname2"]
   *
   * // Individual entries are separated with a comma.
   * @example
   * "MyAcc1/tempPass/useast": ["soloSorc"],
   * "singleplayer": ["solobarb"],
   * 
   * @type {Object<string, string[]>}
   */
  const AccountsToClean = {
    // Enter your lines under here
  };

  const CharactersToExclude = [""];
    
  /**
   * NEW STUFF - Please enter your profile name exactly as it appears in D2Bot#
   * @example
   * "SCL-ZON123", "hcnl-pal123",
   * @type {string[]}
   */
  const profiles = [
    // Enter your lines under here

  ];

  /**
   * @description If you have a lot of profiles that are clones this can be used as an easier way to clean all of them
   * @param {string} profilePrefix
   * - this is everthing before the suffix numbers. Ex: mypal01 or sccl-pal-001, ect
   * @param {string} profileSuffixStart
   * - this is the suffix to start at, Ex: 01 or 001 or 1, all the profiles need have the same format.
   * CANNOT HAVE scl-pal-1 and scl-pal-001
   * @param {string} end
   * - the ending profile suffix, this is used to stop the loop.
   * If you are doing scl-pal-001 to scl-pal-100 (that'd be alot) then 100 would go here
   * @example
   * // This will clean all profiles from scl-sorc-002 to scl-sorc-009
   * {
   * 	profilePrefix: "scl-sorc-",
   * 	profileSuffixStart: "002",
   * 	end: "009"
   * }
   * @type {Array<{profilePrefix: string, profileSuffixStart: string, end: string}>}
   */
  const AdvancedProfileCleanerConfig = [
    // {
    // 	profilePrefix: "scl-sorc-",
    // 	profileSuffixStart: "002",
    // 	end: "009"
    // },
    // Your lines under here
  ];

  /**
   * @description Generate accounts to entirely clean ("all") 
   * - To use this, set `generateAccounts` to true and setup the rest of the parameters
   *
   * - It will generates accounts from start to stop range(included):
   * account1/password/realm
   * account2/password/realm
   * etc...
   */
  const AdvancedCleanerConfig = {
    generateAccounts: false,
    accountPrefix: "account",
    accountPassword: "password",
    accountRealm: "realm",
    rangeStart: 1,
    rangeStop: 10
  };

  module.exports = {
    CleanerConfig: CleanerConfig,
    AccountsToClean: AccountsToClean,
    CharactersToExclude: CharactersToExclude,
    profiles: profiles,
    AdvancedProfileCleanerConfig: AdvancedProfileCleanerConfig,
    AdvancedCleanerConfig: AdvancedCleanerConfig
  };
})(module);
