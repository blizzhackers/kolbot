export class Override<T extends object, M extends ((...args: any) => any)> {

    public readonly target: T;
    public readonly key: string|number|symbol;
    public readonly original?: M;
    public readonly method;

    static readonly all: Override<object, (...args: any) => any>[] = [];

    constructor(target: T, original: M|keyof T, method: (this: T, original: M, ...args: any) => any) {
        this.target = target;
        if (typeof original !== 'string') {
            this.original = original as M;
            this.key = Object.keys(target).find(key => target[key] === original);
        } else {
            this.original = undefined;
            this.key = original as keyof T;
        }
        this.method = method;

        Override.all.push(this);
    }

    apply() {
        const {target, key, method, original} = this;
        target[key] = function (...args) {
            return method.apply(this, [original && original.bind(this), ...args]);
        };
    }

    rollback() {
        const {target, key, original} = this;
        if (original) {
            target[key] = original;
        } else {
            delete target[key];
        }
    }
}