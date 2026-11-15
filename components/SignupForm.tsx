"use client"

import Link from "next/link"
import { useActionState } from "react"
import { registerUser, type RegistrationState } from "@/app/actions/auth"

const initialState: RegistrationState = {}

export default function SignupForm() {
  const [state, formAction, isPending] = useActionState(registerUser, initialState)

  return (
    <form action={formAction} className="space-y-4 rounded-2xl border border-white/10 bg-[#111111] p-5">
      <div className="grid gap-2">
        <label htmlFor="name" className="text-sm font-medium text-zinc-200">Name</label>
        <input id="name" name="name" type="text" autoComplete="name" required placeholder="Your name" className="ui-input placeholder:text-zinc-500" />
      </div>
      <div className="grid gap-2">
        <label htmlFor="email" className="text-sm font-medium text-zinc-200">Email</label>
        <input id="email" name="email" type="email" autoComplete="email" required placeholder="you@example.com" className="ui-input placeholder:text-zinc-500" />
      </div>
      <div className="grid gap-2">
        <label htmlFor="password" className="text-sm font-medium text-zinc-200">Password</label>
        <input id="password" name="password" type="password" autoComplete="new-password" required placeholder="At least 8 characters" className="ui-input placeholder:text-zinc-500" />
      </div>
      <div className="grid gap-2">
        <label htmlFor="confirmPassword" className="text-sm font-medium text-zinc-200">Confirm password</label>
        <input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" required placeholder="Repeat your password" className="ui-input placeholder:text-zinc-500" />
      </div>
      {state.error ? (
        <p role="alert" className="rounded-lg border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
          {state.error}
        </p>
      ) : null}
      <button type="submit" disabled={isPending} className="ui-primary-button w-full">
        {isPending ? "Creating account..." : "Create account"}
      </button>
      <p className="text-center text-sm text-zinc-400">
        Already have an account?{" "}
        <Link href="/signin" className="text-[#e4ff93] hover:text-white">Sign in</Link>
      </p>
    </form>
  )
}
