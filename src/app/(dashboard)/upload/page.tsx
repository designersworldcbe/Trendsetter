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
const mockFeatures = [
  { id: "F-001", type: "Through Hole", dimensions: "Ø25mm x 30mm", quantity: 4, machine: "VMC", time: 45 },
  { id: "F-002", type: "Blind Hole", dimensions: "Ø10mm x 15mm", quantity: 2, machine: "VMC", time: 20 },
  { id: "F-003", type: "Rectangular Pocket", dimensions: "50x30x10mm", quantity: 1, machine: "VMC", time: 35 },
  { id: "F-004", type: "Keyway Slot", dimensions: "40x8x5mm", quantity: 2, machine: "VMC", time: 25 },
  { id: "F-005", type: "Cylindrical Boss", dimensions: "Ø20mm x 5mm", quantity: 3, machine: "Lathe", time: 30 },
];

const mockCost = {
  material: 450,
  machining: 2100,
  secondary: 300,
  tooling: 150,
  subtotal: 3000,
  overhead: 450,
  profit: 345,
  total: 3795,
};

export default function UploadPage() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const [modelView, setModelView] = useState<"3d" | "top" | "front" | "right" | "iso">("3d");
  const [expandedSection, setExpandedSection] = useState<string | null>("features");

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
      await new Promise(resolve => setTimeout(resolve, 400));
    }

    setIsProcessing(false);
    setIsComplete(true);
  };

  const resetUpload = () => {
    setFile(null);
    setIsProcessing(false);
    setIsComplete(false);
    setProcessingStep("");
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
                <ModelViewer fileName={file.name} />
              </div>
            </div>

            {/* Model Info */}
            <div className="bg-background rounded-xl border border-border p-4">
              <h3 className="font-medium mb-4">Model Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Dimensions</p>
                  <p className="font-medium">150 × 100 × 50 mm</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Volume</p>
                  <p className="font-medium">750,000 mm³</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Surface Area</p>
                  <p className="font-medium">55,000 mm²</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Features</p>
                  <p className="font-medium">{mockFeatures.length} detected</p>
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
                    {mockFeatures.length}
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
                  {mockFeatures.map((feature) => (
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
                    <span>₹{mockCost.material.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Machining Cost</span>
                    <span>₹{mockCost.machining.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Secondary Processes</span>
                    <span>₹{mockCost.secondary.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Tooling Cost</span>
                    <span>₹{mockCost.tooling.toLocaleString()}</span>
                  </div>
                  <div className="border-t border-border pt-3 flex items-center justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">₹{mockCost.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Overhead (15%)</span>
                    <span>₹{mockCost.overhead.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Profit (10%)</span>
                    <span>₹{mockCost.profit.toLocaleString()}</span>
                  </div>
                  <div className="border-t border-border pt-3 flex items-center justify-between bg-primary/5 -mx-4 px-4 py-3 rounded-b-xl">
                    <span className="font-semibold">Total Estimated Cost</span>
                    <span className="text-xl font-bold text-primary">₹{mockCost.total.toLocaleString()}</span>
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
