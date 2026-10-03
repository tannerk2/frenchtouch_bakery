'use client'

import { useEffect, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { CalendarDays, ExternalLink, ImageIcon, LogOut, UtensilsCrossed } from 'lucide-react'
import { confirmResetPassword, confirmSignIn, getCurrentUser, resetPassword, signIn, signOut } from 'aws-amplify/auth'
import { Logo } from '@/components/bakery/logo'
import { useSiteData } from '@/components/site-data-provider'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { awsConfigured } from '@/lib/aws'
import { cn } from '@/lib/utils'
import { EventsEditor } from './events-editor'
import { Field } from './fields'
import { GalleryEditor } from './gallery-editor'
import { MenuEditor } from './menu-editor'
import { useAutoSave, type SaveState } from './use-auto-save'

const TABS = [
  { key: 'menu', label: 'Menu', icon: UtensilsCrossed },
  { key: 'events', label: 'Events', icon: CalendarDays },
  { key: 'gallery', label: 'Gallery', icon: ImageIcon },
] as const

type TabKey = (typeof TABS)[number]['key']

type AuthState = 'checking' | 'signedOut' | 'signedIn'

export function AdminPortal() {
  const [auth, setAuth] = useState<AuthState>('checking')

  useEffect(() => {
    if (!awsConfigured) {
      setAuth('signedOut')
      return
    }
    getCurrentUser().then(
      () => setAuth('signedIn'),
      () => setAuth('signedOut'),
    )
  }, [])

  if (auth === 'checking') return <div className="min-h-dvh bg-muted/60" />
  if (auth === 'signedOut') return <SignIn onSignedIn={() => setAuth('signedIn')} />
  return <Dashboard onSignedOut={() => setAuth('signedOut')} />
}

function Dashboard({ onSignedOut }: { onSignedOut: () => void }) {
  const [tab, setTab] = useState<TabKey>('menu')
  const { status } = useSiteData()
  const { state: saveState, retry } = useAutoSave(status === 'ready')

  async function handleSignOut() {
    if (saveState !== 'saved' && !window.confirm('Some changes haven’t been saved yet. Sign out anyway?')) return
    await signOut()
    onSignedOut()
  }

  return (
    <div className="min-h-dvh bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3 md:px-6">
          <div className="flex items-center gap-3">
            <Logo size={40} />
            <div className="flex flex-col leading-tight">
              <span className="font-script text-2xl">French Touch Bakery</span>
              <span className="text-sm text-muted-foreground">Admin</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {status === 'ready' ? <SaveIndicator state={saveState} onRetry={retry} /> : null}
            <Link
              href="/menu"
              className={buttonVariants({ variant: 'ghost', size: 'sm', className: 'text-base' })}
            >
              <ExternalLink aria-hidden="true" />
              View site
            </Link>
            <Button variant="outline" size="sm" className="text-base" onClick={handleSignOut}>
              <LogOut aria-hidden="true" />
              Sign out
            </Button>
          </div>
        </div>
        <nav aria-label="Admin sections" className="mx-auto max-w-5xl px-4 md:px-6">
          <ul className="flex gap-1">
            {TABS.map(({ key, label, icon: Icon }) => (
              <li key={key}>
                <button
                  type="button"
                  aria-current={tab === key ? 'page' : undefined}
                  onClick={() => setTab(key)}
                  className={cn(
                    'inline-flex items-center gap-2 border-b-2 px-4 py-3 text-lg font-semibold transition-colors',
                    tab === key
                      ? 'border-rouge text-foreground'
                      : 'border-transparent text-muted-foreground hover:text-foreground',
                  )}
                >
                  <Icon className="size-4" aria-hidden="true" />
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-8 md:px-6 md:py-10">
        {status === 'loading' ? <p className="text-lg text-muted-foreground">Loading your content…</p> : null}
        {status === 'error' ? (
          <p role="alert" className="rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-base leading-relaxed">
            Your content couldn’t be loaded, so editing is paused to keep it safe. Check your internet connection and
            reload the page.
          </p>
        ) : null}
        {status === 'ready' ? (
          <>
            <p className="mb-8 text-base text-muted-foreground">
              Changes save automatically and show on the website right away.
            </p>
            {tab === 'menu' ? <MenuEditor /> : null}
            {tab === 'events' ? <EventsEditor /> : null}
            {tab === 'gallery' ? <GalleryEditor /> : null}
          </>
        ) : null}
      </div>
    </div>
  )
}

function SaveIndicator({ state, onRetry }: { state: SaveState; onRetry: () => void }) {
  if (state === 'error') {
    return (
      <p role="alert" className="px-2 text-base text-destructive">
        Couldn’t save.{' '}
        <button type="button" onClick={onRetry} className="font-semibold underline underline-offset-4">
          Try again
        </button>
      </p>
    )
  }
  return (
    <p aria-live="polite" className="px-2 text-base text-muted-foreground">
      {state === 'saved' ? 'All changes saved' : 'Saving…'}
    </p>
  )
}

type SignInMode = 'signIn' | 'newPassword' | 'forgot' | 'reset'

const SIGN_IN_COPY: Record<SignInMode, { intro: string; submit: string }> = {
  signIn: { intro: 'Sign in to update your menu, events and gallery.', submit: 'Sign in' },
  newPassword: { intro: 'Welcome! Choose your own password to finish signing in.', submit: 'Save password' },
  forgot: { intro: 'Enter your email and we’ll send you a code to reset your password.', submit: 'Email me a code' },
  reset: { intro: 'Check your email for a code, then choose a new password.', submit: 'Reset password' },
}

// Cognito sign-in, including the forced password change on first login and self-service password reset.
function SignIn({ onSignedIn }: { onSignedIn: () => void }) {
  const [mode, setMode] = useState<SignInMode>('signIn')
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<{ tone: 'error' | 'info'; text: string } | null>(null)
  const copy = SIGN_IN_COPY[mode]

  function switchMode(next: SignInMode) {
    setMessage(null)
    setMode(next)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const field = (name: string) => String(form.get(name) ?? '')
    setBusy(true)
    setMessage(null)
    try {
      if (mode === 'signIn' || mode === 'newPassword') {
        const { isSignedIn, nextStep } =
          mode === 'signIn'
            ? await signIn({ username: email, password: field('password') })
            : await confirmSignIn({ challengeResponse: field('newPassword') })
        if (isSignedIn) {
          onSignedIn()
        } else if (nextStep.signInStep === 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED') {
          setMode('newPassword')
        } else if (nextStep.signInStep === 'RESET_PASSWORD') {
          await resetPassword({ username: email })
          setMode('reset')
        } else {
          throw new Error(`Unexpected sign-in step: ${nextStep.signInStep}`)
        }
      } else if (mode === 'forgot') {
        await resetPassword({ username: email })
        setMode('reset')
      } else {
        await confirmResetPassword({ username: email, confirmationCode: field('code'), newPassword: field('newPassword') })
        setMode('signIn')
        setMessage({ tone: 'info', text: 'Password changed. Sign in with your new password.' })
      }
    } catch (error) {
      setMessage({ tone: 'error', text: error instanceof Error ? error.message : 'Something went wrong. Please try again.' })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-muted/60 px-4 py-12">
      {/* Keyed by mode so password fields never carry text over between steps. */}
      <form
        key={mode}
        onSubmit={handleSubmit}
        className="flex w-full max-w-sm flex-col gap-6 rounded-3xl border border-border bg-card p-8"
      >
        <div className="flex flex-col items-center gap-3 text-center">
          <Logo size={88} priority />
          <h1 className="font-script text-4xl">Bonjour, Agathe</h1>
          <p className="text-base text-muted-foreground">{copy.intro}</p>
        </div>
        {!awsConfigured ? (
          <p role="alert" className="rounded-xl bg-blush/40 px-4 py-3 text-base">
            The admin isn’t connected to AWS yet. Run <code>scripts/deploy.sh</code> first.
          </p>
        ) : null}
        {message ? (
          <p
            role={message.tone === 'error' ? 'alert' : 'status'}
            className={cn(
              'rounded-xl px-4 py-3 text-base',
              message.tone === 'error' ? 'bg-destructive/10 text-destructive' : 'bg-sage/30',
            )}
          >
            {message.text}
          </p>
        ) : null}
        {mode === 'signIn' || mode === 'forgot' ? (
          <Field label="Email" htmlFor="admin-email">
            <Input
              id="admin-email"
              type="email"
              required
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value.trim())}
              className="text-base"
            />
          </Field>
        ) : null}
        {mode === 'signIn' ? (
          <Field label="Password" htmlFor="admin-password">
            <Input id="admin-password" name="password" type="password" required autoComplete="current-password" className="text-base" />
          </Field>
        ) : null}
        {mode === 'reset' ? (
          <Field label="Code from your email" htmlFor="admin-code">
            <Input id="admin-code" name="code" required inputMode="numeric" autoComplete="one-time-code" className="text-base" />
          </Field>
        ) : null}
        {mode === 'newPassword' || mode === 'reset' ? (
          <Field label="New password" htmlFor="admin-new-password" hint="At least 10 characters.">
            <Input
              id="admin-new-password"
              name="newPassword"
              type="password"
              required
              minLength={10}
              autoComplete="new-password"
              className="text-base"
            />
          </Field>
        ) : null}
        <Button type="submit" size="lg" disabled={busy || !awsConfigured} className="rounded-full text-lg">
          {busy ? 'One moment…' : copy.submit}
        </Button>
        <button
          type="button"
          onClick={() => switchMode(mode === 'signIn' ? 'forgot' : 'signIn')}
          className="text-base text-muted-foreground underline underline-offset-4 hover:text-foreground"
        >
          {mode === 'signIn' ? 'Forgot your password?' : 'Back to sign in'}
        </button>
      </form>
    </div>
  )
}
