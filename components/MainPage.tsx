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

// Expanded to 30 entries per category with nicknames
const LEADERBOARD_DATA: { [key: string]: LeaderboardEntry[] } = {
  '1d': [
    { rank: 1, address: 'GUEST_DEMO_WALLET', nickname: 'Guest', winnings: 25.5 },
    { rank: 2, address: '7xYq...k9P1', nickname: 'NeonNinja', winnings: 18.2 },
    { rank: 3, address: 'FzWc...bN4h', nickname: 'CypherPunk', winnings: 12.0 },
    { rank: 4, address: 'LpA3...vXzG', nickname: 'Glitch', winnings: 9.7 },
    { rank: 5, address: '9sDf...mK3J', nickname: 'Vector', winnings: 5.1 },
    { rank: 6, address: 'aB1c...dE2f', nickname: 'BitRunner', winnings: 4.8 },
    { rank: 7, address: 'hG3i...jK4l', nickname: 'Satoshi Jr', winnings: 4.5 },
    { rank: 8, address: 'mN5o...pQ6r', nickname: 'GridRider', winnings: 4.2 },
    { rank: 9, address: 'sT7u...vW8x', nickname: 'Arcade King', winnings: 3.9 },
    { rank: 10, address: 'yZ9a...bC0d', nickname: 'ZeroCool', winnings: 3.6 },
    { rank: 11, address: 'eF1g...hI2j', nickname: 'Proxy', winnings: 3.3 },
    { rank: 12, address: 'kL3m...nO4p', nickname: 'SynthWave', winnings: 3.1 },
    { rank: 13, address: 'qR5s...tU6v', nickname: 'DataThief', winnings: 2.9 },
    { rank: 14, address: 'wX7y...zZ8a', nickname: 'CodeSlinger', winnings: 2.7 },
    { rank: 15, address: 'bC9d...eF0g', nickname: 'ROM', winnings: 2.5 },
    { rank: 16, address: 'hI1j...kL2m', nickname: 'RAM', winnings: 2.3 },
    { rank: 17, address: 'nO3p...qR4s', nickname: 'Kernel', winnings: 2.1 },
    { rank: 18, address: 'tU5v...wX6y', nickname: 'Byte', winnings: 1.9 },
    { rank: 19, address: 'zZ7a...bC8d', nickname: 'Voxel', winnings: 1.7 },
    { rank: 20, address: 'eF9g...hI0j', nickname: 'Pixel', winnings: 1.5 },
    { rank: 21, address: 'kL1m...nO2p', nickname: 'Firewall', winnings: 1.4 },
    { rank: 22, address: 'qR3s...tU4v', nickname: 'Root', winnings: 1.3 },
    { rank: 23, address: 'wX5y...zZ6a', nickname: 'Admin', winnings: 1.2 },
    { rank: 24, address: 'bC7d...eF8g', nickname: 'Node', winnings: 1.1 },
    { rank: 25, address: 'hI9j...kL0m', nickname: 'Hash', winnings: 1.0 },
    { rank: 26, address: 'nO1p...qR2s', nickname: 'Ledger', winnings: 0.9 },
    { rank: 27, address: 'tU3v...wX4y', nickname: 'Mainframe', winnings: 0.8 },
    { rank: 28, address: 'zZ5a...bC6d', nickname: 'DialUp', winnings: 0.7 },
    { rank: 29, address: 'eF7g...hI8j', nickname: 'Lag', winnings: 0.6 },
    { rank: 30, address: 'kL9m...nO0p', nickname: 'Ping', winnings: 0.5 },
  ],
  '3d': [
    { rank: 1, address: 'FzWc...bN4h', nickname: 'CypherPunk', winnings: 78.1 },
    { rank: 2, address: '7xYq...k9P1', nickname: 'NeonNinja', winnings: 65.4 },
    { rank: 3, address: 'GUEST_DEMO_WALLET', nickname: 'Guest', winnings: 55.9 },
    { rank: 4, address: 'QwE5...zX2a', nickname: 'Phantom', winnings: 43.2 },
    { rank: 5, address: 'LpA3...vXzG', nickname: 'Glitch', winnings: 31.8 },
    { rank: 6, address: 'pL4a...qW2r', nickname: 'Echo', winnings: 29.5 },
    { rank: 7, address: 'sD5f...gH3j', nickname: 'Reverb', winnings: 27.1 },
    { rank: 8, address: 'kL6m...nO4p', nickname: 'Delay', winnings: 25.2 },
    { rank: 9, address: 'zX7c...vB5n', nickname: 'Chorus', winnings: 23.4 },
    { rank: 10, address: 'aQ8w...sE6d', nickname: 'Flanger', winnings: 21.8 },
    { rank: 11, address: 'fR9t...gY7h', nickname: 'Phaser', winnings: 20.1 },
    { rank: 12, address: 'uJ1k...iL8o', nickname: 'Wah', winnings: 18.5 },
    { rank: 13, address: 'pA2s...dF3g', nickname: 'Fuzz', winnings: 17.2 },
    { rank: 14, address: 'hJ4k...lK5l', nickname: 'Overdrive', winnings: 16.0 },
    { rank: 15, address: 'zX6c...vB7n', nickname: 'Distortion', winnings: 14.9 },
    { rank: 16, address: 'mQ8w...aP9s', nickname: 'Gain', winnings: 13.8 },
    { rank: 17, address: 'dF1g...hJ2k', nickname: 'Amplitude', winnings: 12.7 },
    { rank: 18, address: 'lK3l...zX4c', nickname: 'Frequency', winnings: 11.6 },
    { rank: 19, address: 'vB5n...mQ6a', nickname: 'Hertz', winnings: 10.5 },
    { rank: 20, address: 'pS7d...fG8h', nickname: 'Wave', winnings: 9.4 },
    { rank: 21, address: 'jK9l...aP1s', nickname: 'Sine', winnings: 8.3 },
    { rank: 22, address: 'dF2g...hJ3k', nickname: 'Square', winnings: 7.2 },
    { rank: 23, address: 'lK4l...zX5c', nickname: 'Sawtooth', winnings: 6.1 },
    { rank: 24, address: 'vB6n...mQ7a', nickname: 'Triangle', winnings: 5.0 },
    { rank: 25, address: 'pS8d...fG9h', nickname: 'Noise', winnings: 4.5 },
    { rank: 26, address: 'jK0l...aP1s', nickname: 'MIDI', winnings: 4.0 },
    { rank: 27, address: 'dF2g...hJ3k', nickname: 'Tracker', winnings: 3.5 },
    { rank: 28, address: 'lK4l...zX5c', nickname: 'DemoScene', winnings: 3.0 },
    { rank: 29, address: 'vB6n...mQ7a', nickname: 'SubWoofer', winnings: 2.5 },
    { rank: 30, address: 'pS8d...fG9h', nickname: 'Tweeter', winnings: 2.0 },
  ],
  '7d': [
    { rank: 1, address: 'FzWc...bN4h', nickname: 'CypherPunk', winnings: 152.6 },
    { rank: 2, address: 'LpA3...vXzG', nickname: 'Glitch', winnings: 131.2 },
    { rank: 3, address: 'QwE5...zX2a', nickname: 'Phantom', winnings: 110.0 },
    { rank: 4, address: '7xYq...k9P1', nickname: 'NeonNinja', winnings: 98.5 },
    { rank: 5, address: 'GUEST_DEMO_WALLET', nickname: 'Guest', winnings: 85.3 },
    { rank: 6, address: 'zC1v...bN2m', nickname: 'Circuit', winnings: 80.1 },
    { rank: 7, address: 'xS3d...fG4h', nickname: 'Resistor', winnings: 75.4 },
    { rank: 8, address: 'jK5l...aP6s', nickname: 'Capacitor', winnings: 70.2 },
    { rank: 9, address: 'qW7e...rT8y', nickname: 'Diode', winnings: 65.6 },
    { rank: 10, address: 'uI9o...pA1s', nickname: 'Transistor', winnings: 61.3 },
    { rank: 11, address: 'dF2g...hJ3k', nickname: 'Inductor', winnings: 57.2 },
    { rank: 12, address: 'lK4l...zX5c', nickname: 'Relay', winnings: 53.4 },
    { rank: 13, address: 'vB6n...mQ7a', nickname: 'Switch', winnings: 49.8 },
    { rank: 14, address: 'pS8d...fG9h', nickname: 'Fuse', winnings: 46.5 },
    { rank: 15, address: 'jK0l...aP1s', nickname: 'Volt', winnings: 43.1 },
    { rank: 16, address: 'zC2v...bN3m', nickname: 'Amp', winnings: 40.0 },
    { rank: 17, address: 'xS4d...fG5h', nickname: 'Watt', winnings: 37.2 },
    { rank: 18, address: 'jK6l...aP7s', nickname: 'Ohm', winnings: 34.5 },
    { rank: 19, address: 'qW8e...rT9y', nickname: 'Joule', winnings: 32.1 },
    { rank: 20, address: 'uI0o...pA1s', nickname: 'Coulomb', winnings: 29.8 },
    { rank: 21, address: 'dF2g...hJ3k', nickname: 'Farad', winnings: 27.6 },
    { rank: 22, address: 'lK4l...zX5c', nickname: 'Henry', winnings: 25.5 },
    { rank: 23, address: 'vB6n...mQ7a', nickname: 'Tesla', winnings: 23.2 },
    { rank: 24, address: 'pS8d...fG9h', nickname: 'Weber', winnings: 21.1 },
    { rank: 25, address: 'jK0l...aP1s', nickname: 'Lumen', winnings: 19.5 },
    { rank: 26, address: 'zC2v...bN3m', nickname: 'Candela', winnings: 18.0 },
    { rank: 27, address: 'xS4d...fG5h', nickname: 'Mole', winnings: 16.5 },
    { rank: 28, address: 'jK6l...aP7s', nickname: 'Kelvin', winnings: 15.0 },
    { rank: 29, address: 'qW8e...rT9y', nickname: 'Pascal', winnings: 13.5 },
    { rank: 30, address: 'uI0o...pA1s', nickname: 'Newton', winnings: 12.0 },
  ],
  '30d': [
    { rank: 1, address: 'LpA3...vXzG', nickname: 'Glitch', winnings: 540.8 },
    { rank: 2, address: 'FzWc...bN4h', nickname: 'CypherPunk', winnings: 499.1 },
    { rank: 3, address: '9sDf...mK3J', nickname: 'Vector', winnings: 412.7 },
    { rank: 4, address: 'QwE5...zX2a', nickname: 'Phantom', winnings: 350.5 },
    { rank: 5, address: '7xYq...k9P1', nickname: 'NeonNinja', winnings: 280.9 },
    { rank: 6, address: 'oP1a...sD2f', nickname: 'Hacker', winnings: 271.3 },
    { rank: 7, address: 'gH3j...kL4m', nickname: 'ScriptKiddie', winnings: 262.0 },
    { rank: 8, address: 'nO5p...qR6s', nickname: 'Wizard', winnings: 253.1 },
    { rank: 9, address: 'tU7v...wX8y', nickname: 'Sorcerer', winnings: 244.5 },
    { rank: 10, address: 'zZ9a...bC0b', nickname: 'Warlock', winnings: 236.2 },
    { rank: 11, address: 'dE1c...fG2h', nickname: 'Mage', winnings: 228.1 },
    { rank: 12, address: 'iJ3k...lM4n', nickname: 'Cleric', winnings: 220.3 },
    { rank: 13, address: 'oP5q...rS6t', nickname: 'Paladin', winnings: 212.8 },
    { rank: 14, address: 'uV7w...xY8z', nickname: 'Ranger', winnings: 205.5 },
    { rank: 15, address: 'aB9c...dE0f', nickname: 'Rogue', winnings: 198.5 },
    { rank: 16, address: 'gH1j...kL2m', nickname: 'Bard', winnings: 191.7 },
    { rank: 17, address: 'nO3p...qR4s', nickname: 'Druid', winnings: 185.2 },
    { rank: 18, address: 'tU5v...wX6y', nickname: 'Monk', winnings: 178.9 },
    { rank: 19, address: 'zZ7a...bC8b', nickname: 'Barbarian', winnings: 172.8 },
    { rank: 20, address: 'dE9c...fG0h', nickname: 'Fighter', winnings: 166.9 },
    { rank: 21, address: 'iJ1k...lM2n', nickname: 'Artificer', winnings: 161.2 },
    { rank: 22, address: 'oP3q...rS4t', nickname: 'BloodHunter', winnings: 155.8 },
    { rank: 23, address: 'uV5w...xY6z', nickname: 'Goblin', winnings: 150.5 },
    { rank: 24, address: 'aB7c...dE8f', nickname: 'Orc', winnings: 145.4 },
    { rank: 25, address: 'gH9j...kL0m', nickname: 'Elf', winnings: 140.5 },
    { rank: 26, address: 'nO1p...qR2s', nickname: 'Dwarf', winnings: 135.8 },
    { rank: 27, address: 'tU3v...wX4y', nickname: 'Halfling', winnings: 131.2 },
    { rank: 28, address: 'zZ5a...bC6b', nickname: 'Gnome', winnings: 126.8 },
    { rank: 29, address: 'dE7c...fG8h', nickname: 'Tiefling', winnings: 122.6 },
    { rank: 30, address: 'iJ9k...lM0n', nickname: 'Dragonborn', winnings: 118.5 },
  ],
};


