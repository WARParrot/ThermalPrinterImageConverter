// src/utils/imageProcessing.ts

import {
  applyBrightnessContrast,
  rgbToGrayscale,
  grayscaleToRGB,
  thresholdDither,
  floydSteinbergDither,
  atkinsonDither,
  orderedDither
} from './dithering';
import type { ProcessingOptions, ResizeMode } from '../types';

/**
 * Resize ImageData to target width, optionally preserving aspect ratio.
 */
export const resizeImageData = (
  source: ImageData,
  targetWidth: number,
  targetHeight: number,
  mode: ResizeMode
): ImageData => {
  const srcWidth = source.width;
  const srcHeight = source.height;

  if (mode === 'original') {
    return source;
  }

  let newWidth: number;
  let newHeight: number;

  switch (mode) {
    case 'fitWidth':
      newWidth = targetWidth;
      newHeight = Math.round((targetWidth / srcWidth) * srcHeight);
      break;
    case 'fitHeight':
      newHeight = targetHeight;
      newWidth = Math.round((targetHeight / srcHeight) * srcWidth);
      break;
    case 'exact':
      newWidth = targetWidth;
      newHeight = targetHeight;
      break;
    default:
      return source;
  }

  const canvas = document.createElement('canvas');
  canvas.width = newWidth;
  canvas.height = newHeight;
  const ctx = canvas.getContext('2d')!;

  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = srcWidth;
  tempCanvas.height = srcHeight;
  const tempCtx = tempCanvas.getContext('2d')!;
  tempCtx.putImageData(source, 0, 0);

  ctx.drawImage(tempCanvas, 0, 0, newWidth, newHeight);
  return ctx.getImageData(0, 0, newWidth, newHeight);
};

/**
 * Pad image height to be a multiple of 8 by adding white rows at the bottom.
 */
export const padHeightToMultipleOf8 = (imageData: ImageData): ImageData => {
  const width = imageData.width;
  const height = imageData.height;

  if (height % 8 === 0) {
    return imageData;
  }

  const newHeight = Math.ceil(height / 8) * 8;
  const paddedData = new ImageData(width, newHeight);

  // Copy original pixels
  paddedData.data.set(imageData.data);

  // Fill remaining rows with white (255,255,255,255)
  for (let i = height * width * 4; i < paddedData.data.length; i += 4) {
    paddedData.data[i] = 255;     // R
    paddedData.data[i + 1] = 255; // G
    paddedData.data[i + 2] = 255; // B
    paddedData.data[i + 3] = 255; // A
  }

  return paddedData;
};

/**
 * Main processing pipeline.
 */
export const processImageData = (
  imageData: ImageData,
  options: ProcessingOptions
): ImageData => {
  const {
    algorithm,
    brightness,
    contrast,
    threshold,
    bayerSize,
    invert,
    resizeMode,
    targetWidth,
    targetHeight
  } = options;

  // 0. Resize if needed
  let processed = imageData;
  if (resizeMode !== 'original') {
  processed = resizeImageData(imageData, targetWidth, targetHeight, resizeMode);
}

  // 0.5 Pad height to multiple of 8 for ESC/POS compatibility
  processed = padHeightToMultipleOf8(processed);

  const width = processed.width;
  const height = processed.height;
  const data = processed.data;

  // 1. Apply brightness/contrast
  applyBrightnessContrast(data, brightness, contrast);

  // 2. Convert to grayscale
  const gray = rgbToGrayscale(data);

  // 3. Dither
  let dithered: Float32Array;
  switch (algorithm) {
    case 'threshold':
      dithered = thresholdDither(gray, width, height, threshold);
      break;
    case 'atkinson':
      dithered = atkinsonDither(gray, width, height);
      break;
    case 'ordered':
      dithered = orderedDither(gray, width, height, bayerSize);
      break;
    case 'floyd':
    default:
      dithered = floydSteinbergDither(gray, width, height);
  }

  // 4. Invert
  if (invert) {
    for (let i = 0; i < dithered.length; i++) {
      dithered[i] = dithered[i] === 0 ? 255 : 0;
    }
  }

  // 5. Write back to RGB
  grayscaleToRGB(data, dithered);

  return processed;
};
