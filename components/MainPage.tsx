import React, { useState } from 'react';

interface MainPageProps {
  onSelectGame: (gameId: string) => void;
}

// --- Leaderboard Data (Mock) ---
type LeaderboardEntry = {
  rank: number;
  address: string;
  nickname: string;
  winnings: number;
};

// Expanded to support game-specific leaderboards
const LEADERBOARD_DATA: { [game: string]: { [time: string]: LeaderboardEntry[] } } = {
  overall: {
    '1d': [
      { rank: 1, address: 'LpA3...vXzG', nickname: 'Glitch', winnings: 45.5 },
      { rank: 2, address: '7xYq...k9P1', nickname: 'NeonNinja', winnings: 38.2 },
      { rank: 3, address: 'FzWc...bN4h', nickname: 'CypherPunk', winnings: 32.0 },
      { rank: 4, address: 'GUEST_DEMO_WALLET', nickname: 'Guest', winnings: 29.7 },
      { rank: 5, address: '9sDf...mK3J', nickname: 'Vector', winnings: 25.1 },
    ],
    '3d': [
      { rank: 1, address: 'FzWc...bN4h', nickname: 'CypherPunk', winnings: 178.1 },
      { rank: 2, address: '7xYq...k9P1', nickname: 'NeonNinja', winnings: 165.4 },
      { rank: 3, address: 'LpA3...vXzG', nickname: 'Glitch', winnings: 155.9 },
    ],
    '7d': [
      { rank: 1, address: 'FzWc...bN4h', nickname: 'CypherPunk', winnings: 352.6 },
      { rank: 2, address: 'LpA3...vXzG', nickname: 'Glitch', winnings: 331.2 },
      { rank: 3, address: 'QwE5...zX2a', nickname: 'Phantom', winnings: 310.0 },
    ],
    '30d': [
      { rank: 1, address: 'LpA3...vXzG', nickname: 'Glitch', winnings: 1540.8 },
      { rank: 2, address: 'FzWc...bN4h', nickname: 'CypherPunk', winnings: 1499.1 },
      { rank: 3, address: '9sDf...mK3J', nickname: 'Vector', winnings: 1412.7 },
    ],
  },
  'solana-gold-rush': {
    '1d': [
      { rank: 1, address: 'Au1g...H2j3', nickname: 'GoldDigger', winnings: 15.2 },
      { rank: 2, address: 'Ag4k...L5m6', nickname: 'NuggetHunter', winnings: 12.8 },
      { rank: 3, address: 'Cu7n...O8p9', nickname: 'ClaimJumper', winnings: 9.1 },
    ],
    '3d': [
      { rank: 1, address: 'Au1g...H2j3', nickname: 'GoldDigger', winnings: 45.2 },
      { rank: 2, address: 'Cu7n...O8p9', nickname: 'ClaimJumper', winnings: 38.1 },
      { rank: 3, address: 'Ag4k...L5m6', nickname: 'NuggetHunter', winnings: 33.4 },
    ],
    '7d': [
      { rank: 1, address: 'Cu7n...O8p9', nickname: 'ClaimJumper', winnings: 99.5 },
      { rank: 2, address: 'Au1g...H2j3', nickname: 'GoldDigger', winnings: 92.1 },
      { rank: 3, address: 'Ag4k...L5m6', nickname: 'NuggetHunter', winnings: 85.3 },
    ],
    '30d': [
      { rank: 1, address: 'Cu7n...O8p9', nickname: 'ClaimJumper', winnings: 350.7 },
      { rank: 2, address: 'Au1g...H2j3', nickname: 'GoldDigger', winnings: 330.2 },
      { rank: 3, address: 'Ag4k...L5m6', nickname: 'NuggetHunter', winnings: 310.9 },
    ],
  },
  'neon-pong': {
    '1d': [
      { rank: 1, address: 'Ne1a...B2c3', nickname: 'PaddleMaster', winnings: 22.1 },
      { rank: 2, address: 'Ar4d...E5f6', nickname: 'SpinDoctor', winnings: 18.5 },
      { rank: 3, address: 'Kr7g...H8i9', nickname: 'WallBouncer', winnings: 15.3 },
    ],
    '3d': [
      { rank: 1, address: 'Ne1a...B2c3', nickname: 'PaddleMaster', winnings: 60.1 },
      { rank: 2, address: 'Ar4d...E5f6', nickname: 'SpinDoctor', winnings: 55.2 },
      { rank: 3, address: 'Kr7g...H8i9', nickname: 'WallBouncer', winnings: 49.8 },
    ],
    '7d': [
      { rank: 1, address: 'Ar4d...E5f6', nickname: 'SpinDoctor', winnings: 125.6 },
      { rank: 2, address: 'Ne1a...B2c3', nickname: 'PaddleMaster', winnings: 119.8 },
      { rank: 3, address: 'Kr7g...H8i9', nickname: 'WallBouncer', winnings: 110.2 },
    ],
    '30d': [
      { rank: 1, address: 'Ar4d...E5f6', nickname: 'SpinDoctor', winnings: 450.3 },
      { rank: 2, address: 'Ne1a...B2c3', nickname: 'PaddleMaster', winnings: 432.1 },
      { rank: 3, address: 'Kr7g...H8i9', nickname: 'WallBouncer', winnings: 415.9 },
    ],
  },
  'cosmic-dodge': {
    '1d': [
      { rank: 1, address: 'Xe1j...K2l3', nickname: 'StarSkipper', winnings: 19.8 },
      { rank: 2, address: 'Rn4m...O5p6', nickname: 'VoidDancer', winnings: 16.2 },
      { rank: 3, address: 'He7q...R8s9', nickname: 'CometChaser', winnings: 13.9 },
    ],
    '3d': [
      { rank: 1, address: 'He7q...R8s9', nickname: 'CometChaser', winnings: 58.3 },
      { rank: 2, address: 'Xe1j...K2l3', nickname: 'StarSkipper', winnings: 52.1 },
      { rank: 3, 'address': 'Rn4m...O5p6', nickname: 'VoidDancer', winnings: 47.6 },
    ],
    '7d': [
      { rank: 1, address: 'He7q...R8s9', nickname: 'CometChaser', winnings: 115.4 },
      { rank: 2, address: 'Xe1j...K2l3', nickname: 'StarSkipper', winnings: 111.9 },
      { rank: 3, address: 'Rn4m...O5p6', nickname: 'VoidDancer', winnings: 108.2 },
    ],
    '30d': [
      { rank: 1, address: 'He7q...R8s9', nickname: 'CometChaser', winnings: 420.5 },
      { rank: 2, address: 'Xe1j...K2l3', nickname: 'StarSkipper', winnings: 410.7 },
      { rank: 3, address: 'Rn4m...O5p6', nickname: 'VoidDancer', winnings: 399.8 },
    ],
  },
};

