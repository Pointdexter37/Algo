"use client"

import { useState, useTransition } from "react"
import { markProblemAsSolved } from "@/app/actions/problems"

interface MarkSolvedButtonProps {
  problemId: string
  isSolved?: boolean
}

export default function MarkSolvedButton({ problemId, isSolved = false }: MarkSolvedButtonProps) {
  const [isPending, startTransition] = useTransition()
  
  const handleMarkSolved = () => {
    // In a full implementation, you might open a modal here to ask for timeSpent and difficultyRating.
    // For now, we will simulate a quick submission with default values.
    const timeSpent = 15 // Default to 15 mins for now
    const difficultyRating = 3 // Normal difficulty

    startTransition(async () => {
      try {
        await markProblemAsSolved(problemId, timeSpent, difficultyRating)
        alert("Awesome! Problem marked as solved.")
      } catch (error: any) {
        alert(error.message || "Failed to mark as solved.")
      }
    })
  }

  return (
    <button 
      onClick={handleMarkSolved}
      disabled={isPending || isSolved}
      className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-all ${
        isSolved 
          ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30 cursor-not-allowed" 
          : "bg-white/5 text-zinc-300 border-white/10 hover:bg-indigo-500/20 hover:text-indigo-300 hover:border-indigo-500/30"
      }`}
    >
      {isPending ? "Saving..." : isSolved ? "Solved" : "Mark Solved"}
    </button>
  )
}
