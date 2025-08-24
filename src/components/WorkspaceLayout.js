// src/components/WorkspaceLayout.js
"use client";

import { useState, useEffect } from 'react';
import SubscriptionStatus from './SubscriptionStatus';
import PaywallNotice from './PaywallNotice';
import { useSchemaContext } from '../contexts/SchemaContext';
import { useSubscriptionLoader } from '../contexts/SubscriptionLoaderContext';
import { Loader2 } from 'lucide-react';

export default function WorkspaceLayout({ tools, visualization }) {
  const { subscriptionStatus } = useSchemaContext();
  const { subscriptionData, isLoading } = useSubscriptionLoader();
  const [isReady, setIsReady] = useState(false);
  
  // Wait for both SchemaContext and SubscriptionLoader to be ready
  useEffect(() => {
    if (!isLoading && (subscriptionStatus || subscriptionData)) {
      // Add a slight delay for smoother transitions
      const timer = setTimeout(() => {
        setIsReady(true);
      }, 100);
      
      return () => clearTimeout(timer);
    } else {
      setIsReady(false);
    }
  }, [isLoading, subscriptionStatus, subscriptionData]);
  
  if (!isReady) {
    return (
      <div className="w-full px-3 pt-24 pb-4 sm:px-6 flex items-center justify-center min-h-[70vh]">
        <div className="flex flex-col items-center">
          <Loader2 className="h-10 w-10 text-white/30 animate-spin mb-4" />
          <p className="text-white/70 text-lg">Loading workspace data...</p>
        </div>
      </div>
    );
  }

  // Use the data from either source, preferring SchemaContext as it may have been updated
  const status = subscriptionStatus || subscriptionData;

  return (
    // Added pt-24 to create space below the fixed navbar
    <div className="w-full px-3 pt-24 pb-4 sm:px-6">
      {/* Subscription status section */}
      <div className="mb-8">
        {status && (
          <>
            {/* Pass status directly to the component to avoid a second API call */}
            <SubscriptionStatus status={status} />
            <PaywallNotice 
              freeTrialCount={status.freeTrialCount} 
              freeTrialLimit={status.freeTrialLimit}
            />
          </>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left column - Tools panel with updated styling */}
        <div className="lg:col-span-3 lg:sticky lg:top-24 lg:self-start">
          <div className="space-y-4 rounded-2xl border border-neutral-800 bg-neutral-950/50 p-4 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto">
            {tools}
          </div>
        </div>
        
        {/* Right column - Visualization with consistent styling */}
        <div className="mt-6 lg:mt-0 lg:col-span-9 bg-black rounded-2xl shadow-lg border border-neutral-800 overflow-hidden min-h-[500px] lg:min-h-full h-full">
          {visualization}
        </div>
      </div>
    </div>
  );
}