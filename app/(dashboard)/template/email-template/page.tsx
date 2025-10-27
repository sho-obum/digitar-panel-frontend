"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { RiGeminiLine } from "react-icons/ri";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MinimalTiptap } from "@/components/ui/shadcn-io/minimal-tiptap";
import {
  Eye,
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Plus,
  Save,
  Trash2,
  Copy,
  FlaskConical,
  Star,
} from "lucide-react";
import { format } from "date-fns";
import { ClickSpark } from "@/components/click-spark";
import { ShineBorder } from "@/components/ui/shine-border";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmailTemplatePlaceholderBox } from "@/components/email-template-placeholder-box";

type EmailTemplate = {
  id: string;
  templateName: string;
  subject: string;
  templateFor: "Initial" | "Follow up";
  addedAt: Date;
  status: "active" | "inactive";
  isDefault: boolean;
  htmlBody: string;
};

type SortConfig = {
  key: keyof EmailTemplate | null;
  direction: "asc" | "desc";
};

// Mock data generator
const generateMockTemplates = (): EmailTemplate[] => {
  return [
    {
      id: "1",
      templateName: "Welcome Email",
      subject: "Welcome to Our Platform!",
      templateFor: "Initial",
      addedAt: new Date(2025, 9, 20),
      status: "active",
      isDefault: true,
      htmlBody: "<h1>Welcome!</h1><p>We're excited to have you on board.</p>",
    },
    {
      id: "2",
      templateName: "Password Reset",
      subject: "Reset Your Password",
      templateFor: "Initial",
      addedAt: new Date(2025, 9, 18),
      status: "active",
      isDefault: false,
      htmlBody:
        "<h1>Password Reset</h1><p>Click the link below to reset your password.</p>",
    },
    {
      id: "3",
      templateName: "Newsletter Q4",
      subject: "Your Monthly Newsletter - October 2025",
      templateFor: "Follow up",
      addedAt: new Date(2025, 9, 15),
      status: "inactive",
      isDefault: false,
      htmlBody: "<h1>Newsletter</h1><p>Here's what's new this month...</p>",
    },
    {
      id: "4",
      templateName: "Order Confirmation",
      subject: "Your Order #{{order_id}} Has Been Confirmed",
      templateFor: "Initial",
      addedAt: new Date(2025, 9, 12),
      status: "active",
      isDefault: false,
      htmlBody: "<h1>Order Confirmed</h1><p>Thank you for your order!</p>",
    },
    {
      id: "5",
      templateName: "Account Verification",
      subject: "Verify Your Email Address",
      templateFor: "Follow up",
      addedAt: new Date(2025, 9, 10),
      status: "active",
      isDefault: false,
      htmlBody:
        "<h1>Verify Your Account</h1><p>Please verify your email address to continue.</p>",
    },
  ];
};

const getStatusColor = (status: string) => {
  return status === "active"
    ? "bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/20 cursor-pointer "
    : "bg-gray-500/10 text-gray-600 dark:text-gray-400 hover:bg-gray-500/20 cursor-pointer";
};

