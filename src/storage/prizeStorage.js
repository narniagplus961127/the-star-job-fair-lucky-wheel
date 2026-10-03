const DATABASE_NAME = 'star-job-fair-wheel'
const DATABASE_VERSION = 1
const STORE_NAME = 'game-state'
const ACTIVE_GAME_KEY = 'active-game'

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION)

    request.onupgradeneeded = () => {
      const database = request.result
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME)
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

async function useStore(mode, operation) {
  const database = await openDatabase()

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, mode)
    const store = transaction.objectStore(STORE_NAME)
    const request = operation(store)
    let result
    let requestError
    let settled = false

    const rejectTransaction = (error) => {
      if (settled) {
        return
      }

      settled = true
      database.close()
      reject(error)
    }

    request.onsuccess = () => {
      result = request.result
    }
    request.onerror = () => {
      requestError = request.error
    }
    transaction.oncomplete = () => {
      settled = true
      database.close()
      resolve(result)
    }
    transaction.onerror = () => rejectTransaction(requestError || transaction.error)
    transaction.onabort = () => rejectTransaction(requestError || transaction.error)
  })
}

export function loadActiveGame() {
  return useStore('readonly', (store) => store.get(ACTIVE_GAME_KEY))
}

export function saveActiveGame(record) {
  return useStore('readwrite', (store) => store.put(record, ACTIVE_GAME_KEY))
}
