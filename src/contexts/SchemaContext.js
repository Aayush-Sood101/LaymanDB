"use client";

import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Initial state
const initialState = {
  currentSchema: null,
  currentSession: null,
  schemaHistory: [],
  exportData: null,
  isLoading: false,
  error: null,
};

// Action types
const ActionTypes = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_SCHEMA: 'SET_SCHEMA',
  SET_SESSION: 'SET_SESSION',
  SET_HISTORY: 'SET_HISTORY',
  SET_EXPORT_DATA: 'SET_EXPORT_DATA',
  CLEAR_EXPORT_DATA: 'CLEAR_EXPORT_DATA',
  UPDATE_TABLE_POSITION: 'UPDATE_TABLE_POSITION',
};

// Reducer
const schemaReducer = (state, action) => {
  switch (action.type) {
    case ActionTypes.SET_LOADING:
      return { ...state, isLoading: action.payload };
      
    case ActionTypes.SET_ERROR:
      return { ...state, error: action.payload, isLoading: false };
      
    case ActionTypes.SET_SCHEMA:
      return { ...state, currentSchema: action.payload, isLoading: false, error: null };
      
    case ActionTypes.SET_SESSION:
      return { ...state, currentSession: action.payload, isLoading: false, error: null };
      
    case ActionTypes.SET_HISTORY:
      return { ...state, schemaHistory: action.payload, isLoading: false };
      
    case ActionTypes.SET_EXPORT_DATA:
      return { 
        ...state, 
        exportData: {
          isOpen: true,
          ...action.payload
        },
        isLoading: false 
      };
      
    case ActionTypes.CLEAR_EXPORT_DATA:
      return { ...state, exportData: null };
      
    case ActionTypes.UPDATE_TABLE_POSITION:
      if (!state.currentSchema) return state;
      
      // If this is an entity (table) node
      if (action.payload.type === 'entity') {
        const updatedTables = state.currentSchema.tables.map(table => {
          if (table.name === action.payload.name) {
            return { ...table, position: action.payload.position };
          }
          return table;
        });
        
        return {
          ...state,
          currentSchema: {
            ...state.currentSchema,
            tables: updatedTables
          }
        };
      }
      
      // If this is a relationship node
      else if (action.payload.type === 'relationship') {
        // Create a new array if relationships doesn't exist or modify existing
        const relationships = Array.isArray(state.currentSchema.relationships) 
          ? state.currentSchema.relationships 
          : [];
          
        // Get the full node ID which is in the format 'relationship-RelName-SourceEntity-to-TargetEntity'
        const nodeId = action.payload.id;
        const idParts = nodeId.split('-');
        
        // Extract relationship details from the ID
        // Format: relationship-RelName-SourceEntity-to-TargetEntity
        let relationshipName = '';
        let sourceEntity = '';
        let targetEntity = '';
        
        if (idParts.length >= 4) {
          relationshipName = idParts[1];
          // Find the position of 'to' to extract source and target entities
          const toIndex = idParts.indexOf('to');
          if (toIndex > 0) {
            sourceEntity = idParts.slice(2, toIndex).join('-');
            targetEntity = idParts.slice(toIndex + 1).join('-');
          }
        } else {
          // Fallback for old-style IDs
          relationshipName = action.payload.name;
        }
        
        const updatedRelationships = relationships.map(rel => {
          const relName = rel.name || '';
          const relSourceEntity = rel.sourceEntity || rel.sourceTable || '';
          const relTargetEntity = rel.targetEntity || rel.targetTable || '';
          
          // Match on name, source, and target to ensure we update the correct relationship
          // Use case-insensitive comparison for more robust matching
          const nameMatch = relName.toLowerCase() === relationshipName.toLowerCase();
          const sourceMatch = sourceEntity ? relSourceEntity.toLowerCase() === sourceEntity.toLowerCase() : true;
          const targetMatch = targetEntity ? relTargetEntity.toLowerCase() === targetEntity.toLowerCase() : true;
          
          // If all criteria match or if we only have a name (old-style)
          if ((nameMatch && sourceMatch && targetMatch) || 
              (idParts.length <= 2 && nameMatch)) {
            return { 
              ...rel, 
              position: { 
                ...action.payload.position,
                isDraggable: true 
              } 
            };
          }
          return rel;
        });
        
        return {
          ...state,
          currentSchema: {
            ...state.currentSchema,
            relationships: updatedRelationships
          }
        };
      }
      
      // If this is an attribute node or any other node type
      // Store the positions in a nodePositions map for persistence
      const nodePositions = state.currentSchema.nodePositions || {};
      
      return {
        ...state,
        currentSchema: {
          ...state.currentSchema,
          nodePositions: {
            ...nodePositions,
            [action.payload.id]: action.payload.position
          }
        }
      };
      
    default:
      return state;
  }
};

