// src/components/gemini/GeminiPlayground.jsx

"use client";

import { useState } from 'react';
import mermaid from 'mermaid';
import toast from 'react-hot-toast';

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { InputPanel } from './InputPanel';
import { OutputPanel } from './OutputPanel';

// Import custom styles
import './DiagramStyles.css';

// --- Mermaid Dark Theme Configuration ---
mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  securityLevel: 'loose',
  fontFamily: 'var(--font-geist-mono)',
  er: {
    diagramPadding: 20,
    entityPadding: 15,
    stroke: '#A1A1AA',
    fill: '#18181B',
    entityStroke: '#52525B',
  },
  themeVariables: {
    background: '#09090B',
    primaryColor: '#6D28D9', // Purple
    primaryTextColor: '#FAFAFA',
    primaryBorderColor: '#3F3F46',
    lineColor: '#52525B',
    fontSize: '14px',
    nodeBorder: '#3F3F46',
    mainBkg: '#18181B',
    clusterBkg: '#18181B',
    titleColor: '#FAFAFA',
    edgeLabelBackground: '#27272A',
  },
});

export default function GeminiPlayground() {
  const [inputText, setInputText] = useState('');
  const [mermaidCode, setMermaidCode] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSubmit = async () => {
    if (!inputText.trim()) {
      toast.error('Please enter a database description');
      return;
    }

    setIsGenerating(true);
    setMermaidCode('');

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);

      const response = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: inputText }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const data = await response.json();
      if (!data.success || !data.mermaidCode?.trim().startsWith('erDiagram')) {
        throw new Error(data.error || 'Invalid Mermaid diagram format received.');
      }

      setMermaidCode(data.mermaidCode.trim());
      toast.success('ER diagram generated successfully!');
    } catch (error) {
      console.error('Error generating ER diagram:', error);
      const errorMessage = error.name === 'AbortError'
        ? 'Request timed out. Try a simpler description.'
        : error.message || 'An unknown error occurred.';
      toast.error(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <main className="w-full h-screen flex flex-col px-4 py-4 sm:px-6 bg-[#09090B] overflow-hidden">
      <div className="flex flex-col w-full h-full max-w-screen-2xl mx-auto space-y-4">
        <div className="flex flex-col space-y-2 flex-shrink-0">
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl text-white">Gemini AI Playground</h1>
          <p className="text-[#A1A1AA] text-sm md:text-base">
            Describe your database schema in plain English. Let Gemini generate a styled Mermaid ER diagram for you.
          </p>
        </div>

        <div className="flex-grow min-h-0 w-full">
          <ResizablePanelGroup direction="horizontal" className="h-full border rounded-lg border-[#27272A] bg-[#0A0A0A]">
            <ResizablePanel defaultSize={35} minSize={25} maxSize={50}>
              <InputPanel
                inputText={inputText}
                setInputText={setInputText}
                isGenerating={isGenerating}
                onSubmit={handleSubmit}
              />
            </ResizablePanel>
            <ResizableHandle withHandle className="bg-[#27272A] border-x border-[#3F3F46]" />
            <ResizablePanel defaultSize={65} minSize={50} maxSize={75}>
              <OutputPanel
                mermaidCode={mermaidCode}
                isGenerating={isGenerating}
              />
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </div>
    </main>
  );
}