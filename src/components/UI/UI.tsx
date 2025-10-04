import React, { useEffect, useState } from 'react';
import { useSocket } from '../../context/SocketContext';
import { useAI } from '../../context/AIContext';
import './UI.css';

export const UI: React.FC = () => {
  const { isConnected, serverStatus, joinGame, sendPenguinAction, sendAITraining } = useSocket();
  const { isAIActive, aiPerformance, trainingProgress, startAITraining, stopAITraining } = useAI();
  const [playerName, setPlayerName] = useState('Player_' + Math.floor(Math.random() * 1000));
  const [gameStats, setGameStats] = useState({
    players: 0,
    penguins: 0,
    fishItems: 0,
    yarnItems: 0
  });

  useEffect(() => {
    // ゲーム参加
    if (isConnected) {
      joinGame({
        name: playerName,
        timestamp: Date.now()
      });
    }
  }, [isConnected, playerName, joinGame]);

  useEffect(() => {
    // ゲーム状態を定期的に取得
    const interval = setInterval(() => {
      if (isConnected) {
        fetch('http://localhost:5000/api/game/status')
          .then(res => res.json())
          .then(data => setGameStats(data))
          .catch(err => console.error('Failed to fetch game status:', err));
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isConnected]);

  const handlePenguinAction = () => {
    sendPenguinAction({
      type: 'move',
      direction: Math.random() * Math.PI * 2,
      timestamp: Date.now()
    });
  };

  const handleAITraining = () => {
    if (isAIActive) {
      stopAITraining();
    } else {
      startAITraining();
      sendAITraining({
        data: Array.from({ length: 8 }, () => Math.random()),
        timestamp: Date.now()
      });
    }
  };

  return (
    <div className="ui-overlay">
      {/* 接続状態 */}
      <div className="connection-status">
        <div className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
          {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
        </div>
        {serverStatus && (
          <div className="server-status">
            🧶 {serverStatus.message}
          </div>
        )}
      </div>

      {/* ゲーム統計 */}
      <div className="game-stats">
        <h3>🎮 Game Stats</h3>
        <div className="stat-item">
          <span>👥 Players:</span> <span>{gameStats.players}</span>
        </div>
        <div className="stat-item">
          <span>🐧 Penguins:</span> <span>{gameStats.penguins}</span>
        </div>
        <div className="stat-item">
          <span>🐟 Fish:</span> <span>{gameStats.fishItems}</span>
        </div>
        <div className="stat-item">
          <span>🧶 Yarn:</span> <span>{gameStats.yarnItems}</span>
        </div>
      </div>

      {/* AI制御パネル */}
      <div className="ai-control-panel">
        <h3>🧠 AI Control</h3>
        <div className="ai-status">
          <span>Status:</span> 
          <span className={isAIActive ? 'active' : 'inactive'}>
            {isAIActive ? '🟢 Active' : '⚪ Inactive'}
          </span>
        </div>
        <div className="ai-performance">
          <span>Performance:</span> 
          <span>{aiPerformance}%</span>
        </div>
        {isAIActive && (
          <div className="training-progress">
            <span>Training:</span>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${trainingProgress}%` }}
              />
            </div>
            <span>{Math.round(trainingProgress)}%</span>
          </div>
        )}
        <button 
          className="ai-toggle-btn"
          onClick={handleAITraining}
          disabled={!isConnected}
        >
          {isAIActive ? '⏹️ Stop AI' : '▶️ Start AI'}
        </button>
      </div>

      {/* アクションパネル */}
      <div className="action-panel">
        <h3>🎮 Actions</h3>
        <button 
          className="action-btn penguin-action"
          onClick={handlePenguinAction}
          disabled={!isConnected}
        >
          🐧 Move Penguin
        </button>
        <input
          type="text"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          placeholder="Your name"
          className="player-name-input"
        />
      </div>

      {/* フルスタック情報 */}
      <div className="tech-info">
        <div className="tech-stack">
          <h4>🛠️ Tech Stack</h4>
          <div className="tech-item">Frontend: React + Three.js + TypeScript</div>
          <div className="tech-item">Backend: Node.js + Express + Socket.io</div>
          <div className="tech-item">AI: TensorFlow.js Neural Networks</div>
          <div className="tech-item">Real-time: WebSocket Communication</div>
        </div>
      </div>
    </div>
  );
};