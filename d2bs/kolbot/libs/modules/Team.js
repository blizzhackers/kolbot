/**
 * @description Easy communication between clients
 * @Author Jaenster
 *
 */
!isIncluded('require.js') && include('require.js'); // load the require.js

(function (threadType) {

	const others = [];

	const myEvents = new (require('Events'));
	const Worker = require('Worker');
	const Messaging = require('Messaging');
	const defaultCopyDataMode = 0xC0FFFEE;

	const Team = {
		on: myEvents.on,
		off: myEvents.off,
		once: myEvents.once,
		send: function (who, what, mode = defaultCopyDataMode) {
			what.profile = me.windowtitle;
			return sendCopyData(null, who, mode || defaultCopyDataMode, JSON.stringify(what));
		},
		broadcast: (what, mode) => {
			what.profile = me.windowtitle;
			return others.forEach(other => sendCopyData(null, other.profile, mode || defaultCopyDataMode, JSON.stringify(what)))
		},
		broadcastInGame: (what, mode) => {
			what.profile = me.windowtitle;
			others.forEach(function (other) {
				for (const party = getParty(); party && party.getNext();) {
					typeof party === 'object' && party && party.hasOwnProperty('name') && party.name === other.name && sendCopyData(null, other.profile, mode || defaultCopyDataMode, JSON.stringify(what));
				}
			})
		}
	};

	if (threadType === 'thread') {
		print('ÿc2Kolbotÿc0 :: Team thread started');

		Messaging.on('Team', data => {
			return typeof data === 'object' && data && data.hasOwnProperty('call') && Team[data.call].apply(Team, data.hasOwnProperty('args') && data.args || []);
		});

		Worker.runInBackground.copydata = (new function () {
			const workBench = [];
			const updateOtherProfiles = function () {
				const fileList = dopen("data/").getFiles();
				fileList && fileList.forEach(function (filename) {
					let newContent, obj, profile = filename.split("").reverse().splice(5).reverse().join(''); // strip the last 5 chars (.json) = 5 chars


					if (profile === me.windowtitle || !filename.endsWith('.json')) return;
					try {
						newContent = FileTools.readText('data/' + filename);
						if (!newContent) return; // no content
					} catch (e) {
						print('Can\'t read: `' + 'data/' + filename + '`');
					}


					try { // try to convert to an object
						obj = JSON.parse(newContent);
					} catch (e) {
						return;
					}

					let other;
					for (let i = 0, tmp; i < others.length; i++) {
						tmp = others[i];
						if (tmp.hasOwnProperty('profile') && tmp.profile === profile) {
							other = tmp;
							break;
						}
					}

					if (!other) {
						others.push(obj);
						other = others[others.length - 1];
					}

					other.profile = profile;
					Object.keys(obj).map(key => other[key] = obj[key]);
				})
			};
			addEventListener('copydata', (mode, data) => workBench.push({mode: mode, data: data}));

			let timer = getTickCount() - Math.round((Math.random() * 2500) + 1000); // start with 3 seconds off
			this.update = function () {
				if (!((getTickCount() - timer) < 3500)) { // only ever 3 seconds update the entire team
					timer = getTickCount();
					updateOtherProfiles();
				}

				// nothing to do? next
				if (!workBench.length) return true;
				const emit = workBench.splice(0, workBench.length).map(
					function (obj) { // Convert to object, if we can
						let data = obj.data;
						try {
							data = JSON.parse(data);
						} catch (e) {
							/* Dont care if we cant*/
							return {};
						}
						return {mode: obj.mode, data: data};
					})
					.filter(obj => typeof obj === 'object' && obj)
					.filter(obj => typeof obj.data === 'object' && obj.data)
					.filter(obj => typeof obj.mode === 'number' && obj.mode);
				emit.length && Messaging.send({
					Team: {
						emit: emit
					}
				});
				return true; // always, to keep looping;
			};
		}).update;

		while (true) {
			delay(1000);
		}

	} else {
		(function (module, require) {
			const localTeam = module.exports = Team; // <-- some get overridden, but this still works for auto completion in your IDE

			// Filter out all Team functions that are linked to myEvent
			Object.keys(Team)
				.filter(key => !myEvents.hasOwnProperty(key) && typeof Team[key] === 'function')
				.forEach(key => {
					return module.exports[key] = (...args) => {
						return Messaging.send({
							Team: {
								call: key,
								args: args
							}
						});
					};
				});

			Messaging.on('Team', msg =>
				typeof msg === 'object'
				&& msg
				&& msg.hasOwnProperty('emit')
				&& Array.isArray(msg.emit)
				&& msg.emit.forEach(function (obj) {

					// Registered events on the mode
					myEvents.emit(obj.mode, obj.data);

					// Only if data is set
					typeof obj.data === 'object' && obj.data && Object.keys(obj.data).forEach(function (item) {

						// For each item in the object, trigger an event
						obj.data[item].reply = (what, mode) => localTeam.send(obj.data.profile, what, mode);

						// Registered events on a data item
						myEvents.emit(item, obj.data[item]);
					})
				})
			);
		})(module, require);
	}


})(getScript.startAsThread());