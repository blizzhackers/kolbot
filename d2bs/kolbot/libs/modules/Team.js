/**
 * @description Easy communication between clients
 * @Author Jaenster
 *
 */
!isIncluded("require.js") && include("require.js"); // load the require.js

/**
 * @param {boolean} threadType
 * @param {typeof globalThis} global
 */
(function (threadType, global) {
  const others = [];

  const myEvents = new (require("./AsyncEvents"));
  const Worker = require("Worker");
  const Messaging = require("Messaging");
  /**
   * Default copydata channel/mode used by every Team message when a caller does
   * not supply an explicit `mode`. The `mode` argument on send/broadcast selects
   * which copydata channel the payload is delivered on: subscribers registered
   * via `Team.on(mode, cb)` only receive emits whose numeric mode matches, so
   * `mode` acts as a private routing key. A falsy `mode` (0, undefined) falls
   * back to this default channel.
   * @type {number}
   */
  const defaultCopyDataMode = 0xC0FFFEE;

  const Team = {
    /**
     * Register a listener for a Team event. The event name may be a copydata
     * `mode` (number) or a data-item key (string); when only a callback is
     * passed it listens to all events.
     * @param {string | number | function} name - Event name/mode, or the callback if listening to everything.
     * @param {function} [callback] - Handler invoked with the emitted data.
     * @returns {{ name: (string | number), callback: function, id: number, __callback: function }} The created hook.
     */
    on: myEvents.on,
    /**
     * Remove every listener previously registered with the given callback.
     * @param {string | number} name - Event name/mode (unused for matching, kept for API symmetry).
     * @param {function} callback - The original callback to unregister.
     * @returns {void}
     */
    off: myEvents.off,
    /**
     * Register a one-shot listener that is removed after its first invocation.
     * @param {string | number | function} name - Event name/mode, or the callback if listening to everything.
     * @param {function} [callback] - Handler invoked once with the emitted data.
     * @returns {void}
     */
    once: myEvents.once,
    /**
     * Send a message to a single profile over copydata. Stamps the payload with
     * this client's profile name before sending.
     * @param {string} who - Target profile/window title to deliver to.
     * @param {object} what - Payload object; mutated to include `profile`.
     * @param {number} [mode] - Copydata channel to send on; defaults to defaultCopyDataMode when falsy.
     * @returns {boolean} Result of the underlying sendCopyData call.
     */
    send: function (who, what, mode = defaultCopyDataMode) {
      what.profile = me.windowtitle;
      return sendCopyData(null, who, mode || defaultCopyDataMode, JSON.stringify(what));
    },
    /**
     * Send a message to every known profile (all clients tracked in `others`).
     * Stamps the payload with this client's profile name before sending.
     * @param {object} what - Payload object; mutated to include `profile`.
     * @param {number} [mode] - Copydata channel to send on; defaults to defaultCopyDataMode when falsy.
     * @returns {void}
     */
    broadcast: (what, mode) => {
      what.profile = me.windowtitle;
      return others
        .forEach(other => sendCopyData(null, other.profile, mode || defaultCopyDataMode, JSON.stringify(what)));
    },
    /**
     * Send a message only to known profiles that share the current game party.
     * Stamps the payload with this client's profile name before sending.
     * @param {object} what - Payload object; mutated to include `profile`.
     * @param {number} [mode] - Copydata channel to send on; defaults to defaultCopyDataMode when falsy.
     * @returns {void}
     */
    broadcastInGame: (what, mode) => {
      what.profile = me.windowtitle;
      others.forEach(function (other) {
        for (const party = getParty(); party && party.getNext();) {
          if (typeof party === "object" && party && party.hasOwnProperty("name") && party.name === other.name) {
            sendCopyData(null, other.profile, mode || defaultCopyDataMode, JSON.stringify(what));
          }
        }
      });
    }
  };

  if (threadType === "thread") {
    console.log("ÿc2Kolbotÿc0 :: Team thread started");

    Messaging.on("Team", data => (
      typeof data === "object" && data
      && data.hasOwnProperty("call")
      && Team[data.call].apply(Team, data.hasOwnProperty("args")
      && data.args || [])
    ));

    Worker.runInBackground.copydata = (new function () {
      const workBench = [];
      const updateOtherProfiles = function () {
        const fileList = dopen("data/").getFiles();
        fileList && fileList.forEach(function (filename) {
          let newContent, obj, profile = filename.split("").reverse().splice(5).reverse().join(""); // strip the last 5 chars (.json) = 5 chars


          if (profile === me.windowtitle || !filename.endsWith(".json")) return;
          try {
            newContent = FileTools.readText("data/" + filename);
            if (!newContent) return; // no content
          } catch (e) {
            console.log("Can't read: `" + "data/" + filename + "`");
          }


          try { // try to convert to an object
            obj = JSON.parse(newContent);
          } catch (e) {
            return;
          }

          let other;
          for (let i = 0, tmp; i < others.length; i++) {
            tmp = others[i];
            if (tmp.hasOwnProperty("profile") && tmp.profile === profile) {
              other = tmp;
              break;
            }
          }

          if (!other) {
            others.push(obj);
            other = others[others.length - 1];
          }

          other.profile = profile;
          Object.keys(obj).map(key => other[key] = obj[key]);
        });
      };
      addEventListener("copydata", (mode, data) => workBench.push({ mode: mode, data: data }));

      let timer = getTickCount() - Math.round((Math.random() * 2500) + 1000); // start with 3 seconds off
      this.update = function () {
        if (!((getTickCount() - timer) < 3500)) { // only ever 3 seconds update the entire team
          timer = getTickCount();
          updateOtherProfiles();
        }

        // nothing to do? next
        if (!workBench.length) return true;
        const emit = workBench.splice(0, workBench.length).map(
          function (obj) { // Convert to object, if we can
            let data = obj.data;
            try {
              data = JSON.parse(data);
            } catch (e) {
              /* Dont care if we cant*/
              return {};
            }
            return { mode: obj.mode, data: data };
          })
          .filter(obj => typeof obj === "object" && obj)
          .filter(obj => typeof obj.data === "object" && obj.data)
          .filter(obj => typeof obj.mode === "number" && obj.mode);
        emit.length && Messaging.send({
          Team: {
            emit: emit
          }
        });
        return true; // always, to keep looping;
      };
    }).update;

    let quiting = false;
    addEventListener("scriptmsg", data => data === "quit" && (quiting = true));

    // eslint-disable-next-line dot-notation
    global["main"] = function () {
      while (!quiting) delay(3);
      //@ts-ignore
      getScript(true).stop();
    };
  } else {
    /**
     * Export the Team API to consumers running outside the copydata thread.
     * The event methods (on/off/once) stay wired to the local AsyncEvents
     * instance, while the messaging methods (send/broadcast/broadcastInGame)
     * are replaced with RPC proxies that forward the call to the Team thread
     * via Messaging.send. Also subscribes to inbound emits and re-fires them
     * on the local event bus, keyed by copydata `mode` and by data-item key.
     * @param {{ exports: object }} module - The CommonJS module wrapper.
     * @returns {void}
     */
    (function (module) {
      const localTeam = module.exports = Team; // <-- some get overridden, but this still works for auto completion in your IDE

      // Filter out all Team functions that are linked to myEvent
      Object.keys(Team)
        .filter(key => !myEvents.hasOwnProperty(key) && typeof Team[key] === "function")
        .forEach(key => module.exports[key] = (...args) => Messaging.send({
          Team: {
            call: key,
            args: args
          }
        }));

      Messaging.on("Team", msg =>
        typeof msg === "object"
        && msg
        && msg.hasOwnProperty("emit")
        && Array.isArray(msg.emit)
        && msg.emit.forEach(function (obj) {

          // Registered events on the mode
          myEvents.emit(obj.mode, obj.data);

          // Only if data is set
          typeof obj.data === "object" && obj.data && Object.keys(obj.data).forEach(function (item) {

            // For each item in the object, trigger an event
            obj.data[item].reply = (what, mode) => localTeam.send(obj.data.profile, what, mode);

            // Registered events on a data item
            myEvents.emit(item, obj.data[item]);
          });
        })
      );
    })(module);
  }
})(getScript.startAsThread(), [].filter.constructor("return this")());
