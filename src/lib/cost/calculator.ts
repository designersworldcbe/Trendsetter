import { Feature, Operation, Machine, SecondaryProcess, MarkupSettings, CostBreakdown, MachineType } from "@/types";

// Machine type to capability mapping
const MACHINE_CAPABILITIES: Record<MachineType, { canHandle: string[]; defaultSetupTime: number }> = {
  CNC_TURNING: {
    canHandle: ["TURNING_OD", "TURNING_ID", "THREAD_EXTERNAL", "GROOVE", "PARTING", "HOLE_THROUGH", "HOLE_BLIND"],
    defaultSetupTime: 45,
  },
  VMC: {
    canHandle: [
      "HOLE_THROUGH", "HOLE_BLIND", "HOLE_COUNTERBORE", "HOLE_COUNTERSINK", "HOLE_TAPER",
      "POCKET_RECTANGULAR", "POCKET_CIRCULAR", "POCKET_IRREGULAR",
      "SLOT_KEYWAY", "SLOT_T_SLOT", "SLOT_DOVERTAIL", "SLOT_GENERAL",
      "CONTOUR_2D", "CONTOUR_3D", "THREAD_INTERNAL", "DRILLING", "REAMING", "BORING"
    ],
    defaultSetupTime: 30,
  },
  HMC: {
    canHandle: [
      "HOLE_THROUGH", "HOLE_BLIND", "HOLE_COUNTERBORE", "HOLE_COUNTERSINK", "HOLE_TAPER",
      "POCKET_RECTANGULAR", "POCKET_CIRCULAR", "POCKET_IRREGULAR",
      "SLOT_KEYWAY", "SLOT_T_SLOT", "SLOT_DOVERTAIL", "SLOT_GENERAL",
      "CONTOUR_2D", "CONTOUR_3D", "THREAD_INTERNAL", "DRILLING", "REAMING", "BORING"
    ],
    defaultSetupTime: 35,
  },
  CNC_MILLING_3AXIS: {
    canHandle: [
      "HOLE_THROUGH", "HOLE_BLIND", "HOLE_COUNTERBORE", "HOLE_COUNTERSINK",
      "POCKET_RECTANGULAR", "POCKET_CIRCULAR", "POCKET_IRREGULAR",
      "SLOT_GENERAL", "CONTOUR_2D", "CONTOUR_3D", "DRILLING"
    ],
    defaultSetupTime: 25,
  },
  CNC_MILLING_4AXIS: {
    canHandle: [
      "HOLE_THROUGH", "HOLE_BLIND", "HOLE_COUNTERBORE", "HOLE_COUNTERSINK",
      "POCKET_RECTANGULAR", "POCKET_CIRCULAR", "POCKET_IRREGULAR",
      "SLOT_GENERAL", "CONTOUR_2D", "CONTOUR_3D", "DRILLING"
    ],
    defaultSetupTime: 30,
  },
  CNC_MILLING_5AXIS: {
    canHandle: [
      "HOLE_THROUGH", "HOLE_BLIND", "HOLE_COUNTERBORE", "HOLE_COUNTERSINK",
      "POCKET_RECTANGULAR", "POCKET_CIRCULAR", "POCKET_IRREGULAR",
      "SLOT_GENERAL", "CONTOUR_2D", "CONTOUR_3D", "DRILLING"
    ],
    defaultSetupTime: 40,
  },
  EDM_WIRE: { canHandle: ["CONTOUR_2D"], defaultSetupTime: 60 },
  EDM_DIE_SINKING: { canHandle: ["POCKET_IRREGULAR", "CONTOUR_2D"], defaultSetupTime: 60 },
  "3D_PRINTING_SLA": { canHandle: [], defaultSetupTime: 20 },
  "3D_PRINTING_FDM": { canHandle: [], defaultSetupTime: 15 },
  "3D_PRINTING_SLS": { canHandle: [], defaultSetupTime: 25 },
  GRINDING: { canHandle: ["CONTOUR_2D", "HOLE_THROUGH"], defaultSetupTime: 30 },
  DRILLING: { canHandle: ["HOLE_THROUGH", "HOLE_BLIND", "DRILLING"], defaultSetupTime: 15 },
  OTHER: { canHandle: [], defaultSetupTime: 30 },
};

