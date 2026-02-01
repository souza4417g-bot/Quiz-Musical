
import React from 'react';
import { Genre, GameScreen } from '../types';

interface CategoryScreenProps {
  setSelectedGenre: (genre: Genre) => void;
  setScreen: (screen: GameScreen) => void;
}

export const CategoryScreen: React.FC<CategoryScreenProps> = ({ setSelectedGenre, setScreen }) => {
  const categories = [
    { id: Genre.ALL, label: 'Tudo Misturado 🌪️', color: 'bg-slate-50 border-slate-300 hover:border-pink-500 hover:bg-white text-slate-800' },
    { id: Genre.SERTANEJO, label: 'Sertanejo 🤠', color: 'bg-amber-50 border-amber-300 hover:border-amber-600 hover:bg-white text-amber-900' },
    { id: Genre.PAGODE, label: 'Pagode/Samba 🥁', color: 'bg-orange-50 border-orange-300 hover:border-orange-600 hover:bg-white text-orange-900' },
    { id: Genre.POP_BR, label: 'Pop & Funk 🇧🇷', color: 'bg-sky-50 border-sky-300 hover:border-sky-600 hover:bg-white text-sky-900' },
    { id: Genre.FLASHBACK, label: 'Flashback 80/90 📻', color: 'bg-fuchsia-50 border-fuchsia-300 hover:border-fuchsia-600 hover:bg-white text-fuchsia-900' },
    { id: Genre.TIKTOK, label: 'Virais TikTok 🕺', color: 'bg-teal-50 border-teal-300 hover:border-teal-600 hover:bg-white text-teal-900' },
    { id: Genre.POP_INTL, label: 'Internacional 🌍', color: 'bg-indigo-50 border-indigo-300 hover:border-indigo-600 hover:bg-white text-indigo-900' },
    { id: Genre.GOSPEL, label: 'Gospel 🙏', color: 'bg-emerald-50 border-emerald-300 hover:border-emerald-600 hover:bg-white text-emerald-900' },
    { id: Genre.ROCK_MPB, label: 'Rock/MPB 🎸', color: 'bg-rose-50 border-rose-300 hover:border-rose-600 hover:bg-white text-rose-900' },
  ];

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom duration-500">
      <h2 className="text-3xl font-black text-slate-800 tracking-tight">Qual o seu Estilo?</h2>
      <div className="grid grid-cols-1 gap-3 max-h-[60vh] overflow-y-auto px-2 py-1 scrollbar-hide">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => {
              setSelectedGenre(cat.id);
              setScreen('difficulty');
            }}
            className={`w-full py-5 px-6 border-2 border-b-4 active:border-b-2 active:translate-y-0.5 rounded-2xl font-bold transition-all flex items-center justify-between group hover:shadow-md ${cat.color}`}
          >
            <span className="text-lg">{cat.label}</span>
            <span className="opacity-0 group-hover:opacity-100 transition-opacity text-xl">➡️</span>
          </button>
        ))}
      </div>
      <button onClick={() => setScreen('welcome')} className={`font-bold hover:text-pink-600 transition-colors py-3 uppercase tracking-widest text-xs text-slate-500`}>← Voltar ao Início</button>
    </div>
  );
};
