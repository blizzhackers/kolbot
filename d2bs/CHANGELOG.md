# Changelog

All notable changes to D2BS are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions follow [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Versions up to 1.6.4 have no section here; their history is in the git log, and 1.6.4 is tagged `v1.6.4`.

Each release candidate (1.7.0-rc.1, 1.7.0-rc.2, ...) has its own section, listing what changed since the release before it; the final release brings them together in one section.

## [Unreleased]

## [1.7.0] - 2026-11-13

### Added

- **`clearAllTimers()`** cancels every timer of the calling script, including an interval whose callback is running, and returns how many it cancelled.
- **Timer arguments.** `setTimeout(fn, delay, ...args)` and `setInterval(fn, delay, ...args)` pass their extra arguments to the callback.
- **Crash details in the log.** When the game crashes, the D2BS log records the exception with its registers and every thread's stack, and the game ends with the real exception code, so Windows Error Reporting can write a dump of it. A stack overflow, which leaves no stack to work with, goes to Windows Error Reporting directly.
- **Packet logs.** When the game crashes (except from a stack overflow) or halts on one of its own error checks, D2BS writes the last 512 game packets sent and received to its `logs` folder as `crash-<profile>-<time>-<pid>.packets.txt`.
- **Halt dumps on request.** With `HaltDumps=true` in `d2bs.ini`, a halt also writes a memory dump beside its packet log, as `.dmp`. A dump can hold account details, so share it privately.
- **Bounded crash files.** The `logs` folder, shared by every profile, keeps at most 5 dumps (a few hundred MB each) and 50 packet logs, deleting the oldest first, and D2BS skips the dump when the disk has less than 2 GB free.
- **Debug symbols with every release.** `D2BS.pdb` ships beside `D2BS.dll`, so a crash or halt dump shows D2BS's own functions.
- **Build identity.** `version()`, the startup log line and the DLL's file properties name the commit the DLL was built from, for example `1.7.0U (7c036ba)`; the on-screen logo shows the version alone.

### Changed

- **Fast game exits.** Leaving a game takes a fraction of a second, even right after a run through crowded areas: D2BS lets the game load its graphics at full disk speed instead of a fixed 256 KB/s.
- **`setInterval(fn, 0)` repeats.** A zero period makes a repeating timer, like any other period; use `setTimeout()` for a single call.
- **One call at a time per interval.** An interval whose callback is still running, for example inside `delay()`, is not started again on top of it, and periods missed while the script was busy give one call.
- **Timers outlive `clearAllEvents()`.** Timers stop with `clearTimeout()`, `clearInterval()`, `clearAllTimers()` or the end of their script.
- **Safer dialog lines.** A line from an earlier `getDialogLines()` runs its handler only while it is one of the open dialog's lines, and otherwise throws "That dialog is not currently clickable."
- **Game actions don't wait for other scripts' sent-packet listeners.** A packet sent from inside a call that acts between game frames, such as `clickMap()`, `me.cancel()`, `clickItem()`, `item.shop()`, `transmute()` or `clickParty()`, reaches other scripts' `gamepacketsent` listeners without waiting for their answer, so they can't block it and the game keeps running; the calling script's own listeners still can.
- **Each listener once per event.** `addEventListener()` with a function already listening to that event leaves it as it is, as in a browser, so the function runs once per event and one `removeEventListener()` call removes it.
- **`getTickCount()` keeps counting.** It counts on past 4,294,967,295 ms (49.7 days of Windows uptime), so time differences in scripts stay right however long Windows has run, and `me.gamestarttime` uses the same clock. On Windows XP it still starts again from 0.

### Fixed

- **Reliable timers.** Each timer calls only its own callback, once per firing, and scripts can set and clear timers, their own or each other's, at the same time.
- **Any timer delay works.** `setTimeout()` and `setInterval()` accept fractional delays such as `1.5`, and a negative or NaN delay fires at once.
- **Scripts end with their game.** A stopped script, or one whose game has ended, ends even when that happens during one of its timer callbacks or event handlers, and frees its thread, memory and timers.
- **Safe slow listeners.** A key, chat, packet or screen-hook click listener that runs past its time limit (1 s for keys, 0.5 s for chat and packets, 3 s for clicks) lets the event through, and the game and the script carry on.
- **Steadier shopping, cubing and walking.** `me.cancel()`, `unit.useMenu()`, `unit.interact()` (except on an item the player holds, which only sends a packet), `unit.move()`, `clickMap()`, dialog-line handlers, `transmute()` and the inventory setup on joining a game act between game frames, so bots that shop, gamble, cube and walk keep running.
- **Area lookups keep the game running.** `getArea()` and its properties such as `exits`, `getRoom()`, `getPresetUnit()`, `getPresetUnits()`, `getPath()` and `getCollision()` called while the game changes areas or leaves a game let the game carry on drawing.
- **Stable Act 5 wilderness.** Frigid Highlands, Arreat Plateau, Frozen Tundra and the other Act 5 outdoor areas build reliably in every game, whether the character walks in, takes a waypoint or a script looks up a room there with `getRoom()`.
- **Long sessions keep running.** The game keeps loading monster and character graphics hour after hour, including while a bot crosses one crowded area after another.
- **Stable memory pools.** The game's memory pools stay consistent while several threads use them at once, so bots keep running game after game.
- **Safe with sound on.** Bots that play with sound keep running while the game starts and stops its music and other streamed sounds.
- **PCs that stay on for weeks.** Single-player games keep running however long Windows has been up.
- **Folder listings release their handles.** `dopen().getFiles()` and `getFolders()` close their folder search when done, so scripts can list folders as often as they like without adding to the game's handle count.
- **Safe unit lookups.** Finding a unit by its id answers "not found" for a unit the game has just freed, as for any unit that's gone.
- **Dependable `getPlayerFlag()`.** It returns `true` or `false`, so `=== true` works, answers for players anywhere in the game rather than only those nearby, and is safe to call while a game closes.
- **Safe party objects.** A `Party` object from `getParty()` follows its player: once that player leaves the game, or the game ends, its properties read `undefined`, `getNext()` returns `false` and `clickParty()` returns `false`, even when a later game gives another player the same id. `clickParty()` acts between game frames, `clickParty(player, 3)` leaves your party whichever player in the game you pass, and `getParty()` returns `undefined` for anything that doesn't name a player, such as a monster unit or `null`.
- **Missile casters.** A missile's `getParent()` returns the unit that cast it, or undefined when the caster is out of sight; `missile.owner` and `missile.ownertype` still give its id and type.
- **Independent Battle.net version checks.** Each game process uses its own temporary directory for the revision DLL, so profiles can verify their game version concurrently.
- **Large file writes.** `FileTools.writeText()`, `FileTools.appendText()` and `file.write()` save text of any size.
- **Binary number writes.** `file.write()` on a file opened in binary mode saves each number's value, with or without file locking.
- **Dependable file reads, seeks and closes.** `FileTools.readText()` throws when reading the file fails, a `File` whose `close()` throws is closed and can be reopened, `file.seek(n)` on a file opened with locking moves `n` bytes, and a binary `file.read(count)` returns 0 for each value past the end of the file and frees its memory when done.
- **Steady memory for busy bots.** Every event a listener receives and every `getPath()` call frees the memory it used, so bots that trade many chat, `copydata` and script messages keep a steady footprint over long runs.

[Unreleased]: https://github.com/blizzhackers/d2bs/compare/v1.7.0...HEAD
[1.7.0]: https://github.com/blizzhackers/d2bs/compare/v1.6.4...v1.7.0
