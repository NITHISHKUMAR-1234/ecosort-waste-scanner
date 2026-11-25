import { X } from 'lucide-react'
import type { Scan } from '@/lib/analysis-schema'
import { cn } from '@/lib/utils'

type Props = {
  scans: Scan[]
  activeId: string | null
  onSelect: (scan: Scan) => void
  onRemove: (id: string) => void
}

const CLASS_LABELS: Record<Scan['classification'], { label: string; color: string }> = {
  biodegradable: { label: 'Bio', color: 'text-bio' },
  'non-biodegradable': { label: 'Non-bio', color: 'text-nonbio' },
  'special-handling': { label: 'Special', color: 'text-special' },
}

const timeFormat = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' })

export function RecentScans({ scans, activeId, onSelect, onRemove }: Props) {
  return (
    <section aria-labelledby="recent-heading">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 id="recent-heading" className="text-base font-semibold">
          Recent scans
        </h2>
        <span className="text-xs text-muted-foreground">{scans.length} this session</span>
      </div>
      {scans.length === 0 ? (
        <p className="rounded-xl border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
          Items you check will show up here.
        </p>
      ) : (
        <ul className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2">
          {scans.map((s) => {
            const tag = CLASS_LABELS[s.classification]
            return (
              <li key={s.id} className="relative w-40 shrink-0 snap-start">
                <button
                  type="button"
                  onClick={() => onSelect(s)}
                  className={cn(
                    'flex w-full flex-col overflow-hidden rounded-xl border bg-card text-left transition hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    activeId === s.id && 'border-primary ring-1 ring-primary',
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- data URL thumbnail */}
                  <img src={s.image} alt="" className="h-24 w-full object-cover" />
                  <span className="flex flex-col gap-1 p-2.5">
                    <span className="truncate text-sm font-medium">{s.itemName}</span>
                    <span className="flex items-center justify-between gap-2 text-xs">
                      <span className={cn('font-semibold', s.isWasteItem ? tag.color : 'text-muted-foreground')}>
                        {s.isWasteItem ? tag.label : 'Unknown'}
                      </span>
                      <time dateTime={new Date(s.scannedAt).toISOString()} className="text-muted-foreground">
                        {timeFormat.format(s.scannedAt)}
                      </time>
                    </span>
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => onRemove(s.id)}
                  aria-label={`Remove ${s.itemName} from recent scans`}
                  className="absolute top-1.5 right-1.5 flex size-7 items-center justify-center rounded-full bg-background/90 text-foreground shadow-sm hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <X className="size-4" aria-hidden="true" />
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
