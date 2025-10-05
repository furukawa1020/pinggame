import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { useSocket } from '../../context/SocketContext';
import { useAI } from '../../context/AIContext';
import * as THREE from 'three';

// 美しい魚コンポーネント（リアルな形状とテクスチャ）
const RealisticFish: React.FC<{
  position: [number, number, number];
  onCollect: () => void;
  id: string;
}> = ({ position, onCollect, id }) => {
  const fishRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const [collected, setCollected] = useState(false);

  useFrame((state) => {
    if (fishRef.current && !collected) {
      // 自然な泳ぎ動作
      fishRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2 + position[0]) * 0.4;
      fishRef.current.position.x = position[0] + Math.sin(state.clock.elapsedTime * 0.8) * 0.2;
      fishRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 1.5) * 0.3;
      fishRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });

  const handleCollect = useCallback(() => {
    if (!collected) {
      setCollected(true);
      // 消失アニメーション
      if (fishRef.current) {
        fishRef.current.scale.setScalar(0);
      }
      setTimeout(() => onCollect(), 200);
    }
  }, [collected, onCollect]);

  if (collected) return null;

  return (
    <group 
      ref={fishRef} 
      position={position}
      scale={hovered ? 1.3 : 1}
      onClick={handleCollect}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* 魚の体 - 楕円形で自然な形 */}
      <mesh>
        <sphereGeometry args={[0.8, 16, 12]} />
        <meshPhysicalMaterial 
          color={hovered ? "#FF6B9D" : "#FFA07A"}
          metalness={0.1}
          roughness={0.2}
          clearcoat={0.8}
          clearcoatRoughness={0.1}
          transmission={0.1}
          thickness={0.5}
        />
      </mesh>
      
      {/* 魚の頭部 */}
      <mesh position={[0.6, 0, 0]}>
        <sphereGeometry args={[0.5, 12, 10]} />
        <meshPhysicalMaterial 
          color={hovered ? "#FF8FA3" : "#FFB347"}
          metalness={0.05}
          roughness={0.3}
          clearcoat={0.6}
        />
      </mesh>

      {/* 美しい尻尾 - 複数層で立体感 */}
      <group position={[-0.9, 0, 0]} rotation={[0, 0, Math.PI / 6]}>
        <mesh>
          <coneGeometry args={[0.4, 1.2, 8]} />
          <meshPhysicalMaterial 
            color={hovered ? "#FF69B4" : "#FF7F50"}
            metalness={0.2}
            roughness={0.4}
            clearcoat={0.9}
            transmission={0.15}
          />
        </mesh>
        <mesh position={[0, 0.2, 0]} rotation={[0, Math.PI / 4, 0]}>
          <coneGeometry args={[0.25, 0.8, 6]} />
          <meshPhysicalMaterial 
            color="#FFB6C1"
            transparent
            opacity={0.8}
            metalness={0.1}
            roughness={0.2}
          />
        </mesh>
      </group>

      {/* 輝く目 */}
      <mesh position={[0.8, 0.2, 0.3]}>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshPhysicalMaterial 
          color="#000000"
          metalness={0.9}
          roughness={0.1}
          emissive="#4169E1"
          emissiveIntensity={0.3}
        />
      </mesh>
      <mesh position={[0.8, 0.2, -0.3]}>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshPhysicalMaterial 
          color="#000000"
          metalness={0.9}
          roughness={0.1}
          emissive="#4169E1"
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* ヒレ - 動的アニメーション */}
      <mesh position={[0.2, -0.5, 0.6]} rotation={[0, 0, Math.PI / 6]}>
        <planeGeometry args={[0.3, 0.6]} />
        <meshPhysicalMaterial 
          color="#FFE4E1"
          transparent
          opacity={0.8}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh position={[0.2, -0.5, -0.6]} rotation={[0, 0, -Math.PI / 6]}>
        <planeGeometry args={[0.3, 0.6]} />
        <meshPhysicalMaterial 
          color="#FFE4E1"
          transparent
          opacity={0.8}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* パーティクル効果 */}
      {hovered && (
        <>
          {Array.from({ length: 8 }, (_, i) => (
            <mesh 
              key={i}
              position={[
                Math.sin(i * Math.PI / 4) * 1.5,
                Math.cos(i * Math.PI / 4) * 1.5,
                0
              ]}
            >
              <sphereGeometry args={[0.05, 6, 6]} />
              <meshBasicMaterial 
                color="#FFD700"
                transparent
                opacity={0.6}
              />
            </mesh>
          ))}
        </>
      )}
    </group>
  );
};

