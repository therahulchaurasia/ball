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
  x: WIDTH / 2 + 20,
  y: HEIGHT / 2 - 50,
  radius: 40,
  vx: 4,
  vy: 3,
  color: "tomato",
}

function generateRandomColor() {
  const hue = Math.floor(Math.random() * 360)
  const saturation = 80
  const lightness = 80
  return `hsl(${hue},${saturation}%, ${lightness}%)`
}

function draw() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT)
  ctx.beginPath()
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2)
  ctx.fillStyle = ball.color
  ctx.fill()
  // const hue = Math.floor(Math.random() * 360)
  // const saturation = 80
  // const lightness = 80
  if (ball.x + ball.radius > WIDTH || ball.x - ball.radius < 0) {
    ball.vx *= -1

    ball.color = generateRandomColor()
  }
  if (ball.y + ball.radius > HEIGHT || ball.y - ball.radius < 0) {
    ball.vy *= -1
    ball.color = generateRandomColor()
  }
  ball.x += ball.vx
  ball.y += ball.vy

  requestAnimationFrame(draw)
}

draw()
