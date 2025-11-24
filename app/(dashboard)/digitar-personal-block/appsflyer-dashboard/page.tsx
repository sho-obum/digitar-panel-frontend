"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/calendar-with-presets";
import { 
  CalendarDays, 
  Download, 
  TrendingUp, 
  TrendingDown, 
  MousePointerClick,
  Smartphone,
  Zap,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Filter,
  RefreshCw,
  BarChart3,
  Activity,
  Copy,
  Check,
  Image as ImageIcon,
  Globe,
  Target
} from "lucide-react";
import { format, startOfMonth, endOfMonth, subMonths, subDays } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Mock data - will be replaced with real array later
const mockData = [
  {
    id: 1,
    campaignName: "Summer Campaign 2024",
    bundleId: "com.example.summer.app",
    clicks: 15420,
    installs: 3280,
    events: 1240,
    p360Installs: 892,
    p360Events: 456,
    image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=400&fit=crop",
    category: "E-commerce",
    startDate: "2024-06-01",
    endDate: "2024-08-31",
    description: "Summer promotional campaign targeting mobile users",
  },
  {
    id: 2,
    campaignName: "Winter Promo",
    bundleId: "com.example.winter.app",
    clicks: 22150,
    installs: 5640,
    events: 2150,
    p360Installs: 1523,
    p360Events: 782,
    image: "https://images.unsplash.com/photo-1516937941344-00b4e0337589?w=400&h=400&fit=crop",
    category: "Retail",
    startDate: "2024-12-01",
    endDate: "2025-01-31",
    description: "Winter holiday promotional campaign with special offers",
  },
  {
    id: 3,
    campaignName: "Holiday Blast",
    bundleId: "com.example.holiday.app",
    clicks: 18900,
    installs: 4220,
    events: 1890,
    p360Installs: 1105,
    p360Events: 610,
    image: "https://images.unsplash.com/photo-1512909006721-3d6018887383?w=400&h=400&fit=crop",
    category: "Entertainment",
    startDate: "2024-11-15",
    endDate: "2024-12-31",
    description: "Holiday season mega campaign with gift promotions",
  },
  {
    id: 4,
    campaignName: "Flash Sale",
    bundleId: "com.example.flash.app",
    clicks: 9850,
    installs: 2100,
    events: 945,
    p360Installs: 567,
    p360Events: 298,
    image: "https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=400&h=400&fit=crop",
    category: "Shopping",
    startDate: "2024-09-10",
    endDate: "2024-09-12",
    description: "Limited time flash sale event - 48 hours only",
  },
  {
    id: 5,
    campaignName: "Brand Awareness",
    bundleId: "com.example.brand.app",
    clicks: 31200,
    installs: 7890,
    events: 3450,
    p360Installs: 2341,
    p360Events: 1203,
    image: "https://images.unsplash.com/photo-1557821552-17105176677c?w=400&h=400&fit=crop",
    category: "Marketing",
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    description: "Year-long brand awareness and market penetration campaign",
  },
];

