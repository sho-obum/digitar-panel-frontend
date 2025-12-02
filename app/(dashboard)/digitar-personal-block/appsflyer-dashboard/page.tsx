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
  Target,
  Search
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
  event: string;
  p360installs: string;
  p360event: string;
  campaign_c?: string;
  date?: string;
  impressions?: string | number;
  conversion_rate?: string;
};

type CampaignPerformanceItem = {
  bundleid: string;
  campaign: string;
  campaigns?: string;
  clicks: string;
  installs: string;
  event: string;
  p360installs: string;
  p360event: string;
  campaign_c?: string;
  date?: string;
  impressions?: string | number;
  conversion_rate?: string;
};

export default function AppsflyerDashboard() {
  const [selectedCampaign, setSelectedCampaign] = useState<string>("");
  const [campaignNameSearch, setCampaignNameSearch] = useState<string>("");
  const [debouncedCampaignSearch, setDebouncedCampaignSearch] = useState<string>("");
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [campaignSearch, setCampaignSearch] = useState<string>(""); // Local search for campaign dropdown
  const [showDateColumn, setShowDateColumn] = useState(false);
  const [showCParamColumn, setShowCParamColumn] = useState(false);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: "asc" });
  const [sortConfigDetail, setSortConfigDetail] = useState<SortConfig>({ key: null, direction: "asc" });
  const [copiedPid, setCopiedPid] = useState<string | null>(null);
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
  const [searchTrigger, setSearchTrigger] = useState(0); // Timestamp to trigger search
  
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
  const searchDropdownRef = useRef<HTMLDivElement>(null);
  const [sourceDropdownWidth, setSourceDropdownWidth] = useState<number>(0);

  // Debounce campaign search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedCampaignSearch(campaignNameSearch);
      if (campaignNameSearch.length >= 3) {
        setShowSearchDropdown(true);
      } else {
        setShowSearchDropdown(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [campaignNameSearch]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (campaignDropdownRef.current && !campaignDropdownRef.current.contains(event.target as Node)) {
        setIsCampaignDropdownOpen(false);
      }
      if (sourceDropdownRef.current && !sourceDropdownRef.current.contains(event.target as Node)) {
        setIsSourceDropdownOpen(false);
      }
      if (searchDropdownRef.current && !searchDropdownRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Measure source dropdown width and sync badges container
  useEffect(() => {
    const measureDropdownWidth = () => {
      if (sourceDropdownRef.current) {
        const width = sourceDropdownRef.current.offsetWidth;
        setSourceDropdownWidth(width);
      }
    };

    // Measure on mount and window resize
    measureDropdownWidth();
    window.addEventListener("resize", measureDropdownWidth);
    
    // Use ResizeObserver for more accurate tracking
    if (sourceDropdownRef.current) {
      const observer = new ResizeObserver(measureDropdownWidth);
      observer.observe(sourceDropdownRef.current);
      return () => observer.disconnect();
    }

    return () => window.removeEventListener("resize", measureDropdownWidth);
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
          // Set default selection to "all" campaigns for Table 2
          setSelectedCampaign("all");
          setSelectedBundleId("");
          // Trigger initial fetch for Table 2 with default filters
          setSearchTrigger(Date.now());
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
            fromDate: format(dateRange.from, 'yyyy-MM-dd'),
            toDate: format(dateRange.to, 'yyyy-MM-dd'),
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
            campaign: item.campaigns || item.bundleid,
            event: item.event,
            p360installs: item.p360installs,
            p360event: item.p360event,
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

    // Reset to page 1 when date changes
    setCurrentPageTable1(1);
    
    fetchCampaignList();
    fetchCampaignPerformance();
  }, [dateRange]);

  // Fetch campaign performance when page changes (for Table 1 pagination)
  useEffect(() => {
    
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
            fromDate: format(dateRange.from, 'yyyy-MM-dd'),
            toDate: format(dateRange.to, 'yyyy-MM-dd'),
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
            campaign: item.campaigns || item.bundleid,
            event: item.event,
            p360installs: item.p360installs,
            p360event: item.p360event,
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
  }, [currentPageTable1, dateRange]);

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
      
      // ALWAYS use page 1 on initial search (when GO is clicked)
      const pageToUse = 1;
      
      console.log('[Table 2] Starting fetch...', { selectedCampaign, selectedSources, page: pageToUse, limit: PAGE_SIZE });
      const startTime = performance.now();
      try {
        // Build the request payload
        // Always use "all" for campaigns in Table 2, only filter by sources
        let bundleId = "all";
        let source = "all";

        if (selectedSources.length > 0) {
          source = selectedSources.join(",");
        }

        console.log('[Table 2] API Payload:', { bundle_id: bundleId, source: source, page: pageToUse, limit: PAGE_SIZE });

        const response = await fetch("/api/appsflyer-camp-details", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            bundle_id: bundleId,
            source: source,
            page: pageToUse,
            limit: PAGE_SIZE,
            fromDate: format(dateRange.from, 'yyyy-MM-dd'),
            toDate: format(dateRange.to, 'yyyy-MM-dd'),
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
          // Map API response to component type - use actual p360 values from API
          const enrichedData: CampDetailsItem[] = result.data.map((item: any) => ({
            bundleid: item.bundleid,
            source: item.source,
            pid: item.pid,
            clicks: item.clicks,
            installs: item.installs,
            event: item.event,
            p360installs: item.p360installs,
            p360event: item.p360event,
            campaign_c: item.campaign_c,
            date: item.date,
            impressions: item.impressions,
          }));
          setCampDetails(enrichedData);
          // Update pagination info from response
          setTotalPagesTable2(result.total_pages || 0);
          setTotalRecordsTable2(result.total || 0);
          // NOW update the state to page 1 after successful fetch
          setCurrentPageTable2(1);
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

    // Only fetch if user clicked GO button (searchTrigger changed)
    if (searchTrigger > 0) {
      // Reset to page 1 when date changes
      setCurrentPageTable2(1);
      fetchCampDetails();
    }
  }, [searchTrigger, dateRange]);

  // Fetch when pagination changes (only if hasSearched is true)
  useEffect(() => {
    const fetchCampDetails = async () => {
      setIsCampDetailsLoading(true);
      console.log('[Table 2 - Pagination] Fetching page...', { page: currentPageTable2, limit: PAGE_SIZE });
      const startTime = performance.now();
      try {
        let bundleId = "all";
        let source = "all";

        if (selectedSources.length > 0) {
          source = selectedSources.join(",");
        }

        console.log('[Table 2 - Pagination] API Payload:', { bundle_id: bundleId, source: source, page: currentPageTable2, limit: PAGE_SIZE });

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
            fromDate: format(dateRange.from, 'yyyy-MM-dd'),
            toDate: format(dateRange.to, 'yyyy-MM-dd'),
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch campaign details");
        }

        const result = await response.json();
        const endTime = performance.now();
        console.log(`[Table 2 - Pagination] Response in ${(endTime - startTime).toFixed(2)}ms`, { 
          page: currentPageTable2, 
          dataLength: result.data?.length 
        });
        
        if (result.success && Array.isArray(result.data)) {
          const enrichedData: CampDetailsItem[] = result.data.map((item: any) => ({
            bundleid: item.bundleid,
            source: item.source,
            pid: item.pid,
            clicks: item.clicks,
            installs: item.installs,
            event: item.event,
            p360installs: item.p360installs,
            p360event: item.p360event,
          }));
          setCampDetails(enrichedData);
          setTotalPagesTable2(result.total_pages || 0);
          setTotalRecordsTable2(result.total || 0);
        } else {
          toast.error("Invalid campaign details data format");
          setCampDetails([]);
          setTotalPagesTable2(0);
          setTotalRecordsTable2(0);
        }
      } catch (error) {
        console.error("[Table 2 - Pagination] Error:", error);
        toast.error("Failed to load campaign details");
        setCampDetails([]);
        setTotalPagesTable2(0);
        setTotalRecordsTable2(0);
      } finally {
        setIsCampDetailsLoading(false);
      }
    };

    // Only fetch on pagination changes if searchTrigger is set and we're past page 1
    if (searchTrigger > 0 && currentPageTable2 > 1) {
      fetchCampDetails();
    }
  }, [searchTrigger, currentPageTable2]);

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

  // Calculate summary stats from campaign performance data
  const summaryStats = useMemo(() => {
    const totalClicks = campaignPerformance.reduce((sum, item) => sum + parseInt(item.clicks), 0);
    const totalInstalls = campaignPerformance.reduce((sum, item) => sum + parseInt(item.installs), 0);
    const totalEvents = campaignPerformance.reduce((sum, item) => sum + parseInt(item.event), 0);
    const totalP360Installs = campaignPerformance.reduce((sum, item) => sum + parseInt(item.p360installs), 0);
    
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

  // Sort and filter campaign performance data
  const sortedCampaignPerformance = useMemo(() => {
    let filtered = campaignPerformance;
    
    // Apply campaign name search filter
    if (debouncedCampaignSearch.trim()) {
      filtered = filtered.filter(row => 
        row.campaign.toLowerCase().includes(debouncedCampaignSearch.toLowerCase())
      );
    }
    
    if (!sortConfig.key) return filtered;
    
    return [...filtered].sort((a, b) => {
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
  }, [sortConfig, campaignPerformance, debouncedCampaignSearch]);

  // Filter detailed data based on selected campaign and selected sources
  const filteredDetailedData = useMemo(() => {
    let filtered = campDetails.map(item => {
      // Find campaign name from campaignList using bundleid
      const campaignItem = campaignList.find(c => c.id === item.bundleid);
      const campaignName = campaignItem ? campaignItem.campaign : item.bundleid;
      
      return {
        id: Math.random(), // Use random id since API doesn't provide one
        bundleid: item.bundleid,
        campaignName: campaignName,
        source: item.source,
        pid: item.pid,
        clicks: parseInt(item.clicks),
        installs: parseInt(item.installs),
        event: parseInt(item.event),
        p360Installs: parseInt(item.p360installs),
        p360Events: parseInt(item.p360event),
        campaign_c: item.campaign_c,
        date: item.date,
        impressions: item.impressions ? parseInt(String(item.impressions)) : 0,
      };
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
  }, [campDetails, sortConfigDetail, campaignList]);

  const handleExportData = () => {
    // Export campaign performance data
    const headers = ["Campaign Name", "Bundle ID"];
    if (showDateColumn) headers.push("Date");
    headers.push("Clicks");
    if (showCParamColumn) headers.push("C Parameter");
    headers.push("Installs", "Events", "P360 Installs", "P360 Events", "Impressions");
    
    const csv = [
      headers,
      ...campaignPerformance.map(row => {
        const data = [row.campaign, row.bundleid];
        if (showDateColumn) data.push(row.date || '');
        data.push(row.clicks);
        if (showCParamColumn) data.push(row.campaign_c || '');
        data.push(row.installs, row.event, row.p360installs, row.p360event, String(row.impressions || 0));
        return data;
      }),
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

  const handleCampaignChange = (value: string) => {
    setSelectedCampaign(value);
    setSourceSearchInput("");
    setSelectedSources([]);
    setSearchTrigger(0); // RESET trigger - no fetch until GO button clicked
    
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
      return newState;
    });
    // Don't trigger anything - wait for GO button
  };

  // Handle GO button click
  const handleSearch = () => {
    // ALWAYS reset to page 1 when user clicks GO
    setCurrentPageTable2(1);
    // Then trigger the fetch
    setSearchTrigger(Date.now());
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

  // Filter campaigns based on local search in dropdown
  const filteredCampaignList = campaignList.filter(item =>
    item.campaign.toLowerCase().includes(campaignSearch.toLowerCase())
  );

  // Determine if we're showing campaigns or sources in Table 2's first column
  const isShowingCampaigns = selectedSources.length > 0;

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

        {/* Compact Summary Stats - Single Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Total Clicks */}
          <div className="relative overflow-hidden rounded-lg border bg-card p-3 border-l-4 border-l-blue-500 hover:shadow-md transition-all group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-0.5">Clicks</p>
                <p className="text-xl font-bold">{summaryStats.totalClicks.toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                  <TrendingUp className="h-2.5 w-2.5 text-green-500" />
                  {summaryStats.conversionRate.toFixed(2)}% CVR
                </p>
              </div>
              <MousePointerClick className="h-7 w-7 text-blue-500/70" />
            </div>
          </div>

          {/* Total Installs */}
          <div className="relative overflow-hidden rounded-lg border bg-card p-3 border-l-4 border-l-green-500 hover:shadow-md transition-all group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-0.5">Installs</p>
                <p className="text-xl font-bold">{summaryStats.totalInstalls.toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                  <TrendingUp className="h-2.5 w-2.5 text-green-500" />
                  {summaryStats.eventRate.toFixed(2)}% Events
                </p>
              </div>
              <Smartphone className="h-7 w-7 text-green-500/70" />
            </div>
          </div>

          {/* Total Events */}
          <div className="relative overflow-hidden rounded-lg border bg-card p-3 border-l-4 border-l-purple-500 hover:shadow-md transition-all group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-0.5">Events</p>
                <p className="text-xl font-bold">{summaryStats.totalEvents.toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">In-app actions</p>
              </div>
              <Zap className="h-7 w-7 text-purple-500/70" />
            </div>
          </div>

          {/* P360 Installs */}
          <div className="relative overflow-hidden rounded-lg border bg-card p-3 border-l-4 border-l-orange-500 hover:shadow-md transition-all group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-0.5">P360 Installs</p>
                <p className="text-xl font-bold">{summaryStats.totalP360Installs.toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Premium</p>
              </div>
              <BarChart3 className="h-7 w-7 text-orange-500/70" />
            </div>
          </div>
        </div>

        {/* Campaign Performance Table */}
        <Card className="border-t-4 border-t-blue-500/20">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Campaign Performance</CardTitle>
                <CardDescription className="mt-1 -mb-9">
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
            {/* Search and Column Toggle Controls */}
            <div className="flex flex-col sm:flex-row gap-4 mb-4 p-4 rounded-lg bg-muted/50 border">
              <div className="w-full sm:w-96" ref={searchDropdownRef}>
                <Label htmlFor="campaignNameSearch" className="text-sm font-medium mb-2 block">
                  Search Campaign
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="campaignNameSearch"
                    placeholder="Type at least 3 characters to search..."
                    value={campaignNameSearch}
                    onChange={(e) => setCampaignNameSearch(e.target.value)}
                    onFocus={() => {
                      if (campaignNameSearch.length >= 3) {
                        setShowSearchDropdown(true);
                      }
                    }}
                    className="pl-10"
                  />
                  {showSearchDropdown && sortedCampaignPerformance.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 border rounded-lg bg-background shadow-lg z-50 max-h-60 overflow-y-auto">
                      <div className="p-2">
                        <p className="text-xs text-muted-foreground mb-2">{sortedCampaignPerformance.length} result{sortedCampaignPerformance.length !== 1 ? 's' : ''} found</p>
                        {sortedCampaignPerformance.slice(0, 10).map((item, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              setCampaignNameSearch(item.campaign);
                              setShowSearchDropdown(false);
                            }}
                            className="w-full text-left px-3 py-2 hover:bg-muted rounded-md text-sm transition-colors"
                          >
                            <div className="font-medium">{item.campaign}</div>
                            <div className="text-xs text-muted-foreground">{item.bundleid}</div>
                          </button>
                        ))}
                        {sortedCampaignPerformance.length > 10 && (
                          <div className="text-xs text-center text-muted-foreground mt-2 py-1">
                            +{sortedCampaignPerformance.length - 10} more results
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4 mt-6">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="showDateColumn"
                    checked={showDateColumn}
                    onChange={(e) => setShowDateColumn(e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="showDateColumn" className="text-sm font-medium">
                    Show Date
                  </Label>
                </div>
                <div className="flex items-center space-x-2 ">
                  <input
                    type="checkbox"
                    id="showCParamColumn"
                    checked={showCParamColumn}
                    onChange={(e) => setShowCParamColumn(e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="showCParamColumn" className="text-sm font-medium">
                    Show C Parameter
                  </Label>
                </div>
              </div>
            </div>
            <div className="rounded-lg border overflow-hidden">
              <div className="overflow-x-auto max-h-[600px] overflow-y-auto relative [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-blue-100/20 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gradient-to-b [&::-webkit-scrollbar-thumb]:from-blue-400 [&::-webkit-scrollbar-thumb]:to-blue-600 [&::-webkit-scrollbar-thumb]:rounded-full">
                <Table>
                  <TableHeader className="sticky top-0 z-10 bg-background shadow-sm">
                    <TableRow className="border-b-2 border-blue-500/20">
                      <TableHead 
                        className={`text-center cursor-pointer select-none hover:bg-muted/80 transition-colors bg-background ${
                          showDateColumn && showCParamColumn ? 'text-[10px] px-1.5 py-0.5' : 
                          showDateColumn || showCParamColumn ? 'text-xs px-2 py-1' : 
                          'text-sm px-3 py-2'
                        }`}
                        onClick={() => handleSort("campaignName")}
                      >
                        <div className="flex items-center justify-center font-semibold">
                          Campaign Details
                          {getSortIcon("campaignName", sortConfig)}
                        </div>
                      </TableHead>
                      {showDateColumn && (
                        <TableHead 
                          className={`text-center cursor-pointer select-none hover:bg-muted/80 transition-colors bg-background ${
                            showCParamColumn ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-1'
                          }`}
                          onClick={() => handleSort("date")}
                        >
                          <div className="flex items-center justify-center font-semibold">
                            Date
                            {getSortIcon("date", sortConfig)}
                          </div>
                        </TableHead>
                      )}
                      <TableHead 
                        className={`text-center cursor-pointer select-none hover:bg-muted/80 transition-colors bg-background ${
                          showDateColumn && showCParamColumn ? 'text-[10px] px-1.5 py-0.5' : 
                          showDateColumn || showCParamColumn ? 'text-xs px-2 py-1' : 
                          'text-sm px-3 py-2'
                        }`}
                        onClick={() => handleSort("impressions")}
                      >
                        <div className="flex items-center justify-center font-semibold">
                          {showDateColumn && showCParamColumn ? 'Impr' : 'Impressions'}
                          {getSortIcon("impressions", sortConfig)}
                        </div>
                      </TableHead>
                      <TableHead 
                        className={`text-center cursor-pointer select-none hover:bg-muted/80 transition-colors bg-background ${
                          showDateColumn && showCParamColumn ? 'text-[10px] px-1.5 py-0.5' : 
                          showDateColumn || showCParamColumn ? 'text-xs px-2 py-1' : 
                          'text-sm px-3 py-2'
                        }`}
                        onClick={() => handleSort("clicks")}
                      >
                        <div className="flex items-center justify-center font-semibold">
                          {showDateColumn && showCParamColumn ? 'Clks' : 'Clicks'}
                          {getSortIcon("clicks", sortConfig)}
                        </div>
                      </TableHead>
                      {showCParamColumn && (
                        <TableHead 
                          className={`text-center cursor-pointer select-none hover:bg-muted/80 transition-colors bg-background ${
                            showDateColumn ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-1'
                          }`}
                          onClick={() => handleSort("campaign_c")}
                        >
                          <div className="flex items-center justify-center font-semibold">
                            C Parameter
                            {getSortIcon("campaign_c", sortConfig)}
                          </div>
                        </TableHead>
                      )}
                      <TableHead 
                        className={`text-center cursor-pointer select-none hover:bg-muted/80 transition-colors bg-background ${
                          showDateColumn && showCParamColumn ? 'text-[10px] px-1.5 py-0.5' : 
                          showDateColumn || showCParamColumn ? 'text-xs px-2 py-1' : 
                          'text-sm px-3 py-2'
                        }`}
                        onClick={() => handleSort("installs")}
                      >
                        <div className="flex items-center justify-center font-semibold">
                          {showDateColumn && showCParamColumn ? 'Inst' : 'Installs'}
                          {getSortIcon("installs", sortConfig)}
                        </div>
                      </TableHead>
                      <TableHead 
                        className={`text-center cursor-pointer select-none hover:bg-muted/80 transition-colors bg-background ${
                          showDateColumn && showCParamColumn ? 'text-[10px] px-1.5 py-0.5' : 
                          showDateColumn || showCParamColumn ? 'text-xs px-2 py-1' : 
                          'text-sm px-3 py-2'
                        }`}
                        onClick={() => handleSort("event")}
                      >
                        <div className="flex items-center justify-center font-semibold">
                          {showDateColumn && showCParamColumn ? 'Evts' : 'Events'}
                          {getSortIcon("event", sortConfig)}
                        </div>
                      </TableHead>
                      <TableHead 
                        className={`text-center cursor-pointer select-none hover:bg-purple-500/10 transition-colors bg-purple-500/5 ${
                          showDateColumn && showCParamColumn ? 'text-[10px] px-1.5 py-0.5' : 
                          showDateColumn || showCParamColumn ? 'text-xs px-2 py-1' : 
                          'text-sm px-3 py-2'
                        }`}
                        onClick={() => handleSort("p360installs")}
                      >
                        <div className="flex items-center justify-center font-semibold">
                          {showDateColumn && showCParamColumn ? 'P360I' : 'P360 Installs'}
                          {getSortIcon("p360installs", sortConfig)}
                        </div>
                      </TableHead>
                      <TableHead 
                        className={`text-center cursor-pointer select-none hover:bg-purple-500/10 transition-colors bg-purple-500/5 ${
                          showDateColumn && showCParamColumn ? 'text-[10px] px-1.5 py-0.5' : 
                          showDateColumn || showCParamColumn ? 'text-xs px-2 py-1' : 
                          'text-sm px-3 py-2'
                        }`}
                        onClick={() => handleSort("p360event")}
                      >
                        <div className="flex items-center justify-center font-semibold">
                          {showDateColumn && showCParamColumn ? 'P360E' : 'P360 Events'}
                          {getSortIcon("p360event", sortConfig)}
                        </div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isCampaignPerformanceLoading ? (
                      <>
                        {[...Array(10)].map((_, i) => (
                          <TableRow key={i}>
                            <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                            {showDateColumn && <TableCell><Skeleton className="h-8 w-24" /></TableCell>}
                            <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                            {showCParamColumn && <TableCell><Skeleton className="h-8 w-24" /></TableCell>}
                            <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                            <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                            <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                            <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                            <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                          </TableRow>
                        ))}
                      </>
                    ) : sortedCampaignPerformance.length > 0 ? (
                      sortedCampaignPerformance.map((row) => (
                        <TableRow 
                          key={row.bundleid} 
                          className={`hover:bg-muted/50 transition-colors group ${
                            showDateColumn && showCParamColumn ? 'text-[10px]' : 
                            showDateColumn || showCParamColumn ? 'text-xs' : 
                            'text-sm'
                          }`}
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
                          {showDateColumn && (
                            <TableCell className="text-center">
                              <div className="flex items-center justify-center">
                                <span className={showDateColumn && showCParamColumn ? 'text-[10px]' : showDateColumn || showCParamColumn ? 'text-xs' : 'text-sm'}>{row.date || '-'}</span>
                              </div>
                            </TableCell>
                          )}
                          <TableCell className="text-right">
                            <span className="font-semibold text-muted-foreground">{row.impressions ? parseInt(String(row.impressions)).toLocaleString() : '0'}</span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <span className="font-semibold">{parseInt(row.clicks).toLocaleString()}</span>
                              <MousePointerClick className="h-3.5 w-3.5 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </TableCell>
                          {showCParamColumn && (
                            <TableCell className="text-center">
                              <div className="flex items-center justify-center">
                                <span className={`font-mono ${showDateColumn && showCParamColumn ? 'text-[10px]' : showDateColumn || showCParamColumn ? 'text-xs' : 'text-sm'}`}>{row.campaign_c || '-'}</span>
                              </div>
                            </TableCell>
                          )}
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <span className="font-semibold">{parseInt(row.installs).toLocaleString()}</span>
                              <Badge variant="outline" className="text-xs px-1.5 py-0">
                                {parseInt(row.clicks) > 0 ? ((parseInt(row.installs) / parseInt(row.clicks)) * 100).toFixed(3) : '0'}%
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {parseInt(row.event).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right bg-purple-500/5">
                            <span className="font-medium text-purple-600 dark:text-purple-400">
                              {parseInt(row.p360installs).toLocaleString()}
                            </span>
                          </TableCell>
                          <TableCell className="text-right bg-purple-500/5">
                            <span className="font-medium text-purple-600 dark:text-purple-400">
                              {parseInt(row.p360event).toLocaleString()}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7 + (showDateColumn ? 1 : 0) + (showCParamColumn ? 1 : 0)} className="h-32">
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
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Campaign Details by Source</CardTitle>
                <CardDescription className="mt-0">
                  Drill down into specific campaign sources and performance
                </CardDescription>
              </div>
              <Badge variant="outline" className="gap-1">
                <Filter className="h-3 w-3" />
                {filteredDetailedData.length} Records (Page {currentPageTable2} of {totalPagesTable2})
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 -mt-6">
            {/* Enhanced Filters */}
            <div className="p-4 rounded-lg border bg-muted/50">
              {/* Single Row: Campaign (40%) | Source (40%) | Buttons (20%) */}
              <div className="flex items-start gap-3">
                {/* Campaign Filter - 40% */}
                <div className="flex-[0_0_40%] space-y-2" ref={campaignDropdownRef}>
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

              {/* Source Filter - 40% */}
              <div className="flex-[0_0_40%] space-y-2" ref={sourceDropdownRef}>
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
                  <div 
                    style={{ width: sourceDropdownWidth > 0 ? `${sourceDropdownWidth}px` : "auto" }}
                    className="flex gap-2 overflow-x-auto pb-2 mt-2 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-blue-100/20 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gradient-to-r [&::-webkit-scrollbar-thumb]:from-blue-400 [&::-webkit-scrollbar-thumb]:to-blue-600 [&::-webkit-scrollbar-thumb]:rounded-full"
                  >
                    {selectedSources.map(sourceName => {
                      const source = sourceList.find(s => s.source === sourceName);
                      return source ? (
                        <Badge key={sourceName} variant="secondary" className="gap-2 flex-shrink-0 whitespace-nowrap">
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

              {/* Buttons Section - 20% */}
              <div className="flex-[0_0_20%] flex flex-col gap-2 justify-end">
                <div className="flex items-center gap-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="showDateColumnDetail"
                      checked={showDateColumn}
                      onChange={(e) => setShowDateColumn(e.target.checked)}
                      className="rounded"
                    />
                    <Label htmlFor="showDateColumnDetail" className="text-xs font-medium">
                       Show Date
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="showCParamColumnDetail"
                      checked={showCParamColumn}
                      onChange={(e) => setShowCParamColumn(e.target.checked)}
                      className="rounded"
                    />
                    <Label htmlFor="showCParamColumnDetail" className="text-xs font-medium">
                       C Parameter
                    </Label>
                  </div>
                </div>
                <div className="flex justify-center">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        onClick={handleSearch}
                        size="icon"
                        className="bg-blue-600 hover:bg-blue-700 text-white min-w-30 mr-6"
                        title="Apply Filters" 
                      >
                        <Search className="h-4 w-4 mr-2" /> Apply Filter
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Apply Filters</TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </div>
            </div>

            {/* Table */}
            <div className="rounded-lg border overflow-hidden">
              <div className="overflow-x-auto max-h-[600px] overflow-y-auto relative [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-blue-100/20 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gradient-to-b [&::-webkit-scrollbar-thumb]:from-blue-400 [&::-webkit-scrollbar-thumb]:to-blue-600 [&::-webkit-scrollbar-thumb]:rounded-full">
                <Table>
                  <TableHeader className="sticky top-0 z-10 bg-background shadow-sm">
                    <TableRow className="border-b-2 border-green-500/20">
                      <TableHead 
                        className={`text-center cursor-pointer select-none hover:bg-muted/80 transition-colors bg-background ${
                          showDateColumn && showCParamColumn ? 'text-[10px] px-1.5 py-0.5' : 
                          showDateColumn || showCParamColumn ? 'text-xs px-2 py-1' : 
                          'text-sm px-3 py-2'
                        }`}
                        onClick={() => handleSortDetail("campaignName")}
                      >
                        <div className="flex items-center justify-center font-semibold">
                          Campaign
                          {getSortIcon("campaignName", sortConfigDetail)}
                        </div>
                      </TableHead>
                      {showDateColumn && (
                        <TableHead 
                          className={`text-center cursor-pointer select-none hover:bg-muted/80 transition-colors bg-background ${
                            showCParamColumn ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-1'
                          }`}
                          onClick={() => handleSortDetail("date")}
                        >
                          <div className="flex items-center justify-center font-semibold">
                            Date
                            {getSortIcon("date", sortConfigDetail)}
                          </div>
                        </TableHead>
                      )}
                      <TableHead className={`text-center font-semibold bg-background ${
                        showDateColumn && showCParamColumn ? 'text-[10px] px-1.5 py-0.5' : 
                        showDateColumn || showCParamColumn ? 'text-xs px-2 py-1' : 
                        'text-sm px-3 py-2'
                      }`}>PID</TableHead>
                      <TableHead 
                        className={`text-center cursor-pointer select-none hover:bg-muted/80 transition-colors bg-background ${
                          showDateColumn && showCParamColumn ? 'text-[10px] px-1.5 py-0.5' : 
                          showDateColumn || showCParamColumn ? 'text-xs px-2 py-1' : 
                          'text-sm px-3 py-2'
                        }`}
                        onClick={() => handleSortDetail("impressions")}
                      >
                        <div className="flex items-center justify-center font-semibold">
                          Impressions
                          {getSortIcon("impressions", sortConfigDetail)}
                        </div>
                      </TableHead>
                      <TableHead 
                        className={`text-center cursor-pointer select-none hover:bg-muted/80 transition-colors bg-background ${
                          showDateColumn && showCParamColumn ? 'text-[10px] px-1.5 py-0.5' : 
                          showDateColumn || showCParamColumn ? 'text-xs px-2 py-1' : 
                          'text-sm px-3 py-2'
                        }`}
                        onClick={() => handleSortDetail("clicks")}
                      >
                        <div className="flex items-center justify-center font-semibold">
                          Clicks
                          {getSortIcon("clicks", sortConfigDetail)}
                        </div>
                      </TableHead>
                      {showCParamColumn && (
                        <TableHead 
                          className={`text-center cursor-pointer select-none hover:bg-muted/80 transition-colors bg-background ${
                            showDateColumn ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-1'
                          }`}
                          onClick={() => handleSortDetail("campaign_c")}
                        >
                          <div className="flex items-center justify-center font-semibold">
                            C Parameter
                            {getSortIcon("campaign_c", sortConfigDetail)}
                          </div>
                        </TableHead>
                      )}
                      <TableHead 
                        className={`text-center cursor-pointer select-none hover:bg-muted/80 transition-colors bg-background ${
                          showDateColumn && showCParamColumn ? 'text-[10px] px-1.5 py-0.5' : 
                          showDateColumn || showCParamColumn ? 'text-xs px-2 py-1' : 
                          'text-sm px-3 py-2'
                        }`}
                        onClick={() => handleSortDetail("installs")}
                      >
                        <div className="flex items-center justify-center font-semibold">
                          Installs
                          {getSortIcon("installs", sortConfigDetail)}
                        </div>
                      </TableHead>
                      <TableHead 
                        className={`text-center cursor-pointer select-none hover:bg-muted/80 transition-colors bg-background ${
                          showDateColumn && showCParamColumn ? 'text-[10px] px-1.5 py-0.5' : 
                          showDateColumn || showCParamColumn ? 'text-xs px-2 py-1' : 
                          'text-sm px-3 py-2'
                        }`}
                        onClick={() => handleSortDetail("event")}
                      >
                        <div className="flex items-center justify-center font-semibold">
                          Events
                          {getSortIcon("event", sortConfigDetail)}
                        </div>
                      </TableHead>
                      <TableHead 
                        className={`text-center cursor-pointer select-none hover:bg-purple-500/10 transition-colors bg-purple-500/5 ${
                          showDateColumn && showCParamColumn ? 'text-[10px] px-1.5 py-0.5' : 
                          showDateColumn || showCParamColumn ? 'text-xs px-2 py-1' : 
                          'text-sm px-3 py-2'
                        }`}
                        onClick={() => handleSortDetail("p360Installs")}
                      >
                        <div className="flex items-center justify-center font-semibold">
                          P360 Installs
                          {getSortIcon("p360Installs", sortConfigDetail)}
                        </div>
                      </TableHead>
                      <TableHead 
                        className={`text-center cursor-pointer select-none hover:bg-purple-500/10 transition-colors bg-purple-500/5 ${
                          showDateColumn && showCParamColumn ? 'text-[10px] px-1.5 py-0.5' : 
                          showDateColumn || showCParamColumn ? 'text-xs px-2 py-1' : 
                          'text-sm px-3 py-2'
                        }`}
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
                      <>
                        {[...Array(10)].map((_, i) => (
                          <TableRow key={i}>
                            <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                            {showDateColumn && <TableCell><Skeleton className="h-8 w-24" /></TableCell>}
                            <TableCell><Skeleton className="h-8 w-32" /></TableCell>
                            <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                            {showCParamColumn && <TableCell><Skeleton className="h-8 w-24" /></TableCell>}
                            <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                            <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                            <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                            <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                          </TableRow>
                        ))}
                      </>
                    ) : filteredDetailedData.length > 0 ? (
                      filteredDetailedData.map((row) => (
                        <TableRow 
                          key={row.id}
                          className={`hover:bg-muted/50 transition-colors group ${
                            showDateColumn && showCParamColumn ? 'text-[10px]' : 
                            showDateColumn || showCParamColumn ? 'text-xs' : 
                            'text-sm'
                          }`}
                        >
                          <TableCell>
                            <div className="font-medium group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                              <div>{row.campaignName}</div>
                              <div className="text-[10px] text-muted-foreground font-normal mt-0.5">{row.bundleid || '-'}</div>
                            </div>
                          </TableCell>
                          {showDateColumn && (
                            <TableCell className="text-center">
                              <span className={showDateColumn && showCParamColumn ? 'text-[10px]' : showDateColumn || showCParamColumn ? 'text-xs' : 'text-sm'}>{row.date || '-'}</span>
                            </TableCell>
                          )}
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
                            <span className="font-semibold text-muted-foreground">{row.impressions ? row.impressions.toLocaleString() : '0'}</span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <span className="font-semibold">{row.clicks.toLocaleString()}</span>
                              <MousePointerClick className="h-3.5 w-3.5 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </TableCell>
                          {showCParamColumn && (
                            <TableCell className="text-center">
                              <span className={`font-mono ${showDateColumn && showCParamColumn ? 'text-[10px]' : showDateColumn || showCParamColumn ? 'text-xs' : 'text-sm'}`}>{row.campaign_c || '-'}</span>
                            </TableCell>
                          )}
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <span className="font-semibold">{row.installs.toLocaleString()}</span>
                              <Badge variant="outline" className="text-xs px-1.5 py-0">
                                {row.clicks > 0 ? ((row.installs / row.clicks) * 100).toFixed(3) : '0'}%
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {row.event.toLocaleString()}
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
                        <TableCell colSpan={7 + (showDateColumn ? 1 : 0) + (showCParamColumn ? 1 : 0)} className="h-32">
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
      </div>
    </TooltipProvider>
  );
}