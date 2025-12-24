import React from 'react';
import { Lightbulb } from 'lucide-react';

export const EducationTip: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto mt-12 p-6 bg-slate-900/50 rounded-xl border border-slate-800/50">
      <div className="flex items-start gap-4">
        <div className="p-2 bg-amber-500/10 rounded-lg shrink-0">
          <Lightbulb className="w-6 h-6 text-amber-400" />
        </div>
        <div className="space-y-2">
          <h4 className="font-bold text-slate-200 text-lg">Sabies què?</h4>
          <p className="text-slate-400 text-sm leading-relaxed">
            Aquesta aplicació funciona gràcies a la <strong className="text-indigo-400">persistència retinal</strong>. 
            L'ull humà reté una imatge durant una fracció de segon després que aquesta desaparegui. 
            Si passem els dibuixos prou ràpid (més de 10-12 per segon), el cervell els "uneix" i crea la il·lusió de moviment continu.
          </p>
          <div className="pt-2 text-xs text-slate-500 font-mono">
            Repte: Baixa la velocitat a 4 FPS. Veus les imatges per separat? Ara puja a 24 FPS. Com canvia?
          </div>
        </div>
      </div>
    </div>
  );
};