'use client';

import React, { useState, useEffect } from 'react';
import ERDDiagram from '@/components/diagram/ERDDiagram';
import { useSchemaContext } from '@/contexts/SchemaContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
// --- RECTIFIED LINE --- Added Sun and Moon icons back
import { Database, Download, FileText, Sun, Moon, Code2, FileImage, GitBranch, Loader2, ChevronDown, Zap, Eye, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';

const SchemaVisualization = () => {
  const {
    currentSchema,
    updateTablePosition,
    addRelationship,
    exportSQL,
    exportERD,
    generateDocumentation,
    generateMermaidERD
  } = useSchemaContext();

  const [sqlDialect, setSqlDialect] = useState('mysql');
  const [isExporting, setIsExporting] = useState(false);
  const [diagramKey, setDiagramKey] = useState(0);
  const [exportingType, setExportingType] = useState('');
  // --- RECTIFIED LINE --- Re-added state for diagram theme, default is now light (false)
  const [isDarkMode, setIsDarkMode] = useState(false);

  const prevSchemaIdRef = React.useRef(null);

  useEffect(() => {
    if (currentSchema && currentSchema._id !== prevSchemaIdRef.current) {
      console.log('Schema changed, updating diagram', {
        id: currentSchema._id,
        tables: currentSchema.tables?.length || 0,
        entities: currentSchema.entities?.length || 0,
        relationships: currentSchema.relationships?.length || 0
      });
      prevSchemaIdRef.current = currentSchema._id;
      setDiagramKey(Date.now());
    }
  }, [currentSchema]);

  const handleExportSQL = async () => {
    if (!currentSchema) return;
    setIsExporting(true);
    setExportingType('sql');
    try {
      await exportSQL(currentSchema._id, sqlDialect);
    } catch (error) {
      console.error('Failed to export SQL:', error);
    } finally {
      setIsExporting(false);
      setExportingType('');
    }
  };

  const handleExportERD = async (format = 'svg') => {
    if (!currentSchema) return;
    setIsExporting(true);
    setExportingType('erd');
    try {
      await exportERD(currentSchema._id, format);
    } catch (error) {
      console.error('Failed to export ERD:', error);
    } finally {
      setIsExporting(false);
      setExportingType('');
    }
  };
  
  const handleGenerateDocumentation = async (format = 'markdown') => {
    if (!currentSchema) return;
    setIsExporting(true);
    setExportingType('docs');
    try {
      // Make direct API call instead of using context to avoid dialog
      const response = await fetch('/api/export/documentation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ schemaId: currentSchema._id, format }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to generate documentation');
      }
      
      const { documentation } = await response.json();
      
      // Create a blob from the documentation text
      const blob = new Blob([documentation], { type: 'text/markdown' });
      
      // Create a URL for the blob
      const url = URL.createObjectURL(blob);
      
      // Create a temporary anchor element
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentSchema.name.replace(/\s+/g, '-').toLowerCase()}-documentation.md`;
      
      // Trigger the download
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to generate documentation:', error);
    } finally {
      setIsExporting(false);
      setExportingType('');
    }
  };
  
  const handleGenerateMermaidERD = async () => {
    if (!currentSchema) return;
    setIsExporting(true);
    setExportingType('mermaid');
    try {
      await generateMermaidERD(currentSchema._id);
    } catch (error) {
      console.error('Failed to generate Mermaid ER diagram:', error);
    } finally {
      setIsExporting(false);
      setExportingType('');
    }
  };

  if (!currentSchema) {
    return (
      <div className="h-full flex flex-col">
        <Card className="flex-1 border-2 border-dashed border-[#374151] bg-[#111827]/50 min-h-[400px] lg:min-h-[600px]">
          <CardContent className="flex items-center justify-center h-full p-12">
            <div className="text-center space-y-6 max-w-md">
              <div className="w-24 h-24 mx-auto rounded-full bg-[#1F2937] flex items-center justify-center">
                <Database className="w-12 h-12 text-[#6B7280]" />
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-bold text-[#F3F4F6]">
                  No Schema Generated
                </h3>
                <p className="text-[#9CA3AF] leading-relaxed">
                  Describe your database requirements in the prompt above to generate
                  a professional schema visualization with interactive diagrams.
                </p>
              </div>
              <div className="flex items-center justify-center space-x-2 text-sm text-[#9CA3AF]">
                <Zap className="w-4 h-4" />
                <span>AI-powered schema generation</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const entityCount = currentSchema.entities?.length || 0;
  const relationshipCount = currentSchema.relationships?.length || 0;

  return (
    <div className="h-full flex flex-col bg-[#030712] border-2 border-[#1F2937] shadow-xl overflow-hidden min-h-[400px] lg:min-h-[600px]">
      {/* Compact Header */}
      <div className="border-b border-[#1F2937] bg-[#111827]/50 p-4">
        <div className="flex items-center justify-between">
          {/* Schema Info */}
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-[#F3F4F6] shadow-md">
              <Database className="w-5 h-5 text-[#111827]" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-[#F3F4F6]">
                {currentSchema.name || 'Database Schema'}
              </h2>
              <div className="flex items-center space-x-3 text-sm text-[#9CA3AF]">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span>{entityCount} entities</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span>{relationshipCount} relationships</span>
                </div>
                <Badge variant="secondary" className="bg-[#1F2937] text-[#D1D5DB] text-xs px-2 py-1">
                  <Eye className="w-3 h-3 mr-1" />
                  Interactive
                </Badge>
              </div>
            </div>
          </div>

          {/* Compact Controls */}
          <div className="flex items-center space-x-2">
            {/* --- RECTIFIED LINE --- Diagram theme toggle button re-added */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={cn(
                "border-2 border-[#1F2937] text-[#D1D5DB] transition-all duration-200",
                "hover:scale-105 active:scale-95 hover:text-[#FFFFFF] hover:border-[#4B5563]"
              )}
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </Button>

            {/* SQL Dialect Selector */}
            <Select value={sqlDialect} onValueChange={setSqlDialect}>
              <SelectTrigger className="w-28 border-2 text-sm text-[#D1D5DB]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mysql">MySQL</SelectItem>
                <SelectItem value="postgresql">PostgreSQL</SelectItem>
                <SelectItem value="sqlite">SQLite</SelectItem>
                <SelectItem value="sqlserver">SQL Server</SelectItem>
              </SelectContent>
            </Select>

            <Separator orientation="vertical" className="h-6" />

            {/* Export Actions */}
            <div className="flex items-center space-x-2">
              <Button
                onClick={handleExportSQL}
                disabled={isExporting}
                size="sm"
                className={cn(
                  "bg-[#F3F4F6] text-[#111827]",
                  "hover:bg-[#E5E7EB]",
                  "shadow-lg hover:shadow-xl transition-all duration-200",
                  "font-semibold"
                )}
              >
                {isExporting && exportingType === 'sql' ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Code2 className="w-4 h-4 mr-2" />
                )}
                SQL
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="border-2 hover:bg-[#111827] text-[#D1D5DB] hover:text-[#F3F4F6]" disabled={isExporting}>
                    <Download className="w-4 h-4 mr-2" />
                    Export
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-semibold text-[#F3F4F6]">Export Options</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleExportERD('svg')} disabled={isExporting} className="cursor-pointer text-[#D1D5DB] hover:text-[#F3F4F6]">
                    <FileImage className="w-4 h-4 mr-2" />
                    <span>Diagram (SVG)</span>
                    {isExporting && exportingType === 'erd' && (<Loader2 className="w-4 h-4 ml-auto animate-spin" />)}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExportERD('png')} disabled={isExporting} className="cursor-pointer text-[#D1D5DB] hover:text-[#F3F4F6]">
                    <FileImage className="w-4 h-4 mr-2" />
                    <span>Diagram (PNG)</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleGenerateMermaidERD} disabled={isExporting} className="cursor-pointer text-[#D1D5DB] hover:text-[#F3F4F6]">
                    <GitBranch className="w-4 h-4 mr-2" />
                    <span>Mermaid Diagram</span>
                    {isExporting && exportingType === 'mermaid' && (<Loader2 className="w-4 h-4 ml-auto animate-spin" />)}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleGenerateDocumentation('markdown')} disabled={isExporting} className="cursor-pointer text-[#D1D5DB] hover:text-[#F3F4F6]">
                    <FileText className="w-4 h-4 mr-2" />
                    <span>Download Documentation</span>
                    {isExporting && exportingType === 'docs' && (<Loader2 className="w-4 h-4 ml-auto animate-spin" />)}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Maximized Diagram Container */}
      <div className="flex-1 overflow-hidden bg-[#111827]/30 relative h-[calc(100%-64px)] min-h-[300px]">
        <ERDDiagram
          schema={currentSchema}
          onNodeDragStop={(nodeId, position) => {
            // The table update needs to use the same format as the ERDDiagram component
            const parts = nodeId.split('-');
            const nodeType = parts[0];
            const nodeName = nodeId.startsWith('entity-') ? nodeId.replace('entity-', '') : 
                             nodeId.substring(nodeId.indexOf('-') + 1);
            
            updateTablePosition({
              id: nodeId,
              name: nodeName,
              type: nodeType,
              position: position
            });
          }}
          onConnect={(params) => {
            if (params.source.startsWith('entity-') && params.target.startsWith('entity-')) {
              addRelationship({
                sourceTable: params.source.replace('entity-', ''),
                targetTable: params.target.replace('entity-', ''),
                type: 'ONE_TO_MANY',
                name: 'Relates to'
              });
            }
          }}
          key={`erd-diagram-${diagramKey}`}
          // --- RECTIFIED LINE --- Prop now uses the state variable to be dynamic
          darkMode={isDarkMode}
        />
        <div className="absolute top-4 right-4 z-10">
          <Badge variant="outline" className="border-[#4B5563] bg-[#111827]/90 text-[#D1D5DB] backdrop-blur-sm">
            {sqlDialect.toUpperCase()}
          </Badge>
        </div>
      </div>

      {/* Loading Overlay */}
      {isExporting && (
        <div className="absolute inset-0 bg-[#030712]/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#111827] rounded-xl shadow-2xl p-8 border-2 border-[#1F2937]">
            <div className="flex items-center space-x-4">
              <Loader2 className="w-8 h-8 animate-spin text-[#F3F4F6]" />
              <div>
                <p className="font-semibold text-[#F3F4F6]">
                  Exporting {exportingType}...
                </p>
                <p className="text-sm text-[#9CA3AF]">
                  Please wait while we generate your file
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchemaVisualization;