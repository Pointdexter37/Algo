import Link from "next/link"
import { registerUser } from "@/app/actions/auth"

export default function SignupPage() {
  return (
    <main className="app-shell min-h-screen px-4 py-10 text-zinc-100 sm:px-6 sm:py-12">
      <div className="mx-auto flex min-h-screen max-w-4xl items-center">
        <div className="grid w-full gap-8 rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:grid-cols-[1.1fr_0.9fr] md:p-8">
          <section className="space-y-4">
            <p className="eyebrow">Create account</p>
            <h1 className="text-4xl font-extrabold tracking-tight text-white">
              Start your study plan
            </h1>
            <p className="max-w-xl text-sm leading-6 text-zinc-400">
              Create an account with email and password. Your progress, reviews, and study
              settings will stay in one place.
            </p>

            <p className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-zinc-400">
              Google OAuth has been removed for now. Use email and password to create your
              account.
            </p>
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
                className="ui-input placeholder:text-zinc-500"
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
                className="ui-input placeholder:text-zinc-500"
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
                className="ui-input placeholder:text-zinc-500"
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
                className="ui-input placeholder:text-zinc-500"
              />
            </div>

            <button
              type="submit"
              className="ui-primary-button w-full"
            >
              Create account
            </button>

            <p className="text-center text-sm text-zinc-400">
              Already have an account?{" "}
              <Link href="/api/auth/signin" className="text-[#e4ff93] hover:text-white">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </main>
  )
}
