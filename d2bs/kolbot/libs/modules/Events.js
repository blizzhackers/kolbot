/**
 * @author Jaenster
 * @description A node like event system
 *
 */

(function (module, require) {
	const Events = module.exports = function () {
		const Worker = require('Worker'), self = this;

		this.hooks = [];

		function Hook(name, callback) {
			this.name = name;
			this.callback = callback;
			this.id = self.hooks.push(this);
			this.__callback = callback; // used for once
		}

		this.on = function (name, callback) {
			if (callback === undefined && typeof name === 'function') [callback,name] = [name,callback];
			return new Hook(name, callback);
		};

		this.trigger = function (name, ...args) {
			return self.hooks.forEach(hook => !hook.name || hook.name === name && Worker.push(function () {
				hook.callback.apply(hook, args);
			}));
		};

		this.emit = this.trigger; // Alias for trigger

		this.once = function (name, callback) {
			if (callback === undefined && typeof name === 'function') [callback,name] = [name,callback];
			const hook = new Hook(name, function (...args) {
				callback.apply(undefined, args);
				delete self.hooks[this.id];
			});
			hook.__callback = callback;
		};

		this.off = function (name, callback) {
			self.hooks.filter(hook => hook.__callback === callback).forEach(hook => {
				delete self.hooks[hook.id];
			})
		};

		this.removeListener = this.off; // Alias for remove
	};
})(module, require);