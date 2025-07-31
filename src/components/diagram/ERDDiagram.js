'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Panel,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType,
  ConnectionLineType,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { generateERDiagramElements } from '@/lib/diagramUtils';
import styles from '@/styles/ERDDiagram.module.css';
import EntityNode from './EntityNode';
import RelationshipNode from './RelationshipNode';
import AttributeNode from './AttributeNode';
import ERDEdge from './ERDEdge';
import { useSchemaContext } from '@/contexts/SchemaContext';

// Custom node and edge types
const nodeTypes = {
  entityNode: EntityNode,
  relationshipNode: RelationshipNode,
  attributeNode: AttributeNode,
};

const edgeTypes = {
  erdEdge: ERDEdge,
};

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
  const [diagramMode, setDiagramMode] = useState('conceptual'); // 'conceptual' or 'logical'
  const [showLegend, setShowLegend] = useState(false); // Toggle for legend visibility
  
  const { updateTablePosition, addRelationship } = useSchemaContext();
  
  // Initialize the diagram with schema data
  useEffect(() => {
    if (schema) {
      try {
        // Generate all ER diagram elements based on the current mode
        const { nodes: diagramNodes, edges: diagramEdges } = generateERDiagramElements(schema, diagramMode);
        
        // Apply any saved positions to the nodes before rendering
        if (schema.nodePositions) {
          diagramNodes.forEach(node => {
            if (schema.nodePositions[node.id]) {
              node.position = schema.nodePositions[node.id];
            }
          });
        }
        
        setNodes(diagramNodes);
        setEdges(diagramEdges);
      } catch (error) {
        console.error('Error generating ER diagram elements:', error);
      }
    }
  }, [schema, diagramMode, setNodes, setEdges]);

  // Handle when a node is dragged and stopped
  const handleNodeDragStop = useCallback((event, node) => {
    if (onNodeDragStop && typeof onNodeDragStop === 'function') {
      onNodeDragStop(node.id, node.position);
    }
    
    // Update node position in schema context
    if (updateTablePosition && typeof updateTablePosition === 'function') {
      // Store position for all node types (entity, attribute, relationship)
      const parts = node.id.split('-');
      const nodeType = parts[0];
      
      // For attributes of entities, we need to handle the ID differently
      // Format is typically 'attr-entity-entityName-attrName'
      let nodeName = '';
      if (nodeType === 'attr' && parts.length > 2) {
        nodeName = parts.slice(2).join('-');
      } else {
        nodeName = node.id.substring(node.id.indexOf('-') + 1);
      }
      
      // Pass the correct object format to updateTablePosition
      updateTablePosition({
        id: node.id, // Keep the full ID for position lookup
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
    // Determine if we're connecting entities or attributes
    const isEntityToEntity = params.source.startsWith('entity-') && params.target.startsWith('entity-');
    const isEntityToRelationship = 
      (params.source.startsWith('entity-') && params.target.startsWith('relationship-')) || 
      (params.source.startsWith('relationship-') && params.target.startsWith('entity-'));
    
    // Create edge with custom settings
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
    
    // If connecting entity to entity, create a relationship node in between
    if (isEntityToEntity && !readOnly) {
      // Generate a unique ID for the relationship
      const relationshipId = `relationship-${Date.now()}`;
      const sourcePos = nodes.find(n => n.id === params.source)?.position || { x: 0, y: 0 };
      const targetPos = nodes.find(n => n.id === params.target)?.position || { x: 0, y: 0 };
      
      // Calculate position for the relationship node (midpoint)
      const relationshipPos = {
        x: (sourcePos.x + targetPos.x) / 2,
        y: (sourcePos.y + targetPos.y) / 2
      };
      
      // Create the relationship node
      const relationshipNode = {
        id: relationshipId,
        type: 'relationshipNode',
        position: relationshipPos,
        data: {
          relationshipName: 'Relates to', // Default relationship name
          attributes: [],
          isIdentifying: false,
          type: 'ONE_TO_MANY', // Default relationship type
        }
      };
      
      // Calculate appropriate handle positions based on relative node positions
      const determineHandlePositions = (sourcePos, targetPos) => {
        // Determine direction based on relative positions
        const dx = targetPos.x - sourcePos.x;
        const dy = targetPos.y - sourcePos.y;
        
        // Default to horizontal connections if close to same y-level
        if (Math.abs(dy) < Math.abs(dx) * 0.5) {
          // Horizontal connection (left to right or right to left)
          if (dx > 0) {
            return {
              sourceHandle: 'source-right',
              targetHandle: 'target-left'
            };
          } else {
            return {
              sourceHandle: 'source-left',
              targetHandle: 'target-right'
            };
          }
        } else {
          // Vertical connection (top to bottom or bottom to top)
          if (dy > 0) {
            return {
              sourceHandle: 'source-bottom',
              targetHandle: 'target-top'
            };
          } else {
            return {
              sourceHandle: 'source-top',
              targetHandle: 'target-bottom'
            };
          }
        }
      };
      
      // Get handles for source to relationship connection
      const sourceToRelHandles = determineHandlePositions(sourcePos, relationshipPos);
      
      // Get handles for relationship to target connection
      const relToTargetHandles = determineHandlePositions(relationshipPos, targetPos);
      
      // Create edges from both entities to the relationship with automatic handle connections
      const sourceToRelationship = {
        id: `edge-${params.source}-${relationshipId}`,
        source: params.source,
        target: relationshipId,
        sourceHandle: sourceToRelHandles.sourceHandle,
        targetHandle: sourceToRelHandles.targetHandle,
        type: 'erdEdge',
        animated: false,
        data: {
          sourceCardinality: '1',
          targetCardinality: '',
          sourceParticipation: 'partial',
          targetParticipation: 'partial',
          label: '', // No label on the edge
        }
      };
      
      const relationshipToTarget = {
        id: `edge-${relationshipId}-${params.target}`,
        source: relationshipId,
        target: params.target,
        sourceHandle: relToTargetHandles.sourceHandle,
        targetHandle: relToTargetHandles.targetHandle,
        type: 'erdEdge',
        animated: false,
        data: {
          sourceCardinality: '',
          targetCardinality: 'N',
          sourceParticipation: 'partial',
          targetParticipation: 'partial',
          label: '', // No label on the edge
        }
      };
      
      // Add the new nodes and edges
      setNodes(nds => [...nds, relationshipNode]);
      setEdges(eds => [...eds, sourceToRelationship, relationshipToTarget]);
      
      // Add relationship to schema context
      if (addRelationship && typeof addRelationship === 'function') {
        const sourceEntity = params.source.replace('entity-', '');
        const targetEntity = params.target.replace('entity-', '');
        
        addRelationship({
          name: 'Relates to',
          sourceTable: sourceEntity,
          targetTable: targetEntity,
          type: 'ONE_TO_MANY',
        });
      }
    } 
    // For direct connections or entity-relationship connections
    else {
      // Add edge to diagram
      setEdges(eds => addEdge(edge, eds));
      
      // For entity-relationship connections, we don't need to add a schema relationship
      // since the relationship node itself represents the relationship
    }
  }, [nodes, setNodes, setEdges, addRelationship, readOnly]);

  // Handle errors with diagram rendering
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorMessage}>
          <h4>Error rendering diagram</h4>
          <p>There was a problem rendering the ERD diagram.</p>
          <button 
            className={styles.retryButton}
            onClick={() => setHasError(false)}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Handle errors in rendering
  useEffect(() => {
    const handleError = (error) => {
      console.error('ERD Diagram error:', error);
      setHasError(true);
    };

    window.addEventListener('error', handleError);
    
    return () => {
      window.removeEventListener('error', handleError);
    };
  }, []);

  return (
    <div className={`${styles.diagramContainer} ${darkMode ? styles.darkMode : ''}`} ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeDragStop={handleNodeDragStop}
        onConnect={handleConnect}
        onInit={(instance) => {
          setReactFlowInstance(instance);
          // After initialization, update positions in the schema context
          if (instance) {
            // Save positions of all nodes to make them persistent
            instance.getNodes().forEach(node => {
              if (updateTablePosition) {
                // Handle all node types
                const nodeType = node.id.split('-')[0];
                const nodeName = node.id.substring(node.id.indexOf('-') + 1);
                
                updateTablePosition({
                  id: node.id,
                  name: nodeName,
                  type: nodeType,
                  position: node.position
                });
              }
            });
          }
        }}
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
        onNodeClick={(e, node) => {
          // This helps ensure the node is properly recognized as selected
          node.selected = true;
        }}
        snapToGrid={true}
        snapGrid={[20, 20]} 
        className={styles.reactFlow}
      >
        <Background color="#aaa" gap={16} />
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
            if (n.type === 'relationshipNode') return '#ddd6fe';
            if (n.type === 'attributeNode') return '#d1fae5';
            return '#fff';
          }}
          maskColor={darkMode ? 'rgba(0,0,0,0.2)' : 'rgba(240,249,255,0.7)'}
        />
        
        <Panel position="top-right" className={styles.panel}>
          <div className={styles.panelContent}>
            <h4 className={styles.panelTitle}>ER Diagram Controls</h4>
            
            {/* Mode switcher */}
            <div className={styles.modeSwitcher}>
              <button 
                className={`${styles.modeButton} ${diagramMode === 'conceptual' ? styles.activeMode : ''}`}
                onClick={() => setDiagramMode('conceptual')}
              >
                Conceptual
              </button>
              <button 
                className={`${styles.modeButton} ${diagramMode === 'logical' ? styles.activeMode : ''}`}
                onClick={() => setDiagramMode('logical')}
              >
                Logical
              </button>
            </div>
            
            {/* Legend */}
            <div className={styles.panelInfo}>
              <div className={styles.legendTitle}>Legend</div>
              
              <div className={styles.legendSection}>
                <h4 className={styles.legendSectionTitle}>Entity Types</h4>
                <div className={styles.infoItem}>
                  <div className={styles.entitySymbol}></div>
                  <span>Strong Entity</span>
                </div>
                
                <div className={styles.infoItem}>
                  <div className={`${styles.entitySymbol} ${styles.weakEntitySymbol}`}></div>
                  <span>Weak Entity</span>
                </div>
                
                <div className={styles.infoItem}>
                  <div className={`${styles.entitySymbol} ${styles.associativeEntitySymbol}`}></div>
                  <span>Associative Entity</span>
                </div>
                
                <div className={styles.infoItem}>
                  <div className={`${styles.entitySymbol} ${styles.lookupTableSymbol}`}></div>
                  <span>Lookup/Reference Table</span>
                </div>
              </div>
                
              <div className={styles.legendSection}>
                <h4 className={styles.legendSectionTitle}>Relationship Types</h4>
                <div className={styles.infoItem}>
                  <div className={styles.relationshipSymbol}></div>
                  <span>Relationship Diamond (Contains verb phrase)</span>
                </div>
                
                <div className={styles.infoItem}>
                  <div className={`${styles.relationshipSymbol} ${styles.identifyingRelationshipSymbol}`}></div>
                  <span>Identifying Relationship</span>
                </div>
                
                <div className={styles.infoItem}>
                  <div className={`${styles.relationshipSymbol} ${styles.oneToManyRelationshipSymbol}`}></div>
                  <span>One-to-Many (1:N)</span>
                </div>
                
                <div className={styles.infoItem}>
                  <div className={`${styles.relationshipSymbol} ${styles.manyToManyRelationshipSymbol}`}></div>
                  <span>Many-to-Many (M:N)</span>
                </div>
                
                <div className={styles.infoItem}>
                  <div className={`${styles.relationshipSymbol} ${styles.oneToOneRelationshipSymbol}`}></div>
                  <span>One-to-One (1:1)</span>
                </div>
              </div>
              
              <div className={styles.legendSection}>
                <h4 className={styles.legendSectionTitle}>Attributes</h4>
                <div className={styles.infoItem}>
                  <div className={styles.attributeSymbol}></div>
                  <span>Attribute</span>
                </div>
                
                <div className={styles.infoItem}>
                  <div className={`${styles.attributeSymbol} ${styles.keyAttributeSymbol}`}></div>
                  <span>Primary Key</span>
                </div>
                
                <div className={styles.infoItem}>
                  <div className={`${styles.attributeSymbol} ${styles.foreignKeyAttributeSymbol}`}></div>
                  <span>Foreign Key</span>
                </div>
                
                <div className={styles.infoItem}>
                  <div className={`${styles.attributeSymbol} ${styles.derivedAttributeSymbol}`}></div>
                  <span>Derived Attribute</span>
                </div>
                
                <div className={styles.infoItem}>
                  <div className={`${styles.attributeSymbol} ${styles.multivaluedAttributeSymbol}`}></div>
                  <span>Multivalued Attribute</span>
                </div>
              </div>
              
              <div className={styles.legendSection}>
                <h4 className={styles.legendSectionTitle}>Relationship Lines & Cardinality</h4>
                <div className={styles.infoItem}>
                  <div className={styles.totalParticipationLine}></div>
                  <span>Total Participation (Solid Line - Entity MUST participate in relationship)</span>
                </div>
                
                <div className={styles.infoItem}>
                  <div className={styles.partialParticipationLine}></div>
                  <span>Partial Participation (Dashed Line - Entity MAY participate in relationship)</span>
                </div>
                
                <div className={styles.infoItem}>
                  <div className={styles.oneToManyEdgeLine}></div>
                  <span>One-to-Many Edge (1:N)</span>
                </div>
                
                <div className={styles.infoItem}>
                  <div className={styles.manyToManyEdgeLine}></div>
                  <span>Many-to-Many Edge (M:N)</span>
                </div>
                
                <div className={styles.infoItem}>
                  <div className={styles.identifyingEdgeLine}></div>
                  <span>Identifying Edge (PK dependency)</span>
                </div>
                
                <div className={styles.infoItem}>
                  <div className={styles.cardinalitySymbol}>1</div>
                  <span>Exactly One</span>
                </div>
                
                <div className={styles.infoItem}>
                  <div className={styles.cardinalitySymbol}>N</div>
                  <span>Many</span>
                </div>
                
                <div className={styles.infoItem}>
                  <div className={styles.cardinalitySymbol}>0..1</div>
                  <span>Zero or One (Optional)</span>
                </div>
                
                <div className={styles.infoItem}>
                  <div className={styles.cardinalitySymbol}>1..*</div>
                  <span>One or More (Required Many)</span>
                </div>
              </div>
            </div>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
};

export default ERDDiagram;
