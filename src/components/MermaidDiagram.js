// components/MermaidDiagram.js
'use client';

import { useEffect, useRef, useState } from 'react';

// Create a fallback component for the cases when main rendering fails
const MermaidFallback = ({ chart }) => {
  const ref = useRef(null);

  useEffect(() => {
    let isMounted = true;
    
    // Ensure we're in the browser and DOM is ready
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      const timer = setTimeout(async () => {
        try {
          // Dynamically import mermaid
          const mermaidModule = await import('mermaid');
          const mermaid = mermaidModule.default;
          
          if (!isMounted || !ref.current) return;
          
          // Clear any previous content
          ref.current.innerHTML = '';
          
          // Basic initialization with minimal options
          mermaid.initialize({
            startOnLoad: false,
            securityLevel: 'loose',
            theme: 'default'
          });
          
          // Generate a unique ID for this render
          const id = `mermaid-fallback-${Date.now()}`;
          
          // Use async/await pattern instead of callback
          try {
            const { svg } = await mermaid.render(id, chart);
            if (isMounted && ref.current) {
              ref.current.innerHTML = svg;
            }
          } catch (renderError) {
            console.error('Mermaid render error:', renderError);
            if (isMounted && ref.current) {
              ref.current.innerHTML = `<div class="p-4 text-red-600">Could not render diagram: ${renderError.message}</div>`;
            }
          }
        } catch (err) {
          console.error('Fallback mermaid render failed:', err);
          if (isMounted && ref.current) {
            ref.current.innerHTML = `<div class="p-4 text-red-600">Could not render diagram</div>`;
          }
        }
      }, 500); // Increased delay
      
      return () => {
        isMounted = false;
        clearTimeout(timer);
      };
    }
  }, [chart]);

  return (
    <div className="border border-gray-300 rounded-lg p-4 bg-white">
      <div ref={ref} className="min-h-[200px] flex items-center justify-center">
        <p className="text-gray-400">Loading diagram...</p>
      </div>
    </div>
  );
};

export default function MermaidDiagram({ mermaidSyntax }) {
  const container = useRef(null);
  const [error, setError] = useState(null);
  const [renderedSvg, setRenderedSvg] = useState('');
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [useFallback, setUseFallback] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Enhanced checks for browser environment
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }
    
    let isMounted = true;
    
    // Wrap in an async function to handle dynamic import
    const loadAndRender = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Wait for DOM to be fully ready
        if (document.readyState !== 'complete') {
          await new Promise(resolve => {
            const handleLoad = () => {
              document.removeEventListener('DOMContentLoaded', handleLoad);
              window.removeEventListener('load', handleLoad);
              resolve();
            };
            
            if (document.readyState === 'loading') {
              document.addEventListener('DOMContentLoaded', handleLoad);
            } else {
              window.addEventListener('load', handleLoad);
            }
            
            // Fallback timeout
            setTimeout(handleLoad, 1000);
          });
        }
        
        // Additional delay to ensure React has finished rendering
        await new Promise(resolve => setTimeout(resolve, 500));
        
        if (!isMounted) return;
        
        // Dynamic import to avoid SSR issues
        const mermaidModule = await import('mermaid');
        const mermaid = mermaidModule.default;
        
        // Verify DOM is still available
        if (typeof document === 'undefined') {
          throw new Error('Document is not available');
        }
        
        // Initialize with defensive settings
        mermaid.initialize({
          startOnLoad: false,
          theme: 'default',
          securityLevel: 'loose',
          er: {
            diagramPadding: 20,
            layoutDirection: 'TB',
            minEntityWidth: 100,
            minEntityHeight: 75,
            entityPadding: 15
          },
          fontSize: 16
        });
        
        // Unique ID to avoid conflicts
        const id = `mermaid-diagram-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        // Use modern async/await pattern
        try {
          const { svg } = await mermaid.render(id, mermaidSyntax);
          if (isMounted) {
            setRenderedSvg(svg);
            setUseFallback(false);
            setIsLoading(false);
          }
        } catch (renderError) {
          console.error('Mermaid render error:', renderError);
          if (isMounted) {
            setError(`Error rendering diagram: ${renderError.message}`);
            setUseFallback(true);
            setIsLoading(false);
          }
        }
      } catch (err) {
        console.error('Mermaid loading error:', err);
        if (isMounted) {
          setError(`Error loading diagram: ${err.message}`);
          setUseFallback(true);
          setIsLoading(false);
        }
      }
    };
    
    // Use requestIdleCallback if available, otherwise setTimeout
    if (typeof window.requestIdleCallback === 'function') {
      window.requestIdleCallback(loadAndRender);
    } else {
      setTimeout(loadAndRender, 100);
    }
    
    return () => {
      isMounted = false;
    };
  }, [mermaidSyntax]);

  // Handle toggling full screen
  const toggleFullScreen = () => {
    setIsFullScreen(prev => !prev);
  };

  // If we're using the fallback renderer
  if (useFallback) {
    return (
      <div className={`mermaid-container w-full relative ${isFullScreen ? "fixed inset-0 z-50" : ""}`}>
        <MermaidFallback chart={mermaidSyntax} />
        
        {isFullScreen && (
          <button 
            className="fixed top-4 right-4 z-50 bg-gray-800 text-white p-2 rounded-full shadow-lg hover:bg-gray-700"
            onClick={() => setIsFullScreen(false)}
            title="Exit Full Screen"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    );
  }

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

  // Loading or error state
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
        {isLoading ? (
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-600"></div>
            <p className="text-gray-400">Rendering diagram...</p>
          </div>
        ) : (
          <p className="text-gray-400">Failed to render diagram</p>
        )}
      </div>
    </div>
  );
}