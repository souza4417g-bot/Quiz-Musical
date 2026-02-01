
import React from 'react';
import { Theme, GameScreen } from '../types';
import { AVATARS } from '../constants';

interface AuthScreenProps {
  authMode: 'login' | 'register';
  setAuthMode: (mode: 'login' | 'register') => void;
  activeTheme: Theme;
  authUsername: string;
  setAuthUsername: (val: string) => void;
  authPassword: string;
  setAuthPassword: (val: string) => void;
  authAvatar: string;
  setAuthAvatar: (val: string) => void;
  selectingAvatarFor: number | null;
  setSelectingAvatarFor: (val: number | null) => void;
  authError: string | null;
  isAuthLoading: boolean;
  handleAuthSubmit: () => void;
  setScreen: (screen: GameScreen) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  authMode, setAuthMode, activeTheme, authUsername, setAuthUsername,
  authPassword, setAuthPassword, authAvatar, setAuthAvatar,
  selectingAvatarFor, setSelectingAvatarFor, authError, isAuthLoading,
  handleAuthSubmit, setScreen
}) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <h2 className="text-3xl font-black text-slate-800 tracking-tight">
        {authMode === 'login' ? 'Entrar' : 'Criar Conta'}
      </h2>
      
      <div className="bg-slate-100 p-1 rounded-xl flex mb-4">
         <button 
           onClick={() => setAuthMode('login')} 
           className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${authMode === 'login' ? 'bg-white shadow ' + activeTheme.accentColor : 'text-slate-400'}`}
         >
           Login
         </button>
         <button 
           onClick={() => setAuthMode('register')} 
           className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${authMode === 'register' ? 'bg-white shadow ' + activeTheme.accentColor : 'text-slate-400'}`}
         >
           Registrar
         </button>
      </div>

      <div className="space-y-3">
         <input 
           type="text" 
           placeholder="Usuário" 
           className={`w-full p-4 rounded-2xl border-2 border-slate-200 focus:border-opacity-50 outline-none font-bold ${activeTheme.accentColor.replace('text', 'focus:border')}`}
           value={authUsername}
           onChange={(e) => setAuthUsername(e.target.value)}
         />
         <input 
           type="password" 
           placeholder="Senha" 
           className={`w-full p-4 rounded-2xl border-2 border-slate-200 focus:border-opacity-50 outline-none font-bold ${activeTheme.accentColor.replace('text', 'focus:border')}`}
           value={authPassword}
           onChange={(e) => setAuthPassword(e.target.value)}
         />
         
         {authMode === 'register' && (
           <div className="text-left mt-2">
             <p className="text-sm font-bold text-slate-400 mb-2 uppercase">Escolha seu Avatar</p>
             <div className="flex gap-2 items-center mb-2">
               <div className="text-4xl bg-white p-2 rounded-xl border-2 border-slate-100">{authAvatar}</div>
               <button onClick={() => setSelectingAvatarFor(99)} className={`font-bold text-sm underline ${activeTheme.accentColor}`}>Mudar</button>
             </div>
             {selectingAvatarFor === 99 && (
                <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-xl grid grid-cols-6 gap-2 max-h-48 overflow-y-auto z-30">
                  {AVATARS.map((emoji) => <button key={emoji} onClick={() => { setAuthAvatar(emoji); setSelectingAvatarFor(null); }} className="text-3xl hover:scale-125 p-1 transition-transform">{emoji}</button>)}
                </div>
             )}
           </div>
         )}
      </div>

      {authError && (
        <div className="bg-red-100 text-red-600 p-3 rounded-xl font-bold text-sm animate-pulse">
          {authError}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <button 
          onClick={handleAuthSubmit} 
          disabled={isAuthLoading}
          className={`w-full py-4 text-white font-black rounded-2xl transition-colors shadow-lg flex items-center justify-center gap-2 ${activeTheme.buttonGradient} ${isAuthLoading ? 'opacity-70' : ''}`}
        >
          {isAuthLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Verificando...
            </>
          ) : (
            authMode === 'login' ? 'ENTRAR' : 'CRIAR CONTA'
          )}
        </button>
        <button onClick={() => setScreen('welcome')} className="text-slate-400 font-bold text-sm py-2">Voltar</button>
      </div>
   </div>
  );
};
