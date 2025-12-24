import React, { useState } from 'react';
import { Header } from './components/Header';
import { UploadZone } from './components/UploadZone';
import { Controls } from './components/Controls';
import { ZoetropePlayer } from './components/ZoetropePlayer';
import { EducationTip } from './components/EducationTip';
import { ZoetropeSettings, Orientation, ImageState } from './types';

const App: React.FC = () => {
  const [imageState, setImageState] = useState<ImageState | null>(null);
  
  // Default settings
  const [settings, setSettings] = useState<ZoetropeSettings>({
    frameCount: 12,
    fps: 12,
    orientation: Orientation.VERTICAL,
  });

  const handleImageSelected = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const width = img.width;
        const height = img.height;
        
        // Detecció robusta de l'orientació basada en les dimensions de la imatge
        let newOrientation = settings.orientation;
        
        // Si l'alçada és més del doble que l'amplada, és clarament una tira vertical
        if (height > 2 * width) {
            newOrientation = Orientation.VERTICAL;
        } 
        // Si l'amplada és més del doble que l'alçada, és clarament una tira horitzontal
        else if (width > 2 * height) {
            newOrientation = Orientation.HORIZONTAL;
        }
        // Si no compleix cap de les condicions (p.ex. quadrat), mantenim l'orientació anterior

        setSettings(prev => ({ ...prev, orientation: newOrientation }));
        setImageState({
          src: result,
          width: width,
          height: height,
        });
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  };

  const updateSettings = (newSettings: Partial<ZoetropeSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const handleReset = () => {
    setImageState(null);
  };

  return (
    <div className="min-h-screen pb-20 px-4 md:px-8 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]">
      <div className="max-w-6xl mx-auto">
        <Header />

        <main className="transition-all duration-500 ease-in-out">
          {!imageState ? (
            <div className="animate-fade-in-up">
              <UploadZone onImageSelected={handleImageSelected} />
              
              {/* Example/Instructional placeholder if needed */}
              <div className="mt-12 text-center">
                 <p className="text-slate-600 text-sm">
                   Ideal per a classes de plàstica i tecnologia.
                 </p>
              </div>
            </div>
          ) : (
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
      <footer className="fixed bottom-0 left-0 w-full py-2 bg-slate-950/80 backdrop-blur-sm border-t border-slate-800 text-center text-slate-600 text-xs">
        <p>Creat per a l'aprenentatge híbrid • Art i Tecnologia</p>
      </footer>
    </div>
  );
};

export default App;