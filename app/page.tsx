import Link from "next/link"

const practiceSteps = [
  { number: "01", label: "Choose a proven track", detail: "Blind 75, NeetCode, SDE Sheet" },
  { number: "02", label: "Log the real solve", detail: "Time, confidence, and difficulty" },
  { number: "03", label: "Return when it matters", detail: "Spaced review keeps patterns sharp" },
]

export default function Home() {
  return (
    <main className="app-shell relative isolate overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#d7ff4f]/60 to-transparent" />

      <section className="mx-auto grid min-h-[calc(100vh-92px)] max-w-6xl gap-14 px-6 py-16 sm:px-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:py-20">
        <div className="animate-rise-in">
          <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-[#d7ff4f]/20 bg-[#d7ff4f]/[0.06] px-3 py-2 text-xs font-medium text-[#e4ff93]">
            <span className="animate-pulse-dot h-2 w-2 rounded-full bg-[#d7ff4f]" />
            Your coding interview practice system
          </div>

          <h1 className="max-w-3xl text-5xl font-black leading-[0.94] tracking-[-0.06em] text-[#f4f4f0] sm:text-6xl lg:text-7xl">
            Practice with
            <span className="block text-[#d7ff4f]">a memory.</span>
          </h1>
          <p className="mt-7 max-w-xl text-base leading-7 text-zinc-400 sm:text-lg">
            AlgoPilot gives interview prep a structure: curated problems, honest progress
            signals, and reviews that arrive before you forget the pattern.
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              href="/problems"
              className="accent-button inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition duration-200 hover:-translate-y-0.5"
            >
              Start practicing
              <Arrow />
            </Link>
            <Link
              href="/roadmap"
              className="inline-flex items-center rounded-xl border border-white/12 bg-white/[0.035] px-5 py-3 text-sm font-semibold text-zinc-200 transition duration-200 hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/[0.07]"
            >
              Explore tracks
            </Link>
          </div>

          <div className="mt-12 grid max-w-xl grid-cols-3 border-y border-white/10 py-5">
            {[
              ["5", "Curated tracks"],
              ["250", "Core problems"],
              ["SM-2", "Review engine"],
            ].map(([value, label], index) => (
              <div key={label} className={index ? "border-l border-white/10 pl-4 sm:pl-6" : "pr-4 sm:pr-6"}>
                <p className="text-2xl font-bold tracking-tight text-white sm:text-3xl">{value}</p>
                <p className="mt-1 text-xs text-zinc-500 sm:text-sm">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="animate-rise-in relative" style={{ animationDelay: "140ms" }}>
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#d7ff4f]/[0.08] blur-3xl animate-drift" />
          <div className="relative overflow-hidden rounded-[1.7rem] border border-white/12 bg-[#10100f]/90 p-5 shadow-[0_28px_90px_rgba(0,0,0,0.45)] sm:p-7">
            <div className="absolute inset-x-0 top-0 h-px overflow-hidden bg-white/10">
              <div className="animate-scan h-px w-1/3 bg-gradient-to-r from-transparent via-[#d7ff4f] to-transparent" />
            </div>
            <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-5">
              <div>
                <p className="eyebrow">Today&apos;s protocol</p>
                <h2 className="mt-2 text-xl font-bold tracking-tight text-white">One deliberate session</h2>
              </div>
              <span className="rounded-full border border-[#d7ff4f]/20 bg-[#d7ff4f]/[0.08] px-3 py-1 text-xs font-semibold text-[#e4ff93]">
                Ready
              </span>
            </div>

            <div className="mt-2 divide-y divide-white/8">
              {practiceSteps.map((step, index) => (
                <div
                  key={step.number}
                  className="group flex gap-4 py-5 transition-colors hover:bg-white/[0.025]"
                  style={{ animationDelay: `${220 + index * 100}ms` }}
                >
                  <span className="pt-0.5 font-mono text-xs text-[#d7ff4f]">{step.number}</span>
                  <div>
                    <p className="font-semibold text-zinc-100 transition-colors group-hover:text-[#e4ff93]">{step.label}</p>
                    <p className="mt-1 text-sm text-zinc-500">{step.detail}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3 rounded-2xl border border-white/10 bg-black/25 p-4">
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.16em] text-zinc-500">
                <span>Current focus</span>
                <span className="text-[#d7ff4f]">Balanced pace</span>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/8">
                <div className="h-full w-[62%] rounded-full bg-[#d7ff4f] shadow-[0_0_14px_rgba(215,255,79,0.55)]" />
              </div>
              <p className="mt-3 text-sm text-zinc-400">Solve, assess, return. Repeat the loop until the patterns stay with you.</p>
            </div>
          </div>

          <a
            href="https://github.com/Pointdexter37/Algo"
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex items-center gap-2 text-sm text-zinc-500 transition-colors hover:text-[#d7ff4f]"
          >
            <GitHubMark />
            Built in public. View source code
          </a>
        </div>
      </section>
    </main>
  )
}

function Arrow() {
  return <span aria-hidden="true" className="text-lg leading-none">&#8594;</span>
}

function GitHubMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-current">
      <path d="M12 2C6.477 2 2 6.64 2 12.376c0 4.59 2.865 8.482 6.84 9.859.5.095.682-.221.682-.492 0-.243-.01-.887-.014-1.74-2.782.617-3.369-1.379-3.369-1.379-.455-1.19-1.11-1.507-1.11-1.507-.908-.64.069-.627.069-.627 1.004.073 1.532 1.064 1.532 1.064.893 1.57 2.344 1.117 2.91.855.091-.663.35-1.116.636-1.373-2.22-.258-4.555-1.141-4.555-5.078 0-1.121.39-2.038 1.03-2.757-.104-.26-.446-1.308.098-2.727 0 0 .84-.276 2.75 1.053a9.17 9.17 0 0 1 2.5-.347 9.17 9.17 0 0 1 2.5.347c1.909-1.329 2.748-1.053 2.748-1.053.545 1.419.202 2.467.099 2.727.64.719 1.028 1.636 1.028 2.757 0 3.947-2.34 4.817-4.566 5.071.359.318.678.947.678 1.91 0 1.378-.012 2.487-.012 2.826 0 .274.18.592.688.491A10.402 10.402 0 0 0 22 12.376C22 6.64 17.523 2 12 2z" />
    </svg>
  )
}
