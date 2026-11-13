/**
*  @filename    Test.js
*  @author      kolton
*  @desc        Unsure? Just testing addEventListener it looks like
*
*/

function Test() {
  console.log("ÿc8TESTING");

  let c;

  /**
   * @param {number} key
   * @returns {void}
   */
  function KeyDown(key) {
    key === sdk.keys.Insert && (c = true);
  }

  addEventListener("keydown", KeyDown);

  while (true) {
    if (c) {
      try {
        doTest();
      } catch (qq) {
        console.log("failed");
        console.log(qq + " " + qq.fileName + " " + qq.lineNumber);
      }

      c = false;
    }

    delay(10);
  }
}

/** @returns {void} */
function doTest() {
  console.log("test");
  console.log("done");
}
