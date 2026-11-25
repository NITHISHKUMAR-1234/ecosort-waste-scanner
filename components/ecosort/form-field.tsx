import type { ComponentProps, ReactNode } from 'react'
import { ArrowLeft, Leaf } from 'lucide-react'
import { cn } from '@/lib/utils'

export const inputClass =
  'h-11 w-full rounded-lg border border-input bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'

export function FormField({
  id,
  label,
  children,
  hint,
}: {
  id: string
  label: string
  children: ReactNode
  hint?: string
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

export function TextInput(props: ComponentProps<'input'>) {
  return <input {...props} className={cn(inputClass, props.className)} />
}

export function BrandMark({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
        <Leaf className="size-5" aria-hidden="true" />
      </span>
      <span className="text-lg font-semibold tracking-tight">EcoSort</span>
    </div>
  )
}

export function AuthCard({
  title,
  description,
  onBack,
  children,
}: {
  title: string
  description: string
  onBack: () => void
  children: ReactNode
}) {
  return (
    <section className="w-full max-w-md rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
      <button
        type="button"
        onClick={onBack}
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back
      </button>
      <BrandMark className="mb-5" />
      <h1 className="text-2xl font-semibold tracking-tight text-balance">{title}</h1>
      <p className="mt-1 text-sm text-muted-foreground text-pretty">{description}</p>
      <div className="mt-6">{children}</div>
    </section>
  )
}

export function FormError({ message }: { message: string | null }) {
  if (!message) return null
  return (
    <p role="alert" className="rounded-lg bg-nonbio-soft px-3 py-2 text-sm text-nonbio">
      {message}
    </p>
  )
}
