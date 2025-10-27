import React from 'react';

interface WalletProps {
  connected: boolean;
  address: string;
  nickname: string;
  balance: number;
  onConnect: () => void;
  onDisconnect: () => void;
  isDemoMode: boolean;
  onPlayAsGuest: () => void;
}

// --- SVG Icons for the new design ---
const WalletIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
      <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zm-2 3a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
    </svg>
);
const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
    </svg>
);
const GuestIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);
const DisconnectIcon = () => (
     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
    </svg>
);
const SolanaIcon = () => (
    <svg width="12" height="12" viewBox="0 0 110 101" fill="none" xmlns="http://www.w3.org/2000/svg" className="inline-block mr-1.5">
        <path d="M54.8333 0L0 31.6667L54.8333 63.3333L109.667 31.6667L54.8333 0Z" fill="#14F195"/>
        <path d="M54.8333 101L0 69.3333V37.6667L54.8333 69.3333V101Z" fill="#14F195"/>
        <path d="M109.667 69.3333L54.8333 101V69.3333L109.667 37.6667V69.3333Z" fill="#14F195" fillOpacity="0.5"/>
        <path d="M0 37.6667V69.3333L54.8333 101V69.3333L0 37.6667Z" fill="#14F195" fillOpacity="0.5"/>
    </svg>
);


const Wallet: React.FC<WalletProps> = ({ connected, address, nickname, balance, onConnect, onDisconnect, isDemoMode, onPlayAsGuest }) => {
  if (!connected) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={onPlayAsGuest}
          className="bg-transparent border border-gray-600 text-gray-300 font-bold py-2 px-4 rounded-md hover:bg-brand-gray hover:text-white transition-colors"
        >
          Play as Guest
        </button>
        <button
          onClick={onConnect}
          className="bg-blue text-brand-dark font-bold py-2 px-6 rounded-md hover:bg-blue-light transition-all transform hover:scale-105 shadow-lg shadow-blue/20 flex items-center gap-2"
        >
          <WalletIcon />
          <span>Connect Wallet</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 bg-brand-gray p-2 rounded-lg border border-gray-700">
        <div className="flex items-center gap-2">
            <div className="text-gray-400">
                {isDemoMode ? <GuestIcon /> : <UserIcon />}
            </div>
            <div>
                <p className="font-bold text-white text-sm leading-tight">{nickname || `${address.substring(0, 4)}...${address.substring(address.length - 4)}`}</p>
                <p className="font-mono text-xs text-gray-300 leading-tight flex items-center">
                    <SolanaIcon />
                    {balance.toFixed(4)} SOL
                </p>
            </div>
        </div>
        <button 
            onClick={onDisconnect}
            className="text-gray-500 rounded-full p-1 hover:bg-brand-dark hover:text-pink transition-colors"
            aria-label={isDemoMode ? "Exit Demo" : "Disconnect"}
        >
            <DisconnectIcon />
        </button>
    </div>
  );
};

export default Wallet;