'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  FolderKanban,
  FileText,
  Database,
  Plus,
  Trash2,
  Edit3,
  LogOut,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  ArrowUpRight,
  Layers,
  Milestone,
  Wrench,
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { Project, SiteContent, ProjectCategory, ExpertiseItem, TimelineItem } from '@/lib/types'
import {
  fetchLiveProjects,
  fetchLiveSiteContent,
  createLiveProject,
  updateLiveProject,
  deleteLiveProject,
  updateLiveSiteContent,
  getLocalProjects,
  getLocalSiteContent,
  setLocalProjects,
  setLocalSiteContent,
  PORTFOLIO_UPDATE_EVENT,
} from '@/lib/portfolio-store'
import { DEFAULT_PROJECTS, DEFAULT_SITE_CONTENT, seedDatabase } from '@/lib/firestore-service'
import { compressImage, CompressedImageResult } from '@/lib/image-compressor'
import { extractYouTubeId, getYouTubeThumbnail } from '@/lib/youtube-utils'

export default function AdminDashboardPage() {
  const router = useRouter()
  const { user, loading: authLoading, logout, isDemoMode, isConfigured } = useAuth()

  // Tabs: 'projects' | 'expertise' | 'journey' | 'content' | 'database'
  const [activeTab, setActiveTab] = useState<'projects' | 'expertise' | 'journey' | 'content' | 'database'>('projects')

  // Data states
  const [projects, setProjects] = useState<Project[]>(() => getLocalProjects())
  const [siteContent, setSiteContent] = useState<SiteContent>(() => getLocalSiteContent())
  const [loadingData, setLoadingData] = useState(false)
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // =========================================================================
  // 1. PROJECT MODAL STATE
  // =========================================================================
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [projectForm, setProjectForm] = useState<{
    title: string
    category: ProjectCategory
    description: string
    imageUrl: string
    imagePath?: string
    videoUrl?: string
    width: number
    height: number
    order: number
    featured: boolean
  }>({
    title: '',
    category: 'game-asset',
    description: '',
    imageUrl: '',
    videoUrl: '',
    width: 1920,
    height: 1080,
    order: 0,
    featured: false,
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [compressionResult, setCompressionResult] = useState<CompressedImageResult | null>(null)
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)
  const [uploading, setUploading] = useState(false)

  // =========================================================================
  // 2. EXPERTISE MODAL STATE
  // =========================================================================
  const [isExpertiseModalOpen, setIsExpertiseModalOpen] = useState(false)
  const [editingExpertiseIdx, setEditingExpertiseIdx] = useState<number | null>(null)
  const [expertiseForm, setExpertiseForm] = useState<{
    index: string
    title: string
    description: string
    toolsInput: string
  }>({
    index: '01',
    title: '',
    description: '',
    toolsInput: '',
  })

  // =========================================================================
  // 3. JOURNEY MODAL STATE
  // =========================================================================
  const [isJourneyModalOpen, setIsJourneyModalOpen] = useState(false)
  const [editingJourneyIdx, setEditingJourneyIdx] = useState<number | null>(null)
  const [journeyForm, setJourneyForm] = useState<{
    year: string
    date: string
    title: string
    description: string
  }>({
    year: '',
    date: '',
    title: '',
    description: '',
  })

  // Auth Protection
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/admin/login')
    }
  }, [user, authLoading, router])

  // Non-blocking background sync
  useEffect(() => {
    setProjects(getLocalProjects())
    setSiteContent(getLocalSiteContent())

    async function backgroundSync() {
      try {
        const [fetchedProjects, fetchedContent] = await Promise.all([
          fetchLiveProjects(),
          fetchLiveSiteContent(),
        ])
        if (fetchedProjects && fetchedProjects.length > 0) {
          setProjects(fetchedProjects)
        }
        if (fetchedContent) {
          setSiteContent(fetchedContent)
        }
      } catch {
        // Silently use local cache
      }
    }

    if (user) {
      backgroundSync()
    }

    const handleUpdate = () => {
      setProjects(getLocalProjects())
      setSiteContent(getLocalSiteContent())
    }

    window.addEventListener(PORTFOLIO_UPDATE_EVENT, handleUpdate)
    return () => window.removeEventListener(PORTFOLIO_UPDATE_EVENT, handleUpdate)
  }, [user])

  const showStatus = (type: 'success' | 'error', text: string) => {
    setStatusMessage({ type, text })
    setTimeout(() => setStatusMessage(null), 5000)
  }

  // =========================================================================
  // PROJECTS HANDLERS
  // =========================================================================
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setSelectedFile(file)
    try {
      const compressed = await compressImage(file)
      setCompressionResult(compressed)
      setProjectForm((prev) => ({
        ...prev,
        imageUrl: compressed.dataUrl,
        width: compressed.width,
        height: compressed.height,
      }))
    } catch (err) {
      console.error('Compression preview failed:', err)
      const reader = new FileReader()
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setProjectForm((prev) => ({
            ...prev,
            imageUrl: ev.target!.result as string,
          }))
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSaveProject = (e: React.FormEvent) => {
    e.preventDefault()
    setUploading(true)

    try {
      const finalImageUrl = projectForm.imageUrl || '/renders/hero-asset.png'

      const payload = {
        ...projectForm,
        imageUrl: finalImageUrl,
      }

      if (editingProject && editingProject.id) {
        updateLiveProject(editingProject.id, payload)
        showStatus('success', 'Project updated successfully!')
      } else {
        const created = createLiveProject(payload)
        showStatus('success', 'New project added and published!')

        // Upload to disk in background if file selected
        if (selectedFile) {
          const formData = new FormData()
          formData.append('file', selectedFile)
          fetch('/api/upload', { method: 'POST', body: formData })
            .then((res) => res.json())
            .then((data) => {
              if (data?.url && created.id) {
                updateLiveProject(created.id, { imageUrl: data.url })
              }
            })
            .catch((err) => console.warn('Background disk upload warning:', err))
        }
      }

      setIsProjectModalOpen(false)
      resetProjectForm()
    } catch (err: any) {
      showStatus('error', err.message || 'Failed to save project.')
    } finally {
      setUploading(false)
      setUploadProgress(null)
    }
  }

  const handleDeleteProject = (project: Project) => {
    if (!confirm(`Delete project "${project.title}" permanently?`)) return

    try {
      if (project.id) {
        deleteLiveProject(project.id)
        showStatus('success', 'Project permanently deleted.')
      }
    } catch (err: any) {
      showStatus('error', err.message || 'Failed to delete project.')
    }
  }

  const resetProjectForm = () => {
    setEditingProject(null)
    setSelectedFile(null)
    setCompressionResult(null)
    setProjectForm({
      title: '',
      category: 'game-asset',
      description: '',
      imageUrl: '',
      videoUrl: '',
      width: 1920,
      height: 1080,
      order: projects.length,
      featured: false,
    })
  }

  const openEditProject = (proj: Project) => {
    setEditingProject(proj)
    setProjectForm({
      title: proj.title,
      category: proj.category,
      description: proj.description || '',
      imageUrl: proj.imageUrl,
      imagePath: proj.imagePath,
      videoUrl: proj.videoUrl || '',
      width: proj.width || 1920,
      height: proj.height || 1080,
      order: proj.order,
      featured: proj.featured ?? false,
    })
    setSelectedFile(null)
    setCompressionResult(null)
    setIsProjectModalOpen(true)
  }

  // =========================================================================
  // EXPERTISE HANDLERS (CRUD)
  // =========================================================================
  const openAddExpertise = () => {
    const currentList = siteContent.expertise || []
    const nextIdx = (currentList.length + 1).toString().padStart(2, '0')
    setEditingExpertiseIdx(null)
    setExpertiseForm({
      index: nextIdx,
      title: '',
      description: '',
      toolsInput: '',
    })
    setIsExpertiseModalOpen(true)
  }

  const openEditExpertise = (item: ExpertiseItem, idx: number) => {
    setEditingExpertiseIdx(idx)
    setExpertiseForm({
      index: item.index || (idx + 1).toString().padStart(2, '0'),
      title: item.title,
      description: item.description,
      toolsInput: item.tools?.join(', ') || '',
    })
    setIsExpertiseModalOpen(true)
  }

  const handleSaveExpertise = (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const tools = expertiseForm.toolsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)

      const newItem: ExpertiseItem = {
        index: expertiseForm.index,
        title: expertiseForm.title,
        description: expertiseForm.description,
        tools,
      }

      const currentList = [...(siteContent.expertise || [])]

      if (editingExpertiseIdx !== null && editingExpertiseIdx >= 0) {
        currentList[editingExpertiseIdx] = newItem
      } else {
        currentList.push(newItem)
      }

      const updatedContent: SiteContent = {
        ...siteContent,
        expertise: currentList,
      }

      updateLiveSiteContent(updatedContent)
      setSiteContent(updatedContent)
      setIsExpertiseModalOpen(false)
      showStatus('success', 'Expertise item saved and published!')
    } catch (err: any) {
      showStatus('error', err.message || 'Failed to save expertise.')
    }
  }

  const handleDeleteExpertise = (idx: number) => {
    const item = siteContent.expertise?.[idx]
    if (!confirm(`Delete expertise "${item?.title || 'item'}"?`)) return

    try {
      const updatedList = (siteContent.expertise || []).filter((_, i) => i !== idx)
      const updatedContent: SiteContent = {
        ...siteContent,
        expertise: updatedList,
      }
      updateLiveSiteContent(updatedContent)
      setSiteContent(updatedContent)
      showStatus('success', 'Expertise item deleted.')
    } catch (err: any) {
      showStatus('error', err.message || 'Failed to delete expertise.')
    }
  }

  // =========================================================================
  // JOURNEY HANDLERS (CRUD)
  // =========================================================================
  const openAddJourney = () => {
    setEditingJourneyIdx(null)
    setJourneyForm({
      year: new Date().getFullYear().toString(),
      date: '',
      title: '',
      description: '',
    })
    setIsJourneyModalOpen(true)
  }

  const openEditJourney = (item: TimelineItem, idx: number) => {
    setEditingJourneyIdx(idx)
    setJourneyForm({
      year: item.year || '',
      date: item.date || '',
      title: item.title || '',
      description: item.description || '',
    })
    setIsJourneyModalOpen(true)
  }

  const handleSaveJourney = (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const newItem: TimelineItem = {
        year: journeyForm.year,
        date: journeyForm.date || journeyForm.year,
        title: journeyForm.title,
        description: journeyForm.description,
      }

      const currentList = [...(siteContent.journey || [])]

      if (editingJourneyIdx !== null && editingJourneyIdx >= 0) {
        currentList[editingJourneyIdx] = newItem
      } else {
        currentList.push(newItem)
      }

      const updatedContent: SiteContent = {
        ...siteContent,
        journey: currentList,
      }

      updateLiveSiteContent(updatedContent)
      setSiteContent(updatedContent)
      setIsJourneyModalOpen(false)
      showStatus('success', 'Timeline milestone saved and published!')
    } catch (err: any) {
      showStatus('error', err.message || 'Failed to save milestone.')
    }
  }

  const handleDeleteJourney = (idx: number) => {
    const item = siteContent.journey?.[idx]
    if (!confirm(`Delete milestone "${item?.title || 'entry'}"?`)) return

    try {
      const updatedList = (siteContent.journey || []).filter((_, i) => i !== idx)
      const updatedContent: SiteContent = {
        ...siteContent,
        journey: updatedList,
      }
      updateLiveSiteContent(updatedContent)
      setSiteContent(updatedContent)
      showStatus('success', 'Timeline milestone deleted.')
    } catch (err: any) {
      showStatus('error', err.message || 'Failed to delete milestone.')
    }
  }

  // =========================================================================
  // SITE CONTENT HANDLER
  // =========================================================================
  const handleSaveContent = (e: React.FormEvent) => {
    e.preventDefault()
    try {
      updateLiveSiteContent(siteContent)
      showStatus('success', 'Site content updated and published live!')
    } catch (err: any) {
      showStatus('error', err.message || 'Failed to save site content.')
    }
  }

  const handleSeedDatabase = async () => {
    if (!confirm('This will restore all original portfolio items, expertise, and biography. Proceed?')) return

    try {
      setLocalProjects(DEFAULT_PROJECTS)
      setLocalSiteContent(DEFAULT_SITE_CONTENT)
      setProjects(DEFAULT_PROJECTS)
      setSiteContent(DEFAULT_SITE_CONTENT)

      if (isConfigured) {
        await seedDatabase()
      }
      showStatus('success', 'Portfolio data reset and seeded successfully!')
    } catch (err: any) {
      showStatus('error', err.message || 'Seeding failed.')
    }
  }

  if (authLoading || !user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top HUD Nav */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="group flex items-center gap-2">
              <span className="font-mono text-xs font-semibold uppercase tracking-[0.25em] text-primary">
                FAKHRUL ALAM
              </span>
              <span className="font-mono text-[0.65rem] uppercase tracking-[0.15em] text-muted-foreground">
                / ADMIN HUD
              </span>
            </Link>

            {isDemoMode ? (
              <span className="inline-flex items-center gap-1.5 border border-amber-500/40 bg-amber-500/10 px-2.5 py-0.5 font-mono text-[0.65rem] uppercase tracking-[0.15em] text-amber-400">
                <Sparkles className="size-3" />
                Demo Session
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-0.5 font-mono text-[0.65rem] uppercase tracking-[0.15em] text-emerald-400">
                <CheckCircle2 className="size-3" />
                Connected Live
              </span>
            )}
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 border border-border px-3 py-1.5 font-mono text-[0.7rem] uppercase tracking-[0.15em] text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
            >
              View Live Site
              <ArrowUpRight className="size-3" />
            </Link>

            <button
              onClick={() => logout()}
              className="inline-flex items-center gap-1.5 border border-destructive/40 bg-destructive/10 px-3 py-1.5 font-mono text-[0.7rem] uppercase tracking-[0.15em] text-destructive transition-colors hover:bg-destructive hover:text-destructive-foreground"
            >
              <LogOut className="size-3" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Status Toast Banner */}
        {statusMessage && (
          <div
            className={`mb-6 flex items-center gap-3 border p-4 font-mono text-xs ${
              statusMessage.type === 'success'
                ? 'border-emerald-500/50 bg-emerald-950/40 text-emerald-300'
                : 'border-destructive/50 bg-destructive/10 text-destructive'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="size-4 shrink-0" />
            ) : (
              <AlertTriangle className="size-4 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Tab Selector */}
        <div className="mb-8 flex flex-wrap items-center gap-2 border-b border-border pb-4">
          <button
            onClick={() => setActiveTab('projects')}
            className={`flex items-center gap-2 px-4 py-2 font-mono text-xs uppercase tracking-[0.2em] transition-all ${
              activeTab === 'projects'
                ? 'border-b-2 border-primary bg-card text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <FolderKanban className="size-3.5" />
            [01] Projects ({projects.length})
          </button>

          <button
            onClick={() => setActiveTab('expertise')}
            className={`flex items-center gap-2 px-4 py-2 font-mono text-xs uppercase tracking-[0.2em] transition-all ${
              activeTab === 'expertise'
                ? 'border-b-2 border-primary bg-card text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Wrench className="size-3.5" />
            [02] Expertise ({siteContent.expertise?.length || 0})
          </button>

          <button
            onClick={() => setActiveTab('journey')}
            className={`flex items-center gap-2 px-4 py-2 font-mono text-xs uppercase tracking-[0.2em] transition-all ${
              activeTab === 'journey'
                ? 'border-b-2 border-primary bg-card text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Milestone className="size-3.5" />
            [03] Journey ({siteContent.journey?.length || 0})
          </button>

          <button
            onClick={() => setActiveTab('content')}
            className={`flex items-center gap-2 px-4 py-2 font-mono text-xs uppercase tracking-[0.2em] transition-all ${
              activeTab === 'content'
                ? 'border-b-2 border-primary bg-card text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <FileText className="size-3.5" />
            [04] Bio & Header
          </button>

          <button
            onClick={() => setActiveTab('database')}
            className={`flex items-center gap-2 px-4 py-2 font-mono text-xs uppercase tracking-[0.2em] transition-all ${
              activeTab === 'database'
                ? 'border-b-2 border-primary bg-card text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Database className="size-3.5" />
            [05] System
          </button>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: PROJECTS MANAGEMENT */}
        {/* ========================================================================= */}
        {activeTab === 'projects' && (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-medium tracking-tight">Portfolio Projects</h2>
                <p className="font-mono text-xs text-muted-foreground">
                  Manage 3D Render Assets, Showreels & Categories
                </p>
              </div>

              <button
                onClick={() => {
                  resetProjectForm()
                  setIsProjectModalOpen(true)
                }}
                className="flex items-center gap-2 bg-primary px-4 py-2.5 font-mono text-xs uppercase tracking-[0.2em] text-primary-foreground transition-opacity hover:opacity-85"
              >
                <Plus className="size-4" />
                Add New Project
              </button>
            </div>

            {projects.length === 0 ? (
              <div className="border border-dashed border-border p-12 text-center">
                <FolderKanban className="mx-auto size-8 text-muted-foreground" />
                <p className="mt-3 text-sm text-foreground">No projects found.</p>
                <p className="mt-1 font-mono text-xs text-muted-foreground">
                  Click "Add New Project" above to create one.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {projects.map((proj) => (
                  <div
                    key={proj.id || proj.title}
                    className="hud-corners relative flex flex-col border border-border bg-card p-4 transition-colors hover:border-primary/50"
                  >
                    {/* Thumbnail */}
                    <div className="relative aspect-16/10 w-full overflow-hidden border border-border/60 bg-black/40">
                      <Image
                        src={proj.imageUrl || '/renders/hero-asset.png'}
                        alt={proj.title}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                      <span className="absolute left-2 top-2 bg-background/80 px-2 py-0.5 font-mono text-[0.6rem] uppercase tracking-wider text-primary backdrop-blur-xs">
                        {proj.category}
                      </span>
                      {proj.featured && (
                        <span className="absolute right-2 top-2 bg-primary px-2 py-0.5 font-mono text-[0.6rem] uppercase tracking-wider text-primary-foreground">
                          Featured
                        </span>
                      )}
                    </div>

                    {/* Metadata */}
                    <div className="mt-3 flex flex-1 flex-col justify-between">
                      <div>
                        <h3 className="text-base font-medium">{proj.title}</h3>
                        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                          {proj.description || 'No description provided.'}
                        </p>
                      </div>

                      <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3">
                        <span className="font-mono text-[0.65rem] text-muted-foreground">
                          {proj.width} × {proj.height} px · Order #{proj.order}
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditProject(proj)}
                            className="p-1 text-muted-foreground transition-colors hover:text-primary"
                            title="Edit Project"
                          >
                            <Edit3 className="size-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProject(proj)}
                            className="p-1 text-muted-foreground transition-colors hover:text-destructive"
                            title="Delete Project"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: EXPERTISE MANAGEMENT (CRUD) */}
        {/* ========================================================================= */}
        {activeTab === 'expertise' && (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-medium tracking-tight">Expertise Disciplines</h2>
                <p className="font-mono text-xs text-muted-foreground">
                  Create, Edit, and Reorder Skill Cards & Software Tools
                </p>
              </div>

              <button
                onClick={openAddExpertise}
                className="flex items-center gap-2 bg-primary px-4 py-2.5 font-mono text-xs uppercase tracking-[0.2em] text-primary-foreground transition-opacity hover:opacity-85"
              >
                <Plus className="size-4" />
                Add New Expertise
              </button>
            </div>

            <div className="space-y-4">
              {(!siteContent.expertise || siteContent.expertise.length === 0) ? (
                <div className="border border-dashed border-border p-12 text-center">
                  <Wrench className="mx-auto size-8 text-muted-foreground" />
                  <p className="mt-3 text-sm text-foreground">No expertise items found.</p>
                  <p className="mt-1 font-mono text-xs text-muted-foreground">
                    Click "Add New Expertise" above to create one.
                  </p>
                </div>
              ) : (
                siteContent.expertise.map((item, idx) => (
                  <div
                    key={item.title || idx}
                    className="hud-corners relative flex flex-col justify-between border border-border bg-card p-6 md:flex-row md:items-center"
                  >
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs font-semibold text-primary">
                          {item.index || (idx + 1).toString().padStart(2, '0')}
                        </span>
                        <h3 className="text-lg font-medium tracking-tight">{item.title}</h3>
                      </div>
                      <p className="max-w-3xl text-xs leading-relaxed text-muted-foreground">
                        {item.description}
                      </p>
                      {item.tools && item.tools.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {item.tools.map((tool) => (
                            <span
                              key={tool}
                              className="border border-border/80 bg-background/50 px-2 py-0.5 font-mono text-[0.65rem] uppercase text-muted-foreground"
                            >
                              {tool}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="mt-4 flex items-center gap-2 border-t border-border/60 pt-3 md:mt-0 md:border-t-0 md:pt-0">
                      <button
                        onClick={() => openEditExpertise(item, idx)}
                        className="flex items-center gap-1.5 border border-border px-3 py-1.5 font-mono text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                      >
                        <Edit3 className="size-3.5" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteExpertise(idx)}
                        className="flex items-center gap-1.5 border border-destructive/40 bg-destructive/10 px-3 py-1.5 font-mono text-xs text-destructive transition-colors hover:bg-destructive hover:text-destructive-foreground"
                      >
                        <Trash2 className="size-3.5" />
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: JOURNEY MANAGEMENT (CRUD) */}
        {/* ========================================================================= */}
        {activeTab === 'journey' && (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-medium tracking-tight">Journey & Timeline Milestones</h2>
                <p className="font-mono text-xs text-muted-foreground">
                  Create, Edit, and Delete Career Milestones
                </p>
              </div>

              <button
                onClick={openAddJourney}
                className="flex items-center gap-2 bg-primary px-4 py-2.5 font-mono text-xs uppercase tracking-[0.2em] text-primary-foreground transition-opacity hover:opacity-85"
              >
                <Plus className="size-4" />
                Add New Milestone
              </button>
            </div>

            <div className="space-y-4">
              {(!siteContent.journey || siteContent.journey.length === 0) ? (
                <div className="border border-dashed border-border p-12 text-center">
                  <Milestone className="mx-auto size-8 text-muted-foreground" />
                  <p className="mt-3 text-sm text-foreground">No journey milestones found.</p>
                  <p className="mt-1 font-mono text-xs text-muted-foreground">
                    Click "Add New Milestone" above to create one.
                  </p>
                </div>
              ) : (
                siteContent.journey.map((item, idx) => (
                  <div
                    key={item.year + idx}
                    className="hud-corners relative flex flex-col justify-between border border-border bg-card p-6 md:flex-row md:items-center"
                  >
                    <div className="flex-1 space-y-1.5">
                      <div className="flex items-center gap-3">
                        <span className="bg-primary/10 px-2 py-0.5 font-mono text-xs font-semibold text-primary border border-primary/20">
                          {item.year}
                        </span>
                        <span className="font-mono text-xs text-muted-foreground">
                          {item.date}
                        </span>
                        <h3 className="text-base font-medium tracking-tight text-foreground">{item.title}</h3>
                      </div>
                      <p className="max-w-3xl text-xs leading-relaxed text-muted-foreground">
                        {item.description}
                      </p>
                    </div>

                    <div className="mt-4 flex items-center gap-2 border-t border-border/60 pt-3 md:mt-0 md:border-t-0 md:pt-0">
                      <button
                        onClick={() => openEditJourney(item, idx)}
                        className="flex items-center gap-1.5 border border-border px-3 py-1.5 font-mono text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                      >
                        <Edit3 className="size-3.5" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteJourney(idx)}
                        className="flex items-center gap-1.5 border border-destructive/40 bg-destructive/10 px-3 py-1.5 font-mono text-xs text-destructive transition-colors hover:bg-destructive hover:text-destructive-foreground"
                      >
                        <Trash2 className="size-3.5" />
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: BIO & SITE CONTENT */}
        {/* ========================================================================= */}
        {activeTab === 'content' && (
          <form onSubmit={handleSaveContent} className="max-w-4xl space-y-8">
            <div>
              <h2 className="text-xl font-medium tracking-tight">Bio, Headline & Statistics</h2>
              <p className="font-mono text-xs text-muted-foreground">
                Edit artist bio, headline, statistics, and social profiles (Publishes live to Main Site)
              </p>
            </div>

            {/* Profile Section */}
            <div className="hud-corners border border-border bg-card p-6">
              <h3 className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-primary">
                01. Profile & Hero Headline
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block font-mono text-xs uppercase text-muted-foreground">
                    Artist Name
                  </label>
                  <input
                    type="text"
                    value={siteContent.profile.name}
                    onChange={(e) =>
                      setSiteContent({
                        ...siteContent,
                        profile: { ...siteContent.profile, name: e.target.value },
                      })
                    }
                    className="mt-1 w-full border border-border bg-background p-2.5 font-mono text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-mono text-xs uppercase text-muted-foreground">
                    Greeting Tag
                  </label>
                  <input
                    type="text"
                    value={siteContent.profile.greeting}
                    onChange={(e) =>
                      setSiteContent({
                        ...siteContent,
                        profile: { ...siteContent.profile, greeting: e.target.value },
                      })
                    }
                    className="mt-1 w-full border border-border bg-background p-2.5 font-mono text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-mono text-xs uppercase text-muted-foreground">
                    Headline Role / Tagline
                  </label>
                  <textarea
                    rows={2}
                    value={siteContent.profile.role}
                    onChange={(e) =>
                      setSiteContent({
                        ...siteContent,
                        profile: { ...siteContent.profile, role: e.target.value },
                      })
                    }
                    className="mt-1 w-full border border-border bg-background p-2.5 font-mono text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Top Hero Photo & HUD Diagnostics Section */}
            <div className="hud-corners border border-border bg-card p-6">
              <h3 className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-primary">
                02. Top Hero Photo & HUD Diagnostics (Fakhrul Alam এর পাশের ছবি)
              </h3>
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Photo Preview */}
                <div className="flex flex-col items-center justify-center border border-border/80 bg-background/50 p-3">
                  <div className="relative aspect-4/3 w-full overflow-hidden border border-border bg-black/40">
                    <Image
                      src={siteContent.heroBeautyPass?.imageUrl || '/renders/hero-asset.png'}
                      alt="Hero Showcase Preview"
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>
                  <span className="mt-2 font-mono text-[0.65rem] text-muted-foreground">
                    Current Top Hero Photo Preview
                  </span>
                </div>

                {/* Upload & Controls */}
                <div className="space-y-4 lg:col-span-2">
                  <div>
                    <label className="block font-mono text-xs uppercase text-muted-foreground">
                      Upload New Top Photo (From Computer)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (!file) return
                        try {
                          const compressed = await compressImage(file)
                          setSiteContent((prev) => ({
                            ...prev,
                            heroBeautyPass: {
                              ...prev.heroBeautyPass,
                              imageUrl: compressed.dataUrl,
                            },
                          }))

                          // Upload to disk in background
                          const formData = new FormData()
                          formData.append('file', file)
                          fetch('/api/upload', { method: 'POST', body: formData })
                            .then((res) => res.json())
                            .then((data) => {
                              if (data?.url) {
                                setSiteContent((prev) => ({
                                  ...prev,
                                  heroBeautyPass: {
                                    ...prev.heroBeautyPass,
                                    imageUrl: data.url,
                                  },
                                }))
                              }
                            })
                            .catch(() => {})
                        } catch (err) {
                          console.error(err)
                        }
                      }}
                      className="mt-1 block w-full text-xs text-muted-foreground file:mr-4 file:border-0 file:bg-primary file:px-3 file:py-1.5 file:font-mono file:text-xs file:uppercase file:text-primary-foreground"
                    />
                  </div>

                  <div>
                    <label className="block font-mono text-xs uppercase text-muted-foreground">
                      Or Image URL (Static Path / External Link)
                    </label>
                    <input
                      type="text"
                      value={siteContent.heroBeautyPass?.imageUrl || ''}
                      onChange={(e) =>
                        setSiteContent({
                          ...siteContent,
                          heroBeautyPass: {
                            ...(siteContent.heroBeautyPass || {
                              caption: 'Latest beauty pass',
                              renderEngine: 'Cycles',
                              samples: '512 spp',
                              resolution: '4096 × 3072',
                            }),
                            imageUrl: e.target.value,
                          },
                        })
                      }
                      placeholder="/renders/hero-asset.png or https://..."
                      className="mt-1 w-full border border-border bg-background p-2.5 font-mono text-xs text-foreground focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div>
                      <label className="block font-mono text-[0.65rem] uppercase text-muted-foreground">
                        Render Engine
                      </label>
                      <input
                        type="text"
                        value={siteContent.heroBeautyPass?.renderEngine || 'Cycles'}
                        onChange={(e) =>
                          setSiteContent({
                            ...siteContent,
                            heroBeautyPass: {
                              ...(siteContent.heroBeautyPass || {
                                imageUrl: '/renders/hero-asset.png',
                                caption: 'Latest beauty pass',
                                samples: '512 spp',
                                resolution: '4096 × 3072',
                              }),
                              renderEngine: e.target.value,
                            },
                          })
                        }
                        placeholder="Cycles / Unreal 5"
                        className="mt-1 w-full border border-border bg-background p-2 font-mono text-xs text-foreground focus:border-primary focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-mono text-[0.65rem] uppercase text-muted-foreground">
                        Samples / FPS
                      </label>
                      <input
                        type="text"
                        value={siteContent.heroBeautyPass?.samples || '512 spp'}
                        onChange={(e) =>
                          setSiteContent({
                            ...siteContent,
                            heroBeautyPass: {
                              ...(siteContent.heroBeautyPass || {
                                imageUrl: '/renders/hero-asset.png',
                                caption: 'Latest beauty pass',
                                renderEngine: 'Cycles',
                                resolution: '4096 × 3072',
                              }),
                              samples: e.target.value,
                            },
                          })
                        }
                        placeholder="512 spp"
                        className="mt-1 w-full border border-border bg-background p-2 font-mono text-xs text-foreground focus:border-primary focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-mono text-[0.65rem] uppercase text-muted-foreground">
                        Resolution
                      </label>
                      <input
                        type="text"
                        value={siteContent.heroBeautyPass?.resolution || '4096 × 3072'}
                        onChange={(e) =>
                          setSiteContent({
                            ...siteContent,
                            heroBeautyPass: {
                              ...(siteContent.heroBeautyPass || {
                                imageUrl: '/renders/hero-asset.png',
                                caption: 'Latest beauty pass',
                                renderEngine: 'Cycles',
                                samples: '512 spp',
                              }),
                              resolution: e.target.value,
                            },
                          })
                        }
                        placeholder="4096 × 3072"
                        className="mt-1 w-full border border-border bg-background p-2 font-mono text-xs text-foreground focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-mono text-[0.65rem] uppercase text-muted-foreground">
                      HUD Caption Subtitle
                    </label>
                    <input
                      type="text"
                      value={siteContent.heroBeautyPass?.caption || 'Latest beauty pass — hard-surface asset'}
                      onChange={(e) =>
                        setSiteContent({
                          ...siteContent,
                          heroBeautyPass: {
                            ...(siteContent.heroBeautyPass || {
                              imageUrl: '/renders/hero-asset.png',
                              renderEngine: 'Cycles',
                              samples: '512 spp',
                              resolution: '4096 × 3072',
                            }),
                            caption: e.target.value,
                          },
                        })
                      }
                      placeholder="Latest beauty pass — hard-surface asset"
                      className="mt-1 w-full border border-border bg-background p-2 font-mono text-xs text-foreground focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* About Story */}
            <div className="hud-corners border border-border bg-card p-6">
              <h3 className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-primary">
                02. About Story (Biography)
              </h3>
              <textarea
                rows={5}
                value={siteContent.aboutStory}
                onChange={(e) =>
                  setSiteContent({
                    ...siteContent,
                    aboutStory: e.target.value,
                  })
                }
                className="w-full border border-border bg-background p-3 font-mono text-xs text-foreground focus:border-primary focus:outline-none"
              />
            </div>

            {/* Stats */}
            <div className="hud-corners border border-border bg-card p-6">
              <h3 className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-primary">
                03. Quantitative Stats
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {siteContent.stats.map((stat, idx) => (
                  <div key={idx} className="border border-border/60 p-3 bg-background/50">
                    <label className="block font-mono text-[0.65rem] uppercase text-muted-foreground">
                      Stat #{idx + 1} Value
                    </label>
                    <input
                      type="text"
                      value={stat.value}
                      onChange={(e) => {
                        const newStats = [...siteContent.stats]
                        newStats[idx] = { ...newStats[idx], value: e.target.value }
                        setSiteContent({ ...siteContent, stats: newStats })
                      }}
                      className="mt-1 w-full border border-border bg-background p-2 font-mono text-xs text-primary focus:border-primary focus:outline-none"
                    />

                    <label className="mt-2 block font-mono text-[0.65rem] uppercase text-muted-foreground">
                      Title
                    </label>
                    <input
                      type="text"
                      value={stat.title}
                      onChange={(e) => {
                        const newStats = [...siteContent.stats]
                        newStats[idx] = { ...newStats[idx], title: e.target.value }
                        setSiteContent({ ...siteContent, stats: newStats })
                      }}
                      className="mt-1 w-full border border-border bg-background p-2 font-mono text-xs text-foreground focus:border-primary focus:outline-none"
                    />

                    <label className="mt-2 block font-mono text-[0.65rem] uppercase text-muted-foreground">
                      Sub-Note
                    </label>
                    <input
                      type="text"
                      value={stat.note}
                      onChange={(e) => {
                        const newStats = [...siteContent.stats]
                        newStats[idx] = { ...newStats[idx], note: e.target.value }
                        setSiteContent({ ...siteContent, stats: newStats })
                      }}
                      className="mt-1 w-full border border-border bg-background p-2 font-mono text-xs text-muted-foreground focus:border-primary focus:outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Socials / Contact Links */}
            <div className="hud-corners border border-border bg-card p-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-primary">
                    04. Social Profiles & Contact Links ("Find me on" ও "Contact" সেকশন)
                  </h3>
                  <p className="mt-1 font-mono text-[0.65rem] text-muted-foreground">
                    এখানে যে লিঙ্কগুলো রাখবেন, শুধুমাত্র সেগুলোই মূল সাইটের "Find me on" এবং ফুটারের "Contact" সেকশনে দেখা যাবে।
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const current = siteContent.socials || []
                    setSiteContent({
                      ...siteContent,
                      socials: [...current, { label: 'New Platform', href: 'https://' }],
                    })
                  }}
                  className="flex items-center gap-1.5 border border-primary/50 bg-primary/10 px-3 py-1 font-mono text-[0.7rem] uppercase text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                >
                  <Plus className="size-3" />
                  Add Social Link
                </button>
              </div>

              {/* Quick Template Presets */}
              <div className="mb-4 flex flex-wrap items-center gap-1.5 border-b border-border/60 pb-3">
                <span className="font-mono text-[0.65rem] text-muted-foreground mr-1">Quick Add:</span>
                {['ArtStation', 'LinkedIn', 'Facebook', 'Behance', 'Instagram', 'X / Twitter', 'Discord', 'YouTube', 'GitHub'].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      const current = siteContent.socials || []
                      if (!current.some((s) => s.label.toLowerCase() === preset.toLowerCase())) {
                        setSiteContent({
                          ...siteContent,
                          socials: [...current, { label: preset, href: 'https://' }],
                        })
                      }
                    }}
                    className="border border-border bg-background/50 px-2 py-0.5 font-mono text-[0.65rem] text-muted-foreground hover:border-primary hover:text-primary"
                  >
                    + {preset}
                  </button>
                ))}
              </div>

              {/* List of active social links */}
              <div className="space-y-3">
                {(!siteContent.socials || siteContent.socials.length === 0) ? (
                  <p className="font-mono text-xs text-muted-foreground italic">
                    No social links added yet. Click "+ Add Social Link" or any preset above.
                  </p>
                ) : (
                  siteContent.socials.map((social, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col gap-2 border border-border/80 bg-background/60 p-3 sm:flex-row sm:items-center sm:gap-4"
                    >
                      <div className="sm:w-1/3">
                        <label className="block font-mono text-[0.6rem] uppercase text-muted-foreground">
                          Platform Label
                        </label>
                        <input
                          type="text"
                          value={social.label}
                          onChange={(e) => {
                            const newSocials = [...siteContent.socials]
                            newSocials[idx] = { ...newSocials[idx], label: e.target.value }
                            setSiteContent({ ...siteContent, socials: newSocials })
                          }}
                          placeholder="e.g. ArtStation"
                          className="mt-0.5 w-full border border-border bg-background p-1.5 font-mono text-xs text-foreground focus:border-primary focus:outline-none"
                        />
                      </div>

                      <div className="flex-1">
                        <label className="block font-mono text-[0.6rem] uppercase text-muted-foreground">
                          Profile URL
                        </label>
                        <input
                          type="url"
                          value={social.href}
                          onChange={(e) => {
                            const newSocials = [...siteContent.socials]
                            newSocials[idx] = { ...newSocials[idx], href: e.target.value }
                            setSiteContent({ ...siteContent, socials: newSocials })
                          }}
                          placeholder="https://artstation.com/your-username"
                          className="mt-0.5 w-full border border-border bg-background p-1.5 font-mono text-xs text-foreground focus:border-primary focus:outline-none"
                        />
                      </div>

                      <div className="sm:pt-4">
                        <button
                          type="button"
                          onClick={() => {
                            const newSocials = siteContent.socials.filter((_, i) => i !== idx)
                            setSiteContent({ ...siteContent, socials: newSocials })
                          }}
                          className="flex items-center gap-1 border border-destructive/40 bg-destructive/10 px-2.5 py-1.5 font-mono text-xs text-destructive hover:bg-destructive hover:text-destructive-foreground"
                          title="Delete link"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <button
              type="submit"
              className="flex items-center gap-2 bg-primary px-6 py-3 font-mono text-xs uppercase tracking-[0.2em] text-primary-foreground transition-opacity hover:opacity-85"
            >
              <CheckCircle2 className="size-4" />
              Save & Publish to Main Site
            </button>
          </form>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: DATABASE DIAGNOSTICS & RESET */}
        {/* ========================================================================= */}
        {activeTab === 'database' && (
          <div className="max-w-3xl space-y-6">
            <div>
              <h2 className="text-xl font-medium tracking-tight">System & Telemetry</h2>
              <p className="font-mono text-xs text-muted-foreground">
                Persistent local cache & cloud database synchronization
              </p>
            </div>

            <div className="hud-corners border border-border bg-card p-6">
              <h3 className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-primary">
                System Diagnostics
              </h3>
              <div className="space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between border-b border-border/60 pb-2">
                  <span className="text-muted-foreground">Firebase Status:</span>
                  <span className={isConfigured ? 'text-emerald-400' : 'text-amber-400'}>
                    {isConfigured ? 'CONFIGURED & CONNECTED' : 'LOCAL CACHE MODE'}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-border/60 pb-2">
                  <span className="text-muted-foreground">Active Admin:</span>
                  <span className="text-primary">{user.email}</span>
                </div>
                <div className="flex items-center justify-between border-b border-border/60 pb-2">
                  <span className="text-muted-foreground">Total Projects:</span>
                  <span>{projects.length} items</span>
                </div>
                <div className="flex items-center justify-between border-b border-border/60 pb-2">
                  <span className="text-muted-foreground">Total Expertise:</span>
                  <span>{siteContent.expertise?.length || 0} disciplines</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Total Milestones:</span>
                  <span>{siteContent.journey?.length || 0} journey events</span>
                </div>
              </div>
            </div>

            <div className="hud-corners border border-border bg-card p-6">
              <h3 className="mb-2 font-mono text-xs uppercase tracking-[0.2em] text-primary">
                Reset / Seed Initial Portfolio
              </h3>
              <p className="text-xs text-muted-foreground">
                Restore all original 3D renders, video reels, and artist biography.
              </p>

              <button
                type="button"
                onClick={handleSeedDatabase}
                className="mt-4 flex items-center gap-2 border border-primary bg-primary/10 px-4 py-2.5 font-mono text-xs uppercase tracking-[0.2em] text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
              >
                <Database className="size-4" />
                Reset / Seed Portfolio
              </button>
            </div>
          </div>
        )}
      </main>

      {/* ========================================================================= */}
      {/* 1. ADD / EDIT PROJECT MODAL */}
      {/* ========================================================================= */}
      {isProjectModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="hud-corners relative max-h-[90vh] w-full max-w-2xl overflow-y-auto border border-border bg-card p-6">
            <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-mono text-sm uppercase tracking-[0.15em] text-primary">
                {editingProject ? 'Edit Project' : 'Add New 3D / Design Project'}
              </h3>
              <button
                onClick={() => setIsProjectModalOpen(false)}
                className="font-mono text-xs text-muted-foreground hover:text-foreground"
              >
                [ESC / CLOSE]
              </button>
            </div>

            <form onSubmit={handleSaveProject} className="space-y-4">
              <div>
                <label className="block font-mono text-xs uppercase text-muted-foreground">
                  Project Title *
                </label>
                <input
                  type="text"
                  required
                  value={projectForm.title}
                  onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                  placeholder="e.g. Hard-surface sci-fi drone"
                  className="mt-1 w-full border border-border bg-background p-2.5 font-mono text-xs text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block font-mono text-xs uppercase text-muted-foreground">
                    Category *
                  </label>
                  <select
                    value={projectForm.category}
                    onChange={(e) =>
                      setProjectForm({
                        ...projectForm,
                        category: e.target.value as ProjectCategory,
                      })
                    }
                    className="mt-1 w-full border border-border bg-background p-2.5 font-mono text-xs text-foreground focus:border-primary focus:outline-none"
                  >
                    <option value="game-asset">3D Game Asset</option>
                    <option value="3d-viz">3D Visualization</option>
                    <option value="graphic-design">Graphic Design</option>
                    <option value="photography">Photography</option>
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-xs uppercase text-muted-foreground">
                    Display Order Index
                  </label>
                  <input
                    type="number"
                    value={projectForm.order}
                    onChange={(e) =>
                      setProjectForm({ ...projectForm, order: parseInt(e.target.value) || 0 })
                    }
                    className="mt-1 w-full border border-border bg-background p-2.5 font-mono text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-xs uppercase text-muted-foreground">
                  Description / ArtStation Breakdown
                </label>
                <textarea
                  rows={2}
                  value={projectForm.description}
                  onChange={(e) =>
                    setProjectForm({ ...projectForm, description: e.target.value })
                  }
                  placeholder="Game-ready hard-surface asset rendered in Cycles with 4K PBR textures."
                  className="mt-1 w-full border border-border bg-background p-2.5 font-mono text-xs text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              {/* Drag & Drop WebP Image Upload Box */}
              <div>
                <label className="block font-mono text-xs uppercase text-muted-foreground">
                  Render Image (Auto-Compress to WebP)
                </label>
                <div className="mt-1 border-2 border-dashed border-border/80 p-4 text-center">
                  <input
                    type="file"
                    accept="image/*,video/mp4"
                    onChange={handleFileChange}
                    className="block w-full text-xs text-muted-foreground file:mr-4 file:border-0 file:bg-primary file:px-3 file:py-1.5 file:font-mono file:text-xs file:uppercase file:text-primary-foreground"
                  />

                  {compressionResult && (
                    <div className="mt-3 rounded border border-primary/30 bg-primary/5 p-2 font-mono text-[0.7rem] text-primary">
                      ✓ Auto-optimized: {compressionResult.originalSizeKB} KB →{' '}
                      <strong>{compressionResult.compressedSizeKB} KB</strong> (
                      {compressionResult.compressionRatio}% size reduction) · {compressionResult.width}×
                      {compressionResult.height} px
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block font-mono text-xs uppercase text-muted-foreground">
                  Video URL / YouTube Link (e.g. https://youtu.be/... or .mp4)
                </label>
                <input
                  type="text"
                  value={projectForm.videoUrl}
                  onChange={(e) => {
                    const val = e.target.value
                    const ytThumb = getYouTubeThumbnail(val)
                    setProjectForm((prev) => ({
                      ...prev,
                      videoUrl: val,
                      // Auto-fill imageUrl with YouTube high-res thumbnail if empty or already using a yt thumb
                      imageUrl: ytThumb && (!prev.imageUrl || prev.imageUrl.includes('youtube.com') || prev.imageUrl === '/renders/hero-asset.png')
                        ? ytThumb
                        : prev.imageUrl,
                    }))
                  }}
                  placeholder="https://www.youtube.com/watch?v=... or /reel/mountain-dew-ad.mp4"
                  className="mt-1 w-full border border-border bg-background p-2.5 font-mono text-xs text-foreground focus:border-primary focus:outline-none"
                />
                {extractYouTubeId(projectForm.videoUrl) && (
                  <p className="mt-1 font-mono text-[0.65rem] text-primary">
                    ✓ YouTube video detected — High-Res thumbnail automatically assigned!
                  </p>
                )}
              </div>

              <div>
                <label className="block font-mono text-xs uppercase text-muted-foreground">
                  Image Thumbnail URL (Auto-set for YouTube or Static / WebP)
                </label>
                <input
                  type="text"
                  value={projectForm.imageUrl}
                  onChange={(e) =>
                    setProjectForm({ ...projectForm, imageUrl: e.target.value })
                  }
                  placeholder="/renders/hero-asset.png or https://img.youtube.com/..."
                  className="mt-1 w-full border border-border bg-background p-2.5 font-mono text-xs text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="featured"
                  checked={projectForm.featured}
                  onChange={(e) =>
                    setProjectForm({ ...projectForm, featured: e.target.checked })
                  }
                  className="size-4 rounded border-border bg-background text-primary"
                />
                <label htmlFor="featured" className="font-mono text-xs uppercase text-foreground">
                  Mark as Featured Showcase
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
                <button
                  type="button"
                  onClick={() => setIsProjectModalOpen(false)}
                  className="border border-border px-4 py-2 font-mono text-xs uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="bg-primary px-5 py-2 font-mono text-xs uppercase tracking-[0.2em] text-primary-foreground hover:opacity-85 disabled:opacity-50"
                >
                  {uploading ? 'Saving...' : editingProject ? 'Update Project' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. ADD / EDIT EXPERTISE MODAL */}
      {/* ========================================================================= */}
      {isExpertiseModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="hud-corners relative max-h-[90vh] w-full max-w-xl overflow-y-auto border border-border bg-card p-6">
            <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-mono text-sm uppercase tracking-[0.15em] text-primary">
                {editingExpertiseIdx !== null ? 'Edit Expertise' : 'Add New Expertise'}
              </h3>
              <button
                onClick={() => setIsExpertiseModalOpen(false)}
                className="font-mono text-xs text-muted-foreground hover:text-foreground"
              >
                [ESC / CLOSE]
              </button>
            </div>

            <form onSubmit={handleSaveExpertise} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="block font-mono text-xs uppercase text-muted-foreground">
                    Index (e.g. 01)
                  </label>
                  <input
                    type="text"
                    required
                    value={expertiseForm.index}
                    onChange={(e) => setExpertiseForm({ ...expertiseForm, index: e.target.value })}
                    placeholder="01"
                    className="mt-1 w-full border border-border bg-background p-2.5 font-mono text-xs text-primary focus:border-primary focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-mono text-xs uppercase text-muted-foreground">
                    Discipline Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={expertiseForm.title}
                    onChange={(e) => setExpertiseForm({ ...expertiseForm, title: e.target.value })}
                    placeholder="e.g. 3D Game Asset"
                    className="mt-1 w-full border border-border bg-background p-2.5 font-mono text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-xs uppercase text-muted-foreground">
                  Description *
                </label>
                <textarea
                  rows={3}
                  required
                  value={expertiseForm.description}
                  onChange={(e) => setExpertiseForm({ ...expertiseForm, description: e.target.value })}
                  placeholder="Game-ready props, environments and hard-surface models — clean topology, optimised UVs..."
                  className="mt-1 w-full border border-border bg-background p-2.5 font-mono text-xs text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-mono text-xs uppercase text-muted-foreground">
                  Tools & Software (Comma-separated)
                </label>
                <input
                  type="text"
                  value={expertiseForm.toolsInput}
                  onChange={(e) => setExpertiseForm({ ...expertiseForm, toolsInput: e.target.value })}
                  placeholder="Blender, Substance Painter, Marmoset, Unreal Engine"
                  className="mt-1 w-full border border-border bg-background p-2.5 font-mono text-xs text-foreground focus:border-primary focus:outline-none"
                />
                <p className="mt-1 font-mono text-[0.65rem] text-muted-foreground">
                  Enter software tools separated by commas.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
                <button
                  type="button"
                  onClick={() => setIsExpertiseModalOpen(false)}
                  className="border border-border px-4 py-2 font-mono text-xs uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-primary px-5 py-2 font-mono text-xs uppercase tracking-[0.2em] text-primary-foreground hover:opacity-85"
                >
                  {editingExpertiseIdx !== null ? 'Update Expertise' : 'Add Expertise'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. ADD / EDIT JOURNEY MODAL */}
      {/* ========================================================================= */}
      {isJourneyModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="hud-corners relative max-h-[90vh] w-full max-w-xl overflow-y-auto border border-border bg-card p-6">
            <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-mono text-sm uppercase tracking-[0.15em] text-primary">
                {editingJourneyIdx !== null ? 'Edit Milestone' : 'Add New Milestone'}
              </h3>
              <button
                onClick={() => setIsJourneyModalOpen(false)}
                className="font-mono text-xs text-muted-foreground hover:text-foreground"
              >
                [ESC / CLOSE]
              </button>
            </div>

            <form onSubmit={handleSaveJourney} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block font-mono text-xs uppercase text-muted-foreground">
                    Year * (e.g. 2024)
                  </label>
                  <input
                    type="text"
                    required
                    value={journeyForm.year}
                    onChange={(e) => setJourneyForm({ ...journeyForm, year: e.target.value })}
                    placeholder="2024"
                    className="mt-1 w-full border border-border bg-background p-2.5 font-mono text-xs text-primary focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-mono text-xs uppercase text-muted-foreground">
                    Date Tag (e.g. 15 August 2024)
                  </label>
                  <input
                    type="text"
                    value={journeyForm.date}
                    onChange={(e) => setJourneyForm({ ...journeyForm, date: e.target.value })}
                    placeholder="15 August 2024"
                    className="mt-1 w-full border border-border bg-background p-2.5 font-mono text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-xs uppercase text-muted-foreground">
                  Milestone Title *
                </label>
                <input
                  type="text"
                  required
                  value={journeyForm.title}
                  onChange={(e) => setJourneyForm({ ...journeyForm, title: e.target.value })}
                  placeholder="e.g. First Hard-Surface Game Asset Release"
                  className="mt-1 w-full border border-border bg-background p-2.5 font-mono text-xs text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-mono text-xs uppercase text-muted-foreground">
                  Story & Description *
                </label>
                <textarea
                  rows={4}
                  required
                  value={journeyForm.description}
                  onChange={(e) => setJourneyForm({ ...journeyForm, description: e.target.value })}
                  placeholder="Detailed background about this artistic achievement or turning point..."
                  className="mt-1 w-full border border-border bg-background p-2.5 font-mono text-xs text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
                <button
                  type="button"
                  onClick={() => setIsJourneyModalOpen(false)}
                  className="border border-border px-4 py-2 font-mono text-xs uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-primary px-5 py-2 font-mono text-xs uppercase tracking-[0.2em] text-primary-foreground hover:opacity-85"
                >
                  {editingJourneyIdx !== null ? 'Update Milestone' : 'Add Milestone'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
