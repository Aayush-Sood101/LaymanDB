// src/components/gemini/ResultView.jsx

import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import toast from 'react-hot-toast';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Button } from '@/components/ui/button';
import { IconClipboardCopy, IconZoomIn, IconZoomOut, IconZoomReset, IconArrowsMove, IconMaximize, IconMinimize } from '@tabler/icons-react';

export function ResultView({ mermaidCode }) {
  const mermaidRef = useRef(null);
  const fullscreenMermaidRef = useRef(null);
  const [renderAttempts, setRenderAttempts] = useState(0);
  const [renderError, setRenderError] = useState(null);
  const [isDragging, setIsDragging] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showCode, setShowCode] = useState(false);

  // Render mermaid diagram
  const renderMermaid = (container, code) => {
    if (!container || !code) return;
    
    try {
      const diagramId = `mermaid-diagram-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Clear container
      container.innerHTML = '';
      
      // Create temp div
      const tempDiv = document.createElement('div');
      tempDiv.id = diagramId;
      tempDiv.textContent = code;
      container.appendChild(tempDiv);
      
      // Render with mermaid
      mermaid.render(diagramId, code)
        .then(({ svg, bindFunctions }) => {
          if (container && container.parentNode) {
            container.innerHTML = svg;
            if (typeof bindFunctions === 'function') {
              bindFunctions(container);
            }
            // Ensure SVG takes full width
            const svgElement = container.querySelector('svg');
            if (svgElement) {
              svgElement.style.maxWidth = 'none';
              svgElement.style.height = 'auto';
            }
          }
        })
        .catch(err => {
          console.error('Mermaid render error:', err);
          setRenderError('Failed to render: ' + err.message);
        });
    } catch (error) {
      console.error('Mermaid setup error:', error);
      setRenderError('Setup error: ' + error.message);
    }
  };

  // Render for regular view
  useEffect(() => {
    if (!mermaidCode || !mermaidRef.current) return;
    setRenderError(null);
    const timer = setTimeout(() => renderMermaid(mermaidRef.current, mermaidCode), 100);
    return () => clearTimeout(timer);
  }, [mermaidCode, renderAttempts]);

  // Render for fullscreen view
  useEffect(() => {
    if (!mermaidCode || !fullscreenMermaidRef.current || !isFullscreen) return;
    const timer = setTimeout(() => renderMermaid(fullscreenMermaidRef.current, mermaidCode), 200);
    return () => clearTimeout(timer);
  }, [mermaidCode, isFullscreen]);

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

  const toggleCodeView = () => {
    setShowCode(!showCode);
  };

  // Fullscreen Mode
  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-[9999] bg-[#09090B]">
        {/* Fullscreen Controls */}
        <div className="absolute top-4 right-4 z-[10000] flex gap-2 bg-[#18181B]/95 backdrop-blur-md p-2 rounded-xl shadow-2xl border border-[#3F3F46]">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-10 w-10 bg-[#27272A] hover:bg-[#3F3F46] text-white transition-all duration-200"
            onClick={toggleCodeView}
            title="Toggle Code View"
          >
            <IconClipboardCopy className="h-5 w-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-10 w-10 bg-red-600 hover:bg-red-700 text-white transition-all duration-200"
            onClick={toggleFullscreen}
            title="Exit Fullscreen"
          >
            <IconMinimize className="h-5 w-5" />
          </Button>
        </div>

        {/* Fullscreen Content */}
        <div className="w-full h-full relative">
          <TransformWrapper
            initialScale={0.8}
            minScale={0.1}
            maxScale={5}
            limitToBounds={false}
            centerOnInit={true}
            wheel={{ step: 0.1 }}
            doubleClick={{ step: 0.3 }}
            panning={{ disabled: !isDragging }}
          >
            {({ zoomIn, zoomOut, resetTransform }) => (
              <>
                {/* Fullscreen Zoom Controls */}
                <div className="absolute top-4 left-4 z-[10000] flex flex-col gap-2 bg-[#18181B]/95 backdrop-blur-md p-2 rounded-xl shadow-2xl border border-[#3F3F46]">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className={`h-10 w-10 transition-all duration-200 ${isDragging ? 'bg-purple-600 hover:bg-purple-700' : 'bg-[#27272A] hover:bg-[#3F3F46]'} text-white`}
                    onClick={() => setIsDragging(!isDragging)}
                    title={isDragging ? "Disable Pan" : "Enable Pan"}
                  >
                    <IconArrowsMove className="h-5 w-5" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-10 w-10 bg-[#27272A] hover:bg-[#3F3F46] text-white transition-all duration-200"
                    onClick={() => zoomIn(0.3)}
                    title="Zoom In"
                  >
                    <IconZoomIn className="h-5 w-5" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-10 w-10 bg-[#27272A] hover:bg-[#3F3F46] text-white transition-all duration-200"
                    onClick={() => zoomOut(0.3)}
                    title="Zoom Out"
                  >
                    <IconZoomOut className="h-5 w-5" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-10 w-10 bg-[#27272A] hover:bg-[#3F3F46] text-white transition-all duration-200"
                    onClick={() => resetTransform()}
                    title="Reset View"
                  >
                    <IconZoomReset className="h-5 w-5" />
                  </Button>
                </div>
                
                <TransformComponent 
                  wrapperClass="w-full h-full"
                  contentClass="w-full h-full"
                  wrapperStyle={{
                    width: '100%',
                    height: '100%',
                    overflow: 'visible'
                  }}
                  contentStyle={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <div className="flex items-center justify-center p-8">
                    <div 
                      ref={fullscreenMermaidRef} 
                      className="diagram-container bg-[#09090B] rounded-xl p-6 shadow-2xl border border-[#27272A]"
                      style={{ 
                        minWidth: '600px', 
                        minHeight: '400px',
                        maxWidth: 'none',
                        maxHeight: 'none'
                      }}
                    />
                  </div>
                </TransformComponent>
              </>
            )}
          </TransformWrapper>
        </div>

        {/* Fullscreen Code Panel */}
        {showCode && (
          <div className="absolute bottom-4 left-4 right-4 h-48 bg-[#18181B]/95 backdrop-blur-md rounded-xl border border-[#3F3F46] shadow-2xl overflow-hidden z-[10000]">
            <div className="flex items-center justify-between p-3 border-b border-[#27272A]">
              <p className="text-sm font-semibold text-white">Mermaid Code</p>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleCopyCode}
                className="hover:bg-[#3F3F46] text-white"
              >
                <IconClipboardCopy className="w-4 h-4 mr-2" />
                Copy
              </Button>
            </div>
            <div className="h-full overflow-auto p-4">
              <pre className="text-xs font-mono text-[#E4E4E7] leading-relaxed">
                <code>{mermaidCode}</code>
              </pre>
            </div>
          </div>
        )}

        {/* Fullscreen Status */}
        {isDragging && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-[10000] bg-purple-600/20 text-purple-300 px-4 py-2 rounded-full text-sm font-medium border border-purple-600/30 backdrop-blur-sm">
            Pan & Zoom Mode • Mouse wheel to zoom • Drag to pan
          </div>
        )}
      </div>
    );
  }

  // Regular Mode
  return (
    <div className="flex flex-col h-full bg-[#0A0A0A] relative">
      {/* Main Diagram Area */}
      <div className="flex-1 relative">
        <TransformWrapper
          initialScale={0.9}
          minScale={0.2}
          maxScale={3}
          limitToBounds={false}
          centerOnInit={true}
          wheel={{ step: 0.1 }}
          doubleClick={{ step: 0.3 }}
          panning={{ disabled: !isDragging }}
        >
          {({ zoomIn, zoomOut, resetTransform }) => (
            <>
              {/* Control Panel */}
              <div className="absolute top-3 right-3 z-20 flex gap-1 bg-[#18181B]/90 backdrop-blur-sm p-2 rounded-lg shadow-lg border border-[#3F3F46]">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={`h-9 w-9 transition-all duration-200 ${isDragging ? 'bg-purple-600 hover:bg-purple-700' : 'bg-[#27272A] hover:bg-[#3F3F46]'} text-white`}
                  onClick={() => setIsDragging(!isDragging)}
                  title={isDragging ? "Disable Pan" : "Enable Pan"}
                >
                  <IconArrowsMove className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-9 w-9 bg-[#27272A] hover:bg-[#3F3F46] text-white transition-all duration-200"
                  onClick={() => zoomIn(0.3)}
                  title="Zoom In"
                >
                  <IconZoomIn className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-9 w-9 bg-[#27272A] hover:bg-[#3F3F46] text-white transition-all duration-200"
                  onClick={() => zoomOut(0.3)}
                  title="Zoom Out"
                >
                  <IconZoomOut className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-9 w-9 bg-[#27272A] hover:bg-[#3F3F46] text-white transition-all duration-200"
                  onClick={() => resetTransform()}
                  title="Reset View"
                >
                  <IconZoomReset className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-9 w-9 bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200"
                  onClick={toggleFullscreen}
                  title="Enter Fullscreen"
                >
                  <IconMaximize className="h-4 w-4" />
                </Button>
              </div>
              
              <TransformComponent 
                wrapperClass="w-full h-full" 
                contentClass="w-full h-full"
                wrapperStyle={{
                  width: '100%',
                  height: '100%',
                  overflow: 'visible'
                }}
                contentStyle={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <div className="flex items-center justify-center p-6">
                  <div 
                    ref={mermaidRef} 
                    className="diagram-container bg-[#09090B] rounded-lg p-4 shadow-xl border border-[#27272A]"
                    style={{ 
                      minWidth: '400px', 
                      minHeight: '300px',
                      maxWidth: 'none',
                      maxHeight: 'none'
                    }}
                  />
                </div>
              </TransformComponent>
            </>
          )}
        </TransformWrapper>
        
        {/* Status Indicators */}
        {isDragging && (
          <div className="absolute bottom-3 left-3 z-10 bg-purple-600/20 text-purple-300 px-3 py-1.5 rounded-full text-xs font-medium border border-purple-600/30 backdrop-blur-sm">
            Pan & Zoom Enabled
          </div>
        )}
        
        {renderError && (
          <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 z-20">
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

      {/* Collapsible Code Section */}
      {showCode && (
        <div className="h-48 border-t border-[#27272A] bg-[#09090B] flex flex-col z-30">
          <div className="flex items-center justify-between p-3 bg-[#18181B] border-b border-[#27272A]">
            <p className="text-sm font-semibold text-white">Mermaid Code</p>
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleCopyCode}
                className="hover:bg-[#3F3F46] text-white"
              >
                <IconClipboardCopy className="w-4 h-4 mr-2" />
                Copy
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={toggleCodeView}
                className="hover:bg-[#3F3F46] text-white"
              >
                Hide Code
              </Button>
            </div>
          </div>
          <div className="flex-1 overflow-auto p-4">
            <pre className="text-xs font-mono text-[#E4E4E7] leading-relaxed">
              <code>{mermaidCode}</code>
            </pre>
          </div>
        </div>
      )}

      {/* Code Toggle Button */}
      {!showCode && (
        <div className="absolute bottom-3 right-3 z-10">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={toggleCodeView}
            className="bg-[#18181B]/90 text-white border-[#3F3F46] hover:bg-[#27272A] backdrop-blur-sm"
          >
            <IconClipboardCopy className="w-4 h-4 mr-2" />
            Show Code
          </Button>
        </div>
      )}
    </div>
  );
}