// 高品質毛糸玉
const PremiumYarnBall: React.FC<{
  position: [number, number, number];
  onCollect: () => void;
  id: string;
}> = ({ position, onCollect, id }) => {
  const yarnRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (yarnRef.current) {
      yarnRef.current.rotation.x += 0.01;
      yarnRef.current.rotation.y += 0.02;
      yarnRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 3) * 0.3;
    }
  });

  return (
    <group 
      ref={yarnRef} 
      position={position}
      scale={hovered ? 1.4 : 1}
      onClick={onCollect}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* メイン毛糸玉 */}
      <mesh>
        <sphereGeometry args={[0.6, 32, 32]} />
        <meshPhysicalMaterial 
          color={hovered ? "#FFD700" : "#FF69B4"}
          metalness={0.1}
          roughness={0.8}
          clearcoat={0.2}
          normalScale={new THREE.Vector2(2, 2)}
        />
      </mesh>

      {/* 毛糸の糸 - 複数のストランド */}
      {Array.from({ length: 12 }, (_, i) => (
        <mesh 
          key={i}
          position={[
            Math.sin(i * Math.PI / 6) * 0.7,
            Math.cos(i * Math.PI / 6) * 0.4,
            Math.sin(i * Math.PI / 3) * 0.5
          ]}
          rotation={[i * 0.5, i * 0.3, i * 0.7]}
        >
          <cylinderGeometry args={[0.02, 0.02, 1.5]} />
          <meshPhysicalMaterial 
            color="#FFFFFF"
            metalness={0.0}
            roughness={0.9}
          />
        </mesh>
      ))}

      {/* 内部光源効果 */}
      <pointLight 
        position={[0, 0, 0]} 
        intensity={hovered ? 2 : 0.5} 
        color="#FFB6C1" 
        distance={3}
      />
    </group>
  );
};

