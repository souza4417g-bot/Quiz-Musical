
import React from 'react';
import { Difficulty, GameScreen } from '../types';

interface DifficultyScreenProps {
  setDifficulty: (diff: Difficulty) => void;
  setScreen: (screen: GameScreen) => void;
}

export const DifficultyScreen: React.FC<DifficultyScreenProps> = ({ setDifficulty, setScreen }) => {
  return (
    <div className="space-y-8 animate-in zoom-in duration-300">
      <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tighter">Dificuldade</h2>
      <div className="flex flex-col gap-4">
        <button onClick={() => { setDifficulty(Difficulty.NORMAL); setScreen('config'); }} className="group w-full p-6 bg-white border-2 border-emerald-100 hover:border-emerald-500 rounded-3xl text-left transition-all shadow-sm hover:shadow-lg hover:-translate-y-1">
          <div className="flex justify-between items-center mb-2">
            <p className="text-2xl font-black text-emerald-700">MODO NORMAL</p>
            <span className="text-3xl">🙂</span>
          </div>
          <p className="text-sm font-bold text-slate-500 leading-snug">Sem punição por erro • Audições ilimitadas • Jogo casual</p>
        </button>
        <button onClick={() => { setDifficulty(Difficulty.HARD); setScreen('config'); }} className="group w-full p-6 bg-white border-2 border-rose-100 hover:border-rose-500 rounded-3xl text-left transition-all shadow-sm hover:shadow-lg hover:-translate-y-1">
           <div className="flex justify-between items-center mb-2">
            <p className="text-2xl font-black text-rose-700">MODO DIFÍCIL</p>
            <span className="text-3xl">🔥</span>
          </div>
          <p className="text-sm font-bold text-slate-500 leading-snug">Errou perde ponto • Máx. 3 audições • Menos ajudas</p>
        </button>
      </div>
      <button onClick={() => setScreen('category')} className={`font-bold hover:text-indigo-600 uppercase tracking-widest text-xs text-slate-500`}>Escolher outro estilo</button>
    </div>
  );
};
