import Link from "next/link"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { saveUserPreferences } from "@/app/actions/preferences"

const studyTracks = [
  {
    title: "NeetCode 150",
    subtitle: "Balanced interview prep",
    description: "A curated 150-problem path that covers the most common patterns for interviews.",
    focus: "Good default for structured practice.",
  },
  {
    title: "Striver A to Z",
    subtitle: "Full fundamentals path",
    description: "A broader sequence that builds from basics to advanced topics in a guided order.",
    focus: "Best when you want a deeper structured roadmap.",
  },
  {
    title: "SDE Sheet",
    subtitle: "Fast interview revision",
    description: "A compact sheet of high-value problems commonly used for quick revision and practice.",
    focus: "Good for interview-focused repetition.",
  },
] as const

export default async function RoadmapPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect("/api/auth/signin?callbackUrl=/roadmap")
  }

  const preferences = await prisma.userPreference.findUnique({
    where: { userId: session.user.id },
  })

  return (
    <main className="app-shell px-6 py-12 text-zinc-100">
      <div className="mx-auto max-w-5xl space-y-8">
        <section className="space-y-3">
          <p className="eyebrow">
            Study tracks
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight text-white">
            Choose your problem roadmap
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-zinc-400">
            Pick the path you want AlgoPilot to optimize for. You can change it later from onboarding.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {studyTracks.map((item) => {
            const selected = preferences?.targetRoadmap === item.title

            return (
            <form key={item.title} action={saveUserPreferences}>
              <input type="hidden" name="targetRoadmap" value={item.title} />
              <div
                className={`flex flex-col gap-3 rounded-2xl border p-5 ${
                  selected
                    ? "border-[#d7ff4f]/35 bg-[#d7ff4f]/[0.08] shadow-[0_18px_50px_rgba(215,255,79,0.06)]"
                    : "app-surface"
                }`}
              >
                <div className="space-y-1">
                  <h2 className="text-lg font-semibold text-white">{item.title}</h2>
                  <p className="text-sm text-zinc-400">{item.subtitle}</p>
                  <p className="max-w-3xl text-sm leading-6 text-zinc-400">{item.description}</p>
                  <p className="text-sm font-medium text-zinc-200">{item.focus}</p>
                </div>
                <div className="flex flex-wrap gap-2 items-center">
                  <span
                    className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${
                      selected
                        ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                        : "border-white/10 bg-white/5 text-zinc-300"
                    }`}
                  >
                    {selected ? "Selected" : "Available"}
                  </span>

                  {!selected ? (
                    <button
                      type="submit"
                      className="ml-2 inline-flex items-center rounded-md border border-white/10 bg-white/6 px-3 py-1 text-xs font-medium text-zinc-200 hover:bg-white/10"
                    >
                      Select
                    </button>
                  ) : null}
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
