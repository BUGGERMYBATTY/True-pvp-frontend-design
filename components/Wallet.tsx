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

const Wallet: React.FC<WalletProps> = ({ connected, address, nickname, balance, onConnect, onDisconnect, isDemoMode, onPlayAsGuest }) => {
  if (!connected) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={onPlayAsGuest}
          className="bg-transparent border border-gray-500 text-gray-300 font-bold py-2 px-6 rounded-md hover:bg-gray-700 hover:text-white transition-colors"
        >
          Play as Guest
        </button>
        <button
          onClick={onConnect}
          className="bg-white text-brand-dark font-bold py-2 px-6 rounded-md hover:bg-gray-200 transition-colors flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
            <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zm-2 3a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
          <span>Connect Wallet</span>
        </button>
      </div>
    );
  }

  if (isDemoMode) {
     return (
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-md text-sm bg-gray-600 shadow-lg">
            <span className="text-white font-semibold">{nickname} | </span>
            <span className="font-bold text-white">{balance.toFixed(4)} SOL</span>
          </div>
          <button 
            onClick={onDisconnect}
            className="bg-gray-700 text-white font-bold py-2 px-4 rounded-md hover:bg-gray-600 transition-colors text-sm"
          >
            Exit
          </button>
        </div>
      );
  }

  return (
    <div className="flex items-center gap-4">
      <div className="p-2 rounded-md text-sm bg-gradient-to-r from-pink-light via-blue-light to-yellow-light animate-psychedelic-bg bg-[size:400%_400%] shadow-lg">
        <span className="text-brand-dark font-semibold">{nickname || `${address.substring(0, 4)}...${address.substring(address.length - 4)}`} | </span>
        <span className="font-bold text-brand-dark">{balance.toFixed(4)} SOL</span>
      </div>
      <button 
        onClick={onDisconnect}
        className="bg-gray-700 text-white font-bold py-2 px-4 rounded-md hover:bg-gray-600 transition-colors text-sm"
      >
        Disconnect
      </button>
    </div>
  );
};

export default Wallet;
