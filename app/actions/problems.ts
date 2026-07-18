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

  // 1. Create a submission
  await prisma.submission.create({
    data: {
      userId,
      problemId,
      status: "Accepted",
      timeSpent,
    }
  })

  // 2. Update or Create UserProgress using SM-2
  const existingProgress = await prisma.userProgress.findUnique({
    where: {
      userId_problemId: { userId, problemId }
    }
  });

  const currentRepetitions = existingProgress?.repetitions ?? 0;
  const currentEaseFactor = existingProgress?.easeFactor ?? 2.5;
  const currentInterval = existingProgress?.interval ?? 0;

  const { nextInterval, nextRepetitions, nextEaseFactor } = calculateSM2(
    difficultyRating,
    currentRepetitions,
    currentEaseFactor,
    currentInterval
  );

  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + nextInterval);

  await prisma.userProgress.upsert({
    where: {
      userId_problemId: {
        userId,
        problemId,
      }
    },
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
    }
  })

  // Refresh the UI to show the new status
  revalidatePath("/problems")
}
