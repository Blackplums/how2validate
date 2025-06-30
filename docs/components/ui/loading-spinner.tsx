import React from "react"

export const LoadingSpinner = () => (
  <div className="flex min-h-screen flex-col items-center justify-center p-4">
    <div className="mb-2 flex gap-1">
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="animate-hackbar h-8 w-1 rounded bg-green-600 dark:bg-green-400"
          style={{ animationDelay: `${i * 0.1}s` }}
        />
      ))}
    </div>
    <div className="mt-2 flex items-center text-2xl font-bold text-green-600 dark:text-green-400">
      <span>Loading</span>
      <span className="animate-hackcursor ml-1">_</span>
    </div>
    <style>{`
      @keyframes hackbar {
        0%, 100% { height: 0.5rem; opacity: 0.7; }
        50% { height: 2rem; opacity: 1; }
      }
      .animate-hackbar {
        animation: hackbar 1s infinite;
      }
      @keyframes hackcursor {
        0%, 49% { opacity: 1; }
        50%, 100% { opacity: 0; }
      }
      .animate-hackcursor {
        animation: hackcursor 1s steps(1) infinite;
      }
    `}</style>
  </div>
)