// --- Leaderboard Component ---
const Leaderboard: React.FC = () => {
  type GameKey = 'overall' | 'solana-gold-rush' | 'neon-pong' | 'cosmic-dodge';
  type TimeKey = '1d' | '3d' | '7d' | '30d';

  const [activeGame, setActiveGame] = useState<GameKey>('overall');
  const [activeTimeFilter, setActiveTimeFilter] = useState<TimeKey>('7d');
  
  const gameFilters: { key: GameKey, label: string, color: string }[] = [
    { key: 'overall', label: 'Overall', color: 'yellow' },
    { key: 'solana-gold-rush', label: 'Gold Rush', color: 'yellow' },
    { key: 'neon-pong', label: 'Neon Pong', color: 'blue' },
    { key: 'cosmic-dodge', label: 'Cosmic Dodge', color: 'pink' },
  ];

  const timeFilters: { key: TimeKey, label: string }[] = [
    { key: '1d', label: '1 Day' },
    { key: '3d', label: '3 Days' },
    { key: '7d', label: '7 Days' },
    { key: '30d', label: '30 Days' },
  ];

  const data = LEADERBOARD_DATA[activeGame]?.[activeTimeFilter] ?? [];

  return (
    <div className="w-full bg-brand-gray border border-yellow/20 rounded-lg p-6 mt-16 animate-fadeIn">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
        <h2 className="text-4xl font-extrabold font-display mb-4 sm:mb-0 bg-gradient-to-r from-pink-light via-blue-light to-yellow-light bg-clip-text text-transparent animate-psychedelic-bg bg-[size:400%_400%]">Leaderboard</h2>
        <div className="flex gap-2 bg-brand-dark p-1 rounded-md">
          {timeFilters.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTimeFilter(key)}
              className={`py-2 px-4 rounded-md font-bold text-sm transition-colors duration-200
                ${activeTimeFilter === key
                  ? 'bg-yellow text-brand-dark'
                  : 'bg-transparent text-gray-400 hover:bg-gray-700 hover:text-white'
                }`
              }
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      
      <div className="flex flex-wrap justify-center gap-2 mb-6 bg-brand-dark p-2 rounded-md">
        {gameFilters.map(({ key, label, color }) => (
          <button
            key={key}
            onClick={() => setActiveGame(key)}
            className={`py-2 px-4 rounded-md font-bold text-sm transition-colors duration-200
              ${activeGame === key
                ? `bg-${color} text-brand-dark`
                : 'bg-transparent text-gray-400 hover:bg-gray-700 hover:text-white'
              }`
            }
          >
            {label}
          </button>
        ))}
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
        {data.length > 0 ? data.map((entry, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 bg-brand-dark rounded-md border-l-4 border-transparent hover:bg-gray-800 hover:border-yellow transition-all"
          >
            <div className="flex items-center gap-4">
              <span className="font-bold text-lg text-gray-400 w-6 text-center">{entry.rank}</span>
              <span className="font-mono text-white text-sm sm:text-base">{entry.nickname}</span>
            </div>
            <span className="font-bold text-sm sm:text-base bg-gradient-to-r from-pink-light via-blue-light to-yellow-light bg-clip-text text-transparent animate-psychedelic-bg bg-[size:400%_400%]">{entry.winnings.toFixed(2)} SOL</span>
          </div>
        )) : (
          <div className="text-center py-8 text-gray-500">
            No data available for this category.
          </div>
        )}
      </div>
    </div>
  );
};

