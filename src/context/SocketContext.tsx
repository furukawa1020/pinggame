import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  serverStatus: any;
  joinGame: (playerData: any) => void;
  sendPenguinAction: (actionData: any) => void;
  sendAITraining: (trainingData: any) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [serverStatus, setServerStatus] = useState(null);

  useEffect(() => {
    // バックエンドサーバーに接続
    const newSocket = io('http://localhost:5000', {
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('🧶 Connected to Yarn Penguin AI Server!', newSocket.id);
      setIsConnected(true);
      
      // サーバー健康状態チェック
      fetch('http://localhost:5000/api/health')
        .then(res => res.json())
        .then(data => {
          console.log('🌐 Server Status:', data);
          setServerStatus(data);
        })
        .catch(err => console.error('❌ Server health check failed:', err));
    });

    newSocket.on('disconnect', () => {
      console.log('💔 Disconnected from server');
      setIsConnected(false);
    });

    // ゲームイベントリスナー
    newSocket.on('game-joined', (data) => {
      console.log('🎮 Game joined:', data);
    });

    newSocket.on('player-joined', (data) => {
      console.log('👋 Player joined:', data);
    });

    newSocket.on('player-left', (data) => {
      console.log('👋 Player left:', data);
    });

    newSocket.on('penguin-moved', (data) => {
      console.log('🐧 Penguin moved:', data);
    });

    newSocket.on('penguin-spawned', (data) => {
      console.log('🐧 New penguin spawned:', data);
    });

    newSocket.on('ai-training-complete', (data) => {
      console.log('🧠 AI training complete:', data);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const joinGame = (playerData: any) => {
    if (socket && isConnected) {
      socket.emit('join-game', playerData);
    }
  };

  const sendPenguinAction = (actionData: any) => {
    if (socket && isConnected) {
      socket.emit('penguin-action', actionData);
    }
  };

  const sendAITraining = (trainingData: any) => {
    if (socket && isConnected) {
      socket.emit('ai-training', trainingData);
    }
  };

  const value = {
    socket,
    isConnected,
    serverStatus,
    joinGame,
    sendPenguinAction,
    sendAITraining
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};