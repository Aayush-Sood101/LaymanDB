import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { IconLoader2, IconSparkles, IconInfoCircle, IconWand } from '@tabler/icons-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useState } from 'react';
import toast from 'react-hot-toast';

export function InputPanel({ inputText, setInputText, isGenerating, onSubmit }) {
  const characterCount = inputText.length;
  const maxCharacters = 5000;
  const [isEnhancing, setIsEnhancing] = useState(false);
  
  const handleAIFix = async () => {
    if (!inputText.trim()) {
      toast.error('Please enter a prompt to enhance');
      return;
    }
    
    setIsEnhancing(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      const response = await fetch('/api/gemini/prompt/enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: inputText }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }
      
      const data = await response.json();
      if (!data.success || !data.enhancedPrompt) {
        throw new Error(data.error || 'Failed to enhance the prompt.');
      }
      
      setInputText(data.enhancedPrompt);
      toast.success('Prompt enhanced successfully!');
    } catch (error) {
      console.error('Error enhancing prompt:', error);
      const errorMessage = error.name === 'AbortError'
        ? 'Request timed out. Try a simpler prompt.'
        : error.message || 'An unknown error occurred.';
      toast.error(errorMessage);
    } finally {
      setIsEnhancing(false);
    }
  };
  
  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-neutral-950 via-black to-neutral-900">
      {/* Enhanced Header */}
      <CardHeader className="p-5 border-b border-neutral-800/60 bg-gradient-to-r from-neutral-900/40 to-neutral-800/20 backdrop-blur-sm">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-neutral-700 to-neutral-800 flex items-center justify-center shadow-lg">
                <IconSparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold text-white tracking-tight">
                  Database Description
                </CardTitle>
                <CardDescription className="text-neutral-400 text-sm mt-1">
                  Describe your database schema in natural language
                </CardDescription>
              </div>
            </div>
          </div>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="p-2 rounded-lg bg-neutral-800/50 hover:bg-neutral-700/50 transition-colors cursor-help">
                  <IconInfoCircle className="w-4 h-4 text-neutral-400 hover:text-white transition-colors" />
                </div>
              </TooltipTrigger>
              <TooltipContent className="bg-neutral-800 border-neutral-700 text-white max-w-sm">
                <p className="text-sm">
                  Provide a detailed description of your database structure, including entities, relationships, and constraints.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      
      <div className="p-5 relative">
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-neutral-800/20 via-neutral-700/10 to-neutral-800/20 blur-sm rounded-lg"></div>
          <Textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Example: A blog platform with users, posts, and comments. Each user can create multiple posts..."
            maxLength={maxCharacters}
            className="h-72 w-full resize-none rounded-lg border border-neutral-700/60 bg-neutral-950/80 backdrop-blur-sm p-4 font-mono text-sm text-neutral-100 placeholder:text-neutral-500 focus-visible:ring-2 focus-visible:ring-neutral-400/50 focus-visible:ring-offset-0 shadow-inner shadow-black/50 relative transition-all duration-200"
            style={{ 
              lineHeight: '1.6',
            }}
          />
          
          <div className="absolute bottom-3 right-3">
            <Badge 
              variant="outline" 
              className={`text-xs backdrop-blur-sm ${
                characterCount > maxCharacters * 0.9 
                  ? 'bg-red-900/20 text-red-400 border-red-700/50' 
                  : 'bg-neutral-800/50 text-neutral-400 border-neutral-600/50'
              }`}
            >
              {characterCount}/{maxCharacters}
            </Badge>
          </div>
        </div>
      </div>

      {/* REMOVED: The spacer div that was pushing the footer down is now gone. */}

      <Separator className="bg-neutral-800/60" />

      {/* Enhanced Footer */}
      <CardFooter className="p-5 bg-gradient-to-r from-neutral-900/30 to-neutral-800/10 backdrop-blur-sm">
        <div className="w-full space-y-3">
          <div className="flex gap-3 w-full">
            {/* AI Fix Button */}
            <Button
              onClick={handleAIFix}
              disabled={isEnhancing || isGenerating || !inputText.trim() || characterCount > maxCharacters}
              size="lg"
              className="flex-1 gap-3 py-5 bg-gradient-to-r from-neutral-800 to-neutral-900 hover:from-neutral-700 hover:to-neutral-800 text-white font-bold shadow-xl shadow-black/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 rounded-lg border border-neutral-600/30"
            >
              {isEnhancing ? 
                <IconLoader2 className="w-5 h-5 animate-spin" /> : 
                <IconWand className="w-5 h-5" />
              }
              <span className="text-sm font-semibold">
                {isEnhancing ? 'Enhancing Prompt...' : 'AI Fix'}
              </span>
            </Button>
            
            {/* Generate ER Diagram Button */}
            <Button
              onClick={onSubmit}
              disabled={isGenerating || isEnhancing || !inputText.trim() || characterCount > maxCharacters}
              size="lg"
              className="flex-1 gap-3 py-5 bg-gradient-to-r from-neutral-800 to-neutral-900 hover:from-neutral-700 hover:to-neutral-800 text-white font-bold shadow-xl shadow-black/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 rounded-lg border border-neutral-600/30"
            >
              {isGenerating ? 
                <IconLoader2 className="w-5 h-5 animate-spin" /> : 
                <IconSparkles className="w-5 h-5" />
              }
              <span className="text-sm font-semibold">
                {isGenerating ? 'Generating..' : 'Generate'}
              </span>
            </Button>
          </div>
          
          {inputText.trim() && !isGenerating && !isEnhancing && (
            <p className="text-xs text-neutral-500 text-center">
              Ready to generate • {inputText.trim().split(/\s+/).length} words
            </p>
          )}
        </div>
      </CardFooter>
    </div>
  );
}