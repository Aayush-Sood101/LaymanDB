"use client";

import { useState, useEffect } from 'react';

// Function to check if the Razorpay integration is ready
export const usePaymentAPIStatus = () => {
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function checkPaymentAPI() {
      try {
        setIsLoading(true);
        
        // 1. Check if the Razorpay script can be loaded
        const scriptPromise = new Promise((resolve, reject) => {
          if (window.Razorpay) {
            return resolve(true);
          }
          
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.onload = () => resolve(true);
          script.onerror = () => reject(new Error("Failed to load payment script"));
          document.body.appendChild(script);
        });
        
        // 2. Check if the payment API route is available
        const apiPromise = fetch('/api/payment/health-check', {
          method: 'HEAD',
          cache: 'no-store'
        }).then(response => {
          if (!response.ok) {
            throw new Error("Payment API is not available");
          }
          return true;
        }).catch(error => {
          // If the health-check endpoint doesn't exist, we'll try the main payment endpoint
          return fetch('/api/payment', {
            method: 'HEAD',
            cache: 'no-store'
          }).then(response => {
            if (!response.ok) {
              throw new Error("Payment API is not available");
            }
            return true;
          });
        });
        
        // Wait for both checks to complete or fail
        await Promise.all([scriptPromise, apiPromise]);
        
        setIsReady(true);
        setError(null);
      } catch (err) {
        console.error("Payment system not available:", err);
        setError(err.message);
        setIsReady(false);
      } finally {
        setIsLoading(false);
      }
    }
    
    checkPaymentAPI();
  }, []);
  
  return { isReady, isLoading, error };
};

// Component to handle loading states for payment-dependent pages
export function PaymentDependentPage({ children, fallback }) {
  const { isReady, isLoading, error } = usePaymentAPIStatus();
  const [showContent, setShowContent] = useState(false);
  
  // Add a slight delay before showing content to avoid flicker
  useEffect(() => {
    if (isReady && !isLoading) {
      // Delay showing content to ensure smooth transition
      const timer = setTimeout(() => {
        setShowContent(true);
      }, 100);
      
      return () => clearTimeout(timer);
    } else {
      setShowContent(false);
    }
  }, [isReady, isLoading]);
  
  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-black text-white">
        <div className="p-8 bg-neutral-900 rounded-xl border border-neutral-800 shadow-2xl">
          <div className="w-12 h-12 rounded-full border-4 border-neutral-800 border-t-blue-500 animate-spin mb-4 mx-auto"></div>
          <p className="text-lg font-medium text-white">Loading payment system...</p>
          <p className="text-sm text-neutral-500 mt-2">This may take a moment</p>
        </div>
      </div>
    );
  }
  
  if (error || !isReady) {
    return fallback || (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-black text-white px-4">
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6 max-w-md w-full">
          <h2 className="text-xl font-bold text-white mb-3">Payment System Unavailable</h2>
          <p className="text-neutral-300 mb-6">
            We're unable to load the payment system at this time. This could be due to:
          </p>
          <ul className="list-disc list-inside text-neutral-400 mb-6 space-y-2">
            <li>Network connectivity issues</li>
            <li>Payment service maintenance</li>
            <li>Server configuration issues</li>
          </ul>
          <p className="text-sm text-neutral-500 mb-4">
            Error details: {error || "Failed to initialize payment system"}
          </p>
          <div className="flex justify-center">
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-md transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // Only render children when showContent is true
  return showContent ? children : (
    <div className="min-h-[60vh] flex flex-col items-center justify-center bg-black text-white">
      <div className="p-8 bg-neutral-900 rounded-xl border border-neutral-800 shadow-2xl">
        <div className="w-12 h-12 rounded-full border-4 border-neutral-800 border-t-blue-500 animate-spin mb-4 mx-auto"></div>
        <p className="text-lg font-medium text-white">Preparing workspace...</p>
        <p className="text-sm text-neutral-500 mt-2">Almost ready</p>
      </div>
    </div>
  );
}
