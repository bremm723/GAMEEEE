const {
  createRoom,
  getRoom,
  roomExists,
  addPlayerToRoom,
  findRoomBySocketId,
  getPlayerSlot,
  markPlayerConnected,
  replaceSocketId,
  bothDisconnected,
  scheduleCleanup,
  clearCleanupTimer,
  deleteRoom,
} = require('./stateManager');
const { generateRoomCode } = require('../utils/rng');

function publicRoomView(room) {
  return {
    roomId: room.roomId,
    status: room.status,
    selectedGame: room.selectedGame,
    players: room.players.map((p) => ({
      playerName: p.playerName,
      slot: p.slot,
      connected: p.connected,
    })),
    turn: room.turn,
  };
}

function registerRoomHandlers(io, socket) {
  socket.on('create_room', ({ playerName } = {}) => {
    // Generate a unique code, retrying on the astronomically unlikely collision
    let roomId = generateRoomCode();
    let attempts = 0;
    while (roomExists(roomId) && attempts < 10) {
      roomId = generateRoomCode();
      attempts += 1;
    }

    const room = createRoom(roomId, socket.id, playerName);
    socket.join(roomId);
    socket.data.roomId = roomId;
    socket.data.slot = 'P1';

    socket.emit('room_created', { roomId, status: room.status });
    io.to(roomId).emit('room_update', publicRoomView(room));
  });

  socket.on('join_room', ({ roomId, playerName } = {}) => {
    const normalizedId = (roomId || '').toUpperCase().trim();
    const room = getRoom(normalizedId);

    if (!room) {
      socket.emit('room_error', { code: 'ROOM_NOT_FOUND', message: 'Room code not found.' });
      return;
    }

    if (room.players.length >= 2) {
      socket.emit('room_error', { code: 'ROOM_FULL', message: 'This room already has two players.' });
      return;
    }

    const updatedRoom = addPlayerToRoom(normalizedId, socket.id, playerName);
    if (!updatedRoom) {
      socket.emit('room_error', { code: 'ROOM_FULL', message: 'This room already has two players.' });
      return;
    }

    clearCleanupTimer(normalizedId);
    socket.join(normalizedId);
    socket.data.roomId = normalizedId;
    socket.data.slot = 'P2';

    socket.emit('room_joined', { roomId: normalizedId, status: updatedRoom.status });
    io.to(normalizedId).emit('room_update', publicRoomView(updatedRoom));
  });

  socket.on('select_game', ({ gameKey } = {}) => {
    const roomId = socket.data.roomId;
    const room = getRoom(roomId);
    if (!room) return;

    const validGames = ['snakesLadders', 'monopoly', 'ludo', 'chess'];
    if (!validGames.includes(gameKey)) {
      socket.emit('room_error', { code: 'INVALID_GAME', message: 'Unknown game selection.' });
      return;
    }

    // gameHandlers attaches the actual board-state initializer to avoid a circular require
    io.to(roomId).emit('game_selected', { gameKey });
    require('./gameHandlers').initializeGame(io, room, gameKey);
  });

  socket.on('leave_room', () => {
    handleDisconnect(io, socket);
  });

  socket.on('disconnect', () => {
    handleDisconnect(io, socket);
  });

  function handleDisconnect(ioRef, socketRef) {
    const roomId = socketRef.data.roomId;
    if (!roomId) return;

    const room = getRoom(roomId);
    if (!room) return;

    markPlayerConnected(room, socketRef.id, false);
    ioRef.to(roomId).emit('player_disconnected', {
      slot: getPlayerSlot(room, socketRef.id),
    });

    if (bothDisconnected(room)) {
      // Hold state in memory for the grace period in case both reconnect
      scheduleCleanup(roomId, (expiredRoomId) => {
        ioRef.to(expiredRoomId).emit('room_expired', { roomId: expiredRoomId });
      });
    }
  }

  socket.on('reconnect_room', ({ roomId, playerName } = {}) => {
    const normalizedId = (roomId || '').toUpperCase().trim();
    const room = getRoom(normalizedId);
    if (!room) {
      socket.emit('room_error', { code: 'ROOM_NOT_FOUND', message: 'Room no longer exists.' });
      return;
    }

    const existingPlayer = room.players.find((p) => p.playerName === playerName);
    if (!existingPlayer) {
      socket.emit('room_error', { code: 'PLAYER_NOT_FOUND', message: 'Could not match you to this room.' });
      return;
    }

    replaceSocketId(room, existingPlayer.socketId, socket.id);
    clearCleanupTimer(normalizedId);
    socket.join(normalizedId);
    socket.data.roomId = normalizedId;
    socket.data.slot = existingPlayer.slot;

    socket.emit('room_joined', { roomId: normalizedId, status: room.status });
    io.to(normalizedId).emit('room_update', publicRoomView(room));
    if (room.boardState) {
      socket.emit('game_state_sync', { boardState: room.boardState, turn: room.turn });
    }
  });
}

module.exports = { registerRoomHandlers, publicRoomView };
