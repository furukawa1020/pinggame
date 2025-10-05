import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSocket } from '../../context/SocketContext';
import { useAI } from '../../context/AIContext';

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
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2 + parseInt(id)) * 0.2;
    }
  });

  const handleClick = useCallback((event: any) => {
    event.stopPropagation();
    onCollect();
  }, [onCollect]);

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onClick={handleClick}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
        onPointerOut={(e) => { e.stopPropagation(); setHovered(false); }}
        scale={hovered ? 1.2 : 1}
      >
        {/* 魚の体（クリック判定を大きく） */}
        <boxGeometry args={[1.2, 0.6, 0.4]} />
        <meshStandardMaterial 
          color={hovered ? "#FFB6C1" : "#FFA07A"} 
          roughness={0.3}
          metalness={0.1}
        />
        
        {/* 魚の尻尾 */}
        <mesh position={[0.5, 0, 0]} rotation={[0, 0, Math.PI / 4]}>
          <coneGeometry args={[0.15, 0.3, 3]} />
          <meshStandardMaterial 
            color={hovered ? "#FF69B4" : "#FF7F50"} 
            roughness={0.3}
            metalness={0.1}
          />
        </mesh>
        
        {/* 魚の目 */}
        <mesh position={[-0.2, 0.1, 0.1]}>
          <sphereGeometry args={[0.05]} />
          <meshStandardMaterial color="#000000" />
        </mesh>
        
        {/* 光る効果 */}
        <mesh position={[0, 0, 0.11]}>
          <planeGeometry args={[0.6, 0.3]} />
          <meshStandardMaterial 
            color="rgba(255,255,255,0.4)" 
            transparent 
            opacity={hovered ? 0.8 : 0.3}
            emissive="#FFE4E1"
            emissiveIntensity={hovered ? 0.3 : 0.1}
          />
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
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 3 + parseInt(id) * 2) * 0.15;
    }
  });

  const handleClick = useCallback((event: any) => {
    event.stopPropagation();
    onCollect();
  }, [onCollect]);

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onClick={handleClick}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
        onPointerOut={(e) => { e.stopPropagation(); setHovered(false); }}
        scale={hovered ? 1.3 : 1}
      >
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial 
          color={hovered ? "#FFD700" : "#FF69B4"} 
          roughness={0.4}
          metalness={0.2}
          emissive="#FFB6C1"
          emissiveIntensity={hovered ? 0.2 : 0.05}
        />
        
        {/* 毛糸の筋 */}
        {Array.from({ length: 6 }, (_, i) => (
          <mesh key={i} rotation={[0, (Math.PI * 2 * i) / 6, 0]} position={[0.25, 0, 0]}>
            <cylinderGeometry args={[0.015, 0.015, 0.5]} />
            <meshStandardMaterial color="#DDA0DD" />
          </mesh>
        ))}
      </mesh>
    </group>
  );
};

