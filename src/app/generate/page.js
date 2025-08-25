// src/app/generate/page.js
"use client";

import { useState, useEffect } from 'react';
import { useUser } from "@clerk/nextjs";
import { SchemaProvider } from '@/contexts/SchemaContext';
import PromptInputPanel from '@/components/PromptInputPanel';
import SchemaVisualization from '@/components/SchemaVisualization';
import ExportDialog from '@/components/ExportDialog';
import PageTemplate from '@/components/PageTemplate';
import WorkspaceLayout from '@/components/WorkspaceLayout';
import RouteProtection from '@/components/RouteProtection';
import { PaymentDependentPage } from '@/lib/paymentUtils';
import { Loader2 } from 'lucide-react';

/**
 * This new component fetches and manages its own subscription data,
 * eliminating the need for SubscriptionLoaderContext. It then passes
 * the data down to its children as props.
 */
const SubscriptionAwareWorkspace = () => {
  const { isSignedIn, isLoaded: isUserLoaded } = useUser();
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Data fetching logic
  useEffect(() => {
    async function fetchSubscriptionData() {
      if (!isUserLoaded) return;
      if (!isSignedIn) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      try {
        const cacheBuster = new Date().getTime();
        const response = await fetch(`/api/user/status?t=${cacheBuster}`);
        if (!response.ok) {
          throw new Error('Failed to load subscription data for workspace');
        }
        const data = await response.json();
        setSubscriptionData(data);
      } catch (err) {
        console.error('Error loading subscription data:', err);
        setError(err.message);
      } finally {
        setTimeout(() => setIsLoading(false), 300);
      }
    }
    fetchSubscriptionData();
  }, [isSignedIn, isUserLoaded]);

  // Render a loading state while fetching subscription info.
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="h-10 w-10 text-blue-500 animate-spin mb-4" />
          <p className="text-white text-lg">Loading user credits...</p>
      </div>
    );
  }
  
  // Render an error state if fetching fails.
  if (error) {
     return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center text-white px-4">
            <h3 className="text-xl font-semibold">Failed to Load Workspace</h3>
            <p className="text-neutral-400 mt-2">Could not retrieve your subscription data. Please try refreshing the page.</p>
            <p className="text-xs text-neutral-500 mt-4">Error: {error}</p>
        </div>
     );
  }

  // Once data is loaded, render the workspace.
  return (
    <SchemaProvider subscriptionData={subscriptionData}>
      <WorkspaceLayout
        subscriptionData={subscriptionData}
        tools={<PromptInputPanel />}
        visualization={<SchemaVisualization />}
      />
      <ExportDialog />
    </SchemaProvider>
  );
};

// The main page component is now much simpler.
export default function GeneratePage() {
  const [isPageLoaded, setIsPageLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsPageLoaded(true), 300);
    return () => clearTimeout(timer);
  }, []);
  
  if (!isPageLoaded) {
    return (
      <main className="bg-black min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 text-white/30 animate-spin mb-4" />
          <p className="text-white/70 text-lg">Loading workspace...</p>
        </div>
      </main>
    );
  }
  
  return (
    <RouteProtection>
      <main className="bg-[#000000] min-h-screen pb-12 sm:pb-16" style={{ "--header-height": "6rem" }}>
        <PageTemplate>
          <PaymentDependentPage fallback={
            <div className="w-full px-3 pb-4 sm:px-6 pt-24">
              <div className="flex flex-col items-center justify-center bg-neutral-900/50 border border-neutral-800 rounded-xl p-8 mt-6 text-center">
                <h2 className="text-2xl font-bold text-white mb-4">Schema Generation Unavailable</h2>
                <p className="text-neutral-400 max-w-lg mb-6">
                  The schema generation system is unavailable because the payment system could not be initialized. 
                  This is required to track your usage and credits.
                </p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="px-6 py-3 bg-neutral-800 hover:bg-neutral-700 text-white rounded-md transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          }>
            {/* The new self-contained component is used here */}
            <SubscriptionAwareWorkspace />
          </PaymentDependentPage>
        </PageTemplate>
      </main>
    </RouteProtection>
  );
}