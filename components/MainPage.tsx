import React, { useState } from 'react';

// --- SVG Icons for Game Cards ---
const GoldRushIcon = () => (
    <svg width="80" height="80" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{stopColor: '#FFD700', stopOpacity: 1}} />
                <stop offset="100%" style={{stopColor: '#E0B400', stopOpacity: 1}} />
            </linearGradient>
            <filter id="goldGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
                <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.7 0" result="glow" />
                <feMerge>
                    <feMergeNode in="glow" />
                    <feMergeNode in="SourceGraphic" />
                </feMerge>
            </filter>
        </defs>
        <g filter="url(#goldGlow)">
            <rect x="20" y="60" width="60" height="20" fill="url(#goldGradient)" stroke="#FFF700" strokeWidth="2" rx="2"/>
            <rect x="30" y="40" width="60" height="20" fill="url(#goldGradient)" stroke="#FFF700" strokeWidth="2" rx="2"/>
            <rect x="40" y="20" width="60" height="20" fill="url(#goldGradient)" stroke="#FFF700" strokeWidth="2" rx="2"/>
        </g>
    </svg>
);

const NeonPongIcon = () => (
    <svg width="80" height="80" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <filter id="neonGlowBlue" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
                <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.9 0" result="glow" />
                <feMerge><feMergeNode in="glow" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
             <filter id="neonGlowRed" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
                <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.9 0" result="glow" />
                <feMerge><feMergeNode in="glow" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
             <filter id="neonGlowWhite" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
                <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0" result="glow" />
                <feMerge><feMergeNode in="glow" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
        </defs>
        <rect x="15" y="30" width="8" height="40" fill="#7DF9FF" rx="4" filter="url(#neonGlowBlue)" />
        <rect x="77" y="30" width="8" height="40" fill="#F87171" rx="4" filter="url(#neonGlowRed)" />
        <g transform="translate(40, 50) rotate(-30)">
          <circle cx="0" cy="0" r="6" fill="white" filter="url(#neonGlowWhite)" />
          <line x1="5" y1="0" x2="15" y2="0" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
          <line x1="8" y1="-3" x2="12" y2="-7" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
          <line x1="8" y1="3" x2="12" y2="7" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
        </g>
    </svg>
);


const CosmicDodgeIcon = () => (
    <svg width="80" height="80" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="shipGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FF7ED4"/>
                <stop offset="100%" stopColor="#C2007B"/>
            </linearGradient>
            <filter id="pinkGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur"/>
                <feColorMatrix in="blur" type="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 0.8 0"/>
                <feMerge>
                    <feMergeNode in="SourceGraphic"/>
                    <feMergeNode in="blur"/>
                </feMerge>
            </filter>
        </defs>
        <g transform="rotate(315 50 50)" filter="url(#pinkGlow)">
            <path d="M50 20 L70 70 L50 60 L30 70 Z" fill="url(#shipGradient)" stroke="white" strokeWidth="2"/>
            <circle cx="50" cy="35" r="5" fill="#FFF"/>
            <path d="M50 70 L40 85 L60 85 Z" fill="orange"/>
        </g>
    </svg>
);


const QuantumGambitIcon = () => (
     <svg width="80" height="80" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <filter id="purpleGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="5" result="coloredBlur"/>
                <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            </filter>
        </defs>
        <g filter="url(#purpleGlow)">
            <path d="M 50 15 C 40 25 40 40 50 45 C 55 40 70 30 80 25 C 70 20 55 15 50 15 Z M 45 48 C 35 52 30 60 30 70 L 30 80 L 70 80 L 70 75 C 60 75 60 65 55 65 L 50 65 L 50 50 C 48 50 46 49 45 48 Z" fill="#C084FC" stroke="white" strokeWidth="2.5" />
        </g>
    </svg>
);


