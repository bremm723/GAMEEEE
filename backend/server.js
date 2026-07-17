require('dotenv').config();

const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const { initSocketServer } = require('./src/socket');
const { getRoomCount } = require('./src/socket/stateManager');

const app = express();
const PORT = process.env.PORT || 4000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'https://gamelove.bramananda.my.id';

app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ service: 'CoupleConnect Game Hub Backend', status: 'ok' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', activeRooms: getRoomCount(), uptime: process.uptime() });
});

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: CORS_ORIGIN,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

initSocketServer(io);

httpServer.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`CoupleConnect backend listening on port ${PORT} (CORS origin: ${CORS_ORIGIN})`);
});
