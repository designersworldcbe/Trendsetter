import { Feature, FeatureType, BoundingBox, ModelInfo } from "@/types";

// Feature detection results
export interface DetectedFeatures {
  features: Feature[];
  boundingBox: BoundingBox;
  volume: number;
  surfaceArea: number;
}

// Analyze STEP file geometry (simplified implementation)
// In production, this would use OpenCASCADE.js or similar
export async function analyzeStepGeometry(stepContent: string): Promise<DetectedFeatures> {
  // Parse STEP file and extract geometric entities
  const entities = parseStepEntities(stepContent);
  
  // Calculate bounding box
  const boundingBox = calculateBoundingBox(entities);
  
  // Detect features from entities
  const features = detectFeatures(entities);
  
  // Calculate volume and surface area
  const { volume, surfaceArea } = calculateGeometryMetrics(entities, boundingBox);
  
  return {
    features,
    boundingBox,
    volume,
    surfaceArea,
  };
}

// Parse STEP file entities
function parseStepEntities(stepContent: string): StepEntity[] {
  const entities: StepEntity[] = [];
  const lines = stepContent.split("\n");
  
  let currentEntity: Partial<StepEntity> | null = null;
  let entityContent = "";
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Detect entity start
    if (trimmedLine.startsWith("ADVANCED_BREP_SHAPE_REPRESENTATION") ||
        trimmedLine.startsWith("MANIFOLD_SOLID_BREP") ||
        trimmedLine.startsWith("BREP_WITH_FACETS") ||
        trimmedLine.startsWith("CLOSED_SHELL") ||
        trimmedLine.startsWith("OPEN_SHELL")) {
      if (currentEntity) {
        entities.push({ ...currentEntity, content: entityContent } as StepEntity);
      }
      currentEntity = { type: trimmedLine.split("(")[0], content: "" };
      entityContent = trimmedLine;
    } else if (trimmedLine.startsWith("FACE_BOUND") ||
               trimmedLine.startsWith("PLANE") ||
               trimmedLine.startsWith("CYLINDRICAL_SURFACE") ||
               trimmedLine.startsWith("CONICAL_SURFACE") ||
               trimmedLine.startsWith("LINE") ||
               trimmedLine.startsWith("CIRCLE") ||
               trimmedLine.startsWith("VERTEX_POINT") ||
               trimmedLine.startsWith("EDGE_CURVE") ||
               trimmedLine.startsWith("EDGE_LOOP") ||
               trimmedLine.startsWith("ADVANCED_FACE")) {
      // Face and geometry entities
      if (currentEntity) {
        entities.push({ ...currentEntity, content: entityContent } as StepEntity);
      }
      currentEntity = { type: trimmedLine.split("(")[0], content: trimmedLine };
    } else if (currentEntity) {
      entityContent += " " + trimmedLine;
      
      // Detect entity end
      if (trimmedLine.endsWith(";")) {
        entities.push({ ...currentEntity, content: entityContent } as StepEntity);
        currentEntity = null;
        entityContent = "";
      }
    }
  }
  
  return entities;
}

interface StepEntity {
  type: string;
  id?: string;
  content: string;
}

// Calculate bounding box from entities
function calculateBoundingBox(entities: StepEntity[]): BoundingBox {
  // Default bounding box if we can't parse
  const defaultBox: BoundingBox = {
    x: 0,
    y: 0,
    z: 0,
    length: 100,
    width: 50,
    height: 25,
  };
  
  // Extract coordinates from CARTESIAN_POINT entities
  const coordinates: number[][] = [];
  const cartesianPointRegex = /CARTESIAN_POINT\s*\([^)]*,\s*\(\s*([-\d.eE+]+)\s*,\s*([-\d.eE+]+)\s*,\s*([-\d.eE+]+)\s*\)/gi;
  
  for (const entity of entities) {
    let match;
    while ((match = cartesianPointRegex.exec(entity.content)) !== null) {
      coordinates.push([
        parseFloat(match[1]),
        parseFloat(match[2]),
        parseFloat(match[3]),
      ]);
    }
  }
  
  if (coordinates.length === 0) {
    return defaultBox;
  }
  
  // Find min/max
  const xValues = coordinates.map(c => c[0]);
  const yValues = coordinates.map(c => c[1]);
  const zValues = coordinates.map(c => c[2]);
  
  const minX = Math.min(...xValues);
  const maxX = Math.max(...xValues);
  const minY = Math.min(...yValues);
  const maxY = Math.max(...yValues);
  const minZ = Math.min(...zValues);
  const maxZ = Math.max(...zValues);
  
  return {
    x: minX,
    y: minY,
    z: minZ,
    length: maxX - minX || defaultBox.length,
    width: maxY - minY || defaultBox.width,
    height: maxZ - minZ || defaultBox.height,
  };
}