// Mock detailed data for second table
const mockDetailedData = [
  {
    id: 1,
    campaignName: "Summer Campaign 2024",
    source: "Google Ads",
    pid: "google_summer_001",
    clicks: 5200,
    installs: 1100,
    p360Installs: 300,
    p360Events: 150,
  },
  {
    id: 2,
    campaignName: "Summer Campaign 2024",
    source: "Facebook Ads",
    pid: "fb_summer_002",
    clicks: 4100,
    installs: 950,
    p360Installs: 280,
    p360Events: 140,
  },
  {
    id: 3,
    campaignName: "Summer Campaign 2024",
    source: "Instagram Ads",
    pid: "ig_summer_003",
    clicks: 3200,
    installs: 780,
    p360Installs: 200,
    p360Events: 100,
  },
  {
    id: 4,
    campaignName: "Summer Campaign 2024",
    source: "TikTok Ads",
    pid: "tt_summer_004",
    clicks: 2920,
    installs: 450,
    p360Installs: 112,
    p360Events: 66,
  },
  {
    id: 5,
    campaignName: "Winter Promo",
    source: "Google Ads",
    pid: "google_winter_001",
    clicks: 7100,
    installs: 1850,
    p360Installs: 520,
    p360Events: 270,
  },
  {
    id: 6,
    campaignName: "Winter Promo",
    source: "Facebook Ads",
    pid: "fb_winter_002",
    clicks: 6200,
    installs: 1620,
    p360Installs: 450,
    p360Events: 230,
  },
  {
    id: 7,
    campaignName: "Winter Promo",
    source: "LinkedIn Ads",
    pid: "li_winter_003",
    clicks: 5300,
    installs: 1520,
    p360Installs: 420,
    p360Events: 215,
  },
  {
    id: 8,
    campaignName: "Holiday Blast",
    source: "Google Ads",
    pid: "google_holiday_001",
    clicks: 6500,
    installs: 1400,
    p360Installs: 380,
    p360Events: 195,
  },
  {
    id: 9,
    campaignName: "Holiday Blast",
    source: "Pinterest Ads",
    pid: "pinterest_holiday_002",
    clicks: 5800,
    installs: 1320,
    p360Installs: 360,
    p360Events: 185,
  },
];

type SortConfig = {
  key: string | null;
  direction: "asc" | "desc";
};

