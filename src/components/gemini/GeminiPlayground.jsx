"use client";

import { useState, useEffect, useRef } from 'react';
import mermaid from 'mermaid';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { IconLoader2, IconBraces, IconDownload } from '@tabler/icons-react';
import toast from 'react-hot-toast';

// Configure mermaid
mermaid.initialize({
  startOnLoad: true,
  theme: 'neutral',
  securityLevel: 'loose',
  fontFamily: 'monospace',
  er: {
    diagramPadding: 20,
    entityPadding: 15,
    fill: '#f9f9f9',
    stroke: '#999999',
  },
  themeVariables: {
    lineColor: '#999999',
    primaryColor: '#4f46e5',
    primaryTextColor: '#11181C',
    primaryBorderColor: '#4f46e5',
    background: '#ffffff',
    secondaryColor: '#f9fafb',
    tertiaryColor: '#ffffff',
  }
});

export default function GeminiPlayground() {
  const [inputText, setInputText] = useState('');
  const [mermaidCode, setMermaidCode] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const mermaidRef = useRef(null);

  // Effect to initialize Mermaid whenever the code changes
  useEffect(() => {
    if (mermaidCode && mermaidRef.current) {
      try {
        // Clear previous content
        mermaidRef.current.innerHTML = '';
        
        // Create a fresh div for the new diagram
        const diagramDiv = document.createElement('div');
        diagramDiv.className = 'mermaid';
        diagramDiv.textContent = mermaidCode;
        mermaidRef.current.appendChild(diagramDiv);
        
        // Re-render the diagram with a try-catch to handle syntax errors
        mermaid.init(undefined, '.mermaid')
          .catch(error => {
            console.error('Error in mermaid initialization:', error);
            toast.error('Error rendering diagram. Please try a simpler description.');
            mermaidRef.current.innerHTML = '<div class="p-4 text-red-500">Error rendering Mermaid diagram. Please try a simpler description.</div>';
          });
      } catch (error) {
        console.error('Error rendering Mermaid diagram:', error);
        toast.error('Error rendering diagram. Please check the generated code.');
      }
    }
  }, [mermaidCode]);

  const handleSubmit = async () => {
    if (!inputText.trim()) {
      toast.error('Please enter a database description');
      return;
    }

    setIsGenerating(true);
    setMermaidCode(''); // Clear previous result
    
    try {
      // Set a timeout to abort the request if it takes too long
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout
      
      const response = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input: inputText }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to generate ER diagram');
      }
      
      // Validate that the Mermaid code starts with erDiagram
      const mermaidCode = data.mermaidCode.trim();
      if (!mermaidCode.startsWith('erDiagram')) {
        throw new Error('Invalid Mermaid ER diagram format. Please try again.');
      }
      
      setMermaidCode(mermaidCode);
      toast.success('ER diagram generated successfully');
    } catch (error) {
      console.error('Error generating ER diagram:', error);
      
      if (error.name === 'AbortError') {
        toast.error('Request timed out. Try a simpler description or try again later.');
      } else {
        toast.error(error.message || 'Failed to generate ER diagram');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!mermaidCode) {
      toast.error('No diagram to download');
      return;
    }
    
    // Create a blob and trigger download
    const blob = new Blob([mermaidCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'er_diagram.mmd';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Diagram code downloaded');
  };

  return (
    <div className="flex flex-col w-full h-full min-h-screen bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100">
      <div className="container mx-auto px-4 py-8 flex-1 flex flex-col gap-6">
        <div className="flex flex-col space-y-1.5">
          <h2 className="text-2xl font-bold">Gemini Playground</h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Describe your database schema in plain English and let Google Gemini generate a Mermaid ER diagram
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1">
          {/* Input Panel */}
          <div className="flex flex-col space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Input</h3>
              <Button 
                onClick={handleSubmit} 
                disabled={isGenerating || !inputText.trim()}
                className="gap-2"
              >
                {isGenerating ? (
                  <IconLoader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <IconBraces className="h-4 w-4" />
                )}
                {isGenerating ? 'Generating...' : 'Generate Diagram'}
              </Button>
            </div>
            
            <Textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Describe your database schema here..."
              className="flex-1 min-h-[400px] p-4 font-mono text-sm"
            />
            
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Example: "Create a database for an e-commerce platform with customers, products, orders, and reviews"
            </p>
          </div>

          {/* Output Panel */}
          <div className="flex flex-col space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Generated ER Diagram</h3>
              {mermaidCode && (
                <Button 
                  variant="outline" 
                  onClick={handleDownload} 
                  className="gap-2"
                >
                  <IconDownload className="h-4 w-4" />
                  Download Code
                </Button>
              )}
            </div>
            
            <div className="flex-1 border rounded-md bg-neutral-50 dark:bg-neutral-800 overflow-hidden">
              {mermaidCode ? (
                <div className="h-full flex flex-col">
                  {/* Diagram Visualization */}
                  <div className="flex-1 p-4 overflow-auto">
                    <div ref={mermaidRef} className="mermaid">
                      {mermaidCode}
                    </div>
                  </div>
                  
                  <Separator />
                  
                  {/* Code View */}
                  <div className="h-1/3 overflow-auto">
                    <pre className="p-4 text-xs font-mono">
                      {mermaidCode}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center p-8 text-neutral-400">
                  {isGenerating ? (
                    <div className="flex flex-col items-center gap-2">
                      <IconLoader2 className="h-6 w-6 animate-spin" />
                      <p>Generating diagram...</p>
                    </div>
                  ) : (
                    <p>Your ER diagram will appear here</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}