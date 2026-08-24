import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore'
import { db, isFirebaseConfigured } from '@/lib/firebase'
import { Project, Achievement, SiteContent } from '@/lib/types'
import {
  profile as defaultProfile,
  stats as defaultStats,
  socials as defaultSocials,
  aboutStory as defaultAbout,
  expertise as defaultExpertise,
  journey as defaultJourney,
  clients as defaultClients,
  reel as defaultReels,
} from '@/lib/site-content'

/**
 * Sanitizes object by removing any `undefined` values that Firestore rejects.
 */
function sanitizeForFirestore<T extends Record<string, any>>(obj: T): T {
  const result: any = {}
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined) continue
    if (value !== null && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
      result[key] = sanitizeForFirestore(value)
    } else if (Array.isArray(value)) {
      result[key] = value.map((item) =>
        item !== null && typeof item === 'object' && !(item instanceof Date)
          ? sanitizeForFirestore(item)
          : item
      )
    } else {
      result[key] = value
    }
  }
  return result
}

export const DEFAULT_SITE_CONTENT: SiteContent = {
  profile: defaultProfile,
  heroBeautyPass: {
    imageUrl: '/renders/hero-asset.png',
    caption: 'Latest beauty pass — hard-surface asset',
    renderEngine: 'Cycles',
    samples: '512 spp',
    resolution: '4096 × 3072',
  },
  stats: [...defaultStats],
  socials: [...defaultSocials],
  aboutStory: defaultAbout,
  email: 'contact@fakhrulalam.com',
  expertise: defaultExpertise.map((e) => ({
    index: e.index,
    title: e.title,
    description: e.description,
    tools: [...e.tools],
  })),
  journey: [...defaultJourney],
  clients: [...defaultClients],
}

// Convert default reels to initial Project objects
export const DEFAULT_PROJECTS: Project[] = defaultReels.map((item, idx) => ({
  id: `default-${idx}`,
  title: item.title,
  category:
    idx % 3 === 0
      ? 'game-asset'
      : idx % 3 === 1
      ? '3d-viz'
      : 'graphic-design',
  description: item.alt || '',
  imageUrl: item.poster || '/renders/hero-asset.png',
  videoUrl: item.src || '',
  width: 1920,
  height: 1080,
  order: idx,
  featured: Boolean(item.featured),
}))

/* -------------------------------------------------------------------------- */
/*                               SITE CONTENT CRUD                            */
/* -------------------------------------------------------------------------- */

export async function getSiteContent(): Promise<SiteContent> {
  if (!db || !isFirebaseConfigured) {
    return DEFAULT_SITE_CONTENT
  }

  try {
    const docRef = doc(db, 'siteContent', 'main')
    const snap = await getDoc(docRef)
    if (snap.exists()) {
      return snap.data() as SiteContent
    }
    return DEFAULT_SITE_CONTENT
  } catch (error) {
    console.warn('Could not fetch siteContent from Firestore, using defaults:', error)
    return DEFAULT_SITE_CONTENT
  }
}

export async function saveSiteContent(content: Partial<SiteContent>): Promise<void> {
  if (!db) throw new Error('Firebase Firestore is not initialized.')
  const docRef = doc(db, 'siteContent', 'main')
  const cleanData = sanitizeForFirestore(content)
  await setDoc(docRef, cleanData, { merge: true })
}

/* -------------------------------------------------------------------------- */
/*                               PROJECTS CRUD                                */
/* -------------------------------------------------------------------------- */

export async function getProjects(): Promise<Project[]> {
  if (!db || !isFirebaseConfigured) {
    return DEFAULT_PROJECTS
  }

  try {
    const q = query(collection(db, 'projects'), orderBy('order', 'asc'))
    const snap = await getDocs(q)
    
    // Check if the user has explicitly initialized/cleared the collection
    const metadataDoc = await getDoc(doc(db, 'siteContent', 'metadata'))
    const isInitialized = metadataDoc.exists()

    if (snap.empty && !isInitialized) {
      return DEFAULT_PROJECTS
    }

    return snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as Project[]
  } catch (error) {
    console.warn('Could not fetch projects from Firestore, using defaults:', error)
    return DEFAULT_PROJECTS
  }
}

export async function addProject(project: Omit<Project, 'id' | 'createdAt'>): Promise<string> {
  if (!db) throw new Error('Firebase Firestore is not initialized.')
  
  // Mark metadata as initialized so empty state is respected
  await setDoc(doc(db, 'siteContent', 'metadata'), { initializedAt: serverTimestamp() }, { merge: true })

  const cleanData = sanitizeForFirestore({
    ...project,
    createdAt: serverTimestamp(),
  })

  const docRef = await addDoc(collection(db, 'projects'), cleanData)
  return docRef.id
}

