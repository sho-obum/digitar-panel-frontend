"use client";

import { useState, useMemo } from "react";
import { format, startOfMonth, endOfMonth, subMonths, subDays } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/calendar-with-presets";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import EditCampaignDialog from "@/components/edit-campaign-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
  RefreshCw,
  Copy,
  ExternalLink,
  Building2,
  Zap,
  Check,
  X,
  AlertCircle,
  Send,
  Mail,
  MailOpen,
  MailX,
  UserCheck,
  TrendingUp,
  Users,
  CalendarDays,
  Globe,
  Linkedin,
} from "lucide-react";
import { FiEdit2, FiTrash2, FiEye, FiBarChart2 } from "react-icons/fi";
import { MdOutlineStorefront } from "react-icons/md";
import { Toggle } from "@/components/ui/toggle";
import { motion } from "framer-motion";

type Campaign = {
  id: string;
  number: number;
  appName: string;
  companyName: string;
  bundleId: string;
  category: "Finance" | "Tech" | "Healthcare" | "Retail" | "Other";
  directUrl: string;
  addedAt: Date;
  sendPermission: boolean;
  status: "Active" | "Paused" | "Completed" | "Draft";
  approachStage: "No Attempt" | "No Follow-up" | "Follow-up" | "Completed";
};

type SortConfig = {
  key: keyof Campaign | null;
  direction: "asc" | "desc";
};

type CampaignLog = {
  id: string;
  sNo: number;
  person: string;
  mobile: string;
  designation: string;
  email: string;
  country: string;
  linkedin: string;
  approachability: "Approachable" | "Cautious" | "Not Approachable";
  emailStatusEnabled: boolean;
  message: string;
  emailStatus: "Success" | "Failed" | "Pending" | "Bounced";
  sentTime: Date;
  tab: string; // Tab 1, Tab 2, Tab 3, Tab 4
};

// Mock data 
const generateMockCampaigns = (): Campaign[] => {
  const companies = [
    { name: "Swiggy", app: "Swiggy - Food Delivery" },
    { name: "Uber", app: "Uber - Rides & Food" },
    { name: "PayPal", app: "PayPal - Money Transfer" },
    { name: "Airbnb", app: "Airbnb - Stays & Adventures" },
    { name: "Netflix", app: "Netflix - Movies & Shows" },
    { name: "Spotify", app: "Spotify - Music Streaming" },
    { name: "LinkedIn", app: "LinkedIn - Jobs & Networking" },
    { name: "Twitter", app: "X - Social Media" },
  ];

  const categories: Campaign["category"][] = [
    "Finance",
    "Tech",
    "Healthcare",
    "Retail",
    "Other",
  ];
  const statuses: Campaign["status"][] = [
    "Active",
    "Paused",
    "Completed",
    "Draft",
  ];
  const stages: Campaign["approachStage"][] = [
    "No Attempt",
    "No Follow-up",
    "Follow-up",
    "Completed",
  ];

  return Array.from({ length: 24 }, (_, i) => {
    const company = companies[i % companies.length];
    const daysAgo = Math.floor(Math.random() * 90);
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);

    return {
      id: String(i + 1).padStart(3, "0"),
      number: i + 1,
      appName: company.app,
      companyName: company.name,
      bundleId: `com.${company.name.toLowerCase()}.app`,
      category: categories[Math.floor(Math.random() * categories.length)],
      directUrl: `https://play.google.com/store/apps/details?id=com.${company.name.toLowerCase()}.app`,
      addedAt: date,
      sendPermission: Math.random() > 0.3,
      // Force first 3 campaigns to be Draft for testing
      status: i < 3 ? "Draft" : statuses[Math.floor(Math.random() * statuses.length)],
      approachStage: stages[Math.floor(Math.random() * stages.length)],
    };
  });
};

