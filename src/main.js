import {
  customImageUrls,
  loadSampleConfiguration,
  revokeCustomImageUrls,
  sampleImageUrls
} from './config/configLoader'
import {
  ConfigurationError,
  exportableConfiguration,
  readConfigurationFile,
  validateConfiguration
} from './config/configValidator'
import { playCelebration } from './effects'
import { selectPrize } from './game/prizeSelector'
import { PrizeWheel } from './game/wheel'
import {
  DEFAULT_LANGUAGE,
  i18next,
  initialiseI18n,
  supportedLanguages,
  translateDocument
} from './i18n'
import { loadActiveGame, saveActiveGame } from './storage/prizeStorage'

const WIN_REVEAL_PAUSE_MS = 60

const elements = {
  language: document.querySelector('#language-select'),
  canvas: document.querySelector('#prize-wheel'),
  spin: document.querySelector('#spin-button'),
  wheelSpin: document.querySelector('#wheel-spin-button'),
  wheelEmptyState: document.querySelector('#wheel-empty-state'),
  spinHint: document.querySelector('#spin-hint'),
  status: document.querySelector('#game-status'),
  prizeList: document.querySelector('#prize-list'),
  totalRemaining: document.querySelector('#total-remaining'),
  setupDialog: document.querySelector('#setup-dialog'),
  openSetup: document.querySelector('#open-setup'),
  closeSetup: document.querySelector('#close-setup'),
  setupTabs: [...document.querySelectorAll('.setup-tab')],
  setupTabPanels: [...document.querySelectorAll('.setup-tab-panel')],
  viewJsonGuide: document.querySelector('#view-json-guide'),
  loadSample: document.querySelector('#load-sample'),
  customForm: document.querySelector('#custom-game-form'),
  configFile: document.querySelector('#config-file'),
  imageFiles: document.querySelector('#image-files'),
  setupError: document.querySelector('#setup-error'),
  loadCustom: document.querySelector('#load-custom'),
  exportConfig: document.querySelector('#export-config'),
  resetInventory: document.querySelector('#reset-inventory'),
  resultDialog: document.querySelector('#result-dialog'),
  resultKicker: document.querySelector('#result-kicker'),
  resultImage: document.querySelector('#result-image'),
  resultTitle: document.querySelector('#result-title'),
  resultMessage: document.querySelector('#result-message'),
  closeResult: document.querySelector('#close-result'),
  celebration: document.querySelector('#celebration-layer')
}

const wheel = new PrizeWheel(elements.canvas)
let activeRecord = null
let imageUrls = new Map()
let isSpinning = false

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function wait(milliseconds) {
  return new Promise((resolve) => window.setTimeout(resolve, milliseconds))
}

function translatedPrizeName(prize) {
  return prize.name[i18next.language] || prize.name.en
}

function setNotice(message = '', type = 'info') {
  elements.status.hidden = !message
  elements.status.textContent = message
  elements.status.dataset.type = type
}

function setSetupError(error) {
  let message = i18next.t('errors.loadFailed')

  if (error instanceof ConfigurationError) {
    message = i18next.t(error.key, error.values)
  } else if (error?.name === 'QuotaExceededError') {
    message = i18next.t('errors.storageFailed')
  }

  elements.setupError.textContent = message
  elements.setupError.hidden = false
}

function clearSetupError() {
  elements.setupError.hidden = true
  elements.setupError.textContent = ''
}

function activateSetupTab(activeTab, { focus = false } = {}) {
  const activePanelId = activeTab.getAttribute('aria-controls')

  elements.setupTabs.forEach((tab) => {
    const isActive = tab === activeTab
    tab.classList.toggle('is-active', isActive)
    tab.setAttribute('aria-selected', String(isActive))
    tab.tabIndex = isActive ? 0 : -1
  })

  elements.setupTabPanels.forEach((panel) => {
    panel.hidden = panel.id !== activePanelId
  })

  if (focus) {
    activeTab.focus()
  }
}

