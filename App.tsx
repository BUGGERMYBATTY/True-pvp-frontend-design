import React, { useState, useCallback, useEffect } from 'react';
import Wallet from './components/Wallet.tsx';
import MainPage from './components/MainPage.tsx';
import SolanaGoldRush from './games/SolanaGoldRush.tsx';
import NeonPong from './games/NeonPong.tsx';
import ViperPit from './games/ViperPit.tsx';

const GAME_TITLES: { [key: string]: string } = {
  'solana-gold-rush': 'Gold Rush',
  'neon-pong': 'Neon Pong',
  'cosmic-dodge': 'Cosmic Dodge',
};

// Use the standard VITE_ variable name for environment variables
const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:3001';


// --- Modal Components ---
const DisclaimerModal = ({ onConfirm, checked, onCheckChange }: { onConfirm: () => void; checked: boolean; onCheckChange: (isChecked: boolean) => void; }) => (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-fadeIn">
        <div className="bg-brand-dark p-8 rounded-xl shadow-2xl w-full max-w-md mx-4 border-2 border-yellow relative text-center">
            <h2 className="text-3xl font-bold font-display mb-4 text-yellow">Important Notice</h2>
            <p className="text-gray-300 text-lg leading-relaxed mb-2">
                This is a self-custody platform. Your funds are never deposited on the site and remain in your own wallet at all times. All wagers are peer-to-peer transactions on the Solana blockchain.
            </p>
             <div className="flex items-center justify-center mt-6 mb-6">
                <input
                    id="dont-show-again"
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => onCheckChange(e.target.checked)}
                    className="h-5 w-5 rounded bg-brand-gray border-gray-500 text-yellow focus:ring-yellow cursor-pointer"
                />
                <label htmlFor="dont-show-again" className="ml-3 text-gray-300 cursor-pointer">
                    Acknowledge and don't show again.
                </label>
            </div>
            <div className="flex justify-center">
                <button onClick={onConfirm} className="bg-yellow text-brand-dark font-bold py-3 px-8 rounded-lg text-lg hover:bg-yellow-light transition-transform transform hover:scale-105 shadow-md">
                    I Understand, Continue
                </button>
            </div>
        </div>
    </div>
);

const NicknameModal = ({ onSubmit }: { onSubmit: (name: string) => void; }) => {
    const [name, setName] = useState('');
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
          onSubmit(name.trim());
        }
    };
    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-fadeIn">
            <form onSubmit={handleSubmit} className="bg-brand-dark p-8 rounded-xl shadow-2xl w-full max-w-md mx-4 border-2 border-blue relative text-center">
                <h2 className="text-3xl font-bold font-display mb-2 text-blue">Create Your Nickname</h2>
                <p className="text-gray-400 mb-6">Choose a permanent nickname for your wallet. This cannot be changed later.</p>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-brand-gray border border-gray-600 rounded-md p-3 text-white text-center text-lg focus:outline-none focus:ring-2 focus:ring-blue mb-4"
                    placeholder="Enter your nickname"
                    maxLength={16}
                    required
                    autoFocus
                />
                <button type="submit" className="w-full bg-blue text-brand-dark font-bold py-3 rounded-lg text-lg hover:bg-blue-light transition-transform transform hover:scale-105 shadow-md">
                    Set Nickname
                </button>
            </form>
        </div>
    );
};


