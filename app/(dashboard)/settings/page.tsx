"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function SmtpSettingPage() {
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
    <div className="space-y-10">
      {/* Header */}
      <div className="flex items-center justify-between py-2 px-1 border-b border-border/40 bg-gradient-to-r from-white via-blue-50/40 to-purple-50/40 rounded-md shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-800">
          SMTP Settings
        </h1>
        <div className="flex items-center text-sm text-gray-500">
          <span>Email</span>
          <div className="h-4 w-[1px] bg-gradient-to-b from-sky-400/50 via-purple-400/50 to-pink-400/50 mx-3" />
          <span>Item 1</span>
          <div className="h-4 w-[1px] bg-gradient-to-b from-sky-400/50 via-purple-400/50 to-pink-400/50 mx-3" />
          <span>Item 2</span>
          <div className="h-4 w-[1px] bg-gradient-to-b from-sky-400/50 via-purple-400/50 to-pink-400/50 mx-3" />
          <span>Item 3</span>
          <div className="h-4 w-[1px] bg-gradient-to-b from-sky-400/50 via-purple-400/50 to-pink-400/50 mx-3" />
          <span>Item 4</span>
        </div>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-4 gap-10">
        {/* Left Side */}
        <div className="col-span-3 space-y-10">
          {/* Card */}
          <div className="rounded-xl bg-white shadow-[0_1px_4px_rgba(0,0,0,0.08)] border border-border/20 p-8 space-y-10">
            <div>
              <h2 className="text-lg font-medium text-gray-800">
                SMTP Configuration
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Fill in the SMTP credentials to connect your mail server.
              </p>
            </div>

            {/* Inputs */}
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
                value={formData.password}
                onChange={(v) => handleChange("password", v)}
                type="password"
              />
              <MaterialInput
                label="SMTP Port"
                value={formData.port}
                onChange={(v) => handleChange("port", v)}
              />
            </div>

            {/* Radio Buttons */}
            <div>
              <Label className="text-sm text-gray-600">
                Connection Security
              </Label>
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

            {/* Buttons */}
            <div className="flex justify-end gap-3">
              <Button variant="outline" className="text-gray-600 border-gray-300">
                Debug
              </Button>
              <Button className="bg-blue-500 hover:bg-blue-600 text-white shadow-sm">
                Submit
              </Button>
            </div>
          </div>

          {/* Separator */}
          <Separator className="opacity-70" />

          {/* Test Email */}
          <div className="rounded-xl bg-white shadow-[0_1px_4px_rgba(0,0,0,0.08)] border border-border/20 p-8 space-y-6">
            <h2 className="text-lg font-medium text-gray-800">
              Test Email Delivery
            </h2>
            <div className="flex gap-3">
              <MaterialInput
                label="Enter test email"
                value={formData.testEmail}
                onChange={(v) => handleChange("testEmail", v)}
              />
              <Button className="bg-blue-500 hover:bg-blue-600 text-white shadow-sm">
                Send Test
              </Button>
            </div>
          </div>
        </div>

        {/* Right Side */}
        <div className="col-span-1">
          <div className="h-full w-full rounded-xl bg-gradient-to-b from-white to-gray-50 border border-border/30 shadow-inner flex items-center justify-center text-sm text-gray-500">
            Right Panel (coming soon)
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------- */
/* Google-like Material Input                           */
/* ---------------------------------------------------- */
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
        className="peer w-full px-3 pt-5 pb-2 text-[15px] text-gray-900 bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none transition-all duration-200 ease-[cubic-bezier(0.25,0.8,0.25,1)]"
      />
      <label
        htmlFor={label}
        className="absolute left-3 top-2 text-gray-500 text-[14px] transition-all duration-200 ease-[cubic-bezier(0.25,0.8,0.25,1)] 
        peer-placeholder-shown:top-5 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-[15px]
        peer-focus:top-2 peer-focus:text-[13px] peer-focus:text-blue-600"
      >
        {label}
      </label>
    </div>
  );
}
