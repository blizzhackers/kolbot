// Orphan check: every runtime .js on disk should belong to a TypeScript program.
//
// A file in NO program is invisible to tsc and gets no editor intellisense at all - it becomes a
// "loose file" in an inferred project with no ambient globals. Nothing else detects this: tsc
// cannot report on a file it never loaded, and eslint does not care about programs. It bit us
// once for real (libs/SoloPlay/Core/ClassAttackOverrides/, orphaned when the root project began
// excluding the submodule while the submodule's own tsconfig still excluded that directory).
//
// Run after ANY tsconfig include/exclude edit.
//   node tools/audit/program-files.mjs [--check]
import { execFileSync } from "node:child_process";
import { join, relative } from "node:path";
import { KOLBOT, REPO, SOLOPLAY, gitFiles, finish } from "./lib.mjs";

// .dbj entry scripts are deliberately absent from `tsc --listFilesOnly`: tsc rejects unknown
// extensions (TS6054), so they reach the editor's program only through the kolbot-ts-plugin's
// getExternalFiles hook, which tsserver runs and tsc does not. Their absence here is correct.
const PROJECTS = [
  { name: "root", cwd: REPO, sources: { cwd: KOLBOT, patterns: ["**/*.js"] } },
  { name: "SoloPlay", cwd: SOLOPLAY, sources: { cwd: SOLOPLAY, patterns: ["**/*.js"] } },
];

/** Absolute file list a project's compiler actually loads. */
function programFiles(cwd) {
  // npx resolves through a shim on Windows; call the compiler entry point directly so no shell
  // is involved (shell:true concatenates rather than escapes arguments).
  const tsc = join(REPO, "node_modules", "typescript", "bin", "tsc");
  const out = execFileSync(process.execPath, [tsc, "--noEmit", "--listFilesOnly"], {
    cwd,
    encoding: "utf8",
    maxBuffer: 256 * 1024 * 1024,
  });
  return new Set(out.split(/\r?\n/).filter(Boolean).map((p) => p.replace(/\\/g, "/").toLowerCase()));
}

let failures = 0;
for (const project of PROJECTS) {
  let inProgram;
  try {
    inProgram = programFiles(project.cwd);
  } catch (e) {
    console.error(`${project.name}: could not list program files - ${e.message.split("\n")[0]}`);
    failures++;
    continue;
  }
  // The root project deliberately excludes the SoloPlay submodule (it is its own program), so
  // its files are not orphans from root's perspective - the SoloPlay project below owns them.
  const skipSoloPlay = project.name === "root";
  const onDisk = gitFiles(project.sources.cwd, project.sources.patterns)
    .map((p) => `${project.sources.cwd.replace(/\\/g, "/")}/${p}`)
    .filter((p) => !skipSoloPlay || !p.toLowerCase().includes("/libs/soloplay/"));

  const orphans = onDisk.filter((p) => !inProgram.has(p.toLowerCase()));
  console.log(`${project.name}: ${onDisk.length} runtime files on disk, ${orphans.length} orphaned`);
  for (const o of orphans.slice(0, 25)) console.log(`   ORPHAN ${relative(REPO, o).replace(/\\/g, "/")}`);
  if (orphans.length > 25) console.log(`   ... and ${orphans.length - 25} more`);
  failures += orphans.length;
}

finish(failures, "program-files");
