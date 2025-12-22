"use client";
import { useEffect, useState } from "react";
import {
  Users,
  UserPlus,
  Mail,
  Shield,
  Trash2,
  Edit,
  CheckCircle2,
  XCircle,
  TrendingUp,
  UserCheck,
  UserX,
  UserCog,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface TeamMember {
  id: string;
  fullName: string;
  email: string;
  status: "active" | "inactive";
  role_id: number | null;
  role: string;
  avatar: string;
  joinedDate: string;
}

interface Role {
  id: number;
  name: string;
  key?: string;
}
const [roles, setRoles] = useState<Role[]>([]);

// Mock data for team growth chart (last 6 months)
const TEAM_GROWTH_DATA = [
  { month: "Jun", members: 4 },
  { month: "Jul", members: 5 },
  { month: "Aug", members: 7 },
  { month: "Sep", members: 8 },
  { month: "Oct", members: 10 },
  { month: "Nov", members: 12 },
];

// Activity types and timeline
interface Activity {
  id: string;
  user: string;
  avatar: string;
  action: "joined" | "deactivated" | "activated" | "role_changed";
  details?: string;
  timestamp: string;
}

const RECENT_ACTIVITIES: Activity[] = [
  {
    id: "1",
    user: "Dev Malhotra",
    avatar: "DM",
    action: "joined",
    details: "as Associate",
    timestamp: "2024-11-01",
  },
  {
    id: "2",
    user: "Amit Desai",
    avatar: "AD",
    action: "joined",
    details: "as Associate",
    timestamp: "2024-10-15",
  },
  {
    id: "3",
    user: "Neha Gupta",
    avatar: "NG",
    action: "deactivated",
    timestamp: "2024-09-20",
  },
  {
    id: "4",
    user: "Sameer Patel",
    avatar: "SP",
    action: "joined",
    details: "as Associate",
    timestamp: "2024-09-08",
  },
  {
    id: "5",
    user: "Ananya Singh",
    avatar: "AS",
    action: "role_changed",
    details: "to Manager",
    timestamp: "2024-08-15",
  },
];

// Gradient Generator for Avatars (Vercel-style)
const generateGradient = (text: string) => {
  const gradients = [
    "from-pink-500 via-purple-500 to-indigo-500",
    "from-cyan-500 via-blue-500 to-purple-500",
    "from-green-500 via-emerald-500 to-teal-500",
    "from-orange-500 via-red-500 to-pink-500",
    "from-yellow-500 via-orange-500 to-red-500",
    "from-indigo-500 via-purple-500 to-pink-500",
  ];
  const index = text.charCodeAt(0) % gradients.length;
  return gradients[index];
};

// Format activity timestamp
const formatActivityTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
};

// Get action icon and text
const getActivityDisplay = (activity: Activity) => {
  switch (activity.action) {
    case "joined":
      return {
        icon: UserCheck,
        text: `joined ${activity.details || ""}`,
        color: "text-green-600",
      };
    case "deactivated":
      return {
        icon: UserX,
        text: "was deactivated",
        color: "text-red-600",
      };
    case "activated":
      return {
        icon: UserCheck,
        text: "was activated",
        color: "text-green-600",
      };
    case "role_changed":
      return {
        icon: UserCog,
        text: `role changed ${activity.details || ""}`,
        color: "text-blue-600",
      };
  }
};

