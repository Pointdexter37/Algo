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

function getTopTopics(items: { topicTags: string }[], limit = 4) {
  const counts = new Map<string, number>()

  for (const item of items) {
    for (const tag of item.topicTags.split(", ").filter(Boolean)) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1)
    }
  }

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
}

function getTimeKey(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date)
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
      select: {
        nextReviewDate: true,
        problem: {
          select: {
            difficulty: true,
            topicTags: true,
            title: true,
          },
        },
      },
    }),
    prisma.submission.findMany({
      where: { userId },
      select: {
        submittedAt: true,
        status: true,
        timeSpent: true,
        problem: {
          select: {
            leetcodeId: true,
            title: true,
            difficulty: true,
          },
        },
      },
      orderBy: { submittedAt: "desc" },
      take: 5,
    }),
  ])

  const now = new Date()
  const dueProgress = progress.filter((item) => item.nextReviewDate <= now)
  const dueCount = dueProgress.length
  const solvedCount = progress.length
  const streak = getCurrentStreak(submissions.map((item) => item.submittedAt))
  const todayKey = getDateKey(now)
  const hasActivityToday = submissions.some((item) => getDateKey(item.submittedAt) === todayKey)
  const reminderTime = preferences?.studyReminderTime ?? ""
  const currentTimeKey = getTimeKey(now)
  const shouldShowReminder =
    Boolean(preferences?.studyReminderEnabled && reminderTime) &&
    !hasActivityToday &&
    currentTimeKey >= reminderTime
  const difficultyCounts = progress.reduce(
    (acc, item) => {
      const difficulty = item.problem.difficulty
      acc[difficulty] = (acc[difficulty] ?? 0) + 1
      return acc
    },
    { Easy: 0, Medium: 0, Hard: 0 } as Record<string, number>,
  )
  const topWeakTopics = getTopTopics(dueProgress.map((item) => item.problem))

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

        {shouldShowReminder && (
          <section className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-5 py-4 text-amber-100">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">
              Study reminder
            </p>
            <p className="mt-2 text-sm leading-6 text-amber-50">
              Your reminder is set for {reminderTime}. You have not logged activity today yet,
              so this is a good time to open the problem library and clear your next review.
            </p>
          </section>
        )}

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

        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Reminder settings
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-zinc-200">
              {preferences?.studyReminderEnabled ? "Reminders on" : "Reminders off"}
            </span>
            <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-zinc-200">
              {preferences?.studyReminderTime ?? "No reminder time set"}
            </span>
          </div>
          <p className="mt-3 text-sm text-zinc-400">
            This is only stored for now. It becomes useful once scheduled notifications are added.
          </p>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Recent activity
          </p>
          <div className="mt-4 space-y-3">
            {submissions.length > 0 ? (
              submissions.map((submission) => (
                <div
                  key={`${submission.problem.leetcodeId}-${submission.submittedAt.toISOString()}`}
                  className="flex flex-col gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="font-medium text-white">
                      {submission.problem.leetcodeId}. {submission.problem.title}
                    </p>
                    <p className="text-sm text-zinc-400">
                      {submission.problem.difficulty} · {submission.status}
                      {submission.timeSpent ? ` · ${submission.timeSpent} min` : ""}
                    </p>
                  </div>
                  <p className="text-sm text-zinc-500">
                    {submission.submittedAt.toISOString().slice(0, 10)}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-zinc-400">
                No submission history yet. Solve your first problem to start building this log.
              </p>
            )}
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
              Progress by difficulty
            </p>
            <div className="mt-4 space-y-3">
              {(["Easy", "Medium", "Hard"] as const).map((difficulty) => {
                const count = difficultyCounts[difficulty]
                const total = solvedCount || 1
                const percent = Math.round((count / total) * 100)

                return (
                  <div key={difficulty} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-zinc-200">{difficulty}</span>
                      <span className="text-zinc-400">{count}</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/5">
                      <div
                        className={`h-2 rounded-full ${
                          difficulty === "Easy"
                            ? "bg-emerald-400"
                            : difficulty === "Medium"
                              ? "bg-amber-400"
                              : "bg-rose-400"
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
              Weak-topic signals
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              {topWeakTopics.length > 0 ? (
                topWeakTopics.map(([topic, count]) => (
                  <span
                    key={topic}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-zinc-200"
                  >
                    {topic}
                    <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-zinc-400">
                      {count}
                    </span>
                  </span>
                ))
              ) : (
                <p className="text-sm text-zinc-400">
                  Solve and review more problems to reveal your weakest topics.
                </p>
              )}
            </div>
            <p className="mt-3 text-sm text-zinc-400">
              These topics appear most often in items that are due for review today.
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
            href="/reviews"
            className="inline-flex items-center rounded-lg border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-zinc-200 transition-colors hover:bg-white/10"
          >
            Open reviews
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
