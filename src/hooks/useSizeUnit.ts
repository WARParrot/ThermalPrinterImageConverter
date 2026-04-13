import { useState, useEffect } from 'react';
import type { SizeUnit } from '../types';

// Standard thermal printer: 203 DPI ≈ 8 dots/mm
const MM_PER_INCH = 25.4;
const DPI = 203;
const DPMM = DPI / MM_PER_INCH;

export const pxToMm = (px: number): number => px / DPMM;
export const mmToPx = (mm: number): number => Math.round(mm * DPMM);

interface UseSizeUnitProps {
  unit: SizeUnit;
  targetWidth: number;
  targetHeight: number;
  setTargetWidth: (px: number) => void;
  setTargetHeight: (px: number) => void;
}

export const useSizeUnit = ({
  unit,
  targetWidth,
  targetHeight,
  setTargetWidth,
  setTargetHeight,
}: UseSizeUnitProps) => {
  // Local display strings (what the user sees in inputs)
  const [displayWidth, setDisplayWidth] = useState('');
  const [displayHeight, setDisplayHeight] = useState('');

  // Update display values when unit or pixel targets change
  useEffect(() => {
    if (unit === 'px') {
      setDisplayWidth(targetWidth.toString());
      setDisplayHeight(targetHeight.toString());
    } else {
      setDisplayWidth(pxToMm(targetWidth).toFixed(1));
      setDisplayHeight(pxToMm(targetHeight).toFixed(1));
    }
  }, [unit, targetWidth, targetHeight]);

  const handleWidthChange = (value: string) => {
    setDisplayWidth(value);
    const num = parseFloat(value);
    if (!isNaN(num) && num > 0) {
      const px = unit === 'px' ? Math.round(num) : mmToPx(num);
      setTargetWidth(px);
    }
  };

  const handleHeightChange = (value: string) => {
    setDisplayHeight(value);
    const num = parseFloat(value);
    if (!isNaN(num) && num > 0) {
      const px = unit === 'px' ? Math.round(num) : mmToPx(num);
      setTargetHeight(px);
    }
  };

  return {
    displayWidth,
    displayHeight,
    handleWidthChange,
    handleHeightChange,
  };
};
