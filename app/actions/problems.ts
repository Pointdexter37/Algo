"use server"

import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function markProblemAsSolved(problemId: string, timeSpent: number, difficultyRating: number) {
  const session = await getServerSession(authOptions)
  
  if (!session || !session.user || !session.user.id) {
    throw new Error("You must be logged in to mark problems as solved.")
  }

  const userId = session.user.id as string

  // 1. Create a submission
  await prisma.submission.create({
    data: {
      userId,
      problemId,
      status: "Accepted",
      timeSpent,
    }
  })

  // 2. Update or Create UserProgress
  // We're setting up the foundation here. In Phase 3, we will add the real SM-2 algorithm logic to calculate interval and nextReviewDate.
  await prisma.userProgress.upsert({
    where: {
      userId_problemId: {
        userId,
        problemId,
      }
    },
    update: {
      difficultyRating,
      repetitions: { increment: 1 },
    },
    create: {
      userId,
      problemId,
      difficultyRating,
      repetitions: 1,
      interval: 1,
      easeFactor: 2.5,
    }
  })

  // Refresh the UI to show the new status
  revalidatePath("/problems")
}
