function secureRandomUnit() {
  const values = new Uint32Array(1)
  crypto.getRandomValues(values)
  return values[0] / 2 ** 32
}

export function selectPrize(prizes, randomUnit = secureRandomUnit) {
  const availablePrizes = prizes.filter((prize) => prize.quantity > 0)

  if (!availablePrizes.length) {
    return null
  }

  const totalWeight = availablePrizes.reduce((total, prize) => total + prize.probability, 0)
  const winningPoint = randomUnit() * totalWeight
  let accumulatedWeight = 0

  for (const prize of availablePrizes) {
    accumulatedWeight += prize.probability
    if (winningPoint < accumulatedWeight) {
      return prize
    }
  }

  return availablePrizes.at(-1)
}
