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
    <main className="app-shell min-h-screen px-4 py-10 text-zinc-100 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-3xl space-y-8">
        <section className="space-y-3">
          <p className="eyebrow">Setup</p>
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
          className="app-surface space-y-6 rounded-2xl p-6 md:p-8"
        >
          <div className="grid gap-2">
            <label htmlFor="targetRoadmap" className="text-sm font-medium text-zinc-200">
              Study track
            </label>
            <select
              id="targetRoadmap"
              name="targetRoadmap"
              defaultValue={defaultTrack}
              className="ui-input"
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
                className="ui-input"
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
                className="ui-input"
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
                className="mt-1 h-4 w-4 rounded border-white/20 bg-[#111111] accent-[#d7ff4f]"
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
                className="ui-input"
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
              className="ui-input"
            />
          </div>

          <button
            type="submit"
            className="ui-primary-button"
          >
            Save preferences
          </button>
        </form>
      </div>
    </main>
  )
}
