export default {
  common: {
    skip: 'Langkau ke permainan',
    close: 'Tutup',
    continue: 'Teruskan',
    or: 'atau'
  },
  header: {
    title: 'Roda Bertuah Pameran Kerjaya',
    home: 'Halaman utama Roda Bertuah Pameran Kerjaya',
    eyebrow: 'Pameran Kerjaya The Star 2026',
    language: 'Bahasa',
    manage: 'Urus permainan'
  },
  game: {
    eyebrow: 'Cuba nasib anda',
    title: 'Putar. Menang. Raikan.',
    description:
      'Putar sekali bagi setiap sesi peserta untuk peluang memenangi salah satu hadiah yang tersedia.',
    spin: 'Putar roda',
    loading: 'Sedang menyediakan roda…',
    ready: 'Hadiah tersedia: {{count}}',
    spinning: 'Roda sedang berputar…',
    soldOutLabel: 'HABIS',
    empty: 'Semua hadiah telah dimenangi. Terima kasih kerana bermain!',
    emptyTitle: 'Tiada hadiah berbaki',
    emptyDescription:
      'Semua hadiah telah dimenangi. Tetapkan semula inventori dalam Urus permainan untuk meneruskan.',
    wheelLabel: 'Roda hadiah dengan {{count}} jenis hadiah'
  },
  inventory: {
    title: 'Baki hadiah',
    localNote: 'Inventori disimpan pada pelayar dan peranti ini.',
    remaining: '{{count}} berbaki',
    out: 'Kehabisan stok',
    grand: 'Hadiah utama',
    second: 'Hadiah kedua',
    third: 'Tempat ketiga',
    consolation: 'Hadiah sagu hati'
  },
  result: {
    grandKicker: 'Hadiah utama!',
    secondKicker: 'Kemenangan hebat!',
    thirdKicker: 'Tempat ketiga!',
    consolationKicker: 'Anda menang!',
    message: 'Tahniah—anda telah memenangi {{prize}}.',
    imageAlt: 'Grafik hadiah {{prize}}'
  },
  setup: {
    tabsLabel: 'Pengurusan permainan',
    tabLoad: 'Muat permainan',
    tabGuide: 'Panduan JSON',
    tabInventory: 'Inventori',
    jsonExampleTitle: 'Contoh konfigurasi JSON',
    jsonExampleDescription:
      'Gunakan struktur ini untuk setiap permainan tersuai. Tambahkan satu objek dalam tatasusunan prizes bagi setiap hadiah unik.',
    jsonRulesTitle: 'Peraturan medan JSON',
    ruleId: 'ID teks yang unik dan tidak kosong untuk hadiah.',
    ruleName: 'Nama hadiah dalam kedua-dua bahasa yang disokong.',
    ruleQuantity: 'Nombor bulat sifar atau lebih besar.',
    ruleProbability: 'Nombor positif. Jumlah kebarangkalian awal semua hadiah mestilah 100.',
    ruleTier: 'grand, second, third atau consolation.',
    ruleGraphic: 'Nama fail imej yang tepat, termasuk sambungan fail.',
    ruleColor: 'Warna perenambelasan enam digit.',
    uploadGuideTitle: 'Cara memuat naik permainan tersuai',
    uploadStepConfig:
      'Sediakan satu fail JSON menggunakan tab Panduan JSON dan sertakan sekurang-kurangnya dua hadiah. Saiz fail tidak boleh melebihi 1 MB.',
    uploadStepImages:
      'Sediakan setiap imej yang dinamakan dalam graphic. Gunakan fail PNG, JPEG atau WebP sehingga 2 MB setiap satu.',
    uploadStepSelect:
      'Pilih fail JSON, kemudian pilih semua imej hadiah yang dirujuk secara serentak.',
    uploadStepLoad:
      'Pilih Muatkan permainan tersuai. Fail akan disahkan sebelum menggantikan permainan aktif.',
    uploadGuideNote:
      'JSON dan imej dipilih secara berasingan. Setiap nama fail imej mesti sepadan tepat dengan nilai graphic, termasuk huruf besar dan sambungan fail.',
    viewJsonGuide: 'Lihat format JSON',
    eyebrow: 'Tetapan permainan',
    title: 'Urus permainan',
    intro: 'Muatkan permainan, semak format JSON atau urus inventori hadiah semasa.',
    sample: 'Muatkan permainan contoh',
    configLabel: 'Fail konfigurasi',
    configHelp: 'Pilih satu fail JSON.',
    imagesLabel: 'Imej hadiah',
    imagesHelp:
      'Anda boleh memilih beberapa imej serentak. Sertakan semua imej yang dirujuk dalam JSON (PNG, JPEG atau WebP, sehingga 2 MB setiap satu).',
    load: 'Muatkan permainan tersuai',
    loading: 'Sedang memuatkan permainan…',
    inventoryTitle: 'Kawalan inventori',
    inventoryDescription:
      'Pulihkan setiap hadiah kepada kuantiti asalnya. Tindakan ini menggantikan baki kuantiti semasa.',
    export: 'Eksport JSON semasa',
    reset: 'Tetapkan semula inventori',
    resetConfirm: 'Tetapkan semula semua hadiah kepada kuantiti asal?',
    replaceConfirm: 'Gantikan permainan semasa dan inventori yang disimpan?',
    resetDone: 'Inventori hadiah telah ditetapkan semula.',
    customLoaded: 'Permainan tersuai berjaya dimuatkan.',
    sampleLoaded: 'Permainan contoh berjaya dimuatkan.'
  },
  errors: {
    loadFailed: 'Permainan tidak dapat dimuatkan. Sila cuba lagi.',
    configRequired: 'Pilih fail konfigurasi JSON.',
    imagesRequired: 'Pilih semua fail imej hadiah yang dirujuk oleh konfigurasi JSON.',
    invalidJson: 'Fail konfigurasi tidak mengandungi JSON yang sah.',
    configTooLarge: 'Fail konfigurasi mesti lebih kecil daripada 1 MB.',
    invalidRoot: 'Konfigurasi mesti mengandungi senarai hadiah.',
    minimumPrizes: 'Tambahkan sekurang-kurangnya dua hadiah pada konfigurasi.',
    invalidPrize: 'Hadiah {{number}} tidak mempunyai maklumat yang diperlukan atau sah.',
    duplicatePrize: 'Setiap hadiah mesti mempunyai ID yang unik.',
    invalidProbability: 'Jumlah kebarangkalian hadiah mestilah 100.',
    duplicateImage: 'Nama fail imej hadiah mestilah unik.',
    missingImage: 'Pilih fail imej “{{name}}”.',
    invalidImage: '“{{name}}” mestilah imej PNG, JPEG atau WebP tidak melebihi 2 MB.',
    storageFailed: 'Pelayar tidak dapat menyimpan permainan. Semak kebenaran storan laman.',
    noGame: 'Muatkan permainan sebelum menggunakan kawalan ini.'
  },
  footer: {
    note: 'Laman web demo untuk penilaian praktikal.'
  }
}
