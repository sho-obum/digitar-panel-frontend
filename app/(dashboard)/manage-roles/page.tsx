"use client";

import React, { useEffect, useState } from "react";
import {
  Plus,
  Trash2,
  Shield,
  Save,
  RotateCcw,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

interface Role {
  id: string;
  name: string;
}

interface Page {
  key?: string;
  label?: string;
  category?: string;
  category_id?: string;
  items?: Page[];
}

export default function RoleAccessPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [pagesData, setPagesData] = useState<Page[]>([]);
  const [isCreateRoleOpen, setIsCreateRoleOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [collapsedCategories, setCollapsedCategories] = useState<
    Record<string, boolean>
  >({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [permissions, setPermissions] = useState<
    Record<string, Record<string, boolean>>
  >({});
  const [pendingAction, setPendingAction] = useState<{
    pageKey: string;
    roleId: string;
    newValue: boolean;
  } | null>(null);

  const toggleCategory = (categoryKey: string) => {
    setCollapsedCategories((prev) => ({
      ...prev,
      [categoryKey]: !prev[categoryKey],
    }));
  };

  const confirmPermissionChange = async () => {
    if (!pendingAction) return;

    const { pageKey, roleId, newValue } = pendingAction;

    try {
      const res = await fetch("/api/roles/update-permission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role_id: roleId,
          page_key: pageKey,
          allow: newValue,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update");

      setPermissions((prev) => ({
        ...prev,
        [pageKey]: {
          ...prev[pageKey],
          [roleId]: newValue,
        },
      }));
      toast.success("Permission updated");
    } catch (err: any) {
      toast.error(err.message || "Failed to update");
    }

    setConfirmOpen(false);
    setPendingAction(null);
  };

  const cancelPermissionChange = () => {
    setConfirmOpen(false);
    setPendingAction(null);
  };

  const requestTogglePermission = (
    pageKey: string,
    roleId: string,
    currentValue: boolean
  ) => {
    setPendingAction({
      pageKey,
      roleId,
      newValue: !currentValue,
    });
    setConfirmOpen(true);
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        // 1️⃣ Load roles
        const roleRes = await fetch("/api/roles/create");
        const roleJson = await roleRes.json();
        setRoles(roleJson.data);

        // 2️⃣ Load pages
        const pageRes = await fetch("/api/roles/pages");
        const pageJson = await pageRes.json();
        setPagesData(pageJson.data);

        // 3️⃣ Load saved permissions
        const permRes = await fetch("/api/roles/permissions");
        const permJson = await permRes.json();

        const dbPermissions = permJson.data; // 👈 uses your API format

        // 4️⃣ Build permission map (page_key -> role_id -> allowed)
        const newPermissions: Record<string, Record<string, boolean>> = {};

        pageJson.data.forEach((section: any) => {
          const traverse = (items: any[]) => {
            items.forEach((item: any) => {
              if (item.category) {
                traverse(item.items);
              } else {
                newPermissions[item.key] = {};

                roleJson.data.forEach((role: any) => {
                  // Find in DB
                  const found = dbPermissions.find(
                    (p: any) => p.page_key === item.key && p.role_id === role.id
                  );

                  newPermissions[item.key][role.id] = found
                    ? found.allowed === 1
                    : false;
                });
              }
            });
          };
          traverse(section.items);
        });

        setPermissions(newPermissions);
      } catch (error: any) {
        toast.error("Error loading initial data");
      }
    };

    loadData();
  }, []);

  const handleCreateRole = async () => {
    if (!newRoleName.trim()) return;

    try {
      const slug = newRoleName.trim().toLowerCase().replace(/\s+/g, "-");
      const res = await fetch("/api/roles/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newRoleName,
          slug,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create role");

      const refresh = await fetch(`/api/roles/create`);
      const roleList = await refresh.json();
      const dbData = roleList.data;
      setRoles(dbData);

      const lastRole = dbData[dbData.length - 1];
      const newPerms: Record<string, Record<string, boolean>> = {};
      Object.keys(permissions).forEach((key) => {
        newPerms[key] = {
          ...permissions[key],
          [lastRole.id]: false,
        };
      });
      setPermissions(newPerms);

      setNewRoleName("");
      setIsCreateRoleOpen(false);
    } catch (err: any) {
      toast.error(err.error || "Failed to create role");
    }
  };

  // const handleDeleteRole = (roleId: number) => {
  //   setRoles(roles.filter((r) => r.id !== roleId));
  //   const newPerms: Record<string, Record<string, boolean>> = {};
  //   Object.keys(permissions).forEach((key) => {
  //     const { [roleId]: _, ...rest } = permissions[key];
  //     newPerms[key] = rest;
  //   });
  //   setPermissions(newPerms);
  // };

  const renderPageRows = (
    items: any[],
    parentKey: string = ""
  ): React.ReactNode[] => {
    const rows: React.ReactNode[] = [];
    items.forEach((item, index) => {
      if (item.category) {
        const categoryKey = `${parentKey}-${item.category}-${index}`;
        const isCollapsed = collapsedCategories[categoryKey];

        // Category header
        rows.push(
          <TableRow
            key={categoryKey}
            className="bg-gradient-to-r from-indigo-50/30 to-purple-50/30 dark:from-indigo-950/10 dark:to-purple-950/10 hover:from-indigo-50/50 hover:to-purple-50/50 dark:hover:from-indigo-950/20 dark:hover:to-purple-950/20 cursor-pointer"
            onClick={() => toggleCategory(categoryKey)}
          >
            <TableCell
              colSpan={roles.length + 1}
              className="font-semibold text-xs py-2.5 sticky left-0 bg-gradient-to-r from-indigo-50/30 to-purple-50/30 dark:from-indigo-950/10 dark:to-purple-950/10"
            >
              <div className="flex items-center gap-2 pl-6">
                {isCollapsed ? (
                  <ChevronRight className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                )}
                <div className="h-1 w-1 rounded-full bg-indigo-400" />
                <span className="text-indigo-700 dark:text-indigo-300">
                  {item.category}
                </span>
              </div>
            </TableCell>
          </TableRow>
        );
        // Subcategory items - only render if not collapsed
        if (!isCollapsed) {
          rows.push(...renderPageRows(item.items, categoryKey));
        }
      } else {
        // Page item
        rows.push(
          <TableRow
            key={item.key}
            className="hover:bg-indigo-50/20 dark:hover:bg-indigo-950/10 transition-colors"
          >
            <TableCell className="font-medium pl-12 min-w-[280px] sticky left-0 bg-background/95 backdrop-blur">
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                <span className="text-sm">{item.label}</span>
              </div>
            </TableCell>
            {roles.map((role) => (
              <TableCell key={`${item.key}-${role.id}`} className="text-center">
                <div className="flex items-center justify-center">
                  <Checkbox
                    checked={permissions[item.key]?.[role.id] || false}
                    onCheckedChange={() =>
                      requestTogglePermission(
                        item.key,
                        role.id,
                        permissions[item.key]?.[role.id]
                      )
                    }
                    className="data-[state=checked]:bg-gradient-to-br data-[state=checked]:from-indigo-500 data-[state=checked]:to-purple-500 data-[state=checked]:border-0 transition-all hover:scale-110 border-2  border-black"
                  />
                </div>
              </TableCell>
            ))}
          </TableRow>
        );
      }
    });
    return rows;
  };

  return (
    <>
      <div className="flex flex-col gap-6 p-6 h-full">
        {/* Header with Gradient Background */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950/30 dark:via-purple-950/30 dark:to-pink-950/30 border border-indigo-100/50 dark:border-indigo-900/50 p-6">
          <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.5))] dark:bg-grid-black/5" />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                  Role Access Management
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Configure granular page-level permissions for each role
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Dialog
                open={isCreateRoleOpen}
                onOpenChange={setIsCreateRoleOpen}
              >
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    className="bg-black hover:bg-black/90 text-white"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create Role
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                        <Shield className="h-4 w-4 text-white" />
                      </div>
                      Create New Role
                    </DialogTitle>
                    <DialogDescription>
                      Add a new role to the permission matrix. You can configure
                      permissions after creation.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label
                        htmlFor="role-name"
                        className="text-sm font-medium"
                      >
                        Role Name
                      </Label>
                      <Input
                        id="role-name"
                        placeholder="e.g., Account Manager, Sales Manager"
                        value={newRoleName}
                        onChange={(e) => setNewRoleName(e.target.value)}
                        className="focus-visible:ring-indigo-500"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsCreateRoleOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreateRole}
                      className="bg-black hover:bg-black/90 text-white"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Create Role
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              {/* <Button size="sm" className="bg-black hover:bg-black/90 text-white">
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button> */}
            </div>
          </div>
        </div>

        {/* Permission Matrix Table with Enhanced Design */}
        <Card className="flex-1 overflow-hidden border-indigo-100/50 dark:border-indigo-900/50 shadow-xl">
          <CardContent className="p-0 overflow-auto max-h-[calc(100vh-300px)]">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <TableRow className="border-b-2">
                  <TableHead className="min-w-[280px] font-semibold sticky left-0 bg-background/95 backdrop-blur z-20">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500" />
                      Page / Section
                    </div>
                  </TableHead>
                  {roles.map((role) => (
                    <TableHead
                      key={role.id}
                      className="text-center min-w-[140px] font-semibold"
                    >
                      <div className="flex items-center justify-center gap-2 px-2">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border border-indigo-200/50 dark:border-indigo-800/50">
                          <Shield className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                          <span className="text-sm font-semibold">
                            {role.name}
                          </span>
                        </div>
                        {/* <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 hover:bg-red-100 dark:hover:bg-red-900/50"
                        onClick={() => handleDeleteRole(role.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
                      </Button> */}
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagesData.map((section) => (
                  <React.Fragment key={section.category_id}>
                    <TableRow className="bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-900 dark:to-slate-950 hover:from-slate-150 hover:to-slate-100 dark:hover:from-slate-850 dark:hover:to-slate-900">
                      <TableCell
                        colSpan={roles.length + 1}
                        className="font-bold py-3 text-sm sticky left-0 bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-900 dark:to-slate-950"
                      >
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                          {section.category}
                        </div>
                      </TableCell>
                    </TableRow>
                    {renderPageRows(section.items || [])}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              You are changing access permissions for this role.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={cancelPermissionChange}>
              Cancel
            </Button>
            <Button
              className="bg-black text-white hover:bg-black/90"
              onClick={confirmPermissionChange}
            >
              Yes, Change
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
