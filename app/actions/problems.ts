"use server"

import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { calculateSM2 } from "@/lib/sm2"
import { revalidatePath } from "next/cache"

export async function markProblemAsSolved(problemId: string, timeSpent: number, difficultyRating: number) {
  const session = await getServerSession(authOptions)
  
  if (!session || !session.user || !session.user.id) {
    throw new Error("You must be logged in to mark problems as solved.")
  }

  const userId = session.user.id as string
  const problem = await prisma.problem.findUnique({ where: { id: problemId }, select: { id: true } })
  if (!problem) {
    throw new Error("Problem not found.")
  }

  if (!Number.isInteger(timeSpent) || timeSpent < 1 || timeSpent > 1440) {
    throw new Error("Time spent must be between 1 and 1440 minutes.")
  }

  if (!Number.isInteger(difficultyRating) || difficultyRating < 0 || difficultyRating > 5) {
    throw new Error("Difficulty rating must be between 0 and 5.")
  }

  await prisma.$transaction(async (transaction) => {
    const existingProgress = await transaction.userProgress.findUnique({
      where: { userId_problemId: { userId, problemId } },
    })
    const { nextInterval, nextRepetitions, nextEaseFactor } = calculateSM2(
      difficultyRating,
      existingProgress?.repetitions ?? 0,
      existingProgress?.easeFactor ?? 2.5,
      existingProgress?.interval ?? 0,
    )
    const nextReviewDate = new Date()
    nextReviewDate.setDate(nextReviewDate.getDate() + nextInterval)

    await transaction.submission.create({
      data: { userId, problemId, status: "Accepted", timeSpent },
    })
    await transaction.userProgress.upsert({
      where: { userId_problemId: { userId, problemId } },
      update: {
        difficultyRating,
        repetitions: nextRepetitions,
        interval: nextInterval,
        easeFactor: nextEaseFactor,
        nextReviewDate,
      },
      create: {
        userId,
        problemId,
        difficultyRating,
        repetitions: nextRepetitions,
        interval: nextInterval,
        easeFactor: nextEaseFactor,
        nextReviewDate,
      },
    })
  })

  // Refresh the UI to show the new status
  revalidatePath("/problems")
  revalidatePath("/session")
}
