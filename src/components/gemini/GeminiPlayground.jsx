"use client";

import { useState, useEffect, useRef } from 'react';
import mermaid from 'mermaid';
import toast from 'react-hot-toast';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { InputPanel } from './InputPanel';
import { OutputPanel } from './OutputPanel';
import { useSchemaContext } from '@/contexts/SchemaContext';

// --- Mermaid Black & White Theme Configuration (Unchanged) ---
mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  securityLevel: 'loose',
  fontFamily: 'monospace',
  er: {
    diagramPadding: 20,
    entityPadding: 15,
    stroke: '#999999',
    fill: '#171717',
    entityStroke: '#666666',
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

import QueryPlayground from '../QueryPlayground';

export default function GeminiPlayground() {
  const [inputText, setInputText] = useState('');
  const [mermaidCode, setMermaidCode] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('schema'); // 'schema' or 'query'
  const { setCurrentSchema } = useSchemaContext();
  const lastParsedMermaidRef = useRef('');

  // Parse Mermaid code and convert to schema format when mermaidCode changes
  useEffect(() => {
    // Only parse if mermaidCode has changed from the last parsed version
    if (mermaidCode && 
        mermaidCode.trim().startsWith('erDiagram') && 
        mermaidCode !== lastParsedMermaidRef.current) {
      const parsedSchema = parseMermaidToSchema(mermaidCode);
      if (parsedSchema) {
        setCurrentSchema(parsedSchema);
        lastParsedMermaidRef.current = mermaidCode;
      }
    }
  }, [mermaidCode]); // Removed setCurrentSchema from dependencies

  // Function to parse Mermaid ER diagram code into schema format
  const parseMermaidToSchema = (mermaidCode) => {
    try {
      const lines = mermaidCode.split('\n').filter(line => line.trim());
      const tables = [];
      const relationships = [];
      let currentTable = null;

      for (const line of lines) {
        const trimmedLine = line.trim();
        
        // Skip erDiagram declaration and comments
        if (trimmedLine === 'erDiagram' || trimmedLine.startsWith('%%')) continue;

        // Parse relationships (e.g., USERS ||--o{ ORDERS : places)
        const relMatch = trimmedLine.match(/(\w+)\s+([\|\}][\|\o]--[\|\o][\|\{])\s+(\w+)\s*:\s*(.+)/);
        if (relMatch) {
          const [, fromTable, relType, toTable, description] = relMatch;
          let type = 'one-to-many';
          if (relType.includes('||') && relType.includes('||')) type = 'one-to-one';
          else if (relType.includes('}') && relType.includes('{')) type = 'many-to-many';
          
          relationships.push({
            fromTable,
            toTable,
            type,
            description: description.trim()
          });
          continue;
        }

        // Parse table definition (e.g., USERS {)
        const tableMatch = trimmedLine.match(/^(\w+)\s*\{/);
        if (tableMatch) {
          currentTable = {
            name: tableMatch[1],
            columns: []
          };
          continue;
        }

        // End of table definition
        if (trimmedLine === '}' && currentTable) {
          tables.push(currentTable);
          currentTable = null;
          continue;
        }

        // Parse column definition (e.g., int user_id PK)
        if (currentTable) {
          const columnMatch = trimmedLine.match(/(\w+)\s+(\w+)(?:\s+(PK|FK|UK))?/);
          if (columnMatch) {
            const [, dataType, columnName, constraint] = columnMatch;
            currentTable.columns.push({
              name: columnName,
              dataType: dataType,
              isPrimaryKey: constraint === 'PK',
              isForeignKey: constraint === 'FK',
              isUnique: constraint === 'UK',
              isNullable: !constraint
            });
          }
        }
      }

      // Add any remaining table
      if (currentTable) {
        tables.push(currentTable);
      }

      return {
        name: 'Gemini Generated Schema',
        tables,
        relationships
      };
    } catch (error) {
      console.error('Error parsing Mermaid code:', error);
      return null;
    }
  };

  const handleSubmit = async () => {
    // Logic remains unchanged
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
    // Main wrapper: min-height of screen, flexbox layout, and responsive padding.
    // Increased top padding to better separate from a fixed navbar.
    <main className="flex min-h-screen w-full flex-col bg-black p-4 pt-20 sm:p-6 sm:pt-24 lg:p-8 lg:pt-28">
      
      {/* Centered content container with a larger vertical gap */}
      <div className="mx-auto flex w-full max-w-screen-2xl flex-grow flex-col gap-y-8">
        
        {/* Header Section with Tabs */}
        <div className="flex-shrink-0 space-y-6">
          <h1 className="text-3xl font-bold tracking-tighter text-white sm:text-4xl lg:text-5xl">
            Gemini AI Playground
          </h1>
          
          {/* Tab Navigation */}
          <div className="flex gap-2 border-b border-neutral-800">
            <button
              onClick={() => setActiveTab('schema')}
              className={`px-6 py-3 font-semibold transition-all duration-200 border-b-2 ${
                activeTab === 'schema'
                  ? 'text-white border-white'
                  : 'text-neutral-400 border-transparent hover:text-neutral-300'
              }`}
            >
              Schema Generator
            </button>
            <button
              onClick={() => setActiveTab('query')}
              className={`px-6 py-3 font-semibold transition-all duration-200 border-b-2 ${
                activeTab === 'query'
                  ? 'text-white border-white'
                  : 'text-neutral-400 border-transparent hover:text-neutral-300'
              }`}
            >
              Query Playground
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-grow min-h-0">
          {activeTab === 'schema' ? (
            <ResizablePanelGroup
              direction="horizontal"
              className="h-full rounded-2xl border border-neutral-800 bg-[#0A0A0A] shadow-lg shadow-black/40"
            >
              <ResizablePanel defaultSize={35} minSize={25} maxSize={50}>
                <InputPanel
                  inputText={inputText}
                  setInputText={setInputText}
                  isGenerating={isGenerating}
                  onSubmit={handleSubmit}
                />
              </ResizablePanel>
              
              {/* Handle: Improved interactive states for hover and dragging */}
              <ResizableHandle 
                withHandle 
                className="bg-transparent border-x border-neutral-800 transition-colors duration-200 data-[state=hover]:border-neutral-600 data-[state=dragging]:border-white" 
              />
              
              <ResizablePanel defaultSize={65} minSize={50}>
                <OutputPanel
                  mermaidCode={mermaidCode}
                  isGenerating={isGenerating}
                />
              </ResizablePanel>
            </ResizablePanelGroup>
          ) : (
            <QueryPlayground />
          )}
        </div>
      </div>
    </main>
  );
}