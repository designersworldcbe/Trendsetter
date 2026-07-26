import * as XLSX from "xlsx";
import { ReportData, CostBreakdown, Feature, Operation } from "@/types";

// Format number as currency
const formatCurrency = (amount: number, currency: string = "INR"): string => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
  }).format(amount);
};

// Format date
const formatDate = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

interface ExcelReportOptions {
  includeImages?: boolean;
  modelImageBuffer?: Buffer;
  multiViewBuffers?: {
    top?: Buffer;
    front?: Buffer;
    right?: Buffer;
    isometric?: Buffer;
  };
  currency?: string;
}

// Generate Excel report
export async function generateExcelReport(
  reportData: ReportData,
  options: ExcelReportOptions = {}
): Promise<Buffer> {
  const {
    includeImages = true,
    modelImageBuffer,
    multiViewBuffers,
    currency = "INR",
  } = options;

  const workbook = XLSX.utils.book_new();

  // =========================================
  // Sheet 1: Summary
  // =========================================
  const summaryData = [
    ["TRENDSETTER COST ESTIMATE", ""],
    ["", ""],
    ["Quote Number:", reportData.summary.quoteNumber],
    ["Date:", reportData.summary.date],
    ["Valid Until:", reportData.summary.validUntil],
    ["Customer:", reportData.summary.customerName || "N/A"],
    ["Lead Time:", reportData.summary.leadTime],
    ["", ""],
    ["COST BREAKDOWN", ""],
    ["", ""],
    ["Item", "Quantity", "Rate", "Amount"],
    ["Material Cost", 1, "", formatCurrency(reportData.costBreakdown.materialCost, currency)],
    ["Machining Cost", 1, "", formatCurrency(reportData.costBreakdown.machiningCost, currency)],
    ["Secondary Processes", 1, "", formatCurrency(reportData.costBreakdown.secondaryCost, currency)],
    ["Tooling & Consumables", 1, "", formatCurrency(reportData.costBreakdown.toolingCost, currency)],
    ["", ""],
    ["SUBTOTAL", "", "", formatCurrency(reportData.costBreakdown.subtotal, currency)],
    [`Overhead (${reportData.costBreakdown.overheadPercent}%)`, "", "", formatCurrency(reportData.costBreakdown.overheadAmount, currency)],
    [`Profit Margin (${reportData.costBreakdown.profitPercent}%)`, "", "", formatCurrency(reportData.costBreakdown.profitAmount, currency)],
    ["", ""],
    ["TOTAL ESTIMATED COST", "", "", formatCurrency(reportData.costBreakdown.totalCost, currency)],
    ["", ""],
    ["Terms & Conditions:", ""],
    ["1. Prices are valid for 30 days from the quote date.", ""],
    ["2. Lead time starts from the date of order confirmation.", ""],
    ["3. Final cost may vary based on actual material specifications.", ""],
    ["4. Taxes as applicable will be charged extra.", ""],
  ];

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  
  // Set column widths
  summarySheet["!cols"] = [
    { wch: 30 }, // Column A
    { wch: 15 }, // Column B
    { wch: 15 }, // Column C
    { wch: 20 }, // Column D
  ];

  // Merge cells for header
  summarySheet["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 3 } }, // Title
  ];

  XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");

  // =========================================
  // Sheet 2: Model Information
  // =========================================
  const modelData = [
    ["MODEL DETAILS", ""],
    ["", ""],
    ["File Name:", reportData.modelInfo.fileName],
    ["File Size:", `${(reportData.modelInfo.fileSize / 1024 / 1024).toFixed(2)} MB`],
    ["Format:", reportData.modelInfo.fileType.toUpperCase()],
    ["", ""],
    ["DIMENSIONS", "Metric", "Imperial"],
    ["Length (X):", `${reportData.modelInfo.boundingBox.length.toFixed(2)} mm`, `${(reportData.modelInfo.boundingBox.length / 25.4).toFixed(3)} in`],
    ["Width (Y):", `${reportData.modelInfo.boundingBox.width.toFixed(2)} mm`, `${(reportData.modelInfo.boundingBox.width / 25.4).toFixed(3)} in`],
    ["Height (Z):", `${reportData.modelInfo.boundingBox.height.toFixed(2)} mm`, `${(reportData.modelInfo.boundingBox.height / 25.4).toFixed(3)} in`],
    ["", ""],
    ["Volume:", `${reportData.modelInfo.volume.toFixed(2)} mm³`, `${(reportData.modelInfo.volume / 16387.064).toFixed(4)} cu in`],
    ["Surface Area:", `${reportData.modelInfo.surfaceArea.toFixed(2)} mm²`, `${(reportData.modelInfo.surfaceArea / 645.16).toFixed(4)} sq in`],
  ];

  const modelSheet = XLSX.utils.aoa_to_sheet(modelData);
  modelSheet["!cols"] = [
    { wch: 25 },
    { wch: 20 },
    { wch: 20 },
  ];
  modelSheet["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 2 } },
  ];

  XLSX.utils.book_append_sheet(workbook, modelSheet, "Model Info");

  // =========================================
  // Sheet 3: Features
  // =========================================
  const featureHeaders = [
    "Feature ID",
    "Type",
    "Subtype",
    "Dimensions",
    "Quantity",
    "Suggested Machine",
  ];

  const featureRows = reportData.features.map((feature, index) => {
    const dimStr = Object.entries(feature.dimensions)
      .map(([key, val]) => `${key}: ${val}`)
      .join(", ");

    return [
      `F-${String(index + 1).padStart(3, "0")}`,
      formatFeatureType(feature.type),
      feature.subtype || "-",
      dimStr,
      feature.quantity,
      feature.suggestedMachine || "-",
    ];
  });

  const featureData = [
    ["FEATURE RECOGNITION RESULTS", "", "", "", "", ""],
    featureHeaders,
    ...featureRows,
  ];

  const featureSheet = XLSX.utils.aoa_to_sheet(featureData);
  featureSheet["!cols"] = [
    { wch: 12 },
    { wch: 20 },
    { wch: 20 },
    { wch: 40 },
    { wch: 10 },
    { wch: 20 },
  ];
  featureSheet["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } },
  ];

  XLSX.utils.book_append_sheet(workbook, featureSheet, "Features");

  // =========================================
  // Sheet 4: Operations
  // =========================================
  const operationHeaders = [
    "Op #",
    "Feature",
    "Machine",
    "Setup Time (min)",
    "Machining Time (min)",
    "Tool Change (min)",
    "Total Time (min)",
    "Setup Cost",
    "Machining Cost",
    "Tooling Cost",
    "Total Cost",
  ];

  const operationRows = reportData.operations.map((op, index) => [
    index + 1,
    formatFeatureType(op.featureType),
    op.machine?.name || "-",
    op.setupTime,
    op.machiningTime,
    op.toolChangeTime,
    op.totalTime,
    formatCurrency(op.setupCost, currency),
    formatCurrency(op.machiningCost, currency),
    formatCurrency(op.toolingCost, currency),
    formatCurrency(op.totalCost, currency),
  ]);

  // Add totals row
  const totalSetupTime = reportData.operations.reduce((sum, op) => sum + op.setupTime, 0);
  const totalMachiningTime = reportData.operations.reduce((sum, op) => sum + op.machiningTime, 0);
  const totalToolChangeTime = reportData.operations.reduce((sum, op) => sum + op.toolChangeTime, 0);
  const totalTime = reportData.operations.reduce((sum, op) => sum + op.totalTime, 0);
  const totalSetupCost = reportData.operations.reduce((sum, op) => sum + op.setupCost, 0);
  const totalMachiningCost = reportData.operations.reduce((sum, op) => sum + op.machiningCost, 0);
  const totalToolingCost = reportData.operations.reduce((sum, op) => sum + op.toolingCost, 0);
  const totalOperationCost = reportData.operations.reduce((sum, op) => sum + op.totalCost, 0);

  const operationData = [
    ["OPERATION BREAKDOWN", "", "", "", "", "", "", "", "", "", ""],
    operationHeaders,
    ...operationRows,
    [
      "TOTAL",
      "",
      "",
      totalSetupTime,
      totalMachiningTime,
      totalToolChangeTime,
      totalTime,
      formatCurrency(totalSetupCost, currency),
      formatCurrency(totalMachiningCost, currency),
      formatCurrency(totalToolingCost, currency),
      formatCurrency(totalOperationCost, currency),
    ],
  ];

  const operationSheet = XLSX.utils.aoa_to_sheet(operationData);
  operationSheet["!cols"] = [
    { wch: 8 },
    { wch: 20 },
    { wch: 15 },
    { wch: 15 },
    { wch: 18 },
    { wch: 14 },
    { wch: 14 },
    { wch: 12 },
    { wch: 14 },
    { wch: 12 },
    { wch: 12 },
  ];
  operationSheet["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 10 } },
  ];

  XLSX.utils.book_append_sheet(workbook, operationSheet, "Operations");

  // =========================================
  // Sheet 5: Machine Utilization
  // =========================================
  const machineUtilizationHeaders = [
    "Machine",
    "Total Time (min)",
    "Hourly Rate",
    "Setup Cost",
    "Runtime Cost",
    "Total Cost",
  ];

  const machineRows = reportData.machineUtilization.map(m => [
    m.machineName,
    m.totalTime,
    formatCurrency(m.hourlyRate, currency),
    formatCurrency(m.setupCost, currency),
    formatCurrency(m.machiningCost, currency),
    formatCurrency(m.setupCost + m.machiningCost, currency),
  ]);

  const totalMachineTime = reportData.machineUtilization.reduce((sum, m) => sum + m.totalTime, 0);
  const totalMachineCost = reportData.machineUtilization.reduce((sum, m) => sum + m.setupCost + m.machiningCost, 0);

  const machineData = [
    ["MACHINE UTILIZATION", "", "", "", "", ""],
    machineUtilizationHeaders,
    ...machineRows,
    [
      "TOTAL",
      totalMachineTime,
      "",
      "",
      "",
      formatCurrency(totalMachineCost, currency),
    ],
  ];

  const machineSheet = XLSX.utils.aoa_to_sheet(machineData);
  machineSheet["!cols"] = [
    { wch: 20 },
    { wch: 15 },
    { wch: 15 },
    { wch: 12 },
    { wch: 12 },
    { wch: 15 },
  ];
  machineSheet["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } },
  ];

  XLSX.utils.book_append_sheet(workbook, machineSheet, "Machine Utilization");

  // =========================================
  // Sheet 6: Secondary Processes
  // =========================================
  if (reportData.secondaryProcesses && reportData.secondaryProcesses.length > 0) {
    const secondaryHeaders = [
      "Process",
      "Type",
      "Unit Price",
      "Price Unit",
      "Quantity",
      "Total Cost",
    ];

    const secondaryRows = reportData.secondaryProcesses
      .filter(p => p.selected)
      .map(p => [
        p.name,
        formatSecondaryProcessType(p.type),
        formatCurrency(p.unitPrice, currency),
        p.priceUnit,
        p.quantity || 1,
        formatCurrency(p.totalCost || 0, currency),
      ]);

    const secondaryTotal = reportData.secondaryProcesses
      .filter(p => p.selected)
      .reduce((sum, p) => sum + (p.totalCost || 0), 0);

    const secondaryData = [
      ["SECONDARY PROCESSES", "", "", "", "", ""],
      secondaryHeaders,
      ...secondaryRows,
      ["TOTAL", "", "", "", "", formatCurrency(secondaryTotal, currency)],
    ];

    const secondarySheet = XLSX.utils.aoa_to_sheet(secondaryData);
    secondarySheet["!cols"] = [
      { wch: 25 },
      { wch: 25 },
      { wch: 15 },
      { wch: 12 },
      { wch: 10 },
      { wch: 15 },
    ];
    secondarySheet["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } },
    ];

    XLSX.utils.book_append_sheet(workbook, secondarySheet, "Secondary Processes");
  }

  // =========================================
  // Sheet 7: Cost Breakdown (Detailed)
  // =========================================
  const costBreakdownData = [
    ["DETAILED COST BREAKDOWN", ""],
    ["", ""],
    ["DIRECT COSTS", ""],
    ["Material Cost", formatCurrency(reportData.costBreakdown.materialCost, currency)],
    ["  - Raw Material", formatCurrency(reportData.costBreakdown.materialCost * 0.7, currency)],
    ["  - Material Waste (30%)", formatCurrency(reportData.costBreakdown.materialCost * 0.3, currency)],
    ["", ""],
    ["Machining Cost", formatCurrency(reportData.costBreakdown.machiningCost, currency)],
    ["  - Setup Costs", formatCurrency(reportData.operations.reduce((s, op) => s + op.setupCost, 0), currency)],
    ["  - Runtime Costs", formatCurrency(reportData.operations.reduce((s, op) => s + op.machiningCost, 0), currency)],
    ["", ""],
    ["Tooling Cost", formatCurrency(reportData.costBreakdown.toolingCost, currency)],
    ["Secondary Processes", formatCurrency(reportData.costBreakdown.secondaryCost, currency)],
    ["", ""],
    ["Subtotal", formatCurrency(reportData.costBreakdown.subtotal, currency)],
    ["", ""],
    ["INDIRECT COSTS", ""],
    [`Overhead (${reportData.costBreakdown.overheadPercent}%)`, formatCurrency(reportData.costBreakdown.overheadAmount, currency)],
    [`Profit Margin (${reportData.costBreakdown.profitPercent}%)`, formatCurrency(reportData.costBreakdown.profitAmount, currency)],
    ["", ""],
    ["TOTAL ESTIMATED COST", formatCurrency(reportData.costBreakdown.totalCost, currency)],
  ];

  const costBreakdownSheet = XLSX.utils.aoa_to_sheet(costBreakdownData);
  costBreakdownSheet["!cols"] = [
    { wch: 35 },
    { wch: 20 },
  ];
  costBreakdownSheet["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 1 } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: 1 } },
    { s: { r: 16, c: 0 }, e: { r: 16, c: 1 } },
  ];

  XLSX.utils.book_append_sheet(workbook, costBreakdownSheet, "Cost Breakdown");

  // Write workbook to buffer
  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "buffer",
  });

  return Buffer.from(excelBuffer);
}

// Helper functions
function formatFeatureType(type: string): string {
  return type
    .split("_")
    .map(word => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");
}

function formatSecondaryProcessType(type: string): string {
  const typeMap: Record<string, string> = {
    PAINTING: "Painting",
    POWDER_COATING: "Powder Coating",
    ELECTROPLATING: "Electroplating",
    ANODIZING: "Anodizing",
    GALVANIZING: "Galvanizing",
    HEAT_TREATMENT_HARDENING: "Heat Treatment - Hardening",
    HEAT_TREATMENT_TEMPERING: "Heat Treatment - Tempering",
    HEAT_TREATMENT_ANNEALING: "Heat Treatment - Annealing",
    HEAT_TREATMENT_CASE_HARDENING: "Heat Treatment - Case Hardening",
    INSPECTION: "Inspection / QC",
    DEBURRING: "Deburring",
    POLISHING: "Polishing",
    PACKAGING: "Packaging",
    CUSTOM: "Custom Process",
  };
  return typeMap[type] || type;
}

// Generate quote number
export function generateQuoteNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `Q-${year}-${random}`;
}
