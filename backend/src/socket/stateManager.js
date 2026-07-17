const { secureShuffle } = require('../utils/rng');
const { truthCards, dareCards } = require('../utils/truthDareData');

// roomId -> room object
const rooms = new Map();

// roomId -> Timeout handle (grace period cleanup after both players disconnect)
const cleanupTimers = new Map();

const DISCONNECT_GRACE_MS = 5 * 60 * 1000; // 5 minutes, per PRD section 7

function createRoom(roomId, hostSocketId, hostPlayerName) {
  const room = {
    roomId,
    createdAt: Date.now(),
    status: 'waiting', // waiting | selecting | playing
    selectedGame: null, // snakesLadders | monopoly | ludo | chess
    players: [
      {
        socketId: hostSocketId,
        playerName: hostPlayerName || 'Player 1',
        slot: 'P1',
        connected: true,
      },
    ],
    turn: 'P1',
    boardState: null,
    truthDare: {
      truths: secureShuffle(truthCards),
      dares: secureShuffle(dareCards),
      truthIndex: 0,
      dareIndex: 0,
      activeCard: null,
      drawnBy: null,
    },
    stepCounters: { P1: 0, P2: 0 }, // used by Snakes & Ladders 6-step rule
  };
  rooms.set(roomId, room);
  return room;
}

function getRoom(roomId) {
  return rooms.get(roomId) || null;
}

function roomExists(roomId) {
  return rooms.has(roomId);
}

function deleteRoom(roomId) {
  rooms.delete(roomId);
  clearCleanupTimer(roomId);
}

function addPlayerToRoom(roomId, socketId, playerName) {
  const room = rooms.get(roomId);
  if (!room) return null;
  if (room.players.length >= 2) return null;

  room.players.push({
    socketId,
    playerName: playerName || 'Player 2',
    slot: 'P2',
    connected: true,
  });
  room.status = 'selecting';
  return room;
}

function findRoomBySocketId(socketId) {
  for (const room of rooms.values()) {
    if (room.players.some((p) => p.socketId === socketId)) {
      return room;
    }
  }
  return null;
}

function getPlayerSlot(room, socketId) {
  const player = room.players.find((p) => p.socketId === socketId);
  return player ? player.slot : null;
}

function markPlayerConnected(room, socketId, connected) {
  const player = room.players.find((p) => p.socketId === socketId);
  if (player) player.connected = connected;
}

function replaceSocketId(room, oldSocketId, newSocketId) {
  const player = room.players.find((p) => p.socketId === oldSocketId);
  if (player) {
    player.socketId = newSocketId;
    player.connected = true;
  }
}

function bothDisconnected(room) {
  return room.players.every((p) => !p.connected);
}

function scheduleCleanup(roomId, onExpire) {
  clearCleanupTimer(roomId);
  const timer = setTimeout(() => {
    deleteRoom(roomId);
    if (typeof onExpire === 'function') onExpire(roomId);
  }, DISCONNECT_GRACE_MS);
  cleanupTimers.set(roomId, timer);
}

function clearCleanupTimer(roomId) {
  const timer = cleanupTimers.get(roomId);
  if (timer) {
    clearTimeout(timer);
    cleanupTimers.delete(roomId);
  }
}

function getRoomCount() {
  return rooms.size;
}

module.exports = {
  createRoom,
  getRoom,
  roomExists,
  deleteRoom,
  addPlayerToRoom,
  findRoomBySocketId,
  getPlayerSlot,
  markPlayerConnected,
  replaceSocketId,
  bothDisconnected,
  scheduleCleanup,
  clearCleanupTimer,
  getRoomCount,
  DISCONNECT_GRACE_MS,
};
