
import React, { useState } from 'react';
import { ColorChoice, BigSmallChoice, GameMode } from '../types';

interface BettingInterfaceProps {
  onBet: (selection: ColorChoice | number | BigSmallChoice, amount: number) => void;
  disabled: boolean;
  balance: number;
  activeMode: GameMode;
}

const BettingInterface: React.FC<BettingInterfaceProps> = ({ onBet, disabled, balance, activeMode }) => {
  const [selectedItem, setSelectedItem] = useState<ColorChoice | number | BigSmallChoice | null>(null);
  const [betAmount, setBetAmount] = useState<number>(1);
  const [multiplier, setMultiplier] = useState<number>(1);
  const [quantity, setQuantity] = useState<number>(1);
  const [agreed, setAgreed] = useState<boolean>(true);

  const amounts = [1, 10, 100, 1000];
  const multipliers = [1, 5, 10, 20, 50, 100];
  const numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

  const handleOpenSheet = (selection: ColorChoice | number | BigSmallChoice) => {
    if (disabled) return;
    setSelectedItem(selection);
    setQuantity(1);
    setMultiplier(1);
  };

  const handleConfirmBet = () => {
    if (selectedItem !== null && agreed && !disabled) {
      const total = betAmount * multiplier * quantity;
      onBet(selectedItem, total);
      setSelectedItem(null);
    }
  };

  const getSelectionLabel = (val: ColorChoice | number | BigSmallChoice) => {
    if (typeof val === 'number') return val.toString();
    return val.toLowerCase();
  };

  const getThemeColor = (val: ColorChoice | number | BigSmallChoice) => {
    if (val === 'GREEN') return 'bg-[#22c55e]';
    if (val === 'RED') return 'bg-[#ef4444]';
    if (val === 'VIOLET') return 'bg-[#a855f7]';
    if (val === 'BIG') return 'bg-[#fbbf24]';
    if (val === 'SMALL') return 'bg-[#60a5fa]';
    return 'bg-[#fbbf24]'; // Default for numbers
  };

  return (
    <div className="p-4 space-y-6 bg-white/5 backdrop-blur-sm relative rounded-b-3xl">
      {/* Main Color Buttons */}
      <div className="flex gap-3">
        <button 
            onClick={() => handleOpenSheet('GREEN')}
            disabled={disabled}
            className="flex-1 py-4 bg-[#22c55e] text-white rounded-xl font-black shadow-lg active:scale-95 transition-transform disabled:opacity-50"
        >
            Green
        </button>
        <button 
            onClick={() => handleOpenSheet('VIOLET')}
            disabled={disabled}
            className="flex-1 py-4 bg-[#a855f7] text-white rounded-xl font-black shadow-lg active:scale-95 transition-transform disabled:opacity-50"
        >
            Violet
        </button>
        <button 
            onClick={() => handleOpenSheet('RED')}
            disabled={disabled}
            className="flex-1 py-4 bg-[#ef4444] text-white rounded-xl font-black shadow-lg active:scale-95 transition-transform disabled:opacity-50"
        >
            Red
        </button>
      </div>

      {/* Numbers Grid */}
      <div className="grid grid-cols-5 gap-3 px-1">
        {numbers.map((num) => {
            const isRed = [0, 2, 4, 6, 8].includes(num);
            const isGreen = [1, 3, 5, 7, 9].includes(num);
            
            let borderColor = "border-white/20";
            let textColor = "text-white";
            if (num === 0) borderColor = "border-[#ef4444]"; 
            else if (num === 5) borderColor = "border-[#22c55e]";
            else if (isRed) { borderColor = "border-red-400"; textColor = "text-red-400"; }
            else if (isGreen) { borderColor = "border-green-400"; textColor = "text-green-400"; }

            return (
                <button
                    key={num}
                    onClick={() => handleOpenSheet(num)}
                    disabled={disabled}
                    className={`w-11 h-11 flex items-center justify-center rounded-full border-2 bg-white/10 ${borderColor} ${textColor} font-black text-lg active:scale-90 transition disabled:opacity-30`}
                >
                    {num}
                </button>
            );
        })}
      </div>

      {/* Big / Small Buttons */}
      <div className="flex gap-3 h-12">
        <button 
            onClick={() => handleOpenSheet('BIG')}
            disabled={disabled}
            className="flex-1 big-btn text-white font-black text-lg rounded-xl shadow-lg active:scale-95 transition disabled:opacity-50"
        >
            Big
        </button>
        <button 
            onClick={() => handleOpenSheet('SMALL')}
            disabled={disabled}
            className="flex-1 small-btn text-white font-black text-lg rounded-xl shadow-lg active:scale-95 transition disabled:opacity-50"
        >
            Small
        </button>
      </div>

      {/* Betting Modal (Bottom Sheet) */}
      {selectedItem !== null && (
        <div className="fixed inset-0 z-[200] flex items-end justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedItem(null)}></div>
            
            {/* Sheet Content */}
            <div className="relative w-full max-w-md bg-white rounded-t-[2.5rem] overflow-hidden animate-slide-up shadow-2xl flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className={`${getThemeColor(selectedItem)} p-6 text-white text-center flex-shrink-0`}>
                    <h3 className="text-xl font-bold mb-3 uppercase tracking-tighter">Win Go {activeMode === '30S' ? '30 sec' : activeMode.replace('M', ' min')}</h3>
                    <div className="bg-white rounded-md text-gray-800 py-2 px-10 inline-block font-black text-sm uppercase">
                        Select {getSelectionLabel(selectedItem)}
                    </div>
                </div>

                <div className="p-6 pt-8 space-y-6 overflow-y-auto">
                    {/* Balance Selection */}
                    <div className="flex items-center">
                        <span className="text-xs font-black w-24 text-gray-400 uppercase tracking-widest">Amount</span>
                        <div className="flex-1 flex gap-2">
                            {amounts.map(a => (
                                <button 
                                    key={a}
                                    onClick={() => setBetAmount(a)}
                                    className={`flex-1 py-2 rounded-lg text-xs font-black transition ${betAmount === a ? `${getThemeColor(selectedItem)} text-white shadow-md` : 'bg-gray-100 text-gray-400'}`}
                                >
                                    {a}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Quantity Selection */}
                    <div className="flex items-center">
                        <span className="text-xs font-black w-24 text-gray-400 uppercase tracking-widest">Quantity</span>
                        <div className="flex-1 flex items-center justify-between border border-gray-100 rounded-xl px-2 h-12 bg-gray-50">
                            <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-10 h-10 text-2xl font-black text-gray-300 active:text-gray-600">-</button>
                            <span className="text-sm font-black text-gray-700">{quantity}</span>
                            <button onClick={() => setQuantity(q => q + 1)} className="w-10 h-10 text-2xl font-black text-gray-300 active:text-gray-600">+</button>
                        </div>
                    </div>

                    {/* Multiplier Selection */}
                    <div className="flex items-center ml-24">
                        <div className="flex-1 flex flex-wrap gap-2">
                            {multipliers.map(m => (
                                <button 
                                    key={m}
                                    onClick={() => setMultiplier(m)}
                                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition ${multiplier === m ? `${getThemeColor(selectedItem)} text-white shadow-sm` : 'bg-gray-100 text-gray-400'}`}
                                >
                                    X{m}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Agreement */}
                    <div className="flex items-center gap-2 pt-2">
                        <div 
                            onClick={() => setAgreed(!agreed)}
                            className={`w-5 h-5 rounded-md flex items-center justify-center cursor-pointer transition ${agreed ? 'bg-red-500 text-white' : 'border-2 border-gray-200 text-transparent'}`}
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"></path></svg>
                        </div>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">I agree <span className="text-red-400 cursor-pointer">«Pre-sale rules»</span></span>
                    </div>
                </div>

                {/* Footer Buttons - Fixed to bottom */}
                <div className="flex h-16 flex-shrink-0 mt-auto">
                    <button 
                        onClick={() => setSelectedItem(null)}
                        className="w-[35%] bg-gray-800 text-white font-black text-xs uppercase tracking-widest active:opacity-90"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleConfirmBet}
                        disabled={!agreed}
                        className={`flex-1 ${getThemeColor(selectedItem)} text-white font-black text-base uppercase tracking-widest active:opacity-90 disabled:opacity-50`}
                    >
                        Total ₹{betAmount * multiplier * quantity}
                    </button>
                </div>
            </div>
        </div>
      )}

      <style>{`
        @keyframes slide-up {
            from { transform: translateY(100%); }
            to { transform: translateY(0); }
        }
        .animate-slide-up {
            animation: slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </div>
  );
};

export default BettingInterface;
