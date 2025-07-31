/**
 * Utility functions for ER diagram generation according to
 * standard Entity-Relationship Diagram notation
 */

import { safeObjectKeys, isValidObject, safeObjectAccess } from './safeUtils';

/**
 * Generate nodes and edges for an ER diagram from a schema
 * @param {Object} schema - Database schema
 * @param {string} mode - 'conceptual' or 'logical'
 * @returns {Object} - Object containing nodes and edges arrays
 */
export const generateERDiagramElements = (schema, mode = 'conceptual') => {
  if (!schema || !isValidObject(schema)) {
    console.warn('Invalid schema data provided to generateERDiagramElements', schema);
    return { nodes: [], edges: [] };
  }
  
  const nodes = [];
  const edges = [];
  
  // Extract tables/entities and their positions
  const tables = Array.isArray(schema.tables) ? schema.tables : [];
  
  // Process entities
  tables.forEach((table, index) => {
    if (!table || typeof table !== 'object') {
      console.warn('Invalid table object at index', index, table);
      return;
    }
    
    const tableName = table.name || `Table_${index}`;
    const entityId = `entity-${tableName}`;
    
    // Check if this is a lookup/reference table
    const isLookupTable = table.isLookupTable || 
                          (schema.lookupTables && 
                           Array.isArray(schema.lookupTables) && 
                           schema.lookupTables.some(lt => lt === tableName || 
                                                    (lt.name && lt.name === tableName)));
    
    // Create entity node
    const entityNode = {
      id: entityId,
      type: 'entityNode',
      position: table.position || { 
        x: 100 + (index % 3) * 500, // Increased horizontal spacing
        y: 100 + Math.floor(index / 3) * 400 // Increased vertical spacing
      },
      data: {
        entityName: tableName,
        // Convert columns to attributes
        attributes: (Array.isArray(table.columns) ? table.columns : [])
          .map(column => ({
            name: column.name || 'Unnamed',
            dataType: mode === 'logical' ? column.dataType : undefined,
            isPrimaryKey: column.isPrimaryKey || false,
            isForeignKey: column.isForeignKey || false,
            isNullable: column.isNullable !== false,
            isMultivalued: column.isMultivalued || false,
            isDerived: column.isDerived || false,
            isComposite: column.isComposite || false,
          })),
        entityType: determineEntityType(table, schema),
        description: table.description || '',
        isLookupTable: isLookupTable,
        assumptionsMade: table.assumptionsMade || []
      },
      draggable: true, // Ensure draggable is set to true
      selectable: true, // Make sure nodes are selectable
    };
    
    nodes.push(entityNode);
    
    // In conceptual mode, we display attributes as separate nodes
    if (mode === 'conceptual') {
      // Only process attribute nodes for non-empty columns
      if (Array.isArray(table.columns) && table.columns.length > 0) {
        createAttributeNodes(table, entityId, nodes, edges, schema);
      }
    }
  });
  
  // Process relationships
  if (mode === 'conceptual') {
    // In conceptual mode, create relationship nodes
    createRelationshipNodes(schema, nodes, edges);
  } else {
    // In logical mode, create direct edges between entities
    createLogicalEdges(schema, edges);
  }
  
  return { nodes, edges };
};

/**
 * Determine the type of entity based on its properties and relationships
 * @param {Object} table - Table object
 * @param {Object} schema - Complete schema
 * @returns {string} - 'strong', 'weak', or 'associative'
 */
const determineEntityType = (table, schema) => {
  if (!table || !schema) return 'strong';
  
  const tableName = table.name;
  const relationships = Array.isArray(schema.relationships) ? schema.relationships : [];
  
  // Check if it's a weak entity (depends on another entity for identification)
  const isWeakEntity = hasIdentifyingRelationship(tableName, relationships);
  
  // Check if it's an associative entity (junction table for M:N relationship)
  const isAssociativeEntity = isJunctionTable(tableName, table, relationships);
  
  if (isWeakEntity) return 'weak';
  if (isAssociativeEntity) return 'associative';
  return 'strong';
};

/**
 * Check if an entity participates in an identifying relationship
 * @param {string} tableName - Name of the table
 * @param {Array} relationships - All relationships
 * @returns {boolean} - True if the entity is identified by another entity
 */
