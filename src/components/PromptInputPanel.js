"use client";

import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useSchemaContext } from '@/contexts/SchemaContext';
import { Pencil, Loader2, FileText, Trash2, Database, Wand2, BookOpen, ChevronDown, Plus, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import Input from '@/components/ui/Input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Example prompts from sample-inputs.md
const EXAMPLE_PROMPTS = [
  {
    title: "E-commerce Database",
    prompt: "Create a database for an e-commerce platform with products, categories, customers, and orders. Products have attributes like name, price, description, and inventory count. Products belong to multiple categories. Customers can place multiple orders. Each order contains multiple products with quantities. Orders have status, date, and payment information."
  },
  {
    title: "Blog/CMS",
    prompt: "Design a schema for a blog platform where users can write and publish articles. Articles have a title, content, publication date, and status (draft or published). Users can have roles (admin, editor, author, reader). Articles can have multiple tags and belong to categories. Readers can leave comments on articles. Track article view counts and user engagement metrics."
  },
  {
    title: "Hospital Management",
    prompt: "Create a database for a hospital with departments, doctors, patients, and appointments. Doctors belong to specific departments and have specializations. Patients can have multiple medical records, prescriptions, and appointments. Each appointment links a patient with a doctor at a specific time and date. Prescriptions include medications with dosage instructions. Medical records include diagnoses, treatments, and test results."
  },
  {
    title: "School/University System",
    prompt: "Design a database for a university with students, professors, courses, and departments. Students enroll in multiple courses each semester. Professors belong to departments and teach specific courses. Each course has a schedule, location, and credit hours. Track student attendance, assignments, and grades. Departments offer specific degree programs with required courses."
  },
  {
    title: "Inventory Management",
    prompt: "Create a database for inventory management across multiple warehouses. Products have categories, suppliers, cost, and selling prices. Track product quantities across different warehouse locations. Record inventory movements (receipts, transfers, adjustments, sales). Suppliers provide multiple products with varying lead times and minimum order quantities. Include purchase orders with status tracking from order to delivery."
  }
];

const PromptInputPanel = () => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [error, setError] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [customExamples, setCustomExamples] = useState([]);
  const [showAddExample, setShowAddExample] = useState(false);
  const [newExampleTitle, setNewExampleTitle] = useState('');
  
  const { generateSchema } = useSchemaContext();
  
  const handleExampleSelect = (examplePrompt) => {
    setPrompt(examplePrompt);
    setError('');
  };
  
  const handleAddCustomExample = () => {
    if (prompt.trim() && newExampleTitle.trim()) {
      const newExample = {
        title: newExampleTitle,
        prompt: prompt
      };
      setCustomExamples([...customExamples, newExample]);
      setNewExampleTitle('');
      setShowAddExample(false);
    }
  };

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

  const handleOptimizePrompt = async () => {
    if (!prompt.trim()) {
      setError('Please enter a description to optimize');
      return;
    }
    setIsOptimizing(true);
    setError('');
    try {
      const response = await fetch('/api/schema/optimize-prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to optimize prompt');
      }

      const { optimizedPrompt } = await response.json();
      setPrompt(optimizedPrompt);
    } catch (err) {
      console.error('Prompt optimization error:', err);
      setError(`Optimization failed: ${err.message}`);
    } finally {
      setIsOptimizing(false);
    }
  };

  return (
    <Card className="w-full h-auto max-w-xs sm:max-w-sm mx-auto bg-[#000000] border-2 border-[#1F2937] transition-all duration-300 shadow-lg shadow-black/20">
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
                rows={5}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                disabled={isLoading}
                className={cn(
                  "min-h-[120px] max-h-[250px] resize-none overflow-y-auto transition-all duration-300",
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
          
          {showAddExample && (
            <div className="space-y-2 p-3 rounded-md bg-[#111827] border border-[#1F2937]">
              <Label
                htmlFor="exampleTitle"
                className="text-sm font-medium text-[#F3F4F6]"
              >
                Name your example prompt
              </Label>
              <Input
                id="exampleTitle"
                placeholder="Give your prompt a descriptive name..."
                value={newExampleTitle}
                onChange={(e) => setNewExampleTitle(e.target.value)}
                className={cn(
                  "bg-[#000000]",
                  "border-2 border-[#1F2937]",
                  "text-[#F3F4F6]",
                  "placeholder:text-[#9CA3AF]",
                  "focus:border-[#FFFFFF]",
                  "h-9"
                )}
              />
              <div className="flex justify-end pt-2 space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddExample(false)}
                  className={cn(
                    "border border-[#1F2937]",
                    "bg-[#000000]",
                    "text-[#D1D5DB]",
                    "hover:bg-[#111827]",
                    "h-8 px-3"
                  )}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAddCustomExample}
                  disabled={!prompt.trim() || !newExampleTitle.trim()}
                  className={cn(
                    "bg-[#3B82F6]",
                    "text-white",
                    "hover:bg-[#2563EB]",
                    "h-8 px-3"
                  )}
                >
                  <Save className="h-3.5 w-3.5 mr-1.5" />
                  Save Example
                </Button>
              </div>
            </div>
          )}
          
          <div className="flex justify-center pt-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isLoading || isOptimizing}
                  className={cn(
                    "border-2 border-[#1F2937]",
                    "bg-[#000000]",
                    "text-[#D1D5DB]",
                    "hover:bg-[#111827]",
                    "hover:border-[#4B5563]",
                    "transition-all duration-200",
                    "disabled:opacity-50",
                    "h-9 px-3"
                  )}
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Use Example Prompt
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-[#0F1629] border-2 border-[#1F2937] text-[#D1D5DB] p-1 w-64">
                {EXAMPLE_PROMPTS.map((example, index) => (
                  <DropdownMenuItem 
                    key={index}
                    onClick={() => handleExampleSelect(example.prompt)}
                    className="cursor-pointer hover:bg-[#1F2937] focus:bg-[#1F2937] py-2 px-3 rounded-md"
                  >
                    {example.title}
                  </DropdownMenuItem>
                ))}
                
                {customExamples.length > 0 && (
                  <>
                    <DropdownMenuSeparator className="my-2 bg-[#2D3748]" />
                    {customExamples.map((example, index) => (
                      <DropdownMenuItem 
                        key={`custom-${index}`}
                        onClick={() => handleExampleSelect(example.prompt)}
                        className="cursor-pointer hover:bg-[#1F2937] focus:bg-[#1F2937] py-2 px-3 rounded-md"
                      >
                        {example.title} (Custom)
                      </DropdownMenuItem>
                    ))}
                  </>
                )}
                
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex justify-center pt-2 pb-2">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={handleOptimizePrompt}
              disabled={isLoading || isOptimizing || !prompt.trim()}
              className={cn(
                "border-2 border-[#1F2937]",
                "bg-[#111827]",
                "text-[#D1D5DB]",
                "hover:bg-[#1F2937]",
                "hover:border-[#4B5563]",
                "transition-all duration-200",
                "disabled:opacity-50",
                "h-11 w-full max-w-[95%]"
              )}
            >
              {isOptimizing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Optimizing Prompt...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4 mr-2" />
                  AI Fix - Improve My Prompt
                </>
              )}
            </Button>
          </div>

          <div className="flex justify-center space-x-3 pt-2">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => setPrompt('')}
              disabled={isLoading || isOptimizing || !prompt}
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
              disabled={isLoading || isOptimizing || !prompt.trim()}
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