"use client";

import { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
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
import { EmailComposer } from "@/components/email-composer";
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
import { Skeleton } from "@/components/ui/skeleton";

type EmailTemplate = {
  id: string;
  templateName: string;
  subject: string;
  templateFor: "Initial" | "Follow up";
  addedAt: Date;
  status: "active" | "inactive";
  isDefault: boolean;
  htmlBody: string;
  category: string;
};

type SortConfig = {
  key: keyof EmailTemplate | null;
  direction: "asc" | "desc";
};

type Category = {
  client_cat: number;
  cat_name: string;
  description: string;
  is_active: string;
  default_cat: number;
  updated_at: string;
  created_at: string;
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
      category: "Marketing",
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
      category: "Security",
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
      category: "Marketing",
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
      category: "Tech",
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
      category: "Security",
    },
  ];
};

const getStatusColor = (status: string) => {
  return status === "active"
    ? "bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/20 cursor-pointer "
    : "bg-gray-500/10 text-gray-600 dark:text-gray-400 hover:bg-gray-500/20 cursor-pointer";
};

export default function EmailTemplatePage() {
  // State for templates - start empty, will fetch from DB
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(true);
  const [templatesError, setTemplatesError] = useState<string | null>(null);

  // Sorting state
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: null,
    direction: "asc",
  });

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] =
    useState<EmailTemplate | null>(null);
  const [editMode, setEditMode] = useState<"edit" | "duplicate">("duplicate");

  // Form state
  const [formData, setFormData] = useState({
    templateName: "",
    subject: "",
    templateFor: "Initial" as "Initial" | "Follow up",
    campaignCategory: "" as string,
    htmlBody: "",
  });

  // Categories state
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  // Save loading state
  const [isSaving, setIsSaving] = useState(false);

  // Loading states for individual actions
  const [isDeleting, setIsDeleting] = useState<string | null>(null); 
  const [isTogglingStatus, setIsTogglingStatus] = useState<string | null>(null); 

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        setCategoriesError(null);
        const response = await fetch(
          "/api/templates/email/categories/0"
        );
        if (!response.ok) {
          throw new Error("Failed to fetch categories");
        }
        const data = await response.json();
        
        // Filter only active categories
        const activeCategories = data.data.filter(
          (cat: Category) => cat.is_active === "active"
        );
        setCategories(activeCategories);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setCategoriesError("Failed to load categories");
        setCategories([]);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Fetch templates from database on component mount
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setTemplatesLoading(true);
        setTemplatesError(null);

        const response = await fetch("/api/templates/email/create-email");
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || "Failed to load templates");
        }

        const formatted = data.templates.map((t: any) => ({
          id: String(t.id),
          templateName: t.templateName,
          subject: t.subject,
          templateFor:
            t.templateFor === "initial"
              ? "Initial"
              : t.templateFor === "followup"
                ? "Follow up"
                : "Other",
          htmlBody: t.htmlBody,
          category: t.category,
          isDefault: t.isDefault === 1,
          status: t.status,
          addedAt: new Date(t.addedAt),
        }));

        setTemplates(formatted);
      } catch (error: any) {
        console.error("Error loading templates:", error);
        setTemplatesError(error.message);
        setTemplates([]);
      } finally {
        setTemplatesLoading(false);
      }
    };

    fetchTemplates();
  }, []);



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
      campaignCategory: "",
      htmlBody: "",
    });
    setIsCreateDialogOpen(true);
  };

  // Handle save template
  const handleSave = async () => {
    try {
      setIsSaving(true);

      // Find category name by client_cat id
      const selectedCategory = categories.find(
        (cat) => String(cat.client_cat) === String(formData.campaignCategory)
      );

      // Convert "Initial" to "initial" and "Follow up" to "followup" for API
      const templateForValue =
        formData.templateFor === "Initial"
          ? "initial"
          : formData.templateFor === "Follow up"
            ? "followup"
            : "other";

      // Prepare API payload
      const payload = {
        templateName: formData.templateName,
        subject: formData.subject,
        templateFor: templateForValue,
        campaignCategory: formData.campaignCategory,
        htmlBody: formData.htmlBody,
      };

      console.log(" Sending payload to API:", payload);

      // Call API to save template
      const response = await fetch(
        "/api/templates/email/create-email",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API Error:", errorData);
        toast.error(errorData.error || "Failed to create template");
        return;
      }

      const result = await response.json();
      console.log(" API Response:", result);

      // Add template to local state
      const newTemplate: EmailTemplate = {
        id: String(result.template.id),
        templateName: formData.templateName,
        subject: formData.subject,
        templateFor: formData.templateFor,
        addedAt: new Date(),
        status: "active",
        isDefault: false,
        htmlBody: formData.htmlBody,
        category: selectedCategory?.cat_name || formData.campaignCategory,
      };

      setTemplates([...templates, newTemplate]);
      setIsCreateDialogOpen(false);

      // Show success message
      toast.success(`Template "${formData.templateName}" created successfully!`);
    } catch (error) {
      console.error(" Error creating template:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create template"
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Handle status toggle
  const handleStatusClick = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setIsStatusDialogOpen(true);
  };

  const confirmStatusToggle = async () => {
    if (selectedTemplate) {
      setIsTogglingStatus(selectedTemplate.id);
      try {
        // Determine new status
        const newStatus = selectedTemplate.status === "active" ? "inactive" : "active";
        
        console.log(" Updating template status:", selectedTemplate.id, "to", newStatus);

        // Call API to update status
        const response = await fetch(
          "/api/templates/email/update",
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              template_id: Number(selectedTemplate.id),
              status: newStatus,
            }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          console.error(" API Error:", errorData);
          toast.error(errorData.error || "Failed to update status");
          return;
        }

        const result = await response.json();
        console.log(" API Response:", result);

        // Update frontend state
        setTemplates(
          templates.map((t) =>
            t.id === selectedTemplate.id
              ? { ...t, status: newStatus as "active" | "inactive" }
              : t
          )
        );

        toast.success(`Template ${newStatus} successfully!`);
      } catch (error) {
        console.error(" Error updating status:", error);
        toast.error(
          error instanceof Error ? error.message : "Failed to update status"
        );
      } finally {
        setIsTogglingStatus(null);
      }
    }
    setIsStatusDialogOpen(false);
    setSelectedTemplate(null);
  };

  // Handle delete template confirmation
  const confirmDelete = async () => {
    if (selectedTemplate) {
      setIsDeleting(selectedTemplate.id);
      try {
        console.log(" Deleting template ID:", selectedTemplate.id);
        
        // Call DELETE API
        const response = await fetch(
          "/api/templates/email/update",
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              template_id: Number(selectedTemplate.id),
            }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          console.error("API Error:", errorData);
          toast.error(errorData.error || "Failed to delete template");
          return;
        }

        const result = await response.json();
        console.log(" API Response:", result);

        // Remove from frontend state
        setTemplates(
          templates.filter((t) => t.id !== selectedTemplate.id)
        );
        toast.success(`Template "${selectedTemplate.templateName}" deleted successfully!`);
      } catch (error) {
        console.error(" Error deleting template:", error);
        toast.error(
          error instanceof Error ? error.message : "Failed to delete template"
        );
      } finally {
        setIsDeleting(null);
        setIsDeleteConfirmOpen(false);
        setSelectedTemplate(null);
      }
    }
  };

  // Handle edit template
  const handleEdit = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    // Find the category ID by name
    const categoryId = categories.find(
      (cat) => cat.cat_name === template.category
    )?.client_cat;
    
    setFormData({
      templateName: template.templateName,
      subject: template.subject,
      templateFor: template.templateFor,
      campaignCategory: categoryId ? String(categoryId) : "",
      htmlBody: template.htmlBody,
    });
    setEditMode("edit");
    setIsEditDialogOpen(true);
  };

  // Handle duplicate template
  const handleDuplicate = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    // Find the category ID by name
    const categoryId = categories.find(
      (cat) => cat.cat_name === template.category
    )?.client_cat;
    
    setFormData({
      templateName: template.templateName + " (Copy)",
      subject: template.subject,
      templateFor: template.templateFor,
      campaignCategory: categoryId ? String(categoryId) : "",
      htmlBody: template.htmlBody,
    });
    setEditMode("duplicate");
    setIsEditDialogOpen(true);
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
    <div className="flex flex-1 flex-col gap-6  ">
      {/* Header Row */}
      <div className="flex justify-between items-center ">
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
                <TableHead className="w-12 text-center">
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
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 p-0 hover:bg-transparent w-full justify-center"
                    onClick={() => handleSort("category")}
                  >
                    Category
                    {getSortIcon("category")}
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
                <TableHead className="text-center w-[250px]">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedTemplates.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No templates found. Create your first email template!
                  </TableCell>
                </TableRow>
              ) : (
                sortedTemplates.map((template, index) => (
                  <TableRow key={template.id}>
                    <TableCell className="font-medium text-center">
                      {index + 1}
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
                      {template.category}
                    </TableCell>
                    <TableCell className="text-center">
                      {format(template.addedAt, "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        className={`${getStatusColor(template.status)} ${
                          isTogglingStatus === template.id ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                        }`}
                        onClick={() => {
                          if (isTogglingStatus !== template.id) {
                            handleStatusClick(template);
                          }
                        }}
                      >
                        {isTogglingStatus === template.id ? (
                          <span className="inline-flex items-center gap-1">
                            <span className="inline-block animate-spin h-3 w-3 border-2 border-current border-t-transparent rounded-full"></span>
                            {template.status}
                          </span>
                        ) : (
                          template.status
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {/* Action Column with 2x2 Grid + Delete Button */}
                      <div className="flex items-center justify-center gap-4">
                        {/* 2x2 Grid Layout */}
                        <div className="grid grid-cols-2 gap-2">
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
                              onClick={() => handleEdit(template)}
                              className="btn-shimmer relative overflow-hidden flex items-center gap-1.5 h-9 px-4 bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/30 text-blue-700 dark:text-blue-400 hover:border-blue-500/50 transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/20 active:scale-95"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              <span className="text-xs font-medium">Edit</span>
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
                              onClick={() => handleDuplicate(template)}
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
                          {template.templateFor === "Initial" ? (
                            template.isDefault ? (
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
                            )
                          ) : (
                            <div className="h-9 px-4 rounded-md bg-gray-400/20 dark:bg-gray-600/20 border border-gray-400/30 dark:border-gray-600/30 flex items-center justify-center cursor-not-allowed opacity-50">
                              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                N/A
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Delete Button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 h-9 w-9 p-0 disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={isDeleting === template.id}
                          onClick={() => {
                            setSelectedTemplate(template);
                            setIsDeleteConfirmOpen(true);
                          }}
                        >
                          {isDeleting === template.id ? (
                            <span className="inline-block animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
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
        <DialogContent className="sm:max-w-6xl max-h-[90vh] overflow-y-auto mt-8">
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
                {/* Single Row: Name | Template For | Category */}
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    {/* Name */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="createTemplateName"
                        className="text-sm font-medium"
                      >
                        Name
                      </Label>
                      <input
                        id="createTemplateName"
                        type="text"
                        value={formData.templateName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            templateName: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        placeholder="Template name"
                      />
                    </div>

                    {/* Template For */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="createTemplateFor"
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
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent className="z-9999">
                          <SelectItem value="Initial">Initial</SelectItem>
                          <SelectItem value="Follow up">Follow up</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Category */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="createCategory"
                        className="text-sm font-medium"
                      >
                        Category
                      </Label>
                      <Select
                        value={formData.campaignCategory}
                        onValueChange={(value) =>
                          setFormData({ ...formData, campaignCategory: value })
                        }
                        disabled={categoriesLoading}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder={categoriesLoading ? "Loading..." : "Select a category"} />
                        </SelectTrigger>
                        <SelectContent className="z-9999">
                          {categoriesLoading ? (
                            <div className="p-2">
                              <Skeleton className="h-8 w-full" />
                            </div>
                          ) : categoriesError ? (
                            <div className="p-2 text-sm text-red-500">{categoriesError}</div>
                          ) : categories.length === 0 ? (
                            <div className="p-2 text-sm text-muted-foreground">No categories available</div>
                          ) : (
                            categories.map((category) => (
                              <SelectItem key={category.client_cat} value={String(category.client_cat)}>
                                {category.cat_name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Subject */}
                  <div className="space-y-2">
                    <Label htmlFor="createSubject" className="text-sm font-medium">
                      Subject
                    </Label>
                    <input
                      id="createSubject"
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
                    <EmailComposer
                      content={formData.htmlBody}
                      onChange={(content: string) =>
                        setFormData({ ...formData, htmlBody: content })
                      }
                      onRewrite={() => {
                        console.log("AI rewrite clicked for template");
                      }}
                      placeholder="Start typing your email template..."
                      minHeight="300px"
                    />
                  </div>

                  {/* Placeholder Variables - Below Editor */}
                  <EmailTemplatePlaceholderBox />
                </div>

                {/* Actions */}
                <div className="flex justify-end items-center pt-2 border-t mt-2">
                  <div className="flex gap-3">
                    <Button
                      variant="ghost"
                      onClick={() => setIsCreateDialogOpen(false)}
                      disabled={isSaving}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSave}
                      className="bg-black text-white hover:bg-gray-800 shadow-sm"
                      disabled={!formData.templateName || !formData.subject || isSaving}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {isSaving ? "Saving..." : "Save"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit/Duplicate Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        {/* Use stock centering from shadcn; only widen it */}
        <DialogContent className="sm:max-w-6xl max-h-[90vh] overflow-y-auto mt-8">
          <DialogHeader className="mb-2">
            <DialogTitle>
              {editMode === "edit" ? "Edit Template" : "Create Duplicate"}
            </DialogTitle>
            <DialogDescription>
              {editMode === "edit"
                ? "Update the template details below"
                : "This will create a copy of the existing template"}
            </DialogDescription>
          </DialogHeader>

          {/* Optional: gradient, WITHOUT absolute positioning */}
          <div className="rounded-lg">
            <div className="rounded-lg p-[1px] bg-gradient-to-br from-purple-500/15 via-blue-500/15 to-transparent">
              {/* Real surface so gradient is visible but content stays normal */}
              <div className="rounded-lg bg-background p-6">
                {/* Single Row: Name | Template For | Category */}
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    {/* Name */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="editTemplateName"
                        className="text-sm font-medium"
                      >
                        Name
                      </Label>
                      <input
                        id="editTemplateName"
                        type="text"
                        value={formData.templateName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            templateName: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        placeholder="Template name"
                      />
                    </div>

                    {/* Template For */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="editTemplateFor"
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
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent className="z-9999">
                          <SelectItem value="Initial">Initial</SelectItem>
                          <SelectItem value="Follow up">Follow up</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Category */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="editCategory"
                        className="text-sm font-medium"
                      >
                        Category
                      </Label>
                      <Select
                        value={formData.campaignCategory}
                        onValueChange={(value) =>
                          setFormData({ ...formData, campaignCategory: value })
                        }
                        disabled={categoriesLoading}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder={categoriesLoading ? "Loading..." : "Select a category"} />
                        </SelectTrigger>
                        <SelectContent className="z-9999">
                          {categoriesLoading ? (
                            <div className="p-2">
                              <Skeleton className="h-8 w-full" />
                            </div>
                          ) : categoriesError ? (
                            <div className="p-2 text-sm text-red-500">{categoriesError}</div>
                          ) : categories.length === 0 ? (
                            <div className="p-2 text-sm text-muted-foreground">No categories available</div>
                          ) : (
                            categories.map((category) => (
                              <SelectItem key={category.client_cat} value={String(category.client_cat)}>
                                {category.cat_name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Subject */}
                  <div className="space-y-2">
                    <Label htmlFor="editSubject" className="text-sm font-medium">
                      Subject
                    </Label>
                    <input
                      id="editSubject"
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
                    <EmailComposer
                      content={formData.htmlBody}
                      onChange={(content: string) =>
                        setFormData({ ...formData, htmlBody: content })
                      }
                      onRewrite={() => {
                        console.log("AI rewrite clicked");
                      }}
                      placeholder="Start typing your email template..."
                      minHeight="300px"
                    />
                  </div>

                  {/* Placeholder Variables - Below Editor */}
                  <EmailTemplatePlaceholderBox />
                </div>

                {/* Actions */}
                <div className="flex justify-end items-center pt-2 border-t mt-2">
                  <div className="flex gap-3">
                    <Button
                      variant="ghost"
                      onClick={() => setIsEditDialogOpen(false)}
                      disabled={isSaving}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={async () => {
                        if (editMode === "edit" && selectedTemplate) {
                          // Update existing template via API
                          try {
                            setIsSaving(true);
                            
                            const templateForValue =
                              formData.templateFor === "Initial"
                                ? "initial"
                                : formData.templateFor === "Follow up"
                                  ? "followup"
                                  : "other";

                            // Prepare payload + template_id
                            const updatePayload = {
                              template_id: Number(selectedTemplate.id),
                              templateName: formData.templateName,
                              subject: formData.subject,
                              templateFor: templateForValue,
                              campaignCategory: formData.campaignCategory,
                              htmlBody: formData.htmlBody,
                            };

                            console.log(" Sending UPDATE to API:", updatePayload);

                            // Call API to update template
                            const response = await fetch(
                              "/api/templates/email/update",
                              {
                                method: "POST",
                                headers: {
                                  "Content-Type": "application/json",
                                },
                                body: JSON.stringify(updatePayload),
                              }
                            );

                            if (!response.ok) {
                              const errorData = await response.json();
                              console.error(" API Error:", errorData);
                              toast.error(errorData.error || "Failed to update template");
                              throw new Error(errorData.error || "Update failed");
                            }

                            const result = await response.json();
                            console.log("✅ API Response:", result);

                            // Update frontend state with new data
                            const categoryName = categories.find(
                              (cat) => String(cat.client_cat) === String(formData.campaignCategory)
                            )?.cat_name;

                            setTemplates(
                              templates.map((t) =>
                                t.id === selectedTemplate.id
                                  ? {
                                      ...t,
                                      templateName: formData.templateName,
                                      subject: formData.subject,
                                      templateFor: formData.templateFor,
                                      htmlBody: formData.htmlBody,
                                      category: categoryName || formData.campaignCategory,
                                    }
                                  : t
                              )
                            );

                            setIsEditDialogOpen(false);
                            toast.success(`Template updated successfully!`);
                            console.log(" Template updated in database");
                          } catch (error) {
                            console.error(" Error updating template:", error);
                            toast.error(error instanceof Error ? error.message : "Failed to update");
                          } finally {
                            setIsSaving(false);
                          }
                        } else {
                          // Create duplicate - use handleSave
                          handleSave();
                          setIsEditDialogOpen(false);
                        }
                      }}
                      className="bg-black text-white hover:bg-gray-800 shadow-sm"
                      disabled={!formData.templateName || !formData.subject || isSaving}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {isSaving ? (editMode === "edit" ? "Updating..." : "Saving...") : editMode === "edit" ? "Update" : "Save"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
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
              disabled={isTogglingStatus !== null}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmStatusToggle}
              className="bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isTogglingStatus !== null}
            >
              {isTogglingStatus !== null ? (
                <span className="inline-flex items-center gap-2">
                  <span className="inline-block animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></span>
                  Updating...
                </span>
              ) : (
                "Confirm"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Template</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the template "{selectedTemplate?.templateName}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="ghost"
              onClick={() => {
                setIsDeleteConfirmOpen(false);
                setSelectedTemplate(null);
              }}
              disabled={isDeleting !== null}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isDeleting !== null}
            >
              {isDeleting !== null ? (
                <span className="inline-flex items-center gap-2">
                  <span className="inline-block animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></span>
                  Deleting...
                </span>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </>
              )}
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
