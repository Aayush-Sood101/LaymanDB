// components/MermaidDiagram.js
'use client';

import { useEffect, useRef, useState } from 'react';
import MermaidFallback from './MermaidFallback';

export default function MermaidDiagram({ mermaidSyntax }) {
  const [error, setError] = useState(null);
  const [renderedSvg, setRenderedSvg] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [useFallback, setUseFallback] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const renderDiagram = async () => {
      if (!mermaidSyntax) {
        setIsLoading(false);
        return;
      }
      
      // Reset state for re-renders
      setIsLoading(true);
      setError(null);
      setRenderedSvg('');
      setUseFallback(false);

      try {
        // Dynamically import mermaid
        const mermaid = (await import('mermaid')).default;

        mermaid.initialize({
          startOnLoad: false,
          theme: 'default',
          securityLevel: 'loose',
          er: {
            diagramPadding: 20,
            layoutDirection: 'TB',
            minEntityWidth: 100,
            minEntityHeight: 75,
            entityPadding: 15,
          },
          fontSize: 16,
        });

        const id = `mermaid-diagram-${Date.now()}`;

        // --- THE FIX ---
        // Call `render` with only the ID and syntax.
        // It returns a promise with the SVG string.
        const { svg } = await mermaid.render(id, mermaidSyntax);

        if (isMounted) {
          setRenderedSvg(svg);
        }
      } catch (err) {
        console.error('Mermaid render error:', err);
        if (isMounted) {
          setError(`Error rendering diagram: ${err.message}`);
          setUseFallback(true); // Use the fallback on error
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    renderDiagram();

    return () => {
      isMounted = false;
    };
  }, [mermaidSyntax]); // Re-run the effect whenever the mermaid syntax changes

  const toggleFullScreen = (e) => {
    // Prevent nested clicks from toggling multiple times
    if (e) e.stopPropagation();
    setIsFullScreen(prev => !prev);
  };

  // Render Fallback Component on error
  if (useFallback) {
    return <MermaidFallback chart={mermaidSyntax} />;
  }
  
  // Render Loading State
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4 border border-gray-300 rounded-lg bg-white" style={{ minHeight: '300px' }}>
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-600"></div>
          <p className="text-gray-400">Rendering diagram...</p>
        </div>
      </div>
    );
  }

  // Render the successfully generated SVG
  if (renderedSvg) {
    return (
      <div className="mermaid-container w-full relative">
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
            onClick={toggleFullScreen}
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

  return null; // or a placeholder for when there's no syntax
}