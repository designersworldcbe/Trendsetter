"use client";

import { useState } from "react";
import { 
  Settings,
  User,
  Building2,
  CreditCard,
  Bell,
  Shield,
  Save,
  Palette
} from "lucide-react";

const tabs = [
  { id: "profile", label: "Profile", icon: User },
  { id: "organization", label: "Organization", icon: Building2 },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: Shield },
  { id: "preferences", label: "Preferences", icon: Palette },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and application settings
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-64 flex-shrink-0">
          <nav className="space-y-1 bg-background rounded-xl border border-border p-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium 
                  transition-colors text-left
                  ${activeTab === tab.id 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }
                `}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="bg-background rounded-xl border border-border">
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-6">Profile Settings</h2>
                <div className="space-y-6">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-2xl font-bold text-primary">JD</span>
                    </div>
                    <div>
                      <button className="px-4 py-2 border border-border rounded-md font-medium hover:bg-muted transition-colors">
                        Change Photo
                      </button>
                      <p className="text-xs text-muted-foreground mt-2">
                        JPG, PNG or GIF. Max size 2MB.
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium mb-2">Full Name</label>
                      <input
                        type="text"
                        defaultValue="John Doe"
                        className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Email</label>
                      <input
                        type="email"
                        defaultValue="john@company.com"
                        className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium mb-2">Phone</label>
                      <input
                        type="tel"
                        defaultValue="+91 98765 43210"
                        className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Role</label>
                      <input
                        type="text"
                        defaultValue="Owner"
                        disabled
                        className="w-full px-3 py-2 border border-input rounded-md bg-muted text-sm"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div>
                      {saved && (
                        <span className="text-sm text-green-600">Changes saved successfully!</span>
                      )}
                    </div>
                    <button
                      onClick={handleSave}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Organization Tab */}
            {activeTab === "organization" && (
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-6">Organization Settings</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Organization Name</label>
                    <input
                      type="text"
                      defaultValue="ABC Engineering Works"
                      className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Website</label>
                    <input
                      type="url"
                      defaultValue="https://abcengineering.com"
                      className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Address</label>
                    <textarea
                      rows={3}
                      defaultValue="123 Industrial Area, Coimbatore - 641001, Tamil Nadu, India"
                      className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Currency</label>
                    <select className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                      <option value="INR">Indian Rupee (₹)</option>
                      <option value="USD">US Dollar ($)</option>
                      <option value="EUR">Euro (€)</option>
                      <option value="GBP">British Pound (£)</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div>
                      {saved && (
                        <span className="text-sm text-green-600">Changes saved successfully!</span>
                      )}
                    </div>
                    <button
                      onClick={handleSave}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Billing Tab */}
            {activeTab === "billing" && (
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-6">Billing & Subscription</h2>
                <div className="space-y-6">
                  <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Current Plan: Professional</p>
                        <p className="text-sm text-muted-foreground">
                          ₹999/month • Renews on Feb 1, 2027
                        </p>
                      </div>
                      <button className="px-4 py-2 border border-border rounded-md font-medium hover:bg-muted transition-colors">
                        Upgrade Plan
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-4">Billing History</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between py-3 border-b border-border">
                        <div>
                          <p className="font-medium">January 2027</p>
                          <p className="text-sm text-muted-foreground">Professional Plan</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">₹999</p>
                          <button className="text-sm text-primary hover:underline">Download</button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between py-3 border-b border-border">
                        <div>
                          <p className="font-medium">December 2026</p>
                          <p className="text-sm text-muted-foreground">Professional Plan</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">₹999</p>
                          <button className="text-sm text-primary hover:underline">Download</button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-4">Payment Method</h3>
                    <div className="flex items-center gap-4 p-4 border border-border rounded-lg">
                      <div className="w-12 h-8 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">
                        VISA
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">•••• •••• •••• 4242</p>
                        <p className="text-sm text-muted-foreground">Expires 12/28</p>
                      </div>
                      <button className="text-sm text-primary hover:underline">
                        Change
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === "notifications" && (
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-6">Notification Preferences</h2>
                <div className="space-y-4">
                  {[
                    { label: "Email me when a calculation is completed", defaultChecked: true },
                    { label: "Email me when my subscription renews", defaultChecked: true },
                    { label: "Send me weekly usage reports", defaultChecked: false },
                    { label: "Email me about new features and updates", defaultChecked: false },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between py-3 border-b border-border">
                      <span className="text-sm">{item.label}</span>
                      <input
                        type="checkbox"
                        defaultChecked={item.defaultChecked}
                        className="w-5 h-5 rounded border-input"
                      />
                    </div>
                  ))}
                  <div className="flex items-center justify-end pt-4">
                    <button
                      onClick={handleSave}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-6">Security Settings</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium mb-4">Change Password</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Current Password</label>
                        <input
                          type="password"
                          className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">New Password</label>
                        <input
                          type="password"
                          className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Confirm New Password</label>
                        <input
                          type="password"
                          className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors">
                        Update Password
                      </button>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-border">
                    <h3 className="font-medium mb-4">Two-Factor Authentication</h3>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm">Add an extra layer of security to your account</p>
                        <p className="text-sm text-muted-foreground">Status: Not enabled</p>
                      </div>
                      <button className="px-4 py-2 border border-border rounded-md font-medium hover:bg-muted transition-colors">
                        Enable 2FA
                      </button>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-border">
                    <h3 className="font-medium mb-4">Active Sessions</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between py-3 border-b border-border">
                        <div>
                          <p className="font-medium">Current Session</p>
                          <p className="text-sm text-muted-foreground">Chrome on MacOS • Coimbatore, India</p>
                        </div>
                        <span className="text-sm text-green-600">Active now</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Preferences Tab */}
            {activeTab === "preferences" && (
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-6">Application Preferences</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Default Markup Settings</label>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div>
                        <label className="block text-xs text-muted-foreground mb-2">Overhead %</label>
                        <input
                          type="number"
                          defaultValue={15}
                          className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-muted-foreground mb-2">Profit %</label>
                        <input
                          type="number"
                          defaultValue={10}
                          className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-muted-foreground mb-2">Sales %</label>
                        <input
                          type="number"
                          defaultValue={5}
                          className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Default Currency</label>
                    <select className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                      <option value="INR">Indian Rupee (₹)</option>
                      <option value="USD">US Dollar ($)</option>
                      <option value="EUR">Euro (€)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Quote Validity (days)</label>
                    <input
                      type="number"
                      defaultValue={30}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div className="flex items-center justify-end pt-4 border-t border-border">
                    <button
                      onClick={handleSave}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
