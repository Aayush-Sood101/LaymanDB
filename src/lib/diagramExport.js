/**
 * Utility functions for exporting high-resolution diagrams
 */

import { toPng, toSvg } from 'html-to-image';

/**
 * Exports an SVG diagram to high-resolution SVG format
 * 
 * @param {HTMLElement} svgElement - The SVG element to export
 * @param {Object} options - Export options
 * @returns {Promise<string>} - Data URL of the exported SVG
 */
export async function exportToHighResSvg(svgElement, options = {}) {
  if (!svgElement) {
    throw new Error('SVG element not provided for export');
  }

  // Make a clone to manipulate it for better export
  const clonedSvg = svgElement.cloneNode(true);
  
  // Get dimensions from options or use the element's dimensions
  const width = options.width || Math.max(svgElement.clientWidth || 800, 1000);
  const height = options.height || Math.max(svgElement.clientHeight || 600, 800);
  
  // Set explicit dimensions
  clonedSvg.setAttribute('width', width.toString());
  clonedSvg.setAttribute('height', height.toString());
  
  // Improve quality with viewBox if needed
  if (!clonedSvg.getAttribute('viewBox')) {
    clonedSvg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  }
  
  // Remove any unwanted elements
  if (options.removeClasses) {
    options.removeClasses.forEach(className => {
      const elements = clonedSvg.querySelectorAll(`.${className}`);
      elements.forEach(el => el.remove());
    });
  }
  
  // Create a temporary div to hold the cloned SVG
  const tempDiv = document.createElement('div');
  tempDiv.style.position = 'absolute';
  tempDiv.style.left = '-9999px';
  tempDiv.style.top = '-9999px';
  tempDiv.appendChild(clonedSvg);
  document.body.appendChild(tempDiv);
  
  try {
    // Generate high-quality SVG
    const svgData = await toSvg(clonedSvg, {
      quality: 1,
      pixelRatio: options.pixelRatio || 2, // Default to 2x resolution
      backgroundColor: options.backgroundColor || 'transparent',
      width,
      height,
      style: {
        // Enhance styling for export
        'text': {
          'font-family': '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, sans-serif',
          'font-weight': options.fontWeight || 'normal'
        },
        ...(options.style || {})
      },
      filter: (node) => {
        // Filter out any unnecessary elements
        if (options.filter) return options.filter(node);
        return true;
      }
    });
    
    return svgData;
  } finally {
    // Clean up temporary element
    if (document.body.contains(tempDiv)) {
      document.body.removeChild(tempDiv);
    }
  }
}

/**
 * Exports an SVG diagram to high-resolution PNG format
 * 
 * @param {HTMLElement} svgElement - The SVG element to export
 * @param {Object} options - Export options
 * @returns {Promise<string>} - Data URL of the exported PNG
 */
export async function exportToHighResPng(svgElement, options = {}) {
  if (!svgElement) {
    throw new Error('SVG element not provided for export');
  }
  
  // Get dimensions from options or use the element's dimensions
  const width = options.width || Math.max(svgElement.clientWidth || 800, 1000);
  const height = options.height || Math.max(svgElement.clientHeight || 600, 800);
  
  // Generate high-quality PNG
  return await toPng(svgElement, {
    quality: 1,
    pixelRatio: options.pixelRatio || 3, // Default to 3x resolution for PNG
    backgroundColor: options.backgroundColor || 'transparent',
    width,
    height,
    style: {
      // Enhance styling for export
      'text': {
        'font-family': '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, sans-serif',
        'font-weight': options.fontWeight || 'normal'
      },
      ...(options.style || {})
    },
    filter: (node) => {
      // Filter out any unnecessary elements
      if (options.filter) return options.filter(node);
      return true;
    },
    canvasWidth: width * (options.pixelRatio || 3),
    canvasHeight: height * (options.pixelRatio || 3)
  });
}

/**
 * Helper function to download a data URL as a file
 * 
 * @param {string} dataUrl - The data URL to download
 * @param {string} filename - The filename to use
 */
export function downloadDataUrl(dataUrl, filename) {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}