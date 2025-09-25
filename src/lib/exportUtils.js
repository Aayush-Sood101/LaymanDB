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
    
    // If it's already a data URL, check if we need to fix edge colors
    if (svgData.includes('react-flow__edge')) {
      // Create a temporary DOM element to parse the SVG
      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(
        decodeURIComponent(svgData.split(',')[1]), 
        'image/svg+xml'
      );
      
      // Find all edge paths that might be missing colors
      const edgePaths = svgDoc.querySelectorAll('.react-flow__edge path');
      edgePaths.forEach(path => {
        // If the path doesn't have a stroke, set it based on class
        if (!path.hasAttribute('stroke') || path.getAttribute('stroke') === 'none') {
          // Look for specific classes to determine color
          const classes = path.getAttribute('class') || '';
          
          if (classes.includes('identifyingEdge')) {
            path.setAttribute('stroke', '#f59e0b');
          } else if (classes.includes('oneToOneEdge')) {
            path.setAttribute('stroke', '#8b5cf6');
          } else if (classes.includes('manyToManyEdge')) {
            path.setAttribute('stroke', '#10b981');
          } else if (classes.includes('oneToManyEdge')) {
            path.setAttribute('stroke', '#3b82f6');
          } else {
            path.setAttribute('stroke', '#3b82f6'); // Default blue
          }
          
          // Ensure fill is none for paths
          path.setAttribute('fill', 'none');
        }
      });
      
      // Convert back to a string and return as data URL
      const serializer = new XMLSerializer();
      const fixedSvgString = serializer.serializeToString(svgDoc);
      return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(fixedSvgString)}`;
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
    
    // If it's already a data URL, check if we can enhance image quality
    if (pngData.startsWith('data:image/png')) {
      // For PNG images that are already in data URL format
      // Return as is since pixelRatio is already applied in the toPng function
      return pngData;
    }
    
    return pngData;
  } catch (error) {
    console.error('Error processing PNG for export:', error);
    // Return a blank PNG data URL in case of error
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
  }
};