const games = [
    {
        id: 'solana-gold-rush',
        name: 'Solana Gold Rush',
        description: 'Outwit your opponent in this 5-round bidding and bluffing battle. Highest score wins the pot!',
        Icon: GoldRushIcon,
        colorTheme: 'yellow',
    },
    {
        id: 'neon-pong',
        name: 'Neon Pong',
        description: 'The arcade classic with a crypto twist. First to win 2 rounds takes home the prize.',
        Icon: NeonPongIcon,
        colorTheme: 'blue',
    },
    {
        id: 'cosmic-dodge',
        name: 'Cosmic Dodge',
        description: 'Survive waves of asteroids and lasers longer than your opponent in this intense bullet-hell duel.',
        Icon: CosmicDodgeIcon,
        colorTheme: 'pink',
    },
    {
        id: 'chess',
        name: 'Quantum Gambit',
        description: 'The ultimate game of strategy, reborn. Checkmate your opponent to claim victory on a digital frontier.',
        Icon: QuantumGambitIcon,
        colorTheme: 'purple',
    }
];

// --- Collapsible Rules Component ---
// Fix: Use React.FC and a props interface to correctly type the component.
// This resolves a TypeScript error where the special 'key' prop, used in lists,
// was not recognized by the component's inline prop type definition.
interface CollapsibleRuleProps {
    title: string;
    color: string;
    children: React.ReactNode;
    isOpen: boolean;
    onClick: () => void;
}
const CollapsibleRule: React.FC<CollapsibleRuleProps> = ({ title, color, children, isOpen, onClick }) => (
    <div className={`border-t-2 border-gray-800`}>
        <button onClick={onClick} className="w-full flex justify-between items-center py-4 px-2 text-left">
            <h4 className={`text-xl font-bold font-display ${color}`}>{title}</h4>
            <span className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>▼</span>
        </button>
        {isOpen && (
            <div className="px-4 pb-4 text-gray-400 animate-fadeIn">
                {children}
            </div>
        )}
    </div>
);

// --- Leaderboard Data and Component ---
const generateLeaderboard = (baseScore: number, names: string[]) => {
    const data = [];
    for (let i = 0; i < 30; i++) {
        data.push({
            n: names[i % names.length] + (i > names.length ? (Math.floor(i / names.length) + 1) : ''),
            w: baseScore * (1 - (i * 0.025)) * (Math.random() * 0.1 + 0.95) // Decrease score slightly for lower ranks
        });
    }
    return data;
};

const leaderboardData = {
    'overall': {
        '1d': generateLeaderboard(52, ['ZeroCool', 'AcidBurn', 'LordNikon', 'ThePhreak', 'CerealKiller']),
        '3d': generateLeaderboard(150, ['ZeroCool', 'AcidBurn', 'CerealKiller', 'ThePhreak', 'LordNikon']),
        '7d': generateLeaderboard(320, ['ThePhreak', 'ZeroCool', 'AcidBurn', 'LordNikon', 'Magoo']),
        'all': generateLeaderboard(1024, ['TheGibson', 'DaVinci', 'ZeroCool', 'MrThePlague', 'AcidBurn']),
    },
    'solana-gold-rush': {
        '1d': generateLeaderboard(25, ['Goldfinger', 'Midas', 'Scrooge', 'Smaug', 'Galleon']),
        '3d': generateLeaderboard(70, ['Goldfinger', 'Scrooge', 'Midas', 'Galleon', 'Smaug']),
        '7d': generateLeaderboard(150, ['Smaug', 'Goldfinger', 'Midas', 'Scrooge', 'Galleon']),
        'all': generateLeaderboard(500, ['KingMidas', 'Goldfinger', 'Smaug', 'Scrooge', 'ElDorado']),
    },
    'neon-pong': {
        '1d': generateLeaderboard(18, ['Paddles', 'PongMaster', 'Vector', 'GridRider', 'BitSlinger']),
        '3d': generateLeaderboard(50, ['Paddles', 'Vector', 'GridRider', 'PongMaster', 'BitSlinger']),
        '7d': generateLeaderboard(110, ['GridRider', 'Paddles', 'Vector', 'TRON', 'BitSlinger']),
        'all': generateLeaderboard(400, ['TRON', 'Paddles', 'GridRider', 'Vector', 'MasterControl']),
    },
    'cosmic-dodge': {
        '1d': generateLeaderboard(12, ['StarFox', 'BuckRogers', 'Ripley', 'HanSolo', 'Zaphod']),
        '3d': generateLeaderboard(35, ['StarFox', 'Ripley', 'HanSolo', 'BuckRogers', 'Zaphod']),
        '7d': generateLeaderboard(80, ['HanSolo', 'StarFox', 'Ripley', 'BuckRogers', 'Zaphod']),
        'all': generateLeaderboard(350, ['StarLord', 'StarFox', 'Ripley', 'HanSolo', 'Kirk']),
    },
    'chess': {
        '1d': generateLeaderboard(8, ['Kasparov', 'DeepBlue', 'Magnus', 'Bobby', 'Morpheus']),
        '3d': generateLeaderboard(25, ['Kasparov', 'Magnus', 'DeepBlue', 'Morpheus', 'Bobby']),
        '7d': generateLeaderboard(60, ['Magnus', 'Kasparov', 'Bobby', 'Morpheus', 'DeepBlue']),
        'all': generateLeaderboard(200, ['Morpheus', 'Kasparov', 'TheArchitect', 'Magnus', 'DeepBlue']),
    }
};

