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
  
  console.log('Generating diagram elements with schema:', schema);
  
  const nodes = [];
  const edges = [];
  
  // Extract tables/entities and their positions
  const tables = Array.isArray(schema.tables) ? schema.tables : [];
  
  // Initialize entities array if not present
  if (!Array.isArray(schema.entities)) {
    schema.entities = tables.map(table => ({
      name: table.name,
      attributes: table.columns
    }));
    
    console.log('Generated entities from tables:', schema.entities.map(e => e.name));
  }
  
  // Ensure case consistency in entity names
  const normalizeEntityNames = (data) => {
    // Create a map of lowercase entity names to their actual casing in tables
    const entityMap = {};
    
    // Add entities from tables
    if (Array.isArray(data.tables)) {
      data.tables.forEach(table => {
        if (table.name) {
          entityMap[table.name.toLowerCase()] = table.name;
        }
      });
    }
    
    // Also add entities from the entities array if it exists
    if (Array.isArray(data.entities)) {
      data.entities.forEach(entity => {
        if (entity.name) {
          entityMap[entity.name.toLowerCase()] = entity.name;
        }
      });
    }
    
    // Normalize relationship entity references
    if (Array.isArray(data.relationships)) {
      data.relationships.forEach(rel => {
        // First try direct match, then try case-insensitive match
        if (rel.sourceEntity) {
          if (entityMap[rel.sourceEntity.toLowerCase()]) {
            rel.sourceEntity = entityMap[rel.sourceEntity.toLowerCase()];
          }
        }
        if (rel.sourceTable) {
          if (entityMap[rel.sourceTable.toLowerCase()]) {
            rel.sourceTable = entityMap[rel.sourceTable.toLowerCase()];
          }
        }
        if (rel.targetEntity) {
          if (entityMap[rel.targetEntity.toLowerCase()]) {
            rel.targetEntity = entityMap[rel.targetEntity.toLowerCase()];
          }
        }
        if (rel.targetTable) {
          if (entityMap[rel.targetTable.toLowerCase()]) {
            rel.targetTable = entityMap[rel.targetTable.toLowerCase()];
          }
        }
      });
    }
    
    return data;
  };
  
  // Normalize entity names to ensure case consistency
  schema = normalizeEntityNames(schema);
  
  // Process entities
  tables.forEach((table, index) => {
    if (!table || typeof table !== 'object') {
      console.warn('Invalid table object at index', index, table);
      return;
    }
    
    const tableName = table.name || `Table_${index}`;
    
    // Create a consistent entity ID - using the exact case from the original table.name
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
 * @returns {string} - 'strong' or 'weak'
 */
const determineEntityType = (table, schema) => {
  if (!table || !schema) return 'strong';
  
  const tableName = table.name;
  const relationships = Array.isArray(schema.relationships) ? schema.relationships : [];
  
  // Check if it's a weak entity (depends on another entity for identification)
  const isWeakEntity = hasIdentifyingRelationship(tableName, relationships);
  
  if (isWeakEntity) return 'weak';
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
    
    // Create edge from entity to attribute with a stable unique ID
    // Include entity name in the ID to ensure uniqueness across different entities with same-named attributes
    const edgeId = `edge-${entityId}-to-attr-${column.name || index}-${index}`;
    edges.push({
      id: edgeId,
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
  if (!Array.isArray(schema.relationships)) {
    console.warn('No relationships array in schema:', schema);
    return;
  }
  
  console.log('Creating relationship nodes from', schema.relationships.length, 'relationships');
  
  // Generate a debug mapping of all entity names for easier troubleshooting
  const entityMap = {};
  const entityNodeIds = nodes.filter(n => n.type === 'entityNode').map(n => n.id);
  
  // Create a map of entity IDs and their variations for easier lookup
  entityNodeIds.forEach(nodeId => {
    const entityName = nodeId.replace('entity-', '');
    entityMap[entityName] = nodeId;
    entityMap[entityName.toLowerCase()] = nodeId;
    // Also add without special characters
    const cleanName = entityName.replace(/[^a-zA-Z0-9]/g, '');
    if (cleanName !== entityName) {
      entityMap[cleanName] = nodeId;
      entityMap[cleanName.toLowerCase()] = nodeId;
    }
  });
  
  console.log('Entity name mapping for debugging:', entityMap);
  
  schema.relationships.forEach((rel, index) => {
    if (!rel || typeof rel !== 'object') {
      console.warn('Invalid relationship object at index', index);
      return;
    }
    
    console.log('Processing relationship:', rel);
    
    // Check if we have sourceEntity/targetEntity or sourceTable/targetTable
    const sourceEntityName = rel.sourceEntity || rel.sourceTable;
    const targetEntityName = rel.targetEntity || rel.targetTable;
    
    if (!sourceEntityName || !targetEntityName) {
      console.warn('Relationship missing source or target entity/table:', rel);
      return;
    }
    
    // Create a unique relationship ID that includes source and target entities
    // This ensures two relationships with the same name but different entities get unique IDs
    const relationshipId = `relationship-${rel.name || `rel${index}`}-${sourceEntityName}-to-${targetEntityName}`;
    
    // For backwards compatibility, also check the old style ID format in saved positions
    const legacyRelationshipId = `relationship-${rel.name || `rel${index}`}`;
    
    console.log(`Looking for source entity: ${sourceEntityName}, target entity: ${targetEntityName}`);
    
    // Try to find source entity using the mapping
    const mappedSourceEntityId = entityMap[sourceEntityName] || entityMap[sourceEntityName.toLowerCase()];
    const mappedTargetEntityId = entityMap[targetEntityName] || entityMap[targetEntityName.toLowerCase()];
    
    // If we found entity IDs using the map, use them directly
    let sourceEntity = mappedSourceEntityId ? nodes.find(n => n.id === mappedSourceEntityId) : null;
    let targetEntity = mappedTargetEntityId ? nodes.find(n => n.id === mappedTargetEntityId) : null;
    
    // Fallback to the previous search method if mapping didn't work
    if (!sourceEntity) {
      // Try different variations of the entity name
      const sourceVariations = [
        sourceEntityName,
        sourceEntityName.toLowerCase(),
        sourceEntityName.toUpperCase(),
        sourceEntityName.charAt(0).toUpperCase() + sourceEntityName.slice(1).toLowerCase(), // Title case
        // Try removing underscores or replacing with spaces
        sourceEntityName.replace(/_/g, ''),
        sourceEntityName.replace(/_/g, ' '),
        // Try singular/plural variations
        sourceEntityName.endsWith('s') ? sourceEntityName.slice(0, -1) : sourceEntityName + 's'
      ];
      
      // Try each variation
      for (const variation of sourceVariations) {
        sourceEntity = nodes.find(n => {
          return n.id === `entity-${variation}` || 
                 n.id.toLowerCase() === `entity-${variation}`.toLowerCase();
        });
        
        if (sourceEntity) {
          console.log(`Found source entity using variation: ${variation}`);
          break;
        }
      }
      
      // If still not found, try the original method
      if (!sourceEntity) {
        sourceEntity = nodes.find(n => {
          if (n.id === `entity-${sourceEntityName}`) return true;
          return n.id.toLowerCase() === `entity-${sourceEntityName}`.toLowerCase();
        });
      }
      
      // Last resort: search in the entity data
      if (!sourceEntity) {
        sourceEntity = nodes.find(n => {
          if (!n.data) return false;
          
          // Look for the entity name in the node data
          const nodeLabel = (n.data.label || '').toLowerCase();
          const nodeName = (n.data.name || '').toLowerCase();
          const nodeTableName = (n.data.tableName || '').toLowerCase();
          
          return (
            nodeLabel === sourceEntityName.toLowerCase() ||
            nodeName === sourceEntityName.toLowerCase() ||
            nodeTableName === sourceEntityName.toLowerCase()
          );
        });
        
        if (sourceEntity) {
          console.log(`Found source entity by searching node data: ${sourceEntity.id}`);
        }
      }
    }
    
    if (!targetEntity) {
      // Try different variations of the entity name
      const targetVariations = [
        targetEntityName,
        targetEntityName.toLowerCase(),
        targetEntityName.toUpperCase(),
        targetEntityName.charAt(0).toUpperCase() + targetEntityName.slice(1).toLowerCase(), // Title case
        // Try removing underscores or replacing with spaces
        targetEntityName.replace(/_/g, ''),
        targetEntityName.replace(/_/g, ' '),
        // Try singular/plural variations
        targetEntityName.endsWith('s') ? targetEntityName.slice(0, -1) : targetEntityName + 's'
      ];
      
      // Try each variation
      for (const variation of targetVariations) {
        targetEntity = nodes.find(n => {
          return n.id === `entity-${variation}` || 
                 n.id.toLowerCase() === `entity-${variation}`.toLowerCase();
        });
        
        if (targetEntity) {
          console.log(`Found target entity using variation: ${variation}`);
          break;
        }
      }
      
      // If still not found, try the original method
      if (!targetEntity) {
        targetEntity = nodes.find(n => {
          if (n.id === `entity-${targetEntityName}`) return true;
          return n.id.toLowerCase() === `entity-${targetEntityName}`.toLowerCase();
        });
      }
      
      // Last resort: search in the entity data
      if (!targetEntity) {
        targetEntity = nodes.find(n => {
          if (!n.data) return false;
          
          // Look for the entity name in the node data
          const nodeLabel = (n.data.label || '').toLowerCase();
          const nodeName = (n.data.name || '').toLowerCase();
          const nodeTableName = (n.data.tableName || '').toLowerCase();
          
          return (
            nodeLabel === targetEntityName.toLowerCase() ||
            nodeName === targetEntityName.toLowerCase() ||
            nodeTableName === targetEntityName.toLowerCase()
          );
        });
        
        if (targetEntity) {
          console.log(`Found target entity by searching node data: ${targetEntity.id}`);
        }
      }
    }
    
    console.log('Source entity lookup:', {
      relationshipSource: sourceEntityName,
      lookingFor: `entity-${sourceEntityName}`,
      foundSource: sourceEntity ? sourceEntity.id : 'NOT FOUND',
      availableEntities: nodes.filter(n => n.type === 'entityNode').map(n => n.id)
    });
    
    console.log('Target entity lookup:', {
      relationshipTarget: targetEntityName,
      lookingFor: `entity-${targetEntityName}`,
      foundTarget: targetEntity ? targetEntity.id : 'NOT FOUND',
      availableEntities: nodes.filter(n => n.type === 'entityNode').map(n => n.id)
    });
    
    if (!sourceEntity || !targetEntity) {
      // Detailed debugging for entity not found cases
      console.warn('Entity not found with detailed info:', {
        sourceRequested: sourceEntityName,
        targetRequested: targetEntityName,
        sourceFound: sourceEntity ? sourceEntity.id : null,
        targetFound: targetEntity ? targetEntity.id : null,
        mappedSourceId: mappedSourceEntityId,
        mappedTargetId: mappedTargetEntityId,
        sourceVariationsTried: [
          sourceEntityName,
          sourceEntityName.toLowerCase(),
          sourceEntityName.toUpperCase(),
          sourceEntityName.charAt(0).toUpperCase() + sourceEntityName.slice(1).toLowerCase(),
          sourceEntityName.replace(/_/g, ''),
          sourceEntityName.replace(/_/g, ' '),
          sourceEntityName.endsWith('s') ? sourceEntityName.slice(0, -1) : sourceEntityName + 's'
        ],
        targetVariationsTried: [
          targetEntityName,
          targetEntityName.toLowerCase(),
          targetEntityName.toUpperCase(),
          targetEntityName.charAt(0).toUpperCase() + targetEntityName.slice(1).toLowerCase(),
          targetEntityName.replace(/_/g, ''),
          targetEntityName.replace(/_/g, ' '),
          targetEntityName.endsWith('s') ? targetEntityName.slice(0, -1) : targetEntityName + 's'
        ],
        entityMapKeys: Object.keys(entityMap).slice(0, 20), // Show first 20 keys to avoid overwhelming logs
        entityMapSamples: Object.entries(entityMap).slice(0, 5) // Show just a few sample mappings
      });
      
      console.warn(`Entity not found: source=${sourceEntityName}, target=${targetEntityName}`);
      return;
    }
    
    const sourceEntityId = sourceEntity.id;
    const targetEntityId = targetEntity.id;
    
    // Get source and target positions
    const sourcePos = sourceEntity?.position;
    const targetPos = targetEntity?.position;
    
    if (!sourcePos || !targetPos) {
      console.warn(`Missing positions for entities: source=${sourceEntityId}, target=${targetEntityId}`);
      return;
    }
    
    // Calculate default position for the relationship (midpoint)
    const defaultPos = {
      x: (sourcePos.x + targetPos.x) / 2,
      y: (sourcePos.y + targetPos.y) / 2
    };
    
    // Validate default position to avoid NaN
    if (isNaN(defaultPos.x) || isNaN(defaultPos.y)) {
      console.warn(`Calculated NaN position for relationship ${relationshipId}, using fallback`);
      defaultPos.x = isNaN(defaultPos.x) ? sourcePos.x + 100 : defaultPos.x;
      defaultPos.y = isNaN(defaultPos.y) ? sourcePos.y + 100 : defaultPos.y;
    }
    
    // Check if we have a saved position for this relationship
    // First try with the new ID format, then fall back to the legacy format
    const savedPosition = schema?.nodePositions?.[relationshipId] || 
                          schema?.nodePositions?.[legacyRelationshipId] ||
                          (rel.position?.isDraggable ? rel.position : null);
                          
    // Validate saved position
    let finalPosition = defaultPos;
    if (savedPosition) {
      if (!isNaN(savedPosition.x) && !isNaN(savedPosition.y)) {
        finalPosition = savedPosition;
      } else {
        console.warn(`Invalid saved position for relationship ${relationshipId}, using default position`);
        finalPosition = {
          x: !isNaN(savedPosition.x) ? savedPosition.x : defaultPos.x,
          y: !isNaN(savedPosition.y) ? savedPosition.y : defaultPos.y
        };
      }
    }
    
  // Create relationship node
    const relationshipNode = {
      id: relationshipId,
      type: 'relationshipNode',
      position: finalPosition,
      data: {
        relationshipName: rel.name || 'Relates',
        // Don't pass attributes to the relationship node anymore as they will be separate nodes
        // Just keep count for badge display
        attributeCount: Array.isArray(rel.attributes) ? rel.attributes.length : 0,
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
    
    // Create relationship attribute nodes (if any)
    if (Array.isArray(rel.attributes) && rel.attributes.length > 0) {
      createRelationshipAttributeNodes(rel, relationshipId, nodes, edges, schema);
    }
    
    // Create edges from source entity to relationship with a stable unique ID
    const sourceEdgeId = `edge-${sourceEntityId}-to-${relationshipId}`;
    edges.push({
      id: sourceEdgeId,
      source: sourceEntityId,
      target: relationshipId,
      type: 'erdEdge',
      data: {
        sourceCardinality: rel.sourceCardinality || getCardinalityNotation(rel.type, 'source'),
        targetCardinality: '',
        sourceParticipation: rel.sourceParticipation || 'partial', // Get from schema or default to partial
        targetParticipation: 'partial',
        label: '', // Remove relationship name from the edge
        relationshipType: rel.type || '',
        isIdentifying: rel.isIdentifying || rel.identifying || false,
        // Add support for exact cardinality ranges
        cardinalityRange: rel.cardinality?.split('-')[0] || null
      }
    });
    
    // Create edge from relationship to target entity with a stable unique ID
    const targetEdgeId = `edge-${relationshipId}-to-${targetEntityId}`;
    edges.push({
      id: targetEdgeId,
      source: relationshipId,
      target: targetEntityId,
      type: 'erdEdge',
      data: {
        sourceCardinality: '',
        targetCardinality: rel.targetCardinality || getCardinalityNotation(rel.type, 'target'),
        sourceParticipation: 'partial',
        relationshipType: rel.type || '',
        isIdentifying: rel.isIdentifying || rel.identifying || false,
        targetParticipation: rel.targetParticipation || 'partial', // Get from schema or default to partial
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
    
    // Create a direct edge between entities with cardinality notations and a stable unique ID
    const logicalEdgeId = `edge-${sourceEntityId}-to-${targetEntityId}-${index}`;
    edges.push({
      id: logicalEdgeId,
      source: sourceEntityId,
      target: targetEntityId,
      sourceHandle: sourceHandle,
      targetHandle: targetHandle,
      type: 'erdEdge',
      data: {
        sourceCardinality: getCardinalityNotation(rel.type, 'source'),
        targetCardinality: getCardinalityNotation(rel.type, 'target'),
        sourceParticipation: rel.sourceParticipation || 'partial', // Get from schema or default to partial
        targetParticipation: rel.targetParticipation || 'partial', // Get from schema or default to partial
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
 * Create attribute nodes for relationships in conceptual mode, similar to entity attributes
 * @param {Object} relationship - Relationship object
 * @param {string} relationshipId - ID of the relationship node
 * @param {Array} nodes - Nodes array to append to
 * @param {Array} edges - Edges array to append to
 * @param {Object} schema - Complete schema with saved positions
 */
const createRelationshipAttributeNodes = (relationship, relationshipId, nodes, edges, schema = {}) => {
  if (!Array.isArray(relationship.attributes) || relationship.attributes.length === 0) return;
  
  const relationshipNode = nodes.find(n => n.id === relationshipId);
  if (!relationshipNode) {
    console.warn(`Relationship node ${relationshipId} not found`);
    return;
  }
  
  // Extract source and target entities from the relationship ID
  // Format: relationship-RelName-SourceEntity-to-TargetEntity
  const relationshipParts = relationshipId.split('-');
  let sourceEntity = '';
  let targetEntity = '';
  
  if (relationshipParts.length >= 5) {
    // Find the index of 'to' in the parts array
    const toIndex = relationshipParts.indexOf('to');
    if (toIndex > 2 && toIndex < relationshipParts.length - 1) {
      // Extract source entity (everything between the relationship name and 'to')
      sourceEntity = relationshipParts.slice(2, toIndex).join('-');
      // Extract target entity (everything after 'to')
      targetEntity = relationshipParts.slice(toIndex + 1).join('-');
    }
  }
  
  const relationshipPosition = relationshipNode.position || { x: 0, y: 0 };
  
  // Validate position to avoid NaN
  if (isNaN(relationshipPosition.x) || isNaN(relationshipPosition.y)) {
    console.warn(`Invalid position for relationship ${relationshipId}:`, relationshipPosition);
    relationshipPosition.x = relationshipPosition.x || 0;
    relationshipPosition.y = relationshipPosition.y || 0;
  }
  
  // Calculate positions around the relationship in a circular pattern
  relationship.attributes.forEach((attr, index) => {
    if (!attr || typeof attr !== 'object' || !attr.name) return;
    
    // Create a more unique attribute ID that includes source and target information
    const attributeId = sourceEntity && targetEntity 
      ? `attr-${relationshipId}-${sourceEntity}-${targetEntity}-${attr.name}`
      : `attr-${relationshipId}-${attr.name}`;
    
    // Calculate the number of attributes to improve spacing
    const totalAttrs = relationship.attributes.length;
    
    // Distribute attributes more evenly based on the number of attributes
    let radius, angle;
    
    // For relationship attributes, use a smaller radius
    radius = 150;
    
    // Distribute attributes in a circle around the relationship
    const angleStep = (2 * Math.PI) / Math.max(totalAttrs, 4);
    angle = index * angleStep + Math.PI/4; // Offset to start at 45 degrees
    
    // Ensure the angle is a valid number
    if (isNaN(angle)) {
      console.warn(`Calculated NaN angle for attribute ${attributeId}, using fallback`);
      angle = (index * Math.PI/4) % (2 * Math.PI);
    }
    
    // Position attribute in a circle around the relationship
    let attrX = relationshipPosition.x + radius * Math.cos(angle);
    let attrY = relationshipPosition.y + radius * Math.sin(angle);
    
    // Safety check for NaN values
    if (isNaN(attrX) || isNaN(attrY)) {
      console.warn(`Calculated NaN position for attribute ${attributeId}, using fallback`);
      attrX = relationshipPosition.x + 100 + (index * 50);
      attrY = relationshipPosition.y + 100;
    }
    
    // Create attribute node
    // Check if we have a saved position for this attribute
    const savedPosition = schema?.nodePositions?.[attributeId];
    
    // Validate saved position to avoid NaN
    let position = { x: attrX, y: attrY };
    if (savedPosition) {
      // Make sure the saved position values are valid numbers
      if (!isNaN(savedPosition.x) && !isNaN(savedPosition.y)) {
        position = savedPosition;
      } else {
        console.warn(`Invalid saved position for ${attributeId}, using calculated position instead`);
        // Use specific properties if they're valid, fallback to calculated values otherwise
        position = {
          x: !isNaN(savedPosition.x) ? savedPosition.x : attrX,
          y: !isNaN(savedPosition.y) ? savedPosition.y : attrY
        };
      }
    }
    
    const attributeNode = {
      id: attributeId,
      type: 'relationshipAttributeNode',
      // Use validated position
      position: position,
      data: {
        attributeName: attr.name || 'Unnamed',
        dataType: attr.dataType || '',
        isPrimaryKey: attr.isPrimaryKey || false,
        isDerived: attr.isDerived || false,
        isMultivalued: attr.isMultivalued || attr.isMultiValued || false,
        isComposite: attr.isComposite || false,
      },
      draggable: true,
    };
    
    nodes.push(attributeNode);
    
    // Create edge from relationship to attribute with a stable unique ID
    // Extract relationship name from the relationship ID (excluding the entities)
    // The relationshipId now includes source and target entities
    const nameParts = relationshipId.split('-');
    // The relationship name is the part after 'relationship-'
    const relationshipName = nameParts.length > 1 ? nameParts[1] : '';
    
    // Create a unique edge ID that incorporates the entire relationship context
    // This ensures uniqueness even when two relationships have the same name
    const uniqueEdgeId = `edge-${relationshipId}-to-attr-${attr.name}-${index}`;
    
    edges.push({
      id: uniqueEdgeId,
      source: relationshipId,
      target: attributeId,
      style: { stroke: '#8b5cf6', strokeWidth: 1 }, // Purple stroke for relationship attributes
      type: 'default',
      animated: false,
    });
  });
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