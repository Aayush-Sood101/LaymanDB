"use client";

import React, { useState, useEffect } from 'react';
import { useSchemaContext } from '@/contexts/SchemaContext';
import mermaid from 'mermaid';
import { 
  Loader2, 
  Copy, 
  Check, 
  Database, 
  Sparkles,
  History,
  Trash2,
  ChevronDown,
  ChevronUp,
  Terminal,
  Zap,
  Clock,
  AlertCircle,
  Network
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Initialize Mermaid with black & white theme
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

const MermaidQueryPlayground = () => {
  const [question, setQuestion] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedMermaid, setGeneratedMermaid] = useState(null);
  const [renderedDiagram, setRenderedDiagram] = useState(null);
  const [explanation, setExplanation] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [exampleQuestions, setExampleQuestions] = useState([]);
  const [queryHistory, setQueryHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [loadingExamples, setLoadingExamples] = useState(false);
  const [selectedExample, setSelectedExample] = useState(null);
  
  const { currentSchema } = useSchemaContext();

  // Load query history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('mermaidQueryHistory');
    if (savedHistory) {
      try {
        setQueryHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Failed to load query history:', e);
      }
    }
  }, []);

  // Save query history to localStorage
  useEffect(() => {
    if (queryHistory.length > 0) {
      localStorage.setItem('mermaidQueryHistory', JSON.stringify(queryHistory));
    }
  }, [queryHistory]);

  // Load example questions when schema changes
  useEffect(() => {
    if (currentSchema && currentSchema.tables && currentSchema.tables.length > 0) {
      loadExampleQuestions();
    }
  }, [currentSchema]);

  // Render Mermaid diagram when code changes
  useEffect(() => {
    if (generatedMermaid) {
      renderMermaidDiagram(generatedMermaid);
    }
  }, [generatedMermaid]);

  const loadExampleQuestions = async () => {
    if (!currentSchema) return;
    
    setLoadingExamples(true);
    try {
      const response = await fetch('/api/mermaid-query/examples', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ schema: currentSchema }),
      });

      if (!response.ok) {
        throw new Error('Failed to load example questions');
      }

      const data = await response.json();
      if (data.success && data.examples) {
        setExampleQuestions(data.examples);
      }
    } catch (err) {
      console.error('Error loading examples:', err);
    } finally {
      setLoadingExamples(false);
    }
  };

  const renderMermaidDiagram = async (mermaidCode) => {
    try {
      const id = `mermaid-${Date.now()}`;
      const { svg } = await mermaid.render(id, mermaidCode);
      setRenderedDiagram(svg);
      setError('');
    } catch (err) {
      console.error('Error rendering Mermaid diagram:', err);
      setError('Failed to render diagram. The generated code may have syntax errors.');
      setRenderedDiagram(null);
    }
  };

  const handleGenerateQuery = async (e) => {
    e.preventDefault();

    if (!question.trim()) {
      setError('Please enter a question');
      return;
    }

    if (!currentSchema) {
      setError('No schema available. Please generate a schema first.');
      return;
    }

    setIsGenerating(true);
    setError('');
    setGeneratedMermaid(null);
    setRenderedDiagram(null);
    setExplanation('');

    try {
      const response = await fetch('/api/mermaid-query/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: question.trim(),
          schema: currentSchema,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to generate diagram');
        return;
      }

      if (!data.success) {
        setError(data.error || 'Failed to generate diagram');
        return;
      }

      setGeneratedMermaid(data.mermaidCode);
      setExplanation(data.explanation || '');

      // Add to history
      const historyEntry = {
        id: Date.now(),
        question: question.trim(),
        mermaidCode: data.mermaidCode,
        timestamp: new Date().toISOString(),
      };
      
      setQueryHistory(prev => [historyEntry, ...prev.slice(0, 19)]); // Keep last 20

    } catch (err) {
      console.error('Error generating query:', err);
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyMermaid = () => {
    if (generatedMermaid) {
      navigator.clipboard.writeText(generatedMermaid);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleExampleClick = (example) => {
    setQuestion(example);
    setSelectedExample(example);
    setError('');
    setTimeout(() => setSelectedExample(null), 300);
  };

  const handleHistorySelect = (historyItem) => {
    setQuestion(historyItem.question);
    setGeneratedMermaid(historyItem.mermaidCode);
    setError('');
  };

  const handleClearHistory = () => {
    setQueryHistory([]);
    localStorage.removeItem('mermaidQueryHistory');
  };

  return (
    <div className="h-full w-full bg-black overflow-auto relative">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.03),_transparent_50%),_radial-gradient(circle_at_bottom_left,_rgba(255,255,255,0.03),_transparent_50%)] pointer-events-none"></div>
      
      <div className="relative max-w-7xl mx-auto p-8 space-y-8">
        {/* Hero Header */}
        <div className="space-y-6">
          <div className="flex items-start justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-white blur-xl opacity-20"></div>
                  <div className="relative bg-white rounded-xl p-3">
                    <Network className="h-6 w-6 text-black" />
                  </div>
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-white">Mermaid Query Playground</h1>
                  <p className="text-neutral-400 mt-1">
                    Transform questions into visual ER diagrams
                  </p>
                </div>
              </div>
            </div>
            
            {queryHistory.length > 0 && (
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white transition-all duration-200"
              >
                <Clock className="h-4 w-4" />
                <span>History</span>
                {showHistory ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
            )}
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
        </div>

        {/* No Schema State */}
        {!currentSchema || !currentSchema.tables || currentSchema.tables.length === 0 ? (
          <div className="flex items-center justify-center min-h-[500px]">
            <div className="text-center space-y-6 max-w-md">
              <div className="relative mx-auto w-24 h-24">
                <div className="absolute inset-0 bg-white/10 rounded-full animate-pulse"></div>
                <div className="relative bg-white/5 rounded-full p-6 border border-white/10">
                  <Database className="h-12 w-12 text-white/40" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-white">No Schema Available</h3>
                <p className="text-neutral-400">
                  Generate a database schema first to unlock the Mermaid Query Playground
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Schema Info Card */}
            <div className="bg-gradient-to-r from-white/10 via-white/5 to-white/10 border border-white/10 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-white rounded-lg p-2">
                    <Database className="h-5 w-5 text-black" />
                  </div>
                  <div>
                    <p className="text-white font-semibold">
                      {currentSchema.name || 'Database Schema'}
                    </p>
                    <p className="text-neutral-400 text-sm">
                      {currentSchema.tables?.length || 0} tables • Ready for visualization
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-400 text-sm font-medium">Connected</span>
                </div>
              </div>
            </div>

            {/* Query History Panel */}
            {showHistory && queryHistory.length > 0 && (
              <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                  <h3 className="text-white font-semibold flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Recent Queries
                  </h3>
                  <button
                    onClick={handleClearHistory}
                    className="text-neutral-400 hover:text-red-400 transition-colors p-2 hover:bg-white/5 rounded-lg"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="max-h-64 overflow-y-auto p-4 space-y-2">
                  {queryHistory.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleHistorySelect(item)}
                      className="w-full text-left p-4 bg-black/40 hover:bg-black/60 border border-white/10 hover:border-white/20 rounded-lg transition-all duration-200 group"
                    >
                      <p className="text-white line-clamp-2 group-hover:text-white/90">
                        {item.question}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs px-2 py-1 bg-white/10 text-white rounded">
                          MERMAID
                        </span>
                        <span className="text-xs text-neutral-500">
                          {new Date(item.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Main Input Card */}
            <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden backdrop-blur-sm relative">
              {/* Loading Overlay */}
              {isGenerating && (
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-10 flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="relative">
                      <div className="absolute inset-0 bg-white blur-2xl opacity-20 animate-pulse"></div>
                      <Loader2 className="relative h-12 w-12 text-white animate-spin mx-auto" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-white font-semibold text-lg">Generating Mermaid Diagram...</p>
                      <p className="text-neutral-400 text-sm">AI is visualizing your database structure</p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <label className="text-white font-semibold text-lg">Ask Your Question</label>
                </div>

                <form onSubmit={handleGenerateQuery} className="space-y-4">
                  {/* Question Input */}
                  <div className="relative group">
                    <textarea
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      placeholder="e.g., Show me all table relationships, Visualize the user and order tables, Diagram the complete database structure"
                      className="w-full min-h-[120px] bg-black border-2 border-white/20 focus:border-white rounded-lg text-white placeholder:text-neutral-500 p-4 resize-none focus:outline-none transition-colors"
                      disabled={isGenerating}
                    />
                  </div>
                  
                  {/* Error Display */}
                  {error && (
                    <div className="p-4 bg-red-500/10 border-2 border-red-500/30 rounded-lg space-y-3">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                        <div className="space-y-2 flex-1">
                          <p className="text-sm text-red-400 font-medium">{error}</p>
                          {error.includes('not initialized') || error.includes('GEMINI_API_KEY') ? (
                            <div className="text-xs text-neutral-400 space-y-2 mt-2">
                              <p className="font-medium text-neutral-300">Quick Fix:</p>
                              <ol className="list-decimal list-inside space-y-1.5 ml-1">
                                <li>Create a <code className="text-white bg-black px-1.5 py-0.5 rounded">.env</code> file in backend directory</li>
                                <li>Add: <code className="text-white bg-black px-1.5 py-0.5 rounded">GEMINI_API_KEY=your_api_key</code></li>
                                <li>Get API key from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-white underline hover:text-neutral-300">Google AI Studio</a></li>
                                <li>Restart backend server</li>
                              </ol>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Generate Button */}
                  <button
                    type="submit"
                    disabled={isGenerating || !question.trim()}
                    className="w-full bg-white text-black px-6 py-4 rounded-lg font-semibold hover:bg-neutral-100 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 group shadow-lg shadow-white/10"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Generating Diagram...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="h-5 w-5 group-hover:scale-110 transition-transform" />
                        <span>Generate Mermaid Diagram</span>
                      </>
                    )}
                  </button>
                </form>

                {/* Example Questions */}
                {exampleQuestions.length > 0 && (
                  <div className="space-y-3 pt-4 border-t border-white/10">
                    <label className="text-neutral-400 text-sm font-medium">Try these examples:</label>
                    <div className="flex flex-wrap gap-2">
                      {loadingExamples ? (
                        <div className="flex items-center gap-2 text-neutral-500">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-sm">Loading examples...</span>
                        </div>
                      ) : (
                        exampleQuestions.map((example, index) => (
                          <button
                            key={index}
                            onClick={() => handleExampleClick(example)}
                            className={cn(
                              "text-sm px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-200 border border-white/10 hover:border-white/30 hover:scale-105 active:scale-95",
                              selectedExample === example && "bg-white text-black border-white scale-105"
                            )}
                            disabled={isGenerating}
                          >
                            {example}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Generated Mermaid Output */}
            {generatedMermaid && (
              <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden backdrop-blur-sm animate-in fade-in duration-500">
                <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
                  <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                    <Network className="h-5 w-5" />
                    Generated Mermaid ER Diagram
                  </h3>
                  <button
                    onClick={handleCopyMermaid}
                    className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg font-medium hover:bg-neutral-100 hover:scale-105 active:scale-95 transition-all duration-200 shadow-lg shadow-white/10"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                </div>
                
                <div className="p-6 space-y-6">
                  {/* Rendered Diagram */}
                  {renderedDiagram && (
                    <div className="bg-black rounded-lg p-8 border-2 border-white/20 overflow-auto">
                      <div 
                        className="mermaid-diagram"
                        dangerouslySetInnerHTML={{ __html: renderedDiagram }}
                      />
                    </div>
                  )}

                  {/* Mermaid Code */}
                  <div className="space-y-3">
                    <h4 className="text-white font-semibold">Mermaid Code:</h4>
                    <div className="rounded-lg overflow-hidden border-2 border-white/20">
                      <pre className="bg-black p-6 overflow-x-auto">
                        <code className="text-neutral-300 text-sm font-mono leading-relaxed">
                          {generatedMermaid}
                        </code>
                      </pre>
                    </div>
                  </div>
                  
                  {/* Explanation */}
                  {explanation && (
                    <div className="p-5 bg-white/10 border border-white/20 rounded-lg">
                      <div className="flex items-start gap-3">
                        <div className="bg-white rounded-lg p-2 flex-shrink-0">
                          <Sparkles className="h-5 w-5 text-black" />
                        </div>
                        <div className="flex-1 space-y-2">
                          <h4 className="text-white font-semibold">How This Diagram Works</h4>
                          <p className="text-neutral-300 text-sm leading-relaxed">
                            {explanation}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MermaidQueryPlayground;
