"use client";

import { useEffect } from "react";
import { AlertCircle } from "lucide-react";

export default function SearchError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#F1F5F9] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-4">
          <AlertCircle className="text-red-500" size={48} />
        </div>
        <h2 className="text-xl font-semibold text-slate-800 mb-2">
          Failed to load search results
        </h2>
        <p className="text-slate-500 mb-6">
          Something went wrong while loading aircraft listings. Please try again.
        </p>
        <button
          onClick={reset}
          className="bg-[#2563EB] text-white px-6 py-2.5 rounded-lg font-medium hover:bg-[#1D4ED8] transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
