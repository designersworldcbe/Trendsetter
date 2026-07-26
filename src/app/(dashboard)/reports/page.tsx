"use client";

import { useState } from "react";
import { 
  FileSpreadsheet,
  FileText,
  Download,
  Calendar,
  Filter,
  Search,
  File,
  Image
} from "lucide-react";
import Link from "next/link";

const reports = [
  {
    id: "1",
    name: "Housing Bracket v2",
    quoteNumber: "Q-2027-0001",
    date: "2027-01-15",
    customer: "ABC Engineering",
    totalCost: 3450,
    excelUrl: "#",
    pdfUrl: "#",
    hasImages: true,
  },
  {
    id: "2",
    name: "Gear Housing",
    quoteNumber: "Q-2027-0002",
    date: "2027-01-14",
    customer: "XYZ Manufacturing",
    totalCost: 5230,
    excelUrl: "#",
    pdfUrl: "#",
    hasImages: true,
  },
  {
    id: "3",
    name: "Motor Mount",
    quoteNumber: "Q-2027-0003",
    date: "2027-01-13",
    customer: "Local Workshop",
    totalCost: 2180,
    excelUrl: "#",
    pdfUrl: "#",
    hasImages: false,
  },
];

export default function ReportsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("all");

  const filteredReports = reports.filter((report) => {
    const matchesSearch = 
      report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.quoteNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.customer.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Reports</h1>
        <p className="text-muted-foreground">
          Download and manage your calculation reports
        </p>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/20">
        <div className="flex items-start gap-3">
          <FileSpreadsheet className="w-5 h-5 text-blue-500 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-500 mb-1">Excel Reports Include:</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Summary sheet with total costs</li>
              <li>• Model information (dimensions, volume, surface area)</li>
              <li>• Feature recognition results</li>
              <li>• Operation breakdown with cycle times</li>
              <li>• Machine utilization summary</li>
              <li>• Detailed cost breakdown</li>
              <li>• Model images (top, front, isometric views)</li>
            </ul>
          </div>
        </div>
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
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="px-4 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
        </select>
      </div>

      {/* Reports Table */}
      <div className="bg-background rounded-xl border border-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="table-header">
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Report
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
                Cost
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Contents
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Downloads
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredReports.map((report) => (
              <tr key={report.id} className="table-row">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <File className="w-5 h-5 text-primary" />
                    </div>
                    <span className="font-medium">{report.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground">
                  {report.quoteNumber}
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground">
                  {report.date}
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground">
                  {report.customer}
                </td>
                <td className="px-6 py-4 font-medium">
                  ₹{report.totalCost.toLocaleString()}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-muted px-2 py-1 rounded">
                      Features
                    </span>
                    <span className="text-xs bg-muted px-2 py-1 rounded">
                      Operations
                    </span>
                    <span className="text-xs bg-muted px-2 py-1 rounded">
                      Costs
                    </span>
                    {report.hasImages && (
                      <span className="flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                        <Image className="w-3 h-3" />
                        Images
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <a
                      href={report.excelUrl}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium bg-green-500/10 text-green-600 hover:bg-green-500/20 rounded-md transition-colors"
                      title="Download Excel Report"
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                      Excel
                    </a>
                    <a
                      href={report.pdfUrl}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium bg-red-500/10 text-red-600 hover:bg-red-500/20 rounded-md transition-colors"
                      title="Download PDF Report"
                    >
                      <FileText className="w-4 h-4" />
                      PDF
                    </a>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredReports.length === 0 && (
          <div className="p-12 text-center">
            <FileSpreadsheet className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium mb-2">No reports found</h3>
            <p className="text-sm text-muted-foreground">
              {searchTerm
                ? "Try adjusting your search"
                : "Complete a calculation to generate reports"
              }
            </p>
          </div>
        )}
      </div>

      {/* Sample Report Preview */}
      <div className="bg-background rounded-xl border border-border p-6">
        <h3 className="font-semibold mb-4">Sample Excel Report Structure</h3>
        <div className="grid gap-4 md:grid-cols-4">
          <div className="p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-green-500" />
              Sheet 1: Summary
            </h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Quote details</li>
              <li>• Customer info</li>
              <li>• Total cost breakdown</li>
              <li>• Terms & conditions</li>
            </ul>
          </div>
          <div className="p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-blue-500" />
              Sheet 2: Model Info
            </h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• File details</li>
              <li>• Dimensions</li>
              <li>• Volume & surface area</li>
              <li>• Weight calculation</li>
            </ul>
          </div>
          <div className="p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-purple-500" />
              Sheet 3: Features
            </h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• All recognized features</li>
              <li>• Dimensions</li>
              <li>• Suggested machines</li>
              <li>• Quantities</li>
            </ul>
          </div>
          <div className="p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-orange-500" />
              Sheet 4: Operations
            </h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Operation sequence</li>
              <li>• Cycle times</li>
              <li>• Setup groups</li>
              <li>• Cost per operation</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
