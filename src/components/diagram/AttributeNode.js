'use client';

import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import styles from '@/styles/ERDDiagram.module.css';

const AttributeNode = memo(({ data, selected }) => {
  const { 
    attributeName,
    dataType,
    isPrimaryKey = false,
    isDerived = false,
    isMultivalued = false,
    isComposite = false,
    subAttributes = [],
  } = data;

  const getAttributeClass = () => {
    let classes = [styles.attributeNode];
    
    if (isPrimaryKey) classes.push(styles.keyAttribute);
    if (isDerived) classes.push(styles.derivedAttribute);
    if (isMultivalued) classes.push(styles.multivaluedAttribute);
    if (isComposite) classes.push(styles.compositeAttribute);
    if (selected) classes.push(styles.selected);
    
    return classes.join(' ');
  };

  return (
    <div className={getAttributeClass()} draggable="true" style={{ cursor: 'move' }}>
      <div className={styles.attributeContent}>
        <div className={styles.attributeNameContainer}>
          <span className={styles.attributeName}>
            {isPrimaryKey && '🔑 '}
            {attributeName}
            {isMultivalued && ' [*]'}
          </span>
          
          {dataType && (
            <span className={styles.attributeType}>
              ({dataType})
            </span>
          )}
        </div>
        
        {/* For composite attributes, show sub-attributes */}
        {isComposite && subAttributes.length > 0 && (
          <div className={styles.subAttributesContainer}>
            {subAttributes.map((subAttr, index) => (
              <div key={`sub-attr-${index}`} className={styles.subAttribute}>
                <span className={styles.subAttributeName}>
                  {subAttr.name}
                </span>
                {subAttr.dataType && (
                  <span className={styles.subAttributeType}>
                    ({subAttr.dataType})
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Connection handle */}
      <Handle
        type="target"
        position={Position.Top}
        className={styles.attributeHandle}
        isConnectable={true}
      />
    </div>
  );
});

AttributeNode.displayName = 'AttributeNode';

export default AttributeNode;
