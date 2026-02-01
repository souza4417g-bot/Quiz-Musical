
import React from 'react';
import { Theme, User, GameScreen } from '../types';
import { THEMES } from '../constants';

interface ThemesScreenProps {
  currentUser: User | null;
  activeTheme: Theme;
  handleThemeSelect: (theme: Theme) => void;
  setScreen: (screen: GameScreen) => void;
}

export const ThemesScreen: React.FC<ThemesScreenProps> = ({
  currentUser, activeTheme, handleThemeSelect, setScreen
}) => {
  return (
    <div className="space-y-6 animate-in slide-in-from-right duration-500">
       <div className="flex items-center justify-between">
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Prêmios & Temas</h2>
          <span className="text-xs bg-slate-100 px-3 py-1 rounded-full font-bold text-slate-500">Nível {currentUser?.level || 1}</span>
       </div>
       
       <div className="grid grid-cols-1 gap-4 max-h-[60vh] overflow-y-auto px-2 py-1 scrollbar-hide">
         {THEMES.map(theme => {
           const isLocked = (currentUser?.level || 1) < theme.minLevel;
           const isActive = activeTheme.id === theme.id;
           
           return (
             <button
              key={theme.id}
              onClick={() => handleThemeSelect(theme)}
              disabled={isActive}
              className={`relative w-full p-4 rounded-3xl border-2 transition-all text-left group overflow-hidden ${isActive ? 'border-emerald-500 bg-emerald-50' : 'border-slate-100 bg-white hover:border-slate-300'}`}
             >
               {/* Preview Background */}
               <div className={`absolute inset-0 opacity-10 ${theme.background}`}></div>
               
               <div className="relative z-10 flex items-center justify-between">
                 <div className="flex items-center gap-4">
                   <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm ${isActive ? 'bg-white' : 'bg-slate-100'}`}>
                     {theme.emoji}
                   </div>
                   <div>
                     <h3 className={`font-black text-lg ${isActive ? 'text-emerald-700' : 'text-slate-800'}`}>{theme.name}</h3>
                     {isLocked ? (
                       <p className="text-xs font-bold text-red-500">Desbloqueia no Nível {theme.minLevel}</p>
                     ) : (
                       <p className="text-xs font-bold text-slate-400">{isActive ? 'Tema Atual' : 'Toque para usar'}</p>
                     )}
                   </div>
                 </div>
                 
                 {isLocked && <span className="text-2xl grayscale opacity-50">🔒</span>}
                 {!isLocked && isActive && <span className="text-2xl text-emerald-500">✅</span>}
               </div>
             </button>
           )
         })}
       </div>
       
       <button onClick={() => setScreen('welcome')} className="text-slate-500 font-bold hover:text-pink-600 transition-colors py-3 uppercase tracking-widest text-xs">← Voltar</button>
    </div>
  );
};