const Leaderboard = () => {
    const [activeTimeFilter, setActiveTimeFilter] = useState<'1d' | '3d' | '7d' | 'all'>('1d');
    const [activeGameFilter, setActiveGameFilter] = useState<keyof typeof leaderboardData>('overall');
    const data = leaderboardData[activeGameFilter][activeTimeFilter];

    const gameFilters: { key: keyof typeof leaderboardData, name: string, color: string }[] = [
        { key: 'overall', name: 'Overall', color: 'blue' },
        { key: 'solana-gold-rush', name: 'Gold Rush', color: 'yellow' },
        { key: 'neon-pong', name: 'Neon Pong', color: 'blue' },
        { key: 'cosmic-dodge', name: 'Cosmic Dodge', color: 'pink' },
        { key: 'chess', name: 'Quantum Gambit', color: 'purple' },
    ];

    const activeGameTheme = gameFilters.find(g => g.key === activeGameFilter)?.color || 'blue';

    return (
         <div className={`w-full bg-brand-gray/80 border border-gray-700 rounded-lg p-4 border-t-4 border-${activeGameTheme} transition-colors duration-300`}>
             {/* Game Filters as Tabs */}
             <div className="flex border-b border-gray-700 mb-4">
                 {gameFilters.map(({ key, name, color }) => (
                     <button 
                         key={key} 
                         onClick={() => setActiveGameFilter(key)}
                         className={`px-4 py-2 font-display font-bold transition-all duration-200 text-sm md:text-base border-b-2 ${activeGameFilter === key ? `text-white border-${color}` : 'text-gray-500 border-transparent hover:text-white'}`}
                     >
                         {name}
                     </button>
                 ))}
             </div>
            
             {/* Time Filters and Header */}
             <div className="flex justify-between items-center mb-3 px-2">
                 <div className="text-gray-400 font-bold text-sm">
                    RANK
                 </div>
                 <div className="flex items-center gap-2">
                    {['1d', '3d', '7d', 'all'].map(filter => (
                         <button key={filter} onClick={() => setActiveTimeFilter(filter as any)} className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${activeTimeFilter === filter ? 'bg-gray-600 text-white' : 'bg-brand-dark hover:bg-gray-700 text-gray-400'}`}>{filter.toUpperCase()}</button>
                    ))}
                 </div>
             </div>

             {/* Rows */}
             <div className="space-y-2 h-80 overflow-y-auto pr-2">
                 {data.map((row, i) => {
                     let rankColor = 'text-gray-400';
                     if (i === 0) rankColor = 'text-yellow';
                     if (i === 1) rankColor = 'text-gray-300';
                     if (i === 2) rankColor = 'text-yellow-dark';

                     return (
                         <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-brand-dark/50 hover:bg-brand-dark transition-colors">
                             <div className="flex items-center gap-4">
                                 <span className={`w-8 text-center font-bold text-lg ${rankColor}`}>#{i + 1}</span>
                                 <span className="font-semibold text-white">{row.n}</span>
                             </div>
                             <span className="font-mono text-yellow-light">◎ {row.w.toFixed(2)}</span>
                         </div>
                     );
                 })}
             </div>
         </div>
    );
};


interface GameCardProps {
    game: typeof games[0];
    onSelectGame: (gameId: string) => void;
}

const GameCard: React.FC<GameCardProps> = ({ game, onSelectGame }) => {
    const colorClasses = {
        yellow: { text: 'text-yellow', border: 'border-yellow/50', shadow: 'hover:shadow-yellow/20', button: 'bg-yellow text-brand-dark hover:bg-yellow-light' },
        blue: { text: 'text-blue', border: 'border-blue/50', shadow: 'hover:shadow-blue/20', button: 'bg-blue text-brand-dark hover:bg-blue-light' },
        pink: { text: 'text-pink', border: 'border-pink/50', shadow: 'hover:shadow-pink/20', button: 'bg-pink text-brand-dark hover:bg-pink-light' },
        purple: { text: 'text-purple', border: 'border-purple/50', shadow: 'hover:shadow-purple/20', button: 'bg-purple text-brand-dark hover:bg-purple-light' },
    };
    const theme = colorClasses[game.colorTheme as keyof typeof colorClasses];
    return (
        <div className={`bg-brand-gray border ${theme.border} rounded-lg overflow-hidden flex flex-col transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl ${theme.shadow} shadow-lg`}>
            <div className="h-40 bg-brand-dark/50 flex items-center justify-center p-4">
                 <game.Icon />
            </div>
            <div className="p-4 flex flex-col flex-grow">
                <h3 className={`text-2xl font-bold font-display ${theme.text}`}>{game.name}</h3>
                <p className="text-gray-400 mt-2 flex-grow">{game.description}</p>
                <button
                    onClick={() => onSelectGame(game.id)}
                    className={`mt-4 w-full py-2 font-bold rounded-md transition-colors ${theme.button}`}
                >
                    Select Game
                </button>
            </div>
        </div>
    );
};


interface MainPageProps {
    onSelectGame: (game: string) => void;
    walletConnected: boolean;
}

const MainPage: React.FC<MainPageProps> = ({ onSelectGame, walletConnected }) => {
    const [openRule, setOpenRule] = useState<string | null>(null);
    const rules = {
        'solana-gold-rush': { title: 'Solana Gold Rush', color: 'text-yellow', content: <ul className="list-disc list-outside ml-5 space-y-2"><li>Each round, a "Round Value" card is revealed (from 1 to 10).</li><li>You and your opponent each have a hand of 5 "Nugget" cards (valued 1 to 5).</li><li>Secretly, you both choose one Nugget card from your hand to play.</li><li>The player who played the higher value Nugget wins the round. The winner's score increases by the Round Value PLUS the value of both played Nuggets.</li><li>If both players play the same value Nugget, it's a draw, and no one scores.</li><li>Each Nugget card can only be used once per game! Choose wisely.</li><li>The player with the highest total score after 5 rounds wins the entire pot!</li></ul> },
        'neon-pong': { title: 'Neon Pong', color: 'text-blue', content: <ul className="list-disc list-outside ml-5 space-y-2"><li>Use the <strong>W key</strong> to move your paddle (Blue) up.</li><li>Use the <strong>S key</strong> to move your paddle down.</li><li>The first player to score <strong>3 points</strong> wins the round.</li><li>The match is a <strong>best of 3 rounds</strong>. The first player to win 2 rounds wins the pot!</li><li>The ball gets faster with every paddle hit, so stay on your toes!</li></ul> },
        'cosmic-dodge': { title: 'Cosmic Dodge', color: 'text-pink', content: <ul className="list-disc list-outside ml-5 space-y-2"><li>Use the <strong>W, A, S, D keys</strong> to control your ship (Blue).</li><li>You and your opponent face identical waves of asteroids and lasers in separate arenas.</li><li>The round ends when a ship is destroyed. The surviving player wins the round.</li><li>The first player to win <strong>3 rounds</strong> wins the match and the pot!</li><li>The longer the round goes on, the more intense the patterns become.</li></ul> },
        'chess': { title: 'Quantum Gambit', color: 'text-purple', content: <ul className="list-disc list-outside ml-5 space-y-2"><li>Each player starts with 16 pieces: one king, one queen, two rooks, two knights, two bishops, and eight pawns.</li><li>The goal is to checkmate the other king. Checkmate happens when the king is in a position to be captured (in "check") and cannot escape from capture.</li><li>Players take turns moving one of their pieces. White moves first.</li><li>Create a lobby or join an existing one to be randomly assigned as White or Black.</li></ul> },
    };
    return (
    <div className="animate-fadeIn space-y-16">
        <section className="text-center pt-16">
            <h1 className="text-5xl md:text-6xl font-extrabold font-display tracking-tight">
                THE FUTURE OF
                <span className="block bg-gradient-to-r from-blue-light to-pink-light text-transparent bg-clip-text mt-2">WEB3 PVP GAMES</span>
            </h1>
            <p className="mt-4 text-lg text-gray-400 max-w-3xl mx-auto">
                Experience skill-based gaming on the Solana blockchain. Fair, transparent, and instant peer-to-peer wagers where you are always in control of your funds.
            </p>
        </section>
        
        <section>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                <div className="flex flex-col items-center text-center p-6 bg-brand-gray/50 rounded-lg border border-gray-800">
                    <svg className="w-12 h-12 text-blue-light mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01M12 6v-1m0-1V4m0 2.01V8m0 0h.01M12 7H8m4 1h4m-4-1v-1m-4 2v-1" /></svg>
                    <h3 className="text-xl font-bold font-display">True Self-Custody</h3>
                    <p className="text-gray-400 mt-2">Your funds never leave your wallet. We never take deposits. All wagers are handled by secure, peer-to-peer transactions directly on the Solana blockchain.</p>
                </div>
                <div className="flex flex-col items-center text-center p-6 bg-brand-gray/50 rounded-lg border border-gray-800">
                    <svg className="w-12 h-12 text-pink-light mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    <h3 className="text-xl font-bold font-display">Pure Skill, No Luck</h3>
                    <p className="text-gray-400 mt-2">Victory is determined by your skill, not by chance. Our games are designed to be competitive and fair, rewarding strategy and quick reflexes.</p>
                </div>
                 <div className="flex flex-col items-center text-center p-6 bg-brand-gray/50 rounded-lg border border-gray-800">
                    <svg className="w-12 h-12 text-yellow-light mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                    <h3 className="text-xl font-bold font-display">Instant Payouts</h3>
                    <p className="text-gray-400 mt-2">Winnings are sent directly to your wallet the moment you win. No waiting, no withdrawals. Just pure, instant gratification powered by Solana.</p>
                </div>
            </div>
        </section>

        <section>
            <h2 className="text-3xl font-bold font-display text-center mb-8">Choose Your Arena</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
                {games.map(game => (
                    <GameCard key={game.id} game={game} onSelectGame={onSelectGame} />
                ))}
            </div>
        </section>
        
        <section className="max-w-4xl mx-auto">
             <h2 className="text-3xl font-bold font-display text-center mb-8">Game Rules</h2>
             <div className="bg-brand-gray/80 border border-gray-700 rounded-lg">
                {Object.entries(rules).map(([key, rule]) => (
                    <CollapsibleRule key={key} title={rule.title} color={rule.color} isOpen={openRule === key} onClick={() => setOpenRule(openRule === key ? null : key)}>
                        {rule.content}
                    </CollapsibleRule>
                ))}
             </div>
        </section>

        <section className="max-w-4xl mx-auto">
             <h2 className="text-3xl font-bold font-display text-center mb-8">Leaderboard</h2>
            <Leaderboard />
        </section>
    </div>
  );
};

export default MainPage;