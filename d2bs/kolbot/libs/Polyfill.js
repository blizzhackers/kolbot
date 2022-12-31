/**
*  @filename    Polyfill.js
*  @author      Jaenster (probably)
*  @desc        Some polyfills since we run an old spidermonkey
*
*/

String.prototype.lcsGraph = function (compareToThis) {
	if (!this.length || !compareToThis || !compareToThis.length) {
		return null;
	}

	let stringA = this.toString().toLowerCase(), stringB = compareToThis.toLowerCase(), graph = Array(this.length), x,
		y;
	let check = (i, j) => (i < 0 || j < 0 || i >= stringA.length || j >= stringB.length) ? 0 : graph[i][j];

	for (x = 0; x < stringA.length; x++) {
		graph[x] = new Uint16Array(stringB.length);

		for (y = 0; y < stringB.length; y++) {
			if (stringA[x] === stringB[y]) {
				graph[x][y] = check(x - 1, y - 1) + 1;
			} else {
				graph[x][y] = Math.max(check(x - 1, y), check(x, y - 1));
			}
		}
	}

	return {a: this.toString(), b: compareToThis, graph: graph};
};

String.prototype.diffCount = function (stringB) {
	try {
		if (typeof stringB !== "string" || !stringB) {
			return this.length;
		}

		if (!this.length) {
			return stringB.length;
		}

		let graph = this.lcsGraph(stringB);

		return (Math.max(graph.a.length, graph.b.length) - graph.graph[graph.a.length - 1][graph.b.length - 1]);
	} catch (err) {
		print(err.stack);
	}

	return Infinity;
};

if (!String.prototype.includes) {
	String.prototype.includes = function (search, start) {
		"use strict";
		if (typeof start !== "number") {
			start = 0;
		}

		if (start + search.length > this.length) {
			return false;
		} else {
			return this.indexOf(search, start) !== -1;
		}
	};
}

String.prototype.capitalize = function (downcase = false) {
	return this.charAt(0).toUpperCase() + (downcase ? this.slice(1).toLowerCase() : this.slice(1));
};

Array.prototype.isEqual = function (t) {
	return this.map((x, i) => t.hasOwnProperty(i) && x === t[i]).reduce((a, c) => c & a, true);
};

Array.prototype.filterHighDistance = function (step = 0) {
	if (step > 10) return this; // If we took 10 steps, give up
	const distances = this.map(
		(x, i) => this
			.filter((_, index) => index !== i) // Not this element
			.map(y => Math.abs(y - this[i])).reduce((a, c) => c + a || 0, 0) / (this.length - 1) // Avg of distance to others
	);
	const distancesAvg = distances.reduce((a, c) => c + a || 0, 0) / this.length;

	// Recursion until only viable areas are in the list
	if (distancesAvg > 30) return this.filter((x, i) => distances[i] < distancesAvg * 0.75 || this[i] < distancesAvg).filterHighDistance(step++);

	return this; // Everything is relatively the same
};

// https://tc39.github.io/ecma262/#sec-array.prototype.findindex
if (!Array.prototype.findIndex) {
	Object.defineProperty(Array.prototype, "findIndex", {
		value: function (predicate) {
			// 1. Let O be ? ToObject(this value).
			if (this == null) {
				throw new TypeError('"this" is null or not defined');
			}

			let o = Object(this);

			// 2. Let len be ? ToLength(? Get(O, "length")).
			let len = o.length >>> 0;

			// 3. If IsCallable(predicate) is false, throw a TypeError exception.
			if (typeof predicate !== "function") {
				throw new TypeError("predicate must be a function");
			}

			// 4. If thisArg was supplied, let T be thisArg; else let T be undefined.
			let thisArg = arguments[1];

			// 5. Let k be 0.
			let k = 0;

			// 6. Repeat, while k < len
			while (k < len) {
				// a. Let Pk be ! ToString(k).
				// b. Let kValue be ? Get(O, Pk).
				// c. Let testResult be ToBoolean(? Call(predicate, T, « kValue, k, O »)).
				// d. If testResult is true, return k.
				let kValue = o[k];
				if (predicate.call(thisArg, kValue, k, o)) {
					return k;
				}
				// e. Increase k by 1.
				k++;
			}

			// 7. Return -1.
			return -1;
		},
		configurable: true,
		writable: true
	});
}

