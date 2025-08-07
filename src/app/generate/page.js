"use client";

import { SchemaProvider } from '@/contexts/SchemaContext';
import PromptInputPanel from '@/components/PromptInputPanel';
import SchemaVisualization from '@/components/SchemaVisualization';
import ExportDialog from '@/components/ExportDialog';
import PageTemplate from '@/components/PageTemplate';

export default function GeneratePage() {
  return (
    <PageTemplate>
      <SchemaProvider>
        <div className="flex flex-col">
          {/* Main content with maximized visualization area */}
          <div className="flex-1 w-full px-3 py-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 h-[calc(100vh-8rem)]">
              {/* Left column - Compact Tools panel */}
              <div className="lg:col-span-3 space-y-4 lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto">
                <PromptInputPanel />
              </div>
              
              {/* Right column - Maximized Visualization */}
              <div className="lg:col-span-9 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[70vh] lg:h-full">
                <SchemaVisualization />
              </div>
            </div>
          </div>
          
          {/* Export dialog */}
          <ExportDialog />
        </div>
      </SchemaProvider>
    </PageTemplate>
  );
}
