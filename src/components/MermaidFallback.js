// components/MermaidFallback.js
'use client';

import { useEffect, useRef } from 'react';

export default function MermaidFallback({ chart }) {
  const ref = useRef(null);

  useEffect(() => {
    const renderMermaid = async () => {
      if (!ref.current || !chart) return;
      
      ref.current.innerHTML = '<div class="flex items-center justify-center"><p class="text-gray-400">Processing diagram...</p></div>';
      
      try {
        const mermaid = (await import('mermaid')).default;
        
        mermaid.initialize({ 
          startOnLoad: false,
          securityLevel: 'loose',
          theme: 'default'
        });

        const id = `mermaid-fallback-${Date.now()}`;
        
        // --- THE FIX ---
        // Removed the third argument (the temporary container)
        const { svg } = await mermaid.render(id, chart);
        
        if (ref.current) {
          ref.current.innerHTML = svg;
        }
      } catch (renderError) {
        console.error("Mermaid fallback rendering failed:", renderError);
        if (ref.current) {
          // Display a detailed error message for easier debugging
          ref.current.innerHTML = `
            <div class="p-4 border border-red-300 rounded bg-red-50 text-left">
              <p class="text-red-600 font-bold">Failed to render diagram</p>
              <p class="text-red-500 text-sm mt-1">${renderError.message || 'Unknown error'}</p>
              <details class="mt-4">
                <summary class="text-sm text-gray-600 cursor-pointer">View Mermaid Code</summary>
                <pre class="text-xs mt-2 p-2 bg-gray-100 rounded overflow-auto max-h-40">${
                  chart.replace(/</g, '&lt;').replace(/>/g, '&gt;')
                }</pre>
              </details>
            </div>
          `;
        }
      }
    };
    
    // A small delay can sometimes help ensure the DOM is fully ready
    const timer = setTimeout(renderMermaid, 50);
    return () => clearTimeout(timer);
  }, [chart]);

  return (
    <div className="mermaid-fallback border border-gray-300 rounded-lg p-4 bg-white">
      <div ref={ref} className="min-h-[200px] flex items-center justify-center">
        <p className="text-gray-400">Loading diagram...</p>
      </div>
    </div>
  );
}