// 毛糸ペンギンコンポーネント
const YarnPenguin: React.FC<{ 
  position: [number, number, number];
  aiData?: any;
}> = ({ position, aiData }) => {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const { sendPenguinAction } = useSocket();

  useFrame((state) => {
    if (groupRef.current) {
      // ふわふわアニメーション
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.1;
      groupRef.current.rotation.y += 0.005;
    }
  });

  const handleClick = useCallback(() => {
    sendPenguinAction({
      type: 'pet',
      position: position,
      timestamp: Date.now()
    });
  }, [sendPenguinAction, position]);

  return (
    <group 
      ref={groupRef} 
      position={position}
      onClick={handleClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* ペンギンの体（毛糸風） */}
      <mesh scale={hovered ? 1.1 : 1}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshStandardMaterial 
          color="#2C3E50" 
          roughness={0.7}
          metalness={0.1}
        />
      </mesh>
      
      {/* ペンギンのお腹 */}
      <mesh position={[0, 0, 0.3]} scale={hovered ? 1.1 : 1}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial 
          color="#FFFEF7" 
          roughness={0.6}
          metalness={0.1}
        />
      </mesh>
      
      {/* ペンギンの頭 */}
      <mesh position={[0, 0.6, 0]} scale={hovered ? 1.1 : 1}>
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshStandardMaterial 
          color="#2C3E50" 
          roughness={0.7}
          metalness={0.1}
        />
      </mesh>
      
      {/* くちばし */}
      <mesh position={[0, 0.6, 0.35]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.08, 0.2, 8]} />
        <meshStandardMaterial color="#FFB347" />
      </mesh>
      
      {/* 目 */}
      <mesh position={[-0.15, 0.7, 0.3]}>
        <sphereGeometry args={[0.05]} />
        <meshStandardMaterial color="#FFFFFF" />
      </mesh>
      <mesh position={[0.15, 0.7, 0.3]}>
        <sphereGeometry args={[0.05]} />
        <meshStandardMaterial color="#FFFFFF" />
      </mesh>
      
      {/* 瞳 */}
      <mesh position={[-0.15, 0.7, 0.35]}>
        <sphereGeometry args={[0.02]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
      <mesh position={[0.15, 0.7, 0.35]}>
        <sphereGeometry args={[0.02]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
      
      {/* 翼 */}
      <mesh position={[-0.4, 0.2, 0]} rotation={[0, 0, -0.3]}>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshStandardMaterial color="#2C3E50" />
      </mesh>
      <mesh position={[0.4, 0.2, 0]} rotation={[0, 0, 0.3]}>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshStandardMaterial color="#2C3E50" />
      </mesh>
      
      {/* 足 */}
      <mesh position={[-0.2, -0.5, 0.2]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color="#FFB347" />
      </mesh>
      <mesh position={[0.2, -0.5, 0.2]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color="#FFB347" />
      </mesh>
      
      {/* ハッピーエフェクト */}
      {hovered && (
        <mesh position={[0, 1.2, 0]}>
          <planeGeometry args={[0.3, 0.3]} />
          <meshStandardMaterial 
            color="#FFD700" 
            transparent 
            opacity={0.8}
            emissive="#FFD700"
            emissiveIntensity={0.5}
          />
        </mesh>
      )}
    </group>
  );
};

// メインのゲームシーンコンポーネント
const GameScene: React.FC = () => {
  const [gameStats, setGameStats] = useState({
    fish: 0,
    yarnBalls: 0,
    score: 0
  });
  
  const [fishItems, setFishItems] = useState<Array<{
    id: string;
    position: [number, number, number];
  }>>([]);
  
  const [yarnItems, setYarnItems] = useState<Array<{
    id: string;
    position: [number, number, number];
  }>>([]);
  
  const { connected } = useSocket();
  const { aiData } = useAI();

  // アイテム生成システム
  useEffect(() => {
    const spawnItems = () => {
      // 魚生成（頻度アップ）
      if (fishItems.length < 8 && Math.random() < 0.6) {
        const newFish = {
          id: `fish_${Date.now()}_${Math.random()}`,
          position: [
            (Math.random() - 0.5) * 8,
            Math.random() * 2 + 1,
            (Math.random() - 0.5) * 8
          ] as [number, number, number]
        };
        setFishItems(prev => [...prev, newFish]);
      }
      
      // 毛糸玉生成（レア）
      if (yarnItems.length < 3 && Math.random() < 0.1) {
        const newYarn = {
          id: `yarn_${Date.now()}_${Math.random()}`,
          position: [
            (Math.random() - 0.5) * 8,
            Math.random() * 2 + 1,
            (Math.random() - 0.5) * 8
          ] as [number, number, number]
        };
        setYarnItems(prev => [...prev, newYarn]);
      }
    };

    const interval = setInterval(spawnItems, 2000);
    return () => clearInterval(interval);
  }, [fishItems.length, yarnItems.length]);

  // 魚収集処理
  const collectFish = useCallback((fishId: string) => {
    setFishItems(prev => prev.filter(fish => fish.id !== fishId));
    setGameStats(prev => ({
      ...prev,
      fish: prev.fish + 1,
      score: prev.score + 10
    }));
    
    // 収集成功メッセージ
    console.log(`🐟 魚を獲得しました！ 合計: ${gameStats.fish + 1}匹`);
    
    // 成功音を鳴らす（簡易版）
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
      // 音が鳴らなくても続行
    }
  }, []);

  // 毛糸玉収集処理
  const collectYarnBall = useCallback((yarnId: string) => {
    setYarnItems(prev => prev.filter(yarn => yarn.id !== yarnId));
    setGameStats(prev => ({
      ...prev,
      yarnBalls: prev.yarnBalls + 1,
      score: prev.score + 25
    }));
    
    console.log('🧶 毛糸玉を獲得しました！');
  }, []);

  // 統計をウィンドウオブジェクトに公開（デバッグ用）
  useEffect(() => {
    (window as any).gameStats = gameStats;
  }, [gameStats]);

  return (
    <>
      {/* 環境光 */}
      <ambientLight intensity={0.6} />
      
      {/* 指向性ライト */}
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={1} 
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      
      {/* ポイントライト（暖かみのある光） */}
      <pointLight position={[0, 5, 0]} intensity={0.5} color="#FFE4E1" />
      
      {/* 地面 */}
      <mesh receiveShadow position={[0, -1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial 
          color="#F0E68C" 
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>
      
      {/* 毛糸ペンギンたち */}
      {Array.from({ length: 3 }, (_, i) => (
        <YarnPenguin 
          key={`penguin_${i}`}
          position={[
            Math.cos(i * 2) * 2,
            0,
            Math.sin(i * 2) * 2
          ]}
          aiData={aiData}
        />
      ))}
      
      {/* 魚アイテム */}
      {fishItems.map((fish) => (
        <FishItem
          key={fish.id}
          id={fish.id}
          position={fish.position}
          onCollect={() => collectFish(fish.id)}
        />
      ))}
      
      {/* 毛糸玉アイテム */}
      {yarnItems.map((yarn) => (
        <YarnBallItem
          key={yarn.id}
          id={yarn.id}
          position={yarn.position}
          onCollect={() => collectYarnBall(yarn.id)}
        />
      ))}
      
      {/* ゲーム統計表示用の3Dテキスト */}
      <group position={[0, 4, 0]}>
        <mesh>
          <planeGeometry args={[4, 1]} />
          <meshStandardMaterial 
            color="#FFFFFF" 
            transparent 
            opacity={0.8}
          />
        </mesh>
        {/* ここに3Dテキストを追加可能 */}
      </group>
    </>
  );
};

export default GameScene;

// Fish item component - clickable fish that can be collected
const FishItem: React.FC<{ position: [number, number, number]; onCollect: () => void }> = ({ position, onCollect }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.02;
      meshRef.current.position.y += Math.sin(state.clock.elapsedTime * 2) * 0.01;
    }
  });

  const handleClick = useCallback(() => {
    onCollect();
  }, [onCollect]);

  return (
    <RigidBody type="fixed" position={position}>
      <mesh
        ref={meshRef}
        onClick={handleClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        scale={hovered ? 1.2 : 1}
      >
        {/* Fish body */}
        <boxGeometry args={[0.8, 0.4, 0.2]} />
        <meshStandardMaterial 
          color={hovered ? "#FFB6C1" : "#FFA07A"} 
          roughness={0.3}
          metalness={0.1}
        />
        
        {/* Fish tail */}
        <mesh position={[0.5, 0, 0]}>
          <coneGeometry args={[0.15, 0.3, 3]} />
          <meshStandardMaterial 
            color={hovered ? "#FF69B4" : "#FF7F50"} 
            roughness={0.3}
            metalness={0.1}
          />
        </mesh>
        
        {/* Fish eye */}
        <mesh position={[-0.2, 0.1, 0.1]}>
          <sphereGeometry args={[0.05]} />
          <meshStandardMaterial color="#000000" />
        </mesh>
        
        {/* Yarn texture effect */}
        <mesh position={[0, 0, 0.11]}>
          <planeGeometry args={[0.6, 0.3]} />
          <meshStandardMaterial 
            color="rgba(255,255,255,0.3)" 
            transparent 
            opacity={0.5}
          />
        </mesh>
      </mesh>
    </RigidBody>
  );
};

// Yarn ball item component
const YarnBallItem: React.FC<{ position: [number, number, number]; onCollect: () => void }> = ({ position, onCollect }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.01;
      meshRef.current.rotation.y += 0.02;
      meshRef.current.position.y += Math.sin(state.clock.elapsedTime * 3 + 1) * 0.015;
    }
  });

  const handleClick = useCallback(() => {
    onCollect();
  }, [onCollect]);

  return (
    <RigidBody type="fixed" position={position}>
      <mesh
        ref={meshRef}
        onClick={handleClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        scale={hovered ? 1.3 : 1}
      >
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial 
          color={hovered ? "#FFD700" : "#FF69B4"} 
          roughness={0.4}
          metalness={0.2}
        />
        
        {/* Yarn strands */}
        {Array.from({ length: 8 }, (_, i) => (
          <mesh key={i} rotation={[0, (Math.PI * 2 * i) / 8, 0]} position={[0.25, 0, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 0.6]} />
            <meshStandardMaterial color="#DDA0DD" />
          </mesh>
        ))}
      </mesh>
    </RigidBody>
  );
};

