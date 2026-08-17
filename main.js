const canvas = document.getElementById("c")
const ctx = canvas.getContext("2d")

// Logical size (CSS pixels)
const WIDTH = 600
const HEIGHT = 600

// DPR setup — backing store bigger than CSS size so retina stays crisp.
// After ctx.scale(dpr, dpr), draw everything in logical coords (0..600).
const dpr = window.devicePixelRatio || 1
canvas.width = WIDTH * dpr
canvas.height = HEIGHT * dpr
canvas.style.width = WIDTH + "px"
canvas.style.height = HEIGHT + "px"
ctx.scale(dpr, dpr)

let lastTime = 0
let breeding = true
const MIN_BABY_RADIUS = 12
const MAX_BABY_RADIUS = 18

let creatures = [
  {
    shapeIndex: 0,
    x: WIDTH / 2,
    rotation: 0,
    y: HEIGHT / 2,
    radius: 30,
    vx: 360,
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

function draw(now) {
  if (!lastTime) lastTime = now
  const dt = (now - lastTime) / 1000
  lastTime = now
  const babies = []
  const sizeRate = breeding ? 1.2 : 0.7
  const breedChance = breeding ? 1 : 0.35
  ctx.clearRect(0, 0, WIDTH, HEIGHT)
  for (const creature of creatures) {
    ctx.save()
    ctx.translate(creature.x, creature.y)
    ctx.rotate(creature.rotation)
    ctx.beginPath()

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
    let hit = false
    if (creature.x + creature.radius > WIDTH) {
      creature.x = WIDTH - creature.radius
      creature.vx *= -1
      hit = true
      // if (!breeding) creature.radius *= 0.8
    } else if (creature.x - creature.radius < 0) {
      creature.x = creature.radius
      creature.vx *= -1
      hit = true
      // if (!breeding) creature.radius *= 0.8
    }
    if (creature.y + creature.radius > HEIGHT) {
      creature.y = HEIGHT - creature.radius
      creature.vy *= -1
      hit = true

      // if (!breeding) creature.radius *= 0.8
    } else if (creature.y - creature.radius < 0) {
      creature.y = creature.radius
      creature.vy *= -1
      hit = true

      // if (!breeding) creature.radius *= 0.8
    }
    if (hit) {
      creature.shapeIndex = (creature.shapeIndex + 1) % shapeTypes.length
      creature.color = generateRandomColor()
      creature.radius = Math.min(creature.radius * sizeRate, 40)

      if (creature.age > 0.5 && Math.random() < breedChance) {
        babies.push(createCreature(creature.x, creature.y))
      }
    }
    creature.age += dt
    creature.x += creature.vx * dt
    creature.y += creature.vy * dt
    // if (breeding) creature.radius = Math.min(creature.radius + 6 * dt, 40)
    creature.rotation += 0.02 * 60 * dt
  }
  creatures.push(...babies)
  creatures = creatures.filter((creature) => creature.radius > 10)
  if (creatures.length > 400) breeding = false
  if (creatures.length < 80) breeding = true
  requestAnimationFrame(draw)
}
requestAnimationFrame(draw)

// draw()
