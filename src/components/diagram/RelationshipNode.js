'use client';

import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import styles from '@/styles/ERDDiagram.module.css';

const RelationshipNode = memo(({ data, selected }) => {
  const { 
    relationshipName,
    attributeCount = 0,
    isIdentifying = false,
    description = "",
    type = "", // "ONE_TO_ONE", "ONE_TO_MANY", "MANY_TO_MANY", etc.
    assumptionsMade = [], // New field for assumptions made for ambiguous inputs
    cardinality = null // For precise cardinality ranges
  } = data;
  
  // Determine relationship style class based on type
  const getRelationshipStyleClass = () => {
    if (isIdentifying) return styles.identifyingRelationship;
    
    // Check for relationship type in various formats from OpenAI responses
    const normalizedType = type.toUpperCase();
    
    if (normalizedType.includes("MANY_TO_MANY") || 
        normalizedType === "MANY:MANY" || 
        normalizedType === "M:N" || 
        normalizedType === "N:M") {
      return styles.manyToManyRelationship;
    }
    
    if (normalizedType.includes("ONE_TO_MANY") || 
        normalizedType.includes("MANY_TO_ONE") || 
        normalizedType === "ONE:MANY" || 
        normalizedType === "MANY:ONE" || 
        normalizedType === "1:N" || 
        normalizedType === "N:1") {
      return styles.oneToManyRelationship;
    }
    
    if (normalizedType.includes("ONE_TO_ONE") || 
        normalizedType === "ONE:ONE" || 
        normalizedType === "1:1") {
      return styles.oneToOneRelationship;
    }
    
    return "";
  };

  // Format relationship type for display
  const formatRelationshipType = (type) => {
    switch(type) {
      case "MANY_TO_MANY":
        return "M:N";
      case "ONE_TO_MANY":
        return "1:N";
      case "MANY_TO_ONE":
        return "N:1";
      case "ONE_TO_ONE":
        return "1:1";
      default:
        return type;
    }
  };

  return (
    <div 
      className={`${styles.relationshipNode} ${selected ? styles.selected : ''}`} 
      draggable="true"
      style={{ cursor: 'move' }}
    >
      {/* Relationship represented as a diamond */}
      <div className={`${styles.relationshipDiamond} ${getRelationshipStyleClass()}`}>
        {/* Display relationship name (verb phrase) prominently */}
        <div className={styles.relationshipName}>{relationshipName}</div>
        
        {/* Relationship cardinality as smaller text */}
        <div className={styles.relationshipType}>
          {cardinality ? cardinality : formatRelationshipType(type)}
          {isIdentifying && <span className={styles.identifyingLabel}> (ID)</span>}
        </div>
        
        {/* Show attribute count badge if there are attributes */}
        {attributeCount > 0 && (
          <div className={styles.attributeCountBadge} title={`${attributeCount} attribute(s)`}>
            {attributeCount}
          </div>
        )}
        
        {/* Display assumptions only in edit mode */}
        {assumptionsMade && assumptionsMade.length > 0 && (
          <div className={styles.relationshipAssumptions}>
            <small className={styles.assumptionsHeading}>Assumptions:</small>
            <ul className={styles.assumptionsList}>
              {assumptionsMade.map((assumption, idx) => (
                <li key={`assumption-${idx}`} className={styles.assumptionItem}>{assumption}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      {/* Connection handles on all sides */}
      <Handle
        type="target"
        position={Position.Top}
        className={styles.handleTop}
        isConnectable={true}
      />
      <Handle
        type="target"
        position={Position.Right}
        className={styles.handleRight}
        isConnectable={true}
      />
      <Handle
        type="target"
        position={Position.Bottom}
        className={styles.handleBottom}
        isConnectable={true}
      />
      <Handle
        type="target"
        position={Position.Left}
        className={styles.handleLeft}
        isConnectable={true}
      />
      
      {/* Additional source handles for connections */}
      <Handle
        type="source"
        position={Position.Top}
        className={`${styles.handleTop} ${styles.sourceHandle}`}
        id="source-top"
        isConnectable={true}
      />
      <Handle
        type="source"
        position={Position.Right}
        className={`${styles.handleRight} ${styles.sourceHandle}`}
        id="source-right"
        isConnectable={true}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className={`${styles.handleBottom} ${styles.sourceHandle}`}
        id="source-bottom"
        isConnectable={true}
      />
      <Handle
        type="source"
        position={Position.Left}
        className={`${styles.handleLeft} ${styles.sourceHandle}`}
        id="source-left"
        isConnectable={true}
      />
    </div>
  );
});

RelationshipNode.displayName = 'RelationshipNode';

export default RelationshipNode;
