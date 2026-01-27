/**
 * Gestion du stockage IndexedDB pour les sessions et vidéos
 * Permet de sauvegarder les données localement de manière persistante
 */

import { openDB, DBSchema, IDBPDatabase } from 'idb'
import type { TrainingSession, Volley, Throw } from '@/types'

/**
 * Schéma de la base de données
 */
interface TrakerDartDB extends DBSchema {
  sessions: {
    key: string
    value: TrainingSession
    indexes: { 'by-date': number }
  }
  volleys: {
    key: string
    value: Volley
    indexes: { 'by-session': string }
  }
  throws: {
    key: string
    value: Throw
    indexes: { 'by-volley': string }
  }
  videos: {
    key: string
    value: { id: string; blob: Blob; createdAt: number }
  }
}

const DB_NAME = 'trakerdart'
const DB_VERSION = 1

let db: IDBPDatabase<TrakerDartDB> | null = null

/**
 * Initialise la base de données IndexedDB
 */
export async function initDB(): Promise<IDBPDatabase<TrakerDartDB>> {
  if (db) return db
  
  db = await openDB<TrakerDartDB>(DB_NAME, DB_VERSION, {
    upgrade(database) {
      // Store des sessions
      if (!database.objectStoreNames.contains('sessions')) {
        const sessionStore = database.createObjectStore('sessions', {
          keyPath: 'id'
        })
        sessionStore.createIndex('by-date', 'createdAt')
      }
      
      // Store des volleys
      if (!database.objectStoreNames.contains('volleys')) {
        const volleyStore = database.createObjectStore('volleys', {
          keyPath: 'id'
        })
        volleyStore.createIndex('by-session', 'sessionId')
      }
      
      // Store des lancers
      if (!database.objectStoreNames.contains('throws')) {
        const throwStore = database.createObjectStore('throws', {
          keyPath: 'id'
        })
        throwStore.createIndex('by-volley', 'volleyId')
      }
      
      // Store des vidéos (Blobs)
      if (!database.objectStoreNames.contains('videos')) {
        database.createObjectStore('videos', {
          keyPath: 'id'
        })
      }
    }
  })
  
  console.log('✅ Base de données IndexedDB initialisée')
  return db
}

/**
 * Sauvegarde une session complète
 */
export async function saveSession(session: TrainingSession): Promise<void> {
  const database = await initDB()
  await database.put('sessions', session)
}

/**
 * Récupère toutes les sessions
 */
export async function getAllSessions(): Promise<TrainingSession[]> {
  const database = await initDB()
  return await database.getAllFromIndex('sessions', 'by-date')
}

/**
 * Récupère une session par ID
 */
export async function getSession(id: string): Promise<TrainingSession | undefined> {
  const database = await initDB()
  return await database.get('sessions', id)
}

/**
 * Supprime une session
 */
export async function deleteSession(id: string): Promise<void> {
  const database = await initDB()
  await database.delete('sessions', id)
}

/**
 * Sauvegarde une volée
 */
export async function saveVolley(volley: Volley): Promise<void> {
  const database = await initDB()
  await database.put('volleys', volley)
}

/**
 * Récupère toutes les volleys d'une session
 */
export async function getVolleysBySession(sessionId: string): Promise<Volley[]> {
  const database = await initDB()
  return await database.getAllFromIndex('volleys', 'by-session', sessionId)
}

/**
 * Sauvegarde un lancer
 */
export async function saveThrow(throwData: Throw): Promise<void> {
  const database = await initDB()
  await database.put('throws', throwData)
}

/**
 * Sauvegarde une vidéo (Blob)
 */
export async function saveVideo(id: string, blob: Blob): Promise<void> {
  const database = await initDB()
  await database.put('videos', {
    id,
    blob,
    createdAt: Date.now()
  })
}

/**
 * Récupère une vidéo par ID
 */
export async function getVideo(id: string): Promise<Blob | undefined> {
  const database = await initDB()
  const record = await database.get('videos', id)
  return record?.blob
}

/**
 * Supprime une vidéo
 */
export async function deleteVideo(id: string): Promise<void> {
  const database = await initDB()
  await database.delete('videos', id)
}

/**
 * Calcule la taille totale utilisée (approximative)
 */
export async function getStorageSize(): Promise<number> {
  if (!navigator.storage || !navigator.storage.estimate) {
    return 0
  }
  
  const estimate = await navigator.storage.estimate()
  return estimate.usage || 0
}

/**
 * Nettoie les anciennes vidéos (> 30 jours)
 */
export async function cleanOldVideos(maxAgeMs: number = 30 * 24 * 60 * 60 * 1000): Promise<number> {
  const database = await initDB()
  const allVideos = await database.getAll('videos')
  const now = Date.now()
  let deletedCount = 0
  
  for (const video of allVideos) {
    if (now - video.createdAt > maxAgeMs) {
      await database.delete('videos', video.id)
      deletedCount++
    }
  }
  
  console.log(`🗑️ ${deletedCount} vidéo(s) ancienne(s) supprimée(s)`)
  return deletedCount
}

/**
 * Exporte toutes les données (pour backup)
 */
export async function exportAllData(): Promise<{
  sessions: TrainingSession[]
  volleys: Volley[]
  throws: Throw[]
}> {
  const database = await initDB()
  
  const sessions = await database.getAll('sessions')
  const volleys = await database.getAll('volleys')
  const throws = await database.getAll('throws')
  
  return { sessions, volleys, throws }
}

/**
 * Efface toutes les données (reset complet)
 */
export async function clearAllData(): Promise<void> {
  const database = await initDB()
  
  const tx = database.transaction(
    ['sessions', 'volleys', 'throws', 'videos'],
    'readwrite'
  )
  
  await Promise.all([
    tx.objectStore('sessions').clear(),
    tx.objectStore('volleys').clear(),
    tx.objectStore('throws').clear(),
    tx.objectStore('videos').clear(),
    tx.done
  ])
  
  console.log('🗑️ Toutes les données ont été effacées')
}
