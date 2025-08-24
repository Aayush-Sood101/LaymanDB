"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Check, AlertCircle } from "lucide-react";
import Link from "next/link";
import PageTemplate from "../../components/PageTemplate";

// A reusable component for pricing cards to keep the main component cleaner
const PricingCard = ({ plan, loading, handlePayment }) => {
  const { name, price, description, features, isPopular } = plan;

  return (
    <div
      className={`relative flex flex-col rounded-2xl border transition-transform duration-300 hover:scale-[1.02] hover:shadow-2xl ${
        isPopular
          ? "border-zinc-900 dark:border-zinc-500 shadow-xl"
          : "border-zinc-200 dark:border-zinc-800 shadow-md"
      }`}
    >
      {isPopular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <div className="px-4 py-1 text-sm font-semibold bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 rounded-full shadow-lg">
            Most Popular
          </div>
        </div>
      )}

      <div className="p-8 flex-1 flex flex-col">
        <div className="flex-1">
          <h3 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
            {name}
          </h3>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            {description}
          </p>

          <div className="mt-6 mb-8 border-b border-zinc-200 dark:border-zinc-700 pb-8">
            <span className="text-5xl font-bold text-zinc-900 dark:text-zinc-100">
              ₹{price}
            </span>
            <span className="ml-2 text-zinc-500 dark:text-zinc-400">
              / one-time
            </span>
          </div>

          <ul className="space-y-4">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start">
                <Check className="w-5 h-5 text-indigo-500 mr-3 flex-shrink-0 mt-0.5" />
                <span className="text-zinc-700 dark:text-zinc-300">
                  {feature}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-10">
          <button
            onClick={() => handlePayment(plan.id)}
            disabled={loading}
            className={`w-full h-12 text-sm font-semibold rounded-lg transition-all duration-300 flex items-center justify-center ${
              isPopular
                ? "bg-zinc-900 text-white hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
                : "bg-transparent text-zinc-900 border border-zinc-300 hover:bg-zinc-100 dark:text-white dark:border-zinc-700 dark:hover:bg-zinc-800"
            } ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
          >
            {loading ? "Processing..." : `Get ${name}`}
          </button>
        </div>
      </div>
    </div>
  );
};

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
        const errorData = await res
          .json()
          .catch(() => ({ error: "Failed to create payment" }));
        throw new Error(
          errorData.error || `Failed to create payment (${res.status})`
        );
      }

      const order = await res.json();

      // 2. Razorpay Checkout options
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
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
              credits: order.credits,
            }),
          });

          const data = await verifyRes.json();

          if (data.success) {
            await fetchUserStatus(); // Refresh user status
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
          ondismiss: function () {
            setLoading(false);
            router.push("/billing/cancel");
          },
        },
      };

      if (typeof window.Razorpay === "undefined") {
        console.error("Razorpay script not loaded");
        throw new Error(
          "Payment system is not available right now. Please refresh and try again."
        );
      }

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response) {
        console.error("Payment failed:", response.error);
        setError(
          `Payment failed: ${
            response.error.description || response.error.reason || "Unknown error"
          }`
        );
        setLoading(false);
      });
      rzp.open();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const pricingPlans = [
    {
      id: "basic",
      name: "Basic",
      price: 30,
      description: "For individuals and small projects getting started.",
      features: [
        "100 schema generations",
        "Standard SQL export options",
        "Basic ER diagram visualization",
      ],
      isPopular: false,
    },
    {
      id: "premium",
      name: "Premium",
      price: 50,
      description: "Ideal for professional developers and teams.",
      features: [
        "200 schema generations",
        "Advanced SQL export options (multiple dialects)",
        "Advanced ER diagram visualization",
        "Priority email support",
      ],
      isPopular: true,
    },
  ];

  if (!isSignedIn) {
    return (
      <PageTemplate>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <h2 className="text-3xl font-bold text-zinc-900 dark:text-white">
            Please Sign In
          </h2>
          <p className="mt-3 max-w-md text-zinc-600 dark:text-zinc-400">
            You need to create an account or sign in to purchase a plan and
            manage your subscription.
          </p>
          <Link
            href="/sign-in"
            className="mt-6 inline-flex items-center justify-center h-11 px-6 font-medium text-white bg-zinc-900 rounded-lg shadow-md hover:bg-zinc-700 transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Sign In
          </Link>
        </div>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate>
      <section className="bg-white dark:bg-black text-foreground py-16 sm:py-24 px-4">
        <div className="max-w-6xl mx-auto">
          {/* --- HEADER --- */}
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-bold text-zinc-900 dark:text-white">
              Simple, Transparent Pricing
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-zinc-600 dark:text-zinc-400">
              Every user gets 10 free schema generations. Purchase a credit pack
              when you need more. No subscriptions, no hidden fees.
            </p>
          </div>

          {/* --- USER STATUS --- */}
          {userStatus && (
            <div className="mb-12 p-6 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 shadow-sm">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                    Your Account Status
                  </h3>
                  <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200">
                    {userStatus.isPro ? "Premium User" : "Free User"}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
                  <div className="text-center bg-white dark:bg-zinc-800/50 p-4 rounded-lg border border-zinc-200 dark:border-zinc-700">
                    <div className="text-3xl font-bold text-zinc-900 dark:text-white">
                      {userStatus.freeTrialCount}{" "}
                      <span className="text-lg">
                        / {userStatus.freeTrialLimit}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      Free Trials Used
                    </p>
                  </div>
                  <div className="text-center bg-white dark:bg-zinc-800/50 p-4 rounded-lg border border-zinc-200 dark:border-zinc-700">
                    <div className="text-3xl font-bold text-zinc-900 dark:text-white">
                      {userStatus.paidSchemaCredits}
                    </div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      Purchased Credits
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* --- ERROR MESSAGE --- */}
          {error && (
            <div className="mb-12 flex items-center p-4 border border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300 rounded-lg">
              <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="font-semibold">Payment Error</h3>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* --- PRICING GRID --- */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-stretch">
            {pricingPlans.map((plan) => (
              <PricingCard
                key={plan.id}
                plan={plan}
                loading={loading}
                handlePayment={handlePayment}
              />
            ))}
          </div>
        </div>
      </section>
    </PageTemplate>
  );
}