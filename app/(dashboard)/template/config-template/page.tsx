"use client";

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Plus,
  Trash2,
  Edit,
  Save,
  X,
  Calendar,
  Mail,
  PlayCircle,
  PauseCircle,
  Clock,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  CheckCircle,
  XCircle,
  Circle,
  Send,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

// Types
type FollowUpEmail = {
  id: string;
  sequence: number;
  daysAfter: number;
  templateId?: string;
  status: "active" | "inactive";
};

type EmailCategory = {
  id: string;
  name: string;
  description: string;
  followUps: FollowUpEmail[];
  createdAt: Date;
  status: "active" | "inactive";
  isActive: boolean; // Helper property derived from status
  totalEmails: number;
};

type SortConfig = {
  key: keyof EmailCategory | null;
  direction: "asc" | "desc";
};

// Mock data generator
const generateMockCategories = (): EmailCategory[] => {
  return [
    {
      id: "1",
      name: "Finance",
      description: "Automated sequence for product demo requests",
      followUps: [
        { id: "1-1", sequence: 1, daysAfter: 0, status: "active" },
        { id: "1-2", sequence: 2, daysAfter: 3, status: "active" },
        { id: "1-3", sequence: 3, daysAfter: 7, status: "active" },
        { id: "1-4", sequence: 4, daysAfter: 14, status: "inactive" },
      ],
      createdAt: new Date(2025, 9, 20),
      status: "active",
      isActive: true,
      totalEmails: 4,
    },
    {
      id: "2",
      name: "Technical Support",
      description: "Initial contact sequence for cold leads",
      followUps: [
        { id: "2-1", sequence: 1, daysAfter: 0, status: "active" },
        { id: "2-2", sequence: 2, daysAfter: 2, status: "active" },
        { id: "2-3", sequence: 3, daysAfter: 5, status: "active" },
      ],
      createdAt: new Date(2025, 9, 18),
      status: "active",
      isActive: true,
      totalEmails: 3,
    },
    {
      id: "3",
      name: "Supply Chain",
      description: "Follow-up sequence for trial sign-ups",
      followUps: [
        { id: "3-1", sequence: 1, daysAfter: 0, status: "active" },
        { id: "3-2", sequence: 2, daysAfter: 7, status: "inactive" },
        { id: "3-3", sequence: 3, daysAfter: 14, status: "inactive" },
        { id: "3-4", sequence: 4, daysAfter: 21, status: "inactive" },
      ],
      createdAt: new Date(2025, 9, 15),
      status: "inactive",
      isActive: false,
      totalEmails: 4,
    },
  ];
};

const getStatusColor = (status: string) => {
  return status === "active"
    ? "bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/20 cursor-pointer"
    : "bg-gray-500/10 text-gray-600 dark:text-gray-400 hover:bg-gray-500/20 cursor-pointer";
};

const getStatusIcon = (status: string) => {
  return status === "active" ? (
    <CheckCircle className="h-3 w-3 mr-1" />
  ) : (
    <XCircle className="h-3 w-3 mr-1" />
  );
};

const getFollowUpStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return "bg-green-500/10 text-green-600 dark:text-green-400";
    case "inactive":
      return "bg-gray-500/10 text-gray-600 dark:text-gray-400";
    default:
      return "bg-gray-500/10 text-gray-600 dark:text-gray-400";
  }
};

const getFollowUpStatusIcon = (status: string) => {
  switch (status) {
    case "active":
      return <CheckCircle className="h-3 w-3" />;
    case "inactive":
      return <XCircle className="h-3 w-3" />;
    default:
      return <Circle className="h-3 w-3" />;
  }
};

