import React, { useState } from 'react';

// --- Helper Components ---

interface InfoCardProps {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  color: 'blue' | 'yellow' | 'pink';
}

const InfoCard: React.FC<InfoCardProps> = ({ icon, title, children, color }) => {
    const colorClasses = {
        blue: 'text-blue',
        yellow: 'text-yellow',
        pink: 'text-pink',
    }
    return (
        <div className="bg-brand-gray/50 border border-gray-700 rounded-lg p-6 text-center">
            <div className={`inline-block p-3 rounded-md bg-brand-dark mb-4 ${colorClasses[color]}`}>
                {icon}
            </div>
            <h3 className={`text-xl font-bold font-display ${colorClasses[color]}`}>{title}</h3>
            <p className="text-gray-400 mt-2">{children}</p>
        </div>
    );
};

// --- SVG Icons for Info Cards ---
const CustodyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4M4 7l8 4.5 8-4.5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 11.5v8.5" />
    </svg>
);
const SkillIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
);
const PayoutIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
    </svg>
);

// --- SVG Icons for Game Cards ---
const GoldRushIcon = () => (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="goldBarGradient" x1="32" y1="22" x2="32" y2="46" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FFF700" />
                <stop offset="1" stopColor="#E0B400" />
            </linearGradient>
        </defs>
        <path d="M18 46 L22 38 L54 38 L50 46 Z" fill="url(#goldBarGradient)" stroke="#FFD700" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M14 38 L18 30 L50 30 L46 38 Z" fill="url(#goldBarGradient)" stroke="#FFD700" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M10 30 L14 22 L46 22 L42 30 Z" fill="url(#goldBarGradient)" stroke="#FFD700" strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
);
const NeonPongIcon = () => (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="10" y="12" width="6" height="40" rx="3" fill="#00BFFF"/>
        <rect x="48" y="12" width="6" height="40" rx="3" fill="#FF1493"/>
        <circle cx="32" cy="32" r="5" fill="#FFFFFF"/>
    </svg>
);
const CosmicDodgeIcon = () => (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="shipBodyGradient" x1="32" y1="12" x2="32" y2="40" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FF7ED4"/>
                <stop offset="1" stopColor="#FF1493"/>
            </linearGradient>
            <linearGradient id="flameGradient" x1="32" y1="42" x2="32" y2="52" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FFF700"/>
                <stop offset="1" stopColor="#FFD700"/>
            </linearGradient>
        </defs>
        {/* Engine Flame */}
        <path d="M28 42 L36 42 L32 54 Z" fill="url(#flameGradient)" />
        {/* Main Body with Wings */}
        <path d="M32 12L16 44L32 36L48 44L32 12Z" fill="url(#shipBodyGradient)" stroke="#FF7ED4" strokeWidth="2" strokeLinejoin="round"/>
        {/* Cockpit */}
        <circle cx="32" cy="26" r="4" fill="#7DF9FF" stroke="white" strokeWidth="1.5"/>
    </svg>
);
const QuantumGambitIcon = () => (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M32 12L24 24V18L18 20V28L28 32L32 44L36 32L46 28V20L40 18V24L32 12Z" fill="#A855F7" stroke="#C084FC" strokeWidth="2" strokeLinejoin="round"/>
        <path d="M22 52H42" stroke="#C084FC" strokeWidth="3" strokeLinecap="round"/>
        <path d="M26 48H38" stroke="#C084FC" strokeWidth="3" strokeLinecap="round"/>
    </svg>
);

interface GameCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: 'yellow' | 'blue' | 'pink' | 'purple';
  onClick: () => void;
  disabled: boolean;
}

