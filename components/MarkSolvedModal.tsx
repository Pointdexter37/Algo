"use client"

import { useEffect, useRef, useState, useTransition } from "react"
import { createPortal } from "react-dom"
import { markProblemAsSolved } from "@/app/actions/problems"

interface MarkSolvedModalProps {
  problemId: string
  isSolved?: boolean
  isDue?: boolean
}

export default function MarkSolvedModal({ problemId, isSolved = false, isDue = false }: MarkSolvedModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [timeSpent, setTimeSpent] = useState("15")
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = ""
    }
  }, [isOpen])

  const handleRating = (rating: number) => {
    const parsedTimeSpent = Number(timeSpent)
    const safeTimeSpent = Number.isFinite(parsedTimeSpent) && parsedTimeSpent > 0 ? parsedTimeSpent : 15

    startTransition(async () => {
      try {
        await markProblemAsSolved(problemId, safeTimeSpent, rating)
        setIsOpen(false)
        setTimeSpent("15")
        alert(isDue ? "Review recorded!" : "Awesome! Problem marked as solved.")
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Failed to save."
        alert(message)
      }
    })
  }

  if (isSolved && !isDue) {
    return (
      <button
        type="button"
        disabled
        className="text-xs font-medium px-3 py-1.5 rounded-lg border bg-emerald-500/20 text-emerald-400 border-emerald-500/30 cursor-not-allowed transition-all"
      >
        Solved
      </button>
    )
  }

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        disabled={isPending}
        className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-all ${
          isDue
            ? "bg-rose-500/20 text-rose-300 border-rose-500/30 hover:bg-rose-500/30 hover:border-rose-500/40"
            : "bg-white/5 text-zinc-300 border-white/10 hover:bg-indigo-500/20 hover:text-indigo-300 hover:border-indigo-500/30"
        }`}
      >
        {isPending ? "Saving..." : isDue ? "Review Due" : "Mark Solved"}
      </button>

      {isOpen && typeof window !== "undefined"
        ? createPortal(
            <div
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
              onClick={() => setIsOpen(false)}
            >
              <div
                className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#1a1a1a] p-5 shadow-2xl animate-in fade-in zoom-in-95"
                onClick={(event) => event.stopPropagation()}
                ref={modalRef}
              >
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-200">How hard was this?</h3>
                    <p className="mt-1 text-xs text-zinc-400">
                      Rate the difficulty to help us schedule your next review.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-zinc-300 hover:bg-white/10"
                  >
                    Close
                  </button>
                </div>

                <div className="mb-4 grid gap-2">
                  <label htmlFor={`timeSpent-${problemId}`} className="text-xs font-medium text-zinc-300">
                    Time spent (minutes)
                  </label>
                  <input
                    id={`timeSpent-${problemId}`}
                    type="number"
                    min={1}
                    value={timeSpent}
                    onChange={(event) => setTimeSpent(event.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-[#111111] px-3 py-2 text-sm text-white outline-none focus:border-indigo-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleRating(0)}
                    className="rounded bg-rose-500/10 px-2 py-2 text-xs font-medium text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition-colors"
                  >
                    Again (0)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRating(2)}
                    className="rounded bg-amber-500/10 px-2 py-2 text-xs font-medium text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-colors"
                  >
                    Hard (2)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRating(4)}
                    className="rounded bg-emerald-500/10 px-2 py-2 text-xs font-medium text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
                  >
                    Good (4)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRating(5)}
                    className="rounded bg-cyan-500/10 px-2 py-2 text-xs font-medium text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/20 transition-colors"
                  >
                    Easy (5)
                  </button>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  )
}
