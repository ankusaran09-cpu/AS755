
import React, { useEffect, useState } from 'react';
import { GameResult, ColorChoice, BigSmallChoice } from '../types';

interface GamePopupProps {
  result: GameResult;
  payout: number;
  onClose: () => void;
}

const GamePopup: React.FC<GamePopupProps> = ({ result, payout, onClose }) => {
  const [seconds, setSeconds] = useState(5);
  const isWin = payout > 0;

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

      {/* Popup Content */}
      <div className={`relative w-full max-w-xs rounded-[2rem] overflow-hidden shadow-2xl animate-pop-in ${isWin ? 'bg-gradient-to-b from-[#ff7e5f] to-[#feb47b]' : 'bg-gradient-to-b from-[#a1c4fd] to-[#c2e9fb]'}`}>
        
        {/* Top Icon Area */}
        <div className="flex justify-center pt-8 pb-4 relative">
          <div className={`w-24 h-24 rounded-full flex items-center justify-center shadow-lg border-4 border-white/30 ${isWin ? 'bg-[#ff9a8b]' : 'bg-[#93a5cf]'}`}>
             {/* Rocket Icon */}
             <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13.13 22.19L11.5 18.35L10.3 19.15C10.1 19.28 9.94 19.45 9.81 19.66C9.69 19.86 9.62 20.09 9.62 20.34V22.19H13.13ZM15.63 22.19V20.34C15.63 20.09 15.56 19.86 15.44 19.66C15.31 19.45 15.15 19.28 14.95 19.15L13.75 18.35L12.12 22.19H15.63ZM12 2C10.9 2 10 2.9 10 4V6H14V4C14 2.9 13.1 2 12 2ZM10 7C7.79 7 6 8.79 6 11V16.27L10.26 13.43C10.74 13.11 11.35 13 12 13C12.65 13 13.26 13.11 13.74 13.43L18 16.27V11C18 8.79 16.21 7 14 7H10Z" />
             </svg>
          </div>
          {/* Wings Decoration */}
          <div className="absolute top-10 left-1/2 -translate-x-1/2 w-48 h-20 opacity-40 pointer-events-none">
             <svg viewBox="0 0 200 100" className="w-full h-full text-white" fill="currentColor">
                <path d="M0,50 Q50,0 100,50 T200,50 T100,50 T0,50" />
             </svg>
          </div>
        </div>

        {/* Title */}
        <div className="text-center text-white px-4">
          <h2 className="text-3xl font-black italic tracking-tight mb-4">
            {isWin ? 'Congratulations' : 'Sorry'}
          </h2>
          
          {/* Lottery Results Indicators */}
          <div className="flex items-center justify-center gap-2 mb-6">
             <span className="text-[10px] opacity-80 font-medium">Lottery results</span>
             <div className="flex items-center gap-1.5">
                {result.colors.map((c, i) => (
                  <span key={i} className={`px-2 py-0.5 rounded text-[10px] font-bold text-white shadow-sm ${c === 'GREEN' ? 'bg-green-500' : c === 'RED' ? 'bg-red-500' : 'bg-purple-500'}`}>
                    {c.charAt(0) + c.slice(1).toLowerCase()}
                  </span>
                ))}
                <span className="w-5 h-5 rounded-full bg-white text-gray-800 text-[10px] font-bold flex items-center justify-center shadow-sm">
                  {result.number}
                </span>
                <span className="px-2 py-0.5 rounded bg-white/20 text-[10px] font-bold text-white border border-white/30">
                  {result.bigSmall === 'BIG' ? 'Big' : 'Small'}
                </span>
             </div>
          </div>
        </div>

        {/* Ticket Content */}
        <div className="px-6 pb-10">
          <div className="bg-white rounded-xl shadow-inner p-6 text-center relative overflow-hidden">
             {/* Decorative curves on edges of the ticket */}
             <div className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-8 bg-current opacity-10 rounded-r-full -ml-2" style={{ color: isWin ? '#ff7e5f' : '#a1c4fd' }}></div>
             <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-8 bg-current opacity-10 rounded-l-full -mr-2" style={{ color: isWin ? '#ff7e5f' : '#a1c4fd' }}></div>
             
             {isWin ? (
               <>
                 <p className="text-red-500 text-sm font-bold mb-1">Bonus</p>
                 <p className="text-red-500 text-4xl font-black mb-4">₹{payout.toFixed(2)}</p>
               </>
             ) : (
               <p className="text-blue-500 text-4xl font-black my-4">Loss</p>
             )}
             
             <p className="text-[9px] text-gray-400 font-medium">
               Period: {result.mode === '30S' ? '30 Sec' : result.mode.replace('M', ' Minute')} {result.periodId}
             </p>
          </div>
          
          {isWin && (
            <div className="mt-4 flex items-center justify-center gap-2">
                <div className="w-4 h-4 rounded-full border border-white flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <span className="text-[10px] text-white font-medium">{seconds} seconds auto close</span>
            </div>
          )}
        </div>

        {/* Close Button Footer */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-center pb-2">
            <button 
                onClick={onClose}
                className="w-8 h-8 rounded-full border border-white/50 text-white flex items-center justify-center hover:bg-white/10 transition mb-[-40px] translate-y-[-10px]"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
        </div>
      </div>

      <style>{`
        @keyframes pop-in {
          0% { transform: scale(0.8); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-pop-in {
          animation: pop-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      `}</style>
    </div>
  );
};

export default GamePopup;
