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
    parentEntity = null,
    isLookupTable = false, // New property for lookup/reference tables
    assumptionsMade = [] // For documenting assumptions made for this entity
  } = data;

  // Get the appropriate style classes based on the entity type
  const getEntityWrapperClass = () => {
    if (isLookupTable) {
      return styles.lookupTableWrapper;
    }
    
    switch (entityType) {
      case 'weak':
        return styles.weakEntityWrapper;
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
          {isLookupTable && (
            <span className={styles.lookupTableIndicator} title="Lookup/Reference Table">LT</span>
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
        
        {/* Display assumptions made if any */}
        {assumptionsMade && assumptionsMade.length > 0 && (
          <div className={styles.entityAssumptions}>
            <small className={styles.assumptionsHeading}>Assumptions:</small>
            <ul className={styles.assumptionsList}>
              {assumptionsMade.map((assumption, idx) => (
                <li key={`assumption-${idx}`} className={styles.assumptionItem}>{assumption}</li>
              ))}
            </ul>
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
              ${attr.isForeignKey ? styles.foreignKeyAttribute : ''}
              ${attr.isDerived ? styles.derivedAttribute : ''}
              ${attr.isMultivalued ? styles.multivaluedAttribute : ''}
              ${attr.isComposite ? styles.compositeAttribute : ''}
            `}
          >
            <span className={styles.attributeName}>
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
      {/* Source handles */}
      <Handle
        type="source"
        position={Position.Top}
        className={styles.handleTop}
        id="source-top"
        isConnectable={true}
      />
      <Handle
        type="source"
        position={Position.Right}
        className={styles.handleRight}
        id="source-right"
        isConnectable={true}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className={styles.handleBottom}
        id="source-bottom"
        isConnectable={true}
      />
      <Handle
        type="source"
        position={Position.Left}
        className={styles.handleLeft}
        id="source-left"
        isConnectable={true}
      />
      
      {/* Target handles */}
      <Handle
        type="target"
        position={Position.Top}
        className={`${styles.handleTop} ${styles.targetHandle}`}
        id="target-top"
        isConnectable={true}
      />
      <Handle
        type="target"
        position={Position.Right}
        className={`${styles.handleRight} ${styles.targetHandle}`}
        id="target-right"
        isConnectable={true}
      />
      <Handle
        type="target"
        position={Position.Bottom}
        className={`${styles.handleBottom} ${styles.targetHandle}`}
        id="target-bottom"
        isConnectable={true}
      />
      <Handle
        type="target"
        position={Position.Left}
        className={`${styles.handleLeft} ${styles.targetHandle}`}
        id="target-left"
        isConnectable={true}
      />
    </div>
  );
});

EntityNode.displayName = 'EntityNode';

export default EntityNode;
