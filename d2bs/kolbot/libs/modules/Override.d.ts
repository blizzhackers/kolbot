// Hand-written types for the tsc-emitted UMD in Override.js: its wrapper does
// `var v = factory(require, exports); if (v !== undefined) module.exports = v;` and the
// factory returns nothing, so TS types the whole module `void` and `.Override` becomes
// unresolvable at require() sites. A sibling .d.ts wins CJS resolution and restores typing.

type OverriddenFn = (...args: unknown[]) => unknown;

/**
 * Replaces `target[key]` with a wrapper that invokes `method`, passing the original
 * function (bound to `this`) as the first argument, followed by the call's own arguments.
 */
export class Override<T extends object = object> {
  constructor(
    target: T,
    /** The original member function itself, or its key on `target`. */
    original: OverriddenFn | string,
    method: (original: OverriddenFn | undefined, ...args: unknown[]) => unknown,
  );
  target: T;
  original: OverriddenFn | undefined;
  key: string | undefined;
  method: (original: OverriddenFn | undefined, ...args: unknown[]) => unknown;
  /** Installs the wrapper onto `target[key]`. */
  apply(): void;
  /** Restores the original member (or deletes the key when there was none). */
  rollback(): void;
  static all: Override[];
}