// --- New components for info section ---
const WalletIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4 text-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25-2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
    </svg>
);
const LightningIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4 text-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>
);
const RocketIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4 text-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
    </svg>
);

type InfoCardProps = {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
};

const InfoCard = ({ icon, title, children }: InfoCardProps) => (
    <div className="bg-brand-gray border border-blue/20 rounded-lg p-6 text-center transform transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue/10 flex flex-col items-center">
        {icon}
        <h3 className="text-2xl font-bold font-display text-blue-light mb-3">{title}</h3>
        {children}
    </div>
);

const CollapsibleRule = ({ title, colorTheme, children }: { title: string, colorTheme: 'yellow' | 'blue' | 'pink', children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);

  const colorClasses = {
    blue: {
      border: 'border-blue/50',
      text: 'text-blue-light',
      hoverBg: 'hover:bg-blue/10',
    },
    yellow: {
      border: 'border-yellow/50',
      text: 'text-yellow-light',
      hoverBg: 'hover:bg-yellow/10',
    },
    pink: {
      border: 'border-pink/50',
      text: 'text-pink-light',
      hoverBg: 'hover:bg-pink/10',
    }
  };
  const theme = colorClasses[colorTheme];

  return (
    <div className={`bg-brand-dark border ${theme.border} rounded-lg mb-4`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex justify-between items-center p-4 text-left ${theme.hoverBg} transition-colors duration-200`}
        aria-expanded={isOpen}
      >
        <h3 className={`text-2xl font-bold font-display ${theme.text}`}>{title}</h3>
        <svg
          className={`w-6 h-6 transform transition-transform duration-300 text-gray-400 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </button>
      <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isOpen ? 'max-h-96' : 'max-h-0'}`}>
        <div className="p-6 border-t border-gray-700 text-gray-300 leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  );
};


const MainPage: React.FC<MainPageProps> = ({ onSelectGame }) => {
  const colorClasses = {
    blue: {
      border: 'border-blue/20 hover:border-blue/50',
      shadow: 'hover:shadow-2xl hover:shadow-blue/20',
      text: 'text-blue',
      bg: 'bg-blue group-hover:bg-blue-light',
    },
    yellow: {
      border: 'border-yellow/20 hover:border-yellow/50',
      shadow: 'hover:shadow-2xl hover:shadow-yellow/20',
      text: 'text-yellow',
      bg: 'bg-yellow group-hover:bg-yellow-light',
    },
    pink: {
      border: 'border-pink/20 hover:border-pink/50',
      shadow: 'hover:shadow-2xl hover:shadow-pink/20',
      text: 'text-pink',
      bg: 'bg-pink group-hover:bg-pink-light',
    },
  };

  return (
    <div className="animate-fadeIn w-full">
       <div className="text-center mb-16 animate-fadeIn" style={{ animationDelay: '100ms' }}>
        <h1 className="text-5xl md:text-6xl font-extrabold font-display mb-4 bg-gradient-to-r from-pink-light via-blue-light to-yellow-light bg-clip-text text-transparent animate-psychedelic-bg bg-[size:400%_400%] uppercase">
          <div>The Future of</div>
          <div>Web3 PvP Games</div>
        </h1>
        <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto">
            Experience skill-based gaming on the Solana blockchain. Fair, transparent, and instant peer-to-peer wagers where you are always in control of your funds.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20 animate-fadeIn" style={{ animationDelay: '200ms' }}>
        {/* Fix: The InfoCard component expects a 'children' prop. The descriptive paragraph has been nested inside the component to provide it. */}
        <InfoCard icon={<WalletIcon />} title="True Self-Custody">
          <p className="text-gray-400">Your funds never leave your wallet. We never take deposits. All wagers are handled by secure, peer-to-peer transactions directly on the Solana blockchain.</p>
        </InfoCard>
        {/* Fix: The InfoCard component expects a 'children' prop. The descriptive paragraph has been nested inside the component to provide it. */}
        <InfoCard icon={<LightningIcon />} title="Pure Skill, No Luck">
          <p className="text-gray-400">Victory is determined by your skill, not by chance. Our games are designed to be competitive and fair, rewarding strategy and quick reflexes.</p>
        </InfoCard>
        {/* Fix: The InfoCard component expects a 'children' prop. The descriptive paragraph has been nested inside the component to provide it. */}
        <InfoCard icon={<RocketIcon />} title="Instant Payouts">
          <p className="text-gray-400">Winnings are sent directly to your wallet the moment you win. No waiting, no withdrawals. Just pure, instant gratification powered by Solana.</p>
        </InfoCard>
      </div>
      
      <h2 className="text-5xl font-extrabold font-display mb-10 text-center bg-gradient-to-r from-pink-light via-blue-light to-yellow-light bg-clip-text text-transparent animate-psychedelic-bg bg-[size:400%_400%]">
        Choose Your Arena
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {/* Solana Gold Rush Card */}
        <button
          onClick={() => onSelectGame('solana-gold-rush')}
          className={`group bg-brand-gray border rounded-lg p-6 flex flex-col items-center text-center transform transition-all duration-300 hover:-translate-y-2 ${colorClasses.yellow.border} ${colorClasses.yellow.shadow} cursor-pointer w-full`}
          aria-label="Play Gold Rush"
        >
          <div className="flex-grow">
            <h3 className={`text-3xl font-bold font-display mb-3 ${colorClasses.yellow.text}`}>Gold Rush</h3>
            <p className="text-gray-400">A 1v1 betting game of wits. Outplay your opponent over five rounds to win the pot.</p>
          </div>
          <div
            aria-hidden="true"
            className={`mt-8 text-brand-dark font-bold py-2 px-8 rounded-lg text-lg transition-transform transform group-hover:scale-105 shadow-md ${colorClasses.yellow.bg}`}
          >
            Play Now
          </div>
        </button>

        {/* Neon Pong Card */}
        <button
          onClick={() => onSelectGame('neon-pong')}
          className={`group bg-brand-gray border rounded-lg p-6 flex flex-col items-center text-center transform transition-all duration-300 hover:-translate-y-2 ${colorClasses.blue.border} ${colorClasses.blue.shadow} cursor-pointer w-full`}
          aria-label="Play Neon Pong"
        >
          <div className="flex-grow">
            <h3 className={`text-3xl font-bold font-display mb-3 ${colorClasses.blue.text}`}>Neon Pong</h3>
            <p className="text-gray-400">The classic arcade game re-imagined. Wager on your reflexes in a high-stakes duel.</p>
          </div>
          <div
            aria-hidden="true"
            className={`mt-8 text-brand-dark font-bold py-2 px-8 rounded-lg text-lg transition-transform transform group-hover:scale-105 shadow-md ${colorClasses.blue.bg}`}
          >
            Play Now
          </div>
        </button>

        {/* Cosmic Dodge Card */}
        <button
          onClick={() => onSelectGame('cosmic-dodge')}
          className={`group bg-brand-gray border rounded-lg p-6 flex flex-col items-center text-center transform transition-all duration-300 hover:-translate-y-2 ${colorClasses.pink.border} ${colorClasses.pink.shadow} cursor-pointer w-full`}
          aria-label="Play Cosmic Dodge"
        >
          <div className="flex-grow">
            <h3 className={`text-3xl font-bold font-display mb-3 ${colorClasses.pink.text}`}>Cosmic Dodge</h3>
            <p className="text-gray-400">Outlast your opponent in a chaotic "bullet hell" survival duel.</p>
          </div>
          <div
            aria-hidden="true"
            className={`mt-8 text-brand-dark font-bold py-2 px-8 rounded-lg text-lg transition-transform transform group-hover:scale-105 shadow-md ${colorClasses.pink.bg}`}
          >
            Play Now
          </div>
        </button>
      </div>

      <div className="max-w-3xl mx-auto mt-20 w-full">
        <h2 className="text-5xl font-extrabold font-display mb-10 text-center bg-gradient-to-r from-pink-light via-blue-light to-yellow-light bg-clip-text text-transparent animate-psychedelic-bg bg-[size:400%_400%]">
          Game Rules
        </h2>
        
        {/* Fix: The CollapsibleRule component expects a 'children' prop. The game rules have been nested inside the component to provide it. */}
        <CollapsibleRule title="Gold Rush" colorTheme="yellow">
          <p>Gold Rush is a game of bidding and bluffing.</p>
          <ol className="list-decimal list-inside space-y-2 mt-4">
            <li>The game consists of <strong>5 rounds</strong>.</li>
            <li>In each round, a random "Round Number" is revealed.</li>
            <li>Both players have five "Data Chips" valued 1 through 5. You can only use each chip once.</li>
            <li>Simultaneously, both players choose one of their available chips to play.</li>
            <li>The player who played the <strong>higher value chip</strong> wins the round.</li>
            <li>The round winner scores points equal to: <strong>Round Number + Your Chip + Opponent's Chip</strong>.</li>
            <li>If both players play the same chip, it's a draw and no points are awarded.</li>
            <li>The player with the most points after 5 rounds wins the entire pot!</li>
          </ol>
        </CollapsibleRule>

        {/* Fix: The CollapsibleRule component expects a 'children' prop. The game rules have been nested inside the component to provide it. */}
        <CollapsibleRule title="Neon Pong" colorTheme="blue">
           <p>Neon Pong is a classic arcade game with a crypto twist.</p>
          <ul className="list-disc list-inside space-y-2 mt-4">
              <li>Use the <strong>W key</strong> to move up and <strong>S key</strong> to move down.</li>
              <li>The goal is to hit the ball past your opponent's paddle to score a point.</li>
              <li>The ball's speed increases during each rally.</li>
              <li>Be the first to score <strong>3 points</strong> to win a round.</li>
              <li>The first player to win <strong>2 rounds</strong> wins the match and the pot!</li>
          </ul>
        </CollapsibleRule>
        
        {/* Fix: The CollapsibleRule component expects a 'children' prop. The game rules have been nested inside the component to provide it. */}
        <CollapsibleRule title="Cosmic Dodge" colorTheme="pink">
          <p>Cosmic Dodge is a "bullet hell" survival duel where your only goal is to outlast your opponent.</p>
          <ul className="list-disc list-inside space-y-2 mt-4">
              <li>Use the <strong>W, A, S, D keys</strong> to control your ship.</li>
              <li>You and your opponent face identical waves of projectiles in separate arenas.</li>
              <li>The round ends when a ship is destroyed. The surviving player wins the round.</li>
              <li>The first player to win <strong>3 rounds</strong> wins the match and the pot!</li>
              <li>The longer the round goes on, the more intense the patterns become.</li>
              <li>Stay focused, stay moving, and survive!</li>
          </ul>
        </CollapsibleRule>
      </div>

      <Leaderboard />
    </div>
  );
};

export default MainPage;