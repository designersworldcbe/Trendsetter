import Link from "next/link";
import { 
  Layers, 
  Calculator, 
  FileSpreadsheet, 
  Zap, 
  Shield, 
  Clock,
  ChevronRight,
  Box,
  Cog,
  DollarSign,
  ArrowRight
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Box className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold">Trendsetter</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Features
            </Link>
            <Link href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </Link>
            <Link href="/auth/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Sign In
            </Link>
            <Link 
              href="/auth/register" 
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-6">
            <Zap className="w-4 h-4" />
            AI-Powered Feature Recognition
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Instant Machining Cost Estimation from 3D Models
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Upload your STEP, STP, or native CAD files. Our AI automatically recognizes 
            features, calculates cycle times, and generates accurate cost estimates in seconds.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/auth/register" 
              className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors"
            >
              Start Free Trial
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link 
              href="/demo" 
              className="flex items-center gap-2 px-6 py-3 border border-border rounded-md font-medium hover:bg-muted transition-colors"
            >
              Watch Demo
            </Link>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </div>
      </section>

      {/* Hero Visual */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="model-viewer-container relative aspect-video rounded-xl overflow-hidden shadow-2xl">
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary">
              <div className="text-center">
                <Box className="w-24 h-24 text-primary/50 mx-auto mb-4" />
                <p className="text-muted-foreground">3D Model Preview</p>
                <p className="text-sm text-muted-foreground/70">Upload a file to see features</p>
              </div>
            </div>
            {/* Floating cards */}
            <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm rounded-lg p-4 shadow-lg">
              <div className="flex items-center gap-2 text-sm">
                <Layers className="w-4 h-4 text-green-500" />
                <span>5 Features Detected</span>
              </div>
            </div>
            <div className="absolute bottom-4 right-4 bg-background/90 backdrop-blur-sm rounded-lg p-4 shadow-lg">
              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="w-4 h-4 text-blue-500" />
                <span>Est. ₹3,450</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need for Accurate Cost Estimation
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              From 3D model upload to detailed Excel reports, Trendsetter streamlines your 
              machining cost calculation workflow.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-background rounded-xl p-6 shadow-sm card-hover">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Layers className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Automatic Feature Recognition</h3>
              <p className="text-muted-foreground">
                Upload STEP/STP files and let our AI identify holes, pockets, slots, 
                bosses, and threads automatically.
              </p>
            </div>

            <div className="bg-background rounded-xl p-6 shadow-sm card-hover">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Cog className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Machine Database</h3>
              <p className="text-muted-foreground">
                Manage your machines with editable MHR, setup costs, and efficiency 
                factors. Add new machines anytime.
              </p>
            </div>

            <div className="bg-background rounded-xl p-6 shadow-sm card-hover">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Cycle Time Calculation</h3>
              <p className="text-muted-foreground">
                Accurate machining time estimates based on feature geometry, 
                material properties, and machine capabilities.
              </p>
            </div>

            <div className="bg-background rounded-xl p-6 shadow-sm card-hover">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <FileSpreadsheet className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Excel Report Export</h3>
              <p className="text-muted-foreground">
                Generate professional Excel reports with model images, operation details, 
                and complete cost breakdowns.
              </p>
            </div>

            <div className="bg-background rounded-xl p-6 shadow-sm card-hover">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Calculator className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Multi-Setup Support</h3>
              <p className="text-muted-foreground">
                Handle complex parts with multiple setups. Calculate setup costs 
                and operation times for each setup group.
              </p>
            </div>

            <div className="bg-background rounded-xl p-6 shadow-sm card-hover">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Multi-Tenancy</h3>
              <p className="text-muted-foreground">
                Perfect for machine shops with multiple users. Organize by 
                organization with role-based access control.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground text-lg">
              Get accurate cost estimates in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Upload Your CAD File</h3>
              <p className="text-muted-foreground">
                Drag and drop your STEP, STP, or other CAD files. 
                We support files up to 50MB.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">AI Recognizes Features</h3>
              <p className="text-muted-foreground">
                Our AI analyzes the geometry and identifies all machining 
                features automatically.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Get Your Cost Estimate</h3>
              <p className="text-muted-foreground">
                View detailed cost breakdowns and export professional 
                Excel reports instantly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-muted-foreground text-lg">
              Start free, scale as you grow
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-background rounded-xl p-8 shadow-sm border border-border">
              <h3 className="text-xl font-semibold mb-2">Free</h3>
              <p className="text-muted-foreground text-sm mb-4">Perfect for trying out</p>
              <div className="mb-6">
                <span className="text-4xl font-bold">₹0</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-sm">
                  <ChevronRight className="w-4 h-4 text-green-500" />
                  5 calculations/month
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <ChevronRight className="w-4 h-4 text-green-500" />
                  Basic feature recognition
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <ChevronRight className="w-4 h-4 text-green-500" />
                  3 machines in database
                </li>
              </ul>
              <Link 
                href="/auth/register" 
                className="block w-full py-3 text-center border border-border rounded-md font-medium hover:bg-muted transition-colors"
              >
                Get Started
              </Link>
            </div>

            <div className="bg-background rounded-xl p-8 shadow-sm border-2 border-primary relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                Most Popular
              </div>
              <h3 className="text-xl font-semibold mb-2">Professional</h3>
              <p className="text-muted-foreground text-sm mb-4">For growing businesses</p>
              <div className="mb-6">
                <span className="text-4xl font-bold">₹999</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-sm">
                  <ChevronRight className="w-4 h-4 text-green-500" />
                  Unlimited calculations
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <ChevronRight className="w-4 h-4 text-green-500" />
                  Advanced feature recognition
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <ChevronRight className="w-4 h-4 text-green-500" />
                  Unlimited machines
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <ChevronRight className="w-4 h-4 text-green-500" />
                  Excel & PDF export
                </li>
              </ul>
              <Link 
                href="/auth/register?plan=professional" 
                className="block w-full py-3 text-center bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors"
              >
                Start Free Trial
              </Link>
            </div>

            <div className="bg-background rounded-xl p-8 shadow-sm border border-border">
              <h3 className="text-xl font-semibold mb-2">Enterprise</h3>
              <p className="text-muted-foreground text-sm mb-4">For large organizations</p>
              <div className="mb-6">
                <span className="text-4xl font-bold">₹4,999</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-sm">
                  <ChevronRight className="w-4 h-4 text-green-500" />
                  Everything in Professional
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <ChevronRight className="w-4 h-4 text-green-500" />
                  Multi-user & teams
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <ChevronRight className="w-4 h-4 text-green-500" />
                  Custom integrations
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <ChevronRight className="w-4 h-4 text-green-500" />
                  Dedicated support
                </li>
              </ul>
              <Link 
                href="/contact" 
                className="block w-full py-3 text-center border border-border rounded-md font-medium hover:bg-muted transition-colors"
              >
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Speed Up Your Cost Estimation?
          </h2>
          <p className="text-muted-foreground text-lg mb-8">
            Join hundreds of machine shops already using Trendsetter 
            to save time and improve accuracy.
          </p>
          <Link 
            href="/auth/register" 
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-md font-medium text-lg hover:bg-primary/90 transition-colors"
          >
            Start Your Free Trial
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-border">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Box className="w-6 h-6 text-primary" />
              <span className="font-semibold">Trendsetter</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2027 Trendsetter. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
                Privacy
              </Link>
              <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground">
                Terms
              </Link>
              <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
