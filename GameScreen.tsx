
import React from 'react';
import { Player, Song, Difficulty, Theme } from '../types';

interface GameScreenProps {
  currentSong: Song;
  timeLeft: number;
  TIME_LIMIT_SECONDS: number;
  scoreAnimation: { index: number, type: 'increase' | 'decrease' | 'reward' } | null;
  turnIndex: number;
  players: Player[];
  botMessage: string | null;
  gameStyle: 'rounds' | 'survival';
  currentRound: number;
  totalRounds: number;
  isDoublePoints: boolean;
  isPlaying: boolean;
  isLocked: boolean;
  activeTheme: Theme;
  audioProgress: number;
  playPreview: () => void;
  isAudioLoading: boolean;
  difficulty: Difficulty;
  listensUsed: number;
  handleChangeSong: () => void;
  MAX_SKIPS: number;
  handleHint: () => void;
  MAX_HINTS: number;
  disabledOptions: string[];
  handlePass: () => void;
  MAX_PASSES: number;
  options: string[];
  correctAnswer: string;
  selectedOption: string | null;
  handleAnswer: (option: string) => void;
  resetGame: () => void;
}

export const GameScreen: React.FC<GameScreenProps> = ({
  currentSong, timeLeft, TIME_LIMIT_SECONDS, scoreAnimation, turnIndex, players,
  botMessage, gameStyle, currentRound, totalRounds, isDoublePoints, isPlaying,
  isLocked, activeTheme, audioProgress, playPreview, isAudioLoading, difficulty,
  listensUsed, handleChangeSong, MAX_SKIPS, handleHint, MAX_HINTS, disabledOptions,
  handlePass, MAX_PASSES, options, correctAnswer, selectedOption, handleAnswer, resetGame
}) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500 relative z-10">
      
      {/* TIMER BAR */}
      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden mb-2">
        <div 
          className={`h-full transition-all duration-1000 ease-linear ${timeLeft < 5 ? 'bg-red-500' : timeLeft < 8 ? 'bg-yellow-500' : 'bg-emerald-500'}`}
          style={{ width: `${(timeLeft / TIME_LIMIT_SECONDS) * 100}%` }}
        ></div>
      </div>

      <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest text-slate-500">
        {[0, 1].map(i => {
          const isAnimating = scoreAnimation?.index === i;
          const isCurrentTurn = turnIndex === i;
          const player = players[i];

          return (
            <div key={i} className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all duration-300 ${isCurrentTurn ? 'bg-white border-slate-400 scale-105 shadow-md' : 'bg-transparent border-transparent opacity-50'} relative`}>
              
              {/* Bot Message Bubble */}
              {player.isBot && botMessage && (
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white text-slate-800 px-3 py-1.5 rounded-xl rounded-bl-none border-2 border-slate-800 shadow-lg text-[10px] z-50 animate-in zoom-in slide-in-from-bottom-2">
                  {botMessage}
                </div>
              )}

              {player.streak >= 3 && (
                <span className="absolute -top-3 -right-2 text-2xl animate-bounce drop-shadow-md z-20">🔥</span>
              )}
              <span className="text-xl">{player.avatar}</span>
              <div className="flex flex-col items-start leading-none">
                 <span className="text-[10px] text-slate-400">{player.name}</span>
                 <div className="flex items-center gap-1">
                   {gameStyle !== 'survival' && (
                     <span className={`text-lg font-black ${isAnimating ? 'scale-125 transition-transform' : ''}`}>
                       {player.score}
                     </span>
                   )}
                   {gameStyle === 'survival' && (
                     <div className="flex -space-x-1 ml-2">
                       {[...Array(3)].map((_, li) => (
                         <span key={li} className={`text-xs ${li < player.lives ? 'opacity-100' : 'opacity-20 grayscale'}`}>❤️</span>
                       ))}
                     </div>
                   )}
                 </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="relative py-2 flex flex-col items-center gap-5">
        
        {/* Round Counter Badge */}
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-md z-20 uppercase tracking-widest border-2 border-white flex items-center gap-2">
          <span>{gameStyle === 'survival' ? `Sobrevivência: Rd ${currentRound + 1}` : `Rodada ${currentRound + 1}/${totalRounds}`}</span>
          {isDoublePoints && <span className="bg-yellow-400 text-yellow-900 px-1 rounded animate-pulse">2x PONTOS</span>}
        </div>

        <div className="relative group mt-2 flex flex-col items-center">
          <div className={`rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white relative z-10 bg-slate-200 transition-all duration-700 ${isPlaying && !isLocked ? 'shadow-pink-200 scale-105' : ''} ${isLocked ? 'w-56 h-56 scale-105' : 'w-44 h-44'}`}>
             <img src={currentSong.albumCover} className={`w-full h-full object-cover transition-all duration-1000 ${isLocked ? 'blur-0' : 'blur-md'}`} />
             {!isLocked && (
               <button 
                onClick={playPreview} 
                disabled={isAudioLoading || (difficulty === Difficulty.HARD && listensUsed >= 3)} 
                className={`absolute inset-0 flex items-center justify-center text-5xl bg-black/10 hover:bg-black/30 backdrop-blur-[2px] transition-all active:scale-95 ${difficulty === Difficulty.HARD && listensUsed >= 3 ? 'grayscale cursor-not-allowed opacity-40' : 'cursor-pointer text-white drop-shadow-lg'}`}
               >
                 {isAudioLoading ? (
                   <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                 ) : (
                   isPlaying ? '⏸️' : '▶️'
                 )}
               </button>
             )}
          </div>
          
          {/* Reveal Song Info */}
          {isLocked && (
            <div className="mt-4 animate-in fade-in slide-in-from-bottom-2 text-center">
              <h3 className="text-xl font-black text-slate-800 leading-tight">{currentSong.title}</h3>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wide">{currentSong.artist}</p>
            </div>
          )}
        </div>

        <div className="w-full max-w-[220px] h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200 shadow-inner">
          <div className={`h-full transition-all duration-100 ease-linear ${isPlaying ? activeTheme.buttonGradient : 'bg-slate-300'}`} style={{ width: `${audioProgress}%` }}></div>
        </div>
        
        {difficulty === Difficulty.HARD && !isLocked && (
          <div className="flex gap-1 bg-white px-3 py-1 rounded-full shadow-sm border border-slate-100">
            {[1, 2, 3].map(v => (
              <span key={v} className={`text-lg transition-all duration-300 ${v <= (3 - listensUsed) ? 'opacity-100 scale-100 grayscale-0' : 'opacity-20 grayscale scale-75'}`}>🔊</span>
            ))}
          </div>
        )}
        
        {/* Turn Indicator */}
        {!isLocked && (
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] animate-pulse">
            {players[turnIndex].isBot ? '🤖 Computador pensando...' : (isPlaying ? 'Tocando...' : 'Toque para ouvir')}
          </p>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3 px-2">
        <button 
          onClick={handleChangeSong} 
          disabled={isLocked || players[turnIndex].skips <= 0 || players[turnIndex].isBot} 
          className={`p-3 rounded-2xl border-2 flex flex-col items-center justify-center transition-all active:scale-95 ${players[turnIndex].skips > 0 && !players[turnIndex].isBot ? 'bg-white border-amber-200 text-amber-600 hover:bg-amber-50 shadow-sm' : 'opacity-40 grayscale bg-slate-50 border-slate-100'}`}
        >
          <span className="text-xl mb-1">🔄</span>
          <span className="text-[9px] font-black uppercase">Trocar ({players[turnIndex].skips}/{MAX_SKIPS})</span>
        </button>
        
        <button 
          onClick={handleHint} 
          disabled={isLocked || players[turnIndex].hints <= 0 || disabledOptions.length > 0 || players[turnIndex].isBot} 
          className={`p-3 rounded-2xl border-2 flex flex-col items-center justify-center transition-all active:scale-95 ${players[turnIndex].hints > 0 && disabledOptions.length === 0 && !players[turnIndex].isBot ? 'bg-white border-purple-200 text-purple-600 hover:bg-purple-50 shadow-sm' : 'opacity-40 grayscale bg-slate-50 border-slate-100'}`}
        >
          <span className="text-xl mb-1">💡</span>
          <span className="text-[9px] font-black uppercase">Dica ({players[turnIndex].hints}/{MAX_HINTS})</span>
        </button>

        <button 
          onClick={handlePass} 
          disabled={isLocked || players[turnIndex].passes <= 0 || players[turnIndex].isBot} 
          className={`p-3 rounded-2xl border-2 flex flex-col items-center justify-center transition-all active:scale-95 ${players[turnIndex].passes > 0 && !players[turnIndex].isBot ? 'bg-white border-blue-200 text-blue-600 hover:bg-blue-50 shadow-sm' : 'opacity-40 grayscale bg-slate-50 border-slate-100'}`}
        >
          <span className="text-xl mb-1">⏩</span>
          <span className="text-[9px] font-black uppercase">Pular ({players[turnIndex].passes}/{MAX_PASSES})</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {options.map((opt, i) => {
          const isCorrect = opt === correctAnswer;
          const isSelected = opt === selectedOption;
          const isExploded = disabledOptions.includes(opt);
          const isDisabled = isExploded || players[turnIndex].isBot;

          return (
            <button 
              key={i} 
              disabled={isLocked || isDisabled} 
              onClick={() => handleAnswer(opt)} 
              className={`
                relative p-4 rounded-2xl font-bold border-2 text-left transition-all duration-200 active:scale-[0.98]
                ${isExploded ? 'animate-explode bg-red-100 border-red-300 text-red-500' : ''}
                ${isDisabled && !isExploded ? 'opacity-30 grayscale bg-slate-50 border-slate-100' : ''}
                ${isLocked && !isExploded ? (isCorrect ? 'bg-emerald-500 text-white border-emerald-600 shadow-lg scale-[1.01]' : isSelected ? 'bg-rose-500 text-white border-rose-600' : 'opacity-40 border-slate-100 bg-white') : ''}
                ${!isLocked && !isDisabled ? `bg-white border-slate-100 text-slate-700 hover:border-current hover:bg-white/50 shadow-sm hover:shadow-md ${activeTheme.accentColor.replace('text', 'border')}` : ''}
              `}
            >
              <span className="relative z-10">{opt}</span>
              {isExploded && <span className="absolute right-4 top-4 text-2xl">💥</span>}
            </button>
          );
        })}
      </div>
      
      <button onClick={resetGame} className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-6 hover:text-red-500 transition-colors">Encerrar Partida</button>
    </div>
  );
};
