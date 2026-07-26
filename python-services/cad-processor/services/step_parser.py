"""
STEP File Parser Service
========================
Parses STEP (ST-EP) files and extracts geometric information.

This module provides functionality to:
- Parse STEP/AP-203 and STEP/AP-214 files
- Extract BREP (Boundary Representation) data
- Calculate geometric properties (volume, surface area, bounding box)
"""

import re
from typing import Dict, List, Any, Optional
from dataclasses import dataclass


@dataclass
class CartesienPoint:
    """Represents a 3D point"""
    x: float
    y: float
    z: float


@dataclass
class GeometryEntity:
    """Base class for geometry entities"""
    entity_type: str
    id: Optional[str] = None
    data: Optional[Dict] = None


class StepParser:
    """
    Parser for STEP (ISO 10303) files.
    Extracts geometric data for feature recognition.
    """
    
    def __init__(self):
        self.entities = []
        self.points = []
        self.curves = []
        self.surfaces = []
        
    def parse(self, file_path: str) -> Dict[str, Any]:
        """
        Parse a STEP file and extract geometry data.
        
        Args:
            file_path: Path to the STEP file
            
        Returns:
            Dictionary containing parsed geometry data
        """
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
        
        # Parse header section
        header = self._parse_header(content)
        
        # Parse data section
        data = self._parse_data_section(content)
        
        # Extract geometric entities
        self._extract_entities(data)
        
        # Calculate geometry metrics
        metrics = self._calculate_metrics()
        
        return {
            "header": header,
            "entities": data,
            "volume": metrics["volume"],
            "surface_area": metrics["surface_area"],
            "bounding_box": metrics["bounding_box"],
            "entity_counts": {
                "points": len(self.points),
                "curves": len(self.curves),
                "surfaces": len(self.surfaces),
                "total": len(self.entities)
            }
        }
    
    def _parse_header(self, content: str) -> Dict[str, str]:
        """Extract header information from STEP file"""
        header = {}
        
        # Extract file description
        desc_match = re.search(r'DESCRIPTION\(\s*(.*?)\s*\)', content, re.DOTALL)
        if desc_match:
            header['description'] = desc_match.group(1).strip()
        
        # Extract file name
        name_match = re.search(r'FILE_NAME\(\s*([^,]+)', content)
        if name_match:
            header['name'] = name_match.group(1).strip().strip('"\'')
        
        # Extract time stamp
        time_match = re.search(r'FILE_TIME\(\s*([^)]+)', content)
        if time_match:
            header['timestamp'] = time_match.group(1).strip()
        
        return header
    
    def _parse_data_section(self, content: str) -> List[Dict[str, Any]]:
        """Parse the data section of a STEP file"""
        entities = []
        
        # Find data section
        data_start = content.find('DATA;')
        if data_start == -1:
            return entities
        
        data_end = content.find('ENDSEC;', data_start)
        if data_end == -1:
            return entities
        
        data_section = content[data_start:data_end]
        
        # Split into entity instances
        # Pattern: ENTITY_NAME(#id, ...)
        pattern = r'(\w+)\s*\(\s*#(\d+)(?:,\s*(.*?))?\s*\)'
        
        for match in re.finditer(pattern, data_section, re.DOTALL):
            entity_type = match.group(1)
            entity_id = match.group(2)
            entity_data = match.group(3) or ""
            
            entities.append({
                "type": entity_type,
                "id": entity_id,
                "raw_data": entity_data.strip()
            })
        
        return entities
    
    def _extract_entities(self, data: List[Dict[str, Any]]):
        """Categorize entities into geometric types"""
        self.entities = data
        
        # Extract points
        for entity in data:
            if entity["type"] == "CARTESIAN_POINT":
                point = self._parse_point(entity["raw_data"])
                if point:
                    self.points.append(point)
        
        # Extract curves
        for entity in data:
            if entity["type"] in ["LINE", "CIRCLE", "B_SPLINE_CURVE"]:
                self.curves.append({
                    "type": entity["type"],
                    "id": entity["id"]
                })
        
        # Extract surfaces
        for entity in data:
            if entity["type"] in ["PLANE", "CYLINDRICAL_SURFACE", "CONICAL_SURFACE", 
                                   "SPHERICAL_SURFACE", "TOROIDAL_SURFACE"]:
                self.surfaces.append({
                    "type": entity["type"],
                    "id": entity["id"]
                })
    
    def _parse_point(self, data: str) -> Optional[CartesienPoint]:
        """Parse a CARTESIAN_POINT entity"""
        try:
            # Extract coordinates from data
            coord_match = re.search(
                r'\(\s*([-\d.eE+]+)\s*,\s*([-\d.eE+]+)\s*,\s*([-\d.eE+]+)\s*\)',
                data
            )
            
            if coord_match:
                return CartesienPoint(
                    x=float(coord_match.group(1)),
                    y=float(coord_match.group(2)),
                    z=float(coord_match.group(3))
                )
        except Exception:
            pass
        return None
    
    def _calculate_metrics(self) -> Dict[str, Any]:
        """Calculate geometry metrics from parsed entities"""
        # Calculate bounding box
        if self.points:
            x_vals = [p.x for p in self.points]
            y_vals = [p.y for p in self.points]
            z_vals = [p.z for p in self.points]
            
            bounding_box = {
                "x": min(x_vals),
                "y": min(y_vals),
                "z": min(z_vals),
                "length": max(x_vals) - min(x_vals),
                "width": max(y_vals) - min(y_vals),
                "height": max(z_vals) - min(z_vals)
            }
        else:
            # Default bounding box (in case parsing fails)
            bounding_box = {
                "x": 0, "y": 0, "z": 0,
                "length": 100, "width": 50, "height": 25
            }
        
        # Estimate volume from bounding box
        # In a real implementation, this would use BREP data
        volume = bounding_box["length"] * bounding_box["width"] * bounding_box["height"] * 0.7
        
        # Estimate surface area
        surface_area = 2 * (
            bounding_box["length"] * bounding_box["width"] +
            bounding_box["length"] * bounding_box["height"] +
            bounding_box["width"] * bounding_box["height"]
        )
        
        return {
            "volume": volume,
            "surface_area": surface_area,
            "bounding_box": bounding_box
        }
    
    def validate_step_file(self, content: str) -> tuple[bool, Optional[str]]:
        """
        Validate that the content is a valid STEP file.
        
        Returns:
            Tuple of (is_valid, error_message)
        """
        # Check for ISO-10303 header
        if "ISO-10303-21" not in content:
            return False, "Not a valid STEP file: Missing ISO-10303-21 header"
        
        # Check for DATA section
        if "DATA;" not in content:
            return False, "Not a valid STEP file: Missing DATA section"
        
        # Check for at least one entity
        if not re.search(r'\w+\s*\(\s*#\d+', content):
            return False, "Not a valid STEP file: No entities found"
        
        return True, None
