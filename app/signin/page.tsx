"use client"

import Link from "next/link"
import { signIn } from "next-auth/react"
import { FormEvent, useState } from "react"
import { useSearchParams } from "next/navigation"

export default function SigninPage() {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard"
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage("")
    setIsSubmitting(true)

    const result = await signIn("credentials", {
      email,
      password,
      callbackUrl,
      redirect: false,
    })

    if (!result || result.error) {
      setErrorMessage("That email or password is not correct.")
      setIsSubmitting(false)
      return
    }

    window.location.assign(result.url ?? callbackUrl)
  }

  return (
    <main className="app-shell min-h-screen px-4 py-10 text-zinc-100 sm:px-6 sm:py-12">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-4xl items-center gap-8 md:grid-cols-[1.1fr_0.9fr]">
        <section className="space-y-5">
          <p className="eyebrow">Welcome back</p>
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            Keep the patterns you worked for.
          </h1>
          <p className="max-w-xl text-sm leading-6 text-zinc-400">
            Sign in to continue your track, clear today&apos;s review queue, and keep your
            interview preparation moving.
          </p>
          <Link href="/demo" className="text-sm font-semibold text-[#e4ff93] hover:text-white">
            Prefer to look around first? Try the demo →
          </Link>
        </section>

        <form
          onSubmit={handleSubmit}
          className="app-surface space-y-4 rounded-2xl p-6"
        >
          <div className="grid gap-2">
            <label htmlFor="signin-email" className="text-sm font-medium text-zinc-200">
              Email
            </label>
            <input
              id="signin-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="ui-input"
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="signin-password" className="text-sm font-medium text-zinc-200">
              Password
            </label>
            <input
              id="signin-password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="ui-input"
            />
          </div>
          {errorMessage ? (
            <p role="alert" className="rounded-lg border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
              {errorMessage}
            </p>
          ) : null}
          <button type="submit" disabled={isSubmitting} className="ui-primary-button w-full">
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
          <p className="text-center text-sm text-zinc-400">
            New here?{" "}
            <Link href="/signup" className="text-[#e4ff93] hover:text-white">
              Create an account
            </Link>
          </p>
        </form>
      </div>
    </main>
  )
}
