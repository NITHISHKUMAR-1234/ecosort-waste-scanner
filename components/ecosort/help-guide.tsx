import { ArrowLeft, Camera, Clock, Recycle, ScanSearch, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BrandMark } from './form-field'

const STEPS = [
  { icon: Camera, title: 'Capture the item', body: 'Snap a photo with your camera, drag in an image, or tap a sample item to try it instantly.' },
  { icon: ScanSearch, title: 'Vision AI analyses it', body: 'Our Gemini-powered model looks at the photo and identifies the item, even unusual ones like leaves or household objects.' },
  { icon: Recycle, title: 'Get your result', body: 'See whether it is Biodegradable or Non-Biodegradable, how confident the AI is, and which of the 5 Rs applies.' },
  { icon: Clock, title: 'Know its impact', body: 'Check how long it takes to break down in nature, plus a practical tip on how to dispose of it.' },
]

const FIVE_RS = [
  ['Refuse', 'Say no to items you do not need, like single-use straws.'],
  ['Reduce', 'Use less: buy in bulk and choose minimal packaging.'],
  ['Reuse', 'Use the same item again for its original purpose.'],
  ['Repurpose', 'Give the item a new job, like a jar turned into a planter.'],
  ['Recycle', 'Send materials to be processed into new products.'],
]

export function HelpGuide({ onBack, onStart }: { onBack: () => void; onStart: () => void }) {
  return (
    <section className="w-full max-w-2xl">
      <button
        type="button"
        onClick={onBack}
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back
      </button>
      <BrandMark className="mb-5" />
      <h1 className="text-3xl font-semibold tracking-tight text-balance">New to EcoSort? Here is how it works.</h1>
      <p className="mt-2 text-muted-foreground text-pretty">
        EcoSort helps you sort waste correctly so less of it ends up in landfill. It takes about ten seconds per item.
      </p>

      <ol className="mt-8 grid gap-3 sm:grid-cols-2">
        {STEPS.map(({ icon: Icon, title, body }, i) => (
          <li key={title} className="flex gap-3 rounded-xl border bg-card p-4">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <Icon className="size-5" aria-hidden="true" />
            </span>
            <div>
              <p className="font-medium">
                {i + 1}. {title}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{body}</p>
            </div>
          </li>
        ))}
      </ol>

      <h2 className="mt-10 text-lg font-semibold">The 5 Rs of waste</h2>
      <dl className="mt-3 divide-y rounded-xl border bg-card">
        {FIVE_RS.map(([term, desc]) => (
          <div key={term} className="flex flex-col gap-0.5 px-4 py-3 sm:flex-row sm:gap-4">
            <dt className="w-28 shrink-0 font-medium text-primary">{term}</dt>
            <dd className="text-sm text-muted-foreground">{desc}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-6 flex items-start gap-3 rounded-xl bg-muted p-4 text-sm text-muted-foreground">
        <Trash2 className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        <p>Local rules vary. When in doubt, check your council or municipality guidelines before disposing of hazardous items.</p>
      </div>

      <Button size="lg" className="mt-8 h-12 w-full text-base sm:w-auto" onClick={onStart}>
        Start scanning
      </Button>
    </section>
  )
}
