"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";

export default function SubscriptionStatus() {
  const { isSignedIn } = useUser();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isSignedIn) {
      fetchSubscriptionStatus();
    } else {
      setLoading(false);
    }
  }, [isSignedIn]);

  const fetchSubscriptionStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/user/status");
      if (!response.ok) throw new Error("Failed to fetch subscription status");
      const data = await response.json();
      setStatus(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (!isSignedIn || loading) {
    return null;
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4 mb-4">
        <div className="flex">
          <div className="ml-3">
            <p className="text-sm font-medium text-red-800">
              Could not load subscription status
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Subscription Status
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Your current usage and plan details
          </p>
        </div>
        <Link
          href="/subscribe"
          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Upgrade
        </Link>
      </div>

      {status && (
        <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
          <dl className="sm:divide-y sm:divide-gray-200">
            <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Current Plan</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {status.subscriptionPlan}
              </dd>
            </div>
            {!status.isPro && (
              <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Free Trials</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {status.freeTrialCount} / {status.freeTrialLimit} used
                  {status.freeTrialCount >= status.freeTrialLimit && (
                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-yellow-100 text-yellow-800">
                      Exhausted
                    </span>
                  )}
                </dd>
              </div>
            )}
            {status.isPro && (
              <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Remaining Credits</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {status.paidSchemaCredits}
                  {status.paidSchemaCredits <= 10 && (
                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-yellow-100 text-yellow-800">
                      Low
                    </span>
                  )}
                </dd>
              </div>
            )}
            <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {status.isPro ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-green-100 text-green-800">
                    Premium User
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-gray-100 text-gray-800">
                    Free User
                  </span>
                )}
              </dd>
            </div>
          </dl>
        </div>
      )}
    </div>
  );
}
