---
title: 'Building Stowline: a 3D stowage planner, spec first'
excerpt: 'How a container stowage planner went from a PRD and a clickable prototype to a deployed 3D app in 90 commits, and why the documents mattered more than the code.'
tags: ['architecture', 'three.js', 'testing', 'accessibility']
status: published
publishedAt: '2026-10-08'
updatedAt: '2026-10-08'
---

I work on software for ships, and stowage planning has a problem that is easy to state: most mistakes are found late. A container for Colombo ends up under one for Rotterdam. A stack is heavier than the deck can hold. A reefer sits in a slot with no power plug. Nobody notices until the plan is finished and checked, and by then fixing it means replanning under a terminal cut-off.

So I built **Stowline**, a stowage planner with one idea at its centre: *catch the mistake at the moment of placement, not after.* You drag a container onto a ship in 3D or in a 2D bay grid. Before you let go, every slot is marked valid, warning or invalid, with the reason. A drop that breaks a rule is refused and the container goes back.

Here is one full port call, from the plans list to an approved plan:

![Walkthrough: one port call at Singapore, from the plans list to an approved, locked plan (1:59)](/assets/stowline/walkthrough.mp4 "/assets/stowline/walkthrough-poster.jpg")

You can [try the live demo](https://stowline.vercel.app/plans), and read the two decks I wrote before any code: the [pitch](/assets/stowline/stowline-pitch.pdf) (who it is for and why) and the [system logic and data model](/assets/stowline/stowline-system-logic.pdf) (the ERD, the 17 business rules, the rule engine, the stability model and the API).

## I wrote the documents before the code

The expensive bugs usually aren't in the code. They're in the gap between what someone meant and what someone built. So I wrote three things first.

**A PRD that explains why.** Who the users are (vessel planner, senior planner, terminal planner, chief officer), the 12 steps of a port call, and what success would look like.

**An SRS that decides what.** Every functional requirement and every performance target has an id, like FR-34 or NFR-02, so a commit, a test and a measurement can all point at the same line. The 17 business rules live here too, with the exact result when one is broken. For example: "A container is not more than 10.0 t heavier than the one below it" gives a warning, not an error.

**A clickable prototype** of the screens, with a small rule engine and sample data inside it. It was useful, and it was also wrong in useful ways. More on that below.

The best single decision in the SRS was a **golden fixture**. The seeded sample plan, MV Nusantara Pioneer at Singapore with 2,740 containers on board, must always produce exactly 7 violations: 6 errors and 1 warning, in named slots. That one fact became the main regression test. Any change that moved that number was wrong until proven otherwise.

## One milestone at a time

I split the build into eight milestones, each with a gate it had to pass:

1. **M0 Foundation:** Vite, strict TypeScript, lint, tests, CI, design tokens, the data model.
2. **M1 Rule engine:** the six rules, the placement check, commands with inverses, the stability model.
3. **M2 Workspace panels:** load list, bay view, inspector, stability strip.
4. **M3 3D view:** the ship, instanced containers, camera presets, picking.
5. **M4 Placement:** drag, click and keyboard, undo and redo.
6. **M5 Violations, stability drawer, port playback.**
7. **M6 Plans and workflow:** the mock API, versions, roles, review and approval.
8. **M7 Quality:** an accessibility audit, a profiler pass, flaky tests, CI and deploy.

I kept a short list of working rules at the root of the repo and held myself to it on every milestone. Two of them did more work than all the others: *"docs/SRS.md decides; if it disagrees with the PRD, stop and ask"* and *"Never report a number you did not measure."* Each milestone ended with a written report against its gate: what was built, which requirement ids were done, what was not done. Then I stopped and reviewed it before starting the next one. Most of the real work was deciding what the product should do when the documents ran out.

They ran out often. The build notes record 17 numbered decisions. One example: the SRS said only the top container of a stack can be moved, but Apply fix for an overstow needs to swap containers in the middle of a stack. Decision D2: swap is exempt from the top-only rule but still respects locks, and a multi-step fix runs as one `batch` command that undoes as one unit. Writing these down as they happened is the only reason I can explain the system now.

## The prototype was useful, and wrong in twelve places

Before writing any code, I checked the prototype against the "from prototype to production" section of the SRS. Every suspicion was confirmed, with a line number:

- The 3D view repainted every box on every frame and picked containers with a point-in-polygon test.
- Undo stored a full copy of the plan per step.
- Every move re-checked the whole ship.
- Swap and Apply fix skipped the rule check entirely, so a "fix" could create a new error.
- Containers already on board from earlier ports could be moved for free, with no restow counted.

None of this was visible in a demo. All of it would have shown up at 10,000 containers or in the first real review. The prototype told me what the screens should *do*. It did not tell me how to build them.

## The domain is plain TypeScript

Everything that knows about ships lives in `src/domain`: geometry, the six rules, commands, stability. It has no imports from React, three.js or the DOM, and a lint rule fails the build if one sneaks in. It is type-checked a second time on its own, with no DOM types available at all.

That boundary paid for itself many times over:

**Every change is a command with an inverse.** Place, move, unplace, swap, lock, and a batch of those. History stores commands, not copies of the plan. A property test with fast-check runs random command sequences and checks that a command followed by its inverse returns the exact same plan.

**Only the changed stacks are re-checked.** After a move, the engine re-validates the touched stacks and their neighbours, since dangerous-goods segregation crosses bays. A second property test proves that incremental validation always equals full validation. On a 10,000-container benchmark ship, one move with its rule check takes 1.6 ms on average. The full check runs in a Web Worker through Comlink, in 17 to 26 ms, without blocking the page.

**Stability is recalculated, never accumulated.** GM, trim, list, drafts, bending moment and shear force come from one pure function over the whole plan, summed in slot order. The same plan gives the same numbers to the last bit, whatever sequence of commands and undos led to it. The drag preview is the same function run on the plan plus the candidate move.

The domain ended at 99.4% line coverage, and that number is a side effect, not the goal. Pure functions are just easy to test.

## The 3D view is a performance problem first

The target was 55 fps while orbiting a ship with 10,000 containers, on a mid-range laptop. The rules I set for the 3D view, before writing it:

- **One `InstancedMesh` per container size.** The whole ship draws in 10 to 12 draw calls. A move rewrites 2 instances and a swap rewrites 4. Nothing else is touched.
- **No React render on pointer move.** Hover runs one raycast per animation frame, reads the `instanceId`, and writes the outline and tooltip directly. An end-to-end test sweeps the pointer across the ship and counts React commits: zero.
- **Render on demand.** When nothing moves, the GPU rests.
- **Fail safe.** No WebGL 2, a renderer that throws, a lost context: each one shows a fallback that points to the bay grid, where every action still works.

Exact colours took some care. React Three Fiber turns on tone mapping by default, which shifts every port-of-discharge colour away from the design. The canvas runs `flat` with unlit materials, and face shading is baked into the vertex colours so the result matches the CSS values.

## One state machine for three ways of moving a container

A planner can drag with the mouse, click to pick up and click to place, or do the whole thing from the keyboard. Early on I decided these could not be three implementations. They would drift apart within a week.

So there is one pure controller: `step(state, event, plan)` returns the next state, and maybe a command, an announcement or a refusal. Pointer drag, keyboard and the 3D view all send it the same events. A refused drop is the same refusal, with the same reason, however you tried to make it.

I used pointer events rather than HTML5 drag and drop. Native drag and drop behaves differently across browsers and is unreliable to test in WebKit, and pointer events give one path for the load list, the bay grid and the 3D canvas. The SRS gave a 100 ms budget from pick-up to the valid and invalid marks appearing. On the production build the median is 12.5 ms.

## Accessibility found real problems in the design

The keyboard path was not an afterthought. WCAG 2.2 asks that anything done by dragging can also be done without dragging, and for a planning tool that is also just good for experts who live on the keyboard. A test places a container using only keys: search, arrow to the row, Enter to pick up, arrows through the bay, Enter to place.

The audit also caught things in the approved design itself. A pressed toolbar button measured 4.49:1 contrast, just under the 4.5:1 that AA needs. A row "in hand" faded to 55% opacity, which dropped its text to 2.96:1. Four controls were under the 24 px target size. Each finding went to a decision with the fix, and none needed a design token to change. Lighthouse accessibility ended at 1.00, and axe reports nothing critical or serious on either route in either theme.

## Measuring honestly

This was the least comfortable part, and the most useful.

**The 3D target is not met on the target hardware, because I don't have that hardware.** On my M2 Pro the benchmark holds the display's refresh rate with about 1.2 ms of GPU time per frame. But an M2 Pro is not a mid-range laptop with integrated graphics, so the requirement stays marked *not measured*, with the exact command to run on the right machine. Headless Chromium draws WebGL in software at 5.7 fps, and that number is recorded too, so nobody reads a CI result as a real one.

**Some bugs only exist in production.** The production CSS minifier writes `rgba()` colours as 8-digit hex. My colour parser read 6 digits, so container edges in the shipped app were opaque in both themes. The dev server serves unminified CSS, so no test had seen it. Running the end-to-end suite on the production build found it.

**The profiler beat my guesses.** The three largest costs were not where I expected:

1. Google Fonts was render-blocking on a first visit. Serving the same font files with the app took "3D view ready" on fast 4G from 4,074 ms to 1,824 ms.
2. A move spent most of its time *formatting numbers*. `toLocaleString` with options builds a new formatter on every call, and a move prints hundreds of weights. One `Intl.NumberFormat`, made once, took 20 moves and 20 undos from about 950 ms to about 715 ms.
3. Opening a plan waited for two things in a row that could run side by side.

**Flaky tests had causes, not bad luck.** The suite ran on the dev server, which compiles each module on first request, so four parallel workers starting cold took over a minute. A footer 1.9 px taller than its row let the page scroll by 2 px before some screenshots. Building once and serving the build took the suite from 11 minutes to 2.3, with no retries. It now runs 569 unit tests and 127 end-to-end tests across Chromium, Firefox and WebKit.

## What version 1 is, and what it isn't

Stowline is a portfolio project, and the docs say so plainly. The stability model is a simplified estimate, not a certified loading computer. The dangerous-goods table is demonstration data, not the full IMDG table. The API is Mock Service Worker in the browser with IndexedDB, answering with a 150 to 400 ms delay so the loading and conflict states are real. Live operations would need EDI (BAPLIE, COPRAR, MOVINS), a real backend, a certified calculation, and crane sequencing and lashing checks.

Two checks need a person, not a test: the frame rate on a mid-range laptop, and listening to the whole flow with VoiceOver and NVDA. Both are written up as steps, waiting for someone to run them.

## What I'd tell myself at the start

**Write the fixture before the feature.** "The seeded plan always gives 7 violations" caught more regressions than any other test.

**Keep the domain pure, and enforce it with a lint rule.** Once the rules are plain functions, property tests are cheap, workers are easy, and the UI is just another client.

**Write decisions down while you make them.** Seventeen small decisions are invisible in the code and obvious in the notes.

**A number you didn't measure is a guess.** Write "not measured" next to it, and the command that would measure it. It's less impressive in a README and much more useful to the next person.