const hasIdentifyingRelationship = (tableName, relationships) => {
  return relationships.some(rel => 
    rel.targetTable === tableName && 
    (rel.isIdentifying === true || rel.identifying === true)
  );
};

/**
 * Check if a table is a junction table (associative entity)
 * @param {string} tableName - Name of the table
 * @param {Object} table - Table object
 * @param {Array} relationships - All relationships
 * @returns {boolean} - True if the table is a junction table
 */
const isJunctionTable = (tableName, table, relationships) => {
  // Check if the table has exactly two foreign keys
  const foreignKeyColumns = (Array.isArray(table.columns) ? table.columns : [])
    .filter(col => col.isForeignKey);
    
  if (foreignKeyColumns.length !== 2) return false;
  
  // Check if there are relationships from this table to two different tables
  const relFromTable = relationships.filter(rel => 
    rel.sourceTable === tableName || rel.targetTable === tableName
  );
  
  const relatedTables = new Set();
  relFromTable.forEach(rel => {
    if (rel.sourceTable !== tableName) relatedTables.add(rel.sourceTable);
    if (rel.targetTable !== tableName) relatedTables.add(rel.targetTable);
  });
  
  return relatedTables.size >= 2;
};

/**
 * Create attribute nodes for entities in conceptual mode
 * @param {Object} table - Table object
 * @param {string} entityId - ID of the entity node
 * @param {Array} nodes - Nodes array to append to
 * @param {Array} edges - Edges array to append to
 */
const createAttributeNodes = (table, entityId, nodes, edges, schema = {}) => {
  if (!Array.isArray(table.columns)) return;
  
  const entityPosition = nodes.find(n => n.id === entityId)?.position || { x: 0, y: 0 };
  
  // Calculate positions around the entity in a circular pattern
  table.columns.forEach((column, index) => {
    if (!column || typeof column !== 'object') return;
    
    const attributeId = `attr-${entityId}-${column.name || index}`;
    
    // Calculate the number of attributes to improve spacing
    const totalAttrs = table.columns.length;
    
    // Distribute attributes more evenly based on the number of attributes
    let radius, angle;
    
    if (totalAttrs <= 4) {
      // For 1-4 attributes, place them in a simple circle
      const angleStep = (2 * Math.PI) / Math.max(totalAttrs, 4);
      angle = index * angleStep + Math.PI/4; // Offset to start at 45 degrees
      radius = 180; // Base distance from entity center
    } else {
      // For more attributes, arrange in layers
      const innerRadius = 180;
      const outerRadius = 270;
      
      // Determine if this attribute should be in the inner or outer circle
      const isInner = index % 2 === 0;
      radius = isInner ? innerRadius : outerRadius;
      
      // Calculate position in the appropriate circle
      const circleItemCount = Math.ceil(totalAttrs / 2); // Items per circle
      const angleStep = (2 * Math.PI) / circleItemCount;
      const circleIndex = Math.floor(index / 2);
      angle = circleIndex * angleStep;
    }
    
    // Position attribute in a circle around the entity
    const attrX = entityPosition.x + radius * Math.cos(angle);
    const attrY = entityPosition.y + radius * Math.sin(angle);
    
    // Create attribute node
    // Check if we have a saved position for this attribute
    const savedPosition = schema?.nodePositions?.[attributeId];
    
    const attributeNode = {
      id: attributeId,
      type: 'attributeNode',
      // Use saved position if available, otherwise use calculated position
      position: savedPosition || { x: attrX, y: attrY },
      data: {
        attributeName: column.name || 'Unnamed',
        dataType: column.dataType || '',
        isPrimaryKey: column.isPrimaryKey || false,
        isDerived: column.isDerived || false,
        isMultivalued: column.isMultivalued || false,
        isComposite: column.isComposite || false,
        subAttributes: column.subAttributes || [],
      },
      draggable: true,
    };
    
    nodes.push(attributeNode);
    
    // Create edge from entity to attribute
    edges.push({
      id: `edge-${entityId}-to-${attributeId}`,
      source: entityId,
      target: attributeId,
      style: { stroke: '#10b981', strokeWidth: 1 },
      type: 'default',
      animated: false,
    });
  });
};

