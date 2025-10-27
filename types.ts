export enum Screen {
  Lobby,
  Matching,
  Game,
  Winner,
}

export interface Lobby {
  lobbyId: string;
  gameType: string;
  betAmount: number;
  creator: {
    walletAddress: string;
    nickname: string;
  };
}

export const BET_AMOUNTS = [0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1.0];