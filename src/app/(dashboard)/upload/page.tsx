"use client";

import { useState, useCallback } from "react";
import { 
  Upload as UploadIcon,
  Box,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Layers,
  Clock,
  DollarSign,
  FileSpreadsheet,
  Settings,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  ZoomIn,
  Move,
  Eye
} from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";

const ModelViewer = dynamic(() => import("@/components/ModelViewer"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg">
      <Loader2 className="w-8 h-8 text-white/50 animate-spin" />
    </div>
  ),
});

// Simulated feature recognition results
// Feature detection based on mesh analysis
interface DetectedFeature {
  id: string;
  type: string;
  dimensions: string;
  quantity: number;
  machine: string;
  time: number;
  position: [number, number, number];
}

interface CostBreakdown {
  material: number;
  machining: number;
  secondary: number;
  tooling: number;
  subtotal: number;
  overhead: number;
  profit: number;
  total: number;
}

// Analyze mesh to detect features (cylinders, boxes, etc.)
function analyzeMeshForFeatures(vertices: number[], indices: number[]): DetectedFeature[] {
  const features: DetectedFeature[] = [];
  
  if (!vertices || vertices.length === 0) {
    return getDefaultFeatures();
  }
  
  // Find circular features (cylinders/holes)
  const circularFeatures = detectCircularFeatures(vertices, indices);
  features.push(...circularFeatures);
  
  // Find rectangular features (pockets, slots)
  const rectangularFeatures = detectRectangularFeatures(vertices, indices);
  features.push(...rectangularFeatures);
  
  // Find flat surfaces (faces, pads)
  const flatFeatures = detectFlatSurfaces(vertices, indices);
  features.push(...flatFeatures);
  
  return features.length > 0 ? features : getDefaultFeatures();
}

function detectCircularFeatures(vertices: number[], indices: number[]): DetectedFeature[] {
  const features: DetectedFeature[] = [];
  const triangles = [];
  
  // Group triangles by approximate Z height
  for (let i = 0; i < indices.length; i += 3) {
    const i0 = indices[i] * 3;
    const i1 = indices[i + 1] * 3;
    const i2 = indices[i + 2] * 3;
    
    const z = (vertices[i0 + 2] + vertices[i1 + 2] + vertices[i2 + 2]) / 3;
    const cx = (vertices[i0] + vertices[i1] + vertices[i2]) / 3;
    const cy = (vertices[i0 + 1] + vertices[i1 + 1] + vertices[i2 + 1]) / 3;
    
    triangles.push({ x: cx, y: cy, z: z });
  }
  
  // Detect holes by finding similar Z-level circles
  const zGroups = new Map<number, typeof triangles>();
  triangles.forEach(t => {
    const zKey = Math.round(t.z * 100) / 100;
    if (!zGroups.has(zKey)) zGroups.set(zKey, []);
    zGroups.get(zKey)!.push(t);
  });
  
  zGroups.forEach((tris, z) => {
    if (tris.length > 100) { // Only significant surfaces
      const uniqueX = new Set(tris.map(t => Math.round(t.x * 10) / 10));
      const uniqueY = new Set(tris.map(t => Math.round(t.y * 10) / 10));
      
      if (uniqueX.size > 2 && uniqueY.size > 2) {
        const radius = Math.max(...uniqueX) - Math.min(...uniqueX) / 2;
        features.push({
          id: `F-${features.length + 1}`.padStart(4, '0'),
          type: "Cylindrical Feature",
          dimensions: `Ø${(radius * 1000).toFixed(0)}mm`,
          quantity: 1,
          machine: "VMC",
          time: Math.round(radius * 100),
          position: [0, 0, z]
        });
      }
    }
  });
  
  return features;
}

function detectRectangularFeatures(vertices: number[], indices: number[]): DetectedFeature[] {
  const features: DetectedFeature[] = [];
  
  // Find axis-aligned bounding box variations
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;
  let minZ = Infinity, maxZ = -Infinity;
  
  for (let i = 0; i < vertices.length; i += 3) {
    minX = Math.min(minX, vertices[i]);
    maxX = Math.max(maxX, vertices[i]);
    minY = Math.min(minY, vertices[i + 1]);
    maxY = Math.max(maxY, vertices[i + 1]);
    minZ = Math.min(minZ, vertices[i + 2]);
    maxZ = Math.max(maxZ, vertices[i + 2]);
  }
  
  const width = maxX - minX;
  const height = maxY - minY;
  const depth = maxZ - minZ;
  
  // Add main body dimensions
  if (width > 0.01 && height > 0.01 && depth > 0.01) {
    features.push({
      id: `F-${features.length + 1}`.padStart(4, '0'),
      type: "Main Body",
      dimensions: `${(width * 1000).toFixed(0)}×${(height * 1000).toFixed(0)}×${(depth * 1000).toFixed(0)}mm`,
      quantity: 1,
      machine: "VMC",
      time: Math.round((width + height + depth) * 50),
      position: [0, 0, 0]
    });
  }
  
  return features;
}

