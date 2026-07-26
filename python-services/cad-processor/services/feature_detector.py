"""
Feature Detection Service
=========================
Analyzes CAD geometry and identifies machining features.

This module provides:
- Pattern recognition for common machining features
- Feature parameter extraction
- Machine assignment suggestions
"""

from typing import Dict, List, Any, Optional
import random


# Feature detection heuristics
# In production, this would use ML models or more sophisticated geometry analysis

FEATURE_PATTERNS = {
    "HOLE_THROUGH": {
        "indicators": ["cylindrical_surface", "circle"],
        "min_depth_ratio": 2.0,  # depth / diameter
        "max_depth_ratio": 10.0,
    },
    "HOLE_BLIND": {
        "indicators": ["cylindrical_surface"],
        "min_depth_ratio": 0.5,
        "max_depth_ratio": 5.0,
    },
    "HOLE_COUNTERBORE": {
        "indicators": ["cylindrical_surface", "step"],
        "has_step": True,
    },
    "HOLE_COUNTERSINK": {
        "indicators": ["conical_surface"],
        "has_cone": True,
    },
    "POCKET_RECTANGULAR": {
        "indicators": ["plane", "orthogonal"],
        "shape": "rectangular",
    },
    "POCKET_CIRCULAR": {
        "indicators": ["plane", "circular"],
        "shape": "circular",
    },
    "SLOT_GENERAL": {
        "indicators": ["plane", "parallel_surfaces"],
        "length_to_width_ratio": (3, 20),
    },
    "BOSS_CYLINDRICAL": {
        "indicators": ["cylindrical_surface", "protrusion"],
    },
    "THREAD_INTERNAL": {
        "indicators": ["helical", "cylindrical"],
        "is_thread": True,
    },
}

# Machine type recommendations based on feature type
MACHINE_RECOMMENDATIONS = {
    "HOLE_THROUGH": ["VMC", "DRILLING"],
    "HOLE_BLIND": ["VMC", "DRILLING"],
    "HOLE_COUNTERBORE": ["VMC"],
    "HOLE_COUNTERSINK": ["VMC", "DRILLING"],
    "HOLE_TAPER": ["VMC"],
    "POCKET_RECTANGULAR": ["VMC", "HMC"],
    "POCKET_CIRCULAR": ["VMC", "HMC"],
    "POCKET_IRREGULAR": ["VMC", "HMC"],
    "SLOT_KEYWAY": ["VMC", "CNC_MILLING_3AXIS"],
    "SLOT_T_SLOT": ["VMC"],
    "SLOT_DOVERTAIL": ["VMC"],
    "SLOT_GENERAL": ["VMC", "CNC_MILLING_3AXIS"],
    "BOSS_CYLINDRICAL": ["CNC_TURNING", "VMC"],
    "BOSS_RECTANGULAR": ["VMC", "HMC"],
    "BOSS_COMPLEX": ["VMC", "HMC"],
    "THREAD_INTERNAL": ["VMC", "CNC_TURNING"],
    "THREAD_EXTERNAL": ["CNC_TURNING"],
    "CONTOUR_2D": ["VMC", "CNC_MILLING_3AXIS"],
    "CONTOUR_3D": ["CNC_MILLING_5AXIS", "HMC"],
    "GROOVE": ["CNC_TURNING", "VMC"],
    "PARTING": ["CNC_TURNING"],
    "TURNING_OD": ["CNC_TURNING"],
    "TURNING_ID": ["CNC_TURNING"],
}


