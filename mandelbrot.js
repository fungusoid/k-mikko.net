// Mandelbrot Explorer – click-to-zoom

// Get references to canvas elements and their 2D rendering contexts
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const loadingIndicator = document.getElementById('loading');

// Global variables for canvas dimensions and image data
let width, height, imgData;

// View state in the complex plane
let centerX = -0.5; // Initial center X coordinate
let centerY = 0.0;  // Initial center Y coordinate
let scale = 3.0;    // Initial span of the width in complex plane units
const baseIter = 128; // Base number of iterations for Mandelbrot calculation

// Quality presets: define step (pixel skip) and iteration multiplier
const QUALITIES = {
  fast:   { step: 3, iterMul: 0.4 },
  medium: { step: 2, iterMul: 0.7 },
  high:   { step: 1, iterMul: 1.0 }
};
let quality = 'medium'; // Default quality setting

// Palette for CPU renderer (array of [r,g,b] color components)
let palette = [];

/**
 * Generates a new random color palette for the CPU renderer.
 * Uses HSL to RGB conversion for smoother color transitions.
 */
function randomPalette() {
  palette = [];
  const stops = 5 + Math.floor(Math.random() * 5); // 5-9 random color stops
  const stopsArr = [];
  // Generate random HSL color stops
  for (let i = 0; i < stops; i++) {
    stopsArr.push([Math.random() * 360, 60 + Math.random() * 40, 40 + Math.random() * 30]);
  }
  // Interpolate between color stops to fill the palette for all iterations
  for (let i = 0; i < baseIter; i++) {
    const t = i / (baseIter - 1) * (stops - 1);
    const i0 = Math.floor(t);
    const i1 = Math.min(i0 + 1, stops - 1);
    const f = t - i0; // Fractional part for interpolation

    const c0 = stopsArr[i0];
    const c1 = stopsArr[i1];

    // Linear interpolation for H, S, L components
    const h = c0[0] + (c1[0] - c0[0]) * f;
    const s = c0[1] + (c1[1] - c0[1]) * f;
    const l = c0[2] + (c1[2] - c0[2]) * f;
    palette.push(hslToRgb(h / 360, s / 100, l / 100));
  }
}

/**
 * Converts an HSL color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes h, s, and l are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 * @param   {Number}  h       The hue
 * @param   {Number}  s       The saturation
 * @param   {Number}  l       The lightness
 * @return  {Array}           The RGB representation
 */
