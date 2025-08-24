// src/components/SubscriptionStatus.js
"use client";

import Link from "next/link";
import { CreditCard, Zap } from "lucide-react";

export default function SubscriptionStatus({ status }) {
  // If no status is provided, the component renders nothing.
  if (!status) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-950/50 overflow-hidden mb-6 shadow-lg">
      <div className="px-6 py-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-neutral-800">
        <div>
          <h3 className="text-lg font-semibold text-white flex items-center">
            <CreditCard className="w-5 h-5 mr-2 text-neutral-400" />
            Account Status
          </h3>
          <p className="mt-1 text-sm text-neutral-400">
            Your current usage and plan details.
          </p>
        </div>
        
        <Link
          href="/pricing"
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-md hover:opacity-90 transition-opacity duration-200"
        >
          Upgrade Plan
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6">
        {/* Current Plan */}
        <div className="bg-neutral-900 p-4 rounded-lg border border-neutral-800">
          <div className="text-sm font-medium text-neutral-500 mb-2">Current Plan</div>
          <div className="text-xl font-semibold text-white">
            {status.subscriptionPlan}
          </div>
          <div className="mt-2">
            {status.isPro ? (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-500/10 text-purple-300">
                Premium
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-neutral-800 text-neutral-300">
                Free
              </span>
            )}
          </div>
        </div>

        {/* Free Trials or Credits */}
        <div className="bg-neutral-900 p-4 rounded-lg border border-neutral-800">
          {!status.isPro ? (
            <>
              <div className="text-sm font-medium text-neutral-500 mb-2">Free Trials</div>
              <div className="flex items-end">
                <span className="text-xl font-semibold text-white">{status.freeTrialCount}</span>
                <span className="text-sm text-neutral-500 ml-1.5">/ {status.freeTrialLimit} used</span>
              </div>
              <div className="mt-3 w-full bg-neutral-800 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                  style={{ width: `${(status.freeTrialCount / status.freeTrialLimit) * 100}%` }}
                ></div>
              </div>
            </>
          ) : (
            <>
              <div className="text-sm font-medium text-neutral-500 mb-2">Remaining Credits</div>
              <div className="text-xl font-semibold text-white flex items-center">
                {status.paidSchemaCredits}
                <Zap className="w-4 h-4 ml-1.5 text-neutral-400" />
              </div>
               <div className="mt-2">
                {status.paidSchemaCredits <= 10 && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-900/30 text-yellow-300">
                    Low Balance
                  </span>
                )}
              </div>
            </>
          )}
        </div>

        {/* Usage Status */}
        <div className="bg-neutral-900 p-4 rounded-lg border border-neutral-800">
          <div className="text-sm font-medium text-neutral-500 mb-2">Usage Status</div>
          {!status.isPro && status.freeTrialCount >= status.freeTrialLimit ? (
            <div className="text-base font-medium text-red-400">
              Free trials exhausted
            </div>
          ) : (
            <div className="text-base font-medium text-green-400">
              Active
            </div>
          )}
          <div className="mt-2">
            <Link 
              href="/pricing" 
              className="text-sm font-medium text-neutral-300 hover:text-white transition-colors duration-200"
            >
              View available plans →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}