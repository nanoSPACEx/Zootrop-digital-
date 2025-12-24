import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, RefreshCw, ZoomIn, ZoomOut, RotateCw, RotateCcw, Maximize, Download } from 'lucide-react';
import { ZoetropeSettings, ImageState, Orientation } from '../types';
import { GIFEncoder, quantize, applyPalette } from 'gifenc';

interface ZoetropePlayerProps {
  imageState: ImageState;
  settings: ZoetropeSettings;
  onReset: () => void;
}

export const ZoetropePlayer: React.FC<ZoetropePlayerProps> = ({
  imageState,
  settings,
  onReset,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imgElementRef = useRef<HTMLImageElement | null>(null);

  // Animation State
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isExporting, setIsExporting] = useState(false);

  // Viewport State (Zoom, Pan, Rotate)
  const [viewState, setViewState] = useState({
    scale: 1,
    rotation: 0,
    x: 0,
    y: 0,
  });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const lastTouchRef = useRef<number>(0); // For pinch detection

  // Initialize Image Element
  useEffect(() => {
    const img = new Image();
    img.src = imageState.src;
    img.onload = () => {
      imgElementRef.current = img;
    };
  }, [imageState.src]);

  // Animation Loop
  useEffect(() => {
    if (!isPlaying) return;
    const intervalId = setInterval(() => {
      setCurrentFrame((prev) => (prev + 1) % settings.frameCount);
    }, 1000 / settings.fps);
    return () => clearInterval(intervalId);
  }, [isPlaying, settings.fps, settings.frameCount]);

  // Helper to draw a specific frame to a context, supporting multiple strips
  const drawFrameToContext = (
    ctx: CanvasRenderingContext2D, 
    img: HTMLImageElement, 
    frameIndex: number,
    targetWidth: number,
    targetHeight: number
  ) => {
    const numStrips = settings.numStrips || 1;
    ctx.clearRect(0, 0, targetWidth, targetHeight);

    // Loop through each strip to compose the frame
    for (let s = 0; s < numStrips; s++) {
      let sourceX, sourceY, sourceW, sourceH;
      let destX, destY, destW, destH;

      if (settings.orientation === Orientation.VERTICAL) {
        // Vertical Strip (Tall image):
        // Image is split vertically into columns (strips).
        // Each column is split vertically into frames.
        
        const stripTotalWidth = img.width / numStrips;
        const frameHeight = img.height / settings.frameCount;

        // Source: Logic for picking the frame from the specific strip column
        sourceX = s * stripTotalWidth;
        sourceY = frameIndex * frameHeight;
        sourceW = stripTotalWidth;
        sourceH = frameHeight;

        // Destination: Logic for placing the strip in the final canvas
        // If multiple strips, they are placed side-by-side in the output
        destX = (s * targetWidth) / numStrips;
        destY = 0;
        destW = targetWidth / numStrips;
        destH = targetHeight;

      } else {
        // Horizontal Strip (Wide image):
        // Image is split horizontally into rows (strips).
        // Each row is split horizontally into frames.
        
        const stripTotalHeight = img.height / numStrips;
        const frameWidth = img.width / settings.frameCount;

        // Source
        sourceX = frameIndex * frameWidth;
        sourceY = s * stripTotalHeight;
        sourceW = frameWidth;
        sourceH = stripTotalHeight;

        // Destination
        // If multiple strips, they are placed stacked top-to-bottom in the output
        destX = 0;
        destY = (s * targetHeight) / numStrips;
        destW = targetWidth;
        destH = targetHeight / numStrips;
      }

      ctx.drawImage(
        img,
        sourceX,
        sourceY,
        sourceW,
        sourceH,
        destX,
        destY,
        destW,
        destH
      );
    }
  };

  // Draw Frame to Screen
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const img = imgElementRef.current;
    
    if (!canvas || !ctx || !img) return;

    // Calculate dimensions of the VIEWPORT (the single composed frame)
    let viewWidth, viewHeight;

    if (settings.orientation === Orientation.VERTICAL) {
        // View Width = Full image width (all strips side-by-side)
        // View Height = Height of a single frame
        viewWidth = img.width; 
        viewHeight = img.height / settings.frameCount;
    } else {
        // View Width = Width of a single frame
        // View Height = Full image height (all strips stacked)
        viewWidth = img.width / settings.frameCount;
        viewHeight = img.height;
    }

    canvas.width = viewWidth;
    canvas.height = viewHeight;

    drawFrameToContext(ctx, img, currentFrame, viewWidth, viewHeight);

  }, [currentFrame, imageState, settings]);

  // --- GIF Export Logic ---
  const handleExportGif = async () => {
    const img = imgElementRef.current;
    if (!img || isExporting) return;

    setIsExporting(true);
    setIsPlaying(false);

    try {
      // Create encoder
      const encoder = new GIFEncoder();
      
      // Determine dimensions
      let width, height;
      if (settings.orientation === Orientation.VERTICAL) {
        width = img.width;
        height = img.height / settings.frameCount;
      } else {
        width = img.width / settings.frameCount;
        height = img.height;
      }
      
      // Limit resolution for GIF performance/size if huge
      const MAX_DIM = 500;
      let scale = 1;
      if (width > MAX_DIM || height > MAX_DIM) {
        scale = Math.min(MAX_DIM / width, MAX_DIM / height);
        width = Math.round(width * scale);
        height = Math.round(height * scale);
      }

      // Create a temp canvas
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      
      if (!ctx) throw new Error("Could not create canvas context");

      // Loop through all frames
      const delay = 1000 / settings.fps;
      
      for (let i = 0; i < settings.frameCount; i++) {
        // Draw frame to temp canvas
        drawFrameToContext(ctx, img, i, width, height);
        
        // Get image data
        const { data } = ctx.getImageData(0, 0, width, height);
        
        // Quantize colors (gifenc requires this)
        const palette = quantize(data, 256);
        const index = applyPalette(data, palette);
        
        // Add frame
        encoder.writeFrame(index, width, height, { palette, delay });
        
        // Allow UI to update
        await new Promise(r => setTimeout(r, 0));
      }

      encoder.finish();
      const buffer = encoder.bytes();
      
      // Download
      const blob = new Blob([buffer], { type: 'image/gif' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `zootrop_${Date.now()}.gif`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (e) {
      console.error("Error creating GIF", e);
      alert("Error creant el GIF.");
    } finally {
      setIsExporting(false);
      setIsPlaying(true);
    }
  };


  // --- Viewport Interaction Handlers ---

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Shift + Wheel = Rotate
    if (e.shiftKey) {
      const delta = Math.sign(e.deltaY) * 5;
      setViewState(prev => ({ ...prev, rotation: prev.rotation + delta }));
      return;
    }

    // Normal Wheel = Zoom
    const scaleFactor = -e.deltaY * 0.001;
    setViewState(prev => ({
      ...prev,
      scale: Math.min(Math.max(0.1, prev.scale + scaleFactor), 5)
    }));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX - viewState.x, y: e.clientY - viewState.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setViewState(prev => ({
      ...prev,
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y
    }));
  };

  const handleMouseUp = () => setIsDragging(false);

  // Touch Handlers for Pinch Zoom & Pan
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      dragStartRef.current = { 
        x: e.touches[0].clientX - viewState.x, 
        y: e.touches[0].clientY - viewState.y 
      };
    } else if (e.touches.length === 2) {
      // Pinch start
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      lastTouchRef.current = dist;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault(); // Prevent scrolling page
    if (e.touches.length === 1 && isDragging) {
      setViewState(prev => ({
        ...prev,
        x: e.touches[0].clientX - dragStartRef.current.x,
        y: e.touches[0].clientY - dragStartRef.current.y
      }));
    } else if (e.touches.length === 2) {
      // Pinch move
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const delta = dist - lastTouchRef.current;
      const zoomSpeed = 0.005;
      
      setViewState(prev => ({
        ...prev,
        scale: Math.min(Math.max(0.1, prev.scale + (delta * zoomSpeed)), 5)
      }));
      lastTouchRef.current = dist;
    }
  };

  const handleTouchEnd = () => setIsDragging(false);

  // Helper controls
  const rotateView = (deg: number) => {
    setViewState(prev => ({ ...prev, rotation: prev.rotation + deg }));
  };
  
  const resetView = () => {
    setViewState({ scale: 1, rotation: 0, x: 0, y: 0 });
  };

  const zoomView = (delta: number) => {
    setViewState(prev => ({ 
      ...prev, 
      scale: Math.min(Math.max(0.1, prev.scale + delta), 5) 
    }));
  };

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto animate-fade-in">
      
      {/* Stage Container */}
      <div 
        className="relative w-full aspect-square md:aspect-video bg-black rounded-2xl border-4 border-slate-800 shadow-2xl overflow-hidden flex items-center justify-center mb-6 ring-1 ring-slate-700/50 cursor-move group"
        ref={containerRef}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Background Grid for better spatial awareness when panning */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
        </div>

        {/* The Animated Canvas with CSS Transform */}
        <canvas
          ref={canvasRef}
          className="max-w-none origin-center transition-transform duration-75 ease-out filter drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]"
          style={{
            transform: `translate(${viewState.x}px, ${viewState.y}px) scale(${viewState.scale}) rotate(${viewState.rotation}deg)`
          }}
        />

        {/* Overlay for Exporting */}
        {isExporting && (
            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-20">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500 mb-2"></div>
                <span className="text-white font-medium">Generant GIF...</span>
            </div>
        )}

        {/* Floating Toolbar (Moved inside for better UX) */}
        <div 
            className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1 p-1.5 rounded-full bg-slate-900/80 backdrop-blur border border-white/10 shadow-lg z-20 transition-opacity duration-300 opacity-0 group-hover:opacity-100"
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
        >
          <button onClick={() => zoomView(-0.1)} className="p-2 hover:bg-white/10 rounded-full text-slate-300 hover:text-white transition-colors" title="Allunyar">
            <ZoomOut className="w-4 h-4" />
          </button>
          <button onClick={resetView} className="p-2 hover:bg-white/10 rounded-full text-slate-300 hover:text-white transition-colors" title="Restablir Vista">
            <Maximize className="w-4 h-4" />
          </button>
          <button onClick={() => zoomView(0.1)} className="p-2 hover:bg-white/10 rounded-full text-slate-300 hover:text-white transition-colors" title="Apropar">
            <ZoomIn className="w-4 h-4" />
          </button>
          <div className="w-px h-4 bg-white/20 mx-1"></div>
          <button onClick={() => rotateView(-90)} className="p-2 hover:bg-white/10 rounded-full text-slate-300 hover:text-white transition-colors" title="Girar Esquerra">
            <RotateCcw className="w-4 h-4" />
          </button>
          <button onClick={() => rotateView(90)} className="p-2 hover:bg-white/10 rounded-full text-slate-300 hover:text-white transition-colors" title="Girar Dreta">
            <RotateCw className="w-4 h-4" />
          </button>
        </div>

        {/* Frame Counter Badge */}
        <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-xs font-mono text-slate-400 pointer-events-none select-none z-10">
          FRAME: {currentFrame + 1}/{settings.frameCount}
        </div>
      </div>

      {/* Playback Controls */}
      <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          disabled={isExporting}
          className={`flex items-center gap-2 px-8 py-3 rounded-full font-bold text-lg transition-all transform hover:scale-105 active:scale-95 ${
            isPlaying
              ? 'bg-amber-500 hover:bg-amber-400 text-amber-950 shadow-[0_0_20px_rgba(245,158,11,0.3)]'
              : 'bg-emerald-500 hover:bg-emerald-400 text-emerald-950 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
          }`}
        >
          {isPlaying ? (
            <>
              <Pause className="fill-current" /> Pausa
            </>
          ) : (
            <>
              <Play className="fill-current" /> Reproduir
            </>
          )}
        </button>

        <button
          onClick={handleExportGif}
          disabled={isExporting}
          className="flex items-center gap-2 px-6 py-3 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium border border-indigo-500 shadow-[0_0_15px_rgba(79,70,229,0.2)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="w-5 h-5" />
          GIF
        </button>

        <button
          onClick={onReset}
          disabled={isExporting}
          className="flex items-center gap-2 px-6 py-3 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium border border-slate-700 transition-colors"
        >
          <RefreshCw className="w-5 h-5" />
          Nova Tira
        </button>
      </div>
    </div>
  );
};