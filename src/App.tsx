import { useState, useRef, useCallback } from 'react';
import './App.css';
import ImageUploader from './components/ImageUploader';
import ImagePreview from './components/ImagePreview';
import ControlsPanel from './components/ControlsPanel';
import PrinterConnection from './components/PrinterConnection';
import { processImageData } from './utils/imageProcessing';
import { printService } from './services/printService';
import type { ProcessingOptions, ResizeMode, SizeUnit } from './types';

const App = () => {
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const [processedImageURL, setProcessedImageURL] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const [isPrinterConnected, setIsPrinterConnected] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [printError, setPrintError] = useState<string | null>(null);

  // Image processing parameters
  const [algorithm, setAlgorithm] = useState<ProcessingOptions['algorithm']>('floyd');
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [threshold, setThreshold] = useState(128);
  const [bayerSize, setBayerSize] = useState<ProcessingOptions['bayerSize']>(4);
  const [invert, setInvert] = useState(false);

  // Resize controls
  const [resizeMode, setResizeMode] = useState<ResizeMode>('original');
  const [targetWidth, setTargetWidth] = useState<number>(384); // px
  const [targetHeight, setTargetHeight] = useState<number>(384); // px
  const [unit, setUnit] = useState<SizeUnit>('px');

  const originalCanvasRef = useRef<HTMLCanvasElement>(null);
  const processedCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isCanvasReady, setIsCanvasReady] = useState(false);

  const handlePrint = useCallback(async () => {
    const procCanvas = processedCanvasRef.current;
    if (!procCanvas) {
      setPrintError('No processed image to print');
      return;
    }

    if (!isPrinterConnected) {
      setPrintError('Please connect a printer first');
      return;
    }

    setIsPrinting(true);
    setPrintError(null);

    try {
      await printService.printImage(procCanvas);
    } catch (error) {
      console.error('Print failed:', error);
      setPrintError(error instanceof Error ? error.message : 'Print failed');
    } finally {
      setIsPrinting(false);
    }
  }, [isPrinterConnected]);

  const handleImageLoaded = useCallback((img: HTMLImageElement) => {
    setOriginalImage(img);
    setProcessedImageURL(null);
    setIsCanvasReady(false);

    const canvas = originalCanvasRef.current;
    if (!canvas) {
      console.error('Original canvas ref is null during image load');
      return;
    }

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) {
      console.error('Failed to get canvas context');
      return;
    }

    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);

    try {
      ctx.getImageData(0, 0, 1, 1);
      setIsCanvasReady(true);
      console.log(`Image loaded and drawn: ${img.width}x${img.height}`);
    } catch (e) {
      console.error('Canvas drawing failed (possibly tainted):', e);
      alert('Could not read image data. The image may be from a different origin.');
    }
  }, []);

  const handleProcess = useCallback(() => {
    const origCanvas = originalCanvasRef.current;
    const procCanvas = processedCanvasRef.current;

    if (!origCanvas || !procCanvas) {
      alert('Canvas elements not found. Please try re-uploading the image.');
      return;
    }

    if (origCanvas.width === 0 || origCanvas.height === 0) {
      alert('Canvas has no dimensions. Please upload an image first.');
      return;
    }

    if (!isCanvasReady) {
      alert('Image not fully drawn yet. Please wait a moment and try again.');
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      try {
        const ctx = origCanvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) {
          throw new Error('Failed to get canvas context');
        }

        const imageData = ctx.getImageData(0, 0, origCanvas.width, origCanvas.height);

        const options: ProcessingOptions = {
          algorithm,
          brightness,
          contrast,
          threshold,
          bayerSize,
          invert,
          resizeMode,
          targetWidth,
          targetHeight,
        };

        const processedData = processImageData(imageData, options);

        procCanvas.width = processedData.width;
        procCanvas.height = processedData.height;
        const procCtx = procCanvas.getContext('2d');
        if (!procCtx) {
          throw new Error('Failed to get processed canvas context');
        }
        procCtx.putImageData(processedData, 0, 0);

        setProcessedImageURL(procCanvas.toDataURL('image/png'));
        console.log('Processing complete');
      } catch (error) {
        console.error('Processing error:', error);
        alert(`Failed to process image: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setIsProcessing(false);
      }
    }, 10);
  }, [
    algorithm,
    brightness,
    contrast,
    threshold,
    bayerSize,
    invert,
    resizeMode,
    targetWidth,
    targetHeight,
    isCanvasReady,
  ]);

  const handleDownload = () => {
    if (!processedImageURL) return;
    const link = document.createElement('a');
    link.download = `thermal-${algorithm}-${Date.now()}.png`;
    link.href = processedImageURL;
    link.click();
  };

  const handleReset = () => {
    setBrightness(0);
    setContrast(0);
    setThreshold(128);
    setAlgorithm('floyd');
    setBayerSize(4);
    setInvert(false);
    setResizeMode('original');
    setTargetWidth(384);
    setTargetHeight(384);
    setUnit('px');
    setProcessedImageURL(null);
  };

  return (
    <div className="app-container">
      <h1>
        Thermalizer
        <small>advanced dithering</small>
      </h1>
      <div className="subtitle">
        Convert images for crisp thermal prints — client‑side, no uploads
      </div>

      <ImageUploader onImageLoaded={handleImageLoaded} />
      <PrinterConnection onConnectionChange={setIsPrinterConnected} />

      <div className="main-panels">
        <ImagePreview
          title="📸 Original"
          canvasRef={originalCanvasRef}
          hasImage={!!originalImage}
          placeholder="Upload an image to start"
        />

        <ImagePreview
          title="🖤 Thermal preview"
          canvasRef={processedCanvasRef}
          hasImage={!!processedImageURL}
          placeholder={originalImage ? 'Click "Process" to convert' : 'Awaiting image'}
          showDimensions={originalImage ? { width: originalImage.width, height: originalImage.height } : null}
        />

        <ControlsPanel
          algorithm={algorithm}
          setAlgorithm={setAlgorithm}
          brightness={brightness}
          setBrightness={setBrightness}
          contrast={contrast}
          setContrast={setContrast}
          threshold={threshold}
          setThreshold={setThreshold}
          bayerSize={bayerSize}
          setBayerSize={setBayerSize}
          invert={invert}
          setInvert={setInvert}
          onReset={handleReset}
          onProcess={handleProcess}
          onDownload={handleDownload}
          isProcessing={isProcessing}
          downloadDisabled={!processedImageURL || isProcessing}
          processDisabled={!originalImage || isProcessing}
          isPrinterConnected={isPrinterConnected}
          isPrinting={isPrinting}
          onPrint={handlePrint}
          printError={printError}
          resizeMode={resizeMode}
          setResizeMode={setResizeMode}
          targetWidth={targetWidth}
          setTargetWidth={setTargetWidth}
          targetHeight={targetHeight}
          setTargetHeight={setTargetHeight}
          unit={unit}
          setUnit={setUnit}
        />
      </div>

      <div className="footer-note">
        Advanced analysis: luminance‑based grayscale, real‑time dithering, brightness/contrast pre‑processing. All in your browser.
      </div>
    </div>
  );
};

export default App;