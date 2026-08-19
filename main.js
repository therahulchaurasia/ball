const canvas = document.getElementById("c")
const ctx = canvas.getContext("2d")

// Logical size (CSS pixels)
const WIDTH = 1200
const HEIGHT = 800

// DPR setup — backing store bigger than CSS size so retina stays crisp.
// After ctx.scale(dpr, dpr), draw everything in logical coords (0..WIDTH/HEIGHT).
const dpr = window.devicePixelRatio || 1
canvas.width = WIDTH * dpr
canvas.height = HEIGHT * dpr
canvas.style.width = WIDTH + "px"
canvas.style.height = HEIGHT + "px"
ctx.scale(dpr, dpr)

let lastTime = 0
let mouseX = WIDTH / 2
let mouseY = -1000
const MIN_BABY_RADIUS = 20
const MAX_BABY_RADIUS = 28
const MAX_CREATURES = 50

let creatures = [
  {
    shapeIndex: 0,
    x: WIDTH / 2,
    rotation: 0,
    y: HEIGHT / 2,
    radius: 30,
    vx: 480,
    vy: 240,
    age: 1,
    color: "tomato",
  },
]

const shapeTypes = [
  { type: "circle" },
  { type: "polygon", sides: 3 },
  { type: "star", points: 4, inner: 0.45 },
  { type: "polygon", sides: 5 },
  { type: "star", points: 5, inner: 0.55 },
  { type: "polygon", sides: 4 },
  { type: "polygon", sides: 6 },
  { type: "star", points: 6, inner: 0.6 },
  { type: "polygon", sides: 7 },
  { type: "polygon", sides: 8 },
  { type: "star", points: 8, inner: 0.65 },
  { type: "polygon", sides: 10 },
  { type: "star", points: 10, inner: 0.75 },
  { type: "polygon", sides: 12 },
  { type: "star", points: 7, inner: 0.5 },
  { type: "star", points: 12, inner: 0.6 },
]

function generateRandomColor() {
  const hue = Math.floor(Math.random() * 360)
  const saturation = 80
  const lightness = 80
  return `hsl(${hue},${saturation}%, ${lightness}%)`
}

