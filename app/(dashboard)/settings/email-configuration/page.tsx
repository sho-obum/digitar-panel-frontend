"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Save, TestTube, Mail } from "lucide-react";

export default function EmailConfigurationPage() {
  // SMTP Settings
  const [smtpHost, setSmtpHost] = useState("smtp.gmail.com");
  const [smtpPort, setSmtpPort] = useState("587");
  const [smtpUsername, setSmtpUsername] = useState("");
  const [smtpPassword, setSmtpPassword] = useState("");
  const [encryption, setEncryption] = useState("tls");

  // Sender Settings
  const [senderName, setSenderName] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [replyToEmail, setReplyToEmail] = useState("");

  // Email Limits
  const [dailyLimit, setDailyLimit] = useState("1000");
  const [hourlyLimit, setHourlyLimit] = useState("100");

  const handleSaveConfig = () => {
    console.log("Saving email configuration...");
    // TODO: Implement API call to save configuration
  };

  const handleTestConnection = () => {
    console.log("Testing SMTP connection...");
    // TODO: Implement API call to test SMTP connection
  };

  return (
    <div className="flex flex-1 flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          Email Configuration
        </h1>
        <p className="text-muted-foreground mt-1">
          Configure your email server settings and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* SMTP Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                SMTP Server Settings
              </CardTitle>
              <CardDescription>
                Configure your outgoing mail server settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtp-host">SMTP Host</Label>
                  <Input
                    id="smtp-host"
                    placeholder="smtp.gmail.com"
                    value={smtpHost}
                    onChange={(e) => setSmtpHost(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtp-port">SMTP Port</Label>
                  <Input
                    id="smtp-port"
                    placeholder="587"
                    value={smtpPort}
                    onChange={(e) => setSmtpPort(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="encryption">Encryption</Label>
                <Select value={encryption} onValueChange={setEncryption}>
                  <SelectTrigger id="encryption">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tls">TLS</SelectItem>
                    <SelectItem value="ssl">SSL</SelectItem>
                    <SelectItem value="none">None</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="smtp-username">Username / Email</Label>
                <Input
                  id="smtp-username"
                  type="email"
                  placeholder="your-email@gmail.com"
                  value={smtpUsername}
                  onChange={(e) => setSmtpUsername(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="smtp-password">Password / App Password</Label>
                <Input
                  id="smtp-password"
                  type="password"
                  placeholder="••••••••••••••••"
                  value={smtpPassword}
                  onChange={(e) => setSmtpPassword(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  For Gmail, use an{" "}
                  <a
                    href="https://support.google.com/accounts/answer/185833"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    App Password
                  </a>
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleTestConnection}
                  className="flex items-center gap-2"
                >
                  <TestTube className="h-4 w-4" />
                  Test Connection
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Sender Information */}
          <Card>
            <CardHeader>
              <CardTitle>Sender Information</CardTitle>
              <CardDescription>
                Configure how your emails appear to recipients
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sender-name">Sender Name</Label>
                <Input
                  id="sender-name"
                  placeholder="Your Company Name"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sender-email">Sender Email</Label>
                <Input
                  id="sender-email"
                  type="email"
                  placeholder="noreply@yourcompany.com"
                  value={senderEmail}
                  onChange={(e) => setSenderEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reply-to">Reply-To Email</Label>
                <Input
                  id="reply-to"
                  type="email"
                  placeholder="support@yourcompany.com"
                  value={replyToEmail}
                  onChange={(e) => setReplyToEmail(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Limits & Info */}
        <div className="space-y-6">
          {/* Email Limits */}
          <Card>
            <CardHeader>
              <CardTitle>Email Limits</CardTitle>
              <CardDescription>Set sending rate limits</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="daily-limit">Daily Limit</Label>
                <Input
                  id="daily-limit"
                  type="number"
                  placeholder="1000"
                  value={dailyLimit}
                  onChange={(e) => setDailyLimit(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Maximum emails per day
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="hourly-limit">Hourly Limit</Label>
                <Input
                  id="hourly-limit"
                  type="number"
                  placeholder="100"
                  value={hourlyLimit}
                  onChange={(e) => setHourlyLimit(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Maximum emails per hour
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Tips */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span>Use TLS encryption for better security</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span>Test connection before saving changes</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span>Set realistic limits to avoid spam flags</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span>Keep app passwords secure and private</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSaveConfig} className="flex items-center gap-2">
          <Save className="h-4 w-4" />
          Save Configuration
        </Button>
      </div>
    </div>
  );
}
