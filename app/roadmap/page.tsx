import Link from "next/link"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { saveUserPreferences } from "@/app/actions/preferences"
import { CURATED_TRACKS } from "@/lib/studyTracks"

function normalizeRoadmapSelection(value: string | null | undefined) {
  const trimmed = value?.trim()
  if (!trimmed) return ""

  const directMatch = CURATED_TRACKS.find(
    (track) => track.title === trimmed || track.slug === trimmed,
  )
  if (directMatch) return directMatch.title

  const compactValue = trimmed.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim()
  const slugMatch = CURATED_TRACKS.find(
    (track) => track.slug.toLowerCase().replace(/-/g, " ") === compactValue,
  )

  return slugMatch?.title ?? trimmed
}

export default async function RoadmapPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect("/api/auth/signin?callbackUrl=/roadmap")
  }

  const preferences = await prisma.userPreference.findUnique({
    where: { userId: session.user.id },
  })

  const selectedRoadmap = normalizeRoadmapSelection(preferences?.targetRoadmap)
  const daysUntilInterview = preferences?.targetInterviewDate
    ? Math.max(
        0,
        Math.ceil(
          (preferences.targetInterviewDate.getTime() - new Date().getTime()) /
            (1000 * 60 * 60 * 24),
        ),
      )
    : null

  const progress = await prisma.userProgress.findMany({
    where: { userId: session.user.id },
    select: { problemId: true, nextReviewDate: true },
  })

  const solvedProblemIds = new Set(progress.map((item) => item.problemId))
  const dueProblemIds = new Set(
    progress
      .filter((item) => item.nextReviewDate && item.nextReviewDate <= new Date())
      .map((item) => item.problemId),
  )

  const trackSummaries = await Promise.all(
    CURATED_TRACKS.map(async (track) => {
      const trackMembership = await prisma.studyTrack.findUnique({
        where: { slug: track.slug },
        select: {
          problems: {
            orderBy: { position: "asc" },
            select: {
              problemId: true,
              position: true,
              problem: { select: { leetcodeId: true, title: true } },
            },
          },
        },
      })

      const problemIds = trackMembership?.problems.map((membership) => membership.problemId) ?? []
      const solved = problemIds.filter((problemId) => solvedProblemIds.has(problemId)).length
      const due = problemIds.filter((problemId) => dueProblemIds.has(problemId)).length
      const completion = problemIds.length === 0 ? 0 : Math.round((solved / problemIds.length) * 100)

      return {
        ...track,
        total: problemIds.length,
        solved,
        due,
        completion,
        sequencePreview: trackMembership?.problems.slice(0, 5).map((membership) => ({
          position: membership.position,
          leetcodeId: membership.problem.leetcodeId,
          title: membership.problem.title,
        })) ?? [],
      }
    }),
  )

  return (
    <main className="app-shell min-h-screen px-4 py-10 text-zinc-100 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-5xl space-y-8">
        <section className="space-y-3">
          <p className="eyebrow">Study tracks</p>
          <h1 className="text-4xl font-extrabold tracking-tight text-white">
            Choose your problem roadmap
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-zinc-400">
            Pick the path you want AlgoPilot to optimize for. Each track shows how much of the set
            you have already completed and what is due for review.
          </p>
          {daysUntilInterview !== null ? (
            <p className="inline-flex rounded-full border border-[#d7ff4f]/20 bg-[#d7ff4f]/[0.08] px-3 py-1.5 text-sm text-[#e4ff93]">
              {daysUntilInterview === 0 ? "Interview target is today." : `${daysUntilInterview} days until your interview target.`}
            </p>
          ) : null}
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {trackSummaries.map((item) => {
            const selected = selectedRoadmap === item.title

            return (
              <form key={item.slug} action={saveUserPreferences}>
                <input type="hidden" name="targetRoadmap" value={item.title} />
                <div
                  className={`flex h-full flex-col gap-4 rounded-2xl border p-5 ${
                    selected
                      ? "border-[#d7ff4f]/35 bg-[#d7ff4f]/[0.08] shadow-[0_18px_50px_rgba(215,255,79,0.06)]"
                      : "app-surface"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <h2 className="text-lg font-semibold text-white">{item.title}</h2>
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium ${
                          selected
                            ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                            : "border-white/10 bg-white/5 text-zinc-300"
                        }`}
                      >
                        {selected ? "Selected" : "Available"}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-400">{item.description}</p>
                  </div>

                  <div className="space-y-2 rounded-xl border border-white/8 bg-black/20 p-3">
                    <div className="flex items-center justify-between text-xs text-zinc-300">
                      <span>Progress</span>
                      <span>{item.completion}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/5">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#d7ff4f] to-[#a7ffb4]"
                        style={{ width: `${item.completion}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs text-zinc-400">
                      <span>{item.solved} solved</span>
                      <span>{item.due} due</span>
                    </div>
                  </div>

                  <div className="mt-auto space-y-3">
                    <div className="flex items-center justify-between text-sm text-zinc-300">
                      <span>{item.total} problems</span>
                      <span className="text-[#e4ff93]">{item.total === 0 ? "No data" : `${item.completion}% complete`}</span>
                    </div>
                    {item.sequencePreview.length > 0 ? (
                      <div className="rounded-xl border border-white/8 bg-black/20 p-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
                          Sequence starts with
                        </p>
                        <ol className="mt-2 space-y-1 text-xs text-zinc-400">
                          {item.sequencePreview.map((problem) => (
                            <li key={problem.position}>
                              <span className="mr-2 text-zinc-600">{problem.position}.</span>
                              {problem.leetcodeId}. {problem.title}
                            </li>
                          ))}
                        </ol>
                      </div>
                    ) : null}

                    {!selected ? (
                      <button
                        type="submit"
                        className="inline-flex w-full items-center justify-center rounded-md border border-white/10 bg-white/6 px-3 py-2 text-sm font-medium text-zinc-200 transition-colors hover:bg-white/10"
                      >
                        Select track
                      </button>
                    ) : (
                      <Link
                        href={`/problems?track=${item.slug}&sort=recommended`}
                        className="inline-flex w-full items-center justify-center rounded-md border border-emerald-400/20 bg-emerald-500/10 px-3 py-2 text-sm font-medium text-emerald-300 transition-colors hover:bg-emerald-500/20"
                      >
                        Continue sequence
                      </Link>
                    )}
                  </div>
                </div>
              </form>
            )
          })}
        </section>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/dashboard"
            className="accent-button inline-flex items-center rounded-lg px-5 py-3 text-sm font-bold transition-colors"
          >
            Open dashboard
          </Link>
          <Link
            href="/problems"
            className="inline-flex items-center rounded-lg border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-zinc-200 transition-colors hover:bg-white/10"
          >
            Open problem library
          </Link>
          <Link
            href="/onboarding"
            className="inline-flex items-center rounded-lg border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-zinc-200 transition-colors hover:bg-white/10"
          >
            Change track
          </Link>
        </div>
      </div>
    </main>
  )
}