export default function AdminTeamManagementPage() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [membersError, setMembersError] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [editDialog, setEditDialog] = useState<{
    open: boolean;
    member: TeamMember | null;
  }>({ open: false, member: null });
  const [statusChangeDialog, setStatusChangeDialog] = useState<{
    open: boolean;
    member: TeamMember | null;
    newStatus: "active" | "inactive";
  }>({ open: false, member: null, newStatus: "active" });
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    member: TeamMember | null;
  }>({ open: false, member: null });

  const [newMember, setNewMember] = useState({
    fullName: "",
    email: "",
    role_id: undefined as number | undefined,
  });

  const [editMember, setEditMember] = useState<{
    fullName: string;
    email: string;
    role_id?: number;
  }>({
    fullName: "",
    email: "",
    role_id: undefined,
  });

  const [rolesLoading, setRolesLoading] = useState(false);

  const isMainAdmin = (role_id: number | null) =>
    roles.find((r) => r.id === role_id)?.key === "main-admin";

  const getRoleName = (role_id: number | null) =>
    roles.find((r) => r.id === role_id)?.name ?? "System Admin";

  const totalMembers = teamMembers.length;
  const activeMembers = teamMembers.filter((m) => m.status === "active").length;
  const managers = teamMembers.filter(
    (m) => getRoleName(m.role_id) === "main-admin"
  ).length;

  useEffect(() => {
    const controller = new AbortController();

    const fetchInitialData = async () => {
      setMembersLoading(true);
      setRolesLoading(true);
      setMembersError(null);

      try {
        const [membersRes, rolesRes] = await Promise.all([
          fetch("/api/manage-team/members", {
            method: "GET",
            cache: "no-store",
            signal: controller.signal,
          }),
          fetch("/api/roles/create", {
            method: "GET",
            signal: controller.signal,
          }),
        ]);

        if (!membersRes.ok) {
          throw new Error("Failed to fetch team members");
        }

        if (!rolesRes.ok) {
          throw new Error("Failed to fetch roles");
        }

        const membersJson = await membersRes.json();
        const rolesJson = await rolesRes.json();

        if (!membersJson.success) {
          throw new Error("Members API error");
        }

        const normalizedMembers: TeamMember[] = membersJson.data.map(
          (m: any) => ({
            id: m.id,
            fullName: m.full_name,
            email: m.email,
            status: m.status,
            role_id: m.role_id,
            role: getRoleName(m.role_id),
            avatar: m.full_name
              .split(" ")
              .map((n: string) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2),
            joinedDate: m.joined_date.split("T")[0],
          })
        );

        setTeamMembers(normalizedMembers);

        const normalizedRoles: Role[] = rolesJson.data.map((role: any) => ({
          id: role.id,
          name: role.name,
          key: role["unique-key"],
        }));

        setRoles(normalizedRoles);
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.error(err);
          setMembersError("Unable to load team data");
        }
      } finally {
        setMembersLoading(false);
        setRolesLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const handleAddMember = async () => {
    if (!newMember.fullName || !newMember.email || !newMember.role_id) return;

    setSaving(true);

    try {
      const res = await fetch("/api/manage-team/users/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          full_name: newMember.fullName,
          email: newMember.email,
          role_id: newMember.role_id,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to add member");
      }

      const json = await res.json();
      if (!json.success) {
        throw new Error(json.message || "API error");
      }

      const m = json.data;

      // ✅ Normalize API response to TeamMember
      const member: TeamMember = {
        id: m.id,
        fullName: m.full_name,
        email: m.email,
        status: m.status,
        role_id: m.role_id,
        role: getRoleName(m.role_id),
        avatar: m.full_name
          .split(" ")
          .map((n: string) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2),
        joinedDate: m.joined_date.split("T")[0],
      };

      setTeamMembers((prev) => [...prev, member]);
      setNewMember({ fullName: "", email: "", role_id: undefined });
      setIsAddDialogOpen(false);

      toast.success("Team member added successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to add member");
    } finally {
      setSaving(false);
    }
  };

  const handleStatusToggle = (member: TeamMember) => {
    if (isMainAdmin(member.role_id)) return;
    const newStatus = member.status === "active" ? "inactive" : "active";
    setStatusChangeDialog({ open: true, member, newStatus });
  };

  const confirmStatusChange = async () => {
    if (!statusChangeDialog.member) return;

    const memberId = statusChangeDialog.member.id;
    const newStatus = statusChangeDialog.newStatus;
    setSaving(true);

    try {
      const res = await fetch(`/api/manage-team/members`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: memberId,
          status: newStatus,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to update member status");
      }

      const json = await res.json();
      if (!json.success) {
        throw new Error(json.message || "API error");
      }

      setTeamMembers((prev) =>
        prev.map((m) => (m.id === memberId ? { ...m, status: newStatus } : m))
      );

      toast.success(
        `Member ${
          newStatus === "active" ? "activated" : "deactivated"
        } successfully`
      );
      setStatusChangeDialog({ open: false, member: null, newStatus: "active" });
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to update status. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleEditMember = (member: TeamMember) => {
    if (isMainAdmin(member.role_id)) return;
    setEditMember({
      fullName: member.fullName,
      email: member.email,
      role_id: member.role_id ? member.role_id : undefined,
    });

    setEditDialog({
      open: true,
      member,
    });
  };

  const confirmEdit = async () => {
    if (!editDialog.member) return;

    const userId = editDialog.member.id;
    setSaving(true);

    try {
      const res = await fetch(`/api/manage-team/members`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          full_name: editMember.fullName,
          email: editMember.email,
          role_id: editMember.role_id,
          id: userId,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to update member");
      }

      const json = await res.json();
      if (!json.success) {
        throw new Error("API error");
      }
      setSaving(false);
      setTeamMembers((prev) =>
        prev.map((m) =>
          m.id === userId
            ? {
                ...m,
                fullName: json.data.full_name,
                email: json.data.email,
                role_id: json.data.role_id,
                avatar: json.data.full_name
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2),
              }
            : m
        )
      );

      setEditDialog({ open: false, member: null });
    } catch (err) {
      setSaving(false);
      toast.error("Failed to update member. Please try again.");
    }
  };

  const handleDeleteMember = (member: TeamMember) => {
    if (isMainAdmin(member.role_id)) return;
    setDeleteDialog({ open: true, member });
  };

  const confirmDelete = async () => {
    if (!deleteDialog.member) return;

    const memberId = deleteDialog.member.id;
    setSaving(true);

    try {
      const res = await fetch(`/api/manage-team/members`, {
        method: "DELETE",
        body: JSON.stringify({ id: memberId }),
      });

      if (!res.ok) {
        throw new Error("Failed to delete member");
      }

      const json = await res.json();
      if (!json.success) {
        throw new Error(json.message || "API error");
      }

      // Update local state
      setTeamMembers((prev) => prev.filter((m) => m.id !== memberId));
      toast.success("Member deleted successfully");
      setDeleteDialog({ open: false, member: null });
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to delete member. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // const handleRoleChange = (memberId: string, newRole: string) => {
  //   setTeamMembers(
  //     teamMembers.map((m) => (m.id === memberId ? { ...m, role: newRole } : m))
  //   );
  // };

  return (
    <div className="flex flex-1 flex-col h-[80vh] p-6 gap-4">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Team Management</h1>
          <p className="text-muted-foreground text-xs mt-1">
            Manage your team members and their access
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 shadow-sm">
              <UserPlus className="h-4 w-4" />
              Add Team Member
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Team Member</DialogTitle>
              <DialogDescription>
                Add a new member to your team. They'll receive an invitation
                email.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  placeholder="John Doe"
                  value={newMember.fullName}
                  onChange={(e) =>
                    setNewMember({ ...newMember, fullName: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@company.com"
                  value={newMember.email}
                  onChange={(e) =>
                    setNewMember({ ...newMember, email: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-role">Role</Label>

                <Select
                  value={newMember.role_id?.toString()}
                  onValueChange={(value) =>
                    setNewMember({ ...newMember, role_id: Number(value) })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>

                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id.toString()}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddMember}
                disabled={
                  saving ||
                  !newMember.fullName ||
                  !newMember.email ||
                  !newMember.role_id
                }
              >
                {saving ? "Adding..." : "Add Member"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* 2 Column Layout - Full Height */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 min-h-0 overflow-hidden">
        {/* Left Column - No Scroll, Fixed Content */}
        <div className="lg:col-span-1 flex flex-col gap-3">
          {/* Stats Cards - Compact 3 in 1 Row */}
          <div className="grid grid-cols-3 gap-2">
            {/* Total Members */}
            <div className="relative overflow-hidden rounded-xl p-3 bg-linear-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-100/50 dark:border-blue-900/50 group hover:shadow-md transition-all">
              <div className="flex flex-col gap-1.5">
                <div className="h-7 w-7 rounded-lg bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Users className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-xl font-bold text-blue-900 dark:text-blue-100 tabular-nums">
                  {totalMembers}
                </div>
                <p className="text-[10px] font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                  Total
                </p>
              </div>
            </div>

            {/* Active Members */}
            <div className="relative overflow-hidden rounded-xl p-3 bg-linear-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-100/50 dark:border-green-900/50 group hover:shadow-md transition-all">
              <div className="flex flex-col gap-1.5">
                <div className="h-7 w-7 rounded-lg bg-green-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                </div>
                <div className="text-xl font-bold text-green-900 dark:text-green-100 tabular-nums">
                  {activeMembers}
                </div>
                <p className="text-[10px] font-medium text-green-600 dark:text-green-400 uppercase tracking-wide">
                  Active
                </p>
              </div>
            </div>

            {/* Managers */}
            <div className="relative overflow-hidden rounded-xl p-3 bg-linear-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border border-purple-100/50 dark:border-purple-900/50 group hover:shadow-md transition-all">
              <div className="flex flex-col gap-1.5">
                <div className="h-7 w-7 rounded-lg bg-purple-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Shield className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="text-xl font-bold text-purple-900 dark:text-purple-100 tabular-nums">
                  {managers}
                </div>
                <p className="text-[10px] font-medium text-purple-600 dark:text-purple-400 uppercase tracking-wide">
                  Managers
                </p>
              </div>
            </div>
          </div>

          {/* Team Growth Chart */}
          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="pb-2 px-4 pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold">
                    Team Growth
                  </CardTitle>
                  <CardDescription className="text-[10px] mt-0.5">
                    Last 6 months
                  </CardDescription>
                </div>
                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-50 dark:bg-green-950/30">
                  <TrendingUp className="h-3 w-3 text-green-600" />
                  <span className="text-[10px] font-bold text-green-600">
                    +200%
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-2 pb-2">
              <ResponsiveContainer width="100%" height={160}>
                <AreaChart
                  data={TEAM_GROWTH_DATA}
                  margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="colorMembers"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                      <stop
                        offset="95%"
                        stopColor="#3b82f6"
                        stopOpacity={0.05}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e5e7eb"
                    strokeOpacity={0.3}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="month"
                    stroke="#9ca3af"
                    style={{ fontSize: "10px" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#9ca3af"
                    style={{ fontSize: "10px" }}
                    tickLine={false}
                    axisLine={false}
                    width={30}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.98)",
                      border: "none",
                      borderRadius: "12px",
                      fontSize: "11px",
                      padding: "8px 12px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                    labelStyle={{ fontWeight: 600, marginBottom: "4px" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="members"
                    stroke="#3b82f6"
                    strokeWidth={2.5}
                    fill="url(#colorMembers)"
                    dot={{
                      r: 3,
                      fill: "#3b82f6",
                      strokeWidth: 2,
                      stroke: "#fff",
                    }}
                    activeDot={{
                      r: 5,
                      fill: "#3b82f6",
                      strokeWidth: 2,
                      stroke: "#fff",
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Activity Timeline */}
          <Card className="border-none shadow-sm flex-1 min-h-0">
            <CardHeader className="pb-2 px-4 pt-4">
              <CardTitle className="text-sm font-bold">
                Activity Timeline
              </CardTitle>
              <CardDescription className="text-[10px] mt-0.5">
                Recent team changes
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="space-y-2.5">
                {RECENT_ACTIVITIES.map((activity, idx) => {
                  const display = getActivityDisplay(activity);
                  const Icon = display.icon;

                  return (
                    <div
                      key={activity.id}
                      className="flex items-start gap-2.5 group"
                    >
                      <div
                        className={`h-7 w-7 rounded-lg bg-linear-to-br ${generateGradient(
                          activity.avatar
                        )} flex items-center justify-center text-white text-[10px] font-bold shrink-0 shadow-sm group-hover:scale-110 transition-transform`}
                      >
                        {activity.avatar}
                      </div>
                      <div className="flex-1 min-w-0 pt-0.5">
                        <p className="text-[11px] leading-relaxed">
                          <span className="font-semibold text-foreground">
                            {activity.user}
                          </span>{" "}
                          <span className="text-muted-foreground">
                            {display.text}
                          </span>
                        </p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Icon className={`h-2.5 w-2.5 ${display.color}`} />
                          <p className="text-[10px] text-muted-foreground">
                            {formatActivityTime(activity.timestamp)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Team Members List */}
        <div className="lg:col-span-2 min-h-0">
          <Card className="border-none shadow-sm h-full flex flex-col overflow-hidden">
            <CardHeader className="shrink-0 pb-2 px-4 pt-4 border-b border-border/40">
              <CardTitle className="text-sm font-bold">Team Members</CardTitle>
              <CardDescription className="text-[10px] mt-0.5">
                View and manage all members of your team
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto px-4 py-3">
              <div className="space-y-2 pr-1">
                {teamMembers.map((member) => (
                  <div
                    key={member.id}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl border bg-card/50 hover:bg-accent/5 hover:shadow-sm transition-all group ${
                      member.role_id === 1
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-9 w-9 rounded-lg bg-linear-to-br ${generateGradient(
                          member.avatar
                        )} flex items-center justify-center text-white font-bold text-[10px] shadow-sm shrink-0 group-hover:scale-105 transition-transform`}
                      >
                        {member.avatar}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="font-semibold text-xs truncate">
                            {member.fullName}
                          </p>
                          <Badge
                            variant={
                              member.role_id === 1 ? "default" : "secondary"
                            }
                            className="text-[9px] h-4 px-1.5 shrink-0"
                          >
                            {getRoleName(member.role_id)}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-0.5">
                          <Mail className="h-2.5 w-2.5 shrink-0" />
                          <p className="truncate">{member.email}</p>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <Switch
                        checked={member.status === "active"}
                        disabled={isMainAdmin(member.role_id) || saving}
                        onCheckedChange={() => handleStatusToggle(member)}
                      />

                      <div className="flex gap-0.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={member.role_id === 1}
                          onClick={() => handleEditMember(member)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={member.role_id === 1}
                          onClick={() => handleDeleteMember(member)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Member Dialog */}
      <Dialog
        open={editDialog.open}
        onOpenChange={(open) => setEditDialog({ ...editDialog, open })}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Team Member</DialogTitle>
            <DialogDescription>
              Update the member's information below.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Full Name */}
            <div className="grid gap-2">
              <Label htmlFor="edit-fullName">Full Name</Label>
              <Input
                id="edit-fullName"
                placeholder="John Doe"
                value={editMember.fullName}
                onChange={(e) =>
                  setEditMember({ ...editMember, fullName: e.target.value })
                }
              />
            </div>

            {/* Email */}
            <div className="grid gap-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                placeholder="john@company.com"
                value={editMember.email}
                onChange={(e) =>
                  setEditMember({ ...editMember, email: e.target.value })
                }
              />
            </div>

            {/* Role (Dynamic from API) */}
            <div className="grid gap-2">
              <Label htmlFor="edit-role">Role</Label>

              <Select
                value={editMember.role_id?.toString()}
                onValueChange={(value) =>
                  setEditMember({ ...editMember, role_id: Number(value) })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>

                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id.toString()}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialog({ open: false, member: null })}
            >
              Cancel
            </Button>

            <Button
              className="cursor-pointer"
              onClick={confirmEdit}
              disabled={
                !editMember.fullName || !editMember.email || !editMember.role_id
              }
            >
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Status Change Confirmation Dialog */}
      <AlertDialog
        open={statusChangeDialog.open}
        onOpenChange={(open) =>
          setStatusChangeDialog({ ...statusChangeDialog, open })
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Status Change</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to{" "}
              {statusChangeDialog.newStatus === "active" ? "enable" : "disable"}{" "}
              login access for{" "}
              <span className="font-semibold">
                {statusChangeDialog.member?.fullName}
              </span>
              ?{" "}
              {statusChangeDialog.newStatus === "inactive" &&
                "They will not be able to access the system."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmStatusChange}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Team Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove{" "}
              <span className="font-semibold">
                {deleteDialog.member?.fullName}
              </span>{" "}
              from your team? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={saving}
            >
              {saving ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
