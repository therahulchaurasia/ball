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

function draw() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT)
  ctx.beginPath()
  ctx.arc(WIDTH / 2, HEIGHT / 2, 40, 0, Math.PI * 2)
  ctx.fillStyle = "tomato"
  ctx.fill()
}

draw()
