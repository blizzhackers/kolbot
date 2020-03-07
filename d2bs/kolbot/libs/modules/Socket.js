/**
 * @description a wrapper around the socket object
 * @author Jaenster
 */


(function (module, require, buildinSock) {
	const Worker = require('Worker');
	const Events = require('Events');

	/** @constructor Socket*/
	function Socket(hostname, port) {
		typeof Socket.__socketCounter === 'undefined' && (Socket.__socketCounter = 0);
		this.connected = false;
		const myEvents = new Events;
		this.connect = () => (this.socket = buildinSock.open(hostname, port)) && (this.connected = true) && this;

		this.on = myEvents.on;
		this.off = myEvents.off;
		this.once = myEvents.once;

		const close = () => {
			this.socket = null;
			this.connected = false;
			myEvents.emit('close', this);
		};

		this.recv = () => {
			if (!this.connected || !this.socket || !this.socket.readable) return;

			const data = (() => {
				try {
					return this.socket.read()
				} catch (e) {
					close();
				}
				return undefined;
			})();

			data && myEvents.emit('data', data);
		};

		this.send = (data) => {
			if (!data || !this.socket) return;

			try {
				this.socket.send(data);
			} catch (e) {
				close();
			}
		};

		Worker.runInBackground['__socket__' + (++Socket.__socketCounter)] = () => this.recv() || this.send() || true;
	}

	module.exports = Socket;
}).call(null, module, require, Socket);
