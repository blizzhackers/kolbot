/**
 * @description Easy communication between threads
 * @Author Jaenster
 */


(function (module, require) {
  const myEvents = new (require("./AsyncEvents"));
  const Worker = require("Worker");


  Worker.runInBackground.messaging = (new function () {
    const workBench = [];
    addEventListener("scriptmsg", data => workBench.push(data));

    this.update = function () {
      if (!workBench.length) return true;

      let work = workBench.splice(0, workBench.length);
      work.filter(data => typeof data === "object" && data)
        .forEach(function (data) {
          Object.keys(data).forEach(function (item) {
            myEvents.emit(item, data[item]); // Trigger those events
          });
        });

      return true; // always, to keep looping;
    };
  }).update;

  module.exports = {
    /**
     * Register a listener that fires every time the named message event is emitted.
     * @param {string} name - Event name to listen for (may be omitted to match all events, in which case pass the callback first).
     * @param {function} callback - Handler invoked with the emitted message payload.
     * @returns {Hook} The created hook (has `name`, `callback`, `id` and `__callback` properties).
     */
    on: myEvents.on,
    /**
     * Remove every listener previously registered for the given callback.
     * @param {string} name - Event name the listener was registered under (unused for matching; callback identity is used).
     * @param {function} callback - The same callback reference that was passed to `on`/`once`.
     * @returns {void}
     */
    off: myEvents.off,
    /**
     * Register a listener that fires only once for the named message event, then removes itself.
     * @param {string} name - Event name to listen for (may be omitted to match all events, in which case pass the callback first).
     * @param {function} callback - Handler invoked with the emitted message payload.
     * @returns {void}
     */
    once: myEvents.once,
    /**
     * Broadcast a message to all other running scripts/threads.
     * @param {string | object} what - Payload to broadcast; objects are keyed by event name for the receiving `on` listeners.
     * @returns {void}
     */
    send: what => scriptBroadcast(what)
  };

})(module, require);
