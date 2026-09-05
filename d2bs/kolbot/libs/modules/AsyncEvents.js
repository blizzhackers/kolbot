/**
 * @author Jaenster
 * @description A node like event system
 *
 */

(function (module, require) {
  // eslint-disable-next-line no-unused-vars
  const Events = module.exports = function () {
    const Worker = require("Worker"), self = this;

    this.hooks = [];

    /**
     * @param {string} [name] - event name to match; falsy matches every trigger
     * @param {(...args: unknown[]) => void} callback
     */
    function Hook(name, callback) {
      this.name = name;
      this.callback = callback;
      this.id = self.hooks.push(this) - 1;
      this.__callback = callback; // used for once
    }

    /**
     * @param {string | ((...args: unknown[]) => void)} name - event name, or the callback itself
     * when called with a single argument
     * @param {(...args: unknown[]) => void} [callback]
     * @returns {Hook}
     */
    this.on = function (name, callback) {
      if (callback === undefined && typeof name === "function") [callback, name] = [name, callback];
      return new Hook(name, callback);
    };

    /**
     * Runs every matching hook's callback on the Worker queue (deferred, not synchronous).
     * @param {string} name
     * @param {...unknown} args
     */
    this.trigger = function (name, ...args) {
      return self.hooks.forEach(hook => !hook.name || hook.name === name && Worker.push(function () {
        hook.callback.apply(hook, args);
      }));
    };

    this.emit = this.trigger; // Alias for trigger

    /**
     * @param {string | ((...args: unknown[]) => void)} name - event name, or the callback itself
     * when called with a single argument
     * @param {(...args: unknown[]) => void} [callback]
     */
    this.once = function (name, callback) {
      if (callback === undefined && typeof name === "function") [callback, name] = [name, callback];
      const hook = new Hook(name, function (...args) {
        callback.apply(undefined, args);
        delete self.hooks[this.id];
      });
      hook.__callback = callback;
    };

    /**
     * @param {string} name
     * @param {(...args: unknown[]) => void} callback
     */
    this.off = function (name, callback) {
      self.hooks.filter(hook => hook.__callback === callback).forEach(hook => {
        delete self.hooks[hook.id];
      });
    };

    this.removeListener = this.off; // Alias for remove
  };
})(module, require);
