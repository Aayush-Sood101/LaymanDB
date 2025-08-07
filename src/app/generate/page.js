// src/app/generate/page.js
"use client";

import { SchemaProvider } from '@/contexts/SchemaContext';
import PromptInputPanel from '@/components/PromptInputPanel';
import SchemaVisualization from '@/components/SchemaVisualization';
import ExportDialog from '@/components/ExportDialog';
import PageTemplate from '@/components/PageTemplate';
import WorkspaceLayout from '@/components/WorkspaceLayout';

export default function GeneratePage() {
  return (
    <PageTemplate>
      <SchemaProvider>
        <WorkspaceLayout
          tools={<PromptInputPanel />}
          visualization={<SchemaVisualization />}
        />
        <ExportDialog />
      </SchemaProvider>
    </PageTemplate>
  );
}