// src/components/WorkspaceLayout.js
"use client";

import { useState } from 'react';
import SubscriptionStatus from './SubscriptionStatus';
import PaywallNotice from './PaywallNotice';
import QueryPlayground from './QueryPlayground';
import { useSchemaContext } from '../contexts/SchemaContext';
import { Button } from './ui/button';
import { Layers, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function WorkspaceLayout({ tools, visualization, subscriptionData }) {
  const { subscriptionStatus } = useSchemaContext();
  const status = subscriptionStatus || subscriptionData;
  const [activeTab, setActiveTab] = useState('schema'); // 'schema' or 'query'

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
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-3 lg:sticky lg:top-24 lg:self-start">
          {/* MODIFICATION: Using the plain CSS class 'hide-scrollbar' */}
          <div className="
            space-y-4 
            lg:max-h-[calc(100vh-8rem)] 
            lg:overflow-y-auto 
            hide-scrollbar
          ">
            {tools}
          </div>
        </div>
        
        <div className="mt-6 lg:mt-0 lg:col-span-9">
          {/* Tab Navigation */}
          <div className="flex gap-2 mb-4">
            <Button
              variant={activeTab === 'schema' ? 'default' : 'outline'}
              onClick={() => setActiveTab('schema')}
              className={cn(
                "flex items-center gap-2",
                activeTab === 'schema' 
                  ? "bg-white text-black" 
                  : "bg-transparent border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:text-white"
              )}
            >
              <Layers className="h-4 w-4" />
              Schema Designer
            </Button>
            <Button
              variant={activeTab === 'query' ? 'default' : 'outline'}
              onClick={() => setActiveTab('query')}
              className={cn(
                "flex items-center gap-2",
                activeTab === 'query' 
                  ? "bg-white text-black" 
                  : "bg-transparent border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:text-white"
              )}
            >
              <Search className="h-4 w-4" />
              Query Playground
            </Button>
          </div>

          {/* Content Area */}
          <div className="bg-black rounded-2xl shadow-lg border border-neutral-800 overflow-hidden min-h-[500px] lg:min-h-full h-full">
            {activeTab === 'schema' ? visualization : <QueryPlayground />}
          </div>
        </div>
      </div>
    </div>
  );
}