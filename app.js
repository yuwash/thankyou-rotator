import { Canvg } from 'canvg';
import { generateFrameSVG, getNumFrames } from './rotator.js';

let currentFrame = 0;
let currentText = "TY";

// Get DOM elements
const canvas = document.getElementById('frame-canvas');
const ctx = canvas.getContext('2d');
const textInput = document.querySelector('.input');
const prevButton = document.querySelectorAll('.button.is-primary')[0];
const nextButton = document.querySelectorAll('.button.is-primary')[1];
const frameDisplay = document.querySelector('.button.is-static');

/**
 * Render the current frame to the canvas
 */
async function renderFrame() {
    // Generate SVG for the current frame
    const svgString = generateFrameSVG(currentFrame, currentText);

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

// Set up event listeners
prevButton.addEventListener('click', previousFrame);
nextButton.addEventListener('click', nextFrame);
textInput.addEventListener('input', updateText);

// Render the initial frame
renderFrame();
