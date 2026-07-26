"use client";

import { useState } from "react";
import { 
  Cog,
  Plus,
  Search,
  Edit2,
  Trash2,
  DollarSign,
  Clock,
  Settings,
  CheckCircle2,
  XCircle,
  Download,
  Upload
} from "lucide-react";

const machines = [
  {
    id: "1",
    name: "VMC 3-Axis 850",
    type: "VMC",
    description: "Vertical Machining Center - 3 Axis",
    hourlyRate: 800,
    setupCost: 4000,
    toolingCostRate: 2.5,
    materialRemovalRate: 20,
    efficiency: 85,
    isActive: true,
    workEnvelope: "850 x 520 x 500 mm",
    spindleSpeed: "50-8000 RPM",
  },
  {
    id: "2",
    name: "CNC Lathe 200",
    type: "CNC_TURNING",
    description: "CNC Turning Center",
    hourlyRate: 600,
    setupCost: 3000,
    toolingCostRate: 1.8,
    materialRemovalRate: 15,
    efficiency: 80,
    isActive: true,
    workEnvelope: "Ø200 x 400 mm",
    spindleSpeed: "100-4000 RPM",
  },
  {
    id: "3",
    name: "HMC 630",
    type: "HMC",
    description: "Horizontal Machining Center",
    hourlyRate: 1200,
    setupCost: 6000,
    toolingCostRate: 3.5,
    materialRemovalRate: 25,
    efficiency: 90,
    isActive: true,
    workEnvelope: "630 x 630 x 630 mm",
    spindleSpeed: "50-12000 RPM",
  },
  {
    id: "4",
    name: "5-Axis Mill 400",
    type: "CNC_MILLING_5AXIS",
    description: "5-Axis CNC Milling Machine",
    hourlyRate: 2000,
    setupCost: 10000,
    toolingCostRate: 5.0,
    materialRemovalRate: 18,
    efficiency: 75,
    isActive: false,
    workEnvelope: "400 x 400 x 400 mm",
    spindleSpeed: "100-24000 RPM",
  },
];

const machineTypes = [
  { value: "VMC", label: "VMC (Vertical Machining Center)" },
  { value: "HMC", label: "HMC (Horizontal Machining Center)" },
  { value: "CNC_TURNING", label: "CNC Turning" },
  { value: "CNC_MILLING_3AXIS", label: "CNC Milling (3-Axis)" },
  { value: "CNC_MILLING_4AXIS", label: "CNC Milling (4-Axis)" },
  { value: "CNC_MILLING_5AXIS", label: "CNC Milling (5-Axis)" },
  { value: "EDM_WIRE", label: "EDM Wire Cut" },
  { value: "EDM_DIE_SINKING", label: "EDM Die Sinking" },
  { value: "GRINDING", label: "Grinding" },
  { value: "DRILLING", label: "Drilling" },
  { value: "OTHER", label: "Other" },
];

