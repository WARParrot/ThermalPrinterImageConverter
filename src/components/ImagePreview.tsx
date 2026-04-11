import './ImagePreview.css';
import type { ImagePreviewProps } from '../types';

const ImagePreview = ({
  title,
  canvasRef,
  hasImage,
  placeholder,
  showDimensions
}: ImagePreviewProps) => {
  return (
    <div className="image-panel">
      <div className="panel-title">
        <span>{title}</span>
        {hasImage && showDimensions && (
          <span className="badge">{showDimensions.width}×{showDimensions.height}</span>
        )}
      </div>
      <div className="canvas-wrapper">
        <canvas
          ref={canvasRef}
          style={{ maxWidth: '100%', display: hasImage ? 'block' : 'none' }}
        />
        {!hasImage && (
          <div className="placeholder-text">{placeholder}</div>
        )}
      </div>
    </div>
  );
};

export default ImagePreview;
