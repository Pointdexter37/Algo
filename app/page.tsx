import Link from "next/link"

const reviewCards = [
  { title: "Longest Substring Without Repeating Characters", topic: "Sliding Window", status: "Due today", color: "bg-[#d7ff4f]" },
  { title: "Number of Islands", topic: "Graphs", status: "Due tomorrow", color: "bg-[#c6b5ff]" },
  { title: "Merge Intervals", topic: "Intervals", status: "Queued", color: "bg-[#8de7ff]" },
]

const steps = [
  ["01", "Choose a proven path", "Start with Blind 75, NeetCode, or a focused SDE track instead of an endless problem list."],
  ["02", "Solve like it is real", "Record the time, confidence, hints, and what you would change next time."],
  ["03", "Return before it fades", "Your queue brings patterns back at the right moment, so recall becomes dependable."],
]

export default function Home() {
  return (
    <main className="overflow-hidden bg-[#080909] text-[#f4f4f0]">
      <section className="relative isolate min-h-[calc(100vh-1rem)] overflow-hidden bg-[#080909]">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_78%_18%,rgba(215,255,79,0.16),transparent_30%),radial-gradient(circle_at_12%_82%,rgba(126,91,255,0.12),transparent_28%)]" />
        <div className="mx-auto max-w-7xl px-6 pb-20 pt-24 sm:px-8 lg:px-12 lg:pt-32">
          <div className="grid items-end gap-16 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="max-w-4xl">
              <p className="eyebrow">The spaced-review coach for placement prep</p>
              <h1 className="mt-7 max-w-4xl text-6xl font-black leading-[0.88] tracking-[-0.075em] text-white sm:text-7xl lg:text-[8.25rem]">
                Solve once.
                <span className="block text-[#d7ff4f]">Remember longer.</span>
              </h1>
              <p className="mt-9 max-w-2xl text-lg leading-8 text-zinc-400 sm:text-xl">
                AlgoPilot turns your curated coding-interview practice into a memory loop:
                solve a problem, capture what happened, and revisit the pattern before it
                disappears.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Link href="/signup" className="accent-button rounded-full px-6 py-3 text-sm font-bold">
                  Build my review queue <Arrow />
                </Link>
                <Link href="/demo" className="rounded-full border border-white/15 bg-white/[0.04] px-6 py-3 text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/[0.08]">
                  Watch the sample day
                </Link>
              </div>
            </div>

            <MediaFrame variant="lime" label="A sample review queue" video />
          </div>

          <div className="mt-24 grid gap-3 border-y border-white/10 py-5 sm:grid-cols-3">
            {[
              ["75 / 150 / 250", "curated roadmap sizes"],
              ["10 min", "a focused review session"],
              ["1 queue", "for what to solve next"],
            ].map(([value, label]) => (
              <div key={label} className="border-white/10 px-4 py-2 first:pl-0 sm:border-l sm:first:border-l-0">
                <p className="text-2xl font-bold text-white">{value}</p>
                <p className="mt-1 text-sm text-zinc-500">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#d7ff4f] px-6 py-20 text-[#101408] sm:px-8 lg:px-12 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#42520f]">The problem</p>
              <h2 className="mt-5 max-w-xl text-5xl font-black leading-[0.92] tracking-[-0.06em] sm:text-7xl">
                A solved count is not the same as recall.
              </h2>
            </div>
            <p className="max-w-2xl text-xl leading-8 text-[#34410f]">
              Static sheets tell you what exists. LeetCode tells you what you have opened.
              AlgoPilot adds the missing loop: a personal record of what felt shaky and a
              reason to return.
            </p>
          </div>
          <div className="mt-16 grid gap-4 md:grid-cols-3">
            {[
              ["Random grinding", "More tabs, more solved numbers, no clear next review."],
              ["Static sheets", "A strong sequence that cannot see your weak patterns."],
              ["AlgoPilot", "A curated path shaped by your own attempts and confidence."],
            ].map(([title, detail], index) => (
              <div key={title} className={`rounded-3xl p-6 ${index === 2 ? "bg-[#101408] text-white" : "bg-[#e7ff86]"}`}>
                <p className="text-sm font-bold">{title}</p>
                <p className={`mt-16 text-sm leading-6 ${index === 2 ? "text-zinc-400" : "text-[#52621b]"}`}>{detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f3efff] px-6 py-20 text-[#201832] sm:px-8 lg:px-12 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#7558bf]">How it works</p>
              <h2 className="mt-5 max-w-xl text-5xl font-black leading-[0.92] tracking-[-0.06em] sm:text-7xl">
                Make every attempt teach the next one.
              </h2>
              <p className="mt-7 max-w-lg text-lg leading-8 text-[#665d79]">
                The engine stays in the background. You only need to make one honest
                decision after a solve: how did this actually feel?
              </p>
            </div>
            <div className="grid gap-3">
              {steps.map(([number, title, detail]) => (
                <div key={number} className="grid gap-5 rounded-3xl border border-[#d9d0f0] bg-white/70 p-6 sm:grid-cols-[auto_1fr]">
                  <span className="font-mono text-sm font-bold text-[#866bd0]">{number}</span>
                  <div>
                    <h3 className="text-xl font-bold">{title}</h3>
                    <p className="mt-2 max-w-xl leading-7 text-[#6d647e]">{detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#101c2b] px-6 py-20 text-white sm:px-8 lg:px-12 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
            <MediaFrame variant="violet" label="Review feedback, captured in seconds" gif />
            <div className="lg:pl-12">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#8de7ff]">Less logging, more learning</p>
              <h2 className="mt-5 max-w-2xl text-5xl font-black leading-[0.92] tracking-[-0.06em] sm:text-7xl">
                Your review should feel lighter than the original solve.
              </h2>
              <p className="mt-7 max-w-xl text-lg leading-8 text-slate-300">
                Defaults keep the flow quick. Tap Again, Hard, Good, or Easy, add an optional
                note, and get back to the work.
              </p>
              <Link href="/problems" className="mt-8 inline-flex rounded-full bg-[#8de7ff] px-6 py-3 text-sm font-bold text-[#10202d] transition hover:bg-white">
                See the problem library <Arrow />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#dff7ff] px-6 py-20 text-[#10202d] sm:px-8 lg:px-12 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#34738a]">A better daily starting point</p>
              <h2 className="mt-5 max-w-3xl text-5xl font-black leading-[0.92] tracking-[-0.06em] sm:text-7xl">
                Open the app and know what matters today.
              </h2>
            </div>
            <Link href="/demo" className="w-fit rounded-full border border-[#9bcbd8] bg-white/60 px-5 py-3 text-sm font-bold text-[#19495a]">
              Open sample dashboard
            </Link>
          </div>
          <div className="mt-14 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[2rem] bg-[#10202d] p-6 text-white shadow-2xl shadow-[#69a7bb]/20 sm:p-8">
              <div className="flex items-start justify-between border-b border-white/10 pb-6">
                <div>
                  <p className="text-sm text-slate-400">Tuesday study plan</p>
                  <p className="mt-2 text-3xl font-bold">Keep the patterns warm.</p>
                </div>
                <span className="rounded-full bg-[#8de7ff] px-3 py-1 text-xs font-bold text-[#10202d]">7 day streak</span>
              </div>
              <div className="mt-6 grid gap-3">
                {reviewCards.map((card) => (
                  <div key={card.title} className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{card.title}</p>
                      <p className="mt-1 text-sm text-slate-400">{card.topic}</p>
                    </div>
                    <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold text-[#10202d] ${card.color}`}>{card.status}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              {[
                ["Due today", "2", "Finish the short queue before starting something new."],
                ["Current track", "NeetCode 150", "A clear sequence when you do not want to decide from scratch."],
                ["Confidence", "Improving", "Your notes show where the pattern still needs another pass."],
              ].map(([label, value, detail]) => (
                <div key={label} className="rounded-[2rem] border border-[#b7dce5] bg-white/60 p-6">
                  <p className="text-sm font-bold text-[#34738a]">{label}</p>
                  <p className="mt-3 text-3xl font-black">{value}</p>
                  <p className="mt-2 text-sm leading-6 text-[#557382]">{detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#080909] px-6 py-24 text-center sm:px-8 lg:px-12 lg:py-36">
        <div className="mx-auto max-w-4xl">
          <p className="eyebrow">Built in public</p>
          <h2 className="mt-6 text-5xl font-black leading-[0.92] tracking-[-0.06em] text-white sm:text-7xl">
            Stop asking what you solved.
            <span className="block text-[#d7ff4f]">Start asking what you remember.</span>
          </h2>
          <p className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-zinc-400">
            Free, open source, and built for students preparing for placements and internships.
            Try a sample day, then bring your own track into the loop.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Link href="/signup" className="accent-button rounded-full px-7 py-3 text-sm font-bold">Start practicing <Arrow /></Link>
            <Link href="https://github.com/Pointdexter37/Algo" target="_blank" rel="noreferrer" className="rounded-full border border-white/15 px-7 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.08]">View source</Link>
          </div>
          <p className="mt-12 text-sm text-zinc-600">No fake testimonials. No inflated user counts. Just a better review habit.</p>
        </div>
      </section>
    </main>
  )
}

function MediaFrame({
  variant,
  label,
  video = false,
  gif = false,
}: {
  variant: "lime" | "violet"
  label: string
  video?: boolean
  gif?: boolean
}) {
  const accent = variant === "lime" ? "#d7ff4f" : "#c6b5ff"

  return (
    <div className="relative min-h-[25rem] overflow-hidden rounded-[2rem] border border-white/15 bg-[#111312] p-4 shadow-2xl shadow-black/30 sm:min-h-[31rem] sm:p-6">
      <div className="absolute inset-0 opacity-60" style={{ background: `radial-gradient(circle at 70% 20%, ${accent}33, transparent 38%)` }} />
      {video ? <video className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-10" autoPlay muted loop playsInline aria-hidden="true"><source src="/media/algopilot-demo.mp4" type="video/mp4" /></video> : null}
      {gif ? <img className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-10" src="/media/review-loop.gif" alt="" aria-hidden="true" /> : null}
      <div className="relative flex h-full flex-col rounded-[1.4rem] border border-white/10 bg-[#0b0d0c]/90 p-4 backdrop-blur sm:p-5">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-rose-400/80" /><span className="h-2.5 w-2.5 rounded-full bg-amber-300/80" /><span className="h-2.5 w-2.5 rounded-full bg-emerald-300/80" /></div>
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">{video ? "looping demo" : "review animation"}</span>
        </div>
        <div className="mt-8 flex flex-1 flex-col justify-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: accent }}>{label}</p>
          <p className="mt-4 max-w-sm text-3xl font-bold leading-tight text-white sm:text-4xl">Recall the approach before you reveal the answer.</p>
          <div className="mt-8 grid gap-3">
            {["What pattern does this use?", "What made it feel difficult?", "When should it return?"].map((item, index) => (
              <div key={item} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-3 text-sm text-zinc-300">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-xs font-bold text-[#101408]" style={{ background: accent }}>{index + 1}</span>
                {item}
              </div>
            ))}
          </div>
        </div>
        <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-4 text-xs text-zinc-500">
          <span>Sample data</span>
          <span style={{ color: accent }}>AlgoPilot</span>
        </div>
      </div>
    </div>
  )
}

function Arrow() {
  return <span aria-hidden="true" className="ml-1 text-lg leading-none">→</span>
}