// basic remove prototype
if (!Array.prototype.remove) {
	Array.prototype.remove = function (val) {
		if (this === undefined || !this.length) throw new Error("No Array defined");
		if (val === undefined || !val) throw new Error("Cannot remove and element if there is no element defined");
		let index = this.indexOf(val);
		index >= 0 && this.splice(index, 1);
		return this;
	};
}

if (!String.prototype.startsWith) {
	String.prototype.startsWith = function (prefix) {
		return !prefix || this.substring(0, prefix.length) === prefix;
	};
}

if (!String.prototype.endsWith) {
	String.prototype.endsWith = function (search, this_len) {
		if (this_len === undefined || this_len > this.length) {
			this_len = this.length;
		}
		return this.substring(this_len - search.length, this_len) === search;
	};
}

if (!String.isEqual) {
	/**
	 * Check if two strings are equal
	 * @static
	 * @param {string} str1 
	 * @param {string} str2 
	 * @returns {boolean}
	 */
	String.isEqual = function (str1, str2) {
		return str1.toLowerCase() === str2.toLowerCase();
	};
}

// Production steps of ECMA-262, Edition 6, 22.1.2.1
if (!Array.from) {
	Array.from = (function () {
		let toStr = Object.prototype.toString;
		let isCallable = function (fn) {
			return typeof fn === "function" || toStr.call(fn) === "[object Function]";
		};
		let toInteger = function (value) {
			let number = Number(value);
			if (isNaN(number)) {
				return 0;
			}
			if (number === 0 || !isFinite(number)) {
				return number;
			}
			return (number > 0 ? 1 : -1) * Math.floor(Math.abs(number));
		};
		let maxSafeInteger = Math.pow(2, 53) - 1;
		let toLength = function (value) {
			let len = toInteger(value);
			return Math.min(Math.max(len, 0), maxSafeInteger);
		};

		// The length property of the from method is 1.
		return function from(arrayLike/*, mapFn, thisArg */) {
			// 1. Let C be the this value.
			let C = this;

			// 2. Let items be ToObject(arrayLike).
			let items = Object(arrayLike);

			// 3. ReturnIfAbrupt(items).
			if (arrayLike == null) {
				throw new TypeError("Array.from requires an array-like object - not null or undefined");
			}

			// 4. If mapfn is undefined, then let mapping be false.
			let mapFn = arguments.length > 1 ? arguments[1] : void undefined;
			let T;
			if (typeof mapFn !== "undefined") {
				// 5. else
				// 5. a If IsCallable(mapfn) is false, throw a TypeError exception.
				if (!isCallable(mapFn)) {
					throw new TypeError("Array.from: when provided, the second argument must be a function");
				}

				// 5. b. If thisArg was supplied, let T be thisArg; else let T be undefined.
				if (arguments.length > 2) {
					T = arguments[2];
				}
			}

			// 10. Let lenValue be Get(items, "length").
			// 11. Let len be ToLength(lenValue).
			let len = toLength(items.length);

			// 13. If IsConstructor(C) is true, then
			// 13. a. Let A be the result of calling the [[Construct]] internal method
			// of C with an argument list containing the single item len.
			// 14. a. Else, Let A be ArrayCreate(len).
			let A = isCallable(C) ? Object(new C(len)) : new Array(len);

			// 16. Let k be 0.
			let k = 0;
			// 17. Repeat, while k < len… (also steps a - h)
			let kValue;
			while (k < len) {
				kValue = items[k];
				if (mapFn) {
					A[k] = typeof T === "undefined" ? mapFn(kValue, k) : mapFn.call(T, kValue, k);
				} else {
					A[k] = kValue;
				}
				k += 1;
			}
			// 18. Let putStatus be Put(A, "length", len, true).
			A.length = len;
			// 20. Return A.
			return A;
		};
	}());
}

