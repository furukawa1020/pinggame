import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { AIController } from './ai/AIController';
import { GameStateManager } from './game/GameStateManager';
import { PenguinAI } from './ai/PenguinAI';
import authRoutes from './routes/auth';
import gameRoutes from './routes/game';
import aiRoutes from './routes/ai';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/game', gameRoutes);
app.use('/api/ai', aiRoutes);

// AI System
const aiController = new AIController();
const gameStateManager = new GameStateManager();

// Socket.io for real-time multiplayer
io.on('connection', (socket) => {
  console.log(`🐧 Player connected: ${socket.id}`);
  
  socket.on('join-game', async (playerData) => {
    try {
      const gameRoom = await gameStateManager.joinGame(socket.id, playerData);
      socket.join(gameRoom.id);
      socket.emit('game-joined', gameRoom);
      
      // Initialize AI for this player
      const penguinAI = new PenguinAI(playerData.id);
      await penguinAI.initialize();
      
      // Start AI thinking loop
      startAILoop(socket, penguinAI);
      
    } catch (error) {
      socket.emit('error', { message: 'Failed to join game' });
    }
  });
  
  socket.on('penguin-action', async (actionData) => {
    try {
      const result = await aiController.processPenguinAction(actionData);
      socket.emit('action-result', result);
      
      // Broadcast to room if needed
      if (result.broadcast) {
        socket.to(actionData.roomId).emit('game-update', result.gameState);
      }
    } catch (error) {
      socket.emit('error', { message: 'Action processing failed' });
    }
  });
  
  socket.on('train-ai', async (trainingData) => {
    try {
      const result = await aiController.trainModel(trainingData);
      socket.emit('training-complete', result);
    } catch (error) {
      socket.emit('error', { message: 'AI training failed' });
    }
  });
  
  socket.on('disconnect', () => {
    console.log(`🐧 Player disconnected: ${socket.id}`);
    gameStateManager.removePlayer(socket.id);
  });
});

// AI Loop for autonomous penguin behavior
function startAILoop(socket: any, penguinAI: PenguinAI) {
  const aiInterval = setInterval(async () => {
    try {
      const decision = await penguinAI.makeDecision();
      socket.emit('ai-decision', decision);
      
      // Learn from the decision outcome
      if (decision.reward !== undefined) {
        await penguinAI.learn(decision.reward);
      }
    } catch (error) {
      console.error('AI Loop error:', error);
    }
  }, 1000); // AI thinks every second
  
  socket.on('disconnect', () => {
    clearInterval(aiInterval);
  });
}

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/yarn-penguin-ai')
  .then(() => console.log('🗄️  MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Global AI training scheduler
setInterval(async () => {
  try {
    await aiController.performGlobalTraining();
    console.log('🧠 Global AI training completed');
  } catch (error) {
    console.error('Global training error:', error);
  }
}, 300000); // Train every 5 minutes

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🧶 Yarn Penguin AI World Backend Started!`);
});