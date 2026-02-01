
import React from 'react';
import { User, Theme, Player, HistoryRecord, GameScreen } from '../types';
import { AVATARS } from '../constants';
import { getXpForNextLevel } from '../services/userService';

interface WelcomeScreenProps {
  activeTheme: Theme;
  currentUser: User | null;
  setScreen: (screen: GameScreen) => void;
  handleLogout: () => void;
  gameMode: '1p' | '2p';
  handleModeSelection: (mode: '1p' | '2p') => void;
  players: Player[];
  setPlayers: (players: Player[]) => void;
  selectingAvatarFor: number | null;
  setSelectingAvatarFor: (val: number | null) => void;
  handleAvatarSelect: (idx: number, avatar: string) => void;
  history: HistoryRecord[];
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  activeTheme, currentUser, setScreen, handleLogout,
  gameMode, handleModeSelection, players, setPlayers,
  selectingAvatarFor, setSelectingAvatarFor, handleAvatarSelect,
  history
}) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="text-7xl float drop-shadow-lg">{activeTheme.emoji}</div>
      <h1 className={`text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-700 to-slate-900 tracking-tight`}>Super Quiz HARD</h1>
      
      {/* PROFILE HEADER IF LOGGED IN */}
      {currentUser ? (
        <div className={`p-5 rounded-3xl shadow-lg text-white mb-6 relative overflow-hidden ${activeTheme.background}`}>
           <div className="flex items-center gap-4 relative z-10">
              <div className="text-5xl bg-white/20 p-3 rounded-2xl backdrop-blur-md border border-white/30 shadow-inner">{currentUser.avatar}</div>
              <div className="text-left flex-1 min-w-0">
                <p className="text-xs font-bold opacity-80 uppercase tracking-widest mb-1">Bem-vindo(a)</p>
                <h3 className="text-3xl font-black leading-none truncate drop-shadow-md">{currentUser.username}</h3>
                <div className="flex items-center gap-2 mt-2">
                   <span className="text-xs font-bold bg-black/20 px-2 py-1 rounded-lg border border-white/10">Lvl {currentUser.level}</span>
                   {/* High Contrast Coin Display */}
                   <div className="flex items-center gap-1 bg-yellow-400 px-2 py-1 rounded-lg border-b-2 border-yellow-600 shadow-sm text-xs font-black text-yellow-900">
                      <span>💰</span> {currentUser.coins}
                   </div>
                </div>
                <div className="mt-2 h-1.5 bg-black/20 rounded-full overflow-hidden border border-white/5">
                   <div className="h-full bg-white" style={{ width: `${(currentUser.xp / getXpForNextLevel(currentUser.level)) * 100}%` }}></div>
                </div>
              </div>
           </div>

           {/* DAILY CHALLENGE CARD */}
           <div className="mt-4 bg-black/20 rounded-xl p-3 backdrop-blur-sm border border-white/10">
              <div className="flex justify-between items-center mb-1">
                 <span className="text-[10px] font-bold uppercase opacity-80">Desafio Diário</span>
                 {currentUser.dailyChallenge.completed ? (
                   <span className="text-emerald-300 font-bold text-xs">Concluído ✅</span>
                 ) : (
                   <span className="text-yellow-300 font-bold text-xs">+{currentUser.dailyChallenge.rewardCoins} 💰</span>
                 )}
              </div>
              <p className="text-sm font-bold leading-tight mb-2">{currentUser.dailyChallenge.description}</p>
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                 <div className="bg-emerald-400 h-full transition-all" style={{ width: `${Math.min(100, (currentUser.dailyChallenge.progress / currentUser.dailyChallenge.target) * 100)}%` }}></div>
              </div>
           </div>
           
           <div className="grid grid-cols-4 gap-2 mt-4">
              <button 
                  onClick={() => setScreen('themes')} 
                  className="py-2 bg-white/20 hover:bg-white/30 border border-white/20 rounded-xl font-bold text-xs backdrop-blur-md transition-all flex flex-col items-center justify-center text-white"
              >
                  <span className="text-lg">🎨</span> Temas
              </button>
              <button 
                  onClick={() => setScreen('shop')} 
                  className="py-2 bg-white/20 hover:bg-white/30 border border-white/20 rounded-xl font-bold text-xs backdrop-blur-md transition-all flex flex-col items-center justify-center text-white"
              >
                  <span className="text-lg">🛒</span> Loja
              </button>
              <button 
                  onClick={() => setScreen('badges')} 
                  className="py-2 bg-white/20 hover:bg-white/30 border border-white/20 rounded-xl font-bold text-xs backdrop-blur-md transition-all flex flex-col items-center justify-center text-white"
              >
                  <span className="text-lg">🎖️</span> Badges
              </button>
              <button 
                  onClick={handleLogout} 
                  className="py-2 bg-black/10 hover:bg-black/20 border border-white/10 rounded-xl font-bold text-xs backdrop-blur-md transition-all flex flex-col items-center justify-center text-white/90"
              >
                  <span className="text-lg">🚪</span> Sair
              </button>
           </div>
        </div>
      ) : (
        <button onClick={() => setScreen('auth')} className={`w-full py-3 bg-white border-2 rounded-2xl font-black transition-colors mb-4 flex items-center justify-center gap-2 shadow-sm ${activeTheme.accentColor.replace('text', 'border')} ${activeTheme.accentColor}`}>
          <span>👤</span> Fazer Login / Criar Conta
        </button>
      )}

      {/* Leaderboard & Mode Selection Container */}
      <div className="flex gap-2 mb-4">
         <button 
           onClick={() => setScreen('leaderboard')}
           className="bg-yellow-100 hover:bg-yellow-200 text-yellow-700 p-3 rounded-xl border border-yellow-300 shadow-sm transition-all flex items-center justify-center border-b-4 active:border-b-0 active:translate-y-1"
           title="Ranking Global"
         >
           🏆
         </button>
         
         <div className="flex-1 flex bg-slate-100 p-1 rounded-xl">
            <button 
              onClick={() => handleModeSelection('1p')} 
              className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${gameMode === '1p' ? 'bg-white shadow ' + activeTheme.accentColor : 'text-slate-400 hover:text-slate-600'}`}
            >
              🤖 1 Jogador
            </button>
            <button 
              onClick={() => handleModeSelection('2p')} 
              className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${gameMode === '2p' ? 'bg-white shadow ' + activeTheme.accentColor : 'text-slate-400 hover:text-slate-600'}`}
            >
              👥 2 Jogadores
            </button>
         </div>
      </div>

      <div className="bg-white/60 p-5 rounded-3xl border border-white/50 space-y-4 shadow-inner">
        {[0, 1].map((idx) => {
          if (gameMode === '1p' && idx === 1) return null;
          if (idx === 0 && currentUser) return null;

          return (
            <div key={idx} className="flex flex-col gap-2">
              <div className={`flex items-center gap-2 ${idx === 1 ? 'flex-row-reverse' : ''}`}>
                <button onClick={() => setSelectingAvatarFor(selectingAvatarFor === idx ? null : idx)} className={`w-14 h-14 rounded-full flex items-center justify-center text-3xl hover:scale-110 shadow-md border-2 transition-transform ${idx === 0 ? 'bg-pink-100 border-pink-300' : 'bg-indigo-100 border-indigo-300'}`}>
                  {players[idx].avatar}
                </button>
                <input 
                  type="text" 
                  placeholder={idx === 0 ? "Nome Jogador 1 (Visitante)" : "Nome do Jogador 2"} 
                  value={players[idx].name} 
                  onChange={(e) => { const n = [...players]; n[idx].name = e.target.value; setPlayers(n); }} 
                  className={`flex-1 p-3.5 border-2 rounded-2xl focus:outline-none font-bold text-slate-800 placeholder-slate-300 transition-colors shadow-sm ${idx === 0 ? 'bg-white border-pink-100 focus:border-pink-400' : 'bg-white border-indigo-100 focus:border-indigo-400 text-right'}`} 
                />
              </div>
              {selectingAvatarFor === idx && (
                <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-xl grid grid-cols-6 gap-2 max-h-48 overflow-y-auto z-30">
                  {AVATARS.map((emoji) => <button key={emoji} onClick={() => handleAvatarSelect(idx, emoji)} className="text-3xl hover:scale-125 p-1 transition-transform">{emoji}</button>)}
                </div>
              )}
              {idx === 0 && <div className="text-slate-400 font-black text-xs uppercase tracking-widest my-1">VS</div>}
            </div>
          );
        })}
        
        {gameMode === '1p' && (
          <div className="flex flex-row-reverse items-center gap-2 opacity-75">
             <div className="w-14 h-14 rounded-full flex items-center justify-center text-3xl bg-indigo-100 border-2 border-indigo-300 shadow-md">
                🤖
             </div>
             <div className="flex-1 p-3.5 border-2 border-slate-100 bg-slate-50 rounded-2xl font-bold text-slate-500 text-right">
               Robô Musical
             </div>
          </div>
        )}
      </div>

      <button 
        onClick={() => players[0].name && players[1].name ? setScreen('category') : alert('Digite o nome!')} 
        className={`w-full py-5 text-white rounded-2xl font-black text-xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all border-b-4 active:border-b-0 active:translate-y-1 active:shadow-none ${activeTheme.buttonGradient}`}
      >
        COMEÇAR 🚀
      </button>
    </div>
  );
};