function drawPolygon(cx, cy, radius, sides) {
  let angleGap = (Math.PI * 2) / sides
  for (let i = 0; i <= sides - 1; i++) {
    const angle = i * angleGap - Math.PI / 2
    const x = cx + radius * Math.cos(angle)
    const y = cy + radius * Math.sin(angle)
    if (i === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  }
}

function drawStar(cx, cy, outerRadius, innerRadius, points) {
  let angleGap = (Math.PI * 2) / (points * 2)
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outerRadius : innerRadius
    const angle = i * angleGap - Math.PI / 2
    const x = cx + r * Math.cos(angle)
    const y = cy + r * Math.sin(angle)
    if (i === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  }
}

function createCreature(x, y, radius) {
  const angle = Math.random() * Math.PI * 2
  const speed = 450
  const scale = 0.4 + Math.random() * 0.5
  return {
    shapeIndex: Math.floor(Math.random() * shapeTypes.length),
    x: x,
    age: 0,
    rotation: 0,
    y: y,
    radius:
      MIN_BABY_RADIUS + Math.random() * (MAX_BABY_RADIUS - MIN_BABY_RADIUS),
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    color: generateRandomColor(),
  }
}

// Paints one creature. Reads the creature, never changes it.
function drawCreature(creature) {
  ctx.save()
  ctx.translate(creature.x, creature.y)
  ctx.rotate(creature.rotation)
  ctx.beginPath()

  const form = shapeTypes[creature.shapeIndex]
  if (form.type === "circle") {
    ctx.arc(0, 0, creature.radius, 0, Math.PI * 2)
  } else if (form.type === "polygon") {
    drawPolygon(0, 0, creature.radius, form.sides)
  } else if (form.type === "star") {
    drawStar(0, 0, creature.radius, creature.radius * form.inner, form.points)
  }

  ctx.fillStyle = creature.color
  ctx.fill()
  ctx.restore()
}

// Bounces, resizes, ages and moves one creature.
// Returns a baby if this bounce made one, otherwise null.
function moveCreature(creature, dt) {
  // const dx = creature.x - mouseX
  // const dy = creature.y - mouseY
  // const dist = Math.hypot(dx, dy)

  // if (dist < 150 && dist > 0) {
  //   creature.vx += (dx / dist) * 1200 * dt
  //   creature.vy += (dy / dist) * 1200 * dt
  // }

  let hit = false
  if (creature.x + creature.radius > WIDTH) {
    creature.x = WIDTH - creature.radius
    creature.vx *= -1
    hit = true
  } else if (creature.x - creature.radius < 0) {
    creature.x = creature.radius
    creature.vx *= -1
    hit = true
  }
  if (creature.y + creature.radius > HEIGHT) {
    creature.y = HEIGHT - creature.radius
    creature.vy *= -1
    hit = true
  } else if (creature.y - creature.radius < 0) {
    creature.y = creature.radius
    creature.vy *= -1
    hit = true
  }

  // One block, so a corner hit (both axes in one frame) only counts once.
  let baby = null
  if (hit) {
    creature.shapeIndex = (creature.shapeIndex + 1) % shapeTypes.length
    creature.color = generateRandomColor()

    if (creature.age > 0.5) {
      baby = createCreature(creature.x, creature.y)
    }
  }

  creature.age += dt
  creature.x += creature.vx * dt
  creature.y += creature.vy * dt
  creature.rotation += 0.02 * 60 * dt

  return baby
}

// Bigger bodies shove smaller ones around. Area, not radius, so the
// difference between a 20 and a 28 actually reads on screen.
function massOf(creature) {
  return creature.radius * creature.radius
}

// Every pair, once: j starts at i + 1 so nobody checks themselves and no
// pair gets handled twice.
function resolveCollisions() {
  for (let i = 0; i < creatures.length; i++) {
    for (let j = i + 1; j < creatures.length; j++) {
      const a = creatures[i]
      const b = creatures[j]

      const dx = b.x - a.x
      const dy = b.y - a.y
      const dist = Math.hypot(dx, dy)
      const touchDist = a.radius + b.radius
      if (dist >= touchDist) continue

      // Babies spawn on the parent's exact centre, so dist can be a true 0
      // and dx / dist is NaN. Any direction will do — they just need one.
      let nx = 1
      let ny = 0
      if (dist > 0) {
        nx = dx / dist
        ny = dy / dist
      }

      const invMassA = 1 / massOf(a)
      const invMassB = 1 / massOf(b)
      const invMassSum = invMassA + invMassB

      // Push apart along the normal, split by mass — the heavy one barely
      // moves. Without this they stay overlapped and re-collide every frame.
      const overlap = touchDist - dist
      a.x -= nx * overlap * (invMassA / invMassSum)
      a.y -= ny * overlap * (invMassA / invMassSum)
      b.x += nx * overlap * (invMassB / invMassSum)
      b.y += ny * overlap * (invMassB / invMassSum)

      // Closing speed along the normal. Positive means they're already
      // separating — a leftover overlap from last frame, not a new hit.
      const closing = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny
      if (closing > 0) continue

      // Elastic, so no energy leaves the system and the world stays lively.
      const impulse = (-2 * closing) / invMassSum
      a.vx -= impulse * invMassA * nx
      a.vy -= impulse * invMassA * ny
      b.vx += impulse * invMassB * nx
      b.vy += impulse * invMassB * ny
    }
  }
}

// ---- Day 8: the wall ------------------------------------------------------

const walls = []
const WALL_LIFE = 8            // seconds a wall survives
const MIN_WALL_LENGTH = 25     // shorter than this and it never existed

// The segment being dragged right now. Visible, but not collidable until
// it is released and passes the length check.
let pendingWall = null

// Written by distanceToSegment on every call, read straight after it.
let closestPoint = null

// Contact points from this frame, cleared and refilled each time.
let impacts = []

// Shortest distance from a point to the segment — clamped, so the ends
// stop pretending the wall runs on forever.
function distanceToSegment(px, py, x1, y1, x2, y2) {
  // The wall as a direction: from end 1 toward end 2.
  const wx = x2 - x1
  const wy = y2 - y1

  // The ball, measured from that same starting end.
  const bx = px - x1
  const by = py - y1

  // How far along the wall the ball sits. 0 = at end 1, 1 = at end 2.
  const t = (bx * wx + by * wy) / (wx * wx + wy * wy)
  const clamped = Math.max(0, Math.min(1, t))
  // The point on the wall closest to the ball.
  const cx = x1 + clamped * wx
  const cy = y1 + clamped * wy

  // Stashed so draw() can paint it. Debug only.
  closestPoint = { x: cx, y: cy }

  return Math.hypot(px - cx, py - cy)
}

// Pushes a creature clear of every wall it is touching and reflects it.
function bounceOffWall(creature) {
  for (const wall of walls) {
    const d = distanceToSegment(
      creature.x,
      creature.y,
      wall.x1,
      wall.y1,
      wall.x2,
      wall.y2
    )

    if (d >= creature.radius || d === 0) continue

    // Direction from the wall out to the ball — that is the normal.
    const nx = (creature.x - closestPoint.x) / d
    const ny = (creature.y - closestPoint.y) / d

    // Lift it clear of the wall so it cannot get stuck inside.
    creature.x = closestPoint.x + nx * creature.radius
    creature.y = closestPoint.y + ny * creature.radius

    // Reflect: v - 2(v·n)n
    const dot = creature.vx * nx + creature.vy * ny
    creature.vx -= 2 * dot * nx
    creature.vy -= 2 * dot * ny

    impacts.push({ x: closestPoint.x, y: closestPoint.y })
  }
}

// Walls fade as they run out of time, so a dying wall is visible before
// it goes.
function drawWalls() {
  ctx.lineWidth = 4
  ctx.lineCap = "round"

  for (const wall of walls) {
    ctx.beginPath()
    ctx.moveTo(wall.x1, wall.y1)
    ctx.lineTo(wall.x2, wall.y2)
    ctx.strokeStyle = `rgba(235, 235, 240, ${wall.life / WALL_LIFE})`
    ctx.stroke()
  }

  // The drag in progress, dimmer so it reads as not real yet.
  if (pendingWall) {
    ctx.beginPath()
    ctx.moveTo(pendingWall.x1, pendingWall.y1)
    ctx.lineTo(pendingWall.x2, pendingWall.y2)
    ctx.strokeStyle = "rgba(235, 235, 240, 0.3)"
    ctx.stroke()
  }

  // Where creatures actually struck this frame.
  for (const impact of impacts) {
    ctx.beginPath()
    ctx.arc(impact.x, impact.y, 6, 0, Math.PI * 2)
    ctx.fillStyle = "yellow"
    ctx.fill()
  }
}

function draw(now) {
  if (!lastTime) lastTime = now
  const dt = (now - lastTime) / 1000
  lastTime = now
  const babies = []

  // Move everyone, settle the pile-ups, then paint. Drawing mid-update
  // showed the overlapped frame before it was resolved.
  for (const creature of creatures) {
    const baby = moveCreature(creature, dt)
    if (baby) babies.push(baby)
  }

  resolveCollisions()

  impacts = []
  for (const creature of creatures) {
    bounceOffWall(creature)
  }

  // Walls run down on their own — your power over them is temporary.
  for (let i = walls.length - 1; i >= 0; i--) {
    walls[i].life -= dt
    if (walls[i].life <= 0) walls.splice(i, 1)
  }

  ctx.clearRect(0, 0, WIDTH, HEIGHT)
  drawWalls()
  for (const creature of creatures) {
    drawCreature(creature)
  }

  // One at a time — checking once and pushing the whole batch overshoots.
  for (const baby of babies) {
    if (creatures.length >= MAX_CREATURES) break
    creatures.push(baby)
  }
  requestAnimationFrame(draw)
}
requestAnimationFrame(draw)

// Canvas coords, not page coords — the canvas is centred, so clientX alone
// is off by the whole left margin.
function pointerPos(e) {
  const rect = canvas.getBoundingClientRect()
  return { x: e.clientX - rect.left, y: e.clientY - rect.top }
}

// Press starts a wall, drag moves its far end, release commits it.
canvas.addEventListener("mousedown", (e) => {
  const p = pointerPos(e)
  pendingWall = { x1: p.x, y1: p.y, x2: p.x, y2: p.y, life: WALL_LIFE }
})

canvas.addEventListener("mousemove", (e) => {
  const p = pointerPos(e)
  mouseX = p.x
  mouseY = p.y
  if (pendingWall) {
    pendingWall.x2 = p.x
    pendingWall.y2 = p.y
  }
})

// A plain click has no direction to reflect off, and a stubby one is just
// a speck on screen. Below the minimum it never existed.
canvas.addEventListener("mouseup", () => {
  if (!pendingWall) return

  const length = Math.hypot(
    pendingWall.x2 - pendingWall.x1,
    pendingWall.y2 - pendingWall.y1
  )
  if (length >= MIN_WALL_LENGTH) walls.push(pendingWall)

  pendingWall = null
})

// This is my square
// ctx.moveTo(WIDTH / 2 - 50, HEIGHT / 2 - 50)
// ctx.lineTo(WIDTH / 2 + 50, HEIGHT / 2 - 50)
// ctx.lineTo(WIDTH / 2 + 50, HEIGHT / 2 + 50)
// ctx.lineTo(WIDTH / 2 - 50, HEIGHT / 2 + 50)
// ctx.closePath()

// This is my equilateral triangle
// ctx.moveTo(WIDTH / 2, HEIGHT / 2 - 50)
// ctx.lineTo(WIDTH / 2 + 75, HEIGHT / 2 + 75)
// ctx.lineTo(WIDTH / 2 - 75, HEIGHT / 2 + 75)

// drawPolygon(WIDTH / 2, HEIGHT / 2, 50, 3)
// drawStar(WIDTH / 2, HEIGHT / 2, 50, 22, 4)

// Day 4: one bounce block per axis with ||. Flipped the velocity but never
// pushed the shape back inside, so it bred every frame while out of bounds.
// if (ball.x + ball.radius > WIDTH || ball.x - ball.radius < 0) {
//   ball.vx *= -1
//   ball.shapeIndex = (ball.shapeIndex + 1) % shapes.length
//   ball.color = generateRandomColor()
//   babies.push(createBall(ball.x, ball.y))
// }
// if (ball.y + ball.radius > HEIGHT || ball.y - ball.radius < 0) {
//   ball.vy *= -1
//   ball.shapeIndex = (ball.shapeIndex + 1) % shapes.length
//   ball.color = generateRandomColor()
//   babies.push(createBall(ball.x, ball.y))
// }

// Day 5: shrink written per-axis, so a corner hit shrank twice. Replaced by
// sizeRate inside the single `if (hit)` block.
// if (!breeding) creature.radius *= 0.8

// Day 5: growth over time instead of growth per bounce. Made the death
// threshold unreachable — tiny creatures regained size just by travelling.
// if (breeding) creature.radius = Math.min(creature.radius + 6 * dt, 40)

// Day 4: kickstart without a timestamp, so `now` was undefined and dt was NaN.
// draw()

// Day 7: capping the population at 50 put the 400/80 thresholds out of reach,
// so `breeding` was stuck true forever. Everything it drove went with it —
// grow/shrink rate, breed chance, and death by shrinking (nothing could ever
// reach the radius floor again).
// let breeding = true
// const sizeRate = breeding ? 1.2 : 0.7
// const breedChance = breeding ? 1 : 0.35
// creature.radius = Math.min(creature.radius * sizeRate, 40)
// creatures = creatures.filter((creature) => creature.radius > 10)
// if (creatures.length > 400) breeding = false
// if (creatures.length < 80) breeding = true

// Day 7: cap checked once per frame instead of once per baby, so the whole
// batch went in regardless — 49 creatures with 6 babies queued gave 55.
// if (creatures.length < 50) creatures.push(...babies)
