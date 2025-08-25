"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import PageTemplate from "../../../components/PageTemplate";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

// Self-contained component with no context dependencies
export default function PaymentSuccessPage() {
  const router = useRouter();
  const { isSignedIn, isLoaded: isUserLoaded } = useUser();
  const [countdown, setCountdown] = useState(5);
  const [verifyingPayment, setVerifyingPayment] = useState(true);
  const [verificationSuccess, setVerificationSuccess] = useState(null);
  const [verificationAttempted, setVerificationAttempted] = useState(false);
  
  // Local state for subscription data
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fetch subscription data directly
  const fetchSubscriptionData = async () => {
    if (!isSignedIn) {
      setIsLoading(false);
      return null;
    }
    
    setIsLoading(true);
    try {
      // Use cache-busting to ensure we get fresh data
      const cacheBuster = new Date().getTime();
      const response = await fetch(`/api/user/status?t=${cacheBuster}`, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to load subscription data');
      }
      
      const data = await response.json();
      setSubscriptionData(data);
      return data;
    } catch (err) {
      console.error('Error loading subscription data:', err);
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Initial data fetch
  useEffect(() => {
    if (isUserLoaded && isSignedIn) {
      fetchSubscriptionData();
    }
  }, [isUserLoaded, isSignedIn]);
  
  // Verify payment success once we have subscription data
  useEffect(() => {
    if (!subscriptionData || verificationAttempted || isLoading) {
      return;
    }
    
    async function verifyPaymentSuccess() {
      try {
        setVerifyingPayment(true);
        setVerificationAttempted(true);
        
        // Refresh data once more to be sure
        const freshData = await fetchSubscriptionData();
        const dataToCheck = freshData || subscriptionData;
        
        // Check if the user has credits
        if (dataToCheck && (dataToCheck.isPro || dataToCheck.paidSchemaCredits > 0)) {
          setVerificationSuccess(true);
        } else {
          setVerificationSuccess(false);
          console.error("Payment verification failed: Subscription status doesn't show credits");
        }
      } catch (error) {
        console.error("Error verifying payment success:", error);
        setVerificationSuccess(false);
      } finally {
        setVerifyingPayment(false);
      }
    }
    
    verifyPaymentSuccess();
  }, [subscriptionData, verificationAttempted, isLoading]);
  
  // Countdown timer
  useEffect(() => {
    if (verificationSuccess === true) {
      const timer = setTimeout(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            router.push("/generate");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [verificationSuccess, router, countdown]);
  
  // Loading state
  if (!isUserLoaded || isLoading) {
    return (
      <PageTemplate>
        <div className="bg-black text-white min-h-[80vh] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8 text-center">
            <div className="flex flex-col items-center gap-6">
              <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />
              <h1 className="text-4xl sm:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-neutral-400 pb-2">
                Loading Your Data
              </h1>
              <p className="max-w-sm text-base text-neutral-400">
                Please wait while we load your account information...
              </p>
            </div>
          </div>
        </div>
      </PageTemplate>
    );
  }
  
  // Verifying payment
  if (verifyingPayment) {
    return (
      <PageTemplate>
        <div className="bg-black text-white min-h-[80vh] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8 text-center">
            <div className="flex flex-col items-center gap-6">
              <div className="w-16 h-16 rounded-full border-4 border-neutral-800 border-t-blue-500 animate-spin"></div>
              <h1 className="text-4xl sm:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-neutral-400 pb-2">
                Verifying Payment
              </h1>
              <p className="max-w-sm text-base text-neutral-400">
                Please wait while we confirm your payment and update your account...
              </p>
            </div>
          </div>
        </div>
      </PageTemplate>
    );
  }
  
  // Verification failed
  if (verificationSuccess === false) {
    return (
      <PageTemplate>
        <div className="bg-black text-white min-h-[80vh] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8 text-center">
            <div className="flex flex-col items-center gap-6">
              <XCircle className="h-16 w-16 text-red-500" />
              <h1 className="text-4xl sm:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-neutral-400 pb-2">
                Payment Issue
              </h1>
              <p className="max-w-sm text-base text-neutral-400">
                We received your payment, but there was an issue updating your account. Please contact support if your credits don't appear soon.
              </p>
            </div>

            <div className="pt-6 flex justify-center items-center gap-4">
              <Link
                href="/generate"
                className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-white bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-md hover:opacity-90 transition-opacity duration-200"
              >
                Go to Workspace
              </Link>
              <button
                onClick={() => {
                  setVerificationAttempted(false);
                  fetchSubscriptionData();
                }}
                className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-neutral-200 bg-neutral-800/50 border border-neutral-700 rounded-lg hover:bg-neutral-800 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </PageTemplate>
    );
  }
  
  // Success
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