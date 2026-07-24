import Link from "next/link"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

function getDateKey(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
  }).format(date)
}

function shiftDateKey(dateKey: string, days: number) {
  const date = new Date(`${dateKey}T00:00:00.000Z`)
  date.setUTCDate(date.getUTCDate() - days)
  return date.toISOString().slice(0, 10)
}

function getCurrentStreak(submittedAtList: Date[]) {
  const uniqueDays = new Set(submittedAtList.map(getDateKey))
  if (uniqueDays.size === 0) {
    return { currentStreak: 0, lastActiveDate: null }
  }

  const sortedDays = Array.from(uniqueDays).sort().reverse()
  let currentStreak = 0
  let cursor = sortedDays[0]

  while (uniqueDays.has(cursor)) {
    currentStreak += 1
    cursor = shiftDateKey(cursor, 1)
  }

  return {
    currentStreak,
    lastActiveDate: sortedDays[0],
  }
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect("/api/auth/signin?callbackUrl=/dashboard")
  }

  const userId = session.user.id

  const [preferences, progress, submissions] = await Promise.all([
    prisma.userPreference.findUnique({ where: { userId } }),
    prisma.userProgress.findMany({
      where: { userId },
      select: { nextReviewDate: true },
    }),
    prisma.submission.findMany({
      where: { userId },
      select: { submittedAt: true },
      orderBy: { submittedAt: "desc" },
    }),
  ])

  const now = new Date()
  const dueCount = progress.filter((item) => item.nextReviewDate <= now).length
  const solvedCount = progress.length
  const streak = getCurrentStreak(submissions.map((item) => item.submittedAt))

  return (
    <main className="min-h-screen bg-[#0a0a0a] px-6 py-12 text-zinc-100">
      <div className="mx-auto max-w-6xl space-y-8">
        <section className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-indigo-300">
            Dashboard
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight text-white">
            Today’s study view
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-zinc-400">
            This page summarizes your current pace, review load, and study settings in one
            place.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-[1.6fr_1fr_1fr]">
          <div className="rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/15 via-white/[0.03] to-cyan-500/10 p-5 shadow-xl shadow-indigo-500/5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-300">
              Today’s focus
            </p>
            <h2 className="mt-3 text-2xl font-bold text-white">
              {dueCount > 0 ? "Review due problems first" : "Solve one new problem today"}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-300">
              {dueCount > 0
                ? "Your spaced-repetition queue already has items waiting. Clear those before starting new work."
                : "Your review queue is clear, so the next best move is to build momentum with a fresh problem."}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-zinc-300">
                {preferences?.targetRoadmap ?? "No roadmap set"}
              </span>
              <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-zinc-300">
                Goal: {preferences?.dailyGoal ?? 3} / day
              </span>
              <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-zinc-300">
                {preferences?.preferredDifficulty ?? "Any difficulty"}
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
              Solved
            </p>
            <p className="mt-3 text-3xl font-bold text-white">{solvedCount}</p>
            <p className="mt-2 text-sm text-zinc-400">
              Problems tracked in your progress history.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
              Due now
            </p>
            <p className="mt-3 text-3xl font-bold text-white">{dueCount}</p>
            <p className="mt-2 text-sm text-zinc-400">
              Items that need a review before you move on.
            </p>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
              Study streak
            </p>
            <p className="mt-3 text-3xl font-bold text-white">{streak.currentStreak} days</p>
            <p className="mt-2 text-sm text-zinc-400">
              Last active: {streak.lastActiveDate ?? "No activity yet"}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
              Target date
            </p>
            <p className="mt-3 text-3xl font-bold text-white">
              {preferences?.targetInterviewDate
                ? preferences.targetInterviewDate.toISOString().slice(0, 10)
                : "Not set"}
            </p>
            <p className="mt-2 text-sm text-zinc-400">
              Use this to pace your roadmap and review frequency.
            </p>
          </div>
        </section>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/problems"
            className="inline-flex items-center rounded-lg bg-indigo-500 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-indigo-400"
          >
            Open problem library
          </Link>
          <Link
            href="/onboarding"
            className="inline-flex items-center rounded-lg border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-zinc-200 transition-colors hover:bg-white/10"
          >
            Edit study goals
          </Link>
        </div>
      </div>
    </main>
  )
}
