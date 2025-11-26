"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Mail, Plus, Trash2, Edit, Copy, Check } from "lucide-react";

interface MailConfig {
  id: number;
  config_name: string;
  provider: string;
  smtp_host: string;
  smtp_port: number;
  smtp_user: string;
  from_email: string;
  created_at: string;
  updated_at: string;
}

interface FormData {
  config_name: string;
  provider: string;
  smtp_host: string;
  smtp_port: string;
  smtp_user: string;
  smtp_pass: string;
  from_email: string;
}

const initialFormData: FormData = {
  config_name: "",
  provider: "smtp",
  smtp_host: "",
  smtp_port: "587",
  smtp_user: "",
  smtp_pass: "",
  from_email: "",
};

export default function EmailConfigurationPage() {
  const [configs, setConfigs] = useState<MailConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  // Fetch configs on mount
  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/mail-config/list");
      const data = await res.json();

      if (data.success) {
        setConfigs(data.configs || []);
      } else {
        toast.error(data.msg || "Failed to load configurations");
      }
    } catch (error) {
      toast.error("Error loading configurations");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    // Validation
    if (!formData.config_name.trim()) {
      toast.error("Configuration name is required");
      return;
    }

    if (!formData.from_email.trim()) {
      toast.error("From email is required");
      return;
    }

    if (!formData.smtp_host.trim()) {
      toast.error("SMTP host is required");
      return;
    }

    if (!formData.smtp_port) {
      toast.error("SMTP port is required");
      return;
    }

    try {
      setIsSubmitting(true);

      if (editingId) {
        // Update existing config
        const res = await fetch("/api/mail-config/update", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingId,
            config_name: formData.config_name,
            provider: formData.provider,
            smtp_host: formData.smtp_host,
            smtp_port: parseInt(formData.smtp_port),
            smtp_user: formData.smtp_user,
            smtp_pass: formData.smtp_pass,
            from_email: formData.from_email,
          }),
        });

        const data = await res.json();

        if (data.success) {
          toast.success("Configuration updated successfully");
          setIsDialogOpen(false);
          setFormData(initialFormData);
          setEditingId(null);
          fetchConfigs();
        } else if (data.exists) {
          toast.error("Another config with this name or email already exists");
        } else {
          toast.error(data.msg || "Failed to update configuration");
        }
      } else {
        // Add new config
        const res = await fetch("/api/mail-config/add", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            config_name: formData.config_name,
            provider: formData.provider,
            smtp_host: formData.smtp_host,
            smtp_port: parseInt(formData.smtp_port),
            smtp_user: formData.smtp_user,
            smtp_pass: formData.smtp_pass,
            from_email: formData.from_email,
          }),
        });

        const data = await res.json();

        if (data.success) {
          toast.success("Configuration added successfully");
          setIsDialogOpen(false);
          setFormData(initialFormData);
          fetchConfigs();
        } else if (data.exists) {
          toast.error("A config with this name or email already exists");
        } else {
          toast.error(data.msg || "Failed to add configuration");
        }
      }
    } catch (error) {
      toast.error("Error saving configuration");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (config: MailConfig) => {
    setEditingId(config.id);
    setFormData({
      config_name: config.config_name,
      provider: config.provider,
      smtp_host: config.smtp_host,
      smtp_port: String(config.smtp_port),
      smtp_user: config.smtp_user,
      smtp_pass: "", // Don't show password in edit
      from_email: config.from_email,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this configuration?")) {
      return;
    }

    try {
      const res = await fetch(`/api/mail-config/delete?id=${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Configuration deleted successfully");
        fetchConfigs();
      } else {
        toast.error(data.msg || "Failed to delete configuration");
      }
    } catch (error) {
      toast.error("Error deleting configuration");
      console.error(error);
    }
  };

  const handleOpenDialog = () => {
    setEditingId(null);
    setFormData(initialFormData);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingId(null);
    setFormData(initialFormData);
  };

  const copyToClipboard = (text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-1 flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Email Configuration
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your SMTP email configurations
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={handleOpenDialog}
              className="bg-black hover:bg-black/90 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Configuration
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Edit Configuration" : "Add New Configuration"}
              </DialogTitle>
              <DialogDescription>
                {editingId
                  ? "Update your email configuration details"
                  : "Enter your SMTP server details below"}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="config-name">
                    Configuration Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="config-name"
                    placeholder="e.g., Primary Gmail"
                    value={formData.config_name}
                    onChange={(e) =>
                      handleInputChange("config_name", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="provider">Provider</Label>
                  <Select
                    value={formData.provider}
                    onValueChange={(value) =>
                      handleInputChange("provider", value)
                    }
                  >
                    <SelectTrigger id="provider">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="smtp">SMTP</SelectItem>
                      <SelectItem value="sendgrid">SendGrid</SelectItem>
                      <SelectItem value="mailgun">Mailgun</SelectItem>
                      <SelectItem value="aws-ses">AWS SES</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtp-host">
                    SMTP Host <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="smtp-host"
                    placeholder="e.g., smtp.gmail.com"
                    value={formData.smtp_host}
                    onChange={(e) =>
                      handleInputChange("smtp_host", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtp-port">
                    SMTP Port <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="smtp-port"
                    type="number"
                    placeholder="587"
                    value={formData.smtp_port}
                    onChange={(e) =>
                      handleInputChange("smtp_port", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtp-user">SMTP User</Label>
                  <Input
                    id="smtp-user"
                    type="email"
                    placeholder="your-email@gmail.com"
                    value={formData.smtp_user}
                    onChange={(e) =>
                      handleInputChange("smtp_user", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtp-pass">SMTP Password</Label>
                  <Input
                    id="smtp-pass"
                    type="password"
                    placeholder="••••••••••"
                    value={formData.smtp_pass}
                    onChange={(e) =>
                      handleInputChange("smtp_pass", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="from-email">
                  From Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="from-email"
                  type="email"
                  placeholder="noreply@yourcompany.com"
                  value={formData.from_email}
                  onChange={(e) =>
                    handleInputChange("from_email", e.target.value)
                  }
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={handleCloseDialog}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isSubmitting}
                  className="bg-black hover:bg-black/90 text-white"
                >
                  {isSubmitting && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  {editingId ? "Update" : "Add"} Configuration
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Main Content Grid - 70/30 Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
        {/* Left Column - 70% - Configurations Table */}
        <div className="lg:col-span-7">
          <Card className="border border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Your Configurations</CardTitle>
              <CardDescription>
                {configs.length} configuration{configs.length !== 1 ? "s" : ""}{" "}
                configured
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : configs.length === 0 ? (
                <div className="text-center py-12">
                  <Mail className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground">
                    No configurations yet. Add one to get started.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b border-border/50 hover:bg-transparent">
                        <TableHead>Configuration Name</TableHead>
                        <TableHead>Provider</TableHead>
                        <TableHead>SMTP Host</TableHead>
                        <TableHead>From Email</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {configs.map((config) => (
                        <TableRow
                          key={config.id}
                          className="border-b border-border/30 hover:bg-accent/30 transition-colors"
                        >
                          <TableCell className="font-medium">
                            {config.config_name}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {config.provider}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">
                                {config.smtp_host}
                              </span>
                              <button
                                onClick={() =>
                                  copyToClipboard(config.smtp_host, config.id)
                                }
                                className="text-muted-foreground hover:text-foreground transition-colors"
                              >
                                {copiedId === config.id ? (
                                  <Check className="h-3 w-3 text-green-600" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                              </button>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">
                                {config.from_email}
                              </span>
                              <button
                                onClick={() =>
                                  copyToClipboard(config.from_email, config.id)
                                }
                                className="text-muted-foreground hover:text-foreground transition-colors"
                              >
                                {copiedId === config.id ? (
                                  <Check className="h-3 w-3 text-green-600" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                              </button>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(config.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(config)}
                                className="text-foreground hover:bg-accent"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(config.id)}
                                className="text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - 30% - Info Card */}
        <div className="lg:col-span-3">
          <Card className="bg-linear-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/30 dark:to-slate-800/30 border-border/40 sticky top-20">
            <CardHeader>
              <CardTitle className="text-base">Quick Setup Guide</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-xs text-muted-foreground">
                <li className="flex gap-2">
                  <span className="font-semibold text-foreground shrink-0">1.</span>
                  <span>
                    For{" "}
                    <span className="font-medium text-foreground">Gmail</span>, use
                    an{" "}
                    <a
                      href="https://support.google.com/accounts/answer/185833"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-foreground hover:underline font-medium"
                    >
                      App Password
                    </a>
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-foreground shrink-0">2.</span>
                  <span>
                    Use port <span className="font-medium">587</span> for TLS or{" "}
                    <span className="font-medium">465</span> for SSL
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-foreground shrink-0">3.</span>
                  <span>
                    Ensure the from email matches your verified sender email
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