export default function EmailTemplatePage() {
  // Mock data
  const [templates, setTemplates] = useState<EmailTemplate[]>(
    generateMockTemplates()
  );

  // Sorting state
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: null,
    direction: "asc",
  });

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [isReplicaDialogOpen, setIsReplicaDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] =
    useState<EmailTemplate | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    templateName: "",
    subject: "",
    templateFor: "Initial" as "Initial" | "Follow up",
    campaignCategory: "Finance" as string,
    htmlBody: "",
  });

  // Categories state
  const [categories, setCategories] = useState<string[]>([
    "Finance",
    "Tech",
    "Marketing",
    "Sales",
    "Support",
  ]);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategory, setNewCategory] = useState("");

  // Function to add new category
  const handleAddCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      setCategories([...categories, newCategory.trim()]);
      setFormData({ ...formData, campaignCategory: newCategory.trim() });
      setNewCategory("");
      setShowAddCategory(false);
    }
  };

  // Handle sorting
  const handleSort = (key: keyof EmailTemplate) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Get sort icon
  const getSortIcon = (key: keyof EmailTemplate) => {
    if (sortConfig.key !== key) {
      return <ArrowUpDown className="ml-2 h-4 w-4 text-muted-foreground" />;
    }
    return sortConfig.direction === "asc" ? (
      <ArrowUp className="ml-2 h-4 w-4" />
    ) : (
      <ArrowDown className="ml-2 h-4 w-4" />
    );
  };

  // Apply sorting
  const sortedTemplates = useMemo(() => {
    if (!sortConfig.key) return templates;

    const sorted = [...templates].sort((a, b) => {
      const aValue = a[sortConfig.key!];
      const bValue = b[sortConfig.key!];

      if (aValue instanceof Date && bValue instanceof Date) {
        return sortConfig.direction === "asc"
          ? aValue.getTime() - bValue.getTime()
          : bValue.getTime() - aValue.getTime();
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortConfig.direction === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return 0;
    });

    return sorted;
  }, [templates, sortConfig]);

  // Handle create new template
  const handleCreateNew = () => {
    setFormData({
      templateName: "",
      subject: "",
      templateFor: "Initial",
      campaignCategory: "Finance",
      htmlBody: "",
    });
    setIsCreateDialogOpen(true);
  };

  // Handle save template
  const handleSave = () => {
    const newTemplate: EmailTemplate = {
      id: String(templates.length + 1),
      templateName: formData.templateName,
      subject: formData.subject,
      templateFor: formData.templateFor,
      addedAt: new Date(),
      status: "active",
      isDefault: false,
      htmlBody: formData.htmlBody,
    };
    setTemplates([...templates, newTemplate]);
    setIsCreateDialogOpen(false);
  };

  // Handle status toggle
  const handleStatusClick = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setIsStatusDialogOpen(true);
  };

  const confirmStatusToggle = () => {
    if (selectedTemplate) {
      setTemplates(
        templates.map((t) =>
          t.id === selectedTemplate.id
            ? { ...t, status: t.status === "active" ? "inactive" : "active" }
            : t
        )
      );
    }
    setIsStatusDialogOpen(false);
    setSelectedTemplate(null);
  };

  // Handle view template
  const handleView = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setIsViewDialogOpen(true);
  };

  // Handle replica template
  const handleReplica = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setFormData({
      templateName: template.templateName + " (Copy)",
      subject: template.subject,
      templateFor: template.templateFor,
      campaignCategory: "Finance",
      htmlBody: template.htmlBody,
    });
    setIsReplicaDialogOpen(true);
  };

  // Handle set as default
  const handleSetAsDefault = (templateId: string) => {
    setTemplates(
      templates.map((t) => ({
        ...t,
        isDefault: t.id === templateId,
      }))
    );
  };

  return (
    <div className="flex flex-1 flex-col gap-6">
      {/* Header Row */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-foreground">
          Email Template
        </h1>
        <Button
          onClick={handleCreateNew}
          className="bg-black text-white hover:bg-gray-800 shadow-sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create New
        </Button>
      </div>

      {/* Table Section */}
      <div className="rounded-xl bg-white dark:bg-black backdrop-blur-sm border border-border/20 dark:border-border/10 shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px] text-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 p-0 hover:bg-transparent w-full justify-center"
                    onClick={() => handleSort("id")}
                  >
                    #{getSortIcon("id")}
                  </Button>
                </TableHead>
                <TableHead className="text-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 p-0 hover:bg-transparent w-full justify-center"
                    onClick={() => handleSort("templateName")}
                  >
                    Template Name
                    {getSortIcon("templateName")}
                  </Button>
                </TableHead>
                <TableHead className="text-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 p-0 hover:bg-transparent w-full justify-center"
                    onClick={() => handleSort("subject")}
                  >
                    Subject
                    {getSortIcon("subject")}
                  </Button>
                </TableHead>
                <TableHead className="text-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 p-0 hover:bg-transparent w-full justify-center"
                    onClick={() => handleSort("templateFor")}
                  >
                    Template for
                    {getSortIcon("templateFor")}
                  </Button>
                </TableHead>
                <TableHead className="text-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 p-0 hover:bg-transparent w-full justify-center"
                    onClick={() => handleSort("addedAt")}
                  >
                    Added at
                    {getSortIcon("addedAt")}
                  </Button>
                </TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center w-[200px]">Action</TableHead>
                <TableHead className="text-center w-[80px]">Delete</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedTemplates.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No templates found. Create your first email template!
                  </TableCell>
                </TableRow>
              ) : (
                sortedTemplates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell className="font-medium text-center">
                      {template.id}
                    </TableCell>
                    <TableCell className="text-center">
                      {template.templateName}
                    </TableCell>
                    <TableCell className="text-center">
                      {template.subject}
                    </TableCell>
                    <TableCell className="text-center">
                      {template.templateFor}
                    </TableCell>
                    <TableCell className="text-center">
                      {format(template.addedAt, "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        className={getStatusColor(template.status)}
                        onClick={() => handleStatusClick(template)}
                      >
                        {template.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {/* 2x2 Grid Layout */}
                      <div className="grid grid-cols-2 gap-2 w-fit mx-auto">
                        {/* Row 1 */}
                        <ClickSpark
                          sparkColor="#3b82f6"
                          sparkSize={8}
                          sparkRadius={20}
                          sparkCount={6}
                          duration={400}
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleView(template)}
                            className="btn-shimmer relative overflow-hidden flex items-center gap-1.5 h-9 px-4 bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/30 text-blue-700 dark:text-blue-400 hover:border-blue-500/50 transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/20 active:scale-95"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span className="text-xs font-medium">View</span>
                            <span className="shimmer-effect absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full" />
                          </Button>
                        </ClickSpark>
                        <ClickSpark
                          sparkColor="#8b5cf6"
                          sparkSize={8}
                          sparkRadius={20}
                          sparkCount={6}
                          duration={400}
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReplica(template)}
                            className="btn-shimmer relative overflow-hidden flex items-center gap-1.5 h-9 px-4 bg-purple-500/10 hover:bg-purple-500/20 border-purple-500/30 text-purple-700 dark:text-purple-400 hover:border-purple-500/50 transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/20 active:scale-95"
                          >
                            <Copy className="h-3.5 w-3.5" />
                            <span className="text-xs font-medium">
                              Duplicate
                            </span>
                            <span className="shimmer-effect absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full" />
                          </Button>
                        </ClickSpark>

                        {/* Row 2 */}
                        <ClickSpark
                          sparkColor="#10b981"
                          sparkSize={8}
                          sparkRadius={20}
                          sparkCount={6}
                          duration={400}
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            className="btn-shimmer relative overflow-hidden flex items-center gap-1.5 h-9 px-4 bg-green-500/10 hover:bg-green-500/20 border-green-500/30 text-green-700 dark:text-green-400 hover:border-green-500/50 transition-all duration-200 hover:shadow-lg hover:shadow-green-500/20 active:scale-95"
                          >
                            <FlaskConical className="h-3.5 w-3.5" />
                            <span className="text-xs font-medium">Test</span>
                            <span className="shimmer-effect absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full" />
                          </Button>
                        </ClickSpark>
                        {template.isDefault ? (
                          <ClickSpark
                            sparkColor="#f59e0b"
                            sparkSize={8}
                            sparkRadius={20}
                            sparkCount={6}
                            duration={400}
                          >
                            <Button
                              variant="outline"
                              size="sm"
                              className="btn-shimmer relative overflow-hidden flex items-center gap-1.5 h-9 px-4 transition-all duration-200 active:scale-95 bg-amber-500/20 hover:bg-amber-500/30 border-amber-500/50 text-amber-700 dark:text-amber-400 hover:shadow-lg hover:shadow-amber-500/20"
                              onClick={() => handleSetAsDefault(template.id)}
                            >
                              <Star className="h-3.5 w-3.5 fill-current transition-all duration-300 ease-in-out" />
                              <span className="text-xs font-medium">
                                Default
                              </span>
                              <span className="shimmer-effect absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full" />
                            </Button>
                          </ClickSpark>
                        ) : (
                          <ClickSpark
                            sparkColor="#f59e0b"
                            sparkSize={8}
                            sparkRadius={20}
                            sparkCount={6}
                            duration={400}
                          >
                            <Button
                              variant="outline"
                              size="sm"
                              className="btn-shimmer relative overflow-hidden flex items-center gap-1.5 h-9 px-4 transition-all duration-200 active:scale-95 bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30 text-amber-700 dark:text-amber-400 hover:border-amber-500/50 hover:shadow-lg hover:shadow-amber-500/20"
                              onClick={() => handleSetAsDefault(template.id)}
                            >
                              <span className="text-xs font-medium">
                                Set Default
                              </span>
                              <span className="shimmer-effect absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full" />
                            </Button>
                          </ClickSpark>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                        onClick={() => {
                          setTemplates(
                            templates.filter((t) => t.id !== template.id)
                          );
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Create/Edit Dialog */}
     
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        {/* Use stock centering from shadcn; only widen it */}
        <DialogContent className="sm:max-w-6xl ">
          <DialogHeader className="mb-2">
            <DialogTitle>Create New Template</DialogTitle>
            <DialogDescription>
              Fill in the template details below
            </DialogDescription>
          </DialogHeader>

          {/* Optional: gradient, WITHOUT absolute positioning */}
          <div className="rounded-lg">
            <div className="rounded-lg p-[1px] bg-gradient-to-br from-blue-500/15 via-purple-500/15 to-transparent">
              {/* Real surface so gradient is visible but content stays normal */}
              <div className="rounded-lg bg-background p-6">
                {/* 75/25 Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 py-2">
                  {/* Left Column */}
                  <div className="lg:col-span-3 space-y-4">
                    {/* Row 1 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="templateName"
                          className="text-sm font-medium"
                        >
                          Template Name
                        </Label>
                        <input
                          id="templateName"
                          type="text"
                          value={formData.templateName}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              templateName: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                          placeholder="Enter template name"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="templateFor"
                          className="text-sm font-medium"
                        >
                          Template For
                        </Label>
                        <Select
                          value={formData.templateFor}
                          onValueChange={(value) =>
                            setFormData({
                              ...formData,
                              templateFor: value as "Initial" | "Follow up",
                            })
                          }
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          {/* Ensure dropdown appears above dialog */}
                          <SelectContent className="z-[9999]">
                            <SelectItem value="Initial">Initial</SelectItem>
                            <SelectItem value="Follow up">Follow up</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Row 2: Campaign Category */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label
                          htmlFor="campaignCategory"
                          className="text-sm font-medium"
                        >
                          Campaign Category
                        </Label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-muted-foreground hover:text-foreground"
                          onClick={() => setShowAddCategory(!showAddCategory)}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add More
                        </Button>
                      </div>

                      <Select
                        value={formData.campaignCategory}
                        onValueChange={(value) =>
                          setFormData({ ...formData, campaignCategory: value })
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent className="z-[9999]">
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {/* Inline Add Category Input */}
                      {showAddCategory && (
                        <div className="flex gap-2 animate-in slide-in-from-top-2 duration-200">
                          <input
                            type="text"
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleAddCategory();
                              }
                            }}
                            className="flex-1 px-3 py-2 text-sm border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                            placeholder="Enter new category name"
                            autoFocus
                          />
                          <Button
                            type="button"
                            size="sm"
                            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600"
                            onClick={handleAddCategory}
                          >
                            OK
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setShowAddCategory(false);
                              setNewCategory("");
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Subject */}
                    <div className="space-y-2">
                      <Label htmlFor="subject" className="text-sm font-medium">
                        Subject
                      </Label>
                      <input
                        id="subject"
                        type="text"
                        value={formData.subject}
                        onChange={(e) =>
                          setFormData({ ...formData, subject: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        placeholder="Enter email subject"
                      />
                    </div>

                    {/* Editor */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        Template HTML Body
                      </Label>
                      <MinimalTiptap
                        content={formData.htmlBody}
                        onChange={(content: string) =>
                          setFormData({ ...formData, htmlBody: content })
                        }
                        placeholder="Start typing your email template..."
                        className="min-h-[300px]"
                      />
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="lg:col-span-1">
                    <EmailTemplatePlaceholderBox />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-between items-center pt-2 border-t mt-2">
                  <Button
                    variant="outline"
                    className="text-foreground border-border"
                  >
                    <RiGeminiLine className="w-4 h-4 mr-2" />
                    Rewrite with AI
                  </Button>
                  <div className="flex gap-3">
                    <Button
                      variant="ghost"
                      onClick={() => setIsCreateDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSave}
                      className="bg-black text-white hover:bg-gray-800 shadow-sm"
                      disabled={!formData.templateName || !formData.subject}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Replica Dialog */}
      <Dialog open={isReplicaDialogOpen} onOpenChange={setIsReplicaDialogOpen}>
        {/* Use stock centering from shadcn; only widen it */}
        <DialogContent className="sm:max-w-6xl ">
          <DialogHeader className="mb-2">
            <DialogTitle>Create Replica</DialogTitle>
            <DialogDescription>
              This will create a copy of the existing template
            </DialogDescription>
          </DialogHeader>

          {/* Optional: gradient, WITHOUT absolute positioning */}
          <div className="rounded-lg">
            <div className="rounded-lg p-[1px] bg-gradient-to-br from-purple-500/15 via-blue-500/15 to-transparent">
              {/* Real surface so gradient is visible but content stays normal */}
              <div className="rounded-lg bg-background p-6">
                {/* 75/25 Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 py-2">
                  {/* Left Column */}
                  <div className="lg:col-span-3 space-y-4">
                    {/* Row 1 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="replicaTemplateName"
                          className="text-sm font-medium"
                        >
                          Template Name
                        </Label>
                        <input
                          id="replicaTemplateName"
                          type="text"
                          value={formData.templateName}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              templateName: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                          placeholder="Enter template name"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="replicaTemplateFor"
                          className="text-sm font-medium"
                        >
                          Template For
                        </Label>
                        <Select
                          value={formData.templateFor}
                          onValueChange={(value) =>
                            setFormData({
                              ...formData,
                              templateFor: value as "Initial" | "Follow up",
                            })
                          }
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          {/* Ensure dropdown appears above dialog */}
                          <SelectContent className="z-[9999]">
                            <SelectItem value="Initial">Initial</SelectItem>
                            <SelectItem value="Follow up">Follow up</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Row 2: Campaign Category */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label
                          htmlFor="replicaCampaignCategory"
                          className="text-sm font-medium"
                        >
                          Campaign Category
                        </Label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-muted-foreground hover:text-foreground"
                          onClick={() => setShowAddCategory(!showAddCategory)}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add More
                        </Button>
                      </div>

                      <Select
                        value={formData.campaignCategory}
                        onValueChange={(value) =>
                          setFormData({ ...formData, campaignCategory: value })
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent className="z-[9999]">
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {/* Inline Add Category Input */}
                      {showAddCategory && (
                        <div className="flex gap-2 animate-in slide-in-from-top-2 duration-200">
                          <input
                            type="text"
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleAddCategory();
                              }
                            }}
                            className="flex-1 px-3 py-2 text-sm border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                            placeholder="Enter new category name"
                            autoFocus
                          />
                          <Button
                            type="button"
                            size="sm"
                            className="bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600"
                            onClick={handleAddCategory}
                          >
                            OK
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setShowAddCategory(false);
                              setNewCategory("");
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Subject */}
                    <div className="space-y-2">
                      <Label htmlFor="replicaSubject" className="text-sm font-medium">
                        Subject
                      </Label>
                      <input
                        id="replicaSubject"
                        type="text"
                        value={formData.subject}
                        onChange={(e) =>
                          setFormData({ ...formData, subject: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        placeholder="Enter email subject"
                      />
                    </div>

                    {/* Editor */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        Template HTML Body
                      </Label>
                      <MinimalTiptap
                        content={formData.htmlBody}
                        onChange={(content: string) =>
                          setFormData({ ...formData, htmlBody: content })
                        }
                        placeholder="Start typing your email template..."
                        className="min-h-[300px]"
                      />
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="lg:col-span-1">
                    <EmailTemplatePlaceholderBox />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-between items-center pt-2 border-t mt-2">
                  <Button
                    variant="outline"
                    className="text-foreground border-border"
                  >
                    <RiGeminiLine className="w-4 h-4 mr-2" />
                    Rewrite with AI
                  </Button>
                  <div className="flex gap-3">
                    <Button
                      variant="ghost"
                      onClick={() => setIsReplicaDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => {
                        handleSave();
                        setIsReplicaDialogOpen(false);
                      }}
                      className="bg-black text-white hover:bg-gray-800 shadow-sm"
                      disabled={!formData.templateName || !formData.subject}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Email Preview</DialogTitle>
            <DialogDescription>
              This is how the email will look when sent
            </DialogDescription>
          </DialogHeader>

          {selectedTemplate && (
            <div className="space-y-4 py-4">
              {/* Email Metadata */}
              <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subject:</span>
                  <span className="font-medium">
                    {selectedTemplate.subject}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Template:</span>
                  <span className="font-medium">
                    {selectedTemplate.templateName}
                  </span>
                </div>
              </div>

              {/* Email Body Preview */}
              <div className="border rounded-lg p-6 bg-white dark:bg-slate-900">
                <div
                  className="prose prose-sm max-w-none dark:prose-invert"
                  dangerouslySetInnerHTML={{
                    __html: selectedTemplate.htmlBody,
                  }}
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Status Confirmation Dialog */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Status Change</DialogTitle>
            <DialogDescription>
              Are you sure you want to{" "}
              {selectedTemplate?.status === "active"
                ? "deactivate"
                : "activate"}{" "}
              the template "{selectedTemplate?.templateName}"?
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="ghost"
              onClick={() => setIsStatusDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmStatusToggle}
              className="bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-sm"
            >
              Confirm
            </Button>
          </div>
        </DialogContent>
      </Dialog>
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
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div className="relative">
      <input
        id={label}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || " "}
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
