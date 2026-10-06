import Link from "next/link"
import { notFound } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import MarkSolvedModal from "@/components/MarkSolvedModal"

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date)
}

export default async function ProblemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  const problem = await prisma.problem.findUnique({
    where: { id },
    select: {
      id: true,
      leetcodeId: true,
      title: true,
      difficulty: true,
      topicTags: true,
      url: true,
      isPremium: true,
    },
  })

  if (!problem) notFound()

  const [progress, attempts] = session?.user?.id
    ? await Promise.all([
        prisma.userProgress.findUnique({
          where: { userId_problemId: { userId: session.user.id, problemId: problem.id } },
          select: {
            nextReviewDate: true,
            interval: true,
            repetitions: true,
            easeFactor: true,
            difficultyRating: true,
          },
        }),
        prisma.reviewAttempt.findMany({
          where: { userId: session.user.id, problemId: problem.id },
          orderBy: { reviewedAt: "desc" },
          take: 10,
          select: {
            reviewedAt: true,
            rating: true,
            confidenceBefore: true,
            confidenceAfter: true,
            hintsUsed: true,
            notes: true,
            timeSpent: true,
            outcome: true,
          },
        }),
      ])
    : [null, []]

  const isDue = Boolean(progress && progress.nextReviewDate <= new Date())

  return (
    <main className="app-shell min-h-screen px-6 py-12 text-zinc-100 sm:px-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <Link href="/problems" className="text-sm text-zinc-400 hover:text-white">
          ← Back to problem library
        </Link>

        <section className="app-surface rounded-3xl p-6 md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="space-y-4">
              <p className="eyebrow">Problem detail</p>
              <h1 className="text-4xl font-extrabold tracking-tight text-white">
                {problem.leetcodeId}. {problem.title}
              </h1>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-zinc-300">
                  {problem.difficulty}
                </span>
                {problem.topicTags.split(", ").filter(Boolean).map((topic) => (
                  <span key={topic} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-zinc-400">
                    {topic}
                  </span>
                ))}
                {problem.isPremium ? (
                  <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-sm text-amber-300">
                    Premium
                  </span>
                ) : null}
              </div>
              <p className="max-w-2xl text-sm leading-6 text-zinc-400">
                Use this page to open the original problem, record a review, and keep the reasoning
                you want to remember for the next attempt.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href={problem.url} target="_blank" rel="noopener noreferrer" className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-zinc-200">
                Open on LeetCode
              </Link>
              {session?.user?.id ? (
                <MarkSolvedModal problemId={problem.id} isSolved={Boolean(progress)} isDue={isDue} />
              ) : (
                <Link href="/api/auth/signin" className="accent-button rounded-lg px-4 py-2 text-sm font-bold">
                  Sign in to track
                </Link>
              )}
            </div>
          </div>
        </section>

        {progress ? (
          <section className="grid gap-4 md:grid-cols-4">
            <div className="app-surface rounded-2xl p-5">
              <p className="eyebrow">Next review</p>
              <p className="mt-3 text-lg font-bold text-white">{formatDate(progress.nextReviewDate)}</p>
            </div>
            <div className="app-surface rounded-2xl p-5">
              <p className="eyebrow">Interval</p>
              <p className="mt-3 text-3xl font-bold text-white">{progress.interval}d</p>
            </div>
            <div className="app-surface rounded-2xl p-5">
              <p className="eyebrow">Reviews</p>
              <p className="mt-3 text-3xl font-bold text-white">{progress.repetitions}</p>
            </div>
            <div className="app-surface rounded-2xl p-5">
              <p className="eyebrow">Ease factor</p>
              <p className="mt-3 text-3xl font-bold text-white">{progress.easeFactor.toFixed(2)}</p>
            </div>
          </section>
        ) : null}

        <section className="app-surface rounded-2xl p-5">
          <p className="eyebrow">Review history</p>
          <div className="mt-4 space-y-3">
            {attempts.length > 0 ? attempts.map((attempt) => (
              <article key={`${attempt.reviewedAt.toISOString()}-${attempt.rating}`} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium text-white">
                    {attempt.outcome} · rating {attempt.rating}/5
                  </p>
                  <p className="text-xs text-zinc-500">{formatDate(attempt.reviewedAt)}</p>
                </div>
                <p className="mt-2 text-sm text-zinc-400">
                  {attempt.timeSpent ?? "—"} min · confidence {attempt.confidenceBefore ?? "—"} → {attempt.confidenceAfter ?? "—"} · {attempt.hintsUsed} hint{attempt.hintsUsed === 1 ? "" : "s"}
                </p>
                {attempt.notes ? <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-zinc-300">{attempt.notes}</p> : null}
              </article>
            )) : (
              <p className="text-sm text-zinc-400">
                No review history yet. Record your first attempt after solving this problem.
              </p>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}
