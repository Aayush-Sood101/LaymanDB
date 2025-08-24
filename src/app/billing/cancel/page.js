"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PageTemplate from "../../../components/PageTemplate";
import { AlertTriangle } from "lucide-react"; // Using a more consistent icon

export default function PaymentCancelPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Redirecting to the updated pricing page path
          router.push("/pricing"); 
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <PageTemplate>
      <div className="bg-black text-white min-h-[80vh] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          
          <div className="flex flex-col items-center gap-6">
            <AlertTriangle className="h-16 w-16 text-amber-400" />
            <h1 className="text-4xl sm:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-neutral-400 pb-2">
              Payment Cancelled
            </h1>
            <p className="max-w-sm text-base text-neutral-400">
              Your payment process was cancelled or did not complete. Don't worry, no charges were made to your account.
            </p>
          </div>

          <div className="pt-4">
            <p className="text-sm text-neutral-500">
              Redirecting you to the pricing page in {countdown} seconds...
            </p>
          </div>

          <div className="pt-2 flex justify-center items-center gap-4">
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-white bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-md hover:opacity-90 transition-opacity duration-200"
            >
              Try Again
            </Link>
            <Link
              href="/home"
              className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-neutral-200 bg-neutral-800/50 border border-neutral-700 rounded-lg hover:bg-neutral-800 transition-colors"
            >
              Go to Home
            </Link>
          </div>

        </div>
      </div>
    </PageTemplate>
  );
}