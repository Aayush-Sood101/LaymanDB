// components/MermaidDiagram.js
'use client';

import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

export default function MermaidDiagram({ mermaidSyntax }) {
  const container = useRef(null);
  const [error, setError] = useState(null);
  const [renderedSvg, setRenderedSvg] = useState('');
  const [renderKey, setRenderKey] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);

  useEffect(() => {
    // Safety check - ensure we're in a browser environment with DOM access
    if (typeof window === 'undefined' || !mermaidSyntax || !container.current) return;

    const renderDiagram = async () => {
      try {
        // Clear previous content and errors
        setError(null);

        // Configure mermaid with safer settings
        mermaid.initialize({ 
          startOnLoad: false,
          theme: 'default',
          securityLevel: 'loose', // Important for Next.js
          er: {
            diagramPadding: 20,
            layoutDirection: 'TB',
            minEntityWidth: 100,
            minEntityHeight: 75,
            entityPadding: 15
          },
          fontSize: 16
        });

        // Generate a unique ID to avoid conflicts
        const id = `mermaid-diagram-${Date.now()}`;
        
        // Use parseSync for more reliable rendering
        const { svg } = await mermaid.render(id, mermaidSyntax);
        setRenderedSvg(svg);
      } catch (err) {
        console.error('Mermaid rendering error:', err);
        setError(`Error rendering diagram: ${err.message}`);
        
        // If we get a createElementNS error, try with a delay and different approach
        if (err.message && err.message.includes('createElementNS')) {
          setTimeout(() => {
            setRenderKey(prev => prev + 1);
          }, 500);
        }
      }
    };

    renderDiagram();
  }, [mermaidSyntax, renderKey]);

  // Handle toggling full screen
  const toggleFullScreen = () => {
    setIsFullScreen(prev => !prev);
  };

  // If we have a rendered SVG, display it safely
  if (renderedSvg) {
    return (
      <div className="mermaid-container w-full relative">
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
            <p>{error}</p>
          </div>
        )}
        <div 
          className={`border border-gray-300 rounded-lg p-4 bg-white overflow-auto cursor-pointer transition-all duration-300 ${
            isFullScreen 
              ? "fixed inset-0 z-50 m-0 rounded-none" 
              : "w-full max-w-full"
          }`}
          style={{ minHeight: isFullScreen ? '100vh' : '300px' }}
          dangerouslySetInnerHTML={{ __html: renderedSvg }}
          onClick={toggleFullScreen}
        />
        
        {isFullScreen && (
          <button 
            className="fixed top-4 right-4 z-50 bg-gray-800 text-white p-2 rounded-full shadow-lg hover:bg-gray-700"
            onClick={(e) => {
              e.stopPropagation();
              toggleFullScreen();
            }}
            title="Exit Full Screen"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        
        {!isFullScreen && (
          <div className="absolute bottom-2 right-2 bg-gray-800 bg-opacity-70 text-white text-xs px-2 py-1 rounded pointer-events-none">
            Click to expand
          </div>
        )}
      </div>
    );
  }

  // Fallback display when rendering or in case of error
  return (
    <div className="mermaid-container w-full">
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
          <p>{error}</p>
        </div>
      )}
      <div 
        ref={container} 
        className="border border-gray-300 rounded-lg p-4 bg-white overflow-auto w-full max-w-full flex items-center justify-center"
        style={{ minHeight: '300px' }}
      >
        {!error && <p className="text-gray-400">Rendering diagram...</p>}
      </div>
    </div>
  );
}
