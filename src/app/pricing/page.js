"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Check, AlertCircle } from "lucide-react";
import Link from "next/link";
import PageTemplate from "../../components/PageTemplate";
import { PaymentDependentPage } from "../../lib/paymentUtils";

// Function to dynamically load Razorpay script
const loadRazorpay = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve();
      return;
    }
    
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve();
    script.onerror = () => {
      console.error("Failed to load Razorpay");
      resolve(); // Resolve anyway to prevent blocking
    };
    document.body.appendChild(script);
  });
};

// A reusable component for pricing cards with the new UI
const PricingCard = ({ plan, loading, handlePayment }) => {
  const { name, price, description, features, isPopular } = plan;

  const cardBaseClasses = "relative flex flex-col h-full rounded-2xl overflow-hidden";
  const cardPopularWrapper = "p-[2px] bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500";
  const cardStandardWrapper = "border border-neutral-800";

  return (
    <div className={isPopular ? cardPopularWrapper : cardStandardWrapper}>
      <div className={`${cardBaseClasses} bg-neutral-950 p-8`}>
        {isPopular && (
          <div className="absolute top-0 right-0 -mt-3 -mr-3">
            <div className="px-4 py-1.5 text-xs font-semibold tracking-wider uppercase bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full shadow-lg">
              Most Popular
            </div>
          </div>
        )}

        <div className="flex-1 flex flex-col">
          <div className="flex-1">
            <h3 className="text-2xl font-semibold text-white">
              {name}
            </h3>
            <p className="mt-3 text-neutral-400">
              {description}
            </p>

            <div className="mt-6 mb-8 border-b border-neutral-800 pb-8">
              <span className="text-5xl font-bold text-white">
                ₹{price}
              </span>
              <span className="ml-2 text-neutral-500">
                / one-time
              </span>
            </div>

            <ul className="space-y-4">
              {features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <Check className={`w-5 h-5 mr-3 flex-shrink-0 mt-0.5 ${isPopular ? 'text-blue-400' : 'text-neutral-500'}`} />
                  <span className="text-neutral-300">
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
              className={`w-full h-12 text-sm font-semibold rounded-lg transition-all duration-300 flex items-center justify-center relative overflow-hidden group ${
                isPopular
                  ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white hover:opacity-90"
                  : "bg-neutral-800 text-neutral-200 border border-neutral-700 hover:bg-neutral-700 hover:text-white"
              } ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
            >
              {loading ? "Processing..." : `Get ${name}`}
            </button>
          </div>
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

      // Ensure Razorpay is loaded
      await loadRazorpay();

      // 2. Razorpay Checkout options
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || window.RAZORPAY_KEY_ID || "",
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
          color: "#4F46E5", // A nice indigo color for Razorpay modal
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
            router.push("/billing/cancel");
          },
        },
      };

      if (typeof window.Razorpay === "undefined") {
        console.error("Razorpay script failed to load");
        throw new Error(
          "Payment system could not be initialized. Please try again or contact support."
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
      price: 50,
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
      price: 80,
      description: "Ideal for professional developers and teams.",
      features: [
        "200 schema generations",
        "Advanced SQL export options",
        "Advanced ER diagram visualization",
        "Priority email support",
      ],
      isPopular: true,
    },
  ];

  if (!isSignedIn) {
    return (
      <PageTemplate>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 bg-black text-white">
          <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-neutral-400">
            Please Sign In
          </h2>
          <p className="mt-4 max-w-md text-neutral-400">
            You need to create an account or sign in to purchase a plan and
            manage your subscription.
          </p>
          <Link
            href="/sign-in"
            className="mt-8 inline-flex items-center justify-center h-12 px-8 font-medium text-black bg-white rounded-lg shadow-lg hover:bg-neutral-200 transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-2 focus:ring-offset-black"
          >
            Sign In
          </Link>
        </div>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate>
      <PaymentDependentPage>
        <section className="bg-black text-white py-20 sm:py-28 px-4">
          <div 
            className="absolute inset-0 h-full w-full bg-neutral-950 bg-[radial-gradient(#1f1f1f_1px,transparent_1px)] [background-size:32px_32px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] -z-10">
          </div>
        <div className="max-w-6xl mx-auto">
          {/* --- HEADER --- */}
          <div className="text-center mb-16">
            <h1 className="text-5xl sm:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-neutral-400 pb-2">
              Simple, Transparent Pricing
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-neutral-400">
              Every user gets 10 free schema generations. Purchase a credit pack
              when you need more. No subscriptions, no hidden fees.
            </p>
          </div>

          {/* --- USER STATUS --- */}
          {userStatus && (
            <div className="mb-12 p-6 border border-neutral-800 rounded-2xl bg-neutral-950/50 shadow-lg">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                  <h3 className="text-xl font-bold text-white">
                    Your Account Status
                  </h3>
                  <div className={`mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${userStatus.isPro ? 'bg-purple-500/10 text-purple-300' : 'bg-neutral-800 text-neutral-300'}`}>
                    {userStatus.isPro ? "Premium User" : "Free User"}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
                  <div className="text-center bg-neutral-900 p-4 rounded-lg border border-neutral-800">
                    <div className="text-3xl font-bold text-white">
                      {userStatus.freeTrialCount}{" "}
                      <span className="text-lg text-neutral-400">
                        / {userStatus.freeTrialLimit}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-500 mt-1">
                      Free Trials Used
                    </p>
                  </div>
                  <div className="text-center bg-neutral-900 p-4 rounded-lg border border-neutral-800">
                    <div className="text-3xl font-bold text-white">
                      {userStatus.paidSchemaCredits}
                    </div>
                    <p className="text-sm text-neutral-500 mt-1">
                      Purchased Credits
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* --- ERROR MESSAGE --- */}
          {error && (
            <div className="mb-12 flex items-center p-4 border border-red-500/30 bg-red-900/20 text-red-300 rounded-lg">
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
      </PaymentDependentPage>
    </PageTemplate>
  );
}