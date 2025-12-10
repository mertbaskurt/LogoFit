import React, { useRef, useEffect, useCallback, useState } from 'react';
import { Button } from './Button';
import { Dimensions, ImageState } from '../types';
import { Download, RefreshCw, Check } from 'lucide-react';

interface LogoProcessorProps {
  imageState: ImageState;
  onClear: () => void;
  targetDimensions: Dimensions;
}

export const LogoProcessor: React.FC<LogoProcessorProps> = ({ imageState, onClear, targetDimensions }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCentered, setIsCentered] = useState(false);

  // Helper to draw placeholder
  const drawPlaceholder = useCallback((ctx: CanvasRenderingContext2D) => {
    // Clear the canvas fully first
    ctx.clearRect(0, 0, targetDimensions.width, targetDimensions.height);
    
    // Draw text only if the canvas is large enough to be legible
    if (targetDimensions.width > 100 && targetDimensions.height > 50) {
      ctx.fillStyle = '#94a3b8'; // slate-400
      ctx.font = '500 14px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${targetDimensions.width} × ${targetDimensions.height}`, targetDimensions.width / 2, targetDimensions.height / 2);
    }
  }, [targetDimensions]);

  // Function to center and fit the image
  const centerImage = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imageState.element;

    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, targetDimensions.width, targetDimensions.height);

    // 1. Compute scale factor (Fit Contain)
    const scaleX = targetDimensions.width / img.width;
    const scaleY = targetDimensions.height / img.height;
    const scale = Math.min(scaleX, scaleY);

    // 2. Compute new image dimensions
    const newWidth = img.width * scale;
    const newHeight = img.height * scale;

    // 3. Compute centering offsets
    const offsetX = (targetDimensions.width - newWidth) / 2;
    const offsetY = (targetDimensions.height - newHeight) / 2;

    // 4. Draw
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    ctx.drawImage(img, offsetX, offsetY, newWidth, newHeight);
    
    setIsCentered(true);
  }, [imageState.element, targetDimensions]);

  // Reset/Draw when image changes or dimensions change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
         drawPlaceholder(ctx);
         setIsCentered(false);
      }
    }
  }, [imageState.element, targetDimensions, drawPlaceholder]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const link = document.createElement('a');
    link.download = `centered-${targetDimensions.width}x${targetDimensions.height}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="flex flex-col items-center w-full mx-auto gap-8 animate-in fade-in zoom-in-95 duration-300">
      
      {/* Canvas Container */}
      <div className="relative group max-w-full overflow-hidden p-6 rounded-2xl bg-slate-100/50 border border-slate-200 flex justify-center">
        {/* Shadow wrapper for the canvas itself */}
        <div className="relative bg-white shadow-lg shadow-slate-200/50 border border-slate-100 w-fit max-w-full overflow-hidden transition-all duration-300">
           
           {/* The Canvas with CSS Checkered Pattern */}
           <canvas
            ref={canvasRef}
            width={targetDimensions.width}
            height={targetDimensions.height}
            className="block"
            style={{ 
              maxWidth: '100%',
              height: 'auto',
              aspectRatio: `${targetDimensions.width} / ${targetDimensions.height}`,
              backgroundImage: `
                linear-gradient(45deg, #f8fafc 25%, transparent 25%), 
                linear-gradient(-45deg, #f8fafc 25%, transparent 25%), 
                linear-gradient(45deg, transparent 75%, #f8fafc 75%), 
                linear-gradient(-45deg, transparent 75%, #f8fafc 75%)
              `,
              backgroundSize: '20px 20px',
              backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
            }}
          />
        </div>
        
        {/* Overlay indicator for state */}
        {!isCentered && (
            <div className="absolute top-4 right-4 bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider border border-amber-200 shadow-sm">
                Preview
            </div>
        )}
        {isCentered && (
            <div className="absolute top-4 right-4 bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider border border-emerald-200 shadow-sm flex items-center gap-1">
                <Check className="w-3 h-3" /> Centered
            </div>
        )}
      </div>

      {/* Controls */}
      <div className="w-full max-w-lg space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            onClick={centerImage} 
            fullWidth 
            className="flex items-center gap-2"
            title="Automatically scale and center the image to fit the target dimensions"
          >
            <RefreshCw className={`w-4 h-4 ${!isCentered ? '' : 'text-slate-300'}`} />
            {isCentered ? 'Re-center' : 'Ortala (Center)'}
          </Button>
          
          <Button 
            variant="secondary" 
            onClick={handleDownload} 
            disabled={!isCentered}
            fullWidth
            className="flex items-center gap-2"
            title="Download the centered image"
          >
            <Download className="w-4 h-4" />
            Download
          </Button>
        </div>

        <p className="text-xs text-center text-slate-400 font-mono">
          {targetDimensions.width}px × {targetDimensions.height}px
        </p>
      </div>
    </div>
  );
};