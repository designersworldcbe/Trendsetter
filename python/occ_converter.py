#!/usr/bin/env python3
"""
Python OCC-based STEP/IGES to GLTF Converter
Requires: pythonocc-core, numpy, trimesh
"""

import sys
import json
import os
import tempfile
from pathlib import Path

try:
    from OCC.Core import TopoDS_Shape
    from OCC.Core.BRepMesh import BRepMesh_IncrementalMesh
    from OCC.Core.BRep import BRep_Builder
    from OCC.Core.BRepAlgoAPI import BRepAlgoAPI_Section
    from OCC.Core.TopAbs import TopAbs_FACE
    from OCC.Core.TopExp import TopExp_Explorer
    from OCC.Core.BRepBndLib import brepbndlib_Add
    from OCC.Extend.ShapeFactory import make_face
    from OCC.Extend.TopologyUtils import TopologyExplorer
    import numpy as np
    HAS_OCC = True
except ImportError:
    HAS_OCC = False
    print("OCC not available, using fallback", file=sys.stderr)

def parse_step_to_mesh(step_path):
    """Parse STEP file and extract mesh data"""
    if not HAS_OCC:
        return None, None, None
    
    from OCC.Core.STEPControl import STEPControl_Reader
    from OCC.Core.IFSelect import IFSelect_RetDone
    
    reader = STEPControl_Reader()
    status = reader.ReadFile(step_path)
    
    if status != IFSelect_RetDone:
        return None, None, None
    
    reader.TransferRoots()
    shape = reader.OneShape()
    
    if shape is None:
        return None, None, None
    
    # Get bounding box
    bbox = get_bounding_box(shape)
    
    # Extract mesh data
    vertices, normals, indices = extract_mesh(shape)
    
    return vertices.tolist(), normals.tolist(), indices.tolist(), bbox

def get_bounding_box(shape):
    """Get bounding box of shape"""
    from OCC.Core.Bnd import Bnd_Box
    from OCC.Core.BRepBndLib import brepbndlib_Add
    from OCC.Core.BRepBndLib import Add_Parameters
    
    bbox = Bnd_Box()
    brepbndlib_Add(shape, bbox, True)
    
    xmin, ymin, zmin, xmax, ymax, zmax = bbox.Get()
    
    return {
        "x": (xmin + xmax) / 2,
        "y": (ymin + ymax) / 2,
        "z": (zmin + zmax) / 2,
        "width": xmax - xmin,
        "height": ymax - ymin,
        "depth": zmax - zmin,
        "xmin": xmin, "ymin": ymin, "zmin": zmin,
        "xmax": xmax, "ymax": ymax, "zmax": zmax
    }

def extract_mesh(shape, linear_deflection=0.01, angular_deflection=0.5):
    """Extract triangle mesh from shape"""
    # Mesh the shape
    mesh = BRepMesh_IncrementalMesh(shape, linear_deflection, True, angular_deflection, True)
    mesh.Perform()
    
    vertices = []
    normals = []
    indices = []
    
    explorer = TopExp_Explorer(shape, TopAbs_FACE)
    vertex_index = 0
    
    while explorer.More():
        face = explorer.Current()
        
        # Get face triangulation
        location = face.Location()
        tesselation = face.Tolerance()
        
        # Get mesh from face
        triang = face.Triangulation()
        
        if triang:
            nodes = triang.Nodes()
            triangles = triang.Triangles()
            
            # Apply transformation
            trsf = location.Transformation()
            
            for i in range(1, nodes.Length() + 1):
                pnt = nodes.Value(i)
                pnt.Transform(trsf)
                vertices.extend([pnt.X(), pnt.Y(), pnt.Z()])
                normals.extend([0, 0, 1])  # Placeholder
            
            for i in range(1, triangles.Length() + 1):
                tri = triangles.Value(i)
                indices.extend([
                    tri.Value(1) - 1 + vertex_index,
                    tri.Value(2) - 1 + vertex_index,
                    tri.Value(3) - 1 + vertex_index
                ])
            
            vertex_index += nodes.Length()
        
        explorer.Next()
    
    return (
        np.array(vertices, dtype=np.float32) if vertices else np.array([]),
        np.array(normals, dtype=np.float32) if normals else np.array([]),
        np.array(indices, dtype=np.uint32) if indices else np.array([], dtype=np.uint32)
    )

def parse_args():
    """Parse command line arguments"""
    args = sys.argv[1:]
    
    if len(args) < 1:
        return None
    
    step_path = args[0]
    output_path = args[1] if len(args) > 1 else None
    
    return step_path, output_path

def main():
    step_path, output_path = parse_args()
    
    if step_path is None:
        # Return error
        print(json.dumps({"error": "No input file provided"}))
        sys.exit(1)
    
    if not os.path.exists(step_path):
        print(json.dumps({"error": f"File not found: {step_path}"}))
        sys.exit(1)
    
    try:
        vertices, normals, indices, bbox = parse_step_to_mesh(step_path)
        
        if vertices is None:
            # Fallback - return demo data
            result = {
                "success": False,
                "fallback": True,
                "bbox": {"width": 100, "height": 100, "depth": 100},
                "message": "OCC not available, showing demo model"
            }
        else:
            result = {
                "success": True,
                "vertices": vertices,
                "normals": normals,
                "indices": indices,
                "bbox": bbox,
                "vertexCount": len(vertices) // 3,
                "triangleCount": len(indices) // 3
            }
        
        print(json.dumps(result))
        
        if output_path:
            with open(output_path, 'w') as f:
                json.dump(result, f)
                
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    main()