export default function MachinesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingMachine, setEditingMachine] = useState<typeof machines[0] | null>(null);

  const filteredMachines = machines.filter((machine) =>
    machine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    machine.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddMachine = () => {
    setEditingMachine(null);
    setShowModal(true);
  };

  const handleEditMachine = (machine: typeof machines[0]) => {
    setEditingMachine(machine);
    setShowModal(true);
  };

  const handleDeleteMachine = (id: string) => {
    if (confirm("Are you sure you want to delete this machine?")) {
      // Delete logic here
      console.log("Delete machine:", id);
    }
  };

  const getMachineTypeLabel = (type: string) => {
    return machineTypes.find(t => t.value === type)?.label || type;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Machine Database</h1>
          <p className="text-muted-foreground">
            Manage your machines and hourly rates
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-md font-medium hover:bg-muted transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-md font-medium hover:bg-muted transition-colors">
            <Upload className="w-4 h-4" />
            Import
          </button>
          <button 
            onClick={handleAddMachine}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Machine
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="bg-background rounded-xl p-4 border border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Cog className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Machines</p>
              <p className="text-xl font-bold">{machines.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-background rounded-xl p-4 border border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active</p>
              <p className="text-xl font-bold">{machines.filter(m => m.isActive).length}</p>
            </div>
          </div>
        </div>
        <div className="bg-background rounded-xl p-4 border border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-500/10 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg. Hourly Rate</p>
              <p className="text-xl font-bold">₹{Math.round(machines.reduce((s, m) => s + m.hourlyRate, 0) / machines.length)}</p>
            </div>
          </div>
        </div>
        <div className="bg-background rounded-xl p-4 border border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
              <Settings className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg. Efficiency</p>
              <p className="text-xl font-bold">{Math.round(machines.reduce((s, m) => s + m.efficiency, 0) / machines.length)}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search machines..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Machines Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {filteredMachines.map((machine) => (
          <div 
            key={machine.id}
            className="bg-background rounded-xl border border-border p-6 card-hover"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Cog className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">{machine.name}</h3>
                  <p className="text-sm text-muted-foreground">{getMachineTypeLabel(machine.type)}</p>
                </div>
              </div>
              <span className={`
                inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
                ${machine.isActive 
                  ? "bg-green-500/10 text-green-600" 
                  : "bg-red-500/10 text-red-600"
                }
              `}>
                {machine.isActive ? (
                  <CheckCircle2 className="w-3 h-3" />
                ) : (
                  <XCircle className="w-3 h-3" />
                )}
                {machine.isActive ? "Active" : "Inactive"}
              </span>
            </div>

            <p className="text-sm text-muted-foreground mb-4">
              {machine.description}
            </p>

            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
              <div>
                <p className="text-muted-foreground">Hourly Rate</p>
                <p className="font-semibold">₹{machine.hourlyRate}/hr</p>
              </div>
              <div>
                <p className="text-muted-foreground">Setup Cost</p>
                <p className="font-semibold">₹{machine.setupCost}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Work Envelope</p>
                <p className="font-medium">{machine.workEnvelope}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Efficiency</p>
                <p className="font-semibold">{machine.efficiency}%</p>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-4 border-t border-border">
              <button
                onClick={() => handleEditMachine(machine)}
                className="flex-1 py-2 text-sm font-medium hover:bg-muted rounded-md transition-colors flex items-center justify-center gap-2"
              >
                <Edit2 className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={() => handleDeleteMachine(machine.id)}
                className="flex-1 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-md transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredMachines.length === 0 && (
        <div className="bg-background rounded-xl border border-border p-12 text-center">
          <Cog className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-medium mb-2">No machines found</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {searchTerm
              ? "Try adjusting your search"
              : "Add your first machine to get started"
            }
          </p>
          <button 
            onClick={handleAddMachine}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Machine
          </button>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowModal(false)}
          />
          <div className="relative bg-background rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-border">
              <h2 className="text-lg font-semibold">
                {editingMachine ? "Edit Machine" : "Add New Machine"}
              </h2>
            </div>
            <form className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Machine Name</label>
                <input
                  type="text"
                  defaultValue={editingMachine?.name || ""}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g., VMC 3-Axis 850"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Machine Type</label>
                <select
                  defaultValue={editingMachine?.type || "VMC"}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {machineTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <input
                  type="text"
                  defaultValue={editingMachine?.description || ""}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Brief description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Hourly Rate (₹)</label>
                  <input
                    type="number"
                    defaultValue={editingMachine?.hourlyRate || 800}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Setup Cost (₹)</label>
                  <input
                    type="number"
                    defaultValue={editingMachine?.setupCost || 4000}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Tooling Rate (₹/min)</label>
                  <input
                    type="number"
                    step="0.1"
                    defaultValue={editingMachine?.toolingCostRate || 2.5}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Efficiency (%)</label>
                  <input
                    type="number"
                    defaultValue={editingMachine?.efficiency || 85}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Work Envelope</label>
                <input
                  type="text"
                  defaultValue={editingMachine?.workEnvelope || ""}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g., 850 x 520 x 500 mm"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  defaultChecked={editingMachine?.isActive ?? true}
                  className="w-4 h-4 rounded border-input"
                />
                <label htmlFor="isActive" className="text-sm font-medium">
                  Machine is active and available for calculations
                </label>
              </div>
            </form>
            <div className="px-6 py-4 border-t border-border flex items-center justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-border rounded-md font-medium hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors"
              >
                {editingMachine ? "Save Changes" : "Add Machine"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
