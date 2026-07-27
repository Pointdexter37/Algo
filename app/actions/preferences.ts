"use server"

import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"
import { getServerSession } from "next-auth/next"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

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

  await prisma.userPreference.upsert({
    where: { userId },
    update: {
      targetRoadmap: typeof targetRoadmap === "string" && targetRoadmap.trim() ? targetRoadmap.trim() : null,
      dailyGoal: typeof dailyGoal === "string" ? Number(dailyGoal) : 3,
      preferredDifficulty:
        typeof preferredDifficulty === "string" && preferredDifficulty.trim()
          ? preferredDifficulty.trim()
          : null,
      studyReminderEnabled: studyReminderEnabled === "on",
      studyReminderTime:
        typeof studyReminderTime === "string" && studyReminderTime.trim()
          ? studyReminderTime.trim()
          : null,
      targetInterviewDate:
        typeof targetInterviewDate === "string" && targetInterviewDate
          ? new Date(targetInterviewDate)
          : null,
    },
    create: {
      userId,
      targetRoadmap:
        typeof targetRoadmap === "string" && targetRoadmap.trim() ? targetRoadmap.trim() : null,
      dailyGoal: typeof dailyGoal === "string" ? Number(dailyGoal) : 3,
      preferredDifficulty:
        typeof preferredDifficulty === "string" && preferredDifficulty.trim()
          ? preferredDifficulty.trim()
          : null,
      studyReminderEnabled: studyReminderEnabled === "on",
      studyReminderTime:
        typeof studyReminderTime === "string" && studyReminderTime.trim()
          ? studyReminderTime.trim()
          : null,
      targetInterviewDate:
        typeof targetInterviewDate === "string" && targetInterviewDate
          ? new Date(targetInterviewDate)
          : null,
    },
  })

  revalidatePath("/onboarding")
  revalidatePath("/problems")
  redirect("/problems")
}
