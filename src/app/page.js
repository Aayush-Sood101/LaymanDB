"use client";

import { SchemaProvider } from '@/contexts/SchemaContext';
import PromptInputPanel from '@/components/PromptInputPanel';
import SchemaVisualization from '@/components/SchemaVisualization';
import SessionHistory from '@/components/SessionHistory';
import ExportDialog from '@/components/ExportDialog';
import Image from "next/image";

export default function Home() {
  return (
    <SchemaProvider>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        {/* Header */}
        <header className="bg-white shadow-md border-b border-blue-100">
          <div className="max-w-7xl mx-auto px-4 py-5 sm:px-6 lg:px-8 flex justify-between items-center">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-2 rounded-lg shadow-md mr-4">
                <Image 
                  src="/file.svg" 
                  alt="Database Creator Logo" 
                  width={28} 
                  height={28} 
                  className="text-white"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
                  Database Creator
                </h1>
                <p className="text-xs text-gray-500">Design • Visualize • Generate</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center text-sm text-gray-500 bg-blue-50 py-1 px-3 rounded-full">
                <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                Intelligent Database Design Platform
              </div>
              <a href="https://github.com/yourusername/database-creator" target="_blank" rel="noopener noreferrer" 
                 className="flex items-center text-gray-600 hover:text-blue-600 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
        </header>
        
        {/* Main content */}
        <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left column */}
            <div className="lg:col-span-3 space-y-5">
              <PromptInputPanel />
              <SessionHistory />
            </div>
            
            {/* Right column */}
            <div className="lg:col-span-9 h-[calc(100vh-10rem)]">
              <SchemaVisualization />
            </div>
          </div>
        </main>
        
        {/* Export dialog */}
        <ExportDialog />
      </div>
    </SchemaProvider>
  );
}
