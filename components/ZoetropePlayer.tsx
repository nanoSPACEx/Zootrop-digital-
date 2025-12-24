import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, RefreshCw } from 'lucide-react';
import { ZoetropeSettings, ImageState, Orientation } from '../types';

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
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentFrame, setCurrentFrame] = useState(0);
  
  // Ref for the source image element
  const imgElementRef = useRef<HTMLImageElement | null>(null);

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

  // Draw Frame
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const img = imgElementRef.current;

    if (!canvas || !ctx || !img || !containerRef.current) return;

    // Determine slice dimensions based on source image and settings
    let sourceX, sourceY, sliceWidth, sliceHeight;

    if (settings.orientation === Orientation.VERTICAL) {
      // Vertical Strip: Height is divided by frames
      sliceWidth = img.width;
      sliceHeight = img.height / settings.frameCount;
      sourceX = 0;
      sourceY = currentFrame * sliceHeight;
    } else {
      // Horizontal Strip: Width is divided by frames
      sliceWidth = img.width / settings.frameCount;
      sliceHeight = img.height;
      sourceX = currentFrame * sliceWidth;
      sourceY = 0;
    }

    // Set canvas internal resolution to match the slice high quality
    canvas.width = sliceWidth;
    canvas.height = sliceHeight;

    // Clear and Draw
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw the specific slice
    // drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
    ctx.drawImage(
      img,
      sourceX,
      sourceY,
      sliceWidth,
      sliceHeight,
      0,
      0,
      canvas.width,
      canvas.height
    );

  }, [currentFrame, imageState, settings]);

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto animate-fade-in">
      {/* Stage Container */}
      <div 
        className="relative w-full aspect-square md:aspect-video bg-black rounded-2xl border-4 border-slate-800 shadow-2xl overflow-hidden flex items-center justify-center mb-6 ring-1 ring-slate-700/50"
        ref={containerRef}
      >
        {/* The Animated Canvas */}
        <canvas
          ref={canvasRef}
          className="max-w-full max-h-full object-contain filter drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]"
        />

        {/* Frame Counter Badge */}
        <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-xs font-mono text-slate-400">
          FRAME: {currentFrame + 1}/{settings.frameCount}
        </div>
      </div>

      {/* Playback Controls */}
      <div className="flex gap-4 mb-8">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
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
          onClick={onReset}
          className="flex items-center gap-2 px-6 py-3 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium border border-slate-700 transition-colors"
        >
          <RefreshCw className="w-5 h-5" />
          Nova Tira
        </button>
      </div>
    </div>
  );
};