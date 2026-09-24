"use client";

import React, { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Global Root Error Caught]:", error);
  }, [error]);

  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#0A0D14] text-white flex items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full bg-[#111827] border border-white/10 rounded-2xl p-6 text-center shadow-2xl space-y-4">
          <div className="h-12 w-12 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto text-xl font-bold">
            !
          </div>
          <h2 className="text-xl font-bold tracking-tight">System Exception</h2>
          <p className="text-xs text-gray-400">
            A critical error occurred at the application boundary.
          </p>
          {error.message && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-300 font-mono text-left break-all">
              {error.message}
            </div>
          )}
          <div className="pt-2">
            <button
              onClick={() => reset()}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-colors"
            >
              Restart Application
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