// Material removal rate estimates (cm³/min) by machine type
const MACHINE_MRR: Record<MachineType, number> = {
  CNC_TURNING: 15,
  VMC: 20,
  HMC: 25,
  CNC_MILLING_3AXIS: 18,
  CNC_MILLING_4AXIS: 22,
  CNC_MILLING_5AXIS: 20,
  EDM_WIRE: 0.5,
  EDM_DIE_SINKING: 0.3,
  "3D_PRINTING_SLA": 0,
  "3D_PRINTING_FDM": 0,
  "3D_PRINTING_SLS": 0,
  GRINDING: 0.1,
  DRILLING: 10,
  OTHER: 10,
};

// Machining time calculation based on feature type
function calculateMachiningTime(feature: Feature, machineType: MachineType): number {
  const mrr = MACHINE_MRR[machineType];
  let volumeToRemove = 0;

  switch (feature.type) {
    // Holes
    case "HOLE_THROUGH":
    case "HOLE_BLIND":
      if (feature.dimensions.diameter && feature.dimensions.depth) {
        const radius = feature.dimensions.diameter / 2;
        volumeToRemove = Math.PI * radius * radius * feature.dimensions.depth * feature.quantity;
      }
      break;
    
    case "HOLE_COUNTERBORE":
    case "HOLE_COUNTERSINK":
    case "HOLE_TAPER":
      if (feature.dimensions.diameter && feature.dimensions.depth) {
        const radius = feature.dimensions.diameter / 2;
        volumeToRemove = Math.PI * radius * radius * feature.dimensions.depth * 1.2 * feature.quantity;
      }
      break;
    
    // Pockets
    case "POCKET_RECTANGULAR":
      if (feature.dimensions.length && feature.dimensions.width && feature.dimensions.depth) {
        volumeToRemove = feature.dimensions.length * feature.dimensions.width * feature.dimensions.depth * 1.3 * feature.quantity;
      }
      break;
    
    case "POCKET_CIRCULAR":
      if (feature.dimensions.diameter && feature.dimensions.depth) {
        const radius = feature.dimensions.diameter / 2;
        volumeToRemove = Math.PI * radius * radius * feature.dimensions.depth * 1.3 * feature.quantity;
      }
      break;
    
    case "POCKET_IRREGULAR":
      // Estimate based on bounding dimensions
      if (feature.dimensions.length && feature.dimensions.width && feature.dimensions.depth) {
        volumeToRemove = feature.dimensions.length * feature.dimensions.width * feature.dimensions.depth * 1.5 * feature.quantity;
      }
      break;
    
    // Slots
    case "SLOT_KEYWAY":
    case "SLOT_T_SLOT":
    case "SLOT_DOVERTAIL":
    case "SLOT_GENERAL":
      if (feature.dimensions.width && feature.dimensions.depth && feature.dimensions.length) {
        volumeToRemove = feature.dimensions.width * feature.dimensions.depth * feature.dimensions.length * 1.2 * feature.quantity;
      }
      break;
    
    // Bosses (material to remove around boss)
    case "BOSS_CYLINDRICAL":
      if (feature.dimensions.diameter && feature.dimensions.height) {
        // Assume boss takes 30% of stock volume
        const radius = feature.dimensions.diameter / 2;
        const bossVolume = Math.PI * radius * radius * feature.dimensions.height;
        volumeToRemove = bossVolume * 0.7 * feature.quantity;
      }
      break;
    
    case "BOSS_RECTANGULAR":
      if (feature.dimensions.length && feature.dimensions.width && feature.dimensions.height) {
        const bossVolume = feature.dimensions.length * feature.dimensions.width * feature.dimensions.height;
        volumeToRemove = bossVolume * 0.7 * feature.quantity;
      }
      break;
    
    // Threads
    case "THREAD_INTERNAL":
    case "THREAD_EXTERNAL":
      // Thread machining is primarily surface contact
      if (feature.dimensions.diameter && feature.dimensions.depth && feature.dimensions.pitch) {
        volumeToRemove = Math.PI * feature.dimensions.diameter * feature.dimensions.depth / feature.dimensions.pitch * 0.01 * feature.quantity;
      }
      break;
    
    // Contours
    case "CONTOUR_2D":
    case "CONTOUR_3D":
      if (feature.dimensions.length && feature.dimensions.width && feature.dimensions.depth) {
        volumeToRemove = feature.dimensions.length * feature.dimensions.width * feature.dimensions.depth * 0.5 * feature.quantity;
      }
      break;
    
    // Turning operations
    case "TURNING_OD":
    case "TURNING_ID":
      if (feature.dimensions.diameter && feature.dimensions.length) {
        const radius = feature.dimensions.diameter / 2;
        volumeToRemove = Math.PI * radius * radius * feature.dimensions.length * 0.3 * feature.quantity;
      }
      break;
    
    case "GROOVE":
      if (feature.dimensions.width && feature.dimensions.depth && feature.dimensions.diameter) {
        volumeToRemove = feature.dimensions.width * feature.dimensions.depth * Math.PI * feature.dimensions.diameter * 0.3 * feature.quantity;
      }
      break;
    
    case "PARTING":
      if (feature.dimensions.diameter && feature.dimensions.width) {
        volumeToRemove = feature.dimensions.width * Math.PI * feature.dimensions.diameter * 0.2 * feature.quantity;
      }
      break;
    
    default:
      // Default estimate
      volumeToRemove = 1000 * feature.quantity;
  }

  // Convert mm³ to cm³ for MRR calculation
  const volumeCm3 = volumeToRemove / 1000;
  
  // Calculate time in minutes
  const machiningTime = mrr > 0 ? volumeCm3 / mrr : 5; // Default 5 min if MRR is 0
  
  // Apply a multiplier for tool changes and approach/retract
  const toolChangeMultiplier = 1.15;
  
  return Math.ceil(machiningTime * toolChangeMultiplier);
}

