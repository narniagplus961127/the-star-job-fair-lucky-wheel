const FULL_CIRCLE = Math.PI * 2

function cssToken(name, fallback) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback
}

function cssPixels(name, fallback) {
  return Number.parseFloat(cssToken(name, String(fallback))) || fallback
}

function loadImage(source) {
  return new Promise((resolve) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => resolve(null)
    image.src = source
  })
}

function waitForTransition(element, duration) {
  return new Promise((resolve) => {
    const fallback = window.setTimeout(resolve, duration + 250)

    element.addEventListener(
      'transitionend',
      () => {
        window.clearTimeout(fallback)
        resolve()
      },
      { once: true }
    )
  })
}

function readableTextColor(hexColor, lightColor, darkColor) {
  const color = hexColor.replace('#', '')

  if (!/^[0-9a-f]{6}$/i.test(color)) {
    return lightColor
  }

  const red = Number.parseInt(color.slice(0, 2), 16)
  const green = Number.parseInt(color.slice(2, 4), 16)
  const blue = Number.parseInt(color.slice(4, 6), 16)
  const brightness = (red * 299 + green * 587 + blue * 114) / 1000

  return brightness > 165 ? darkColor : lightColor
}

export class PrizeWheel {
  constructor(canvas) {
    this.canvas = canvas
    this.context = canvas.getContext('2d')
    this.prizes = []
    this.images = new Map()
    this.language = 'en'
    this.soldOutLabel = 'SOLD OUT'
    this.rotation = 0
  }

  async setData(prizes, imageUrls, language, soldOutLabel) {
    this.prizes = prizes
    this.language = language
    this.soldOutLabel = soldOutLabel
    this.images = new Map()

    await Promise.all(
      prizes.map(async (prize) => {
        this.images.set(prize.graphic, await loadImage(imageUrls.get(prize.graphic)))
      })
    )

    this.draw()
  }

  updatePrizes(prizes) {
    this.prizes = prizes
    this.draw()
  }

  setLanguage(language, soldOutLabel) {
    this.language = language
    this.soldOutLabel = soldOutLabel
    this.draw()
  }

  draw() {
    const { context, canvas, prizes } = this
    const size = canvas.width
    const centre = size / 2
    const radius = centre - 18
    const colors = {
      primary: cssToken('--color-primary', '#d71920'),
      soldOut: cssToken('--color-sold-out', '#566074'),
      text: cssToken('--color-text', '#111215'),
      white: cssToken('--color-white', '#ffffff'),
      labelShadow: cssToken('--color-wheel-label-shadow', 'rgb(0 0 0 / 40%)'),
      labelLightShadow: cssToken('--color-wheel-label-light-shadow', 'rgb(255 255 255 / 45%)')
    }

    context.clearRect(0, 0, size, size)

    if (!prizes.length) {
      return
    }

    const sliceAngle = FULL_CIRCLE / prizes.length
    const compactSlices = prizes.length >= 7
    const denseSlices = prizes.length >= 9
    const imageSize = denseSlices ? 52 : compactSlices ? 60 : 84
    const imageRadius = radius * (compactSlices ? 0.73 : 0.7)
    const labelRadius = radius * (compactSlices ? 0.5 : 0.42)
    const fontSize = denseSlices
      ? cssPixels('--font-size-wheel-label-dense', 15)
      : compactSlices
        ? cssPixels('--font-size-wheel-label', 17)
        : cssPixels('--font-size-wheel-label-large', 25)
    const soldOutFontSize = compactSlices
      ? cssPixels('--font-size-wheel-sold-out', 13)
      : cssPixels('--font-size-wheel-sold-out-large', 19)
    const lineHeight = denseSlices ? 17 : compactSlices ? 19 : 30
    const labelWidth = radius * (denseSlices ? 0.28 : compactSlices ? 0.34 : 0.46)

    prizes.forEach((prize, index) => {
      const startAngle = -Math.PI / 2 + index * sliceAngle
      const endAngle = startAngle + sliceAngle
      const centreAngle = startAngle + sliceAngle / 2
      const soldOut = prize.quantity === 0

      context.beginPath()
      context.moveTo(centre, centre)
      context.arc(centre, centre, radius, startAngle, endAngle)
      context.closePath()
      context.fillStyle = soldOut ? colors.soldOut : prize.color
      context.fill()
      context.strokeStyle = colors.white
      context.lineWidth = 7
      context.stroke()

      context.save()
      context.translate(centre, centre)
      context.rotate(centreAngle + Math.PI / 2)

      const image = this.images.get(prize.graphic)
      if (image) {
        context.globalAlpha = soldOut ? 0.48 : 1
        context.drawImage(image, -imageSize / 2, -imageRadius - imageSize / 2, imageSize, imageSize)
        context.globalAlpha = 1
      }

      const labelColor = soldOut
        ? colors.white
        : readableTextColor(prize.color, colors.white, colors.text)
      context.fillStyle = labelColor
      context.font = `700 ${fontSize}px Arial, sans-serif`
      context.textAlign = 'center'
      context.textBaseline = 'middle'
      context.shadowColor =
        labelColor === colors.white ? colors.labelShadow : colors.labelLightShadow
      context.shadowBlur = 4

      const words = prize.name[this.language].split(/\s+/)
      const splitAt = Math.ceil(words.length / 2)
      const shouldSplit = compactSlices ? words.length > 1 : words.length > 2
      const lines = shouldSplit
        ? [words.slice(0, splitAt).join(' '), words.slice(splitAt).join(' ')]
        : [words.join(' ')]
      const firstLineTop = -((lines.length - 1) * lineHeight) / 2

      lines.forEach((line, lineIndex) => {
        context.fillText(line, 0, -labelRadius + firstLineTop + lineIndex * lineHeight, labelWidth)
      })

      if (soldOut) {
        context.font = `800 ${soldOutFontSize}px Arial, sans-serif`
        context.fillStyle = colors.white
        context.fillText(
          this.soldOutLabel,
          0,
          -labelRadius + firstLineTop + lines.length * lineHeight + 8
        )
      }

      context.restore()
    })

    context.beginPath()
    context.arc(centre, centre, radius, 0, FULL_CIRCLE)
    context.strokeStyle = colors.primary
    context.lineWidth = 14
    context.stroke()
  }

  async spinTo(prizeIndex) {
    const sliceDegrees = 360 / this.prizes.length
    const targetRotation = (((-(prizeIndex + 0.5) * sliceDegrees) % 360) + 360) % 360
    const currentNormalized = ((this.rotation % 360) + 360) % 360
    const targetDelta = (targetRotation - currentNormalized + 360) % 360
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const duration = reducedMotion ? 180 : 5200
    const turns = reducedMotion ? 0 : 6

    this.rotation += turns * 360 + targetDelta
    this.canvas.style.transition = `transform ${duration}ms cubic-bezier(0.12, 0.72, 0.08, 1)`
    this.canvas.style.transform = `rotate(${this.rotation}deg)`

    await waitForTransition(this.canvas, duration)

    this.rotation = ((this.rotation % 360) + 360) % 360
    this.canvas.style.transition = 'none'
    this.canvas.style.transform = `rotate(${this.rotation}deg)`
    this.canvas.getBoundingClientRect()
  }
}
