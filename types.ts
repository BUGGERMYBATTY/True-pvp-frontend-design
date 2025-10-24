
export enum Screen {
  Betting,
  Matching,
  Game,
  Winner,
}

export interface Player {
  id: number;
  name: string;
  score: number;
  nuggets: number[];
  choice: number | null;
}

export interface GameState {
  round: number;
  roundNumber: number | null;
  players: [Player, Player];
  roundWinnerId: number | null;
  gameWinnerId: number | null;
  gameOver: boolean;
  availableRoundNumbers: number[];
  roundMessage: string;
}

export const BET_AMOUNTS = [0.05, 0.1, 0.25, 0.5, 1.0];