// Select the best machine for a feature
export function selectMachineForFeature(feature: Feature, machines: Machine[]): Machine | null {
  const capableMachines = machines.filter(machine => {
    if (!machine.isActive) return false;
    const capabilities = MACHINE_CAPABILITIES[machine.type];
    return capabilities.canHandle.includes(feature.type);
  });

  if (capableMachines.length === 0) {
    // Return any active machine if no specific match
    return machines.find(m => m.isActive) || null;
  }

  // Select machine with lowest cost for this feature
  const featureTime = calculateMachiningTime(feature, capableMachines[0].type);
  
  return capableMachines.reduce((best, current) => {
    const currentTotalCost = (featureTime / 60) * Number(current.hourlyRate) + Number(current.setupCost);
    const bestTotalCost = best ? (featureTime / 60) * Number(best.hourlyRate) + Number(best.setupCost) : Infinity;
    return currentTotalCost < bestTotalCost ? current : best;
  });
}

// Create operations from features
export function createOperations(features: Feature[], machines: Machine[]): Operation[] {
  const operations: Operation[] = [];
  let operationIndex = 0;
  
  // Group features by compatible machines to minimize setups
  const machineGroups = new Map<string, Feature[]>();
  
  features.forEach(feature => {
    const machine = selectMachineForFeature(feature, machines);
    if (machine) {
      const machineId = machine.id;
      if (!machineGroups.has(machineId)) {
        machineGroups.set(machineId, []);
      }
      machineGroups.get(machineId)!.push(feature);
    }
  });

  // Create operations for each machine group
  let setupGroup = 1;
  
  machineGroups.forEach((groupFeatures, machineId) => {
    const machine = machines.find(m => m.id === machineId);
    if (!machine) return;

    const capabilities = MACHINE_CAPABILITIES[machine.type];
    let setupApplied = false;

    groupFeatures.forEach((feature, index) => {
      const machiningTime = calculateMachiningTime(feature, machine.type);
      const setupTime = setupApplied ? 0 : capabilities.defaultSetupTime;
      setupApplied = true;

      const machiningCostPerHour = Number(machine.hourlyRate) * Number(machine.efficiencyFactor);
      const machiningCost = (machiningTime / 60) * machiningCostPerHour;
      const setupCost = setupTime > 0 ? Number(machine.setupCost) : 0;
      const toolingCost = machiningTime * Number(machine.toolingCostRate);

      operations.push({
        id: `op-${++operationIndex}`,
        featureId: feature.id,
        featureType: feature.type,
        featureParams: feature.dimensions,
        machineId: machine.id,
        machine: machine,
        setupTime: setupTime,
        machiningTime: machiningTime,
        toolChangeTime: Math.ceil(machiningTime * 0.05), // 5% for tool changes
        totalTime: setupTime + machiningTime + Math.ceil(machiningTime * 0.05),
        setupCost: setupCost,
        machiningCost: machiningCost,
        toolingCost: toolingCost,
        totalCost: setupCost + machiningCost + toolingCost,
        setupGroup: setupGroup,
        sequence: index + 1,
      });
    });

    setupGroup++;
  });

  return operations;
}

