'use client'

import { useState, type FormEvent } from 'react'
import { MailCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AuthCard, FormError, FormField, TextInput, inputClass } from './form-field'
import type { Account } from './types'

type Props = {
  existingEmails: string[]
  onBack: () => void
  onLoginInstead: () => void
  onVerified: (account: Account) => void
}

const ROLES = ['Student', 'Teacher', 'Household', 'Business / Office', 'Waste Worker', 'Other']
const GENDERS = ['Female', 'Male', 'Non-binary', 'Prefer not to say']

function generateOtp() {
  const values = new Uint32Array(1)
  crypto.getRandomValues(values)
  return String(values[0] % 1_000_000).padStart(6, '0')
}

export function SignupView({ existingEmails, onBack, onLoginInstead, onVerified }: Props) {
  const [pending, setPending] = useState<Account | null>(null)
  const [otp, setOtp] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleDetails = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const account: Account = {
      email: String(data.get('email')).trim().toLowerCase(),
      password: String(data.get('password')),
      name: String(data.get('name')).trim(),
      role: String(data.get('role')),
      dateOfBirth: String(data.get('dob')),
      gender: String(data.get('gender')),
    }
    if (account.password.length < 8) return setError('Password must be at least 8 characters.')
    if (existingEmails.includes(account.email)) return setError('An account with this email already exists.')
    if (new Date(account.dateOfBirth) > new Date()) return setError('Date of birth cannot be in the future.')
    setError(null)
    setOtp(generateOtp())
    setPending(account)
  }

  const handleVerify = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const code = String(new FormData(e.currentTarget).get('otp')).trim()
    if (code !== otp || !pending) return setError('That code does not match. Please try again.')
    onVerified(pending)
  }

  if (pending) {
    return (
      <AuthCard
        title="Verify your email"
        description={`Enter the 6-digit code sent to ${pending.email} to confirm your account.`}
        onBack={() => {
          setPending(null)
          setError(null)
        }}
      >
        <div className="mb-5 flex items-start gap-3 rounded-xl bg-accent p-4 text-sm text-accent-foreground">
          <MailCheck className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
          <p>
            Demo mode: email delivery is not connected yet, so your code is shown here:{' '}
            <span className="font-mono text-base font-semibold tracking-widest">{otp}</span>
          </p>
        </div>
        <form onSubmit={handleVerify} className="flex flex-col gap-4">
          <FormField id="otp" label="Verification code">
            <TextInput
              id="otp"
              name="otp"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]{6}"
              maxLength={6}
              required
              className="text-center font-mono text-lg tracking-[0.5em]"
            />
          </FormField>
          <FormError message={error} />
          <Button type="submit" size="lg" className="h-11 w-full">
            Verify and enter EcoSort
          </Button>
          <button
            type="button"
            onClick={() => {
              setOtp(generateOtp())
              setError(null)
            }}
            className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
          >
            Resend code
          </button>
        </form>
      </AuthCard>
    )
  }

  return (
    <AuthCard title="Create your account" description="A few details and a quick email check, then you are in." onBack={onBack}>
      <form onSubmit={handleDetails} className="flex flex-col gap-4">
        <FormField id="su-email" label="Email ID">
          <TextInput id="su-email" name="email" type="email" autoComplete="email" required placeholder="you@example.com" />
        </FormField>
        <FormField id="su-password" label="Password" hint="At least 8 characters.">
          <TextInput id="su-password" name="password" type="password" autoComplete="new-password" minLength={8} required />
        </FormField>
        <FormField id="su-name" label="Name">
          <TextInput id="su-name" name="name" autoComplete="name" required placeholder="Your full name" />
        </FormField>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id="su-role" label="Role">
            <select id="su-role" name="role" required defaultValue="" className={inputClass}>
              <option value="" disabled>
                Select role
              </option>
              {ROLES.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </FormField>
          <FormField id="su-gender" label="Gender">
            <select id="su-gender" name="gender" required defaultValue="" className={inputClass}>
              <option value="" disabled>
                Select gender
              </option>
              {GENDERS.map((g) => (
                <option key={g}>{g}</option>
              ))}
            </select>
          </FormField>
        </div>
        <FormField id="su-dob" label="Date of Birth">
          <TextInput id="su-dob" name="dob" type="date" autoComplete="bday" required />
        </FormField>
        <FormError message={error} />
        <Button type="submit" size="lg" className="h-11 w-full">
          Send verification code
        </Button>
      </form>
      <p className="mt-5 text-center text-sm text-muted-foreground">
        {'Already have an account? '}
        <button type="button" onClick={onLoginInstead} className="font-medium text-primary underline-offset-4 hover:underline">
          Login
        </button>
      </p>
    </AuthCard>
  )
}
