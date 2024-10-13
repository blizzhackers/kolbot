/**
 * @description Simple worker class for async behavior
 * @author Jaenster
 */

(function (module) {
  const recursiveCheck = function (stackNumber) {
    let stack = new Error().stack.match(/[^\r\n]+/g);
    let functionName = stack[stackNumber || 1].substr(0, stack[stackNumber || 1].indexOf("@"));

    for (let i = (stackNumber || 1) + 1; i < stack.length; i++) {
      let curFunc = stack[i].substr(0, stack[i].indexOf("@"));

      if (functionName === curFunc) {
        return true;
      } // recursion appeared
    }

    return false;
  };

  const Worker = new (function () {
    const self = this;
    const work = [];
    const workLowPrio = [];
    /** @private */
    this.workDisabled = false;

    this.push = function (newWork) {
      return work.push(newWork);
    };

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

        print("[ÿc9Warningÿc0] Too much recursion");
      }
    };

    this.check = function () {
      return checker(work);
    };

    this.checkLowPrio = function () {
      return checker(workLowPrio);
    };

    this.work = function (what) {
      return typeof what === "function" && what(self) || (Array.isArray(what) && what.forEach(self.work));
    };

    /**
     * @param {function({Worker}):boolean} callback
     */
    this.runInBackground = new Proxy({ processes: {} }, {
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
      },
      deleteProperty: function (target, name) {
        if (!target.processes.hasOwnProperty(name)) {
          throw new Error("Process " + name + " does not exists.");
        }
        target.processes[name].running = false;
        delete target.processes[name];
        return true;
      }
    });

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

    /**
     * Just makes it easier to peform a delay
     * @param {number} amount 
     */
    this.timeout = function (amount) {
      return global._delay(amount);
    };

    // Override the delay function, to check for background work while we wait anyway
    global.delay = function (amount) {
      let recursive = recursiveCheck();
      let start = getTickCount();
      amount = amount || 0;

      do {
        self.check();
        global._delay(getTickCount() - start > 3 ? 3 : 1);
        !recursive && self.checkLowPrio();
      } while (getTickCount() - start <= amount);

      return true; // always return true
    };

    this.recursiveCheck = recursiveCheck;
  })();
  module.exports = Worker;
})(module);
