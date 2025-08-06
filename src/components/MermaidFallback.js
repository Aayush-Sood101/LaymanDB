'use client';

import { useEffect, useRef } from 'react';

// This is a simple fallback component that displays Mermaid diagrams
// using a more direct approach when the main component fails
export default function MermaidFallback({ chart }) {
  const ref = useRef(null);

  useEffect(() => {
    // Dynamically import mermaid to avoid SSR issues
    import('mermaid').then((mermaid) => {
      if (ref.current) {
        try {
          // Initialize with very basic settings
          mermaid.default.initialize({ 
            startOnLoad: false,
            securityLevel: 'loose',
          });

          // Clear any previous content
          ref.current.innerHTML = '';

          // Generate a unique ID
          const id = `mermaid-fallback-${Date.now()}`;
          
          // Use the callback-based rendering which is more stable
          mermaid.default.render(id, chart, (svgCode) => {
            if (ref.current) {
              ref.current.innerHTML = svgCode;
            }
          });
        } catch (error) {
          console.error("Fallback mermaid rendering failed:", error);
          if (ref.current) {
            ref.current.innerHTML = `<div class="p-4 border border-red-500 rounded">
              <p class="text-red-600">Failed to render diagram</p>
              <pre class="text-xs mt-2 p-2 bg-gray-100 rounded overflow-auto">${chart}</pre>
            </div>`;
          }
        }
      }
    });
  }, [chart]);

  return (
    <div className="mermaid-fallback border border-gray-300 rounded-lg p-4 bg-white">
      <div ref={ref} className="min-h-[200px] flex items-center justify-center">
        <p className="text-gray-400">Loading diagram...</p>
      </div>
    </div>
  );
}