const GameCard: React.FC<GameCardProps> = ({ title, description, icon, color, onClick, disabled }) => {
  const colorClasses = {
    yellow: 'border-yellow/50 hover:border-yellow shadow-yellow/10 hover:shadow-2xl hover:shadow-yellow/20 text-yellow',
    blue: 'border-blue/50 hover:border-blue shadow-blue/10 hover:shadow-2xl hover:shadow-blue/20 text-blue',
    pink: 'border-pink/50 hover:border-pink shadow-pink/10 hover:shadow-2xl hover:shadow-pink/20 text-pink',
    purple: 'border-purple/50 hover:border-purple shadow-purple/10 hover:shadow-2xl hover:shadow-purple/20 text-purple'
  };

  return (
    <div
      onClick={!disabled ? onClick : undefined}
      className={`
        bg-brand-gray border-2 rounded-lg p-6 flex flex-col items-center text-center
        transition-all duration-300 transform hover:-translate-y-2 shadow-lg
        ${colorClasses[color]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      <div className="h-24 w-24 mb-6 flex items-center justify-center">
          {icon}
      </div>
      <h3 className={`text-2xl font-bold font-display`}>{title}</h3>
      <p className="text-gray-400 mt-2 flex-grow">{description}</p>
    </div>
  );
};


interface CollapsibleRuleProps {
  title: string;
  children: React.ReactNode;
  colorTheme: 'yellow' | 'blue' | 'pink' | 'purple';
}

const CollapsibleRule: React.FC<CollapsibleRuleProps> = ({ title, children, colorTheme }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const colors = {
    yellow: 'text-yellow border-yellow/30',
    blue: 'text-blue border-blue/30',
    pink: 'text-pink border-pink/30',
    purple: 'text-purple border-purple/30',
  };

  return (
    <div className="bg-brand-dark/50 border border-gray-700 rounded-lg">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex justify-between items-center p-4 text-left font-display font-bold text-xl transition-colors ${colors[colorTheme]}`}
      >
        <span>{title}</span>
        <span className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>▼</span>
      </button>
      {isOpen && (
        <div className="p-4 border-t border-gray-700 text-gray-300">
          {children}
        </div>
      )}
    </div>
  );
};


// --- Leaderboard Data ---
const leaderboardData = {
  overall: { '1d': [{ rank: 1, name: 'MasterPlayer', score: 12500 }, { rank: 2, name: 'CryptoKing', score: 11200 }], '3d': [{ rank: 1, name: 'MasterPlayer', score: 35000 }, { rank: 2, name: 'Newbie', score: 28000 }], '7d': [{ rank: 1, name: 'MasterPlayer', score: 89000 }, { rank: 2, name: 'CryptoKing', score: 75000 }], '14d': [{ rank: 1, name: 'MasterPlayer', score: 150000 }, { rank: 2, name: 'CryptoKing', score: 135000 }], 'all': [{ rank: 1, name: 'MasterPlayer', score: 500000 }, { rank: 2, name: 'CryptoKing', score: 450000 }] },
  'solana-gold-rush': { '1d': [{ rank: 1, name: 'GoldFinger', score: 8000 }, { rank: 2, name: 'NuggetHunter', score: 7500 }], '3d': [{ rank: 1, name: 'GoldFinger', score: 22000 }, { rank: 2, name: 'NuggetHunter', score: 19000 }], '7d': [{ rank: 1, name: 'GoldFinger', score: 55000 }, { rank: 2, name: 'NuggetHunter', score: 51000 }], '14d': [{ rank: 1, name: 'GoldFinger', score: 95000 }, { rank: 2, name: 'NuggetHunter', score: 88000 }], 'all': [{ rank: 1, name: 'GoldFinger', score: 250000 }, { rank: 2, name: 'NuggetHunter', score: 230000 }] },
  'neon-pong': { '1d': [{ rank: 1, name: 'PaddleMaster', score: 4500 }, { rank: 2, name: 'WallOfSol', score: 3700 }], '3d': [{ rank: 1, name: 'PaddleMaster', score: 13000 }, { rank: 2, name: 'WallOfSol', score: 11000 }], '7d': [{ rank: 1, name: 'PaddleMaster', score: 34000 }, { rank: 2, name: 'WallOfSol', score: 29000 }], '14d': [{ rank: 1, name: 'PaddleMaster', score: 55000 }, { rank: 2, name: 'WallOfSol', score: 47000 }], 'all': [{ rank: 1, name: 'PaddleMaster', score: 150000 }, { rank: 2, name: 'WallOfSol', score: 120000 }] },
  'cosmic-dodge': { '1d': [{ rank: 1, name: 'StarPilot', score: 9000 }, { rank: 2, name: 'AsteroidDodger', score: 8200 }], '3d': [{ rank: 1, name: 'StarPilot', score: 25000 }, { rank: 2, name: 'AsteroidDodger', score: 22000 }], '7d': [{ rank: 1, name: 'StarPilot', score: 65000 }, { rank: 2, name: 'AsteroidDodger', score: 58000 }], '14d': [{ rank: 1, name: 'StarPilot', score: 110000 }, { rank: 2, name: 'AsteroidDodger', score: 98000 }], 'all': [{ rank: 1, name: 'StarPilot', score: 300000 }, { rank: 2, name: 'AsteroidDodger', score: 270000 }] },
  'chess': { '1d': [{ rank: 1, name: 'SynthMind', score: 10000 }, { rank: 2, name: 'Checkmate_AI', score: 9500 }], '3d': [{ rank: 1, name: 'SynthMind', score: 28000 }, { rank: 2, name: 'Checkmate_AI', score: 26000 }], '7d': [{ rank: 1, name: 'SynthMind', score: 72000 }, { rank: 2, name: 'Checkmate_AI', score: 68000 }], '14d': [{ rank: 1, name: 'SynthMind', score: 130000 }, { rank: 2, name: 'Checkmate_AI', score: 120000 }], 'all': [{ rank: 1, name: 'SynthMind', score: 400000 }, { rank: 2, name: 'Checkmate_AI', score: 380000 }] },
};


