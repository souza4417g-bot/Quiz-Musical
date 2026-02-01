
import React from 'react';
import { Theme } from '../types';

interface LoadingScreenProps {
  loadingProgress: number;
  loadingText: string;
  activeTheme: Theme;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ loadingProgress, loadingText, activeTheme }) => {
  return (
    <div className="space-y-8 py-12">
      <div className="text-8xl animate-bounce inline-block">🎧</div>
      <div className="w-full bg-slate-100 rounded-full h-6 overflow-hidden border border-slate-200 p-1 shadow-inner">
        <div className={`h-full rounded-full transition-all duration-300 ${activeTheme.buttonGradient}`} style={{ width: `${loadingProgress}%` }}></div>
      </div>
      <div className="space-y-2">
         <p className="text-slate-400 font-black text-2xl animate-pulse">{loadingProgress}%</p>
         <p className="text-slate-500 text-sm font-bold">{loadingText}</p>
      </div>
    </div>
  );
};
