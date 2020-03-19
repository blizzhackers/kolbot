/**
 * @description Diffie–Hellman key exchange
 */

"use strict";
module.exports = (function () {
	var privateKeys = [];
	var SymbolPriv = Symbol('test');

	function KeyExchange(privKey, prime, ground) {
		this[SymbolPriv] = privateKeys.push(privKey) - 1;
		this.prime = prime;
		this.ground = ground;
	}

	KeyExchange.prototype.sharedSecret = function (othersPub) {
		var priv = privateKeys[this[SymbolPriv]];
		return (Math.pow(othersPub, priv) % this.prime);
	};

	Object.defineProperty(KeyExchange.prototype, "myPub", {
		get: function () {
			var priv = privateKeys[this[SymbolPriv]];
			return Math.pow(this.ground, priv) % this.prime;
		},
		enumerable: true,
		configurable: true
	});

	return KeyExchange;
})();


// Example code
if (false) {
	// require itself
	const DiffieHellman = require('./SharedSecret');

	// https://en.wikipedia.org/wiki/Diffie%E2%80%93Hellman_key_exchange
	const Alice = new DiffieHellman(6, 23, 5);
	const Bob = new DiffieHellman(15, 23, 5);

	const A = Alice.myPub;
	const B = Bob.myPub;


	const sharedSecret = Bob.sharedSecret(A);

	sharedSecret === 2; // true

	Alice.sharedSecret(B) === Bob.sharedSecret(A); // true

	// meaning you can use sharedSecret as a key, both Alice/Bob can run somewhere else
}

