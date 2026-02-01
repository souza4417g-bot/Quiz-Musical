
import React from 'react';
import { Theme } from '../types';

interface VolumeControlProps {
  volume: number;
  setVolume: (vol: number) => void;
  activeTheme: Theme;
}

export const VolumeControl: React.FC<VolumeControlProps> = ({ volume, setVolume, activeTheme }) => {
  return (
    <div className="fixed top-4 right-4 z-50 group bg-white/50 hover:bg-white p-2 rounded-full shadow-md transition-all flex items-center gap-2">
      <span className="text-xl">🔊</span>
      <input 
        type="range" 
        min="0" 
        max="1" 
        step="0.1" 
        value={volume} 
        onChange={(e) => setVolume(parseFloat(e.target.value))} 
        className={`w-0 group-hover:w-24 transition-all duration-300 h-2 rounded-lg cursor-pointer ${activeTheme.accentColor}`}
      />
    </div>
  );
};
