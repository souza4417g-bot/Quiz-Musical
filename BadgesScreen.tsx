
import React from 'react';
import { User, GameScreen, Theme } from '../types';
import { BADGES } from '../constants';

interface BadgesScreenProps {
  currentUser: User | null;
  setScreen: (screen: GameScreen) => void;
  activeTheme: Theme;
}

export const BadgesScreen: React.FC<BadgesScreenProps> = ({ currentUser, setScreen, activeTheme }) => {
  if (!currentUser) return null;

  return (
    <div className="space-y-6 animate-in slide-in-from-right duration-500">
      <div className="text-center">
         <h2 className="text-3xl font-black text-slate-800">Conquistas</h2>
         <p className="text-sm font-bold text-slate-400 uppercase">Desbloqueie medalhas jogando</p>
      </div>

      <div className="grid grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto px-2 py-1 scrollbar-hide">
        {BADGES.map(badge => {
           const unlocked = currentUser.badges.includes(badge.id);
           
           return (
             <div key={badge.id} className={`p-4 rounded-3xl border-2 flex flex-col items-center text-center transition-all ${unlocked ? 'bg-white border-yellow-200 shadow-sm' : 'bg-slate-50 border-slate-100 opacity-60 grayscale'}`}>
                <div className={`text-4xl mb-2 ${unlocked ? 'animate-bounce' : ''}`}>{badge.icon}</div>
                <h3 className="font-black text-slate-800 text-sm leading-tight mb-1">{badge.name}</h3>
                <p className="text-[10px] text-slate-400 font-bold leading-tight">{badge.description}</p>
                {unlocked && <span className="mt-2 text-[10px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-black">DESBLOQUEADO</span>}
             </div>
           );
        })}
      </div>

      <button onClick={() => setScreen('welcome')} className="text-slate-500 font-bold hover:text-pink-600 transition-colors py-3 uppercase tracking-widest text-xs">← Voltar</button>
    </div>
  );
};
