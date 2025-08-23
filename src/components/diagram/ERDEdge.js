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
  // Safety check for NaN values in coordinates
  const safeX = (x) => isNaN(x) ? 0 : x;
  const safeY = (y) => isNaN(y) ? 0 : y;

  // Apply safety checks to all coordinates
  const safeSourceX = safeX(sourceX);
  const safeSourceY = safeY(sourceY);
  const safeTargetX = safeX(targetX);
  const safeTargetY = safeY(targetY);

  // Use safe values for the bezier path calculation
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX: safeSourceX,
    sourceY: safeSourceY,
    sourcePosition,
    targetX: safeTargetX,
    targetY: safeTargetY,
    targetPosition,
  });

  // Apply safety to label coordinates as well
  const safeLabelX = safeX(labelX);
  const safeLabelY = safeY(labelY);

  // Default values
  const {
    sourceCardinality = '1',
    targetCardinality = 'N',
    sourceParticipation = 'partial', // 'partial' or 'total'
    targetParticipation = 'partial', // 'partial' or 'total'
    label = '',
    relationshipType = '',  // "ONE_TO_ONE", "ONE_TO_MANY", "MANY_TO_MANY"
    isIdentifying = false,
    cardinalityRange = null // For precise cardinality ranges like "0..1", "1..*"
  } = data || {};
  
  // Determine edge class based on relationship type
  const getEdgeClass = () => {
    if (isIdentifying) return styles.identifyingEdge;
    
    switch(relationshipType) {
      case "MANY_TO_MANY":
        return styles.manyToManyEdge;
      case "ONE_TO_MANY":
      case "MANY_TO_ONE": 
        return styles.oneToManyEdge;
      case "ONE_TO_ONE":
        return styles.oneToOneEdge;
      default:
        return "";
    }
  };

  // Calculate positions for cardinality labels
  const distanceFromNode = 30; // Increased distance from node for cardinality label
  
  // Calculate angle of the edge near the source and target
  const sourceAngle = Math.atan2(safeTargetY - safeSourceY, safeTargetX - safeSourceX);
  const targetAngle = Math.atan2(safeSourceY - safeTargetY, safeSourceX - safeTargetX);
  
  // Handle NaN in angles (might happen if source and target positions are identical)
  const safeSourceAngle = isNaN(sourceAngle) ? 0 : sourceAngle;
  const safeTargetAngle = isNaN(targetAngle) ? 0 : targetAngle;
  
  // Calculate cardinality positions with safe angles
  const sourceCardinalityX = safeSourceX + Math.cos(safeSourceAngle) * distanceFromNode;
  const sourceCardinalityY = safeSourceY + Math.sin(safeSourceAngle) * distanceFromNode;
  const targetCardinalityX = safeTargetX + Math.cos(safeTargetAngle) * distanceFromNode;
  const targetCardinalityY = safeTargetY + Math.sin(safeTargetAngle) * distanceFromNode;
  
  // Define a better background for cardinality labels for visibility
  const cardinalityBgStyle = {
    fill: 'white',
    stroke: '#ddd',
    strokeWidth: 1,
    rx: 8,
    ry: 8,
  };
  
  // Enhanced handling of participation constraints for both source and target
  const getSourceParticipationClass = () => 
    sourceParticipation === 'total' ? styles.totalParticipation : styles.partialParticipation;
  
  const getTargetParticipationClass = () => 
    targetParticipation === 'total' ? styles.totalParticipation : styles.partialParticipation;
    
  // Enhanced style attributes for participation
  const getSourceParticipationStyle = () => ({
    strokeWidth: sourceParticipation === 'total' ? 3 : 1.8,
    strokeDasharray: sourceParticipation === 'total' ? 'none' : '4, 3',
  });
  
  const getTargetParticipationStyle = () => ({
    strokeWidth: targetParticipation === 'total' ? 3 : 1.8,
    strokeDasharray: targetParticipation === 'total' ? 'none' : '4, 3',
  });

  // Get the appropriate stroke color based on relationship type
  const getStrokeColor = () => {
    if (isIdentifying) return '#f59e0b';  // Amber for identifying relationships
    
    switch(relationshipType) {
      case "MANY_TO_MANY":
        return '#10b981';  // Emerald for many-to-many
      case "ONE_TO_MANY":
      case "MANY_TO_ONE": 
        return '#3b82f6';  // Blue for one-to-many
      case "ONE_TO_ONE":
        return '#8b5cf6';  // Violet for one-to-one
      default:
        return '#3b82f6';  // Default blue
    }
  };

  // Edge styles with explicit colors for better export
  const sourceEdgeStyle = {
    ...style,
    ...getSourceParticipationStyle(),
    stroke: getStrokeColor(),
    fill: 'none',
  };

  const targetEdgeStyle = {
    ...style,
    ...getTargetParticipationStyle(),
    stroke: getStrokeColor(),
    fill: 'none',
  };

  return (
    <>
      {/* Source side path - for participation display on source side */}
      <path
        id={`${id}-source`}
        style={sourceEdgeStyle}
        className={`${styles.erEdgePath} ${getEdgeClass()} ${getSourceParticipationClass()}`}
        d={edgePath}
        strokeDasharray={getSourceParticipationStyle().strokeDasharray === 'none' ? "0 50% 100%" : "0 50% 100%, " + getSourceParticipationStyle().strokeDasharray}
        markerEnd=""
        markerStart={sourceCardinality === 'N' || sourceCardinality === 'M' ? "url(#many)" : null}
      />
      
      {/* Target side path - for participation display on target side */}
      <path
        id={`${id}-target`}
        style={targetEdgeStyle}
        className={`${styles.erEdgePath} ${getEdgeClass()} ${getTargetParticipationClass()}`}
        d={edgePath}
        strokeDasharray={getTargetParticipationStyle().strokeDasharray === 'none' ? "50% 50%" : "50% 50%, " + getTargetParticipationStyle().strokeDasharray}
        markerEnd={markerEnd}
        markerStart=""
      />
      
      {/* Source Cardinality - with safe values */}
      <g
        transform={`translate(${safeX(sourceCardinalityX)}, ${safeY(sourceCardinalityY)})`}
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
          style={{ fontWeight: 'bold', fontSize: cardinalityRange ? '9px' : '12px' }}
        >
          {data.cardinalityRange || sourceCardinality}
        </text>
      </g>
      
      {/* Target Cardinality - with safe values */}
      <g
        transform={`translate(${safeX(targetCardinalityX)}, ${safeY(targetCardinalityY)})`}
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
          style={{ fontWeight: 'bold', fontSize: cardinalityRange ? '9px' : '12px' }}
        >
          {data.cardinalityRange || targetCardinality}
        </text>
      </g>
    </>
  );
};

export default ERDEdge;
