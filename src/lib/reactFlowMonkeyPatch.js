"use client";

/**
 * This file contains a direct monkey patch for React Flow's
 * getMarkerId function which is causing the "Cannot convert undefined or null to object"
 * error when it attempts to call Object.keys on null or undefined values.
 */

// Check if we're in a browser environment
if (typeof window !== 'undefined') {
  // Store original console.error to avoid infinite loops
  const originalConsoleError = console.error;
  
  // Create a safer version of Object.keys that won't throw on null/undefined
  const safeObjectKeys = (obj) => {
    if (obj === null || obj === undefined) {
      return [];
    }
    return Object.keys(obj);
  };
  
  // Wait until React Flow is loaded and patch it
  window.addEventListener('load', () => {
    setTimeout(() => {
      try {
        // Patch Object.keys when called from getMarkerId
        // This is a risky hack but might work as a last resort
        const originalObjectKeys = Object.keys;
        
        Object.keys = function patchedObjectKeys(obj) {
          // Get the call stack
          const stack = new Error().stack || '';
          
          // If this is being called from getMarkerId (based on the stack trace)
          if (stack.includes('getMarkerId')) {
            return safeObjectKeys(obj);
          }
          
          // Otherwise use the original implementation
          return originalObjectKeys(obj);
        };
        
        console.log('Patched Object.keys for React Flow');
      } catch (error) {
        originalConsoleError('Error patching Object.keys:', error);
      }
    }, 500); // Give React Flow time to load
  });
}

// Export a dummy function so this file can be imported
export const initReactFlowPatch = () => {
  console.log('React Flow patch initialized');
  return true;
};
