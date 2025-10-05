import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useSocket } from '../../context/SocketContext';
import { useAI } from '../../context/AIContext';
import * as THREE from 'three';

// 美しい毛糸テクスチャ作成関数
const createYarnMaterial = (baseColor: string, roughness = 0.8, metalness = 0.1) => {
  const material = new THREE.MeshStandardMaterial({
    color: baseColor,
    roughness,
    metalness,
    bumpScale: 0.8,
    normalScale: new THREE.Vector2(1, 1),
  });

  // 毛糸の繊維テクスチャを動的に生成
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // ベースカラーを設定
    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, 512, 512);

    // 毛糸の繊維パターンを描画
    ctx.globalCompositeOperation = 'overlay';
    
    // 横糸のパターン
    for (let y = 0; y < 512; y += 4) {
      ctx.beginPath();
      ctx.strokeStyle = `rgba(255, 255, 255, ${Math.random() * 0.4 + 0.1})`;
      ctx.lineWidth = Math.random() * 3 + 1;
      ctx.moveTo(0, y + Math.sin(y * 0.1) * 2);
      ctx.lineTo(512, y + Math.sin(y * 0.1) * 2);
      ctx.stroke();
    }
    
    // 縦糸のパターン
    for (let x = 0; x < 512; x += 4) {
      ctx.beginPath();
      ctx.strokeStyle = `rgba(255, 255, 255, ${Math.random() * 0.3 + 0.1})`;
      ctx.lineWidth = Math.random() * 2 + 1;
      ctx.moveTo(x + Math.cos(x * 0.1) * 2, 0);
      ctx.lineTo(x + Math.cos(x * 0.1) * 2, 512);
      ctx.stroke();
    }

    // 毛糸の結び目やほつれを表現
    for (let i = 0; i < 200; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const size = Math.random() * 6 + 2;
      
      ctx.beginPath();
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.5 + 0.2})`;
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(3, 3);
    texture.needsUpdate = true;

    material.map = texture;
    material.bumpMap = texture;
    material.normalMap = texture;
  }

  return material;
};

// 水中パーティクルエフェクト
const WaterParticles: React.FC = () => {
  const particlesRef = useRef<THREE.Points>(null);

  useFrame((state) => {
    if (particlesRef.current) {
      const time = state.clock.elapsedTime;
      particlesRef.current.rotation.y = time * 0.02;
      
      // パーティクルの上昇効果
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 1; i < positions.length; i += 3) {
        positions[i] += 0.01;
        if (positions[i] > 10) positions[i] = -2;
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  const particleCount = 100;
  const positions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      pos[i] = (Math.random() - 0.5) * 30;     // x
      pos[i + 1] = Math.random() * 15 - 2;     // y
      pos[i + 2] = (Math.random() - 0.5) * 30; // z
    }
    return pos;
  }, []);

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.1} color="#87CEEB" transparent opacity={0.6} />
    </points>
  );
};

// 美しいリアルな魚コンポーネント
const EnchantedFish: React.FC<{
  position: [number, number, number];
  onCollect: () => void;
  id: string;
}> = ({ position, onCollect, id }) => {
  const fishRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const [collected, setCollected] = useState(false);
  const [ripples, setRipples] = useState<Array<{id: string, time: number}>>([]);

  const fishMaterial = useMemo(() => 
    createYarnMaterial(hovered ? "#FF69B4" : "#FF6347", 0.3, 0.2), [hovered]
  );
  
  const finMaterial = useMemo(() => 
    createYarnMaterial("#FFB347", 0.5, 0.1), []
  );

  useFrame((state) => {
    if (fishRef.current && !collected) {
      const time = state.clock.elapsedTime;
      
      // 優雅で自然な泳ぎアニメーション
      fishRef.current.position.x = position[0] + Math.sin(time * 0.8 + position[0]) * 0.4;
      fishRef.current.position.y = position[1] + Math.sin(time * 1.2 + position[1]) * 0.3;
      fishRef.current.position.z = position[2] + Math.cos(time * 0.6 + position[2]) * 0.3;
      
      // 魚の向きを泳ぐ方向に合わせる
      fishRef.current.rotation.y = Math.sin(time * 0.8) * 0.5;
      fishRef.current.rotation.x = Math.sin(time * 1.5) * 0.2;
      fishRef.current.rotation.z = Math.sin(time * 2) * 0.1;
      
      // ひれのアニメーション
      fishRef.current.children.forEach((child, index) => {
        if (child.name.includes('fin')) {
          child.rotation.z = Math.sin(time * 5 + index) * 0.4;
          child.rotation.x = Math.sin(time * 3 + index) * 0.2;
        }
        if (child.name === 'tail') {
          child.rotation.y = Math.sin(time * 4) * 0.6;
        }
      });
    }
  });

  const handleClick = useCallback(() => {
    if (!collected) {
      setCollected(true);
      
      // 美しい収集エフェクト
      setRipples(prev => [...prev, { id: `ripple_${Date.now()}`, time: 0 }]);
      
      // 魚の消失アニメーション
      if (fishRef.current) {
        const disappear = () => {
          const startTime = Date.now();
          const animate = () => {
            const elapsed = (Date.now() - startTime) / 800;
            const progress = Math.min(elapsed, 1);
            
            if (fishRef.current) {
              fishRef.current.scale.setScalar(1 - progress);
              fishRef.current.rotation.y += 0.2;
              fishRef.current.position.y += progress * 2;
            }
            
            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              onCollect();
            }
          };
          animate();
        };
        disappear();
      }
    }
  }, [collected, onCollect]);

  if (collected) return null;

  return (
    <group>
      <group 
        ref={fishRef}
        position={position}
        onClick={handleClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        scale={hovered ? 1.3 : 1}
      >
        {/* 魚の主体部分 */}
        <mesh>
          <sphereGeometry args={[0.7, 16, 12]} />
          <primitive object={fishMaterial} />
        </mesh>
        
        {/* 魚の頭部 */}
        <mesh position={[-0.5, 0, 0]}>
          <sphereGeometry args={[0.5, 12, 10]} />
          <primitive object={fishMaterial} />
        </mesh>
        
        {/* 尻尾 */}
        <mesh position={[1.0, 0, 0]} rotation={[0, 0, Math.PI / 6]} name="tail">
          <coneGeometry args={[0.5, 1.2, 8]} />
          <primitive object={createYarnMaterial("#FF4500", 0.4, 0.1)} />
        </mesh>
        
        {/* 背ひれ */}
        <mesh position={[0, 0.6, 0]} rotation={[0, 0, 0]} name="dorsal-fin">
          <coneGeometry args={[0.2, 0.6, 6]} />
          <primitive object={finMaterial} />
        </mesh>
        
        {/* 胸ひれ */}
        <mesh position={[0.2, 0, 0.5]} rotation={[Math.PI / 2, 0, Math.PI / 4]} name="pectoral-fin-1">
          <coneGeometry args={[0.15, 0.4, 5]} />
          <primitive object={finMaterial} />
        </mesh>
        <mesh position={[0.2, 0, -0.5]} rotation={[-Math.PI / 2, 0, -Math.PI / 4]} name="pectoral-fin-2">
          <coneGeometry args={[0.15, 0.4, 5]} />
          <primitive object={finMaterial} />
        </mesh>
        
        {/* 腹ひれ */}
        <mesh position={[0.1, -0.4, 0.2]} rotation={[Math.PI / 3, 0, 0]} name="ventral-fin-1">
          <coneGeometry args={[0.1, 0.3, 4]} />
          <primitive object={finMaterial} />
        </mesh>
        <mesh position={[0.1, -0.4, -0.2]} rotation={[-Math.PI / 3, 0, 0]} name="ventral-fin-2">
          <coneGeometry args={[0.1, 0.3, 4]} />
          <primitive object={finMaterial} />
        </mesh>
        
        {/* 目 */}
        <mesh position={[-0.7, 0.2, 0.2]}>
          <sphereGeometry args={[0.12]} />
          <meshStandardMaterial color="#FFFFFF" />
        </mesh>
        <mesh position={[-0.7, 0.2, -0.2]}>
          <sphereGeometry args={[0.12]} />
          <meshStandardMaterial color="#FFFFFF" />
        </mesh>
        
        {/* 瞳 */}
        <mesh position={[-0.75, 0.22, 0.22]}>
          <sphereGeometry args={[0.06]} />
          <meshStandardMaterial color="#000000" emissive="#333333" />
        </mesh>
        <mesh position={[-0.75, 0.22, -0.18]}>
          <sphereGeometry args={[0.06]} />
          <meshStandardMaterial color="#000000" emissive="#333333" />
        </mesh>
        
        {/* 瞳のハイライト */}
        <mesh position={[-0.78, 0.24, 0.24]}>
          <sphereGeometry args={[0.02]} />
          <meshStandardMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={0.8} />
        </mesh>
        <mesh position={[-0.78, 0.24, -0.16]}>
          <sphereGeometry args={[0.02]} />
          <meshStandardMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={0.8} />
        </mesh>
      </group>
      
      {/* 水の波紋エフェクト */}
      {ripples.map((ripple) => (
        <WaterRipple key={ripple.id} position={position} onComplete={() => {
          setRipples(prev => prev.filter(r => r.id !== ripple.id));
        }} />
      ))}
    </group>
  );
};

// 水の波紋エフェクト
const WaterRipple: React.FC<{
  position: [number, number, number];
  onComplete: () => void;
}> = ({ position, onComplete }) => {
  const rippleRef = useRef<THREE.Mesh>(null);
  const startTime = useRef(Date.now());

  useFrame(() => {
    if (rippleRef.current) {
      const elapsed = (Date.now() - startTime.current) / 1000;
      const scale = 1 + elapsed * 4;
      const opacity = Math.max(0, 1 - elapsed);
      
      rippleRef.current.scale.set(scale, 1, scale);
      (rippleRef.current.material as THREE.MeshStandardMaterial).opacity = opacity;
      
      if (opacity <= 0) {
        onComplete();
      }
    }
  });

  return (
    <mesh ref={rippleRef} position={[position[0], position[1] - 0.8, position[2]]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.3, 0.8, 32]} />
      <meshStandardMaterial color="#40E0D0" transparent opacity={0.8} emissive="#40E0D0" emissiveIntensity={0.2} />
    </mesh>
  );
};

// 美しい毛糸玉コンポーネント
const MagicalYarnBall: React.FC<{
  position: [number, number, number];
  onCollect: () => void;
  id: string;
}> = ({ position, onCollect, id }) => {
  const yarnRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const [collected, setCollected] = useState(false);

  const yarnMaterial = useMemo(() => 
    createYarnMaterial(hovered ? "#FFD700" : "#FF69B4", 0.9, 0.0), [hovered]
  );

  useFrame((state) => {
    if (yarnRef.current && !collected) {
      const time = state.clock.elapsedTime;
      
      // 毛糸玉の回転アニメーション
      yarnRef.current.rotation.x += 0.02;
      yarnRef.current.rotation.y += 0.025;
      yarnRef.current.rotation.z += 0.015;
      
      // 浮遊アニメーション
      yarnRef.current.position.y = position[1] + Math.sin(time * 2.5 + position[0]) * 0.4;
      
      // キラキラエフェクト
      yarnRef.current.children.forEach((child, index) => {
        if (child.name === 'sparkle') {
          child.rotation.z = time * (index + 1) * 0.5;
          const intensity = 0.4 + Math.sin(time * 4 + index) * 0.3;
          (child as THREE.Mesh).material = new THREE.MeshStandardMaterial({
            color: "#FFFFFF",
            emissive: "#FFFF99",
            emissiveIntensity: intensity
          });
        }
      });
    }
  });

  const handleClick = useCallback(() => {
    if (!collected) {
      setCollected(true);
      
      // 魔法的な収集エフェクト
      if (yarnRef.current) {
        const magicDisappear = () => {
          const startTime = Date.now();
          const animate = () => {
            const elapsed = (Date.now() - startTime) / 600;
            const progress = Math.min(elapsed, 1);
            
            if (yarnRef.current) {
              const scale = 1 + progress * 0.5; // 少し大きくなってから消える
              yarnRef.current.scale.setScalar(scale * (1 - progress));
              yarnRef.current.rotation.y += 0.3;
              yarnRef.current.position.y += progress * 3;
            }
            
            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              onCollect();
            }
          };
          animate();
        };
        magicDisappear();
      }
    }
  }, [collected, onCollect]);

  if (collected) return null;

  return (
    <group 
      ref={yarnRef}
      position={position}
      onClick={handleClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      scale={hovered ? 1.4 : 1}
    >
      {/* 毛糸玉本体 */}
      <mesh>
        <sphereGeometry args={[0.5, 20, 20]} />
        <primitive object={yarnMaterial} />
      </mesh>
      
      {/* 毛糸の巻き模様 */}
      {Array.from({ length: 12 }, (_, i) => (
        <mesh key={i} rotation={[i * 0.4, i * 0.6, i * 0.3]}>
          <torusGeometry args={[0.42, 0.03, 8, 20]} />
          <primitive object={createYarnMaterial("#FFFFFF", 0.8, 0.0)} />
        </mesh>
      ))}
      
      {/* キラキラエフェクト */}
      {Array.from({ length: 6 }, (_, i) => (
        <mesh 
          key={i} 
          name="sparkle"
          position={[
            Math.sin(i * Math.PI / 3) * 0.8,
            Math.cos(i * Math.PI / 3) * 0.8,
            Math.sin(i * Math.PI / 4) * 0.8
          ]}
        >
          <octahedronGeometry args={[0.06]} />
          <meshStandardMaterial 
            color="#FFFFFF" 
            emissive="#FFFF99" 
            emissiveIntensity={0.6}
            transparent
            opacity={0.9}
          />
        </mesh>
      ))}
      
      {/* 魔法のオーラ */}
      <mesh>
        <sphereGeometry args={[0.7, 16, 16]} />
        <meshStandardMaterial 
          color="#FF69B4" 
          transparent 
          opacity={0.1}
          emissive="#FF69B4"
          emissiveIntensity={0.2}
        />
      </mesh>
    </group>
  );
};

// 知的ペンギン（AI制御・リアルな動きと反応）
const IntelligentPenguin: React.FC<{
  position: [number, number, number];
  id: string;
}> = ({ position, id }) => {
  const penguinRef = useRef<THREE.Group>(null);
  const [currentPos, setCurrentPos] = useState(position);
  const [targetPos, setTargetPos] = useState(position);
  const [isMoving, setIsMoving] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [mood, setMood] = useState<'happy' | 'excited' | 'curious' | 'playful'>('happy');
  
  const { sendPenguinAction } = useSocket();
  const { isAIActive } = useAI();

  const penguinBodyMaterial = useMemo(() => createYarnMaterial("#2C3E50", 0.7, 0.1), []);
  const penguinBellyMaterial = useMemo(() => createYarnMaterial("#FFFEF7", 0.6, 0.0), []);
  const penguinBeakMaterial = useMemo(() => createYarnMaterial("#FF8C00", 0.4, 0.2), []);

  useFrame((state) => {
    if (penguinRef.current) {
      const time = state.clock.elapsedTime;
      
      // AI制御による知的な行動
      if (isAIActive && !isMoving) {
        // より自然な移動頻度（2%の確率）
        if (Math.random() < 0.02) {
          const newTarget: [number, number, number] = [
            (Math.random() - 0.5) * 12,
            0,
            (Math.random() - 0.5) * 12
          ];
          setTargetPos(newTarget);
          setIsMoving(true);
          
          // 気分をランダムに変更
          const moods: Array<'happy' | 'excited' | 'curious' | 'playful'> = ['happy', 'excited', 'curious', 'playful'];
          setMood(moods[Math.floor(Math.random() * moods.length)]);
          
          sendPenguinAction({
            type: 'ai_auto_move',
            position: newTarget,
            mood: mood,
            timestamp: Date.now()
          });
        }
      }
      
      // スムーズで自然な移動
      if (isMoving) {
        const speed = 0.04;
        const dx = targetPos[0] - currentPos[0];
        const dz = targetPos[2] - currentPos[2];
        const distance = Math.sqrt(dx * dx + dz * dz);
        
        if (distance > 0.15) {
          setCurrentPos(prev => [
            prev[0] + dx * speed,
            prev[1],
            prev[2] + dz * speed
          ]);
          
          // 移動方向を向く（自然な回転）
          const targetRotation = Math.atan2(dz, dx);
          if (penguinRef.current) {
            penguinRef.current.rotation.y += (targetRotation - penguinRef.current.rotation.y) * 0.1;
          }
        } else {
          setIsMoving(false);
        }
      }
      
      // ペンギンの位置と自然なアニメーション
      penguinRef.current.position.set(currentPos[0], currentPos[1], currentPos[2]);
      penguinRef.current.position.y += Math.sin(time * 2 + currentPos[0]) * 0.08;
      
      // 気分に応じたアニメーション
      if (mood === 'excited') {
        penguinRef.current.position.y += Math.sin(time * 6) * 0.1;
      }
      
      // 歩行アニメーション
      if (isMoving) {
        penguinRef.current.rotation.z = Math.sin(time * 8) * 0.15;
        
        // 足の動き
        penguinRef.current.children.forEach((child, index) => {
          if (child.name === 'foot') {
            child.rotation.x = Math.sin(time * 8 + index * Math.PI) * 0.4;
          }
          if (child.name === 'wing') {
            child.rotation.z = Math.sin(time * 6 + index * Math.PI) * 0.3;
          }
        });
      }
      
      // 瞬き
      if (Math.random() < 0.005) {
        penguinRef.current.children.forEach(child => {
          if (child.name === 'eye') {
            child.scale.y = 0.1;
            setTimeout(() => {
              if (child.scale) child.scale.y = 1;
            }, 100);
          }
        });
      }
    }
  });

  const handleClick = useCallback(() => {
    // クリックで新しい場所へ移動
    const newTarget: [number, number, number] = [
      (Math.random() - 0.5) * 15,
      0,
      (Math.random() - 0.5) * 15
    ];
    setTargetPos(newTarget);
    setIsMoving(true);
    setMood('excited');
    
    sendPenguinAction({
      type: 'user_click_move',
      position: newTarget,
      mood: 'excited',
      timestamp: Date.now()
    });
  }, [sendPenguinAction]);

  return (
    <group 
      ref={penguinRef}
      position={currentPos}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={handleClick}
      scale={hovered ? 1.2 : 1}
    >
      {/* ペンギンの体 */}
      <mesh>
        <sphereGeometry args={[0.8, 20, 20]} />
        <primitive object={penguinBodyMaterial} />
      </mesh>
      
      {/* ペンギンのお腹 */}
      <mesh position={[0, 0, 0.6]}>
        <sphereGeometry args={[0.6, 16, 16]} />
        <primitive object={penguinBellyMaterial} />
      </mesh>
      
      {/* ペンギンの頭 */}
      <mesh position={[0, 0.9, 0]}>
        <sphereGeometry args={[0.6, 16, 16]} />
        <primitive object={penguinBodyMaterial} />
      </mesh>
      
      {/* 目 */}
      <mesh position={[-0.2, 1.1, 0.4]} name="eye">
        <sphereGeometry args={[0.1]} />
        <meshStandardMaterial color="#FFFFFF" />
      </mesh>
      <mesh position={[0.2, 1.1, 0.4]} name="eye">
        <sphereGeometry args={[0.1]} />
        <meshStandardMaterial color="#FFFFFF" />
      </mesh>
      
      {/* 瞳 */}
      <mesh position={[-0.18, 1.12, 0.48]}>
        <sphereGeometry args={[0.05]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
      <mesh position={[0.22, 1.12, 0.48]}>
        <sphereGeometry args={[0.05]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
      
      {/* 瞳のハイライト */}
      <mesh position={[-0.16, 1.14, 0.50]}>
        <sphereGeometry args={[0.02]} />
        <meshStandardMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={0.8} />
      </mesh>
      <mesh position={[0.24, 1.14, 0.50]}>
        <sphereGeometry args={[0.02]} />
        <meshStandardMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={0.8} />
      </mesh>
      
      {/* くちばし */}
      <mesh position={[0, 1.0, 0.55]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.08, 0.2, 6]} />
        <primitive object={penguinBeakMaterial} />
      </mesh>
      
      {/* 翼 */}
      <mesh position={[-0.7, 0.3, 0]} rotation={[0, 0, -0.3]} name="wing">
        <sphereGeometry args={[0.35, 12, 12]} />
        <primitive object={penguinBodyMaterial} />
      </mesh>
      <mesh position={[0.7, 0.3, 0]} rotation={[0, 0, 0.3]} name="wing">
        <sphereGeometry args={[0.35, 12, 12]} />
        <primitive object={penguinBodyMaterial} />
      </mesh>
      
      {/* 足 */}
      <mesh position={[-0.2, -0.8, 0.3]} name="foot">
        <sphereGeometry args={[0.15, 10, 8]} />
        <primitive object={penguinBeakMaterial} />
      </mesh>
      <mesh position={[0.2, -0.8, 0.3]} name="foot">
        <sphereGeometry args={[0.15, 10, 8]} />
        <primitive object={penguinBeakMaterial} />
      </mesh>
      
      {/* AI状態表示（動的な色変化） */}
      {isAIActive && (
        <mesh position={[0, 1.6, 0]}>
          <sphereGeometry args={[0.12]} />
          <meshStandardMaterial 
            color={mood === 'excited' ? "#FF69B4" : mood === 'happy' ? "#00FF7F" : mood === 'curious' ? "#00BFFF" : "#FFD700"} 
            emissive={mood === 'excited' ? "#FF69B4" : mood === 'happy' ? "#00FF7F" : mood === 'curious' ? "#00BFFF" : "#FFD700"} 
            emissiveIntensity={0.6}
            transparent
            opacity={0.8}
          />
        </mesh>
      )}
      
      {/* 気分インジケーター */}
      {mood === 'excited' && (
        <mesh position={[0, 1.8, 0]}>
          <octahedronGeometry args={[0.08]} />
          <meshStandardMaterial color="#FF1493" emissive="#FF1493" emissiveIntensity={0.8} />
        </mesh>
      )}
    </group>
  );
};

// メインシーンコンポーネント
const GameScene: React.FC = () => {
  const [score, setScore] = useState(0);
  const [penguins, setPenguins] = useState([
    { id: 'penguin1', position: [-2, 0, 2] as [number, number, number] },
    { id: 'penguin2', position: [3, 0, -1] as [number, number, number] },
    { id: 'penguin3', position: [-1, 0, -3] as [number, number, number] },
  ]);
  
  const [fishes, setFishes] = useState([
    { id: 'fish1', position: [2, 1, 2] as [number, number, number] },
    { id: 'fish2', position: [-3, 2, -1] as [number, number, number] },
    { id: 'fish3', position: [1, 1.5, -4] as [number, number, number] },
    { id: 'fish4', position: [4, 2.5, 3] as [number, number, number] },
    { id: 'fish5', position: [-2, 3, 4] as [number, number, number] },
  ]);
  
  const [yarnBalls, setYarnBalls] = useState([
    { id: 'yarn1', position: [5, 2, 1] as [number, number, number] },
    { id: 'yarn2', position: [-4, 1.5, 3] as [number, number, number] },
    { id: 'yarn3', position: [2, 3, -2] as [number, number, number] },
  ]);
  
  const [cameraPosition, setCameraPosition] = useState<[number, number, number]>([0, 8, 12]);
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  
  const { sendGameEvent } = useSocket();
  const { trainAI, isAIActive } = useAI();

  // 美しい海底環境の作成
  const createSeabedMaterial = useMemo(() => {
    return createYarnMaterial("#D2B48C", 0.9, 0.2);
  }, []);

  const createCoralMaterial = useMemo(() => {
    return createYarnMaterial("#FF6347", 0.6, 0.3);
  }, []);

  const createWaterMaterial = useMemo(() => {
    const material = new THREE.MeshStandardMaterial({
      color: "#006994",
      transparent: true,
      opacity: 0.4,
      roughness: 0.1,
      metalness: 0.2,
    });
    return material;
  }, []);

  // 魚を集めたときの処理
  const handleFishCollect = useCallback((fishId: string) => {
    setFishes(prev => prev.filter(fish => fish.id !== fishId));
    setScore(prev => prev + 10);
    
    sendGameEvent({
      type: 'fish_collected',
      fishId,
      score: score + 10,
      timestamp: Date.now()
    });

    // AIに学習データを送信
    trainAI({
      action: 'fish_collect',
      reward: 10,
      context: { fishId, currentScore: score + 10 },
      timestamp: Date.now()
    });

    // 新しい魚をランダムに生成
    setTimeout(() => {
      const newFish = {
        id: `fish_${Date.now()}`,
        position: [
          (Math.random() - 0.5) * 12,
          Math.random() * 4 + 1,
          (Math.random() - 0.5) * 12
        ] as [number, number, number]
      };
      setFishes(prev => [...prev, newFish]);
    }, 2000);
  }, [score, sendGameEvent, trainAI]);

  // 毛糸玉を集めたときの処理
  const handleYarnCollect = useCallback((yarnId: string) => {
    setYarnBalls(prev => prev.filter(yarn => yarn.id !== yarnId));
    setScore(prev => prev + 25);
    
    sendGameEvent({
      type: 'yarn_collected',
      yarnId,
      score: score + 25,
      timestamp: Date.now()
    });

    // AIに高報酬の学習データを送信
    trainAI({
      action: 'yarn_collect',
      reward: 25,
      context: { yarnId, currentScore: score + 25 },
      timestamp: Date.now()
    });

    // 新しい毛糸玉をランダムに生成
    setTimeout(() => {
      const newYarn = {
        id: `yarn_${Date.now()}`,
        position: [
          (Math.random() - 0.5) * 10,
          Math.random() * 3 + 1.5,
          (Math.random() - 0.5) * 10
        ] as [number, number, number]
      };
      setYarnBalls(prev => [...prev, newYarn]);
    }, 5000);
  }, [score, sendGameEvent, trainAI]);

  // カメラの動的制御
  useFrame((state) => {
    if (cameraRef.current) {
      const time = state.clock.elapsedTime;
      
      // カメラの自然な揺らぎ
      cameraRef.current.position.x = Math.sin(time * 0.2) * 2;
      cameraRef.current.position.y = 8 + Math.sin(time * 0.3) * 1;
      cameraRef.current.position.z = 12 + Math.sin(time * 0.1) * 1;
      
      // ペンギンの中心点を見る
      if (penguins.length > 0) {
        const centerX = penguins.reduce((sum, p) => sum + p.position[0], 0) / penguins.length;
        const centerZ = penguins.reduce((sum, p) => sum + p.position[2], 0) / penguins.length;
        cameraRef.current.lookAt(centerX, 0, centerZ);
      }
    }
  });

  return (
    <>
      {/* カメラ設定 */}
      <perspectiveCamera ref={cameraRef} position={cameraPosition} fov={60} />
      
      {/* 美しい環境光 */}
      <ambientLight intensity={0.4} color="#87CEEB" />
      <directionalLight position={[10, 15, 10]} intensity={1.2} color="#FFE4B5" castShadow />
      <directionalLight position={[-10, 10, -5]} intensity={0.8} color="#B0E0E6" />
      <spotLight position={[0, 20, 0]} intensity={0.5} angle={Math.PI / 4} penumbra={1} color="#40E0D0" />
      
      {/* 海底の地面 */}
      <mesh position={[0, -2, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <primitive object={createSeabedMaterial} />
      </mesh>
      
      {/* 水中環境 */}
      <WaterParticles />
      
      {/* 水の層 */}
      <mesh position={[0, 5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[60, 60]} />
        <primitive object={createWaterMaterial} />
      </mesh>
      
      {/* 珊瑚礁の装飾 */}
      {Array.from({ length: 8 }, (_, i) => (
        <mesh 
          key={i} 
          position={[
            Math.sin(i * Math.PI / 4) * 8,
            Math.random() * 2,
            Math.cos(i * Math.PI / 4) * 8
          ]}
          scale={[1, Math.random() * 2 + 1, 1]}
        >
          <coneGeometry args={[0.5, 2, 8]} />
          <primitive object={createCoralMaterial} />
        </mesh>
      ))}
      
      {/* 海藻の表現 */}
      {Array.from({ length: 12 }, (_, i) => (
        <mesh 
          key={i} 
          position={[
            (Math.random() - 0.5) * 20,
            Math.random() * 3,
            (Math.random() - 0.5) * 20
          ]}
          rotation={[0, Math.random() * Math.PI * 2, 0]}
        >
          <cylinderGeometry args={[0.1, 0.05, Math.random() * 4 + 2]} />
          <primitive object={createYarnMaterial("#228B22", 0.8, 0.1)} />
        </mesh>
      ))}
      
      {/* 知的ペンギンたち */}
      {penguins.map((penguin) => (
        <IntelligentPenguin
          key={penguin.id}
          id={penguin.id}
          position={penguin.position}
        />
      ))}
      
      {/* 美しい魚たち */}
      {fishes.map((fish) => (
        <EnchantedFish
          key={fish.id}
          id={fish.id}
          position={fish.position}
          onCollect={() => handleFishCollect(fish.id)}
        />
      ))}
      
      {/* 魔法の毛糸玉 */}
      {yarnBalls.map((yarn) => (
        <MagicalYarnBall
          key={yarn.id}
          id={yarn.id}
          position={yarn.position}
          onCollect={() => handleYarnCollect(yarn.id)}
        />
      ))}
      
      {/* スコア表示（3D空間内） */}
      <group position={[0, 6, 8]}>
        <mesh>
          <planeGeometry args={[4, 1]} />
          <meshStandardMaterial 
            color="#000066" 
            transparent 
            opacity={0.8}
          />
        </mesh>
        <mesh position={[0, 0, 0.01]}>
          <planeGeometry args={[3.8, 0.8]} />
          <meshStandardMaterial 
            color="#FFFFFF" 
            transparent 
            opacity={0.9}
          />
        </mesh>
      </group>
      
      {/* AI状態インジケーター */}
      {isAIActive && (
        <group position={[0, 7, 8]}>
          <mesh>
            <sphereGeometry args={[0.2]} />
            <meshStandardMaterial 
              color="#00FF00" 
              emissive="#00FF00" 
              emissiveIntensity={0.6}
            />
          </mesh>
        </group>
      )}
    </>
  );
};

export default GameScene;
const YarnFish: React.FC<{
  position: [number, number, number];
  onCollect: () => void;
  id: string;
}> = ({ position, onCollect, id }) => {
  const fishRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const [collected, setCollected] = useState(false);

  const fishMaterial = useMemo(() => 
    createYarnTexture(hovered ? "#FF6B9D" : "#FF4757", 0.4), [hovered]
  );

  useFrame((state) => {
    if (fishRef.current && !collected) {
      const time = state.clock.elapsedTime;
      // 優雅な泳ぎ
      fishRef.current.position.y = position[1] + Math.sin(time * 2 + position[0]) * 0.3;
      fishRef.current.position.x = position[0] + Math.sin(time * 0.8) * 0.2;
      fishRef.current.rotation.y = Math.sin(time * 1.5) * 0.3;
      
      // ひれの動き
      fishRef.current.children.forEach((child, i) => {
        if (child.name.includes('fin')) {
          child.rotation.z = Math.sin(time * 4 + i) * 0.2;
        }
      });
    }
  });

  const handleClick = useCallback(() => {
    if (!collected) {
      setCollected(true);
      // 収集アニメーション
      if (fishRef.current) {
        const startScale = 1;
        const animationDuration = 500;
        const startTime = Date.now();
        
        const animate = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / animationDuration, 1);
          const scale = startScale * (1 - progress);
          
          if (fishRef.current) {
            fishRef.current.scale.setScalar(scale);
            fishRef.current.rotation.y += 0.1;
          }
          
          if (progress < 1) {
            requestAnimationFrame(animate);
          } else {
            onCollect();
          }
        };
        animate();
      }
    }
  }, [collected, onCollect]);

  return (
    <group 
      ref={fishRef}
      position={position}
      onClick={handleClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      scale={collected ? 0 : (hovered ? 1.2 : 1)}
    >
      {/* 魚の体 */}
      <mesh>
        <sphereGeometry args={[0.5, 12, 8]} />
        <primitive object={fishMaterial} />
      </mesh>
      
      {/* 尻尾 */}
      <mesh position={[0.6, 0, 0]} name="tail-fin">
        <coneGeometry args={[0.3, 0.6, 6]} />
        <primitive object={createYarnTexture("#FF3742", 0.5)} />
      </mesh>
      
      {/* 上ひれ */}
      <mesh position={[0, 0.4, 0]} name="top-fin">
        <coneGeometry args={[0.1, 0.3, 4]} />
        <primitive object={createYarnTexture("#FFB142", 0.6)} />
      </mesh>
      
      {/* 側ひれ */}
      <mesh position={[0.1, 0, 0.3]} name="side-fin1">
        <coneGeometry args={[0.08, 0.2, 4]} />
        <primitive object={createYarnTexture("#FFB142", 0.6)} />
      </mesh>
      <mesh position={[0.1, 0, -0.3]} name="side-fin2">
        <coneGeometry args={[0.08, 0.2, 4]} />
        <primitive object={createYarnTexture("#FFB142", 0.6)} />
      </mesh>
      
      {/* 目 */}
      <mesh position={[-0.3, 0.15, 0.15]}>
        <sphereGeometry args={[0.06]} />
        <meshStandardMaterial color="#000000" emissive="#333333" />
      </mesh>
      <mesh position={[-0.3, 0.15, -0.15]}>
        <sphereGeometry args={[0.06]} />
        <meshStandardMaterial color="#000000" emissive="#333333" />
      </mesh>
    </group>
  );
};

// 美しい毛糸玉
const YarnBall: React.FC<{
  position: [number, number, number];
  onCollect: () => void;
  id: string;
}> = ({ position, onCollect, id }) => {
  const yarnRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const [collected, setCollected] = useState(false);

  const yarnMaterial = useMemo(() => 
    createYarnTexture(hovered ? "#FFD93D" : "#FF69B4", 0.9), [hovered]
  );

  useFrame((state) => {
    if (yarnRef.current && !collected) {
      const time = state.clock.elapsedTime;
      yarnRef.current.rotation.x += 0.01;
      yarnRef.current.rotation.y += 0.015;
      yarnRef.current.position.y = position[1] + Math.sin(time * 2) * 0.2;
    }
  });

  const handleClick = useCallback(() => {
    if (!collected) {
      setCollected(true);
      onCollect();
    }
  }, [collected, onCollect]);

  return (
    <group 
      ref={yarnRef}
      position={position}
      onClick={handleClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      scale={collected ? 0 : (hovered ? 1.3 : 1)}
    >
      {/* 毛糸玉本体 */}
      <mesh>
        <sphereGeometry args={[0.4, 16, 16]} />
        <primitive object={yarnMaterial} />
      </mesh>
      
      {/* 毛糸の巻き */}
      {Array.from({ length: 6 }, (_, i) => (
        <mesh key={i} rotation={[i * 0.5, i * 0.8, i * 0.3]}>
          <torusGeometry args={[0.35, 0.02, 8, 16]} />
          <primitive object={createYarnTexture("#FFFFFF", 0.8)} />
        </mesh>
      ))}
    </group>
  );
};

// AIペンギン（リアルな動きと反応）
const SmartPenguin: React.FC<{
  position: [number, number, number];
  id: string;
}> = ({ position, id }) => {
  const penguinRef = useRef<THREE.Group>(null);
  const [currentPos, setCurrentPos] = useState(position);
  const [targetPos, setTargetPos] = useState(position);
  const [isMoving, setIsMoving] = useState(false);
  const [hovered, setHovered] = useState(false);
  
  const { sendPenguinAction } = useSocket();
  const { isAIActive } = useAI();

  const penguinMaterial = useMemo(() => createYarnTexture("#2C3E50", 0.7), []);
  const bellyMaterial = useMemo(() => createYarnTexture("#F8F9FA", 0.6), []);

  useFrame((state) => {
    if (penguinRef.current) {
      const time = state.clock.elapsedTime;
      
      // AI制御による自動移動
      if (isAIActive && !isMoving && Math.random() < 0.008) {
        const newTarget: [number, number, number] = [
          (Math.random() - 0.5) * 8,
          0,
          (Math.random() - 0.5) * 8
        ];
        setTargetPos(newTarget);
        setIsMoving(true);
        
        sendPenguinAction({
          type: 'auto-move',
          position: newTarget,
          timestamp: Date.now()
        });
      }
      
      // スムーズな移動
      if (isMoving) {
        const speed = 0.03;
        const dx = targetPos[0] - currentPos[0];
        const dz = targetPos[2] - currentPos[2];
        const distance = Math.sqrt(dx * dx + dz * dz);
        
        if (distance > 0.1) {
          setCurrentPos(prev => [
            prev[0] + dx * speed,
            prev[1],
            prev[2] + dz * speed
          ]);
          
          // 移動方向を向く
          penguinRef.current.rotation.y = Math.atan2(dz, dx);
        } else {
          setIsMoving(false);
        }
      }
      
      // 自然なアニメーション
      penguinRef.current.position.set(currentPos[0], currentPos[1], currentPos[2]);
      penguinRef.current.position.y += Math.sin(time + currentPos[0]) * 0.05;
      
      // 歩行アニメーション
      if (isMoving) {
        penguinRef.current.rotation.z = Math.sin(time * 6) * 0.1;
      }
    }
  });

  const handleClick = useCallback(() => {
    const newTarget: [number, number, number] = [
      (Math.random() - 0.5) * 10,
      0,
      (Math.random() - 0.5) * 10
    ];
    setTargetPos(newTarget);
    setIsMoving(true);
    
    sendPenguinAction({
      type: 'user-click',
      position: newTarget,
      timestamp: Date.now()
    });
  }, [sendPenguinAction]);

  return (
    <group 
      ref={penguinRef}
      position={currentPos}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={handleClick}
      scale={hovered ? 1.1 : 1}
    >
      {/* ペンギンの体 */}
      <mesh>
        <sphereGeometry args={[0.6, 16, 16]} />
        <primitive object={penguinMaterial} />
      </mesh>
      
      {/* お腹 */}
      <mesh position={[0, 0, 0.4]}>
        <sphereGeometry args={[0.4, 16, 16]} />
        <primitive object={bellyMaterial} />
      </mesh>
      
      {/* 頭 */}
      <mesh position={[0, 0.7, 0]}>
        <sphereGeometry args={[0.4, 16, 16]} />
        <primitive object={penguinMaterial} />
      </mesh>
      
      {/* 目 */}
      <mesh position={[-0.15, 0.9, 0.3]}>
        <sphereGeometry args={[0.06]} />
        <meshStandardMaterial color="#FFFFFF" />
      </mesh>
      <mesh position={[0.15, 0.9, 0.3]}>
        <sphereGeometry args={[0.06]} />
        <meshStandardMaterial color="#FFFFFF" />
      </mesh>
      
      {/* 瞳 */}
      <mesh position={[-0.13, 0.92, 0.35]}>
        <sphereGeometry args={[0.03]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
      <mesh position={[0.17, 0.92, 0.35]}>
        <sphereGeometry args={[0.03]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
      
      {/* くちばし */}
      <mesh position={[0, 0.8, 0.4]}>
        <coneGeometry args={[0.06, 0.15, 3]} />
        <meshStandardMaterial color="#FF8C00" />
      </mesh>
      
      {/* 翼 */}
      <mesh position={[-0.5, 0.2, 0]} rotation={[0, 0, -0.2]}>
        <sphereGeometry args={[0.25, 8, 8]} />
        <primitive object={penguinMaterial} />
      </mesh>
      <mesh position={[0.5, 0.2, 0]} rotation={[0, 0, 0.2]}>
        <sphereGeometry args={[0.25, 8, 8]} />
        <primitive object={penguinMaterial} />
      </mesh>
      
      {/* 足 */}
      <mesh position={[-0.15, -0.6, 0.2]}>
        <sphereGeometry args={[0.12, 8, 6]} />
        <meshStandardMaterial color="#FF8C00" />
      </mesh>
      <mesh position={[0.15, -0.6, 0.2]}>
        <sphereGeometry args={[0.12, 8, 6]} />
        <meshStandardMaterial color="#FF8C00" />
      </mesh>
      
      {/* AI状態表示 */}
      {isAIActive && (
        <mesh position={[0, 1.2, 0]}>
          <sphereGeometry args={[0.08]} />
          <meshStandardMaterial 
            color="#00FF7F" 
            emissive="#00FF7F" 
            emissiveIntensity={0.4}
          />
        </mesh>
      )}
    </group>
  );
};

// メインゲームシーン
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

  // アイテム生成
  useEffect(() => {
    const spawnItems = () => {
      // 魚の生成
      if (fishItems.length < 6) {
        const newFish = {
          id: ish__,
          position: [
            (Math.random() - 0.5) * 12,
            Math.random() * 2 + 1,
            (Math.random() - 0.5) * 12
          ] as [number, number, number]
        };
        setFishItems(prev => [...prev, newFish]);
      }
      
      // 毛糸玉の生成
      if (yarnItems.length < 3 && Math.random() < 0.4) {
        const newYarn = {
          id: yarn__,
          position: [
            (Math.random() - 0.5) * 10,
            Math.random() * 1.5 + 1,
            (Math.random() - 0.5) * 10
          ] as [number, number, number]
        };
        setYarnItems(prev => [...prev, newYarn]);
      }
    };

    const interval = setInterval(spawnItems, 3000);
    return () => clearInterval(interval);
  }, [fishItems.length, yarnItems.length]);

  // アイテム収集
  const collectFish = useCallback((fishId: string) => {
    setFishItems(prev => prev.filter(fish => fish.id !== fishId));
    setGameStats(prev => ({
      ...prev,
      fish: prev.fish + 1,
      score: prev.score + 10,
      level: Math.floor((prev.fish + 1) / 5) + 1
    }));
  }, []);

  const collectYarnBall = useCallback((yarnId: string) => {
    setYarnItems(prev => prev.filter(yarn => yarn.id !== yarnId));
    setGameStats(prev => ({
      ...prev,
      yarnBalls: prev.yarnBalls + 1,
      score: prev.score + 25,
      level: Math.floor((prev.fish + prev.yarnBalls + 1) / 3) + 1
    }));
  }, []);

  // グローバル統計
  useEffect(() => {
    (window as any).gameStats = gameStats;
  }, [gameStats]);

  return (
    <>
      {/* 美しい照明 */}
      <ambientLight intensity={0.3} color="#E6F3FF" />
      <directionalLight 
        position={[8, 12, 8]} 
        intensity={1} 
        color="#FFFACD"
        castShadow
      />
      <pointLight position={[0, 6, 0]} intensity={0.5} color="#FFE4E1" />
      <spotLight 
        position={[4, 8, 4]} 
        angle={0.4} 
        penumbra={0.8} 
        intensity={0.6}
        color="#F0F8FF"
      />
      
      {/* 美しい海底 */}
      <mesh position={[0, -1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[25, 25]} />
        <primitive object={createYarnTexture("#87CEEB", 0.8)} />
      </mesh>
      
      {/* 海底の装飾 */}
      {Array.from({ length: 15 }, (_, i) => (
        <mesh 
          key={i}
          position={[
            (Math.random() - 0.5) * 20,
            -0.8,
            (Math.random() - 0.5) * 20
          ]}
          rotation={[-Math.PI / 2, 0, Math.random() * Math.PI]}
        >
          <cylinderGeometry args={[0.05, 0.05, 8, 6]} />
          <primitive object={createYarnTexture("#F0E68C", 0.7)} />
        </mesh>
      ))}
      
      {/* 水草 */}
      {Array.from({ length: 10 }, (_, i) => (
        <group key={i} position={[
          (Math.random() - 0.5) * 18,
          -1,
          (Math.random() - 0.5) * 18
        ]}>
          <mesh>
            <cylinderGeometry args={[0.03, 0.08, 1.5, 6]} />
            <primitive object={createYarnTexture("#228B22", 0.6)} />
          </mesh>
          <mesh position={[0, 1, 0]}>
            <sphereGeometry args={[0.2, 8, 8]} />
            <primitive object={createYarnTexture("#32CD32", 0.5)} />
          </mesh>
        </group>
      ))}
      
      {/* AIペンギンたち */}
      {Array.from({ length: 4 }, (_, i) => (
        <SmartPenguin 
          key={penguin_}
          id={penguin_}
          position={[
            Math.cos(i * 1.5) * 3,
            0,
            Math.sin(i * 1.5) * 3
          ]}
        />
      ))}
      
      {/* 魚たち */}
      {fishItems.map((fish) => (
        <YarnFish
          key={fish.id}
          id={fish.id}
          position={fish.position}
          onCollect={() => collectFish(fish.id)}
        />
      ))}
      
      {/* 毛糸玉たち */}
      {yarnItems.map((yarn) => (
        <YarnBall
          key={yarn.id}
          id={yarn.id}
          position={yarn.position}
          onCollect={() => collectYarnBall(yarn.id)}
        />
      ))}
      
      {/* 泡エフェクト */}
      {Array.from({ length: 8 }, (_, i) => (
        <mesh 
          key={i}
          position={[
            (Math.random() - 0.5) * 15,
            Math.random() * 6 + 2,
            (Math.random() - 0.5) * 15
          ]}
        >
          <sphereGeometry args={[0.08 + Math.random() * 0.15]} />
          <meshStandardMaterial 
            color="#FFFFFF" 
            transparent 
            opacity={0.5}
            emissive="#E0F6FF"
            emissiveIntensity={0.1}
          />
        </mesh>
      ))}
    </>
  );
};

export default GameScene;
