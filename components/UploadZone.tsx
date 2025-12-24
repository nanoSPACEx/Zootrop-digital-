import React, { useCallback } from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';

interface UploadZoneProps {
  onImageSelected: (file: File) => void;
}

export const UploadZone: React.FC<UploadZoneProps> = ({ onImageSelected }) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      onImageSelected(event.target.files[0]);
    }
  };

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      if (event.dataTransfer.files && event.dataTransfer.files[0]) {
        onImageSelected(event.dataTransfer.files[0]);
      }
    },
    [onImageSelected]
  );

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      className="w-full max-w-2xl mx-auto"
    >
      <label
        htmlFor="file-upload"
        className="flex flex-col items-center justify-center w-full h-64 border-2 border-indigo-500/50 border-dashed rounded-2xl cursor-pointer bg-slate-900/50 hover:bg-slate-800/80 hover:border-indigo-400 transition-all duration-300 group"
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
          <div className="bg-indigo-500/10 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300">
            <Upload className="w-10 h-10 text-indigo-400" />
          </div>
          <p className="mb-2 text-xl font-semibold text-slate-200">
            Pujar la tira del zoòtrop
          </p>
          <p className="text-sm text-slate-400 mb-4 max-w-sm mx-auto">
            Fes una foto a la teva tira de paper i puja-la aquí. Assegura't que es vegi recta.
          </p>
          <div className="flex gap-2 text-xs text-slate-500 bg-slate-900 px-3 py-1 rounded-full border border-slate-700">
            <ImageIcon className="w-4 h-4" />
            <span>JPG, PNG acceptats</span>
          </div>
        </div>
        <input
          id="file-upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </label>
    </div>
  );
};