// 毛糸ペンギンコンポーネント
const YarnPenguin: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  const { sendPenguinAction } = useSocket();
  const { getAIDecision } = useAI();

  const [ref, api] = useBox(() => ({
    mass: 1,
    position,
    args: [1, 1.5, 1]
  }));

  useFrame((state, delta) => {
    if (meshRef.current) {
      // ぽよぽよアニメーション
      meshRef.current.rotation.y += delta * 0.5;
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.1;
      
      // AI決定によるランダム移動
      if (Math.random() < 0.01) {
        const inputs = [
          Math.random(), Math.random(), Math.random(), Math.random(),
          Math.random(), Math.random(), Math.random(), Math.random()
        ];
        const aiOutput = getAIDecision(inputs);
        
        // AI出力に基づいて移動
        const moveX = (aiOutput[0] - 0.5) * 2;
        const moveZ = (aiOutput[1] - 0.5) * 2;
        api.velocity.set(moveX, 0, moveZ);
        
        sendPenguinAction({
          type: 'ai_move',
          x: moveX,
          z: moveZ,
          aiOutput
        });
      }
    }
  });

  const handleClick = () => {
    setClicked(!clicked);
    api.velocity.set(
      (Math.random() - 0.5) * 10,
      5,
      (Math.random() - 0.5) * 10
    );
  };

  return (
    <group ref={ref} onClick={handleClick}>
      {/* ペンギンの体 */}
      <mesh
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        scale={hovered ? 1.2 : 1}
      >
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshStandardMaterial 
          color={clicked ? "#FF69B4" : "#2C3E50"}
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>
      
      {/* ペンギンの頭 */}
      <mesh position={[0, 0.7, 0]}>
        <sphereGeometry args={[0.35, 12, 12]} />
        <meshStandardMaterial color="#2C3E50" />
      </mesh>
      
      {/* くちばし */}
      <mesh position={[0, 0.6, 0.3]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.1, 0.3, 8]} />
        <meshStandardMaterial color="#FFB347" />
      </mesh>
      
      {/* 目 */}
      <mesh position={[-0.15, 0.8, 0.25]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial color="#FFFFFF" />
      </mesh>
      <mesh position={[0.15, 0.8, 0.25]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial color="#FFFFFF" />
      </mesh>
      
      {/* 瞳 */}
      <mesh position={[-0.15, 0.82, 0.32]}>
        <sphereGeometry args={[0.04, 6, 6]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
      <mesh position={[0.15, 0.82, 0.32]}>
        <sphereGeometry args={[0.04, 6, 6]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
      
      {/* 足 */}
      <mesh position={[-0.2, -0.8, 0]}>
        <boxGeometry args={[0.15, 0.1, 0.3]} />
        <meshStandardMaterial color="#FFB347" />
      </mesh>
      <mesh position={[0.2, -0.8, 0]}>
        <boxGeometry args={[0.15, 0.1, 0.3]} />
        <meshStandardMaterial color="#FFB347" />
      </mesh>
      
      {/* 毛糸エフェクト */}
      {clicked && (
        <Sphere args={[0.8]} position={[0, 0, 0]}>
          <meshBasicMaterial color="#FF69B4" transparent opacity={0.3} />
        </Sphere>
      )}
    </group>
  );
};

// 毛糸ボールアイテム
const YarnBall: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  const [ref] = useBox(() => ({
    mass: 0.5,
    position,
    args: [0.3, 0.3, 0.3]
  }));

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.7;
    }
  });

  return (
    <mesh ref={ref}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.3, 12, 12]} />
        <meshStandardMaterial 
          color="#FFD700"
          roughness={0.6}
          metalness={0.1}
        />
      </mesh>
    </mesh>
  );
};

