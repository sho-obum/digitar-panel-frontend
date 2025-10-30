"use client";

import { useState, useMemo } from "react";
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
} from "lucide-react";
import { FiEdit2, FiTrash2, FiEye, FiBarChart2 } from "react-icons/fi";
import { MdOutlineStorefront } from "react-icons/md";
import { Toggle } from "@/components/ui/toggle";
import { format } from "date-fns";

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

// Mock data generator
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
      status: statuses[Math.floor(Math.random() * statuses.length)],
      approachStage: stages[Math.floor(Math.random() * stages.length)],
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

export default function AllCampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(
    generateMockCampaigns()
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedStage, setSelectedStage] = useState<string>("");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: null,
    direction: "asc",
  });

  // Filter and sort campaigns
  const filteredAndSortedCampaigns = useMemo(() => {
    let filtered = campaigns.filter((campaign) => {
      const matchesSearch =
        campaign.appName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        campaign.companyName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" || !selectedCategory || campaign.category === selectedCategory;
      const matchesStage =
        selectedStage === "all" || !selectedStage || campaign.approachStage === selectedStage;

      return matchesSearch && matchesCategory && matchesStage;
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
  }, [campaigns, searchQuery, selectedCategory, selectedStage, sortConfig]);

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
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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

            {/* Date From */}
            <div>
              <Label htmlFor="date-from" className="text-sm mb-2">
                From Date
              </Label>
              <Input
                id="date-from"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="h-9"
              />
            </div>

            {/* Date To */}
            <div>
              <Label htmlFor="date-to" className="text-sm mb-2">
                To Date
              </Label>
              <Input
                id="date-to"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="h-9"
              />
            </div>
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
                      {format(campaign.addedAt, "MMM dd, yyyy")}
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
                    <TableCell className="text-center">
                      <Toggle
                        pressed={campaign.sendPermission}
                        onPressedChange={() =>
                          toggleSendPermission(campaign.id)
                        }
                        className="data-[state=on]:bg-green-500/20 data-[state=on]:text-green-700 dark:data-[state=on]:text-green-400"
                        aria-label="Toggle send permission"
                      >
                        {campaign.sendPermission ? (
                          <Zap className="w-4 h-4" />
                        ) : (
                          <Zap className="w-4 h-4 opacity-50" />
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
                        {/* View */}
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>

                        {/* Edit */}
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0"
                          title="Edit"
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </Button>

                        {/* Org Details */}
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0"
                          title="Organization Details"
                        >
                          <MdOutlineStorefront className="w-4 h-4" />
                        </Button>

                        {/* Logs */}
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0"
                          title="Campaign Logs"
                        >
                          <FiBarChart2 className="w-4 h-4" />
                        </Button>

                        {/* Refresh */}
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0"
                          title="Refresh"
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
  
    </div>
  );
}