function handleSetupTabKeydown(event) {
  const currentIndex = elements.setupTabs.indexOf(event.currentTarget)
  const lastIndex = elements.setupTabs.length - 1
  let nextIndex = currentIndex

  if (event.key === 'ArrowRight') {
    nextIndex = currentIndex === lastIndex ? 0 : currentIndex + 1
  } else if (event.key === 'ArrowLeft') {
    nextIndex = currentIndex === 0 ? lastIndex : currentIndex - 1
  } else if (event.key === 'Home') {
    nextIndex = 0
  } else if (event.key === 'End') {
    nextIndex = lastIndex
  } else {
    return
  }

  event.preventDefault()
  activateSetupTab(elements.setupTabs[nextIndex], { focus: true })
}

function updatePageTitle() {
  document.title = i18next.t('header.title')
}

function remainingPrizeCount() {
  return activeRecord
    ? activeRecord.config.prizes.reduce((total, prize) => total + prize.quantity, 0)
    : 0
}

function updateGameAvailability() {
  const remaining = remainingPrizeCount()
  elements.totalRemaining.textContent = String(remaining)
  elements.spin.disabled = !activeRecord || isSpinning || remaining === 0
  elements.wheelSpin.disabled = !activeRecord || isSpinning || remaining === 0
  elements.wheelEmptyState.hidden =
    !activeRecord || remaining > 0 || isSpinning || elements.resultDialog.open

  if (isSpinning) {
    elements.spinHint.textContent = i18next.t('game.spinning')
  } else if (remaining === 0) {
    elements.spinHint.textContent = i18next.t('game.empty')
  } else {
    elements.spinHint.textContent = i18next.t('game.ready', { count: remaining })
  }
}

function createInventoryItem(prize) {
  const article = document.createElement('article')
  article.className = 'prize-card'
  article.classList.toggle('is-empty', prize.quantity === 0)

  const image = document.createElement('img')
  image.className = 'prize-card-image'
  image.src = imageUrls.get(prize.graphic)
  image.alt = ''

  const content = document.createElement('div')
  content.className = 'prize-card-content'

  const tier = document.createElement('span')
  tier.className = `tier-label tier-${prize.tier}`
  tier.textContent = i18next.t(`inventory.${prize.tier}`)

  const name = document.createElement('h3')
  name.textContent = translatedPrizeName(prize)

  const quantity = document.createElement('p')
  quantity.className = 'prize-quantity'
  quantity.textContent =
    prize.quantity === 0
      ? i18next.t('inventory.out')
      : i18next.t('inventory.remaining', { count: prize.quantity })

  content.append(tier, name, quantity)
  article.append(image, content)

  return article
}

function renderInventory() {
  elements.prizeList.replaceChildren()

  if (!activeRecord) {
    updateGameAvailability()
    return
  }

  const fragment = document.createDocumentFragment()
  activeRecord.config.prizes.forEach((prize) => fragment.append(createInventoryItem(prize)))
  elements.prizeList.append(fragment)
  updateGameAvailability()
}

function imageMapForRecord(record) {
  return record.source === 'custom'
    ? customImageUrls(record.images || [])
    : sampleImageUrls(record.config)
}

async function activateGame(record, { persist = true } = {}) {
  revokeCustomImageUrls(imageUrls)
  activeRecord = record
  imageUrls = imageMapForRecord(record)

  if (persist) {
    await saveActiveGame(record)
  }

  elements.canvas.setAttribute(
    'aria-label',
    i18next.t('game.wheelLabel', { count: record.config.prizes.length })
  )
  await wheel.setData(
    record.config.prizes,
    imageUrls,
    i18next.language,
    i18next.t('game.soldOutLabel')
  )
  renderInventory()
}

