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
            select: { problemId: true },
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
      }
    }),
  )

  return (
    <main className="app-shell px-6 py-12 text-zinc-100">
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
                      <span>{item.total === 0 ? "No data" : `${item.completion}% complete`}</span>
                    </div>

                    {!selected ? (
                      <button
                        type="submit"
                        className="inline-flex w-full items-center justify-center rounded-md border border-white/10 bg-white/6 px-3 py-2 text-sm font-medium text-zinc-200 transition-colors hover:bg-white/10"
                      >
                        Select track
                      </button>
                    ) : (
                      <div className="inline-flex w-full items-center justify-center rounded-md border border-emerald-400/20 bg-emerald-500/10 px-3 py-2 text-sm font-medium text-emerald-300">
                        Active roadmap
                      </div>
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
