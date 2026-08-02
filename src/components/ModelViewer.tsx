"use client";

import { useRef, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF, Stage, Center, Environment } from "@react-three/drei";
import * as THREE from "three";

interface ModelViewerProps {
  modelUrl?: string;
  fileName?: string;
}

// Demo component - shows a rotating box when no model
function DemoModel() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
    }
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial color="#6366f1" wireframe />
    </mesh>
  );
}

// Actual model loader
function Model({ url }: { url: string }) {
  // Note: For actual STEP/IGES files, you'd need a parser like three-cad-parser
  // This is a placeholder that shows a demo model
  return <DemoModel />;
}

export default function ModelViewer({ modelUrl, fileName }: ModelViewerProps) {
  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg">
      <Canvas shadows camera={{ position: [0, 0, 5], fov: 50 }}>
        <Suspense fallback={null}>
          <Stage environment="city" intensity={0.6}>
            {modelUrl ? <Model url={modelUrl} /> : <DemoModel />}
          </Stage>
        </Suspense>
        <OrbitControls
          autoRotate
          autoRotateSpeed={2}
          enableZoom={true}
          minDistance={2}
          maxDistance={20}
        />
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
        <Environment preset="city" />
      </Canvas>
      {fileName && (
        <div className="absolute bottom-2 left-2 text-white/50 text-xs">
          {fileName}
        </div>
      )}
    </div>
  );
}
