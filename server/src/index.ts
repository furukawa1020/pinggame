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
  res.json({ status: 'OK', message: ' Yarn Penguin AI Server is running!' });
});

app.get('/api/game/status', (req, res) => {
  res.json({
    players: gameState.players.size,
    penguins: gameState.penguins.length,
    fishItems: gameState.fishItems.length,
    yarnItems: gameState.yarnItems.length
  });
});

// Game state
interface Penguin {
  id: string;
  x: number;
  y: number;
  type: string;
  behavior: string;
}

const gameState = {
  players: new Map(),
  penguins: [] as Penguin[],
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
    
    socket.broadcast.emit('player-joined', {
      playerId: socket.id,
      playerData
    });
  });

  socket.on('penguin-action', (actionData: any) => {
    console.log(`🐧 Action from ${socket.id}:`, actionData);
    
    io.emit('penguin-moved', {
      playerId: socket.id,
      action: actionData
    });
  });

  socket.on('ai-training', (trainingData: any) => {
    console.log(`🧠 AI Training data from ${socket.id}:`, trainingData);
    
    socket.emit('ai-training-complete', {
      success: true,
      message: 'AI model updated successfully'
    });
  });

  socket.on('disconnect', () => {
    console.log(`🐧 Player disconnected: ${socket.id}`);
    gameState.players.delete(socket.id);
    
    socket.broadcast.emit('player-left', {
      playerId: socket.id
    });
  });
});

// Simple AI penguin spawning
setInterval(() => {
  if (gameState.penguins.length < 5) {
    const newPenguin: Penguin = {
      id: `penguin_${Date.now()}`,
      x: Math.random() * 800,
      y: Math.random() * 600,
      type: 'yarn',
      behavior: 'exploring'
    };
    
    gameState.penguins.push(newPenguin);
    
    io.emit('penguin-spawned', newPenguin);
  }
}, 5000);

// Start server
server.listen(PORT, () => {
  console.log(`🧶 Yarn Penguin AI Server running on port ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🎮 Game status: http://localhost:${PORT}/api/game/status`);
});
