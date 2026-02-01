
import React, { useEffect, useState } from 'react';
import { User, GameScreen, Theme } from '../types';
import { googleSheetsService } from '../services/googleSheetsService';

interface LeaderboardScreenProps {
  setScreen: (screen: GameScreen) => void;
  activeTheme: Theme;
}

export const LeaderboardScreen: React.FC<LeaderboardScreenProps> = ({ setScreen, activeTheme }) => {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [sortBy, setSortBy] = useState<'wins' | 'level'>('wins');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      // Tenta pegar do localStorage primeiro para instant load (Cache Optimistic)
      const cached = localStorage.getItem('quiz_users_db');
      if (cached) {
        setUsers(JSON.parse(cached));
        setLoading(false); // Se tem cache, tira loading visualmente rápido
      }

      // Em seguida, tenta buscar a versão mais atualizada da nuvem em background
      try {
        const remoteUsers = await googleSheetsService.getAllUsers();
        if (remoteUsers.length > 0) {
          setUsers(remoteUsers);
          // Opcional: Atualizar cache local
          // localStorage.setItem('quiz_users_db', JSON.stringify(remoteUsers));
        }
      } catch (e) {
        console.error("Erro ao carregar ranking");
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const sortedUsers = [...users]
    .filter(user => user.id !== 'admin_test_user_lvl30') // Remove o usuário Admin do ranking
    .sort((a, b) => {
      if (sortBy === 'wins') return b.wins - a.wins;
      return b.level - a.level;
    })
    .slice(0, 50); // Top 50

  // Skeleton Loader Component
  const SkeletonRow = () => (
    <div className="p-3 rounded-2xl border-2 border-slate-100 flex items-center gap-4 bg-white opacity-60">
      <div className="w-8 h-6 bg-slate-200 rounded animate-pulse"></div>
      <div className="w-12 h-12 rounded-full bg-slate-200 animate-pulse"></div>
      <div className="flex-1 min-w-0 space-y-2">
        <div className="h-4 bg-slate-200 rounded w-3/4 animate-pulse"></div>
        <div className="h-3 bg-slate-200 rounded w-1/2 animate-pulse"></div>
      </div>
      <div className="w-10 h-6 bg-slate-200 rounded animate-pulse"></div>
    </div>
  );

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom duration-500 h-[80vh] flex flex-col">
       <div className="flex items-center justify-center gap-2">
          <span className="text-4xl animate-bounce">🏆</span>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Hall da Fama</h2>
       </div>

       <div className="flex bg-slate-100 p-1 rounded-xl shrink-0">
         <button 
           onClick={() => setSortBy('wins')} 
           className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${sortBy === 'wins' ? 'bg-white shadow text-yellow-600' : 'text-slate-400'}`}
         >
           Por Vitórias
         </button>
         <button 
           onClick={() => setSortBy('level')} 
           className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${sortBy === 'level' ? 'bg-white shadow text-purple-600' : 'text-slate-400'}`}
         >
           Por Nível
         </button>
       </div>
       
       <div className="flex-1 overflow-y-auto pr-2 space-y-3 scrollbar-hide">
         {loading && users.length === 0 ? (
           // Renderiza 6 esqueletos enquanto carrega
           <div className="space-y-3">
             {[...Array(6)].map((_, i) => <SkeletonRow key={i} />)}
           </div>
         ) : (
           sortedUsers.map((user, index) => {
             let rankStyle = "bg-white border-slate-100";
             let rankIcon = `#${index + 1}`;
             let rankScale = "scale-100";
             
             if (index === 0) {
               rankStyle = "bg-yellow-50 border-yellow-200 shadow-sm border-b-4 border-yellow-300";
               rankIcon = "🥇";
               rankScale = "scale-105 my-2";
             } else if (index === 1) {
               rankStyle = "bg-slate-50 border-slate-200 shadow-sm border-b-4 border-slate-300";
               rankIcon = "🥈";
             } else if (index === 2) {
               rankStyle = "bg-orange-50 border-orange-200 shadow-sm border-b-4 border-orange-300";
               rankIcon = "🥉";
             }

             return (
               <div key={user.id || index} className={`p-3 rounded-2xl border-2 flex items-center gap-4 transition-all hover:scale-[1.02] ${rankStyle} ${rankScale}`}>
                  <div className="w-8 font-black text-slate-400 text-center text-lg">{rankIcon}</div>
                  <div className="w-12 h-12 rounded-full bg-white border-2 border-slate-100 flex items-center justify-center text-2xl shadow-sm">
                    {user.avatar}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="font-bold text-slate-800 truncate">{user.username}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Nível {user.level}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-black text-lg ${sortBy === 'wins' ? 'text-yellow-600' : 'text-purple-600'}`}>
                      {sortBy === 'wins' ? user.wins : user.level}
                    </p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase">{sortBy === 'wins' ? 'Vitórias' : 'Nível'}</p>
                  </div>
               </div>
             );
           })
         )}
         
         {!loading && sortedUsers.length === 0 && (
            <div className="text-center py-10 text-slate-400 bg-slate-50 rounded-3xl border-2 border-slate-100 border-dashed">
              <p className="text-3xl mb-2">🏜️</p>
              <p className="font-bold">Nenhum jogador encontrado.</p>
              <p className="text-xs">Seja o primeiro a vencer!</p>
            </div>
         )}
       </div>
       
       <button onClick={() => setScreen('welcome')} className="text-slate-500 font-bold hover:text-pink-600 transition-colors py-3 uppercase tracking-widest text-xs shrink-0">← Voltar</button>
    </div>
  );
};
