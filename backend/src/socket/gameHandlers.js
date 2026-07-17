const { getRoom } = require('./stateManager');
const { rollDie, rollTwoDice } = require('../utils/rng');

/* ------------------------------------------------------------------ */
/* Snakes & Ladders                                                    */
/* ------------------------------------------------------------------ */

const LADDERS = { 2: 38, 7: 14, 8: 31, 15: 26, 21: 42, 28: 84, 36: 44, 51: 67, 71: 91, 78: 98 };
const SNAKES = { 16: 6, 46: 25, 49: 11, 62: 19, 64: 60, 74: 53, 89: 68, 92: 88, 95: 75, 99: 80 };

function initSnakesLadders() {
  return {
    game: 'snakesLadders',
    positions: { P1: 0, P2: 0 },
    lastRoll: null,
    winner: null,
    pendingTruthDare: false,
  };
}

function applySnakesLaddersMove(room, slot, dieValue) {
  const board = room.boardState;
  let newPos = board.positions[slot] + dieValue;
  if (newPos > 100) newPos = board.positions[slot]; // must land exactly on 100
  else if (LADDERS[newPos]) newPos = LADDERS[newPos];
  else if (SNAKES[newPos]) newPos = SNAKES[newPos];

  board.positions[slot] = newPos;
  board.lastRoll = dieValue;

  room.stepCounters[slot] += dieValue;

  if (newPos === 100) {
    board.winner = slot;
  }

  const hitTruthDare = room.stepCounters[slot] % 6 === 0 && room.stepCounters[slot] !== 0;
  board.pendingTruthDare = hitTruthDare;

  return { board, hitTruthDare };
}

/* ------------------------------------------------------------------ */
/* Monopoly (LDR Edition)                                              */
/* ------------------------------------------------------------------ */

function buildMonopolyTiles() {
  const names = [
    'GO', 'First Date Cafe', 'Community Chest', 'Old Town Bridge', 'Income Tax',
    'Reading Railroad', 'Movie Night Cinema', 'Truth or Dare', 'Sunset Beach Walk', 'Cozy Bookstore',
    'Jail / Just Visiting', 'Anniversary Park', 'Electric Company', 'Karaoke Bar', 'Late-Night Diner',
    'Pennsylvania Railroad', 'City Skyline View', 'Truth or Dare', 'Rooftop Garden', 'Amusement Park',
    'Free Parking', 'Hometown Street', 'Truth or Dare', 'Concert Hall', 'B&O Railroad',
    'Camping Spot', 'Art Museum', 'Water Works', 'Botanical Garden', 'Go To Jail',
    'Airport Reunion Gate', 'Cabin Getaway', 'Truth or Dare', 'Family Home', 'Short Line Railroad',
    'Truth or Dare', 'Wedding Venue', 'Luxury Tax', 'Honeymoon Suite', 'Our Dream House',
  ];
  const truthDareIndices = new Set([2, 7, 17, 22, 33, 35]);
  const taxIndices = new Set([4, 37]);
  const railroadIndices = new Set([5, 15, 25, 35]);

  return names.map((name, idx) => {
    let type = 'property';
    if (idx === 0) type = 'go';
    else if (idx === 10) type = 'jail';
    else if (idx === 20) type = 'freeParking';
    else if (idx === 29) type = 'goToJail';
    else if (truthDareIndices.has(idx)) type = 'truthdare';
    else if (taxIndices.has(idx)) type = 'tax';
    else if (railroadIndices.has(idx)) type = 'railroad';

    return { index: idx, name, type, ownedBy: null };
  });
}

function initMonopoly() {
  return {
    game: 'monopoly',
    tiles: buildMonopolyTiles(),
    positions: { P1: 0, P2: 0 },
    cash: { P1: 1500, P2: 1500 },
    lastRoll: null,
    pendingTruthDare: false,
    winner: null,
  };
}

