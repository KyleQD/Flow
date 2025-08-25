// Offline service for handling offline functionality
import { v4 as uuidv4 } from "uuid"

// Database name and version
const DB_NAME = "tourify-offline-db"
const DB_VERSION = 1

// Object store names
const STORE_MESSAGES = "pendingMessages"
const STORE_POSTS = "pendingPosts"
const STORE_PROFILE = "profileData"
const STORE_USERS = "userData"
const STORE_EVENTS = "eventData"

// Open the database
export async function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => {
      reject(request.error)
    }

    request.onsuccess = () => {
      resolve(request.result)
    }

    request.onupgradeneeded = (event) => {
      const db = request.result

      // Create object stores if they don't exist
      if (!db.objectStoreNames.contains(STORE_MESSAGES)) {
        db.createObjectStore(STORE_MESSAGES, { keyPath: "id" })
      }

      if (!db.objectStoreNames.contains(STORE_POSTS)) {
        db.createObjectStore(STORE_POSTS, { keyPath: "id" })
      }

      if (!db.objectStoreNames.contains(STORE_PROFILE)) {
        db.createObjectStore(STORE_PROFILE, { keyPath: "id" })
      }

      if (!db.objectStoreNames.contains(STORE_USERS)) {
        db.createObjectStore(STORE_USERS, { keyPath: "id" })
      }

      if (!db.objectStoreNames.contains(STORE_EVENTS)) {
        db.createObjectStore(STORE_EVENTS, { keyPath: "id" })
      }
    }
  })
}

// Save a message to be sent when online
export async function saveMessageForSync(message: any): Promise<string> {
  const db = await openDatabase()
  const id = message.id || uuidv4()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_MESSAGES], "readwrite")
    const store = transaction.objectStore(STORE_MESSAGES)

    const request = store.put({
      ...message,
      id,
      timestamp: new Date().toISOString(),
      pendingSync: true,
    })

    request.onerror = () => {
      reject(request.error)
    }

    request.onsuccess = () => {
      resolve(id)
    }
  })
}

// Save a post to be published when online
export async function savePostForSync(post: any): Promise<string> {
  const db = await openDatabase()
  const id = post.id || uuidv4()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_POSTS], "readwrite")
    const store = transaction.objectStore(STORE_POSTS)

    const request = store.put({
      ...post,
      id,
      timestamp: new Date().toISOString(),
      pendingSync: true,
    })

    request.onerror = () => {
      reject(request.error)
    }

    request.onsuccess = () => {
      resolve(id)
    }
  })
}

// Save profile data for offline use
export async function saveProfileData(profile: any): Promise<void> {
  const db = await openDatabase()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_PROFILE], "readwrite")
    const store = transaction.objectStore(STORE_PROFILE)

    const request = store.put({
      ...profile,
      lastUpdated: new Date().toISOString(),
    })

    request.onerror = () => {
      reject(request.error)
    }

    request.onsuccess = () => {
      resolve()
    }
  })
}

// Get profile data for offline use
export async function getProfileData(id: string): Promise<any | null> {
  const db = await openDatabase()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_PROFILE], "readonly")
    const store = transaction.objectStore(STORE_PROFILE)

    const request = store.get(id)

    request.onerror = () => {
      reject(request.error)
    }

    request.onsuccess = () => {
      resolve(request.result || null)
    }
  })
}

// Save user data for offline use
export async function saveUserData(user: any): Promise<void> {
  const db = await openDatabase()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_USERS], "readwrite")
    const store = transaction.objectStore(STORE_USERS)

    const request = store.put({
      ...user,
      lastUpdated: new Date().toISOString(),
    })

    request.onerror = () => {
      reject(request.error)
    }

    request.onsuccess = () => {
      resolve()
    }
  })
}

// Get user data for offline use
export async function getUserData(id: string): Promise<any | null> {
  const db = await openDatabase()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_USERS], "readonly")
    const store = transaction.objectStore(STORE_USERS)

    const request = store.get(id)

    request.onerror = () => {
      reject(request.error)
    }

    request.onsuccess = () => {
      resolve(request.result || null)
    }
  })
}

// Save event data for offline use
export async function saveEventData(event: any): Promise<void> {
  const db = await openDatabase()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_EVENTS], "readwrite")
    const store = transaction.objectStore(STORE_EVENTS)

    const request = store.put({
      ...event,
      lastUpdated: new Date().toISOString(),
    })

    request.onerror = () => {
      reject(request.error)
    }

    request.onsuccess = () => {
      resolve()
    }
  })
}

// Get event data for offline use
export async function getEventData(id: string): Promise<any | null> {
  const db = await openDatabase()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_EVENTS], "readonly")
    const store = transaction.objectStore(STORE_EVENTS)

    const request = store.get(id)

    request.onerror = () => {
      reject(request.error)
    }

    request.onsuccess = () => {
      resolve(request.result || null)
    }
  })
}

// Get all pending messages
export async function getPendingMessages(): Promise<any[]> {
  const db = await openDatabase()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_MESSAGES], "readonly")
    const store = transaction.objectStore(STORE_MESSAGES)

    const request = store.getAll()

    request.onerror = () => {
      reject(request.error)
    }

    request.onsuccess = () => {
      resolve(request.result || [])
    }
  })
}

// Get all pending posts
export async function getPendingPosts(): Promise<any[]> {
  const db = await openDatabase()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_POSTS], "readonly")
    const store = transaction.objectStore(STORE_POSTS)

    const request = store.getAll()

    request.onerror = () => {
      reject(request.error)
    }

    request.onsuccess = () => {
      resolve(request.result || [])
    }
  })
}

// Remove a pending message
export async function removePendingMessage(id: string): Promise<void> {
  const db = await openDatabase()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_MESSAGES], "readwrite")
    const store = transaction.objectStore(STORE_MESSAGES)

    const request = store.delete(id)

    request.onerror = () => {
      reject(request.error)
    }

    request.onsuccess = () => {
      resolve()
    }
  })
}

// Remove a pending post
export async function removePendingPost(id: string): Promise<void> {
  const db = await openDatabase()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_POSTS], "readwrite")
    const store = transaction.objectStore(STORE_POSTS)

    const request = store.delete(id)

    request.onerror = () => {
      reject(request.error)
    }

    request.onsuccess = () => {
      resolve()
    }
  })
}

// Check if the browser is online
export function isOnline(): boolean {
  return navigator.onLine
}

// Register for online/offline events
export function registerConnectivityListeners(onlineCallback: () => void, offlineCallback: () => void): () => void {
  const handleOnline = () => {
    onlineCallback()
  }

  const handleOffline = () => {
    offlineCallback()
  }

  window.addEventListener("online", handleOnline)
  window.addEventListener("offline", handleOffline)

  // Return a cleanup function
  return () => {
    window.removeEventListener("online", handleOnline)
    window.removeEventListener("offline", handleOffline)
  }
}

// Request background sync
export async function requestBackgroundSync(tag: string): Promise<boolean> {
  if ("serviceWorker" in navigator && "SyncManager" in window) {
    try {
      const registration = await navigator.serviceWorker.ready
      // Type assertion for background sync API
      const syncManager = (registration as any).sync
      if (syncManager) {
        await syncManager.register(tag)
        return true
      }
      return false
    } catch (error) {
      console.error("Background sync registration failed:", error)
      return false
    }
  }
  return false
}
