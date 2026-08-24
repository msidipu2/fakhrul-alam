import { SiteContent, Project } from '@/lib/types'
import {
  DEFAULT_SITE_CONTENT,
  DEFAULT_PROJECTS,
  getSiteContent as getFirestoreContent,
  saveSiteContent as saveFirestoreContent,
  getProjects as getFirestoreProjects,
  addProject as addFirestoreProject,
  updateProject as updateFirestoreProject,
  deleteProject as deleteFirestoreProject,
} from '@/lib/firestore-service'
import { isFirebaseConfigured } from '@/lib/firebase'

const CONTENT_STORAGE_KEY = 'fakhrul_portfolio_content_v2'
const PROJECTS_STORAGE_KEY = 'fakhrul_portfolio_projects_v2'
const INITIALIZED_KEY = 'fakhrul_portfolio_initialized_v2'

export const PORTFOLIO_UPDATE_EVENT = 'fakhrul_portfolio_updated'

function notifyUpdate() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(PORTFOLIO_UPDATE_EVENT))
  }
}

/* -------------------------------------------------------------------------- */
/*                               SITE CONTENT                                 */
/* -------------------------------------------------------------------------- */

export function getLocalSiteContent(): SiteContent {
  if (typeof window === 'undefined') return DEFAULT_SITE_CONTENT
  try {
    const raw = localStorage.getItem(CONTENT_STORAGE_KEY)
    if (raw) {
      return JSON.parse(raw)
    }
  } catch (err) {
    console.warn('Failed to parse site content from localStorage:', err)
  }
  return DEFAULT_SITE_CONTENT
}

export function setLocalSiteContent(content: SiteContent): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(CONTENT_STORAGE_KEY, JSON.stringify(content))
  } catch (e) {
    console.warn('Storage quota warning:', e)
  }
  notifyUpdate()
}

export async function fetchLiveSiteContent(): Promise<SiteContent> {
  const local = getLocalSiteContent()
  if (isFirebaseConfigured) {
    try {
      const remote = await getFirestoreContent()
      if (remote && remote.profile?.name) {
        setLocalSiteContent(remote)
        return remote
      }
    } catch {
      // Silently return local
    }
  }
  return local
}

export function updateLiveSiteContent(content: SiteContent): void {
  // 1. Immediately save locally and notify all tabs
  setLocalSiteContent(content)

  // 2. Sync to Firestore in background without blocking
  if (isFirebaseConfigured) {
    saveFirestoreContent(content).catch((err) =>
      console.warn('Firestore sync warning:', err)
    )
  }
}

/* -------------------------------------------------------------------------- */
/*                                 PROJECTS                                   */
/* -------------------------------------------------------------------------- */

export function getLocalProjects(): Project[] {
  if (typeof window === 'undefined') return DEFAULT_PROJECTS
  try {
    const raw = localStorage.getItem(PROJECTS_STORAGE_KEY)
    const isInitialized = localStorage.getItem(INITIALIZED_KEY)
    if (raw) {
      return JSON.parse(raw)
    }
    if (isInitialized === 'true') {
      return []
    }
  } catch (err) {
    console.warn('Failed to parse projects from localStorage:', err)
  }
  return DEFAULT_PROJECTS
}

export function setLocalProjects(projects: Project[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects))
    localStorage.setItem(INITIALIZED_KEY, 'true')
  } catch (e) {
    console.warn('Storage quota warning:', e)
  }
  notifyUpdate()
}

export async function fetchLiveProjects(): Promise<Project[]> {
  const local = getLocalProjects()
  if (isFirebaseConfigured) {
    try {
      const remote = await getFirestoreProjects()
      if (remote && remote.length > 0) {
        setLocalProjects(remote)
        return remote
      }
    } catch {
      // Silently return local
    }
  }
  return local
}

export function createLiveProject(projectData: Omit<Project, 'id' | 'createdAt'>): Project {
  const newId = `proj_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
  const newProject: Project = {
    id: newId,
    ...projectData,
    createdAt: new Date().toISOString(),
  }

  // 1. Save locally immediately (instant 0ms)
  const current = getLocalProjects()
  const updated = [newProject, ...current]
  setLocalProjects(updated)

  // 2. Sync to Firestore in background
  if (isFirebaseConfigured) {
    addFirestoreProject(projectData)
      .then((firestoreId) => {
        newProject.id = firestoreId
        setLocalProjects([newProject, ...current])
      })
      .catch((err) => console.warn('Firestore create sync warning:', err))
  }

  return newProject
}

export function updateLiveProject(id: string, updates: Partial<Project>): void {
  // 1. Update locally immediately
  const current = getLocalProjects()
  const updated = current.map((p) => (p.id === id ? { ...p, ...updates } : p))
  setLocalProjects(updated)

  // 2. Sync to Firestore in background
  if (isFirebaseConfigured) {
    updateFirestoreProject(id, updates).catch((err) =>
      console.warn('Firestore update sync warning:', err)
    )
  }
}

export function deleteLiveProject(id: string): void {
  // 1. Delete locally immediately
  const current = getLocalProjects()
  const updated = current.filter((p) => p.id !== id)
  setLocalProjects(updated)

  // 2. Sync deletion to Firestore in background
  if (isFirebaseConfigured) {
    deleteFirestoreProject(id).catch((err) =>
      console.warn('Firestore delete sync warning:', err)
    )
  }
}
