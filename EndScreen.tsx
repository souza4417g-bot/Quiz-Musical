
import React, { useEffect, useRef } from 'react';
import { Player, User, Theme } from '../types';
import { THEMES } from '../constants';
import { getXpForNextLevel } from '../services/userService';

interface EndScreenProps {
  players: Player[];
  getWinner: (players: Player[]) => Player | 'draw';
  activeTheme: Theme;
  currentUser: User | null;
  xpGained: number;
  leveledUp: boolean;
  gameStyle: 'rounds' | 'survival';
  resetGame: () => void;
}

export const EndScreen: React.FC<EndScreenProps> = ({
  players, getWinner, activeTheme, currentUser, xpGained, leveledUp, gameStyle, resetGame
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Confetti Effect Logic
  useEffect(() => {
    const winner = getWinner(players);
    const isWin = winner !== 'draw' && winner.name === players[0].name;

    if (isWin && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      const particles: any[] = [];
      const colors = ['#f472b6', '#22d3ee', '#fbbf24', '#a78bfa', '#34d399'];

      for (let i = 0; i < 150; i++) {
        particles.push({
          x: canvas.width / 2,
          y: canvas.height / 2 + 100, // Explode from center-ish
          vx: (Math.random() - 0.5) * 20,
          vy: (Math.random() - 1) * 20 - 5,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: Math.random() * 8 + 4,
          gravity: 0.5,
          drag: 0.95
        });
      }

      let animationId: number;
      const animate = () => {
        if (!ctx || !canvas) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach((p, index) => {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += p.gravity;
          p.vx *= p.drag;
          p.vy *= p.drag;
          p.size *= 0.99; // Shrink slowly

          ctx.fillStyle = p.color;
          ctx.fillRect(p.x, p.y, p.size, p.size);

          // Remove small particles
          if (p.size < 0.5 || p.y > canvas.height) {
            particles.splice(index, 1);
          }
        });

        if (particles.length > 0) {
          animationId = requestAnimationFrame(animate);
        }
      };

      animate();

      return () => {
        cancelAnimationFrame(animationId);
      };
    }
  }, [players, getWinner]);

  const handleShare = () => {
     const winner = getWinner(players);
     const isWin = winner !== 'draw' && winner.name === players[0].name;
     const text = `🎵 SUPER QUIZ MUSICAL 🎵\n\nEu ${isWin ? 'VENCÍ' : 'joguei'} uma partida no modo ${gameStyle === 'survival' ? 'Sobrevivência' : 'Normal'}!\n\n🏆 Pontuação: ${players[0].score}\n👤 Meu Nível: ${currentUser?.level || 1}\n\nVocê consegue me vencer? 😎`;
     
     if (navigator.share) {
       navigator.share({
         title: 'Super Quiz Musical',
         text: text,
       }).catch(() => {});
     } else {
       navigator.clipboard.writeText(text);
       alert('Texto copiado! Cole no WhatsApp ou Stories.');
     }
  };

  return (
    <div className="relative">
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-50" />
      
      <div className="space-y-8 animate-in zoom-in duration-500 relative z-40">
        <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-slate-700 to-black drop-shadow-sm uppercase tracking-tighter">Fim de Jogo!</h1>
        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-2xl relative overflow-hidden">
           <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-50 opacity-50 pointer-events-none"></div>
           <div className="relative z-10">
             
             {/* Lógica de Vitória Visual */}
             {(() => {
               const winner = getWinner(players);
               const isDraw = winner === 'draw';
               
               return (
                 <>
                    <div className="text-8xl mb-6 animate-[bounce_1s_infinite]">
                       {isDraw ? '🤝' : winner.avatar}
                    </div>
                    <p className="text-3xl font-black text-slate-800 mb-2 leading-none">
                       {isDraw ? 'EMPATE!' : winner.name.toUpperCase()}
                    </p>
                    {!isDraw && (
                       <p className={`text-sm font-bold uppercase tracking-widest ${activeTheme.accentColor}`}>É o Grande Vencedor!</p>
                    )}
                 </>
               )
             })()}

             {/* XP & COINS GAIN SECTION */}
             {currentUser && xpGained > 0 && (
               <div className="bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl mt-4 animate-in slide-in-from-bottom-2 fade-in text-left">
                  <p className="text-xs font-bold text-slate-500 uppercase mb-2">Recompensas</p>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex gap-3">
                       <span className="font-black text-slate-700 text-lg">+{xpGained} XP</span>
                       <span className="font-black text-yellow-600 text-lg">+💰 Moedas</span>
                    </div>
                    {leveledUp && <span className="text-xs bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-lg font-black animate-pulse shadow-sm">LEVEL UP! 🆙</span>}
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden border border-slate-300">
                    <div className={`h-full transition-all duration-1000 ${activeTheme.buttonGradient}`} style={{ width: `${(currentUser.xp / getXpForNextLevel(currentUser.level)) * 100}%` }}></div>
                  </div>
                  <p className="text-[10px] text-right mt-1 text-slate-400 font-bold">Próximo Nível: {getXpForNextLevel(currentUser.level) - currentUser.xp} XP</p>

                  {/* THEME UNLOCK NOTIFICATION */}
                  {leveledUp && THEMES.some(t => t.minLevel === currentUser.level) && (
                     <div className="mt-4 bg-emerald-100 border-2 border-emerald-200 p-3 rounded-2xl flex items-center gap-3 animate-[pulse_2s_infinite]">
                        <span className="text-3xl">🎁</span>
                        <div className="leading-tight">
                            <p className="text-emerald-800 font-black text-sm">NOVO TEMA DESBLOQUEADO!</p>
                            <p className="text-emerald-600 text-[10px] font-bold">Vá em "Temas" para equipar.</p>
                        </div>
                     </div>
                  )}
               </div>
             )}

             <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-slate-100">
               {[0,1].map(i => <div key={i} className={`p-4 rounded-3xl border-2 flex flex-col items-center ${i === 0 ? 'bg-slate-50 border-slate-200' : 'bg-slate-50 border-slate-200'}`}>
                 <div className="text-2xl mb-1">{players[i].avatar}</div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{players[i].name}</p>
                 
                 {gameStyle !== 'survival' && (
                   <p className={`text-4xl font-black ${players[i].score < 0 ? 'text-red-500' : 'text-slate-800'}`}>{players[i].score}</p>
                 )}
                 {gameStyle === 'survival' && (
                   <div className="flex justify-center gap-1">
                      {[...Array(3)].map((_, li) => (
                           <span key={li} className={`text-xl ${li < players[i].lives ? 'opacity-100' : 'opacity-20 grayscale'}`}>❤️</span>
                         ))}
                   </div>
                 )}
               </div>)}
             </div>
           </div>
        </div>
        
        <div className="flex gap-2">
           <button onClick={handleShare} className="flex-1 py-4 bg-indigo-500 text-white rounded-2xl font-black text-lg shadow-lg hover:bg-indigo-600 transition-all border-b-4 border-indigo-700 active:border-b-0 active:translate-y-1">
              COMPARTILHAR 📲
           </button>
           <button 
              onClick={resetGame} 
              className={`flex-1 py-4 text-white rounded-2xl font-black text-lg shadow-lg hover:shadow-2xl transition-all border-b-4 active:border-b-0 active:translate-y-1 ${activeTheme.buttonGradient}`}
           >
              JOGAR 🔄
           </button>
        </div>
      </div>
    </div>
  );
};
