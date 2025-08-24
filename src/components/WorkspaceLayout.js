// src/components/WorkspaceLayout.js
"use client";

import SubscriptionStatus from './SubscriptionStatus';
import PaywallNotice from './PaywallNotice';
import { useSchemaContext } from '../contexts/SchemaContext';

export default function WorkspaceLayout({ tools, visualization }) {
  const { subscriptionStatus } = useSchemaContext();

  return (
    // Added pt-24 to create space below the fixed navbar
    <div className="w-full px-3 pt-24 pb-4 sm:px-6">
      {/* Subscription status section */}
      <div className="mb-8">
        {subscriptionStatus && (
          <>
            {/* Pass status directly to the component to avoid a second API call */}
            <SubscriptionStatus status={subscriptionStatus} />
            <PaywallNotice 
              freeTrialCount={subscriptionStatus.freeTrialCount} 
              freeTrialLimit={subscriptionStatus.freeTrialLimit}
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