export default function ConfigTemplatePage() {
  // State management
  const [categories, setCategories] = useState<EmailCategory[]>(
    generateMockCategories()
  );

  // Selected category for 3-column view (default to first category)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );

  const [isCreateCategoryOpen, setIsCreateCategoryOpen] = useState(false);
  const [isEditCategoryOpen, setIsEditCategoryOpen] = useState(false);
  const [isDeleteCategoryOpen, setIsDeleteCategoryOpen] = useState(false);
  const [isStatusToggleOpen, setIsStatusToggleOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] =
    useState<EmailCategory | null>(null);
  const [categoryToToggle, setCategoryToToggle] =
    useState<EmailCategory | null>(null);

  // Get selected category object
  const selectedCategory =
    categories.find((cat) => cat.id === selectedCategoryId) || null;

  // Set first category as selected on initial load
  useEffect(() => {
    if (categories.length > 0 && !selectedCategoryId) {
      setSelectedCategoryId(categories[0].id);
    }
  }, [categories, selectedCategoryId]);

  // Form states
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    description: "",
  });

  // Loading and validation states
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({
    name: "",
    description: "",
  });

  // Sorting state
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: null,
    direction: "asc",
  });

  // Handle sorting
  const handleSort = (key: keyof EmailCategory) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Get sort icon
  const getSortIcon = (key: keyof EmailCategory) => {
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
  const sortedCategories = useMemo(() => {
    if (!sortConfig.key) return categories;

    const sorted = [...categories].sort((a, b) => {
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

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortConfig.direction === "asc"
          ? aValue - bValue
          : bValue - aValue;
      }

      return 0;
    });

    return sorted;
  }, [categories, sortConfig]);

  // Validate form
  const validateForm = () => {
    const errors = {
      name: "",
      description: "",
    };
    let isValid = true;

    if (!categoryForm.name.trim()) {
      errors.name = "Category name is required";
      isValid = false;
    } else if (categoryForm.name.trim().length < 3) {
      errors.name = "Category name must be at least 3 characters";
      isValid = false;
    }

    if (!categoryForm.description.trim()) {
      errors.description = "Description is required";
      isValid = false;
    } else if (categoryForm.description.trim().length < 10) {
      errors.description = "Description must be at least 10 characters";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  // Create category
  const handleCreateCategory = async () => {
    if (!validateForm()) {
      toast.error("Please fix the validation errors");
      return;
    }

    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800));

    const newCategory: EmailCategory = {
      id: String(categories.length + 1),
      name: categoryForm.name,
      description: categoryForm.description,
      followUps: [
        {
          id: `${categories.length + 1}-1`,
          sequence: 1,
          daysAfter: 0,
          status: "active",
        },
      ],
      createdAt: new Date(),
      status: "active",
      isActive: true,
      totalEmails: 1,
    };
    setCategories([...categories, newCategory]);
    setCategoryForm({ name: "", description: "" });
    setFormErrors({ name: "", description: "" });
    setIsLoading(false);
    setIsCreateCategoryOpen(false);

    toast.success("Category created successfully!", {
      description: `"${newCategory.name}" has been added to your templates.`,
    });
  };

  // Edit category
  const handleEditCategory = (categoryId: string) => {
    const category = categories.find((cat) => cat.id === categoryId);
    if (category) {
      setCategoryForm({
        name: category.name,
        description: category.description,
      });
      setSelectedCategoryId(category.id);
      setIsEditCategoryOpen(true);
    }
  };

  const handleSaveEdit = async () => {
    if (!validateForm()) {
      toast.error("Please fix the validation errors");
      return;
    }

    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800));

    const categoryName = categoryForm.name;

    if (selectedCategoryId) {
      setCategories(
        categories.map((cat) =>
          cat.id === selectedCategoryId
            ? {
                ...cat,
                name: categoryForm.name,
                description: categoryForm.description,
              }
            : cat
        )
      );
    }
    setIsLoading(false);
    setIsEditCategoryOpen(false);
    setCategoryForm({ name: "", description: "" });
    setFormErrors({ name: "", description: "" });

    toast.success("Category updated successfully!", {
      description: `"${categoryName}" has been updated.`,
    });
  };

  // Delete category
  const handleDeleteCategory = (categoryId: string) => {
    const category = categories.find((cat) => cat.id === categoryId);
    if (category) {
      setCategoryToDelete(category);
      setIsDeleteCategoryOpen(true);
    }
  };

  const confirmDelete = async () => {
    if (categoryToDelete) {
      setIsLoading(true);
      const categoryName = categoryToDelete.name;
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 600));
      setCategories(categories.filter((cat) => cat.id !== categoryToDelete.id));
      setIsLoading(false);

      toast.success("Category deleted", {
        description: `"${categoryName}" has been permanently deleted.`,
      });
    }
    setIsDeleteCategoryOpen(false);
    setCategoryToDelete(null);
  };

  const handleAddFollowUp = () => {
    if (selectedCategory) {
      const newSequence = selectedCategory.followUps.length + 1;
      const lastDays =
        selectedCategory.followUps[selectedCategory.followUps.length - 1]
          ?.daysAfter || 0;
      const newFollowUp: FollowUpEmail = {
        id: `${selectedCategory.id}-${newSequence}`,
        sequence: newSequence,
        daysAfter: lastDays + 3,
        status: "inactive",
      };
      const updatedCategory = {
        ...selectedCategory,
        followUps: [...selectedCategory.followUps, newFollowUp],
        totalEmails: selectedCategory.totalEmails + 1,
      };
      setCategories(
        categories.map((cat) =>
          cat.id === selectedCategory.id ? updatedCategory : cat
        )
      );

      toast.success("Follow-up added", {
        description: `Email ${newSequence} added to sequence.`,
      });
    }
  };

  const handleRemoveFollowUp = (followUpId: string) => {
    if (selectedCategory && selectedCategory.followUps.length > 1) {
      const updatedFollowUps = selectedCategory.followUps
        .filter((fu) => fu.id !== followUpId)
        .map((fu, index) => ({ ...fu, sequence: index + 1 }));
      const updatedCategory = {
        ...selectedCategory,
        followUps: updatedFollowUps,
        totalEmails: updatedFollowUps.length,
      };
      setCategories(
        categories.map((cat) =>
          cat.id === selectedCategory.id ? updatedCategory : cat
        )
      );

      toast.success("Follow-up removed", {
        description: "Email removed from sequence.",
      });
    }
  };

  const handleUpdateFollowUpDays = (followUpId: string, days: number) => {
    if (selectedCategory) {
      const updatedFollowUps = selectedCategory.followUps.map((fu) =>
        fu.id === followUpId ? { ...fu, daysAfter: days } : fu
      );
      setCategories(
        categories.map((cat) =>
          cat.id === selectedCategory.id
            ? { ...cat, followUps: updatedFollowUps }
            : cat
        )
      );
    }
  };

  const handleUpdateFollowUpStatus = (
    followUpId: string,
    status: "active" | "inactive"
  ) => {
    if (selectedCategory) {
      const updatedFollowUps = selectedCategory.followUps.map((fu) =>
        fu.id === followUpId ? { ...fu, status } : fu
      );
      setCategories(
        categories.map((cat) =>
          cat.id === selectedCategory.id
            ? { ...cat, followUps: updatedFollowUps }
            : cat
        )
      );
    }
  };

  // Toggle category status with confirmation
  const handleToggleCategoryStatus = (categoryId: string) => {
    const category = categories.find((cat) => cat.id === categoryId);
    if (category) {
      setCategoryToToggle(category);
      setIsStatusToggleOpen(true);
    }
  };

  const confirmStatusToggle = () => {
    if (categoryToToggle) {
      const newStatus =
        categoryToToggle.status === "active" ? "inactive" : "active";
      const newIsActive = newStatus === "active";

      setCategories(
        categories.map((cat) =>
          cat.id === categoryToToggle.id
            ? { ...cat, status: newStatus, isActive: newIsActive }
            : cat
        )
      );

      toast.success(
        `Category ${newStatus === "active" ? "activated" : "deactivated"}`,
        {
          description: `"${categoryToToggle.name}" is now ${newStatus}.`,
        }
      );
    }
    setIsStatusToggleOpen(false);
    setCategoryToToggle(null);
  };

  // Select category for viewing in columns 2 & 3
  const handleSelectCategory = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
  };

  return (
    <div className="flex flex-1 flex-col gap-6 mt-3">
      {/* Header Row */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Config Template
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configure automated email sequences for your sales campaigns
          </p>
        </div>
        {/* <Button
          onClick={() => {
            setCategoryForm({ name: "", description: "" });
            setIsCreateCategoryOpen(true);
          }}
          className="bg-black text-white hover:bg-gray-800 shadow-sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Category
        </Button> */}
      </div>

      {/* Categories Table or Empty State */}
      {sortedCategories.length === 0 ? (
        <Card className="rounded-xl bg-white dark:bg-black backdrop-blur-sm border border-border/20 dark:border-border/10 shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-64 h-64 mb-6 relative">
              {/* Illustration */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  {/* Central Mail Icon */}
                  <div className="w-32 h-32 rounded-full bg-linear-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                    <Mail className="w-16 h-16 text-blue-500" />
                  </div>
                  {/* Floating Icons */}
                  <div className="absolute -top-4 -right-4 w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center animate-bounce">
                    <Calendar className="w-6 h-6 text-green-500" />
                  </div>
                  <div className="absolute -bottom-4 -left-4 w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center animate-pulse">
                    <Clock className="w-6 h-6 text-orange-500" />
                  </div>
                </div>
              </div>
            </div>

            <h3 className="text-2xl font-semibold mb-2 text-foreground">
              No Email Categories Yet
            </h3>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              Start building your automated email sequences by creating your
              first category. Set up follow-up schedules for different campaign
              types like product demos, cold outreach, or trial users.
            </p>

            <div className="flex flex-col gap-4 items-center">
              <Button
                onClick={() => {
                  setCategoryForm({ name: "", description: "" });
                  setFormErrors({ name: "", description: "" });
                  setIsCreateCategoryOpen(true);
                }}
                className="bg-black text-white hover:bg-gray-800 shadow-sm"
                size="lg"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create Your First Category
              </Button>

              <div className="text-sm text-muted-foreground">
                <span className="font-medium">Example categories:</span> Product
                Demo, Cold Outreach, Trial Users
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-[280px_1fr_380px] gap-4 h-full">
          {/* Column 1: Categories List */}
          <Card className="overflow-hidden flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Categories</CardTitle>
              <CardDescription>Select a category to manage</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category Name</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedCategories.map((category, index) => (
                    <TableRow
                      key={category.id}
                      className={`cursor-pointer transition-all duration-300 ${
                        selectedCategoryId === category.id
                          ? "bg-linear-to-r from-blue-50 via-purple-50 to-blue-50 dark:from-blue-950/30 dark:via-purple-950/30 dark:to-blue-950/30 border-l-4 border-l-blue-500 dark:border-l-blue-400 shadow-md"
                          : "hover:bg-accent/50"
                      }`}
                      onClick={() => handleSelectCategory(category.id)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-2 justify-between pr-2">
                          <span className={`font-medium ${selectedCategoryId === category.id ? 'text-blue-700 dark:text-blue-300' : ''}`}>
                            {category.name}
                          </span>
                          {/* <Badge
                            variant={
                              category.isActive ? "default" : "secondary"
                            }
                            className={`text-xs cursor-pointer ${
                              category.isActive
                                ? "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-900"
                                : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
                            } flex items-center gap-1`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleCategoryStatus(category.id);
                            }}
                          >
                            {category.isActive ? (
                              <CheckCircle className="w-3 h-3" />
                            ) : (
                              <XCircle className="w-3 h-3" />
                            )}
                            {category.isActive ? "Active" : "Inactive"}
                          </Badge> */}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Column 2: Follow-up Configuration Table */}
          {selectedCategory ? (
            <Card className="overflow-hidden flex flex-col border-t-4 border-t-transparent bg-linear-to-r from-blue-500/10 via-purple-500/10 to-blue-500/10 dark:from-blue-500/5 dark:via-purple-500/5 dark:to-blue-500/5">
              <CardHeader className="pb-3 bg-linear-to-r from-blue-50/50 via-purple-50/50 to-transparent dark:from-blue-950/20 dark:via-purple-950/20 dark:to-transparent">
                <CardTitle className="text-lg flex flex-col ">

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      Configuration: {selectedCategory.name}
                    </span>
                    <Button
                      onClick={handleAddFollowUp}
                      size="sm"
                      className="bg-black text-white hover:bg-gray-800"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Follow-up
                    </Button>
                  </div>
                  <div className="text-muted-foreground text-sm font-normal -mb-1">hi</div>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[140px]">Email</TableHead>
                      <TableHead className="text-center w-[140px]">
                        Days After
                      </TableHead>
                      <TableHead className="text-center w-[120px]">
                        Status
                      </TableHead>
                      <TableHead className="text-center w-[70px]">
                        Del
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedCategory.followUps.map((followUp, index) => (
                      <TableRow key={followUp.id}>
                        <TableCell className="font-medium">
                          {index === 0 ? 'Initial' : `Follow-up ${index}`}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Input
                              type="number"
                              min="0"
                              value={followUp.daysAfter}
                              onChange={(e) =>
                                index !== 0 && handleUpdateFollowUpDays(
                                  followUp.id,
                                  parseInt(e.target.value) || 0
                                )
                              }
                              disabled={index === 0}
                              className={`w-16 text-center ${index === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                            />
                            <span className="text-sm text-muted-foreground">
                              {followUp.daysAfter === 1 ? 'day' : 'days'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Select
                            value={followUp.status}
                            onValueChange={(value: any) =>
                              index !== 0 && handleUpdateFollowUpStatus(followUp.id, value)
                            }
                            disabled={index === 0}
                          >
                            <SelectTrigger className={`w-[110px] mx-auto ${index === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">
                                <div className="flex items-center gap-2">
                                  <CheckCircle className="w-3 h-3 text-green-500" />
                                  Active
                                </div>
                              </SelectItem>
                              <SelectItem value="inactive">
                                <div className="flex items-center gap-2">
                                  <XCircle className="w-3 h-3 text-gray-500" />
                                  Inactive
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveFollowUp(followUp.id)}
                            disabled={selectedCategory.followUps.length === 1 || index === 0}
                            className="hover:bg-red-50 dark:hover:bg-red-950 h-8 w-8 p-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
            <Card className="flex items-center justify-center">
              <CardContent className="text-center py-12">
                <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Select a category to view and manage follow-ups
                </p>
              </CardContent>
            </Card>
          )}

          {/* Column 3: Timeline Roadmap */}
          {selectedCategory ? (
            <Card className="overflow-hidden flex flex-col border-t-4 border-t-transparent">
              <CardHeader className="pb-3 ">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  Email Sequence Timeline
                </CardTitle>
                <CardDescription>
                  Visual representation of your email sequence
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto pl-8">
                <div className="relative">
                  {selectedCategory.followUps.map((followUp, index) => (
                    <div
                      key={followUp.id}
                      className="relative flex items-start gap-6 pb-8 last:pb-0"
                    >
                      {/* Vertical Line */}
                      {index < selectedCategory.followUps.length - 1 && (
                        <div className="absolute left-0 top-1 -translate-x-1/2 w-0.5 h-full bg-linear-to-b from-blue-500 via-purple-500 to-blue-500" />
                      )}

                      {/* Pulsing Green Dot */}
                      <div className="absolute left-0 -translate-x-1/2 mt-1 z-10">
                        <div className="relative">
                          {/* Outer pulse ring */}
                          <div className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-75" />
                          {/* Main dot */}
                          <div className="relative w-3 h-3 rounded-full bg-green-500 border-2 border-white dark:border-black shadow-lg" />
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 ml-6 group">
                        <div className="flex items-start gap-4 p-3 rounded-lg bg-transparent hover:bg-accent/5 transition-all duration-200">
                          {/* Sequence Badge */}
                          <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-muted text-muted-foreground font-bold text-sm group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                            {followUp.sequence}
                          </div>

                          {/* Details */}
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-3 flex-wrap">
                              {/* Day Badge */}
                              <div className="flex items-center gap-1.5 text-sm font-semibold">
                                <Clock className="h-4 w-4 text-blue-500" />
                                <span>Day {followUp.daysAfter}</span>
                              </div>

                              {/* Status Badge */}
                              <Badge
                                className={`${getFollowUpStatusColor(
                                  followUp.status
                                )} flex items-center gap-1`}
                              >
                                {getFollowUpStatusIcon(followUp.status)}
                                {followUp.status}
                              </Badge>
                            </div>

                            {/* Description */}
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {index === 0 ? (
                                <>
                                  <Mail className="inline h-3.5 w-3.5 mr-1.5 " />
                                  <strong className="text-foreground">
                                    Initial contact email
                                  </strong>{" "} <br />
                                  Sent immediately when campaign starts
                                </>
                              ) : (
                                <>
                                  <Mail className="inline h-3.5 w-3.5 mr-1.5" />
                                  <strong className="text-foreground">
                                    Follow-up {followUp.sequence - 1}
                                  </strong>{" "}
                                  <br />
                                  {followUp.daysAfter === 1
                                    ? " 1 day"
                                    : ` ${followUp.daysAfter} days`}{" "}
                                  after initial contact
                                </>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="flex items-center justify-center">
              <CardContent className="text-center py-12">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Select a category to view timeline
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Create Category Dialog */}
      <Dialog
        open={isCreateCategoryOpen}
        onOpenChange={setIsCreateCategoryOpen}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Category</DialogTitle>
            <DialogDescription>
              Create a new email category for your automated sequences.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="category-name">
                Category Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="category-name"
                placeholder="e.g., Product Demo, Cold Outreach"
                value={categoryForm.name}
                onChange={(e) => {
                  setCategoryForm({ ...categoryForm, name: e.target.value });
                  if (formErrors.name) {
                    setFormErrors({ ...formErrors, name: "" });
                  }
                }}
                className={
                  formErrors.name
                    ? "border-red-500 focus-visible:ring-red-500"
                    : ""
                }
              />
              {formErrors.name && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <X className="h-3 w-3" />
                  {formErrors.name}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="category-description">
                Description <span className="text-red-500">*</span>
              </Label>
              <Input
                id="category-description"
                placeholder="Brief description of this category"
                value={categoryForm.description}
                onChange={(e) => {
                  setCategoryForm({
                    ...categoryForm,
                    description: e.target.value,
                  });
                  if (formErrors.description) {
                    setFormErrors({ ...formErrors, description: "" });
                  }
                }}
                className={
                  formErrors.description
                    ? "border-red-500 focus-visible:ring-red-500"
                    : ""
                }
              />
              {formErrors.description && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <X className="h-3 w-3" />
                  {formErrors.description}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateCategoryOpen(false);
                setFormErrors({ name: "", description: "" });
              }}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateCategory}
              disabled={isLoading}
              className="bg-black text-white hover:bg-gray-800"
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Create Category
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog open={isEditCategoryOpen} onOpenChange={setIsEditCategoryOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>
              Update the category name and description.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-category-name">
                Category Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-category-name"
                placeholder="e.g., Product Demo, Cold Outreach"
                value={categoryForm.name}
                onChange={(e) => {
                  setCategoryForm({ ...categoryForm, name: e.target.value });
                  if (formErrors.name) {
                    setFormErrors({ ...formErrors, name: "" });
                  }
                }}
                className={
                  formErrors.name
                    ? "border-red-500 focus-visible:ring-red-500"
                    : ""
                }
              />
              {formErrors.name && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <X className="h-3 w-3" />
                  {formErrors.name}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-category-description">
                Description <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-category-description"
                placeholder="Brief description of this category"
                value={categoryForm.description}
                onChange={(e) => {
                  setCategoryForm({
                    ...categoryForm,
                    description: e.target.value,
                  });
                  if (formErrors.description) {
                    setFormErrors({ ...formErrors, description: "" });
                  }
                }}
                className={
                  formErrors.description
                    ? "border-red-500 focus-visible:ring-red-500"
                    : ""
                }
              />
              {formErrors.description && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <X className="h-3 w-3" />
                  {formErrors.description}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditCategoryOpen(false);
                setFormErrors({ name: "", description: "" });
              }}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={isLoading}
              className="bg-black text-white hover:bg-gray-800"
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Category Dialog */}
      <AlertDialog
        open={isDeleteCategoryOpen}
        onOpenChange={setIsDeleteCategoryOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the category &quot;
              {categoryToDelete?.name}&quot; and all its follow-up sequences.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Status Toggle Confirmation Dialog */}
      <AlertDialog
        open={isStatusToggleOpen}
        onOpenChange={setIsStatusToggleOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {categoryToToggle?.isActive ? "Deactivate" : "Activate"} Category?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {categoryToToggle?.isActive
                ? `This will deactivate "${categoryToToggle?.name}" and stop all automated emails in this sequence.`
                : `This will activate "${categoryToToggle?.name}" and resume automated emails in this sequence.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setIsStatusToggleOpen(false);
                setCategoryToToggle(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmStatusToggle}
              className="bg-black text-white hover:bg-gray-800"
            >
              {categoryToToggle?.isActive ? "Deactivate" : "Activate"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