// リアルなペンギン - 動的AI連携
const IntelligentPenguin: React.FC<{
  position: [number, number, number];
  id: string;
}> = ({ position, id }) => {
  const penguinRef = useRef<THREE.Group>(null);
  const [aiTarget, setAITarget] = useState<[number, number, number]>(position);
  const [isMoving, setIsMoving] = useState(false);
  const [mood, setMood] = useState<'happy' | 'excited' | 'curious'>('happy');
  
  const { sendPenguinAction } = useSocket();
  const { isAIActive } = useAI();

  useFrame((state) => {
    if (penguinRef.current) {
      // 自然な呼吸動作
      const breathScale = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.05;
      penguinRef.current.scale.setScalar(breathScale);
      
      // AI による自動移動
      if (isAIActive && isMoving) {
        const currentPos = penguinRef.current.position;
        const targetPos = new THREE.Vector3(...aiTarget);
        currentPos.lerp(targetPos, 0.02);
        
        // 移動方向を向く
        penguinRef.current.lookAt(targetPos);
      }
      
      // 軽い浮遊動作
      penguinRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2 + position[0]) * 0.15;
    }
  });

  // AI による自動行動
  useEffect(() => {
    if (isAIActive) {
      const aiInterval = setInterval(() => {
        const newTarget: [number, number, number] = [
          (Math.random() - 0.5) * 10,
          0,
          (Math.random() - 0.5) * 10
        ];
        setAITarget(newTarget);
        setIsMoving(true);
        setMood(['happy', 'excited', 'curious'][Math.floor(Math.random() * 3)] as any);
        
        sendPenguinAction({
          penguinId: id,
          action: 'move',
          target: newTarget,
          mood: mood
        });
        
        setTimeout(() => setIsMoving(false), 2000);
      }, 3000);
      
      return () => clearInterval(aiInterval);
    }
  }, [isAIActive, id, mood, sendPenguinAction]);

  const handleClick = () => {
    setMood('excited');
    sendPenguinAction({
      penguinId: id,
      action: 'interact',
      mood: 'excited'
    });
  };

  const moodColors = {
    happy: "#2C3E50",
    excited: "#E74C3C",
    curious: "#3498DB"
  };

  return (
    <group 
      ref={penguinRef} 
      position={position}
      onClick={handleClick}
    >
      {/* ペンギンの体 - 高品質テクスチャ */}
      <mesh>
        <sphereGeometry args={[0.8, 24, 24]} />
        <meshPhysicalMaterial 
          color={moodColors[mood]}
          metalness={0.1}
          roughness={0.6}
          clearcoat={0.8}
          clearcoatRoughness={0.2}
        />
      </mesh>
      
      {/* お腹 - ふわふわ感 */}
      <mesh position={[0, 0, 0.5]}>
        <sphereGeometry args={[0.55, 20, 20]} />
        <meshPhysicalMaterial 
          color="#FFFEF7"
          metalness={0.0}
          roughness={0.9}
          clearcoat={0.1}
          transmission={0.05}
        />
      </mesh>
      
      {/* 頭 */}
      <mesh position={[0, 0.9, 0]}>
        <sphereGeometry args={[0.6, 20, 20]} />
        <meshPhysicalMaterial 
          color={moodColors[mood]}
          metalness={0.1}
          roughness={0.6}
          clearcoat={0.8}
        />
      </mesh>

      {/* 目 - 表情豊か */}
      <mesh position={[-0.2, 1.1, 0.4]}>
        <sphereGeometry args={[0.12, 12, 12]} />
        <meshPhysicalMaterial 
          color="#FFFFFF"
          metalness={0.1}
          roughness={0.2}
        />
      </mesh>
      <mesh position={[0.2, 1.1, 0.4]}>
        <sphereGeometry args={[0.12, 12, 12]} />
        <meshPhysicalMaterial 
          color="#FFFFFF"
          metalness={0.1}
          roughness={0.2}
        />
      </mesh>
      
      {/* 瞳 */}
      <mesh position={[-0.2, 1.1, 0.5]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
      <mesh position={[0.2, 1.1, 0.5]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshBasicMaterial color="#000000" />
      </mesh>

      {/* くちばし */}
      <mesh position={[0, 0.9, 0.55]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.08, 0.25, 8]} />
        <meshPhysicalMaterial 
          color="#FF8C00"
          metalness={0.3}
          roughness={0.4}
        />
      </mesh>

      {/* 翼 */}
      <mesh position={[-0.7, 0.3, 0]} rotation={[0, 0, -Math.PI / 6]}>
        <sphereGeometry args={[0.3, 12, 12]} />
        <meshPhysicalMaterial 
          color={moodColors[mood]}
          metalness={0.1}
          roughness={0.7}
        />
      </mesh>
      <mesh position={[0.7, 0.3, 0]} rotation={[0, 0, Math.PI / 6]}>
        <sphereGeometry args={[0.3, 12, 12]} />
        <meshPhysicalMaterial 
          color={moodColors[mood]}
          metalness={0.1}
          roughness={0.7}
        />
      </mesh>

      {/* 足 */}
      <mesh position={[-0.3, -0.8, 0.3]}>
        <cylinderGeometry args={[0.12, 0.12, 0.3]} />
        <meshPhysicalMaterial 
          color="#FF8C00"
          metalness={0.2}
          roughness={0.6}
        />
      </mesh>
      <mesh position={[0.3, -0.8, 0.3]}>
        <cylinderGeometry args={[0.12, 0.12, 0.3]} />
        <meshPhysicalMaterial 
          color="#FF8C00"
          metalness={0.2}
          roughness={0.6}
        />
      </mesh>

      {/* ムード表示エフェクト */}
      {mood === 'excited' && (
        <mesh position={[0, 1.8, 0]}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshBasicMaterial 
            color="#FFD700"
            transparent
            opacity={0.8}
          />
        </mesh>
      )}
      
      {/* AI アクティブ時のオーラ */}
      {isAIActive && (
        <mesh>
          <sphereGeometry args={[1.2, 16, 16]} />
          <meshBasicMaterial 
            color="#00FF00"
            transparent
            opacity={0.1}
            side={THREE.BackSide}
          />
        </mesh>
      )}
    </group>
  );
};

