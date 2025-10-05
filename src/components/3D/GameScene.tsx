import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSocket } from '../../context/SocketContext';
import { useAI } from '../../context/AIContext';

type Vector3Tuple = [number, number, number];

const makeYarnMaterial = (baseColor: string, roughness = 0.8, metalness = 0.1) => {
  const material = new THREE.MeshStandardMaterial({
    color: baseColor,
    roughness,
    metalness,
    bumpScale: 0.6,
  });

  if (typeof document !== 'undefined') {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.fillStyle = baseColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.globalCompositeOperation = 'overlay';
      for (let y = 0; y < canvas.height; y += 3) {
        ctx.strokeStyle = `rgba(255,255,255,${0.2 + Math.random() * 0.3})`;
        ctx.lineWidth = 1 + Math.random();
        ctx.beginPath();
        ctx.moveTo(0, y + Math.sin(y * 0.08) * 2);
        ctx.lineTo(canvas.width, y + Math.sin(y * 0.08) * 2);
        ctx.stroke();
      }

      for (let i = 0; i < 120; i++) {
        ctx.fillStyle = `rgba(255,255,255,${0.3 + Math.random() * 0.4})`;
        const radius = 1 + Math.random() * 3;
        ctx.beginPath();
        ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      const texture = new THREE.CanvasTexture(canvas);
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(3, 3);
      material.map = texture;
      material.bumpMap = texture;
      material.normalMap = texture;
    }
  }

  return material;
};


const WaterParticles: React.FC = () => {
  const pointsRef = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const arr = new Float32Array(300);
    for (let i = 0; i < arr.length; i += 3) {
      arr[i] = (Math.random() - 0.5) * 30;
      arr[i + 1] = Math.random() * 12;
      arr[i + 2] = (Math.random() - 0.5) * 30;
    }
    return arr;
  }, []);

  useFrame((_, delta) => {
    const points = pointsRef.current;
    if (!points) return;
    const positionAttr = points.geometry.getAttribute('position');
    const array = positionAttr.array as Float32Array;
    for (let i = 1; i < array.length; i += 3) {
      array[i] += delta * 0.4;
      if (array[i] > 10) array[i] = -2;
    }
    positionAttr.needsUpdate = true;
    points.rotation.y += delta * 0.08;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.12} color="#8fd6ff" opacity={0.55} transparent />
    </points>
  );
};

const WaterRipple: React.FC<{ position: Vector3Tuple; onFade: () => void }> = ({ position, onFade }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const elapsedRef = useRef(0);

  useFrame((_, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    elapsedRef.current += delta;
    const scale = 1 + elapsedRef.current * 2.5;
    const opacity = Math.max(0, 0.9 - elapsedRef.current * 1.2);
    mesh.scale.set(scale, scale, scale);
    (mesh.material as THREE.MeshStandardMaterial).opacity = opacity;
    if (opacity <= 0) onFade();
  });

  return (
    <mesh ref={meshRef} position={[position[0], position[1] - 0.5, position[2]]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.2, 0.5, 24]} />
      <meshStandardMaterial emissive="#89f4ff" color="#6ce0ff" transparent opacity={0.9} />
    </mesh>
  );
};

interface CollectibleProps {
  id: string;
  position: Vector3Tuple;
  onCollect: () => void;
}

