/**
*  @filename    Test.js
*  @author      kolton
*  @desc        Unsure? Just testing addEventListener it looks like
*
*/

function Test() {
  print("ÿc8TESTING");

  let c;

  function KeyDown(key) {
    key === sdk.keys.Insert && (c = true);
  }

  addEventListener("keydown", KeyDown);

  while (true) {
    if (c) {
      try {
        doTest();
      } catch (qq) {
        print("failed");
        print(qq + " " + qq.fileName + " " + qq.lineNumber);
      }

      c = false;
    }

    delay(10);
  }
}

function doTest() {
  print("test");
  print("done");
}
