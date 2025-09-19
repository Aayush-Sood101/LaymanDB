import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { IconDownload, IconLoader2, IconSchema } from '@tabler/icons-react';
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
        <div className="flex flex-col items-center justify-center h-full gap-2 text-neutral-500">
          <IconLoader2 className="w-8 h-8 animate-spin text-white" />
          <p className="text-lg font-medium text-white">Generating Diagram...</p>
        </div>
      );
    }
    if (!mermaidCode) {
      return (
        <div className="flex flex-col items-center justify-center h-full gap-4 text-neutral-700">
          <IconSchema className="w-12 h-12" />
          <p className="font-medium text-neutral-500">Your Diagram Will Appear Here</p>
        </div>
      );
    }
    return <ResultView mermaidCode={mermaidCode} />;
  };

  return (
    <div className="flex flex-col h-full">
      <CardHeader className="flex-row items-center justify-between p-4 border-b border-neutral-800">
        <div className="space-y-1">
          <CardTitle className="text-lg font-semibold text-white">Generated ER Diagram</CardTitle>
          <CardDescription className="text-neutral-400">Visualize, pan, zoom, and review the code.</CardDescription>
        </div>
        {mermaidCode && (
          <Button variant="outline" size="sm" onClick={handleDownload} className="gap-2 bg-transparent border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:text-white">
            <IconDownload className="w-4 h-4" />
            Download .mmd
          </Button>
        )}
      </CardHeader>
      
      <CardContent className="flex-grow p-0 relative">
        <div className="absolute inset-0 size-full bg-black bg-[radial-gradient(#fafafa_1px,transparent_1px)] [background-size:32px_32px] opacity-10"></div>
        <div className="relative w-full h-full">
          {renderContent()}
        </div>
      </CardContent>
    </div>
  );
}