// Filter null or undefined objects in array
if (!Array.prototype.filterNull) {
	Array.prototype.filterNull = function () {
		return this.filter(x => x);
	};
}

// Map the objects with the callback function and filter null values after mapping.
if (!Array.prototype.compactMap) {
	Array.prototype.compactMap = function (callback) {
		return this.map((x, i, array) => {
			if (x == null) {
				return null;
			}
			return callback(x, i, array);
		})
			.filterNull();
	};
}

// Returns a random object in array
if (!Array.prototype.random) {
	Array.prototype.random = function () {
		return this[Math.floor((Math.random() * this.length))];
	};
}

if (!Array.prototype.includes) {
	Array.prototype.includes = function (e) {
		return this.indexOf(e) > -1;
	};
}

if (!Array.prototype.at) {
	Array.prototype.at = function (pos) {
		if (pos < 0) {
			pos += this.length;
		}
		if (pos < 0 || pos >= this.length) return undefined;
		return this[pos];
	};
}

Array.prototype.contains = Array.prototype.includes;

if (!Array.prototype.intersection) {
	Array.prototype.intersection = function (other) {
		return this.filter(e => other.includes(e));
	};
}

if (!Array.prototype.difference) {
	Array.prototype.difference = function (other) {
		return this.filter(e => !other.includes(e));
	};
}

if (!Array.prototype.symmetricDifference) {
	Array.prototype.symmetricDifference = function (other) {
		return this
			.filter(e => !other.includes(e))
			.concat(other.filter(e => !this.includes(e)));
	};
}

// Returns a random integer between start and end included.
Math.randomIntBetween = function (start, end) {
	let min = Math.ceil(start);
	let max = Math.floor(end);
	return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Shuffle Array
// http://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array-in-javascript
if (!Array.prototype.shuffle) {
	Array.prototype.shuffle = function () {
		let temp, index;
		let counter = this.length;

		// While there are elements in the array
		while (counter > 0) {
			// Pick a random index
			index = Math.floor(Math.random() * counter);

			// Decrease counter by 1
			counter -= 1;

			// And swap the last element with it
			temp = this[counter];
			this[counter] = this[index];
			this[index] = temp;
		}

		return this;
	};
}

// Trim String
if (!String.prototype.trim) {
	String.prototype.trim = function () {
		return this.replace(/^\s+|\s+$/g, "");
	};
}

// Object.assign polyfill from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
if (typeof Object.assign !== "function") {
	Object.defineProperty(Object, "assign", {
		value: function assign(target) {
			if (target === null) {
				throw new TypeError("Cannot convert undefined or null to object");
			}

			let to = Object(target);

			for (let index = 1; index < arguments.length; index++) {
				let nextSource = arguments[index];

				if (nextSource !== null) {
					for (let nextKey in nextSource) {
						if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
							to[nextKey] = nextSource[nextKey];
						}
					}
				}
			}

			return to;
		},
		writable: true,
		configurable: true
	});
}

// Array.find polyfill from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find
if (!Array.prototype.find) {
	Object.defineProperty(Array.prototype, "find", {
		value: function (predicate) {
			if (this === null) {
				throw new TypeError('"this" is null or not defined');
			}

			let o = Object(this);

			let len = o.length >>> 0;

			if (typeof predicate !== "function") {
				throw new TypeError("predicate must be a function");
			}

			let thisArg = arguments[1];

			let k = 0;

			while (k < len) {
				let kValue = o[k];

				if (predicate.call(thisArg, kValue, k, o)) {
					return kValue;
				}

				k++;
			}

			return undefined;
		},
		configurable: true,
		writable: true
	});
}

