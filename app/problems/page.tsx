import { prisma } from "@/lib/prisma"
import Link from "next/link"
import MarkSolvedButton from "@/components/MarkSolvedButton"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export default async function ProblemsPage() {
  const session = await getServerSession(authOptions)
  // @ts-ignore
  const userId = session?.user?.id as string | undefined

  // Fetch problems from the database
  const problems = await prisma.problem.findMany({
    orderBy: {
      leetcodeId: 'asc'
    },
    take: 100 // Limit for now to prevent massive payloads
  })

  // Fetch solved problem IDs for the current user
  let solvedProblemIds = new Set<string>()
  if (userId) {
    const submissions = await prisma.submission.findMany({
      where: { userId, status: "Accepted" },
      select: { problemId: true }
    })
    submissions.forEach(s => solvedProblemIds.add(s.problemId))
  }

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
                {problems.map((problem) => (
                  <tr 
                    key={problem.id} 
                    className="group hover:bg-white/[0.02] transition-colors duration-200"
                  >
                    <td className="px-6 py-4">
                      <MarkSolvedButton 
                        problemId={problem.id} 
                        isSolved={solvedProblemIds.has(problem.id)} 
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
                
                {problems.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-zinc-500">
                      No problems found. Run the scraping script to populate the database!
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
