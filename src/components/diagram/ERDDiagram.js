'use client';

import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Panel,
  useNodesState,
  useEdgesState,
  addEdge,
  ConnectionLineType,
} from 'reactflow';
import { toPng, toSvg } from 'html-to-image';
import 'reactflow/dist/style.css';

import { generateERDiagramElements } from '@/lib/diagramUtils';
import { processSvgForExport, processPngForExport } from '@/lib/exportUtils';
import styles from '@/styles/ERDDiagram.module.css';
import EntityNode from './EntityNode';
import RelationshipNode from './RelationshipNode';
import AttributeNode from './AttributeNode';
import RelationshipAttributeNode from './RelationshipAttributeNode';
import ERDEdge from './ERDEdge';
import { useSchemaContext } from '@/contexts/SchemaContext';

// Custom node and edge types are memoized to prevent recreation on each render
const ERDDiagram = ({ 
  schema, 
  onNodeDragStop, 
  onConnect,
  readOnly = false,
  darkMode = false,
}) => {
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [diagramMode] = useState('conceptual'); // Default to conceptual mode without toggling
  const [showLegend, setShowLegend] = useState(false); // Toggle for legend visibility/expansion
  const [hasError, setHasError] = useState(false);
  
  const { updateTablePosition, addRelationship } = useSchemaContext();
  
  // Function to export the diagram as an SVG
  const exportAsSvg = useCallback(async () => {
    if (!reactFlowWrapper.current || !reactFlowInstance) {
      console.error('ReactFlow wrapper or instance not found');
      return 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MDAiIGhlaWdodD0iNjAwIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjhmOWZhIi8+PHRleHQgeD0iNDAwIiB5PSIzMDAiIGZvbnQtc2l6ZT0iMjQiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkRpYWdyYW0gY291bGQgbm90IGJlIGdlbmVyYXRlZDwvdGV4dD48L3N2Zz4=';
    }
    
    try {
      const flowNode = reactFlowWrapper.current.querySelector('.react-flow');
      if (!flowNode) {
        console.error('ReactFlow node not found');
        return 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MDAiIGhlaWdodD0iNjAwIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjhmOWZhIi8+PHRleHQgeD0iNDAwIiB5PSIzMDAiIGZvbnQtc2l6ZT0iMjQiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkRpYWdyYW0gZWxlbWVudCBub3QgZm91bmQ8L3RleHQ+PC9zdmc+';
      }
      
      reactFlowInstance.fitView({ padding: 0.2 });
      
      // Apply explicit color styles to edges for export
      const edgePaths = flowNode.querySelectorAll('.react-flow__edge path');
      edgePaths.forEach(path => {
        // Get the edge type from classes
        const isIdentifying = path.classList.contains(styles.identifyingEdge);
        const isOneToOne = path.classList.contains(styles.oneToOneEdge);
        const isManyToMany = path.classList.contains(styles.manyToManyEdge);
        const isOneToMany = path.classList.contains(styles.oneToManyEdge);
        
        // Apply explicit stroke color based on edge type
        if (isIdentifying) {
          path.setAttribute('stroke', '#f59e0b');
        } else if (isOneToOne) {
          path.setAttribute('stroke', '#8b5cf6');
        } else if (isManyToMany) {
          path.setAttribute('stroke', '#10b981');
        } else if (isOneToMany) {
          path.setAttribute('stroke', '#3b82f6');
        } else {
          path.setAttribute('stroke', '#3b82f6'); // Default blue
        }
        
        // Set fill to none explicitly for paths
        path.setAttribute('fill', 'none');
      });
      
      const fallbackSvg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="800" height="600">
          <rect width="100%" height="100%" fill="${darkMode ? '#1a1a1a' : '#f8f9fa'}"/>
          <text x="400" y="300" font-size="24" text-anchor="middle" fill="${darkMode ? '#ffffff' : '#000000'}">
            ${schema?.name || 'Database Schema'} - ERD Diagram
          </text>
        </svg>
      `;
      
      try {
        const svgData = await toSvg(flowNode, {
          quality: 1,
          backgroundColor: darkMode ? '#1a1a1a' : '#f8f9fa',
          width: flowNode.offsetWidth || 800,
          height: flowNode.offsetHeight || 600,
          filter: (node) => !node.classList?.contains(styles.exportButton),
          timeout: 5000,
          style: {
            '.react-flow__edge path': {
              strokeWidth: '2px',
              stroke: 'currentColor',
              fill: 'none'
            }
          }
        });
        
        return processSvgForExport(svgData);
      } catch (htmlToImageError) {
        console.error('Error using html-to-image:', htmlToImageError);
        return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(fallbackSvg)}`;
      }
    } catch (error) {
      console.error('Error exporting diagram as SVG:', error);
      return 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MDAiIGhlaWdodD0iNjAwIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjhmOWZhIi8+PHRleHQgeD0iNDAwIiB5PSIzMDAiIGZvbnQtc2l6ZT0iMjQiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkVycm9yIGdlbmVyYXRpbmcgZGlhZ3JhbTwvdGV4dD48L3N2Zz4=';
    }
  }, [reactFlowInstance, darkMode, schema, styles]);
  
  // Function to export the diagram as a PNG
  const exportAsPng = useCallback(async () => {
    if (!reactFlowWrapper.current || !reactFlowInstance) {
      console.error('ReactFlow wrapper or instance not found');
      return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
    }
    
    try {
      const flowNode = reactFlowWrapper.current.querySelector('.react-flow');
      if (!flowNode) {
        console.error('ReactFlow node not found');
        return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
      }
      
      reactFlowInstance.fitView({ padding: 0.2 });
      
      // Apply explicit color styles to edges for export
      const edgePaths = flowNode.querySelectorAll('.react-flow__edge path');
      edgePaths.forEach(path => {
        // Get the edge type from classes
        const isIdentifying = path.classList.contains(styles.identifyingEdge);
        const isOneToOne = path.classList.contains(styles.oneToOneEdge);
        const isManyToMany = path.classList.contains(styles.manyToManyEdge);
        const isOneToMany = path.classList.contains(styles.oneToManyEdge);
        
        // Apply explicit stroke color based on edge type
        if (isIdentifying) {
          path.setAttribute('stroke', '#f59e0b');
        } else if (isOneToOne) {
          path.setAttribute('stroke', '#8b5cf6');
        } else if (isManyToMany) {
          path.setAttribute('stroke', '#10b981');
        } else if (isOneToMany) {
          path.setAttribute('stroke', '#3b82f6');
        } else {
          path.setAttribute('stroke', '#3b82f6'); // Default blue
        }
        
        // Set fill to none explicitly for paths
        path.setAttribute('fill', 'none');
      });
      
      try {
        const pngData = await toPng(flowNode, {
          quality: 1,
          backgroundColor: darkMode ? '#1a1a1a' : '#f8f9fa',
          width: flowNode.offsetWidth || 800,
          height: flowNode.offsetHeight || 600,
          filter: (node) => !node.classList?.contains(styles.exportButton),
          timeout: 5000,
          style: {
            '.react-flow__edge path': {
              strokeWidth: '2px',
              stroke: 'currentColor',
              fill: 'none'
            }
          }
        });
        
        return processPngForExport(pngData);
      } catch (htmlToImageError) {
        console.error('Error using html-to-image for PNG:', htmlToImageError);
        return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
      }
    } catch (error) {
      console.error('Error exporting diagram as PNG:', error);
      return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
    }
  }, [reactFlowInstance, darkMode, styles]);
  
  // Expose the export functions to the SchemaContext via window object
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.exportERDDiagram = { exportAsSvg, exportAsPng };
    }
    return () => {
      if (typeof window !== 'undefined' && window.exportERDDiagram) {
        delete window.exportERDDiagram;
      }
    };
  }, [exportAsSvg, exportAsPng]);
  
  // Handle dark mode changes
  useEffect(() => {
    if (reactFlowWrapper.current) {
      const flowElement = reactFlowWrapper.current.querySelector('.react-flow');
      if (flowElement) {
        if (darkMode) {
          flowElement.style.backgroundColor = '#0f172a';
          flowElement.classList.add('dark-flow');
          
          // Apply to inner elements
          const paneElement = flowElement.querySelector('.react-flow__pane');
          if (paneElement) paneElement.style.backgroundColor = '#0f172a';
          
          const rendererElement = flowElement.querySelector('.react-flow__renderer');
          if (rendererElement) rendererElement.style.backgroundColor = '#0f172a';
        } else {
          flowElement.style.backgroundColor = '#f0f7ff';
          flowElement.classList.remove('dark-flow');
          
          // Reset inner elements
          const paneElement = flowElement.querySelector('.react-flow__pane');
          if (paneElement) paneElement.style.backgroundColor = '#f0f7ff';
          
          const rendererElement = flowElement.querySelector('.react-flow__renderer');
          if (rendererElement) rendererElement.style.backgroundColor = '#f0f7ff';
        }
      }
    }
  }, [darkMode, reactFlowWrapper.current]);
  
  // Memoize nodeTypes and edgeTypes to prevent recreation on each render
  const nodeTypes = useMemo(() => ({
    entityNode: EntityNode,
    relationshipNode: RelationshipNode,
    attributeNode: AttributeNode,
    relationshipAttributeNode: RelationshipAttributeNode,
  }), []);

  const edgeTypes = useMemo(() => ({
    erdEdge: ERDEdge,
  }), []);
  
  // Initialize the diagram with schema data
  useEffect(() => {
    if (schema) {
      try {
        console.log('Generating diagram with schema:', schema);
        const { nodes: diagramNodes, edges: diagramEdges } = generateERDiagramElements(schema, diagramMode);
        
        console.log('Generated diagram nodes:', diagramNodes.length, 'edges:', diagramEdges.length);
        
        if (schema.nodePositions) {
          diagramNodes.forEach(node => {
            if (schema.nodePositions[node.id]) {
              const savedPosition = schema.nodePositions[node.id];
              if (savedPosition && typeof savedPosition === 'object') {
                const x = !isNaN(savedPosition.x) ? savedPosition.x : node.position.x;
                const y = !isNaN(savedPosition.y) ? savedPosition.y : node.position.y;
                node.position = { x, y };
              }
            }
            if (isNaN(node.position.x) || isNaN(node.position.y)) {
              console.warn(`Node ${node.id} has invalid position, using default`);
              node.position = {
                x: isNaN(node.position.x) ? 100 : node.position.x,
                y: isNaN(node.position.y) ? 100 : node.position.y
              };
            }
          });
        }
        
        const createFallbackNodes = () => schema.tables.map((table, index) => ({
          id: `entity-${table.name}`,
          type: 'entityNode',
          position: { 
            x: 100 + (index % 3) * 500,
            y: 100 + Math.floor(index / 3) * 400
          },
          data: {
            entityName: table.name,
            attributes: Array.isArray(table.columns) ? table.columns.map(col => ({
              name: col.name || 'Unnamed',
              dataType: col.dataType,
              isPrimaryKey: col.isPrimaryKey || false,
              isForeignKey: col.isForeignKey || false,
              isNullable: col.isNullable !== false,
            })) : [],
            entityType: 'strong',
            description: table.description || ''
          },
          draggable: true,
          selectable: true
        }));
        
        if (diagramNodes.length === 0 && schema.tables?.length > 0) {
          console.warn('No nodes generated despite having tables. Regenerating with fallback positions.');
          setNodes(createFallbackNodes());
          setEdges([]);
        } else {
          setNodes(diagramNodes);
          setEdges(diagramEdges);
        }
        
        setTimeout(() => {
          if (reactFlowInstance) {
            reactFlowInstance.fitView({ padding: 0.2 });
            
            // Apply dark mode directly to the DOM if needed
            if (darkMode && reactFlowWrapper.current) {
              const flowElement = reactFlowWrapper.current.querySelector('.react-flow');
              if (flowElement) {
                flowElement.style.backgroundColor = '#0f172a';
                flowElement.classList.add('dark-flow');
              }
            }
          }
        }, 100);

      } catch (error) {
        console.error('Error generating ER diagram elements:', error);
        setHasError(true);
      }
    }
  }, [schema, diagramMode, setNodes, setEdges, reactFlowInstance]);

  // Handle when a node is dragged and stopped
  const handleNodeDragStop = useCallback((event, node) => {
    if (onNodeDragStop) {
      onNodeDragStop(node.id, node.position);
    }
    
    if (updateTablePosition) {
      const parts = node.id.split('-');
      const nodeType = parts[0];
      let nodeName = '';
      
      if (nodeType === 'relationship') {
        nodeName = parts.length > 1 ? parts[1] : '';
      } else if (nodeType === 'attr' && parts.length > 2) {
        nodeName = parts.slice(2).join('-');
      } else {
        nodeName = node.id.substring(node.id.indexOf('-') + 1);
      }
      
      updateTablePosition({
        id: node.id,
        name: nodeName,
        type: nodeType,
        position: {
          x: Math.round(node.position.x),
          y: Math.round(node.position.y),
          isDraggable: true
        }
      });
    }
  }, [onNodeDragStop, updateTablePosition]);

  // Handle connection between nodes (creating relationships)
  const handleConnect = useCallback((params) => {
    const isEntityToEntity = params.source.startsWith('entity-') && params.target.startsWith('entity-');
    
    if (isEntityToEntity && !readOnly) {
      const sourceEntity = params.source.replace('entity-', '');
      const targetEntity = params.target.replace('entity-', '');
      const relationshipId = `relationship-${sourceEntity}-to-${targetEntity}`;
      const sourceNode = nodes.find(n => n.id === params.source);
      const targetNode = nodes.find(n => n.id === params.target);
      
      if (!sourceNode || !targetNode) return;

      const sourcePos = sourceNode.position;
      const targetPos = targetNode.position;

      const relationshipPos = {
        x: (sourcePos.x + targetPos.x) / 2,
        y: (sourcePos.y + targetPos.y) / 2
      };
      
      const relationshipNode = {
        id: relationshipId,
        type: 'relationshipNode',
        position: relationshipPos,
        data: {
          relationshipName: 'Relates to',
          attributes: [],
          isIdentifying: false,
          type: 'ONE_TO_MANY',
        }
      };

      const determineHandlePositions = (sPos, tPos) => {
        const dx = tPos.x - sPos.x;
        const dy = tPos.y - sPos.y;
        if (Math.abs(dy) < Math.abs(dx) * 0.5) {
          return dx > 0 ? { sourceHandle: 'source-right', targetHandle: 'target-left' } : { sourceHandle: 'source-left', targetHandle: 'target-right' };
        } else {
          return dy > 0 ? { sourceHandle: 'source-bottom', targetHandle: 'target-top' } : { sourceHandle: 'source-top', targetHandle: 'target-bottom' };
        }
      };

      const sourceToRelHandles = determineHandlePositions(sourcePos, relationshipPos);
      const relToTargetHandles = determineHandlePositions(relationshipPos, targetPos);
      
      const sourceToRelationship = {
        id: `edge-${params.source}-to-${relationshipId}`,
        source: params.source,
        target: relationshipId,
        sourceHandle: sourceToRelHandles.sourceHandle,
        targetHandle: sourceToRelHandles.targetHandle,
        type: 'erdEdge',
        data: { sourceCardinality: '1', targetCardinality: '', sourceParticipation: 'partial', targetParticipation: 'partial' }
      };
      
      const relationshipToTarget = {
        id: `edge-${relationshipId}-to-${params.target}`,
        source: relationshipId,
        target: params.target,
        sourceHandle: relToTargetHandles.sourceHandle,
        targetHandle: relToTargetHandles.targetHandle,
        type: 'erdEdge',
        data: { sourceCardinality: '', targetCardinality: 'N', sourceParticipation: 'partial', targetParticipation: 'partial' }
      };
      
      setNodes(nds => [...nds, relationshipNode]);
      setEdges(eds => [...eds, sourceToRelationship, relationshipToTarget]);
      
      if (addRelationship) {
        addRelationship({
          name: 'Relates to',
          sourceTable: sourceEntity,
          targetTable: targetEntity,
          type: 'ONE_TO_MANY',
          sourceParticipation: 'partial',
          targetParticipation: 'partial'
        });
      }
    } else {
       const edge = {
        ...params,
        type: 'erdEdge',
        data: {
          sourceCardinality: '1',
          targetCardinality: 'N',
          sourceParticipation: 'partial',
          targetParticipation: 'partial',
        }
      };
      setEdges(eds => addEdge(edge, eds));
    }
  }, [nodes, setNodes, setEdges, addRelationship, readOnly]);

  if (hasError) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorMessage}>
          <h4>Error rendering diagram</h4>
          <p>There was a problem rendering the ERD diagram.</p>
          <button className={styles.retryButton} onClick={() => setHasError(false)}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`${styles.diagramContainer} ${darkMode ? styles.darkMode : ''}`} 
      ref={reactFlowWrapper} 
      style={{ 
        width: '100%', 
        height: '100%',
        backgroundColor: darkMode ? '#0f172a' : '#ffffff'
      }}
    >
      {/* Direct style override for React Flow in dark mode */}
      {darkMode && (
        <style>
          {`
            .react-flow, .react-flow__pane, .react-flow__renderer {
              background-color: #0f172a !important;
            }
          `}
        </style>
      )}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeDragStop={handleNodeDragStop}
        onConnect={handleConnect}
        onInit={setReactFlowInstance}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.1}
        maxZoom={2}
        attributionPosition="bottom-right"
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        connectionLineType={ConnectionLineType.Bezier}
        connectionLineStyle={{ stroke: '#3b82f6', strokeWidth: 2 }}
        defaultEdgeOptions={{
          type: 'erdEdge',
          data: {
            sourceCardinality: '1',
            targetCardinality: 'N',
            sourceParticipation: 'partial',
            targetParticipation: 'partial',
          }
        }}
        elementsSelectable={true}
        nodesDraggable={true}
        nodesConnectable={!readOnly}
        zoomOnScroll={true}
        panOnScroll={true}
        snapToGrid={true}
        snapGrid={[20, 20]}
        className={`${styles.reactFlow} ${darkMode ? 'dark' : ''}`}
        style={{
          background: darkMode 
            ? '#0f172a' /* Darker background for dark mode */
            : '#f0f7ff', /* Light blue background */
          backgroundColor: darkMode 
            ? '#0f172a' /* Darker background for dark mode - with backgroundColor property */
            : '#f0f7ff', /* Light blue background */
        }}
      >
        <Background 
          variant="dots" 
          gap={20} 
          size={1}
          color={darkMode ? "#6b7280" : "#c7ddff"} 
          style={{ opacity: darkMode ? 0.4 : 0.6 }}
        />
        <Background 
          variant="lines" 
          gap={100} 
          size={1}
          color={darkMode ? "#8b5cf6" : "#90c2ff"} 
          style={{ opacity: darkMode ? 0.2 : 0.4 }}
        />
        <Background 
          variant="cross" 
          gap={100} 
          size={0.5}
          color={darkMode ? "#a78bfa" : "#60a5fa"} 
          style={{ opacity: darkMode ? 0.1 : 0.2 }}
        />
        <Controls showInteractive={false} />
        <MiniMap 
          nodeStrokeColor={(n) => {
            if (n.type === 'relationshipNode') return '#8b5cf6';
            if (n.type === 'attributeNode') return '#10b981';
            if (n.data?.entityType === 'weak') return '#f59e0b';
            return '#3b82f6';
          }}
          nodeColor={(n) => {
            if (n.selected) return '#f97316';
            if (n.type === 'relationshipNode') return darkMode ? '#2d325a' : '#eef2ff';
            if (n.type === 'attributeNode') return darkMode ? '#2d3c4d' : '#e6f7ef';
            return darkMode ? '#2d3252' : '#ffffff';
          }}
          maskColor={darkMode ? 'rgba(26,28,46,0.6)' : 'rgba(255,255,255,0.6)'}
          style={{
            border: darkMode ? '1px solid #3f4561' : '1px solid #e2e8f0',
            borderRadius: '8px',
            overflow: 'hidden',
            backgroundColor: darkMode ? '#1a1c2e' : '#ffffff'
          }}
        />
        
        <Panel position="top-right" className={styles.panel}>
          <div className={styles.panelContent}>
            <h4 className={styles.panelTitle}>ER Diagram Controls</h4>
            
            
            
            <button 
              className={styles.legendButton} 
              onClick={() => setShowLegend(!showLegend)}
            >
              {showLegend ? 'Hide Legend' : 'Show Legend'}
            </button>
            
            <div className={`${styles.panelInfo} ${showLegend ? styles.showInfo : ''}`}>
              <div className={styles.legendSection}>
                <h4 className={styles.legendSectionTitle}>Entity Types</h4>
                <div className={styles.infoItem}><div className={styles.entitySymbol}></div><span>Strong Entity</span></div>
                <div className={styles.infoItem}><div className={`${styles.entitySymbol} ${styles.weakEntitySymbol}`}></div><span>Weak Entity</span></div>
                <div className={styles.infoItem}><div className={`${styles.entitySymbol} ${styles.lookupTableSymbol}`}></div><span>Lookup/Reference Table</span></div>
              </div>
              <div className={styles.legendSection}>
                <h4 className={styles.legendSectionTitle}>Relationship Types</h4>
                <div className={styles.infoItem}><div className={styles.relationshipSymbol}></div><span>Relationship</span></div>
                <div className={styles.infoItem}><div className={`${styles.relationshipSymbol} ${styles.identifyingRelationshipSymbol}`}></div><span>Identifying Relationship</span></div>
                <div className={styles.infoItem}><div className={`${styles.relationshipSymbol} ${styles.oneToManyRelationshipSymbol}`}></div><span>One-to-Many (1:N)</span></div>
                <div className={styles.infoItem}><div className={`${styles.relationshipSymbol} ${styles.manyToManyRelationshipSymbol}`}></div><span>Many-to-Many (M:N)</span></div>
                <div className={styles.infoItem}><div className={`${styles.relationshipSymbol} ${styles.oneToOneRelationshipSymbol}`}></div><span>One-to-One (1:1)</span></div>
              </div>
              <div className={styles.legendSection}>
                <h4 className={styles.legendSectionTitle}>Attributes</h4>
                <div className={styles.infoItem}><div className={styles.attributeSymbol}></div><span>Attribute</span></div>
                <div className={styles.infoItem}><div className={`${styles.attributeSymbol} ${styles.keyAttributeSymbol}`}></div><span>Primary Key</span></div>
                <div className={styles.infoItem}><div className={`${styles.attributeSymbol} ${styles.foreignKeyAttributeSymbol}`}></div><span>Foreign Key</span></div>
                <div className={styles.infoItem}><div className={`${styles.attributeSymbol} ${styles.derivedAttributeSymbol}`}></div><span>Derived Attribute</span></div>
                <div className={styles.infoItem}><div className={`${styles.attributeSymbol} ${styles.multivaluedAttributeSymbol}`}></div><span>Multivalued Attribute</span></div>
              </div>
              <div className={styles.legendSection}>
                  <h4 className={styles.legendSectionTitle}>Participation & Cardinality</h4>
                  <div className={styles.infoItem}><div className={styles.totalParticipationLine}></div><span>Total Participation (Required)</span></div>
                  <div className={styles.infoItem}><div className={styles.partialParticipationLine}></div><span>Partial Participation (Optional)</span></div>
                  <div className={styles.infoItem}><div className={styles.cardinalitySymbol}>1</div><span>Exactly One</span></div>
                  <div className={styles.infoItem}><div className={styles.cardinalitySymbol}>N</div><span>Many</span></div>
                  <div className={styles.infoItem}><div className={styles.cardinalitySymbol}>0..1</div><span>Zero or One</span></div>
                  <div className={styles.infoItem}><div className={styles.cardinalitySymbol}>1..*</div><span>One or More</span></div>
              </div>
            </div>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
};

export default ERDDiagram;