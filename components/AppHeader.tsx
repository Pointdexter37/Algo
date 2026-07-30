 "use client"

import Link from "next/link"
import SignOutButton from "@/components/SignOutButton"
import type { Session } from "next-auth"
import { usePathname } from "next/navigation"

function getInitials(name?: string | null, email?: string | null) {
  const source = name ?? email ?? "U"
  const parts = source.trim().split(/\s+/)
  const first = parts[0]?.[0] ?? "U"
  const second = parts.length > 1 ? parts[parts.length - 1]?.[0] : source[1] ?? ""
  return `${first}${second}`.toUpperCase()
}

export default function AppHeader({ session }: { session: Session | null }) {
  const user = session?.user
  const initials = getInitials(user?.name, user?.email)
  const pathname = usePathname()

  const navItems = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/problems", label: "Problems" },
    { href: "/reviews", label: "Reviews" },
    { href: "/roadmap", label: "Roadmap" },
    { href: "/profile", label: "Profile" },
  ]

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0a0a0a]/95 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6">
        <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 shadow-lg shadow-black/10 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center justify-between gap-3">
            <Link href="/" className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-2xl border border-indigo-500/30 bg-indigo-500/10 text-sm font-bold text-indigo-200">
                AP
              </span>
              <div>
                <p className="text-sm font-semibold text-white">AlgoPilot</p>
                <p className="text-xs text-zinc-500">Personal coding interview coach</p>
              </div>
            </Link>

            <div className="flex items-center gap-2 lg:hidden">
              <span
                className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${
                  user
                    ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                    : "border-white/10 bg-white/5 text-zinc-300"
                }`}
              >
                {user ? "Signed in" : "Signed out"}
              </span>
            </div>
          </div>

          <nav className="flex flex-wrap gap-2">
            {navItems.map((item) => {
              const active = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center rounded-full border px-3 py-2 text-sm font-medium transition-colors ${
                    active
                      ? "border-indigo-500/30 bg-indigo-500/15 text-indigo-200"
                      : "border-white/10 bg-white/[0.03] text-zinc-300 hover:bg-white/5"
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="hidden items-center gap-2 lg:flex">
              <span
                className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${
                  user
                    ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                    : "border-white/10 bg-white/5 text-zinc-300"
                }`}
              >
                {user ? "Signed in" : "Signed out"}
              </span>
              {user ? (
                <span className="text-xs text-zinc-500">
                  {user.email ?? "Authenticated user"}
                </span>
              ) : (
                <span className="text-xs text-zinc-500">Use sign in or sign up</span>
              )}
            </div>

            <div className="flex items-center gap-3">
              {user ? (
                <>
                  <Link
                    href="/profile"
                    className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 transition-colors hover:bg-white/5"
                  >
                    <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-indigo-400 to-cyan-400 text-xs font-bold text-zinc-950">
                      {initials}
                    </div>
                    <div className="hidden text-left sm:block">
                      <p className="text-sm font-medium text-white">{user.name ?? "Your profile"}</p>
                      <p className="text-xs text-zinc-400">{user.email ?? "Signed in"}</p>
                    </div>
                  </Link>
                  <SignOutButton />
                </>
              ) : (
                <>
                  <Link
                    href="/signup"
                    className="inline-flex items-center rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-zinc-200 transition-colors hover:bg-white/10"
                  >
                    Sign up
                  </Link>
                  <Link
                    href="/api/auth/signin"
                    className="inline-flex items-center rounded-lg bg-indigo-500 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-400"
                  >
                    Sign in
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
