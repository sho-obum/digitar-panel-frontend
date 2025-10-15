"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

/* -------------------------------------------- */
/* PAGE COMPONENT */
/* -------------------------------------------- */
export default function SmtpSettingPage() {
  const [activeTab, setActiveTab] = useState("general");
  const [formData, setFormData] = useState({
    host: "",
    senderName: "",
    email: "",
    username: "",
    password: "",
    port: "",
    security: "tls",
    testEmail: "",
  });

  const handleChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-white via-blue-50/40 to-purple-50/40">
      {/* Subtle grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.04)_1px,transparent_1px)] bg-[size:32px_32px] opacity-20 pointer-events-none" />

      {/* Header with glow */}
      <header className="relative z-10 px-8 py-4 border-b border-border/40 bg-white/70 backdrop-blur-md shadow-[0_1px_8px_rgba(0,0,0,0.05)]">
        {/* Gradient glow leaking from below */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400/60 via-purple-400/50 to-pink-400/60 blur-md" />

        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-800">SMTP Settings</h1>

          {/* Tabs */}
          <nav className="flex items-center gap-6 text-sm">
            {[
              { id: "general", label: "General" },
              { id: "auth", label: "Authentication" },
              { id: "advanced", label: "Advanced" },
              { id: "testing", label: "Testing" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative pb-1 transition-colors duration-200 ${
                  activeTab === tab.id
                    ? "text-blue-600 font-medium"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <span className="absolute left-0 bottom-0 w-full h-[2px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full" />
                )}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Main container */}
      <main className="relative z-10 mx-auto max-w-6xl px-8 py-10 grid grid-cols-4 gap-10">
        {/* LEFT SIDE (Main content area) */}
        <section className="col-span-3 space-y-10">
          {/* Tab content changes */}
          {activeTab === "general" && (
            <div className="rounded-xl bg-white/90 backdrop-blur-sm border border-border/20 shadow-[0_1px_6px_rgba(0,0,0,0.06)] p-8 space-y-10 transition-all duration-300">
              <div>
                <h2 className="text-lg font-medium text-gray-800">
                  SMTP Configuration
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Fill in your mail server credentials.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <MaterialInput
                  label="SMTP Host"
                  value={formData.host}
                  onChange={(v) => handleChange("host", v)}
                />
                <MaterialInput
                  label="SMTP Sender Name"
                  value={formData.senderName}
                  onChange={(v) => handleChange("senderName", v)}
                />
                <MaterialInput
                  label="SMTP Email"
                  value={formData.email}
                  onChange={(v) => handleChange("email", v)}
                />
                <MaterialInput
                  label="SMTP Username"
                  value={formData.username}
                  onChange={(v) => handleChange("username", v)}
                />
                <MaterialInput
                  label="SMTP Password"
                  type="password"
                  value={formData.password}
                  onChange={(v) => handleChange("password", v)}
                />
                <MaterialInput
                  label="SMTP Port"
                  value={formData.port}
                  onChange={(v) => handleChange("port", v)}
                />
              </div>

              <div>
                <Label className="text-sm text-gray-600">Connection Security</Label>
                <RadioGroup
                  className="flex gap-6 mt-3"
                  value={formData.security}
                  onValueChange={(v) => handleChange("security", v)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="tls" id="tls" />
                    <Label htmlFor="tls" className="text-sm">
                      TLS
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="ssl" id="ssl" />
                    <Label htmlFor="ssl" className="text-sm">
                      SSL
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" className="text-gray-600 border-gray-300">
                  Debug
                </Button>
                <Button className="bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-sm">
                  Save Settings
                </Button>
              </div>
            </div>
          )}

          {activeTab === "testing" && (
            <div className="rounded-xl bg-white/90 border border-border/20 shadow-[0_1px_6px_rgba(0,0,0,0.06)] p-8 space-y-6">
              <h2 className="text-lg font-medium text-gray-800">Test Email</h2>
              <div className="flex gap-3">
                <MaterialInput
                  label="Enter test email address"
                  value={formData.testEmail}
                  onChange={(v) => handleChange("testEmail", v)}
                />
                <Button className="bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-sm">
                  Send Test
                </Button>
              </div>
            </div>
          )}

          {activeTab === "auth" && (
            <div className="rounded-xl bg-white/90 border border-border/20 shadow-sm p-8 text-gray-600">
              <p>Authentication options will appear here.</p>
            </div>
          )}

          {activeTab === "advanced" && (
            <div className="rounded-xl bg-white/90 border border-border/20 shadow-sm p-8 text-gray-600">
              <p>Advanced configurations coming soon.</p>
            </div>
          )}
        </section>

        {/* RIGHT SIDE */}
        <aside className="col-span-1">
          <div className="h-full w-full rounded-xl bg-gradient-to-b from-white/80 to-blue-50/40 border border-border/30 shadow-inner flex items-center justify-center text-sm text-gray-500">
            Right Panel (future use)
          </div>
        </aside>
      </main>
    </div>
  );
}

/* -------------------------------------------- */
/* MATERIAL INPUT WITH GRADIENT UNDERLINE */
/* -------------------------------------------- */
function MaterialInput({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div className="relative">
      <input
        id={label}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder=" "
        className="peer w-full px-3 pt-5 pb-2 text-[15px] text-gray-900 bg-transparent border-b-2 border-gray-200 focus:outline-none focus:border-transparent transition-all duration-200"
      />
      <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 peer-focus:w-full" />
      <label
        htmlFor={label}
        className="absolute left-3 top-2 text-gray-500 text-[14px] transition-all duration-200
        peer-placeholder-shown:top-5 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-[15px]
        peer-focus:top-2 peer-focus:text-[13px] peer-focus:text-blue-600"
      >
        {label}
      </label>
    </div>
  );
}
