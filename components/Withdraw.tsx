
import React, { useState } from 'react';
import { Transaction } from '../types';

interface WithdrawProps {
  balance: number;
  history: Transaction[];
  onBack: () => void;
  onWithdraw: (amount: number, details: string) => void;
}

const Withdraw: React.FC<WithdrawProps> = ({ balance, history, onBack, onWithdraw }) => {
  const [amount, setAmount] = useState<string>('');
  const [method, setMethod] = useState<'BANK' | 'UPI'>('BANK');
  const [view, setView] = useState<'FORM' | 'HISTORY'>('FORM');
  
  // Bank fields
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [holderName, setHolderName] = useState('');
  const [ifsc, setIfsc] = useState('');

  // UPI fields
  const [upiId, setUpiId] = useState('');
  const [upiName, setUpiName] = useState('');

  const handleWithdraw = () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert("Please enter a valid amount");
      return;
    }
    if (numAmount > balance) {
      alert("Insufficient balance");
      return;
    }

    let details = "";
    if (method === 'BANK') {
      if (!bankName || !accountNumber || !holderName || !ifsc) {
        alert("Please fill all bank details");
        return;
      }
      details = `Bank: ${bankName} | A/C: ${accountNumber}`;
    } else {
      if (!upiId || !upiName) {
        alert("Please fill all UPI details");
        return;
      }
      details = `UPI: ${upiId}`;
    }

    onWithdraw(numAmount, details);
    alert("Withdrawal request submitted successfully!");
    onBack();
  };

  if (view === 'HISTORY') {
    return (
      <div className="flex flex-col min-h-screen bg-[#f1f3f8]">
        <div className="bg-white px-4 py-4 flex items-center justify-between border-b border-gray-100">
          <button onClick={() => setView('FORM')} className="text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
          </button>
          <h1 className="text-lg font-semibold text-gray-800">Withdraw History</h1>
          <div className="w-6"></div>
        </div>
        <div className="p-4 space-y-3">
          {history.length === 0 ? (
            <div className="py-20 text-center text-gray-400">No withdrawal history found.</div>
          ) : (
            history.map(tx => (
              <div key={tx.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-50 flex justify-between items-center">
                <div>
                  <p className="text-xs text-gray-400">{new Date(tx.timestamp).toLocaleString()}</p>
                  <p className="text-sm font-bold text-gray-800">₹{tx.amount.toLocaleString()}</p>
                  <p className="text-[10px] text-gray-500 truncate max-w-[150px]">{tx.details}</p>
                </div>
                <div className={`text-xs font-bold px-3 py-1 rounded-full ${tx.status === 'SUCCESS' ? 'bg-green-100 text-green-600' : tx.status === 'PENDING' ? 'bg-yellow-100 text-yellow-600' : 'bg-red-100 text-red-600'}`}>
                  {tx.status}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#f1f3f8]">
      <div className="bg-white px-4 py-4 flex items-center justify-between border-b border-gray-100 sticky top-0 z-20">
        <button onClick={onBack} className="text-gray-600">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
        </button>
        <h1 className="text-lg font-semibold text-gray-800">Withdraw</h1>
        <button onClick={() => setView('HISTORY')} className="text-sm text-gray-600 font-medium">History</button>
      </div>

      <div className="p-4 space-y-4">
        <div className="main-gradient rounded-2xl p-6 text-white shadow-lg relative overflow-hidden h-36">
          <div className="flex items-center gap-2 mb-2 opacity-90">
             <div className="w-5 h-5 bg-yellow-400 rounded-sm flex items-center justify-center text-[10px] text-red-600">💰</div>
             <span className="text-sm font-medium">Withdrawable Balance</span>
          </div>
          <h2 className="text-3xl font-bold">₹{balance.toLocaleString()}</h2>
        </div>

        <div className="flex bg-white rounded-xl p-1 shadow-sm">
            <button onClick={() => setMethod('BANK')} className={`flex-1 py-3 rounded-lg text-sm font-bold transition ${method === 'BANK' ? 'bg-red-500 text-white shadow-md' : 'text-gray-400'}`}>
                Bank Card
            </button>
            <button onClick={() => setMethod('UPI')} className={`flex-1 py-3 rounded-lg text-sm font-bold transition ${method === 'UPI' ? 'bg-red-500 text-white shadow-md' : 'text-gray-400'}`}>
                UPI Wallet
            </button>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm space-y-5">
            {method === 'BANK' ? (
                <>
                    <input type="text" placeholder="Bank Name" value={bankName} onChange={(e) => setBankName(e.target.value)} className="w-full bg-gray-50 rounded-xl px-4 py-3 border border-gray-100 outline-none focus:border-red-300 text-sm"/>
                    <input type="text" placeholder="Account Number" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} className="w-full bg-gray-50 rounded-xl px-4 py-3 border border-gray-100 outline-none focus:border-red-300 text-sm"/>
                    <input type="text" placeholder="Holder Name" value={holderName} onChange={(e) => setHolderName(e.target.value)} className="w-full bg-gray-50 rounded-xl px-4 py-3 border border-gray-100 outline-none focus:border-red-300 text-sm"/>
                    <input type="text" placeholder="IFSC Code" value={ifsc} onChange={(e) => setIfsc(e.target.value)} className="w-full bg-gray-50 rounded-xl px-4 py-3 border border-gray-100 outline-none focus:border-red-300 text-sm"/>
                </>
            ) : (
                <>
                    <input type="text" placeholder="UPI ID (example@upi)" value={upiId} onChange={(e) => setUpiId(e.target.value)} className="w-full bg-gray-50 rounded-xl px-4 py-3 border border-gray-100 outline-none focus:border-red-300 text-sm"/>
                    <input type="text" placeholder="Account Holder Name" value={upiName} onChange={(e) => setUpiName(e.target.value)} className="w-full bg-gray-50 rounded-xl px-4 py-3 border border-gray-100 outline-none focus:border-red-300 text-sm"/>
                </>
            )}

            <div className="pt-4 border-t border-gray-50">
                <input type="number" placeholder="Min ₹100" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full bg-gray-50 rounded-xl pl-8 pr-4 py-4 border border-gray-100 outline-none focus:border-red-300 text-lg font-bold text-gray-700"/>
            </div>

            <button onClick={handleWithdraw} className="w-full login-gradient text-white py-4 rounded-full font-bold">
                Withdraw
            </button>
        </div>

        <div className="bg-white rounded-2xl p-6 space-y-4 text-xs text-gray-500">
            <h3 className="font-bold text-gray-700">Withdrawal instructions</h3>
            <ul className="space-y-2">
                <li>◆ Withdrawal time: 24/7</li>
                <li>◆ The minimum withdrawal amount is ₹100.</li>
                <li>◆ Arrival time usually varies from 10 minutes to 24 hours.</li>
            </ul>
        </div>
      </div>
    </div>
  );
};

export default Withdraw;
