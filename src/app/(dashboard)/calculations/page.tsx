"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Calculator,
  Search,
  Filter,
  Download,
  MoreVertical,
  Calendar,
  DollarSign,
  Layers,
  CheckCircle2,
  Clock,
  FileSpreadsheet,
  Trash2,
  Eye,
  Copy
} from "lucide-react";

const calculations = [
  {
    id: "1",
    name: "Housing Bracket v2",
    quoteNumber: "Q-2027-0001",
    date: "2027-01-15",
    cost: 3450,
    features: 8,
    status: "completed",
    customer: "ABC Engineering",
  },
  {
    id: "2",
    name: "Gear Housing",
    quoteNumber: "Q-2027-0002",
    date: "2027-01-14",
    cost: 5230,
    features: 12,
    status: "completed",
    customer: "XYZ Manufacturing",
  },
  {
    id: "3",
    name: "Motor Mount",
    quoteNumber: "Q-2027-0003",
    date: "2027-01-13",
    cost: 2180,
    features: 5,
    status: "completed",
    customer: "Local Workshop",
  },
  {
    id: "4",
    name: "Pump Impeller",
    quoteNumber: "Q-2027-0004",
    date: "2027-01-12",
    cost: 6750,
    features: 15,
    status: "completed",
    customer: "HydroTech",
  },
  {
    id: "5",
    name: "Valve Body",
    quoteNumber: "Q-2027-0005",
    date: "2027-01-11",
    cost: 4120,
    features: 10,
    status: "pending",
    customer: "FlowControl Inc",
  },
];

export default function CalculationsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredCalculations = calculations.filter((calc) => {
    const matchesSearch = 
      calc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      calc.quoteNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      calc.customer.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || calc.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const totalCost = calculations.reduce((sum, calc) => sum + calc.cost, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Calculations</h1>
          <p className="text-muted-foreground">
            {calculations.length} calculations • Total value: ₹{totalCost.toLocaleString()}
          </p>
        </div>
        <Link 
          href="/dashboard/upload"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors"
        >
          <Calculator className="w-4 h-4" />
          New Calculation
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, quote number, or customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all">All Status</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      {/* Calculations Table */}
      <div className="bg-background rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="table-header">
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Calculation
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Quote #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Features
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Cost
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredCalculations.map((calc) => (
                <tr key={calc.id} className="table-row">
                  <td className="px-6 py-4">
                    <Link 
                      href={`/dashboard/calculations/${calc.id}`}
                      className="font-medium hover:text-primary"
                    >
                      {calc.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {calc.quoteNumber}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {calc.date}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {calc.customer}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-sm">
                      <Layers className="w-4 h-4 text-muted-foreground" />
                      {calc.features}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium">
                    ₹{calc.cost.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`
                      inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
                      ${calc.status === "completed" 
                        ? "bg-green-500/10 text-green-600" 
                        : "bg-yellow-500/10 text-yellow-600"
                      }
                    `}>
                      {calc.status === "completed" ? (
                        <CheckCircle2 className="w-3 h-3" />
                      ) : (
                        <Clock className="w-3 h-3" />
                      )}
                      {calc.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/dashboard/calculations/${calc.id}`}
                        className="p-2 hover:bg-muted rounded-md transition-colors"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <button
                        className="p-2 hover:bg-muted rounded-md transition-colors"
                        title="Download Excel"
                      >
                        <FileSpreadsheet className="w-4 h-4" />
                      </button>
                      <button
                        className="p-2 hover:bg-muted rounded-md transition-colors"
                        title="Duplicate"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        className="p-2 hover:bg-muted rounded-md transition-colors text-destructive"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredCalculations.length === 0 && (
          <div className="p-12 text-center">
            <Calculator className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium mb-2">No calculations found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {searchTerm || statusFilter !== "all"
                ? "Try adjusting your search or filters"
                : "Upload your first CAD file to get started"
              }
            </p>
            <Link 
              href="/dashboard/upload"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors"
            >
              <Calculator className="w-4 h-4" />
              New Calculation
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
