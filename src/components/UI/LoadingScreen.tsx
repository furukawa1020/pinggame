import React from 'react';
import './LoadingScreen.css';

export const LoadingScreen: React.FC = () => {
  return (
    <div className="loading-screen">
      <div className="loading-content">
        <div className="yarn-spinner">
          <div className="yarn-ball"></div>
          <div className="yarn-ball"></div>
          <div className="yarn-ball"></div>
        </div>
        <h1 className="loading-title">🧶 わたわたペンギンニットワールド 🧶</h1>
        <p className="loading-subtitle">フルスタック毛糸ペンギンAIワールドを起動中...</p>
        <div className="loading-features">
          <div className="feature-item">✨ React + Three.js 3Dワールド</div>
          <div className="feature-item">🧠 TensorFlow.js AIシステム</div>
          <div className="feature-item">🔄 Socket.io リアルタイム通信</div>
          <div className="feature-item">🐧 自律的ペンギンエージェント</div>
        </div>
      </div>
    </div>
  );
};