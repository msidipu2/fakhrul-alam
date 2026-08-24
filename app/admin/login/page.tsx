'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ShieldCheck, Lock, Mail, ArrowLeft, AlertCircle, Sparkles, Terminal } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'

export default function AdminLoginPage() {
  const router = useRouter()
  const { user, login, loginAsDemoAdmin, isConfigured, loading } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (user) {
      router.push('/admin')
    }
  }, [user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      await login(email, password)
      router.push('/admin')
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDemoLogin = () => {
    loginAsDemoAdmin()
    router.push('/admin')
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6 font-mono text-sm text-primary">
        <div className="flex items-center gap-3">
          <Terminal className="size-4 animate-spin" />
          <span>AUTHENTICATING SECURE SESSION...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-6 py-12">
      {/* Blueprint grid background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-blueprint opacity-[0.35]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background via-transparent to-background"
      />

      <div className="relative w-full max-w-md">
        {/* Top Back Link */}
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="size-3.5" />
          Back to Portfolio
        </Link>

        {/* Login Box */}
        <div className="hud-corners relative border border-border bg-card/90 p-8 backdrop-blur-md">
          {/* Header Diagnostic Readout */}
          <div className="mb-6 flex items-center justify-between border-b border-border pb-4 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">
            <span className="flex items-center gap-1.5 text-primary">
              <ShieldCheck className="size-3.5" />
              Auth Level 01
            </span>
            <span>SECURE TERMINAL</span>
          </div>

          <div className="mb-6 text-center">
            <h1 className="text-2xl font-medium tracking-tight text-foreground">
              Admin Access
            </h1>
            <p className="mt-1.5 text-xs text-muted-foreground">
              Manage portfolio projects, 3D renders, and site content
            </p>
          </div>

          {!isConfigured && (
            <div className="mb-6 border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-300">
              <div className="flex items-start gap-2">
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                <div>
                  <p className="font-semibold">Firebase Not Connected</p>
                  <p className="mt-1 text-[0.7rem] text-amber-200/80">
                    Add keys in <code className="font-mono bg-black/40 px-1 py-0.5">.env.local</code> or use <strong>Instant Demo Admin</strong> below to test all admin features.
                  </p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 border border-destructive/50 bg-destructive/10 p-3 font-mono text-xs text-destructive">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="mb-1.5 block font-mono text-[0.7rem] uppercase tracking-[0.15em] text-muted-foreground">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@fakhrulalam.com"
                  className="w-full border border-border bg-background/80 py-2.5 pl-10 pr-4 font-mono text-xs text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block font-mono text-[0.7rem] uppercase tracking-[0.15em] text-muted-foreground">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full border border-border bg-background/80 py-2.5 pl-10 pr-4 font-mono text-xs text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-2 flex w-full items-center justify-center gap-2 bg-primary py-3 font-mono text-xs uppercase tracking-[0.2em] text-primary-foreground transition-opacity hover:opacity-85 disabled:opacity-50"
            >
              {submitting ? 'Verifying...' : 'Authenticate'}
            </button>
          </form>

          {/* Quick Demo Mode Access Button */}
          <div className="mt-6 border-t border-border pt-5">
            <button
              type="button"
              onClick={handleDemoLogin}
              className="flex w-full items-center justify-center gap-2 border border-border bg-background/50 py-2.5 font-mono text-[0.7rem] uppercase tracking-[0.15em] text-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <Sparkles className="size-3.5 text-primary" />
              Enter Instant Demo Admin
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
