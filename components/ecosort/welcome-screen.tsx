import { HelpCircle, LogIn, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BrandMark } from './form-field'

type Props = {
  onLogin: () => void
  onSignup: () => void
  onHelp: () => void
  onGuest: () => void
}

export function WelcomeScreen({ onLogin, onSignup, onHelp, onGuest }: Props) {
  return (
    <section className="flex w-full max-w-lg flex-col items-center text-center">
      <BrandMark className="mb-10" />
      <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">Welcome to EcoSort</h1>
      <p className="mt-3 text-muted-foreground text-pretty">
        Point your camera at any waste item and find out in seconds whether it breaks down naturally and how to
        dispose of it responsibly.
      </p>

      <figure className="mt-8 w-full rounded-2xl bg-accent px-6 py-6">
        <blockquote className="font-serif text-xl italic leading-relaxed text-accent-foreground text-balance">
          {'“The greatest threat to our planet is the belief that someone else will save it.”'}
        </blockquote>
        <figcaption className="mt-3 text-sm text-muted-foreground">Robert Swan, polar explorer</figcaption>
      </figure>

      <div className="mt-8 flex w-full flex-col gap-3">
        <Button size="lg" className="h-12 w-full text-base" onClick={onLogin}>
          <LogIn aria-hidden="true" />
          Login
        </Button>
        <Button size="lg" variant="outline" className="h-12 w-full text-base" onClick={onSignup}>
          <UserPlus aria-hidden="true" />
          Create Your Own Account
        </Button>
        <Button size="lg" variant="ghost" className="h-12 w-full text-base" onClick={onHelp}>
          <HelpCircle aria-hidden="true" />
          Help / Are You New to This App?
        </Button>
      </div>

      <button
        type="button"
        onClick={onGuest}
        className="mt-6 text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
      >
        Skip for now and continue as guest
      </button>
    </section>
  )
}
