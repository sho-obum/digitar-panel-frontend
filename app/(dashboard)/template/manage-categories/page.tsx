"use client";
import { useState, useMemo, useRef } from "react";
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
  CheckCircle,
  XCircle,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Zap,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

// Types
type Category = {
  default: any;
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  totalEmails: number;
  createdAt: Date;
  updatedAt: Date;
};

type SortConfig = {
  key: keyof Category | null;
  direction: "asc" | "desc";
};

// Mock data generator
const generateMockCategories = async (): Promise<Category[]> => {
  try {
    // 👇 Hit your real API endpoint
    const res = await fetch("/api/templates/email/categories/0", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      console.error("Failed to fetch categories:", res.statusText);
      return [];
    }

    const json = await res.json();

    if (!json.data || !Array.isArray(json.data)) {
      console.error("Invalid response format:", json);
      return [];
    }

    const categories: Category[] = json.data.map((cat: any) => ({
      id: cat.client_cat?.toString(),
      name: cat.cat_name,
      description: cat.description,
      isActive: cat.is_active ?? false,
      default : cat.default_cat === 1 ? true : false,
      totalEmails: cat.total_emails ?? cat.totalEmails ?? 0,
      createdAt: new Date(cat.created_at ?? cat.createdAt),
      updatedAt: new Date(cat.updated_at ?? cat.updatedAt),
    }));

    return categories;
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
};

export default function ManageCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const hasFetched = useRef(false); 

  if (!hasFetched.current) {
    hasFetched.current = true;
    generateMockCategories().then((data) => {
      if (Array.isArray(data)) setCategories(data);
    });
  }

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);

  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [categoryToToggle, setCategoryToToggle] = useState<Category | null>(null);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);

  const [formData, setFormData] = useState({ name: "", description: "" });
  const [formErrors, setFormErrors] = useState({ name: "", description: "" });
  const [isLoading, setIsLoading] = useState(false);

  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: "createdAt",
    direction: "desc",
  });

  const [searchTerm, setSearchTerm] = useState("");

  // Sort function
  const handleSort = (key: keyof Category) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Get sort icon
  const getSortIcon = (key: keyof Category) => {
    if (sortConfig.key !== key) {
      return <ArrowUpDown className="ml-2 h-4 w-4 text-muted-foreground" />;
    }
    return sortConfig.direction === "asc" ? (
      <ArrowUp className="ml-2 h-4 w-4" />
    ) : (
      <ArrowDown className="ml-2 h-4 w-4" />
    );
  };

  // Filter and sort categories
  const sortedCategories = useMemo(() => {
    if (!Array.isArray(categories)) return []; 
    let filtered = categories.filter((cat) =>
      cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cat.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key!];
        const bValue = b[sortConfig.key!];

        if (typeof aValue === "string") {
          return sortConfig.direction === "asc"
            ? (aValue as string).localeCompare(bValue as string)
            : (bValue as string).localeCompare(aValue as string);
        }

        if (aValue instanceof Date && bValue instanceof Date) {
          return sortConfig.direction === "asc"
            ? aValue.getTime() - bValue.getTime()
            : bValue.getTime() - aValue.getTime();
        }

        if (typeof aValue === "boolean") {
          return sortConfig.direction === "asc"
            ? (aValue as boolean) === (bValue as boolean)
              ? 0
              : (aValue as boolean)
              ? 1
              : -1
            : (aValue as boolean) === (bValue as boolean)
            ? 0
            : (aValue as boolean)
            ? -1
            : 1;
        }

        return sortConfig.direction === "asc"
          ? (aValue as number) - (bValue as number)
          : (bValue as number) - (aValue as number);
      });
    }

    return filtered;
  }, [categories, sortConfig, searchTerm]);

  // Validation
  const validateForm = () => {
    const errors = { name: "", description: "" };

    if (!formData.name.trim()) {
      errors.name = "Category name is required";
    } else if (formData.name.trim().length < 3 || formData.name.trim().length > 45) {
      errors.name = "Category name must be at least 3 characters and less than 45.";
    }

    if (!formData.description.trim()) {
      errors.description = "Description is required";
    } else if (formData.description.trim().length < 10 || formData.description.trim().length > 255) {
      errors.description = "Description must be at least 10 characters and less than 255.";
    }
    setFormErrors(errors);
    return Object.values(errors).every((error) => error === "");
  };

  // Create category
  const handleCreateCategory = async () => {
    if (!validateForm()) {
      toast.error("Please fix the validation errors");
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch("/api/templates/email/categories/add", {
        method: "POST",
        body: JSON.stringify({
          category_name: formData.name,
          description: formData.description,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        if (res.status === 409 && json.warning) {
          toast.warning(json.warning);
        } else {
          toast.error(json.message);
        }
        return;
      }

      const newCategory = {
        id: json.category.id,
        name: json.category.name,
        description: json.category.description,
        isActive: json.category.isActive,
        totalEmails: 0,
        default:false,
        createdAt: new Date(json.category.createdAt),
        updatedAt: new Date(json.category.updatedAt),
      };

      setCategories([...categories, newCategory]);
      setFormData({ name: "", description: "" });
      setIsCreateOpen(false);
      toast.success("Category created successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Network error — please try again later");
    } finally {
      setIsLoading(false);
    }
  };


  // Edit category
const handleEditCategory = async () => {
  if (!categoryToEdit || !validateForm()) {
    toast.error("Please fix the validation errors");
    return;
  }

  setIsLoading(true);

  try {
    const res = await fetch(`/api/templates/email/categories/${categoryToEdit.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.name,
        description: formData.description,
      }),
    });

    const json = await res.json();

    if (!res.ok) {
      toast.error(json.error || "Failed to update category");
      return;
    }

    // ✅ Update state on success
    setCategories(
      categories.map((cat) =>
        cat.id === categoryToEdit.id
          ? {
              ...cat,
              name: json.category?.name || formData.name,
              description: json.category?.description || formData.description,
              updatedAt: new Date(json.category?.updatedAt || Date.now()),
            }
          : cat
      )
    );

    toast.success("Category updated successfully!", {
      description: `"${formData.name}" has been updated.`,
    });

  } catch (err) {
    console.error("Edit category error:", err);
    toast.error("Network error — please try again later");
  } finally {
    setIsLoading(false);
    setIsEditOpen(false);
    setCategoryToEdit(null);
    setFormData({ name: "", description: "" });
    setFormErrors({ name: "", description: "" });
  }
};
  // Delete category
  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;

    try {
      setIsLoading(true);
      const res = await fetch(
        `/api/templates/email/categories/${categoryToDelete.id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData?.message || "Failed to delete category");
      }

      // Update UI after successful delete
      setCategories((prev) =>
        prev.filter((cat) => cat.id !== categoryToDelete.id)
      );

      toast.success("Category deleted successfully!", {
        description: `"${categoryToDelete.name}" has been permanently deleted.`,
      });
    } catch (err: any) {
      console.error("Delete category error:", err);
      toast.error("Failed to delete category", {
        description:
          err?.message ||
          "Something went wrong while deleting this category.",
      });
    } finally {
      setIsLoading(false);
      setIsDeleteOpen(false);
      setCategoryToDelete(null);
    }
  };

  const handleToggleStatus = async () => {
    if (!categoryToToggle) return;

    const newStatus = !categoryToToggle.isActive;
    setIsLoading(true);


    setCategories(
      categories.map((cat) =>
        cat.id === categoryToToggle.id
          ? { ...cat, isActive: newStatus, updatedAt: new Date() }
          : cat
      )
    );
    try {

      const res = await fetch(`/api/templates/email/categories/${categoryToToggle.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: newStatus }),
      });

      if (!res.ok) {
        throw new Error("Failed to update");
      }

      toast.success(
        newStatus ? "Category activated" : "Category deactivated",
        {
          description: `"${categoryToToggle.name}" is now ${newStatus ? "active" : "inactive"
            }.`,
        }
      );
    } catch (error) {
      setCategories(
        categories.map((cat) =>
          cat.id === categoryToToggle.id
            ? { ...cat, isActive: !newStatus }
            : cat
        )
      );

      toast.error("Failed to update category", {
        description: (error as Error).message,
      });
    }

    setCategoryToToggle(null);
    setIsLoading(false);
    setIsStatusOpen(false);
  };


  return (
    <div className="flex flex-1 flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Manage Categories
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          Create, edit, and manage your email campaign categories
        </p>
      </div>

      {/* Search and Create */}
      <div className="flex gap-3">
        <div className="flex-1">
          <Input
            placeholder="Search categories by name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-10"
          />
        </div>
        <Button
          onClick={() => {
            setFormData({ name: "", description: "" });
            setFormErrors({ name: "", description: "" });
            setCategoryToEdit(null);
            setIsCreateOpen(true);
          }}
          className="bg-black text-white hover:bg-gray-800 cursor-pointer"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Category
        </Button>
      </div>

      {/* Categories Table */}
      <Card className="rounded-xl bg-white dark:bg-black backdrop-blur-sm border border-border/20 dark:border-border/10 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">All Categories</CardTitle>
          <CardDescription>
            Total: {sortedCategories.length} categories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16 text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 p-0 hover:bg-transparent w-full justify-center cursor-pointer"
                      onClick={() => handleSort("id")}
                    >
                      No.
                      {getSortIcon("id")}
                    </Button>
                  </TableHead>
                  <TableHead className="text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 p-0 hover:bg-transparent w-full justify-center cursor-pointer"
                      onClick={() => handleSort("name")}
                    >
                      Name
                      {getSortIcon("name")}
                    </Button>
                  </TableHead>
                  <TableHead className="text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 p-0 hover:bg-transparent w-full justify-center cursor-pointer"
                      onClick={() => handleSort("description")}
                    >
                      Description
                      {getSortIcon("description")}
                    </Button>
                  </TableHead>
                  <TableHead className="text-center w-32">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 p-0 hover:bg-transparent w-full justify-center cursor-pointer"
                      onClick={() => handleSort("isActive")}
                    >
                      Status
                      {getSortIcon("isActive")}
                    </Button>
                  </TableHead>
                  {/* <TableHead className="text-center w-32">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 p-0 hover:bg-transparent w-full justify-center cursor-pointer"
                      onClick={() => handleSort("totalEmails")}
                    >
                      Emails
                      {getSortIcon("totalEmails")}
                    </Button>
                  </TableHead> */}
                  <TableHead className="text-center w-44">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 p-0 hover:bg-transparent w-full justify-center cursor-pointer"
                      onClick={() => handleSort("createdAt")}
                    >
                      CreatedAt
                      {getSortIcon("createdAt")}
                    </Button>
                  </TableHead>
                  <TableHead className="text-center w-32">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedCategories.length > 0 ? (
                  sortedCategories.map((category, index) => (
                    <TableRow
                      key={category.id}
                      className="hover:bg-accent/50 transition-colors"
                    >
                      <TableCell className="text-center font-medium">
                        {index + 1}
                      </TableCell>
                      <TableCell className="font-semibold">
                        {category.name}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {category.description}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          className={`cursor-pointer transition-all ${
                            category.isActive
                              ? "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-900"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
                          } flex items-center gap-1 justify-center w-fit mx-auto`}
                          onClick={() => {
                            if (category.default) return;
                            setCategoryToToggle(category);
                            setIsStatusOpen(true);
                          }}
                        >
                          {category.isActive ? (
                            <CheckCircle className="w-3 h-3" />
                          ) : (
                            <XCircle className="w-3 h-3" />
                          )}
                          {category.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      {/* <TableCell className="text-center">
                        <Badge variant="outline" className="font-mono">
                          {category.totalEmails}
                        </Badge>
                      </TableCell> */}
                      <TableCell className="text-center text-sm">
                        {category.default ? 'Default' : format(category.updatedAt, "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (category.default) return;
                              setCategoryToEdit(category);
                              setFormData({
                                name: category.name,
                                description: category.description,
                              });
                              setIsEditOpen(true);
                            }}
                            disabled={category.default} 
                            className={`${category.default
                                ? "opacity-40 pointer-events-none blur-[1px] cursor-not-allowed" 
                                : "hover:bg-red-50 dark:hover:bg-red-950 cursor-pointer"
                              }`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm"
                            onClick={() => {
                              if (category.default) return; 
                              setCategoryToDelete(category);
                              setIsDeleteOpen(true);
                            }}
                            disabled={category.default} 
                            className={`${category.default
                                ? "opacity-40 pointer-events-none blur-[1px] cursor-not-allowed" 
                                : "hover:bg-red-50 dark:hover:bg-red-950 cursor-pointer"
                              }`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>

                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12">
                      <div className="flex flex-col items-center gap-2">
                        <Zap className="h-12 w-12 text-muted-foreground opacity-50" />
                        <p className="text-muted-foreground">
                          No categories found
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Category Dialog */}
      <Dialog open={isCreateOpen || isEditOpen} onOpenChange={(open) => {
        if (!open) {
          setIsCreateOpen(false);
          setIsEditOpen(false);
          setCategoryToEdit(null);
          setFormData({ name: "", description: "" });
          setFormErrors({ name: "", description: "" });
        }
      }}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {categoryToEdit ? "Edit Category" : "Create New Category"}
            </DialogTitle>
            <DialogDescription>
              {categoryToEdit
                ? "Update the category details"
                : "Add a new email campaign category to your account"}
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
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  if (formErrors.name) {
                    setFormErrors({ ...formErrors, name: "" });
                  }
                }}
                className={formErrors.name ? "border-red-500 focus-visible:ring-red-500" : ""}
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
                value={formData.description}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    description: e.target.value,
                  });
                  if (formErrors.description) {
                    setFormErrors({ ...formErrors, description: "" });
                  }
                }}
                className={formErrors.description ? "border-red-500 focus-visible:ring-red-500" : ""}
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
                setIsCreateOpen(false);
                setIsEditOpen(false);
                setCategoryToEdit(null);
                setFormData({ name: "", description: "" });
                setFormErrors({ name: "", description: "" });
              }}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={categoryToEdit ? handleEditCategory : handleCreateCategory}
              disabled={isLoading}
              className="bg-black text-white hover:bg-gray-800"
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  {categoryToEdit ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {categoryToEdit ? "Update Category" : "Create Category"}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{categoryToDelete?.name}"? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setIsDeleteOpen(false);
                setCategoryToDelete(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCategory}
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
      <AlertDialog open={isStatusOpen} onOpenChange={setIsStatusOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {categoryToToggle?.isActive ? "Deactivate" : "Activate"} Category?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {categoryToToggle?.isActive
                ? `Deactivating "${categoryToToggle?.name}" will stop all automated emails in this category.`
                : `Activating "${categoryToToggle?.name}" will resume all automated emails in this category.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setIsStatusOpen(false);
                setCategoryToToggle(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleToggleStatus}
              disabled={isLoading}
              className="bg-black text-white hover:bg-gray-800"
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  {categoryToToggle?.isActive ? "Deactivating..." : "Activating..."}
                </>
              ) : categoryToToggle?.isActive ? (
                "Deactivate"
              ) : (
                "Activate"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