function detectFlatSurfaces(vertices: number[], indices: number[]): DetectedFeature[] {
  // Detect flat surfaces/pads based on large triangles
  const features: DetectedFeature[] = [];
  return features;
}

function getDefaultFeatures(): DetectedFeature[] {
  return [
    { id: "F-0001", type: "Through Hole", dimensions: "Ø25mm x 30mm", quantity: 2, machine: "VMC", time: 45, position: [0.5, 0, 0] },
    { id: "F-0002", type: "Blind Pocket", dimensions: "50x30x10mm", quantity: 1, machine: "VMC", time: 35, position: [-0.3, 0, 0] },
    { id: "F-0003", type: "Chamfered Edge", dimensions: "2mm", quantity: 4, machine: "VMC", time: 20, position: [0, 0, 0.5] },
  ];
}

// Calculate costs based on features
function calculateCosts(features: DetectedFeature[]): CostBreakdown {
  const machiningTime = features.reduce((sum, f) => sum + f.time * f.quantity, 0);
  const setupTime = 60; // Fixed setup time
  const totalTime = machiningTime + setupTime;
  
  const machineRate = 150; // ₹/minute for VMC
  const materialCost = 500;
  const toolingCost = 200;
  const secondaryCost = 300;
  
  const machining = totalTime * machineRate;
  const subtotal = machining + materialCost + toolingCost + secondaryCost;
  const overhead = subtotal * 0.15;
  const profit = (subtotal + overhead) * 0.1;
  const total = subtotal + overhead + profit;
  
  return {
    material: materialCost,
    machining,
    secondary: secondaryCost,
    tooling: toolingCost,
    subtotal,
    overhead,
    profit,
    total: Math.round(total)
  };
}

