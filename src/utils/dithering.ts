// Utility: clamp value between 0-255
export const clamp = (val: number): number => Math.min(255, Math.max(0, val));

// Apply brightness and contrast to RGB data (in-place)
export const applyBrightnessContrast = (
  data: Uint8ClampedArray,
  brightness: number,
  contrast: number
): void => {
  const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
  for (let i = 0; i < data.length; i += 4) {
    for (let j = 0; j < 3; j++) {
      let val = data[i + j];
      val = factor * (val - 128) + 128 + brightness;
      data[i + j] = clamp(val);
    }
  }
};

// Convert RGB to grayscale (returns Float32Array)
export const rgbToGrayscale = (data: Uint8ClampedArray): Float32Array => {
  const gray = new Float32Array(data.length / 4);
  for (let i = 0, j = 0; i < data.length; i += 4, j++) {
    gray[j] = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
  }
  return gray;
};

// Write grayscale values back to RGB channels
export const grayscaleToRGB = (data: Uint8ClampedArray, gray: Float32Array): void => {
  for (let i = 0, j = 0; i < data.length; i += 4, j++) {
    const v = Math.round(gray[j]);
    data[i] = data[i + 1] = data[i + 2] = v;
  }
};

// Simple threshold
export const thresholdDither = (
  gray: Float32Array,
  width: number,
  height: number,
  threshold: number
): Float32Array => {
  const out = new Float32Array(gray.length);
  for (let i = 0; i < gray.length; i++) {
    out[i] = gray[i] < threshold ? 0 : 255;
  }
  return out;
};

// Floyd‑Steinberg dithering
export const floydSteinbergDither = (
  gray: Float32Array,
  width: number,
  height: number
): Float32Array => {
  const out = new Float32Array(gray.length);
  for (let i = 0; i < gray.length; i++) out[i] = gray[i];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const oldPixel = out[idx];
      const newPixel = oldPixel < 128 ? 0 : 255;
      out[idx] = newPixel;
      const quantError = oldPixel - newPixel;

      if (x + 1 < width) {
        out[idx + 1] += (quantError * 7) / 16;
      }
      if (y + 1 < height) {
        if (x > 0) out[idx + width - 1] += (quantError * 3) / 16;
        out[idx + width] += (quantError * 5) / 16;
        if (x + 1 < width) out[idx + width + 1] += (quantError * 1) / 16;
      }
    }
  }
  return out;
};

// Atkinson dithering (preserves details well for thermal)
export const atkinsonDither = (
  gray: Float32Array,
  width: number,
  height: number
): Float32Array => {
  const out = new Float32Array(gray.length);
  for (let i = 0; i < gray.length; i++) out[i] = gray[i];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const oldPixel = out[idx];
      const newPixel = oldPixel < 128 ? 0 : 255;
      out[idx] = newPixel;
      const quantError = (oldPixel - newPixel) / 8;

      if (x + 1 < width) out[idx + 1] += quantError;
      if (x + 2 < width) out[idx + 2] += quantError;
      if (y + 1 < height) {
        if (x - 1 >= 0) out[idx + width - 1] += quantError;
        out[idx + width] += quantError;
        if (x + 1 < width) out[idx + width + 1] += quantError;
      }
      if (y + 2 < height) out[idx + 2 * width] += quantError;
    }
  }
  return out;
};

// Bayer matrix generator
type BayerMatrix = number[][];

const bayerMatrix = (size: 2 | 4 | 8): BayerMatrix => {
  if (size === 2) return [[0, 2], [3, 1]];
  if (size === 4) return [
    [0, 8, 2, 10],
    [12, 4, 14, 6],
    [3, 11, 1, 9],
    [15, 7, 13, 5]
  ];
  // 8x8
  return [
    [0, 32, 8, 40, 2, 34, 10, 42],
    [48, 16, 56, 24, 50, 18, 58, 26],
    [12, 44, 4, 36, 14, 46, 6, 38],
    [60, 28, 52, 20, 62, 30, 54, 22],
    [3, 35, 11, 43, 1, 33, 9, 41],
    [51, 19, 59, 27, 49, 17, 57, 25],
    [15, 47, 7, 39, 13, 45, 5, 37],
    [63, 31, 55, 23, 61, 29, 53, 21]
  ];
};

// Ordered dithering using Bayer matrix
export const orderedDither = (
  gray: Float32Array,
  width: number,
  height: number,
  matrixSize: 2 | 4 | 8 = 4
): Float32Array => {
  const matrix = bayerMatrix(matrixSize);
  const out = new Float32Array(gray.length);
  const n = matrixSize;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const threshold = ((matrix[y % n][x % n] + 0.5) / (n * n)) * 255;
      out[idx] = gray[idx] < threshold ? 0 : 255;
    }
  }
  return out;
};
