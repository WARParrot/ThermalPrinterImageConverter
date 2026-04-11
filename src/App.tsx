import { useState, useRef, useCallback } from 'react';
import './App.css';
import ImageUploader from './components/ImageUploader';
import ImagePreview from './components/ImagePreview';
import ControlsPanel from './components/ControlsPanel';
import { processImageData } from './utils/imageProcessing';
import type { ProcessingOptions } from './types';

const App = () => {
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const [processedImageURL, setProcessedImageURL] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const [algorithm, setAlgorithm] = useState<ProcessingOptions['algorithm']>('floyd');
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [threshold, setThreshold] = useState(128);
  const [bayerSize, setBayerSize] = useState<ProcessingOptions['bayerSize']>(4);
  const [invert, setInvert] = useState(false);

  const originalCanvasRef = useRef<HTMLCanvasElement>(null);
  const processedCanvasRef = useRef<HTMLCanvasElement>(null);

  // Flag to track if original canvas is ready (drawn with image)
  const [isCanvasReady, setIsCanvasReady] = useState(false);

  const handleImageLoaded = useCallback((img: HTMLImageElement) => {
    setOriginalImage(img);
    setProcessedImageURL(null);
    setIsCanvasReady(false); // Reset until drawn

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

    // Set canvas dimensions and draw image
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);

    // Verify drawing succeeded
    try {
      // Quick check: read a pixel to ensure canvas is not tainted
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

    console.log('Process clicked. origCanvas:', origCanvas, 'procCanvas:', procCanvas, 'isCanvasReady:', isCanvasReady);

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
        console.log('Image data obtained:', imageData.width, imageData.height);

        const options: ProcessingOptions = {
          algorithm,
          brightness,
          contrast,
          threshold,
          bayerSize,
          invert
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
  }, [algorithm, brightness, contrast, threshold, bayerSize, invert, isCanvasReady]);

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
    setProcessedImageURL(null);
  };

  return (
    <div className="app-container">
      <h1>
        🖨️ Thermalizer
        <small>advanced dithering</small>
      </h1>
      <div className="subtitle">
        Convert images for crisp thermal prints — client‑side, no uploads
      </div>

      <ImageUploader onImageLoaded={handleImageLoaded} />

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
        />
      </div>

      <div className="footer-note">
        Advanced analysis: luminance‑based grayscale, real‑time dithering, brightness/contrast pre‑processing. All in your browser.
      </div>
    </div>
  );
};

export default App;
