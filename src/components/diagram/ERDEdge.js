'use client';

import React from 'react';
import { getBezierPath, EdgeText } from 'reactflow';
import styles from '@/styles/ERDDiagram.module.css';

const ERDEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
}) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  // Default values
  const {
    sourceCardinality = '1',
    targetCardinality = 'N',
    sourceParticipation = 'partial', // 'partial' or 'total'
    targetParticipation = 'partial', // 'partial' or 'total'
    label = '',
  } = data || {};

  // Calculate positions for cardinality labels
  const distanceFromNode = 30; // Increased distance from node for cardinality label
  
  // Calculate angle of the edge near the source and target
  const sourceAngle = Math.atan2(targetY - sourceY, targetX - sourceX);
  const targetAngle = Math.atan2(sourceY - targetY, sourceX - targetX);
  
  // Calculate cardinality positions
  const sourceCardinalityX = sourceX + Math.cos(sourceAngle) * distanceFromNode;
  const sourceCardinalityY = sourceY + Math.sin(sourceAngle) * distanceFromNode;
  const targetCardinalityX = targetX + Math.cos(targetAngle) * distanceFromNode;
  const targetCardinalityY = targetY + Math.sin(targetAngle) * distanceFromNode;
  
  // Define a better background for cardinality labels for visibility
  const cardinalityBgStyle = {
    fill: 'white',
    stroke: '#ddd',
    strokeWidth: 1,
    rx: 8,
    ry: 8,
  };
  
  return (
    <>
      <path
        id={id}
        style={style}
        className={`${styles.erEdgePath} ${sourceParticipation === 'total' ? styles.totalParticipation : styles.partialParticipation}`}
        d={edgePath}
        markerEnd={markerEnd}
        markerStart={sourceCardinality === 'N' || sourceCardinality === 'M' ? "url(#many)" : null}
      />
      
      {/* Source Cardinality */}
      <g
        transform={`translate(${sourceCardinalityX}, ${sourceCardinalityY})`}
        className={styles.cardinalityLabel}
      >
        <rect
          x="-10"
          y="-10"
          width="20"
          height="20"
          {...cardinalityBgStyle}
        />
        <text
          dominantBaseline="central"
          textAnchor="middle"
          className={styles.cardinalityText}
          style={{ fontWeight: 'bold' }}
        >
          {sourceCardinality}
        </text>
      </g>
      
      {/* Target Cardinality */}
      <g
        transform={`translate(${targetCardinalityX}, ${targetCardinalityY})`}
        className={styles.cardinalityLabel}
      >
        <rect
          x="-10"
          y="-10"
          width="20"
          height="20"
          {...cardinalityBgStyle}
        />
        <text
          dominantBaseline="central"
          textAnchor="middle"
          className={styles.cardinalityText}
          style={{ fontWeight: 'bold' }}
        >
          {targetCardinality}
        </text>
      </g>
      
      {/* Relationship label */}
      {label && (
        <EdgeText
          x={labelX}
          y={labelY}
          label={label}
          labelStyle={{ fill: '#333', fontSize: 12 }}
          labelBgStyle={{ fill: 'white', fillOpacity: 0.8 }}
          labelBgPadding={[2, 4]}
          labelBgBorderRadius={2}
        />
      )}
    </>
  );
};

export default ERDEdge;
