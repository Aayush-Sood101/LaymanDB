"use client";

/**
 * This file contains patches and safety functions for React Flow's edge rendering
 * to prevent "Cannot convert undefined or null to object" errors with Object.keys
 * 
 * Adapted for react-flow-renderer version 10.x
 */

/**
 * Safely get marker ID without causing errors even if inputs are undefined or null
 * This is a replacement for the problematic getMarkerId function in React Flow
 * @param {Object|null|undefined} marker - The marker object that might be null/undefined
 * @returns {string} A valid marker ID or a default
 */
export const safeGetMarkerId = (marker) => {
  try {
    if (!marker) return 'default-marker';
    
    // Handle both string and object markers
    if (typeof marker === 'string') return marker;
    
    // If it has an explicit ID, use that
    if (marker.id) return marker.id;
    
    // Otherwise generate an ID based on properties
    const type = marker.type || 'default';
    const color = (marker.color || '').replace('#', '');
    
    return `marker-${type}-${color || 'default'}`;
  } catch (error) {
    console.error('Error in safeGetMarkerId:', error);
    return 'error-marker'; // Fallback marker ID
  }
};

/**
 * Creates a safe marker object for edge ends that won't cause Object.keys errors
 * Compatible with react-flow-renderer v10.x
 * 
 * @param {string} type - Marker type 
 * @param {string} color - Marker color
 * @returns {Object} A safe marker object
 */
export const createSafeMarker = (type = 'arrow', color = '#000000') => {
  return {
    id: `safe-marker-${type}-${color.replace('#', '')}`,
    type: type,
    color: color,
    width: 20,
    height: 20,
    // Ensure the marker has these properties to avoid Object.keys issues
    markerUnits: 'strokeWidth',
    orient: 'auto',
    refX: 0,
    refY: 0
  };
};

/**
 * Create a default safe markers object for React Flow v10.x
 * @returns {Object} Default markers object
 */
export const createDefaultMarkers = () => {
  return {
    'default-arrow': createSafeMarker('arrow', '#000000'),
    'default-arrowclosed': createSafeMarker('arrowclosed', '#000000')
  };
};
