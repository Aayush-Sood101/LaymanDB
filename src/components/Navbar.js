"use client";

import { Database, Github } from "lucide-react";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm shadow-sm border-b border-blue-100">
      <div className="w-full px-3 py-3 sm:px-6 flex justify-between items-center">
        <div className="flex items-center">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-2 rounded-lg shadow-md mr-3 flex items-center justify-center">
            <Database size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
              Database Creator
            </h1>
            <p className="text-xs text-slate-500 tracking-wide">Design • Visualize • Generate</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="hidden sm:flex items-center text-sm text-slate-600 bg-blue-50/80 py-1 px-3 rounded-full border border-blue-100">
            <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
            Intelligent Database Design Platform
          </div>
          <a 
            href="https://github.com/Aayush-Sood101/LaymanDB" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center justify-center h-9 w-9 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-blue-600 rounded-full transition-all duration-200"
            aria-label="GitHub Repository"
          >
            <Github size={18} />
          </a>
        </div>
      </div>
    </header>
  );
}
