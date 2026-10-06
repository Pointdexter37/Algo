import Link from "next/link"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

function getDayKey(date: Date) {
  return date.toISOString().slice(0, 10)
}

function getDateLabel(date: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    month: "short",
    day: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(date)
}

export default async function AnalyticsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    redirect("/api/auth/signin?callbackUrl=/analytics")
  }

  const userId = session.user.id
  const since = new Date()
  since.setDate(since.getDate() - 29)
  const [submissions, attempts, progress] = await Promise.all([
    prisma.submission.findMany({
      where: { userId, submittedAt: { gte: since } },
      select: {
        submittedAt: true,
        timeSpent: true,
        problem: { select: { difficulty: true, topicTags: true } },
      },
      orderBy: { submittedAt: "asc" },
    }),
    prisma.reviewAttempt.findMany({
      where: { userId, reviewedAt: { gte: since } },
      select: { rating: true, outcome: true, confidenceBefore: true, confidenceAfter: true },
    }),
    prisma.userProgress.findMany({
      where: { userId },
      select: { nextReviewDate: true },
    }),
  ])

  const activityByDay = new Map<string, number>()
  const topicCounts = new Map<string, number>()
  const difficultyCounts = new Map<string, number>()
  let totalMinutes = 0
  for (const submission of submissions) {
    const day = getDayKey(submission.submittedAt)
    activityByDay.set(day, (activityByDay.get(day) ?? 0) + 1)
    totalMinutes += submission.timeSpent ?? 0
    difficultyCounts.set(
      submission.problem.difficulty,
      (difficultyCounts.get(submission.problem.difficulty) ?? 0) + 1,
    )
    for (const topic of submission.problem.topicTags.split(", ").filter(Boolean)) {
      topicCounts.set(topic, (topicCounts.get(topic) ?? 0) + 1)
    }
  }

  const activeDays = activityByDay.size
  const solvedCount = submissions.length
  const averageMinutes = solvedCount > 0 ? Math.round(totalMinutes / solvedCount) : 0
  const successfulReviews = attempts.filter((attempt) => attempt.rating >= 3).length
  const retention = attempts.length > 0 ? Math.round((successfulReviews / attempts.length) * 100) : 0
  const confidenceChanges = attempts.filter(
    (attempt) => attempt.confidenceBefore !== null && attempt.confidenceAfter !== null,
  )
  const confidenceGain =
    confidenceChanges.length > 0
      ? (
          confidenceChanges.reduce(
            (sum, attempt) => sum + (attempt.confidenceAfter! - attempt.confidenceBefore!),
            0,
          ) / confidenceChanges.length
        ).toFixed(1)
      : "0.0"
  const topTopics = Array.from(topicCounts.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 8)
  const reviewQueue = progress.filter((item) => item.nextReviewDate <= new Date()).length
  const recentDays = Array.from({ length: 7 }, (_, index) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - index))
    return { date, count: activityByDay.get(getDayKey(date)) ?? 0 }
  })

  return (
    <main className="app-shell min-h-screen px-6 py-12 text-zinc-100 sm:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <section className="space-y-3">
          <p className="eyebrow">Analytics</p>
          <h1 className="text-4xl font-extrabold tracking-tight text-white">Your learning signals</h1>
          <p className="max-w-2xl text-sm leading-6 text-zinc-400">
            A practical view of the last 30 days. Use these signals to adjust your pace, not to
            chase perfect numbers.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            ["Problems solved", solvedCount, "in the last 30 days"],
            ["Active days", activeDays, "days with at least one solve"],
            ["Average time", `${averageMinutes}m`, "per recorded solve"],
            ["Review retention", `${retention}%`, "ratings of Good or Easy"],
          ].map(([label, value, detail]) => (
            <div key={label} className="app-surface rounded-2xl p-5">
              <p className="eyebrow">{label}</p>
              <p className="mt-3 text-3xl font-bold text-white">{value}</p>
              <p className="mt-2 text-sm text-zinc-400">{detail}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <div className="app-surface rounded-2xl p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="eyebrow">Weekly activity</p>
                <p className="mt-2 text-sm text-zinc-400">Your recorded solves over the last seven days.</p>
              </div>
              <span className="text-sm text-zinc-500">{reviewQueue} reviews due</span>
            </div>
            <div className="mt-8 grid grid-cols-7 items-end gap-3">
              {recentDays.map((item) => {
                const height = item.count === 0 ? 8 : Math.min(100, 22 + item.count * 18)
                return (
                  <div key={item.date.toISOString()} className="space-y-2 text-center">
                    <div className="flex h-32 items-end justify-center rounded-lg bg-white/[0.03]">
                      <div className="w-full rounded-lg bg-[#d7ff4f]" style={{ height: `${height}%` }} />
                    </div>
                    <p className="text-[11px] text-zinc-500">{getDateLabel(item.date)}</p>
                    <p className="text-xs font-medium text-zinc-300">{item.count}</p>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="app-surface rounded-2xl p-5">
            <p className="eyebrow">Progress signals</p>
            <div className="mt-5 space-y-4">
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-sm text-zinc-400">Average confidence change</p>
                <p className="mt-2 text-2xl font-bold text-white">
                  {Number(confidenceGain) > 0 ? "+" : ""}{confidenceGain}
                </p>
                <p className="mt-1 text-xs text-zinc-500">before to after each recorded attempt</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-sm text-zinc-400">Review attempts</p>
                <p className="mt-2 text-2xl font-bold text-white">{attempts.length}</p>
                <p className="mt-1 text-xs text-zinc-500">captured in the last 30 days</p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="app-surface rounded-2xl p-5">
            <p className="eyebrow">Topics practiced</p>
            <div className="mt-4 space-y-3">
              {topTopics.length > 0 ? topTopics.map(([topic, count]) => (
                <div key={topic} className="flex items-center justify-between gap-3">
                  <span className="text-sm text-zinc-300">{topic}</span>
                  <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs text-zinc-400">{count}</span>
                </div>
              )) : <p className="text-sm text-zinc-400">Solve problems to build topic history.</p>}
            </div>
          </div>
          <div className="app-surface rounded-2xl p-5">
            <p className="eyebrow">Difficulty mix</p>
            <div className="mt-4 space-y-3">
              {["Easy", "Medium", "Hard"].map((difficulty) => {
                const count = difficultyCounts.get(difficulty) ?? 0
                const width = solvedCount > 0 ? Math.round((count / solvedCount) * 100) : 0
                return (
                  <div key={difficulty} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-300">{difficulty}</span>
                      <span className="text-zinc-500">{count}</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/5">
                      <div className="h-2 rounded-full bg-indigo-400" style={{ width: `${width}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        <Link href="/session" className="accent-button inline-flex rounded-lg px-5 py-3 text-sm font-bold">
          Use analytics to plan today&apos;s session
        </Link>
      </div>
    </main>
  )
}
