import { Canvg } from 'canvg';
import { generateFrameSVG, getNumFrames } from './rotator.js';

let currentFrame = 0;
let currentText = "TY";
let currentFontMax = 180;

// Get DOM elements
const canvas = document.getElementById('frame-canvas');
const ctx = canvas.getContext('2d');
const textInput = document.getElementById('text-input');
const fontSizeInput = document.getElementById('font-size-input');
const prevButton = document.querySelectorAll('.button.is-primary')[0];
const nextButton = document.querySelectorAll('.button.is-primary')[1];
const frameDisplay = document.querySelector('.button.is-static');

/**
 * Render the current frame to the canvas
 */
async function renderFrame() {
    // Generate SVG for the current frame
    const svgString = generateFrameSVG(currentFrame, currentText, currentFontMax);

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Use canvg to render SVG to canvas
    const v = await Canvg.from(ctx, svgString);
    await v.render();

    // Update frame display
    frameDisplay.textContent = `Frame: ${currentFrame}`;
}

/**
 * Move to the previous frame
 */
function previousFrame() {
    currentFrame = (currentFrame - 1 + getNumFrames()) % getNumFrames();
    renderFrame();
}

/**
 * Move to the next frame
 */
function nextFrame() {
    currentFrame = (currentFrame + 1) % getNumFrames();
    renderFrame();
}

/**
 * Update text from input
 */
function updateText() {
    currentText = textInput.value || "TY";
    renderFrame();
}

/**
 * Update font size from input
 */
function updateFontSize() {
    const value = parseInt(fontSizeInput.value, 10);
    if (value > 0) {
        currentFontMax = value;
        renderFrame();
    }
}

// Set up event listeners
prevButton.addEventListener('click', previousFrame);
nextButton.addEventListener('click', nextFrame);
textInput.addEventListener('input', updateText);
fontSizeInput.addEventListener('input', updateFontSize);

// Render the initial frame
renderFrame();
