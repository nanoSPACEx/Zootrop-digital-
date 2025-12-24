import React from 'react';
import { Film } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="text-center py-8 md:py-12 space-y-4">
      <div className="inline-flex items-center justify-center p-3 bg-indigo-500/10 rounded-2xl mb-2">
        <Film className="w-10 h-10 text-indigo-400" />
      </div>
      <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 tracking-tight">
        Zoòtrop Digital
      </h1>
      <p className="text-slate-400 max-w-lg mx-auto text-lg leading-relaxed">
        El laboratori per donar vida als teus dibuixos. 
        <span className="block text-sm mt-1 text-slate-500">Puja la teva tira i experimenta amb la velocitat.</span>
      </p>
    </header>
  );
};