'use client';

import React, { useState, useEffect } from 'react';
import ERDDiagram from '@/components/diagram/ERDDiagram';
import { useSchemaContext } from '@/contexts/SchemaContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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
import { Database, Download, FileText, Sun, Moon, Settings, Share2, Code2, FileImage, GitBranch, Loader2, ChevronDown, Zap, Eye, Copy } from 'lucide-react';
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
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [exportingType, setExportingType] = useState('');

  const prevSchemaIdRef = React.useRef(null);

  useEffect(() => {
    if (currentSchema && currentSchema._id !== prevSchemaIdRef.current) {
      console.log('Schema changed, updating diagram');
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
      await generateDocumentation(currentSchema._id, format);
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
        <Card className="flex-1 border-2 border-dashed border-gray-300 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50">
          <CardContent className="flex items-center justify-center h-full p-12">
            <div className="text-center space-y-6 max-w-md">
              <div className="w-24 h-24 mx-auto rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <Database className="w-12 h-12 text-gray-400 dark:text-gray-500" />
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  No Schema Generated
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  Describe your database requirements in the prompt above to generate 
                  a professional schema visualization with interactive diagrams.
                </p>
              </div>
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
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
    <div className="h-full flex flex-col bg-white dark:bg-gray-950 border-2 border-gray-200 dark:border-gray-800 shadow-xl overflow-hidden">
      {/* Compact Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 p-4">
        <div className="flex items-center justify-between">
          {/* Schema Info - Compact */}
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-gray-900 dark:bg-gray-100 shadow-md">
              <Database className="w-5 h-5 text-white dark:text-gray-900" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {currentSchema.name || 'Database Schema'}
              </h2>
              <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span>{entityCount} entities</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span>{relationshipCount} relationships</span>
                </div>
                <Badge variant="secondary" className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs px-2 py-1">
                  <Eye className="w-3 h-3 mr-1" />
                  Interactive
                </Badge>
              </div>
            </div>
          </div>

          {/* Compact Controls */}
          <div className="flex items-center space-x-2">
            {/* Theme Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={cn(
                "border-2 transition-all duration-200 text-gray-700 dark:text-gray-300",
                "hover:scale-105 active:scale-95 hover:text-gray-900 dark:hover:text-gray-100"
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
              <SelectTrigger className="w-28 border-2 text-sm text-gray-700 dark:text-gray-300">
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

            {/* Export Actions - Compact */}
            <div className="flex items-center space-x-2">
              {/* SQL Export */}
              <Button
                onClick={handleExportSQL}
                disabled={isExporting}
                size="sm"
                className={cn(
                  "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900",
                  "hover:bg-gray-800 dark:hover:bg-gray-200",
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

              {/* Export Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-2 hover:bg-gray-50 dark:hover:bg-gray-900 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
                    disabled={isExporting}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-semibold text-gray-900 dark:text-gray-100">Export Options</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem 
                    onClick={() => handleExportERD('svg')}
                    disabled={isExporting}
                    className="cursor-pointer text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
                  >
                    <FileImage className="w-4 h-4 mr-2" />
                    <span>Diagram (SVG)</span>
                    {isExporting && exportingType === 'erd' && (
                      <Loader2 className="w-4 h-4 ml-auto animate-spin" />
                    )}
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem 
                    onClick={() => handleExportERD('png')}
                    disabled={isExporting}
                    className="cursor-pointer text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
                  >
                    <FileImage className="w-4 h-4 mr-2" />
                    <span>Diagram (PNG)</span>
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem 
                    onClick={handleGenerateMermaidERD}
                    disabled={isExporting}
                    className="cursor-pointer text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
                  >
                    <GitBranch className="w-4 h-4 mr-2" />
                    <span>Mermaid Diagram</span>
                    {isExporting && exportingType === 'mermaid' && (
                      <Loader2 className="w-4 h-4 ml-auto animate-spin" />
                    )}
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem 
                    onClick={() => handleGenerateDocumentation('markdown')}
                    disabled={isExporting}
                    className="cursor-pointer text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    <span>Documentation</span>
                    {isExporting && exportingType === 'docs' && (
                      <Loader2 className="w-4 h-4 ml-auto animate-spin" />
                    )}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Maximized Diagram Container */}
      <div className="flex-1 overflow-hidden bg-gray-50/30 dark:bg-gray-900/30 relative">
        <ERDDiagram 
          schema={currentSchema}
          onNodeDragStop={(nodeId, position) => {
            const entityName = nodeId.startsWith('entity-') 
              ? nodeId.replace('entity-', '') 
              : nodeId;
            updateTablePosition(entityName, position);
          }}
          onConnect={(params) => {
            const sourceIsEntity = params.source.startsWith('entity-');
            const targetIsEntity = params.target.startsWith('entity-');
            
            if (sourceIsEntity && targetIsEntity) {
              const sourceEntity = params.source.replace('entity-', '');
              const targetEntity = params.target.replace('entity-', '');
              
              addRelationship({
                sourceTable: sourceEntity,
                targetTable: targetEntity,
                type: 'ONE_TO_MANY',
                name: 'Relates to'
              });
            }
          }}
          key={`erd-diagram-${diagramKey}`}
          darkMode={isDarkMode}
        />

        {/* Floating Status Badge */}
        <div className="absolute top-4 right-4 z-10">
          <Badge variant="outline" className="border-gray-300 dark:border-gray-600 bg-white/90 dark:bg-gray-900/90 text-gray-700 dark:text-gray-300 backdrop-blur-sm">
            {sqlDialect.toUpperCase()}
          </Badge>
        </div>
      </div>

      {/* Loading Overlay */}
      {isExporting && (
        <div className="absolute inset-0 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl p-8 border-2 border-gray-200 dark:border-gray-800">
            <div className="flex items-center space-x-4">
              <Loader2 className="w-8 h-8 animate-spin text-gray-900 dark:text-gray-100" />
              <div>
                <p className="font-semibold text-gray-900 dark:text-gray-100">
                  Exporting {exportingType}...
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
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