// Feature Recognition Types
export interface BoundingBox {
  x: number;
  y: number;
  z: number;
  length: number;
  width: number;
  height: number;
}

export interface ModelInfo {
  fileName: string;
  fileSize: number;
  fileType: string;
  volume: number;
  surfaceArea: number;
  boundingBox: BoundingBox;
  modelImageUrl?: string;
  multiViewImages?: {
    top?: string;
    front?: string;
    right?: string;
    isometric?: string;
  };
}

export interface Feature {
  id: string;
  type: FeatureType;
  subtype?: string;
  dimensions: FeatureDimensions;
  quantity: number;
  suggestedMachine?: MachineType;
  machiningParameters?: MachiningParameters;
}

export type FeatureType =
  | "HOLE_THROUGH"
  | "HOLE_BLIND"
  | "HOLE_COUNTERBORE"
  | "HOLE_COUNTERSINK"
  | "HOLE_TAPER"
  | "POCKET_RECTANGULAR"
  | "POCKET_CIRCULAR"
  | "POCKET_IRREGULAR"
  | "SLOT_KEYWAY"
  | "SLOT_T_SLOT"
  | "SLOT_DOVERTAIL"
  | "SLOT_GENERAL"
  | "BOSS_CYLINDRICAL"
  | "BOSS_RECTANGULAR"
  | "BOSS_COMPLEX"
  | "THREAD_INTERNAL"
  | "THREAD_EXTERNAL"
  | "CONTOUR_2D"
  | "CONTOUR_3D"
  | "GROOVE"
  | "PARTING"
  | "TURNING_OD"
  | "TURNING_ID"
  | "DRILLING"
  | "REAMING"
  | "BORING";

export interface FeatureDimensions {
  diameter?: number;
  depth?: number;
  width?: number;
  length?: number;
  height?: number;
  radius?: number;
  angle?: number;
  pitch?: number;
  tolerance?: string;
}

export interface MachiningParameters {
  spindleSpeed: number;
  feedRate: number;
  depthOfCut: number;
  numberOfPasses: number;
  estimatedTime: number; // in minutes
}

// Machine Types
export type MachineType =
  | "CNC_TURNING"
  | "VMC"
  | "HMC"
  | "CNC_MILLING_3AXIS"
  | "CNC_MILLING_4AXIS"
  | "CNC_MILLING_5AXIS"
  | "EDM_WIRE"
  | "EDM_DIE_SINKING"
  | "3D_PRINTING_SLA"
  | "3D_PRINTING_FDM"
  | "3D_PRINTING_SLS"
  | "GRINDING"
  | "DRILLING"
  | "OTHER";

export interface Machine {
  id: string;
  name: string;
  type: MachineType;
  description?: string;
  hourlyRate: number;
  setupCost: number;
  toolingCostRate: number;
  materialRemovalRate?: number;
  powerConsumption?: number;
  accuracy?: string;
  workEnvelope: {
    x: number;
    y: number;
    z: number;
  };
  spindleSpeed: {
    min: number;
    max: number;
  };
  efficiencyFactor: number;
  isActive: boolean;
  machineImage?: string;
}

// Operation Types
export interface Operation {
  id: string;
  featureId?: string;
  featureType: string;
  featureParams?: FeatureDimensions;
  machineId?: string;
  machine?: Machine;
  setupTime: number; // minutes
  machiningTime: number; // minutes
  toolChangeTime: number; // minutes
  totalTime: number; // minutes
  setupCost: number;
  machiningCost: number;
  toolingCost: number;
  totalCost: number;
  setupGroup: number;
  sequence: number;
  notes?: string;
}

// Stock Types
export type StockType = "CALCULATED" | "FROM_GEOMETRY" | "MANUAL";

export interface StockInfo {
  type: StockType;
  stockFileUrl?: string;
  stockMaterial?: string;
  stockDimensions?: {
    length: number;
    width: number;
    height: number;
    diameter?: number;
  };
  materialCost?: number;
}

// Secondary Process Types
export type SecondaryProcessType =
  | "PAINTING"
  | "POWDER_COATING"
  | "ELECTROPLATING"
  | "ANODIZING"
  | "GALVANIZING"
  | "HEAT_TREATMENT_HARDENING"
  | "HEAT_TREATMENT_TEMPERING"
  | "HEAT_TREATMENT_ANNEALING"
  | "HEAT_TREATMENT_CASE_HARDENING"
  | "INSPECTION"
  | "DEBURRING"
  | "POLISHING"
  | "PACKAGING"
  | "CUSTOM";

export type PriceUnit = "PER_PIECE" | "PER_KG" | "PER_SQM" | "PER_HOUR" | "FIXED";

export interface SecondaryProcess {
  id: string;
  name: string;
  type: SecondaryProcessType;
  description?: string;
  unitPrice: number;
  priceUnit: PriceUnit;
  minQuantity: number;
  perUnitWeight?: number;
  appliesTo?: string[];
  surfaceAreaFactor: boolean;
  weightFactor: boolean;
  isActive: boolean;
  selected: boolean;
  quantity?: number;
  totalCost?: number;
}

// Markup Configuration
export interface MarkupSettings {
  overheadPercent: number;
  profitPercent: number;
  salesPercent: number;
  quickQuoteAdjustment: number;
}

// Cost Calculation Types
export interface CostBreakdown {
  materialCost: number;
  machiningCost: number;
  secondaryCost: number;
  toolingCost: number;
  subtotal: number;
  overheadPercent: number;
  overheadAmount: number;
  profitPercent: number;
  profitAmount: number;
  totalCost: number;
}

// Calculation Result
export interface CalculationResult {
  id: string;
  modelInfo: ModelInfo;
  features: Feature[];
  operations: Operation[];
  stock: StockInfo;
  secondaryProcesses: SecondaryProcess[];
  markupSettings: MarkupSettings;
  costBreakdown: CostBreakdown;
  quoteNumber?: string;
  customerName?: string;
  customerEmail?: string;
  validUntil?: Date;
  notes?: string;
  createdAt: Date;
}

// Report Types
export interface ReportData {
  summary: {
    quoteNumber: string;
    date: string;
    validUntil: string;
    customerName: string;
    totalCost: number;
    leadTime: string;
  };
  modelInfo: ModelInfo;
  features: Feature[];
  operations: Operation[];
  machineUtilization: {
    machineName: string;
    totalTime: number;
    hourlyRate: number;
    setupCost: number;
    machiningCost: number;
  }[];
  secondaryProcesses: SecondaryProcess[];
  costBreakdown: CostBreakdown;
}

// User & Organization Types
export type Role = "OWNER" | "ADMIN" | "ESTIMATOR" | "USER";
export type Plan = "FREE" | "STARTER" | "PROFESSIONAL" | "ENTERPRISE";

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
