(function (module, require, thread, globalThis) {
  "use strict";
  const Messaging = require("../Messaging");
  const Worker = require("../Worker");
  const sdk = require("../sdk");

  switch (thread) {
  case "thread": {
    Worker.runInBackground.stackTrace = (new function () {
      const self = this;
      let stack;

      let myStack = "";

      // recv stack
      Messaging.on(
        "Guard",
        (data => typeof data === "object" && data && data.hasOwnProperty("stack") && (myStack = data.stack))
      );

      /**
       * @constructor
       * @param {function():string} callback
       */
      function UpdateableText (callback) {
        let element = new Text(callback(), self.x + 15, self.y + (7 * self.hooks.length), 0, 12, 0);
        self.hooks.push(element);
        this.update = () => {
          element.text = callback();
          element.visible = me.gameReady && [sdk.uiflags.Inventory,
            sdk.uiflags.SkillWindow,
            sdk.uiflags.TradePrompt,
            sdk.uiflags.Stash,
            sdk.uiflags.Cube,
            sdk.uiflags.QuickSkill].every(f => !getUIFlag(f));
        };
      }

      this.hooks = [];
      this.x = 500;
      this.y = 600 - (400 + (self.hooks.length * 15));
      // this.box = new Box(this.x-2, this.y-20, 250, (self.hooks.length * 15), 0, 0.2);


      for (let i = 0; i < 22; i++) {
        (i => this.hooks.push(new UpdateableText(() => stack && stack.length > i && stack[i] || "")))(i);
      }

      this.update = () => {
        stack = myStack.match(/[^\r\n]+/g);
        stack = stack && stack.slice(6/*skip path to here*/).map(el => {
          let line = el.substr(el.lastIndexOf(":") + 1);
          let functionName = el.substr(0, el.indexOf("@"));
          let filename = el.substr(el.lastIndexOf("\\") + 1);

          filename = filename.substr(0, filename.indexOf("."));

          return filename + "ÿc::ÿc0" + line + "ÿc:@ÿc0" + functionName;
        }).reverse();
        this.hooks.filter(hook => hook.hasOwnProperty("update") && typeof hook.update === "function" && hook.update());
        return true;
      };
    }).update;

    let quiting = false;
    addEventListener("scriptmsg", data => data === "quit" && (quiting = true));

    // eslint-disable-next-line dot-notation
    globalThis["main"] = function () {
      while (!quiting) delay(3);
      //@ts-ignore
      getScript(true).stop();
    };
    break;
  }
  case "started": {
    console.log("ÿc2Kolbotÿc0 :: Guard running");
    let sendStack = getTickCount();
    Worker.push(function highPrio () {
      Worker.push(highPrio);
      if ((getTickCount() - sendStack) < 200 || (sendStack = getTickCount()) && false) return true;
      Messaging.send({ Guard: { stack: (new Error).stack } });
      return true;
    });

    break;
  }
  case "loaded": {
    break;
  }
  }

}).call(
  null,
  typeof module === "object" && module || {},
  typeof require === "undefined" && (include("require.js") && require) || require,
  getScript.startAsThread(),
  [].filter.constructor("return this")()
);
