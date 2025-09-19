// src/components/gemini/ResultView.jsx

import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import toast from 'react-hot-toast';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Button } from '@/components/ui/button';
import { IconClipboardCopy, IconZoomIn, IconZoomOut, IconZoomReset, IconArrowsMove, IconMaximize } from '@tabler/icons-react';

export function ResultView({ mermaidCode }) {
  const mermaidRef = useRef(null);
  const [renderAttempts, setRenderAttempts] = useState(0);
  const [renderError, setRenderError] = useState(null);
  const [isDragging, setIsDragging] = useState(true); // Default to enabled
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Create a fallback renderer if modern API fails
  const renderMermaidFallback = (container, code) => {
    try {
      const id = `mermaid-fallback-${Date.now()}`;
      container.innerHTML = `<div id="${id}" class="mermaid">${code}</div>`;
      
      setTimeout(() => {
        try {
          mermaid.init(undefined, `#${id}`);
        } catch (err) {
          console.error('Fallback mermaid.init error:', err);
          container.innerHTML = `<div class="p-4 text-red-500">
            Could not render diagram even with fallback method. 
            <pre class="mt-2 p-2 bg-neutral-900 rounded text-xs overflow-auto">${err.message}</pre>
          </div>`;
        }
      }, 100);
    } catch (error) {
      console.error('Fallback renderer setup error:', error);
      container.innerHTML = `<div class="p-4 text-red-500">Fallback renderer failed: ${error.message}</div>`;
    }
  };

  useEffect(() => {
    if (!mermaidCode || !mermaidRef.current) return;
    
    setRenderError(null);
    
    const renderTimer = setTimeout(() => {
      try {
        const diagramId = `mermaid-diagram-${Date.now()}`;
        const container = mermaidRef.current;
        
        container.innerHTML = '';
        const tempDiv = document.createElement('div');
        tempDiv.id = diagramId;
        tempDiv.textContent = mermaidCode;
        container.appendChild(tempDiv);
        
        mermaid.render(diagramId, mermaidCode)
          .then(({ svg, bindFunctions }) => {
            if (container) {
              container.innerHTML = svg;
              if (typeof bindFunctions === 'function') {
                bindFunctions(container);
              }
            }
          })
          .catch(err => {
            console.error('Mermaid render promise error:', err);
            setRenderError('Failed to render diagram: ' + (err.message || 'Unknown error'));
            renderMermaidFallback(container, mermaidCode);
          });
      } catch (error) {
        console.error('Mermaid rendering setup error:', error);
        setRenderError('Error setting up renderer: ' + (error.message || 'Unknown error'));
        
        const container = mermaidRef.current;
        if (container) {
          renderMermaidFallback(container, mermaidCode);
        }
      }
    }, 100);
    
    return () => clearTimeout(renderTimer);
  }, [mermaidCode, renderAttempts]);

  const handleCopyCode = () => {
    if (!mermaidCode) return;
    navigator.clipboard.writeText(mermaidCode);
    toast.success('Mermaid code copied to clipboard!');
  };

  const handleRetryRender = () => {
    setRenderAttempts(prev => prev + 1);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const DiagramViewer = ({ zoomIn, zoomOut, resetTransform }) => (
    <>
      {/* Enhanced Zoom Controls */}
      <div className="absolute top-3 right-3 z-20 flex gap-1 bg-[#18181B]/90 backdrop-blur-sm p-1.5 rounded-lg shadow-lg border border-[#3F3F46]">
        <Button 
          variant="ghost" 
          size="icon" 
          className={`h-9 w-9 ${isDragging ? 'bg-purple-600 hover:bg-purple-700' : 'bg-[#27272A] hover:bg-[#3F3F46]'} text-white transition-colors`}
          onClick={() => setIsDragging(!isDragging)} 
          title={isDragging ? "Disable Pan/Drag" : "Enable Pan/Drag"}
        >
          <IconArrowsMove className="h-4 w-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-9 w-9 bg-[#27272A] hover:bg-[#3F3F46] text-white transition-colors"
          onClick={() => zoomIn(0.3)}
          title="Zoom In"
        >
          <IconZoomIn className="h-4 w-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-9 w-9 bg-[#27272A] hover:bg-[#3F3F46] text-white transition-colors"
          onClick={() => zoomOut(0.3)}
          title="Zoom Out"
        >
          <IconZoomOut className="h-4 w-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-9 w-9 bg-[#27272A] hover:bg-[#3F3F46] text-white transition-colors"
          onClick={() => resetTransform()}
          title="Reset View"
        >
          <IconZoomReset className="h-4 w-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-9 w-9 bg-[#27272A] hover:bg-[#3F3F46] text-white transition-colors"
          onClick={toggleFullscreen}
          title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
        >
          <IconMaximize className="h-4 w-4" />
        </Button>
      </div>
      
      <TransformComponent 
        contentClass="w-full h-full flex items-center justify-center" 
        wrapperClass="h-full w-full"
      >
        <div className="p-6 w-full h-full flex items-center justify-center">
          <div 
            ref={mermaidRef} 
            className="diagram-container bg-[#09090B] rounded-lg p-4 shadow-xl border border-[#27272A] max-w-none"
            style={{ 
              minWidth: '400px', 
              minHeight: '300px',
              width: 'auto',
              height: 'auto'
            }}
          />
        </div>
      </TransformComponent>
    </>
  );

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-[#09090B]">
        <TransformWrapper
          initialScale={0.8}
          initialPositionX={0}
          initialPositionY={0}
          minScale={0.2}
          maxScale={3}
          limitToBounds={false}
          disabled={!isDragging}
          wheel={{ step: 0.1 }}
          doubleClick={{ disabled: false, step: 0.3 }}
          panning={{ disabled: !isDragging }}
        >
          <DiagramViewer />
        </TransformWrapper>
        
        {renderError && (
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-30">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRetryRender}
              className="bg-[#27272A] text-white border-[#3F3F46] hover:bg-[#3F3F46]"
            >
              Retry Render
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <ResizablePanelGroup direction="vertical" className="h-full">
      <ResizablePanel defaultSize={75} minSize={50}>
        <div className="h-full overflow-hidden bg-[#0A0A0A] relative">
          <TransformWrapper
            initialScale={0.9}
            initialPositionX={0}
            initialPositionY={0}
            minScale={0.3}
            maxScale={2.5}
            limitToBounds={false}
            disabled={!isDragging}
            wheel={{ step: 0.1 }}
            doubleClick={{ disabled: false, step: 0.3 }}
            panning={{ disabled: !isDragging }}
          >
            <DiagramViewer />
          </TransformWrapper>
          
          {renderError && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRetryRender}
                className="bg-[#27272A] text-white border-[#3F3F46] hover:bg-[#3F3F46]"
              >
                Retry Render
              </Button>
            </div>
          )}

          {/* Status indicator */}
          {isDragging && (
            <div className="absolute bottom-3 left-3 z-10 bg-purple-600/20 text-purple-300 px-3 py-1 rounded-full text-xs font-medium border border-purple-600/30">
              Pan & Zoom Enabled
            </div>
          )}
        </div>
      </ResizablePanel>
      
      <ResizableHandle withHandle className="bg-[#27272A] border-y border-[#3F3F46]" />
      
      <ResizablePanel defaultSize={25} minSize={15}>
        <div className='flex flex-col h-full bg-[#09090B]'>
          <div className="flex items-center justify-between p-3 px-4 border-b border-[#27272A] bg-[#18181B]">
            <p className="text-sm font-semibold text-white">Mermaid Code</p>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleCopyCode}
              className="h-8 w-8 hover:bg-[#3F3F46] transition-colors"
              title="Copy Code"
            >
              <IconClipboardCopy className="w-4 h-4 text-white" />
            </Button>
          </div>
          <div className='flex-grow overflow-auto bg-[#09090B]'>
            <pre className="p-4 text-xs font-mono text-[#E4E4E7] bg-[#09090B] leading-relaxed">
              <code>{mermaidCode}</code>
            </pre>
          </div>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}