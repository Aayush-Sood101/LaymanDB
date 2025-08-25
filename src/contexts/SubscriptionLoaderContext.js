"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import { useUser } from "@clerk/nextjs";
import { Loader2 } from 'lucide-react';

// Create a context for the subscription data
const SubscriptionLoaderContext = createContext(null);

export function SubscriptionLoaderProvider({ children }) {
  const { isSignedIn, isLoaded: isUserLoaded } = useUser();
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fetch subscription status when the component mounts and user is signed in
  useEffect(() => {
    async function fetchData() {
      if (!isUserLoaded) return;
      
      // If user is not signed in, we can skip loading subscription data
      if (!isSignedIn) {
        setIsLoading(false);
        return;
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
      } catch (err) {
        console.error('Error loading subscription data:', err);
        setError(err.message);
      } finally {
        // Add a small delay to prevent flicker
        setTimeout(() => {
          setIsLoading(false);
        }, 300);
      }
    }
    
    fetchData();
  }, [isSignedIn, isUserLoaded]);
  
  // If user data is not yet loaded, show the children with an overlay
  if (!isUserLoaded) {
    return (
      <>
        {children}
        <div className="fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-50">
          <div className="flex flex-col items-center p-8 bg-neutral-900 rounded-xl border border-neutral-800 shadow-2xl">
            <Loader2 className="h-12 w-12 text-blue-500 animate-spin mb-4" />
            <p className="text-white text-lg font-medium">Loading user data...</p>
            <p className="text-neutral-400 text-sm mt-2">Please wait a moment</p>
          </div>
        </div>
      </>
    );
  }
  
  // If subscription data is loading, show the children with an overlay
  if (isLoading && isSignedIn) {
    return (
      <>
        {children}
        <div className="fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-50">
          <div className="flex flex-col items-center p-8 bg-neutral-900 rounded-xl border border-neutral-800 shadow-2xl">
            <Loader2 className="h-12 w-12 text-blue-500 animate-spin mb-4" />
            <p className="text-white text-lg font-medium">Loading subscription data...</p>
            <p className="text-neutral-400 text-sm mt-2">Please wait a moment</p>
          </div>
        </div>
      </>
    );
  }
  
  // If there was an error loading subscription data, let's still render the children
  // The error will be handled by the individual components that need subscription data
  
  return (
    <SubscriptionLoaderContext.Provider value={{ subscriptionData, isLoading, error, refresh: () => setIsLoading(true) }}>
      {children}
    </SubscriptionLoaderContext.Provider>
  );
}

// Hook to use the subscription loader context
export function useSubscriptionLoader() {
  const context = useContext(SubscriptionLoaderContext);
  if (!context) {
    throw new Error('useSubscriptionLoader must be used within a SubscriptionLoaderProvider');
  }
  return context;
}
