/**
 * Safely get object keys without throwing errors on null/undefined
 * @param {Object|null|undefined} obj - The object to get keys from
 * @returns {Array} - Array of keys or empty array if object is null/undefined
 */
export const safeObjectKeys = (obj) => {
  if (obj === null || obj === undefined) {
    console.warn('Attempted to call Object.keys on null or undefined');
    return [];
  }
  
  try {
    return Object.keys(obj);
  } catch (error) {
    console.error('Error in safeObjectKeys:', error);
    return [];
  }
};

/**
 * Check if a value is a valid object (not null, not undefined, not array)
 * @param {any} value - The value to check
 * @returns {boolean} - True if the value is a valid object
 */
export const isValidObject = (value) => {
  return value !== null && 
         typeof value === 'object' &&
         !Array.isArray(value);
};

/**
 * Safe deep object access without throwing errors
 * @param {Object} obj - The object to access
 * @param {string|Array} path - Path to the property (dot notation string or array)
 * @param {any} defaultValue - Default value if path doesn't exist
 * @returns {any} - Value at path or defaultValue if path doesn't exist
 */
export const safeObjectAccess = (obj, path, defaultValue = undefined) => {
  if (obj === null || obj === undefined) {
    return defaultValue;
  }
  
  const keys = Array.isArray(path) ? path : path.split('.');
  let result = obj;
  
  for (let i = 0; i < keys.length; i++) {
    if (result === null || result === undefined || typeof result !== 'object') {
      return defaultValue;
    }
    result = result[keys[i]];
  }
  
  return result === undefined ? defaultValue : result;
};