function applyMonopolyMove(room, slot, dieTotal) {
  const board = room.boardState;
  const boardSize = board.tiles.length;
  const oldPos = board.positions[slot];
  let newPos = (oldPos + dieTotal) % boardSize;
  const passedGo = oldPos + dieTotal >= boardSize;

  if (passedGo) {
    board.cash[slot] += 200;
  }

  board.positions[slot] = newPos;
  board.lastRoll = dieTotal;

  const landedTile = board.tiles[newPos];
  let hitTruthDare = false;

  if (landedTile.type === 'truthdare') {
    hitTruthDare = true;
  } else if (landedTile.type === 'tax') {
    board.cash[slot] -= 100;
  } else if (landedTile.type === 'goToJail') {
    board.positions[slot] = 10; // jail index
  }

  board.pendingTruthDare = hitTruthDare;
  return { board, hitTruthDare };
}

/* ------------------------------------------------------------------ */
/* Ludo (2-player simplified)                                          */
/* ------------------------------------------------------------------ */

const LUDO_TRACK_LENGTH = 52;
const LUDO_HOME_STRETCH = 6;
const LUDO_START_OFFSET = { P1: 0, P2: 26 };

function initLudo() {
  const makeTokens = () => [
    { state: 'base', trackPos: -1 }, // base | active | home
    { state: 'base', trackPos: -1 },
    { state: 'base', trackPos: -1 },
    { state: 'base', trackPos: -1 },
  ];
  return {
    game: 'ludo',
    tokens: { P1: makeTokens(), P2: makeTokens() },
    lastRoll: null,
    winner: null,
    pendingTruthDare: false,
  };
}

function applyLudoMove(room, slot, tokenIndex, dieValue) {
  const board = room.boardState;
  const token = board.tokens[slot][tokenIndex];
  board.lastRoll = dieValue;

  if (token.state === 'base') {
    if (dieValue === 6) {
      token.state = 'active';
      token.trackPos = 0;
    }
    return { board, hitTruthDare: false };
  }

  if (token.state === 'active') {
    const nextPos = token.trackPos + dieValue;
    const totalJourney = LUDO_TRACK_LENGTH + LUDO_HOME_STRETCH;
    if (nextPos >= totalJourney) {
      token.state = 'home';
      token.trackPos = totalJourney;
    } else {
      token.trackPos = nextPos;
    }
  }

  const allHome = board.tokens[slot].every((t) => t.state === 'home');
  if (allHome) board.winner = slot;

  // House rule: rolling a 6 triggers a Truth or Dare card, mirroring the
  // Snakes & Ladders "big move" excitement beat.
  const hitTruthDare = dieValue === 6;
  board.pendingTruthDare = hitTruthDare;

  return { board, hitTruthDare };
}

/* ------------------------------------------------------------------ */
/* Chess (simplified legal-move engine, no check/checkmate detection)  */
/* ------------------------------------------------------------------ */

function initChessBoard() {
  const emptyRow = () => Array(8).fill(null);
  const board = Array.from({ length: 8 }, emptyRow);

  const backRank = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
  for (let c = 0; c < 8; c++) {
    board[0][c] = { type: backRank[c], color: 'black' };
    board[1][c] = { type: 'pawn', color: 'black' };
    board[6][c] = { type: 'pawn', color: 'white' };
    board[7][c] = { type: backRank[c], color: 'white' };
  }
  return board;
}

function initChess() {
  return {
    game: 'chess',
    board: initChessBoard(),
    turnColor: 'white', // P1 = white, P2 = black
    winner: null,
    lastMove: null,
    pendingTruthDare: false,
  };
}

function inBounds(r, c) {
  return r >= 0 && r < 8 && c >= 0 && c < 8;
}

function pathClear(board, fromR, fromC, toR, toC) {
  const dR = Math.sign(toR - fromR);
  const dC = Math.sign(toC - fromC);
  let r = fromR + dR;
  let c = fromC + dC;
  while (r !== toR || c !== toC) {
    if (board[r][c]) return false;
    r += dR;
    c += dC;
  }
  return true;
}

