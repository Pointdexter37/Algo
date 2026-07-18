"use client"

import { useState, useTransition, useEffect, useRef } from "react"
import { markProblemAsSolved } from "@/app/actions/problems"

interface MarkSolvedModalProps {
  problemId: string
  isSolved?: boolean
  isDue?: boolean
}

export default function MarkSolvedModal({ problemId, isSolved = false, isDue = false }: MarkSolvedModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const modalRef = useRef<HTMLDivElement>(null)

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isOpen])

  const handleRating = (rating: number) => {
    const timeSpent = 15 // Still a default for now, can be updated later

    startTransition(async () => {
      try {
        await markProblemAsSolved(problemId, timeSpent, rating)
        setIsOpen(false)
        alert(isDue ? "Review recorded!" : "Awesome! Problem marked as solved.")
      } catch (error: any) {
        alert(error.message || "Failed to save.")
      }
    })
  }

  if (isSolved && !isDue) {
    return (
      <button
        disabled
        className="text-xs font-medium px-3 py-1.5 rounded-lg border bg-emerald-500/20 text-emerald-400 border-emerald-500/30 cursor-not-allowed transition-all"
      >
        Solved
      </button>
    )
  }

  return (
    <div className="relative inline-block" ref={modalRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isPending}
        className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-all ${isDue
            ? "bg-rose-500/20 text-rose-300 border-rose-500/30 hover:bg-rose-500/30 hover:border-rose-500/40"
            : "bg-white/5 text-zinc-300 border-white/10 hover:bg-indigo-500/20 hover:text-indigo-300 hover:border-indigo-500/30"
          }`}
      >
        {isPending ? "Saving..." : isDue ? "Review Due" : "Mark Solved"}
      </button>

      {isOpen && (
        <div className="absolute left-0 lg:left-auto lg:right-0 top-full mt-2 w-64 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2">
          <h3 className="text-sm font-semibold text-zinc-200 mb-2">How hard was this?</h3>
          <p className="text-xs text-zinc-400 mb-3">Rate the difficulty to help us schedule your next review.</p>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleRating(0)}
              className="px-2 py-1.5 text-xs font-medium rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition-colors"
            >
              Again (0)
            </button>
            <button
              onClick={() => handleRating(2)}
              className="px-2 py-1.5 text-xs font-medium rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-colors"
            >
              Hard (2)
            </button>
            <button
              onClick={() => handleRating(4)}
              className="px-2 py-1.5 text-xs font-medium rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
            >
              Good (4)
            </button>
            <button
              onClick={() => handleRating(5)}
              className="px-2 py-1.5 text-xs font-medium rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/20 transition-colors"
            >
              Easy (5)
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
