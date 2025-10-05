import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const GameScene: React.FC = () => {
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
      
      <mesh position={[2, 1, 2]}>
        <boxGeometry args={[1.0, 0.6, 0.3]} />
        <meshStandardMaterial color="#FFA07A" />
      </mesh>
      
      <mesh position={[-2, 1, -2]}>
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshStandardMaterial color="#FF69B4" />
      </mesh>
    </>
  );
};

export default GameScene;