/**
 * Create relationship nodes in conceptual mode
 * @param {Object} schema - Schema object
 * @param {Array} nodes - Nodes array to append to
 * @param {Array} edges - Edges array to append to
 */
const createRelationshipNodes = (schema, nodes, edges) => {
  if (!Array.isArray(schema.relationships)) return;
  
  schema.relationships.forEach((rel, index) => {
    if (!rel || typeof rel !== 'object') return;
    
    const relationshipId = `relationship-${rel.name || `rel${index}`}`;
    const sourceEntityId = `entity-${rel.sourceTable}`;
    const targetEntityId = `entity-${rel.targetTable}`;
    
    // Get source and target positions
    const sourcePos = nodes.find(n => n.id === sourceEntityId)?.position;
    const targetPos = nodes.find(n => n.id === targetEntityId)?.position;
    
    if (!sourcePos || !targetPos) return;
    
    // Calculate default position for the relationship (midpoint)
    const defaultPos = {
      x: (sourcePos.x + targetPos.x) / 2,
      y: (sourcePos.y + targetPos.y) / 2
    };
    
    // Check if we have a saved position for this relationship
    const savedPosition = schema?.nodePositions?.[relationshipId] || 
                          rel.position?.isDraggable ? rel.position : null;
    
    // Create relationship node
    const relationshipNode = {
      id: relationshipId,
      type: 'relationshipNode',
      position: savedPosition || defaultPos,
      data: {
        relationshipName: rel.name || 'Relates',
        attributes: rel.attributes || [],
        isIdentifying: rel.isIdentifying || rel.identifying || false,
        description: rel.description || '',
        assumptionsMade: rel.assumptionsMade || [],
        isDraggable: true, // Ensure data includes draggability flag
        type: rel.type || '', // Include relationship type for styling
        cardinality: rel.cardinality || null // Include specific cardinality range if available
      },
      draggable: true, // Explicitly set draggable property
    };
    
    nodes.push(relationshipNode);
    
    // Create edges from source entity to relationship
    edges.push({
      id: `edge-${sourceEntityId}-to-${relationshipId}`,
      source: sourceEntityId,
      target: relationshipId,
      type: 'erdEdge',
      data: {
        sourceCardinality: rel.sourceCardinality || getCardinalityNotation(rel.type, 'source'),
        targetCardinality: '',
        sourceParticipation: rel.sourceParticipation || 'partial',
        targetParticipation: 'partial',
        label: '', // Remove relationship name from the edge
        relationshipType: rel.type || '',
        isIdentifying: rel.isIdentifying || rel.identifying || false,
        // Add support for exact cardinality ranges
        cardinalityRange: rel.cardinality?.split('-')[0] || null
      }
    });
    
    // Create edge from relationship to target entity
    edges.push({
      id: `edge-${relationshipId}-to-${targetEntityId}`,
      source: relationshipId,
      target: targetEntityId,
      type: 'erdEdge',
      data: {
        sourceCardinality: '',
        targetCardinality: rel.targetCardinality || getCardinalityNotation(rel.type, 'target'),
        sourceParticipation: 'partial',
        relationshipType: rel.type || '',
        isIdentifying: rel.isIdentifying || rel.identifying || false,
        targetParticipation: rel.targetParticipation || 'partial',
        label: '', // Remove relationship name from the edge
        // Add support for exact cardinality ranges
        cardinalityRange: rel.cardinality?.split('-')[1] || null
      }
    });
  });
};

/**
 * Create logical edges for the logical view of the ER diagram
 * @param {Object} schema - Schema object
 * @param {Array} edges - Edges array to append to
 */
