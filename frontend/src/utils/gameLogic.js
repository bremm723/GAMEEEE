/**
 * Client-side helpers. These mirror (but never override) the authoritative
 * calculations performed on the backend — used purely for instant UI feedback
 * (e.g. highlighting a winning state) before the game_state_sync event lands.
 */

export function isMyTurn(turn, mySlot) {
  return turn === mySlot;
}

export function otherSlot(slot) {
  return slot === 'P1' ? 'P2' : 'P1';
}

export function snakesLaddersTileCoords(tileNumber) {
  // Converts tile 1-100 into (row, col) grid coordinates for a 10x10
  // boustrophedon (snake-like) board, row 0 = bottom row.
  if (tileNumber < 1) return { row: 9, col: 0 };
  const idx = tileNumber - 1;
  const row = 9 - Math.floor(idx / 10);
  const withinRow = idx % 10;
  const rowFromBottom = Math.floor(idx / 10);
  const col = rowFromBottom % 2 === 0 ? withinRow : 9 - withinRow;
  return { row, col };
}

export function chessSquareColor(row, col) {
  return (row + col) % 2 === 0 ? 'light' : 'dark';
}

export function chessPieceSymbol(piece) {
  if (!piece) return '';
  const symbols = {
    white: { king: '♔', queen: '♕', rook: '♖', bishop: '♗', knight: '♘', pawn: '♙' },
    black: { king: '♚', queen: '♛', rook: '♜', bishop: '♝', knight: '♞', pawn: '♟' },
  };
  return symbols[piece.color][piece.type];
}

export function formatCash(amount) {
  return `$${amount.toLocaleString('en-US')}`;
}

export function ludoTokenLabel(token, index) {
  if (token.state === 'base') return 'Base';
  if (token.state === 'home') return 'Home!';
  return `#${index + 1}`;
}

export function stepsUntilNextTruthDare(cumulativeSteps) {
  const remainder = cumulativeSteps % 6;
  return remainder === 0 ? 6 : 6 - remainder;
}
