// src/components/gemini/OutputPanel.jsx

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { IconDownload, IconLoader2, IconLayoutGrid } from '@tabler/icons-react';
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
        <div className="flex flex-col items-center justify-center h-full gap-4 text-[#A1A1AA]">
          <IconLoader2 className="w-8 h-8 animate-spin text-[#6D28D9]" />
          <p className="text-lg font-semibold text-white">Generating Diagram</p>
          <p className="text-sm">Gemini is thinking... this may take a moment.</p>
        </div>
      );
    }

    if (!mermaidCode) {
      return (
        <div className="flex flex-col items-center justify-center h-full gap-4 text-[#A1A1AA]">
          <IconLayoutGrid className="w-12 h-12" />
          <p className="text-lg font-semibold text-white">Your Diagram Will Appear Here</p>
          <p className="text-sm text-center">Enter a description and click "Generate" to start.</p>
        </div>
      );
    }

    return <ResultView mermaidCode={mermaidCode} />;
  };

  return (
    <Card className="flex flex-col h-full border-0 rounded-l-none bg-[#09090B] border-[#27272A]">
      <CardHeader className="flex-row items-center justify-between bg-[#18181B] border-b border-[#27272A] rounded-tr-lg">
        <div className="space-y-1">
          <CardTitle className="text-white">Generated ER Diagram</CardTitle>
          <CardDescription className="text-[#A1A1AA]">Visualize your schema and review the code.</CardDescription>
        </div>
        {mermaidCode && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleDownload} 
            className="gap-2 bg-[#27272A] text-white border-[#3F3F46] hover:bg-[#3F3F46]"
          >
            <IconDownload className="w-4 h-4" />
            Download .mmd
          </Button>
        )}
      </CardHeader>
      <CardContent className="flex-grow p-0">
        {renderContent()}
      </CardContent>
    </Card>
  );
}