const createLogicalEdges = (schema, edges) => {
  if (!Array.isArray(schema.relationships)) return;
  
  schema.relationships.forEach((rel, index) => {
    if (!rel || typeof rel !== 'object') return;
    
    const sourceEntityId = `entity-${rel.sourceTable}`;
    const targetEntityId = `entity-${rel.targetTable}`;
    
    // Calculate the best handles for connection based on node positions
    const sourceNodeIndex = nodes.findIndex(n => n.id === sourceEntityId);
    const targetNodeIndex = nodes.findIndex(n => n.id === targetEntityId);
    
    // Default handles
    let sourceHandle = 'source-right';
    let targetHandle = 'target-left';
    
    // If we have node positions, try to determine the best handles
    if (sourceNodeIndex !== -1 && targetNodeIndex !== -1) {
      const sourcePos = nodes[sourceNodeIndex].position;
      const targetPos = nodes[targetNodeIndex].position;
      
      // Determine if connection should be horizontal or vertical
      const dx = targetPos.x - sourcePos.x;
      const dy = targetPos.y - sourcePos.y;
      
      if (Math.abs(dx) > Math.abs(dy)) {
        // Horizontal connection
        if (dx > 0) {
          // Source is to the left of target
          sourceHandle = 'source-right';
          targetHandle = 'target-left';
        } else {
          // Source is to the right of target
          sourceHandle = 'source-left';
          targetHandle = 'target-right';
        }
      } else {
        // Vertical connection
        if (dy > 0) {
          // Source is above target
          sourceHandle = 'source-bottom';
          targetHandle = 'target-top';
        } else {
          // Source is below target
          sourceHandle = 'source-top';
          targetHandle = 'target-bottom';
        }
      }
    }
    
    // Create a direct edge between entities with cardinality notations
    edges.push({
      id: `edge-${sourceEntityId}-to-${targetEntityId}-${index}`,
      source: sourceEntityId,
      target: targetEntityId,
      sourceHandle: sourceHandle,
      targetHandle: targetHandle,
      type: 'erdEdge',
      data: {
        sourceCardinality: getCardinalityNotation(rel.type, 'source'),
        targetCardinality: getCardinalityNotation(rel.type, 'target'),
        sourceParticipation: rel.sourceParticipation || 'partial',
        targetParticipation: rel.targetParticipation || 'partial',
        label: rel.name || '',
        relationshipType: rel.type || '',
        isIdentifying: rel.isIdentifying || rel.identifying || false
      },
      style: {
        // We'll use classes for styling now instead of inline styles
        strokeWidth: 2,
      },
      animated: false,
    });
  });
};

/**
 * Get the cardinality notation based on relationship type
 * @param {string} relType - Relationship type (ONE_TO_ONE, ONE_TO_MANY, etc.)
 * @param {string} side - 'source' or 'target'
 * @param {string} exactRange - Optional exact cardinality range (e.g., "0..1", "1..*")
 * @returns {string} - Cardinality notation ('1', 'N', 'M', etc.) or exact range
 */
const getCardinalityNotation = (relType, side, exactRange) => {
  // If exact cardinality range is provided, use it
  if (exactRange) {
    return exactRange;
  }
  
  if (!relType) return '1';
  
  switch (relType) {
    case 'ONE_TO_ONE':
      return '1';
    case 'ONE_TO_MANY':
      return side === 'source' ? '1' : 'N';
    case 'MANY_TO_ONE':
      return side === 'source' ? 'N' : '1';
    case 'MANY_TO_MANY':
      return side === 'source' ? 'M' : 'N';
    default:
      return '1';
  }
};

/**
 * Legacy functions for backward compatibility
 */

export const generateTableNodes = (tables = []) => {
  if (!tables || !Array.isArray(tables)) {
    console.warn('Using legacy function generateTableNodes. Consider upgrading to generateERDiagramElements');
    return [];
  }
  
  return tables.map((table, index) => {
    if (!table || typeof table !== 'object') {
      console.warn('Invalid table object at index', index, table);
      return null;
    }
    
    return {
      id: table.name || `table_${index}`,
      type: 'entityNode', // Updated to use new entityNode type
      position: table.position || { 
        x: 100 + (index % 3) * 400, 
        y: 100 + Math.floor(index / 3) * 300 
      },
      data: {
        entityName: table.name || `Table ${index}`,
        attributes: Array.isArray(table.columns) ? table.columns : [],
        entityType: table.entityType || 'strong', 
        description: table.description || ''
      },
      draggable: true,
    };
  }).filter(Boolean);
};