// Mock data generator for campaign logs
const generateMockCampaignLogs = (): CampaignLog[] => {
  const names = [
    "John Smith", "Sarah Johnson", "Michael Chen", "Emily Davis",
    "David Wilson", "Lisa Anderson", "James Taylor", "Maria Garcia",
    "Robert Brown", "Jennifer Lee", "William Martinez", "Jessica Rodriguez",
    "Christopher Lewis", "Amanda Walker", "Daniel Hall", "Ashley Allen",
    "Matthew Young", "Stephanie King", "Andrew Wright", "Michelle Lopez"
  ];
  
  const designations = [
    "CEO", "CTO", "CFO", "VP Marketing", "Director of Sales",
    "Product Manager", "Head of Growth", "Business Development Manager",
    "Marketing Director", "Operations Manager"
  ];
  
  const countries = [
    "United States", "United Kingdom", "Canada", "Australia",
    "Germany", "France", "India", "Singapore"
  ];
  
  const tabs = ["Tab 1", "Tab 2", "Tab 3", "Tab 4"];
  const approachability: CampaignLog["approachability"][] = ["Approachable", "Cautious", "Not Approachable"];
  const emailStatuses: CampaignLog["emailStatus"][] = ["Success", "Failed", "Pending", "Bounced"];
  
  const messages = [
    "Hi, I came across your app and would love to discuss a partnership opportunity...",
    "Hello! We're reaching out regarding potential collaboration on marketing initiatives...",
    "Greetings! I'd like to schedule a call to discuss our affiliate program...",
    "Hi there! Your app caught our attention and we'd love to explore ways to work together...",
    "Hello, we have an exciting growth opportunity that might interest you..."
  ];

  return Array.from({ length: 80 }, (_, i) => {
    const hoursAgo = Math.floor(Math.random() * 72);
    const sentDate = new Date();
    sentDate.setHours(sentDate.getHours() - hoursAgo);
    
    const name = names[i % names.length];
    const emailName = name.toLowerCase().replace(" ", ".");
    const domain = i % 3 === 0 ? "gmail.com" : i % 3 === 1 ? "company.com" : "business.org";

    return {
      id: String(i + 1).padStart(3, "0"),
      sNo: i + 1,
      person: name,
      mobile: `+1-${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 9000 + 1000)}`,
      designation: designations[Math.floor(Math.random() * designations.length)],
      email: `${emailName}@${domain}`,
      country: countries[Math.floor(Math.random() * countries.length)],
      linkedin: `https://linkedin.com/in/${emailName}`,
      approachability: approachability[Math.floor(Math.random() * approachability.length)],
      emailStatusEnabled: Math.random() > 0.2,
      message: messages[Math.floor(Math.random() * messages.length)],
      emailStatus: emailStatuses[Math.floor(Math.random() * emailStatuses.length)],
      sentTime: sentDate,
      tab: tabs[Math.floor(Math.random() * tabs.length)]
    };
  });
};

const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    Finance: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
    Tech: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
    Healthcare: "bg-green-500/10 text-green-700 dark:text-green-400",
    Retail: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
    Other: "bg-gray-500/10 text-gray-700 dark:text-gray-400",
  };
  return colors[category] || colors.Other;
};

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    Active: "bg-green-500/10 text-green-700 dark:text-green-400",
    Paused: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
    Completed: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
    Draft: "bg-gray-500/10 text-gray-700 dark:text-gray-400",
  };
  return colors[status] || colors.Draft;
};

const getStageColor = (stage: string) => {
  const colors: Record<string, string> = {
    "No Attempt": "bg-red-500/10 text-red-700 dark:text-red-400",
    "No Follow-up": "bg-orange-500/10 text-orange-700 dark:text-orange-400",
    "Follow-up": "bg-blue-500/10 text-blue-700 dark:text-blue-400",
    Completed: "bg-green-500/10 text-green-700 dark:text-green-400",
  };
  return colors[stage] || colors["No Attempt"];
};

const getApproachabilityColor = (approachability: string) => {
  const colors: Record<string, string> = {
    Approachable: "bg-green-500/10 text-green-700 dark:text-green-400",
    Cautious: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
    "Not Approachable": "bg-red-500/10 text-red-700 dark:text-red-400",
  };
  return colors[approachability] || colors["Not Approachable"];
};

const getEmailStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    Success: "bg-green-500/10 text-green-700 dark:text-green-400",
    Failed: "bg-red-500/10 text-red-700 dark:text-red-400",
    Pending: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
    Bounced: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
  };
  return colors[status] || colors.Pending;
};

