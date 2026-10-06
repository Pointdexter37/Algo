"use server"

import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"
import { getServerSession } from "next-auth/next"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { CURATED_TRACKS } from "@/lib/studyTracks"

export async function saveUserPreferences(formData: FormData) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    throw new Error("You must be signed in to save preferences.")
  }

  const userId = session.user.id
  const targetRoadmap = formData.get("targetRoadmap")
  const dailyGoal = formData.get("dailyGoal")
  const preferredDifficulty = formData.get("preferredDifficulty")
  const studyReminderEnabled = formData.get("studyReminderEnabled")
  const studyReminderTime = formData.get("studyReminderTime")
  const targetInterviewDate = formData.get("targetInterviewDate")
  const dailyGoalValue = typeof dailyGoal === "string" ? Number(dailyGoal) : 3
  const roadmapValue = typeof targetRoadmap === "string" ? targetRoadmap.trim() : ""
  const difficultyValue = typeof preferredDifficulty === "string" ? preferredDifficulty.trim() : ""

  if (!CURATED_TRACKS.some((track) => track.title === roadmapValue)) {
    throw new Error("Please choose a valid study track.")
  }
  if (!Number.isInteger(dailyGoalValue) || dailyGoalValue < 1 || dailyGoalValue > 20) {
    throw new Error("Daily goal must be between 1 and 20.")
  }
  if (!["Easy", "Medium", "Hard"].includes(difficultyValue)) {
    throw new Error("Please choose a valid difficulty.")
  }

  const interviewDateValue =
    typeof targetInterviewDate === "string" && targetInterviewDate
      ? new Date(`${targetInterviewDate}T00:00:00.000Z`)
      : null
  if (interviewDateValue && Number.isNaN(interviewDateValue.getTime())) {
    throw new Error("Please choose a valid interview date.")
  }

  await prisma.userPreference.upsert({
    where: { userId },
    update: {
      targetRoadmap: roadmapValue,
      dailyGoal: dailyGoalValue,
      preferredDifficulty: difficultyValue,
      studyReminderEnabled: studyReminderEnabled === "on",
      studyReminderTime:
        typeof studyReminderTime === "string" && studyReminderTime.trim()
          ? studyReminderTime.trim()
          : null,
      targetInterviewDate: interviewDateValue,
    },
    create: {
      userId,
      targetRoadmap: roadmapValue,
      dailyGoal: dailyGoalValue,
      preferredDifficulty: difficultyValue,
      studyReminderEnabled: studyReminderEnabled === "on",
      studyReminderTime:
        typeof studyReminderTime === "string" && studyReminderTime.trim()
          ? studyReminderTime.trim()
          : null,
      targetInterviewDate: interviewDateValue,
    },
  })

  revalidatePath("/onboarding")
  revalidatePath("/problems")
  redirect("/problems")
}
