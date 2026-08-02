"use client";

import { useRef, Suspense, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Stage, Environment, useGLTF } from "@react-three/drei";
import * as THREE from "three";

interface MeshData {
  vertices: number[];
  normals: number[];
  indices: number[];
}

interface ModelViewerProps {
  meshData?: MeshData;
  fileName?: string;
  modelUrl?: string;
}

// Component to render actual mesh data
function MeshModel({ meshData }: { meshData: MeshData }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
  });

  // Create geometry from mesh data
  const geometry = new THREE.BufferGeometry();
  
  if (meshData.vertices && meshData.vertices.length > 0) {
    geometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(meshData.vertices, 3)
    );
  }
  
  if (meshData.normals && meshData.normals.length > 0) {
    geometry.setAttribute(
      'normal',
      new THREE.Float32BufferAttribute(meshData.normals, 3)
    );
  }
  
  if (meshData.indices && meshData.indices.length > 0) {
    geometry.setIndex(meshData.indices);
  }

  // Compute normals if not provided
  if (!meshData.normals || meshData.normals.length === 0) {
    geometry.computeVertexNormals();
  }

  return (
    <mesh ref={meshRef} geometry={geometry} castShadow receiveShadow>
      <meshStandardMaterial 
        color="#6366f1" 
        metalness={0.3} 
        roughness={0.4}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// Demo component - shows a mechanical part shape when no real data
function DemoModel() {
  const meshRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
    }
  });

  return (
    <group ref={meshRef}>
      {/* Main body - rectangular block */}
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[2, 0.8, 1.2]} />
        <meshStandardMaterial color="#4f46e5" metalness={0.4} roughness={0.3} />
      </mesh>
      
      {/* Cylindrical feature */}
      <mesh position={[0, 0.6, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.3, 0.4, 32]} />
        <meshStandardMaterial color="#818cf8" metalness={0.5} roughness={0.2} />
      </mesh>
      
      {/* Side holes */}
      <mesh position={[0.7, 0, 0.65]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.4, 32]} />
        <meshStandardMaterial color="#312e81" metalness={0.6} roughness={0.2} />
      </mesh>
      <mesh position={[-0.7, 0, 0.65]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.4, 32]} />
        <meshStandardMaterial color="#312e81" metalness={0.6} roughness={0.2} />
      </mesh>
      
      {/* Base plate */}
      <mesh position={[0, -0.5, 0]} castShadow>
        <boxGeometry args={[2.2, 0.2, 1.4]} />
        <meshStandardMaterial color="#3730a3" metalness={0.3} roughness={0.5} />
      </mesh>
    </group>
  );
}

// External model loader (for GLTF/GLB)
function GLTFModel({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  const ref = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
  });

  return (
    <group ref={ref}>
      <primitive object={scene} />
    </group>
  );
}

function Scene({ meshData, modelUrl }: { meshData?: MeshData; modelUrl?: string }) {
  const [autoRotate, setAutoRotate] = useState(true);

  return (
    <>
      <Suspense fallback={null}>
        <Stage environment="city" intensity={0.6}>
          {meshData && meshData.vertices.length > 0 ? (
            <MeshModel meshData={meshData} />
          ) : modelUrl ? (
            <GLTFModel url={modelUrl} />
          ) : (
            <DemoModel />
          )}
        </Stage>
      </Suspense>
      
      <OrbitControls
        autoRotate={autoRotate}
        autoRotateSpeed={2}
        enableZoom={true}
        enablePan={true}
        minDistance={1}
        maxDistance={20}
        onStart={() => setAutoRotate(false)}
      />
      
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
      <directionalLight position={[-5, 5, -5]} intensity={0.3} />
    </>
  );
}

export default function ModelViewer({ meshData, fileName, modelUrl }: ModelViewerProps) {
  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-lg overflow-hidden">
      <Canvas 
        shadows 
        camera={{ position: [3, 2, 5], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <Scene meshData={meshData} modelUrl={modelUrl} />
      </Canvas>
      
      {fileName && (
        <div className="absolute bottom-2 left-2 text-white/60 text-xs bg-black/30 px-2 py-1 rounded">
          {fileName}
        </div>
      )}
      
      <div className="absolute top-2 right-2 text-white/40 text-xs">
        Drag to rotate • Scroll to zoom
      </div>
    </div>
  );
}
