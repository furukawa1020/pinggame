import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// 魚アイテムコンポーネント
const FishItem: React.FC<{
  position: [number, number, number];
  onCollect: () => void;
  id: string;
}> = ({ position, onCollect, id }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.02;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2 + position[0]) * 0.3;
    }
  });

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          console.log(`🐟 魚 ${id} がクリックされました！`);
          onCollect();
        }}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
        onPointerOut={(e) => { e.stopPropagation(); setHovered(false); }}
        scale={hovered ? 1.5 : 1}
      >
        {/* 魚の体 */}
        <boxGeometry args={[1.2, 0.7, 0.4]} />
        <meshStandardMaterial 
          color={hovered ? "#FFB6C1" : "#FFA07A"} 
          emissive={hovered ? "#FF69B4" : "#000000"}
          emissiveIntensity={0.1}
        />
        
        {/* 魚の尻尾 */}
        <mesh position={[0.7, 0, 0]} rotation={[0, 0, Math.PI / 4]}>
          <coneGeometry args={[0.3, 0.5, 3]} />
          <meshStandardMaterial 
            color={hovered ? "#FF69B4" : "#FF7F50"} 
          />
        </mesh>
        
        {/* 魚の目 */}
        <mesh position={[-0.3, 0.2, 0.15]}>
          <sphereGeometry args={[0.08]} />
          <meshStandardMaterial color="#000000" />
        </mesh>
        <mesh position={[-0.3, 0.2, -0.15]}>
          <sphereGeometry args={[0.08]} />
          <meshStandardMaterial color="#000000" />
        </mesh>
      </mesh>
    </group>
  );
};

// 毛糸玉アイテムコンポーネント
const YarnBallItem: React.FC<{
  position: [number, number, number];
  onCollect: () => void;
  id: string;
}> = ({ position, onCollect, id }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.01;
      meshRef.current.rotation.y += 0.02;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 3 + position[0]) * 0.2;
    }
  });

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          console.log(`🧶 毛糸玉 ${id} がクリックされました！`);
          onCollect();
        }}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
        onPointerOut={(e) => { e.stopPropagation(); setHovered(false); }}
        scale={hovered ? 1.4 : 1}
      >
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshStandardMaterial 
          color={hovered ? "#FFD700" : "#FF69B4"} 
          roughness={0.4}
          metalness={0.2}
          emissive="#FFB6C1"
          emissiveIntensity={hovered ? 0.3 : 0.1}
        />
        
        {/* 毛糸の線 */}
        <mesh position={[0.3, 0.3, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.6]} />
          <meshStandardMaterial color="#FFFFFF" />
        </mesh>
      </mesh>
    </group>
  );
};

// アニメーション付きペンギンコンポーネント
const YarnPenguin: React.FC<{
  position: [number, number, number];
  onClick: () => void;
}> = ({ position, onClick }) => {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.15;
      groupRef.current.rotation.y += 0.005;
    }
  });

  return (
    <group 
      ref={groupRef} 
      position={position}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      {/* ペンギンの体 */}
      <mesh scale={hovered ? 1.1 : 1}>
        <sphereGeometry args={[0.6, 16, 16]} />
        <meshStandardMaterial 
          color="#2C3E50" 
          emissive={hovered ? "#34495E" : "#000000"}
          emissiveIntensity={0.1}
        />
      </mesh>
      
      {/* ペンギンのお腹 */}
      <mesh position={[0, 0, 0.4]} scale={hovered ? 1.1 : 1}>
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshStandardMaterial color="#FFFEF7" />
      </mesh>
      
      {/* ペンギンの頭 */}
      <mesh position={[0, 0.7, 0]} scale={hovered ? 1.1 : 1}>
        <sphereGeometry args={[0.45, 16, 16]} />
        <meshStandardMaterial color="#2C3E50" />
      </mesh>
      
      {/* ペンギンの目 */}
      <mesh position={[-0.15, 0.8, 0.3]}>
        <sphereGeometry args={[0.06]} />
        <meshStandardMaterial color="#FFFFFF" />
      </mesh>
      <mesh position={[0.15, 0.8, 0.3]}>
        <sphereGeometry args={[0.06]} />
        <meshStandardMaterial color="#FFFFFF" />
      </mesh>
      
      {/* ペンギンのくちばし */}
      <mesh position={[0, 0.65, 0.4]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.08, 0.2, 3]} />
        <meshStandardMaterial color="#FF8C00" />
      </mesh>
    </group>
  );
};

