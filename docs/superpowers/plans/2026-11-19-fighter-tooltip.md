# Fighter Tooltip Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show, on hover of a fighter or its portrait, a PixiJS tooltip with its state at instant T (life, energy, status, custom stats sent by a new `Stats` action).

**Architecture:** The validated spike is the base. `Fighter` keeps its custom stats and exposes `getState()`; `History` handles `Action.Stats`; `Scene` owns one `FighterTooltip` (layer DEBUG) refreshed every frame; `Fight.getFighterState(fid)` exposes the state. Types are hand-written in `src/types/`.

**Tech Stack:** PixiJS 7, plain JS with `// @ts-check`, hand-written `.d.ts`, `tsc` for type tests.

**Spec:** `docs/superpowers/specs/2026-11-19-fighter-tooltip-design.md`

## Global Constraints

- Action value: `Stats: 32`. Shape: `{ action: 'Stats', fighters: [{ fid, stats: { [label]: string | number | null } }] }`; `null` removes a stat; labels displayed as is, insertion order.
- Tooltip lines: name, `Vie : x / max`, `Énergie : x / max` (translated via `Lang.js`, fr + en, fallback en), custom stats, then `Statuts : ...`.
- Tooltip stays inside 488×300, is not interactive, never changes `onFighterClick` behavior.
- `getMTFormat()` skips `Stats` without console error.
- No new dependency; no JS test runner is added (the project has none).

## Review Focus

- Hover a fighter, then `seek` backward (scene rebuilt): the tooltip of the destroyed fighter must disappear, no exception. → Task 1 step 3 check.
- Fighter dies or escapes while hovered: tooltip disappears once the fighter is deleted. → covered by `isDeleted` check, Task 1 step 3.
- `Stats` for an unknown `fid`: console error, history continues (same as `Energy`). → Task 1 step 3 check.
- `getMTFormat()` on a history containing `Stats`: no error logged. → Task 1 step 3 check.
- Very long label/value: wraps at 180 px, tooltip clamped in the canvas. → Task 1 step 3 check (`Assaut` line of the demo).

---

### Task 1: Runtime (finalize the spike)

**Files:**
- Create: `src/fight/parts/text/FighterTooltip.js` (from spike)
- Modify: `src/fight/Enums.js`, `src/fight/Fighter.js`, `src/fight/History.js`, `src/fight/Scene.js`, `src/fight/IScene.js`, `src/fight/Fight.js`, `src/fight/settings/Lang.js`, `src/fight/data/MTConverter.js`, `src/fight/data/DAConverter.js` (if it rejects unknown actions), `public/fight.js`

**Interfaces:**
- Produces: `Fighter#getState(): { fid, name, side, alive, life, maxLife, energy, maxEnergy, status: number[], stats: Record<string, string|number> }`, `Fighter#setStats(stats)`, `Fight#getFighterState(fid)`, `Action.Stats = 32`.

- [ ] **Step 1:** In `MTConverter.convertHistory` (line ~107), skip `Action.Stats` silently before the unknown-action error.
- [ ] **Step 2:** On `Scene._buildScene` rebuild (seek backward) the old Scene is destroyed: make sure `FighterTooltip` of the old scene is not referenced anymore (it is owned by the Scene, so nothing to do — verify).
- [ ] **Step 3: Verify in the demo** (headless Puppeteer script in the scratchpad): hover dino, portrait, monster after `seek` to the end; `seek(0)` while hovered; `getMTFormat()` on the Tooltip demo; a `Stats` with `fid: 99`. Expected: tooltips as in the spike screenshots, no exception, only the `Stats Error` for fid 99.
- [ ] **Step 4:** `npx tsc -p tsconfig.json --noEmit` shows no error in `src/fight`; `npx eslint --rule 'linebreak-style: off'` clean on touched files.
- [ ] **Step 5: Commit** `Add a tooltip showing the state of the hovered fighter`.

### Task 2: Types and documentation

**Files:**
- Modify: `src/types/enums.d.ts` (`Stats: 32`), `src/types/fight.d.ts`, `test/types/usage.ts`, `src/fight/README.md`

**Interfaces:**
- Consumes: Task 1 runtime names.
- Produces: `StatsAction`, `FighterStats` (`{ fid: number; stats: Record<string, string | number | null> }`), `FighterState`, `Fight#getFighterState(fid: number): FighterState | undefined`.

- [ ] **Step 1: Write the type tests** in `test/types/usage.ts`:
  - `{ action: Action.Stats, fighters: [{ fid: 0, stats: { Initiative: 12, Vitesse: '100 %', Armure: null } }] }` is a valid `FightAction`.
  - `// @ts-expect-error` on `{ action: 'Stats', fighters: [{ fid: 0, stats: { Initiative: true } }] }`.
  - `fight.getFighterState(0)?.stats.Initiative satisfies string | number | undefined` and `?.status satisfies FighterStatus[]`.
- [ ] **Step 2:** `npm run -s types:check` → FAIL (`Stats` unknown).
- [ ] **Step 3:** Add the declarations.
- [ ] **Step 4:** `npm run -s types:check` → PASS.
- [ ] **Step 5:** README: `Stats (32)` under "New Actions" (property table + null removal + translated labels) and a "Tooltip" paragraph + `getFighterState` in the Fight API part.
- [ ] **Step 6: Commit** `Type and document the Stats action and getFighterState`.
