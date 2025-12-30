
import React from 'react';
import { User } from '../types';

interface AuthProps {
  onLogin: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const handleGuest = () => {
    onLogin({
      id: 'guest-' + Math.random().toString(36).substr(2, 9),
      name: 'Guest User',
      isGuest: true
    });
  };

  const handleGoogle = () => {
    // In a real app, integrate Firebase/Auth here
    onLogin({
      id: 'user-' + Math.random().toString(36).substr(2, 9),
      name: 'Mohtashim Khan',
      email: 'mk@example.com',
      isGuest: false,
      photoUrl: 'https://picsum.photos/200'
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#0b0b0b]">
      <div className="max-w-md w-full bg-zinc-950 border border-zinc-800 rounded-3xl p-8 shadow-2xl text-center">
        <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-blue-600/20">
          <span className="text-3xl font-black text-white italic">MK</span>
        </div>
        
        <h1 className="text-3xl font-bold mb-2 tracking-tight">MK AI</h1>
        <p className="text-zinc-500 mb-8 text-sm">Created & Owned by Mohtashim Khan</p>

        <div className="space-y-4">
          <button 
            onClick={handleGoogle}
            className="w-full flex items-center justify-center gap-3 py-4 bg-white text-black font-bold rounded-2xl hover:bg-zinc-200 transition-all shadow-lg active:scale-95"
          >
            <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
            Continue with Google
          </button>
          
          <button 
            onClick={handleGuest}
            className="w-full flex items-center justify-center gap-3 py-4 bg-zinc-800 text-white font-bold rounded-2xl hover:bg-zinc-700 transition-all border border-zinc-700 active:scale-95"
          >
            Continue as Guest
          </button>
        </div>

        <p className="mt-8 text-[11px] text-zinc-600 leading-relaxed">
          By continuing, you agree to the terms of MK AI.<br/>
          Secure, Private, Intelligent.
        </p>
      </div>
      
      <div className="mt-12 text-zinc-700 text-xs font-medium">
        POWERED BY MOHTASHIM KHAN
      </div>
    </div>
  );
};

export default Auth;
