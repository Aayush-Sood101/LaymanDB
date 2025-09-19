// OutputPanel.jsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { IconDownload, IconLoader2, IconSchema } from '@tabler/icons-react';
import { Badge } from '@/components/ui/badge';
import { ResultView } from './ResultView';
import toast from 'react-hot-toast';

export function OutputPanel({ mermaidCode, isGenerating }) {
  const handleDownload = () => {
    if (!mermaidCode) {
      toast.error('No diagram to download');
      return;
    }
    const blob = new Blob([mermaidCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'laymandb-diagram.mmd';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Diagram code (.mmd) downloaded!');
  };

  const renderContent = () => {
    if (isGenerating) {
      return (
        <div className="flex flex-col items-center justify-center h-full gap-4">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-neutral-600 to-neutral-400 opacity-20 animate-ping"></div>
            <IconLoader2 className="w-10 h-10 animate-spin text-white relative z-10" />
          </div>
          <div className="text-center space-y-2">
            <p className="text-lg font-semibold text-white">Generating Diagram...</p>
            <p className="text-sm text-neutral-400 max-w-md">
              Processing your database description and creating the ER diagram
            </p>
          </div>
          <div className="flex space-x-2">
            <div className="w-2 h-2 bg-neutral-600 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-neutral-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          </div>
        </div>
      );
    }
    
    if (!mermaidCode) {
      return (
        <div className="flex flex-col items-center justify-center h-full gap-6 text-neutral-600">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-neutral-700 to-neutral-600 opacity-10 blur-xl"></div>
            <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-neutral-800 to-neutral-900 flex items-center justify-center shadow-2xl relative z-10">
              <IconSchema className="w-10 h-10 text-neutral-400" />
            </div>
          </div>
          <div className="text-center space-y-2">
            <p className="text-lg font-semibold text-neutral-400">Ready for Your Diagram</p>
            <p className="text-sm text-neutral-500 max-w-md">
              Your generated ER diagram will appear here with interactive controls for viewing and editing
            </p>
          </div>
        </div>
      );
    }
    
    return <ResultView mermaidCode={mermaidCode} />;
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-neutral-950 via-black to-neutral-900">
      {/* Enhanced Header */}
      <CardHeader className="flex-row items-center justify-between p-5 border-b border-neutral-800/60 bg-gradient-to-r from-neutral-900/40 to-neutral-800/20 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-neutral-700 to-neutral-800 flex items-center justify-center shadow-lg">
            <IconSchema className="w-4 h-4 text-white" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-lg font-bold text-white tracking-tight">
              Generated ER Diagram
            </CardTitle>
            <CardDescription className="text-neutral-400 text-sm">
              Interactive visualization with zoom, pan, and export options
            </CardDescription>
          </div>
        </div>
        
        {mermaidCode && (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-green-900/20 text-green-400 border-green-700/50 text-xs px-2 py-1">
              Generated
            </Badge>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleDownload} 
              className="gap-2 bg-neutral-800/50 border-neutral-600/50 text-neutral-300 hover:bg-neutral-700/50 hover:text-white hover:border-neutral-500 transition-all duration-200 text-xs px-3 py-1 h-8"
            >
              <IconDownload className="w-3 h-3" />
              Export .mmd
            </Button>
          </div>
        )}
      </CardHeader>
      
      {/* Enhanced Content Area */}
      <CardContent className="flex-grow p-0 relative overflow-hidden">
        {/* Grid Background */}
        <div className="absolute inset-0 bg-black bg-[radial-gradient(#404040_1px,transparent_1px)] [background-size:24px_24px] opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-900/5 via-transparent to-neutral-800/5"></div>
        
        {/* Content */}
        <div className="relative w-full h-full">
          {renderContent()}
        </div>
        
        {/* Corner Decorations */}
        <div className="absolute top-0 left-0 w-24 h-24 bg-gradient-to-br from-neutral-800/5 to-transparent rounded-br-full"></div>
        <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tl from-neutral-800/5 to-transparent rounded-tl-full"></div>
      </CardContent>
    </div>
  );
}