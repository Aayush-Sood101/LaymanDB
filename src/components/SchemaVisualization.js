'use client';

import React, { useState, useEffect } from 'react';
import ERDDiagram from '@/components/diagram/ERDDiagram';
import { useSchemaContext } from '@/contexts/SchemaContext';
import Button from './ui/Button';
import { SunIcon, MoonIcon } from './ui/ThemeIcons';

const SchemaVisualization = () => {
  const { 
    currentSchema, 
    updateTablePosition, 
    addRelationship, 
    exportSQL, 
    exportERD, 
    generateDocumentation
  } = useSchemaContext();
  
  const [sqlDialect, setSqlDialect] = useState('mysql');
  const [isExporting, setIsExporting] = useState(false);
  const [diagramKey, setDiagramKey] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Track schema changes to force diagram re-render when needed
  const prevSchemaIdRef = React.useRef(null);
  
  // Update the diagram key when schema changes
  useEffect(() => {
    if (currentSchema && currentSchema._id !== prevSchemaIdRef.current) {
      console.log('Schema changed, updating diagram');
      prevSchemaIdRef.current = currentSchema._id;
      // Force re-render of the diagram by changing key
      setDiagramKey(Date.now());
    }
  }, [currentSchema]);

  const handleExportSQL = async () => {
    if (!currentSchema) return;

    setIsExporting(true);
    try {
      await exportSQL(currentSchema._id, sqlDialect);
    } catch (error) {
      console.error('Failed to export SQL:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportERD = async (format = 'svg') => {
    if (!currentSchema) return;

    setIsExporting(true);
    try {
      await exportERD(currentSchema._id, format);
    } catch (error) {
      console.error('Failed to export ERD:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleGenerateDocumentation = async (format = 'markdown') => {
    if (!currentSchema) return;

    setIsExporting(true);
    try {
      await generateDocumentation(currentSchema._id, format);
    } catch (error) {
      console.error('Failed to generate documentation:', error);
    } finally {
      setIsExporting(false);
    }
  };

  if (!currentSchema) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-center h-full">
        <div className="text-center">
          <h3 className="text-xl font-semibold mb-4">No Schema Generated Yet</h3>
          <p className="text-gray-600 mb-4">
            Use the prompt input panel above to describe your database and generate a schema.
          </p>
          <img 
            src="/globe.svg" 
            alt="Empty state" 
            className="mx-auto w-32 h-32 opacity-50"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md flex flex-col h-full border border-blue-100 overflow-hidden animate-fade-in">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border-b border-blue-100">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-md shadow-sm">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"/>
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
                {currentSchema.name || 'Database Schema'}
              </h2>
              <p className="text-xs text-gray-500">
                {currentSchema.entities?.length || 0} entities • {currentSchema.relationships?.length || 0} relationships
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              size="sm"
              variant="outline"
              className="flex items-center"
              onClick={() => setIsDarkMode(!isDarkMode)}
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDarkMode ? <SunIcon className="w-4 h-4" /> : <MoonIcon className="w-4 h-4" />}
            </Button>
            
            <div className="bg-white rounded-md border border-gray-200 flex items-center p-1 shadow-sm">
              <select
                className="text-sm py-1 px-2 focus:outline-none bg-transparent"
                value={sqlDialect}
                onChange={(e) => setSqlDialect(e.target.value)}
                title="Select SQL dialect"
              >
                <option value="mysql">MySQL</option>
                <option value="postgresql">PostgreSQL</option>
                <option value="sqlite">SQLite</option>
                <option value="sqlserver">SQL Server</option>
              </select>
            </div>

            <div className="flex space-x-2">
              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 transition-colors flex items-center"
                onClick={handleExportSQL}
                disabled={isExporting}
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                </svg>
                SQL
              </Button>

              <Button
                size="sm"
                variant="outline"
                className="flex items-center"
                onClick={() => handleExportERD('svg')}
                disabled={isExporting}
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4"/>
                </svg>
                Diagram
              </Button>

              <Button
                size="sm"
                variant="secondary"
                className="flex items-center"
                onClick={() => handleGenerateDocumentation()}
                disabled={isExporting}
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
                Docs
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-grow overflow-hidden">
        <div className="w-full h-full relative">
          <ERDDiagram 
            schema={currentSchema}
            onNodeDragStop={(nodeId, position) => {
              // Extract entity name from nodeId if it's an entity node
              const entityName = nodeId.startsWith('entity-') 
                ? nodeId.replace('entity-', '')
                : nodeId;
              
              updateTablePosition(entityName, position);
            }}
            onConnect={(params) => {
              // Handle relationship creation
              const sourceIsEntity = params.source.startsWith('entity-');
              const targetIsEntity = params.target.startsWith('entity-');
              
              // If connecting two entities
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
        </div>
      </div>
    </div>
  );
};

export default SchemaVisualization;
