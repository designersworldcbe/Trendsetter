#!/usr/bin/env python3
"""
STEP/IGES to GLTF Converter Service
Uses OpenCASCADE and trimesh for CAD file processing
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

# Try to import OCC, fallback to trimesh if not available
HAS_OCC = False
HAS_TRIMESH = False

try:
    from OCC.Core.STEPControl import STEPControl_Reader
    from OCC.Core.IGESControl import IGESControl_Reader
    from OCC.Core.BRepMesh import BRepMesh_IncrementalMesh
    from OCC.Core.TopAbs import TopAbs_FACE
    from OCC.Core.TopExp import TopExp_Explorer
    from OCC.Core.BRepBndLib import brepbndlib_Add
    from OCC.Core.IFSelect import IFSelect_RetDone
    from OCC.Core.Bnd import Bnd_Box
    from OCC.Core.BRepGProp import BRepGProp
    from OCC.Core.GProp import GProp_GProps
    from OCC.Extend.TopologyUtils import Topo
    HAS_OCC = True
    print("OpenCASCADE loaded successfully")
except ImportError as e:
    print(f"OpenCASCADE not available: {e}")

try:
    import trimesh
    import numpy as np
    HAS_TRIMESH = True
    print("Trimesh loaded successfully")
except ImportError as e:
    print(f"Trimesh not available: {e}")

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


def get_bounding_box(shape_or_mesh):
    """Get bounding box of shape or mesh"""
    try:
        if HAS_OCC and hasattr(shape_or_mesh, 'IsNull'):
            bbox = Bnd_Box()
            brepbndlib_Add(shape_or_mesh, bbox, True)
            xmin, ymin, zmin, xmax, ymax, zmax = bbox.Get()
            return {
                "min": [float(xmin), float(ymin), float(zmin)],
                "max": [float(xmax), float(ymax), float(zmax)],
                "center": [(xmin + xmax) / 2, (ymin + ymax) / 2, (zmin + zmax) / 2],
                "size": [float(xmax - xmin), float(ymax - ymin), float(zmax - zmin)]
            }
        elif HAS_TRIMESH:
            bounds = shape_or_mesh.bounds
            center = shape_or_mesh.centroid
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


def process_with_occ(file_path: str) -> Optional[dict]:
    """Process STEP/IGES file using OpenCASCADE"""
    if not HAS_OCC:
        return None
    
    try:
        # Determine file type
        ext = Path(file_path).suffix.lower()
        
        if ext in ['.step', '.stp']:
            reader = STEPControl_Reader()
            status = reader.ReadFile(file_path)
            if status != IFSelect_RetDone:
                return None
            reader.TransferRoots()
            shape = reader.OneShape()
        elif ext in ['.iges', '.igs']:
            reader = IGESControl_Reader()
            status = reader.ReadFile(file_path)
            if status != IFSelect_RetDone:
                return None
            reader.TransferRoots()
            shape = reader.Shape()
        else:
            return None
        
        if shape is None or shape.IsNull():
            return None
        
        # Get bounding box
        bbox = get_bounding_box(shape)
        
        # Extract mesh using BRepMesh
        mesh = BRepMesh_IncrementalMesh(shape, 0.1, True, 0.5, True)
        mesh.Perform()
        
        vertices = []
        normals = []
        indices = []
        vertex_index = 0
        
        explorer = TopExp_Explorer(shape, TopAbs_FACE)
        
        while explorer.More():
            face = explorer.Current()
            
            triangulation = face.Triangulation()
            if triangulation:
                nodes = triangulation.Nodes()
                triangles = triangulation.Triangles()
                location = face.Location()
                trsf = location.Transformation()
                
                for i in range(1, nodes.Length() + 1):
                    pnt = nodes.Value(i)
                    pnt.Transform(trsf)
                    vertices.extend([float(pnt.X()), float(pnt.Y()), float(pnt.Z())])
                
                for i in range(1, triangles.Length() + 1):
                    tri = triangles.Value(i)
                    indices.extend([
                        int(tri.Value(1)) - 1 + vertex_index,
                        int(tri.Value(2)) - 1 + vertex_index,
                        int(tri.Value(3)) - 1 + vertex_index
                    ])
                
                vertex_index += nodes.Length()
            
            explorer.Next()
        
        # Compute face normals
        normals = [0.0] * len(vertices)
        
        return {
            "vertices": vertices,
            "normals": normals,
            "indices": indices,
            "bbox": bbox,
            "source": "opencascade"
        }
        
    except Exception as e:
        print(f"OCC processing error: {e}")
        return None


def process_with_trimesh(file_path: str) -> Optional[dict]:
    """Process STEP/IGES file using trimesh"""
    if not HAS_TRIMESH:
        return None
    
    try:
        ext = Path(file_path).suffix.lower()
        
        # Load the mesh
        if ext == '.stl':
            mesh = trimesh.load_mesh(file_path)
        else:
            # Trimesh can load STEP/IGES if pyglet is available
            mesh = trimesh.load(file_path, force='mesh')
        
        if mesh is None:
            return None
        
        # Handle scene vs single mesh
        if isinstance(mesh, trimesh.Scene):
            # Merge all meshes in scene
            geometries = []
            for name, geom in mesh.geometry.items():
                if isinstance(geom, trimesh.Trimesh):
                    geometries.append(geom)
            if geometries:
                mesh = trimesh.util.concatenate(geometries)
            else:
                return None
        
        if not isinstance(mesh, trimesh.Trimesh):
            return None
        
        # Simple consolidation - use vertex and face arrays
        vertices = mesh.vertices.flatten().tolist()
        indices = mesh.faces.flatten().tolist()
        
        # Recompute normals if needed
        if not hasattr(mesh, 'vertex_normals') or len(mesh.vertex_normals) == 0:
            mesh.vertex_normals
        
        normals = mesh.vertex_normals.flatten().tolist() if hasattr(mesh, 'vertex_normals') else []
        
        bbox = get_bounding_box(mesh)
        
        return {
            "vertices": vertices,
            "normals": normals if normals else [0.0] * len(vertices),
            "indices": indices,
            "bbox": bbox,
            "source": "trimesh"
        }
        
    except Exception as e:
        print(f"Trimesh processing error: {e}")
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
    with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp:
        content = await file.read()
        tmp.write(content)
        tmp_path = tmp.name
    
    try:
        result = None
        
        # Try OCC first (better for CAD)
        if HAS_OCC:
            result = process_with_occ(tmp_path)
        
        # Fallback to trimesh
        if result is None and HAS_TRIMESH:
            result = process_with_trimesh(tmp_path)
        
        if result is None:
            raise HTTPException(
                status_code=500,
                detail="Failed to process file. No suitable converter available."
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
    
    with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp:
        content = await file.read()
        tmp.write(content)
        tmp_path = tmp.name
    
    try:
        result = None
        
        if HAS_OCC:
            result = process_with_occ(tmp_path)
        elif HAS_TRIMESH:
            result = process_with_trimesh(tmp_path)
        
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
