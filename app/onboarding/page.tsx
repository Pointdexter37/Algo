import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { saveUserPreferences } from "@/app/actions/preferences"
import { redirect } from "next/navigation"
import { CURATED_TRACKS } from "@/lib/studyTracks"

export default async function OnboardingPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect("/api/auth/signin?callbackUrl=/onboarding")
  }

  const preferences = await prisma.userPreference.findUnique({
    where: { userId: session.user.id },
  })

  const defaultTrack =
    CURATED_TRACKS.find((track) => track.title === preferences?.targetRoadmap)?.title ??
    CURATED_TRACKS[0].title

  return (
    <main className="min-h-screen bg-[#0a0a0a] px-6 py-12 text-zinc-100">
      <div className="mx-auto max-w-3xl space-y-8">
        <section className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-indigo-300">
            Onboarding
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight text-white">
            Set your study direction
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-zinc-400">
            These settings will help AlgoPilot shape recommendations around your goal, pace,
            and current interview target.
          </p>
        </section>

        <form
          action={saveUserPreferences}
          className="space-y-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6"
        >
          <div className="grid gap-2">
            <label htmlFor="targetRoadmap" className="text-sm font-medium text-zinc-200">
              Study track
            </label>
            <select
              id="targetRoadmap"
              name="targetRoadmap"
              defaultValue={defaultTrack}
              className="rounded-lg border border-white/10 bg-[#111111] px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-indigo-400"
            >
              {CURATED_TRACKS.map((track) => (
                <option key={track.slug} value={track.title}>
                  {track.title}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-2 md:grid-cols-2">
            <div className="grid gap-2">
              <label htmlFor="dailyGoal" className="text-sm font-medium text-zinc-200">
                Daily goal
              </label>
              <input
                id="dailyGoal"
                name="dailyGoal"
                type="number"
                min={1}
                max={20}
                defaultValue={preferences?.dailyGoal ?? 3}
                className="rounded-lg border border-white/10 bg-[#111111] px-4 py-3 text-sm text-white outline-none focus:border-indigo-400"
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="preferredDifficulty" className="text-sm font-medium text-zinc-200">
                Preferred difficulty
              </label>
              <select
                id="preferredDifficulty"
                name="preferredDifficulty"
                defaultValue={preferences?.preferredDifficulty ?? "Medium"}
                className="rounded-lg border border-white/10 bg-[#111111] px-4 py-3 text-sm text-white outline-none focus:border-indigo-400"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
              <input
                type="checkbox"
                name="studyReminderEnabled"
                defaultChecked={preferences?.studyReminderEnabled ?? false}
                className="mt-1 h-4 w-4 rounded border-white/20 bg-[#111111] text-indigo-500"
              />
              <span className="space-y-1">
                <span className="block text-sm font-medium text-zinc-100">
                  Enable daily study reminder
                </span>
                <span className="block text-xs leading-5 text-zinc-400">
                  Store a reminder preference so the app can nudge you later.
                </span>
              </span>
            </label>

            <div className="grid gap-2">
              <label htmlFor="studyReminderTime" className="text-sm font-medium text-zinc-200">
                Reminder time
              </label>
              <input
                id="studyReminderTime"
                name="studyReminderTime"
                type="time"
                defaultValue={preferences?.studyReminderTime ?? "20:00"}
                className="rounded-lg border border-white/10 bg-[#111111] px-4 py-3 text-sm text-white outline-none focus:border-indigo-400"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <label htmlFor="targetInterviewDate" className="text-sm font-medium text-zinc-200">
              Target interview date
            </label>
            <input
              id="targetInterviewDate"
              name="targetInterviewDate"
              type="date"
              defaultValue={
                preferences?.targetInterviewDate
                  ? preferences.targetInterviewDate.toISOString().slice(0, 10)
                  : ""
              }
              className="rounded-lg border border-white/10 bg-[#111111] px-4 py-3 text-sm text-white outline-none focus:border-indigo-400"
            />
          </div>

          <button
            type="submit"
            className="inline-flex items-center rounded-lg bg-indigo-500 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-indigo-400"
          >
            Save preferences
          </button>
        </form>
      </div>
    </main>
  )
}
