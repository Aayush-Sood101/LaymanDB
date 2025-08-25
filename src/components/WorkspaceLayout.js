// src/components/WorkspaceLayout.js
"use client";

import SubscriptionStatus from './SubscriptionStatus';
import PaywallNotice from './PaywallNotice';
import { useSchemaContext } from '../contexts/SchemaContext';

export default function WorkspaceLayout({ tools, visualization, subscriptionData }) {
  const { subscriptionStatus } = useSchemaContext();
  const status = subscriptionStatus || subscriptionData;

  if (!status) {
    return (
      <div className="w-full px-3 pt-24 pb-4 sm:px-6">
        <div className="mb-8 text-white">Loading subscription status...</div>
      </div>
    );
  }

  return (
    <div className="w-full px-3 pt-24 pb-4 sm:px-6">
      
      <div className="mb-8">
        <SubscriptionStatus status={status} />
        <PaywallNotice 
          freeTrialCount={status.freeTrialCount} 
          freeTrialLimit={status.freeTrialLimit}
        />
      </div>
      
      {/* MODIFICATION: Reduced the gap between columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* MODIFICATION: Left column is now narrower to maximize visualization space */}
        <div className="lg:col-span-3 lg:sticky lg:top-24 lg:self-start">
          <div className="
            space-y-4 
            lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto
            [&::-webkit-scrollbar]:w-2
            [&::-webkit-scrollbar-track]:bg-transparent
            [&::-webkit-scrollbar-thumb]:rounded-full
            [&::-webkit-scrollbar-thumb]:bg-neutral-700
            hover:[&::-webkit-scrollbar-thumb]:bg-neutral-600
          ">
            {tools}
          </div>
        </div>
        
        {/* MODIFICATION: Right column is now wider */}
        <div className="mt-6 lg:mt-0 lg:col-span-9 bg-black rounded-2xl shadow-lg border border-neutral-800 overflow-hidden min-h-[500px] lg:min-h-full h-full">
          {visualization}
        </div>
      </div>
    </div>
  );
}