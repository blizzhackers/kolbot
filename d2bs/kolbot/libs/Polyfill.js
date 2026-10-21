/**
*  @filename    Polyfill.js
*  @author      Jaenster, theBGuy
*  @desc        Some polyfills since we run old spidermonkey (61f7ebb)
*
*/

/**
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~ String Polyfills ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
 * - String.prototype.lcsGraph
 * - String.prototype.diffCount
 * - String.prototype.includes
 * - String.prototype.capitalize
 * - String.prototype.padEnd
 * - String.prototype.padStart
 * - String.prototype.repeat
 * - String.prototype.trim
 * - String.prototype.startsWith
 * - String.prototype.endsWith
 * - String.prototype.isEqual
 * - String.prototype.format
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
 */


String.prototype.lcsGraph = function (compareToThis) {
  if (!this.length || !compareToThis || !compareToThis.length) {
    return null;
  }

  let stringA = this.toString().toLowerCase();
  let stringB = compareToThis.toLowerCase();
  let graph = Array(this.length);
  let check = (i, j) => (i < 0 || j < 0 || i >= stringA.length || j >= stringB.length) ? 0 : graph[i][j];

  for (let x = 0; x < stringA.length; x++) {
    graph[x] = new Uint16Array(stringB.length);

    for (let y = 0; y < stringB.length; y++) {
      if (stringA[x] === stringB[y]) {
        graph[x][y] = check(x - 1, y - 1) + 1;
      } else {
        graph[x][y] = Math.max(check(x - 1, y), check(x, y - 1));
      }
    }
  }

  return {
    a: this.toString(),
    b: compareToThis,
    graph: graph
  };
};

/**
 * Computes an approximate edit-distance style difference count against another string using the LCS graph.
 * @param {string} stringB - String to compare against.
 * @returns {number} Difference count, or `Infinity` if computing the LCS graph fails.
 */
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
    console.log(err.stack);
  }

  return Infinity;
};

