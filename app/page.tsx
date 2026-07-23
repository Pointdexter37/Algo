import Link from "next/link"

const highlights = [
  {
    title: "Personalized review loop",
    description: "Track solves, record difficulty, and schedule the next review with SM-2.",
  },
  {
    title: "Curated problem set",
    description: "Focus on the problems that matter instead of browsing the full LeetCode catalog.",
  },
  {
    title: "Progress you can inspect",
    description: "See solved state, due reviews, and topic coverage in one place.",
  },
]

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-zinc-100">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-6 py-20">
        <div className="max-w-3xl space-y-8">
          <div className="space-y-4">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-indigo-400">
              AlgoPilot
            </p>
            <h1 className="text-4xl font-extrabold tracking-tight text-white md:text-6xl">
              Practice the right problems, then review them at the right time.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-zinc-400">
              AlgoPilot is a coding interview study companion. It records your solves,
              captures how hard each problem felt, and uses spaced repetition to decide
              what you should revisit next.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/problems"
              className="inline-flex items-center rounded-lg bg-indigo-500 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-indigo-400"
            >
              Open problem library
            </Link>
            <Link
              href="/api/auth/signin?callbackUrl=/problems"
              className="inline-flex items-center rounded-lg border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-zinc-200 transition-colors hover:bg-white/10"
            >
              Sign in
            </Link>
          </div>

          <div className="grid gap-4 pt-6 md:grid-cols-3">
            {highlights.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
              >
                <h2 className="text-base font-semibold text-white">{item.title}</h2>
                <p className="mt-2 text-sm leading-6 text-zinc-400">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
