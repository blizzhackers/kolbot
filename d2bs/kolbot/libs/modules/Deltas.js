/**
 * @author Nishimura-Katsuo, Jaenster
 * @description a basic implementation of delta's
 *
 */
(function (module, require) {
  const Worker = require("Worker");
  let instances = 0;

  /** @constructor
   * @class Delta */
  module.exports = function (trackers) {
    let active = true;
    this.values = (Array.isArray(trackers) && (Array.isArray(trackers.first()) && trackers || [trackers])) || [];
    /**
     * Registers a new value to watch.
     * @param {() => *} checkerFn - reads the current value
     * @param {(oldValue: *, newValue: *) => *} callback - invoked when the value changes
     * @returns {number} the new length of the tracked values array
     */
    this.track = function (checkerFn, callback) {
      return this.values.push({ fn: checkerFn, callback: callback, value: checkerFn() });
    };
    /**
     * Polls every tracked value and fires its callback if it changed since the last check.
     */
    this.check = function () {
      this.values.some(delta => {
        let val = delta.fn();

        if (delta.value !== val) {
          let ret = delta.callback(delta.value, val);
          delta.value = val;

          return ret;
        }

        return null;
      });
    };

    /**
     * Stops the background worker from polling this delta's tracked values.
     */
    this.destroy = () => active = false;

    Worker.runInBackground["__delta" + (instances++)] = () => active && (this.check() || true);
    return this;
  };

}).call(
  null,
  typeof module === "object" && module || {},
  typeof require === "undefined" && (include("require.js") && require) || require
);
