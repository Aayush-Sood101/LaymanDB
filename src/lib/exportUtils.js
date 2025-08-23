/**
 * Utility functions for exporting diagrams and other content
 */

/**
 * Process SVG for export
 * This function ensures SVG is properly formatted and optimized for export
 * 
 * @param {string} svgData - The SVG data string
 * @returns {string} - Processed SVG data
 */
export const processSvgForExport = (svgData) => {
  if (!svgData) return null;
  
  try {
    // For safety, always return the data as a proper data URL
    if (!svgData.startsWith('data:')) {
      return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgData)}`;
    }
    
    // If it's already a data URL, return as is
    return svgData;
  } catch (error) {
    console.error('Error processing SVG for export:', error);
    // Return a valid data URL even on error
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><text x="400" y="300" text-anchor="middle">Error processing diagram</text></svg>')}`;
  }
};

/**
 * Optimize PNG data for export
 * 
 * @param {string} pngData - The PNG data URL
 * @returns {string} - Processed PNG data URL
 */
export const processPngForExport = (pngData) => {
  if (!pngData) return null;
  
  try {
    // Ensure it's a valid data URL
    if (!pngData.startsWith('data:')) {
      // If it's not a data URL, assume it's base64 data and add the prefix
      return `data:image/png;base64,${pngData}`;
    }
    
    // If it's already a data URL, return as is
    return pngData;
  } catch (error) {
    console.error('Error processing PNG for export:', error);
    // Return a blank PNG data URL in case of error
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
  }
};
