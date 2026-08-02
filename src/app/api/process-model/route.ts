import { NextRequest, NextResponse } from "next/server";

// Python STEP converter service URL (deploy this separately or use environment variable)
const STEP_SERVICE_URL = process.env.STEP_SERVICE_URL || "http://localhost:8000";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    
    const fileName = file.name.toLowerCase();
    const isStlFile = fileName.endsWith(".stl");
    const isStepFile = fileName.endsWith(".step") || fileName.endsWith(".stp");
    const isIgesFile = fileName.endsWith(".iges") || fileName.endsWith(".igs");
    
    // For STL files, return special indicator - they'll be loaded client-side
    if (isStlFile) {
      return NextResponse.json({
        success: true,
        fileName: file.name,
        fileType: "STL",
        loadType: "client",
        message: "STL file - will be loaded client-side"
      });
    }
    
    // For STEP/IGES, try to call the Python converter service
    if (isStepFile || isIgesFile) {
      try {
        // Forward the file to Python service
        const pythonFormData = new FormData();
        pythonFormData.append("file", file);
        
        const response = await fetch(`${STEP_SERVICE_URL}/convert`, {
          method: "POST",
          body: pythonFormData,
          signal: AbortSignal.timeout(60000) // 60 second timeout
        });
        
        if (response.ok) {
          const result = await response.json();
          
          // Transform the response to our format
          return NextResponse.json({
            success: true,
            fileName: file.name,
            fileType: result.fileType,
            loadType: "server",
            meshData: {
              vertices: result.vertices,
              normals: result.normals,
              indices: result.indices
            },
            bbox: result.bbox,
            stats: result.stats,
            source: result.source,
            message: "Model processed with " + result.source
          });
        } else {
          const errorText = await response.text();
          console.error("STEP service error:", errorText);
          throw new Error("STEP service returned error");
        }
      } catch (serviceError: any) {
        console.error("Failed to call STEP service:", serviceError);
        
        // Return a message indicating the service is not available
        return NextResponse.json({
          success: false,
          error: "STEP converter service not available",
          message: "Please deploy the STEP converter service or use STL format",
          details: serviceError.message,
          setupInstructions: {
            step1: "cd python-service",
            step2: "pip install -r requirements.txt",
            step3: "python step_converter.py",
            step4: "Or use Docker: docker build -t step-converter . && docker run -p 8000:8000"
          }
        }, { status: 503 });
      }
    }
    
    return NextResponse.json({ error: "Unsupported file format" }, { status: 400 });
    
  } catch (error) {
    console.error("Error processing model:", error);
    return NextResponse.json(
      { error: "Failed to process model" },
      { status: 500 }
    );
  }
}
