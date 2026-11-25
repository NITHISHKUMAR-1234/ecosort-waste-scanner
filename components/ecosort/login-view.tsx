'use client'

import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { AuthCard, FormError, FormField, TextInput } from './form-field'
import type { Account } from './types'

type Props = {
  accounts: Account[]
  onBack: () => void
  onSignupInstead: () => void
  onSuccess: (account: Account) => void
}

export function LoginView({ accounts, onBack, onSignupInstead, onSuccess }: Props) {
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const email = String(data.get('email')).trim().toLowerCase()
    const password = String(data.get('password'))
    const account = accounts.find((a) => a.email === email && a.password === password)
    if (!account) {
      setError('Email or password is incorrect.')
      return
    }
    onSuccess(account)
  }

  return (
    <AuthCard title="Login" description="Sign in with your Email ID and password." onBack={onBack}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <FormField id="login-email" label="Email ID">
          <TextInput id="login-email" name="email" type="email" autoComplete="email" required placeholder="you@example.com" />
        </FormField>
        <FormField id="login-password" label="Password">
          <TextInput id="login-password" name="password" type="password" autoComplete="current-password" required />
        </FormField>
        <FormError message={error} />
        <Button type="submit" size="lg" className="h-11 w-full">
          Login
        </Button>
      </form>
      <p className="mt-5 text-center text-sm text-muted-foreground">
        {'New here? '}
        <button type="button" onClick={onSignupInstead} className="font-medium text-primary underline-offset-4 hover:underline">
          Create an account
        </button>
      </p>
    </AuthCard>
  )
}
