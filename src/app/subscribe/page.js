"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Head from "next/head";
import PageTemplate from "../../components/PageTemplate";

export default function SubscribePage() {
  const { user, isSignedIn } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [userStatus, setUserStatus] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch user subscription status
    if (isSignedIn) {
      fetchUserStatus();
    }
  }, [isSignedIn]);

  const fetchUserStatus = async () => {
    try {
      const response = await fetch("/api/user/status");
      if (!response.ok) throw new Error("Failed to fetch user status");
      const data = await response.json();
      setUserStatus(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const handlePayment = async (plan) => {
    try {
      setLoading(true);
      setError(null);
      
      // 1. Create order from backend
      const res = await fetch("/api/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: "Failed to create payment" }));
        throw new Error(errorData.error || `Failed to create payment (${res.status})`);
      }
      
      const order = await res.json();

      // 2. Razorpay Checkout options
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "", // Ensure this is accessible
        amount: order.amount,
        currency: order.currency,
        name: "LaymanDB",
        description: `Subscription for ${order.plan}`,
        order_id: order.id,
        handler: async function (response) {
          // Verify payment
          const verifyRes = await fetch("/api/payment/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...response,
              userId: user.id,
              plan: order.plan,
              credits: order.credits
            }),
          });
          
          const data = await verifyRes.json();
          
          if (data.success) {
            // Refresh subscription status
            await fetchUserStatus();
            // Redirect to success page
            router.push("/billing/success");
          } else {
            setError("Payment verification failed");
            router.push("/billing/cancel");
          }
        },
        prefill: {
          name: user?.fullName || "",
          email: user?.primaryEmailAddress?.emailAddress || "",
        },
        theme: {
          color: "#4F46E5",
        },
        modal: {
          ondismiss: function() {
            setLoading(false);
            router.push("/billing/cancel");
          }
        }
      };

      // Make sure Razorpay is loaded from the global script
      if (typeof window.Razorpay === 'undefined') {
        console.error("Razorpay script not loaded");
        throw new Error("Payment system is not available right now. Please refresh the page and try again.");
      }
      
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function(response) {
        console.error("Payment failed:", response.error);
        setError(`Payment failed: ${response.error.description || response.error.reason || 'Unknown error'}`);
        setLoading(false);
      });
      rzp.open();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (!isSignedIn) {
    return (
      <PageTemplate title="Subscribe">
        <div className="flex flex-col items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8">
            <div className="text-center">
              <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                Please sign in first
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                You need to be signed in to subscribe to LaymanDB
              </p>
            </div>
            <div className="mt-5">
              <Link href="/sign-in" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate title="Subscribe">
      <div className="bg-white">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base font-semibold text-indigo-600 tracking-wide uppercase">Pricing</h2>
            <p className="mt-1 text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
              Take your database design to the next level
            </p>
            <p className="max-w-xl mt-5 mx-auto text-xl text-gray-500">
              Choose the right plan for your needs
            </p>
          </div>

          {userStatus && (
            <div className="mt-8 bg-gray-50 p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-medium text-gray-900">Your Current Plan</h3>
              <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-gray-500">Free Trials: {userStatus.freeTrialCount} / {userStatus.freeTrialLimit} used</p>
                  <p className="text-sm text-gray-500">Current Plan: {userStatus.subscriptionPlan}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Paid Credits Remaining: {userStatus.paidSchemaCredits}</p>
                  <p className="text-sm text-gray-500">Status: {userStatus.isPro ? "Premium User" : "Free User"}</p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-8 rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:mx-0 xl:grid-cols-2">
            {/* Basic Plan */}
            <div className="border border-gray-200 rounded-lg shadow-sm divide-y divide-gray-200">
              <div className="p-6">
                <h2 className="text-lg leading-6 font-medium text-gray-900">Basic Plan</h2>
                <p className="mt-4 text-sm text-gray-500">For individuals and small projects</p>
                <p className="mt-8">
                  <span className="text-4xl font-extrabold text-gray-900">₹30</span>
                  <span className="text-base font-medium text-gray-500">one-time</span>
                </p>
                <p className="mt-4 text-sm text-gray-500">Get 100 schema generations</p>
                <button
                  onClick={() => handlePayment("basic")}
                  disabled={loading}
                  className={`mt-8 block w-full bg-indigo-600 border border-transparent rounded-md py-2 text-sm font-semibold text-white text-center hover:bg-indigo-700 ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
                >
                  {loading ? 'Processing...' : 'Purchase Basic Plan'}
                </button>
              </div>
              <div className="pt-6 pb-8 px-6">
                <h3 className="text-xs font-medium text-gray-900 tracking-wide uppercase">What's included</h3>
                <ul role="list" className="mt-6 space-y-4">
                  <li className="flex space-x-3">
                    <svg className="flex-shrink-0 h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-gray-500">100 schema generations</span>
                  </li>
                  <li className="flex space-x-3">
                    <svg className="flex-shrink-0 h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-gray-500">Standard SQL export options</span>
                  </li>
                  <li className="flex space-x-3">
                    <svg className="flex-shrink-0 h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-gray-500">Basic ER diagram visualization</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Premium Plan */}
            <div className="border border-gray-200 rounded-lg shadow-sm divide-y divide-gray-200">
              <div className="p-6">
                <h2 className="text-lg leading-6 font-medium text-gray-900">Premium Plan</h2>
                <p className="mt-4 text-sm text-gray-500">For professionals and teams</p>
                <p className="mt-8">
                  <span className="text-4xl font-extrabold text-gray-900">₹50</span>
                  <span className="text-base font-medium text-gray-500">one-time</span>
                </p>
                <p className="mt-4 text-sm text-gray-500">Get 200 schema generations</p>
                <button
                  onClick={() => handlePayment("premium")}
                  disabled={loading}
                  className={`mt-8 block w-full bg-indigo-600 border border-transparent rounded-md py-2 text-sm font-semibold text-white text-center hover:bg-indigo-700 ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
                >
                  {loading ? 'Processing...' : 'Purchase Premium Plan'}
                </button>
              </div>
              <div className="pt-6 pb-8 px-6">
                <h3 className="text-xs font-medium text-gray-900 tracking-wide uppercase">What's included</h3>
                <ul role="list" className="mt-6 space-y-4">
                  <li className="flex space-x-3">
                    <svg className="flex-shrink-0 h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-gray-500">200 schema generations</span>
                  </li>
                  <li className="flex space-x-3">
                    <svg className="flex-shrink-0 h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-gray-500">Advanced SQL export options</span>
                  </li>
                  <li className="flex space-x-3">
                    <svg className="flex-shrink-0 h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-gray-500">Advanced ER diagram visualization</span>
                  </li>
                  <li className="flex space-x-3">
                    <svg className="flex-shrink-0 h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-gray-500">Priority support</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTemplate>
  );
}
