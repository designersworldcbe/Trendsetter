#!/usr/bin/env python3
"""
STEP/IGES to Mesh Converter Service
Uses trimesh for CAD file processing (supports STEP, IGES, STL)
"""

import os
import io
import json
import tempfile
from typing import Optional
from pathlib import Path

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn

import trimesh
import numpy as np
print("Trimesh loaded successfully")

app = FastAPI(
    title="STEP/IGES Converter API",
    description="Convert STEP and IGES files to mesh data for 3D visualization"
)

# CORS middleware for Next.js
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_bounding_box(mesh):
    """Get bounding box of mesh"""
    try:
        bounds = mesh.bounds
        center = mesh.centroid
        size = bounds[1] - bounds[0]
        return {
            "min": bounds[0].tolist(),
            "max": bounds[1].tolist(),
            "center": center.tolist(),
            "size": size.tolist()
        }
    except Exception as e:
        print(f"Bounding box error: {e}")
        return {
            "min": [-1, -1, -1],
            "max": [1, 1, 1],
            "center": [0, 0, 0],
            "size": [2, 2, 2]
        }


def process_file(file_path: str) -> Optional[dict]:
    """Process CAD file using trimesh"""
    try:
        print(f"Processing file: {file_path}")
        
        # Load the mesh using trimesh (supports STEP, IGES, STL if pyglet installed)
        mesh = trimesh.load(file_path, force='mesh')
        
        if mesh is None:
            print("Failed to load mesh - result is None")
            return None
        
        # Handle scene vs single mesh
        if isinstance(mesh, trimesh.Scene):
            print(f"Got scene with {len(mesh.geometry)} geometries")
            # Merge all meshes in scene
            geometries = []
            for name, geom in mesh.geometry.items():
                if isinstance(geom, trimesh.Trimesh):
                    geometries.append(geom)
            if geometries:
                mesh = trimesh.util.concatenate(geometries)
            else:
                print("No Trimesh objects found in scene")
                return None
        
        if not isinstance(mesh, trimesh.Trimesh):
            print(f"Unexpected type: {type(mesh)}")
            return None
        
        print(f"Mesh loaded: {len(mesh.vertices)} vertices, {len(mesh.faces)} faces")
        
        # Center the mesh at origin
        mesh.apply_translation(-mesh.centroid)
        
        # Scale to reasonable size (normalize)
        max_dim = np.max(mesh.bounds[1] - mesh.bounds[0])
        if max_dim > 0:
            scale = 2.0 / max_dim  # Normalize to fit in 2-unit sphere
            mesh.apply_scale(scale)
        
        # Get vertex and face data
        vertices = mesh.vertices.flatten().tolist()
        indices = mesh.faces.flatten().tolist()
        
        # Compute normals
        mesh.vertex_normals
        normals = mesh.vertex_normals.flatten().tolist()
        
        bbox = get_bounding_box(mesh)
        
        print(f"Processed: {len(vertices)} vertices, {len(indices)} indices")
        
        return {
            "vertices": vertices,
            "normals": normals,
            "indices": indices,
            "bbox": bbox,
            "source": "trimesh"
        }
        
    except Exception as e:
        print(f"Processing error: {e}")
        import traceback
        traceback.print_exc()
        return None


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "ok",
        "service": "STEP/IGES Converter",
        "has_occ": HAS_OCC,
        "has_trimesh": HAS_TRIMESH
    }


@app.post("/convert")
async def convert_file(file: UploadFile = File(...)):
    """
    Convert STEP, IGES, or STL file to mesh data for 3D rendering
    
    Returns:
        JSON with vertices, normals, indices, and bounding box
    """
    # Validate file extension
    allowed_extensions = {'.step', '.stp', '.iges', '.igs', '.stl'}
    ext = Path(file.filename).suffix.lower()
    
    if ext not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format: {ext}. Allowed: {', '.join(allowed_extensions)}"
        )
    
    # Save uploaded file to temp
    content = await file.read()
    with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp:
        tmp.write(content)
        tmp_path = tmp.name
    
    try:
        result = process_file(tmp_path)
        
        if result is None:
            raise HTTPException(
                status_code=500,
                detail="Failed to process file. Make sure pyglet is installed for STEP/IGES support."
            )
        
        # Calculate stats
        vertex_count = len(result["vertices"]) // 3
        triangle_count = len(result["indices"]) // 3
        
        return {
            "success": True,
            "fileName": file.filename,
            "fileType": ext.upper().replace('.', ''),
            "vertices": result["vertices"],
            "normals": result["normals"],
            "indices": result["indices"],
            "bbox": result["bbox"],
            "stats": {
                "vertexCount": vertex_count,
                "triangleCount": triangle_count
            },
            "source": result["source"]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # Cleanup
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)


@app.post("/info")
async def get_file_info(file: UploadFile = File(...)):
    """Get basic info about a CAD file without full conversion"""
    allowed_extensions = {'.step', '.stp', '.iges', '.igs', '.stl'}
    ext = Path(file.filename).suffix.lower()
    
    if ext not in allowed_extensions:
        raise HTTPException(status_code=400, detail="Unsupported file format")
    
    content = await file.read()
    with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp:
        tmp.write(content)
        tmp_path = tmp.name
    
    try:
        result = process_file(tmp_path)
        
        if result is None:
            raise HTTPException(status_code=500, detail="Failed to process file")
        
        vertex_count = len(result["vertices"]) // 3
        triangle_count = len(result["indices"]) // 3
        
        return {
            "fileName": file.filename,
            "fileSize": len(content),
            "bbox": result["bbox"],
            "vertexCount": vertex_count,
            "triangleCount": triangle_count
        }
        
    finally:
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)


if __name__ == "__main__":
    print("=" * 50)
    print("STEP/IGES Converter Service")
    print("=" * 50)
    print(f"OpenCASCADE: {'Available' if HAS_OCC else 'Not available'}")
    print(f"Trimesh: {'Available' if HAS_TRIMESH else 'Not available'}")
    print("=" * 50)
    
    uvicorn.run(app, host="0.0.0.0", port=8000)
