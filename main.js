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

    // Radius is fixed at birth now — collisions need stable bodies.
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

  ctx.clearRect(0, 0, WIDTH, HEIGHT)
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

canvas.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect()
  mouseX = e.clientX - rect.left
  mouseY = e.clientY - rect.top
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
