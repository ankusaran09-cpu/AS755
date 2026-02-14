
import React, { useState, useEffect, useCallback, useRef } from 'react';
import BettingInterface from './components/BettingInterface';
import HistoryTable from './components/HistoryTable';
import Auth from './components/Auth';
import GamePopup from './components/GamePopup';
import Deposit from './components/Deposit';
import Withdraw from './components/Withdraw';
import { GameResult, Bet, ColorChoice, BigSmallChoice, GameMode, Transaction } from './types';
import { getColorByNumber, getBigSmallByNumber, MODE_DURATIONS, BET_MULTIPLIERS } from './constants';

interface ModeState {
  periodId: string;
  timeLeft: number;
  history: GameResult[];
}

const generateSeedHistory = (mode: GameMode, count: number): GameResult[] => {
  const history: GameResult[] = [];
  let basePeriod = 202602140000 + (mode === '30S' ? 3000 : mode === '1M' ? 1000 : mode === '3M' ? 3000 : 5000);
  for (let i = 0; i < count; i++) {
    const num = Math.floor(Math.random() * 10);
    history.push({
      periodId: (basePeriod - i).toString(),
      mode,
      number: num,
      colors: getColorByNumber(num),
      bigSmall: getBigSmallByNumber(num),
      timestamp: Date.now() - (i * MODE_DURATIONS[mode] * 1000)
    });
  }
  return history;
};

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [view, setView] = useState<'GAME' | 'DEPOSIT' | 'WITHDRAW' | 'PROMOTION' | 'ACCOUNT'>('GAME');
  const [balance, setBalance] = useState<number>(1000); 
  const [activeMode, setActiveMode] = useState<GameMode>('30S');
  const [activeTab, setActiveTab] = useState<'GAME' | 'CHART' | 'MY'>('GAME');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [userPhone, setUserPhone] = useState('');
  const [invitePhone, setInvitePhone] = useState('');
  const [isSendingInvite, setIsSendingInvite] = useState(false);
  const [showInviteSuccess, setShowInviteSuccess] = useState(false);
  
  const [modeStates, setModeStates] = useState<Record<GameMode, ModeState>>({
    '30S': { periodId: "202602143001", timeLeft: 30, history: generateSeedHistory('30S', 20) },
    '1M': { periodId: "202602141001", timeLeft: 60, history: generateSeedHistory('1M', 15) },
    '3M': { periodId: "202602143001", timeLeft: 180, history: generateSeedHistory('3M', 10) },
    '5M': { periodId: "202602145001", timeLeft: 300, history: generateSeedHistory('5M', 10) },
  });

  const [myBets, setMyBets] = useState<Bet[]>([]);
  const [showPopup, setShowPopup] = useState<{ result: GameResult; payout: number } | null>(null);
  
  // Ref to handle side effects of result generation without triggering re-renders in the timer
  const latestActiveMode = useRef(activeMode);
  useEffect(() => { latestActiveMode.current = activeMode; }, [activeMode]);

  const triggerResult = useCallback((mode: GameMode) => {
    setModeStates(prev => {
      const currentState = prev[mode];
      const num = Math.floor(Math.random() * 10);
      const colors = getColorByNumber(num);
      const bigSmall = getBigSmallByNumber(num);
      const currentPeriodId = currentState.periodId;
      const nextPeriodId = (parseInt(currentPeriodId) + 1).toString();

      const newResult: GameResult = {
        periodId: currentPeriodId,
        mode,
        number: num,
        colors,
        bigSmall,
        timestamp: Date.now()
      };

      let totalPayout = 0;
      let hadBets = false;

      setMyBets(prevBets => {
        return prevBets.map(bet => {
          if (bet.periodId === currentPeriodId && bet.mode === mode && bet.status === 'PENDING') {
            hadBets = true;
            let isWin = false;
            let multiplier = 0;
            if (typeof bet.selection === 'number') {
              isWin = bet.selection === num;
              multiplier = BET_MULTIPLIERS.NUMBER;
            } else if (['BIG', 'SMALL'].includes(bet.selection as string)) {
              isWin = bet.selection === bigSmall;
              multiplier = BET_MULTIPLIERS.BIG_SMALL;
            } else {
              isWin = colors.includes(bet.selection as ColorChoice);
              multiplier = (bet.selection === 'VIOLET') ? BET_MULTIPLIERS.VIOLET_COLOR : BET_MULTIPLIERS.COLOR;
            }

            if (isWin) {
              const payout = bet.amount * multiplier;
              totalPayout += payout;
              return { ...bet, status: 'WIN', payout };
            }
            return { ...bet, status: 'LOSS' };
          }
          return bet;
        });
      });

      if (totalPayout > 0) {
        setBalance(curr => curr + totalPayout);
      }

      if (mode === latestActiveMode.current && (hadBets || totalPayout > 0)) {
        setShowPopup({ result: newResult, payout: totalPayout });
      }

      return {
        ...prev,
        [mode]: {
          periodId: nextPeriodId,
          timeLeft: MODE_DURATIONS[mode],
          history: [newResult, ...currentState.history].slice(0, 50)
        }
      };
    });
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      setModeStates(prev => {
        const next = { ...prev };
        let needsResult: GameMode[] = [];

        (Object.keys(next) as GameMode[]).forEach(m => {
          if (next[m].timeLeft > 0) {
            next[m] = { ...next[m], timeLeft: next[m].timeLeft - 1 };
          } else {
            needsResult.push(m);
          }
        });

        // We can't call triggerResult here because it sets state. 
        // So we return the decremented state and then handle results in a separate microtask or next cycle.
        return { ...next };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Effect to handle results when timeLeft hits 0
  useEffect(() => {
    const modesToUpdate = (Object.keys(modeStates) as GameMode[]).filter(m => modeStates[m].timeLeft === 0);
    modesToUpdate.forEach(m => triggerResult(m));
  }, [modeStates, triggerResult]);

  const handleBet = (selection: ColorChoice | number | BigSmallChoice, amount: number) => {
    const currentState = modeStates[activeMode];
    if (currentState.timeLeft <= 3) return; 
    if (amount > balance) { alert("Insufficient balance!"); return; }

    const newBet: Bet = {
      id: Math.random().toString(36).substr(2, 9),
      periodId: currentState.periodId,
      mode: activeMode,
      amount,
      selection,
      timestamp: Date.now(),
      status: 'PENDING'
    };

    setBalance(prev => prev - amount);
    setMyBets(prev => [newBet, ...prev]);
  };

  const handleDepositAmount = (amount: number, utr: string) => {
    const newTx: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'DEPOSIT',
      amount,
      status: 'PENDING',
      timestamp: Date.now(),
      details: `UTR: ${utr}`
    };
    setTransactions(prev => [newTx, ...prev]);
    setTimeout(() => {
      setTransactions(prev => prev.map(t => t.id === newTx.id ? { ...t, status: 'SUCCESS' } : t));
      setBalance(prev => prev + amount);
    }, 4000);
    setView('GAME');
  };

  const handleWithdrawAmount = (amount: number, details: string) => {
    const newTx: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'WITHDRAW',
      amount,
      status: 'PENDING',
      timestamp: Date.now(),
      details
    };
    setBalance(prev => prev - amount);
    setTransactions(prev => [newTx, ...prev]);
    setView('GAME');
  };

  const handleLogin = (phone: string) => {
    setUserPhone(phone);
    setIsAuthenticated(true);
  };

  const inviteCode = "T1D7q2";
  const handleSendInvite = () => {
    if (invitePhone.length < 10) { alert("Please enter a 10-digit mobile number"); return; }
    setIsSendingInvite(true);
    const message = `Join me on ChromaPredict! Use my code: ${inviteCode} to get a 100% Welcome Bonus.`;
    window.location.href = `sms:+91${invitePhone}?body=${encodeURIComponent(message)}`;
    setTimeout(() => {
      setIsSendingInvite(false);
      setShowInviteSuccess(true);
      setInvitePhone('');
      setTimeout(() => setShowInviteSuccess(false), 3000);
    }, 1000);
  };

  if (!isAuthenticated) return <Auth onLogin={handleLogin} />;
  if (view === 'DEPOSIT') return <Deposit balance={balance} history={transactions.filter(t => t.type === 'DEPOSIT')} onBack={() => setView('GAME')} onDeposit={handleDepositAmount} />;
  if (view === 'WITHDRAW') return <Withdraw balance={balance} history={transactions.filter(t => t.type === 'WITHDRAW')} onBack={() => setView('GAME')} onWithdraw={handleWithdrawAmount} />;

  const currentModeState = modeStates[activeMode];

  return (
    <div className="max-w-md mx-auto min-h-screen bg-[#f8f8f8] flex flex-col pb-24 relative overflow-x-hidden">
      {showPopup && <GamePopup result={showPopup.result} payout={showPopup.payout} onClose={() => setShowPopup(null)} />}
      
      {showInviteSuccess && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-2xl text-xs font-bold z-[1000] shadow-2xl animate-bounce flex items-center gap-2">
          <span>✅</span> SMS App opened!
        </div>
      )}

      {view === 'GAME' && (
        <>
          <div className="main-gradient p-6 text-white text-center shadow-lg relative h-44 flex flex-col items-center justify-center">
            <h2 className="text-4xl font-black flex items-center justify-center gap-2">
                ₹{balance.toLocaleString()}
                <button className="text-lg opacity-60 active:rotate-180 transition-transform duration-500" onClick={() => window.location.reload()}>🔄</button>
            </h2>
            <p className="text-[10px] opacity-80 mt-1 uppercase tracking-widest font-bold">Wallet balance</p>
            <div className="flex gap-4 mt-6 w-full max-w-[320px]">
                <button onClick={() => setView('WITHDRAW')} className="flex-1 bg-white/20 border border-white/40 py-2.5 rounded-full text-xs font-bold active:bg-white/30">Withdraw</button>
                <button onClick={() => setView('DEPOSIT')} className="flex-1 bg-white text-red-500 py-2.5 rounded-full text-xs font-bold shadow-lg shadow-red-900/20">Deposit</button>
            </div>
          </div>

          <div className="bg-white px-4 py-2 flex items-center gap-2 overflow-hidden border-b border-gray-100">
              <span className="text-red-500 text-sm">📢</span>
              <div className="flex-1 overflow-hidden">
                <p className="text-[10px] text-gray-500 whitespace-nowrap animate-marquee font-medium">
                    WELCOME TO CHROMAPREDICT. STARTING BONUS ₹1,000 ADDED! DEPOSIT NOW AND GET 100% WELCOME BONUS...
                </p>
              </div>
          </div>

          <div className="grid grid-cols-4 gap-2 p-3">
              {(['30S', '1M', '3M', '5M'] as GameMode[]).map((mode) => (
                  <div key={mode} onClick={() => setActiveMode(mode)} className={`p-2 rounded-xl flex flex-col items-center gap-1 cursor-pointer transition-all ${activeMode === mode ? 'bg-red-400 text-white shadow-lg scale-105' : 'bg-white text-gray-400 grayscale'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activeMode === mode ? 'bg-white/20' : 'bg-gray-100'}`}>🕒</div>
                      <span className="text-[9px] font-black text-center leading-tight">Win Go<br/>{mode === '30S' ? '30S' : mode}</span>
                  </div>
              ))}
          </div>

          <div className="p-3">
            <div className="main-gradient rounded-3xl overflow-hidden shadow-2xl text-white">
                <div className="flex p-5">
                    <div className="flex-1">
                        <button className="bg-white/10 border border-white/20 px-3 py-1.5 rounded-full text-[9px] font-bold mb-3 flex items-center gap-1">How to play</button>
                        <p className="text-[10px] opacity-70 mb-1">Win Go {activeMode}</p>
                        <div className="flex gap-1.5">
                            {currentModeState.history.slice(0, 5).map((h, i) => (
                                <div key={i} className="w-7 h-7 rounded-full border border-white/30 flex items-center justify-center text-[11px] font-black">{h.number}</div>
                            ))}
                        </div>
                    </div>
                    <div className="flex-1 border-l border-white/10 pl-5 flex flex-col items-center">
                        <p className="text-[10px] opacity-70 mb-1">Time remaining</p>
                        <div className="flex gap-1.5 mb-3">
                            <div className="w-7 h-10 bg-white text-red-500 rounded-lg flex items-center justify-center font-black text-xl">{Math.floor(currentModeState.timeLeft / 600)}</div>
                            <div className="w-7 h-10 bg-white text-red-500 rounded-lg flex items-center justify-center font-black text-xl">{Math.floor((currentModeState.timeLeft % 600) / 60)}</div>
                            <div className="text-xl font-black text-white py-1">:</div>
                            <div className="w-7 h-10 bg-white text-red-500 rounded-lg flex items-center justify-center font-black text-xl">{Math.floor((currentModeState.timeLeft % 60) / 10)}</div>
                            <div className="w-7 h-10 bg-white text-red-500 rounded-lg flex items-center justify-center font-black text-xl">{currentModeState.timeLeft % 10}</div>
                        </div>
                        <p className="text-[11px] font-black tracking-widest">{currentModeState.periodId}</p>
                    </div>
                </div>
                <BettingInterface onBet={handleBet} disabled={currentModeState.timeLeft <= 3} balance={balance} activeMode={activeMode} />
            </div>
          </div>

          <div className="flex bg-white px-4 border-b border-gray-100 sticky top-0 z-10">
              {['GAME', 'CHART', 'MY'].map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab as any)} className={`flex-1 py-4 text-xs font-black uppercase tracking-wider ${activeTab === tab ? 'tab-active' : 'text-gray-400'}`}>
                      {tab === 'GAME' ? 'History' : tab === 'CHART' ? 'Chart' : 'My Bets'}
                  </button>
              ))}
          </div>

          <div className="flex-1 bg-white">
            {activeTab === 'GAME' && <HistoryTable history={currentModeState.history} />}
            {activeTab === 'MY' && (
                <div className="p-4 space-y-3">
                    {myBets.filter(b => b.mode === activeMode).length === 0 ? (
                        <div className="py-20 flex flex-col items-center opacity-30 grayscale"><div className="text-4xl mb-2">📁</div><p className="text-xs">No records</p></div>
                    ) : (
                        myBets.filter(b => b.mode === activeMode).map(bet => (
                            <div key={bet.id} className="bg-gray-50 p-4 rounded-2xl flex justify-between items-center border border-gray-100 shadow-sm">
                                <div>
                                    <p className="text-[9px] text-gray-400 font-bold mb-1">{bet.periodId}</p>
                                    <p className="text-xs font-black text-gray-700">{bet.selection} | ₹{bet.amount}</p>
                                </div>
                                <div className={`text-xs font-black ${bet.status === 'WIN' ? 'text-green-500' : bet.status === 'LOSS' ? 'text-red-400' : 'text-blue-400'}`}>
                                    {bet.status === 'WIN' ? `+₹${bet.payout}` : bet.status === 'LOSS' ? '-₹' + bet.amount : 'PENDING'}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
          </div>
        </>
      )}

      {view === 'PROMOTION' && (
          <div className="p-5 flex flex-col min-h-[80vh] bg-white">
              <h1 className="text-2xl font-black mb-6 text-gray-800">Promotion</h1>
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xl mb-6 space-y-4">
                  <h3 className="text-sm font-black text-gray-700">Invite Friends</h3>
                  <div className="flex gap-2">
                      <input type="tel" maxLength={10} placeholder="Mobile Number" value={invitePhone} onChange={(e) => setInvitePhone(e.target.value.replace(/\D/g, ''))} className="flex-1 bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 outline-none focus:border-red-300 text-sm font-bold" />
                  </div>
                  <button onClick={handleSendInvite} disabled={isSendingInvite} className="w-full main-gradient text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg active:scale-95 transition">
                      {isSendingInvite ? 'Opening SMS...' : 'Open SMS to Send'}
                  </button>
              </div>
          </div>
      )}

      {view === 'ACCOUNT' && (
          <div className="flex flex-col min-h-[80vh] bg-[#f8f8f8]">
              <div className="main-gradient p-8 text-white flex items-center gap-5">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl border-2 border-white/30">👤</div>
                  <div>
                      <h2 className="text-xl font-black">{userPhone || 'Guest'}</h2>
                      <p className="text-[10px] font-bold opacity-60">UID: {Math.floor(100000 + Math.random() * 900000)}</p>
                  </div>
              </div>
              <div className="p-4 -mt-5">
                  <div className="bg-white rounded-3xl p-6 shadow-xl space-y-6">
                      <div onClick={() => setView('DEPOSIT')} className="flex items-center justify-between cursor-pointer active:opacity-50">
                          <span className="text-sm font-bold text-gray-700">Deposit History</span>
                          <span className="text-gray-300">❯</span>
                      </div>
                      <div onClick={() => setView('WITHDRAW')} className="flex items-center justify-between cursor-pointer active:opacity-50">
                          <span className="text-sm font-bold text-gray-700">Withdraw History</span>
                          <span className="text-gray-300">❯</span>
                      </div>
                      <button onClick={() => window.location.reload()} className="w-full bg-gray-50 text-red-400 py-4 rounded-2xl font-black text-xs uppercase tracking-widest mt-4">Log Out</button>
                  </div>
              </div>
          </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-gray-100 px-2 py-2 flex justify-around shadow-2xl z-[100]">
          {[
              { id: 'GAME', label: 'Home', icon: '🏠' },
              { id: 'ACTIVITY', label: 'Activity', icon: '🏆' },
              { id: 'PROMOTION', label: 'Promotion', icon: '🎁' },
              { id: 'WALLET', label: 'Wallet', icon: '👛' },
              { id: 'ACCOUNT', label: 'Account', icon: '👤' }
          ].map(nav => (
              <button key={nav.id} onClick={() => nav.id === 'WALLET' ? setView('DEPOSIT') : nav.id === 'ACTIVITY' ? setView('GAME') : setView(nav.id as any)} className={`flex flex-col items-center p-2 rounded-2xl transition-all ${view === nav.id ? 'bg-red-50 scale-110' : 'opacity-40 grayscale'}`}>
                  <span className="text-xl mb-1">{nav.icon}</span>
                  <span className={`text-[8px] font-black uppercase tracking-tighter ${view === nav.id ? 'text-red-500' : 'text-gray-500'}`}>{nav.label}</span>
              </button>
          ))}
      </div>

      <style>{`
        @keyframes marquee { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } }
        .animate-marquee { display: inline-block; animation: marquee 15s linear infinite; }
      `}</style>
    </div>
  );
};

export default App;
