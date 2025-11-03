import React, { useEffect, useState } from 'react';
import { useSocket } from '../../context/SocketContext';
import { useAI } from '../../context/AIContext';
import './NewUI.css';

// Floating decoration component
const FloatingDecoration: React.FC<{ emoji: string; delay: number; duration: number }> = ({ emoji, delay, duration }) => {
  const position = React.useMemo(() => ({
    left: Math.random() * 80 + 10,
    top: Math.random() * 80 + 10,
  }), []);
  
  return (
    <div
      className="floating-decoration"
      style={{
        left: `${position.left}%`,
        top: `${position.top}%`,
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
      }}
    >
      {emoji}
    </div>
  );
};

export const UI: React.FC = () => {
  const { isConnected, serverStatus, joinGame, sendPenguinAction, sendAITraining } = useSocket();
  const { isAIActive, aiPerformance, trainingProgress, startAITraining, stopAITraining } = useAI();
  const [playerName] = useState('Player_' + Math.floor(Math.random() * 1000));
  const [gameStats, setGameStats] = useState({
    players: 0,
    penguins: 0,
    fishItems: 0,
    yarnItems: 0,
    fish: 0,
    yarnBalls: 0,
    score: 0,
    level: 1
  });

  // リアルタイムでゲーム統計を更新
  useEffect(() => {
    const updateStats = () => {
      if ((window as any).gameStats) {
        setGameStats(prev => ({
          ...prev,
          ...(window as any).gameStats
        }));
      }
    };

    const interval = setInterval(updateStats, 100);
    return () => clearInterval(interval);
  }, []);

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
    // ゲーム状態を定期的に取得 + グローバル統計を監視
    const interval = setInterval(() => {
      if (isConnected) {
        fetch('http://localhost:5000/api/game/status')
          .then(res => res.json())
          .then(data => setGameStats(prev => ({ ...prev, ...data })))
          .catch(() => {
            // サーバーエラーは無視
          });
      }
      
      // グローバル統計を取得
      if ((window as any).gameStats) {
        setGameStats(prev => ({ 
          ...prev, 
          ...(window as any).gameStats 
        }));
      }
    }, 500);

    return () => clearInterval(interval);
  }, [isConnected]);

  const handlePenguinAction = () => {
    const action = {
      type: 'move',
      direction: Math.random() * Math.PI * 2,
      speed: 1 + Math.random() * 2,
      timestamp: Date.now(),
      playerId: playerName
    };
    
    sendPenguinAction(action);
    console.log('🐧 ペンギンアクション送信:', action);
  };

  const handleAITraining = () => {
    if (isAIActive) {
      stopAITraining();
      console.log('🤖 AI訓練を停止しました');
    } else {
      startAITraining();
      
      // 高度なAI訓練データを送信
      const trainingData = {
        gameState: gameStats,
        playerActions: Array.from({ length: 10 }, () => ({
          action: 'collect_fish',
          success: Math.random() > 0.3,
          score: Math.floor(Math.random() * 50),
          timestamp: Date.now() - Math.random() * 10000
        })),
        environmentData: {
          fishCount: gameStats.fishItems,
          yarnCount: gameStats.yarnItems,
          playerLevel: gameStats.level || 1
        },
        timestamp: Date.now()
      };
      
      sendAITraining(trainingData);
      console.log('🤖 AI訓練を開始しました:', trainingData);
    }
  };

  return (
    <div className="ui-overlay">
      {/* Floating decorations */}
      <FloatingDecoration emoji="🐧" delay={0} duration={6} />
      <FloatingDecoration emoji="🧶" delay={1} duration={7} />
      <FloatingDecoration emoji="🐟" delay={2} duration={5.5} />
      <FloatingDecoration emoji="🧶" delay={3} duration={6.5} />
      <FloatingDecoration emoji="🐧" delay={4} duration={8} />
      <FloatingDecoration emoji="✨" delay={1.5} duration={7} />
      
      {/* 接続状態 */}
      <div className="connection-status">
        <div className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
          {isConnected ? '🟢 接続済み' : '🔴 切断中'}
        </div>
        {serverStatus && (
          <div className="server-status">
            🧶 {serverStatus.message}
          </div>
        )}
      </div>

      {/* ゲーム統計 */}
      <div className="game-stats">
        <h3>🎮 ゲーム統計</h3>
        <div className="stat-item">
          <span>🏆 レベル:</span> 
          <span className="highlight level">{gameStats.level}</span>
        </div>
        <div className="stat-item">
          <span>⭐ スコア:</span> 
          <span className="highlight score">{gameStats.score}</span>
        </div>
        <div className="stat-item">
          <span>🐟 獲得した魚:</span> 
          <span className="highlight">{gameStats.fish}</span>
        </div>
        <div className="stat-item">
          <span>🧶 毛糸玉:</span> 
          <span className="highlight">{gameStats.yarnBalls}</span>
        </div>
        <div className="stat-item">
          <span>🎯 フィールドの魚:</span> 
          <span>{gameStats.fishItems}</span>
        </div>
        <div className="stat-item">
          <span>🧶 フィールドの毛糸玉:</span> 
          <span>{gameStats.yarnItems}</span>
        </div>
        <div className="stat-item">
          <span>👥 プレイヤー:</span> 
          <span>{gameStats.players}</span>
        </div>
      </div>

      {/* AI制御パネル */}
      <div className="ai-controls">
        <h3>🤖 AI制御</h3>
        <div className="ai-status">
          <span>状態: {isAIActive ? '🟢 稼働中' : '🔴 停止中'}</span>
        </div>
        <div className="ai-performance">
          <span>パフォーマンス: {Math.round((aiPerformance || 0) * 100)}%</span>
        </div>
        <div className="training-progress">
          <span>学習進捗: {Math.round((trainingProgress || 0) * 100)}%</span>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${(trainingProgress || 0) * 100}%` }}
            ></div>
          </div>
        </div>
        <button 
          className="ai-training-button"
          onClick={handleAITraining}
        >
          {isAIActive ? '🛑 AI停止' : '🚀 AI開始'}
        </button>
      </div>

      {/* アクションボタン */}
      <div className="action-controls">
        <h3>🎮 アクション</h3>
        <button 
          className="action-button"
          onClick={handlePenguinAction}
          disabled={!isConnected}
        >
          🐧 ペンギン移動
        </button>
        <div className="help-text">
          💡 魚をクリックして獲得しよう！
        </div>
      </div>
    </div>
  );
};

export default UI;