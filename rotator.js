// Animation Parameters
const NUM_FRAMES = 12;

// Pattern Rotation
const ROTATION_UNIT = 360 / 7;
const TOTAL_PATTERN_ROTATION = 4 * ROTATION_UNIT;
const PATTERN_ROTATION_STEP = TOTAL_PATTERN_ROTATION / NUM_FRAMES;

// Hue Rotation
const HUE_ROTATION_STEP = 360.0 / NUM_FRAMES;

// Text Rotation (Oscillation)
const TEXT_ROTATION_RANGE = 50.0;
const TEXT_ROTATION_STEP = (TEXT_ROTATION_RANGE * 2) / NUM_FRAMES;

// Dynamic Font Size - default values
const DEFAULT_FONT_MAX = 180;
const FONT_MIN_RATIO = 0.8;

// Base SVG template
const BASE_SVG_TEMPLATE = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="240" height="240" viewBox="0 0 240 240" style="overflow: hidden" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <defs>
        <filter id="hue-rotate" x="0" y="0" width="240" height="240" filterUnits="userSpaceOnUse">
            <feColorMatrix type="hueRotate" values="0" />
        </filter>
        <g id="ab">
            <path d="M 0 0 L 170 0 A 170 170 0 0 1 105.99 132.91 Z" fill="green"/>
            <path d="M 0 0 L 170 0 A 170 170 0 0 1 153.16 73.76 Z" fill="darkgreen"/>
        </g>
    </defs>
    <g id="rotating-pattern" transform="translate(120, 120) rotate(0)">
        <use href="#ab" transform="rotate(0)" filter="url(#hue-rotate)" />
        <use href="#ab" transform="rotate(51.43)" filter="url(#hue-rotate)" />
        <use href="#ab" transform="rotate(102.86)" filter="url(#hue-rotate)" />
        <use href="#ab" transform="rotate(154.29)" filter="url(#hue-rotate)" />
        <use href="#ab" transform="rotate(205.71)" filter="url(#hue-rotate)" />
        <use href="#ab" transform="rotate(257.14)" filter="url(#hue-rotate)" />
        <use href="#ab" transform="rotate(308.57)" filter="url(#hue-rotate)" />
    </g>
    <text
        x="120"
        y="120"
        font-family="'DejaVu Sans', sans-serif"
        font-size="180px"
        stroke="black"
        stroke-width="10"
        fill="white"
        font-weight="bold"
        stroke-linejoin="round"
        text-anchor="middle"
        dominant-baseline="central"
    >TY</text>
</svg>`;

/**
 * Generate an SVG string for a specific frame
 * @param {number} frameIndex - Frame number (0 to NUM_FRAMES-1)
 * @param {string} text - Text to display (default: "TY")
 * @param {number} fontMax - Maximum font size (default: DEFAULT_FONT_MAX)
 * @returns {string} SVG string for the frame
 */
export function generateFrameSVG(frameIndex, text = "TY", fontMax = DEFAULT_FONT_MAX) {
    // Calculate angles for this frame
    const patternAngle = frameIndex * PATTERN_ROTATION_STEP;
    const hueAngle = frameIndex * HUE_ROTATION_STEP;
    const textAngle = 25.0 * Math.sin((2 * Math.PI * frameIndex) / NUM_FRAMES - (Math.PI / 2));

    // Calculate dynamic font size based on provided max
    const fontMin = fontMax * FONT_MIN_RATIO;
    const fontRange = (fontMax - fontMin) / 2;
    const fontMid = fontMin + fontRange;
    const fontSize = fontMid + fontRange * Math.cos((4 * Math.PI * frameIndex) / NUM_FRAMES + Math.PI);

    // Calculate dynamic Y-offset for vertical centering
    const yVisualCenter = 120 + (fontSize * 0.11);

    // Parse the base SVG and modify it
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(BASE_SVG_TEMPLATE, "image/svg+xml");

    // Update pattern rotation on the main group
    const patternG = svgDoc.getElementById('rotating-pattern');
    if (patternG) {
        patternG.setAttribute('transform', `translate(120, 120) rotate(${patternAngle.toFixed(2)})`);
    }

    // Update hue rotation
    const feColorMatrix = svgDoc.querySelector('feColorMatrix');
    if (feColorMatrix) {
        feColorMatrix.setAttribute('values', hueAngle.toFixed(2));
    }

    // Update text element
    const textElement = svgDoc.querySelector('text');
    if (textElement) {
        textElement.setAttribute('font-size', `${fontSize}px`);
        textElement.setAttribute('y', yVisualCenter.toFixed(2));
        textElement.setAttribute('transform', `rotate(${textAngle.toFixed(2)}, 120, 120)`);
        textElement.textContent = text;
    }

    // Serialize back to string
    const serializer = new XMLSerializer();
    return serializer.serializeToString(svgDoc);
}

/**
 * Get the total number of frames
 * @returns {number} Number of frames
 */
export function getNumFrames() {
    return NUM_FRAMES;
}
