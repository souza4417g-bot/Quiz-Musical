
import React from 'react';

interface FeedbackOverlaysProps {
  feedback: 'correct' | 'wrong' | 'passed' | 'timeout' | null;
  rewardMessage: string | null;
}

export const FeedbackOverlays: React.FC<FeedbackOverlaysProps> = ({ feedback, rewardMessage }) => {
  return (
    <>
      {feedback === 'correct' && (
        <div className="fixed inset-0 z-50 pointer-events-none flex flex-col items-center justify-end pb-12 animate-in fade-in duration-300">
           {rewardMessage && (
             <div className="mb-4 bg-yellow-400 text-yellow-900 px-6 py-2 rounded-full font-black text-xl animate-bounce shadow-lg border-2 border-yellow-200">
               {rewardMessage}
             </div>
           )}
           <div className="text-6xl md:text-8xl animate-bounce drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] font-black text-emerald-500 stroke-text">🎉 ACERTOU! 🎉</div>
        </div>
      )}
      {feedback === 'wrong' && (
        <div className="fixed inset-0 z-50 pointer-events-none flex flex-col items-center justify-end pb-12 animate-in fade-in duration-200">
          <div className="text-6xl md:text-8xl animate-pulse text-red-600 drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] font-black stroke-text">❌ ERROU!</div>
        </div>
      )}
      {feedback === 'passed' && (
        <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center bg-amber-500/20 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="text-6xl md:text-8xl animate-pulse text-amber-600 drop-shadow-2xl font-black">⏩ PASSOU</div>
        </div>
      )}
    </>
  );
};
