'use client';

import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import styles from '@/styles/ERDDiagram.module.css';

const TableNode = memo(({ data, selected }) => {
  const { tableName, columns = [], entityType = 'regular', description } = data;

  // Get the appropriate style classes based on the entity type
  const getBorderClass = () => {
    switch (entityType) {
      case 'weak':
        return styles.weakEntityBorder;
      case 'associative':
        return styles.associativeEntityBorder;
      default:
        return styles.regularEntityBorder;
    }
  };

  const getHeaderClass = () => {
    switch (entityType) {
      case 'weak':
        return styles.weakEntityHeader;
      case 'associative':
        return styles.associativeEntityHeader;
      default:
        return styles.regularEntityHeader;
    }
  };

  return (
    <div className={`${styles.tableNode} ${getBorderClass()} ${selected ? styles.selected : ''}`}>
      {/* Source handle - top */}
      <Handle
        type="source"
        position={Position.Top}
        className={styles.handleTop}
        isConnectable={true}
      />
      
      {/* Table header */}
      <div className={`${styles.tableNodeHeader} ${getHeaderClass()}`}>
        <span className={styles.tableName}>{tableName}</span>
        <span className={styles.entityBadge}>
          {entityType === 'weak' && 'W'}
          {entityType === 'associative' && 'A'}
        </span>
      </div>
      
      {/* Table description if available */}
      {description && (
        <div className={styles.tableDescription}>
          <p>{description}</p>
        </div>
      )}
      
      {/* Column list */}
      <div className={styles.columnsContainer}>
        {columns.length > 0 ? (
          <table className={styles.columnsTable}>
            <tbody>
              {columns.map((column, index) => (
                <tr 
                  key={`${tableName}-col-${index}`}
                  className={`${styles.columnRow} ${column.isPrimaryKey ? styles.primaryKey : ''}`}
                >
                  <td className={styles.columnIconCell}>
                    {column.isPrimaryKey && (
                      <span className={styles.primaryKeyIcon} title="Primary Key">
                        🔑
                      </span>
                    )}
                    {column.isForeignKey && (
                      <span className={styles.foreignKeyIcon} title="Foreign Key">
                        🔗
                      </span>
                    )}
                  </td>
                  <td className={styles.columnNameCell}>
                    {column.name}
                  </td>
                  <td className={styles.columnTypeCell}>
                    <span className={styles.columnType}>{column.type}</span>
                    {column.isNullable === false && (
                      <span className={styles.requiredBadge} title="Required">*</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className={styles.noColumns}>No columns defined</div>
        )}
      </div>
      
      {/* Target handle - bottom */}
      <Handle
        type="target"
        position={Position.Bottom}
        className={styles.handleBottom}
        isConnectable={true}
      />
      
      {/* Additional side handles for more connection options */}
      <Handle
        type="source"
        position={Position.Right}
        className={styles.handleRight}
        isConnectable={true}
      />
      
      <Handle
        type="target"
        position={Position.Left}
        className={styles.handleLeft}
        isConnectable={true}
      />
    </div>
  );
});

TableNode.displayName = 'TableNode';

export default TableNode;
