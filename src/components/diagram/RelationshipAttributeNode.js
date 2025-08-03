'use client';

import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import styles from '@/styles/ERDDiagram.module.css';

const RelationshipAttributeNode = memo(({ data, selected }) => {
  const { 
    attributeName = 'Unnamed',
    dataType = '',
    isPrimaryKey = false,
    isDerived = false,
    isMultivalued = false,
    isComposite = false,
  } = data;

  return (
    <div 
      className={`
        ${styles.attributeNode} 
        ${styles.relationshipAttributeNode}
        ${selected ? styles.selected : ''}
        ${isPrimaryKey ? styles.primaryKeyAttribute : ''}
        ${isDerived ? styles.derivedAttribute : ''}
        ${isMultivalued ? styles.multivaluedAttribute : ''}
        ${isComposite ? styles.compositeAttribute : ''}
      `}
      draggable="true"
      style={{ cursor: 'move' }}
    >
      <div className={styles.attributeContent}>
        {/* Attribute name with indicators for special types */}
        <div className={styles.attributeName}>
          {isPrimaryKey && '🔑 '}
          {isDerived && '* '}
          {attributeName}
          {isMultivalued && ' [*]'}
        </div>
        {/* Show data type if available */}
        {dataType && (
          <div className={styles.attributeType}>
            ({dataType})
          </div>
        )}
      </div>

      {/* Connection handles */}
      <Handle
        type="target"
        position={Position.Top}
        className={styles.handleTop}
        isConnectable={true}
      />
      <Handle
        type="source"
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
      <Handle
        type="source"
        position={Position.Right}
        className={styles.handleRight}
        isConnectable={true}
      />
    </div>
  );
});

RelationshipAttributeNode.displayName = 'RelationshipAttributeNode';

export default RelationshipAttributeNode;
