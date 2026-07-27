import Link from "next/link"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date)
}

export default async function ReviewsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect("/api/auth/signin?callbackUrl=/reviews")
  }

  const userId = session.user.id

  const progress = await prisma.userProgress.findMany({
    where: { userId },
    select: {
      nextReviewDate: true,
      interval: true,
      repetitions: true,
      easeFactor: true,
      problem: {
        select: {
          id: true,
          leetcodeId: true,
          title: true,
          difficulty: true,
          url: true,
        },
      },
    },
    orderBy: { nextReviewDate: "asc" },
  })

  const now = new Date()
  const dueReviews = progress.filter((item) => item.nextReviewDate <= now)
  const upcomingReviews = progress.filter((item) => item.nextReviewDate > now).slice(0, 8)

  return (
    <main className="min-h-screen bg-[#0a0a0a] px-6 py-12 text-zinc-100">
      <div className="mx-auto max-w-6xl space-y-8">
        <section className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-indigo-300">
            Reviews
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight text-white">
            Due and upcoming reviews
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-zinc-400">
            This page collects the problems that need review now and the ones that are queued
            for later.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-200">
              Due now
            </p>
            <p className="mt-3 text-3xl font-bold text-white">{dueReviews.length}</p>
            <p className="mt-2 text-sm text-rose-50/80">
              These are ready to be reviewed immediately.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
              Upcoming
            </p>
            <p className="mt-3 text-3xl font-bold text-white">{upcomingReviews.length}</p>
            <p className="mt-2 text-sm text-zinc-400">
              These are the next problems in your spaced-repetition queue.
            </p>
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Due reviews
          </p>
          <div className="mt-4 space-y-3">
            {dueReviews.length > 0 ? (
              dueReviews.map((item) => (
                <div
                  key={item.problem.id}
                  className="flex flex-col gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="font-medium text-white">
                      {item.problem.leetcodeId}. {item.problem.title}
                    </p>
                    <p className="text-sm text-zinc-400">
                      {item.problem.difficulty} · interval {item.interval} day
                      {item.interval === 1 ? "" : "s"} · repetitions {item.repetitions} · EF{" "}
                      {item.easeFactor.toFixed(2)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center rounded-full border border-rose-500/20 bg-rose-500/10 px-3 py-1 text-xs font-medium text-rose-300">
                      Due {formatDate(item.nextReviewDate)}
                    </span>
                    <Link
                      href={item.problem.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center rounded-lg bg-white px-4 py-2 text-sm font-semibold text-zinc-950 transition-colors hover:bg-zinc-200"
                    >
                      Open
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-zinc-400">
                No reviews are due right now. Your queue is clear.
              </p>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Upcoming reviews
          </p>
          <div className="mt-4 space-y-3">
            {upcomingReviews.length > 0 ? (
              upcomingReviews.map((item) => (
                <div
                  key={`${item.problem.id}-${item.nextReviewDate.toISOString()}`}
                  className="flex flex-col gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="font-medium text-white">
                      {item.problem.leetcodeId}. {item.problem.title}
                    </p>
                    <p className="text-sm text-zinc-400">
                      {item.problem.difficulty} · interval {item.interval} day
                      {item.interval === 1 ? "" : "s"} · repetitions {item.repetitions}
                    </p>
                  </div>
                  <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-zinc-300">
                    Next review {formatDate(item.nextReviewDate)}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-zinc-400">
                No upcoming reviews found yet.
              </p>
            )}
          </div>
        </section>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center rounded-lg bg-indigo-500 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-indigo-400"
          >
            Back to dashboard
          </Link>
          <Link
            href="/problems"
            className="inline-flex items-center rounded-lg border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-zinc-200 transition-colors hover:bg-white/10"
          >
            Open problem library
          </Link>
        </div>
      </div>
    </main>
  )
}
