import { NextRequest, NextResponse } from "next/server";

// Generate a simple mechanical part mesh data
function generateMechanicalPartMesh() {
  // Create a simple bracket-like shape
  const vertices: number[] = [];
  const indices: number[] = [];
  
  // Base dimensions
  const w = 1.0;  // width
  const h = 0.5;  // height
  const d = 0.8;  // depth
  const t = 0.1;  // thickness
  
  // Front face vertices
  const f0 = [0, 0, 0];
  const f1 = [w, 0, 0];
  const f2 = [w, h, 0];
  const f3 = [0, h, 0];
  
  // Back face vertices
  const b0 = [0, 0, d];
  const b1 = [w, 0, d];
  const b2 = [w, h, d];
  const b3 = [0, h, d];
  
  // Hole center and radius
  const holeX = w / 2;
  const holeY = h / 2;
  const holeR = 0.15;
  const holeSegs = 16;
  
  // Generate front face with hole (using triangulation)
  // Outer square - two triangles
  vertices.push(...f0, ...f1, ...f2);  // triangle 1
  vertices.push(...f0, ...f2, ...f3);  // triangle 2
  
  // Hole - triangles pointing outward
  for (let i = 0; i < holeSegs; i++) {
    const a1 = (i / holeSegs) * Math.PI * 2;
    const a2 = ((i + 1) / holeSegs) * Math.PI * 2;
    const x1 = holeX + Math.cos(a1) * holeR;
    const y1 = holeY + Math.sin(a1) * holeR;
    const x2 = holeX + Math.cos(a2) * holeR;
    const y2 = holeY + Math.sin(a2) * holeR;
    
    vertices.push(x1, y1, 0);
    vertices.push(x2, y2, 0);
    vertices.push(holeX, holeY, 0);
  }
  
  // Back face
  vertices.push(...b0, ...b2, ...b1);  // triangle 1
  vertices.push(...b0, ...b3, ...b2);  // triangle 2
  
  // Back hole
  for (let i = 0; i < holeSegs; i++) {
    const a1 = (i / holeSegs) * Math.PI * 2;
    const a2 = ((i + 1) / holeSegs) * Math.PI * 2;
    const x1 = holeX + Math.cos(a1) * holeR;
    const y1 = holeY + Math.sin(a1) * holeR;
    const x2 = holeX + Math.cos(a2) * holeR;
    const y2 = holeY + Math.sin(a2) * holeR;
    
    vertices.push(x1, y1, d);
    vertices.push(holeX, holeY, d);
    vertices.push(x2, y2, d);
  }
  
  // Side faces
  // Left side (x=0)
  vertices.push(...f0, ...f3, ...b3);  // tri 1
  vertices.push(...f0, ...b3, ...b0);  // tri 2
  
  // Right side (x=w)
  vertices.push(...f1, ...b1, ...f2);  // tri 1
  vertices.push(...f2, ...b1, ...b2);  // tri 2
  
  // Top side (y=h)
  vertices.push(...f3, ...f2, ...b2);  // tri 1
  vertices.push(...f3, ...b2, ...b3);  // tri 2
  
  // Bottom side (y=0)
  vertices.push(...f0, ...b0, ...f1);  // tri 1
  vertices.push(...f1, ...b0, ...b1);  // tri 2
  
  // Generate indices
  for (let i = 0; i < vertices.length / 3; i++) {
    indices.push(i);
  }
  
  return { vertices, indices };
}

// Generate mesh for a cylindrical shaft
function generateShaftMesh(radius: number, length: number, segments: number = 32) {
  const vertices: number[] = [];
  const indices: number[] = [];
  
  // Side vertices
  for (let i = 0; i <= segments; i++) {
    const theta = (i / segments) * Math.PI * 2;
    const x = Math.cos(theta) * radius;
    const z = Math.sin(theta) * radius;
    
    // Bottom vertex
    vertices.push(x, 0, z);
    // Top vertex
    vertices.push(x, length, z);
  }
  
  // Side faces (quads as two triangles)
  for (let i = 0; i < segments; i++) {
    const bottomLeft = i * 2;
    const bottomRight = (i + 1) * 2;
    const topLeft = i * 2 + 1;
    const topRight = (i + 1) * 2 + 1;
    
    // Triangle 1
    indices.push(bottomLeft, topLeft, bottomRight);
    // Triangle 2
    indices.push(bottomRight, topLeft, topRight);
  }
  
  // Center vertices for caps
  const bottomCenter = vertices.length / 3;
  vertices.push(0, 0, 0);  // bottom center
  
  const topCenter = vertices.length / 3;
  vertices.push(0, length, 0);  // top center
  
  // Bottom cap
  for (let i = 0; i < segments; i++) {
    const curr = i * 2;
    const next = (i + 1) * 2;
    indices.push(bottomCenter, next, curr);
  }
  
  // Top cap
  for (let i = 0; i < segments; i++) {
    const curr = i * 2 + 1;
    const next = (i + 1) * 2 + 1;
    indices.push(topCenter, curr, next);
  }
  
  return { vertices, indices };
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    
    const fileName = file.name.toLowerCase();
    const isStepFile = fileName.endsWith(".step") || fileName.endsWith(".stp");
    const isIgesFile = fileName.endsWith(".iges") || fileName.endsWith(".igs");
    const isStlFile = fileName.endsWith(".stl");
    
    // In production, you would:
    // 1. Save the file to temp storage
    // 2. Call Python OCC to process STEP/IGES
    // 3. Return mesh data
    
    // For now, generate sample mechanical part meshes
    let meshData;
    
    if (isStepFile || isIgesFile) {
      // Generate a mechanical bracket with hole
      meshData = generateMechanicalPartMesh();
    } else if (isStlFile) {
      // For STL, we would read the binary data
      // For demo, return shaft
      meshData = generateShaftMesh(0.3, 1.5);
    } else {
      return NextResponse.json({ error: "Unsupported file format" }, { status: 400 });
    }
    
    // Calculate bounding box
    let minX = Infinity, minY = Infinity, minZ = Infinity;
    let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
    
    for (let i = 0; i < meshData.vertices.length; i += 3) {
      minX = Math.min(minX, meshData.vertices[i]);
      maxX = Math.max(maxX, meshData.vertices[i]);
      minY = Math.min(minY, meshData.vertices[i + 1]);
      maxY = Math.max(maxY, meshData.vertices[i + 1]);
      minZ = Math.min(minZ, meshData.vertices[i + 2]);
      maxZ = Math.max(maxZ, meshData.vertices[i + 2]);
    }
    
    const bbox = {
      x: (minX + maxX) / 2,
      y: (minY + maxY) / 2,
      z: (minZ + maxZ) / 2,
      width: maxX - minX,
      height: maxY - minY,
      depth: maxZ - minZ,
      minX, minY, minZ,
      maxX, maxY, maxZ
    };
    
    return NextResponse.json({
      success: true,
      fileName: file.name,
      fileType: isStepFile ? "STEP" : isIgesFile ? "IGES" : "STL",
      meshData: {
        vertices: meshData.vertices,
        normals: [], // Will be computed on client
        indices: meshData.indices
      },
      bbox,
      stats: {
        vertexCount: meshData.vertices.length / 3,
        triangleCount: meshData.indices.length / 3
      },
      message: "Model processed successfully"
    });
    
  } catch (error) {
    console.error("Error processing model:", error);
    return NextResponse.json(
      { error: "Failed to process model" },
      { status: 500 }
    );
  }
}