if (!String.prototype.includes) {
  /**
   * @param {string} search
   * @param {number} [start]
   * @returns {boolean}
   */
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

/**
 * @param {boolean} [downcase] - When true, lowercases the remainder of the string after the first character.
 * @returns {string}
 */
String.prototype.capitalize = function (downcase = false) {
  return this.charAt(0).toUpperCase() + (downcase ? this.slice(1).toLowerCase() : this.slice(1));
};

/**
 * @param {number} targetLength
 * @param {string} [padString]
 * @returns {string}
 */
String.prototype.padEnd = function padEnd (targetLength, padString) {
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

/**
 * @param {number} targetLength
 * @param {string} [padString]
 * @returns {string}
 */
String.prototype.padStart = function padStart (targetLength, padString) {
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

/**
 * @param {number} count
 * @returns {string}
 * @throws {TypeError} If called on `null`/`undefined`.
 * @throws {RangeError} If `count` is negative, infinite, or the result would overflow max string size.
 */
String.prototype.repeat = function (count) {
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

// Trim String
if (!String.prototype.trim) {
  /** @returns {string} */
  String.prototype.trim = function () {
    return this.replace(/^\s+|\s+$/g, "");
  };
}

if (!String.prototype.startsWith) {
  /**
   * @param {string} prefix
   * @returns {boolean}
   */
  String.prototype.startsWith = function (prefix) {
    return !prefix || this.substring(0, prefix.length) === prefix;
  };
}

if (!String.prototype.endsWith) {
  /**
   * @param {string} search
   * @param {number} [this_len] - Position to treat as the end of the string; defaults to the string's length.
   * @returns {boolean}
   */
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
   * @param {boolean} caseSensitive
   * @returns {boolean}
   */
  String.isEqual = function (str1, str2, caseSensitive = false) {
    if (!isType(str1, "string") || !isType(str2, "string")) return false;
    if (caseSensitive) {
      return str1 === str2;
    }
    return str1.toLowerCase() === str2.toLowerCase();
  };
}

/**
 * Use since we don't have template literals
 * Replaces placeholders in a string with provided values.
 *
 * @param {Array<Array<string, (number|string|boolean)>>} pairs - An array of arrays,
 * where the first item in each inner array is a placeholder in the form of "$placeholder",
 * and the second item is the value to replace it with.
 * @returns {string} The formatted string.
 */
String.prototype.format = function (...pairs) {
  if (!pairs.length) return this;
  let newString = this;
  pairs.forEach(function (pair) {
    let [match, replace] = pair;
    if (match === undefined || replace === undefined) return;
    newString = newString.replace(match, replace);
  });
  return newString;
};

if (!String.prototype.at) {
  /**
   * @param {number} pos - Zero-based index; negative counts back from the end.
   * @returns {string|undefined}
   */
  String.prototype.at = function (pos) {
    if (pos < 0) {
      pos += this.length;
    }
    if (pos < 0 || pos >= this.length) return undefined;
    return this[pos];
  };
}

if (!String.prototype.unshift) {
  /** @param {string} str */
  String.prototype.unshift = function (str) {
    if (typeof str !== "string") return this;
    return str + this;
  };
}

/**
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Array Polyfills ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
 * - Array.prototype.isEqual
 * - Array.prototype.filterHighDistance
 * - Array.prototype.findIndex
 * - Array.prototype.remove
 * - Array.prototype.from
 * - Array.prototype.filterNull
 * - Array.prototype.compactMap
 * - Array.prototype.random
 * - Array.prototype.shuffle
 * - Array.prototype.includes
 * - Array.prototype.at
 * - Array.prototype.intersection
 * - Array.prototype.difference
 * - Array.prototype.symmetricDifference
 * - Array.prototype.find
 * - Array.prototype.fill
 * - Array.prototype.first
 * - Array.prototype.last
 * - Array.prototype.flat
 * - Array.of
 * - Array.prototype.toSorted
 * - Array.prototype.toReversed
 * - Array.prototype.toSpliced
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
 */


Array.prototype.isEqual = function (t) {
  return this.map((x, i) => t.hasOwnProperty(i) && x === t[i]).reduce((a, c) => c & a, true);
};

/**
 * Recursively filters outlier numeric values whose average distance to other elements exceeds
 * the group average, giving up after 10 recursive steps.
 * @param {number} [step] - Current recursion depth (internal use).
 * @returns {Array<number>}
 */
Array.prototype.filterHighDistance = function (step = 0) {
  if (step > 10) return this; // If we took 10 steps, give up
  const distances = this.map(
    (x, i) => this
      .filter((_, index) => index !== i) // Not this element
      .map(y => Math.abs(y - this[i])).reduce((a, c) => c + a || 0, 0) / (this.length - 1) // Avg of distance to others
  );
  const distancesAvg = distances.reduce((a, c) => c + a || 0, 0) / this.length;

  // Recursion until only viable areas are in the list
  if (distancesAvg > 30) {
    return this
      .filter((x, i) => distances[i] < distancesAvg * 0.75 || this[i] < distancesAvg)
      .filterHighDistance(step + 1);
  }

  return this; // Everything is relatively the same
};

// https://tc39.github.io/ecma262/#sec-array.prototype.findindex
if (!Array.prototype.findIndex) {
  Object.defineProperty(Array.prototype, "findIndex", {
    /**
     * @param {function(*, number, Array): boolean} predicate
     * @param {*} [thisArg] - Value to use as `this` when executing `predicate`.
     * @returns {number} Index of the first matching element, or -1 if none match.
     */
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
  /**
   * @param {*} val - Element to remove (first occurrence only); falsy/undefined values are rejected.
   * @returns {Array} This array, mutated in place.
   * @throws {Error} If the array is empty or `val` is falsy.
   */
  Array.prototype.remove = function (val) {
    if (this === undefined || !this.length) throw new Error("No Array defined");
    if (val === undefined || !val) throw new Error("Cannot remove and element if there is no element defined");
    let index = this.indexOf(val);
    index >= 0 && this.splice(index, 1);
    return this;
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
    return function from (arrayLike/*, mapFn, thisArg */) {
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
  /** @returns {Array} A new array with all falsy elements (null, undefined, etc.) removed. */
  Array.prototype.filterNull = function () {
    return this.filter(x => x);
  };
}

// Map the objects with the callback function and filter null values after mapping.
if (!Array.prototype.compactMap) {
  /**
   * @param {function(*, number, Array): *} callback
   * @returns {Array} Mapped results with null/undefined entries filtered out.
   */
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
  /** @returns {*} A random element, or `null` if the array is empty. */
  Array.prototype.random = function () {
    if (this.length === 0) return null;
    if (this.length === 1) return this[0];
    return this[Math.floor((Math.random() * this.length))];
  };
}

if (!Array.prototype.includes) {
  /**
   * @param {*} e
   * @returns {boolean}
   */
  Array.prototype.includes = function (e) {
    return this.indexOf(e) > -1;
  };
}

if (!Array.prototype.at) {
  /**
   * @param {number} pos - Zero-based index; negative counts back from the end.
   * @returns {*}
   */
  Array.prototype.at = function (pos) {
    if (pos < 0) {
      pos += this.length;
    }
    if (pos < 0 || pos >= this.length) return undefined;
    return this[pos];
  };
}

if (!Array.prototype.intersection) {
  /**
   * @param {Array} other
   * @returns {Array} Elements present in both this array and `other`.
   */
  Array.prototype.intersection = function (other) {
    return this.filter(e => other.includes(e));
  };
}

if (!Array.prototype.difference) {
  /**
   * @param {Array} other
   * @returns {Array} Elements of this array not present in `other`.
   */
  Array.prototype.difference = function (other) {
    return this.filter(e => !other.includes(e));
  };
}

if (!Array.prototype.symmetricDifference) {
  /**
   * @param {Array} other
   * @returns {Array} Elements present in exactly one of the two arrays.
   */
  Array.prototype.symmetricDifference = function (other) {
    return this
      .filter(e => !other.includes(e))
      .concat(other.filter(e => !this.includes(e)));
  };
}

// Shuffle Array
// http://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array-in-javascript
if (!Array.prototype.shuffle) {
  /**
   * Shuffles the array in place using the Fisher-Yates algorithm.
   * @returns {Array} This array, mutated in place.
   */
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

// Array.find polyfill from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find
if (!Array.prototype.find) {
  Object.defineProperty(Array.prototype, "find", {
    /**
     * @param {function(*, number, Array): boolean} predicate
     * @param {*} [thisArg] - Value to use as `this` when executing `predicate`.
     * @returns {*} The first matching element, or `undefined` if none match.
     */
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
/**
 * @param {*} value
 * @param {number} [start]
 * @param {number} [end]
 * @returns {Array} This array, mutated in place.
 */
Array.prototype.fill = function (value, start = 0, end = undefined) {
  let stop = end || this.length;
  for (let i = start; i < stop; i++) {
    this[i] = value;
  }
  return this;
};

if (!Array.prototype.first) {
  /**
   * @description Return the first element or undefined
   * @return {undefined | *}
   */
  Array.prototype.first = function () {
    return this.length > 0 ? this[0] : undefined;
  };
}

if (!Array.prototype.last) {
  /**
   * @description Return the last element or undefined
   * @return {undefined | *}
   */
  Array.prototype.last = function () {
    return this.length > 0 ? this[this.length - 1] : undefined;
  };
}

if (!Array.prototype.flat) {
  Object.defineProperty(Array.prototype, "flat", {
    /**
     * @description Flatten an array with depth parameter.
     * @see https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Objets_globaux/Array/flat
     * @param {number} [depth] - Maximum recursion depth; defaults to 1.
     * @return {Array<*>}
     */
    value: function flat () {
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

if (!Array.of) {
  Object.defineProperty(Array, "of", {
    /**
     * @description The Array.of() static method creates a new Array instance from a
     * variable number of arguments, regardless of number or type of the arguments.
     * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/of
     * @param {...*} elements - Elements to include in the new array.
     * @return {Array<...args>}
     */
    value: function of () {
      return Array.prototype.slice.call(arguments);
    },
    configurable: true,
    writable: true
  });
}

if (!Array.prototype.toReversed) {
  /**
   * @description The toReversed() method of Array instances is the copying counterpart of the reverse()
   * method. It returns a new array with the elements in reversed order.
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/toReversed
   * @return {Array}
   */
  Array.prototype.toReversed = function () {
    return this.slice().reverse();
  };
}

if (!Array.prototype.toSorted) {
  /**
   * Creates a new array with the elements of the original array sorted in ascending order.
   *
   * @template T
   * @param {function(T, T): number} [compareFunction] A function that defines the sort order.
   * If omitted, the elements are sorted in ascending order based on their string conversion.
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/toSorted
   * @returns {Array} A new array with the elements sorted in ascending order.
   */
  Array.prototype.toSorted = function (compareFunction) {
    return this.slice().sort(compareFunction);
  };
}

if (!Array.prototype.toSpliced) {
  /**
   * Creates a new array by removing or replacing elements from the original array.
   *
   * @param {number} start The index at which to start changing the array.
   * If negative, it is treated as `array.length + start`.
   * @param {number} [deleteCount] The number of elements to remove from the array.
   * If omitted or greater than `array.length - start`, all elements from `start` to the end of the array are deleted.
   * @param {...*} [items] The elements to add to the array starting from the `start` index.
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/toSpliced
   * @returns {Array} A new array with the modified elements.
   */
  Array.prototype.toSpliced = function (start, deleteCount) {
    const newArr = this.slice();
    const items = Array.prototype.slice.call(arguments, 2);
    Array.prototype.splice.apply(newArr, [start, deleteCount].concat(items));
    return newArr;
  };
}

if (!Array.prototype.with) {
  /**
   * @description The with() method of Array instances is the copying version of using the bracket notation to change the value of a given index.
   * It returns a new array with the element at the given index replaced with the given value.
   * @param {number} index - Zero-based index at which to change the array, converted to an integer.
   * @param {*} value - Any value to be assigned to the given index.
   * @returns {Array} A new array with the element at index replaced with value.
   * @throws {RangeError} If index >= array.length or index < -array.length.
   */
  Array.prototype.with = function (index, value) {
    const len = this.length;
    const relativeIndex = index < 0 ? len + index : index;

    if (relativeIndex < 0 || relativeIndex >= len) {
      throw new RangeError("Index out of range");
    }

    const newArray = this.slice();
    newArray[relativeIndex] = value;
    return newArray;
  };
}

/**
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~ Object Polyfills ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
 * - Object.assign
 * - Object.entries
 * - Object.values
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
 */

if (typeof Object.assign !== "function") {
  Object.defineProperty(Object, "assign", {
    /**
     * @description Copy the values of all enumerable own properties from one or more source objects to a target object. Returns the target object.
     * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
     * @param {Object} target - Target object.
     * @param {...Object} sources - One or more source objects.
     * @returns {Object} The target object.
     */
    value: function assign (target) {
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

if (!Object.values) {
  /**
   * @param {Object} source
   * @returns {Array<*>} The own enumerable property values of `source`.
   */
  Object.values = function (source) {
    return Object.keys(source)
      .map(function (k) {
        return source[k];
      });
  };
}

if (!Object.entries) {
  /**
   * @param {Object} source
   * @returns {Array<Array<*>>} Array of `[key, value]` pairs for `source`'s own enumerable properties.
   */
  Object.entries = function (source) {
    return Object.keys(source)
      .map(function (k) {
        return [k, source[k]];
      });
  };
}

if (!Object.hasOwn) {
  /**
   * @param {Object} obj
   * @param {string|symbol} prop
   * @returns {boolean}
   */
  Object.hasOwn = function (obj, prop) {
    return Object.prototype.hasOwnProperty.call(obj, prop);
  };
}

// eslint-disable-next-line no-var
if (typeof global === "undefined") var global = [].filter.constructor("return this")();
// eslint-disable-next-line dot-notation
global["globalThis"] = [].filter.constructor("return this")();

if (!global.hasOwnProperty("require")) {
  let cache;
  Object.defineProperty(global, "require", {
    /**
     * Lazily loads and caches require.js on first access.
     * @returns {*} The cached `require` implementation.
     */
    get: function () {
      if (cache) return cache;
      !isIncluded("require.js") && include("require.js");
      return cache; // cache is loaded by require.js
    },
    /** @param {*} v */
    set: function (v) {
      cache = v;
    }
  });
}

if (!global.hasOwnProperty("env")) {
  /**
   * @typedef {Object} EnvStore
   * @property {function(Record<string, any>): EnvStore} update - Updates environment settings
   * @property {Object.<string, any>} [customSettings] - Any additional custom settings
   */
  
  /** @type {EnvStore} */
  const envStore = {};
  let initialized = false;
  
  Object.defineProperty(global, "env", {
    value: new Proxy({}, {
      /**
       * Lazily loads `.env.json` into the backing store on first access.
       * @param {Object} target
       * @param {string|symbol} prop
       * @returns {*} The stored value for `prop`, or `undefined`.
       */
      get: function (target, prop) {
        if (!initialized) {
          /** @param {Record<string, any>} settings */
          envStore.update = function(settings) {
            Object.assign(this, settings);
            return this;
          };
          
          if (FileTools.exists(".env.json")) {
            try {
              let loadedEnv = FileAction.parse(".env.json");
              envStore.update(loadedEnv);
            } catch (err) {
              console.error(err);
            }
          }
          
          initialized = true;
        }
        
        if (prop in envStore) {
          return typeof envStore[prop] === "function"
            ? envStore[prop].bind(envStore)
            : envStore[prop];
        }
        
        return undefined;
      },
      
      /**
       * @param {Object} target
       * @param {string|symbol} prop
       * @param {*} value
       * @returns {boolean}
       */
      set: function (target, prop, value) {
        if (!initialized) {
          this.get(target, "version");
        }
        
        envStore[prop] = value;
        return true;
      },
      
      /**
       * @param {Object} target
       * @param {string|symbol} prop
       * @returns {boolean}
       */
      has: function (target, prop) {
        if (!initialized) {
          this.get(target, "version");
        }
        
        return prop in envStore;
      },
      
      /**
       * @param {Object} target
       * @returns {Array<string|symbol>}
       */
      ownKeys: function (target) {
        if (!initialized) {
          this.get(target, "version");
        }
        
        return Object.keys(envStore);
      }
    }),
    writable: false,
    configurable: false
  });
}

/**
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Math Polyfills ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
 * - Math.randomIntBetween
 * - Math.trunc
 * - Math.percentDifference
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
 */

// Returns a random integer between start and end included.
/**
 * @param {number} start
 * @param {number} end
 * @returns {number} A random integer in the inclusive range [start, end].
 */
Math.randomIntBetween = function (start, end) {
  let min = Math.ceil(start);
  let max = Math.floor(end);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

if (!Math.trunc) {
  /**
   * Polyfill for Math.trunc
   * Static method returns the integer part of a number by removing any fractional digits.
   * @static
   * @param {number} number 
   * @returns {number}
   */
  Math.trunc = function (number) {
    return number < 0 ? Math.ceil(number) : Math.floor(number);
  };
}

/**
 * @param {number} value1
 * @param {number} value2
 * @returns {number} Percent difference between the two values, truncated to an integer.
 */
Math.percentDifference = function (value1, value2) {
  const diff = Math.abs(value1 - value2);
  const average = (value1 + value2) / 2;
  const percentDiff = (diff / average) * 100;
  return Math.trunc(percentDiff);
};

/**
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Map Polyfills ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
 * - Map.prototype.forEach
 * - Map.prototype.toString
 * - Map.prototype.keys
 * - Map.prototype.values
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
 */

if (typeof Map.prototype.forEach !== "function") {
  /**
   * @param {function(*, *, Map): void} callbackFn
   * @param {*} [thisArg]
   */
  Map.prototype.forEach = function (callbackFn, thisArg) {
    thisArg = thisArg || this;
    for (let [key, value] of this.entries()) {
      callbackFn.call(thisArg, value, key, this);
    }
  };
}

/** @returns {string} JSON string of the map's entries as a plain object. */
Map.prototype.toString = function () {
  let obj = {};
  for (let [key, value] of this.entries()) {
    obj[key] = value;
  }
  return JSON.stringify(obj);
};

/** @returns {Array<typeof Map.prototype.keys>} */
Map.prototype.keys = function () {
  let keys = [];

  for (let [key, _value] of this.entries()) {
    keys.push(key);
  }
  return keys;
};

/** @returns {Array<*>} */
Map.prototype.values = function () {
  let values = [];

  for (let [_key, value] of this.entries()) {
    values.push(value);
  }
  return values;
};

/**
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Set Polyfills ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
 * - Set.prototype.forEach
 * - Set.prototype.keys
 * - Set.prototype.values
 * - Set.prototype.entries
 * - Set.prototype.isSuperset
 * - Set.prototype.union
 * - Set.prototype.intersection
 * - Set.prototype.difference
 * - Set.prototype.symmetricDifference
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
 */

if (typeof Set.prototype.forEach !== "function") {
  /**
   * @param {function(*, *, Set): void} callbackFn
   * @param {*} [thisArg]
   */
  Set.prototype.forEach = function (callbackFn, thisArg) {
    thisArg = thisArg || this;
    for (let item of this) {
      callbackFn.call(thisArg, item, item, this);
    }
  };
}

if (typeof Set.prototype.keys !== "function") {
  /** @returns {Array<*>} */
  Set.prototype.keys = function () {
    let keys = [];
    for (let item of this) {
      keys.push(item);
    }
    return keys;
  };
}

if (typeof Set.prototype.values !== "function") {
  /** @returns {Array<*>} */
  Set.prototype.values = function () {
    let values = [];
    for (let item of this) {
      values.push(item);
    }
    return values;
  };
}

if (typeof Set.prototype.entries !== "function") {
  /** @returns {Array<Array<*>>} Array of `[item, item]` pairs. */
  Set.prototype.entries = function () {
    let entries = [];
    for (let item of this) {
      entries.push([item, item]);
    }
    return entries;
  };
}

/**
 * @param {Set|Iterable} subset
 * @returns {boolean} True if every element of `subset` is present in this set.
 */
Set.prototype.isSuperset = function (subset) {
  for (let item of subset) {
    if (!this.has(item)) {
      return false;
    }
  }
  return true;
};

/**
 * @param {Set|Iterable} setB
 * @returns {Set} A new set containing all elements from both sets.
 */
Set.prototype.union = function (setB) {
  let union = new Set(this);
  for (let item of setB) {
    union.add(item);
  }
  return union;
};

/**
 * @param {Set|Iterable} setB
 * @returns {Set} A new set containing elements present in both sets.
 */
Set.prototype.intersection = function (setB) {
  let intersection = new Set();
  for (let item of setB) {
    if (this.has(item)) {
      intersection.add(item);
    }
  }
  return intersection;
};

/**
 * @param {Set|Iterable} setB
 * @returns {Set} A new set containing elements present in exactly one of the two sets.
 */
Set.prototype.symmetricDifference = function (setB) {
  let difference = new Set(this);
  for (let item of setB) {
    if (difference.has(item)) {
      difference.delete(item);
    } else {
      difference.add(item);
    }
  }
  return difference;
};

/**
 * @param {Set|Iterable} setB
 * @returns {Set} A new set containing this set's elements minus those in `setB`.
 */
Set.prototype.difference = function (setB) {
  let difference = new Set(this);
  for (let item of setB) {
    difference.delete(item);
  }
  return difference;
};

/** @returns {string} JSON string of the set's elements. */
Set.prototype.toString = function () {
  let arr = [];
  for (let item of this) {
    arr.push(item);
  }
  return JSON.stringify(arr);
};

/**
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~ console Polyfills ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
 * - console.log
 * - console.debug
 * - console.warn
 * - console.error
 * - console.info
 * - console.trace
 * - console.time
 * - console.timeEnd
 * - console.table (partial)
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
 */

(function (global, print) {
  global.console = global.console || (function () {
    const console = {};

    const argMap = function (el) {
      switch (typeof el) {
      case "undefined":
        return "undefined";
      case "boolean":
        return el ? "true" : false;
      case "function":
        return "function";
      case "object":
        if (el === null) return "null";
        if (el instanceof Error) {
          return JSON.stringify({
            name: (el.name || "Error"),
            fileName: (el.fileName || "unknown"),
            lineNumber: (el.lineNumber || ":?"),
            message: (el.message || ""),
            stack: (el.stack || ""),
          });
        }
        if (el instanceof Map) {
          return el.toString();
        } else if (el instanceof Set) {
          return el.toString();
        }
        if (Array.isArray(el)) {
          // handle multidimensional arrays
          return JSON.stringify(
            el.map(function (inner) {
              return Array.isArray(inner) ? inner.map(argMap) : inner;
            })
          );
        }
        return JSON.stringify(el);
      }
      return el;
    };

    /** @param {...*} args */
    console.log = function (...args) {
      // use call to avoid type errors
      print.call(null, args.map(argMap).join(","));
    };

    console.printDebug = true;
    /**
     * Logs only when `console.printDebug` is true, prefixed with the caller's file and line.
     * @param {...*} args
     */
    console.debug = function (...args) {
      if (console.printDebug) {
        const stack = new Error().stack.match(/[^\r\n]+/g);
        let filenameAndLine = stack && stack.length && stack[1].substr(stack[1].lastIndexOf("\\") + 1) || "unknown:0";
        filenameAndLine = filenameAndLine.replace(":", " :: ");
        this.log("[ÿc:Debugÿc0] ÿc:[" + filenameAndLine + "]ÿc0 " + args.map(argMap).join(","));
      }
    };

    /**
     * Logs a warning prefixed with the caller's file and line.
     * @param {...*} args
     */
    console.warn = function (...args) {
      const stack = new Error().stack.match(/[^\r\n]+/g);
      let filenameAndLine = stack && stack.length && stack[1].substr(stack[1].lastIndexOf("\\") + 1) || "unknown:0";
      filenameAndLine = filenameAndLine.replace(":", " :: ");
      this.log("[ÿc9Warningÿc0] ÿc9[" + filenameAndLine + "]ÿc0 " + args.map(argMap).join(","));
    };

    /** @param {string|Error} [error] */
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

    /** @type {Map<string, number>} */
    const timers = new Map();

    /** @param {string} name */
    console.time = function (name) {
      name && timers.set(name, getTickCount());
    };

    /** @param {string} name */
    console.timeEnd = function (name) {
      let currTimer = timers.get(name);
      if (currTimer) {
        this.log("[ÿc7Timerÿc0] :: ÿc8" + name + " - ÿc4Durationÿc0: " + (getTickCount() - currTimer) + "ms");
        timers.delete(name);
      }
    };

    /**
     * Logs a stack trace built from `new Error().stack`, formatted innermost-frame-last.
     */
    console.trace = function () {
      let stackLog = "";
      let stack = new Error().stack;
      if (stack) {
        stack = stack.split("\n");
        stack && typeof stack === "object" && stack.reverse();

        for (let i = 0; i < stack.length - 1; i += 1) {
          if (stack[i]) {
            stackLog += stack[i]
              .substr(
                0, stack[i].indexOf("@") + 1) + stack[i].substr(stack[i].lastIndexOf("\\") + 1, stack[i].length - 1
            );
            i < stack.length - 1 && (stackLog += ", ");
          }
        }

        this.log("[ÿc;StackTraceÿc0] :: " + stackLog);
      }
    };

    /**
     * @param {boolean} [start] - `true` logs a "Start" prefix, `false` an "End" prefix, any other value a plain prefix.
     * @param {string} [msg]
     * @param {string} [timer] - Key registered via `console.time`; appends elapsed duration and clears the timer.
     */
    console.info = function (start = false, msg = "", timer = "") {
      const stack = new Error().stack.match(/[^\r\n]+/g);
      let funcName = stack[1].substr(0, stack[1].indexOf("@"));
      let logInfo = start === true
        ? "[ÿc2Start "
        : start === false
          ? "[ÿc1End "
          : "[ÿc8";
      logInfo += (funcName + "ÿc0] :: " + (msg ? msg : ""));
      if (timer) {
        let currTimer = timers.get(timer);
        if (currTimer) {
          let tFormat = (getTickCount() - currTimer);
          // if less than 1 second, display in ms
          tFormat > 1000 ? (tFormat = Time.format(tFormat)) : (tFormat += " ms");
          logInfo += (" - ÿc4Durationÿc0: " + tFormat);
          timers.delete(timer);
        } else {
          this.time(timer);
        }
      }
      this.log(logInfo);
    };

    /**
     * @param {object | any[]} data 
     * @param {string[]} [columns] 
     */
    console.table = function (data, columns) {
      if (data === undefined) return;

      let output = "";
      let table = [];

      // Create table headers
      if (!columns) {
        columns = Object.keys(data[0]);
      }
      let row = columns;
      table.push(row);

      // Create table rows
      for (let i = 0; i < data.length; i++) {
        row = [];
        for (let j = 0; j < columns.length; j++) {
          row.push(data[i][columns[j]]);
        }
        table.push(row);
      }

      // todo - get longest element and adjust the output of that column to stay within the header bars
      let maxLengths = new Array(table[0].length).fill(0);

      for (let i = 0; i < table.length; i++) {
        for (let j = 0; j < table[i].length; j++) {
          maxLengths[j] = Math.max(maxLengths[j], table[i][j].toString().length);
        }
      }
      console.log(maxLengths);

      // Create table output
      for (let i = 0; i < table.length; i++) {
        for (let j = 0; j < table[i].length; j++) {
          // output += "| " + table[i][j] + " ";
          output += "| " + table[i][j].toString().padEnd(maxLengths[j]) + " ";
        }
        output += "|\n";
      }

      // // Log table to console
      console.log(output);

      // for (let i = 0; i < data.length; i++) {
      // 	let row = "|";
      // 	for (let j = 0; j < data[i].length; j++) {
      // 		row += " " + data[i][j].toString().padEnd(maxLengths[j]) + " |";
      // 	}
      // 	console.log(row);
      // }
    };

    return console;

  })();
})([].filter.constructor("return this")(), print);

/**
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Date Polyfills ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
 * - Date.prototype.dateStamp
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
 */

if (!Date.prototype.hasOwnProperty("dateStamp")) {
  Object.defineProperty(Date.prototype, "dateStamp", {
    /** @returns {string} Date formatted as "[MM/DD/YYYY]". */
    value: function () {
      let month = this.getMonth() + 1;
      let day = this.getDate();
      let year = this.getFullYear();
      return "[" + (month < 10 ? "0" + month : month) + "/" + (day < 10 ? "0" + day : day) + "/" + year + "]";
    }
  });
}
