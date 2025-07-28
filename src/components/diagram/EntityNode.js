'use client';

import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import styles from '@/styles/ERDDiagram.module.css';

const EntityNode = memo(({ data, selected }) => {
  const { 
    entityName, 
    attributes = [], 
    entityType = 'strong', 
    description,
    isSpecialization = false,
    parentEntity = null
  } = data;

  // Get the appropriate style classes based on the entity type
  const getEntityWrapperClass = () => {
    switch (entityType) {
      case 'weak':
        return styles.weakEntityWrapper;
      case 'associative':
        return styles.associativeEntityWrapper;
      default:
        return styles.strongEntityWrapper;
    }
  };

  // Sort attributes with primary keys first, then by name
  const sortedAttributes = [...attributes].sort((a, b) => {
    if (a.isPrimaryKey && !b.isPrimaryKey) return -1;
    if (!a.isPrimaryKey && b.isPrimaryKey) return 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <div className={`${styles.entityNode} ${selected ? styles.selected : ''}`}>
      {/* Entity Container */}
      <div className={getEntityWrapperClass()}>
        {/* Entity Header - The rectangle represents the entity */}
        <div className={styles.entityHeader}>
          <span className={styles.entityName}>{entityName}</span>
          {entityType === 'weak' && (
            <span className={styles.weakEntityIndicator} title="Weak Entity">W</span>
          )}
        </div>

        {/* If this is a specialization entity, show the ISA relationship indicator */}
        {isSpecialization && parentEntity && (
          <div className={styles.isaRelationship}>
            <div className={styles.isaTriangle}>ISA</div>
            <div className={styles.isaLine}></div>
          </div>
        )}
        
        {/* Description */}
        {description && (
          <div className={styles.entityDescription}>
            {description}
          </div>
        )}
      </div>

      {/* Attributes - shown as ovals connected to the entity */}
      <div className={styles.attributesContainer}>
        {sortedAttributes.map((attr, index) => (
          <div 
            key={`${entityName}-attr-${index}`} 
            className={`
              ${styles.attribute}
              ${attr.isPrimaryKey ? styles.keyAttribute : ''}
              ${attr.isDerived ? styles.derivedAttribute : ''}
              ${attr.isMultivalued ? styles.multivaluedAttribute : ''}
              ${attr.isComposite ? styles.compositeAttribute : ''}
            `}
          >
            <span className={styles.attributeName}>
              {attr.isPrimaryKey && '🔑 '}
              {attr.name}
              {attr.isMultivalued && ' [*]'}
            </span>
            {attr.dataType && (
              <span className={styles.attributeType}>
                {attr.dataType}
              </span>
            )}
          </div>
        ))}
      </div>
      
      {/* Connection handles on all sides */}
      <Handle
        type="source"
        position={Position.Top}
        className={styles.handleTop}
        isConnectable={true}
      />
      <Handle
        type="source"
        position={Position.Right}
        className={styles.handleRight}
        isConnectable={true}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className={styles.handleBottom}
        isConnectable={true}
      />
      <Handle
        type="source"
        position={Position.Left}
        className={styles.handleLeft}
        isConnectable={true}
      />
    </div>
  );
});

EntityNode.displayName = 'EntityNode';

export default EntityNode;
