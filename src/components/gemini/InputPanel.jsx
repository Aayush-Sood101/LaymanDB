import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { IconLoader2, IconSparkles } from '@tabler/icons-react';

export function InputPanel({ inputText, setInputText, isGenerating, onSubmit }) {
  return (
    <div className="flex flex-col h-full">
      <CardHeader className="p-4 border-b border-neutral-800">
        <CardTitle className="text-lg font-semibold text-white">Input Description</CardTitle>
        <CardDescription className="text-neutral-400">Provide a natural language prompt.</CardDescription>
      </CardHeader>
      
      <div className="flex-grow p-4">
        <Textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="e.g., A blog with users, posts, and comments. A user can write many posts..."
          className="h-full w-full resize-none rounded-md border border-neutral-700 bg-black p-4 font-mono text-sm text-neutral-200 placeholder:text-neutral-600 focus-visible:ring-1 focus-visible:ring-white focus-visible:ring-offset-0"
        />
      </div>

      <CardFooter className="p-4 border-t border-neutral-800">
        <Button
          onClick={onSubmit}
          disabled={isGenerating || !inputText.trim()}
          size="lg"
          className="w-full gap-2 bg-white text-black font-bold hover:bg-neutral-200 disabled:bg-neutral-800 disabled:text-neutral-500 disabled:cursor-not-allowed"
        >
          {isGenerating ? <IconLoader2 className="w-5 h-5 animate-spin" /> : <IconSparkles className="w-5 h-5" />}
          {isGenerating ? 'Generating...' : 'Generate'}
        </Button>
      </CardFooter>
    </div>
  );
}