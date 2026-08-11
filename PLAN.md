# Canvas Ball Series — 20 Day Plan

One ball, one story. Each day evolves yesterday's code. One codebase, one commit per day, one tweet per day.

Story arcs: birth (1–5) → society & power (6–13) → beauty & mastery (14–19) → finale (20).

## Days

| Day | Beat | Canvas concept learned |
|-----|------|------------------------|
| 1 | Ball exists. Static, dead center. | `arc`, `fill`, DPR setup |
| 2 | Ball wakes up. Moves, bounces off walls. | `requestAnimationFrame` loop, velocity, clear+redraw |
| 3 | Shape morph on bounce: circle → square → triangle → star cycle | polygon/path drawing |
| 4 | Ball reproduces. Every bounce spawns a child in random direction. | arrays, object state, spawning |
| 5 | Overpopulation crisis. Balls shrink on each edge hit, die when tiny. Balance emerges. | lifecycle, removing from array |
| 6 | Balls flee the cursor. You = predator. | pointer events, vectors, flee steering |
| 7 | Balls collide with each other, push apart. | circle-circle collision math |
| 8 | You draw walls with the mouse — balls bounce off, walls fade/dissolve after hits | line-circle collision, drawing input |
| 9 | Big ball eats small ball. Survival world. | absorb logic, mass transfer |
| 10 | Click ball → pop → particle burst. Your power: population control. | particle lifecycle |
| 11 | Beauty pass: trails, glow, color by generation. | alpha-clear trick, gradients |
| 12 | Trust arc: cursor = food. Balls chase it, eat, grow. (Day 6 callback — they feared you, now they trust you.) | steering: seek vs flee |
| 13 | Gravity arrives. Everything falls, piles, rolls. | acceleration, rest state |
| 14 | Squash & stretch — impact juice on every bounce. | transforms, save/restore |
| 15 | Constellation: lines connect nearby balls. | distance checks, O(n²) cost |
| 16 | Balls wander organically, creature-like. | noise (Perlin / sin drift) |
| 17 | Swarm assembles into text: balls spell "CANVAS" (or handle). | text → pixel targets, lerp |
| 18 | Orbit day: gravity well at center, planet motion. | orbital physics |
| 19 | Fireworks mode: launch, explode, sparkle fall. | combined particle knowledge |
| 20 | Finale: living ecosystem, all systems on, keyboard toggles. | architecture, performance |

## Tweet hooks

- Day 1: "Trust me, this is a canvas element. Don't believe me? Come back tomorrow."
- Day 2: "It's alive."
- Day 4: "I gave it the ability to reproduce. This was a mistake." (clip of screen flooding)
- Day 5: don't fix the flood before tweeting — flood first, fix next day. Crisis = content.
- Day 12: "Day 6 they ran from me. Today I learned to feed them. They trust me now."

## Notes

- Write code by hand — scaffold shell only, muscle memory is the point.
- Fix DPR on day 1: crisp screenshot = clean tweet.
- Day 8 wall dissolve: wall = stroke path, per-hit HP reduce + alpha fade, or simple time-based fade. Decide when building.
- Day 15 perf pain (O(n²)) is a real lesson — feel it, then learn spatial tricks if needed.

## Backup ideas (day 21+)

Gradient/glow variants, orbit multiple gravity wells, flocking/boids, metaballs (gooey merge),
image → pixel particles, cursor trail, day/night background cycle, sound-reactive (mic), WebGL port for 10k balls.