const App: React.FC = () => {
  const [currentGame, setCurrentGame] = useState<string | null>(null);
  const [walletConnected, setWalletConnected] = useState<boolean>(false);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [nickname, setNickname] = useState<string>('');
  const [balance, setBalance] = useState<number>(0);
  const [provider, setProvider] = useState<any | null>(null);
  const [connection, setConnection] = useState<any | null>(null);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [showDisclaimer, setShowDisclaimer] = useState<boolean>(false);
  const [showNicknameModal, setShowNicknameModal] = useState<boolean>(false);
  const [dontShowDisclaimerAgain, setDontShowDisclaimerAgain] = useState<boolean>(false);
  
  useEffect(() => {
    if ("solana" in window) {
      const solanaProvider = (window as any).solana;
      if (solanaProvider.isPhantom) {
        setProvider(solanaProvider);

        if (!connection) {
          const conn = new (window as any).solanaWeb3.Connection(
            (window as any).solanaWeb3.clusterApiUrl('devnet'),
            'confirmed'
          );
          setConnection(conn);
          return;
        }

        const handleConnect = async (publicKey: any) => {
          const address = publicKey.toString();
          setWalletAddress(address);
          setWalletConnected(true);
          setIsDemoMode(false);
          const balance = await connection.getBalance(publicKey);
          setBalance(balance / (window as any).solanaWeb3.LAMPORTS_PER_SOL);
          
          const storedNicknames = JSON.parse(localStorage.getItem('userNicknames') || '{}');
          if (storedNicknames[address]) {
            setNickname(storedNicknames[address]);
          } else {
            setShowNicknameModal(true);
          }
        };

        const handleDisconnect = () => {
          if (!isDemoMode) {
            setWalletConnected(false);
            setWalletAddress('');
            setNickname('');
            setBalance(0);
            setCurrentGame(null);
          }
        };
        
        solanaProvider.on('connect', handleConnect);
        solanaProvider.on('disconnect', handleDisconnect);
        
        return () => {
          solanaProvider.removeListener('connect', handleConnect);
          solanaProvider.removeListener('disconnect', handleDisconnect);
        }
      }
    }
  }, [connection, isDemoMode]);

  const connectWalletAction = useCallback(async () => {
    if (!provider) return;
    try {
        await provider.connect({ onlyIfTrusted: false });
    } catch (err) {
        console.error("User rejected the connection request:", err);
    }
  }, [provider]);

  const handleConnectWallet = useCallback(() => {
    if (!provider) {
      alert('Phantom wallet not found. Please install the Phantom browser extension.');
      return;
    }

    const hasAcknowledgedPermanently = localStorage.getItem('disclaimerAcknowledged') === 'true';
    if (hasAcknowledgedPermanently) {
      connectWalletAction();
      return;
    }

    const hasAcknowledgedSession = sessionStorage.getItem('disclaimerAcknowledged') === 'true';
    if (hasAcknowledgedSession) {
      connectWalletAction();
      return;
    }
    
    setShowDisclaimer(true);
  }, [provider, connectWalletAction]);
  
  const handleDisclaimerConfirm = useCallback(async () => {
    setShowDisclaimer(false);
    sessionStorage.setItem('disclaimerAcknowledged', 'true');

    if (dontShowDisclaimerAgain) {
      localStorage.setItem('disclaimerAcknowledged', 'true');
    }
    
    connectWalletAction();
  }, [dontShowDisclaimerAgain, connectWalletAction]);

  const handleDisconnectWallet = useCallback(async () => {
    if (isDemoMode) {
      setWalletConnected(false);
      setWalletAddress('');
      setNickname('');
      setBalance(0);
      setIsDemoMode(false);
      setCurrentGame(null);
      return;
    }
    
    if (provider && provider.isConnected) {
      try {
        await provider.disconnect();
      } catch (err) {
        console.error("Error during wallet disconnection:", err);
      }
    }
  }, [provider, isDemoMode]);

  const handlePlayAsGuest = useCallback(() => {
    let guestId = sessionStorage.getItem('guestId');
    if (!guestId) {
      guestId = `GUEST_${Math.random().toString(36).substring(2, 10)}`;
      sessionStorage.setItem('guestId', guestId);
    }

    setIsDemoMode(true);
    setWalletConnected(true);
    setWalletAddress(guestId);
    setNickname('Guest');
    setBalance(10);
  }, []);

  const handleSetNickname = useCallback((newNickname: string) => {
    if (walletAddress) {
        const storedNicknames = JSON.parse(localStorage.getItem('userNicknames') || '{}');
        storedNicknames[walletAddress] = newNickname;
        localStorage.setItem('userNicknames', JSON.stringify(storedNicknames));
        setNickname(newNickname);
        setShowNicknameModal(false);
    }
  }, [walletAddress]);
  
  const handleBalanceUpdate = useCallback((amount: number) => {
    setBalance(prev => prev + amount);
  }, []);

  const refetchBalance = useCallback(async () => {
    if (walletAddress && connection && !isDemoMode) {
        const publicKey = new (window as any).solanaWeb3.PublicKey(walletAddress);
        const balance = await connection.getBalance(publicKey);
        setBalance(balance / (window as any).solanaWeb3.LAMPORTS_PER_SOL);
    }
  }, [walletAddress, connection, isDemoMode]);

  const handleSelectGame = useCallback((gameId: string) => {
    setCurrentGame(gameId);
  }, []);

  const handleExitGame = useCallback(() => {
    setCurrentGame(null);
  }, []);

  const handleRequestMatch = useCallback(async (gameId: string, betAmount: number): Promise<{ matched: boolean; gameId: string | null } | null> => {
    if (!walletConnected) {
        console.error("Wallet not connected, cannot start match.");
        return null;
    }
    try {
        const response = await fetch(`${API_BASE_URL}/api/matchmaking/join`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ gameId, betAmount, walletAddress }),
        });
        if (!response.ok) {
           throw new Error(`Server responded with status: ${response.status}`);
        }
        const data = await response.json();
        return { matched: data.matched, gameId: data.gameId || null };
    } catch (error) {
        console.error("Error requesting match:", error);
        alert("Could not connect to the matchmaking server. Please try again later.");
        return null; 
    }
  }, [walletAddress, walletConnected]);

  const handleCancelMatch = useCallback(async (gameId: string, betAmount: number) => {
    try {
        await fetch(`${API_BASE_URL}/api/matchmaking/cancel`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ gameId, betAmount, walletAddress }),
        });
    } catch (error) {
        console.error("Error cancelling match:", error);
    }
  }, [walletAddress]);

  const getHeaderStyle = (game: string | null): string => {
    if (!game) {
      return 'bg-gradient-to-r from-pink-light via-blue-light to-yellow-light bg-clip-text text-transparent animate-psychedelic-bg bg-[size:400%_400%]';
    }
    if (game === 'solana-gold-rush') {
      return 'text-yellow';
    }
    if (game === 'neon-pong') {
      return 'text-blue';
    }
     if (game === 'cosmic-dodge') {
      return 'text-pink';
    }
    return 'text-blue';
  }

  return (
    <main className="min-h-screen text-white font-sans flex flex-col items-center p-4">
      {showDisclaimer && <DisclaimerModal onConfirm={handleDisclaimerConfirm} checked={dontShowDisclaimerAgain} onCheckChange={setDontShowDisclaimerAgain} />}
      {showNicknameModal && <NicknameModal onSubmit={handleSetNickname} />}
      <header className="w-full max-w-6xl mx-auto p-4 flex justify-between items-center border-b border-blue/20">
        <div>
          {currentGame ? (
            <h1 className={`text-3xl font-bold font-display tracking-wider ${getHeaderStyle(currentGame)}`}>
              {GAME_TITLES[currentGame]}
            </h1>
          ) : (
            <img src="/my-new-logo.svg" alt="TRUEPVP.io Logo" className="h-14" />
          )}
        </div>
        <Wallet
          connected={walletConnected}
          address={walletAddress}
          nickname={nickname}
          balance={balance}
          onConnect={handleConnectWallet}
          onDisconnect={handleDisconnectWallet}
          isDemoMode={isDemoMode}
          onPlayAsGuest={handlePlayAsGuest}
        />
      </header>
      <div className="w-full max-w-5xl flex items-center justify-center mt-8 px-4">
        {!currentGame && <MainPage onSelectGame={handleSelectGame} />}

        {currentGame === 'solana-gold-rush' && (
          <SolanaGoldRush 
            walletAddress={walletAddress}
            nickname={nickname}
            balance={balance}
            onExitGame={handleExitGame}
            onBalanceUpdate={handleBalanceUpdate}
            onRequestMatch={handleRequestMatch}
            onCancelMatch={handleCancelMatch}
            provider={provider}
            connection={connection}
            refetchBalance={refetchBalance}
            isDemoMode={isDemoMode}
          />
        )}

        {currentGame === 'neon-pong' && (
          <NeonPong 
            walletAddress={walletAddress}
            balance={balance}
            onExitGame={handleExitGame}
            onBalanceUpdate={handleBalanceUpdate}
            onRequestMatch={handleRequestMatch}
            onCancelMatch={handleCancelMatch}
            provider={provider}
            connection={connection}
            refetchBalance={refetchBalance}
            isDemoMode={isDemoMode}
          />
        )}

        {currentGame === 'cosmic-dodge' && (
          <ViperPit 
            walletAddress={walletAddress}
            balance={balance}
            onExitGame={handleExitGame}
            onBalanceUpdate={handleBalanceUpdate}
            onRequestMatch={handleRequestMatch}
            onCancelMatch={handleCancelMatch}
            provider={provider}
            connection={connection}
            refetchBalance={refetchBalance}
            isDemoMode={isDemoMode}
          />
        )}

      </div>
    </main>
  );
};

export default App;
