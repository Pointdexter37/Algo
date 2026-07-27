import Link from "next/link"

const roadmap = [
  { title: "MVP scope", status: "Done", description: "Core learning loop, review flow, and study views are in place." },
  { title: "Data model", status: "Done", description: "User progress, preferences, and spaced-repetition fields are stored." },
  { title: "Auth + onboarding", status: "Done", description: "Signin flow and study goal setup are available." },
  { title: "Dashboard", status: "Done", description: "Today view, streaks, analytics, and reminder cue are available." },
  { title: "Problem library", status: "Done", description: "Search, difficulty filter, and recommendation slices are available." },
  { title: "Dedicated reviews", status: "Done", description: "Due and upcoming review queue is separated into its own page." },
  { title: "Notifications", status: "Next", description: "Move reminder settings from stored preferences to actual delivery." },
  { title: "Browser extension", status: "Later", description: "Optional capture/surface layer for study support while browsing LeetCode." },
  { title: "AI assistant", status: "Later", description: "Explain problems, guide weak topics, and recommend what to do next." },
]

function statusClass(status: string) {
  if (status === "Done") return "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
  if (status === "Next") return "bg-indigo-500/10 text-indigo-300 border-indigo-500/20"
  return "bg-white/5 text-zinc-300 border-white/10"
}

export default function RoadmapPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] px-6 py-12 text-zinc-100">
      <div className="mx-auto max-w-5xl space-y-8">
        <section className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-indigo-300">
            Roadmap
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight text-white">
            Build status at a glance
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-zinc-400">
            This page shows where the project stands and what still remains after the current
            learning and review flow.
          </p>
        </section>

        <section className="space-y-3">
          {roadmap.map((item) => (
            <div
              key={item.title}
              className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:flex-row md:items-start md:justify-between"
            >
              <div className="space-y-1">
                <h2 className="text-lg font-semibold text-white">{item.title}</h2>
                <p className="max-w-3xl text-sm leading-6 text-zinc-400">{item.description}</p>
              </div>
              <span
                className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${statusClass(
                  item.status,
                )}`}
              >
                {item.status}
              </span>
            </div>
          ))}
        </section>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center rounded-lg bg-indigo-500 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-indigo-400"
          >
            Open dashboard
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
