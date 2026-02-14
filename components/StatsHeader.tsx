
import React from 'react';

interface StatsHeaderProps {
  balance: number;
  periodId: string;
  timeLeft: number;
}

const StatsHeader: React.FC<StatsHeaderProps> = ({ balance, periodId, timeLeft }) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-8">
      <div className="flex-1 glass-effect p-6 rounded-3xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition">
          <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.82v-1.91c-1.57-.24-3.07-.94-4.24-2.04l1.29-1.29c.94.81 2.15 1.27 3.4 1.34V13.1c-1.89-.48-3.41-1.39-3.41-3.6 0-1.89 1.4-3.32 3.41-3.64V4h2.82v1.94c1.49.2 2.89.83 3.98 1.83l-1.3 1.3c-.8-.69-1.84-1.06-2.91-1.11v2.9c1.89.48 3.42 1.39 3.42 3.6 0 1.95-1.4 3.32-3.41 3.63zM10.5 8.42c0 .63.45 1.05 1.25 1.25V7.17c-.8.09-1.25.53-1.25 1.25zm3 7.16c0-.63-.45-1.05-1.25-1.25v2.5c.8-.1 1.25-.53 1.25-1.25z"/></svg>
        </div>
        <p className="text-gray-400 text-sm mb-1 uppercase tracking-widest font-semibold">Available Balance</p>
        <h2 className="text-4xl font-bold text-white">₹{balance.toLocaleString()}</h2>
        <div className="flex gap-2 mt-4">
          <button className="bg-green-600 hover:bg-green-500 text-xs font-bold px-4 py-1.5 rounded-full transition">Recharge</button>
          <button className="bg-white/10 hover:bg-white/20 text-xs font-bold px-4 py-1.5 rounded-full transition">Withdraw</button>
        </div>
      </div>

      <div className="flex flex-col gap-2 w-full md:w-64">
        <div className="glass-effect p-4 rounded-2xl flex items-center justify-between">
          <span className="text-xs text-gray-400 uppercase">Period</span>
          <span className="font-mono font-bold text-blue-400">{periodId}</span>
        </div>
        <div className="glass-effect p-4 rounded-2xl flex items-center justify-between">
          <span className="text-xs text-gray-400 uppercase">Timer</span>
          <span className={`font-mono text-2xl font-bold ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-green-500'}`}>
            00:{timeLeft.toString().padStart(2, '0')}
          </span>
        </div>
      </div>
    </div>
  );
};

export default StatsHeader;
