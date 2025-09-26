/**
 * Utility functions for exporting high-resolution diagrams
 */

import { toPng } from 'html-to-image';

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