function isValidChessMove(board, from, to, color) {
  const piece = board[from.row][from.col];
  if (!piece || piece.color !== color) return false;
  if (!inBounds(to.row, to.col)) return false;

  const target = board[to.row][to.col];
  if (target && target.color === color) return false;

  const dR = to.row - from.row;
  const dC = to.col - from.col;
  const absR = Math.abs(dR);
  const absC = Math.abs(dC);

  switch (piece.type) {
    case 'pawn': {
      const dir = color === 'white' ? -1 : 1;
      const startRow = color === 'white' ? 6 : 1;
      if (dC === 0 && dR === dir && !target) return true;
      if (dC === 0 && dR === 2 * dir && from.row === startRow && !target && pathClear(board, from.row, from.col, to.row, to.col)) return true;
      if (absC === 1 && dR === dir && target && target.color !== color) return true;
      return false;
    }
    case 'knight':
      return (absR === 2 && absC === 1) || (absR === 1 && absC === 2);
    case 'bishop':
      if (absR !== absC) return false;
      return pathClear(board, from.row, from.col, to.row, to.col);
    case 'rook':
      if (dR !== 0 && dC !== 0) return false;
      return pathClear(board, from.row, from.col, to.row, to.col);
    case 'queen':
      if (dR !== 0 && dC !== 0 && absR !== absC) return false;
      return pathClear(board, from.row, from.col, to.row, to.col);
    case 'king':
      return absR <= 1 && absC <= 1 && (absR + absC > 0);
    default:
      return false;
  }
}

function applyChessMove(room, color, from, to) {
  const board = room.boardState;
  const valid = isValidChessMove(board.board, from, to, color);
  if (!valid) return { board, moved: false, hitTruthDare: false };

  const capturedPiece = board.board[to.row][to.col];
  const movingPiece = board.board[from.row][from.col];
  board.board[to.row][to.col] = movingPiece;
  board.board[from.row][from.col] = null;

  // Auto-promote pawns reaching the far rank, standard simplification (queen only)
  if (movingPiece.type === 'pawn' && (to.row === 0 || to.row === 7)) {
    movingPiece.type = 'queen';
  }

  board.lastMove = { from, to, piece: movingPiece.type, captured: capturedPiece ? capturedPiece.type : null };
  board.turnColor = color === 'white' ? 'black' : 'white';

  if (capturedPiece && capturedPiece.type === 'king') {
    board.winner = color === 'white' ? 'P1' : 'P2';
  }

  // House rule: every capture triggers a Truth or Dare card.
  const hitTruthDare = Boolean(capturedPiece);
  board.pendingTruthDare = hitTruthDare;

  return { board, moved: true, hitTruthDare };
}

/* ------------------------------------------------------------------ */
/* Shared helpers                                                      */
/* ------------------------------------------------------------------ */

function drawTruthDareCard(room, cardType) {
  const deck = room.truthDare;
  if (cardType === 'truth') {
    const card = deck.truths[deck.truthIndex % deck.truths.length];
    deck.truthIndex += 1;
    deck.activeCard = card;
    return card;
  }
  const card = deck.dares[deck.dareIndex % deck.dares.length];
  deck.dareIndex += 1;
  deck.activeCard = card;
  return card;
}

function otherSlot(slot) {
  return slot === 'P1' ? 'P2' : 'P1';
}

function initializeGame(io, room, gameKey) {
  room.selectedGame = gameKey;
  room.status = 'playing';
  room.turn = 'P1';

  switch (gameKey) {
    case 'snakesLadders':
      room.boardState = initSnakesLadders();
      break;
    case 'monopoly':
      room.boardState = initMonopoly();
      break;
    case 'ludo':
      room.boardState = initLudo();
      break;
    case 'chess':
      room.boardState = initChess();
      break;
    default:
      return;
  }

  io.to(room.roomId).emit('game_state_sync', { boardState: room.boardState, turn: room.turn });
}

