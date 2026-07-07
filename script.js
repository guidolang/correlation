const controls = {
  correlation: document.querySelector("#correlation"),
  pValue: document.querySelector("#p-value"),
  sampleSize: document.querySelector("#sample-size"),
}

const canvas = document.querySelector("#scatterplot")
const context = canvas.getContext("2d")

function randomNormal() {
  const u1 = Math.max(Math.random(), Number.EPSILON)
  const u2 = Math.random()
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
}

function generateCorrelatedData(correlation, pValue, sampleSize) {
  const noiseLevel = 2 * Math.sqrt(pValue)
  const xValues = Array.from({ length: sampleSize }, randomNormal)

  return xValues.map((x) => {
    const correlatedComponent = correlation * x
    const noiseComponent = noiseLevel * randomNormal()

    return {
      alpha: x * 3,
      bravo: ((correlatedComponent + noiseComponent) / (1 + noiseLevel)) * 3,
    }
  })
}

function drawAxes(width, height, padding) {
  context.strokeStyle = getComputedStyle(document.documentElement)
    .getPropertyValue("--axis")
    .trim()
  context.lineWidth = 2

  context.beginPath()
  context.moveTo(padding.left, padding.top)
  context.lineTo(padding.left, height - padding.bottom)
  context.stroke()

  context.beginPath()
  context.moveTo(padding.left, height - padding.bottom)
  context.lineTo(width - padding.right, height - padding.bottom)
  context.stroke()
}

function drawPoints(data, width, height, padding) {
  const plotWidth = width - padding.left - padding.right
  const plotHeight = height - padding.top - padding.bottom
  const pointColor = getComputedStyle(document.documentElement)
    .getPropertyValue("--point")
    .trim()
  const pointStrong = getComputedStyle(document.documentElement)
    .getPropertyValue("--point-strong")
    .trim()
  const radius = width < 560 ? 2.2 : 3.2

  context.fillStyle = pointColor
  context.strokeStyle = pointStrong
  context.lineWidth = 0.7

  data.forEach((point) => {
    const x = padding.left + ((point.alpha + 10) / 20) * plotWidth
    const y = padding.top + (1 - (point.bravo + 10) / 20) * plotHeight

    if (
      x < padding.left ||
      x > width - padding.right ||
      y < padding.top ||
      y > height - padding.bottom
    ) {
      return
    }

    context.beginPath()
    context.arc(x, y, radius, 0, Math.PI * 2)
    context.fill()
    context.stroke()
  })
}

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect()
  const pixelRatio = window.devicePixelRatio || 1
  canvas.width = Math.round(rect.width * pixelRatio)
  canvas.height = Math.round(rect.height * pixelRatio)
  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
}

function render() {
  const correlation = Number.parseFloat(controls.correlation.value)
  const pValue = Number.parseFloat(controls.pValue.value)
  const sampleSize = Number.parseInt(controls.sampleSize.value, 10)
  const data = generateCorrelatedData(correlation, pValue, sampleSize)
  const rect = canvas.getBoundingClientRect()
  const width = rect.width
  const height = rect.height
  const padding = {
    top: 14,
    right: 14,
    bottom: 26,
    left: 26,
  }

  context.clearRect(0, 0, width, height)
  drawAxes(width, height, padding)
  drawPoints(data, width, height, padding)
}

function refresh() {
  resizeCanvas()
  render()
}

Object.values(controls).forEach((control) => {
  control.addEventListener("change", render)
})

window.addEventListener("resize", refresh)
refresh()