export async function updateProject(id: string, updates: Partial<Project>): Promise<void> {
  if (!db) throw new Error('Firebase Firestore is not initialized.')
  
  const cleanUpdates = sanitizeForFirestore(updates)

  if (id.startsWith('default-')) {
    // If updating a default item, add it to Firestore as a real item
    const defaultIndex = parseInt(id.replace('default-', '')) || 0
    const baseDefault = DEFAULT_PROJECTS[defaultIndex] || DEFAULT_PROJECTS[0]
    const cleanDefault = sanitizeForFirestore({
      ...baseDefault,
      ...cleanUpdates,
      createdAt: serverTimestamp(),
    })
    delete cleanDefault.id

    await addDoc(collection(db, 'projects'), cleanDefault)
    await setDoc(doc(db, 'siteContent', 'metadata'), { initializedAt: serverTimestamp() }, { merge: true })
    return
  }

  const docRef = doc(db, 'projects', id)
  await updateDoc(docRef, cleanUpdates)
}

export async function deleteProject(id: string): Promise<void> {
  if (!db) throw new Error('Firebase Firestore is not initialized.')

  // If deleting a default- ID before full seed, seed the remaining items and mark initialized
  if (id.startsWith('default-')) {
    const q = query(collection(db, 'projects'))
    const snap = await getDocs(q)
    
    if (snap.empty) {
      // Seed all DEFAULT_PROJECTS except this deleted one
      for (const p of DEFAULT_PROJECTS) {
        if (p.id !== id) {
          const { id: _, ...rest } = p
          const cleanProject = sanitizeForFirestore({
            ...rest,
            createdAt: serverTimestamp(),
          })
          await addDoc(collection(db, 'projects'), cleanProject)
        }
      }
    }
    await setDoc(doc(db, 'siteContent', 'metadata'), { initializedAt: serverTimestamp() }, { merge: true })
    return
  }

  const docRef = doc(db, 'projects', id)
  await deleteDoc(docRef)
  await setDoc(doc(db, 'siteContent', 'metadata'), { initializedAt: serverTimestamp() }, { merge: true })
}

/* -------------------------------------------------------------------------- */
/*                            ACHIEVEMENTS CRUD                               */
/* -------------------------------------------------------------------------- */

export async function getAchievements(): Promise<Achievement[]> {
  if (!db || !isFirebaseConfigured) return []

  try {
    const q = query(collection(db, 'achievements'), orderBy('order', 'asc'))
    const snap = await getDocs(q)
    return snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as Achievement[]
  } catch (error) {
    console.warn('Could not fetch achievements from Firestore:', error)
    return []
  }
}

export async function addAchievement(item: Omit<Achievement, 'id'>): Promise<string> {
  if (!db) throw new Error('Firebase Firestore is not initialized.')
  const cleanItem = sanitizeForFirestore(item)
  const docRef = await addDoc(collection(db, 'achievements'), cleanItem)
  return docRef.id
}

export async function updateAchievement(id: string, updates: Partial<Achievement>): Promise<void> {
  if (!db) throw new Error('Firebase Firestore is not initialized.')
  const cleanUpdates = sanitizeForFirestore(updates)
  const docRef = doc(db, 'achievements', id)
  await updateDoc(docRef, cleanUpdates)
}

export async function deleteAchievement(id: string): Promise<void> {
  if (!db) throw new Error('Firebase Firestore is not initialized.')
  const docRef = doc(db, 'achievements', id)
  await deleteDoc(docRef)
}

/* -------------------------------------------------------------------------- */
/*                               SEED DATABASE                                */
/* -------------------------------------------------------------------------- */

export async function seedDatabase(): Promise<{ projectsCount: number; siteContentSeeded: boolean }> {
  if (!db) throw new Error('Firebase Firestore is not initialized.')

  // 1. Seed Site Content
  await saveSiteContent(DEFAULT_SITE_CONTENT)

  // 2. Seed Default Projects
  let seededProjects = 0
  for (const project of DEFAULT_PROJECTS) {
    const { id, ...data } = project
    const cleanProject = sanitizeForFirestore({
      ...data,
      createdAt: serverTimestamp(),
    })
    await addDoc(collection(db, 'projects'), cleanProject)
    seededProjects++
  }

  await setDoc(doc(db, 'siteContent', 'metadata'), { initializedAt: serverTimestamp() }, { merge: true })

  return {
    projectsCount: seededProjects,
    siteContentSeeded: true,
  }
}
