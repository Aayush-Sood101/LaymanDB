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
      {/* This <main> tag acts as the new root for the page, setting a */}
      {/* black background that covers the entire screen height with proper footer spacing */}
      <main className="bg-[#000000] min-h-screen pb-12 sm:pb-16" style={{ "--header-height": "6rem" }}>
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