"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertCircle } from "lucide-react";

export default function PaywallNotice({ freeTrialCount, freeTrialLimit }) {
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen || freeTrialCount < freeTrialLimit) {
    return null;
  }

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden mb-6 shadow-sm">
      <div className="p-5 flex items-start">
        <AlertCircle className="h-5 w-5 text-zinc-700 dark:text-zinc-300 mt-0.5 mr-3 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
            Free trials exhausted
          </h3>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            You've used all your free trials. Upgrade now to continue generating schemas.
          </p>
          <div className="mt-3 flex space-x-4">
            <Link
              href="/pricing"
              className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-zinc-900 dark:bg-white dark:text-zinc-900 border border-zinc-800 dark:border-zinc-200 rounded-md shadow-sm hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors duration-200"
            >
              Upgrade Plan
            </Link>
            <button
              type="button"
              className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors duration-200"
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
