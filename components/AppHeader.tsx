"use client"

import Link from "next/link"
import SignOutButton from "@/components/SignOutButton"
import type { Session } from "next-auth"
import { usePathname } from "next/navigation"
import { useSyncExternalStore } from "react"
import type { ReactNode } from "react"

const SOURCE_URL = "https://github.com/Pointdexter37/Algo"
const SIDEBAR_STORAGE_KEY = "algopilot-sidebar"

function subscribeToSidebar(callback: () => void) {
  window.addEventListener("algopilot-sidebar-change", callback)
  return () => window.removeEventListener("algopilot-sidebar-change", callback)
}

function getSidebarSnapshot() {
  return window.localStorage.getItem(SIDEBAR_STORAGE_KEY) !== "closed"
}

function getSidebarServerSnapshot() {
  return true
}

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
  const isOpen = useSyncExternalStore(
    subscribeToSidebar,
    getSidebarSnapshot,
    getSidebarServerSnapshot,
  )

  const setSidebarOpen = (open: boolean) => {
    window.localStorage.setItem(SIDEBAR_STORAGE_KEY, open ? "open" : "closed")
    window.dispatchEvent(new Event("algopilot-sidebar-change"))
  }

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: DashboardIcon },
    { href: "/problems", label: "Problems", icon: ProblemsIcon },
    { href: "/reviews", label: "Reviews", icon: ReviewIcon },
    { href: "/analytics", label: "Analytics", icon: ChartIcon },
    { href: "/roadmap", label: "Roadmap", icon: RoadmapIcon },
    { href: "/profile", label: "Profile", icon: ProfileIcon },
  ]

  return (
    <>
      <header
        className={`fixed inset-y-0 left-0 z-50 w-[min(19rem,calc(100vw-2rem))] border-r border-white/10 bg-[#060606]/95 shadow-2xl shadow-black/40 backdrop-blur-xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col px-4 py-4">
          <div className="flex items-center justify-between gap-3">
            <Link href="/" className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl border border-[#d7ff4f]/30 bg-[#d7ff4f] font-mono text-xs font-black tracking-[-0.15em] text-[#111408] shadow-[0_0_24px_rgba(215,255,79,0.14)]">
                AP
              </span>
              <div>
                <p className="text-sm font-semibold text-white">AlgoPilot</p>
                <p className="text-xs text-zinc-500">Personal coding interview coach</p>
              </div>
            </Link>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close navigation sidebar"
              className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 bg-white/5 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
            >
              <CloseIcon />
            </button>
          </div>

          <nav className="mt-8 grid gap-2" aria-label="Primary navigation">
            {navItems.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => {
                    if (window.innerWidth < 768) setSidebarOpen(false)
                  }}
                  className={`inline-flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors ${
                    active
                      ? "border-[#d7ff4f]/30 bg-[#d7ff4f]/10 text-[#e4ff93] shadow-[0_0_0_1px_rgba(215,255,79,0.05)]"
                      : "border-white/10 bg-white/[0.03] text-zinc-300 hover:border-white/20 hover:bg-white/8 hover:text-white"
                  }`}
                >
                  <Icon />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          <div className="mt-auto flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${
                  user
                    ? "border-[#d7ff4f]/20 bg-[#d7ff4f]/10 text-[#e4ff93]"
                    : "border-white/10 bg-white/5 text-zinc-300"
                }`}
              >
                {user ? "Signed in" : "Signed out"}
              </span>
              <span className="truncate text-xs text-zinc-500">
                {user?.email ?? "Use sign in or sign up"}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <a
                href={SOURCE_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm font-medium text-zinc-200 transition duration-200 hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/10 hover:text-[#e4ff93]"
              >
                <GitHubMark />
                <span>Source code</span>
              </a>
              {user ? (
                <>
                  <Link
                    href="/profile"
                    className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 transition duration-200 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/8"
                  >
                    <div className="grid h-9 w-9 place-items-center rounded-full bg-[#d7ff4f] text-xs font-bold text-[#111408] shadow-lg shadow-[#d7ff4f]/10">
                      {initials}
                    </div>
                    <div className="min-w-0 text-left">
                      <p className="truncate text-sm font-medium text-white">{user.name ?? "Your profile"}</p>
                      <p className="truncate text-xs text-zinc-400">{user.email ?? "Signed in"}</p>
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
                    className="accent-button inline-flex items-center rounded-lg px-3 py-2 text-sm font-bold transition-colors"
                  >
                    Sign in
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <button
        type="button"
        aria-label="Close navigation overlay"
        onClick={() => setSidebarOpen(false)}
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-[2px] transition-opacity md:hidden ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <button
        type="button"
        onClick={() => setSidebarOpen(true)}
        aria-label="Open navigation sidebar"
        className={`fixed left-4 top-4 z-50 grid h-10 w-10 place-items-center rounded-xl border border-[#d7ff4f]/25 bg-[#111110] text-[#e4ff93] shadow-xl shadow-black/30 transition-all duration-300 hover:bg-[#d7ff4f]/10 ${
          isOpen ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
      >
        <MenuIcon />
      </button>
    </>
  )
}

function CloseIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2">
      <path d="m7 7 10 10M17 7 7 17" />
    </svg>
  )
}

function MenuIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2">
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  )
}

function GitHubMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-current text-zinc-200">
      <path d="M12 2C6.477 2 2 6.64 2 12.376c0 4.59 2.865 8.482 6.84 9.859.5.095.682-.221.682-.492 0-.243-.01-.887-.014-1.74-2.782.617-3.369-1.379-3.369-1.379-.455-1.19-1.11-1.507-1.11-1.507-.908-.64.069-.627.069-.627 1.004.073 1.532 1.064 1.532 1.064.893 1.57 2.344 1.117 2.91.855.091-.663.35-1.116.636-1.373-2.22-.258-4.555-1.141-4.555-5.078 0-1.121.39-2.038 1.03-2.757-.104-.26-.446-1.308.098-2.727 0 0 .84-.276 2.75 1.053a9.17 9.17 0 0 1 2.5-.347 9.17 9.17 0 0 1 2.5.347c1.909-1.329 2.748-1.053 2.748-1.053.545 1.419.202 2.467.099 2.727.64.719 1.028 1.636 1.028 2.757 0 3.947-2.34 4.817-4.566 5.071.359.318.678.947.678 1.91 0 1.378-.012 2.487-.012 2.826 0 .274.18.592.688.491A10.402 10.402 0 0 0 22 12.376C22 6.64 17.523 2 12 2z" />
    </svg>
  )
}

function NavIcon({ children }: { children: ReactNode }) {
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 shrink-0 fill-none stroke-current stroke-2">{children}</svg>
}

function DashboardIcon() {
  return <NavIcon><path d="M4 13h6V4H4v9Zm10 7h6v-9h-6v9ZM4 20h6v-3H4v3Zm10-12h6V4h-6v4Z" /></NavIcon>
}

function ProblemsIcon() {
  return <NavIcon><path d="M5 5h14v14H5zM8 9h8M8 13h5M8 17h3" /></NavIcon>
}

function ReviewIcon() {
  return <NavIcon><path d="M4 6h16M4 12h16M4 18h10" /><path d="m17 16 2 2 3-4" /></NavIcon>
}

function ChartIcon() {
  return <NavIcon><path d="M5 19V9M12 19V5M19 19v-7" /></NavIcon>
}

function RoadmapIcon() {
  return <NavIcon><path d="M6 4v16M18 4v16M6 7h12M6 17h12" /><circle cx="6" cy="7" r="1.5" /><circle cx="18" cy="17" r="1.5" /></NavIcon>
}

function ProfileIcon() {
  return <NavIcon><circle cx="12" cy="8" r="3" /><path d="M5 20c.8-3.2 3.1-5 7-5s6.2 1.8 7 5" /></NavIcon>
}
