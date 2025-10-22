"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioCard } from "@/components/ruixen/radio-group-card";

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
    <div className="flex flex-1 flex-col gap-6">

      <div className="flex justify-between items-center">
          
        <nav className="flex items-center gap-6 text-sm mt-6">
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
                  ? "text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground"
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

      <main className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* LEFT SIDE (Main content area) */}
        <section className="col-span-3 space-y-10">
          {/* Tab content changes */}
          {activeTab === "general" && (
            <div className="rounded-xl bg-white dark:bg-black backdrop-blur-sm border border-border/20 dark:border-border/10 shadow-sm p-8 space-y-10 transition-all duration-300">
              <div>
                {/* section heading removed per request - keep explanatory text subtle */}
                <p className="text-sm text-muted-foreground mt-1">
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
                <Label className="text-sm text-muted-foreground mb-4 block">Connection Security</Label>
                <RadioGroup
                  value={formData.security}
                  onValueChange={(v: string) => handleChange("security", v)}
                >
                  <RadioCard
                    value="tls"
                    id="tls"
                    title="TLS"
                    description="Transport Layer Security - Standard encrypted connection. Recommended for most configurations."
                  />
                  <RadioCard
                    value="ssl"
                    id="ssl"
                    title="SSL"
                    description="Secure Sockets Layer - Legacy protocol. Use only if TLS is not supported by your server."
                  />
                </RadioGroup>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" className="text-foreground border-border">
                  Debug
                </Button>
                <Button className="bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-sm">
                  Save Settings
                </Button>
              </div>
            </div>
          )}

          {activeTab === "testing" && (
            <div className="rounded-xl bg-white dark:bg-black border border-border/20 dark:border-border/10 shadow-sm p-8 space-y-6">
              <h2 className="text-lg font-medium text-foreground">Test Email</h2>
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
            <div className="rounded-xl bg-white dark:bg-black border border-border/20 dark:border-border/10 shadow-sm p-8 text-foreground">
              <p className="text-muted-foreground">Authentication options will appear here.</p>
            </div>
          )}

          {activeTab === "advanced" && (
            <div className="rounded-xl bg-white dark:bg-black border border-border/20 dark:border-border/10 shadow-sm p-8 text-foreground">
              <p className="text-muted-foreground">Advanced configurations coming soon.</p>
            </div>
          )}
        </section>

        {/* RIGHT SIDE */}
        <aside className="col-span-1">
          <div className="h-full w-full rounded-xl bg-gradient-to-b from-white/80 to-blue-50/40 dark:from-slate-800/70 dark:to-slate-900/60 border border-border/30 dark:border-border/10 shadow-inner flex items-center justify-center text-sm text-gray-500 dark:text-gray-300">
            Right Card
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
        className="peer w-full px-3 pt-6 pb-2 text-[15px] text-foreground dark:text-white bg-transparent border-b-2 border-border focus:outline-none focus:border-transparent transition-all duration-200"
      />
      <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 peer-focus:w-full" />
      <label
        htmlFor={label}
        className="absolute left-3 top-1 text-muted-foreground text-[14px] transition-all duration-200
        peer-placeholder-shown:top-6 peer-placeholder-shown:text-muted-foreground peer-placeholder-shown:text-[15px]
        peer-focus:top-1 peer-focus:text-[13px] peer-focus:text-blue-600"
      >
        {label}
      </label>
    </div>
  );
}