async function useSampleGame({ confirmReplacement = false, showNotice = true } = {}) {
  if (confirmReplacement && activeRecord && !window.confirm(i18next.t('setup.replaceConfirm'))) {
    return
  }

  clearSetupError()

  try {
    const config = await loadSampleConfiguration()
    await activateGame({ source: 'sample', config, images: [] })
    elements.setupDialog.close()
    if (showNotice) {
      setNotice(i18next.t('setup.sampleLoaded'), 'success')
    }
  } catch (error) {
    setSetupError(error)
  }
}

async function handleCustomGame(event) {
  event.preventDefault()
  clearSetupError()

  const configFile = elements.configFile.files[0]
  const files = [...elements.imageFiles.files]

  if (!configFile) {
    setSetupError(new ConfigurationError('errors.configRequired'))
    return
  }

  if (!files.length) {
    setSetupError(new ConfigurationError('errors.imagesRequired'))
    return
  }

  elements.loadCustom.disabled = true
  elements.loadCustom.textContent = i18next.t('setup.loading')

  try {
    const rawConfig = await readConfigurationFile(configFile)
    const config = validateConfiguration(rawConfig, files)
    const images = files.map((file) => ({ name: file.name, type: file.type, blob: file }))

    await activateGame({ source: 'custom', config, images })
    elements.customForm.reset()
    elements.setupDialog.close()
    setNotice(i18next.t('setup.customLoaded'), 'success')
  } catch (error) {
    setSetupError(error)
  } finally {
    elements.loadCustom.disabled = false
    elements.loadCustom.textContent = i18next.t('setup.load')
  }
}

async function handleSpin() {
  if (!activeRecord || isSpinning) {
    return
  }

  const winner = selectPrize(activeRecord.config.prizes)
  if (!winner) {
    updateGameAvailability()
    return
  }

  isSpinning = true
  setNotice()
  updateGameAvailability()

  winner.quantity -= 1

  try {
    await saveActiveGame(activeRecord)
    renderInventory()

    const prizeIndex = activeRecord.config.prizes.findIndex((prize) => prize.id === winner.id)
    await wheel.spinTo(prizeIndex)
    wheel.updatePrizes(activeRecord.config.prizes)

    if (!prefersReducedMotion()) {
      await wait(WIN_REVEAL_PAUSE_MS)
    }

    showWinner(winner)
  } catch {
    winner.quantity += 1
    setNotice(i18next.t('errors.storageFailed'), 'error')
  } finally {
    isSpinning = false
    renderInventory()
  }
}

function showWinner(prize) {
  const prizeName = translatedPrizeName(prize)
  const kickerKeys = {
    grand: 'result.grandKicker',
    second: 'result.secondKicker',
    third: 'result.thirdKicker',
    consolation: 'result.consolationKicker'
  }

  elements.resultDialog.dataset.tier = prize.tier
  elements.resultKicker.textContent = i18next.t(kickerKeys[prize.tier])
  elements.resultTitle.textContent = prizeName
  elements.resultMessage.textContent = i18next.t('result.message', { prize: prizeName })
  elements.resultImage.src = imageUrls.get(prize.graphic)
  elements.resultImage.alt = i18next.t('result.imageAlt', { prize: prizeName })
  elements.resultDialog.showModal()
  const theme = getComputedStyle(document.documentElement)
  playCelebration(elements.celebration, prize.tier, [
    theme.getPropertyValue('--color-primary').trim(),
    theme.getPropertyValue('--color-accent').trim(),
    prize.color,
    theme.getPropertyValue('--color-white').trim()
  ])
}

async function resetInventory() {
  if (!activeRecord) {
    setSetupError(new ConfigurationError('errors.noGame'))
    return
  }

  if (!window.confirm(i18next.t('setup.resetConfirm'))) {
    return
  }

  activeRecord.config.prizes.forEach((prize) => {
    prize.quantity = prize.initialQuantity
  })

  try {
    await saveActiveGame(activeRecord)
    wheel.updatePrizes(activeRecord.config.prizes)
    renderInventory()
    elements.setupDialog.close()
    setNotice(i18next.t('setup.resetDone'), 'success')
  } catch {
    setSetupError(new ConfigurationError('errors.storageFailed'))
  }
}

