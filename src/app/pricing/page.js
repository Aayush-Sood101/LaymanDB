"use client"

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Sparkles, Zap, Database, Check } from "lucide-react";
import Link from "next/link";
import PageTemplate from "../../components/PageTemplate";

export default function PricingPage() {
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
      <PageTemplate title="Pricing">
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
    <PageTemplate title="Pricing">
      <section className="relative bg-white dark:bg-black text-foreground py-12 px-4 md:py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_40%,rgba(0,0,0,0.05),transparent_50%)] dark:bg-[radial-gradient(circle_at_40%_40%,rgba(255,255,255,0.025),transparent_50%)]"></div>
        
        <div className="relative w-full max-w-5xl mx-auto">
          <div className="flex flex-col items-center gap-4 mb-12">
            <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
              Simple, transparent pricing
            </h2>
            <p className="text-center text-zinc-600 dark:text-zinc-400 max-w-xl">
              Every user gets 10 free schema generations. Purchase more when you need them.
            </p>
          </div>

          {userStatus && (
            <div className="mb-12 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-r from-zinc-800/10 via-zinc-800/5 to-zinc-800/10 rounded-2xl"></div>
              <div className="relative p-8 border border-zinc-200 dark:border-zinc-800 rounded-2xl backdrop-blur-sm bg-white/30 dark:bg-black/30 shadow-xl">
                <div className="flex flex-col md:flex-row justify-between">
                  <div className="mb-6 md:mb-0">
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Your Current Plan</h3>
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200">
                      {userStatus.isPro ? "Premium User" : "Free User"}
                    </div>
                    <p className="mt-4 text-zinc-700 dark:text-zinc-300 font-medium">
                      {userStatus.subscriptionPlan || "No active plan"}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="bg-zinc-50 dark:bg-zinc-900 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800">
                      <div className="text-2xl font-bold text-zinc-900 dark:text-white">
                        {userStatus.freeTrialCount} <span className="text-sm font-normal text-zinc-500 dark:text-zinc-400">/ {userStatus.freeTrialLimit}</span>
                      </div>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">Free Trials Used</p>
                    </div>
                    
                    <div className="bg-zinc-50 dark:bg-zinc-900 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800">
                      <div className="text-2xl font-bold text-zinc-900 dark:text-white">
                        {userStatus.paidSchemaCredits}
                      </div>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">Credits Remaining</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-8 relative overflow-hidden rounded-xl border border-red-200 dark:border-red-900/30 bg-white dark:bg-black shadow-sm">
              <div className="absolute inset-0 bg-red-50/50 dark:bg-red-900/10 backdrop-blur-sm"></div>
              <div className="relative p-5 flex items-start">
                <div className="flex-shrink-0 p-1">
                  <svg className="h-5 w-5 text-red-500 dark:text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3 flex-1">
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-300">Payment Error</h3>
                  <div className="mt-1 text-sm text-red-700 dark:text-red-400">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Basic Plan */}
            <div className="relative group backdrop-blur-sm rounded-3xl transition-all duration-300 flex flex-col bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-md hover:shadow-xl hover:translate-y-[-4px]">
              <div className="p-8 flex-1">
                <div className="flex items-center justify-between mb-6">
                  <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-zinc-500/20 to-zinc-500/20 blur-2xl rounded-full"></div>
                      <Zap className="w-7 h-7 relative z-10 text-zinc-700 dark:text-zinc-300" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                    Basic Plan
                  </h3>
                </div>

                <div className="mb-6 border-b border-zinc-200 dark:border-zinc-800 pb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-zinc-900 dark:text-zinc-100">
                      ₹30
                    </span>
                    <span className="text-sm text-zinc-500 dark:text-zinc-400">
                      one-time
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                    For individuals and small projects
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="mt-1 p-0.5 rounded-full text-zinc-900 dark:text-zinc-200">
                      <Check className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        100 schema generations
                      </div>
                      <div className="text-sm text-zinc-500 dark:text-zinc-400">
                        Generate database schemas with AI
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="mt-1 p-0.5 rounded-full text-zinc-900 dark:text-zinc-200">
                      <Check className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        Standard SQL export options
                      </div>
                      <div className="text-sm text-zinc-500 dark:text-zinc-400">
                        Export your schema to SQL
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="mt-1 p-0.5 rounded-full text-zinc-900 dark:text-zinc-200">
                      <Check className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        Basic ER diagram visualization
                      </div>
                      <div className="text-sm text-zinc-500 dark:text-zinc-400">
                        Visualize your database relationships
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8 pt-0 mt-auto">
                <button
                  onClick={() => handlePayment("basic")}
                  disabled={loading}
                  className={`w-full relative transition-all duration-300 h-12 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 border border-zinc-300 dark:border-zinc-700 shadow-sm hover:shadow-md text-sm font-medium rounded-md ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {loading ? 'Processing...' : 'Purchase Basic'}
                  </span>
                </button>
              </div>
            </div>

            {/* Premium Plan */}
            <div className="relative group backdrop-blur-sm rounded-3xl transition-all duration-300 flex flex-col bg-gradient-to-b from-zinc-100 to-white dark:from-zinc-800 dark:to-zinc-900 border border-zinc-300 dark:border-zinc-700 shadow-xl hover:shadow-2xl hover:translate-y-[-4px]">
              <div className="absolute -top-4 left-6">
                <div className="px-4 py-1.5 text-sm font-medium bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-full border-none shadow-lg">
                  Most Popular
                </div>
              </div>

              <div className="p-8 flex-1">
                <div className="flex items-center justify-between mb-6">
                  <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-zinc-500/20 to-zinc-500/20 blur-2xl rounded-full"></div>
                      <Database className="w-7 h-7 relative z-10 text-zinc-900 dark:text-zinc-100" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                    Premium Plan
                  </h3>
                </div>

                <div className="mb-6 border-b border-zinc-200 dark:border-zinc-700 pb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-zinc-900 dark:text-zinc-100">
                      ₹50
                    </span>
                    <span className="text-sm text-zinc-500 dark:text-zinc-400">
                      one-time
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                    Ideal for professional developers
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="mt-1 p-0.5 rounded-full text-zinc-900 dark:text-zinc-200">
                      <Check className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        200 schema generations
                      </div>
                      <div className="text-sm text-zinc-500 dark:text-zinc-400">
                        Double the schema generations
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="mt-1 p-0.5 rounded-full text-zinc-900 dark:text-zinc-200">
                      <Check className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        Advanced SQL export options
                      </div>
                      <div className="text-sm text-zinc-500 dark:text-zinc-400">
                        Export to multiple SQL dialects with customization
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="mt-1 p-0.5 rounded-full text-zinc-900 dark:text-zinc-200">
                      <Check className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        Advanced ER diagram visualization
                      </div>
                      <div className="text-sm text-zinc-500 dark:text-zinc-400">
                        Enhanced visualization options
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="mt-1 p-0.5 rounded-full text-zinc-900 dark:text-zinc-200">
                      <Check className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        Priority support
                      </div>
                      <div className="text-sm text-zinc-500 dark:text-zinc-400">
                        Get faster responses to your questions
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8 pt-0 mt-auto">
                <button
                  onClick={() => handlePayment("premium")}
                  disabled={loading}
                  className={`w-full relative transition-all duration-300 h-12 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 shadow-md hover:shadow-lg font-medium text-sm rounded-md ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {loading ? 'Processing...' : 'Purchase Premium'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageTemplate>
  );
}
