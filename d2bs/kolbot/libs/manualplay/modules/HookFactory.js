/**
 * @filename    HookFactory.js
 * @author      theBGuy
 * @desc        UMD module HookFactory for MapThread
 * 
 */

(function (root, factory) {
  if (typeof module === "object" && typeof module.exports === "object") {
    const v = factory();
    if (v !== undefined) module.exports = v;
  } else if (typeof define === "function" && define.amd) {
    define([], factory);
  } else {
    root.HookFactory = factory();
  }
}([].filter.constructor("return this")(), function() {
  /**
   * @typedef {Object} HookEntry
   * @property {string} name - The identifier for this hook entry
   * @property {Hook} hook - The actual hook object (Text, Box, Frame, etc.)
   * @property {number} [dest] - Optional destination (for act change hooks)
   * @property {string} [type] - Optional type information (e.g., "actChange")
   */
  
  const HookFactory = {
    createHooks: {
      // text: string, x: number, y: number, color: number, font: number, align: number, automap: boolean, ClickHandler?: Function, HoverHandler?: Function
      /**
       * Creates a text hook
       * @param {Partial<Text>} options
       * @returns {HookEntry} The created hook entry
       */
      text: function(options = {}) {
        const { name, text, x, y, color, font, align, automap, handler } = Object.assign({
          name: "",
          text: "",
          x: 0,
          y: 0,
          color: 4,
          font: 0,
          align: 0,
          automap: false,
          handler: null
        }, options);
        return {
          name: name,
          hook: new Text(text, x, y, color, font, align, automap, handler),
        };
      },

      // x: number, y: number, xsize: number, ysize: number, color: number, opacity: number, align: number, automap: boolean, ClickHandler?: Function, HoverHandler?: Function
      /**
       * Creates a box hook
       * @param {Partial<Box>} options
       * @returns {HookEntry} The created hook entry
       */
      box: function(options = {}) {
        const { name, x, y, width, height, color, opacity, click } = Object.assign({
          name: "",
          x: 0,
          y: 0,
          width: 0,
          height: 0,
          color: 0x0,
          opacity: 1,
          click: null
        }, options);
        return {
          name: name,
          hook: new Box(x, y, width, height, color, opacity, click)
        };
      },

      // rame(x: number, y: number, xsize: number, ysize: number, color: number, opacity: number, align: number, automap: boolean, ClickHandler?: Function, HoverHandler?: Function)
      /**
       * Creates a frame hook
       * @param {Partial<Frame>} options
       */
      frame: function(options = {}) {
        const { name, x, y, width, height, style } = Object.assign({
          name: "",
          x: 0,
          y: 0,
          width: 0,
          height: 0,
          style: 0
        }, options);
        return {
          name: name,
          hook: new Frame(x, y, width, height, style)
        };
      }
    },

    /**
     * Creates a container with a box and frame
     * @param {string} boxName - Name for the box element
     * @param {string} frameName - Name for the frame element
     * @param {number} x - X coordinate position
     * @param {number} y - Y coordinate position
     * @param {number} width - Width of the container
     * @param {number} height - Height of the container
     * @param {number} opcacity - Opacity of the box
     * @returns {Array<HookEntry>} Array containing the box and frame hooks
     */
    createContainer: function(boxName, frameName, x, y, width, height, opcacity) {
      const container = [];
      
      container.push(this.createHooks.box({
        name: boxName,
        x: x,
        y: y,
        width: width,
        height: height,
        opacity: opcacity,
      }));
      container[container.length - 1].hook.zorder = 0;
      container.push(this.createHooks.frame({
        name: frameName,
        x: x,
        y: y,
        width: width,
        height: height
      }));
    
      return container;
    }
  };

  return HookFactory;
}));
