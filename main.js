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

const ball = {
  shapeIndex: 0,
  x: WIDTH / 2,
  rotation: 0,
  y: HEIGHT / 2,
  radius: 40,
  vx: 6,
  vy: 4,
  color: "tomato",
}

const shapes = [
  { type: "circle" },
  { type: "polygon", sides: 3 },
  { type: "star", points: 4, inner: 18 },
  { type: "polygon", sides: 5 },
  { type: "star", points: 5, inner: 22 },
  { type: "polygon", sides: 4 },
  { type: "polygon", sides: 6 },
  { type: "star", points: 6, inner: 24 },
  { type: "polygon", sides: 7 },
  { type: "polygon", sides: 8 },
  { type: "star", points: 8, inner: 26 },
  { type: "polygon", sides: 10 },
  { type: "star", points: 10, inner: 30 },
  { type: "polygon", sides: 12 },
  { type: "star", points: 7, inner: 26 },
  { type: "star", points: 12, inner: 32 },
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

function draw() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT)
  ctx.save()
  ctx.translate(ball.x, ball.y)
  ctx.rotate(ball.rotation)
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

  const shape = shapes[ball.shapeIndex]
  if (shape.type === "circle") {
    ctx.arc(0, 0, ball.radius, 0, Math.PI * 2)
  } else if (shape.type === "polygon") {
    drawPolygon(0, 0, ball.radius, shape.sides)
  } else if (shape.type === "star") {
    drawStar(0, 0, ball.radius, shape.inner, shape.points)
  }
  ctx.fillStyle = ball.color
  ctx.fill()
  ctx.restore()

  if (ball.x + ball.radius > WIDTH || ball.x - ball.radius < 0) {
    ball.vx *= -1
    ball.shapeIndex = (ball.shapeIndex + 1) % shapes.length
    ball.color = generateRandomColor()
  }
  if (ball.y + ball.radius > HEIGHT || ball.y - ball.radius < 0) {
    ball.vy *= -1
    ball.shapeIndex = (ball.shapeIndex + 1) % shapes.length
    ball.color = generateRandomColor()
  }
  ball.x += ball.vx
  ball.y += ball.vy
  ball.rotation += 0.02

  requestAnimationFrame(draw)
}

draw()