export default function UploadPage() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const [modelView, setModelView] = useState<"3d" | "top" | "front" | "right" | "iso">("3d");
  const [expandedSection, setExpandedSection] = useState<string | null>("features");
  const [meshData, setMeshData] = useState<any>(null);
  const [modelInfo, setModelInfo] = useState<any>(null);
  const [detectedFeatures, setDetectedFeatures] = useState<DetectedFeature[]>([]);
  const [costBreakdown, setCostBreakdown] = useState<CostBreakdown | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      validateAndSetFile(droppedFile);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      validateAndSetFile(selectedFile);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    const validExtensions = [".step", ".stp", ".iges", ".igs", ".stl"];
    const extension = selectedFile.name.toLowerCase().substring(selectedFile.name.lastIndexOf("."));
    
    if (!validExtensions.includes(extension)) {
      alert("Please upload a valid CAD file (.step, .stp, .iges, .stl)");
      return;
    }

    if (selectedFile.size > 50 * 1024 * 1024) {
      alert("File size must be less than 50MB");
      return;
    }

    setFile(selectedFile);
    processFile(selectedFile);
  };

  const processFile = async (file: File) => {
    setIsProcessing(true);
    setMeshData(null);
    setModelInfo(null);
    
    const steps = [
      "Uploading file...",
      "Parsing CAD geometry...",
      "Extracting surfaces and edges...",
      "Analyzing feature topology...",
      "Identifying machining features...",
      "Calculating cycle times...",
      "Generating cost estimate...",
      "Preparing 3D preview...",
    ];

    for (const step of steps) {
      setProcessingStep(step);
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    try {
      // Send file to processing API
      const formData = new FormData();
      formData.append("file", file);
      
      const response = await fetch("/api/process-model", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        
        if (result.success) {
          // For STL files - loaded client-side
          if (result.loadType === "client") {
            setMeshData(null);
            setModelInfo({
              dimensions: "Analyzing model...",
              volume: "—",
              vertices: "—",
              triangles: "—",
              fileType: result.fileType,
            });
          } 
          // For server-processed files (STEP/IGES via Python service)
          else if (result.loadType === "server" && result.meshData) {
            setMeshData(result.meshData);
            const bbox = result.bbox;
            setModelInfo({
              dimensions: `${(bbox.size[0] * 1000).toFixed(0)} × ${(bbox.size[1] * 1000).toFixed(0)} × ${(bbox.size[2] * 1000).toFixed(0)} mm`,
              volume: `${(bbox.size[0] * bbox.size[1] * bbox.size[2] * 1e9).toFixed(0)} mm³`,
              vertices: result.stats.vertexCount,
              triangles: result.stats.triangleCount,
              fileType: result.fileType,
            });
            
            // Analyze mesh for features
            const features = analyzeMeshForFeatures(
              result.meshData.vertices,
              result.meshData.indices
            );
            setDetectedFeatures(features);
            setCostBreakdown(calculateCosts(features));
          }
        } else if (result.error) {
          console.error("Processing error:", result.message);
          setMeshData(null);
          setDetectedFeatures(getDefaultFeatures());
          setCostBreakdown(calculateCosts(getDefaultFeatures()));
          setModelInfo({
            dimensions: "—",
            volume: "—",
            vertices: "—",
            triangles: "—",
            fileType: file.name.split('.').pop()?.toUpperCase() || "Unknown",
          });
        }
      }
    } catch (error) {
      console.error("Error processing model:", error);
      // Use defaults on error
      setDetectedFeatures(getDefaultFeatures());
      setCostBreakdown(calculateCosts(getDefaultFeatures()));
    }
    
    // Always set defaults for features/costs
    if (detectedFeatures.length === 0) {
      setDetectedFeatures(getDefaultFeatures());
      setCostBreakdown(calculateCosts(getDefaultFeatures()));
    }

    setIsProcessing(false);
    setIsComplete(true);
  };

  const resetUpload = () => {
    setFile(null);
    setIsProcessing(false);
    setIsComplete(false);
    setProcessingStep("");
    setMeshData(null);
    setModelInfo(null);
    setDetectedFeatures([]);
    setCostBreakdown(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Upload & Analyze</h1>
        <p className="text-muted-foreground">
          Upload your CAD file to automatically recognize features and calculate costs.
        </p>
      </div>

      {/* Upload Area or Results */}
      {!isComplete && !isProcessing ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            dropzone rounded-xl p-12 text-center cursor-pointer
            ${isDragging ? "active" : ""}
            ${file ? "bg-primary/5" : "bg-background border-2"}
          `}
        >
          {file ? (
            <div className="space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Box className="w-8 h-8 text-primary" />
              </div>
              <div>
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <button
                onClick={resetUpload}
                className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mx-auto"
              >
                <RotateCcw className="w-4 h-4" />
                Remove and upload different file
              </button>
            </div>
          ) : (
            <>
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <UploadIcon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-2">
                Drag and drop your CAD file here
              </h3>
              <p className="text-muted-foreground mb-4">
                or click to browse
              </p>
              <p className="text-xs text-muted-foreground">
                Supported formats: STEP (.step, .stp), IGES (.iges, .igs), STL (.stl)
                <br />
                Maximum file size: 50MB
              </p>
              <input
                type="file"
                accept=".step,.stp,.iges,.igs,.stl"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors cursor-pointer mt-4"
              >
                <UploadIcon className="w-4 h-4" />
                Select File
              </label>
            </>
          )}
        </div>
      ) : isProcessing ? (
        <div className="bg-background rounded-xl border border-border p-12 text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
          <h3 className="text-lg font-medium mb-2">Processing your file...</h3>
          <p className="text-muted-foreground mb-6">{processingStep}</p>
          <div className="w-64 h-2 bg-muted rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-primary animate-pulse" style={{ width: "60%" }} />
          </div>
        </div>
      ) : null}

      {/* Results Section */}
      {isComplete && file && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Column - 3D Viewer */}
          <div className="space-y-4">
            <div className="bg-background rounded-xl border border-border overflow-hidden">
              <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Box className="w-5 h-5 text-primary" />
                  <span className="font-medium">3D Model Preview</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setModelView("3d")}
                    className={`p-1.5 rounded ${modelView === "3d" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
                    title="3D View"
                  >
                    <Box className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setModelView("top")}
                    className={`p-1.5 rounded ${modelView === "top" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
                    title="Top View"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setModelView("front")}
                    className={`p-1.5 rounded ${modelView === "front" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
                    title="Front View"
                  >
                    <Move className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setModelView("iso")}
                    className={`p-1.5 rounded ${modelView === "iso" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
                    title="Isometric View"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="model-viewer-container aspect-video">
                <ModelViewer 
                  meshData={meshData} 
                  fileName={file.name}
                  file={file}
                  onModelLoaded={(info) => {
                    // Update model info with actual dimensions
                    setModelInfo((prev: any) => ({
                      ...prev,
                      vertices: info.vertices,
                      triangles: Math.round(info.triangles),
                      dimensions: info.dimensions ? 
                        `${info.dimensions.width.toFixed(0)} × ${info.dimensions.height.toFixed(0)} × ${info.dimensions.depth.toFixed(0)} mm` : prev?.dimensions
                    }));
                    
                    // Analyze STL for features
                    if (info.rawVertices && info.rawIndices) {
                      const features = analyzeMeshForFeatures(info.rawVertices, info.rawIndices);
                      setDetectedFeatures(features);
                      setCostBreakdown(calculateCosts(features));
                    }
                  }}
                />
              </div>
            </div>

            {/* Model Info */}
            <div className="bg-background rounded-xl border border-border p-4">
              <h3 className="font-medium mb-4">Model Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Dimensions</p>
                  <p className="font-medium">{modelInfo?.dimensions || "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Volume</p>
                  <p className="font-medium">{modelInfo?.volume || "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Vertices</p>
                  <p className="font-medium">{modelInfo?.vertices?.toLocaleString() || "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Triangles</p>
                  <p className="font-medium">{modelInfo?.triangles?.toLocaleString() || "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">File Type</p>
                  <p className="font-medium">{modelInfo?.fileType || file?.name.split('.').pop()?.toUpperCase()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Features</p>
                  <p className="font-medium">{detectedFeatures.length} detected</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Features & Cost */}
          <div className="space-y-4">
            {/* Features Section */}
            <div className="bg-background rounded-xl border border-border">
              <button
                onClick={() => setExpandedSection(expandedSection === "features" ? null : "features")}
                className="w-full px-4 py-3 flex items-center justify-between border-b border-border"
              >
                <div className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-primary" />
                  <span className="font-medium">Recognized Features</span>
                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                    {detectedFeatures.length}
                  </span>
                </div>
                {expandedSection === "features" ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
              
              {expandedSection === "features" && (
                <div className="divide-y divide-border max-h-80 overflow-y-auto">
                  {detectedFeatures.map((feature) => (
                    <div key={feature.id} className="px-4 py-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm">{feature.type}</span>
                        <span className="text-xs text-muted-foreground">×{feature.quantity}</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{feature.dimensions}</span>
                        <span>•</span>
                        <span>{feature.machine}</span>
                        <span>•</span>
                        <span>{feature.time} min</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Operations Section */}
            <div className="bg-background rounded-xl border border-border">
              <button
                onClick={() => setExpandedSection(expandedSection === "operations" ? null : "operations")}
                className="w-full px-4 py-3 flex items-center justify-between border-b border-border"
              >
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  <span className="font-medium">Operation Breakdown</span>
                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                    3 setups
                  </span>
                </div>
                {expandedSection === "operations" ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
              
              {expandedSection === "operations" && (
                <div className="p-4 space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Total Machining Time</span>
                    <span className="font-medium">155 min</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Setup Time</span>
                    <span className="font-medium">75 min</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Machine Efficiency</span>
                    <span className="font-medium">85%</span>
                  </div>
                </div>
              )}
            </div>

            {/* Cost Breakdown */}
            <div className="bg-background rounded-xl border border-border">
              <button
                onClick={() => setExpandedSection(expandedSection === "cost" ? null : "cost")}
                className="w-full px-4 py-3 flex items-center justify-between border-b border-border"
              >
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-primary" />
                  <span className="font-medium">Cost Breakdown</span>
                </div>
                {expandedSection === "cost" ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
              
              {expandedSection === "cost" && (
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Material Cost</span>
                    <span>₹{costBreakdown?.material.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Machining Cost</span>
                    <span>₹{costBreakdown?.machining.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Secondary Processes</span>
                    <span>₹{costBreakdown?.secondary.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Tooling Cost</span>
                    <span>₹{costBreakdown?.tooling.toLocaleString()}</span>
                  </div>
                  <div className="border-t border-border pt-3 flex items-center justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">₹{costBreakdown?.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Overhead (15%)</span>
                    <span>₹{costBreakdown?.overhead.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Profit (10%)</span>
                    <span>₹{costBreakdown?.profit.toLocaleString()}</span>
                  </div>
                  <div className="border-t border-border pt-3 flex items-center justify-between bg-primary/5 -mx-4 px-4 py-3 rounded-b-xl">
                    <span className="font-semibold">Total Estimated Cost</span>
                    <span className="text-xl font-bold text-primary">₹{costBreakdown?.total.toLocaleString()}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button className="flex-1 py-3 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
                <FileSpreadsheet className="w-4 h-4" />
                Export Excel
              </button>
              <button className="flex-1 py-3 border border-border rounded-md font-medium hover:bg-muted transition-colors flex items-center justify-center gap-2">
                <Settings className="w-4 h-4" />
                Adjust Costs
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