// --- Main Component ---

interface MainPageProps {
  onSelectGame: (game: string) => void;
  walletConnected: boolean;
}

const MainPage: React.FC<MainPageProps> = ({ onSelectGame, walletConnected }) => {
  const [activeTimeFilter, setActiveTimeFilter] = useState<'1d' | '3d' | '7d' | '14d' | 'all'>('7d');
  const [activeGameFilter, setActiveGameFilter] = useState<keyof typeof leaderboardData>('overall');

  const timeFilters: { key: '1d' | '3d' | '7d' | '14d' | 'all'; label: string }[] = [
    { key: '1d', label: '1 Day' }, { key: '3d', label: '3 Days' }, { key: '7d', label: '7 Days' }, { key: '14d', label: '14 Days' }, { key: 'all', label: 'All Time' },
  ];
  const gameFilters: { key: keyof typeof leaderboardData, label: string, color: string }[] = [
    { key: 'overall', label: 'Overall', color: 'gray' },
    { key: 'solana-gold-rush', label: 'Gold Rush', color: 'yellow' },
    { key: 'neon-pong', label: 'Neon Pong', color: 'blue' },
    { key: 'cosmic-dodge', label: 'Cosmic Dodge', color: 'pink' },
    { key: 'chess', label: 'Quantum Gambit', color: 'purple' },
  ];

  return (
    <div className="w-full animate-fadeIn py-16">
       {/* Hero Section */}
      <div className="text-center mb-24">
        <h2 className="text-6xl md:text-7xl font-extrabold font-display uppercase tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-blue-light to-green-300">
          The Future of<br/>Web3 PvP Games
        </h2>
        <p className="text-xl text-gray-400 mt-6 max-w-3xl mx-auto">
          Experience skill-based gaming on the Solana blockchain. Fair, transparent, and
          instant peer-to-peer wagers where you are always in control of your funds.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24 max-w-6xl mx-auto">
        <InfoCard icon={<CustodyIcon />} title="True Self-Custody" color="blue">
            Your funds never leave your wallet. We never take deposits. All wagers are handled by secure, peer-to-peer transactions directly on the Solana blockchain.
        </InfoCard>
        <InfoCard icon={<SkillIcon />} title="Pure Skill, No Luck" color="pink">
            Victory is determined by your skill, not by chance. Our games are designed to be competitive and fair, rewarding strategy and quick reflexes.
        </InfoCard>
        <InfoCard icon={<PayoutIcon />} title="Instant Payouts" color="yellow">
            Winnings are sent directly to your wallet the moment you win. No waiting, no withdrawals. Just pure, instant gratification powered by Solana.
        </InfoCard>
      </div>


      {/* Game Selection */}
      <div className="text-center mb-16">
        <h2 className="text-5xl font-extrabold font-display">Choose Your Game</h2>
        <p className="text-xl text-gray-400 mt-2">Compete for SOL in skill-based challenges.</p>
        {!walletConnected && <p className="text-yellow mt-4 p-2 bg-yellow/10 border border-yellow/20 rounded-md">Please connect your wallet or play as a guest to enter a game.</p>}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
        <GameCard title="Solana Gold Rush" description="Outwit your opponent in this 5-round bidding and bluffing battle. Highest score wins the pot!" icon={<GoldRushIcon />} color="yellow" onClick={() => onSelectGame('solana-gold-rush')} disabled={!walletConnected}/>
        <GameCard title="Neon Pong" description="The arcade classic with a crypto twist. First to win 2 rounds takes home the prize." icon={<NeonPongIcon />} color="blue" onClick={() => onSelectGame('neon-pong')} disabled={!walletConnected}/>
        <GameCard title="Cosmic Dodge" description="Survive waves of asteroids and lasers longer than your opponent in this intense bullet-hell duel." icon={<CosmicDodgeIcon />} color="pink" onClick={() => onSelectGame('cosmic-dodge')} disabled={!walletConnected}/>
        <GameCard title="Quantum Gambit" description="The ultimate game of strategy, reborn. Checkmate your opponent to claim victory on a digital frontier." icon={<QuantumGambitIcon />} color="purple" onClick={() => onSelectGame('chess')} disabled={!walletConnected}/>
      </div>

      {/* Game Rules Section */}
      <div className="w-full max-w-4xl mx-auto mb-16">
        <h2 className="text-4xl font-extrabold font-display text-center mb-8">Game Rules</h2>
        <div className="space-y-4">
          <CollapsibleRule title="Solana Gold Rush" colorTheme="yellow">
             <ul className="list-disc list-outside ml-5 space-y-2">
              <li>Each round, a "Round Value" card is revealed (from 1 to 10).</li>
              <li>You and your opponent each have a hand of 5 "Nugget" cards (valued 1 to 5).</li>
              <li>Secretly, you both choose one Nugget card from your hand to play.</li>
              <li>The player who played the higher value Nugget wins the round. The winner's score increases by the Round Value PLUS the value of both played Nuggets.</li>
              <li>If both players play the same value Nugget, it's a draw, and no one scores.</li>
              <li>Each Nugget card can only be used once per game! Choose wisely.</li>
              <li>The player with the highest total score after 5 rounds wins the entire pot!</li>
            </ul>
          </CollapsibleRule>
          <CollapsibleRule title="Neon Pong" colorTheme="blue">
             <ul className="list-disc list-outside ml-5 space-y-2">
              <li>Use the <strong>W key</strong> to move your paddle (Blue) up.</li>
              <li>Use the <strong>S key</strong> to move your paddle down.</li>
              <li>The first player to score <strong>3 points</strong> wins the round.</li>
              <li>The match is a <strong>best of 3 rounds</strong>. The first player to win 2 rounds wins the pot!</li>
              <li>The ball gets faster with every paddle hit, so stay on your toes!</li>
            </ul>
          </CollapsibleRule>
          <CollapsibleRule title="Cosmic Dodge" colorTheme="pink">
             <ul className="list-disc list-outside ml-5 space-y-2">
              <li>Use the <strong>W, A, S, D keys</strong> to control your ship (Blue).</li>
              <li>You and your opponent face identical waves of asteroids and lasers in separate arenas.</li>
              <li>The round ends when a ship is destroyed. The surviving player wins the round.</li>
              <li>The first player to win <strong>3 rounds</strong> wins the match and the pot!</li>
              <li>The longer the round goes on, the more intense the patterns become.</li>
            </ul>
          </CollapsibleRule>
          <CollapsibleRule title="Quantum Gambit" colorTheme="purple">
             <ul className="list-disc list-outside ml-5 space-y-2">
              <li>Each player starts with 16 pieces: one king, one queen, two rooks, two knights, two bishops, and eight pawns.</li>
              <li>The goal is to checkmate the other king. Checkmate happens when the king is in a position to be captured (in "check") and cannot escape from capture.</li>
              <li>Players take turns moving one of their pieces. White moves first.</li>
              <li>Create a lobby or join an existing one to be randomly assigned as White or Black.</li>
            </ul>
          </CollapsibleRule>
        </div>
      </div>

      {/* Leaderboard Section */}
      <div className="w-full max-w-4xl mx-auto">
        <h2 className="text-4xl font-extrabold font-display text-center mb-8">Leaderboard</h2>
        <div className="bg-brand-gray border border-gray-700 rounded-lg p-4">
          <div className="flex justify-center gap-2 mb-4 border-b border-gray-700 pb-4 flex-wrap">
             {gameFilters.map(({ key, label, color }) => (
              <button key={key} onClick={() => setActiveGameFilter(key)} className={`px-4 py-2 text-sm font-bold rounded-md transition-colors ${activeGameFilter === key ? `bg-${color === 'gray' ? 'blue' : color} text-brand-dark` : 'bg-brand-dark/50 text-gray-300 hover:bg-gray-700'}`}>
                {label}
              </button>
            ))}
          </div>
           <div className="flex justify-center gap-2 mb-4 flex-wrap">
            {timeFilters.map(({ key, label }) => (
              <button key={key} onClick={() => setActiveTimeFilter(key)} className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${activeTimeFilter === key ? 'bg-gray-600 text-white' : 'bg-brand-dark text-gray-400 hover:bg-gray-700'}`}>
                {label}
              </button>
            ))}
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-600 text-gray-400">
                <th className="p-2">Rank</th>
                <th className="p-2">Player</th>
                <th className="p-2 text-right">Score</th>
              </tr>
            </thead>
            <tbody>
              {leaderboardData[activeGameFilter][activeTimeFilter].map(({ rank, name, score }) => (
                <tr key={rank} className="border-b border-gray-800 last:border-b-0">
                  <td className="p-3 font-bold">{rank}</td>
                  <td className="p-3">{name}</td>
                  <td className="p-3 text-right font-mono text-yellow-light">{score.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MainPage;