import React, { Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Stars } from '@react-three/drei';
// import { Physics } from '@react-three/cannon';
import GameScene from './components/3D/GameScene';
import { UI } from './components/UI/NewUI';
import { GameProvider } from './context/GameContext';
// import { AIProvider } from './context/AIContext';
// import { SocketProvider } from './context/SocketContext';
// import { LoadingScreen } from './components/UI/LoadingScreen';
import './App.css';

function App() {
  useEffect(() => {
    // Initialize app
    console.log('🧶 Yarn Penguin AI World Starting...');
  }, []);

  return (
    <div className="app">
      <SocketProvider>
        <AIProvider>
          <GameProvider>
            {/* 3D Game World */}
            <Canvas
              camera={{ position: [0, 10, 10], fov: 60 }}
              style={{ height: '100vh', width: '100vw' }}
              shadows
              gl={{ antialias: true, alpha: false }}
            >
              <Suspense fallback={null}>
                {/* Lighting */}
                <ambientLight intensity={0.4} />
                <directionalLight
                  position={[10, 10, 5]}
                  intensity={1}
                  castShadow
                  shadow-mapSize-width={2048}
                  shadow-mapSize-height={2048}
                />
                
                {/* Environment */}
                <Environment preset="sunset" />
                <Stars radius={100} depth={50} count={5000} factor={4} />
                
                {/* Physics */}
                <Physics gravity={[0, -9.82, 0]}>
                  <GameScene />
                </Physics>
                
                {/* Controls */}
                <OrbitControls
                  enablePan={true}
                  enableZoom={true}
                  enableRotate={true}
                  minDistance={5}
                  maxDistance={50}
                />
              </Suspense>
            </Canvas>
            
            {/* UI Overlay */}
            <UI />
            
            {/* Loading Screen */}
            <Suspense fallback={<LoadingScreen />}>
              {/* Loading components */}
            </Suspense>
          </GameProvider>
        </AIProvider>
      </SocketProvider>
    </div>
  );
}

export default App;