const EnchantedFish: React.FC<CollectibleProps> = ({ id, position, onCollect }) => {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const [collected, setCollected] = useState(false);
  const [ripples, setRipples] = useState<string[]>([]);

  const bodyMaterial = useMemo(
    () => makeYarnMaterial(hovered ? '#ff90c2' : '#ff7a66', 0.4, 0.15),
    [hovered]
  );
  const finMaterial = useMemo(() => makeYarnMaterial('#ffd28c', 0.5, 0.1), []);

  useFrame((state) => {
    const group = groupRef.current;
    if (!group || collected) return;
    const time = state.clock.getElapsedTime();
    group.position.x = position[0] + Math.sin(time + id.length) * 0.4;
    group.position.y = position[1] + Math.cos(time * 1.4 + id.length) * 0.3;
    group.position.z = position[2] + Math.sin(time * 0.7 + id.length) * 0.3;
    group.rotation.y = Math.sin(time * 0.9) * 0.4;
    group.rotation.z = Math.sin(time * 1.3) * 0.2;

    group.children.forEach((child, index) => {
      if (child.name === 'fin') {
        child.rotation.z = Math.sin(time * 4 + index) * 0.5;
      }
    });
  });

  useEffect(() => {
    if (!collected) return;
    const handle = setTimeout(onCollect, 400);
    return () => clearTimeout(handle);
  }, [collected, onCollect]);

  const handlePointerDown = useCallback(() => {
    if (collected) return;
    setCollected(true);
    setRipples((prev) => [...prev, `ripple-${Date.now()}`]);
  }, [collected]);

  if (collected) {
    return (
      <group position={position}>
        {ripples.map((rippleId) => (
          <WaterRipple
            key={rippleId}
            position={position}
            onFade={() => setRipples((prev) => prev.filter((r) => r !== rippleId))}
          />
        ))}
      </group>
    );
  }

  return (
    <group
      ref={groupRef}
      position={position}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onPointerDown={handlePointerDown}
      scale={hovered ? 1.2 : 1}
    >
      <mesh>
        <sphereGeometry args={[0.45, 20, 16]} />
        <primitive object={bodyMaterial} />
      </mesh>
      <mesh position={[-0.4, 0, 0]}>
        <sphereGeometry args={[0.3, 16, 12]} />
        <primitive object={bodyMaterial} />
      </mesh>
      <mesh position={[0.6, 0, 0]} rotation={[0, 0, Math.PI / 8]} name="fin">
        <coneGeometry args={[0.35, 0.9, 10]} />
        <primitive object={finMaterial} />
      </mesh>
      <mesh position={[0.05, 0.35, 0]} name="fin">
        <coneGeometry args={[0.18, 0.4, 8]} />
        <primitive object={finMaterial} />
      </mesh>
      <mesh position={[0.05, -0.25, 0]} name="fin">
        <coneGeometry args={[0.15, 0.35, 8]} />
        <primitive object={finMaterial} />
      </mesh>
      <mesh position={[-0.45, 0.15, 0.22]}>
        <sphereGeometry args={[0.08]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[-0.45, 0.15, -0.22]}>
        <sphereGeometry args={[0.08]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[-0.47, 0.17, 0.26]}>
        <sphereGeometry args={[0.04]} />
        <meshStandardMaterial color="#111111" />
      </mesh>
      <mesh position={[-0.47, 0.17, -0.18]}>
        <sphereGeometry args={[0.04]} />
        <meshStandardMaterial color="#111111" />
      </mesh>
    </group>
  );
};

const MagicalYarnBall: React.FC<CollectibleProps> = ({ position, onCollect }) => {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const [collected, setCollected] = useState(false);
  const material = useMemo(() => makeYarnMaterial('#ff9de2', 0.9, 0.02), []);

  useFrame((state, delta) => {
    const group = groupRef.current;
    if (!group || collected) return;
    group.rotation.x += delta * 0.8;
    group.rotation.y += delta * 0.6;
    group.position.y = position[1] + Math.sin(state.clock.getElapsedTime() * 2) * 0.3;
  });

  useEffect(() => {
    if (!collected) return;
    const timeout = setTimeout(onCollect, 300);
    return () => clearTimeout(timeout);
  }, [collected, onCollect]);

  if (collected) {
    return null;
  }

  return (
    <group
      ref={groupRef}
      position={position}
      scale={hovered ? 1.4 : 1}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onPointerDown={() => setCollected(true)}
    >
      <mesh>
        <sphereGeometry args={[0.45, 24, 18]} />
        <primitive object={material} />
      </mesh>
      {Array.from({ length: 8 }).map((_, index) => (
        <mesh key={index} rotation={[index * 0.4, index * 0.6, index * 0.3]}>
          <torusGeometry args={[0.4, 0.04, 10, 28]} />
          <primitive object={makeYarnMaterial('#ffe5fb', 0.7, 0.01)} />
        </mesh>
      ))}
    </group>
  );
};

interface PenguinProps {
  id: string;
  position: Vector3Tuple;
}