function exportConfiguration() {
  if (!activeRecord) {
    setSetupError(new ConfigurationError('errors.noGame'))
    return
  }

  const json = JSON.stringify(exportableConfiguration(activeRecord.config), null, 2)
  const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }))
  const link = document.createElement('a')
  link.href = url
  link.download = 'job-fair-prizes.json'
  link.click()
  URL.revokeObjectURL(url)
}

async function changeLanguage(language) {
  await i18next.changeLanguage(language)
  localStorage.setItem('job-fair-wheel-language', language)
  translateDocument()
  updatePageTitle()

  if (activeRecord) {
    elements.canvas.setAttribute(
      'aria-label',
      i18next.t('game.wheelLabel', { count: activeRecord.config.prizes.length })
    )
    wheel.setLanguage(language, i18next.t('game.soldOutLabel'))
    renderInventory()
  }
}

function bindEvents() {
  elements.spin.addEventListener('click', handleSpin)
  elements.wheelSpin.addEventListener('click', handleSpin)
  elements.openSetup.addEventListener('click', () => {
    clearSetupError()
    elements.setupDialog.showModal()
  })
  elements.setupTabs.forEach((tab) => {
    tab.addEventListener('click', () => activateSetupTab(tab))
    tab.addEventListener('keydown', handleSetupTabKeydown)
  })
  elements.viewJsonGuide.addEventListener('click', () => {
    activateSetupTab(
      elements.setupTabs.find((tab) => tab.id === 'setup-tab-guide'),
      { focus: true }
    )
  })
  elements.closeSetup.addEventListener('click', () => elements.setupDialog.close())
  elements.closeResult.addEventListener('click', () => elements.resultDialog.close())
  elements.resultDialog.addEventListener('close', () => {
    elements.celebration.replaceChildren()
    updateGameAvailability()
  })
  elements.loadSample.addEventListener('click', () => useSampleGame({ confirmReplacement: true }))
  elements.customForm.addEventListener('submit', handleCustomGame)
  elements.resetInventory.addEventListener('click', resetInventory)
  elements.exportConfig.addEventListener('click', exportConfiguration)
  elements.language.addEventListener('change', (event) => changeLanguage(event.target.value))

  for (const dialog of [elements.setupDialog, elements.resultDialog]) {
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) {
        dialog.close()
      }
    })
  }
}

async function initialise() {
  const savedLanguage = localStorage.getItem('job-fair-wheel-language')
  await initialiseI18n(
    supportedLanguages.includes(savedLanguage) ? savedLanguage : DEFAULT_LANGUAGE
  )
  elements.language.value = i18next.language
  translateDocument()
  updatePageTitle()
  bindEvents()

  try {
    const savedGame = await loadActiveGame()

    if (savedGame?.source === 'sample') {
      const latestSampleConfig = await loadSampleConfiguration()
      const savedQuantities = new Map(
        savedGame.config.prizes.map((prize) => [prize.id, prize.quantity])
      )

      latestSampleConfig.prizes.forEach((prize) => {
        const savedQuantity = savedQuantities.get(prize.id)
        if (Number.isInteger(savedQuantity) && savedQuantity >= 0) {
          prize.quantity = Math.min(savedQuantity, prize.initialQuantity)
        }
      })

      await activateGame({ source: 'sample', config: latestSampleConfig, images: [] })
    } else if (savedGame) {
      savedGame.config = validateConfiguration(savedGame.config, null, {
        preserveInitialQuantity: true
      })
      await activateGame(savedGame, { persist: false })
    } else {
      await useSampleGame({ showNotice: false })
    }
  } catch {
    await useSampleGame({ showNotice: false })
  }
}

initialise().finally(() => {
  document.body.classList.remove('is-loading')
})