export default function AppsflyerDashboard() {
  const [selectedCampaign, setSelectedCampaign] = useState<string>("");
  const [sourceSearch, setSourceSearch] = useState<string>("");
  const [debouncedSourceSearch, setDebouncedSourceSearch] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: "asc" });
  const [sortConfigDetail, setSortConfigDetail] = useState<SortConfig>({ key: null, direction: "asc" });
  const [copiedPid, setCopiedPid] = useState<string | null>(null);
  const [campaignDetailsOpen, setCampaignDetailsOpen] = useState(false);
  const [selectedCampaignDetails, setSelectedCampaignDetails] = useState<typeof mockData[0] | null>(null);
  const [dateRange, setDateRange] = useState(() => {
    const today = new Date();
    return {
      from: subDays(today, 7),
      to: today,
      preset: "last7days",
    };
  });
  const [pendingDateRange, setPendingDateRange] = useState(() => {
    const today = new Date();
    return {
      from: subDays(today, 7),
      to: today,
      preset: "last7days",
    };
  });
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

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

  const handleApplyDateRange = () => {
    setDateRange(pendingDateRange);
    setIsPopoverOpen(false);
  };

  const handleResetDateRange = () => {
    const today = new Date();
    const defaultRange = {
      from: subDays(today, 7),
      to: today,
      preset: "last7days",
    };
    setPendingDateRange(defaultRange);
    setDateRange(defaultRange);
    setIsPopoverOpen(false);
  };

  // Debounce source search
  useMemo(() => {
    const timer = setTimeout(() => {
      setDebouncedSourceSearch(sourceSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [sourceSearch]);

  // Get unique campaign names for dropdown
  const campaigns = Array.from(
    new Set(mockDetailedData.map((item) => item.campaignName))
  );

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    const totalClicks = mockData.reduce((sum, item) => sum + item.clicks, 0);
    const totalInstalls = mockData.reduce((sum, item) => sum + item.installs, 0);
    const totalEvents = mockData.reduce((sum, item) => sum + item.events, 0);
    const totalP360Installs = mockData.reduce((sum, item) => sum + item.p360Installs, 0);
    
    const conversionRate = totalClicks > 0 ? (totalInstalls / totalClicks) * 100 : 0;
    const eventRate = totalInstalls > 0 ? (totalEvents / totalInstalls) * 100 : 0;
    
    return {
      totalClicks,
      totalInstalls,
      totalEvents,
      totalP360Installs,
      conversionRate,
      eventRate,
    };
  }, []);

  // Sorting function for main table
  const handleSort = (key: string) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Sorting function for detail table
  const handleSortDetail = (key: string) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfigDetail.key === key && sortConfigDetail.direction === "asc") {
      direction = "desc";
    }
    setSortConfigDetail({ key, direction });
  };

  // Sort main data
  const sortedMockData = useMemo(() => {
    if (!sortConfig.key) return mockData;
    
    return [...mockData].sort((a, b) => {
      const aValue = a[sortConfig.key as keyof typeof a];
      const bValue = b[sortConfig.key as keyof typeof b];
      
      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue;
      }
      
      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortConfig.direction === "asc" 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      }
      
      return 0;
    });
  }, [sortConfig]);

  // Filter detailed data based on selected campaign and source search
  const filteredDetailedData = useMemo(() => {
    let filtered = mockDetailedData.filter((item) => {
      const campaignMatch =
        selectedCampaign === "all" || !selectedCampaign || item.campaignName === selectedCampaign;
      const sourceMatch =
        debouncedSourceSearch.length < 3 ||
        item.source
          .toLowerCase()
          .includes(debouncedSourceSearch.toLowerCase());
      return campaignMatch && sourceMatch;
    });

    // Apply sorting
    if (sortConfigDetail.key) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfigDetail.key as keyof typeof a];
        const bValue = b[sortConfigDetail.key as keyof typeof b];
        
        if (typeof aValue === "number" && typeof bValue === "number") {
          return sortConfigDetail.direction === "asc" ? aValue - bValue : bValue - aValue;
        }
        
        if (typeof aValue === "string" && typeof bValue === "string") {
          return sortConfigDetail.direction === "asc" 
            ? aValue.localeCompare(bValue) 
            : bValue.localeCompare(aValue);
        }
        
        return 0;
      });
    }

    return filtered;
  }, [selectedCampaign, debouncedSourceSearch, sortConfigDetail]);

  const handleExportData = () => {
    // Mock export functionality
    const csv = [
      ["Campaign Name", "Bundle ID", "Clicks", "Installs", "Events", "P360 Installs", "P360 Events"],
      ...mockData.map(row => [
        row.campaignName,
        row.bundleId,
        row.clicks,
        row.installs,
        row.events,
        row.p360Installs,
        row.p360Events,
      ]),
    ]
      .map(row => row.join(","))
      .join("\n");
    
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `appsflyer-data-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
  };

  const getSortIcon = (columnKey: string, config: SortConfig) => {
    if (config.key !== columnKey) return <ArrowUpDown className="ml-2 h-4 w-4 opacity-30" />;
    return config.direction === "asc" ? (
      <ArrowUp className="ml-2 h-4 w-4" />
    ) : (
      <ArrowDown className="ml-2 h-4 w-4" />
    );
  };

  const handleCopyPid = async (pid: string) => {
    try {
      await navigator.clipboard.writeText(pid);
      setCopiedPid(pid);
      toast.success("PID copied to clipboard!", {
        description: pid,
        duration: 2000,
      });
      setTimeout(() => setCopiedPid(null), 2000);
    } catch (err) {
      toast.error("Failed to copy PID");
    }
  };

  const handleViewCampaignDetails = (campaignName: string) => {
    const campaign = mockData.find(c => c.campaignName === campaignName);
    if (campaign) {
      setSelectedCampaignDetails(campaign);
      setCampaignDetailsOpen(true);
    }
  };

  return (
    <TooltipProvider>
      <div className="w-full space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20">
                <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent">
                  AppsFlyer Analytics
                </h1>
                <p className="text-sm text-muted-foreground">
                  Real-time campaign performance insights
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Export Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportData}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </TooltipTrigger>
              <TooltipContent>Export data as CSV</TooltipContent>
            </Tooltip>

            {/* Date Range Filter */}
            <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 min-w-[200px] justify-between"
                >
                  <CalendarDays className="h-4 w-4" />
                  <span className="text-sm">{getDateRangeText()}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-4" align="end">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    {datePresets.map((preset) => (
                      <Button
                        key={preset.id}
                        variant={
                          dateRange.preset === preset.id ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => {
                          const range = preset.getValue();
                          setPendingDateRange({ ...range, preset: preset.id });
                        }}
                      >
                        {preset.label}
                      </Button>
                    ))}
                  </div>
                  <div>
                    <Label className="text-xs">Custom Range</Label>
                    <Calendar
                      mode="range"
                      selected={{
                        from: pendingDateRange.from,
                        to: pendingDateRange.to,
                      }}
                      onSelect={(range) => {
                        if (range?.from) {
                          setPendingDateRange({
                            from: range.from,
                            to: range.to || range.from,
                            preset: "custom",
                          });
                        }
                      }}
                      disabled={(date) =>
                        date > new Date() || date < new Date("2020-01-01")
                      }
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleResetDateRange}
                      className="flex-1"
                    >
                      Reset
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleApplyDateRange}
                      className="flex-1"
                    >
                      Apply
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Summary Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Clicks */}
          <Card className="relative overflow-hidden border-l-4 border-l-blue-500 hover:shadow-lg transition-all duration-300 group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardContent className="p-6 relative">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Total Clicks</p>
                  <p className="text-2xl font-bold">{summaryStats.totalClicks.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-green-500" />
                    Conversion: {summaryStats.conversionRate.toFixed(2)}%
                  </p>
                </div>
                <div className="p-3 rounded-full bg-gradient-to-br from-blue-500/10 to-blue-600/5">
                  <MousePointerClick className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Installs */}
          <Card className="relative overflow-hidden border-l-4 border-l-green-500 hover:shadow-lg transition-all duration-300 group">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardContent className="p-6 relative">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Total Installs</p>
                  <p className="text-2xl font-bold">{summaryStats.totalInstalls.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-green-500" />
                    Event Rate: {summaryStats.eventRate.toFixed(2)}%
                  </p>
                </div>
                <div className="p-3 rounded-full bg-gradient-to-br from-green-500/10 to-green-600/5">
                  <Smartphone className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Events */}
          <Card className="relative overflow-hidden border-l-4 border-l-purple-500 hover:shadow-lg transition-all duration-300 group">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardContent className="p-6 relative">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Total Events</p>
                  <p className="text-2xl font-bold">{summaryStats.totalEvents.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">In-app actions tracked</p>
                </div>
                <div className="p-3 rounded-full bg-gradient-to-br from-purple-500/10 to-purple-600/5">
                  <Zap className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* P360 Installs */}
          <Card className="relative overflow-hidden border-l-4 border-l-orange-500 hover:shadow-lg transition-all duration-300 group">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardContent className="p-6 relative">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">P360 Installs</p>
                  <p className="text-2xl font-bold">{summaryStats.totalP360Installs.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Premium segment</p>
                </div>
                <div className="p-3 rounded-full bg-gradient-to-br from-orange-500/10 to-orange-600/5">
                  <BarChart3 className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Campaign Performance Table */}
        <Card className="border-t-4 border-t-blue-500/20">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Campaign Performance</CardTitle>
                <CardDescription className="mt-1">
                  Overview of all campaigns with performance metrics
                </CardDescription>
              </div>
              <Badge variant="outline" className="gap-1">
                <BarChart3 className="h-3 w-3" />
                {mockData.length} Campaigns
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                      <TableHead 
                        className="w-[250px] cursor-pointer select-none hover:bg-muted/80 transition-colors"
                        onClick={() => handleSort("campaignName")}
                      >
                        <div className="flex items-center font-semibold">
                          Campaign Name
                          {getSortIcon("campaignName", sortConfig)}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="text-right cursor-pointer select-none hover:bg-muted/80 transition-colors"
                        onClick={() => handleSort("clicks")}
                      >
                        <div className="flex items-center justify-end font-semibold">
                          Clicks
                          {getSortIcon("clicks", sortConfig)}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="text-right cursor-pointer select-none hover:bg-muted/80 transition-colors"
                        onClick={() => handleSort("installs")}
                      >
                        <div className="flex items-center justify-end font-semibold">
                          Installs
                          {getSortIcon("installs", sortConfig)}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="text-right cursor-pointer select-none hover:bg-muted/80 transition-colors"
                        onClick={() => handleSort("events")}
                      >
                        <div className="flex items-center justify-end font-semibold">
                          Events
                          {getSortIcon("events", sortConfig)}
                        </div>
                      </TableHead>
                      <TableHead colSpan={2} className="text-center bg-purple-500/5">
                        <div className="font-semibold flex items-center justify-center gap-1">
                          <span className="text-purple-600 dark:text-purple-400">P 360</span>
                        </div>
                      </TableHead>
                    </TableRow>
                    <TableRow className="bg-purple-500/5 hover:bg-purple-500/5">
                      <TableHead></TableHead>
                      <TableHead></TableHead>
                      <TableHead></TableHead>
                      <TableHead></TableHead>
                      <TableHead 
                        className="text-right text-xs cursor-pointer select-none hover:bg-purple-500/10 transition-colors"
                        onClick={() => handleSort("p360Installs")}
                      >
                        <div className="flex items-center justify-end">
                          Installs
                          {getSortIcon("p360Installs", sortConfig)}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="text-right text-xs cursor-pointer select-none hover:bg-purple-500/10 transition-colors"
                        onClick={() => handleSort("p360Events")}
                      >
                        <div className="flex items-center justify-end">
                          Events
                          {getSortIcon("p360Events", sortConfig)}
                        </div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedMockData.map((row, index) => (
                      <TableRow 
                        key={row.id} 
                        className="hover:bg-muted/50 transition-colors group"
                      >
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {row.campaignName}
                            </div>
                            <div className="text-xs text-muted-foreground font-mono">
                              {row.bundleId}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <span className="font-semibold">{row.clicks.toLocaleString()}</span>
                            <MousePointerClick className="h-3.5 w-3.5 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <span className="font-semibold">{row.installs.toLocaleString()}</span>
                            <Badge variant="outline" className="text-xs px-1.5 py-0">
                              {((row.installs / row.clicks) * 100).toFixed(1)}%
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {row.events.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right bg-purple-500/5">
                          <span className="font-medium text-purple-600 dark:text-purple-400">
                            {row.p360Installs.toLocaleString()}
                          </span>
                        </TableCell>
                        <TableCell className="text-right bg-purple-500/5">
                          <span className="font-medium text-purple-600 dark:text-purple-400">
                            {row.p360Events.toLocaleString()}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Campaign Details by Source */}
        <Card className="border-t-4 border-t-green-500/20">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Campaign Details by Source</CardTitle>
                <CardDescription className="mt-1">
                  Drill down into specific campaign sources and performance
                </CardDescription>
              </div>
              <Badge variant="outline" className="gap-1">
                <Filter className="h-3 w-3" />
                {filteredDetailedData.length} Sources
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Enhanced Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-lg border bg-muted/30">
              {/* Campaign Filter */}
              <div className="space-y-2">
                <Label htmlFor="campaign-select" className="text-sm font-semibold flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Campaign
                </Label>
                <div className="flex gap-2">
                  <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
                    <SelectTrigger id="campaign-select" className="bg-background flex-1">
                      <SelectValue placeholder="Select a campaign..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4" />
                          <span>All Campaigns</span>
                        </div>
                      </SelectItem>
                      {campaigns.map((campaign) => {
                        const campaignData = mockData.find(c => c.campaignName === campaign);
                        return (
                          <SelectItem key={campaign} value={campaign}>
                            <div className="flex items-center gap-2">
                              {campaignData?.image && (
                                <img 
                                  src={campaignData.image} 
                                  alt={campaign}
                                  className="h-5 w-5 rounded object-cover"
                                />
                              )}
                              <span>{campaign}</span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  {selectedCampaign && selectedCampaign !== "all" && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleViewCampaignDetails(selectedCampaign)}
                        >
                          <ImageIcon className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>View campaign details</TooltipContent>
                    </Tooltip>
                  )}
                </div>
              </div>

              {/* Source Search Filter */}
              <div className="space-y-2">
                <Label htmlFor="source-search" className="text-sm font-semibold flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Source (3+ characters)
                </Label>
                <Input
                  id="source-search"
                  placeholder="Search source name..."
                  value={sourceSearch}
                  onChange={(e) => setSourceSearch(e.target.value)}
                  type="text"
                  className="bg-background"
                />
                {debouncedSourceSearch.length > 0 && debouncedSourceSearch.length < 3 && (
                  <p className="text-xs text-muted-foreground">
                    Type {3 - debouncedSourceSearch.length} more character(s) to search
                  </p>
                )}
              </div>
            </div>

            {/* Table */}
            <div className="rounded-lg border overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                      <TableHead 
                        className="w-[200px] cursor-pointer select-none hover:bg-muted/80 transition-colors"
                        onClick={() => handleSortDetail("source")}
                      >
                        <div className="flex items-center font-semibold">
                          Source
                          {getSortIcon("source", sortConfigDetail)}
                        </div>
                      </TableHead>
                      <TableHead className="w-[150px] font-semibold">PID</TableHead>
                      <TableHead 
                        className="text-right cursor-pointer select-none hover:bg-muted/80 transition-colors"
                        onClick={() => handleSortDetail("clicks")}
                      >
                        <div className="flex items-center justify-end font-semibold">
                          Clicks
                          {getSortIcon("clicks", sortConfigDetail)}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="text-right cursor-pointer select-none hover:bg-muted/80 transition-colors"
                        onClick={() => handleSortDetail("installs")}
                      >
                        <div className="flex items-center justify-end font-semibold">
                          Installs
                          {getSortIcon("installs", sortConfigDetail)}
                        </div>
                      </TableHead>
                      <TableHead colSpan={2} className="text-center bg-purple-500/5">
                        <div className="font-semibold flex items-center justify-center gap-1">
                          <span className="text-purple-600 dark:text-purple-400">P 360</span>
                        </div>
                      </TableHead>
                    </TableRow>
                    <TableRow className="bg-purple-500/5 hover:bg-purple-500/5">
                      <TableHead></TableHead>
                      <TableHead></TableHead>
                      <TableHead></TableHead>
                      <TableHead></TableHead>
                      <TableHead 
                        className="text-right text-xs cursor-pointer select-none hover:bg-purple-500/10 transition-colors"
                        onClick={() => handleSortDetail("p360Installs")}
                      >
                        <div className="flex items-center justify-end">
                          Installs
                          {getSortIcon("p360Installs", sortConfigDetail)}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="text-right text-xs cursor-pointer select-none hover:bg-purple-500/10 transition-colors"
                        onClick={() => handleSortDetail("p360Events")}
                      >
                        <div className="flex items-center justify-end">
                          Events
                          {getSortIcon("p360Events", sortConfigDetail)}
                        </div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDetailedData.length > 0 ? (
                      filteredDetailedData.map((row) => (
                        <TableRow 
                          key={row.id}
                          className="hover:bg-muted/50 transition-colors group"
                        >
                          <TableCell>
                            <div className="font-medium group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                              {row.source}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  onClick={() => handleCopyPid(row.pid)}
                                  className="group/pid flex items-center gap-2 hover:bg-muted/50 px-2 py-1 rounded transition-colors"
                                >
                                  <code className="text-xs text-muted-foreground">
                                    {row.pid}
                                  </code>
                                  {copiedPid === row.pid ? (
                                    <Check className="h-3 w-3 text-green-500" />
                                  ) : (
                                    <Copy className="h-3 w-3 opacity-0 group-hover/pid:opacity-100 transition-opacity" />
                                  )}
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>Click to copy PID</TooltipContent>
                            </Tooltip>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <span className="font-semibold">{row.clicks.toLocaleString()}</span>
                              <MousePointerClick className="h-3.5 w-3.5 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <span className="font-semibold">{row.installs.toLocaleString()}</span>
                              <Badge variant="outline" className="text-xs px-1.5 py-0">
                                {((row.installs / row.clicks) * 100).toFixed(1)}%
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell className="text-right bg-purple-500/5">
                            <span className="font-medium text-purple-600 dark:text-purple-400">
                              {row.p360Installs.toLocaleString()}
                            </span>
                          </TableCell>
                          <TableCell className="text-right bg-purple-500/5">
                            <span className="font-medium text-purple-600 dark:text-purple-400">
                              {row.p360Events.toLocaleString()}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="h-32">
                          <div className="flex flex-col items-center justify-center text-center space-y-3">
                            <div className="p-3 rounded-full bg-muted">
                              <Filter className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <div>
                              <p className="font-medium text-muted-foreground">No data found</p>
                              <p className="text-sm text-muted-foreground">
                                Try adjusting your filters or search criteria
                              </p>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Campaign Details Dialog */}
        <Dialog open={campaignDetailsOpen} onOpenChange={setCampaignDetailsOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                {selectedCampaignDetails?.image && (
                  <img 
                    src={selectedCampaignDetails.image} 
                    alt={selectedCampaignDetails.campaignName}
                    className="h-12 w-12 rounded-lg object-cover ring-2 ring-border"
                  />
                )}
                <div>
                  <div className="text-xl font-bold">{selectedCampaignDetails?.campaignName}</div>
                  <code className="text-xs text-muted-foreground font-normal">
                    {selectedCampaignDetails?.bundleId}
                  </code>
                </div>
              </DialogTitle>
              <DialogDescription>
                Detailed campaign information and performance metrics
              </DialogDescription>
            </DialogHeader>

            {selectedCampaignDetails && (
              <div className="space-y-6 py-4">
                {/* Campaign Image */}
                <div className="relative rounded-lg overflow-hidden border">
                  <img 
                    src={selectedCampaignDetails.image} 
                    alt={selectedCampaignDetails.campaignName}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-background/80 backdrop-blur-sm">
                      {selectedCampaignDetails.category}
                    </Badge>
                  </div>
                </div>

                {/* Campaign Info Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-500/10">
                          <CalendarDays className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Start Date</p>
                          <p className="text-sm font-semibold">
                            {format(new Date(selectedCampaignDetails.startDate), "MMM dd, yyyy")}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-orange-500/10">
                          <CalendarDays className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">End Date</p>
                          <p className="text-sm font-semibold">
                            {format(new Date(selectedCampaignDetails.endDate), "MMM dd, yyyy")}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-purple-500/10">
                          <Target className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Category</p>
                          <p className="text-sm font-semibold">{selectedCampaignDetails.category}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-green-500/10">
                          <Globe className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Bundle ID</p>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                onClick={() => handleCopyPid(selectedCampaignDetails.bundleId)}
                                className="text-sm font-mono hover:text-primary transition-colors flex items-center gap-1"
                              >
                                <span className="truncate max-w-[140px]">
                                  {selectedCampaignDetails.bundleId}
                                </span>
                                <Copy className="h-3 w-3" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>Click to copy</TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Description */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {selectedCampaignDetails.description}
                    </p>
                  </CardContent>
                </Card>

                {/* Performance Metrics */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Performance Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-3 rounded-lg bg-blue-500/5 border border-blue-500/10">
                        <MousePointerClick className="h-5 w-5 mx-auto mb-2 text-blue-600 dark:text-blue-400" />
                        <p className="text-2xl font-bold">{selectedCampaignDetails.clicks.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">Clicks</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-green-500/5 border border-green-500/10">
                        <Smartphone className="h-5 w-5 mx-auto mb-2 text-green-600 dark:text-green-400" />
                        <p className="text-2xl font-bold">{selectedCampaignDetails.installs.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">Installs</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-purple-500/5 border border-purple-500/10">
                        <Zap className="h-5 w-5 mx-auto mb-2 text-purple-600 dark:text-purple-400" />
                        <p className="text-2xl font-bold">{selectedCampaignDetails.events.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">Events</p>
                      </div>
                    </div>

                    <Separator className="my-4" />

                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 rounded-lg bg-orange-500/5 border border-orange-500/10">
                        <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
                          {selectedCampaignDetails.p360Installs.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">P360 Installs</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-orange-500/5 border border-orange-500/10">
                        <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
                          {selectedCampaignDetails.p360Events.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">P360 Events</p>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Conversion Rate:</span>
                        <Badge variant="outline" className="font-semibold">
                          {((selectedCampaignDetails.installs / selectedCampaignDetails.clicks) * 100).toFixed(2)}%
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
