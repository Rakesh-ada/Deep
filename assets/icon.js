// Script to convert SVG to PNG for use in Electron
const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

// Ensure the canvas package is installed
try {
  require.resolve('canvas');
} catch (e) {
  console.error('The "canvas" package is required for this script.');
  console.error('Please install it with: npm install canvas');
  process.exit(1);
}

// File paths
const svgPath = path.join(__dirname, 'icon.svg');
const pngPath = path.join(__dirname, 'icon.png');

// Size of the output PNG
const size = 256;

async function convertSvgToPng() {
  try {
    // Create canvas with desired dimensions
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    
    // Load SVG image
    const img = await loadImage(`file://${svgPath}`);
    
    // Draw SVG to canvas
    ctx.drawImage(img, 0, 0, size, size);
    
    // Save canvas as PNG
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(pngPath, buffer);
    
    console.log(`Successfully converted SVG to PNG: ${pngPath}`);
  } catch (error) {
    console.error('Error converting SVG to PNG:', error);
  }
}

// Run the conversion
convertSvgToPng(); 