// Create context
const SchemaContext = createContext();

// Context provider
export const SchemaProvider = ({ children }) => {
  const [state, dispatch] = useReducer(schemaReducer, initialState);
  
  // API functions
  
  // Generate schema from natural language prompt
  const generateSchema = async (prompt) => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: true });
    
    try {
      // Set a timeout for the fetch operation
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout
      
      const response = await fetch('/api/schema/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
        signal: controller.signal
      });
      
      // Clear the timeout
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('API error response:', errorData);
        throw new Error(errorData.error || errorData.message || 'Failed to generate schema');
      }
      
      const { schema } = await response.json();
      
      // Create a new session with this schema
      const sessionResponse = await fetch('/api/session/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: schema.name,
          description: schema.description,
          schemaId: schema._id,
          prompt,
        }),
      });
      
      if (!sessionResponse.ok) {
        const error = await sessionResponse.json();
        throw new Error(error.message || 'Failed to create session');
      }
      
      const { session } = await sessionResponse.json();
      
      // Set current schema and session
      dispatch({ type: ActionTypes.SET_SCHEMA, payload: schema });
      dispatch({ type: ActionTypes.SET_SESSION, payload: session });
      
      // Set history
      dispatch({ 
        type: ActionTypes.SET_HISTORY, 
        payload: session.history.map(item => ({
          ...item,
          isActive: item.schemaId === schema._id
        }))
      });
      
      return schema;
    } catch (error) {
      console.error('Schema generation error:', error);
      
      // Handle AbortError (timeout)
      if (error.name === 'AbortError') {
        dispatch({ type: ActionTypes.SET_ERROR, payload: 'Request timed out. The server is taking too long to respond.' });
        throw new Error('Request timed out. Please try again with a simpler prompt.');
      }
      
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      throw error;
    }
  };
  
  // Update table position in schema
  const updateTablePosition = async (tableUpdate) => {
    dispatch({ 
      type: ActionTypes.UPDATE_TABLE_POSITION, 
      payload: tableUpdate 
    });
    
    // In a real app, we'd persist this to the backend
    // For now, we're just updating the local state
  };
  
  // Add relationship between tables
  const addRelationship = async (relationship) => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: true });
    
    try {
      if (!state.currentSchema) {
        throw new Error('No active schema');
      }
      
      // In a real app, we'd call the backend API to update the relationship
      // For now, let's just update the local state
      
      const updatedSchema = {
        ...state.currentSchema,
        relationships: [
          ...state.currentSchema.relationships,
          {
            ...relationship,
            name: `${relationship.sourceTable}_${relationship.targetTable}`
          }
        ]
      };
      
      dispatch({ type: ActionTypes.SET_SCHEMA, payload: updatedSchema });
      
      return updatedSchema;
    } catch (error) {
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      throw error;
    }
  };
  
  // Load a specific schema version
  const loadSchemaVersion = async (schemaId) => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: true });
    
    try {
      const response = await fetch(`/api/schema/${schemaId}`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to load schema version');
      }
      
      const { schema } = await response.json();
      
      // Update history items to mark the current schema as active
      const updatedHistory = state.schemaHistory.map(item => ({
        ...item,
        isActive: item.schemaId === schemaId
      }));
      
      dispatch({ type: ActionTypes.SET_SCHEMA, payload: schema });
      dispatch({ type: ActionTypes.SET_HISTORY, payload: updatedHistory });
      
      return schema;
    } catch (error) {
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      throw error;
    }
  };
  
  // Export SQL for the current schema
  const exportSQL = async (schemaId, dialect = 'mysql') => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: true });
    
    try {
      const response = await fetch('/api/export/sql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ schemaId, dialect }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to export SQL');
      }
      
      const { sql } = await response.json();
      
      dispatch({ 
        type: ActionTypes.SET_EXPORT_DATA, 
        payload: { 
          type: 'sql', 
          data: sql,
          format: dialect
        } 
      });
      
      return sql;
    } catch (error) {
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      throw error;
    }
  };
  
  // Export ERD diagram
  const exportERD = async (schemaId, format = 'svg') => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: true });
    
    try {
      const response = await fetch('/api/export/erd', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ schemaId, format }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to export ERD');
      }
      
      // In a real app, this would return the actual diagram data
      // For now, we'll just use the schema data
      const { schema } = await response.json();
      
      // Simulate an SVG output (in a real app, the backend would generate this)
      const svgData = `
        <svg xmlns="http://www.w3.org/2000/svg" width="800" height="600">
          <rect width="100%" height="100%" fill="#f8f9fa" />
          <text x="400" y="50" text-anchor="middle" font-size="24" font-weight="bold">
            ${schema.name} - ERD Diagram
          </text>
          ${schema.tables.map((table, index) => `
            <g transform="translate(${100 + (index % 3) * 250}, ${120 + Math.floor(index / 3) * 150})">
              <rect width="200" height="100" fill="#fff" stroke="#333" />
              <text x="100" y="30" text-anchor="middle" font-weight="bold">${table.name}</text>
            </g>
          `).join('')}
        </svg>
      `;
      
      dispatch({ 
        type: ActionTypes.SET_EXPORT_DATA, 
        payload: { 
          type: 'erd', 
          data: svgData,
          format: format
        } 
      });
      
      return svgData;
    } catch (error) {
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      throw error;
    }
  };
  
  // Generate documentation
  const generateDocumentation = async (schemaId, format = 'markdown') => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: true });
    
    try {
      const response = await fetch('/api/export/documentation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ schemaId, format }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to generate documentation');
      }
      
      const { documentation } = await response.json();
      
      dispatch({ 
        type: ActionTypes.SET_EXPORT_DATA, 
        payload: { 
          type: 'documentation', 
          data: documentation,
          format: format
        } 
      });
      
      return documentation;
    } catch (error) {
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      throw error;
    }
  };
  
  // Generate Mermaid ER diagram
  const generateMermaidERD = async (schemaId) => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: true });
    
    try {
      const response = await fetch('/api/export/mermaid', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ schemaId }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to generate Mermaid diagram');
      }
      
      const { mermaidSyntax } = await response.json();
      
      dispatch({ 
        type: ActionTypes.SET_EXPORT_DATA, 
        payload: { 
          type: 'mermaid', 
          data: mermaidSyntax,
          format: 'mermaid'
        } 
      });
      
      return mermaidSyntax;
    } catch (error) {
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      throw error;
    } finally {
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
    }
  };
  
  // Clear export data
  const clearExportData = () => {
    dispatch({ type: ActionTypes.CLEAR_EXPORT_DATA });
  };
  
  // Provide context value
  const value = {
    ...state,
    generateSchema,
    updateTablePosition,
    addRelationship,
    loadSchemaVersion,
    exportSQL,
    exportERD,
    generateDocumentation,
    generateMermaidERD,
    clearExportData,
  };
  
  return (
    <SchemaContext.Provider value={value}>
      {children}
    </SchemaContext.Provider>
  );
};

// Context hook
export const useSchemaContext = () => {
  const context = useContext(SchemaContext);
  
  if (!context) {
    throw new Error('useSchemaContext must be used within a SchemaProvider');
  }
  
  return context;
};
