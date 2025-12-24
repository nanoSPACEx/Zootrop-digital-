import React, { useState } from 'react';
import { Header } from './components/Header';
import { UploadZone } from './components/UploadZone';
import { ImageCropper } from './components/ImageCropper';
import { Controls } from './components/Controls';
import { ZoetropePlayer } from './components/ZoetropePlayer';
import { EducationTip } from './components/EducationTip';
import { ZoetropeSettings, Orientation, ImageState } from './types';

enum AppMode {
  UPLOAD = 'UPLOAD',
  CROP = 'CROP',
  PLAY = 'PLAY'
}

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.UPLOAD);
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);
  const [imageState, setImageState] = useState<ImageState | null>(null);
  
  // Default settings
  const [settings, setSettings] = useState<ZoetropeSettings>({
    frameCount: 12,
    fps: 12,
    orientation: Orientation.VERTICAL,
    numStrips: 1, // Default to single strip
  });

  const handleImageSelected = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setRawImageSrc(result);
      setMode(AppMode.CROP);
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = (croppedImageSrc: string) => {
      const img = new Image();
      img.onload = () => {
        const width = img.width;
        const height = img.height;
        
        // Recalculate orientation based on the CROPPED image dimensions
        // Rules: 
        // 1. If height > 150% of width -> Vertical
        // 2. If width > 150% of height -> Horizontal
        // 3. Otherwise -> Keep current/default setting
        let newOrientation = settings.orientation;
        
        if (height > width * 1.5) {
            newOrientation = Orientation.VERTICAL;
        } 
        else if (width > height * 1.5) {
            newOrientation = Orientation.HORIZONTAL;
        }

        setSettings(prev => ({ ...prev, orientation: newOrientation }));
        setImageState({
          src: croppedImageSrc,
          width: width,
          height: height,
        });
        setMode(AppMode.PLAY);
      };
      img.src = croppedImageSrc;
  };

  const handleCancelCrop = () => {
    setRawImageSrc(null);
    setMode(AppMode.UPLOAD);
  };

  const updateSettings = (newSettings: Partial<ZoetropeSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const handleReset = () => {
    setImageState(null);
    setRawImageSrc(null);
    setMode(AppMode.UPLOAD);
  };

  return (
    <div className="min-h-screen pb-20 px-4 md:px-8 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]">
      <div className="max-w-6xl mx-auto">
        <Header />

        <main className="transition-all duration-500 ease-in-out">
          {mode === AppMode.UPLOAD && (
            <div className="animate-fade-in-up">
              <UploadZone onImageSelected={handleImageSelected} />
              
              <div className="mt-12 text-center">
                 <p className="text-slate-600 text-sm">
                   Ideal per a classes de plàstica i tecnologia.
                 </p>
              </div>
            </div>
          )}

          {mode === AppMode.CROP && rawImageSrc && (
             <ImageCropper 
                imageSrc={rawImageSrc} 
                onCropComplete={handleCropComplete} 
                onCancel={handleCancelCrop} 
             />
          )}

          {mode === AppMode.PLAY && imageState && (
            <div className="space-y-8 animate-fade-in">
              <ZoetropePlayer 
                imageState={imageState} 
                settings={settings}
                onReset={handleReset}
              />
              
              <Controls 
                settings={settings} 
                onUpdate={updateSettings} 
              />

              <EducationTip />
            </div>
          )}
        </main>
      </div>
      
      {/* Footer */}
      <footer className="fixed bottom-0 left-0 w-full py-2 bg-slate-950/80 backdrop-blur-sm border-t border-slate-800 text-center text-slate-600 text-xs z-30">
        <p>Creat per a l'aprenentatge híbrid • Art i Tecnologia</p>
      </footer>
    </div>
  );
};

export default App;