export default function AllCampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(
    generateMockCampaigns()
  );
  
  // Filter input states (not yet applied)
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedStage, setSelectedStage] = useState<string>("");
  const [dateRange, setDateRange] = useState(() => {
    const today = new Date();
    return {
      from: subDays(today, 7),
      to: today,
      preset: "last7days",
    };
  });
  
  // Applied filter states (used for actual filtering)
  const [appliedSearchQuery, setAppliedSearchQuery] = useState("");
  const [appliedCategory, setAppliedCategory] = useState<string>("");
  const [appliedStage, setAppliedStage] = useState<string>("");
  const [appliedDateRange, setAppliedDateRange] = useState(() => {
    const today = new Date();
    return {
      from: subDays(today, 7),
      to: today,
      preset: "last7days",
    };
  });
  
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  // Date presets
  const datePresets = [
    {
      id: "today",
      label: "Today",
      getValue: () => {
        const today = new Date();
        return { from: today, to: today };
      },
    },
    {
      id: "yesterday",
      label: "Yesterday",
      getValue: () => {
        const yesterday = subDays(new Date(), 1);
        return { from: yesterday, to: yesterday };
      },
    },
    {
      id: "last7days",
      label: "Last 7 days",
      getValue: () => ({
        from: subDays(new Date(), 7),
        to: new Date(),
      }),
    },
    {
      id: "last30days",
      label: "Last 30 days",
      getValue: () => ({
        from: subDays(new Date(), 30),
        to: new Date(),
      }),
    },
    {
      id: "thisMonth",
      label: "This month",
      getValue: () => ({
        from: startOfMonth(new Date()),
        to: endOfMonth(new Date()),
      }),
    },
    {
      id: "lastMonth",
      label: "Last month",
      getValue: () => {
        const lastMonth = subMonths(new Date(), 1);
        return {
          from: startOfMonth(lastMonth),
          to: endOfMonth(lastMonth),
        };
      },
    },
  ];

  // Helper function to format date range text
  const getDateRangeText = () => {
    if (!dateRange.from) return "Select date range";
    if (dateRange.preset && dateRange.preset !== "custom") {
      const preset = datePresets.find((p) => p.id === dateRange.preset);
      return preset?.label || "Custom range";
    }
    if (dateRange.from && dateRange.to) {
      return `${format(dateRange.from, "MMM dd")} - ${format(
        dateRange.to,
        "MMM dd"
      )}`;
    }
    return format(dateRange.from, "MMM dd, yyyy");
  };

  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: null,
    direction: "asc",
  });

  // Dialog states
  const [isLogsDialogOpen, setIsLogsDialogOpen] = useState(false);
  const [isKeywordsDialogOpen, setIsKeywordsDialogOpen] = useState(false);
  const [isOrgDialogOpen, setIsOrgDialogOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [selectedLogTab, setSelectedLogTab] = useState("tab1");
  const [campaignLogs, setCampaignLogs] = useState<CampaignLog[]>(generateMockCampaignLogs());
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  
  // Log filter states
  const [logSearchQuery, setLogSearchQuery] = useState("");
  const [logSelectedCountry, setLogSelectedCountry] = useState<string>("");
  const [logSelectedEmailStatus, setLogSelectedEmailStatus] = useState<string>("");
  const [appliedLogSearchQuery, setAppliedLogSearchQuery] = useState("");
  const [appliedLogSelectedCountry, setAppliedLogSelectedCountry] = useState<string>("");
  const [appliedLogSelectedEmailStatus, setAppliedLogSelectedEmailStatus] = useState<string>("");
  
  // Keywords dialog states
  const [newKeywords, setNewKeywords] = useState("");
  const [numberOfEntries, setNumberOfEntries] = useState("50");
  const [usedKeywords, setUsedKeywords] = useState([
    "Affiliate", "Partnership", "Growth", "Expansion", 
    "Marketing", "Sales", "Collaboration", "Integration"
  ]);

  // Edit campaign dialog state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);

  // Filter and sort campaigns
  const filteredAndSortedCampaigns = useMemo(() => {
    let filtered = campaigns.filter((campaign) => {
      const matchesSearch =
        campaign.appName.toLowerCase().includes(appliedSearchQuery.toLowerCase()) ||
        campaign.companyName.toLowerCase().includes(appliedSearchQuery.toLowerCase());
      const matchesCategory =
        appliedCategory === "all" || !appliedCategory || campaign.category === appliedCategory;
      const matchesStage =
        appliedStage === "all" || !appliedStage || campaign.approachStage === appliedStage;
      
      // Filter by date range
      const campaignDate = new Date(campaign.addedAt);
      campaignDate.setHours(0, 0, 0, 0);
      const fromDate = new Date(appliedDateRange.from);
      fromDate.setHours(0, 0, 0, 0);
      const toDate = new Date(appliedDateRange.to);
      toDate.setHours(23, 59, 59, 999);
      
      const matchesDateRange = campaignDate >= fromDate && campaignDate <= toDate;

      return matchesSearch && matchesCategory && matchesStage && matchesDateRange;
    });

    if (sortConfig.key) {
      filtered.sort((a, b) => {
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
    }

    return filtered;
  }, [campaigns, appliedSearchQuery, appliedCategory, appliedStage, appliedDateRange, sortConfig]);

  const handleSort = (key: keyof Campaign) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: keyof Campaign) => {
    if (sortConfig.key !== key) {
      return <ArrowUpDown className="ml-2 h-4 w-4 text-muted-foreground" />;
    }
    return sortConfig.direction === "asc" ? (
      <ArrowUp className="ml-2 h-4 w-4" />
    ) : (
      <ArrowDown className="ml-2 h-4 w-4" />
    );
  };

  const toggleSendPermission = (campaignId: string) => {
    setCampaigns(
      campaigns.map((c) =>
        c.id === campaignId ? { ...c, sendPermission: !c.sendPermission } : c
      )
    );
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    // TODO: Show toast notification
  };

  const handleViewLogs = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setIsLogsDialogOpen(true);
  };

  const handleViewOrgDetails = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setIsOrgDialogOpen(true);
  };

  const handleRefetchKeywords = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setIsKeywordsDialogOpen(true);
  };

  const handleRemoveKeyword = (keyword: string) => {
    setUsedKeywords(usedKeywords.filter(k => k !== keyword));
  };

  const handleApplyFilters = () => {
    setAppliedSearchQuery(searchQuery);
    setAppliedCategory(selectedCategory);
    setAppliedStage(selectedStage);
    setAppliedDateRange(dateRange);
  };

  const handleResetFilters = () => {
    // Reset to show ALL data - use a very wide date range
    const allDataDateRange = {
      from: new Date(2000, 0, 1), // Jan 1, 2000
      to: new Date(2099, 11, 31), // Dec 31, 2099
      preset: "all",
    };
    
    setSearchQuery("");
    setSelectedCategory("");
    setSelectedStage("");
    setDateRange(allDataDateRange);
    
    // Also reset applied filters to show all data
    setAppliedSearchQuery("");
    setAppliedCategory("");
    setAppliedStage("");
    setAppliedDateRange(allDataDateRange);
  };

  const handleFetchKeywords = () => {
    // TODO: API call to fetch keywords
    console.log("Fetching keywords:", newKeywords, "Entries:", numberOfEntries);
  };

  const handleToggleEmailStatus = (logId: string) => {
    setCampaignLogs(
      campaignLogs.map((log) =>
        log.id === logId ? { ...log, emailStatusEnabled: !log.emailStatusEnabled } : log
      )
    );
  };

  const handleEditCampaign = (campaign: Campaign) => {
    console.log("Edit campaign clicked:", campaign);
    setEditingCampaign(campaign);
    setIsEditDialogOpen(true);
    console.log("Dialog should open now, isEditDialogOpen:", true);
  };

  const handleSaveAndActivate = (campaignId: string) => {
    // Update campaign status to Active
    setCampaigns(
      campaigns.map((c) =>
        c.id === campaignId ? { ...c, status: "Active" } : c
      )
    );
    // TODO: API call to save campaign data and update status
    console.log("Campaign activated:", campaignId);
  };

  const handleApplyLogFilters = () => {
    setAppliedLogSearchQuery(logSearchQuery);
    setAppliedLogSelectedCountry(logSelectedCountry);
    setAppliedLogSelectedEmailStatus(logSelectedEmailStatus);
  };

  const handleResetLogFilters = () => {
    setLogSearchQuery("");
    setLogSelectedCountry("");
    setLogSelectedEmailStatus("");
    
    // Also reset applied filters
    setAppliedLogSearchQuery("");
    setAppliedLogSelectedCountry("");
    setAppliedLogSelectedEmailStatus("");
  };

  // Filter logs by selected tab
  const filteredLogs = useMemo(() => {
    return campaignLogs.filter(log => {
      // Filter by tab
      const tabMatch = 
        (selectedLogTab === "tab1" && log.tab === "Tab 1") ||
        (selectedLogTab === "tab2" && log.tab === "Tab 2") ||
        (selectedLogTab === "tab3" && log.tab === "Tab 3") ||
        (selectedLogTab === "tab4" && log.tab === "Tab 4");
      
      if (!tabMatch) return false;
      
      // Apply log filters
      const matchesSearch =
        log.person.toLowerCase().includes(appliedLogSearchQuery.toLowerCase()) ||
        log.email.toLowerCase().includes(appliedLogSearchQuery.toLowerCase());
      const matchesCountry =
        appliedLogSelectedCountry === "all" || !appliedLogSelectedCountry || log.country === appliedLogSelectedCountry;
      const matchesEmailStatus =
        appliedLogSelectedEmailStatus === "all" || !appliedLogSelectedEmailStatus || log.emailStatus === appliedLogSelectedEmailStatus;

      return matchesSearch && matchesCountry && matchesEmailStatus;
    });
  }, [campaignLogs, selectedLogTab, appliedLogSearchQuery, appliedLogSelectedCountry, appliedLogSelectedEmailStatus]);

  // Calculate stats for the selected tab
  const tabStats = useMemo(() => {
    const total = filteredLogs.length;
    const sent = filteredLogs.filter(log => log.emailStatus === "Success").length;
    const opened = filteredLogs.filter(log => log.emailStatusEnabled).length;
    const bounced = filteredLogs.filter(log => log.emailStatus === "Bounced").length;
    const approachable = filteredLogs.filter(log => log.approachability === "Approachable").length;
    
    return { total, sent, opened, bounced, approachable };
  }, [filteredLogs]);

  return (
    <div className="flex flex-1 flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          All Campaigns
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage and monitor all your active campaigns
        </p>
      </div>

      {/* Filters Card */}
      <Card className="bg-gradient-to-br from-background to-muted/20 border-border/50">
        {/* <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader> */}
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <Label htmlFor="search" className="text-sm mb-2">
                App / Company Name
              </Label>
              <Input
                id="search"
                placeholder="Search campaigns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9"
              />
            </div>

            {/* Category Filter */}
            <div>
              <Label htmlFor="category" className="text-sm mb-2">
                Category
              </Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger id="category" className="h-9">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Finance">Finance</SelectItem>
                  <SelectItem value="Tech">Tech</SelectItem>
                  <SelectItem value="Healthcare">Healthcare</SelectItem>
                  <SelectItem value="Retail">Retail</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Approach Stage Filter */}
            <div>
              <Label htmlFor="stage" className="text-sm mb-2">
                Approach Stage
              </Label>
              <Select value={selectedStage} onValueChange={setSelectedStage}>
                <SelectTrigger id="stage" className="h-9">
                  <SelectValue placeholder="All Stages" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stages</SelectItem>
                  <SelectItem value="No Attempt">No Attempt</SelectItem>
                  <SelectItem value="No Follow-up">No Follow-up</SelectItem>
                  <SelectItem value="Follow-up">Follow-up</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date Range Picker */}
            <div>
              <Label className="text-sm mb-2 block">Date Range</Label>
              <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full h-9 bg-transparent border border-border rounded-lg px-3 py-2 text-foreground font-medium justify-between hover:border-muted-foreground transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4" />
                      {getDateRangeText()}
                    </div>
                    {isPopoverOpen ? (
                      <CalendarDays className="h-4 w-4 rotate-180 text-foreground" />
                    ) : (
                      <CalendarDays className="h-4 w-4 rotate-90 text-muted-foreground" />
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto p-0 bg-background rounded-xl shadow-xl border border-border"
                  align="end"
                >
                  <div className="flex">
                    {/* Presets  */}
                    <div className="border-r border-border p-3 max-w-[160px]">
                      <div className="space-y-1">
                        {datePresets.map((preset) => (
                          <Button
                            key={preset.id}
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const range = preset.getValue();
                              setDateRange({
                                from: range.from,
                                to: range.to,
                                preset: preset.id,
                              });
                            }}
                            className={`w-full justify-start text-right h-8 px-2 text-xs transition-all duration-200 ${
                              dateRange.preset === preset.id
                                ? "bg-foreground text-background font-medium"
                                : "text-muted-foreground hover:text-foreground hover:bg-accent"
                            }`}
                          >
                            {preset.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                    {/* Calendar */}
                    <div className="p-4">
                      <Calendar
                        mode="range"
                        selected={{ from: dateRange.from, to: dateRange.to }}
                        onSelect={(range) => {
                          if (range?.from) {
                            setDateRange({
                              from: range.from,
                              to: range.to || range.from,
                              preset: "custom",
                            });
                          }
                        }}
                        numberOfMonths={2}
                      />
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Apply and Reset Buttons */}
          <div className="flex justify-end gap-3 mt-4">
            <Button
              variant="outline"
              onClick={handleResetFilters}
              className="h-9"
            >
              Reset Filters
            </Button>
            <Button
              onClick={handleApplyFilters}
              className="h-9 bg-primary hover:bg-primary/90"
            >
              Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-border/50">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-16 text-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 p-0 w-full"
                    onClick={() => handleSort("number")}
                  >
                    No {getSortIcon("number")}
                  </Button>
                </TableHead>
                <TableHead className="text-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 p-0 w-full justify-center"
                    onClick={() => handleSort("appName")}
                  >
                    App Name {getSortIcon("appName")}
                  </Button>
                </TableHead>
                <TableHead>Direct URL</TableHead>
                <TableHead className="text-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 p-0 w-full justify-center"
                    onClick={() => handleSort("category")}
                  >
                    Category {getSortIcon("category")}
                  </Button>
                </TableHead>
                <TableHead className="text-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 p-0 w-full justify-center"
                    onClick={() => handleSort("addedAt")}
                  >
                    Added At {getSortIcon("addedAt")}
                  </Button>
                </TableHead>
                <TableHead className="text-center">Send Permission</TableHead>
                <TableHead className="text-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 p-0 w-full justify-center"
                    onClick={() => handleSort("status")}
                  >
                    Status {getSortIcon("status")}
                  </Button>
                </TableHead>
                <TableHead className="text-center w-56">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedCampaigns.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No campaigns found
                  </TableCell>
                </TableRow>
              ) : (
                filteredAndSortedCampaigns.map((campaign) => (
                  <TableRow key={campaign.id} className="hover:bg-muted/50">
                    <TableCell className="text-center font-medium">
                      {campaign.number}
                    </TableCell>
                    
                    <TableCell className="text-center text-sm">
                      <span className="line-clamp-1">{campaign.appName}</span>
                      <p className="text-xs text-muted-foreground">
                        {campaign.bundleId}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <a
                          href={campaign.directUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm truncate"
                        >
                          <ExternalLink className="w-4 h-4 inline mr-1" />
                          View Store
                        </a>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyUrl(campaign.directUrl)}
                          className="h-6 w-6 p-0"
                          title="Copy URL"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className={getCategoryColor(campaign.category)}>
                        {campaign.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center text-sm">
                      {format(campaign.addedAt, "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell className="text-center">
                      <Toggle
                        pressed={campaign.sendPermission}
                        onPressedChange={() =>
                          toggleSendPermission(campaign.id)
                        }
                        className="data-[state=on]:bg-green-500/20 data-[state=on]:text-green-700 dark:data-[state=on]:text-green-400 gap-1.5"
                        aria-label="Toggle send permission"
                      >
                        {campaign.sendPermission ? (
                          <>
                            <Zap className="w-4 h-4" />
                            <span className="text-xs font-medium">On</span>
                          </>
                        ) : (
                          <>
                            <Zap className="w-4 h-4 opacity-50" />
                            <span className="text-xs font-medium opacity-50">Off</span>
                          </>
                        )}
                      </Toggle>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className={getStatusColor(campaign.status)}>
                        {campaign.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center items-center gap-1">
                       

                   

                        {/* Edit (only for Draft campaigns) */}
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0"
                          title="Edit Campaign"
                          onClick={() => handleEditCampaign(campaign)}
                          disabled={campaign.status !== "Draft"}
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </Button>

                        {/* Org Details */}
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0"
                          title="Organization Details"
                          onClick={() => handleViewOrgDetails(campaign)}
                        >
                          <MdOutlineStorefront className="w-4 h-4" />
                        </Button>

                        {/* Logs */}
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0"
                          title="Campaign Logs"
                          onClick={() => handleViewLogs(campaign)}
                        >
                          <FiBarChart2 className="w-4 h-4" />
                        </Button>

                        {/* Refresh */}
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0"
                          title="Refresh"
                          onClick={() => handleRefetchKeywords(campaign)}
                        >
                          <RefreshCw className="w-4 h-4" />
                        </Button>

                        {/* Delete */}
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                          title="Delete"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Stats Summary */}

      {/* Campaign Logs Dialog */}
      <Dialog open={isLogsDialogOpen} onOpenChange={setIsLogsDialogOpen}>
        <DialogContent className="max-w-6xl h-[85vh]">
          <DialogHeader>
            <DialogTitle>Campaign Logs - {selectedCampaign?.appName}</DialogTitle>
            <DialogDescription>
              Detailed outreach logs and analytics for this campaign
            </DialogDescription>
          </DialogHeader>

          <div className="flex gap-4 h-full overflow-hidden">
            {/* LEFT SIDE - 85% - Tabs and Table */}
            <div className="flex-[0.85] flex flex-col min-w-0">
              <Tabs value={selectedLogTab} onValueChange={setSelectedLogTab} className="flex-1 flex flex-col">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="tab1">Tab 1</TabsTrigger>
                  <TabsTrigger value="tab2">Tab 2</TabsTrigger>
                  <TabsTrigger value="tab3">Tab 3</TabsTrigger>
                  <TabsTrigger value="tab4">Tab 4</TabsTrigger>
                </TabsList>

                {/* Log Filters */}
                <div className="flex gap-3 py-3 px-0">
                  <Input
                    placeholder="Search person name or email..."
                    value={logSearchQuery}
                    onChange={(e) => setLogSearchQuery(e.target.value)}
                    className="h-9 flex-1 text-xs"
                  />
                  <Select value={logSelectedCountry} onValueChange={setLogSelectedCountry}>
                    <SelectTrigger className="h-9 w-36 text-xs">
                      <SelectValue placeholder="All Countries" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Countries</SelectItem>
                      <SelectItem value="United States">United States</SelectItem>
                      <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                      <SelectItem value="Canada">Canada</SelectItem>
                      <SelectItem value="Australia">Australia</SelectItem>
                      <SelectItem value="Germany">Germany</SelectItem>
                      <SelectItem value="France">France</SelectItem>
                      <SelectItem value="India">India</SelectItem>
                      <SelectItem value="Singapore">Singapore</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={logSelectedEmailStatus} onValueChange={setLogSelectedEmailStatus}>
                    <SelectTrigger className="h-9 w-36 text-xs">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="Success">Success</SelectItem>
                      <SelectItem value="Failed">Failed</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Bounced">Bounced</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    size="sm"
                    onClick={handleApplyLogFilters}
                    className="h-9 px-3 text-xs"
                  >
                    Apply
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleResetLogFilters}
                    className="h-9 px-3 text-xs"
                  >
                    Reset
                  </Button>
                </div>

                <TabsContent value={selectedLogTab} className="flex-1 mt-4 overflow-hidden">
                  <ScrollArea className="h-[calc(85vh-180px)]">
                    <Table>
                      <TableHeader className="sticky top-0 bg-background z-10">
                        <TableRow>
                          <TableHead className="w-12">S.No</TableHead>
                          <TableHead className="min-w-[200px]">Person Info</TableHead>
                          <TableHead className="w-24">Country</TableHead>
                          <TableHead className="min-w-[100px]">Email Status</TableHead>
                          <TableHead className="min-w-[120px]">Sent Date & Time</TableHead>
                          <TableHead className="w-32">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredLogs.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                              No logs found for this tab
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredLogs.map((log) => (
                            <TableRow key={log.id}>
                              <TableCell className="font-medium">{log.sNo}</TableCell>
                              <TableCell>
                                <div className="space-y-0.5">
                                  <p className="font-medium text-sm">{log.person}</p>
                                  <p className="text-xs text-muted-foreground">{log.designation}</p>
                                  <p className="text-xs font-mono text-muted-foreground">{log.email}</p>
                                  <p className="text-xs text-muted-foreground">{log.mobile}</p>
                                </div>
                              </TableCell>
                              <TableCell className="text-sm">{log.country}</TableCell>
                              <TableCell>
                                <Badge className={getEmailStatusColor(log.emailStatus)}>
                                  <span className="text-xs">{log.emailStatus}</span>
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="space-y-0.5">
                                  <p className="font-bold text-sm">
                                    {format(log.sentTime, "MMM dd, yyyy")}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {format(log.sentTime, "HH:mm")}
                                  </p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-col gap-1">
                                  {/* LinkedIn */}
                                  <a
                                    href={log.linkedin}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-start gap-1.5 h-7 px-2 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground text-xs"
                                    title="View LinkedIn Profile"
                                  >
                                    <ExternalLink className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                                    LinkedIn
                                  </a>
                                  
                                  {/* View Message */}
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-7 justify-start gap-1.5 text-xs px-2"
                                    onClick={() => setSelectedMessage(log.message)}
                                    title="View Message"
                                  >
                                    <Eye className="w-3 h-3" />
                                    Message
                                  </Button>

                                  {/* Email Status Toggle */}
                                  <Toggle
                                    pressed={log.emailStatusEnabled}
                                    onPressedChange={() => handleToggleEmailStatus(log.id)}
                                    size="sm"
                                    className="h-7 justify-start gap-1.5 text-xs px-2 data-[state=on]:bg-green-500/20 data-[state=on]:text-green-700 dark:data-[state=on]:text-green-400"
                                    title={`Email Status: ${log.emailStatusEnabled ? 'On' : 'Off'}`}
                                  >
                                    <Zap className="w-3 h-3" />
                                    {log.emailStatusEnabled ? 'On' : 'Off'}
                                  </Toggle>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </div>

            {/* RIGHT SIDE - 15% - Analytics Boxes */}
            <div className="flex-[0.15] space-y-2 overflow-y-auto">
              {/* Total Contacts */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0 }}
                className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50 border border-blue-200/50 dark:border-blue-800/50 p-3 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="relative">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Users className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                    <p className="text-[10px] font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wide">Total</p>
                  </div>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{tabStats.total}</p>
                </div>
              </motion.div>

              {/* Emails Sent */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/50 border border-green-200/50 dark:border-green-800/50 p-3 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="relative">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Send className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                    <p className="text-[10px] font-semibold text-green-700 dark:text-green-300 uppercase tracking-wide">Sent</p>
                  </div>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">{tabStats.sent}</p>
                </div>
              </motion.div>

              {/* Opened */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/50 border border-purple-200/50 dark:border-purple-800/50 p-3 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="relative">
                  <div className="flex items-center gap-1.5 mb-1">
                    <MailOpen className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                    <p className="text-[10px] font-semibold text-purple-700 dark:text-purple-300 uppercase tracking-wide">Opened</p>
                  </div>
                  <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{tabStats.opened}</p>
                </div>
              </motion.div>

              {/* Bounced */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
                className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/50 border border-orange-200/50 dark:border-orange-800/50 p-3 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="relative">
                  <div className="flex items-center gap-1.5 mb-1">
                    <MailX className="h-3.5 w-3.5 text-orange-600 dark:text-orange-400" />
                    <p className="text-[10px] font-semibold text-orange-700 dark:text-orange-300 uppercase tracking-wide">Bounced</p>
                  </div>
                  <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">{tabStats.bounced}</p>
                </div>
              </motion.div>

              {/* Approachable */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.4 }}
                className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-950/50 dark:to-teal-900/50 border border-teal-200/50 dark:border-teal-800/50 p-3 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="relative">
                  <div className="flex items-center gap-1.5 mb-1">
                    <UserCheck className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                    <p className="text-[10px] font-semibold text-teal-700 dark:text-teal-300 uppercase tracking-wide">Approachable</p>
                  </div>
                  <p className="text-2xl font-bold text-teal-900 dark:text-teal-100">{tabStats.approachable}</p>
                </div>
              </motion.div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Message View Dialog */}
      <Dialog open={selectedMessage !== null} onOpenChange={() => setSelectedMessage(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Email Message</DialogTitle>
          </DialogHeader>
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-sm whitespace-pre-wrap">{selectedMessage}</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Refetch Keywords Dialog */}
      <Dialog open={isKeywordsDialogOpen} onOpenChange={setIsKeywordsDialogOpen}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Refetch Keywords - {selectedCampaign?.appName}
            </DialogTitle>
            <DialogDescription className="text-base">
              Update and manage keyword targeting for this campaign
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-5 gap-6">
            {/* LEFT SIDE - 60% (3 columns) */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="col-span-3 space-y-5"
            >
              {/* Keywords Input */}
              <div className="relative">
                <Label htmlFor="keywords" className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                  Add New Keywords
                </Label>
                <Textarea
                  id="keywords"
                  placeholder="affiliate, partnership, growth, marketing, expansion..."
                  value={newKeywords}
                  onChange={(e) => setNewKeywords(e.target.value)}
                  rows={5}
                  className="resize-none border-2 focus:border-purple-500 transition-colors rounded-xl"
                />
                <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Separate keywords with commas
                </p>
              </div>

              {/* Number of Entries */}
              <div className="relative">
                <Label htmlFor="entries" className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                  Number of Entries
                </Label>
                <Input
                  id="entries"
                  type="number"
                  placeholder="50"
                  value={numberOfEntries}
                  onChange={(e) => setNumberOfEntries(e.target.value)}
                  className="w-full border-2 focus:border-blue-500 transition-colors rounded-xl"
                />
              </div>

              {/* Fetch Button */}
              <Button 
                onClick={handleFetchKeywords} 
                className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Fetch Keywords
              </Button>
            </motion.div>

            {/* RIGHT SIDE - 40% (2 columns) */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="col-span-2 space-y-5"
            >
              {/* Used Keywords */}
              <div>
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  Used Keywords
                </h4>
                <ScrollArea className="h-52 rounded-xl border-2 border-border p-4 bg-muted/30">
                  <div className="grid grid-cols-2 gap-2">
                    {usedKeywords.map((keyword, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="group relative flex items-center justify-between hover:bg-primary/10 rounded-lg px-3 py-2 border border-border/50 bg-background transition-all hover:shadow-sm"
                      >
                        <span className="text-xs font-medium flex items-center gap-1.5 truncate">
                          <div className="h-1.5 w-1.5 rounded-full bg-green-500 flex-shrink-0"></div>
                          {keyword}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/10 hover:text-red-600 flex-shrink-0"
                          onClick={() => handleRemoveKeyword(keyword)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              {/* Performance Stats */}
              <div>
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-orange-500"></div>
                  Performance
                </h4>
                <div className="space-y-3 rounded-xl border-2 border-border p-4 bg-gradient-to-br from-orange-50/50 to-yellow-50/50 dark:from-orange-950/20 dark:to-yellow-950/20">
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center justify-between py-2 border-b border-border/50"
                  >
                    <span className="text-sm text-muted-foreground font-medium">Total Keywords</span>
                    <span className="font-bold text-lg text-orange-600 dark:text-orange-400">{usedKeywords.length}</span>
                  </motion.div>
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex items-center justify-between py-2 border-b border-border/50"
                  >
                    <span className="text-sm text-muted-foreground font-medium">Last Updated</span>
                    <span className="font-semibold text-sm">2h ago</span>
                  </motion.div>
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex items-center justify-between py-2"
                  >
                    <span className="text-sm text-muted-foreground font-medium">Avg Response</span>
                    <span className="font-bold text-green-600 dark:text-green-400 flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4" />
                      12.5%
                    </span>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Organization Details Dialog */}
      <Dialog open={isOrgDialogOpen} onOpenChange={setIsOrgDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Organization Details</DialogTitle>
            <DialogDescription>
              Complete organization information for {selectedCampaign?.appName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 p-4">
            {/* App and Company Logos - 2 Column Layout */}
            <div className="grid grid-cols-2 gap-6">
              {/* App Logo Section */}
              <div className="flex flex-col items-center space-y-4 p-6 border rounded-lg bg-muted/30">
                <span className="text-6xl">
                  📱
                </span>
                <div className="text-center space-y-2 w-full">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">App</p>
                  <p className="font-semibold text-lg">
                    {selectedCampaign?.appName || "App Name"}
                  </p>
                </div>
              </div>

              {/* Company Logo Section */}
              <div className="flex flex-col items-center space-y-4 p-6 border rounded-lg bg-muted/30">
                <span className="text-6xl">
                  🏢
                </span>
                <div className="text-center space-y-2 w-full">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Company</p>
                  <p className="font-semibold text-lg">
                    {selectedCampaign?.companyName || "Company Name"}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Organization Info Card */}
            <div className="flex flex-col items-center space-y-4 p-6 border rounded-lg bg-muted/30">
              <div className="text-center space-y-4 w-full">
                
                <div className="space-y-3">
                  {/* Website */}
                  <div className="flex items-center justify-center gap-3">
                    <Globe className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    <a
                      href={selectedCampaign?.directUrl || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline"
                    >
                      {selectedCampaign?.directUrl || "Website"}
                    </a>
                  </div>

                  {/* LinkedIn */}
                  <div className="flex items-center justify-center gap-3">
                    <Linkedin className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    <a
                      href="#"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline"
                    >
                      Company Profile
                    </a>
                  </div>
                </div>

                <Separator />

                {/* Additional Details */}
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="text-left space-y-1">
                    <p className="text-xs text-muted-foreground font-medium">Category</p>
                    <Badge className={getCategoryColor(selectedCampaign?.category || "Other")}>
                      {selectedCampaign?.category}
                    </Badge>
                  </div>
                  <div className="text-left space-y-1">
                    <p className="text-xs text-muted-foreground font-medium">Status</p>
                    <Badge className={getStatusColor(selectedCampaign?.status || "Draft")}>
                      {selectedCampaign?.status}
                    </Badge>
                  </div>
                  <div className="text-left space-y-1">
                    <p className="text-xs text-muted-foreground font-medium">Bundle ID</p>
                    <p className="text-sm font-mono">{selectedCampaign?.bundleId}</p>
                  </div>
                  <div className="text-left space-y-1">
                    <p className="text-xs text-muted-foreground font-medium">Added Date</p>
                    <p className="text-sm">{selectedCampaign?.addedAt ? format(selectedCampaign.addedAt, "MMM dd, yyyy") : "N/A"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Campaign Dialog */}
      <EditCampaignDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        campaign={editingCampaign}
        onSaveAndActivate={handleSaveAndActivate}
      />
  
    </div>
  );
}