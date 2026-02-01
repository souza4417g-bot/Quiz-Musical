
import React from 'react';
import { User, GameScreen, Theme } from '../types';
import { SHOP_ITEMS } from '../constants';
import { userService } from '../services/userService';

interface ShopScreenProps {
  currentUser: User | null;
  setCurrentUser: (user: User) => void;
  setScreen: (screen: GameScreen) => void;
  activeTheme: Theme;
}

export const ShopScreen: React.FC<ShopScreenProps> = ({ currentUser, setCurrentUser, setScreen, activeTheme }) => {
  if (!currentUser) return null;

  const handlePurchase = (itemId: string) => {
    const success = userService.purchaseItem(currentUser.id, itemId);
    if (success) {
      // Atualiza o estado local
      const updatedUser = userService.getCurrentUser();
      if (updatedUser) setCurrentUser(updatedUser);
      // Feedback visual simples pode ser adicionado aqui
    } else {
      alert('Moedas insuficientes!');
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-right duration-500">
      <div className="flex items-center justify-between bg-gradient-to-r from-yellow-50 to-orange-50 p-5 rounded-3xl border-2 border-yellow-200 shadow-md">
         <div>
            <h2 className="text-2xl font-black text-yellow-800 tracking-tight">Loja Virtual</h2>
            <p className="text-xs font-bold text-yellow-600 uppercase">Invista suas moedas</p>
         </div>
         <div className="text-2xl font-black bg-white text-yellow-600 px-4 py-2 rounded-2xl shadow-sm border border-yellow-200 flex items-center gap-2">
            <span>💰</span> {currentUser.coins}
         </div>
      </div>

      <div className="grid grid-cols-1 gap-3 max-h-[60vh] overflow-y-auto px-2 py-1 scrollbar-hide">
        {SHOP_ITEMS.map(item => (
           <div key={item.id} className="bg-white p-4 rounded-3xl border-2 border-slate-100 hover:border-yellow-300 hover:shadow-md transition-all flex items-center justify-between group">
              <div className="flex items-center gap-4">
                 <div className="text-4xl bg-slate-50 group-hover:bg-yellow-50 p-3 rounded-2xl transition-colors">{item.icon}</div>
                 <div className="text-left">
                    <h3 className="font-black text-slate-800 text-lg">{item.name}</h3>
                    <p className="text-xs text-slate-400 font-bold group-hover:text-slate-500">{item.desc}</p>
                    <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold bg-slate-100 inline-block px-2 py-0.5 rounded-md">Em estoque: {(currentUser.inventory as any)[item.key] || 0}</p>
                 </div>
              </div>
              <button 
                onClick={() => handlePurchase(item.id)}
                disabled={currentUser.coins < item.price}
                className={`px-5 py-3 rounded-2xl font-black text-sm transition-all border-b-4 active:border-b-0 active:translate-y-1 ${
                  currentUser.coins >= item.price 
                  ? 'bg-emerald-500 text-white border-emerald-700 shadow-emerald-200 shadow-lg hover:bg-emerald-400' 
                  : 'bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed'
                }`}
              >
                 {item.price} 💰
              </button>
           </div>
        ))}
      </div>

      <button onClick={() => setScreen('welcome')} className="text-slate-500 font-bold hover:text-pink-600 transition-colors py-3 uppercase tracking-widest text-xs">← Voltar</button>
    </div>
  );
};
