'use client';

import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import styles from '@/styles/ERDDiagram.module.css';

const RelationshipNode = memo(({ data, selected }) => {
  const { 
    relationshipName,
    attributes = [],
    isIdentifying = false,
    description = "",
    type = "" // "ONE_TO_ONE", "ONE_TO_MANY", "MANY_TO_MANY", etc.
  } = data;
  
  // Determine relationship style class based on type
  const getRelationshipStyleClass = () => {
    if (isIdentifying) return styles.identifyingRelationship;
    
    switch(type) {
      case "MANY_TO_MANY":
        return styles.manyToManyRelationship;
      case "ONE_TO_MANY":
      case "MANY_TO_ONE":
        return styles.oneToManyRelationship;
      default:
        return "";
    }
  };

  return (
    <div 
      className={`${styles.relationshipNode} ${selected ? styles.selected : ''}`} 
      data-draggable="true" // Ensure node is recognized as draggable
    >
      {/* Relationship represented as a diamond */}
      <div className={`${styles.relationshipDiamond} ${getRelationshipStyleClass()}`}>
        <div className={styles.relationshipName}>{relationshipName}</div>
        
        {/* Description */}
        {description && (
          <div className={styles.relationshipDescription}>
            {description}
          </div>
        )}
      </div>
      
      {/* Attributes of the relationship (if any) */}
      {attributes.length > 0 && (
        <div className={styles.relationshipAttributesContainer}>
          {attributes.map((attr, index) => (
            <div 
              key={`rel-attr-${index}`} 
              className={`
                ${styles.relationshipAttribute}
                ${attr.isDerived ? styles.derivedAttribute : ''}
                ${attr.isMultivalued ? styles.multivaluedAttribute : ''}
              `}
            >
              <span className={styles.attributeName}>{attr.name}</span>
              {attr.dataType && (
                <span className={styles.attributeType}>
                  ({attr.dataType})
                </span>
              )}
            </div>
          ))}
        </div>
      )}
      
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
