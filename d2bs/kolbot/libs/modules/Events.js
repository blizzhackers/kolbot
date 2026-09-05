/**
 * @author Jaenster
 * @description A node like event system
 */

(function (module) {
  /**
   * @class Events
   * @constructor
   */
  function Events() {
    const handlers = new WeakMap();
    const onceHandlers = new WeakMap();

    /**
     * Get the event map for an object and map type.
     * @param {Object} obj - The object to get the map for.
     * @param {WeakMap<Object, Map<string, Function[]>>} mapType - The WeakMap storing event maps.
     * @returns {Map<string, Function[]>} The event map for the object.
     */
    function getMap(obj, mapType) {
      if (!mapType.has(obj)) {
        mapType.set(obj, new Map());
      }
      return mapType.get(obj);
    }

    /**
     * Register an event handler for the given key.
     * @param {string} key - The event name.
     * @param {Function} handler - The callback function.
     * @param {WeakMap} [handlerType] - Optional handler map (internal use).
     * @returns {Events} The instance for chaining.
     */
    function on(key, handler, handlerType) {
      handlerType = handlerType || handlers;
      let map = getMap(this, handlerType);
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key).push(handler);
      return this;
    }

    /**
     * Register a one-time event handler for the given key.
     * @param {string} key - The event name.
     * @param {Function} handler - The callback function.
     * @returns {Events} The instance for chaining.
     */
    function once(key, handler) {
      return on.call(this, key, handler, onceHandlers);
    }

    /**
     * Remove an event handler for the given key.
     * @param {string} key - The event name.
     * @param {Function} handler - The callback function to remove.
     * @returns {Events} The instance for chaining.
     */
    function off(key, handler) {
      [handlers, onceHandlers].forEach(function (handlerType) {
        let map = getMap(this, handlerType);
        if (map.has(key)) {
          let arr = map.get(key);
          let idx = arr.indexOf(handler);
          if (idx > -1) {
            arr.splice(idx, 1);
          }
        }
      }, this);
      return this;
    }

    /**
     * Emit an event, calling all handlers for the given key.
     * @param {string} key - The event name.
     * @param {...*} args - Arguments to pass to the handlers.
     * @returns {Events} The instance for chaining.
     */
    function emit(key, ...args) {
      let callbacks = [];

      let onceMap = getMap(this, onceHandlers);
      let restMap = getMap(this, handlers);

      if (onceMap.has(key)) {
        callbacks = callbacks.concat(onceMap.get(key).splice(0));
      }
      if (restMap.has(key)) {
        callbacks = callbacks.concat(restMap.get(key));
      }

      callbacks.forEach(function (cb) {
        cb.apply(this, args);
      }, this);

      return this;
    }

    // Attach methods to the instance
    this.on = on;
    this.once = once;
    this.off = off;
    this.emit = emit;
  }

  module.exports = Events;
})(module);
