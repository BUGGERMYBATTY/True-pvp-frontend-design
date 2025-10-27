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
    <div className="h-8 w-8 rounded-full bg-brand-dark flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
        </svg>
    </div>
);
const GuestIcon = () => (
    <div className="h-8 w-8 rounded-full bg-brand-dark flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" opacity="0.4" />
        </svg>
    </div>
);
const DisconnectIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
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
    <div className="flex items-center gap-3 bg-brand-gray/70 p-1.5 pr-3 rounded-full border border-gray-700">
        <div className="flex items-center gap-2">
            {isDemoMode ? <GuestIcon /> : <UserIcon />}
            <div>
                <p className="font-bold text-white text-sm leading-tight">{nickname || `${address.substring(0, 4)}...${address.substring(address.length - 4)}`}</p>
                <p className="font-mono text-xs text-yellow-light leading-tight">{balance.toFixed(4)} SOL</p>
            </div>
        </div>
        <button 
            onClick={onDisconnect}
            className="bg-gray-700/50 text-gray-400 rounded-full p-2 hover:bg-pink hover:text-white transition-colors"
            aria-label={isDemoMode ? "Exit Demo" : "Disconnect"}
        >
            <DisconnectIcon />
        </button>
    </div>
  );
};

export default Wallet;
