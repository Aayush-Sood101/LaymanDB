"use client";

import { useState } from 'react';
import mermaid from 'mermaid';
import toast from 'react-hot-toast';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { InputPanel } from './InputPanel';
import { OutputPanel } from './OutputPanel';

// --- Mermaid Black & White Theme Configuration ---
mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  securityLevel: 'loose',
  fontFamily: 'monospace',
  er: {
    diagramPadding: 20,
    entityPadding: 15,
    stroke: '#999999', // neutral-400
    fill: '#171717',   // neutral-900
    entityStroke: '#666666', // neutral-500
  },
  themeVariables: {
    background: '#000000',
    primaryColor: '#171717',
    primaryTextColor: '#ffffff',
    primaryBorderColor: '#444444',
    lineColor: '#666666',
    fontSize: '14px',
    nodeBorder: '#444444',
    mainBkg: '#171717',
    clusterBkg: '#171717',
    titleColor: '#ffffff',
    edgeLabelBackground: '#222222',
  },
});

export default function GeminiPlayground() {
  const [inputText, setInputText] = useState('');
  const [mermaidCode, setMermaidCode] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSubmit = async () => {
    // Logic is unchanged
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
    <main className="flex h-dvh w-full flex-col bg-black text-white p-4 sm:p-6 lg:p-8 font-sans">
      <div className="flex w-full max-w-screen-2xl mx-auto flex-col gap-y-6 flex-grow min-h-0">
        <div className="flex-shrink-0">
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-white">
            Gemini AI Playground
          </h1>
          <p className="text-neutral-400 mt-2">
            Describe your database schema in plain English. Let Gemini generate a styled Mermaid ER diagram for you.
          </p>
        </div>

        <div className="flex-grow min-h-0">
          <ResizablePanelGroup
            direction="horizontal"
            className="h-full rounded-lg border border-neutral-800 bg-[#0A0A0A] overflow-hidden"
          >
            <ResizablePanel defaultSize={35} minSize={25} maxSize={50}>
              <InputPanel
                inputText={inputText}
                setInputText={setInputText}
                isGenerating={isGenerating}
                onSubmit={handleSubmit}
              />
            </ResizablePanel>
            <ResizableHandle withHandle className="bg-transparent border-x border-neutral-800" />
            <ResizablePanel defaultSize={65} minSize={50}>
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