const IntelligentPenguin: React.FC<PenguinProps> = ({ id, position }) => {
  const groupRef = useRef<THREE.Group>(null);
  const [currentPos, setCurrentPos] = useState<Vector3Tuple>(position);
  const [targetPos, setTargetPos] = useState<Vector3Tuple>(position);
  const { sendPenguinAction } = useSocket();
  const { isAIActive, getAIDecision } = useAI();
  const idleTimer = useRef(0);

  const bodyMaterial = useMemo(() => makeYarnMaterial('#223043', 0.75, 0.08), []);
  const bellyMaterial = useMemo(() => makeYarnMaterial('#fef7eb', 0.6, 0), []);
  const beakMaterial = useMemo(() => makeYarnMaterial('#ffb347', 0.45, 0.2), []);

  const moveTo = useCallback(
    (destination: Vector3Tuple, reason: 'ai' | 'tap') => {
      setTargetPos(destination);
      sendPenguinAction({
        penguinId: id,
        target: destination,
        reason,
        timestamp: Date.now(),
      });
    },
    [id, sendPenguinAction]
  );

  useFrame((state, delta) => {
    const group = groupRef.current;
    if (!group) return;

    idleTimer.current += delta;

    const dx = targetPos[0] - currentPos[0];
    const dz = targetPos[2] - currentPos[2];
    const distance = Math.hypot(dx, dz);
    const speed = 1.2;

    if (distance > 0.02) {
      const step = Math.min(distance, speed * delta);
      const dirX = dx / distance;
      const dirZ = dz / distance;
      const next: Vector3Tuple = [
        currentPos[0] + dirX * step,
        0,
        currentPos[2] + dirZ * step,
      ];
      setCurrentPos(next);
      group.position.set(next[0], 0, next[2]);
      group.rotation.y = Math.atan2(dirX, dirZ);
    }

    const bob = Math.sin(state.clock.getElapsedTime() * 5 + id.length) * 0.05;
    group.position.y = bob;

    if (isAIActive && idleTimer.current > 3) {
      idleTimer.current = 0;
      const outputs = getAIDecision([currentPos[0], currentPos[2], Math.random(), 1]);
      const nextTarget: Vector3Tuple = [
        THREE.MathUtils.clamp(currentPos[0] + (outputs[0] - 0.5) * 6, -6, 6),
        0,
        THREE.MathUtils.clamp(currentPos[2] + (outputs[1] - 0.5) * 6, -6, 6),
      ];
      moveTo(nextTarget, 'ai');
    }
  });

  const handlePointerDown = useCallback(() => {
    const randomTarget: Vector3Tuple = [
      THREE.MathUtils.randFloatSpread(12),
      0,
      THREE.MathUtils.randFloatSpread(12),
    ];
    idleTimer.current = 0;
    moveTo(randomTarget, 'tap');
  }, [moveTo]);

  return (
    <group ref={groupRef} position={currentPos} onPointerDown={handlePointerDown}>
      <mesh position={[0, 0.7, 0]}>
        <sphereGeometry args={[0.7, 20, 18]} />
        <primitive object={bodyMaterial} />
      </mesh>
      <mesh position={[0, 0.35, 0.4]}>
        <sphereGeometry args={[0.55, 18, 16]} />
        <primitive object={bellyMaterial} />
      </mesh>
      <mesh position={[0, 1.25, 0]}>
        <sphereGeometry args={[0.45, 18, 16]} />
        <primitive object={bodyMaterial} />
      </mesh>
      <mesh position={[0, 1.1, 0.45]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.12, 0.3, 8]} />
        <primitive object={beakMaterial} />
      </mesh>
      <mesh position={[-0.18, 1.3, 0.3]}>
        <sphereGeometry args={[0.12]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0.18, 1.3, 0.3]}>
        <sphereGeometry args={[0.12]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[-0.2, 1.32, 0.36]}>
        <sphereGeometry args={[0.06]} />
        <meshStandardMaterial color="#111111" />
      </mesh>
      <mesh position={[0.2, 1.32, 0.36]}>
        <sphereGeometry args={[0.06]} />
        <meshStandardMaterial color="#111111" />
      </mesh>
      <mesh position={[-0.65, 0.55, 0]} rotation={[0, 0, Math.PI / 5]}>
        <sphereGeometry args={[0.35, 16, 14]} />
        <primitive object={bodyMaterial} />
      </mesh>
      <mesh position={[0.65, 0.55, 0]} rotation={[0, 0, -Math.PI / 5]}>
        <sphereGeometry args={[0.35, 16, 14]} />
        <primitive object={bodyMaterial} />
      </mesh>
      <mesh position={[-0.25, -0.75, 0.35]}>
        <sphereGeometry args={[0.18]} />
        <primitive object={beakMaterial} />
      </mesh>
      <mesh position={[0.25, -0.75, 0.35]}>
        <sphereGeometry args={[0.18]} />
        <primitive object={beakMaterial} />
      </mesh>
    </group>
  );
};

const INITIAL_PENGUINS: Array<{ id: string; position: Vector3Tuple }> = [
  { id: 'penguin-1', position: [-2, 0, 1] },
  { id: 'penguin-2', position: [2, 0, -2] },
];

const INITIAL_FISHES: Array<{ id: string; position: Vector3Tuple }> = [
  { id: 'fish-1', position: [2.5, 1.2, 2] },
  { id: 'fish-2', position: [-3, 1.4, -1] },
  { id: 'fish-3', position: [1.5, 2.0, -3] },
];

const INITIAL_YARN: Array<{ id: string; position: Vector3Tuple }> = [
  { id: 'yarn-1', position: [4, 1.6, 0] },
  { id: 'yarn-2', position: [-4, 1.8, 3] },
];