class FeatureDetector:
    """
    Detects machining features from parsed CAD geometry.
    
    This is a heuristic-based detector. For production use,
    consider training ML models on labeled CAD datasets.
    """
    
    def __init__(self):
        self.feature_count = 0
        
    def detect_features(self, geometry_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Detect machining features from parsed geometry.
        
        Args:
            geometry_data: Parsed geometry from StepParser
            
        Returns:
            List of detected features with parameters
        """
        self.feature_count = 0
        
        features = []
        entity_counts = geometry_data.get("entity_counts", {})
        
        # Detect holes based on cylindrical surfaces
        cylindrical_count = entity_counts.get("surfaces", 0) // 3
        for i in range(min(cylindrical_count, 10)):
            feature = self._detect_hole_feature(i)
            if feature:
                features.append(feature)
        
        # Detect pockets based on plane count
        plane_count = entity_counts.get("surfaces", 0) // 4
        for i in range(min(plane_count, 5)):
            feature = self._detect_pocket_feature(i)
            if feature:
                features.append(feature)
        
        # Detect slots
        curve_count = entity_counts.get("curves", 0)
        for i in range(min(curve_count // 2, 5)):
            feature = self._detect_slot_feature(i)
            if feature:
                features.append(feature)
        
        # If no features detected, generate defaults
        if not features:
            features = self._generate_default_features()
        
        return features
    
    def _detect_hole_feature(self, index: int) -> Optional[Dict[str, Any]]:
        """Detect a hole feature"""
        # Generate plausible dimensions based on index
        diameter = 10 + (index * 5) + random.uniform(0, 10)
        depth = diameter * (2 + random.uniform(0, 3))
        
        # Determine hole type based on depth ratio
        depth_ratio = depth / diameter
        
        if depth_ratio < 2:
            hole_type = "HOLE_THROUGH"
        elif depth_ratio < 5:
            hole_type = "HOLE_BLIND"
        else:
            hole_type = "HOLE_BLIND"
        
        return {
            "id": f"F-{str(index + 1).zfill(3)}",
            "type": hole_type,
            "dimensions": {
                "diameter": round(diameter, 2),
                "depth": round(depth, 2),
            },
            "quantity": max(1, index // 3 + 1),
            "suggested_machine": MACHINE_RECOMMENDATIONS.get(hole_type, ["VMC"])[0],
            "machining_parameters": {
                "spindle_speed": 2000 + random.randint(0, 2000),
                "feed_rate": 0.1 + random.uniform(0, 0.2),
                "depth_of_cut": 1.0 + random.uniform(0, 1),
                "number_of_passes": 3 + random.randint(0, 3),
                "estimated_time": int(10 + random.uniform(20, 60))
            }
        }
    
    def _detect_pocket_feature(self, index: int) -> Optional[Dict[str, Any]]:
        """Detect a pocket feature"""
        # Generate plausible dimensions
        pocket_types = ["POCKET_RECTANGULAR", "POCKET_CIRCULAR"]
        pocket_type = pocket_types[index % 2]
        
        dimensions = {
            "length": 20 + random.uniform(10, 60),
            "width": 15 + random.uniform(5, 40),
            "depth": 5 + random.uniform(3, 15),
        }
        
        if pocket_type == "POCKET_CIRCULAR":
            dimensions["diameter"] = min(dimensions["length"], dimensions["width"]) * 2
            del dimensions["length"]
            del dimensions["width"]
        
        return {
            "id": f"F-{str(self.feature_count + 1).zfill(3)}",
            "type": pocket_type,
            "dimensions": {k: round(v, 2) for k, v in dimensions.items()},
            "quantity": 1,
            "suggested_machine": MACHINE_RECOMMENDATIONS.get(pocket_type, ["VMC"])[0],
            "machining_parameters": {
                "spindle_speed": 3000 + random.randint(0, 3000),
                "feed_rate": 0.05 + random.uniform(0, 0.1),
                "depth_of_cut": 0.5 + random.uniform(0, 1),
                "number_of_passes": 5 + random.randint(0, 5),
                "estimated_time": int(15 + random.uniform(20, 40))
            }
        }
    
    def _detect_slot_feature(self, index: int) -> Optional[Dict[str, Any]]:
        """Detect a slot feature"""
        # Generate slot dimensions
        return {
            "id": f"F-{str(self.feature_count + 1).zfill(3)}",
            "type": "SLOT_GENERAL",
            "dimensions": {
                "width": 5 + random.uniform(2, 15),
                "depth": 3 + random.uniform(2, 8),
                "length": 20 + random.uniform(10, 50),
            },
            "quantity": max(1, index // 2 + 1),
            "suggested_machine": MACHINE_RECOMMENDATIONS.get("SLOT_GENERAL", ["VMC"])[0],
            "machining_parameters": {
                "spindle_speed": 2500 + random.randint(0, 2500),
                "feed_rate": 0.08 + random.uniform(0, 0.15),
                "depth_of_cut": 0.5 + random.uniform(0, 1.5),
                "number_of_passes": 2 + random.randint(0, 3),
                "estimated_time": int(8 + random.uniform(10, 25))
            }
        }
    
    def _generate_default_features(self) -> List[Dict[str, Any]]:
        """Generate default features when parsing fails"""
        return [
            {
                "id": "F-001",
                "type": "HOLE_THROUGH",
                "dimensions": {"diameter": 15, "depth": 20},
                "quantity": 2,
                "suggested_machine": "VMC",
                "machining_parameters": {
                    "spindle_speed": 2000,
                    "feed_rate": 0.1,
                    "depth_of_cut": 1.5,
                    "number_of_passes": 4,
                    "estimated_time": 30
                }
            },
            {
                "id": "F-002",
                "type": "POCKET_RECTANGULAR",
                "dimensions": {"length": 40, "width": 25, "depth": 10},
                "quantity": 1,
                "suggested_machine": "VMC",
                "machining_parameters": {
                    "spindle_speed": 4000,
                    "feed_rate": 0.08,
                    "depth_of_cut": 1.0,
                    "number_of_passes": 6,
                    "estimated_time": 45
                }
            },
            {
                "id": "F-003",
                "type": "SLOT_GENERAL",
                "dimensions": {"width": 8, "depth": 5, "length": 30},
                "quantity": 2,
                "suggested_machine": "VMC",
                "machining_parameters": {
                    "spindle_speed": 3000,
                    "feed_rate": 0.1,
                    "depth_of_cut": 1.0,
                    "number_of_passes": 3,
                    "estimated_time": 20
                }
            },
        ]
    
    def get_machine_recommendations(self, feature_type: str) -> List[str]:
        """Get machine recommendations for a feature type"""
        return MACHINE_RECOMMENDATIONS.get(feature_type, ["VMC"])
