/**
 * 🌐 MathBot Arena - WebSocket Server
 * Real-time multiplayer battle server with Socket.io
 */

import express from 'express';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import cors from 'cors';
import { BattleManager } from './battleManager';
import { ClientMessage } from './types';

// ==================== SERVER SETUP ====================

const app = express();
const httpServer = createServer(app);

// Configure CORS
const io = new SocketServer(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  },
  pingTimeout: 60000,
  pingInterval: 25000
});

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());

// ==================== HEALTH CHECK ====================

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: Date.now(),
    uptime: process.uptime(),
    queue: battleManager.getQueueStatus(),
    activeBattles: battleManager.getActiveBattles()
  });
});

app.get('/stats', (req, res) => {
  res.json({
    queue: battleManager.getQueueStatus(),
    activeBattles: battleManager.getActiveBattles(),
    connectedPlayers: io.sockets.sockets.size
  });
});

// ==================== BATTLE MANAGER ====================

const battleManager = new BattleManager(io);

// ==================== WEBSOCKET CONNECTION ====================

io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);

  // Handle incoming messages
  socket.on('message', (message: ClientMessage) => {
    try {
      switch (message.type) {
        case 'FIND_MATCH':
          battleManager.joinQueue(socket, message);
          break;

        case 'CANCEL_QUEUE':
          battleManager.leaveQueue(message.payload.userId);
          break;

        case 'READY':
          battleManager.handleReady(socket, message.payload);
          break;

        case 'SUBMIT_ANSWER':
          battleManager.handleAnswer(socket, message.payload);
          break;

        case 'USE_ULTIMATE':
          battleManager.handleUltimate(socket, message.payload);
          break;

        case 'SURRENDER':
          // TODO: Implement surrender logic
          break;

        case 'HEARTBEAT':
          // TODO: Update last heartbeat timestamp
          break;

        default:
          console.warn(`⚠️ Unknown message type:`, message);
      }
    } catch (error) {
      console.error('❌ Error handling message:', error);
      socket.emit('message', {
        type: 'ERROR',
        payload: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred processing your request'
        }
      });
    }
  });

  // Handle disconnect
  socket.on('disconnect', (reason) => {
    console.log(`🔌 Client disconnected: ${socket.id} (${reason})`);
    battleManager.handleDisconnect(socket);
  });

  // Handle errors
  socket.on('error', (error) => {
    console.error(`❌ Socket error for ${socket.id}:`, error);
  });
});

// ==================== START SERVER ====================

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════╗
║                                               ║
║       ⚔️  MathBot Arena Server v1.0 ⚔️        ║
║                                               ║
║  Status: ONLINE                               ║
║  Port: ${PORT}                                   ║
║  Environment: ${process.env.NODE_ENV || 'development'}              ║
║                                               ║
║  WebSocket: Socket.io                         ║
║  Battle System: ACTIVE                        ║
║  Matchmaking: RUNNING                         ║
║                                               ║
╚═══════════════════════════════════════════════╝
  `);
});

// ==================== GRACEFUL SHUTDOWN ====================

process.on('SIGTERM', () => {
  console.log('📴 SIGTERM signal received: closing HTTP server');
  httpServer.close(() => {
    console.log('✅ HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('📴 SIGINT signal received: closing HTTP server');
  httpServer.close(() => {
    console.log('✅ HTTP server closed');
    process.exit(0);
  });
});

// ==================== ERROR HANDLING ====================

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

export { io, battleManager };
