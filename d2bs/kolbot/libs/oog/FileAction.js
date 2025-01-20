/**
*  @filename    FileAction.js
*  @author      theBGuy
*  @desc        Handle CRUD operations
*
*/

!isIncluded("Polyfill.js") && include("Polyfill.js");

/**
 * Should this file be in the oog folder? Its technically actions performed out of game but many in game functions use it.
 * Maybe common? I want core/ to essentially be an alias for core. Everything that is required for in game functionality
 * All "extras" should be somewhere else
 */

const FileAction = {
  read: function (path = "") {
    if (!path) throw new Error("No path provided");

    let contents = "";

    for (let i = 0; i < 30; i++) {
      try {
        contents = FileTools.readText(path);

        if (contents) return contents;
      } catch (e) {
        // console.error(e, path);
      }

      // incremental delay
      delay(100 + ((i % 5) * 100));
    }

    return contents;
  },

  write: function (path = "", msg = "") {
    if (!path) throw new Error("No path provided");

    // do we read the file to see if it has changed?
    // for now keep the orginal behavior
    for (let i = 0; i < 30; i++) {
      try {
        FileTools.writeText(path, msg);

        break;
      } catch (e) {
        // console.error(e, path);
      }

      delay(100 + ((i % 5) * 100));
    }

    return true;
  },

  append: function (path = "", msg = "") {
    if (!path) throw new Error("No path provided");

    // do we read the file to see if it has changed?
    // for now keep the orginal behavior
    for (let i = 0; i < 30; i++) {
      try {
        FileTools.appendText(path, msg);

        break;
      } catch (e) {
        // console.error(e, path);
      }

      delay(100 + ((i % 5) * 100));
    }

    return true;
  },

  parse: function (path = "") {
    if (!path) throw new Error("No path provided");
    if (!FileTools.exists(path)) throw new Error("Can't parse file that doesn't exist");

    let contents = "";

    try {
      contents = FileAction.read(path);

      if (contents) {
        return JSON.parse(contents);
      }
    } catch (e) {
      console.error(e, path);
    }

    return contents;
  },
};
