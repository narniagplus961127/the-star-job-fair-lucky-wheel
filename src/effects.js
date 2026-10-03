const EFFECT_COUNTS = {
  grand: 84,
  second: 40,
  third: 34,
  consolation: 20
}

function randomBetween(minimum, maximum) {
  return minimum + Math.random() * (maximum - minimum)
}

function createParticle(className, colour) {
  const particle = document.createElement('span')
  particle.className = className
  particle.style.backgroundColor = colour
  particle.style.color = colour

  return particle
}

function createGrandEffect(container, colours) {
  const flash = createParticle('celebration-particle grand-flash', colours[1] || colours[0])
  container.append(flash)

  for (let index = 0; index < EFFECT_COUNTS.grand; index += 1) {
    const particle = createParticle(
      `celebration-particle grand-confetti grand-confetti-${index % 3}`,
      colours[index % colours.length]
    )
    particle.style.setProperty('--effect-x', `${randomBetween(0, 100)}%`)
    const waveDelay = index < EFFECT_COUNTS.grand / 2 ? 0 : 0.34
    particle.style.setProperty('--effect-delay', `${waveDelay + randomBetween(0, 0.08)}s`)
    particle.style.setProperty('--effect-duration', `${randomBetween(1.7, 2.8)}s`)
    particle.style.setProperty('--effect-rotate', `${randomBetween(-540, 540)}deg`)
    container.append(particle)
  }

  for (let index = 0; index < 12; index += 1) {
    const star = createParticle('celebration-particle grand-star', colours[index % colours.length])
    star.style.setProperty('--star-angle', `${index * 30}deg`)
    star.style.setProperty('--star-distance', `${randomBetween(8, 14)}rem`)
    star.style.setProperty('--effect-delay', `${randomBetween(0, 0.1)}s`)
    container.append(star)
  }
}

function createSecondPrizeEffect(container, colours) {
  for (let index = 0; index < EFFECT_COUNTS.second; index += 1) {
    const side = index % 2 === 0 ? 'left' : 'right'
    const streamer = createParticle(
      `celebration-particle second-streamer second-streamer-${side}`,
      colours[index % colours.length]
    )
    streamer.style.setProperty('--effect-y', `${randomBetween(8, 82)}%`)
    streamer.style.setProperty('--effect-delay', `${randomBetween(0, 0.12)}s`)
    streamer.style.setProperty('--effect-duration', `${randomBetween(0.9, 1.5)}s`)
    streamer.style.setProperty('--effect-rotate', `${randomBetween(-360, 360)}deg`)
    container.append(streamer)
  }
}

function createThirdPlaceEffect(container, colours) {
  const bronzeColours = ['#a85f23', '#f0c08a', ...colours]

  for (let index = 0; index < EFFECT_COUNTS.third; index += 1) {
    const spark = createParticle(
      `celebration-particle third-spark third-spark-${index % 2}`,
      bronzeColours[index % bronzeColours.length]
    )
    spark.style.setProperty('--effect-x', `${randomBetween(5, 95)}%`)
    spark.style.setProperty('--effect-delay', `${randomBetween(0, 0.16)}s`)
    spark.style.setProperty('--effect-duration', `${randomBetween(1.1, 1.8)}s`)
    spark.style.setProperty('--effect-drift', `${randomBetween(-7, 7)}rem`)
    spark.style.setProperty('--effect-rotate', `${randomBetween(-360, 360)}deg`)
    container.append(spark)
  }
}

function createConsolationEffect(container, colours) {
  for (let index = 0; index < EFFECT_COUNTS.consolation; index += 1) {
    const balloon = createParticle(
      'celebration-particle consolation-balloon',
      colours[index % colours.length]
    )
    const size = randomBetween(1.5, 2.4)
    balloon.style.setProperty('--effect-x', `${randomBetween(3, 94)}%`)
    balloon.style.setProperty('--effect-size', `${size}rem`)
    const drift = randomBetween(-5, 5)
    balloon.style.setProperty('--effect-drift-mid', `${drift * 0.45}rem`)
    balloon.style.setProperty('--effect-drift', `${drift}rem`)
    balloon.style.setProperty('--effect-delay', `${randomBetween(0, 0.28)}s`)
    balloon.style.setProperty('--effect-duration', `${randomBetween(2, 3)}s`)
    container.append(balloon)
  }
}

export function playCelebration(container, tier, colours) {
  container.replaceChildren()
  container.className = `celebration-layer celebration-${tier}`

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return
  }

  const effectColours = colours.filter(Boolean)

  if (tier === 'grand') {
    createGrandEffect(container, effectColours)
    return
  }

  if (tier === 'second') {
    createSecondPrizeEffect(container, effectColours)
    return
  }

  if (tier === 'third') {
    createThirdPlaceEffect(container, effectColours)
    return
  }

  createConsolationEffect(container, effectColours)
}
