import React, { useState, useCallback, useEffect, useRef } from 'react';
import Wallet from './components/Wallet';
import MainPage from './components/MainPage';
import SolanaGoldRush from './games/SolanaGoldRush';
import NeonPong from './games/NeonPong';
import ViperPit from './games/ViperPit'; // This is for Cosmic Dodge
import Chess from './games/Chess';
import { playSound, toggleMute, getMuteState } from './utils/audio';

const App: React.FC = () => {
  // State Management
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [nickname, setNickname] = useState('');
  const [balance, setBalance] = useState(0.0);
  const [currentGame, setCurrentGame] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [walletType, setWalletType] = useState<'guest' | 'phantom' | null>(null);
  const [isMuted, setIsMuted] = useState(getMuteState());

  // --- Mock Wallet Logic ---
  const refetchBalance = useCallback(() => {
    if (walletConnected) {
      console.log('Balance refetched.');
    }
  }, [walletConnected]);

  const handleConnect = () => {
    const mockAddress = 'SoL...dE7';
    const mockNick = 'SolanaPlayer';
    setWalletConnected(true);
    setWalletAddress(mockAddress);
    setNickname(mockNick);
    setBalance(2.5);
    setIsDemoMode(false);
    setWalletType('phantom');
    playSound('uiClick');
  };

  const handleDisconnect = () => {
    setWalletConnected(false);
    setWalletAddress('');
    setNickname('');
    setBalance(0);
    setIsDemoMode(false);
    setWalletType(null);
    if (currentGame) {
        setCurrentGame(null);
    }
    playSound('uiClick');
  };
  
  const handlePlayAsGuest = () => {
    const guestAddress = `guest_${Math.random().toString(36).substring(2, 10)}`;
    const guestNick = `Guest_${guestAddress.slice(6, 10)}`;
    setWalletConnected(true);
    setWalletAddress(guestAddress);
    setNickname(guestNick);
    setBalance(100.0); // DEVELOPER TEST MODE: Increased balance for testing
    setIsDemoMode(true);
    setWalletType('guest');
    playSound('uiClick');
  };

  // --- Game Selection Logic ---
  const handleSelectGame = (game: string) => {
    if (walletConnected) {
        playSound('uiClick');
        setCurrentGame(game);
    } else {
        alert('Please connect your wallet or play as a guest to start a game.');
    }
  };

  const handleExitGame = () => {
    playSound('uiClick');
    setCurrentGame(null);
    refetchBalance();
  };

  // --- Audio ---
  const handleMuteToggle = () => {
      const muted = toggleMute();
      setIsMuted(muted);
  }

  // --- Render Logic ---
  const renderGame = () => {
    const gameProps = {
        walletAddress,
        nickname,
        balance,
        onExitGame: handleExitGame,
        refetchBalance,
        isDemoMode,
        walletType: walletType!,
    };
    switch (currentGame) {
      case 'solana-gold-rush': return <SolanaGoldRush {...gameProps} />;
      case 'neon-pong': return <NeonPong {...gameProps} />;
      case 'cosmic-dodge': return <ViperPit {...gameProps} />;
      case 'chess': return <Chess {...gameProps} />;
      default: return null;
    }
  };

  return (
    <div className="bg-brand-dark min-h-screen text-white font-sans">
      <header className="fixed top-0 left-0 right-0 z-50 bg-brand-dark/80 backdrop-blur-sm border-b border-gray-800">
        <nav className="container mx-auto flex justify-between items-center p-4">
          <div className="font-display font-bold text-2xl tracking-wider">
            <span className="text-blue">SOL</span><span className="text-pink">PLAY</span>
          </div>
          <div className="flex items-center gap-4">
              <Wallet
                connected={walletConnected}
                address={walletAddress}
                nickname={nickname}
                balance={balance}
                onConnect={handleConnect}
                onDisconnect={handleDisconnect}
                isDemoMode={isDemoMode}
                onPlayAsGuest={handlePlayAsGuest}
              />
              <button onClick={handleMuteToggle} className="text-gray-400 hover:text-white transition-colors">
                  {isMuted ? '🔇' : '🔊'}
              </button>
          </div>
        </nav>
      </header>
      
      <div className="container mx-auto pt-20">
        {currentGame ? (
           <main className="flex flex-col items-center justify-center pt-4">
              {renderGame()}
           </main>
        ) : (
          <main>
            <MainPage onSelectGame={handleSelectGame} walletConnected={walletConnected} />
          </main>
        )}
      </div>

       <footer className="text-center py-8 text-gray-500">
            <p>&copy; {new Date().getFullYear()} SolPlay. A fictional gaming platform for demonstration purposes.</p>
       </footer>
    </div>
  );
};

export default App;