// --- Leaderboard Component ---
const Leaderboard: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<'1d' | '3d' | '7d' | '30d'>('7d');
  const filters: { key: '1d' | '3d' | '7d' | '30d', label: string }[] = [
    { key: '1d', label: '1 Day' },
    { key: '3d', label: '3 Days' },
    { key: '7d', label: '7 Days' },
    { key: '30d', label: '30 Days' },
  ];

  const data = LEADERBOARD_DATA[activeFilter];

  return (
    <div className="w-full bg-brand-gray border border-yellow/20 rounded-lg p-6 mt-16 animate-fadeIn">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
        <h2 className="text-4xl font-extrabold font-display mb-4 sm:mb-0 bg-gradient-to-r from-pink-light via-blue-light to-yellow-light bg-clip-text text-transparent animate-psychedelic-bg bg-[size:400%_400%]">Leaderboard</h2>
        <div className="flex gap-2 bg-brand-dark p-1 rounded-md">
          {filters.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveFilter(key)}
              className={`py-2 px-4 rounded-md font-bold text-sm transition-colors duration-200
                ${activeFilter === key
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
      <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
        {data.map((entry, index) => (
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
        ))}
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


const MainPage: React.FC<MainPageProps> = ({ onSelectGame }) => {
  const colorClasses = {
    blue: {
      border: 'border-blue/20 hover:border-blue/50',
      shadow: 'hover:shadow-blue/10',
      text: 'text-blue',
      bg: 'bg-blue group-hover:bg-blue-light',
    },
    yellow: {
      border: 'border-yellow/20 hover:border-yellow/50',
      shadow: 'hover:shadow-yellow/10',
      text: 'text-yellow',
      bg: 'bg-yellow group-hover:bg-yellow-light',
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
      
      {/* FIX: Added children to each InfoCard component to satisfy the required 'children' prop. */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20 animate-fadeIn" style={{ animationDelay: '200ms' }}>
        <InfoCard icon={<WalletIcon />} title="True Self-Custody">
          <p className="text-gray-400">Your funds never leave your wallet. We never take deposits. All wagers are handled by secure, peer-to-peer transactions directly on the Solana blockchain.</p>
        </InfoCard>
        <InfoCard icon={<LightningIcon />} title="Pure Skill, No Luck">
          <p className="text-gray-400">Victory is determined by your skill, not by chance. Our games are designed to be competitive and fair, rewarding strategy and quick reflexes.</p>
        </InfoCard>
        <InfoCard icon={<RocketIcon />} title="Instant Payouts">
          <p className="text-gray-400">Winnings are sent directly to your wallet the moment you win. No waiting, no withdrawals. Just pure, instant gratification powered by Solana.</p>
        </InfoCard>
      </div>
      
      <h2 className="text-5xl font-extrabold font-display mb-10 text-center bg-gradient-to-r from-pink-light via-blue-light to-yellow-light bg-clip-text text-transparent animate-psychedelic-bg bg-[size:400%_400%]">
        Choose Your Arena
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
        {/* Solana Gold Rush Card */}
        <button
          onClick={() => onSelectGame('solana-gold-rush')}
          className={`group bg-brand-gray border rounded-lg p-6 flex flex-col items-center text-center transform transition-all duration-300 hover:-translate-y-2 ${colorClasses.yellow.border} ${colorClasses.yellow.shadow} cursor-pointer w-full`}
          aria-label="Play Gold Rush"
        >
          <h3 className={`text-3xl font-bold font-display mb-3 ${colorClasses.yellow.text}`}>Gold Rush</h3>
          <p className="text-gray-400 mb-6 h-12">A 1v1 betting game of wits. Outplay your opponent over five rounds to win the pot.</p>
          <div
            aria-hidden="true"
            className={`mt-auto text-brand-dark font-bold py-2 px-8 rounded-lg text-lg transition-transform transform group-hover:scale-105 shadow-md ${colorClasses.yellow.bg}`}
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
          <h3 className={`text-3xl font-bold font-display mb-3 ${colorClasses.blue.text}`}>Neon Pong</h3>
          <p className="text-gray-400 mb-6 h-12">The classic arcade game re-imagined. Wager on your reflexes in a high-stakes duel.</p>
          <div
            aria-hidden="true"
            className={`mt-auto text-brand-dark font-bold py-2 px-8 rounded-lg text-lg transition-transform transform group-hover:scale-105 shadow-md ${colorClasses.blue.bg}`}
          >
            Play Now
          </div>
        </button>
      </div>
      <Leaderboard />
    </div>
  );
};

export default MainPage;