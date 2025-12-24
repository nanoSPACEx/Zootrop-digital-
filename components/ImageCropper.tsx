import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { Check, X, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';
import { Area } from 'react-easy-crop/types';

interface ImageCropperProps {
  imageSrc: string;
  onCropComplete: (croppedImageSrc: string) => void;
  onCancel: () => void;
}

export const ImageCropper: React.FC<ImageCropperProps> = ({ imageSrc, onCropComplete, onCancel }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropChange = (crop: { x: number; y: number }) => {
    setCrop(crop);
  };

  const onCropCompleteHandler = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', (error) => reject(error));
      image.src = url;
    });

  const getCroppedImg = async (
    imageSrc: string,
    pixelCrop: Area,
    rotation = 0
  ): Promise<string> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      return '';
    }

    const maxSize = Math.max(image.width, image.height);
    const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

    // set each dimensions to double largest dimension to allow for a safe area for the
    // image to rotate in without being clipped by canvas context
    canvas.width = safeArea;
    canvas.height = safeArea;

    // translate canvas context to a central location on image to allow rotating around the center.
    ctx.translate(safeArea / 2, safeArea / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.translate(-safeArea / 2, -safeArea / 2);

    // draw rotated image and store data.
    ctx.drawImage(
      image,
      safeArea / 2 - image.width * 0.5,
      safeArea / 2 - image.height * 0.5
    );

    const data = ctx.getImageData(0, 0, safeArea, safeArea);

    // set canvas width to final desired crop size - this will clear existing context
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    // paste generated rotate image with correct offsets for x,y crop values.
    ctx.putImageData(
      data,
      Math.round(0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x),
      Math.round(0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y)
    );

    return canvas.toDataURL('image/jpeg');
  };

  const handleConfirm = async () => {
    if (croppedAreaPixels) {
      try {
        const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels, rotation);
        onCropComplete(croppedImage);
      } catch (e) {
        console.error(e);
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full animate-fade-in">
      <div className="w-full max-w-4xl mx-auto space-y-4">
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-1 shadow-2xl relative h-[60vh] overflow-hidden">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={undefined} // Free aspect ratio
            onCropChange={onCropChange}
            onCropComplete={onCropCompleteHandler}
            onZoomChange={setZoom}
            onRotationChange={setRotation}
          />
        </div>

        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-4 w-full md:w-auto">
             <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-mono">ZOOM</span>
                <input
                  type="range"
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  aria-labelledby="Zoom"
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-24 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
             </div>
             <button 
                onClick={() => setRotation((r) => r + 90)}
                className="p-2 hover:bg-slate-800 rounded text-slate-300"
                title="Girar 90º"
             >
                <RotateCw className="w-5 h-5" />
             </button>
          </div>

          <div className="text-center text-slate-400 text-sm hidden md:block">
            Retalla només la tira de paper. Elimina el fons.
          </div>

          <div className="flex gap-3 w-full md:w-auto justify-end">
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium border border-slate-700 flex items-center gap-2"
            >
              <X className="w-4 h-4" /> Cancel·lar
            </button>
            <button
              onClick={handleConfirm}
              className="px-6 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-[0_0_15px_rgba(79,70,229,0.3)] flex items-center gap-2"
            >
              <Check className="w-4 h-4" /> Confirmar Retall
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};