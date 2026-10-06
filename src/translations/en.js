export default {
  common: {
    skip: 'Skip to game',
    close: 'Close',
    continue: 'Continue',
    or: 'or'
  },
  header: {
    title: 'Job Fair Lucky Wheel',
    home: 'Job Fair Lucky Wheel home',
    eyebrow: 'The Star Job Fair 2026',
    language: 'Language',
    manage: 'Manage game'
  },
  game: {
    eyebrow: 'Try your luck',
    title: 'Spin. Win. Celebrate.',
    description: 'Spin once per attendee session for a chance to win one of the available prizes.',
    spin: 'Spin the wheel',
    loading: 'Preparing the wheel…',
    ready: 'Prizes available: {{count}}',
    spinning: 'The wheel is spinning…',
    soldOutLabel: 'SOLD OUT',
    empty: 'All prizes have been won. Thank you for playing!',
    emptyTitle: 'No prizes remaining',
    emptyDescription: 'All prizes have been won. Reset the inventory in Manage game to continue.',
    wheelLabel: 'Prize wheel with {{count}} prize types'
  },
  inventory: {
    title: 'Prizes remaining',
    localNote: 'Inventory is saved on this browser and device.',
    remaining: '{{count}} remaining',
    out: 'Out of stock',
    grand: 'Grand prize',
    second: 'Second prize',
    third: 'Third place',
    consolation: 'Consolation prize'
  },
  result: {
    grandKicker: 'Grand prize!',
    secondKicker: 'Fantastic win!',
    thirdKicker: 'Third place!',
    consolationKicker: 'You won!',
    message: 'Congratulations—you have won {{prize}}.',
    imageAlt: '{{prize}} prize graphic'
  },
  setup: {
    tabsLabel: 'Game management',
    tabLoad: 'Load game',
    tabGuide: 'JSON guide',
    tabInventory: 'Inventory',
    jsonExampleTitle: 'JSON configuration example',
    jsonExampleDescription:
      'Use this structure for every custom game. Add one object to the prizes array for each unique prize.',
    jsonRulesTitle: 'JSON field rules',
    ruleId: 'A unique, non-empty text ID for the prize.',
    ruleName: 'Prize names in both supported languages.',
    ruleQuantity: 'A whole number of zero or greater.',
    ruleProbability: 'A positive number. All initial prize probabilities must total 100.',
    ruleTier: 'grand, second, third or consolation.',
    ruleGraphic: 'The exact image filename, including its extension.',
    ruleColor: 'A six-digit hexadecimal colour.',
    uploadGuideTitle: 'How to upload a custom game',
    uploadStepConfig:
      'Prepare one JSON file using the JSON guide tab and include at least two prizes. The file must be no larger than 1 MB.',
    uploadStepImages:
      'Prepare every image named in graphic. Use PNG, JPEG or WebP files up to 2 MB each.',
    uploadStepSelect: 'Choose the JSON file, then select all referenced prize images together.',
    uploadStepLoad:
      'Select Load custom game. The files are validated before replacing the active game.',
    uploadGuideNote:
      'JSON and images are selected separately. Every image filename must exactly match its graphic value, including uppercase letters and the file extension.',
    viewJsonGuide: 'View JSON format',
    eyebrow: 'Game setup',
    title: 'Manage game',
    intro: 'Load a game, review the JSON format or manage the current prize inventory.',
    sample: 'Load sample game',
    configLabel: 'Configuration file',
    configHelp: 'Select one JSON file.',
    imagesLabel: 'Prize images',
    imagesHelp: 'Select the PNG, JPEG or WebP files referenced by the JSON.',
    load: 'Load custom game',
    loading: 'Loading game…',
    inventoryTitle: 'Inventory controls',
    inventoryDescription:
      'Restore every prize to its original quantity. This replaces the current remaining quantities.',
    export: 'Export current JSON',
    reset: 'Reset inventory',
    resetConfirm: 'Reset every prize to its original quantity?',
    replaceConfirm: 'Replace the current game and its saved inventory?',
    resetDone: 'Prize inventory has been reset.',
    customLoaded: 'Custom game loaded successfully.',
    sampleLoaded: 'Sample game loaded successfully.'
  },
  errors: {
    loadFailed: 'The game could not be loaded. Please try again.',
    configRequired: 'Select a JSON configuration file.',
    imagesRequired: 'Select all prize image files referenced by the JSON configuration.',
    invalidJson: 'The configuration file does not contain valid JSON.',
    configTooLarge: 'The configuration file must be smaller than 1 MB.',
    invalidRoot: 'The configuration must contain a prizes list.',
    minimumPrizes: 'Add at least two prizes to the configuration.',
    invalidPrize: 'Prize {{number}} is missing required or valid information.',
    duplicatePrize: 'Every prize must have a unique ID.',
    invalidProbability: 'Prize probabilities must total 100.',
    duplicateImage: 'Prize image filenames must be unique.',
    missingImage: 'Select the image file “{{name}}”.',
    invalidImage: '“{{name}}” must be a PNG, JPEG or WebP image no larger than 2 MB.',
    storageFailed: 'The browser could not save the game. Check site storage permissions.',
    noGame: 'Load a game before using this control.'
  },
  footer: {
    note: 'Demo website for the practical assessment.'
  }
}
