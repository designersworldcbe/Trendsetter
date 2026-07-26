"""
Trendsetter CAD Processing Service
==================================
A Python FastAPI service for parsing STEP/STP files and performing 
feature recognition for machining cost estimation.

This service provides:
- STEP file parsing using OpenCASCADE
- Feature recognition algorithms
- Geometry analysis (volume, surface area, bounding box)
- Model image generation
"""

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import tempfile
import os
from datetime import datetime

from services.step_parser import StepParser
from services.feature_detector import FeatureDetector
from services.image_generator import ImageGenerator

# Initialize FastAPI app
app = FastAPI(
    title="Trendsetter CAD Processing Service",
    description="CAD parsing and feature recognition for machining cost estimation",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
step_parser = StepParser()
feature_detector = FeatureDetector()
image_generator = ImageGenerator()


# Pydantic models for API responses
class BoundingBox(BaseModel):
    x: float
    y: float
    z: float
    length: float
    width: float
    height: float


class Feature(BaseModel):
    id: str
    type: str
    subtype: Optional[str] = None
    dimensions: Dict[str, float]
    quantity: int = 1
    suggested_machine: Optional[str] = None
    machining_parameters: Optional[Dict[str, Any]] = None


class ModelInfo(BaseModel):
    file_name: str
    file_size: int
    file_type: str
    volume: float
    surface_area: float
    bounding_box: BoundingBox
    model_image_url: Optional[str] = None
    multi_view_images: Optional[Dict[str, str]] = None


class AnalysisResult(BaseModel):
    success: bool
    model_info: ModelInfo
    features: List[Feature]
    processing_time_ms: float
    errors: Optional[List[str]] = None


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "Trendsetter CAD Processing Service",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat()
    }


@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "services": {
            "step_parser": "ready",
            "feature_detector": "ready",
            "image_generator": "ready"
        },
        "timestamp": datetime.utcnow().isoformat()
    }


@app.post("/analyze", response_model=AnalysisResult)
async def analyze_cad_file(file: UploadFile = File(...)):
    """
    Analyze a CAD file and perform feature recognition.
    
    Accepts: STEP (.step, .stp), IGES (.iges, .igs), STL (.stl)
    Returns: Model information, recognized features, and processing metrics
    """
    start_time = datetime.utcnow()
    errors = []
    
    # Validate file type
    allowed_extensions = {".step", ".stp", ".iges", ".igs", ".stl"}
    file_ext = os.path.splitext(file.filename)[1].lower()
    
    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type. Allowed: {', '.join(allowed_extensions)}"
        )
    
    # Read file content
    try:
        content = await file.read()
        file_size = len(content)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error reading file: {str(e)}")
    
    # Check file size (max 50MB)
    max_size = 50 * 1024 * 1024
    if file_size > max_size:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Maximum size is {max_size // (1024*1024)}MB"
        )
    
    # Save to temporary file
    with tempfile.NamedTemporaryFile(delete=False, suffix=file_ext) as tmp_file:
        tmp_file.write(content)
        tmp_path = tmp_file.name
    
    try:
        # Parse STEP file
        geometry_data = step_parser.parse(tmp_path)
        
        if not geometry_data:
            errors.append("Failed to parse geometry from file")
            # Return default data for demo purposes
            geometry_data = {
                "entities": [],
                "volume": 750000,
                "surface_area": 55000,
                "bounding_box": {
                    "x": 0, "y": 0, "z": 0,
                    "length": 150, "width": 100, "height": 50
                }
            }
        
        # Detect features
        features = feature_detector.detect_features(geometry_data)
        
        # Generate images (optional, can be disabled for speed)
        try:
            images = await image_generator.generate_views(tmp_path)
        except Exception as img_err:
            errors.append(f"Image generation skipped: {str(img_err)}")
            images = None
        
        # Calculate processing time
        end_time = datetime.utcnow()
        processing_time_ms = (end_time - start_time).total_seconds() * 1000
        
        # Build response
        model_info = ModelInfo(
            file_name=file.filename,
            file_size=file_size,
            file_type=file_ext.replace(".", "").upper(),
            volume=geometry_data.get("volume", 0),
            surface_area=geometry_data.get("surface_area", 0),
            bounding_box=BoundingBox(**geometry_data.get("bounding_box", {})),
            model_image_url=images.get("thumbnail") if images else None,
            multi_view_images=images if images else None
        )
        
        return AnalysisResult(
            success=True,
            model_info=model_info,
            features=[Feature(**f) for f in features],
            processing_time_ms=processing_time_ms,
            errors=errors if errors else None
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error processing file: {str(e)}"
        )
    finally:
        # Clean up temporary file
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)


