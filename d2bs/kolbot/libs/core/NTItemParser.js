/* eslint-disable max-len */
/**
*  @filename    NTItemParser.js
*  @author      kolton, jaenster
*  @credit      d2nt
*  @desc        nip file parser for kolbots pickit system
*  
*
*  @Item-parser Syntax Information
*    1. [Keyword] separates into two groups
*      - [Property Keywords] : [Type], [Name], [Class], [Quality], [Flag], [Level], [Prefix], [Suffix]
*      - [Stat Keywords] : [Number or Alias]
*    2. [Keyword] must be surrounded by '[' and ']'
*    3. [Property Keywords] must be placed first
*    4. Insert '#' symbol between [Property Keywords] and [Stat Keywords]
*    5. Use '+', '-', '*', '/', '(', ')', '&&', '||', '>', '>=', '<', '<=', '==', '!=' symbols for comparison
*    6. Use '//' symbol for comment
*
*   @example: [name] == ring && [quality] == unique # [dexterity] == 20 && [tohit] == 250 // Perfect Raven Frost
*
*/

includeIfNotIncluded("core/Prototypes.js");
includeIfNotIncluded("core/GameData/NTItemAlias.js");

/**
 * @todo clean up this file
 */

const NTIP = {};
const NTIP_CheckList = [];
const NTIP_CheckListNoTier = [];
let stringArray = [];

NTIP.OpenFile = function (filepath, notify) {
  if (!FileTools.exists(filepath)) {
    if (notify) {
      Misc.errorReport("ÿc1NIP file doesn't exist: ÿc0" + filepath);
    }

    return false;
  }

  let nipfile;
  let tick = getTickCount();
  let entries = 0;
  const filename = filepath.substring(filepath.lastIndexOf("/") + 1, filepath.length);

  try {
    nipfile = File.open(filepath, 0);
  } catch (fileError) {
    if (notify) {
      Misc.errorReport("ÿc1Failed to load NIP: ÿc0" + filename);
    }
  }

  if (!nipfile) {
    return false;
  }

  let lines = nipfile.readAllLines();
  nipfile.close();

  for (let i = 0; i < lines.length; i++) {
    const info = {
      line: i + 1,
      file: filename,
      string: lines[i]
    };

    let line = NTIP.ParseLineInt(lines[i], info);

    if (line) {
      entries++;

      NTIP_CheckList.push(line);

      if (!lines[i].toLowerCase().match("tier")) {
        NTIP_CheckListNoTier.push(line);
      }
      
      stringArray.push(info);
    }
  }

  if (notify) {
    console.log(
      "ÿc4Loaded NIP: ÿc2" + filename + "ÿc4. Lines: ÿc2" + lines.length
      + "ÿc4. Valid entries: ÿc2" + entries
      + ". ÿc4Time: ÿc2" + (getTickCount() - tick) + " ms"
    );
  }

  return true;
};

NTIP.CheckQuantityOwned = function (item_type, item_stats) {
  let num = 0;
  let items = me.getItemsEx();

  if (!items.length) {
    print("I can't find my items!");

    return 0;
  }

  for (let item of items) {
    if (item.mode === sdk.items.mode.inStorage
      && item.location === sdk.storage.Stash) {
      if ((item_type !== null && typeof item_type === "function" && item_type(item)) || item_type === null) {
        if ((item_stats !== null && typeof item_stats === "function" && item_stats(item)) || item_stats === null) {
          num += 1;
        }
      }
    } else if (item.mode === sdk.items.mode.inStorage
      && item.location === sdk.storage.Inventory) { // inv check
      if ((item_type !== null && typeof item_type === "function" && item_type(item)) || item_type === null) {
        if ((item_stats !== null && typeof item_stats === "function" && item_stats(item)) || item_stats === null) {
          num += 1;
        }
      }
    }
  }

  //print("I have "+num+" of these.");

  return num;
};

NTIP.Clear = function () {
  NTIP_CheckList.length = 0;
  NTIP_CheckListNoTier.length = 0;
  stringArray = [];
};

/**
 * @param {string} tierType 
 * @returns {(item: ItemUnit) => number}
 */
