"use client";

import { useRef, Suspense, useEffect, useState, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stage, Environment } from "@react-three/drei";
import * as THREE from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";

interface MeshData {
  vertices: number[];
  normals: number[];
  indices: number[];
}

interface ModelViewerProps {
  meshData?: MeshData;
  fileName?: string;
  modelUrl?: string;
  file?: File | null;
  onModelLoaded?: (info: { vertices: number; triangles: number; bbox: any }) => void;
}

// Component to render actual mesh data
function MeshModel({ meshData }: { meshData: MeshData }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
  });

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    
    if (meshData.vertices && meshData.vertices.length > 0) {
      geo.setAttribute(
        'position',
        new THREE.Float32BufferAttribute(meshData.vertices, 3)
      );
    }
    
    if (meshData.normals && meshData.normals.length > 0) {
      geo.setAttribute(
        'normal',
        new THREE.Float32BufferAttribute(meshData.normals, 3)
      );
    }
    
    if (meshData.indices && meshData.indices.length > 0) {
      geo.setIndex(meshData.indices);
    }

    if (!meshData.normals || meshData.normals.length === 0) {
      geo.computeVertexNormals();
    }
    
    return geo;
  }, [meshData]);

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

// STL Model Loader Component
function STLModel({ file, onModelLoaded }: { file: File; onModelLoaded?: (info: any) => void }) {
  const groupRef = useRef<THREE.Group>(null);
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loader = new STLLoader();
    
    loader.load(
      URL.createObjectURL(file),
      (geo) => {
        // Center the geometry
        geo.computeBoundingBox();
        const center = new THREE.Vector3();
        geo.boundingBox?.getCenter(center);
        geo.translate(-center.x, -center.y, -center.z);
        
        // Scale to fit view
        const size = new THREE.Vector3();
        geo.boundingBox?.getSize(size);
        const maxDim = Math.max(size.x, size.y, size.z);
        if (maxDim > 2) {
          const scale = 2 / maxDim;
          geo.scale(scale, scale, scale);
        }
        
        setGeometry(geo);
        setLoading(false);
        
        if (onModelLoaded) {
          onModelLoaded({
            vertices: geo.attributes.position.count,
            triangles: geo.index ? geo.index.count / 3 : geo.attributes.position.count / 3,
            bbox: geo.boundingBox
          });
        }
      },
      undefined,
      (err) => {
        console.error("STL loading error:", err);
        setError("Failed to load STL file");
        setLoading(false);
      }
    );
  }, [file, onModelLoaded]);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
  });

  if (loading) return null;
  if (error) return null;

  return (
    <group ref={groupRef}>
      {geometry && (
        <mesh geometry={geometry} castShadow receiveShadow>
          <meshStandardMaterial 
            color="#6366f1" 
            metalness={0.3} 
            roughness={0.4}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
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
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[2, 0.8, 1.2]} />
        <meshStandardMaterial color="#4f46e5" metalness={0.4} roughness={0.3} />
      </mesh>
      
      <mesh position={[0, 0.6, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.3, 0.4, 32]} />
        <meshStandardMaterial color="#818cf8" metalness={0.5} roughness={0.2} />
      </mesh>
      
      <mesh position={[0.7, 0, 0.65]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.4, 32]} />
        <meshStandardMaterial color="#312e81" metalness={0.6} roughness={0.2} />
      </mesh>
      <mesh position={[-0.7, 0, 0.65]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.4, 32]} />
        <meshStandardMaterial color="#312e81" metalness={0.6} roughness={0.2} />
      </mesh>
      
      <mesh position={[0, -0.5, 0]} castShadow>
        <boxGeometry args={[2.2, 0.2, 1.4]} />
        <meshStandardMaterial color="#3730a3" metalness={0.3} roughness={0.5} />
      </mesh>
    </group>
  );
}

// GLTF Model Loader
function GLTFModelComponent({ url }: { url: string }) {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
  });

  const [scene, setScene] = useState<THREE.Group | null>(null);

  useEffect(() => {
    import("@react-three/drei").then((drei) => {
      // Use useGLTF dynamically
    });
  }, [url]);

  return <group ref={groupRef}>{scene && <primitive object={scene} />}</group>;
}

function Scene({ meshData, file }: { meshData?: MeshData; file?: File | null }) {
  const [autoRotate, setAutoRotate] = useState(true);

  return (
    <>
      <Suspense fallback={null}>
        <Stage environment="city" intensity={0.6}>
          {file ? (
            <STLModel file={file} />
          ) : meshData && meshData.vertices.length > 0 ? (
            <MeshModel meshData={meshData} />
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
        minDistance={0.5}
        maxDistance={10}
        onStart={() => setAutoRotate(false)}
      />
      
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
      <directionalLight position={[-5, 5, -5]} intensity={0.3} />
    </>
  );
}

export default function ModelViewer({ meshData, fileName, file, onModelLoaded }: ModelViewerProps) {
  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-lg overflow-hidden">
      <Canvas 
        shadows 
        camera={{ position: [3, 2, 5], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <Scene meshData={meshData} file={file} />
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
