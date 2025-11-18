"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Clock, LogOut, Lock, User as UserIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

/* -------------------------------------------- */
/* TYPE DEFINITIONS */
/* -------------------------------------------- */
interface LoginHistory {
  id: string;
  timestamp: string;
  ipAddress: string;
  device: string;
  browser: string;
  status: "success" | "failed";
  location: string;
}

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
}

/* -------------------------------------------- */
/* PAGE COMPONENT */
/* -------------------------------------------- */
export default function ProfilePage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState("general");
  const [loginHistory, setLoginHistory] = useState<LoginHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  
  const [profileData, setProfileData] = useState<UserProfile>({
    firstName: "User",
    lastName: "",
    email: "user@example.com",
    phone: "+1 (555) 123-4567",
    company: "Digitar Media",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // ✅ Update profile data when session is available
  useEffect(() => {
    if (session?.user) {
      const fullName = session.user.fullname || session.user.name || "";
      const nameParts = fullName.split(" ");
      
      setProfileData({
        firstName: nameParts[0] || "User",
        lastName: nameParts.slice(1).join(" ") || "",
        email: session.user.email || "user@example.com",
        phone: "+1 (555) 123-4567",
        company: "Digitar Media",
      });
    }
  }, [session]);

  // ✅ Fetch login history on load
  useEffect(() => {
    const fetchLoginHistory = async () => {
      try {
        const response = await fetch("/api/user/login-history");
        const data = await response.json();
        setLoginHistory(data);
      } catch (error) {
        console.error("Failed to fetch login history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLoginHistory();
  }, []);

  const handleProfileChange = (key: keyof UserProfile, value: string) => {
    setProfileData((prev) => ({ ...prev, [key]: value }));
  };

  const handlePasswordChange = (key: keyof typeof passwordData, value: string) => {
    setPasswordData((prev) => ({ ...prev, [key]: value }));
  };

  const filteredLoginHistory = loginHistory.filter((login) => {
    if (filterStatus === "all") return true;
    return login.status === filterStatus;
  });

  const handleSaveProfile = () => {
    console.log("Saving profile:", profileData);
    // Add your API call here
  };

  const handleChangePassword = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    console.log("Changing password");
    // Add your API call here
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  return (
    <div className="flex flex-1 flex-col gap-6">
      {/* Heading */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-foreground">Profile Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your account information and security settings
        </p>
      </div>

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3 bg-background border border-border/30">
          <TabsTrigger value="general" className="gap-2">
            <UserIcon className="w-4 h-4" />
            <span className="hidden sm:inline">General</span>
          </TabsTrigger>
          <TabsTrigger value="password" className="gap-2">
            <Lock className="w-4 h-4" />
            <span className="hidden sm:inline">Password</span>
          </TabsTrigger>
          <TabsTrigger value="activity" className="gap-2">
            <Clock className="w-4 h-4" />
            <span className="hidden sm:inline">Activity</span>
          </TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general" className="space-y-6">
          <div className="rounded-xl bg-white dark:bg-black backdrop-blur-sm border border-border/20 dark:border-border/10 shadow-sm p-8 space-y-8">
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-2">
                Personal Information
              </h2>
              <p className="text-sm text-muted-foreground">
                Update your profile details
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <MaterialInput
                label="First Name"
                value={profileData.firstName}
                onChange={(v) => handleProfileChange("firstName", v)}
              />
              <MaterialInput
                label="Last Name"
                value={profileData.lastName}
                onChange={(v) => handleProfileChange("lastName", v)}
              />
              <MaterialInput
                label="Email Address"
                type="email"
                value={profileData.email}
                onChange={(v) => handleProfileChange("email", v)}
              />
              <MaterialInput
                label="Phone Number"
                value={profileData.phone}
                onChange={(v) => handleProfileChange("phone", v)}
              />
              <MaterialInput
                label="Company"
                value={profileData.company}
                onChange={(v) => handleProfileChange("company", v)}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border/30">
              <Button variant="outline" className="text-foreground border-border">
                Cancel
              </Button>
              <Button
                onClick={handleSaveProfile}
                className="bg-linear-to-r from-blue-500 to-purple-500 text-white shadow-sm hover:shadow-md"
              >
                Save Changes
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Password Tab */}
        <TabsContent value="password" className="space-y-6">
          <div className="rounded-xl bg-white dark:bg-black backdrop-blur-sm border border-border/20 dark:border-border/10 shadow-sm p-8 space-y-8">
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-2">
                Change Password
              </h2>
              <p className="text-sm text-muted-foreground">
                Keep your account secure by using a strong password
              </p>
            </div>

            <div className="max-w-md space-y-6">
              <MaterialInput
                label="Current Password"
                type="password"
                value={passwordData.currentPassword}
                onChange={(v) => handlePasswordChange("currentPassword", v)}
              />
              <MaterialInput
                label="New Password"
                type="password"
                value={passwordData.newPassword}
                onChange={(v) => handlePasswordChange("newPassword", v)}
              />
              <MaterialInput
                label="Confirm New Password"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(v) => handlePasswordChange("confirmPassword", v)}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border/30">
              <Button variant="outline" className="text-foreground border-border">
                Cancel
              </Button>
              <Button
                onClick={handleChangePassword}
                className="bg-linear-to-r from-blue-500 to-purple-500 text-white shadow-sm hover:shadow-md"
              >
                Update Password
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-6">
          <div className="rounded-xl bg-white dark:bg-black backdrop-blur-sm border border-border/20 dark:border-border/10 shadow-sm p-8 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-2">
                  Login History
                </h2>
                <p className="text-sm text-muted-foreground">
                  Your recent login activity across all devices
                </p>
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:w-48 bg-background border-border/50">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Activity</SelectItem>
                  <SelectItem value="success">Successful Logins</SelectItem>
                  <SelectItem value="failed">Failed Attempts</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Login History Table */}
            <div className="overflow-x-auto">
              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <p className="text-muted-foreground">Loading login history...</p>
                </div>
              ) : filteredLoginHistory.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/30 hover:bg-transparent">
                      <TableHead className="text-foreground/80">Date & Time</TableHead>
                      <TableHead className="text-foreground/80">IP Address</TableHead>
                      <TableHead className="text-foreground/80">Device</TableHead>
                      <TableHead className="text-foreground/80">Browser</TableHead>
                      <TableHead className="text-foreground/80">Location</TableHead>
                      <TableHead className="text-foreground/80">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLoginHistory.map((login) => (
                      <TableRow
                        key={login.id}
                        className="border-border/30 hover:bg-muted/30 transition-colors"
                      >
                        <TableCell className="text-sm text-foreground">
                          {new Date(login.timestamp).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-sm text-foreground font-mono">
                          {login.ipAddress}
                        </TableCell>
                        <TableCell className="text-sm text-foreground">
                          {login.device}
                        </TableCell>
                        <TableCell className="text-sm text-foreground">
                          {login.browser}
                        </TableCell>
                        <TableCell className="text-sm text-foreground">
                          {login.location}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={login.status === "success" ? "default" : "destructive"}
                            className={`${
                              login.status === "success"
                                ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                                : "bg-red-500/20 text-red-700 dark:text-red-300"
                            }`}
                          >
                            {login.status === "success" ? "Success" : "Failed"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex justify-center items-center h-32">
                  <p className="text-muted-foreground">No login history found</p>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-border/30 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Showing {filteredLoginHistory.length} of {loginHistory.length} entries
              </p>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 text-foreground border-border hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600"
              >
                <LogOut className="w-4 h-4" />
                Sign Out All Devices
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
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
      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-linear-to-r from-blue-500 to-purple-500 transition-all duration-300 peer-focus:w-full" />
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
