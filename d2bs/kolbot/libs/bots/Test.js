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
		if (key === 45) {
			c = true;
		}
	}

	addEventListener("keydown", KeyDown);

	while (true) {
		if (c) {
			try {
				test();
			} catch (qq) {
				print('faile');
				print(qq + " " + qq.fileName + " " + qq.lineNumber);
			}

			c = false;
		}

		delay(10);
	}
}

function test() {
	print("test");

	print("done");
}
