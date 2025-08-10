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
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('The request is taking longer than expected. The server might be overloaded.'));
        }, 90000);
      });
      await Promise.race([
        generateSchema(prompt),
        timeoutPromise
      ]);
      setPrompt('');
    } catch (err) {
      console.error('Schema generation error:', err);
      let userMessage = err.message || 'Failed to generate schema. Please try again.';
      if (err.message?.includes('timed out') || err.message?.includes('longer than expected')) {
        userMessage = 'The request timed out. Try again with a simpler prompt or check your server connection.';
      } else if (err.message?.includes('network') || err.message?.includes('ECONNREFUSED') || err.message?.includes('ECONNRESET')) {
        userMessage = 'Network error: Could not connect to the server. Make sure the backend is running.';
      } else if (err.message?.includes('certificate')) {
        userMessage = 'SSL certificate error with external API. This is a development environment issue.';
      }
      setError(userMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto bg-[#000000] border-2 border-[#1F2937] transition-all duration-300 shadow-lg shadow-black/20">
      <CardHeader className="space-y-1 pb-3 border-b border-[#1F2937]">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-xl bg-[#FFFFFF] transition-colors duration-300 shadow-lg">
            <Database className="h-7 w-7 text-[#000000]" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-[#FFFFFF] tracking-tight">
              Schema Generator
            </CardTitle>
            <p className="text-sm text-[#9CA3AF] mt-1 font-light tracking-wide">
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
              className="text-sm font-semibold text-[#F3F4F6] font-sans tracking-wide"
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
                  "bg-[#000000]",
                  "border-2 border-[#1F2937]",
                  "text-[#F3F4F6]",
                  "placeholder:text-[#9CA3AF]",
                  "focus:border-[#FFFFFF]",
                  "focus:ring-2 focus:ring-white/10",
                  "hover:border-[#4B5563]",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  isFocused && "shadow-lg",
                  error && "border-red-400 focus:border-red-400 focus:ring-red-500/10"
                )}
              />
            </div>

            {error && (
              <div className="flex items-center space-x-2 p-2 rounded-lg bg-red-900/20 border border-red-800">
                <div className="w-2 h-2 rounded-full bg-red-400" />
                <p className="text-sm text-[#F87171]">
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
                "border-2 border-[#1F2937]",
                "bg-[#000000]",
                "text-[#D1D5DB]",
                "hover:bg-[#111827]",
                "hover:border-[#4B5563]",
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
                "bg-[#FFFFFF]",
                "text-[#000000]",
                "hover:bg-[#E5E7EB]",
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