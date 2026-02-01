
import React from 'react';
import { GameScreen, Genre } from '../types';

interface ConfigScreenProps {
  gameStyle: 'rounds' | 'survival';
  setGameStyle: (style: 'rounds' | 'survival') => void;
  startLoading: (genre: Genre, rounds: number) => void;
  setScreen: (screen: GameScreen) => void;
  selectedGenre: Genre;
}

export const ConfigScreen: React.FC<ConfigScreenProps> = ({ 
  gameStyle, setGameStyle, startLoading, setScreen, selectedGenre 
}) => {
  return (
    <div className="space-y-6 animate-in zoom-in duration-300">
      <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tighter text-center">Configuração</h2>
      
      {/* GAME STYLE SELECTION */}
      <div className="flex flex-col gap-3">
        <button 
          onClick={() => setGameStyle('rounds')} 
          className={`p-4 border-2 rounded-2xl flex items-center justify-between transition-all ${gameStyle === 'rounds' ? 'bg-indigo-50 border-indigo-500 shadow-md' : 'bg-white border-slate-100 text-slate-400'}`}
        >
          <div className="text-left">
            <span className="block font-black text-lg">Modo Pontos 🏆</span>
            <span className="text-xs">Vence quem pontuar mais</span>
          </div>
          {gameStyle === 'rounds' && <span className="text-xl">✅</span>}
        </button>
        <button 
          onClick={() => setGameStyle('survival')} 
          className={`p-4 border-2 rounded-2xl flex items-center justify-between transition-all ${gameStyle === 'survival' ? 'bg-red-50 border-red-500 shadow-md' : 'bg-white border-slate-100 text-slate-400'}`}
        >
          <div className="text-left">
            <span className="block font-black text-lg">Modo Sobrevivência ❤️</span>
            <span className="text-xs">Errou 3 vezes = Game Over</span>
          </div>
          {gameStyle === 'survival' && <span className="text-xl">✅</span>}
        </button>
      </div>

      {gameStyle === 'rounds' && (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-bold text-slate-400 uppercase">Número de Rodadas</p>
          <div className="flex gap-2">
            {[10, 14, 20].map(n => (
              <button key={n} onClick={() => startLoading(selectedGenre, n)} className="flex-1 py-3 bg-white border-2 border-indigo-100 hover:border-indigo-500 rounded-xl font-black text-slate-700 shadow-sm hover:shadow-md transition-all">
                {n}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {gameStyle === 'survival' && (
         <button onClick={() => startLoading(selectedGenre, 999)} className="w-full py-4 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-2xl font-black text-xl shadow-lg hover:scale-[1.02] transition-all">
            INICIAR DESAFIO 💀
         </button>
      )}

      <button onClick={() => setScreen('difficulty')} className={`font-bold hover:text-indigo-600 uppercase tracking-widest text-xs text-slate-500`}>Voltar</button>
    </div>
  );
};