const GameScene: React.FC = () => {
  const [gameStats, setGameStats] = useState({
    fish: 0,
    yarnBalls: 0,
    score: 0,
    level: 1
  });
  
  const [fishItems, setFishItems] = useState<Array<{
    id: string;
    position: [number, number, number];
  }>>([]);
  
  const [yarnItems, setYarnItems] = useState<Array<{
    id: string;
    position: [number, number, number];
  }>>([]);

  // アイテム生成システム
  useEffect(() => {
    const spawnItems = () => {
      // 魚生成（高確率）
      if (fishItems.length < 6) {
        const newFish = {
          id: `fish_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          position: [
            (Math.random() - 0.5) * 12,
            Math.random() * 3 + 1,
            (Math.random() - 0.5) * 12
          ] as [number, number, number]
        };
        setFishItems(prev => [...prev, newFish]);
        console.log('🐟 魚を生成しました:', newFish.id);
      }
      
      // 毛糸玉生成（中確率）
      if (yarnItems.length < 3 && Math.random() < 0.4) {
        const newYarn = {
          id: `yarn_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          position: [
            (Math.random() - 0.5) * 10,
            Math.random() * 2 + 1.5,
            (Math.random() - 0.5) * 10
          ] as [number, number, number]
        };
        setYarnItems(prev => [...prev, newYarn]);
        console.log('🧶 毛糸玉を生成しました:', newYarn.id);
      }
    };

    const interval = setInterval(spawnItems, 2000);
    return () => clearInterval(interval);
  }, [fishItems.length, yarnItems.length]);

  // 魚収集処理
  const collectFish = useCallback((fishId: string) => {
    setFishItems(prev => {
      const newItems = prev.filter(fish => fish.id !== fishId);
      console.log(`🐟 魚 ${fishId} を獲得！残り魚: ${newItems.length}`);
      return newItems;
    });
    
    setGameStats(prev => {
      const newStats = {
        ...prev,
        fish: prev.fish + 1,
        score: prev.score + 10,
        level: Math.floor((prev.fish + 1) / 5) + 1
      };
      console.log('📊 新しいスコア:', newStats);
      return newStats;
    });

    // 音響効果（成功音）
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(1200, audioContext.currentTime + 0.1);
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    } catch (e) {
      console.log('🎵 音再生に失敗');
    }
  }, []);

  // 毛糸玉収集処理
  const collectYarnBall = useCallback((yarnId: string) => {
    setYarnItems(prev => {
      const newItems = prev.filter(yarn => yarn.id !== yarnId);
      console.log(`🧶 毛糸玉 ${yarnId} を獲得！残り毛糸玉: ${newItems.length}`);
      return newItems;
    });
    
    setGameStats(prev => {
      const newStats = {
        ...prev,
        yarnBalls: prev.yarnBalls + 1,
        score: prev.score + 25,
        level: Math.floor((prev.fish + prev.yarnBalls + 1) / 3) + 1
      };
      console.log('📊 新しいスコア:', newStats);
      return newStats;
    });
  }, []);

  // ペンギンクリック処理
  const handlePenguinClick = useCallback(() => {
    setGameStats(prev => ({
      ...prev,
      score: prev.score + 5
    }));
    console.log('🐧 ペンギンをクリック！+5ポイント');
  }, []);

  // ゲーム統計をグローバルに公開
  useEffect(() => {
    (window as any).gameStats = gameStats;
    console.log('📊 ゲーム統計更新:', gameStats);
  }, [gameStats]);

  // デバッグログ
  useEffect(() => {
    console.log(`🐟 現在の魚数: ${fishItems.length}`);
  }, [fishItems.length]);

  useEffect(() => {
    console.log(`🧶 現在の毛糸玉数: ${yarnItems.length}`);
  }, [yarnItems.length]);

  return (
    <>
      {/* 照明設定 */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={1.2} castShadow />
      <pointLight position={[0, 5, 0]} intensity={0.8} color="#FFE4E1" />
      <spotLight position={[5, 10, 5]} angle={0.3} penumbra={1} intensity={0.5} />
      
      {/* 地面 */}
      <mesh receiveShadow position={[0, -1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[25, 25]} />
        <meshStandardMaterial 
          color="#F0E68C" 
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>
      
      {/* ペンギンたち */}
      {Array.from({ length: 4 }, (_, i) => (
        <YarnPenguin 
          key={`penguin_${i}`}
          position={[
            Math.cos(i * 1.57) * 3,
            0,
            Math.sin(i * 1.57) * 3
          ]}
          onClick={handlePenguinClick}
        />
      ))}
      
      {/* 魚アイテム表示 */}
      {fishItems.map((fish) => (
        <FishItem
          key={fish.id}
          id={fish.id}
          position={fish.position}
          onCollect={() => collectFish(fish.id)}
        />
      ))}
      
      {/* 毛糸玉アイテム表示 */}
      {yarnItems.map((yarn) => (
        <YarnBallItem
          key={yarn.id}
          id={yarn.id}
          position={yarn.position}
          onCollect={() => collectYarnBall(yarn.id)}
        />
      ))}
      
      {/* 装飾的な雲 */}
      {Array.from({ length: 3 }, (_, i) => (
        <mesh 
          key={`cloud_${i}`}
          position={[
            (Math.random() - 0.5) * 20,
            8 + Math.random() * 3,
            (Math.random() - 0.5) * 20
          ]}
        >
          <sphereGeometry args={[1 + Math.random(), 8, 8]} />
          <meshStandardMaterial 
            color="#FFFFFF" 
            transparent 
            opacity={0.8}
          />
        </mesh>
      ))}
    </>
  );
};

export default GameScene;