// Fill an array with the same value from start to end indexes.
Array.prototype.fill = function (value, start = 0, end = undefined) {
	let stop = end || this.length;
	for (let i = start; i < stop; i++) {
		this[i] = value;
	}
};

/**
 * @description Return the first element or undefined
 * @return undefined|*
 */
if (!Array.prototype.first) {
	Array.prototype.first = function () {
		return this.length > 0 ? this[0] : undefined;
	};
}

/**
 * @description Return the last element or undefined
 * @return undefined|*
 */
if (!Array.prototype.last) {
	Array.prototype.last = function () {
		return this.length > 0 ? this[this.length - 1] : undefined;
	};
}

/**
 * @description Flatten an array with depth parameter.
 * @see https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Objets_globaux/Array/flat
 * @return array
 */
if (!Array.prototype.flat) {
	Object.defineProperty(Array.prototype, "flat", {
		value: function flat() {
			let depth = arguments.length > 0 ? isNaN(arguments[0]) ? 1 : Number(arguments[0]) : 1;

			return depth ? Array.prototype.reduce.call(this, function (acc, cur) {
				if (Array.isArray(cur)) {
					acc.push.apply(acc, flat.call(cur, depth - 1));
				} else {
					acc.push(cur);
				}

				return acc;
			}, []) : Array.prototype.slice.call(this);
		},
		configurable: true,
		writable: true
	});
}
// eslint-disable-next-line block-scoped-var
if (typeof global === "undefined") {
	// eslint-disable-next-line no-var
	var global = this;
}

// eslint-disable-next-line block-scoped-var
if (!global.hasOwnProperty("require")) {
	let cache;
	// eslint-disable-next-line block-scoped-var
	Object.defineProperty(global, "require", {
		get: function () {
			if (cache) return cache;
			!isIncluded("require.js") && include("require.js");
			return cache; // cache is loaded by require.js
		},
		set: function(v) {
			cache = v;
		}
	});
}

String.prototype.padEnd = function padEnd(targetLength, padString) {
	targetLength = targetLength >> 0; //floor if number or convert non-number to 0;
	padString = String(typeof padString !== "undefined" ? padString : " ");
	if (this.length > targetLength) {
		return String(this);
	} else {
		targetLength = targetLength - this.length;
		if (targetLength > padString.length) {
			padString += padString.repeat(targetLength / padString.length); //append to original to ensure we are longer than needed
		}
		return String(this) + padString.slice(0, targetLength);
	}
};

String.prototype.padStart = function padStart(targetLength, padString) {
	targetLength = targetLength >> 0; //floor if number or convert non-number to 0;
	padString = String(typeof padString !== "undefined" ? padString : " ");
	if (this.length > targetLength) {
		return String(this);
	} else {
		targetLength = targetLength - this.length;
		if (targetLength > padString.length) {
			padString += padString.repeat(targetLength / padString.length); //append to original to ensure we are longer than needed
		}
		return padString.slice(0, targetLength) + String(this);
	}
};

String.prototype.repeat = function(count) {
	"use strict";
	if (this == null) throw new TypeError("can't convert " + this + " to object");
	let str = "" + this;
	count = +count;
	// eslint-disable-next-line no-self-compare
	if (count !== count) {
		count = 0;
	}
	if (count < 0) throw new RangeError("repeat count must be non-negative");
	if (count === Infinity) throw new RangeError("repeat count must be less than infinity");

	count = Math.floor(count);
	if (str.length === 0 || count === 0) {
		return "";
	}
	if (str.length * count >= 1 << 28) {
		throw new RangeError(
			"repeat count must not overflow maximum string size"
		);
	}
	let rpt = "";
	for (;;) {
		if ((count & 1) === 1) {
			rpt += str;
		}
		count >>>= 1;
		if (count === 0) {
			break;
		}
		str += str;
	}
	return rpt;
};

