export {};
declare global {
  type CommonModuleName = "Ancients" | "Baal" | "Cain" | "Cows" | "Diablo" | "Leecher" | "Smith" | "Toolsthread";

  // Value shape of the global `Common` const in Common.js (bound there via JSDoc @type).
  // Declaring the const here as well would collide: both files are global scripts.
  // Common.js is a LazyLoader(modulePathMap) proxy - each module name below is a lazily
  // require()d getter, and `load` is the same lazy access exposed as an explicit call.
  // Ambient value declaration (Skill/Attack/Misc precedent): the checker leaves some
  // @type-bound js consts unresolved or any (cause undiagnosed); the ambient const
  // restores resolution and empirically does not collide with the js declaration.
  const Common: Common;

  interface Common {
    load<K extends CommonModuleName>(moduleName: K): Common[K];

    Ancients: typeof import("../../libs/core/Common/Ancients");
    Baal: typeof import("../../libs/core/Common/Baal");
    Cain: typeof import("../../libs/core/Common/Cain");
    Cows: typeof import("../../libs/core/Common/Cows");
    Diablo: typeof import("../../libs/core/Common/Diablo") & EventsInstance;
    Leecher: typeof import("../../libs/core/Common/Leecher");
    Smith: typeof import("../../libs/core/Common/Smith");
    Toolsthread: typeof import("../../libs/core/Common/Tools");
  }
}
