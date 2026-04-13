export type ResizeMode = 'original' | 'fitWidth' | 'fitHeight' | 'exact';
export type SizeUnit = 'px' | 'mm';

export interface ProcessingOptions {
  algorithm: 'floyd' | 'atkinson' | 'ordered' | 'threshold';
  brightness: number;
  contrast: number;
  threshold: number;
  bayerSize: 2 | 4 | 8;
  invert: boolean;
  resizeMode: ResizeMode;
  targetWidth: number; // always stored in pixels
  targetHeight: number; // always stored in pixels
}

export interface ImageUploaderProps {
  onImageLoaded: (img: HTMLImageElement) => void;
}

export interface ImagePreviewProps {
  title: string;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  hasImage: boolean;
  placeholder: string;
  showDimensions?: { width: number; height: number } | null;
}

export interface ControlsPanelProps {
  algorithm: ProcessingOptions['algorithm'];
  setAlgorithm: (value: ProcessingOptions['algorithm']) => void;
  brightness: number;
  setBrightness: (value: number) => void;
  contrast: number;
  setContrast: (value: number) => void;
  threshold: number;
  setThreshold: (value: number) => void;
  bayerSize: ProcessingOptions['bayerSize'];
  setBayerSize: (value: ProcessingOptions['bayerSize']) => void;
  invert: boolean;
  setInvert: (value: boolean) => void;
  onReset: () => void;
  onProcess: () => void;
  onDownload: () => void;
  isProcessing: boolean;
  downloadDisabled: boolean;
  processDisabled: boolean;
  // Print props
  isPrinterConnected: boolean;
  isPrinting: boolean;
  onPrint: () => void;
  printError: string | null;
  // Resize props
  resizeMode: ResizeMode;
  setResizeMode: (value: ResizeMode) => void;
  targetWidth: number;
  setTargetWidth: (value: number) => void;
  targetHeight: number;
  setTargetHeight: (value: number) => void;
  unit: SizeUnit;
  setUnit: (value: SizeUnit) => void;
}
