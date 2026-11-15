import Link from "next/link"

const reviews = [
  { title: "Longest Substring Without Repeating Characters", tag: "Sliding Window", due: "Due today", tone: "rose" },
  { title: "Number of Islands", tag: "Graphs", due: "Due today", tone: "amber" },
  { title: "Merge Intervals", tag: "Intervals", due: "Tomorrow", tone: "zinc" },
]

export default function DemoPage() {
  return (
    <main className="app-shell min-h-screen px-4 py-10 text-zinc-100 sm:px-6 sm:py-14">
      <div className="mx-auto max-w-5xl space-y-8">
        <section className="max-w-2xl space-y-3">
          <p className="eyebrow">Sample day · no account needed</p>
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            Your next 10 minutes, already decided.
          </h1>
          <p className="text-sm leading-6 text-zinc-400">
            This is what a review queue feels like after you log a few real solves. Your own
            queue will use your track, confidence, hints, and history.
          </p>
        </section>

        <section className="app-surface rounded-3xl p-5 sm:p-7">
          <div className="flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm text-zinc-500">Tuesday, 15 November</p>
              <h2 className="mt-1 text-2xl font-bold text-white">Keep the patterns warm</h2>
            </div>
            <div className="flex gap-3">
              <div className="rounded-xl border border-[#d7ff4f]/20 bg-[#d7ff4f]/10 px-4 py-3">
                <p className="text-2xl font-bold text-[#e4ff93]">2</p>
                <p className="text-xs text-zinc-400">due today</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                <p className="text-2xl font-bold text-white">7</p>
                <p className="text-xs text-zinc-400">day streak</p>
              </div>
            </div>
          </div>
          <div className="mt-6 grid gap-3">
            {reviews.map((review) => (
              <div key={review.title} className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.025] p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-white">{review.title}</p>
                  <p className="mt-1 text-sm text-zinc-500">{review.tag}</p>
                </div>
                <span className={`w-fit rounded-full border px-3 py-1 text-xs font-medium ${review.tone === "rose" ? "border-rose-400/20 bg-rose-400/10 text-rose-200" : review.tone === "amber" ? "border-amber-400/20 bg-amber-400/10 text-amber-200" : "border-white/10 bg-white/5 text-zinc-300"}`}>
                  {review.due}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/signup" className="accent-button rounded-xl px-5 py-3 text-sm font-bold">Build my queue</Link>
            <Link href="/" className="inline-flex items-center rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-semibold text-zinc-200">Back to home</Link>
          </div>
        </section>
      </div>
    </main>
  )
}
