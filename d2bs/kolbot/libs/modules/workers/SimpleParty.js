(function (module, require) {
  // party thread specific
  include("oog/ShitList.js");
  const shitList = (Config.ShitList || Config.UnpartyShitlisted)
    ? ShitList.read()
    : [];
  const Worker = require("../Worker");
  const NO_PARTY = 65535;
  const PARTY_MEMBER = 1;
  const ACCEPTABLE = 2;
  const INVITED = 4;
  const BUTTON_INVITE_ACCEPT_CANCEL = 2;
  const BUTTON_LEAVE_PARTY = 3;
  // const BUTTON_HOSTILE = 4;

  const SimpleParty = {};

  SimpleParty.biggestPartyId = function () {
    let uniqueParties = [];
    try {
      //   Or add it and return the value
      for (let party = getParty(); party.getNext();) {
        (
        // Find this party
          uniqueParties.find(u => u.partyid === party.partyid)
          // Or create an instance of it
          || ((uniqueParties.push({
            partyid: party.partyid,
            used: 0
          }) && false) || uniqueParties[uniqueParties.length - 1])
          // Once we have the party object, increase field used
        ).used++;
      }

      // Filter out no party, if another party is found
      if (uniqueParties.some(u => u.partyid !== NO_PARTY)) {
        (uniqueParties = uniqueParties.filter(u => u.partyid !== NO_PARTY));
      }
      return (uniqueParties
        .sort(function (a, b) {
          /* b-a = desc */
          return b.used - a.used;
        }).first() || { partyid: -1 }).partyid;
    } catch (e) {
      console.error(e);

      return -1;
    }
  };

  SimpleParty.acceptFirst = function () {
    const toMd5Int = what => parseInt(md5(what).substr(0, 4), 16); //ToDo; do something with game number here
    const names = [];
    for (let party = getParty(); party.getNext();) {
      if (party.partyid === NO_PARTY && party.partyflag === ACCEPTABLE) {
        names.push(party.name);
      }
    }
    return names
      .filter(n => n !== me.name /*cant accept yourself ;)*/)
      .sort((a, b) => toMd5Int(a) - toMd5Int(b))
      .first();
  };

  SimpleParty.getFirstPartyMember = function () {
    let myPartyId = ((() => (getParty() || { partyid: 0 }).partyid))();
    for (let party = getParty(); party.getNext();) {
      if (party.partyid === myPartyId && party.name !== me.charname) {
        return party;
      }
    }
    return undefined;
  };

  SimpleParty.invite = function (name) {

    for (let party = getParty(); party.getNext();) {
      // If party member is
      if (party.name === name
        && party.partyflag !== ACCEPTABLE
        && party.partyflag !== PARTY_MEMBER
        && party.partyid === NO_PARTY) {
        clickParty(party, BUTTON_INVITE_ACCEPT_CANCEL); // Press the invite button
        return true;
      }
    }
    return false;
  };

  SimpleParty.timer = 0;

  if (new RegExp(/[default.dbj|main.js]/gi).test(getScript(true).name)) {
    // For now, we gonna do this in game with a single party
    (Worker.runInBackground.party = (function () {
      console.log("ÿc2Kolbotÿc0 :: Simple party running");
      SimpleParty.timer = getTickCount();
      return function () {
        // Set timer back on 3 seconds, or reset it and continue
        if ((getTickCount() - SimpleParty.timer) < 3000
          || (SimpleParty.timer = getTickCount()) && false) {
          return true;
        }
        if (!me.gameReady) {
          SimpleParty.timer = getTickCount();
          return true;
        }

        // Public mode 1/2/3 dont count. This is SimplyParty
        if (Config.PublicMode !== true) {
          return true;
        }

        const myPartyId = ((() => (getParty() || { partyid: 0 }).partyid))();
        if (!myPartyId) {
          return true; // party ain't up yet
        }

        const biggestPartyId = SimpleParty.biggestPartyId();

        for (let party = getParty(), acceptFirst; party && party.getNext();) {
          if (!(party && typeof party === "object")) {
            continue;
          }

          if (!(party.hasOwnProperty("life"))) {
            continue;
          } // Somehow not a party member

          // Deal with inviting
          if ( // If no party is formed, or im member of the biggest party
            party.partyflag !== INVITED && // Already invited
            party.partyflag !== ACCEPTABLE && // Need to accept invite, so cant invite
            party.partyflag !== PARTY_MEMBER && // cant party again with soemone
            party.partyid === NO_PARTY // Can only invite someone that isnt in a party
            && ( // If im not in a party, only if there is no party
              myPartyId === NO_PARTY && biggestPartyId === NO_PARTY
              // OR, if im part of the biggest party
              || biggestPartyId === myPartyId
            )
          ) {
            if (getPlayerFlag(me.gid, party.gid, sdk.player.flag.Hostile)) {
              if (shitList.includes(party.name)) {
                say(party.name + " has been shitlisted.");
                shitList.push(party.name);
                ShitList.add(party.name);
              }

              if (player.partyflag === sdk.party.flag.Cancel) {
                clickParty(party, BUTTON_INVITE_ACCEPT_CANCEL); // cancel invitation
              }

              continue;
            } else if (shitList.includes(party.name)) {
              continue;
            }
            
            // if player isn't invited, invite
            clickParty(party, BUTTON_INVITE_ACCEPT_CANCEL);
          }
          
          // Deal with accepting
          if (
            party.partyflag === ACCEPTABLE
            && myPartyId === NO_PARTY // Can only accept if we are not in a party
            && party.partyid === biggestPartyId // Only accept if it is an invite to the biggest party
          ) {
            // Try to make all bots accept the same char first, to avoid confusion with multiple parties
            if (biggestPartyId === NO_PARTY) {
              // if acceptFirst isnt set, create it (to cache it, yet generate on demand)
              if (!acceptFirst) {
                acceptFirst = SimpleParty.acceptFirst();
              }

              if (acceptFirst !== party.name) {
                continue; // Ignore party acceptation
              }
              if (shitList.includes(party.name)) {
                continue;
              }
            }

            clickParty(party, BUTTON_INVITE_ACCEPT_CANCEL);
          }

          // Deal with being in the wrong party. (we want to be in the biggest party)
          if (
            party.partyflag === PARTY_MEMBER // We are in the same party
            && biggestPartyId !== party.partyid // yet this party isnt the biggest party available
            && biggestPartyId !== NO_PARTY // And the biggest party isnt no party
          ) {
            clickParty(party, BUTTON_LEAVE_PARTY);
          }

          if (Config.UnpartyShitlisted) {
            // Add new hostile players to temp shitlist, leader should have Config.ShitList set to true to update the permanent list.
            if (getPlayerFlag(me.gid, party.gid, sdk.player.flag.Hostile)
              && shitList.includes(party.name)) {
              shitList.push(player.name);
            }

            if (shitList.includes(player.name)
              && myPartyId !== NO_PARTY
              && party.partyid === myPartyId) {
              console.log("Unpartying shitlisted player: " + party.name);
              clickParty(party, BUTTON_LEAVE_PARTY);
              delay(100);
            }
          }
        }
        return true;
      };
    })());
  }

  module.exports = SimpleParty;

})(module, require);