NTIP.generateTierFunc = function (tierType) {
  return function (item) {
    let tier = -1;

    const updateTier = (wanted) => {
      const tmpTier = wanted[tierType](item);

      if (tier < tmpTier) {
        tier = tmpTier;
      }
    };

    // Go through ALL lines that describe the item
    for (let i = 0; i < NTIP_CheckList.length; i += 1) {
      if (NTIP_CheckList[i].length !== 3) {
        continue;
      }

      let [type, stat, wanted] = NTIP_CheckList[i];

      // If the line doesnt have a tier of this type, we dont need to call it
      if (typeof wanted === "object" && wanted && typeof wanted[tierType] === "function") {
        try {
          if (typeof type === "function") {
            if (type(item)) {
              if (typeof stat === "function") {
                if (stat(item)) {
                  updateTier(wanted);
                }
              } else {
                updateTier(wanted);
              }
            }
          } else if (typeof stat === "function") {
            if (stat(item)) {
              updateTier(wanted);
            }
          }
        } catch (e) {
          const info = stringArray[i];
          Misc.errorReport("ÿc1Pickit Tier (" + tierType + ") error! Line # ÿc2" + info.line + " ÿc1Entry: ÿc0" + info.string + " (" + info.file + ") Error message: " + e.message);
        }
      }
    }

    return tier;
  };
};

/**
 * @function
 * @param {ItemUnit} item
 * @returns {number}
 */
NTIP.GetTier = NTIP.generateTierFunc("Tier");

/**
 * @function
 * @param {ItemUnit} item
 * @returns {number}
 */
NTIP.GetMercTier = NTIP.generateTierFunc("Merctier");

/**
 * @param {ItemUnit} item 
 * @param {[(item) => Boolean, (item) => Boolean, (item) => Boolean]} entryList 
 * @param {boolean} verbose 
 */
NTIP.CheckItem = function (item, entryList, verbose) {
  let i, num;
  let rval = {};
  let result = 0;

  const list = entryList
    ? entryList
    : NTIP_CheckList;
  const identified = item.getFlag(sdk.items.flags.Identified);

  for (i = 0; i < list.length; i++) {
    try {
      // Get the values in separated variables (its faster)
      const [type, stat, wanted] = list[i];

      if (typeof type === "function") {
        if (type(item)) {
          if (typeof stat === "function") {
            if (stat(item)) {
              if (wanted && wanted.MaxQuantity && !isNaN(wanted.MaxQuantity)) {
                num = NTIP.CheckQuantityOwned(type, stat);

                if (num < wanted.MaxQuantity) {
                  result = 1;

                  break;
                } else {
                  // attempt at inv fix for maxquantity
                  if (item.getParent() && item.getParent().name === me.name && item.isInStorage && num === wanted.MaxQuantity) {
                    result = 1;

                    break;
                  }
                }
              } else {
                result = 1;

                break;
              }
            } else if (!identified && result === 0) {
              result = -1;
              verbose && (rval.line = stringArray[i].file + " #" + stringArray[i].line);
            }
          } else {
            if (wanted && wanted.MaxQuantity && !isNaN(wanted.MaxQuantity)) {
              num = NTIP.CheckQuantityOwned(type, null);

              if (num < wanted.MaxQuantity) {
                result = 1;

                break;
              } else {
                // attempt at inv fix for maxquantity
                if (item.getParent() && item.getParent().name === me.name && item.isInStorage && num === wanted.MaxQuantity) {
                  result = 1;

                  break;
                }
              }
            } else {
              result = 1;

              break;
            }
          }
        }
      } else if (typeof stat === "function") {
        if (stat(item)) {
          if (wanted && wanted.MaxQuantity && !isNaN(wanted.MaxQuantity)) {
            num = NTIP.CheckQuantityOwned(null, stat);

            if (num < wanted.MaxQuantity) {
              result = 1;

              break;
            } else {
              // attempt at inv fix for maxquantity
              if (item.getParent() && item.getParent().name === me.name && item.isInStorage && num === wanted.MaxQuantity) {
                result = 1;

                break;
              }
            }
          } else {
            result = 1;

            break;
          }
        } else if (!identified && result === 0) {
          result = -1;
          verbose && (rval.line = stringArray[i].file + " #" + stringArray[i].line);
        }
      }
    } catch (pickError) {
      showConsole();

      if (!entryList) {
        Misc.errorReport("ÿc1Pickit error! Line # ÿc2" + stringArray[i].line + " ÿc1Entry: ÿc0" + stringArray[i].string + " (" + stringArray[i].file + ") Error message: " + pickError.message + " Trigger item: " + item.fname.split("\n").reverse().join(" "));

        NTIP_CheckList.splice(i, 1); // Remove the element from the list
      } else {
        Misc.errorReport("ÿc1Pickit error in runeword config!");
      }

      result = 0;
    }
  }

  if (verbose) {
    switch (result) {
    case -1:
      break;
    case 1:
      rval.line = stringArray[i].file + " #" + stringArray[i].line;

      break;
    default:
      rval.line = null;

      break;
    }

    rval.result = result;

    return rval;
  }

  return result;
};

