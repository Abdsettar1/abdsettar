import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial } from '@react-three/drei';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';

// Floating geometric orb — reacts to mouse
interface OrbProps {
  mouseX: number;
  mouseY: number;
}

function OperationsOrb({ mouseX, mouseY }: OrbProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.x = state.clock.elapsedTime * 0.15;
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.2 + mouseX * 0.5;
    meshRef.current.position.x = mouseX * 1.5;
    meshRef.current.position.y = mouseY * -1.5;
  });

  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.8}>
      <mesh ref={meshRef} position={[0, 0, -2]} scale={2.8}>
        <icosahedronGeometry args={[1, 4]} />
        <MeshDistortMaterial
          color="#B600A8"
          distort={0.4}
          speed={2}
          roughness={0}
          metalness={0.9}
          wireframe={false}
          transparent
          opacity={0.15}
        />
      </mesh>
    </Float>
  );
}

// Wireframe icosahedron — outer shell
function WireframeShell({ mouseX, mouseY }: OrbProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.x = state.clock.elapsedTime * -0.1;
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.15 + mouseX * 0.3;
    meshRef.current.position.x = mouseX * 0.8;
    meshRef.current.position.y = mouseY * -0.8;
  });

  return (
    <mesh ref={meshRef} position={[0, 0, -2]} scale={3.8}>
      <icosahedronGeometry args={[1, 1]} />
      <meshBasicMaterial
        color="#7621B0"
        wireframe
        transparent
        opacity={0.12}
      />
    </mesh>
  );
}

// Floating particles field
function ParticleField() {
  const count = 120;
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 20;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 20;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 10 - 3;
    }
    return arr;
  }, []);

  const pointsRef = useRef<THREE.Points>(null);

  useFrame((state) => {
    if (!pointsRef.current) return;
    pointsRef.current.rotation.y = state.clock.elapsedTime * 0.03;
    pointsRef.current.rotation.x = state.clock.elapsedTime * 0.01;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.035}
        color="#D7E2EA"
        transparent
        opacity={0.4}
        sizeAttenuation
      />
    </points>
  );
}

// Floating ring
function FloatingRing({ mouseX, mouseY }: OrbProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.x = state.clock.elapsedTime * 0.3 + mouseY * 0.5;
    meshRef.current.rotation.z = state.clock.elapsedTime * 0.2;
    meshRef.current.position.x = mouseX * 2 + 3;
    meshRef.current.position.y = mouseY * -1 - 1;
  });

  return (
    <mesh ref={meshRef} position={[3, -1, -4]} scale={1.4}>
      <torusGeometry args={[1, 0.02, 16, 80]} />
      <meshBasicMaterial color="#B600A8" transparent opacity={0.3} />
    </mesh>
  );
}

// Second ring
function FloatingRing2({ mouseX, mouseY }: OrbProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.25 + mouseX * 0.4;
    meshRef.current.rotation.x = state.clock.elapsedTime * -0.15;
    meshRef.current.position.x = mouseX * -1.5 - 3;
    meshRef.current.position.y = mouseY * 0.8 + 1;
  });

  return (
    <mesh ref={meshRef} position={[-3, 1, -5]} scale={1.8}>
      <torusGeometry args={[1, 0.015, 16, 80]} />
      <meshBasicMaterial color="#7621B0" transparent opacity={0.2} />
    </mesh>
  );
}

export function Scene3D({ mouseX, mouseY }: OrbProps) {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 60 }}
      style={{ position: 'absolute', inset: 0 }}
      gl={{ antialias: true, alpha: true }}
    >
      <color attach="background" args={['#0C0C0C']} />
      <fog attach="fog" args={['#0C0C0C', 8, 25]} />
      <ambientLight intensity={0.1} />
      <pointLight position={[0, 0, 2]} intensity={2} color="#B600A8" />
      <pointLight position={[-5, 5, -5]} intensity={0.5} color="#7621B0" />

      <OperationsOrb mouseX={mouseX} mouseY={mouseY} />
      <WireframeShell mouseX={mouseX} mouseY={mouseY} />
      <ParticleField />
      <FloatingRing mouseX={mouseX} mouseY={mouseY} />
      <FloatingRing2 mouseX={mouseX} mouseY={mouseY} />
    </Canvas>
  );
}
