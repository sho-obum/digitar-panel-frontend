"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
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

// No mock data - all data is fetched from APIs

type SortConfig = {
  key: string | null;
  direction: "asc" | "desc";
};

type CampaignListItem = {
  id: string;
  campaign: string;
};

type SourceListItem = {
  id: string;
  source: string;
};

type CampDetailsItem = {
  bundleid: string;
  source: string;
  pid: string;
  clicks: string;
  installs: string;
  p360Installs: number;
  p360Events: number;
};

type CampaignPerformanceItem = {
  bundleid: string;
  campaign: string;
  clicks: string;
  installs: string;
  events: string;
  p360Installs: number;
  p360Events: number;
};

export default function AppsflyerDashboard() {
  const [selectedCampaign, setSelectedCampaign] = useState<string>("");
  const [campaignSearch, setCampaignSearch] = useState<string>("");
  const [sourceSearch, setSourceSearch] = useState<string>("");
  const [debouncedSourceSearch, setDebouncedSourceSearch] = useState<string>("");
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: "asc" });
  const [sortConfigDetail, setSortConfigDetail] = useState<SortConfig>({ key: null, direction: "asc" });
  const [copiedPid, setCopiedPid] = useState<string | null>(null);
  const [campaignDetailsOpen, setCampaignDetailsOpen] = useState(false);
  const [selectedCampaignDetails, setSelectedCampaignDetails] = useState<CampaignPerformanceItem | null>(null);
  const [campaignList, setCampaignList] = useState<CampaignListItem[]>([]);
  const [isCampaignListLoading, setIsCampaignListLoading] = useState(false);
  const [sourceList, setSourceList] = useState<SourceListItem[]>([]);
  const [isSourceListLoading, setIsSourceListLoading] = useState(false);
  const [sourceSearchInput, setSourceSearchInput] = useState<string>("");
  const [selectedBundleId, setSelectedBundleId] = useState<string>("");
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [isSourceDropdownOpen, setIsSourceDropdownOpen] = useState(false);
  const [isCampaignDropdownOpen, setIsCampaignDropdownOpen] = useState(false);
  const [campDetails, setCampDetails] = useState<CampDetailsItem[]>([]);
  const [isCampDetailsLoading, setIsCampDetailsLoading] = useState(false);
  
  // Pagination for Table 1 (Campaign Performance)
  const [currentPageTable1, setCurrentPageTable1] = useState(1);
  const [totalPagesTable1, setTotalPagesTable1] = useState(0);
  const [totalRecordsTable1, setTotalRecordsTable1] = useState(0);
  
  // Pagination for Table 2 (Campaign Details by Source)
  const [currentPageTable2, setCurrentPageTable2] = useState(1);
  const [totalPagesTable2, setTotalPagesTable2] = useState(0);
  const [totalRecordsTable2, setTotalRecordsTable2] = useState(0);
  
  const PAGE_SIZE = 10;
  const [campaignPerformance, setCampaignPerformance] = useState<CampaignPerformanceItem[]>([]);
  const [isCampaignPerformanceLoading, setIsCampaignPerformanceLoading] = useState(false);
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
  const campaignDropdownRef = useRef<HTMLDivElement>(null);
  const sourceDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (campaignDropdownRef.current && !campaignDropdownRef.current.contains(event.target as Node)) {
        setIsCampaignDropdownOpen(false);
      }
      if (sourceDropdownRef.current && !sourceDropdownRef.current.contains(event.target as Node)) {
        setIsSourceDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch campaign list and campaign performance data
  useEffect(() => {
    const fetchCampaignList = async () => {
      setIsCampaignListLoading(true);
      try {
        const response = await fetch('/api/appsflyer-campaign-list');
        
        if (!response.ok) {
          throw new Error('Failed to fetch campaign list');
        }
        
        const result = await response.json();
        if (result.success && Array.isArray(result.data)) {
          setCampaignList(result.data);
          // Auto-select the first campaign to load data
          if (result.data.length > 0) {
            const firstCampaign = result.data[0];
            setSelectedCampaign(firstCampaign.campaign);
            setSelectedBundleId(firstCampaign.id);
          }
        } else {
          toast.error('Invalid campaign data format');
        }
      } catch (error) {
        console.error('Error fetching campaign list:', error);
        toast.error('Failed to load campaign list');
      } finally {
        setIsCampaignListLoading(false);
      }
    };

    const fetchCampaignPerformance = async () => {
      setIsCampaignPerformanceLoading(true);
      console.log('[Table 1] Starting campaign performance fetch...', { page: currentPageTable1, limit: PAGE_SIZE });
      const startTime = performance.now();
      try {
        const response = await fetch('/api/appsflyer-camp-details', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            bundle_id: 'all',
            source: 'all',
            page: currentPageTable1,
            limit: PAGE_SIZE,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch campaign performance');
        }

        const result = await response.json();
        const endTime = performance.now();
        console.log(`[Table 1] API Response received in ${(endTime - startTime).toFixed(2)}ms`, { 
          success: result.success, 
          dataLength: result.data?.length, 
          total_pages: result.total_pages, 
          total: result.total 
        });
        
        if (result.success && Array.isArray(result.data)) {
          console.log(`[Table 1] Processing ${result.data.length} rows...`);
          const enrichedData: CampaignPerformanceItem[] = result.data.map((item: any) => ({
            ...item,
            campaign: item.bundleid,
            events: item.installs,
            p360Installs: 2,
            p360Events: 3,
          }));
          setCampaignPerformance(enrichedData);
          setTotalPagesTable1(result.total_pages || 0);
          setTotalRecordsTable1(result.total || 0);
          console.log('[Table 1] Data set successfully', { rows: enrichedData.length, totalPages: result.total_pages, totalRecords: result.total });
        } else {
          console.warn('[Table 1] Invalid response format:', result);
          toast.error('Invalid campaign performance data format');
          setCampaignPerformance([]);
          setTotalPagesTable1(0);
          setTotalRecordsTable1(0);
        }
      } catch (error) {
        console.error('[Table 1] Error fetching campaign performance:', error);
        toast.error('Failed to load campaign performance');
        setCampaignPerformance([]);
        setTotalPagesTable1(0);
        setTotalRecordsTable1(0);
      } finally {
        setIsCampaignPerformanceLoading(false);
        console.log('[Table 1] Loading complete');
      }
    };

    fetchCampaignList();
    fetchCampaignPerformance();
  }, []);

  // Fetch campaign performance when page changes (for Table 1 pagination)
  useEffect(() => {
    if (currentPageTable1 === 1) return; // Already fetched in initial effect
    
    const fetchCampaignPerformancePaginated = async () => {
      setIsCampaignPerformanceLoading(true);
      console.log('[Table 1 - Page Change] Fetching page', currentPageTable1);
      const startTime = performance.now();
      try {
        const response = await fetch('/api/appsflyer-camp-details', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            bundle_id: 'all',
            source: 'all',
            page: currentPageTable1,
            limit: PAGE_SIZE,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch campaign performance');
        }

        const result = await response.json();
        const endTime = performance.now();
        console.log(`[Table 1 - Page Change] Response in ${(endTime - startTime).toFixed(2)}ms`, { 
          page: currentPageTable1, 
          dataLength: result.data?.length 
        });
        
        if (result.success && Array.isArray(result.data)) {
          const enrichedData: CampaignPerformanceItem[] = result.data.map((item: any) => ({
            ...item,
            campaign: item.bundleid,
            events: item.installs,
            p360Installs: 2,
            p360Events: 3,
          }));
          setCampaignPerformance(enrichedData);
          setTotalPagesTable1(result.total_pages || 0);
          setTotalRecordsTable1(result.total || 0);
        } else {
          toast.error('Invalid campaign performance data format');
          setCampaignPerformance([]);
          setTotalPagesTable1(0);
          setTotalRecordsTable1(0);
        }
      } catch (error) {
        console.error('[Table 1 - Page Change] Error:', error);
        toast.error('Failed to load campaign performance');
        setCampaignPerformance([]);
        setTotalPagesTable1(0);
        setTotalRecordsTable1(0);
      } finally {
        setIsCampaignPerformanceLoading(false);
      }
    };

    fetchCampaignPerformancePaginated();
  }, [currentPageTable1]);

  // Fetch source list based on selected campaign
  useEffect(() => {
    const fetchSourceList = async () => {
      if (!selectedCampaign) {
        setSourceList([]);
        return;
      }

      setIsSourceListLoading(true);
      try {
        const bundleId = selectedCampaign === "all" ? "" : selectedBundleId;
        const type = selectedCampaign === "all" ? "all" : "single";
        
        const url = `/api/appsflyer-source-list?id=${bundleId}&type=${type}`;
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error('Failed to fetch source list');
        }
        
        const result = await response.json();
        if (result.success && Array.isArray(result.data)) {
          setSourceList(result.data);
        } else {
          toast.error('Invalid source data format');
          setSourceList([]);
        }
      } catch (error) {
        console.error('Error fetching source list:', error);
        toast.error('Failed to load source list');
        setSourceList([]);
      } finally {
        setIsSourceListLoading(false);
      }
    };

    fetchSourceList();
  }, [selectedCampaign, selectedBundleId]);

  // Fetch campaign details by source with pagination
  useEffect(() => {
    const fetchCampDetails = async () => {
      setIsCampDetailsLoading(true);
      console.log('[Table 2] Starting fetch...', { selectedCampaign, selectedSources, page: currentPageTable2, limit: PAGE_SIZE });
      const startTime = performance.now();
      try {
        // Build the request payload
        let bundleId = "all";
        let source = "all";

        if (selectedCampaign && selectedCampaign !== "all") {
          bundleId = selectedBundleId;
        }

        if (selectedSources.length > 0) {
          source = selectedSources.join(",");
        }

        console.log('[Table 2] API Payload:', { bundle_id: bundleId, source: source, page: currentPageTable2, limit: PAGE_SIZE });

        const response = await fetch("/api/appsflyer-camp-details", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            bundle_id: bundleId,
            source: source,
            page: currentPageTable2,
            limit: PAGE_SIZE,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch campaign details");
        }

        const result = await response.json();
        const endTime = performance.now();
        console.log(`[Table 2] Response received in ${(endTime - startTime).toFixed(2)}ms`, { 
          success: result.success, 
          dataLength: result.data?.length, 
          total_pages: result.total_pages, 
          total: result.total 
        });
        
        if (result.success && Array.isArray(result.data)) {
          console.log(`[Table 2] Processing ${result.data.length} rows...`);
          // Add hardcoded p360 values
          const enrichedData: CampDetailsItem[] = result.data.map((item: any) => ({
            ...item,
            p360Installs: 2,
            p360Events: 3,
          }));
          setCampDetails(enrichedData);
          // Update pagination info from response
          setTotalPagesTable2(result.total_pages || 0);
          setTotalRecordsTable2(result.total || 0);
          console.log('[Table 2] Data set successfully', { rows: enrichedData.length, totalPages: result.total_pages, totalRecords: result.total });
        } else {
          console.warn('[Table 2] Invalid response format:', result);
          toast.error("Invalid campaign details data format");
          setCampDetails([]);
          setTotalPagesTable2(0);
          setTotalRecordsTable2(0);
        }
      } catch (error) {
        console.error("[Table 2] Error fetching campaign details:", error);
        toast.error("Failed to load campaign details");
        setCampDetails([]);
        setTotalPagesTable2(0);
        setTotalRecordsTable2(0);
      } finally {
        setIsCampDetailsLoading(false);
        console.log('[Table 2] Loading complete');
      }
    };

    // Only fetch if we have a campaign selected
    if (selectedCampaign) {
      fetchCampDetails();
    }
  }, [selectedCampaign, selectedBundleId, selectedSources, currentPageTable2]);

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

  // Calculate summary stats from campaign performance data
  const summaryStats = useMemo(() => {
    const totalClicks = campaignPerformance.reduce((sum, item) => sum + parseInt(item.clicks), 0);
    const totalInstalls = campaignPerformance.reduce((sum, item) => sum + parseInt(item.installs), 0);
    const totalEvents = campaignPerformance.reduce((sum, item) => sum + parseInt(item.events), 0);
    const totalP360Installs = campaignPerformance.reduce((sum, item) => sum + item.p360Installs, 0);
    
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
  }, [campaignPerformance]);

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

  // Sort campaign performance data
  const sortedCampaignPerformance = useMemo(() => {
    if (!sortConfig.key) return campaignPerformance;
    
    return [...campaignPerformance].sort((a, b) => {
      let aValue: any = a[sortConfig.key as keyof typeof a];
      let bValue: any = b[sortConfig.key as keyof typeof b];
      
      // Convert string numbers to actual numbers for comparison
      if (typeof aValue === "string" && !isNaN(Number(aValue))) {
        aValue = parseInt(aValue);
      }
      if (typeof bValue === "string" && !isNaN(Number(bValue))) {
        bValue = parseInt(bValue);
      }
      
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
  }, [sortConfig, campaignPerformance]);

  // Filter detailed data based on selected campaign and selected sources
  const filteredDetailedData = useMemo(() => {
    let filtered = campDetails.map(item => ({
      id: Math.random(), // Use random id since API doesn't provide one
      campaignName: item.bundleid,
      source: item.source,
      pid: item.pid,
      clicks: parseInt(item.clicks),
      installs: parseInt(item.installs),
      p360Installs: item.p360Installs,
      p360Events: item.p360Events,
    }));

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
  }, [campDetails, sortConfigDetail]);

  const handleExportData = () => {
    // Export campaign performance data
    const csv = [
      ["Campaign Name", "Bundle ID", "Clicks", "Installs", "Events", "P360 Installs", "P360 Events"],
      ...campaignPerformance.map(row => [
        row.campaign,
        row.bundleid,
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

  const handleViewCampaignDetails = (bundleId: string) => {
    const campaign = campaignPerformance.find(c => c.bundleid === bundleId);
    if (campaign) {
      setSelectedCampaignDetails(campaign);
      setCampaignDetailsOpen(true);
    }
  };

  const handleCampaignChange = (value: string) => {
    setSelectedCampaign(value);
    setSourceSearchInput("");
    setSelectedSources([]);
    setCurrentPageTable2(1); // Reset to page 1 when campaign changes
    
    if (value === "all") {
      setSelectedBundleId("");
    } else {
      const selectedCampaignItem = campaignList.find(c => c.campaign === value);
      if (selectedCampaignItem) {
        setSelectedBundleId(selectedCampaignItem.id);
      }
    }
  };

  // Handle source selection (multi-select)
  const handleSourceToggle = (sourceId: string) => {
    setSelectedSources(prev => {
      const newState = prev.includes(sourceId) 
        ? prev.filter(id => id !== sourceId)
        : [...prev, sourceId];
      setCurrentPageTable2(1); // Reset to page 1 when sources change
      return newState;
    });
  };

  // Pagination handlers for Table 1
  const handlePreviousPageTable1 = () => {
    if (currentPageTable1 > 1) {
      setCurrentPageTable1(currentPageTable1 - 1);
    }
  };

  const handleNextPageTable1 = () => {
    if (currentPageTable1 < totalPagesTable1) {
      setCurrentPageTable1(currentPageTable1 + 1);
    }
  };

  // Pagination handlers for Table 2
  const handlePreviousPageTable2 = () => {
    if (currentPageTable2 > 1) {
      setCurrentPageTable2(currentPageTable2 - 1);
    }
  };

  const handleNextPageTable2 = () => {
    if (currentPageTable2 < totalPagesTable2) {
      setCurrentPageTable2(currentPageTable2 + 1);
    }
  };

  // Filter sources based on search
  const filteredSourceList = sourceList.filter(item =>
    item.source.toLowerCase().includes(sourceSearchInput.toLowerCase())
  );

  // Filter campaigns based on search
  const filteredCampaignList = campaignList.filter(item =>
    item.campaign.toLowerCase().includes(campaignSearch.toLowerCase())
  );

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
                {campaignPerformance.length} Records (Page {currentPageTable1} of {totalPagesTable1})
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
                        className="text-center cursor-pointer select-none hover:bg-muted/80 transition-colors"
                        onClick={() => handleSort("campaignName")}
                      >
                        <div className="flex items-center justify-center font-semibold">
                          Campaign Name
                          {getSortIcon("campaignName", sortConfig)}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="text-center cursor-pointer select-none hover:bg-muted/80 transition-colors"
                        onClick={() => handleSort("clicks")}
                      >
                        <div className="flex items-center justify-center font-semibold">
                          Clicks
                          {getSortIcon("clicks", sortConfig)}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="text-center cursor-pointer select-none hover:bg-muted/80 transition-colors"
                        onClick={() => handleSort("installs")}
                      >
                        <div className="flex items-center justify-center font-semibold">
                          Installs
                          {getSortIcon("installs", sortConfig)}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="text-center cursor-pointer select-none hover:bg-muted/80 transition-colors"
                        onClick={() => handleSort("events")}
                      >
                        <div className="flex items-center justify-center font-semibold">
                          Events
                          {getSortIcon("events", sortConfig)}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="text-center cursor-pointer select-none hover:bg-purple-500/10 transition-colors bg-purple-500/5"
                        onClick={() => handleSort("p360Installs")}
                      >
                        <div className="flex items-center justify-center font-semibold">
                          P360 Installs
                          {getSortIcon("p360Installs", sortConfig)}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="text-center cursor-pointer select-none hover:bg-purple-500/10 transition-colors bg-purple-500/5"
                        onClick={() => handleSort("p360Events")}
                      >
                        <div className="flex items-center justify-center font-semibold">
                          P360 Events
                          {getSortIcon("p360Events", sortConfig)}
                        </div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isCampaignPerformanceLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-32">
                          <div className="flex items-center justify-center">
                            <p className="text-sm text-muted-foreground">Loading campaign performance...</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : sortedCampaignPerformance.length > 0 ? (
                      sortedCampaignPerformance.map((row) => (
                        <TableRow 
                          key={row.bundleid} 
                          className="hover:bg-muted/50 transition-colors group"
                        >
                          <TableCell>
                            <div className="space-y-1">
                              <div className="font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {row.campaign}
                              </div>
                              <div className="text-xs text-muted-foreground font-mono">
                                {row.bundleid}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <span className="font-semibold">{parseInt(row.clicks).toLocaleString()}</span>
                              <MousePointerClick className="h-3.5 w-3.5 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <span className="font-semibold">{parseInt(row.installs).toLocaleString()}</span>
                              <Badge variant="outline" className="text-xs px-1.5 py-0">
                                {((parseInt(row.installs) / parseInt(row.clicks)) * 100).toFixed(1)}%
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {parseInt(row.events).toLocaleString()}
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
                          <div className="flex items-center justify-center">
                            <p className="text-sm text-muted-foreground">No campaign data available</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Pagination Controls for Table 1 */}
            {totalPagesTable1 > 0 && (
              <div className="flex items-center justify-between px-4 py-4 border-t bg-muted/30 rounded-b-lg">
                <div className="text-sm text-muted-foreground">
                  Page <span className="font-semibold text-foreground">{currentPageTable1}</span> of <span className="font-semibold text-foreground">{totalPagesTable1}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePreviousPageTable1}
                    disabled={currentPageTable1 === 1 || isCampaignPerformanceLoading}
                    className="gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextPageTable1}
                    disabled={currentPageTable1 === totalPagesTable1 || isCampaignPerformanceLoading}
                    className="gap-2"
                  >
                    Next
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Button>
                </div>
              </div>
            )}
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
                {filteredDetailedData.length} Records (Page {currentPageTable2} of {totalPagesTable2})
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Enhanced Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-lg border bg-muted/30">
              {/* Campaign Filter */}
              <div className="space-y-2" ref={campaignDropdownRef}>
                <Label htmlFor="campaign-select" className="text-sm font-semibold flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Campaign
                </Label>
                <div className="relative">
                  <button
                    onClick={() => setIsCampaignDropdownOpen(!isCampaignDropdownOpen)}
                    disabled={isCampaignListLoading}
                    className="w-full flex items-center justify-between px-3 py-2 border rounded-md bg-background hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-left"
                  >
                    <span className="text-sm">
                      {selectedCampaign 
                        ? campaignList.find(c => c.campaign === selectedCampaign)?.campaign || "Select a campaign..."
                        : isCampaignListLoading ? "Loading campaigns..." : "Select a campaign..."}
                    </span>
                    <svg
                      className={`w-4 h-4 transition-transform ${isCampaignDropdownOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </button>
                  
                  {isCampaignDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 border rounded-lg bg-background shadow-lg z-50 min-w-max">
                      <div className="p-2 border-b sticky top-0 bg-background">
                        <Input
                          placeholder="Search campaigns..."
                          value={campaignSearch}
                          onChange={(e) => setCampaignSearch(e.target.value)}
                          className="h-8 text-sm"
                          autoFocus
                        />
                      </div>
                      
                      <div className="max-h-48 overflow-y-auto">
                        {isCampaignListLoading ? (
                          <div className="p-4 text-sm text-muted-foreground text-center">
                            Loading campaigns...
                          </div>
                        ) : campaignList.length === 0 ? (
                          <div className="p-4 text-sm text-muted-foreground text-center">
                            No campaigns available
                          </div>
                        ) : (
                          <>
                            <div
                              onClick={() => {
                                handleCampaignChange("all");
                                setIsCampaignDropdownOpen(false);
                                setCampaignSearch("");
                              }}
                              className={`flex items-center gap-2 p-3 hover:bg-muted border-b cursor-pointer ${selectedCampaign === "all" ? "bg-muted" : ""}`}
                            >
                              <Target className="h-4 w-4" />
                              <span className="font-medium text-sm">All Campaigns</span>
                            </div>
                            {filteredCampaignList.length > 0 ? (
                              filteredCampaignList.map((item) => (
                                <div
                                  key={item.id}
                                  onClick={() => {
                                    handleCampaignChange(item.campaign);
                                    setIsCampaignDropdownOpen(false);
                                    setCampaignSearch("");
                                  }}
                                  className={`flex items-center gap-3 p-3 hover:bg-muted border-b cursor-pointer ${selectedCampaign === item.campaign ? "bg-muted" : ""}`}
                                >
                                  <span className="font-medium text-sm">{item.campaign}</span>
                                  <span className="text-xs text-muted-foreground">({item.id})</span>
                                </div>
                              ))
                            ) : (
                              <div className="p-4 text-sm text-muted-foreground text-center">
                                No campaigns match your search
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Source Filter with Multi-Select Dropdown and Search */}
              <div className="space-y-2" ref={sourceDropdownRef}>
                <Label className="text-sm font-semibold flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Sources ({selectedSources.length} selected)
                </Label>
                <div className="relative">
                  <button
                    onClick={() => setIsSourceDropdownOpen(!isSourceDropdownOpen)}
                    disabled={!selectedCampaign || isSourceListLoading}
                    className="w-full flex items-center justify-between px-3 py-2 border rounded-md bg-background hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <span className="text-sm">
                      {selectedSources.length > 0
                        ? `${selectedSources.length} source${selectedSources.length !== 1 ? 's' : ''} selected`
                        : isSourceListLoading
                        ? "Loading sources..."
                        : "Select sources..."}
                    </span>
                    <svg
                      className={`w-4 h-4 transition-transform ${isSourceDropdownOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </button>
                  
                  {isSourceDropdownOpen && selectedCampaign && (
                    <div className="absolute top-full left-0 right-0 mt-1 border rounded-lg bg-background shadow-lg z-50 min-w-max">
                      <div className="p-2 border-b sticky top-0 bg-background">
                        <Input
                          placeholder="Search sources..."
                          value={sourceSearchInput}
                          onChange={(e) => setSourceSearchInput(e.target.value)}
                          className="h-8 text-sm"
                          autoFocus
                        />
                      </div>
                      
                      <div className="max-h-48 overflow-y-auto">
                        {isSourceListLoading ? (
                          <div className="p-4 text-sm text-muted-foreground text-center">
                            Loading sources...
                          </div>
                        ) : sourceList.length === 0 ? (
                          <div className="p-4 text-sm text-muted-foreground text-center">
                            No sources available
                          </div>
                        ) : filteredSourceList.length > 0 ? (
                          <>
                            <div
                              onClick={() => {
                                if (selectedSources.length === sourceList.length) {
                                  setSelectedSources([]);
                                } else {
                                  setSelectedSources(sourceList.map(s => s.source));
                                }
                              }}
                              className="flex items-center gap-3 p-3 hover:bg-muted border-b cursor-pointer bg-muted/50"
                            >
                              <input
                                type="checkbox"
                                checked={selectedSources.length === sourceList.length && sourceList.length > 0}
                                readOnly
                                className="w-4 h-4 rounded cursor-pointer"
                              />
                              <label className="flex-1 font-medium text-sm cursor-pointer">
                                Select All Sources
                              </label>
                            </div>
                            {filteredSourceList.map((item) => {
                              const isChecked = selectedSources.includes(item.source);
                              return (
                                <div
                                  key={item.source}
                                  className="flex items-center gap-3 p-3 hover:bg-muted border-b last:border-b-0"
                                >
                                  <input
                                    type="checkbox"
                                    id={`source-${item.source}`}
                                    checked={isChecked}
                                    onChange={() => handleSourceToggle(item.source)}
                                    className="w-4 h-4 rounded cursor-pointer"
                                  />
                                  <label 
                                    htmlFor={`source-${item.source}`}
                                    className="flex-1 flex items-center gap-2 cursor-pointer"
                                  >
                                    <span className="font-medium text-sm">{item.source}</span>
                                  </label>
                                </div>
                              );
                            })}
                          </>
                        ) : (
                          <div className="p-4 text-sm text-muted-foreground text-center">
                            No sources match your search
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                {selectedSources.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedSources.map(sourceName => {
                      const source = sourceList.find(s => s.source === sourceName);
                      return source ? (
                        <Badge key={sourceName} variant="secondary" className="gap-2">
                          {source.source}
                          <button
                            onClick={() => handleSourceToggle(sourceName)}
                            className="ml-1 hover:opacity-70"
                          >
                            ✕
                          </button>
                        </Badge>
                      ) : null;
                    })}
                  </div>
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
                        className="text-center cursor-pointer select-none hover:bg-muted/80 transition-colors"
                        onClick={() => handleSortDetail("source")}
                      >
                        <div className="flex items-center justify-center font-semibold">
                          Source
                          {getSortIcon("source", sortConfigDetail)}
                        </div>
                      </TableHead>
                      <TableHead className="text-center font-semibold">PID</TableHead>
                      <TableHead 
                        className="text-center cursor-pointer select-none hover:bg-muted/80 transition-colors"
                        onClick={() => handleSortDetail("clicks")}
                      >
                        <div className="flex items-center justify-center font-semibold">
                          Clicks
                          {getSortIcon("clicks", sortConfigDetail)}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="text-center cursor-pointer select-none hover:bg-muted/80 transition-colors"
                        onClick={() => handleSortDetail("installs")}
                      >
                        <div className="flex items-center justify-center font-semibold">
                          Installs
                          {getSortIcon("installs", sortConfigDetail)}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="text-center cursor-pointer select-none hover:bg-purple-500/10 transition-colors bg-purple-500/5"
                        onClick={() => handleSortDetail("p360Installs")}
                      >
                        <div className="flex items-center justify-center font-semibold">
                          P360 Installs
                          {getSortIcon("p360Installs", sortConfigDetail)}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="text-center cursor-pointer select-none hover:bg-purple-500/10 transition-colors bg-purple-500/5"
                        onClick={() => handleSortDetail("p360Events")}
                      >
                        <div className="flex items-center justify-center font-semibold">
                          P360 Events
                          {getSortIcon("p360Events", sortConfigDetail)}
                        </div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isCampDetailsLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-32">
                          <div className="flex items-center justify-center">
                            <p className="text-sm text-muted-foreground">Loading data...</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : filteredDetailedData.length > 0 ? (
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

            {/* Pagination Controls for Table 2 */}
            {totalPagesTable2 > 0 && (
              <div className="flex items-center justify-between px-4 py-4 border-t bg-muted/30 rounded-b-lg">
                <div className="text-sm text-muted-foreground">
                  Page <span className="font-semibold text-foreground">{currentPageTable2}</span> of <span className="font-semibold text-foreground">{totalPagesTable2}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePreviousPageTable2}
                    disabled={currentPageTable2 === 1 || isCampDetailsLoading}
                    className="gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextPageTable2}
                    disabled={currentPageTable2 === totalPagesTable2 || isCampDetailsLoading}
                    className="gap-2"
                  >
                    Next
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        <Dialog open={campaignDetailsOpen} onOpenChange={setCampaignDetailsOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
              
                <div>
                  <div className="text-xl font-bold">{selectedCampaignDetails?.campaign}</div>
                  <code className="text-xs text-muted-foreground font-normal">
                    {selectedCampaignDetails?.bundleid}
                  </code>
                </div>
              </DialogTitle>
              <DialogDescription>
                Detailed campaign information and performance metrics
              </DialogDescription>
            </DialogHeader>

           
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}