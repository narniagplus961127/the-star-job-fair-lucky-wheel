import { ConfigurationError, validateConfiguration } from './configValidator'

export async function loadSampleConfiguration() {
  const response = await fetch('/config/prizes.json', {
    headers: { Accept: 'application/json' }
  })

  if (!response.ok) {
    throw new ConfigurationError('errors.loadFailed')
  }

  return validateConfiguration(await response.json())
}

export function sampleImageUrls(config) {
  return new Map(config.prizes.map((prize) => [prize.graphic, `/images/prizes/${prize.graphic}`]))
}

export function customImageUrls(images) {
  return new Map(images.map(({ name, blob }) => [name, URL.createObjectURL(blob)]))
}

export function revokeCustomImageUrls(imageUrls) {
  for (const url of imageUrls.values()) {
    if (url.startsWith('blob:')) {
      URL.revokeObjectURL(url)
    }
  }
}
