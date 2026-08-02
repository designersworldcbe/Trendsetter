"use client";

import Link from "next/link";
import { 
  Upload,
  Calculator,
  DollarSign,
  TrendingUp,
  Clock,
  ArrowRight,
  FileText,
  Cog,
  CheckCircle2
} from "lucide-react";

const recentCalculations = [
  {
    id: "1",
    name: "Housing Bracket v2",
    date: "2027-01-15",
    cost: "₹3,450",
    features: 8,
    status: "completed"
  },
  {
    id: "2",
    name: "Gear Housing",
    date: "2027-01-14",
    cost: "₹5,230",
    features: 12,
    status: "completed"
  },
  {
    id: "3",
    name: "Motor Mount",
    date: "2027-01-13",
    cost: "₹2,180",
    features: 5,
    status: "completed"
  },
];

const stats = [
  {
    name: "Total Calculations",
    value: "47",
    change: "+12%",
    changeType: "positive",
    icon: Calculator,
  },
  {
    name: "Total Estimates",
    value: "₹1,45,230",
    change: "+8%",
    changeType: "positive",
    icon: DollarSign,
  },
  {
    name: "Avg. Turnaround",
    value: "2.5 min",
    change: "-15%",
    changeType: "positive",
    icon: Clock,
  },
  {
    name: "Active Machines",
    value: "5",
    change: "0",
    changeType: "neutral",
    icon: Cog,
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here&apos;s your overview.</p>
        </div>
        <Link 
          href="/upload"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors"
        >
          <Upload className="w-4 h-4" />
          New Calculation
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div 
            key={stat.name}
            className="bg-background rounded-xl p-6 border border-border"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.name}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <stat.icon className="w-6 h-6 text-primary" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1 text-sm">
              <TrendingUp className={`w-4 h-4 ${stat.changeType === 'positive' ? 'text-green-500' : 'text-muted-foreground'}`} />
              <span className={stat.changeType === 'positive' ? 'text-green-500' : 'text-muted-foreground'}>
                {stat.change}
              </span>
              <span className="text-muted-foreground">vs last month</span>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Link 
          href="/upload"
          className="bg-background rounded-xl p-6 border border-border card-hover group"
        >
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
            <Upload className="w-6 h-6 text-primary" />
          </div>
          <h3 className="font-semibold mb-1">Upload CAD File</h3>
          <p className="text-sm text-muted-foreground">
            Upload STEP, STP, or other CAD files for feature recognition and cost estimation.
          </p>
        </Link>

        <Link 
          href="/machines"
          className="bg-background rounded-xl p-6 border border-border card-hover group"
        >
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
            <Cog className="w-6 h-6 text-primary" />
          </div>
          <h3 className="font-semibold mb-1">Manage Machines</h3>
          <p className="text-sm text-muted-foreground">
            Configure your machine database with hourly rates and capabilities.
          </p>
        </Link>

        <Link 
          href="/reports"
          className="bg-background rounded-xl p-6 border border-border card-hover group"
        >
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
            <FileText className="w-6 h-6 text-primary" />
          </div>
          <h3 className="font-semibold mb-1">View Reports</h3>
          <p className="text-sm text-muted-foreground">
            Access and download your calculation history and reports.
          </p>
        </Link>
      </div>

      {/* Recent Calculations */}
      <div className="bg-background rounded-xl border border-border">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold">Recent Calculations</h2>
          <Link 
            href="/calculations?/calculations"
            className="text-sm text-primary hover:underline flex items-center gap-1"
          >
            View all
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="divide-y divide-border">
          {recentCalculations.map((calc) => (
            <Link
              key={calc.id}
              href={`/calculations/${calc.id}`}
              className="flex items-center justify-between px-6 py-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Calculator className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{calc.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {calc.features} features • {calc.date}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-semibold">{calc.cost}</p>
                  <div className="flex items-center gap-1 text-sm text-green-600">
                    <CheckCircle2 className="w-3 h-3" />
                    {calc.status}
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Getting Started */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-8 border border-primary/20">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-semibold mb-2">Ready to get started?</h3>
            <p className="text-muted-foreground">
              Upload your first CAD file and get an instant cost estimate in minutes.
            </p>
          </div>
          <Link 
            href="/upload"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors whitespace-nowrap"
          >
            Upload Your First File
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
