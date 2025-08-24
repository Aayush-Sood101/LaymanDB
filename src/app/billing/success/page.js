"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PageTemplate from "../../../components/PageTemplate";
import { CheckCircle2 } from "lucide-react"; // Using a consistent icon from lucide-react

export default function PaymentSuccessPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push("/generate"); // Redirect to schema generation page
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
            <CheckCircle2 className="h-16 w-16 text-green-400" />
            <h1 className="text-4xl sm:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-neutral-400 pb-2">
              Payment Successful!
            </h1>
            <p className="max-w-sm text-base text-neutral-400">
              Thank you for your purchase. Your account has been updated with additional credits.
            </p>
          </div>

          <div className="pt-4">
            <p className="text-sm text-neutral-500">
              Redirecting you to the workspace in {countdown} seconds...
            </p>
          </div>

          <div className="pt-2 flex justify-center items-center gap-4">
            <Link
              href="/generate"
              className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-white bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-md hover:opacity-90 transition-opacity duration-200"
            >
              Go to Workspace
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