// Calculate material cost
export function calculateMaterialCost(
  volume: number, // mm³
  density: number, // kg/cm³
  costPerKg: number,
  wasteFactor: number = 1.3 // 30% waste for machining
): number {
  const volumeCm3 = volume / 1000; // Convert mm³ to cm³
  const weight = volumeCm3 * density * wasteFactor;
  return weight * costPerKg;
}

// Calculate secondary process costs
export function calculateSecondaryCosts(
  processes: SecondaryProcess[],
  surfaceArea: number,
  weight: number,
  quantity: number = 1
): number {
  return processes.reduce((total, process) => {
    if (!process.selected) return total;

    let cost = 0;
    const qty = process.quantity || quantity;

    switch (process.priceUnit) {
      case "PER_PIECE":
        cost = process.unitPrice * qty;
        break;
      case "PER_KG":
        cost = process.unitPrice * weight * qty;
        break;
      case "PER_SQM":
        cost = process.unitPrice * (surfaceArea / 10000) * qty; // mm² to m²
        break;
      case "PER_HOUR":
        // Assume default processing time
        cost = process.unitPrice * 0.5 * qty;
        break;
      case "FIXED":
        cost = process.unitPrice * qty;
        break;
    }

    return total + cost;
  }, 0);
}

// Calculate tooling costs from operations
export function calculateTotalToolingCost(operations: Operation[]): number {
  return operations.reduce((total, op) => total + op.toolingCost, 0);
}

// Calculate total machining cost from operations
export function calculateTotalMachiningCost(operations: Operation[]): number {
  return operations.reduce((total, op) => total + op.machiningCost + op.setupCost, 0);
}

// Calculate machine utilization
export function calculateMachineUtilization(operations: Operation[], machines: Machine[]) {
  const utilization: Record<string, { totalTime: number; setupCost: number; machiningCost: number }> = {};

  operations.forEach(op => {
    if (op.machineId) {
      if (!utilization[op.machineId]) {
        utilization[op.machineId] = { totalTime: 0, setupCost: 0, machiningCost: 0 };
      }
      utilization[op.machineId].totalTime += op.totalTime;
      utilization[op.machineId].setupCost += op.setupCost;
      utilization[op.machineId].machiningCost += op.machiningCost;
    }
  });

  return Object.entries(utilization).map(([machineId, data]) => {
    const machine = machines.find(m => m.id === machineId);
    return {
      machineName: machine?.name || "Unknown",
      hourlyRate: machine?.hourlyRate || 0,
      ...data,
    };
  });
}

// Apply markup and calculate final cost
export function calculateFinalCost(
  subtotal: number,
  markupSettings: MarkupSettings
): { overheadAmount: number; profitAmount: number; totalCost: number } {
  const overheadAmount = subtotal * (Number(markupSettings.overheadPercent) / 100);
  const profitAmount = (subtotal + overheadAmount) * (Number(markupSettings.profitPercent) / 100);
  const totalCost = subtotal + overheadAmount + profitAmount;

  return {
    overheadAmount,
    profitAmount,
    totalCost,
  };
}

// Complete cost calculation
export function calculateCosts(
  features: Feature[],
  machines: Machine[],
  operations: Operation[],
  secondaryProcesses: SecondaryProcess[],
  markupSettings: MarkupSettings,
  modelInfo: { volume: number; surfaceArea: number },
  material: { density: number; costPerKg: number }
): CostBreakdown {
  // Calculate machining cost
  const machiningCost = calculateTotalMachiningCost(operations);
  
  // Calculate tooling cost
  const toolingCost = calculateTotalToolingCost(operations);
  
  // Calculate material cost
  const materialCost = calculateMaterialCost(
    modelInfo.volume,
    material.density,
    material.costPerKg
  );
  
  // Calculate secondary process costs
  const secondaryCost = calculateSecondaryCosts(
    secondaryProcesses,
    modelInfo.surfaceArea,
    materialCost / material.costPerKg // Approximate weight
  );
  
  // Calculate subtotal
  const subtotal = machiningCost + toolingCost + materialCost + secondaryCost;
  
  // Apply markup
  const { overheadAmount, profitAmount, totalCost } = calculateFinalCost(subtotal, markupSettings);
  
  return {
    materialCost,
    machiningCost,
    secondaryCost,
    toolingCost,
    subtotal,
    overheadPercent: Number(markupSettings.overheadPercent),
    overheadAmount,
    profitPercent: Number(markupSettings.profitPercent),
    profitAmount,
    totalCost,
  };
}