function registerGameHandlers(io, socket) {
  socket.on('roll_dice', () => {
    const roomId = socket.data.roomId;
    const room = getRoom(roomId);
    if (!room || !room.boardState) return;
    if (room.turn !== socket.data.slot) return; // not your turn

    const slot = socket.data.slot;

    if (room.selectedGame === 'snakesLadders') {
      const die = rollDie();
      const { hitTruthDare } = applySnakesLaddersMove(room, slot, die);
      broadcastAfterRoll(io, room, slot, hitTruthDare);
    } else if (room.selectedGame === 'monopoly') {
      const { total } = rollTwoDice();
      const { hitTruthDare } = applyMonopolyMove(room, slot, total);
      broadcastAfterRoll(io, room, slot, hitTruthDare);
    } else if (room.selectedGame === 'ludo') {
      const die = rollDie();
      room.boardState.lastRoll = die;
      io.to(room.roomId).emit('dice_rolled', { slot, value: die });
      io.to(room.roomId).emit('game_state_sync', { boardState: room.boardState, turn: room.turn });
      // Ludo requires a follow-up action_move (token pick) before turn advances
    }
  });

  socket.on('action_move', ({ pieceId, targetTile, tokenIndex, from, to } = {}) => {
    const roomId = socket.data.roomId;
    const room = getRoom(roomId);
    if (!room || !room.boardState) return;
    if (room.turn !== socket.data.slot) return;

    const slot = socket.data.slot;

    if (room.selectedGame === 'ludo') {
      const dieValue = room.boardState.lastRoll;
      if (dieValue == null || tokenIndex == null) return;
      const { hitTruthDare } = applyLudoMove(room, slot, tokenIndex, dieValue);
      broadcastAfterRoll(io, room, slot, hitTruthDare);
    } else if (room.selectedGame === 'chess') {
      const color = slot === 'P1' ? 'white' : 'black';
      if (room.boardState.turnColor !== color) return;
      const { moved, hitTruthDare } = applyChessMove(room, color, from, to);
      if (!moved) {
        socket.emit('invalid_move', { pieceId, targetTile });
        return;
      }
      room.turn = otherSlot(slot);
      io.to(room.roomId).emit('game_state_sync', { boardState: room.boardState, turn: room.turn });
      if (hitTruthDare) triggerTruthDare(io, room, slot);
    }
  });

  // backend/src/socket/gameHandlers.js

socket.on('buy_property', () => {
  const roomId = playerRooms.get(socket.id);
  if (!roomId) return;
  
  const room = rooms.get(roomId);
  const bs = room.gameState.boardState;
  const turn = room.gameState.turn;
  const mySlot = room.players.find(p => p.id === socket.id)?.slot;
  
  if (turn !== mySlot) return; // Bukan gilirannya

  const currentPos = bs.positions[mySlot];
  const tile = bs.tiles.find(t => t.index === currentPos);

  // Cek apakah tanah bisa dibeli dan duit cukup
  if (tile.type === 'property' && !tile.owner && bs.cash[mySlot] >= tile.price) {
    // Potong duit
    bs.cash[mySlot] -= tile.price;
    // Set kepemilikan
    tile.owner = mySlot;
    
    // Broadcast state terbaru
    io.to(roomId).emit('game_state_sync', {
      boardState: bs,
      turn: room.gameState.turn 
    });
  }
});

  socket.on('draw_card', ({ cardType } = {}) => {
    const roomId = socket.data.roomId;
    const room = getRoom(roomId);
    if (!room) return;

    const card = drawTruthDareCard(room, cardType === 'dare' ? 'dare' : 'truth');
    io.to(room.roomId).emit('truth_dare_card', { card, drawnBy: socket.data.slot });
  });

  socket.on('truth_dare_done', () => {
    const roomId = socket.data.roomId;
    const room = getRoom(roomId);
    if (!room) return;

    room.truthDare.activeCard = null;
    if (room.boardState) room.boardState.pendingTruthDare = false;

    // Advance turn now that the Truth/Dare interlude is resolved
    room.turn = otherSlot(room.turn);
    io.to(room.roomId).emit('truth_dare_resolved', {});
    io.to(room.roomId).emit('game_state_sync', { boardState: room.boardState, turn: room.turn });
  });
}

function broadcastAfterRoll(io, room, slot, hitTruthDare) {
  io.to(room.roomId).emit('game_state_sync', { boardState: room.boardState, turn: room.turn });

  if (room.boardState.winner) {
    io.to(room.roomId).emit('game_over', { winner: room.boardState.winner });
    return;
  }

  if (hitTruthDare) {
    triggerTruthDare(io, room, slot);
  } else {
    room.turn = otherSlot(room.turn);
    io.to(room.roomId).emit('game_state_sync', { boardState: room.boardState, turn: room.turn });
  }
}

function triggerTruthDare(io, room, drawingSlot) {
  io.to(room.roomId).emit('TRIGGER_TRUTH_DARE', { drawnBy: drawingSlot });
}

module.exports = {
  registerGameHandlers,
  initializeGame,
};