const GameScene: React.FC = () => {
  const [score, setScore] = useState(0);
  const [penguins] = useState(INITIAL_PENGUINS);
  const [fishes, setFishes] = useState(INITIAL_FISHES);
  const [yarnBalls, setYarnBalls] = useState(INITIAL_YARN);
  const { sendAITraining } = useSocket();
  const { updateNeuralNetwork, isAIActive } = useAI();

  const seabedMaterial = useMemo(() => makeYarnMaterial('#d8c4a0', 0.85, 0.05), []);
  const coralMaterial = useMemo(() => makeYarnMaterial('#ff796c', 0.6, 0.2), []);
  const kelpMaterial = useMemo(() => makeYarnMaterial('#2f8f6b', 0.7, 0.1), []);

  const handleFishCollect = useCallback(
    (id: string) => {
      setFishes((prev) => prev.filter((fish) => fish.id !== id));
      setScore((prev) => prev + 10);
      const payload = { type: 'fish', itemId: id, reward: 10, timestamp: Date.now() };
      updateNeuralNetwork(payload);
      sendAITraining(payload);

      setTimeout(() => {
        const newFish = {
          id: `fish-${Date.now()}`,
          position: [
            THREE.MathUtils.randFloatSpread(10),
            1 + Math.random() * 2,
            THREE.MathUtils.randFloatSpread(10),
          ] as Vector3Tuple,
        };
        setFishes((prev) => [...prev, newFish]);
      }, 2500);
    },
    [sendAITraining, updateNeuralNetwork]
  );

  const handleYarnCollect = useCallback(
    (id: string) => {
      setYarnBalls((prev) => prev.filter((yarn) => yarn.id !== id));
      setScore((prev) => prev + 25);
      const payload = { type: 'yarn', itemId: id, reward: 25, timestamp: Date.now() };
      updateNeuralNetwork(payload);
      sendAITraining(payload);

      setTimeout(() => {
        const newYarn = {
          id: `yarn-${Date.now()}`,
          position: [
            THREE.MathUtils.randFloatSpread(10),
            1.5 + Math.random() * 1.5,
            THREE.MathUtils.randFloatSpread(10),
          ] as Vector3Tuple,
        };
        setYarnBalls((prev) => [...prev, newYarn]);
      }, 5000);
    },
    [sendAITraining, updateNeuralNetwork]
  );

  return (
    <>
      <ambientLight intensity={0.5} color="#9fe8ff" />
      <directionalLight position={[10, 12, 8]} intensity={1.2} color="#ffe2b8" castShadow />
      <directionalLight position={[-8, 10, -6]} intensity={0.6} color="#88c7ff" />
      <spotLight position={[0, 18, 0]} angle={Math.PI / 5} intensity={0.4} color="#6de9ff" />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <primitive object={seabedMaterial} />
      </mesh>

      <WaterParticles />

      {Array.from({ length: 6 }).map((_, index) => (
        <mesh
          key={`coral-${index}`}
          position={[
            Math.sin((index * Math.PI) / 3) * 6,
            -1 + Math.random() * 0.6,
            Math.cos((index * Math.PI) / 3) * 6,
          ]}
        >
          <coneGeometry args={[0.5, 2 + Math.random(), 10]} />
          <primitive object={coralMaterial} />
        </mesh>
      ))}

      {Array.from({ length: 10 }).map((_, index) => (
        <mesh
          key={`kelp-${index}`}
          position={[
            THREE.MathUtils.randFloatSpread(18),
            -1 + Math.random(),
            THREE.MathUtils.randFloatSpread(18),
          ]}
        >
          <cylinderGeometry args={[0.08, 0.05, 3 + Math.random() * 1.5, 8]} />
          <primitive object={kelpMaterial} />
        </mesh>
      ))}

      {penguins.map((penguin) => (
        <IntelligentPenguin key={penguin.id} id={penguin.id} position={penguin.position} />
      ))}

      {fishes.map((fish) => (
        <EnchantedFish
          key={fish.id}
          id={fish.id}
          position={fish.position}
          onCollect={() => handleFishCollect(fish.id)}
        />
      ))}

      {yarnBalls.map((yarn) => (
        <MagicalYarnBall
          key={yarn.id}
          id={yarn.id}
          position={yarn.position}
          onCollect={() => handleYarnCollect(yarn.id)}
        />
      ))}

      <group position={[0, 5, 8]}>
        <mesh>
          <planeGeometry args={[4, 1]} />
          <meshStandardMaterial color="#0d2a45" transparent opacity={0.75} />
        </mesh>
        <mesh position={[0, 0, 0.02]}>
          <planeGeometry args={[3.6, 0.7]} />
          <meshStandardMaterial color="#ffffff" transparent opacity={0.9} />
        </mesh>
      </group>

      {isAIActive && (
        <mesh position={[0, 6.2, 8.1]}>
          <sphereGeometry args={[0.18]} />
          <meshStandardMaterial emissive="#6dff94" color="#a3ffc4" />
        </mesh>
      )}
    </>
  );
};

export default GameScene;
