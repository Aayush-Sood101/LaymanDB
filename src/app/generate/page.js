// src/app/generate/page.js
"use client";

import { SchemaProvider } from '@/contexts/SchemaContext';
import PromptInputPanel from '@/components/PromptInputPanel';
import SchemaVisualization from '@/components/SchemaVisualization';
import ExportDialog from '@/components/ExportDialog';
import PageTemplate from '@/components/PageTemplate';
import WorkspaceLayout from '@/components/WorkspaceLayout';
import RouteProtection from '@/components/RouteProtection';

export default function GeneratePage() {
  return (
    <RouteProtection>
      {/* --- RECTIFIED CODE --- */}
      {/* This <main> tag acts as the new root for the page, setting a */}
      {/* black background that covers the entire screen height. */}
      <main className="bg-[#000000] min-h-screen">
        <PageTemplate>
          <SchemaProvider>
            <WorkspaceLayout
              tools={<PromptInputPanel />}
              visualization={<SchemaVisualization />}
            />
            <ExportDialog />
          </SchemaProvider>
        </PageTemplate>
      </main>
    </RouteProtection>
  );
}