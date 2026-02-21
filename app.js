import { Canvg } from 'canvg';
import { GIFEncoder, quantize, applyPalette } from 'gifenc';
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
const renderGifButton = document.getElementById('render-gif-button');
const animationDurationInput = document.getElementById('animation-duration-input');
const gifOutput = document.getElementById('gif-output');

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

/**
 * Convert SVG string to canvas with ImageData
 */
async function svgToCanvas(svgString, width = 240, height = 240) {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    const tempCtx = tempCanvas.getContext('2d');

    const v = await Canvg.from(tempCtx, svgString);
    await v.render();

    return tempCanvas;
}

/**
 * Render all frames as an animated GIF
 */
async function renderGif() {
    renderGifButton.disabled = true;
    renderGifButton.textContent = 'Generating GIF...';
    gifOutput.innerHTML = '';

    try {
        const numFrames = getNumFrames();
        const frames = [];
        const animationDuration = parseInt(animationDurationInput.value, 10) || 2000;
        const frameDuration = Math.round(animationDuration / numFrames);

        // Generate all frames
        for (let i = 0; i < numFrames; i++) {
            const svgString = generateFrameSVG(i, currentText, currentFontMax);
            const frameCanvas = await svgToCanvas(svgString);
            const frameCtx = frameCanvas.getContext('2d');
            const imageData = frameCtx.getImageData(0, 0, frameCanvas.width, frameCanvas.height);
            frames.push(imageData.data);
        }

        // Create GIF encoder
        const encoder = GIFEncoder();

        // Flatten all frame data for palette generation
        const allPixels = new Uint8Array(frames.reduce((acc, frame) => acc + frame.length, 0));
        let offset = 0;
        for (const frame of frames) {
            allPixels.set(frame, offset);
            offset += frame.length;
        }

        // Quantize colors across all frames for better quality
        const palette = quantize(allPixels, 256);

        // Encode frames
        for (let i = 0; i < frames.length; i++) {
            const indexed = applyPalette(frames[i], palette);
            encoder.writeFrame(indexed, 240, 240, { delay: frameDuration, palette });
        }

        encoder.finish();

        // Create and display GIF
        const buffer = encoder.bytes();
        const blob = new Blob([buffer], { type: 'image/gif' });
        const url = URL.createObjectURL(blob);

        const img = document.createElement('img');
        img.src = url;
        img.style.maxWidth = '500px';
        gifOutput.appendChild(img);

    } catch (error) {
        console.error('Error generating GIF:', error);
        gifOutput.innerHTML = `<p class="has-text-danger">Error generating GIF: ${error.message}</p>`;
    } finally {
        renderGifButton.disabled = false;
        renderGifButton.textContent = 'Render GIF';
    }
}

// Set up event listeners
prevButton.addEventListener('click', previousFrame);
nextButton.addEventListener('click', nextFrame);
textInput.addEventListener('input', updateText);
fontSizeInput.addEventListener('input', updateFontSize);
renderGifButton.addEventListener('click', renderGif);

// Render the initial frame
renderFrame();
