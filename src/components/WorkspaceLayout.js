// src/components/WorkspaceLayout.js
"use client";

import SubscriptionStatus from './SubscriptionStatus';
import PaywallNotice from './PaywallNotice';
import { useSchemaContext } from '../contexts/SchemaContext';

// The component now accepts `subscriptionData` as a prop and no longer uses the problematic hook.
export default function WorkspaceLayout({ tools, visualization, subscriptionData }) {
  const { subscriptionStatus } = useSchemaContext();

  // We use the data from the context, but fall back to the direct prop if needed.
  const status = subscriptionStatus || subscriptionData;

  // If the status data isn't ready yet, show a simple loading message.
  if (!status) {
    return (
      <div className="w-full px-3 pt-24 pb-4 sm:px-6">
        <div className="mb-8 text-white">Loading subscription status...</div>
      </div>
    );
  }

  return (
    // This is the main layout for your workspace.
    <div className="w-full px-3 pt-24 pb-4 sm:px-6">
      
      {/* Subscription status and paywall notice section */}
      <div className="mb-8">
        <SubscriptionStatus status={status} />
        <PaywallNotice 
          freeTrialCount={status.freeTrialCount} 
          freeTrialLimit={status.freeTrialLimit}
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left column for tools */}
        <div className="lg:col-span-3 lg:sticky lg:top-24 lg:self-start">
          <div className="space-y-4 rounded-2xl border border-neutral-800 bg-neutral-950/50 p-4 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto">
            {tools}
          </div>
        </div>
        
        {/* Right column for visualization */}
        <div className="mt-6 lg:mt-0 lg:col-span-9 bg-black rounded-2xl shadow-lg border border-neutral-800 overflow-hidden min-h-[500px] lg:min-h-full h-full">
          {visualization}
        </div>
      </div>
    </div>
  );
}