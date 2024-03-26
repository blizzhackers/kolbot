/**
*  @filename    TorchSystem.js
*  @author      kolton
*  @desc        Works in conjunction with OrgTorch script. Allows the uber killer to get keys from other profiles.
*               For setup @see FarmerConfig.js
*
*/

const TorchSystem = {
  // load configuration file
  FarmerProfiles: Object.assign({}, require("./FarmerConfig", null, false)),

  // Don't touch
  inGame: false,
  check: false,

  getFarmers: function () {
    let list = [];

    for (let i in this.FarmerProfiles) {
      if (this.FarmerProfiles.hasOwnProperty(i)) {
        for (let j = 0; j < this.FarmerProfiles[i].KeyFinderProfiles.length; j += 1) {
          if (String.isEqual(this.FarmerProfiles[i].KeyFinderProfiles[j], me.profile)) {
            this.FarmerProfiles[i].profile = i;

            list.push(this.FarmerProfiles[i]);
          }
        }
      }
    }

    return list.length > 0 ? list : false;
  },

  isFarmer: function () {
    if (this.FarmerProfiles.hasOwnProperty(me.profile)) {
      this.FarmerProfiles[me.profile].profile = me.profile;

      return this.FarmerProfiles[me.profile];
    }

    return false;
  },

  inGameCheck: function () {
    let farmers = this.getFarmers();
    if (!farmers) return false;

    for (let i = 0; i < farmers.length; i += 1) {
      if (farmers[i].FarmGame.length > 0 && me.gamename.toLowerCase().match(farmers[i].FarmGame.toLowerCase())) {
        print("ÿc4Torch Systemÿc0: In Farm game.");
        D2Bot.printToConsole("Torch System: Transfering keys.", sdk.colors.D2Bot.DarkGold);
        D2Bot.updateStatus("Torch System: In game.");
        Town.goToTown(1);

        if (Town.openStash()) {
          let neededItems = this.keyCheck();

          if (neededItems) {
            for (let n in neededItems) {
              if (neededItems.hasOwnProperty(n)) {
                while (neededItems[n].length) {
                  neededItems[n].shift().drop();
                }
              }
            }
          }
        }

        if (me.getStat(sdk.stats.Gold) >= 100000) {
          gold(100000);
        }

        delay(5000);
        
        try {
          quit();
        } finally {
          while (me.ingame) {
            delay(100);
          }
        }

        return true;
      }
    }

    return false;
  },

  keyCheck: function () {
    let neededItems = {};
    let farmers = this.getFarmers();
    if (!farmers) return false;

    function keyCheckEvent(mode, msg) {
      if (mode === 6) {
        let obj = JSON.parse(msg);
        
        if (obj.name === "neededItems") {
          let item;

          for (let i in obj.value) {
            if (obj.value.hasOwnProperty(i) && obj.value[i] > 0) {
              switch (i) {
              case "pk1":
              case "pk2":
              case "pk3":
                item = me.getItem(i);

                if (item) {
                  do {
                    if (!neededItems[i]) {
                      neededItems[i] = [];
                    }

                    neededItems[i].push(copyUnit(item));

                    if (neededItems[i].length >= obj.value[i]) {
                      break;
                    }
                  } while (item.getNext());
                }

                break;
              case "rv":
                item = me.getItem();

                if (item) {
                  do {
                    if (item.code === "rvs" || item.code === "rvl") {
                      if (!neededItems[i]) {
                        neededItems[i] = [];
                      }

                      neededItems[i].push(copyUnit(item));

                      if (neededItems[i].length >= Math.min(2, obj.value[i])) {
                        break;
                      }
                    }
                  } while (item.getNext());
                }

                break;
              }
            }
          }
        }
      }
    }

    addEventListener("copydata", keyCheckEvent);

    // TODO: one mfer for multiple farmers handling
    for (let i = 0; i < farmers.length; i += 1) {
      sendCopyData(null, farmers[i].profile, 6, JSON.stringify({ name: "keyCheck", profile: me.profile }));
      delay(250);

      if (neededItems.hasOwnProperty("pk1") || neededItems.hasOwnProperty("pk2") || neededItems.hasOwnProperty("pk3")) {
        removeEventListener("copydata", keyCheckEvent);

        return neededItems;
      }
    }

    removeEventListener("copydata", keyCheckEvent);

    return false;
  },

  outOfGameCheck: function () {
    if (!this.check) return false;
    TorchSystem.check = false;

    let game;

    function checkEvent(mode, msg) {
      let farmers = TorchSystem.getFarmers();

      if (mode === 6) {
        let obj = JSON.parse(msg);

        if (obj && obj.name === "gameName") {
          for (let i = 0; i < farmers.length; i += 1) {
            if (obj.value.gameName.toLowerCase().match(farmers[i].FarmGame.toLowerCase())) {
              game = [obj.value.gameName, obj.value.password];
            }
          }
        }
      }

      return true;
    }

    let farmers = this.getFarmers();
    if (!farmers) return false;

    addEventListener("copydata", checkEvent);

    for (let i = 0; i < farmers.length; i += 1) {
      sendCopyData(null, farmers[i].profile, 6, JSON.stringify({ name: "gameCheck", profile: me.profile }));
      delay(500);

      if (game) {
        break;
      }
    }

    removeEventListener("copydata", checkEvent);

    if (game) {
      delay(2000);

      TorchSystem.inGame = true;
      me.blockMouse = true;

      joinGame(game[0], game[1]);

      me.blockMouse = false;

      delay(5000);

      while (me.ingame) {
        delay(1000);
      }

      TorchSystem.inGame = false;

      return true;
    }

    return false;
  },

  waitForKeys: function () {
    let timer = getTickCount();
    let busy = false;
    let busyTick;
    let tkeys = me.findItems("pk1", sdk.items.mode.inStorage).length || 0;
    let hkeys = me.findItems("pk2", sdk.items.mode.inStorage).length || 0;
    let dkeys = me.findItems("pk3", sdk.items.mode.inStorage).length || 0;
    let neededItems = { pk1: 0, pk2: 0, pk3: 0, rv: 0 };

    // Check whether the killer is alone in the game
    const aloneInGame = function () {
      return (Misc.getPlayerCount() <= 1);
    };

    const juvCheck = function () {
      let needJuvs = 0;
      let col = Town.checkColumns(Storage.BeltSize());

      for (let i = 0; i < 4; i += 1) {
        if (Config.BeltColumn[i] === "rv") {
          needJuvs += col[i];
        }
      }

      console.log("Need " + needJuvs + " juvs.");

      return needJuvs;
    };

    // Check if current character is the farmer
    let farmer = TorchSystem.isFarmer();

    const torchSystemEvent = function (mode, msg) {
      let obj, farmer;

      if (mode === 6) {
        farmer = TorchSystem.isFarmer();

        if (farmer) {
          obj = JSON.parse(msg);

          if (obj) {
            switch (obj.name) {
            case "gameCheck":
              if (busy) {
                break;
              }

              if (farmer.KeyFinderProfiles.includes(obj.profile)) {
                print("Got game request from: " + obj.profile);
                sendCopyData(
                  null, obj.profile, 6,
                  JSON.stringify({ name: "gameName", value: { gameName: me.gamename, password: me.gamepassword } })
                );

                busy = true;
                busyTick = getTickCount();
              }

              break;
            case "keyCheck":
              if (farmer.KeyFinderProfiles.includes(obj.profile)) {
                print("Got key count request from: " + obj.profile);

                // Get the number of needed keys
                neededItems = { pk1: 3 - tkeys, pk2: 3 - hkeys, pk3: 3 - dkeys, rv: juvCheck() };
                sendCopyData(null, obj.profile, 6, JSON.stringify({ name: "neededItems", value: neededItems }));
              }

              break;
            }
          }
        }
      }
    };

    // Register event that will communicate with key hunters, go to Act 1 town and wait by stash
    addEventListener("copydata", torchSystemEvent);
    Town.goToTown(1);
    Town.move("stash");

    try {
      while (true) {
        // Abort if the current character isn't a farmer
        if (!farmer) {
          break;
        }

        // Free up inventory
        Town.needStash() && Town.stash();

        // Get the number keys
        tkeys = me.findItems("pk1", sdk.items.mode.inStorage).length || 0;
        hkeys = me.findItems("pk2", sdk.items.mode.inStorage).length || 0;
        dkeys = me.findItems("pk3", sdk.items.mode.inStorage).length || 0;

        // Stop the loop if we have enough keys or if wait time expired
        if (((tkeys >= 3 && hkeys >= 3 && dkeys >= 3)
          || (Config.OrgTorch.WaitTimeout
          && (getTickCount() - timer > Time.minutes(Config.OrgTorch.WaitTimeout))))
          && aloneInGame()) {

          break;
        }

        if (busy) {
          while (getTickCount() - busyTick < 30000) {
            if (!aloneInGame()) {
              break;
            }

            delay(100);
          }

          if (getTickCount() - busyTick > 30000 || aloneInGame()) {
            busy = false;
          }
        }

        // Wait for other characters to leave
        while (!aloneInGame()) {
          delay(500);
        }

        delay(1000);

        // Pick the keys after the hunters drop them and leave the game
        Pickit.pickItems();
      }
    } finally {
      removeEventListener("copydata", torchSystemEvent);
    }
  },
};
