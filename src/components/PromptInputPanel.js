"use client";

import React, { useState } from 'react';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import { useSchemaContext } from '@/contexts/SchemaContext';

const PromptInputPanel = () => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
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
  
  const examplePrompts = [
    "Create a database for a school with students, teachers, classes, and enrollments.",
    "Design a blog system with users, posts, comments, and categories.",
    "Build a CRM database with customers, contacts, deals, and activities.",
    "Create an inventory management system for products, suppliers, orders, and warehouses."
  ];
  
  const handleUseExample = (example) => {
    setPrompt(example);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md border border-blue-100 overflow-hidden animate-fade-in">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 py-3 px-5">
        <h2 className="text-lg font-bold text-white flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
          </svg>
          Describe Your Database
        </h2>
      </div>
      
      <div className="p-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            label="Enter a natural language description of your database schema:"
            id="prompt"
            placeholder="Describe your database entities and their relationships..."
            rows={5}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            error={error}
            disabled={isLoading}
            className="focus:border-blue-500 focus:ring-blue-200"
          />
          
          <div className="text-sm text-gray-500">
            <p className="mb-2">Example prompts (click to use):</p>
            <div className="flex flex-wrap gap-2">
              {examplePrompts.map((example, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleUseExample(example)}
                  className="bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs py-1 px-2 rounded-md transition-colors duration-200 border border-blue-200"
                  disabled={isLoading}
                >
                  {example.substring(0, 30)}...
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setPrompt('')}
              disabled={isLoading || !prompt}
              className="border-gray-300 hover:bg-gray-100"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
              Clear
            </Button>
            
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Generating Schema...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
                  </svg>
                  <span>Generate Schema</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PromptInputPanel;
