'use client'

import { useState } from 'react'
import { HelpCircle, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Analysis, Scan } from '@/lib/analysis-schema'
import { BrandMark } from './form-field'
import { ImageInput } from './image-input'
import { ResultCard } from './result-card'
import { RecentScans } from './recent-scans'
import type { AppUser } from './types'

type Props = {
  user: AppUser
  onSignOut: () => void
  onHelp: () => void
}

export function ScannerView({ user, onSignOut, onHelp }: Props) {
  const [scans, setScans] = useState<Scan[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const active = scans.find((s) => s.id === activeId) ?? null

  const analyze = async (image: string) => {
    setPreview(image)
    setActiveId(null)
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Analysis failed.')
      const scan: Scan = { ...(data as Analysis), id: crypto.randomUUID(), image, scannedAt: Date.now() }
      setScans((prev) => [scan, ...prev])
      setActiveId(scan.id)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Analysis failed.')
    } finally {
      setLoading(false)
    }
  }

  const removeScan = (id: string) => {
    setScans((prev) => prev.filter((s) => s.id !== id))
    if (activeId === id) {
      setActiveId(null)
      setPreview(null)
    }
  }

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-10 border-b bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <BrandMark />
          <div className="flex items-center gap-1">
            <span className="mr-2 hidden text-sm text-muted-foreground sm:inline">Hi, {user.name}</span>
            <Button variant="ghost" size="sm" onClick={onHelp}>
              <HelpCircle aria-hidden="true" />
              <span className="sr-only sm:not-sr-only">Help</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={onSignOut}>
              <LogOut aria-hidden="true" />
              <span className="sr-only sm:not-sr-only">{user.email ? 'Log out' : 'Exit'}</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-6 sm:py-10">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Scan a waste item</h1>
          <p className="mt-1 text-sm text-muted-foreground">Vision AI identifies the item and tells you how to handle it.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <ImageInput disabled={loading} onImage={analyze} />
          <ResultCard scan={active} preview={preview} loading={loading} error={error} />
        </div>

        <RecentScans
          scans={scans}
          activeId={activeId}
          onSelect={(s) => {
            setActiveId(s.id)
            setPreview(s.image)
            setError(null)
          }}
          onRemove={removeScan}
        />
      </main>
    </div>
  )
}
