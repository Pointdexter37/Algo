import Link from "next/link"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { CURATED_TRACKS } from "@/lib/studyTracks"

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date)
}

function getDateKey(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
  }).format(date)
}

function buildReviewsQuery(params: {
  difficulty?: string
  track?: string
  status?: string
}) {
  const searchParams = new URLSearchParams()

  if (params.difficulty) searchParams.set("difficulty", params.difficulty)
  if (params.track) searchParams.set("track", params.track)
  if (params.status) searchParams.set("status", params.status)

  const query = searchParams.toString()
  return query ? `/reviews?${query}` : "/reviews"
}

export default async function ReviewsPage({
  searchParams,
}: {
  searchParams?: Promise<{
    difficulty?: string | string[]
    track?: string | string[]
    status?: string | string[]
  }>
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect("/api/auth/signin?callbackUrl=/reviews")
  }

  const userId = session.user.id
  const params = (await searchParams) ?? {}
  const rawDifficulty = typeof params.difficulty === "string" ? params.difficulty : ""
  const rawTrack = typeof params.track === "string" ? params.track : ""
  const rawStatus = typeof params.status === "string" ? params.status : ""
  const selectedDifficulty =
    rawDifficulty === "Easy" || rawDifficulty === "Medium" || rawDifficulty === "Hard"
      ? rawDifficulty
      : ""
  const selectedTrack =
    CURATED_TRACKS.find((track) => track.slug === rawTrack)?.slug ?? ""
  const selectedStatus =
    rawStatus === "all" || rawStatus === "due" || rawStatus === "upcoming" || rawStatus === "overdue"
      ? rawStatus
      : "all"

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
          studyTrackMemberships: {
            select: {
              track: {
                select: {
                  slug: true,
                  title: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: { nextReviewDate: "asc" },
  })

  const now = new Date()
  const todayKey = getDateKey(now)
  const startOfToday = new Date(`${todayKey}T00:00:00+05:30`)
  const filteredProgress = progress.filter((item) => {
    const matchesDifficulty =
      selectedDifficulty.length === 0 || item.problem.difficulty === selectedDifficulty
    const matchesTrack =
      selectedTrack.length === 0 ||
      item.problem.studyTrackMemberships.some((membership) => membership.track.slug === selectedTrack)

    const isDue = item.nextReviewDate <= now
    const isOverdue = item.nextReviewDate < startOfToday
    const matchesStatus =
      selectedStatus === "all" ||
      (selectedStatus === "due" && isDue) ||
      (selectedStatus === "upcoming" && !isDue) ||
      (selectedStatus === "overdue" && isOverdue)

    return matchesDifficulty && matchesTrack && matchesStatus
  })

  const dueReviews = filteredProgress.filter((item) => item.nextReviewDate <= now)
  const overdueReviews = dueReviews.filter((item) => item.nextReviewDate < startOfToday)
  const dueTodayReviews = dueReviews.filter((item) => getDateKey(item.nextReviewDate) === todayKey)
  const upcomingReviews = filteredProgress.filter((item) => item.nextReviewDate > now).slice(0, 8)

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

        <form
          method="get"
          className="grid gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 md:grid-cols-2 xl:grid-cols-[repeat(3,minmax(0,0.9fr))_auto_auto] xl:items-end"
        >
          <div className="space-y-2">
            <label htmlFor="status" className="text-sm font-medium text-zinc-200">
              Queue
            </label>
            <select
              id="status"
              name="status"
              defaultValue={selectedStatus}
              className="w-full rounded-lg border border-white/10 bg-[#111111] px-4 py-3 text-sm text-white outline-none focus:border-indigo-400"
            >
              <option value="all">All reviews</option>
              <option value="due">Due now</option>
              <option value="overdue">Overdue only</option>
              <option value="upcoming">Upcoming only</option>
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="difficulty" className="text-sm font-medium text-zinc-200">
              Difficulty
            </label>
            <select
              id="difficulty"
              name="difficulty"
              defaultValue={selectedDifficulty}
              className="w-full rounded-lg border border-white/10 bg-[#111111] px-4 py-3 text-sm text-white outline-none focus:border-indigo-400"
            >
              <option value="">All</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="track" className="text-sm font-medium text-zinc-200">
              Track
            </label>
            <select
              id="track"
              name="track"
              defaultValue={selectedTrack}
              className="w-full rounded-lg border border-white/10 bg-[#111111] px-4 py-3 text-sm text-white outline-none focus:border-indigo-400"
            >
              <option value="">All tracks</option>
              {CURATED_TRACKS.map((track) => (
                <option key={track.slug} value={track.slug}>
                  {track.title}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-lg bg-indigo-500 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-indigo-400"
          >
            Filter
          </button>

          <Link
            href="/reviews"
            className="inline-flex items-center justify-center rounded-lg border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-zinc-200 transition-colors hover:bg-white/10"
          >
            Clear
          </Link>
        </form>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">
              Overdue
            </p>
            <p className="mt-3 text-3xl font-bold text-white">{overdueReviews.length}</p>
            <p className="mt-2 text-sm text-amber-50/80">
              These slipped past today and should be cleared first.
            </p>
          </div>

          <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-200">
              Due now
            </p>
            <p className="mt-3 text-3xl font-bold text-white">{dueReviews.length}</p>
            <p className="mt-2 text-sm text-rose-50/80">
              These are ready to be reviewed immediately.
            </p>
          </div>

          <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/10 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-200">
              Due today
            </p>
            <p className="mt-3 text-3xl font-bold text-white">{dueTodayReviews.length}</p>
            <p className="mt-2 text-sm text-indigo-50/80">
              Reviews scheduled for today’s calendar date.
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

        <div className="flex flex-wrap gap-2">
          <Link
            href={buildReviewsQuery({
              status: undefined,
              difficulty: selectedDifficulty || undefined,
              track: selectedTrack || undefined,
            })}
            className={`inline-flex items-center rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
              selectedStatus === "all"
                ? "border-indigo-400/30 bg-indigo-400/10 text-indigo-200"
                : "border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10"
            }`}
          >
            All reviews
          </Link>
          <Link
            href={buildReviewsQuery({
              status: "overdue",
              difficulty: selectedDifficulty || undefined,
              track: selectedTrack || undefined,
            })}
            className={`inline-flex items-center rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
              selectedStatus === "overdue"
                ? "border-amber-400/30 bg-amber-400/10 text-amber-200"
                : "border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10"
            }`}
          >
            Overdue first
          </Link>
          <Link
            href={buildReviewsQuery({
              status: "due",
              difficulty: selectedDifficulty || undefined,
              track: selectedTrack || undefined,
            })}
            className={`inline-flex items-center rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
              selectedStatus === "due"
                ? "border-rose-400/30 bg-rose-400/10 text-rose-200"
                : "border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10"
            }`}
          >
            Due now
          </Link>
          <Link
            href={buildReviewsQuery({
              status: "upcoming",
              difficulty: selectedDifficulty || undefined,
              track: selectedTrack || undefined,
            })}
            className={`inline-flex items-center rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
              selectedStatus === "upcoming"
                ? "border-white/20 bg-white/10 text-white"
                : "border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10"
            }`}
          >
            Upcoming
          </Link>
        </div>

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
                    {item.problem.studyTrackMemberships.length > 0 && (
                      <p className="mt-1 text-xs text-zinc-500">
                        {item.problem.studyTrackMemberships
                          .slice(0, 2)
                          .map((membership) => membership.track.title)
                          .join(" · ")}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {item.nextReviewDate < startOfToday ? (
                      <span className="inline-flex items-center rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-200">
                        Overdue since {formatDate(item.nextReviewDate)}
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full border border-rose-500/20 bg-rose-500/10 px-3 py-1 text-xs font-medium text-rose-300">
                        Due {formatDate(item.nextReviewDate)}
                      </span>
                    )}
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
                    {item.problem.studyTrackMemberships.length > 0 && (
                      <p className="mt-1 text-xs text-zinc-500">
                        {item.problem.studyTrackMemberships
                          .slice(0, 2)
                          .map((membership) => membership.track.title)
                          .join(" · ")}
                      </p>
                    )}
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
