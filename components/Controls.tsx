import React from 'react';
import { Settings2, ArrowDown, ArrowRight, Minus, Plus, Layers } from 'lucide-react';
import { Orientation, ZoetropeSettings } from '../types';

interface ControlsProps {
  settings: ZoetropeSettings;
  onUpdate: (newSettings: Partial<ZoetropeSettings>) => void;
}

export const Controls: React.FC<ControlsProps> = ({ settings, onUpdate }) => {
  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-xl w-full max-w-4xl mx-auto space-y-8">
      
      <div className="flex items-center gap-2 mb-2 pb-4 border-b border-slate-800">
        <Settings2 className="w-5 h-5 text-indigo-400" />
        <h3 className="font-bold text-lg text-slate-200">Configuració del Laboratori</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Frame Count Control */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-slate-400 uppercase tracking-wider">
            Fotogrames (Talls)
          </label>
          <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-lg border border-slate-800">
            <button
              onClick={() => onUpdate({ frameCount: Math.max(2, settings.frameCount - 1) })}
              className="p-2 hover:bg-slate-800 rounded-md text-slate-400 hover:text-white transition-colors"
              aria-label="Menys fotogrames"
            >
              <Minus className="w-4 h-4" />
            </button>
            <div className="flex-1 text-center">
              <span className="text-xl font-bold text-white font-mono">{settings.frameCount}</span>
            </div>
            <button
              onClick={() => onUpdate({ frameCount: Math.min(60, settings.frameCount + 1) })}
              className="p-2 hover:bg-slate-800 rounded-md text-slate-400 hover:text-white transition-colors"
              aria-label="Més fotogrames"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[10px] text-slate-500 leading-tight">
            Divisions de la tira
          </p>
        </div>

        {/* Strips Control */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1">
             <Layers className="w-3 h-3" /> Tires (Capes)
          </label>
          <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-lg border border-slate-800">
            <button
              onClick={() => onUpdate({ numStrips: Math.max(1, (settings.numStrips || 1) - 1) })}
              className="p-2 hover:bg-slate-800 rounded-md text-slate-400 hover:text-white transition-colors"
              aria-label="Menys tires"
            >
              <Minus className="w-4 h-4" />
            </button>
            <div className="flex-1 text-center">
              <span className="text-xl font-bold text-white font-mono">{settings.numStrips || 1}</span>
            </div>
            <button
              onClick={() => onUpdate({ numStrips: Math.min(5, (settings.numStrips || 1) + 1) })}
              className="p-2 hover:bg-slate-800 rounded-md text-slate-400 hover:text-white transition-colors"
              aria-label="Més tires"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[10px] text-slate-500 leading-tight">
            Tires superposades al full
          </p>
        </div>

        {/* FPS Control */}
        <div className="space-y-3">
          <div className="flex justify-between">
            <label className="text-sm font-medium text-slate-400 uppercase tracking-wider">
              Velocitat
            </label>
            <span className="text-xs font-mono text-indigo-400">{settings.fps} fps</span>
          </div>
          <div className="h-[42px] flex items-center bg-slate-950 px-3 rounded-lg border border-slate-800">
             <input
              type="range"
              min="1"
              max="24"
              step="1"
              value={settings.fps}
              onChange={(e) => onUpdate({ fps: parseInt(e.target.value) })}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>
          <p className="text-[10px] text-slate-500 leading-tight">
            Persistència retinal
          </p>
        </div>

        {/* Orientation Control */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-slate-400 uppercase tracking-wider">
            Orientació
          </label>
          <div className="grid grid-cols-2 gap-2 h-[42px]">
            <button
              onClick={() => onUpdate({ orientation: Orientation.VERTICAL })}
              className={`flex items-center justify-center gap-1 rounded-lg border text-xs font-medium transition-all ${
                settings.orientation === Orientation.VERTICAL
                  ? 'bg-indigo-600 border-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.3)]'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
              }`}
            >
              <ArrowDown className="w-3 h-3" /> Vertical
            </button>
            <button
              onClick={() => onUpdate({ orientation: Orientation.HORIZONTAL })}
              className={`flex items-center justify-center gap-1 rounded-lg border text-xs font-medium transition-all ${
                settings.orientation === Orientation.HORIZONTAL
                  ? 'bg-indigo-600 border-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.3)]'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
              }`}
            >
              <ArrowRight className="w-3 h-3" /> Horitzontal
            </button>
          </div>
           <p className="text-[10px] text-slate-500 leading-tight">
            Direcció dels dibuixos
          </p>
        </div>
      </div>
    </div>
  );
};