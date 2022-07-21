/**
 * @description Promise polyfill for d2bs. Try's to re-create the entire
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
 * @author Jaenster
 */

(function (module, require) {
	const Worker = require("Worker");
	/**
	 *
	 * @param {function({resolve},{reject}):boolean} callback
	 * @constructor
	 */
	const Promise = module.exports = function (callback) {
		typeof Promise.__promiseCounter === "undefined" && (Promise.__promiseCounter = 0);

		this._after = [];
		this._catchers = [];
		this._finally = [];
		this.stopped = false;
		this.value = this;
		const self = this;

		const final = function () {
				typeof self._finally !== "undefined" && self._finally.forEach(function (callback) {
					return callback(self.value);
				});
			}, resolve = function (result) {
				self.value = result;
				self.stopped = true;
				typeof self._after !== "undefined" && self._after.forEach(callback => Worker.push(function () {
					return callback(result);
				}));
				Worker.push(final);
			},
			reject = function (e) {
				self.stopped = true;
				typeof self._catchers !== "undefined" && self._catchers.forEach(callback => Worker.push(function () {
					return callback(e);
				}));
				if (!Array.isArray(self._catchers) || !self._catchers.length) Misc.errorReport(e || (new Error));
				Worker.push(final);
			};


		if (this.__proto__.constructor !== Promise) {
			print((new Error).stack);
			throw new Error("Promise must be called with 'new' operator!");
		}

		// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/valueOf
		// override the valueOf as primitive value function
		this.valueOf = () => self.stopped ? self.value : self;

		this.then = function (handler) {
			typeof self._after !== "undefined" && (self._after = []);
			self._after.push(handler);

			return self;
		};

		this.catch = function (handler) {
			typeof self._catchers !== "undefined" && (self._catchers = []);
			self._catchers.push(handler);

			return self;
		};

		this.finally = function (handler) {
			typeof self._finally !== "undefined" && (self._finally = []);
			self._finally.push(handler);

			return self;
		};

		Worker.runInBackground["promise__" + (++Promise.__promiseCounter)] = function () {
			try {
				callback(resolve, reject);
			} catch (e) {
				reject(e);
			}
			return !self.stopped;
		};
	};

	/**
	 * @description wait for an array of promises to be ran.
	 * @param promises Array
	 */
	Promise.all = function (promises) {
		while (promises.some(x => !x.stopped)) {
			delay();
		}
	};

	Promise.allSettled = (promises) => new Promise(resolve => promises.every(x => x.stopped) && resolve(promises));

})(module, require);

