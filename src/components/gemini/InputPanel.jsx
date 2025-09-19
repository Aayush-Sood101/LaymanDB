// src/components/gemini/InputPanel.jsx

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { IconLoader2, IconSparkles } from '@tabler/icons-react';

export function InputPanel({ inputText, setInputText, isGenerating, onSubmit }) {
  return (
    <Card className="flex flex-col h-full border-0 rounded-r-none bg-[#09090B] border-[#27272A]">
      <CardHeader className="flex-row items-center justify-between bg-[#18181B] border-b border-[#27272A] rounded-tl-lg">
        <div className="space-y-1">
          <CardTitle className="text-white">Input Description</CardTitle>
          <CardDescription className="text-[#A1A1AA]">Provide a natural language prompt.</CardDescription>
        </div>
        <Button 
          onClick={onSubmit} 
          disabled={isGenerating || !inputText.trim()} 
          size="sm" 
          className="gap-2 bg-[#6D28D9] hover:bg-[#5B21B6] text-white disabled:bg-[#3F3F46] disabled:text-[#A1A1AA]"
        >
          {isGenerating ? <IconLoader2 className="w-4 h-4 animate-spin" /> : <IconSparkles className="w-4 h-4" />}
          {isGenerating ? 'Generating...' : 'Generate'}
        </Button>
      </CardHeader>
      <CardContent className="flex-grow">
        <Textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="e.g., An online store with users, products, and orders. A user can have multiple orders, and an order can contain many products..."
          className="h-full text-base font-mono resize-none bg-[#0A0A0A] border-[#27272A] text-white placeholder:text-[#71717A]"
        />
      </CardContent>
      <CardFooter className="bg-[#18181B] border-t border-[#27272A]">
        <p className="text-xs text-[#A1A1AA]">The more detailed your description, the better the result.</p>
      </CardFooter>
    </Card>
  );
}