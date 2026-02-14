
import React, { useState } from 'react';
import { Transaction } from '../types';

interface DepositProps {
  balance: number;
  history: Transaction[];
  onBack: () => void;
  onDeposit: (amount: number, utr: string) => void;
}

const Deposit: React.FC<DepositProps> = ({ balance, history, onBack, onDeposit }) => {
  const [amount, setAmount] = useState<string>('500');
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'USDT'>('UPI');
  const [step, setStep] = useState<'SELECT' | 'PAY' | 'HISTORY'>('SELECT');
  const [utr, setUtr] = useState('');

  const upiId = "9672250848-1@fam";
  const presets = ['200', '300', '500', '1K', '2.5K', '5K', '10K', '25K', '50K'];

  const parseAmount = (val: string) => {
    if (val.endsWith('K')) return parseFloat(val) * 1000;
    return parseFloat(val);
  };

  const handleDepositInitiate = () => {
    const numAmount = parseAmount(amount);
    if (!isNaN(numAmount) && numAmount > 0) {
      setStep('PAY');
    }
  };

  const handleConfirmPayment = () => {
    const numAmount = parseAmount(amount);
    if (utr.length === 12) {
      onDeposit(numAmount, utr);
      alert("Deposit request submitted successfully! Your balance will be updated after verification.");
      onBack(); // Go back to game view just like withdrawal
    } else {
      alert("Please enter a valid 12-digit UTR/Transaction ID");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("UPI ID Copied!");
  };

  if (step === 'HISTORY') {
    return (
      <div className="flex flex-col min-h-screen bg-[#f1f3f8]">
        <div className="bg-white px-4 py-4 flex items-center justify-between border-b border-gray-100 sticky top-0 z-20">
          <button onClick={() => setStep('SELECT')} className="text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
          </button>
          <h1 className="text-lg font-semibold text-gray-800">Deposit History</h1>
          <div className="w-6"></div>
        </div>
        <div className="p-4 space-y-3">
          {history.length === 0 ? (
            <div className="py-20 text-center text-gray-400">No deposit history found.</div>
          ) : (
            history.map(tx => (
              <div key={tx.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-50 flex justify-between items-center">
                <div>
                  <p className="text-xs text-gray-400">{new Date(tx.timestamp).toLocaleString()}</p>
                  <p className="text-sm font-bold text-gray-800">₹{tx.amount.toLocaleString()}</p>
                  <p className="text-[10px] text-gray-500">{tx.details}</p>
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

  if (step === 'PAY') {
    return (
      <div className="flex flex-col min-h-screen bg-[#f1f3f8]">
        <div className="bg-white px-4 py-4 flex items-center justify-between border-b border-gray-100 sticky top-0 z-20">
          <button onClick={() => setStep('SELECT')} className="text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
          </button>
          <h1 className="text-lg font-semibold text-gray-800">Payment Details</h1>
          <div className="w-6"></div>
        </div>

        <div className="p-4 space-y-6">
          <div className="bg-white rounded-3xl p-8 flex flex-col items-center shadow-xl space-y-6">
            <div className="text-center">
              <p className="text-gray-400 text-sm font-medium mb-1">Payable Amount</p>
              <h2 className="text-4xl font-black text-red-500">₹{parseAmount(amount).toLocaleString()}</h2>
            </div>

            <div className="bg-[#2c1d11] p-6 rounded-3xl shadow-lg border-4 border-white/10 w-full max-w-[240px] aspect-square flex items-center justify-center relative overflow-hidden">
               <div className="bg-white p-2 rounded-lg relative z-10">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=${upiId}&am=${parseAmount(amount)}&cu=INR`} 
                    alt="QR Code" 
                    className="w-40 h-40"
                  />
               </div>
               <div className="absolute inset-0 opacity-10 flex items-center justify-center">
                  <svg className="w-40 h-40 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M21 16.5C21 16.88 20.79 17.21 20.47 17.38L12.57 21.82C12.41 21.94 12.21 22 12 22C11.79 22 11.59 21.94 11.43 21.82L3.53 17.38C3.21 17.21 3 16.88 3 16.5V7.5C3 7.12 3.21 6.79 3.53 6.62L11.43 2.18C11.59 2.06 11.79 2 12 2C12.21 2 12.41 2.06 12.57 2.18L20.47 6.62C20.79 6.79 21 7.12 21 7.5V16.5Z"/></svg>
               </div>
            </div>

            <div className="w-full space-y-3">
              <div className="flex flex-col items-center gap-1">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">UPI ID</p>
                <div className="flex items-center gap-2 bg-gray-50 px-4 py-3 rounded-xl border border-gray-100 w-full justify-between">
                  <span className="font-mono text-sm font-bold text-gray-700">{upiId}</span>
                  <button 
                    onClick={() => copyToClipboard(upiId)}
                    className="bg-red-500 text-white text-[10px] px-3 py-1 rounded-lg font-bold shadow-sm active:scale-90 transition"
                  >
                    COPY
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-md space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-red-500 font-bold">UTR</span>
              <h3 className="text-sm font-bold text-gray-700">Enter 12-digit UTR number</h3>
            </div>
            <input 
              type="text" 
              maxLength={12}
              value={utr}
              onChange={(e) => setUtr(e.target.value.replace(/\D/g, ''))}
              placeholder="Please enter 12-digit UTR number"
              className="w-full bg-gray-50 border border-gray-100 rounded-xl py-4 px-6 text-sm font-bold outline-none focus:ring-1 focus:ring-red-300"
            />
            <button 
              onClick={handleConfirmPayment}
              className="w-full login-gradient text-white py-4 rounded-full font-bold shadow-lg shadow-red-200 active:scale-95 transition"
            >
              Confirm Payment
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#f1f3f8]">
      <div className="bg-white px-4 py-4 flex items-center justify-between border-b border-gray-100 sticky top-0 z-20">
        <button onClick={onBack} className="text-gray-600 text-xl">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
        </button>
        <h1 className="text-lg font-semibold text-gray-800">Deposit</h1>
        <button onClick={() => setStep('HISTORY')} className="text-sm text-gray-600 font-medium">Deposit history</button>
      </div>

      <div className="p-4 space-y-4">
        <div className="main-gradient rounded-2xl p-6 text-white shadow-lg relative overflow-hidden h-36">
          <div className="flex items-center gap-2 mb-2 opacity-90">
             <div className="w-5 h-5 bg-yellow-400 rounded-sm flex items-center justify-center text-[10px] text-red-600">💰</div>
             <span className="text-sm font-medium">Balance</span>
          </div>
          <h2 className="text-3xl font-bold">₹{balance.toLocaleString()}</h2>
          <div className="absolute bottom-4 right-6 text-[10px] font-mono opacity-60 tracking-widest">
              **** **** **** ****
          </div>
        </div>

        <div className="flex gap-4">
            <button onClick={() => setPaymentMethod('UPI')} className={`flex-1 p-4 rounded-xl border-2 transition flex flex-col items-center gap-2 ${paymentMethod === 'UPI' ? 'border-red-500 bg-red-50' : 'border-transparent bg-white shadow-sm'}`}>
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg" alt="UPI" className="w-8" />
                </div>
                <span className="text-[10px] font-bold text-gray-700">UPI x QR manual</span>
            </button>
            <button onClick={() => setPaymentMethod('USDT')} className={`flex-1 p-4 rounded-xl border-2 transition flex flex-col items-center gap-2 ${paymentMethod === 'USDT' ? 'border-red-500 bg-red-50' : 'border-transparent bg-white shadow-sm'}`}>
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <span className="text-yellow-600 text-xl font-bold">₮</span>
                </div>
                <span className="text-[10px] font-bold text-gray-700">USDT x QR</span>
            </button>
        </div>

        <div className="bg-[#e9eff6] rounded-2xl p-4 space-y-4">
            <div className="flex items-center gap-2 text-red-500">
                <span className="text-lg">🏷️</span>
                <h3 className="text-sm font-bold text-gray-700">Deposit manual amount</h3>
            </div>
            <div className="grid grid-cols-3 gap-2">
                {presets.map(p => (
                    <button key={p} onClick={() => setAmount(p)} className={`bg-white py-3 rounded-lg text-sm font-bold shadow-sm active:scale-95 transition ${amount === p ? 'border border-red-400 text-red-500' : 'text-gray-600'}`}>
                        <span className="text-gray-300 mr-1">₹</span> {p}
                    </button>
                ))}
            </div>
            <input type="text" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full bg-white rounded-full py-4 px-6 text-sm font-bold text-gray-700 outline-none shadow-sm" placeholder="Enter amount"/>
        </div>

        <button onClick={handleDepositInitiate} className="w-full main-gradient text-white py-4 rounded-full font-bold shadow-lg shadow-red-200">
            Deposit
        </button>

        <div className="bg-white rounded-2xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 text-red-500">
                <span className="text-xl">📕</span>
                <h3 className="text-sm font-bold text-gray-700">Recharge instructions</h3>
            </div>
            <ul className="space-y-4">
                {["If the transfer time is up, please fill out the deposit form again.", "The transfer amount must match the order you created.", "If you transfer the wrong amount, our company will not be responsible.", "Note: do not cancel the deposit order after the money has been transferred."].map((text, i) => (
                    <li key={i} className="flex gap-3">
                        <span className="text-red-400 mt-1">◆</span>
                        <p className="text-[11px] leading-relaxed text-gray-500 font-medium">{text}</p>
                    </li>
                ))}
            </ul>
        </div>
      </div>
    </div>
  );
};

export default Deposit;