export const generateRelationshipEdges = (relationships = []) => {
  console.warn('Using legacy function generateRelationshipEdges. Consider upgrading to generateERDiagramElements');
  
  if (!relationships || !Array.isArray(relationships)) {
    return [];
  }
  
  return relationships.map((relationship, index) => {
    if (!relationship || typeof relationship !== 'object') {
      console.warn('Invalid relationship object at index', index, relationship);
      return null;
    }
    
    const source = relationship.sourceTable || '';
    const target = relationship.targetTable || '';
    
    if (!source || !target) return null;
    
    // Determine edge styling based on relationship type
    let sourceMarker = null;
    let targetMarker = 'arrow';
    let edgeStyle = { strokeWidth: 2 };
    let animated = false;
    let labelBg = '#ffffff';
    let labelStyle = { fontWeight: 'bold' };
    let type = 'smoothstep';
    
    // Custom label with cardinality symbols
    let sourceLabel = '';
    let targetLabel = '';
    let label = '';
    
    switch (relationship.type) {
      case 'ONE_TO_ONE':
        edgeStyle.stroke = '#10b981'; // green
        sourceLabel = '1';
        targetLabel = '1';
        label = '1:1';
        labelBg = '#d1fae5'; // light green
        break;
        
      case 'ONE_TO_MANY':
        edgeStyle.stroke = '#3b82f6'; // blue
        sourceLabel = '1';
        targetLabel = 'N';
        label = '1:N';
        labelBg = '#dbeafe'; // light blue
        break;
        
      case 'MANY_TO_ONE':
        edgeStyle.stroke = '#3b82f6'; // blue
        sourceLabel = 'N';
        targetLabel = '1';
        label = 'N:1';
        labelBg = '#dbeafe'; // light blue
        animated = true;
        break;
        
      case 'MANY_TO_MANY':
        edgeStyle.stroke = '#8b5cf6'; // purple
        sourceLabel = 'N';
        targetLabel = 'M';
        label = 'N:M';
        labelBg = '#ede9fe'; // light purple
        animated = true;
        type = 'step';
        break;
        
      case 'IDENTIFYING_RELATIONSHIP':
        edgeStyle.stroke = '#eab308'; // yellow
        edgeStyle.strokeWidth = 3;
        edgeStyle.strokeDasharray = '5,5';
        sourceLabel = '1';
        targetLabel = '1';
        label = 'identifies';
        labelBg = '#fef3c7'; // light yellow
        break;
        
      default:
        edgeStyle.stroke = '#64748b'; // slate
        break;
    }
    
    // Create custom edge with rich styling using safe utils
    const sourceTable = safeObjectAccess(relationship, 'sourceTable', `source_${index}`);
    const targetTable = safeObjectAccess(relationship, 'targetTable', `target_${index}`);
    
    return {
      id: safeObjectAccess(relationship, 'name', `${sourceTable}-${targetTable}`),
      source: `entity-${sourceTable}`, // Updated to match entity node ID format
      target: `entity-${targetTable}`, // Updated to match entity node ID format
      sourceHandle: safeObjectAccess(relationship, 'sourceColumn', null),
      targetHandle: safeObjectAccess(relationship, 'targetColumn', null),
      animated,
      label,
      labelBgPadding: [8, 4],
      labelBgBorderRadius: 4,
      labelBg,
      labelStyle,
      style: edgeStyle,
      // Use a string reference for markerEnd in v10.x instead of an object
      markerEnd: 'arrowclosed',
      // For version 10.x, markerStart should be null if not used
      markerStart: null,
      // Add decorations to show cardinality
      data: {
        sourceLabel,
        targetLabel,
        sourceCardinality: getCardinalityNotation(relationship.type, 'source'),
        targetCardinality: getCardinalityNotation(relationship.type, 'target'),
        sourceParticipation: relationship.sourceParticipation || 'partial',
        targetParticipation: relationship.targetParticipation || 'partial',
        description: safeObjectAccess(relationship, 'description', ''),
        participationType: safeObjectAccess(relationship, 'participationType', 'PARTIAL'),
        label: relationship.name || '',  // Make sure we have a label for the edge
      },
      // Use bezier curve for smoother lines
      type: 'bezier',
    };
  }).filter(Boolean); // Filter out any null values
};