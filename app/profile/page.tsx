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

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect("/api/auth/signin?callbackUrl=/profile")
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
      <div className="mx-auto max-w-5xl space-y-8">
        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-indigo-300">
            Profile
          </p>
          <div className="mt-4 flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="space-y-3">
              <h1 className="text-4xl font-extrabold tracking-tight text-white">
                {session.user.name ?? "Your account"}
              </h1>
              <p className="text-sm text-zinc-400">{session.user.email ?? "No email set"}</p>
              <div className="flex flex-wrap gap-2 pt-2">
                <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-zinc-300">
                  User ID: {userId}
                </span>
                <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-zinc-300">
                  Streak: {streak.currentStreak} days
                </span>
              </div>
            </div>

            <div className="grid h-24 w-24 place-items-center rounded-3xl bg-gradient-to-br from-indigo-400 to-cyan-400 text-3xl font-black text-zinc-950">
              {(session.user.name ?? session.user.email ?? "U").slice(0, 2).toUpperCase()}
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
              Solved
            </p>
            <p className="mt-3 text-3xl font-bold text-white">{solvedCount}</p>
            <p className="mt-2 text-sm text-zinc-400">Problems tracked in your progress history.</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
              Due now
            </p>
            <p className="mt-3 text-3xl font-bold text-white">{dueCount}</p>
            <p className="mt-2 text-sm text-zinc-400">Problems ready for another review.</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
              Last active
            </p>
            <p className="mt-3 text-3xl font-bold text-white">
              {streak.lastActiveDate ?? "No activity yet"}
            </p>
            <p className="mt-2 text-sm text-zinc-400">Based on your latest submission.</p>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
              Study preferences
            </p>
            <div className="mt-4 space-y-2 text-sm text-zinc-300">
              <p>Roadmap: {preferences?.targetRoadmap ?? "Not set"}</p>
              <p>Daily goal: {preferences?.dailyGoal ?? 3}</p>
              <p>Preferred difficulty: {preferences?.preferredDifficulty ?? "Any"}</p>
              <p>Reminder: {preferences?.studyReminderEnabled ? "On" : "Off"}</p>
              <p>Reminder time: {preferences?.studyReminderTime ?? "Not set"}</p>
              <p>Target date: {preferences?.targetInterviewDate?.toISOString().slice(0, 10) ?? "Not set"}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
              Quick links
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/dashboard"
                className="inline-flex items-center rounded-lg bg-indigo-500 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-indigo-400"
              >
                Open dashboard
              </Link>
              <Link
                href="/problems"
                className="inline-flex items-center rounded-lg border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-zinc-200 transition-colors hover:bg-white/10"
              >
                Open problem library
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
