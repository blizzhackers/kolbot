declare const SharedSecret: {
    new <T extends number | bigint = bigint>(privKey: T, prime: T, ground: T): {
        prime: T;
        ground: T;
        sharedSecret(othersPub: T): T;
        readonly myPub: T;
    };
};
export = SharedSecret;
