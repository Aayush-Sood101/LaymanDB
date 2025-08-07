"use client";

import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useSchemaContext } from '@/contexts/SchemaContext';
import { Pencil, Loader2, FileText, Trash2, Database } from 'lucide-react';
import { cn } from '@/lib/utils';

const PromptInputPanel = () => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  
  const { generateSchema } = useSchemaContext();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!prompt.trim()) {
      setError('Please enter a description of your database');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      await generateSchema(prompt);
      setPrompt('');
    } catch (err) {
      setError(err.message || 'Failed to generate schema. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card className="w-full max-w-2xl mx-auto bg-white dark:bg-black border-2 border-gray-200 dark:border-gray-800 shadow-xl transition-all duration-300 hover:shadow-2xl">
      <CardHeader className="space-y-1 pb-3 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-xl bg-black dark:bg-white transition-colors duration-300 shadow-lg">
            <Database className="h-7 w-7 text-white dark:text-black" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-black dark:text-white tracking-tight">
              Schema Generator
            </CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 font-light tracking-wide">
              Generate database schemas with AI
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 p-4 pt-2">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-2">
            <Label 
              htmlFor="prompt" 
              className="text-sm font-semibold text-gray-900 dark:text-gray-100 font-sans tracking-wide"
            >
              Database Description
            </Label>
            
            <div className="relative">
              <Textarea
                id="prompt"
                placeholder="Describe your database entities, relationships, and requirements in detail..."
                rows={6}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                disabled={isLoading}
                className={cn(
                  "min-h-[160px] max-h-[160px] resize-none overflow-y-auto transition-all duration-300",
                  "bg-white dark:bg-black",
                  "border-2 border-gray-200 dark:border-gray-800",
                  "text-gray-900 dark:text-gray-100",
                  "placeholder:text-gray-500 dark:placeholder:text-gray-400",
                  "focus:border-black dark:focus:border-white",
                  "focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10",
                  "hover:border-gray-400 dark:hover:border-gray-600",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  isFocused && "shadow-lg",
                  error && "border-red-500 dark:border-red-400 focus:border-red-500 focus:ring-red-500/10"
                )}
              />
            </div>
            
            {error && (
              <div className="flex items-center space-x-2 p-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <p className="text-sm text-red-700 dark:text-red-400">
                  {error}
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-center space-x-3 pt-3">
            <Button 
              type="button" 
              variant="outline"
              size="lg"
              onClick={() => setPrompt('')}
              disabled={isLoading || !prompt}
              className={cn(
                "border-2 border-gray-200 dark:border-gray-800",
                "bg-white dark:bg-black",
                "text-gray-700 dark:text-gray-300",
                "hover:bg-gray-50 dark:hover:bg-gray-900",
                "hover:border-gray-400 dark:hover:border-gray-600",
                "transition-all duration-200",
                "disabled:opacity-50",
                "h-11 px-6"
              )}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear
            </Button>
            
            <Button
              type="submit"
              size="lg"
              disabled={isLoading || !prompt.trim()}
              className={cn(
                "bg-black dark:bg-white",
                "text-white dark:text-black",
                "hover:bg-gray-800 dark:hover:bg-gray-200",
                "shadow-lg hover:shadow-xl",
                "transition-all duration-200",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "font-medium tracking-wide h-11 px-8"
              )}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Generate
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default PromptInputPanel;