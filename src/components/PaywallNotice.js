"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertCircle } from "lucide-react";

export default function PaywallNotice({ freeTrialCount, freeTrialLimit }) {
  const [isOpen, setIsOpen] = useState(true);

  // The notice will only show if it's not dismissed AND the user is out of trials.
  if (!isOpen || freeTrialCount < freeTrialLimit) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-950/50 overflow-hidden mb-6 shadow-lg">
      <div className="p-5 flex items-start">
        <AlertCircle className="h-6 w-6 text-amber-400 mt-0.5 mr-4 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-base font-semibold text-white">
            Free trials exhausted
          </h3>
          <p className="mt-1 text-sm text-neutral-400">
            You've used all your free trials. Upgrade your plan to continue generating schemas.
          </p>
          <div className="mt-4 flex items-center gap-4">
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-md hover:opacity-90 transition-opacity duration-200"
            >
              Upgrade Plan
            </Link>
            <button
              type="button"
              className="text-sm font-medium text-neutral-400 hover:text-white transition-colors duration-200"
              onClick={() => setIsOpen(false)}
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}