if (!Object.values) {
	Object.values = function (source) {
		return Object.keys(source).map(function (k) { return source[k]; });
	};
}

if (!Object.entries) {
	Object.entries = function (source) {
		return Object.keys(source).map(function (k) { return [k, source[k]]; });
	};
}

(function (global, print) {
	global.console = global.console || (function () {
		const console = {};
		const argMap = el => typeof el === "object" && el /*not null */ && JSON.stringify(el) || el;

		console.log = function (...args) {
			// use call to avoid type errors
			print.call(null, args.map(argMap).join(","));
		};

		console.printDebug = true;
		console.debug = function (...args) {
			if (console.printDebug) {
				const stack = new Error().stack.match(/[^\r\n]+/g);
				let filenameAndLine = stack && stack.length && stack[1].substr(stack[1].lastIndexOf("\\") + 1) || "unknown:0";
				filenameAndLine = filenameAndLine.replace(":", " :: ");
				this.log("[ÿc:Debugÿc0] ÿc:[" + filenameAndLine + "]ÿc0 " + args.map(argMap).join(","));
			}
		};

		console.warn = function (...args) {
			const stack = new Error().stack.match(/[^\r\n]+/g);
			let filenameAndLine = stack && stack.length && stack[1].substr(stack[1].lastIndexOf("\\") + 1) || "unknown:0";
			filenameAndLine = filenameAndLine.replace(":", " :: ");
			this.log("[ÿc9Warningÿc0] ÿc9[" + filenameAndLine + "]ÿc0 " + args.map(argMap).join(","));
		};

		console.error = function (error = "") {
			let msg, source;
			
			if (typeof error === "string") {
				msg = error;
			} else {
				source = error.fileName.substring(error.fileName.lastIndexOf("\\") + 1, error.fileName.length);
				msg = "ÿc1[" + source + " :: " + error.lineNumber + "] ÿc0" + error.message;
			}

			this.log("[ÿc1Errorÿc0] " + msg);
		};

		const timers = {};
		console.time = function (name) {
			name && (timers[name] = getTickCount());
		};

		console.timeEnd = function (name) {
			let currTimer = timers[name];
			if (currTimer) {
				this.log("[ÿc7Timerÿc0] :: ÿc8" + name + " - ÿc4Durationÿc0: " + (getTickCount() - currTimer) + "ms");
				delete timers[name];
			}
		};

		console.trace = function () {
			let stackLog = "";
			let stack = new Error().stack;
			if (stack) {
				stack = stack.split("\n");
				stack && typeof stack === "object" && stack.reverse();

				for (let i = 0; i < stack.length - 1; i += 1) {
					if (stack[i]) {
						stackLog += stack[i].substr(0, stack[i].indexOf("@") + 1) + stack[i].substr(stack[i].lastIndexOf("\\") + 1, stack[i].length - 1);
						i < stack.length - 1 && (stackLog += ", ");
					}
				}

				this.log("[ÿc;StackTraceÿc0] :: " + stackLog);
			}
		};

		console.info = function (start = false, msg = "", timer = "") {
			let stack = new Error().stack.match(/[^\r\n]+/g);
			let funcName = stack[1].substr(0, stack[1].indexOf("@"));
			let logInfo = start === true ? "[ÿc2Start " : start === false ? "[ÿc1End " : "[ÿc8";
			logInfo += (funcName + "ÿc0] :: " + (msg ? msg : ""));
			if (timer) {
				let currTimer = timers[timer];
				if (currTimer) {
					let tFormat = (getTickCount() - currTimer);
					// if less than 1 second, display in ms
					tFormat > 1000 ? (tFormat = Time.format(tFormat)) : (tFormat += " ms");
					logInfo += (" - ÿc4Durationÿc0: " + tFormat);
					delete timers[timer];
				}
			}
			this.log(logInfo);
		};

		return console;

	})();
})([].filter.constructor("return this")(), print);
