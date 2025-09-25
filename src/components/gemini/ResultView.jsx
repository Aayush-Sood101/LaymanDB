// src/components/gemini/ResultView.jsx

import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import toast from 'react-hot-toast';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { exportToHighResSvg, exportToHighResPng, downloadDataUrl } from '@/lib/diagramExport';
import { 
  IconClipboardCopy, 
  IconZoomIn, 
  IconZoomOut, 
  IconZoomReset, 
  IconArrowsMove, 
  IconMaximize, 
  IconMinimize,
  IconCode,
  IconEye,
  IconEyeOff,
  IconRefresh,
  IconX,
  IconPhoto,
  IconFileVector,
  IconDownload,
  IconLoader2
} from '@tabler/icons-react';

export function ResultView({ mermaidCode }) {
  const mermaidRef = useRef(null);
  const fullscreenMermaidRef = useRef(null);
  const [renderAttempts, setRenderAttempts] = useState(0);
  const [renderError, setRenderError] = useState(null);
  const [isDragging, setIsDragging] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportType, setExportType] = useState(null);

  // Render mermaid diagram
  const renderMermaid = async (container, code) => {
    if (!container || !code) return;
    
    try {
      setIsLoading(true);
      setRenderError(null);
      
      const diagramId = `mermaid-diagram-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Clear container
      container.innerHTML = '';
      
      // Create temp div
      const tempDiv = document.createElement('div');
      tempDiv.id = diagramId;
      tempDiv.textContent = code;
      container.appendChild(tempDiv);
      
      // Render with mermaid
      const { svg, bindFunctions } = await mermaid.render(diagramId, code);
      
      if (container && container.parentNode) {
        container.innerHTML = svg;
        if (typeof bindFunctions === 'function') {
          bindFunctions(container);
        }
        
        // Enhanced SVG styling
        const svgElement = container.querySelector('svg');
        if (svgElement) {
          svgElement.style.maxWidth = 'none';
          svgElement.style.height = 'auto';
          svgElement.style.filter = 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.3))';
          
          // Add subtle animation on load
          svgElement.style.opacity = '0';
          svgElement.style.transform = 'scale(0.95)';
          svgElement.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
          
          setTimeout(() => {
            svgElement.style.opacity = '1';
            svgElement.style.transform = 'scale(1)';
          }, 50);
        }
      }
    } catch (error) {
      console.error('Mermaid render error:', error);
      setRenderError('Failed to render diagram: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Render for regular view
  useEffect(() => {
    if (!mermaidCode || !mermaidRef.current) return;
    const timer = setTimeout(() => renderMermaid(mermaidRef.current, mermaidCode), 100);
    return () => clearTimeout(timer);
  }, [mermaidCode, renderAttempts]);

  // Render for fullscreen view
  useEffect(() => {
    if (!mermaidCode || !fullscreenMermaidRef.current || !isFullscreen) return;
    const timer = setTimeout(() => renderMermaid(fullscreenMermaidRef.current, mermaidCode), 200);
    return () => clearTimeout(timer);
  }, [mermaidCode, isFullscreen]);

  // Fix: Re-render diagram when exiting fullscreen
  useEffect(() => {
    if (!isFullscreen && mermaidRef.current && mermaidCode) {
      const timer = setTimeout(() => renderMermaid(mermaidRef.current, mermaidCode), 300);
      return () => clearTimeout(timer);
    }
  }, [isFullscreen, mermaidCode]);

  const handleCopyCode = async () => {
    if (!mermaidCode) return;
    try {
      await navigator.clipboard.writeText(mermaidCode);
      toast.success('Mermaid code copied to clipboard!', {
        style: {
          background: '#18181B',
          color: '#FFFFFF',
          border: '1px solid #3F3F46',
        },
      });
    } catch (error) {
      toast.error('Failed to copy code');
    }
  };

  const handleRetryRender = () => {
    setRenderAttempts(prev => prev + 1);
    toast.loading('Re-rendering diagram...', {
      duration: 1500,
      style: {
        background: '#18181B',
        color: '#FFFFFF',
        border: '1px solid #3F3F46',
      },
    });
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const toggleCodeView = () => {
    setShowCode(!showCode);
  };
  
  // High-resolution SVG export
  const exportAsSvg = async () => {
    if (!mermaidCode) return;
    
    const targetRef = isFullscreen ? fullscreenMermaidRef.current : mermaidRef.current;
    if (!targetRef) {
      toast.error('Diagram container not available');
      return;
    }
    
    try {
      setIsExporting(true);
      setExportType('svg');
      
      const svgElement = targetRef.querySelector('svg');
      if (!svgElement) {
        toast.error('SVG element not found in the diagram');
        return;
      }
      
      // Display toast to indicate processing is happening
      toast.loading('Generating HD SVG...', { 
        duration: 2000,
        style: {
          background: '#18181B',
          color: '#FFFFFF',
          border: '1px solid #3F3F46',
        }
      });
      
      // Use our utility function for high-resolution SVG export
      const svgData = await exportToHighResSvg(svgElement, {
        pixelRatio: 2,
        backgroundColor: '#0A0A0A',
        fontWeight: 'normal',
        removeClasses: ['controls'],
        style: {
          '.label': { 'font-weight': '500', 'font-size': '14px' },
          '.entityLabel': { 'font-weight': '600' },
          '.edgeLabel': { 'background-color': 'rgba(0,0,0,0.6)', 'border-radius': '3px', 'padding': '2px 4px' },
          '.relationshipLine': { 'stroke-width': '2px' }
        }
      });
      
      // Download the SVG file
      downloadDataUrl(svgData, `laymandb-diagram-hd.svg`);
      
      toast.success('HD SVG Diagram Downloaded!', {
        style: {
          background: '#18181B',
          color: '#FFFFFF',
          border: '1px solid #3F3F46',
        },
      });
    } catch (error) {
      console.error('Error exporting SVG:', error);
      toast.error(`Export failed: ${error.message || 'Unknown error'}`);
    } finally {
      setIsExporting(false);
      setExportType(null);
    }
  };
  
  // High-resolution PNG export
  const exportAsPng = async () => {
    if (!mermaidCode) return;
    
    const targetRef = isFullscreen ? fullscreenMermaidRef.current : mermaidRef.current;
    if (!targetRef) {
      toast.error('Diagram container not available');
      return;
    }
    
    try {
      setIsExporting(true);
      setExportType('png');
      
      const svgElement = targetRef.querySelector('svg');
      if (!svgElement) {
        toast.error('SVG element not found in the diagram');
        return;
      }
      
      // Display toast to indicate processing is happening
      toast.loading('Generating HD PNG...', { 
        duration: 3000,
        style: {
          background: '#18181B',
          color: '#FFFFFF',
          border: '1px solid #3F3F46',
        }
      });
      
      // Use our utility function for high-resolution PNG export
      const pngData = await exportToHighResPng(svgElement, {
        pixelRatio: 3, // Triple resolution for better quality
        backgroundColor: '#0A0A0A',
        fontWeight: '500',
        filter: (node) => !node.classList?.contains('controls'),
        style: {
          '.label': { 'font-weight': '500', 'font-size': '14px' },
          '.entityLabel': { 'font-weight': '600' },
          '.edgeLabel': { 'background-color': 'rgba(0,0,0,0.6)', 'border-radius': '3px', 'padding': '2px 4px' },
          '.relationshipLine': { 'stroke-width': '2px' }
        }
      });
      
      // Download the PNG file
      downloadDataUrl(pngData, `laymandb-diagram-hd.png`);
      
      toast.success('HD PNG Diagram Downloaded!', {
        style: {
          background: '#18181B',
          color: '#FFFFFF',
          border: '1px solid #3F3F46',
        },
      });
    } catch (error) {
      console.error('Error exporting PNG:', error);
      toast.error(`Export failed: ${error.message || 'Unknown error'}`);
    } finally {
      setIsExporting(false);
      setExportType(null);
    }
  };

  // Enhanced Fullscreen Mode
  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-[9999] bg-gradient-to-br from-[#09090B] via-[#0A0A0A] to-[#09090B]">
        {/* Enhanced Fullscreen Controls */}
              <Card className="absolute top-6 right-6 z-[10000] bg-[#18181B]/95 backdrop-blur-xl border-[#3F3F46] shadow-2xl">
          <CardContent className="flex items-center gap-2 p-3">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-10 w-10 bg-[#27272A] hover:bg-[#3F3F46] text-white transition-all duration-200 shadow-lg"
                    onClick={toggleCodeView}
                  >
                    {showCode ? <IconEyeOff className="h-5 w-5" /> : <IconCode className="h-5 w-5" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{showCode ? 'Hide Code' : 'Show Code'}</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className={`h-10 w-10 bg-[#27272A] hover:bg-[#3F3F46] text-white transition-all duration-200 shadow-lg ${isExporting && exportType === 'svg' ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={exportAsSvg}
                    disabled={isExporting}
                  >
                    {isExporting && exportType === 'svg' ? 
                      <IconLoader2 className="h-5 w-5 animate-spin" /> : 
                      <IconFileVector className="h-5 w-5" />
                    }
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Download HD SVG</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className={`h-10 w-10 bg-[#27272A] hover:bg-[#3F3F46] text-white transition-all duration-200 shadow-lg ${isExporting && exportType === 'png' ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={exportAsPng}
                    disabled={isExporting}
                  >
                    {isExporting && exportType === 'png' ? 
                      <IconLoader2 className="h-5 w-5 animate-spin" /> : 
                      <IconPhoto className="h-5 w-5" />
                    }
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Download HD PNG</p>
                </TooltipContent>
              </Tooltip>
              
              <Separator orientation="vertical" className="h-6 bg-[#3F3F46]" />
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-10 w-10 bg-red-600 hover:bg-red-700 text-white transition-all duration-200 shadow-lg"
                    onClick={toggleFullscreen}
                  >
                    <IconMinimize className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Exit Fullscreen</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardContent>
        </Card>        {/* Enhanced Status Badge */}
        <Badge 
          variant="secondary" 
          className="absolute top-6 left-1/2 transform -translate-x-1/2 z-[10000] bg-purple-600/20 text-purple-300 border-purple-600/30 backdrop-blur-sm px-4 py-2 text-sm font-medium"
        >
          Fullscreen Mode • Press ESC to exit
        </Badge>

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
                {/* Enhanced Fullscreen Zoom Controls */}
                <Card className="absolute top-6 left-6 z-[10000] bg-[#18181B]/95 backdrop-blur-xl border-[#3F3F46] shadow-2xl">
                  <CardContent className="flex flex-col gap-2 p-3">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className={`h-10 w-10 transition-all duration-200 shadow-lg ${
                              isDragging 
                                ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                                : 'bg-[#27272A] hover:bg-[#3F3F46] text-white'
                            }`}
                            onClick={() => setIsDragging(!isDragging)}
                          >
                            <IconArrowsMove className="h-5 w-5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{isDragging ? 'Disable Pan' : 'Enable Pan'}</p>
                        </TooltipContent>
                      </Tooltip>
                      
                      <Separator className="bg-[#3F3F46]" />
                      
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-10 w-10 bg-[#27272A] hover:bg-[#3F3F46] text-white transition-all duration-200 shadow-lg"
                            onClick={() => zoomIn(0.3)}
                          >
                            <IconZoomIn className="h-5 w-5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Zoom In</p>
                        </TooltipContent>
                      </Tooltip>
                      
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-10 w-10 bg-[#27272A] hover:bg-[#3F3F46] text-white transition-all duration-200 shadow-lg"
                            onClick={() => zoomOut(0.3)}
                          >
                            <IconZoomOut className="h-5 w-5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Zoom Out</p>
                        </TooltipContent>
                      </Tooltip>
                      
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-10 w-10 bg-[#27272A] hover:bg-[#3F3F46] text-white transition-all duration-200 shadow-lg"
                            onClick={() => resetTransform()}
                          >
                            <IconZoomReset className="h-5 w-5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Reset View</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </CardContent>
                </Card>
                
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
                    <Card className="diagram-container bg-gradient-to-br from-[#09090B] to-[#0A0A0A] border-[#27272A] shadow-2xl">
                      <CardContent className="p-8">
                        {isLoading && (
                          <div className="flex items-center justify-center min-w-[600px] min-h-[400px]">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                          </div>
                        )}
                        <div 
                          ref={fullscreenMermaidRef} 
                          className="diagram-content"
                          style={{ 
                            minWidth: isLoading ? '0' : '600px', 
                            minHeight: isLoading ? '0' : '400px',
                            maxWidth: 'none',
                            maxHeight: 'none'
                          }}
                        />
                      </CardContent>
                    </Card>
                  </div>
                </TransformComponent>
              </>
            )}
          </TransformWrapper>
        </div>

        {/* Enhanced Fullscreen Code Panel */}
        {showCode && (
          <Card className="absolute bottom-6 left-6 right-6 h-56 bg-[#18181B]/95 backdrop-blur-xl border-[#3F3F46] shadow-2xl z-[10000]">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2">
                  <IconCode className="h-5 w-5" />
                  Mermaid Code
                </CardTitle>
                <div className="flex items-center gap-2">
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
                    <IconX className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0 h-full">
              <ScrollArea className="h-full">
                <pre className="text-sm font-mono text-[#E4E4E7] leading-relaxed bg-[#0A0A0A] rounded-lg p-4 border border-[#27272A]">
                  <code>{mermaidCode}</code>
                </pre>
              </ScrollArea>
            </CardContent>
          </Card>
        )}

        {/* Enhanced Pan Status */}
        {isDragging && (
          <Badge 
            variant="secondary" 
            className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-[10000] bg-purple-600/20 text-purple-300 border-purple-600/30 backdrop-blur-sm px-6 py-3 text-sm font-medium"
          >
            🎯 Pan & Zoom Mode • Mouse wheel to zoom • Drag to pan
          </Badge>
        )}
      </div>
    );
  }

  // Enhanced Regular Mode
  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-[#0A0A0A] via-[#09090B] to-[#0A0A0A] relative">
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
              {/* Enhanced Control Panel */}
              <Card className="absolute top-4 right-4 z-20 bg-[#18181B]/90 backdrop-blur-sm border-[#3F3F46] shadow-xl">
                <CardContent className="flex items-center gap-1 p-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className={`h-9 w-9 transition-all duration-200 ${
                            isDragging 
                              ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                              : 'bg-[#27272A] hover:bg-[#3F3F46] text-white'
                          }`}
                          onClick={() => setIsDragging(!isDragging)}
                        >
                          <IconArrowsMove className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{isDragging ? 'Disable Pan' : 'Enable Pan'}</p>
                      </TooltipContent>
                    </Tooltip>
                    
                    <Separator orientation="vertical" className="h-6 bg-[#3F3F46]" />
                    
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-9 w-9 bg-[#27272A] hover:bg-[#3F3F46] text-white transition-all duration-200"
                          onClick={() => zoomIn(0.3)}
                        >
                          <IconZoomIn className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Zoom In</p>
                      </TooltipContent>
                    </Tooltip>
                    
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-9 w-9 bg-[#27272A] hover:bg-[#3F3F46] text-white transition-all duration-200"
                          onClick={() => zoomOut(0.3)}
                        >
                          <IconZoomOut className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Zoom Out</p>
                      </TooltipContent>
                    </Tooltip>
                    
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-9 w-9 bg-[#27272A] hover:bg-[#3F3F46] text-white transition-all duration-200"
                          onClick={() => resetTransform()}
                        >
                          <IconZoomReset className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Reset View</p>
                      </TooltipContent>
                    </Tooltip>
                    
                    <Separator orientation="vertical" className="h-6 bg-[#3F3F46]" />
                    
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className={`h-9 w-9 bg-[#27272A] hover:bg-[#3F3F46] text-white transition-all duration-200 ${isExporting && exportType === 'svg' ? 'opacity-50 cursor-not-allowed' : ''}`}
                          onClick={exportAsSvg}
                          disabled={isExporting}
                        >
                          {isExporting && exportType === 'svg' ? 
                            <IconLoader2 className="h-4 w-4 animate-spin" /> : 
                            <IconFileVector className="h-4 w-4" />
                          }
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Download HD SVG</p>
                      </TooltipContent>
                    </Tooltip>
                    
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className={`h-9 w-9 bg-[#27272A] hover:bg-[#3F3F46] text-white transition-all duration-200 ${isExporting && exportType === 'png' ? 'opacity-50 cursor-not-allowed' : ''}`}
                          onClick={exportAsPng}
                          disabled={isExporting}
                        >
                          {isExporting && exportType === 'png' ? 
                            <IconLoader2 className="h-4 w-4 animate-spin" /> : 
                            <IconPhoto className="h-4 w-4" />
                          }
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Download HD PNG</p>
                      </TooltipContent>
                    </Tooltip>
                    
                    <Separator orientation="vertical" className="h-6 bg-[#3F3F46]" />
                    
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-9 w-9 bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200"
                          onClick={toggleFullscreen}
                        >
                          <IconMaximize className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Enter Fullscreen</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </CardContent>
              </Card>
              
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
                  <Card className="diagram-container bg-gradient-to-br from-[#09090B] to-[#0A0A0A] border-[#27272A] shadow-xl">
                    <CardContent className="p-6">
                      {isLoading && (
                        <div className="flex items-center justify-center min-w-[400px] min-h-[300px]">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                        </div>
                      )}
                      <div 
                        ref={mermaidRef} 
                        className="diagram-content"
                        style={{ 
                          minWidth: isLoading ? '0' : '400px', 
                          minHeight: isLoading ? '0' : '300px',
                          maxWidth: 'none',
                          maxHeight: 'none'
                        }}
                      />
                    </CardContent>
                  </Card>
                </div>
              </TransformComponent>
            </>
          )}
        </TransformWrapper>
        
        {/* Enhanced Status Indicators */}
        {isDragging && (
          <Badge 
            variant="secondary" 
            className="absolute bottom-4 left-4 z-10 bg-purple-600/20 text-purple-300 border-purple-600/30 backdrop-blur-sm px-4 py-2 text-sm font-medium"
          >
            🎯 Pan & Zoom Enabled
          </Badge>
        )}
        
        {renderError && (
          <Card className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-20 bg-red-600/10 border-red-600/30">
            <CardContent className="flex items-center gap-3 p-4">
              <p className="text-red-400 text-sm">Render failed</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRetryRender}
                className="bg-red-600 hover:bg-red-700 text-white border-red-600"
              >
                <IconRefresh className="w-4 h-4 mr-2" />
                Retry
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Enhanced Collapsible Code Section */}
      {showCode && (
        <Card className="border-t-0 rounded-t-none bg-[#09090B] border-[#27272A] shadow-2xl z-30">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2 text-base">
                <IconCode className="h-5 w-5" />
                Mermaid Code
              </CardTitle>
              <div className="flex items-center gap-2">
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
                  <IconEyeOff className="w-4 h-4 mr-1" />
                  Hide
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <ScrollArea className="h-40">
              <pre className="text-sm font-mono text-[#E4E4E7] leading-relaxed bg-[#0A0A0A] rounded-lg p-4 border border-[#27272A]">
                <code>{mermaidCode}</code>
              </pre>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Code Toggle Button */}
      {!showCode && (
        <div className="absolute bottom-4 right-4 z-10">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={toggleCodeView}
                  className="bg-[#18181B]/90 text-white border-[#3F3F46] hover:bg-[#27272A] backdrop-blur-sm shadow-lg"
                >
                  <IconCode className="w-4 h-4 mr-2" />
                  Show Code
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>View Mermaid source code</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}
    </div>
  );
}