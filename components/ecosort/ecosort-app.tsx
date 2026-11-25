'use client'

import { useState } from 'react'
import { WelcomeScreen } from './welcome-screen'
import { LoginView } from './login-view'
import { SignupView } from './signup-view'
import { HelpGuide } from './help-guide'
import { ScannerView } from './scanner-view'
import type { Account, AppUser } from './types'

type View = 'welcome' | 'login' | 'signup' | 'help' | 'scanner'

export function EcoSortApp() {
  const [view, setView] = useState<View>('welcome')
  const [accounts, setAccounts] = useState<Account[]>([])
  const [user, setUser] = useState<AppUser | null>(null)

  const enterApp = (nextUser: AppUser) => {
    setUser(nextUser)
    setView('scanner')
  }

  if (view === 'scanner' && user) {
    return (
      <ScannerView
        user={user}
        onSignOut={() => {
          setUser(null)
          setView('welcome')
        }}
        onHelp={() => setView('help')}
      />
    )
  }

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-4 py-10">
      {view === 'welcome' && (
        <WelcomeScreen
          onLogin={() => setView('login')}
          onSignup={() => setView('signup')}
          onHelp={() => setView('help')}
          onGuest={() => enterApp({ name: 'Guest', email: null })}
        />
      )}
      {view === 'login' && (
        <LoginView
          accounts={accounts}
          onBack={() => setView('welcome')}
          onSignupInstead={() => setView('signup')}
          onSuccess={(account) => enterApp({ name: account.name, email: account.email })}
        />
      )}
      {view === 'signup' && (
        <SignupView
          existingEmails={accounts.map((a) => a.email)}
          onBack={() => setView('welcome')}
          onLoginInstead={() => setView('login')}
          onVerified={(account) => {
            setAccounts((prev) => [...prev, account])
            enterApp({ name: account.name, email: account.email })
          }}
        />
      )}
      {view === 'help' && (
        <HelpGuide
          onBack={() => setView(user ? 'scanner' : 'welcome')}
          onStart={() => (user ? setView('scanner') : enterApp({ name: 'Guest', email: null }))}
        />
      )}
    </main>
  )
}
