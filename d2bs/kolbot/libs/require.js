/**
 * @description A node like require function.
 * @author Jaenster
 */

!isIncluded('polyfill.js') && include('polyfill.js');

// noinspection ThisExpressionReferencesGlobalObjectJS <-- definition of global here
typeof global === 'undefined' && (this['global'] = this);

global['module'] = {exports: undefined};
global.require = (function (include, isIncluded, print, notify) {

	let depth = 0;
	const modules = {};
	const obj = function require(field, path) {
		const stack = new Error().stack.match(/[^\r\n]+/g);
		let directory = stack[1].match(/.*?@.*?d2bs\\(kolbot\\?.*)\\.*(\.js|\.dbj):/)[1].replace('\\','/')+'/';
		let filename = stack[1].match(/.*?@.*?d2bs\\kolbot\\?(.*)(\.js|\.dbj):/)[1];
		filename = filename.substr(filename.length-filename.split('').reverse().join('').indexOf('\\'));
		// remove the name kolbot of the file
		if (directory.startsWith('kolbot')) {
			directory =  directory.substr('kolbot'.length);
		}

		// remove the / from it
		if (directory.startsWith('/')){
			directory = directory.substr(1);
		}

		// strip off lib
		if (directory.startsWith('lib')) {
			directory = directory.substr(4);
		} else {
			directory = '../'+directory; // Add a extra recursive path, as we start out of the lib directory
		}

		const asNew = this.__proto__.constructor === require && ((...args) => new (Function.prototype.bind.apply(modules[packageName].exports, args)));

		path = path || directory;
		const packageName = (path + field).replace(/[^a-z0-9]/gi, '_').toLowerCase();

		if (field.hasOwnProperty('endsWith') && field.endsWith('.json')) { // Simply reads a json file
			return modules[packageName] = File.open('libs/' + path + field, 0).readAllLines();
		}

		const fullpath = (path + field).replace(/\\/,'/');
		const moduleNameShort = (fullpath + '.js').match(/.*?\/(\w*).js$/)[1];

		if (!isIncluded(fullpath + '.js') && !modules.hasOwnProperty(moduleNameShort)) {
			depth && notify && print('ÿc2Kolbotÿc0 ::    - loading dependency of '+filename+': ' +moduleNameShort);
			!depth && notify && print('ÿc2Kolbotÿc0 :: Loading module: ' + moduleNameShort);

			let old = Object.create(global['module']);
			delete global['module'];
			global['module'] = {exports: undefined};

			// Include the file;
			try {
				depth++;
				if (!include(fullpath + '.js')) {
					throw Error('module ' + fullpath + ' not found');
				}
			} finally {
				depth--
			}

			modules[moduleNameShort] = Object.create(global['module']);
			delete global['module'];

			global['module'] = old;
		}

		if (!modules.hasOwnProperty(moduleNameShort)) throw Error('unexpected module error -- ' + field);

		// If called as "new", fake an constructor
		return asNew || modules[moduleNameShort].exports;
	};
	obj.modules = modules;
	return obj;
})(include, isIncluded, print, getScript(true).name.toLowerCase().split('').reverse().splice(0, '.dbj'.length).reverse().join('') === '.dbj');

getScript.startAsThread = function () {
	let stack = new Error().stack.match(/[^\r\n]+/g),
		filename = stack[1].match(/.*?@.*?d2bs\\kolbot\\(.*):/)[1];

	if (getScript(true).name.toLowerCase() === filename.toLowerCase()) {
		return 'thread';
	}

	if (!getScript(filename)) {
		load(filename);
		return 'started';
	}

	return 'loaded';
};