// 魚アイテム
const Fish: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  const [ref] = useBox(() => ({
    mass: 0.2,
    position,
    args: [0.4, 0.2, 0.1]
  }));

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y += Math.sin(state.clock.elapsedTime * 3) * 0.01;
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 2) * 0.2;
    }
  });

  return (
    <mesh ref={ref}>
      <mesh ref={meshRef}>
        <boxGeometry args={[0.4, 0.2, 0.1]} />
        <meshStandardMaterial 
          color="#87CEEB"
          roughness={0.4}
          metalness={0.3}
        />
      </mesh>
    </mesh>
  );
};

// メインゲームシーン
export const GameScene: React.FC = () => {
  const { isConnected } = useSocket();
  const [penguins, setPenguins] = useState<Array<{ id: string, position: [number, number, number] }>>([
    { id: '1', position: [0, 2, 0] },
    { id: '2', position: [3, 2, 3] },
    { id: '3', position: [-3, 2, -3] }
  ]);

  // 地面
  const [groundRef] = usePlane(() => ({
    rotation: [-Math.PI / 2, 0, 0],
    position: [0, 0, 0]
  }));

  // 壁
  const [wallRef1] = usePlane(() => ({
    rotation: [0, 0, 0],
    position: [0, 5, -10]
  }));

  const [wallRef2] = usePlane(() => ({
    rotation: [0, Math.PI, 0],
    position: [0, 5, 10]
  }));

  const [wallRef3] = usePlane(() => ({
    rotation: [0, Math.PI / 2, 0],
    position: [-10, 5, 0]
  }));

  const [wallRef4] = usePlane(() => ({
    rotation: [0, -Math.PI / 2, 0],
    position: [10, 5, 0]
  }));

  return (
    <group>
      {/* 地面 */}
      <mesh ref={groundRef} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial 
          color="#F0F8FF"
          roughness={0.8}
        />
      </mesh>

      {/* 壁（透明） */}
      <mesh ref={wallRef1}>
        <planeGeometry args={[20, 10]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
      <mesh ref={wallRef2}>
        <planeGeometry args={[20, 10]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
      <mesh ref={wallRef3}>
        <planeGeometry args={[20, 10]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
      <mesh ref={wallRef4}>
        <planeGeometry args={[20, 10]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* ペンギンたち */}
      {penguins.map(penguin => (
        <YarnPenguin 
          key={penguin.id} 
          position={penguin.position} 
        />
      ))}

      {/* 毛糸ボール */}
      <YarnBall position={[2, 1, 2]} />
      <YarnBall position={[-2, 1, -2]} />
      <YarnBall position={[4, 1, -4]} />

      {/* 魚 */}
      <Fish position={[1, 0.5, 1]} />
      <Fish position={[-1, 0.5, -1]} />
      <Fish position={[3, 0.5, -1]} />
      <Fish position={[-3, 0.5, 2]} />

      {/* タイトルテキスト */}
      <Text
        position={[0, 8, -5]}
        fontSize={1.5}
        color="#8B4513"
        anchorX="center"
        anchorY="middle"
        font="/fonts/nunito-bold.woff"
      >
        🧶 Yarn Penguin AI World 🧶
      </Text>

      {/* 接続状態表示 */}
      <Text
        position={[0, 6, -5]}
        fontSize={0.8}
        color={isConnected ? "#28a745" : "#dc3545"}
        anchorX="center"
        anchorY="middle"
      >
        {isConnected ? "🟢 Connected to Server" : "🔴 Disconnected"}
      </Text>

      {/* 装飾オブジェクト */}
      <Box position={[7, 1, 7]} args={[1, 2, 1]}>
        <meshStandardMaterial color="#D2691E" />
      </Box>
      <Box position={[-7, 1, -7]} args={[1, 2, 1]}>
        <meshStandardMaterial color="#CD853F" />
      </Box>
    </group>
  );
};