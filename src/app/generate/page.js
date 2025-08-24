// src/app/generate/page.js
"use client";

import { useState, useEffect } from 'react';
import { SchemaProvider } from '@/contexts/SchemaContext';
import PromptInputPanel from '@/components/PromptInputPanel';
import SchemaVisualization from '@/components/SchemaVisualization';
import ExportDialog from '@/components/ExportDialog';
import PageTemplate from '@/components/PageTemplate';
import WorkspaceLayout from '@/components/WorkspaceLayout';
import RouteProtection from '@/components/RouteProtection';
import { PaymentDependentPage } from '@/lib/paymentUtils';
import { Loader2 } from 'lucide-react';

export default function GeneratePage() {
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  
  // Add a slight delay to ensure smooth page transitions
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageLoaded(true);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Show a loading state while the page is initializing
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
      {/* This <main> tag acts as the new root for the page, setting a */}
      {/* black background that covers the entire screen height with proper footer spacing */}
      <main className="bg-[#000000] min-h-screen pb-12 sm:pb-16" style={{ "--header-height": "6rem" }}>
        <PageTemplate>
          <PaymentDependentPage fallback={
            <div className="w-full px-3 pb-4 sm:px-6 pt-24">
              <div className="flex flex-col items-center justify-center bg-neutral-900/50 border border-neutral-800 rounded-xl p-8 mt-6 text-center">
                <h2 className="text-2xl font-bold text-white mb-4">Schema Generation Unavailable</h2>
                <p className="text-neutral-400 max-w-lg mb-6">
                  The schema generation system is currently unavailable because the payment system could not be initialized.
                  This is required to properly track your usage and credits.
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
            <SchemaProvider>
              <WorkspaceLayout
                tools={<PromptInputPanel />}
                visualization={<SchemaVisualization />}
              />
              <ExportDialog />
            </SchemaProvider>
          </PaymentDependentPage>
        </PageTemplate>
      </main>
    </RouteProtection>
  );
}