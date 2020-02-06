/**
 * @description Easy communication between threads
 * @Author Jaenster
 */


(function (module, require) {
	const myEvents = new (require('Events'));
	const Worker = require('Worker');


	Worker.runInBackground.messaging = (new function () {
		const workBench = [];
		addEventListener('scriptmsg', data => workBench.push(data));

		this.update = function () {
			if (!workBench.length) return true;

			let work = workBench.splice(0, workBench.length);
			work.filter(data => typeof data === 'object' && data)
				.forEach(function (data) {
					Object.keys(data).forEach(function (item) {
						myEvents.emit(item, data[item]); // Trigger those events
					})
				});

			return true; // always, to keep looping;
		}
	}).update;

	module.exports = {
		on: myEvents.on,
		off: myEvents.off,
		once: myEvents.once,
		send: what => scriptBroadcast(what)
	}

})(module, require);