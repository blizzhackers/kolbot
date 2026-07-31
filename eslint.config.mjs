/**
 * Flat config for kolbot (migrated from .eslintrc.js, ESLint 7 -> 10).
 *
 * The runtime is D2BS's SpiderMonkey 24 — ES5 plus a PARTIAL, probe-verified slice of ES2015.
 * Strategy: parse as modern JS (superset), then forbid what the engine rejects via
 * eslint-plugin-es-x + no-restricted-syntax. The support matrix comes from an in-game probe
 * (`.probe` in DeveloperMode -> logs/EngineProbe.txt); re-run it before loosening any ban here.
 */
import js from "@eslint/js";
import stylistic from "@stylistic/eslint-plugin";
import esX from "eslint-plugin-es-x";
// Generated no-undef inventory: declare-global values from the .d.ts layer + top-level
// declarations from every runtime file (the include() architecture makes those cross-file
// globals). Regenerate with `npm run globals:gen` after adding globals or renaming top-level
// symbols. This replaced the old 90-name hand list, 4 entries of which were dead or wrong
// (td/UtilitySystem/Items unused, handler was only ever a property).
import d2bsGlobals from "./eslint.globals.mjs";

export default [
  {
    ignores: [
      "node_modules/**",
      "d2bs/kolbot/data/**",
      "d2bs/kolbot/logs/**",
      "**/*.d.ts",
      "**/*.ts",
      // Node-land tooling, not D2BS dialect (tsserver plugin, generators)
      "tools/**",
    ],
  },
  {
    files: ["**/*.js", "**/*.dbj"],
    plugins: { "@stylistic": stylistic, "es-x": esX },
    languageOptions: {
      // Parse the full modern grammar; the engine's real ceiling is enforced by rules below,
      // which produce per-construct messages instead of parser errors.
      ecmaVersion: "latest",
      sourceType: "script",
      parserOptions: { ecmaFeatures: { impliedStrict: true } },
      globals: d2bsGlobals,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...esX.configs["flat/restrict-to-es2015"].rules,

      // ---- SpiderMonkey 24 dialect guard (probe-verified 2026-07-30) ----
      // ES2015 features the engine does NOT implement; restrict-to-es2015 allows them, so ban explicitly.
      "es-x/no-classes": "error",
      "es-x/no-template-literals": "error",
      "es-x/no-property-shorthands": "error",
      "es-x/no-computed-properties": "error",
      "es-x/no-generators": "error",
      "es-x/no-symbol": "error",
      // Proxy is NOT banned: SpiderMonkey has direct proxies since FF18 and working code relies
      // on them (libs/Polyfill.js env store, modules/LazyLoader.js, modules/Worker.js). Reflect is FF42 - banned.
      "es-x/no-proxy": "off",
      "es-x/no-reflect": "error",
      // Engine-rejected constructs with no dedicated es-x rule (es-x/no-spread-elements would
      // also ban array-literal spread, which the engine supports — so target positions instead).
      "no-restricted-syntax": ["error",
        { selector: "CallExpression > SpreadElement", message: "SM24: no spread in calls - use fn.apply(null, [x, ...arr])." },
        { selector: "NewExpression > SpreadElement", message: "SM24: no spread in new-expressions." },
        { selector: "ObjectPattern > Property > AssignmentPattern", message: "SM24: no default values inside destructuring patterns." },
        { selector: "ArrayPattern > AssignmentPattern", message: "SM24: no default values inside destructuring patterns." },
        { selector: "ForOfStatement > VariableDeclaration[kind='const']", message: "SM24: const can't bind a for-of head - use let." },
        { selector: "ForInStatement > VariableDeclaration[kind='const']", message: "SM24: const can't bind a for-in head - use let." },
      ],
      // ES2016+ library members provided by libs/Polyfill.js — this disable-list is the
      // machine-checked contract of what the polyfill covers.
      "es-x/no-array-prototype-includes": "off",
      "es-x/no-string-prototype-padstart-padend": "off",
      "es-x/no-object-entries": "off",
      "es-x/no-object-values": "off",
      "es-x/no-array-prototype-flat": "off",
      "es-x/no-object-hasown": "off",
      "es-x/no-array-prototype-at": "off",
      "es-x/no-string-prototype-at": "off",
      "es-x/no-array-prototype-toreversed": "off",
      "es-x/no-array-prototype-tosorted": "off",
      "es-x/no-array-prototype-tospliced": "off",
      "es-x/no-array-prototype-with": "off",
      "es-x/no-set-prototype-union": "off",
      "es-x/no-set-prototype-intersection": "off",
      "es-x/no-set-prototype-difference": "off",
      "es-x/no-set-prototype-symmetricdifference": "off",
      // Not a polyfill entry but a project idiom: Polyfill.js REPLACES Map.prototype.keys/values
      // to return plain Arrays, so `map.keys().filter(...)` is legal here and this rule misreads it
      // as an ES2025 iterator helper.
      "es-x/no-iterator-prototype-filter": "off",

      // ---- house style (ported 1:1 from .eslintrc.js; formatting rules -> @stylistic) ----
      // SwitchCase MUST stay 0: @stylistic defaults to 1, ESLint core defaulted to 0.
      "@stylistic/indent": ["warn", 2, { SwitchCase: 0 }],
      "@stylistic/linebreak-style": "off",
      "@stylistic/semi": ["error", "always"],
      "@stylistic/comma-spacing": ["error", { before: false, after: true }],
      "@stylistic/keyword-spacing": ["error", { before: true, after: true }],
      "@stylistic/object-curly-spacing": ["error", "always"],
      "@stylistic/brace-style": ["error", "1tbs", { allowSingleLine: true }],
      "@stylistic/space-infix-ops": "error",
      "@stylistic/space-unary-ops": ["error", { words: true, nonwords: false }],
      "@stylistic/arrow-spacing": "error",
      "@stylistic/space-before-blocks": "error",
      "@stylistic/key-spacing": ["error", { mode: "strict", beforeColon: false, afterColon: true }],
      "@stylistic/no-mixed-spaces-and-tabs": "error",
      "@stylistic/no-trailing-spaces": ["warn", { ignoreComments: true, skipBlankLines: true }],
      "@stylistic/no-whitespace-before-property": "error",
      "@stylistic/comma-style": ["error", "last"],
      "@stylistic/eol-last": ["error", "always"],
      "@stylistic/no-floating-decimal": "error",
      "@stylistic/no-multi-spaces": ["error", { ignoreEOLComments: true }],
      "@stylistic/quotes": ["warn", "double", { avoidEscape: true }],
      "@stylistic/max-len": ["warn", { code: 120, ignoreComments: true, ignoreUrls: true, ignoreStrings: true }],

      "arrow-body-style": ["error", "as-needed"],
      "block-scoped-var": "error",
      "no-var": "warn",
      "curly": ["error", "multi-line"],
      "dot-notation": "warn",
      "eqeqeq": ["error", "smart"],
      "no-caller": "error",
      "no-self-compare": "error",
      "no-case-declarations": "off",
      "no-with": "error",
      "no-shadow": "off",
      "no-use-before-define": "off",
      "no-prototype-builtins": "off",
      "no-constant-condition": ["error", { checkLoops: false }],
      "no-extra-label": "error",
      // caughtErrors "none" preserves the ESLint 7 semantics (v9 flipped the default to "all").
      "no-unused-vars": ["warn", { vars: "local", varsIgnorePattern: "^_", caughtErrors: "none" }],
      "no-fallthrough": ["error", { commentPattern: "break[\\s\\w]*omitted" }],
      // warn during adoption: the rule was off for the config's whole prior life, so first-run
      // volume is a findings queue, not a gate. Escalate to error once triaged.
      "no-undef": "warn",
      "no-extra-boolean-cast": "off",
      "no-useless-escape": "off",
      // builtinGlobals false: Polyfill.js's `var global = ...` detection idiom must not clash
      // with the declared `global` in languageOptions.globals.
      "no-redeclare": ["error", { builtinGlobals: false }],

      // ---- new-in-v10 signal, kept visible as warnings during migration ----
      // Real findings queue (63/25/9/4 hits at migration time) - triage over time, then escalate.
      "no-useless-assignment": "warn",
      "preserve-caught-error": "warn",
      "no-constant-binary-expression": "warn",
      "no-shadow-restricted-names": "warn",
    },
  },
  {
    // Character/manualplay config files use deliberate hand-formatting - hanging indentation
    // (Config.X.* settings nested under their Scripts.X toggle) and tab-aligned assignment
    // columns - for end-user readability. Do not flatten or de-align it.
    // This replaces the per-file `eslint-disable indent` comments the old setup relied on.
    files: [
      "d2bs/kolbot/libs/config/**/*.js",
      "d2bs/kolbot/libs/manualplay/config/**/*.js",
    ],
    rules: {
      "@stylistic/indent": "off",
      "@stylistic/no-multi-spaces": "off",
    },
  },
];
