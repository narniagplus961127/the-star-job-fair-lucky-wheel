const HEX_COLOUR = /^#[0-9a-f]{6}$/i
const VALID_TIERS = new Set(['grand', 'second', 'third', 'consolation'])
const VALID_IMAGE_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp'])
const MAX_CONFIG_SIZE = 1024 * 1024
const MAX_IMAGE_SIZE = 2 * 1024 * 1024

export class ConfigurationError extends Error {
  constructor(key, values = {}) {
    super(key)
    this.name = 'ConfigurationError'
    this.key = key
    this.values = values
  }
}

function hasBilingualText(value) {
  return (
    value &&
    typeof value.en === 'string' &&
    value.en.trim() &&
    typeof value.ms === 'string' &&
    value.ms.trim()
  )
}

function isValidPrize(prize) {
  return (
    prize &&
    typeof prize.id === 'string' &&
    prize.id.trim() &&
    hasBilingualText(prize.name) &&
    Number.isInteger(prize.quantity) &&
    prize.quantity >= 0 &&
    Number.isFinite(prize.probability) &&
    prize.probability > 0 &&
    VALID_TIERS.has(prize.tier) &&
    typeof prize.graphic === 'string' &&
    prize.graphic.trim() &&
    HEX_COLOUR.test(prize.color)
  )
}

export function validateConfiguration(
  config,
  imageFiles = null,
  { preserveInitialQuantity = false } = {}
) {
  if (!config || typeof config !== 'object' || !Array.isArray(config.prizes)) {
    throw new ConfigurationError('errors.invalidRoot')
  }

  const { prizes } = config

  if (prizes.length < 2) {
    throw new ConfigurationError('errors.minimumPrizes')
  }

  prizes.forEach((prize, index) => {
    if (!isValidPrize(prize)) {
      throw new ConfigurationError('errors.invalidPrize', { number: index + 1 })
    }
  })

  const ids = new Set(prizes.map((prize) => prize.id))
  if (ids.size !== prizes.length) {
    throw new ConfigurationError('errors.duplicatePrize')
  }

  const probabilityTotal = prizes.reduce((total, prize) => total + prize.probability, 0)
  if (Math.abs(probabilityTotal - 100) > 0.0001) {
    throw new ConfigurationError('errors.invalidProbability')
  }

  if (imageFiles) {
    const imagesByName = new Map()

    for (const file of imageFiles) {
      if (imagesByName.has(file.name)) {
        throw new ConfigurationError('errors.duplicateImage')
      }

      if (!VALID_IMAGE_TYPES.has(file.type) || file.size > MAX_IMAGE_SIZE) {
        throw new ConfigurationError('errors.invalidImage', { name: file.name })
      }

      imagesByName.set(file.name, file)
    }

    for (const prize of prizes) {
      if (!imagesByName.has(prize.graphic)) {
        throw new ConfigurationError('errors.missingImage', { name: prize.graphic })
      }
    }
  }

  return {
    prizes: prizes.map((prize) => ({
      id: prize.id,
      name: { en: prize.name.en, ms: prize.name.ms },
      quantity: prize.quantity,
      probability: prize.probability,
      tier: prize.tier,
      graphic: prize.graphic,
      color: prize.color,
      initialQuantity:
        preserveInitialQuantity &&
        Number.isInteger(prize.initialQuantity) &&
        prize.initialQuantity >= prize.quantity
          ? prize.initialQuantity
          : prize.quantity
    }))
  }
}

export async function readConfigurationFile(file) {
  if (!file || file.size > MAX_CONFIG_SIZE) {
    throw new ConfigurationError('errors.configTooLarge')
  }

  try {
    return JSON.parse(await file.text())
  } catch {
    throw new ConfigurationError('errors.invalidJson')
  }
}

export function exportableConfiguration(config) {
  return {
    prizes: validateConfiguration(config).prizes.map(({ initialQuantity, ...prize }) => prize)
  }
}
