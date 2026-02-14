
import React from 'react';
import { GameResult } from '../types';

interface HistoryTableProps {
  history: GameResult[];
}

const HistoryTable: React.FC<HistoryTableProps> = ({ history }) => {
  return (
    <div className="bg-white">
      <div className="flex p-3 border-b border-gray-100 text-sm">
        <div className="flex-1 text-gray-500">Period</div>
        <div className="w-16 text-center text-gray-500">Number</div>
        <div className="w-20 text-center text-gray-500">Big Small</div>
        <div className="w-16 text-right text-gray-500">Color</div>
      </div>
      
      <div className="divide-y divide-gray-50">
        {history.map((h) => (
          <div key={h.periodId} className="flex items-center p-3 text-sm">
            <div className="flex-1 font-mono text-gray-700">{h.periodId.slice(-6)}</div>
            <div className="w-16 text-center font-bold text-lg">
                <span className={h.number === 0 || h.number === 5 ? 'text-purple-500' : h.colors.includes('RED') ? 'text-red-500' : 'text-green-500'}>
                    {h.number}
                </span>
            </div>
            <div className="w-20 text-center text-gray-600">
                {h.bigSmall === 'BIG' ? 'Big' : 'Small'}
            </div>
            <div className="w-16 flex justify-end gap-1">
                {h.colors.map((c, i) => (
                    <span key={i} className={`win-dot ${c === 'RED' ? 'dot-red' : c === 'GREEN' ? 'dot-green' : 'dot-violet'}`}></span>
                ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center gap-4 py-4 bg-gray-50">
          <button className="w-10 h-10 flex items-center justify-center bg-gray-200 rounded-lg text-gray-400">{'<'}</button>
          <span className="text-sm font-medium">1 / 23633</span>
          <button className="w-10 h-10 flex items-center justify-center bg-red-500 rounded-lg text-white font-bold">{'>'}</button>
      </div>
    </div>
  );
};

export default HistoryTable;
