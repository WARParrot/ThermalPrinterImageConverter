import {
  applyBrightnessContrast,
  rgbToGrayscale,
  grayscaleToRGB,
  thresholdDither,
  floydSteinbergDither,
  atkinsonDither,
  orderedDither
} from './dithering';
import type { ProcessingOptions } from '../types';

/**
 * Main processing pipeline.
 * @param imageData - original image data
 * @param options - processing parameters
 * @returns processed image data
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
    invert
  } = options;

  const width = imageData.width;
  const height = imageData.height;
  const data = imageData.data; // Uint8ClampedArray

  // 1. Apply brightness/contrast to RGB channels
  applyBrightnessContrast(data, brightness, contrast);

  // 2. Convert to grayscale (float)
  let gray = rgbToGrayscale(data);

  // 3. Apply dithering
  let processedGray: Float32Array;
  switch (algorithm) {
    case 'threshold':
      processedGray = thresholdDither(gray, width, height, threshold);
      break;
    case 'atkinson':
      processedGray = atkinsonDither(gray, width, height);
      break;
    case 'ordered':
      processedGray = orderedDither(gray, width, height, bayerSize);
      break;
    case 'floyd':
    default:
      processedGray = floydSteinbergDither(gray, width, height);
  }

  // 4. Invert if requested
  if (invert) {
    for (let i = 0; i < processedGray.length; i++) {
      processedGray[i] = processedGray[i] === 0 ? 255 : 0;
    }
  }

  // 5. Write back to image data
  grayscaleToRGB(data, processedGray);

  return imageData;
};
