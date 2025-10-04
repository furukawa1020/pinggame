import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Basic routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: '🧶 Yarn Penguin AI Server is running!' });
});

// Game state (simplified for now)
let gameState = {
  players: new Map(),
  penguins: [],
  fishItems: [],
  yarnItems: []
};

// Socket.io for real-time multiplayer
io.on('connection', (socket) => {
  console.log(`🐧 Player connected: ${socket.id}`);
  
  socket.on('join-game', (playerData: any) => {
    gameState.players.set(socket.id, playerData);
    socket.emit('game-joined', { 
      playerId: socket.id, 
      gameState: {
        playerCount: gameState.players.size,
        penguins: gameState.penguins.length
      }
    });
    
    // Broadcast to all players
    io.emit('player-joined', { 
      playerId: socket.id,
      playerCount: gameState.players.size 
    });
  });
  
  socket.on('penguin-action', (actionData: any) => {
    // AI decision processing (simplified)
    const decision = {
      penguinId: actionData.penguinId,
      action: actionData.action,
      timestamp: Date.now()
    };
    
    // Broadcast to all players in the game
    io.emit('penguin-decision', decision);
  });
  
  socket.on('disconnect', () => {
    console.log(`🐧 Player disconnected: ${socket.id}`);
    gameState.players.delete(socket.id);
    
    // Notify other players
    io.emit('player-left', { 
      playerId: socket.id,
      playerCount: gameState.players.size 
    });
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🧶 Yarn Penguin AI World Backend Ready!`);
  console.log(`📡 Socket.IO enabled for real-time multiplayer`);
});
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