/** @param {string} ch */
NTIP.IsSyntaxInt = function (ch) {
  return (
    ch === "!"
    || ch === "%"
    || ch === "&"
    || (ch >= "(" && ch <= "+")
    || ch === "-"
    || ch === "/"
    || (ch >= ":" && ch <= "?")
    || ch === "|"
  );
};

NTIP.ParseLineInt = function (input, info) {
  let i, property, p_start, p_end, p_section, p_keyword, p_result, value;

  p_end = input.indexOf("//");

  if (p_end !== -1) {
    input = input.substring(0, p_end);
  }

  input = input.replace(/\s+/g, "").toLowerCase();

  if (input.length < 5) {
    return null;
  }

  const _props = new Map([
    ["classid", "item.classid"],
    ["name", "item.classid"],
    ["type", "item.itemType"],
    ["class", "item.itemclass"],
    ["quality", "item.quality"],
    ["charlvl", "me.charlvl"],
    ["level", "item.ilvl"],
    ["flag", "item.getFlag("],
    ["wsm", 'getBaseStat("items", item.classid, "speed")'],
    ["weaponspeed", 'getBaseStat("items", item.classid, "speed")'],
    ["minimumsockets", 'getBaseStat("items", item.classid, "gemsockets")'],
    ["strreq", "item.strreq"],
    ["dexreq", "item.dexreq"],
    ["2handed", 'getBaseStat("items", item.classid, "2handed")'],
    ["color", "item.getColor()"],
    ["europe", '("' + me.realm.toLowerCase() + '"===" europe")'],
    ["uswest", '("' + me.realm.toLowerCase() + '"===" uswest")'],
    ["useast", '("' + me.realm.toLowerCase() + '"===" useast")'],
    ["asia", '("' + me.realm.toLowerCase() + '"===" asia")'],
    ["ladder", "me.ladder"],
    ["hardcore", "(!!me.playertype)"],
    ["classic", "(!me.gametype)"],
    ["distance", "(item.onGroundOrDropping && item.distance || Infinity)"],
    ["prefix", "item.getPrefix("],
    ["suffix", "item.getSuffix("]
  ]);

  const _aliases = new Map([
    ["n", "name"],
    ["id", "classid"],
    ["t", "type"],
    ["q", "quality"],
    ["lvl", "level"],
    ["ilvl", "level"],
    ["f", "flag"],
    ["hc", "hardcore"],
    ["cl", "classic"],
    ["clvl", "charlvl"],
  ]);

  const _lists = new Map([
    ["color", NTIPAliasColor],
    ["type", NTIPAliasType],
    ["name", NTIPAliasClassID],
    ["classid", NTIPAliasClassID],
    ["class", NTIPAliasClass],
    ["quality", NTIPAliasQuality],
    ["flag", NTIPAliasFlag],
    ["stat", NTIPAliasStat],
  ]);

  p_result = input.split("#");

  try {
    if (p_result[0] && p_result[0].length > 4) {
      p_section = p_result[0].split("[");

      p_result[0] = p_section[0];

      for (i = 1; i < p_section.length; i += 1) {
        p_end = p_section[i].indexOf("]") + 1;
        property = p_section[i].substring(0, p_end - 1);

        if (_aliases.has(property)) {
          property = _aliases.get(property);
        }

        switch (property) {
        case "flag":
        case "prefix":
        case "suffix":
          if (p_section[i][p_end] === "!") {
            p_result[0] += "!" + _props.get(property);
          } else {
            p_result[0] += _props.get(property);
          }

          p_end += 2;

          break;
        default:
          if (!_props.has(property)) {
            throw new Error("Unknown property: " + property + " File: " + info.file + " Line: " + info.line);
          }
          p_result[0] += _props.get(property);
        }

        for (p_start = p_end; p_end < p_section[i].length; p_end += 1) {
          if (!NTIP.IsSyntaxInt(p_section[i][p_end])) {
            break;
          }
        }

        p_result[0] += p_section[i].substring(p_start, p_end);

        if (p_section[i].substring(p_start, p_end) === "=") {
          throw new Error("Unexpected = at line " + info.line + " in " + info.file);
        }

        for (p_start = p_end; p_end < p_section[i].length; p_end += 1) {
          if (NTIP.IsSyntaxInt(p_section[i][p_end])) {
            break;
          }
        }

        p_keyword = p_section[i].substring(p_start, p_end);

        if (isNaN(p_keyword)) {
          switch (property) {
          case "prefix":
          case "suffix":
            p_result[0] += "\"" + p_keyword + "\")";

            break;
          default:
            if (!_lists.has(property)) {
              throw new Error("Unknown property: " + property + " File: " + info.file + " Line: " + info.line);
            } else if (_lists.get(property)[p_keyword] === undefined) {
              throw new Error("Unknown " + property + ": " + p_keyword + " File: " + info.file + " Line: " + info.line);
            }
            p_result[0] += _lists.get(property)[p_keyword];
            property === "flag" && (p_result[0] += ")");

            break;
          }
        } else {
          if (property === "flag" || property === "prefix" || property === "suffix") {
            p_result[0] += p_keyword + ")";
          } else {
            p_result[0] += p_keyword;
          }
        }

        p_result[0] += p_section[i].substring(p_end);
      }
    } else {
      p_result[0] = "";
    }

    if (p_result[1] && p_result[1].length > 4) {
      p_section = p_result[1].split("[");
      p_result[1] = p_section[0];

      for (i = 1; i < p_section.length; i += 1) {
        p_end = p_section[i].indexOf("]");
        p_keyword = p_section[i].substring(0, p_end);

        if (isNaN(p_keyword)) {
          if (NTIPAliasStat[p_keyword] === undefined) {
            throw new Error("Unknown stat: " + p_keyword + " File: " + info.file + " Line: " + info.line);
          }

          p_result[1] += "item.getStatEx(" + NTIPAliasStat[p_keyword] + ")";
        } else {
          p_result[1] += "item.getStatEx(" + p_keyword + ")";
        }

        p_result[1] += p_section[i].substring(p_end + 1);
      }
    } else {
      p_result[1] = "";
    }

    if (p_result[2] && p_result[2].length > 0) {
      p_section = p_result[2].split("[");
      p_result[2] = {};

      for (i = 1; i < p_section.length; i += 1) {
        p_end = p_section[i].indexOf("]");
        p_keyword = p_section[i].substring(0, p_end);

        let keyword = p_keyword.toLowerCase();
        switch (keyword) {
        case "maxquantity":
          value = Number(p_section[i].split("==")[1].match(/\d+/g));

          if (!isNaN(value)) {
            p_result[2].MaxQuantity = value;
          }

          break;
        case "merctier":
        case "tier":
          try {
            // p_result[2].Tier = function(item) { return value };
            p_result[2][keyword.charAt(0).toUpperCase() + keyword.slice(1)] = (new Function("return function(item) { return " + p_section[i].split("==")[1] + ";}")).call(null); // generate function out of
          } catch (e) {
            throw new Error("ÿc1Pickit Tier (" + keyword + ") error! Line # ÿc2" + info.line + " ÿc1Entry: ÿc0" + info.string + " (" + info.file + ") Error message: " + e.message);
          }
          break;
        default:
          throw new Error("Unknown 3rd part keyword: " + p_keyword.toLowerCase() + " File: " + info.file + " Line: " + info.line);
        }
      }
    }
  } catch (e) {
    Misc.errorReport(e);

    return false;
  }

  // Compile the line, to 1) remove the eval lines, and 2) increase the speed
  for (let i = 0; i < 2; i++) {
    if (p_result[i].length) {
      try {
        p_result[i] = (new Function("return function(item) { return " + p_result[i] + ";}")).call(null); // generate function out of
      } catch (e) {
        Misc.errorReport("ÿc1Pickit error! Line # ÿc2" + info.line + " ÿc1Entry: ÿc0" + info.string + " (" + info.file + ") Error message: " + e.message);

        return null; // failed load this line so return false
      }
    } else {
      p_result[i] = undefined;
    }

  }
  return p_result;
};