function hslToRgb(h, s, l) {
  if (s === 0) {
    const v = Math.round(l * 255);
    return [v, v, v]; // achromatic
  }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const r = hue2rgb(p, q, h + 1 / 3);
  const g = hue2rgb(p, q, h);
  const b = hue2rgb(p, q, h - 1 / 3);
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

/**
 * Helper function for hslToRgb.
 */
function hue2rgb(p, q, t) {
  if (t < 0) t += 1;
  if (t > 1) t -= 1;
  if (t < 1 / 6) return p + (q - p) * 6 * t;
  if (t < 1 / 2) return q;
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
  return p;
}

let resizeTimeout; // Used for debouncing the resize event
/**
 * Adjusts canvas dimensions to match window size and triggers a re-render.
 */
function resize() {
  width = canvas.width = window.innerWidth;
  // The canvas height is now set by its own clientHeight, respecting the CSS calc()
  height = canvas.height = canvas.clientHeight;
  // imgData will be created in drawCPUWithWorker before sending to worker
  render();
}

// ---------------- Web Worker for CPU renderer ----------------
let mandelbrotWorker;

/**
 * Initializes the Web Worker for CPU-based Mandelbrot rendering.
 * The worker script is created as a Blob to avoid a separate file request.
 */
function initWorker() {
  if (mandelbrotWorker) return; // Worker already initialized

  // The script for the Web Worker
  const workerScript = `
    // Worker-side constants and helper functions (copied from main script)
    const QUALITIES = ${JSON.stringify(QUALITIES)};
    const baseIter = ${baseIter};

    function hslToRgb(h, s, l){
      if (s === 0) { const v = Math.round(l*255); return [v,v,v]; }
      const q = l < 0.5 ? l * (1 + s) : l + s - l*s;
      const p = 2*l - q;
      const r = hue2rgb(p, q, h + 1/3);
      const g = hue2rgb(p, q, h);
      const b = hue2rgb(p, q, h - 1/3);
      return [Math.round(r*255), Math.round(g*255), Math.round(b*255)];
    }
    function hue2rgb(p,q,t){ if(t<0) t+=1; if(t>1) t-=1; if(t<1/6) return p+(q-p)*6*t; if(t<1/2) return q; if(t<2/3) return p+(q-p)*(2/3-t)*6; return p; }

    // Worker's message handler: performs Mandelbrot calculation
    self.onmessage = function(e) {
      const { centerX, centerY, scale, width, height, quality, palette, imageDataBuffer } = e.data;
      // Create a Uint8ClampedArray view over the transferred buffer
      const data = new Uint8ClampedArray(imageDataBuffer);

      const q = QUALITIES[quality];
      const step = q.step;
      // Calculate max iterations based on quality and zoom level
      const maxIter = Math.round(baseIter * q.iterMul * (3 / scale));

      // Mandelbrot calculation loop
      for (let py = 0; py < height; py += step) {
        const y0 = centerY + (py - height / 2) * scale / width;
        for (let px = 0; px < width; px += step) {
          const x0 = centerX + (px - width / 2) * scale / width;
          let x = 0, y = 0, iter = 0;
          // Iterate until point escapes or max iterations reached
          while (x * x + y * y <= 4 && iter < maxIter) {
            const xt = x * x - y * y + x0;
            y = 2 * x * y + y0;
            x = xt;
            iter++;
          }

          let r, g, b;
          if (iter === maxIter) {
            r = g = b = 0; // Point is in the set (black)
          } else {
            // Color based on iteration count
            const c = palette[iter % palette.length];
            r = c[0]; g = c[1]; b = c[2];
          }

          // Fill a block of pixels (step x step) with the calculated color
          for (let by = 0; by < step && py + by < height; by++) {
            let idx = ((py + by) * width + px) * 4; // Calculate starting index for the row
            for (let bx = 0; bx < step && px + bx < width; bx++) {
              // Ensure we don't write out of bounds
              if (idx < data.length - 3) {
                data[idx] = r;
                data[idx + 1] = g;
                data[idx + 2] = b;
                data[idx + 3] = 255; // Alpha channel (fully opaque)
              }
              idx += 4; // Move to the next pixel
            }
          }
        }
      }
      // Post the filled buffer back to the main thread as a transferable object
      self.postMessage({ imageDataBuffer: data.buffer, maxIter: maxIter }, [data.buffer]);
    };
  `;
  // Create a Blob from the worker script string and create a Worker from it
  const blob = new Blob([workerScript], { type: 'application/javascript' });
  mandelbrotWorker = new Worker(URL.createObjectURL(blob));

  // Handle messages received from the worker
  mandelbrotWorker.onmessage = function(e) {
    const { imageDataBuffer, maxIter } = e.data;
    // Reconstruct Uint8ClampedArray from the received buffer
    const receivedUint8ClampedArray = new Uint8ClampedArray(imageDataBuffer);
    // Create a new ImageData object from the received pixel data
    imgData = new ImageData(receivedUint8ClampedArray, width, height);
    ctx.putImageData(imgData, 0, 0); // Put the image data onto the canvas
    updateInfo(maxIter); // Update info display
    loadingIndicator.style.display = 'none'; // Hide loading indicator
  };

  // Handle errors from the worker
  mandelbrotWorker.onerror = function(e) {
    console.error('Worker error:', e);
    loadingIndicator.style.display = 'none';
    // Use a custom message box instead of alert() for better UX
    showMessageBox('An error occurred with the rendering worker. Please try reloading the page.', 'Worker Error');
  };
}

/**
 * Triggers the CPU rendering process by sending data to the Web Worker.
 */
function drawCPUWithWorker() {
  loadingIndicator.style.display = 'block'; // Show loading indicator
  initWorker(); // Ensure worker is initialized

  // Create a new ImageData object on the main thread.
  // Its underlying ArrayBuffer will be transferred to the worker.
  imgData = ctx.createImageData(width, height);
  const buffer = imgData.data.buffer; // Get the buffer to transfer

  mandelbrotWorker.postMessage({
      centerX,
      centerY,
      scale,
      width,
      height,
      quality,
      palette,
      imageDataBuffer: buffer // Pass the buffer to the worker
  }, [buffer]); // Mark the buffer as transferable for efficiency
}

/**
 * Main render function: calls the CPU rendering function.
 */
function render() {
  drawCPUWithWorker();
}

/**
 * Updates the information display on the screen.
 * @param {number} maxIter - The maximum iterations used for the current render.
 */
function updateInfo(maxIter) {
  document.getElementById('info').textContent = `Center: (${centerX.toFixed(6)}, ${centerY.toFixed(6)}) | Scale: ${scale.toExponential(2)} | Iter: ~${maxIter} | Q:${quality}`;
}

// ======= Click to Zoom Interaction =======

/**
 * Converts screen pixel coordinates to complex plane coordinates.
 * @param {number} px - Pixel X coordinate.
 * @param {number} py - Pixel Y coordinate.
 * @returns {{x: number, y: number}} Complex plane coordinates.
 */
function screenToComplex(px, py) {
  // We need to account for the canvas's top offset
  const rect = canvas.getBoundingClientRect();
  return {
    x: centerX + (px - rect.left - width / 2) * scale / width,
    y: centerY + (py - rect.top - height / 2) * scale / width
  };
}

// Left-click event listener for zooming in
canvas.addEventListener('click', e => {
  const complex = screenToComplex(e.clientX, e.clientY);
  centerX = complex.x;
  centerY = complex.y;
  scale /= 2.5; // Zoom in by a factor of 2.5
  render();
});

// Right-click event listener for zooming out
canvas.addEventListener('contextmenu', e => {
  e.preventDefault(); // Prevent the default context menu
  const complex = screenToComplex(e.clientX, e.clientY);
  centerX = complex.x;
  centerY = complex.y;
  scale *= 2.5; // Zoom out by a factor of 2.5
  render();
});


/**
 * Custom message box function to replace `alert()`.
 * @param {string} message - The message to display.
 * @param {string} title - The title of the message box.
 */
function showMessageBox(message, title = 'Message') {
  // Create modal background
  const modalBackground = document.createElement('div');
  modalBackground.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  `;

  // Create modal dialog
  const modalDialog = document.createElement('div');
  modalDialog.style.cssText = `
    background: #333;
    color: #fff;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
    max-width: 400px;
    text-align: center;
    font-family: system-ui, sans-serif;
  `;

  // Add title
  const modalTitle = document.createElement('h3');
  modalTitle.textContent = title;
  modalTitle.style.cssText = 'margin-top: 0; color: #eee;';

  // Add message content
  const modalMessage = document.createElement('p');
  modalMessage.textContent = message;
  modalMessage.style.cssText = 'margin-bottom: 20px; line-height: 1.5;';

  // Add close button
  const closeButton = document.createElement('button');
  closeButton.textContent = 'OK';
  closeButton.style.cssText = `
    padding: 8px 20px;
    background: #007bff;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 1rem;
  `;
  closeButton.onclick = () => document.body.removeChild(modalBackground);

  modalDialog.appendChild(modalTitle);
  modalDialog.appendChild(modalMessage);
  modalDialog.appendChild(closeButton);
  modalBackground.appendChild(modalDialog);
  document.body.appendChild(modalBackground);
}


// Event listeners for UI buttons
document.getElementById('randColors').addEventListener('click', () => {
  randomPalette();
  render();
});
document.getElementById('reset').addEventListener('click', () => {
  centerX = -0.5;
  centerY = 0;
  scale = 3;
  render();
});
document.getElementById('quality').addEventListener('change', e => {
  quality = e.target.value;
  render();
});

// Initialization
randomPalette();     // Generate initial CPU palette
resize();            // Perform initial canvas sizing and render

// Debounce resize event listener for performance
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(resize, 200); // Wait 200ms after resize stops before re-rendering
});
