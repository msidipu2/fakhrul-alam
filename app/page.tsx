'use client'

import React, { useEffect, useState } from 'react'
import { About } from '@/components/about'
import { Expertise } from '@/components/expertise'
import { Hero } from '@/components/hero'
import { Journey } from '@/components/journey'
import { ReelGallery } from '@/components/reel-gallery'
import { SiteFooter } from '@/components/site-footer'
import { SiteNav } from '@/components/site-nav'
import {
  getLocalSiteContent,
  getLocalProjects,
  fetchLiveSiteContent,
  fetchLiveProjects,
  PORTFOLIO_UPDATE_EVENT,
} from '@/lib/portfolio-store'
import { SiteContent, Project } from '@/lib/types'
import { DEFAULT_SITE_CONTENT, DEFAULT_PROJECTS } from '@/lib/firestore-service'

export default function Page() {
  const [siteContent, setSiteContent] = useState<SiteContent>(DEFAULT_SITE_CONTENT)
  const [projects, setProjects] = useState<Project[]>(DEFAULT_PROJECTS)
  const [mounted, setMounted] = useState(false)

  const syncData = async () => {
    // 1. Instant local read
    const localContent = getLocalSiteContent()
    const localProjects = getLocalProjects()
    setSiteContent(localContent)
    setProjects(localProjects)

    // 2. Fetch live sync in background
    try {
      const [liveContent, liveProjects] = await Promise.all([
        fetchLiveSiteContent(),
        fetchLiveProjects(),
      ])
      if (liveContent) setSiteContent(liveContent)
      if (liveProjects && liveProjects.length > 0) setProjects(liveProjects)
    } catch (err) {
      console.warn('Background sync warning:', err)
    }
  }

  useEffect(() => {
    setMounted(true)
    syncData()

    // Listen to real-time update events dispatched from admin dashboard
    const handleUpdate = () => {
      setSiteContent(getLocalSiteContent())
      setProjects(getLocalProjects())
    }

    window.addEventListener(PORTFOLIO_UPDATE_EVENT, handleUpdate)
    window.addEventListener('storage', handleUpdate)

    return () => {
      window.removeEventListener(PORTFOLIO_UPDATE_EVENT, handleUpdate)
      window.removeEventListener('storage', handleUpdate)
    }
  }, [])

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-60 focus:bg-primary focus:px-4 focus:py-2 focus:font-mono focus:text-xs focus:uppercase focus:text-primary-foreground"
      >
        Skip to main content
      </a>
      <SiteNav />
      <main id="main">
        <Hero content={siteContent} />
        <About content={siteContent} />
        <Expertise content={siteContent} />
        <ReelGallery initialProjects={projects} />
        <Journey content={siteContent} />
        <SiteFooter content={siteContent} />
      </main>
    </>
  )
}
