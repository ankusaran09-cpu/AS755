
import React, { useState } from 'react';

interface AuthProps {
  onLogin: (phone: string) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [view, setView] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone && password) {
      onLogin(phone);
    } else {
        alert("Please enter both phone and password");
    }
  };

  const handleGuestLogin = () => {
    onLogin("Guest_User");
  };

  return (
    <div className="flex flex-col min-h-screen bg-white max-w-md mx-auto">
      <div className="main-gradient p-8 text-white h-56 flex flex-col justify-center">
        <h1 className="text-3xl font-black mb-2 tracking-tighter uppercase">{view === 'LOGIN' ? 'Log in' : 'Register'}</h1>
        <p className="text-xs opacity-80 font-medium leading-relaxed max-w-[80%]">
          {view === 'LOGIN' ? 'Access your account and start winning.' : 'Join and start winning in 30 seconds.'}
        </p>
      </div>

      <div className="flex-1 -mt-10 bg-white rounded-t-[2.5rem] p-8 shadow-2xl relative z-10">
        <div className="flex justify-center mb-8 bg-gray-50 p-1 rounded-2xl">
            <button onClick={() => setView('LOGIN')} className={`flex-1 py-3 text-center text-xs font-black uppercase rounded-xl ${view === 'LOGIN' ? 'bg-white text-red-500 shadow-sm' : 'text-gray-400'}`}>Login</button>
            <button onClick={() => setView('REGISTER')} className={`flex-1 py-3 text-center text-xs font-black uppercase rounded-xl ${view === 'REGISTER' ? 'bg-white text-red-500 shadow-sm' : 'text-gray-400'}`}>Register</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Phone number</label>
            <div className="flex gap-2">
              <div className="bg-gray-50 rounded-2xl px-4 py-4 text-gray-400 border border-gray-100 font-bold text-sm">+91</div>
              <input 
                type="tel" 
                required
                autoComplete="username"
                maxLength={10}
                placeholder="Mobile number"
                className="flex-1 bg-gray-50 rounded-2xl px-5 py-4 border border-gray-100 outline-none focus:border-red-300 font-bold text-sm"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Password</label>
            <input 
                type="password" 
                required
                autoComplete="current-password"
                placeholder="Password"
                className="w-full bg-gray-50 rounded-2xl px-5 py-4 border border-gray-100 outline-none focus:border-red-300 font-bold text-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="space-y-4 pt-4">
            <button type="submit" className="w-full login-gradient text-white py-4 rounded-2xl font-black text-xs uppercase shadow-xl shadow-red-200 active:scale-95 transition">
                {view === 'LOGIN' ? 'Confirm Login' : 'Create Account'}
            </button>
            <div className="flex items-center gap-4 py-2">
                <div className="h-[1px] bg-gray-100 flex-1"></div>
                <span className="text-[10px] font-black text-gray-300 uppercase">OR</span>
                <div className="h-[1px] bg-gray-100 flex-1"></div>
            </div>
            <button type="button" onClick={handleGuestLogin} className="w-full bg-gray-800 text-white py-4 rounded-2xl font-black text-xs uppercase active:scale-95 transition flex items-center justify-center gap-2">
                ⚡ Guest Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Auth;
