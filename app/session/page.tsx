import Link from "next/link"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { CURATED_TRACKS } from "@/lib/studyTracks"
import MarkSolvedModal from "@/components/MarkSolvedModal"

export default async function StudySessionPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    redirect("/api/auth/signin?callbackUrl=/session")
  }

  const userId = session.user.id
  const preferences = await prisma.userPreference.findUnique({ where: { userId } })
  const track = CURATED_TRACKS.find((item) => item.title === preferences?.targetRoadmap)
  const now = new Date()

  const [progress, trackProblems] = await Promise.all([
    prisma.userProgress.findMany({
      where: { userId },
      select: { problemId: true, nextReviewDate: true },
    }),
    track
      ? prisma.studyTrackProblem.findMany({
          where: { track: { slug: track.slug } },
          orderBy: { position: "asc" },
          select: {
            problem: {
              select: {
                id: true,
                leetcodeId: true,
                title: true,
                difficulty: true,
                url: true,
                topicTags: true,
              },
            },
          },
        })
      : prisma.problem.findMany({
          orderBy: { leetcodeId: "asc" },
          take: 250,
          select: {
            id: true,
            leetcodeId: true,
            title: true,
            difficulty: true,
            url: true,
            topicTags: true,
          },
        }),
  ])

  const problems = trackProblems.map((item) => ("problem" in item ? item.problem : item))
  const progressByProblem = new Map(progress.map((item) => [item.problemId, item]))
  const due = problems.filter((problem) => {
    const itemProgress = progressByProblem.get(problem.id)
    return itemProgress && itemProgress.nextReviewDate <= now
  })
  const fresh = problems.filter((problem) => !progressByProblem.has(problem.id))
  const dailyGoal = Math.max(1, preferences?.dailyGoal ?? 3)
  const queue = [...due, ...fresh].slice(0, dailyGoal)

  return (
    <main className="app-shell min-h-screen px-6 py-12 text-zinc-100 sm:px-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <section className="space-y-3">
          <p className="eyebrow">Daily session</p>
          <h1 className="text-4xl font-extrabold tracking-tight text-white">Your focused practice queue</h1>
          <p className="max-w-2xl text-sm leading-6 text-zinc-400">
            Clear due reviews first, then continue with the next unsolved problem in your roadmap.
          </p>
        </section>

        <section className="app-surface rounded-2xl border-[#d7ff4f]/15 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-zinc-200">{track?.title ?? "Default problem set"}</p>
              <p className="mt-1 text-sm text-zinc-500">{queue.length} of {dailyGoal} planned today</p>
            </div>
            <Link href="/dashboard" className="ui-muted-button">
              Back to dashboard
            </Link>
          </div>
        </section>

        <section className="space-y-3">
          {queue.length > 0 ? queue.map((problem, index) => {
            const itemProgress = progressByProblem.get(problem.id)
            const isDue = Boolean(itemProgress && itemProgress.nextReviewDate <= now)
            return (
              <article key={problem.id} className="app-surface flex flex-col gap-4 rounded-2xl p-5 transition-transform hover:-translate-y-0.5 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                    Step {index + 1} · {isDue ? "Review due" : "New problem"}
                  </p>
                  <h2 className="mt-2 text-xl font-bold text-white">{problem.leetcodeId}. {problem.title}</h2>
                  <p className="mt-2 text-sm text-zinc-400">{problem.difficulty} · {problem.topicTags.split(", ").slice(0, 3).join(" · ")}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link href={`/problems/${problem.id}`} className="ui-muted-button">
                    View details
                  </Link>
                  <Link href={problem.url} target="_blank" rel="noopener noreferrer" className="ui-muted-button">
                    Open problem
                  </Link>
                  <MarkSolvedModal problemId={problem.id} isSolved={Boolean(itemProgress)} isDue={isDue} />
                </div>
              </article>
            )
          }) : (
            <div className="app-surface rounded-2xl p-8 text-center">
              <h2 className="text-xl font-bold text-white">You are caught up</h2>
              <p className="mt-2 text-sm text-zinc-400">There are no due reviews or unsolved problems in this roadmap.</p>
              <Link href="/roadmap" className="mt-5 inline-flex rounded-lg bg-[#d7ff4f] px-4 py-2 text-sm font-bold text-black">Choose another roadmap</Link>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
