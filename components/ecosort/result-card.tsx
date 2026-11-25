import { AlertTriangle, Clock, Lightbulb, Loader2, ScanSearch } from 'lucide-react'
import { FIVE_RS, type Scan } from '@/lib/analysis-schema'
import { cn } from '@/lib/utils'

type Props = {
  scan: Scan | null
  preview: string | null
  loading: boolean
  error: string | null
}

export function ResultCard({ scan, preview, loading, error }: Props) {
  return (
    <section aria-labelledby="result-heading" aria-live="polite" className="flex flex-col overflow-hidden rounded-2xl border bg-card">
      <h2 id="result-heading" className="sr-only">
        Scan result
      </h2>

      {preview && (
        <div className="relative h-48 bg-muted sm:h-56">
          {/* eslint-disable-next-line @next/next/no-img-element -- data URL preview */}
          <img src={preview} alt="Scanned item" className="size-full object-cover" />
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/70 text-sm font-medium backdrop-blur-sm">
              <Loader2 className="size-6 animate-spin text-primary" aria-hidden="true" />
              Vision AI is analysing...
            </div>
          )}
        </div>
      )}

      <div className="flex flex-1 flex-col p-5">
        {error ? (
          <div role="alert" className="flex items-start gap-3 rounded-xl bg-nonbio-soft p-4 text-sm text-nonbio">
            <AlertTriangle className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
            <p>{error}</p>
          </div>
        ) : scan ? (
          <ScanDetails scan={scan} />
        ) : !loading ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 py-10 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <ScanSearch className="size-6" aria-hidden="true" />
            </span>
            <p className="font-medium">Your result will appear here</p>
            <p className="max-w-xs text-sm text-muted-foreground">Upload a photo, use your camera, or tap a sample item to start.</p>
          </div>
        ) : null}
      </div>
    </section>
  )
}

const CLASS_STYLES: Record<Scan['classification'], { label: string; solid: string; soft: string }> = {
  biodegradable: { label: 'BIODEGRADABLE', solid: 'bg-bio', soft: 'bg-bio-soft' },
  'non-biodegradable': { label: 'NON-BIODEGRADABLE', solid: 'bg-nonbio', soft: 'bg-nonbio-soft' },
  'special-handling': { label: 'SPECIAL HANDLING', solid: 'bg-special', soft: 'bg-special-soft' },
}

function ScanDetails({ scan }: { scan: Scan }) {
  const style = CLASS_STYLES[scan.classification]

  if (!scan.isWasteItem) {
    return (
      <div className="flex items-start gap-3 rounded-xl bg-muted p-4 text-sm">
        <AlertTriangle className="mt-0.5 size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
        <div>
          <p className="font-medium">No waste item detected</p>
          <p className="mt-1 text-muted-foreground">{scan.itemName}. Try a closer photo of a single item.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <span
            className={cn('inline-flex rounded-full px-3 py-1 text-xs font-bold tracking-wider text-primary-foreground', style.solid)}
          >
            {style.label}
          </span>
          <p className="mt-2 text-xl font-semibold tracking-tight text-balance">{scan.itemName}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-semibold tabular-nums">{scan.confidence}%</p>
          <p className="text-xs text-muted-foreground">confidence</p>
        </div>
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-muted" aria-hidden="true">
        <div className={cn('h-full rounded-full', style.solid)} style={{ width: `${scan.confidence}%` }} />
      </div>

      <div className={cn('rounded-xl p-4', style.soft)}>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">5 Rs guidance</p>
        <ul className="mt-2 flex flex-wrap gap-1.5" aria-label="The 5 Rs">
          {FIVE_RS.map((r) => (
            <li
              key={r}
              aria-current={r === scan.primaryR ? 'true' : undefined}
              className={cn(
                'rounded-full px-2.5 py-1 text-xs font-medium',
                r === scan.primaryR ? cn(style.solid, 'text-primary-foreground') : 'bg-card text-muted-foreground',
              )}
            >
              {r}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-sm text-pretty">
          <span className="font-semibold">{scan.primaryR}:</span> {scan.rReason}
        </p>
      </div>

      <dl className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border p-4">
          <dt className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <Clock className="size-3.5" aria-hidden="true" />
            Decomposition time
          </dt>
          <dd className="mt-1 text-lg font-semibold">{scan.decompositionTime}</dd>
        </div>
        <div className="rounded-xl border p-4">
          <dt className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <Lightbulb className="size-3.5" aria-hidden="true" />
            Disposal tip
          </dt>
          <dd className="mt-1 text-sm text-pretty">{scan.disposalTip}</dd>
        </div>
      </dl>
    </div>
  )
}
