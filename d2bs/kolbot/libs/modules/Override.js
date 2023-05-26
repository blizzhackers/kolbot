var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
  if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
    if (ar || !(i in from)) {
      if (!ar) ar = Array.prototype.slice.call(from, 0, i);
      ar[i] = from[i];
    }
  }
  return to.concat(ar || Array.prototype.slice.call(from));
};
(function (factory) {
  if (typeof module === "object" && typeof module.exports === "object") {
    var v = factory(require, exports);
    if (v !== undefined) module.exports = v;
  }
  else if (typeof define === "function" && define.amd) {
    define(["require", "exports"], factory);
  }
})(function (require, exports) {
  "use strict";
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.Override = void 0;
  var Override = /** @class */ (function () {
    function Override(target, original, method) {
      this.target = target;
      if (typeof original !== 'string') {
        this.original = original;
        this.key = Object.keys(target).find(function (key) { return target[key] === original; });
      }
      else {
        this.original = undefined;
        this.key = original;
      }
      this.method = method;
      Override.all.push(this);
    }
    Override.prototype.apply = function () {
      var _a = this, target = _a.target, key = _a.key, method = _a.method, original = _a.original;
      target[key] = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
          args[_i] = arguments[_i];
        }
        return method.apply(this, __spreadArray([original && original.bind(this)], args, true));
      };
    };
    Override.prototype.rollback = function () {
      var _a = this, target = _a.target, key = _a.key, original = _a.original;
      if (original) {
        target[key] = original;
      }
      else {
        delete target[key];
      }
    };
    Override.all = [];
    return Override;
  }());
  exports.Override = Override;
});
