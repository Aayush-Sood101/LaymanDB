"use client";

import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useSchemaContext } from '@/contexts/SchemaContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/Dialog';
import MermaidDiagram from './MermaidDiagram';

// --- NOTE: All components in this file have been updated for a hardcoded dark theme. ---

const SQLPreview = ({ sql, dialect }) => {
  return (
    <div className="mb-4">
      <div className="bg-[#1F2937] rounded-t-lg px-4 py-2 text-[#FFFFFF] flex justify-between items-center">
        <span>SQL Script ({dialect.toUpperCase()})</span>
        <button
          onClick={() => navigator.clipboard.writeText(sql)}
          className="text-[#D1D5DB] hover:text-[#FFFFFF] p-1 rounded"
          title="Copy to clipboard"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
            <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
          </svg>
        </button>
      </div>
      
      <div className="max-h-96 overflow-auto">
        <SyntaxHighlighter
          language="sql"
          style={vscDarkPlus}
          showLineNumbers
          wrapLines
          customStyle={{
            margin: 0,
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
            fontSize: '0.9rem',
          }}
        >
          {sql}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

const DocPreview = ({ documentation }) => {
  return (
    <div className="mb-4">
      <div className="bg-[#1F2937] rounded-t-lg px-4 py-2 text-[#FFFFFF] flex justify-between items-center">
        <span>Documentation</span>
        <button
          onClick={() => navigator.clipboard.writeText(documentation)}
          className="text-[#D1D5DB] hover:text-[#FFFFFF] p-1 rounded"
          title="Copy to clipboard"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
            <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
          </svg>
        </button>
      </div>
      
      <div className="p-4 border-x border-b border-[#374151] rounded-b-lg bg-[#111827] max-h-96 overflow-auto">
        <div className="prose prose-sm prose-invert max-w-none">
          {documentation}
        </div>
      </div>
    </div>
  );
};

const ExportDialog = () => {
  const { exportData, clearExportData } = useSchemaContext();
  const { isOpen, type, data, format } = exportData || {};
  
  const open = isOpen || false;
  
  const handleClose = () => {
    clearExportData();
  };
  
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>
            {type === 'sql' && 'SQL Export'}
            {type === 'erd' && 'ERD Export'}
            {type === 'documentation' && 'Schema Documentation'}
            {type === 'mermaid' && 'Mermaid ER Diagram'}
          </DialogTitle>
        </DialogHeader>
        
        <DialogClose />
        
        {type === 'sql' && data && (
          <SQLPreview sql={data} dialect={format || 'sql'} />
        )}
        
        {type === 'documentation' && data && (
          <DocPreview documentation={data} />
        )}
        
        {type === 'erd' && data && (
          <div className="flex flex-col items-center">
            {/* Display the diagram based on format */}
            <div className="max-w-full border border-[#374151] rounded-lg overflow-hidden">
              <img 
                src={data}
                alt="ERD Diagram" 
                className="max-w-full" 
                onError={(e) => {
                  console.error('Error loading diagram image');
                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MDAiIGhlaWdodD0iNjAwIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMTExODI3Ii8+PHRleHQgeD0iNDAwIiB5PSIzMDAiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiNmZmZmZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkVycm9yIGxvYWRpbmcgZGlhZ3JhbTwvdGV4dD48L3N2Zz4=';
                }}
              />
            </div>
            
            {/* Download button */}
            <a 
              href={data}
              download={`schema-diagram.${format || 'svg'}`}
              className="mt-4 px-4 py-2 bg-[#FFFFFF] text-[#000000] rounded-md hover:bg-[#E5E7EB]"
            >
              Download Diagram
            </a>
          </div>
        )}
        
        {type === 'mermaid' && data && (
          <div className="flex flex-col">
            <div className="mb-4 border border-[#374151] rounded-lg overflow-hidden">
              <div className="bg-[#1F2937] px-4 py-2 text-[#FFFFFF] flex justify-between items-center">
                <span>Mermaid ER Diagram</span>
                <button
                  onClick={() => navigator.clipboard.writeText(data)}
                  className="text-[#D1D5DB] hover:text-[#FFFFFF] p-1 rounded"
                  title="Copy to clipboard"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                    <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                  </svg>
                </button>
              </div>
              <div className="bg-[#111827] p-2">
                <MermaidDiagram mermaidSyntax={data} />
              </div>
            </div>
            
            <div className="flex justify-between mt-4 w-full">
              <button
                onClick={() => navigator.clipboard.writeText(data)}
                className="px-4 py-2 bg-[#374151] text-white rounded-md hover:bg-[#4B5563] flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                  <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                </svg>
                Copy Mermaid Syntax
              </button>
              
              <a
                href={`data:text/plain;charset=utf-8,${encodeURIComponent(data)}`}
                download="schema-diagram.mmd"
                className="px-4 py-2 bg-[#FFFFFF] text-[#000000] rounded-md hover:bg-[#E5E7EB] flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Download Mermaid File
              </a>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ExportDialog;