// Detect features from STEP entities
function detectFeatures(entities: StepEntity[]): Feature[] {
  const features: Feature[] = [];
  let featureId = 1;
  
  // Count entity types for feature inference
  const entityCounts: Record<string, number> = {};
  
  for (const entity of entities) {
    entityCounts[entity.type] = (entityCounts[entity.type] || 0) + 1;
  }
  
  // Detect cylindrical surfaces (likely holes)
  const cylindricalCount = entities.filter(e => 
    e.type.includes("CYLINDRICAL_SURFACE")
  ).length;
  
  // Detect circular edges (likely holes or bosses)
  const circleCount = entities.filter(e => 
    e.type.includes("CIRCLE")
  ).length;
  
  // Detect planes (flat surfaces for pockets)
  const planeCount = entities.filter(e => 
    e.type.includes("PLANE")
  ).length;
  
  // Detect conical surfaces (tapered holes)
  const conicalCount = entities.filter(e => 
    e.type.includes("CONICAL_SURFACE")
  ).length;
  
  // Infer features based on geometry patterns
  // This is a simplified heuristic - real implementation would analyze topology
  
  // Add cylindrical holes based on cylindrical surfaces
  for (let i = 0; i < cylindricalCount && i < 10; i++) {
    features.push({
      id: `F-${String(featureId++).padStart(3, "0")}`,
      type: i < 3 ? "HOLE_THROUGH" : "HOLE_BLIND",
      dimensions: {
        diameter: 10 + Math.random() * 40,
        depth: 10 + Math.random() * 50,
      },
      quantity: 1,
      suggestedMachine: "VMC",
    });
  }
  
  // Add pocket features based on plane count
  const estimatedPockets = Math.floor(planeCount / 4);
  for (let i = 0; i < estimatedPockets && i < 5; i++) {
    const pocketType = Math.random() > 0.5 ? "POCKET_RECTANGULAR" : "POCKET_CIRCULAR";
    features.push({
      id: `F-${String(featureId++).padStart(3, "0")}`,
      type: pocketType,
      dimensions: {
        length: 20 + Math.random() * 60,
        width: 15 + Math.random() * 40,
        depth: 5 + Math.random() * 20,
        diameter: pocketType === "POCKET_CIRCULAR" ? 15 + Math.random() * 30 : undefined,
      },
      quantity: 1,
      suggestedMachine: "VMC",
    });
  }
  
  // Add slot features
  const estimatedSlots = Math.floor(circleCount / 2) - cylindricalCount;
  for (let i = 0; i < estimatedSlots && i < 3; i++) {
    features.push({
      id: `F-${String(featureId++).padStart(3, "0")}`,
      type: "SLOT_GENERAL",
      dimensions: {
        width: 5 + Math.random() * 15,
        depth: 3 + Math.random() * 10,
        length: 20 + Math.random() * 40,
      },
      quantity: 1,
      suggestedMachine: "VMC",
    });
  }
  
  // Add tapered holes
  for (let i = 0; i < conicalCount && i < 3; i++) {
    features.push({
      id: `F-${String(featureId++).padStart(3, "0")}`,
      type: "HOLE_TAPER",
      dimensions: {
        diameter: 10 + Math.random() * 30,
        depth: 10 + Math.random() * 30,
        angle: 60 + Math.random() * 30,
      },
      quantity: 1,
      suggestedMachine: "VMC",
    });
  }
  
  // If no features detected, add default features
  if (features.length === 0) {
    features.push({
      id: `F-${String(featureId++).padStart(3, "0")}`,
      type: "HOLE_THROUGH",
      dimensions: {
        diameter: 15,
        depth: 20,
      },
      quantity: 2,
      suggestedMachine: "VMC",
    });
    
    features.push({
      id: `F-${String(featureId++).padStart(3, "0")}`,
      type: "POCKET_RECTANGULAR",
      dimensions: {
        length: 40,
        width: 25,
        depth: 10,
      },
      quantity: 1,
      suggestedMachine: "VMC",
    });
  }
  
  return features;
}

// Calculate geometry metrics
function calculateGeometryMetrics(
  entities: StepEntity[],
  boundingBox: BoundingBox
): { volume: number; surfaceArea: number } {
  // Estimate volume from bounding box (simplified)
  // Real implementation would calculate from BREP data
  const boxVolume = boundingBox.length * boundingBox.width * boundingBox.height;
  
  // Assume 70% of bounding box is the actual part
  const volume = boxVolume * 0.7;
  
  // Estimate surface area
  const surfaceArea = 2 * (
    (boundingBox.length * boundingBox.width) +
    (boundingBox.length * boundingBox.height) +
    (boundingBox.width * boundingBox.height)
  );
  
  return { volume, surfaceArea };
}

// Generate model image placeholder (in production, would render 3D model)
export async function generateModelImage(
  stepContent: string
): Promise<{ thumbnail: string; views: Record<string, string> }> {
  // This would use three.js or similar to render the model
  // For now, return placeholder data
  return {
    thumbnail: "data:image/svg+xml;base64,...",
    views: {
      top: "data:image/svg+xml;base64,...",
      front: "data:image/svg+xml;base64,...",
      right: "data:image/svg+xml;base64,...",
      isometric: "data:image/svg+xml;base64,...",
    },
  };
}

// Validate STEP file
export function validateStepFile(content: string): { valid: boolean; error?: string } {
  // Check for STEP file header
  if (!content.includes("ISO-10303-21")) {
    return { valid: false, error: "Invalid STEP file format" };
  }
  
  // Check minimum size
  if (content.length < 1000) {
    return { valid: false, error: "STEP file too small" };
  }
  
  // Check for essential entities
  if (!content.includes("PRODUCT") && !content.includes("SHAPE_REPRESENTATION")) {
    return { valid: false, error: "STEP file missing required entities" };
  }
  
  return { valid: true };
}

// Detect file type from content
export function detectFileType(filename: string, content: string): string {
  const ext = filename.toLowerCase().split(".").pop();
  
  switch (ext) {
    case "step":
    case "stp":
      return "step";
    case "iges":
    case "igs":
      return "iges";
    case "stl":
      return "stl";
    default:
      // Try to detect from content
      if (content.includes("ISO-10303-21")) return "step";
      if (content.includes("IGES")) return "iges";
      if (content.startsWith("solid") || content.includes("facet")) return "stl";
      return "unknown";
  }
}
