/**
 * @description Simple worker class for async behavior
 * @author Jaenster
 */

(function (module) {
  const Worker = new (function () {
    const self = this;
    const work = [];
    const workLowPrio = [];
    /** how many delay() calls are currently on the stack */
    let delayDepth = 0;
    /** @private */
    this.workDisabled = false;

    /**
     * @param {Function|Array<*>} newWork - a callback (invoked with the Worker) or nested array of work
     * @returns {number} the new length of the work queue
     */
    this.push = function (newWork) {
      return work.push(newWork);
    };

    /**
     * @param {Function|Array<*>} newWork - a callback (invoked with the Worker) or nested array of work
     * @returns {number} the new length of the low-priority work queue
     */
    this.pushLowPrio = function (newWork) {
      return workLowPrio.push(newWork);
    };

    const checker = function (val) {
      if (self.workDisabled) return;
      try {
        val.length && val.splice(0, val.length).forEach(self.work);
      } catch (error) {
        if (!error.message.endsWith("too much recursion")) {
          throw error;
        } // keep on throwing

        console.log("[ÿc9Warningÿc0] Too much recursion");
      }
    };

    /**
     * Drains and runs all queued high-priority work; no-op while {@link this.workDisabled}.
     */
    this.check = function () {
      return checker(work);
    };

    /**
     * Drains and runs all queued low-priority work; no-op while {@link this.workDisabled}.
     */
    this.checkLowPrio = function () {
      return checker(workLowPrio);
    };

    /**
     * Runs a work item: invokes a function with the Worker, or recurses into an array of items.
     * @param {Function|Array<*>} what
     * @returns {unknown} the callback's return value when `what` is a function; otherwise undefined/false
     */
    this.work = function (what) {
      return typeof what === "function" && what(self) || (Array.isArray(what) && what.forEach(self.work));
    };

    /** @param {function({Worker}):boolean} callback */
    this.runInBackground = new Proxy({ processes: {} }, {
      /**
       * Registers a named background process and immediately queues it on the low-prio queue;
       * the process re-queues itself each low-prio check as long as `callback` keeps returning truthy.
       * @param {{ processes: Object<string, {callback: Function, running: boolean, name: string}> }} target
       * @param {string} name
       * @param {function(): boolean} callback
       * @returns {boolean}
       */
      set: function (target, name, callback) {
        if (target.processes.hasOwnProperty(name)) {
          throw new Error("Process " + name + " already exists.");
        }
        target.processes[name] = {
          callback: callback,
          running: true,
          name: name
        };
        let proxyCallback = function () {
          if (!target.processes[name]) return;
          target.processes[name].running = callback();
          if (!target.processes[name].running) {
            delete target.processes[name];
          } else {
            self.pushLowPrio(proxyCallback);
          }
        };
        self.pushLowPrio(proxyCallback);
        return true;
      },
      /**
       * @param {{ processes: Object<string, {callback: Function, running: boolean, name: string}> }} target
       * @param {string} name
       * @returns {boolean}
       */
      deleteProperty: function (target, name) {
        if (target.processes.hasOwnProperty(name)) {
          target.processes[name].running = false;
          delete target.processes[name];
        }
        return true;
      }
    });

    /** @param {string} name */
    this.stopProcess = function (name) {
      if (typeof self.runInBackground === "undefined"
        || typeof self.runInBackground.processes === "undefined") {
        return;
      }
      if (typeof self.runInBackground.processes[name] === "undefined") {
        return;
      }
      delete self.runInBackground.processes[name];
    };

    /** @param {Promise<*>} promise */
    global.await = function (promise) {
      while (delay(1) && !promise.stopped) {
        //
      }
      return promise.value;
    };

    global._delay = delay; // The original delay function
    global.nativeSleep = delay;

    /**
     * Just makes it easier to peform a delay
     * @param {number} amount 
     */
    this.timeout = function (amount) {
      return global._delay(amount);
    };

    // Override the delay function, to check for background work while we wait anyway
    /**
     * @param {number} [amount]
     * @returns {boolean} always true
     */
    global.delay = function (amount) {
      // a delay() called from within work run by an outer delay() must not run low-prio work again
      let recursive = delayDepth > 0;
      let start = getTickCount();
      amount = amount || 0;

      delayDepth++;
      try {
        do {
          self.check();
          global._delay(getTickCount() - start > 3 ? 3 : 1);
          !recursive && self.checkLowPrio();
        } while (getTickCount() - start <= amount);
      } finally {
        delayDepth--;
      }

      return true; // always return true
    };
  })();
  module.exports = Worker;
})(module);