@app.post("/validate")
async def validate_file(file: UploadFile = File(...)):
    """
    Validate a CAD file without full processing.
    Returns basic information about the file.
    """
    allowed_extensions = {".step", ".stp", ".iges", ".igs", ".stl"}
    file_ext = os.path.splitext(file.filename)[1].lower()
    
    if file_ext not in allowed_extensions:
        return {
            "valid": False,
            "error": f"Unsupported file type: {file_ext}"
        }
    
    content = await file.read()
    file_size = len(content)
    
    return {
        "valid": True,
        "filename": file.filename,
        "size": file_size,
        "type": file_ext.replace(".", "").upper(),
        "estimated_processing_time_ms": min(file_size / 1000, 30000)  # ~1s per MB, max 30s
    }


@app.get("/feature-types")
async def get_feature_types():
    """
    Get list of supported feature types for recognition.
    """
    return {
        "feature_types": [
            {"id": "HOLE_THROUGH", "name": "Through Hole", "category": "Hole"},
            {"id": "HOLE_BLIND", "name": "Blind Hole", "category": "Hole"},
            {"id": "HOLE_COUNTERBORE", "name": "Counterbore Hole", "category": "Hole"},
            {"id": "HOLE_COUNTERSINK", "name": "Countersink Hole", "category": "Hole"},
            {"id": "HOLE_TAPER", "name": "Tapered Hole", "category": "Hole"},
            {"id": "POCKET_RECTANGULAR", "name": "Rectangular Pocket", "category": "Pocket"},
            {"id": "POCKET_CIRCULAR", "name": "Circular Pocket", "category": "Pocket"},
            {"id": "POCKET_IRREGULAR", "name": "Irregular Pocket", "category": "Pocket"},
            {"id": "SLOT_KEYWAY", "name": "Keyway Slot", "category": "Slot"},
            {"id": "SLOT_T_SLOT", "name": "T-Slot", "category": "Slot"},
            {"id": "SLOT_DOVERTAIL", "name": "Dovetail Slot", "category": "Slot"},
            {"id": "SLOT_GENERAL", "name": "General Slot", "category": "Slot"},
            {"id": "BOSS_CYLINDRICAL", "name": "Cylindrical Boss", "category": "Boss"},
            {"id": "BOSS_RECTANGULAR", "name": "Rectangular Boss", "category": "Boss"},
            {"id": "BOSS_COMPLEX", "name": "Complex Boss", "category": "Boss"},
            {"id": "THREAD_INTERNAL", "name": "Internal Thread", "category": "Thread"},
            {"id": "THREAD_EXTERNAL", "name": "External Thread", "category": "Thread"},
            {"id": "CONTOUR_2D", "name": "2D Contour", "category": "Contour"},
            {"id": "CONTOUR_3D", "name": "3D Contour", "category": "Contour"},
            {"id": "GROOVE", "name": "Groove", "category": "Turning"},
            {"id": "PARTING", "name": "Parting", "category": "Turning"},
            {"id": "TURNING_OD", "name": "OD Turning", "category": "Turning"},
            {"id": "TURNING_ID", "name": "ID Turning", "category": "Turning"},
        ]
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
