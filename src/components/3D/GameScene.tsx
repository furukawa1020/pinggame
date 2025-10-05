import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const GameScene: React.FC = () => {
  const [fishItems, setFishItems] = useState<Array<{
    id: string;
    position: [number, number, number];
  }>>([]);

  useEffect(() => {
    const spawnFish = () => {
      if (fishItems.length < 5) {
        const newFish = {
          id: `fish_${Date.now()}`,
          position: [
            (Math.random() - 0.5) * 8,
            Math.random() * 2 + 1,
            (Math.random() - 0.5) * 8
          ] as [number, number, number]
        };
        setFishItems(prev => [...prev, newFish]);
        console.log('🐟 魚を生成しました:', newFish.id);
      }
    };

    const interval = setInterval(spawnFish, 3000);
    return () => clearInterval(interval);
  }, [fishItems.length]);

  const collectFish = (fishId: string) => {
    setFishItems(prev => prev.filter(fish => fish.id !== fishId));
    console.log(`🐟 魚 ${fishId} を獲得しました！`);
  };

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      
      <mesh position={[0, -1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#F0E68C" />
      </mesh>
      
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshStandardMaterial color="#2C3E50" />
      </mesh>
      
      {fishItems.map((fish) => (
        <mesh 
          key={fish.id}
          position={fish.position}
          onClick={() => collectFish(fish.id)}
        >
          <boxGeometry args={[1.0, 0.6, 0.3]} />
          <meshStandardMaterial color="#FFA07A" />
        </mesh>
      ))}
      
      <mesh position={[-2, 1, -2]}>
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshStandardMaterial color="#FF69B4" />
      </mesh>
    </>
  );
};

export default GameScene;