// 美しい癒し系ワールドのメインシーン
const GameScene: React.FC = () => {
  const { isConnected, sendPenguinAction } = useSocket();
  const { isAIActive, startAITraining, stopAITraining } = useAI();
  
  const [gameStats, setGameStats] = useState({
    fish: 0,
    yarnBalls: 0,
    score: 0,
    level: 1,
    combo: 0
  });
  
  const [fishItems, setFishItems] = useState<Array<{
    id: string;
    position: [number, number, number];
  }>>([]);
  
  const [yarnItems, setYarnItems] = useState<Array<{
    id: string;
    position: [number, number, number];
  }>>([]);

  const [penguins] = useState([
    { id: 'penguin_1', position: [2, 0, 2] as [number, number, number] },
    { id: 'penguin_2', position: [-2, 0, 2] as [number, number, number] },
    { id: 'penguin_3', position: [2, 0, -2] as [number, number, number] },
    { id: 'penguin_4', position: [-2, 0, -2] as [number, number, number] }
  ]);

  // 高品質アイテム生成システム
  useEffect(() => {
    const spawnItems = () => {
      // 魚生成（レベルに応じて数量調整）
      const maxFish = Math.min(4 + gameStats.level, 12);
      if (fishItems.length < maxFish && Math.random() < 0.7) {
        const newFish = {
          id: `fish_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          position: [
            (Math.random() - 0.5) * 15,
            Math.random() * 4 + 1,
            (Math.random() - 0.5) * 15
          ] as [number, number, number]
        };
        setFishItems(prev => [...prev, newFish]);
        console.log('🐟 美しい魚が出現:', newFish.id);
      }
      
      // 毛糸玉生成（レア度調整）
      const maxYarn = Math.min(2 + Math.floor(gameStats.level / 2), 6);
      if (yarnItems.length < maxYarn && Math.random() < 0.3) {
        const newYarn = {
          id: `yarn_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          position: [
            (Math.random() - 0.5) * 12,
            Math.random() * 3 + 2,
            (Math.random() - 0.5) * 12
          ] as [number, number, number]
        };
        setYarnItems(prev => [...prev, newYarn]);
        console.log('🧶 プレミアム毛糸玉が出現:', newYarn.id);
      }
    };

    const interval = setInterval(spawnItems, 1500);
    return () => clearInterval(interval);
  }, [fishItems.length, yarnItems.length, gameStats.level]);

  // 魚収集処理（コンボシステム付き）
  const collectFish = useCallback((fishId: string) => {
    setFishItems(prev => prev.filter(fish => fish.id !== fishId));
    
    setGameStats(prev => {
      const newCombo = prev.combo + 1;
      const comboBonus = Math.min(newCombo * 2, 50);
      const newScore = prev.score + 10 + comboBonus;
      const newLevel = Math.floor(newScore / 100) + 1;
      
      const newStats = {
        ...prev,
        fish: prev.fish + 1,
        score: newScore,
        level: newLevel,
        combo: newCombo
      };
      
      console.log(`🐟 魚獲得！ コンボ×${newCombo} ボーナス+${comboBonus}`, newStats);
      return newStats;
    });

    // 高品質音響フィードバック
    playSound(800, 1200, 0.15, 'square');
  }, []);

  // 毛糸玉収集処理
  const collectYarnBall = useCallback((yarnId: string) => {
    setYarnItems(prev => prev.filter(yarn => yarn.id !== yarnId));
    
    setGameStats(prev => {
      const comboBonus = prev.combo * 5;
      const newScore = prev.score + 50 + comboBonus;
      const newLevel = Math.floor(newScore / 100) + 1;
      
      const newStats = {
        ...prev,
        yarnBalls: prev.yarnBalls + 1,
        score: newScore,
        level: newLevel,
        combo: prev.combo + 3 // 毛糸玉は大きなコンボボーナス
      };
      
      console.log(`🧶 毛糸玉獲得！ 大コンボ×${newStats.combo}`, newStats);
      return newStats;
    });

    // 特別な音響フィードバック
    playSound(1200, 1800, 0.2, 'sine');
  }, []);

  // 音響システム
  const playSound = (freq1: number, freq2: number, duration: number, type: OscillatorType) => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(freq1, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(freq2, audioContext.currentTime + duration / 2);
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);
    } catch (e) {
      console.log('🎵 音再生に失敗');
    }
  };

  // コンボリセット（時間経過）
  useEffect(() => {
    const resetCombo = setTimeout(() => {
      setGameStats(prev => ({ ...prev, combo: 0 }));
    }, 5000);
    
    return () => clearTimeout(resetCombo);
  }, [gameStats.combo]);

  // グローバル統計公開
  useEffect(() => {
    (window as any).gameStats = {
      ...gameStats,
      fishItems: fishItems.length,
      yarnItems: yarnItems.length,
      isConnected,
      isAIActive
    };
  }, [gameStats, fishItems.length, yarnItems.length, isConnected, isAIActive]);

  return (
    <>
      {/* 高品質照明システム */}
      <ambientLight intensity={0.4} color="#FFF8DC" />
      <directionalLight 
        position={[15, 20, 10]} 
        intensity={1.5} 
        color="#FFE4B5"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />
      <pointLight position={[0, 8, 0]} intensity={1.2} color="#FFB6C1" distance={25} />
      <spotLight 
        position={[10, 15, 10]} 
        angle={Math.PI / 6} 
        penumbra={0.5} 
        intensity={0.8}
        color="#F0E68C"
        castShadow
      />

      {/* 美しい海の床 - 波紋エフェクト付き */}
      <mesh receiveShadow position={[0, -1.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[30, 30, 64, 64]} />
        <meshPhysicalMaterial 
          color="#87CEEB"
          metalness={0.1}
          roughness={0.2}
          transmission={0.9}
          thickness={1.5}
          clearcoat={1.0}
          clearcoatRoughness={0.1}
        />
      </mesh>

      {/* 砂地テクスチャ */}
      <mesh receiveShadow position={[0, -1.8, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[35, 35]} />
        <meshPhysicalMaterial 
          color="#F4A460"
          metalness={0.0}
          roughness={0.9}
        />
      </mesh>

      {/* リアルなペンギンたち */}
      {penguins.map((penguin) => (
        <IntelligentPenguin
          key={penguin.id}
          id={penguin.id}
          position={penguin.position}
        />
      ))}
      
      {/* 美しい魚たち */}
      {fishItems.map((fish) => (
        <RealisticFish
          key={fish.id}
          id={fish.id}
          position={fish.position}
          onCollect={() => collectFish(fish.id)}
        />
      ))}
      
      {/* プレミアム毛糸玉 */}
      {yarnItems.map((yarn) => (
        <PremiumYarnBall
          key={yarn.id}
          id={yarn.id}
          position={yarn.position}
          onCollect={() => collectYarnBall(yarn.id)}
        />
      ))}

      {/* 海中植物 - 世界観演出 */}
      {Array.from({ length: 15 }, (_, i) => (
        <group key={`seaweed_${i}`} position={[
          (Math.random() - 0.5) * 25,
          -1,
          (Math.random() - 0.5) * 25
        ]}>
          <mesh>
            <cylinderGeometry args={[0.05, 0.1, 2 + Math.random() * 3]} />
            <meshPhysicalMaterial 
              color="#228B22"
              metalness={0.0}
              roughness={0.8}
              transmission={0.1}
            />
          </mesh>
        </group>
      ))}

      {/* 浮遊パーティクル - 魔法的雰囲気 */}
      {Array.from({ length: 20 }, (_, i) => (
        <mesh 
          key={`particle_${i}`}
          position={[
            (Math.random() - 0.5) * 30,
            Math.random() * 8 + 2,
            (Math.random() - 0.5) * 30
          ]}
        >
          <sphereGeometry args={[0.03 + Math.random() * 0.02, 8, 8]} />
          <meshBasicMaterial 
            color="#FFD700"
            transparent
            opacity={0.6 + Math.random() * 0.4}
          />
        </mesh>
      ))}

      {/* 虹色の泡 */}
      {Array.from({ length: 10 }, (_, i) => (
        <mesh 
          key={`bubble_${i}`}
          position={[
            (Math.random() - 0.5) * 20,
            Math.random() * 6 + 1,
            (Math.random() - 0.5) * 20
          ]}
        >
          <sphereGeometry args={[0.1 + Math.random() * 0.15, 12, 12]} />
          <meshPhysicalMaterial 
            color="#FFFFFF"
            metalness={0.0}
            roughness={0.0}
            transmission={0.95}
            thickness={0.1}
            clearcoat={1.0}
            transparent
            opacity={0.3}
          />
        </mesh>
      ))}

      {/* 雲 - ふわふわテクスチャ */}
      {Array.from({ length: 5 }, (_, i) => (
        <group key={`cloud_${i}`} position={[
          (Math.random() - 0.5) * 40,
          12 + Math.random() * 4,
          (Math.random() - 0.5) * 40
        ]}>
          <mesh>
            <sphereGeometry args={[2 + Math.random() * 2, 16, 16]} />
            <meshPhysicalMaterial 
              color="#FFFFFF"
              metalness={0.0}
              roughness={0.9}
              transmission={0.1}
              thickness={2.0}
              transparent
              opacity={0.8}
            />
          </mesh>
        </group>
      ))}

      {/* レベルアップエフェクト */}
      {gameStats.level > 1 && (
        <mesh position={[0, 5, 0]}>
          <sphereGeometry args={[gameStats.level * 0.2, 16, 16]} />
          <meshBasicMaterial 
            color="#FFD700"
            transparent
            opacity={0.3}
          />
        </mesh>
      )}
    </>
  );
};

export default GameScene;
