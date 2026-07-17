const { registerRoomHandlers } = require('./roomHandlers');
const { registerGameHandlers } = require('./gameHandlers');

function initSocketServer(io) {
  io.on('connection', (socket) => {
    // eslint-disable-next-line no-console
    console.log(`[socket] connected: ${socket.id}`);

    socket.data.roomId = null;
    socket.data.slot = null;

    registerRoomHandlers(io, socket);
    registerGameHandlers(io, socket);

    socket.on('error', (err) => {
      // eslint-disable-next-line no-console
      console.error(`[socket] error on ${socket.id}:`, err);
    });
  });
}

module.exports = { initSocketServer };
