import { prisma } from "@/lib/prisma"
import Link from "next/link"
import MarkSolvedModal from "@/components/MarkSolvedModal"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

function getDifficultyRank(difficulty: string) {
  if (difficulty === "Easy") return 0
  if (difficulty === "Medium") return 1
  return 2
}

function getTopTopics(items: { topicTags: string }[], limit = 3) {
  const counts = new Map<string, number>()

  for (const item of items) {
    // Keep the topic math intentionally simple: we split the stored tags and count
    // how often each one appears in the user's current review/learning queue.
    for (const tag of item.topicTags.split(", ").filter(Boolean)) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1)
    }
  }

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
}

function getProblemTopicScore(
  problem: { topicTags: string; difficulty: string },
  topicWeakness = new Map<string, number>(),
) {
  const baseWeight = getDifficultyRank(problem.difficulty) + 1
  const tags = problem.topicTags.split(", ").filter(Boolean)

  // Problems tied to weak topics get a larger score, and harder problems get a small bump.
  return tags.reduce((score, tag) => score + (topicWeakness.get(tag) ?? 0) + baseWeight, 0)
}

function getTopScoredTopics(scores: Map<string, number>, limit = 3) {
  return Array.from(scores.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
}

function getDateKey(date: Date) {
  // Use the user's calendar day, not the server's raw timestamp.
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

function getTopicWeaknessScores(
  problems: { id: string; topicTags: string; difficulty: string }[],
  dueProblemIds: Set<string>,
  solvedProblemIds: Set<string>,
) {
  const scores = new Map<string, number>()

  for (const problem of problems) {
    const isDue = dueProblemIds.has(problem.id)
    const isSolved = solvedProblemIds.has(problem.id)

    // Due problems matter most. Unsolved problems still count, but with a lower weight.
    const weight = isDue ? 4 : isSolved ? 0 : 1
    if (weight === 0) continue

    const difficultyWeight = getDifficultyRank(problem.difficulty) + 1

    for (const tag of problem.topicTags.split(", ").filter(Boolean)) {
      scores.set(tag, (scores.get(tag) ?? 0) + weight + difficultyWeight)
    }
  }

  return scores
}

export default async function ProblemsPage({
  searchParams,
}: {
  searchParams?: { q?: string | string[]; difficulty?: string | string[] }
}) {
  const session = await getServerSession(authOptions)
  const userId = session?.user?.id
  // Read simple query params so the library can be searched without client state.
  const rawQuery = typeof searchParams?.q === "string" ? searchParams.q : ""
  const rawDifficulty =
    typeof searchParams?.difficulty === "string" ? searchParams.difficulty : ""
  const normalizedQuery = rawQuery.trim().toLowerCase()
  const selectedDifficulty =
    rawDifficulty === "Easy" || rawDifficulty === "Medium" || rawDifficulty === "Hard"
      ? rawDifficulty
      : ""

  // Fetch problems from the database
  const problems = await prisma.problem.findMany({
    orderBy: {
      leetcodeId: 'asc'
    },
    take: 100 // Limit for now to prevent massive payloads
  })

  const filteredProblems = problems.filter((problem) => {
    const matchesQuery =
      normalizedQuery.length === 0 ||
      problem.title.toLowerCase().includes(normalizedQuery) ||
      problem.topicTags.toLowerCase().includes(normalizedQuery) ||
      problem.leetcodeId.toString().includes(normalizedQuery)

    const matchesDifficulty =
      selectedDifficulty.length === 0 || problem.difficulty === selectedDifficulty

    return matchesQuery && matchesDifficulty
  })

  // Fetch solved problem IDs for the current user
  const solvedProblemIds = new Set<string>()
  const dueProblemIds = new Set<string>()
  let solvedCount = 0
  let dueCount = 0
  let studyStreak = 0
  let lastActiveDate: string | null = null
  if (userId) {
    const progress = await prisma.userProgress.findMany({
      where: { userId },
      select: { problemId: true, nextReviewDate: true }
    })
    const submissions = await prisma.submission.findMany({
      where: { userId },
      select: { submittedAt: true },
      orderBy: { submittedAt: "desc" },
    })

    const now = new Date()
    progress.forEach(p => {
      solvedProblemIds.add(p.problemId)
      if (p.nextReviewDate && p.nextReviewDate <= now) {
        dueProblemIds.add(p.problemId)
      }
    })
    solvedCount = solvedProblemIds.size
    dueCount = dueProblemIds.size

    const streak = getCurrentStreak(submissions.map((submission) => submission.submittedAt))
    studyStreak = streak.currentStreak
    lastActiveDate = streak.lastActiveDate
  }

  const activeProblems = userId
    ? problems.filter((problem) => dueProblemIds.has(problem.id) || !solvedProblemIds.has(problem.id))
    : problems
  const topicWeakness = userId
    ? getTopicWeaknessScores(activeProblems, dueProblemIds, solvedProblemIds)
    : new Map<string, number>()

  const recommendation = (() => {
    if (userId) {
      const dueProblems = problems
        .filter((problem) => dueProblemIds.has(problem.id))
        .sort((a, b) => {
          const scoreDiff = getProblemTopicScore(b, topicWeakness) - getProblemTopicScore(a, topicWeakness)
          if (scoreDiff !== 0) return scoreDiff
          const leftDate = a.updatedAt.getTime()
          const rightDate = b.updatedAt.getTime()
          if (leftDate !== rightDate) return leftDate - rightDate
          return a.leetcodeId - b.leetcodeId
        })

      if (dueProblems.length > 0) {
        return {
          problem: dueProblems[0],
          title: "Review due now",
          description: "This problem is ready for another pass based on your spaced-repetition schedule.",
        }
      }

      const nextProblems = problems
        .filter((problem) => !solvedProblemIds.has(problem.id))
        .sort((a, b) => {
          const scoreDiff = getProblemTopicScore(b, topicWeakness) - getProblemTopicScore(a, topicWeakness)
          if (scoreDiff !== 0) return scoreDiff
          const difficultyDiff = getDifficultyRank(a.difficulty) - getDifficultyRank(b.difficulty)
          if (difficultyDiff !== 0) return difficultyDiff
          return a.leetcodeId - b.leetcodeId
        })

      if (nextProblems.length > 0) {
        return {
          problem: nextProblems[0],
          title: "Recommended next",
          description: "You have no reviews due right now, so this is the best unsolved problem to tackle next.",
        }
      }

      return {
        problem: null,
        title: "You are caught up",
        description: "Every tracked problem is either solved or not yet due for review.",
      }
    }

    return {
      problem: problems[0] ?? null,
      title: "Sign in for recommendations",
      description: "Create an account to get a personalized next-problem recommendation and due-review tracking.",
    }
  })()

  const topTopics = userId ? getTopScoredTopics(topicWeakness) : getTopTopics(problems)

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-300 p-8 font-sans selection:bg-indigo-500/30">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header Section */}
        <header className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white">
            Problem <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Library</span>
          </h1>
          <p className="text-lg text-zinc-400 max-w-2xl leading-relaxed">
            Master these coding challenges to ace your next technical interview. Handpicked problems with personalized spaced repetition.
          </p>
        </header>

        <form
          className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 md:flex-row md:items-end"
          method="get"
        >
          <div className="flex-1 space-y-2">
            <label htmlFor="q" className="text-sm font-medium text-zinc-200">
              Search problems
            </label>
            <input
              id="q"
              name="q"
              defaultValue={rawQuery}
              placeholder="Title, topic, or LeetCode number"
              className="w-full rounded-lg border border-white/10 bg-[#111111] px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-indigo-400"
            />
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

          <button
            type="submit"
            className="rounded-lg bg-indigo-500 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-indigo-400"
          >
            Filter
          </button>

          <Link
            href="/problems"
            className="rounded-lg border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-zinc-200 transition-colors hover:bg-white/10"
          >
            Clear
          </Link>
        </form>

        <p className="text-sm text-zinc-400">
          Showing {filteredProblems.length} of {problems.length} problems.
        </p>

        {userId && (
          <section className="grid gap-4 md:grid-cols-[1.6fr_1fr_1fr]">
            <div className="rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/15 via-white/[0.03] to-cyan-500/10 p-5 shadow-xl shadow-indigo-500/5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-300">
                {recommendation.title}
              </p>
              <div className="mt-3 flex items-start justify-between gap-4">
                <div>
                  {recommendation.problem ? (
                    <>
                      <h2 className="text-2xl font-bold text-white">
                        {recommendation.problem.leetcodeId}. {recommendation.problem.title}
                      </h2>
                      <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-300">
                        {recommendation.description}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-zinc-300">
                          {recommendation.problem.difficulty}
                        </span>
                        <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-zinc-300">
                          {recommendation.problem.topicTags.split(", ")[0]}
                        </span>
                        <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-zinc-300">
                          {dueProblemIds.has(recommendation.problem.id) ? "Due now" : "Next up"}
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <h2 className="text-2xl font-bold text-white">{recommendation.title}</h2>
                      <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-300">
                        {recommendation.description}
                      </p>
                    </>
                  )}
                </div>
                {recommendation.problem && (
                  <Link
                    href={recommendation.problem.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-zinc-950 transition-colors hover:bg-zinc-200"
                  >
                    Open problem
                  </Link>
                )}
              </div>
            </div>

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
              <p className="mt-2 text-sm text-zinc-400">Items that are ready for review today.</p>
            </div>
          </section>
        )}

        {userId && (
          <section className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                Study streak
              </p>
              <p className="mt-3 text-3xl font-bold text-white">{studyStreak} days</p>
              <p className="mt-2 text-sm text-zinc-400">
                Counted from consecutive submission days in your learning history.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                Last active
              </p>
              <p className="mt-3 text-3xl font-bold text-white">
                {lastActiveDate ?? "No activity yet"}
              </p>
              <p className="mt-2 text-sm text-zinc-400">
                This uses the latest recorded submission date in your profile.
              </p>
            </div>
          </section>
        )}

        {topTopics.length > 0 && (
          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
              Topic focus
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              {topTopics.map(([topic, count]) => (
                <span
                  key={topic}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-zinc-200"
                >
                  {topic}
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-zinc-400">
                    {count}
                  </span>
                </span>
              ))}
            </div>
            <p className="mt-3 text-sm text-zinc-400">
              These are the topics showing up most often in your current queue.
            </p>
          </section>
        )}

        {!userId && (
          <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/10 px-5 py-4 text-sm text-indigo-200">
            Sign in to track solved problems and schedule reviews. You can still browse the library without an account.
          </div>
        )}

        {/* Problems List */}
        <div className="bg-[#111111] border border-white/5 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-sm tracking-wider text-zinc-500 uppercase bg-white/5">
                  <th className="px-6 py-5 font-semibold">Status</th>
                  <th className="px-6 py-5 font-semibold">Title</th>
                  <th className="px-6 py-5 font-semibold">Difficulty</th>
                  <th className="px-6 py-5 font-semibold hidden md:table-cell">Topics</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredProblems.map((problem) => (
                  <tr 
                    key={problem.id} 
                    className="group hover:bg-white/[0.02] transition-colors duration-200"
                  >
                    <td className="px-6 py-4">
                      <MarkSolvedModal 
                        problemId={problem.id} 
                        isSolved={solvedProblemIds.has(problem.id)} 
                        isDue={dueProblemIds.has(problem.id)}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <Link 
                        href={problem.url}
                        target="_blank"
                        rel="noopener noreferrer" 
                        className="font-medium text-zinc-200 hover:text-indigo-400 transition-colors text-base"
                      >
                        {problem.leetcodeId}. {problem.title}
                      </Link>
                      {problem.isPremium && (
                        <span className="ml-3 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          Premium
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border
                        ${problem.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                          problem.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
                          'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}
                      >
                        {problem.difficulty}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <div className="flex flex-wrap gap-2">
                        {problem.topicTags.split(', ').slice(0, 3).map((tag, idx) => (
                          <span 
                            key={idx}
                            className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-white/5 text-zinc-400 border border-white/10"
                          >
                            {tag}
                          </span>
                        ))}
                        {problem.topicTags.split(', ').length > 3 && (
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium text-zinc-500">
                            +{problem.topicTags.split(', ').length - 3} more
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                
                {filteredProblems.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-zinc-500">
                      No problems matched your search. Try clearing the filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
