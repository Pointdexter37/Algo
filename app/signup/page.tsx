import Link from "next/link"
import { registerUser } from "@/app/actions/auth"

export default function SignupPage() {
  const googleEnabled = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)

  return (
    <main className="min-h-screen bg-[#0a0a0a] px-6 py-12 text-zinc-100">
      <div className="mx-auto flex min-h-screen max-w-4xl items-center">
        <div className="grid w-full gap-8 rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:grid-cols-[1.1fr_0.9fr] md:p-8">
          <section className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-indigo-300">
              Create account
            </p>
            <h1 className="text-4xl font-extrabold tracking-tight text-white">
              Start your study plan
            </h1>
            <p className="max-w-xl text-sm leading-6 text-zinc-400">
              Create an account with email and password, or continue with Google. Your progress,
              reviews, and study settings will stay in one place.
            </p>

            {googleEnabled ? (
              <Link
                href="/api/auth/signin?callbackUrl=/dashboard"
                className="inline-flex items-center rounded-lg bg-white px-5 py-3 text-sm font-medium text-zinc-950 transition-colors hover:bg-zinc-200"
              >
                Continue with Google
              </Link>
            ) : (
              <p className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-zinc-400">
                Google sign-in will appear here once the OAuth credentials are configured.
              </p>
            )}
          </section>

          <form action={registerUser} className="space-y-4 rounded-2xl border border-white/10 bg-[#111111] p-5">
            <div className="grid gap-2">
              <label htmlFor="name" className="text-sm font-medium text-zinc-200">
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="Your name"
                className="rounded-lg border border-white/10 bg-[#0a0a0a] px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-indigo-400"
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="email" className="text-sm font-medium text-zinc-200">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                className="rounded-lg border border-white/10 bg-[#0a0a0a] px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-indigo-400"
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="password" className="text-sm font-medium text-zinc-200">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="At least 8 characters"
                className="rounded-lg border border-white/10 bg-[#0a0a0a] px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-indigo-400"
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-zinc-200">
                Confirm password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Repeat your password"
                className="rounded-lg border border-white/10 bg-[#0a0a0a] px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-indigo-400"
              />
            </div>

            <button
              type="submit"
              className="inline-flex w-full items-center justify-center rounded-lg bg-indigo-500 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-indigo-400"
            >
              Create account
            </button>

            <p className="text-center text-sm text-zinc-400">
              Already have an account?{" "}
              <Link href="/api/auth/signin" className="text-indigo-300 hover:text-indigo-200">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </main>
  )
}
