import React, { useState, useEffect, useRef, useMemo } from 'react';

const WS_URL = (import.meta as any).env?.VITE_WS_BASE_URL || 'ws://localhost:3001';

interface ChessGameScreenProps {
  onGameOver: (winnerId: number | null, forfeited: boolean) => void;
  gameId: string;
  walletAddress: string;
  nickname: string;
  betAmount: number;
}

const pieceToUnicode: { [key: string]: string } = {
  p: '♙', r: '♖', n: '♘', b: '♗', q: '♕', k: '♔',
  P: '♟', R: '♜', N: '♞', B: '♝', Q: '♛', K: '♚',
};

const ChessGameScreen: React.FC<ChessGameScreenProps> = ({ onGameOver, gameId, walletAddress, nickname, betAmount }) => {
    const [gameState, setGameState] = useState<any>(null);
    const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
    const ws = useRef<WebSocket | null>(null);

    useEffect(() => {
        ws.current = new WebSocket(WS_URL);
        ws.current.onopen = () => {
          ws.current?.send(JSON.stringify({
            type: 'join_game', gameType: 'chess', gameId, walletAddress, nickname,
          }));
        };
        ws.current.onmessage = (event) => {
          const data = JSON.parse(event.data);
          if (data.gameOver) {
            onGameOver(data.winnerId, data.forfeited || false);
          } else {
            setGameState(data);
          }
        };
        ws.current.onclose = () => console.log('Chess WebSocket disconnected');
        return () => { ws.current?.close(); };
    }, [gameId, walletAddress, nickname, onGameOver]);

    const board = useMemo(() => {
        if (!gameState?.fen) return [];
        const rows = gameState.fen.split(' ')[0].split('/');
        return rows.map((row: string) => {
            const expandedRow: (string | null)[] = [];
            for (const char of row) {
                if (isNaN(parseInt(char))) {
                    expandedRow.push(char);
                } else {
                    for (let i = 0; i < parseInt(char); i++) {
                        expandedRow.push(null);
                    }
                }
            }
            return expandedRow;
        });
    }, [gameState?.fen]);

    const handleSquareClick = (rowIndex: number, colIndex: number) => {
        if (!gameState || gameState.turn !== gameState.playerColor) return;
        
        const file = String.fromCharCode('a'.charCodeAt(0) + colIndex);
        const rank = 8 - rowIndex;
        const square = `${file}${rank}`;

        if (selectedSquare) {
            const legalMovesForSelected = gameState.possibleMoves[selectedSquare] || [];
            if (legalMovesForSelected.includes(square)) {
                ws.current?.send(JSON.stringify({ type: 'move', from: selectedSquare, to: square }));
                setSelectedSquare(null);
            } else if (board[rowIndex][colIndex] && isPlayerPiece(board[rowIndex][colIndex], gameState.playerColor)) {
                setSelectedSquare(square);
            } else {
                setSelectedSquare(null);
            }
        } else if (board[rowIndex][colIndex] && isPlayerPiece(board[rowIndex][colIndex], gameState.playerColor)) {
            setSelectedSquare(square);
        }
    };
    
    const isPlayerPiece = (piece: string, playerColor: 'w' | 'b') => {
        if (!piece) return false;
        return (playerColor === 'w' && piece === piece.toLowerCase()) || (playerColor === 'b' && piece === piece.toUpperCase());
    }
    
    const legalMovesForSelectedPiece = gameState?.possibleMoves?.[selectedSquare || ''] || [];

    const getStatusMessage = () => {
        if (!gameState) return "Connecting...";
        if (gameState.isCheckmate) return "Checkmate!";
        if (gameState.isDraw) return "Draw!";
        if (gameState.isStalemate) return "Stalemate!";
        if (gameState.isCheck) return "Check!";
        return gameState.turn === gameState.playerColor ? "Your Turn" : "Opponent's Turn";
    }

    const PlayerInfo = ({ name, isTurn }: { name: string, isTurn: boolean}) => (
        <div className={`w-[520px] flex justify-between items-center bg-brand-dark p-2 rounded-lg border-b-2 ${isTurn ? 'border-purple' : 'border-transparent'}`}>
            <span className="font-bold text-lg">{name}</span>
            {isTurn && <div className="w-3 h-3 bg-purple rounded-full animate-pulse"></div>}
        </div>
    );
    
    const boardOrientation = gameState?.playerColor === 'b' ? 'black' : 'white';

    return (
        <div className="w-full h-full flex items-center justify-center p-4 text-white animate-fadeIn">
            <div className="flex flex-col items-center gap-2">
                
                <PlayerInfo name={gameState?.opponent?.nickname || 'Opponent'} isTurn={gameState?.turn !== gameState?.playerColor} />

                {/* Board */}
                <div 
                  className="w-[520px] h-[520px] bg-brand-dark grid grid-cols-8 grid-rows-8 border-2 border-purple/20 p-2 shadow-2xl shadow-purple/20"
                  style={{
                    flexDirection: boardOrientation === 'black' ? 'column-reverse' : 'column',
                    display: 'grid'
                  }}
                >
                    {board.map((row, rIdx) =>
                       (boardOrientation === 'black' ? [...row].reverse() : row).map((piece, cIdx) => {
                            const trueRowIndex = boardOrientation === 'black' ? 7 - rIdx : rIdx;
                            const trueColIndex = boardOrientation === 'black' ? 7 - cIdx : cIdx;
                            
                            const squareName = `${String.fromCharCode(97 + trueColIndex)}${8 - trueRowIndex}`;
                            const isLightSquare = (trueRowIndex + trueColIndex) % 2 !== 0;
                            const isSelected = selectedSquare === squareName;
                            const isLegalMove = legalMovesForSelectedPiece.includes(squareName);

                            return (
                                <div
                                    key={`${trueRowIndex}-${trueColIndex}`}
                                    onClick={() => handleSquareClick(trueRowIndex, trueColIndex)}
                                    className={`
                                        flex items-center justify-center text-5xl cursor-pointer relative
                                        ${isLightSquare ? 'bg-purple-900/50' : 'bg-brand-dark/50'}
                                        ${isSelected ? 'bg-yellow/40' : ''}
                                        hover:bg-purple/20 transition-colors
                                    `}
                                >
                                    {piece && 
                                      <span style={{
                                        textShadow: isPlayerPiece(piece, 'w') 
                                          ? '0 0 10px #7DF9FF' 
                                          : '0 0 10px #FF7ED4'
                                      }}>
                                        {pieceToUnicode[piece]}
                                      </span>
                                    }
                                    {isLegalMove && <div className="absolute w-6 h-6 bg-purple-400/50 rounded-full animate-pulse"></div>}
                                </div>
                            );
                        })
                    )}
                </div>

                 <PlayerInfo name={`${nickname} (${gameState?.playerColor === 'w' ? 'White' : 'Black'})`} isTurn={gameState?.turn === gameState?.playerColor} />
                 <div className="mt-2 text-lg font-bold text-purple-light h-6">{getStatusMessage()}</div>
            </div>
        </div>
    );
};

export default ChessGameScreen;