"use client";

import { useState } from "react";
import Link from "next/link";

export default function PaywallNotice({ freeTrialCount, freeTrialLimit }) {
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen || freeTrialCount < freeTrialLimit) {
    return null;
  }

  return (
    <div className="rounded-md bg-indigo-50 p-4 mb-6">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-indigo-400"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3 flex-1 md:flex md:justify-between">
          <p className="text-sm text-indigo-700">
            You've used all your free trials. Upgrade now to continue generating schemas.
          </p>
          <div className="mt-3 flex md:mt-0 md:ml-6">
            <Link
              href="/subscribe"
              className="text-sm font-medium text-indigo-700 hover:text-indigo-600 whitespace-nowrap"
            >
              Upgrade <span aria-hidden="true">&rarr;</span>
            </Link>
            <button
              type="button"
              className="ml-3 text-sm font-medium text-indigo-700 hover:text-indigo-600"
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
