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
  Search,
  Lock,
  Settings2,
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
  payableEvent: any;
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
  const [debouncedCampaignSearch, setDebouncedCampaignSearch] =
    useState<string>("");
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [campaignSearch, setCampaignSearch] = useState<string>("");
  const [campaignSearch2, setCampaignSearch2] = useState<string>("");
  const [showDateColumnTable1, setShowDateColumnTable1] = useState(false);
  const [showCParamColumnTable1, setShowCParamColumnTable1] = useState(false);
  const [showDateColumnTable2, setShowDateColumnTable2] = useState(false);
  const [showCParamColumnTable2, setShowCParamColumnTable2] = useState(false);
  const [showPidColumn, setShowPidColumn] = useState(false);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: null,
    direction: "asc",
  });
  const [sortConfigDetail, setSortConfigDetail] = useState<SortConfig>({
    key: null,
    direction: "asc",
  });
  const [copiedPid, setCopiedPid] = useState<string | null>(null);
  const [campaignList, setCampaignList] = useState<CampaignListItem[]>([]);
  const [campaignList2, setCampaignList2] = useState<CampaignListItem[]>([]);
  const [isCampaignListLoading, setIsCampaignListLoading] = useState(false);
  const [selectedCampaignTable1, setSelectedCampaignTable1] =
    useState<string>("all");
  const [selectedBundleIdTable1, setSelectedBundleIdTable1] =
    useState<string>("");
  const [isCampaignDropdownOpenTable1, setIsCampaignDropdownOpenTable1] =
    useState(false);
  const [campaignSearchTable1, setCampaignSearchTable1] = useState<string>("");
  const [sourceList, setSourceList] = useState<SourceListItem[]>([]);
  const [isSourceListLoading, setIsSourceListLoading] = useState(false);
  const [sourceSearchInput, setSourceSearchInput] = useState<string>("");
  const [selectedBundleId, setSelectedBundleId] = useState<string>("");
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [isSourceDropdownOpen, setIsSourceDropdownOpen] = useState(false);
  const [isCampaignDropdownOpen, setIsCampaignDropdownOpen] = useState(false);
  const [searchTrigger, setSearchTrigger] = useState(0);

  // Table 1 State with TWO separate data arrays
  const [table1State, setTable1State] = useState({
    datewiseData: [] as CampaignPerformanceItem[],
    aggregatedData: [] as CampaignPerformanceItem[],
    loading: false,
    currentPage: 1,
    datewiseTotalPages: 0,
    aggregatedTotalPages: 0,
    datewiseTotalRecords: 0,
    aggregatedTotalRecords: 0,
  });

  // Table 2 State - Simple single data array
  const [table2State, setTable2State] = useState({
    data: [] as CampDetailsItem[],
    loading: false,
    currentPage: 1,
    totalPages: 0,
    totalRecords: 0,
  });

  const PAGE_SIZE = 10;
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
  const campaignDropdownRefTable1 = useRef<HTMLDivElement>(null);
  const sourceDropdownRef = useRef<HTMLDivElement>(null);
  const searchDropdownRef = useRef<HTMLDivElement>(null);
  const [sourceDropdownWidth, setSourceDropdownWidth] = useState<number>(0);

  // Reusable API fetch function
  const fetchAppsflyerData = async (params: {
    bundle_id: string;
    source: string;
    page: number;
    limit: number;
    fromDate: string;
    toDate: string;
  }) => {
    const response = await fetch("/api/appsflyer-camp-details", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch data");
    }

    return response.json();
  };

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
      if (
        campaignDropdownRef.current &&
        !campaignDropdownRef.current.contains(event.target as Node)
      ) {
        setIsCampaignDropdownOpen(false);
      }
      if (
        campaignDropdownRefTable1.current &&
        !campaignDropdownRefTable1.current.contains(event.target as Node)
      ) {
        setIsCampaignDropdownOpenTable1(false);
      }
      if (
        sourceDropdownRef.current &&
        !sourceDropdownRef.current.contains(event.target as Node)
      ) {
        setIsSourceDropdownOpen(false);
      }
      if (
        searchDropdownRef.current &&
        !searchDropdownRef.current.contains(event.target as Node)
      ) {
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

  // Fetch campaign list on mount and when date changes
  useEffect(() => {
    const fetchCampaignList = async () => {
      setIsCampaignListLoading(true);
      try {
        const response = await fetch(
          `/api/appsflyer-campaign-list?fromDate=${format(
            dateRange.from,
            "yyyy-MM-dd"
          )}&toDate=${format(dateRange.to, "yyyy-MM-dd")}`
        );

        if (!response.ok) throw new Error("Failed to fetch campaign list");

        const result = await response.json();
        if (result.success && Array.isArray(result.data)) {
          setCampaignList(result.data);
          setCampaignList2(result.data);
          setSelectedCampaign("all");
          setSelectedBundleId("");
          setSelectedCampaignTable1("all");
          setSelectedBundleIdTable1("all");
          setSearchTrigger(Date.now());
        } else {
          toast.error("Invalid campaign data format");
        }
      } catch (error) {
        toast.error("Failed to load campaign list");
      } finally {
        setIsCampaignListLoading(false);
      }
    };

    setTable1State((prev) => ({ ...prev, currentPage: 1 }));
    fetchCampaignList();
  }, [dateRange]);

  // Fetch Table 1 (Campaign Performance) - Fetch BOTH datewise and aggregated
  useEffect(() => {
    const fetchTable1Data = async () => {
      console.log("\n🔄 TABLE 1 FETCH TRIGGERED");
      console.log("📌 selectedCampaignTable1:", selectedCampaignTable1);
      console.log("📌 selectedBundleIdTable1:", selectedBundleIdTable1);
      console.log("📌 currentPage:", table1State.currentPage);

      setTable1State((prev) => ({ ...prev, loading: true }));

      const endpoint = "/api/appsflyer-camp-details-by-date";
      const currentPage = table1State.currentPage;
      const bundleIdFilter =
        selectedCampaignTable1 === "all" ? "all" : selectedBundleIdTable1;

      console.log("🎯 bundleIdFilter calculated:", bundleIdFilter);

      try {
        const datewisePayload = {
          page: currentPage,
          limit: PAGE_SIZE,
          fromDate: format(dateRange.from, "yyyy-MM-dd"),
          toDate: format(dateRange.to, "yyyy-MM-dd"),
          showDate: true,
          bundle_id: bundleIdFilter,
        };

        const aggregatedPayload = {
          page: currentPage,
          limit: PAGE_SIZE,
          fromDate: format(dateRange.from, "yyyy-MM-dd"),
          toDate: format(dateRange.to, "yyyy-MM-dd"),
          showDate: false,
          bundle_id: bundleIdFilter,
        };

        console.log(
          "📊 TABLE 1 - DATEWISE Payload (showDate: true):",
          JSON.stringify(datewisePayload, null, 2)
        );
        console.log(
          "📊 TABLE 1 - AGGREGATED Payload (showDate: false):",
          JSON.stringify(aggregatedPayload, null, 2)
        );

        const [datewiseResponse, aggregatedResponse] = await Promise.all([
          // Datewise data (showDate: true)
          fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datewisePayload),
          }),
          // Aggregated data (showDate: false)
          fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(aggregatedPayload),
          }),
        ]);

        if (!datewiseResponse.ok || !aggregatedResponse.ok) {
          throw new Error("Failed to fetch data");
        }

        const [datewiseResult, aggregatedResult] = await Promise.all([
          datewiseResponse.json(),
          aggregatedResponse.json(),
        ]);

        console.log("✅ TABLE 1 - Datewise Response:", datewiseResult);
        console.log(
          "✅ TABLE 1 - Datewise Data Count:",
          datewiseResult.data?.length || 0
        );
        console.log("✅ TABLE 1 - Aggregated Response:", aggregatedResult);
        console.log(
          "✅ TABLE 1 - Aggregated Data Count:",
          aggregatedResult.data?.length || 0
        );

        // Process datewise data
        const datewiseData =
          datewiseResult.success && Array.isArray(datewiseResult.data)
            ? datewiseResult.data.map((item: any) => ({
                ...item,
                campaign: item.campaigns || item.bundleid,
                event: item.event,
                p360installs: item.p360installs,
                p360event: item.p360event,
              }))
            : [];

        // Process aggregated data
        const aggregatedData =
          aggregatedResult.success && Array.isArray(aggregatedResult.data)
            ? aggregatedResult.data.map((item: any) => ({
                ...item,
                campaign: item.campaigns || item.bundleid,
                event: item.event,
                p360installs: item.p360installs,
                p360event: item.p360event,
              }))
            : [];

        console.log("📦 TABLE 1 - Processed Arrays:", {
          datewiseCount: datewiseData.length,
          aggregatedCount: aggregatedData.length,
          datewiseSample: datewiseData[0],
          aggregatedSample: aggregatedData[0],
        });

        console.log("📋 TABLE 1 - All Datewise Campaigns:");
        datewiseData.forEach((d: any, idx: number) => {
          console.log(`  ${idx + 1}. ${d.campaign} (${d.bundleid})`);
        });
        console.log("📋 TABLE 1 - All Aggregated Campaigns:");
        aggregatedData.forEach((d: any, idx: number) => {
          console.log(`  ${idx + 1}. ${d.campaign} (${d.bundleid})`);
        });

        setTable1State((prev) => ({
          ...prev,
          datewiseData,
          aggregatedData,
          datewiseTotalPages: datewiseResult.total_pages || 0,
          aggregatedTotalPages: aggregatedResult.total_pages || 0,
          datewiseTotalRecords: datewiseResult.total || 0,
          aggregatedTotalRecords: aggregatedResult.total || 0,
        }));
      } catch (error) {
        console.error("❌ Table 1 - Fetch Error:", error);
        toast.error("Failed to load campaign performance");
        setTable1State((prev) => ({
          ...prev,
          datewiseData: [],
          aggregatedData: [],
          datewiseTotalPages: 0,
          aggregatedTotalPages: 0,
          datewiseTotalRecords: 0,
          aggregatedTotalRecords: 0,
        }));
      } finally {
        setTable1State((prev) => ({ ...prev, loading: false }));
      }
    };

    fetchTable1Data();
  }, [
    table1State.currentPage,
    dateRange,
    selectedCampaignTable1,
    selectedBundleIdTable1,
    showDateColumnTable1,
  ]);

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

        const url = `/api/appsflyer-source-list?id=${bundleId}&type=${type}&fromDate=${format(
          dateRange.from,
          "yyyy-MM-dd"
        )}&toDate=${format(dateRange.to, "yyyy-MM-dd")}`;
        const response = await fetch(url);

        if (!response.ok) throw new Error("Failed to fetch source list");

        const result = await response.json();
        if (result.success && Array.isArray(result.data)) {
          setSourceList(result.data);
        } else {
          toast.error("Invalid source data format");
          setSourceList([]);
        }
      } catch (error) {
        toast.error("Failed to load source list");
        setSourceList([]);
      } finally {
        setIsSourceListLoading(false);
      }
    };

    fetchSourceList();
  }, [selectedCampaign, selectedBundleId, dateRange]);

  // Table 2 fetch (Campaign Details by Source) - Single fetch based on showDateColumn
  useEffect(() => {
    if (searchTrigger === 0) return;

    const fetchTable2Data = async () => {
      setTable2State((prev) => ({ ...prev, loading: true }));

      const bundleId = selectedCampaign === "all" ? "all" : selectedBundleId;
      const source =
        selectedSources.length > 0 ? selectedSources.join(",") : "all";
      const endpoint = "/api/appsflyer-camp-details";
      const currentPage = table2State.currentPage;

      try {
        const payload = {
          bundle_id: bundleId,
          source: source,
          page: currentPage,
          limit: PAGE_SIZE,
          fromDate: format(dateRange.from, "yyyy-MM-dd"),
          toDate: format(dateRange.to, "yyyy-MM-dd"),
          showDate: showDateColumnTable2,
          showPidColumn: showPidColumn,
        };

        console.log("🔍 Table 2 - Payload:", payload);

        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }

        const result = await response.json();
        console.log("✅ Table 2 - Response:", result);

        if (result.success && Array.isArray(result.data)) {
          const enrichedData: CampDetailsItem[] = result.data.map(
            (item: any) => ({
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
            })
          );

          setTable2State((prev) => ({
            ...prev,
            data: enrichedData,
            totalPages: result.total_pages || 0,
            totalRecords: result.total || 0,
          }));
        } else {
          console.error("❌ Table 2 - Invalid data format:", result);
          toast.error("Invalid campaign details data format");
          setTable2State((prev) => ({
            ...prev,
            data: [],
            totalPages: 0,
            totalRecords: 0,
          }));
        }
      } catch (error) {
        console.error("❌ Table 2 - Fetch Error:", error);
        toast.error("Failed to load campaign details");
        setTable2State((prev) => ({
          ...prev,
          data: [],
          totalPages: 0,
          totalRecords: 0,
        }));
      } finally {
        setTable2State((prev) => ({ ...prev, loading: false }));
      }
    };

    fetchTable2Data();
  }, [
    searchTrigger,
    table2State.currentPage,
    dateRange,
    selectedCampaign,
    selectedBundleId,
    selectedSources,
    showDateColumnTable2,
  ]);

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

  // Calculate summary stats from campaign performance data (use aggregated data for totals)
  const summaryStats = useMemo(() => {
    const dataToUse = table1State.aggregatedData;
    const totalClicks = dataToUse.reduce(
      (sum, item) => sum + parseInt(item.clicks),
      0
    );
    const totalInstalls = dataToUse.reduce(
      (sum, item) => sum + parseInt(item.installs),
      0
    );
    const totalEvents = dataToUse.reduce(
      (sum, item) => sum + parseInt(item.event),
      0
    );
    const totalP360Installs = dataToUse.reduce(
      (sum, item) => sum + parseInt(item.p360installs),
      0
    );
    const totalP360Events = dataToUse.reduce(
      (sum, item) => sum + parseInt(item.p360event),
      0
    );

    const conversionRate =
      totalClicks > 0 ? (totalInstalls / totalClicks) * 100 : 0;
    const eventRate =
      totalInstalls > 0 ? (totalEvents / totalInstalls) * 100 : 0;
    const p360EventRate =
      totalP360Installs > 0 ? (totalP360Events / totalP360Installs) * 100 : 0;

    return {
      totalClicks,
      totalInstalls,
      totalEvents,
      totalP360Installs,
      totalP360Events,
      conversionRate,
      eventRate,
      p360EventRate,
    };
  }, [table1State.aggregatedData]);

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

  // Sort and filter campaign performance data - Switch based on showDateColumn
  const sortedCampaignPerformance = useMemo(() => {
    // Use appropriate array based on checkbox state
    const dataToUse = showDateColumnTable1
      ? table1State.datewiseData
      : table1State.aggregatedData;
    console.log("🔄 Table 1 - Switching data:", {
      showDateColumnTable1,
      datewiseCount: table1State.datewiseData.length,
      aggregatedCount: table1State.aggregatedData.length,
      usingDataCount: dataToUse.length,
      sampleData: dataToUse.slice(0, 2),
    });
    let filtered = dataToUse;

    if (debouncedCampaignSearch.trim()) {
      filtered = filtered.filter((row) =>
        row.campaign
          .toLowerCase()
          .includes(debouncedCampaignSearch.toLowerCase())
      );
    }

    if (!sortConfig.key) return filtered;

    return [...filtered].sort((a, b) => {
      let aValue: any = a[sortConfig.key as keyof typeof a];
      let bValue: any = b[sortConfig.key as keyof typeof b];

      if (typeof aValue === "string" && !isNaN(Number(aValue))) {
        aValue = parseInt(aValue);
      }
      if (typeof bValue === "string" && !isNaN(Number(bValue))) {
        bValue = parseInt(bValue);
      }

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortConfig.direction === "asc"
          ? aValue - bValue
          : bValue - aValue;
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortConfig.direction === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return 0;
    });
  }, [
    sortConfig,
    table1State.datewiseData,
    table1State.aggregatedData,
    showDateColumnTable1,
    debouncedCampaignSearch,
  ]);

  // Filter detailed data based on selected campaign and selected sources
  const filteredDetailedData = useMemo(() => {
    let filtered = table2State.data.map((item) => {
      const campaignItem = campaignList.find((c) => c.id === item.bundleid);
      const campaignName = campaignItem ? campaignItem.campaign : item.bundleid;

      return {
        id: Math.random(),
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

    if (sortConfigDetail.key) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfigDetail.key as keyof typeof a];
        const bValue = b[sortConfigDetail.key as keyof typeof b];

        if (typeof aValue === "number" && typeof bValue === "number") {
          return sortConfigDetail.direction === "asc"
            ? aValue - bValue
            : bValue - aValue;
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
  }, [table2State.data, sortConfigDetail, campaignList]);

  const handleExportData = () => {
    const dataToExport = showDateColumnTable1
      ? table1State.datewiseData
      : table1State.aggregatedData;
    const headers = ["Campaign Name", "Bundle ID"];
    if (showDateColumnTable1) headers.push("Date");
    headers.push("Clicks");
    if (showCParamColumnTable1) headers.push("C Parameter");
    headers.push(
      "Installs",
      "Events",
      "P360 Installs",
      "P360 Events",
      "Impressions"
    );

    const csv = [
      headers,
      ...dataToExport.map((row) => {
        const data = [row.campaign, row.bundleid];
        if (showDateColumnTable1) data.push(row.date || "");
        data.push(row.clicks);
        if (showCParamColumnTable1) data.push(row.campaign_c || "");
        data.push(
          row.installs,
          row.event,
          row.p360installs,
          row.p360event,
          String(row.impressions || 0)
        );
        return data;
      }),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `appsflyer-data-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
  };

  const getSortIcon = (columnKey: string, config: SortConfig) => {
    if (config.key !== columnKey)
      return <ArrowUpDown className="ml-2 h-4 w-4 opacity-30" />;
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
      const selectedCampaignItem = campaignList.find(
        (c) => c.campaign === value
      );
      if (selectedCampaignItem) {
        setSelectedBundleId(selectedCampaignItem.id);
      }
    }
  };

  // Handle Table 1 campaign change
  const handleCampaignChangeTable1 = (value: string) => {
    console.log("🎯 TABLE 1 - Campaign Selected:", value);
    setSelectedCampaignTable1(value);
    setTable1State((prev) => ({ ...prev, currentPage: 1 })); // Reset to page 1

    if (value === "all") {
      console.log('🎯 TABLE 1 - Setting bundle_id to: "all"');
      setSelectedBundleIdTable1("all");
    } else {
      const selectedCampaignItem = campaignList2.find(
        (c) => c.campaign === value
      );
      if (selectedCampaignItem) {
        console.log("🎯 TABLE 1 - Found campaign item:", selectedCampaignItem);
        console.log(
          "🎯 TABLE 1 - Setting bundle_id to:",
          selectedCampaignItem.id
        );
        setSelectedBundleIdTable1(selectedCampaignItem.id);
      } else {
        console.error("❌ TABLE 1 - Campaign item not found for:", value);
      }
    }
  };

  // Handle source selection (multi-select)
  const handleSourceToggle = (sourceId: string) => {
    setSelectedSources((prev) => {
      const newState = prev.includes(sourceId)
        ? prev.filter((id) => id !== sourceId)
        : [...prev, sourceId];
      return newState;
    });
    // Don't trigger anything - wait for GO button
  };

  // Handle GO button click
  const handleSearch = () => {
    setTable2State((prev) => ({ ...prev, currentPage: 1 }));
    setSearchTrigger(Date.now());
  };

  // Pagination handlers for Table 1
  const handlePreviousPageTable1 = () => {
    if (table1State.currentPage > 1) {
      setTable1State((prev) => ({
        ...prev,
        currentPage: prev.currentPage - 1,
      }));
    }
  };

  const handleNextPageTable1 = () => {
    const maxPages = showDateColumnTable1
      ? table1State.datewiseTotalPages
      : table1State.aggregatedTotalPages;
    if (table1State.currentPage < maxPages) {
      setTable1State((prev) => ({
        ...prev,
        currentPage: prev.currentPage + 1,
      }));
    }
  };

  // Pagination handlers for Table 2
  const handlePreviousPageTable2 = () => {
    if (table2State.currentPage > 1) {
      setTable2State((prev) => ({
        ...prev,
        currentPage: prev.currentPage - 1,
      }));
    }
  };

  const handleNextPageTable2 = () => {
    if (table2State.currentPage < table2State.totalPages) {
      setTable2State((prev) => ({
        ...prev,
        currentPage: prev.currentPage + 1,
      }));
    }
  };

  // Filter sources based on search
  const filteredSourceList = sourceList.filter((item) =>
    item.source.toLowerCase().includes(sourceSearchInput.toLowerCase())
  );

  // Filter campaigns based on local search in dropdown
  const filteredCampaignList = campaignList.filter((item) =>
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
                          pendingDateRange.preset === preset.id
                            ? "default"
                            : "outline"
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
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {/* Total Clicks */}
          <div className="relative overflow-hidden rounded-lg border bg-card p-3 border-l-4 border-l-blue-500 hover:shadow-md transition-all group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-0.5">
                  Clicks
                </p>
                <p className="text-xl font-bold">
                  {summaryStats.totalClicks.toLocaleString()}
                </p>
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
                <p className="text-xs font-medium text-muted-foreground mb-0.5">
                  Installs
                </p>
                <p className="text-xl font-bold">
                  {summaryStats.totalInstalls.toLocaleString()}
                </p>
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
                <p className="text-xs font-medium text-muted-foreground mb-0.5">
                  Events
                </p>
                <p className="text-xl font-bold">
                  {summaryStats.totalEvents.toLocaleString()}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  In-app actions
                </p>
              </div>
              <Zap className="h-7 w-7 text-purple-500/70" />
            </div>
          </div>

          {/* P360 Installs */}
          <div className="relative overflow-hidden rounded-lg border bg-card p-3 border-l-4 border-l-orange-500 hover:shadow-md transition-all group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-0.5">
                  P360 Installs
                </p>
                <p className="text-xl font-bold">
                  {summaryStats.totalP360Installs.toLocaleString()}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Premium
                </p>
              </div>
              <BarChart3 className="h-7 w-7 text-orange-500/70" />
            </div>
          </div>

          {/* P360 Events */}
          <div className="relative overflow-hidden rounded-lg border bg-card p-3 border-l-4 border-l-pink-500 hover:shadow-md transition-all group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-0.5">
                  P360 Events
                </p>
                <p className="text-xl font-bold">
                  {summaryStats.totalP360Events.toLocaleString()}
                </p>
                <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                  <TrendingUp className="h-2.5 w-2.5 text-green-500" />
                  {summaryStats.p360EventRate.toFixed(2)}% Rate
                </p>
              </div>
              <Activity className="h-7 w-7 text-pink-500/70" />
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
                {showDateColumnTable1
                  ? ` ${table1State.datewiseData.length} Records (Page ${table1State.currentPage} of ${table1State.datewiseTotalPages})`
                  : ` ${table1State.aggregatedData.length} Records (Page ${table1State.currentPage} of ${table1State.aggregatedTotalPages})`}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {/* Search and Column Toggle Controls */}
            <div className="flex flex-col sm:flex-row gap-4 mb-4 p-4 rounded-lg bg-muted/50 border">
              <div className="w-full sm:w-96" ref={campaignDropdownRefTable1}>
                <Label
                  htmlFor="campaignNameSearch"
                  className="text-sm font-medium mb-2 block"
                >
                  Filter by Campaign
                </Label>
                <div className="relative">
                  <button
                    onClick={() =>
                      setIsCampaignDropdownOpenTable1(
                        !isCampaignDropdownOpenTable1
                      )
                    }
                    disabled={isCampaignListLoading}
                    className="w-full flex items-center justify-between px-3 py-2 border rounded-md bg-background hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-left"
                  >
                    <span className="text-sm">
                      {selectedCampaignTable1 === "all"
                        ? "All Campaigns"
                        : campaignList2.find(
                            (c) => c.campaign === selectedCampaignTable1
                          )?.campaign || "Select a campaign..."}
                    </span>
                    <svg
                      className={`w-4 h-4 transition-transform ${
                        isCampaignDropdownOpenTable1 ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 14l-7 7m0 0l-7-7m7 7V3"
                      />
                    </svg>
                  </button>

                  {isCampaignDropdownOpenTable1 && (
                    <div className="absolute top-full left-0 right-0 mt-1 border rounded-lg bg-background shadow-lg z-[99999] min-w-max">
                      <div className="p-2 border-b sticky top-0 bg-background">
                        <Input
                          placeholder="Search campaigns..."
                          value={campaignSearchTable1}
                          onChange={(e) =>
                            setCampaignSearchTable1(e.target.value)
                          }
                          className="h-8 text-sm"
                          autoFocus
                        />
                      </div>

                      <div className="max-h-48 overflow-y-auto">
                        {isCampaignListLoading ? (
                          <div className="p-4 text-sm text-muted-foreground text-center">
                            Loading campaigns...
                          </div>
                        ) : campaignList2.length === 0 ? (
                          <div className="p-4 text-sm text-muted-foreground text-center">
                            No campaigns available
                          </div>
                        ) : (
                          <>
                            <div
                              onClick={() => {
                                handleCampaignChangeTable1("all");
                                setIsCampaignDropdownOpenTable1(false);
                                setCampaignSearchTable1("");
                              }}
                              className={`flex items-center gap-2 p-3 hover:bg-muted border-b cursor-pointer ${
                                selectedCampaignTable1 === "all"
                                  ? "bg-muted"
                                  : ""
                              }`}
                            >
                              <Target className="h-4 w-4" />
                              <span className="font-medium text-sm">
                                All Campaigns
                              </span>
                            </div>
                            {campaignList2.filter((item) =>
                              item.campaign
                                .toLowerCase()
                                .includes(campaignSearchTable1.toLowerCase())
                            ).length > 0 ? (
                              campaignList2
                                .filter((item) =>
                                  item.campaign
                                    .toLowerCase()
                                    .includes(
                                      campaignSearchTable1.toLowerCase()
                                    )
                                )
                                .map((item) => (
                                  <div
                                    key={item.id}
                                    onClick={() => {
                                      handleCampaignChangeTable1(item.campaign);
                                      setIsCampaignDropdownOpenTable1(false);
                                      setCampaignSearchTable1("");
                                    }}
                                    className={`flex items-center gap-3 p-3 hover:bg-muted border-b cursor-pointer ${
                                      selectedCampaignTable1 === item.campaign
                                        ? "bg-muted"
                                        : ""
                                    }`}
                                  >
                                    <span className="font-medium text-sm">
                                      {item.campaign}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      ({item.id})
                                    </span>
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
              <div className="flex items-center gap-4 mt-6">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="showDateColumnTable1"
                    checked={showDateColumnTable1}
                    onChange={(e) => setShowDateColumnTable1(e.target.checked)}
                    className="rounded"
                  />
                  <Label
                    htmlFor="showDateColumnTable1"
                    className="text-sm font-medium"
                  >
                    Show Date
                  </Label>
                </div>
                <div className="flex items-center space-x-2 ">
                  <input
                    type="checkbox"
                    id="showCParamColumnTable1"
                    checked={showCParamColumnTable1}
                    onChange={(e) =>
                      setShowCParamColumnTable1(e.target.checked)
                    }
                    className="rounded"
                  />
                  <Label
                    htmlFor="showCParamColumnTable1"
                    className="text-sm font-medium"
                  >
                    Show C Parameter
                  </Label>
                </div>
              </div>
            </div>
            <div className="rounded-lg border overflow-hidden">
              <div className="overflow-x-auto max-h-[600px] overflow-y-auto relative [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-blue-100/20 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gradient-to-b [&::-webkit-scrollbar-thumb]:from-blue-400 [&::-webkit-scrollbar-thumb]:to-blue-600 [&::-webkit-scrollbar-thumb]:rounded-full">
                <Table>
                  <TableHeader className="sticky top-0 z-[5] bg-background shadow-sm">
                    <TableRow className="border-b-2 border-blue-500/20">
                      <TableHead
                        className={`text-center cursor-pointer select-none hover:bg-muted/80 transition-colors bg-background ${
                          showDateColumnTable1 && showCParamColumnTable1
                            ? "text-[10px] px-1.5 py-0.5"
                            : showDateColumnTable1 || showCParamColumnTable1
                            ? "text-xs px-2 py-1"
                            : "text-sm px-3 py-2"
                        }`}
                        onClick={() => handleSort("campaignName")}
                      >
                        <div className="flex items-center justify-center font-semibold">
                          Campaign Details
                          {getSortIcon("campaignName", sortConfig)}
                        </div>
                      </TableHead>
                      {showDateColumnTable1 && (
                        <TableHead
                          className={`text-center cursor-pointer select-none hover:bg-muted/80 transition-colors bg-background ${
                            showCParamColumnTable1
                              ? "text-[10px] px-1.5 py-0.5"
                              : "text-xs px-2 py-1"
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
                          showDateColumnTable1 && showCParamColumnTable1
                            ? "text-[10px] px-1.5 py-0.5"
                            : showDateColumnTable1 || showCParamColumnTable1
                            ? "text-xs px-2 py-1"
                            : "text-sm px-3 py-2"
                        }`}
                        onClick={() => handleSort("impressions")}
                      >
                        <div className="flex items-center justify-center font-semibold">
                          {showDateColumnTable1 && showCParamColumnTable1
                            ? "Impr"
                            : "Impressions"}
                          {getSortIcon("impressions", sortConfig)}
                        </div>
                      </TableHead>
                      <TableHead
                        className={`text-center cursor-pointer select-none hover:bg-muted/80 transition-colors bg-background ${
                          showDateColumnTable1 && showCParamColumnTable1
                            ? "text-[10px] px-1.5 py-0.5"
                            : showDateColumnTable1 || showCParamColumnTable1
                            ? "text-xs px-2 py-1"
                            : "text-sm px-3 py-2"
                        }`}
                        onClick={() => handleSort("clicks")}
                      >
                        <div className="flex items-center justify-center font-semibold">
                          {showDateColumnTable1 && showCParamColumnTable1
                            ? "Clks"
                            : "Clicks"}
                          {getSortIcon("clicks", sortConfig)}
                        </div>
                      </TableHead>
                      {showCParamColumnTable1 && (
                        <TableHead
                          className={`text-center cursor-pointer select-none hover:bg-muted/80 transition-colors bg-background ${
                            showDateColumnTable1
                              ? "text-[10px] px-1.5 py-0.5"
                              : "text-xs px-2 py-1"
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
                          showDateColumnTable1 && showCParamColumnTable1
                            ? "text-[10px] px-1.5 py-0.5"
                            : showDateColumnTable1 || showCParamColumnTable1
                            ? "text-xs px-2 py-1"
                            : "text-sm px-3 py-2"
                        }`}
                        onClick={() => handleSort("installs")}
                      >
                        <div className="flex items-center justify-center font-semibold">
                          {showDateColumnTable1 && showCParamColumnTable1
                            ? "Inst"
                            : "Installs"}
                          {getSortIcon("installs", sortConfig)}
                        </div>
                      </TableHead>
                      <TableHead
                        className={`text-center cursor-pointer select-none hover:bg-muted/80 transition-colors bg-background ${
                          showDateColumnTable1 && showCParamColumnTable1
                            ? "text-[10px] px-1.5 py-0.5"
                            : showDateColumnTable1 || showCParamColumnTable1
                            ? "text-xs px-2 py-1"
                            : "text-sm px-3 py-2"
                        }`}
                        onClick={() => handleSort("event")}
                      >
                        <div className="flex items-center justify-center font-semibold">
                          {showDateColumnTable1 && showCParamColumnTable1
                            ? "Evts"
                            : "Events"}
                          {getSortIcon("event", sortConfig)}
                        </div>
                      </TableHead>
                      <TableHead
                        className={`text-center cursor-pointer select-none hover:bg-purple-500/10 transition-colors bg-purple-500/5 ${
                          showDateColumnTable1 && showCParamColumnTable1
                            ? "text-[10px] px-1.5 py-0.5"
                            : showDateColumnTable1 || showCParamColumnTable1
                            ? "text-xs px-2 py-1"
                            : "text-sm px-3 py-2"
                        }`}
                        onClick={() => handleSort("p360installs")}
                      >
                        <div className="flex items-center justify-center font-semibold">
                          {showDateColumnTable1 && showCParamColumnTable1
                            ? "P360I"
                            : "P360 Installs"}
                          {getSortIcon("p360installs", sortConfig)}
                        </div>
                      </TableHead>
                      <TableHead
                        className={`text-center cursor-pointer select-none hover:bg-purple-500/10 transition-colors bg-purple-500/5 ${
                          showDateColumnTable1 && showCParamColumnTable1
                            ? "text-[10px] px-1.5 py-0.5"
                            : showDateColumnTable1 || showCParamColumnTable1
                            ? "text-xs px-2 py-1"
                            : "text-sm px-3 py-2"
                        }`}
                        onClick={() => handleSort("p360event")}
                      >
                        <div className="flex items-center justify-center font-semibold">
                          {showDateColumnTable1 && showCParamColumnTable1
                            ? "P360E"
                            : "P360 Events"}
                          {getSortIcon("p360event", sortConfig)}
                        </div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {table1State.loading ? (
                      <>
                        {[...Array(10)].map((_, i) => (
                          <TableRow key={i}>
                            <TableCell>
                              <Skeleton className="h-8 w-24" />
                            </TableCell>
                            {showDateColumnTable1 && (
                              <TableCell>
                                <Skeleton className="h-8 w-24" />
                              </TableCell>
                            )}
                            <TableCell>
                              <Skeleton className="h-8 w-24" />
                            </TableCell>
                            {showCParamColumnTable1 && (
                              <TableCell>
                                <Skeleton className="h-8 w-24" />
                              </TableCell>
                            )}
                            <TableCell>
                              <Skeleton className="h-8 w-24" />
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-8 w-24" />
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-8 w-24" />
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-8 w-24" />
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-8 w-24" />
                            </TableCell>
                          </TableRow>
                        ))}
                      </>
                    ) : sortedCampaignPerformance.length > 0 ? (
                      sortedCampaignPerformance.map((row, index) => (
                        <TableRow
                          key={`${row.bundleid}-${row.date || ""}-${index}`}
                          className={`hover:bg-muted/50 transition-colors group ${
                            showDateColumnTable1 && showCParamColumnTable1
                              ? "text-[10px]"
                              : showDateColumnTable1 || showCParamColumnTable1
                              ? "text-xs"
                              : "text-sm"
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
                          {showDateColumnTable1 && (
                            <TableCell className="text-center">
                              <div className="flex items-center justify-center">
                                <span
                                  className={
                                    showDateColumnTable1 &&
                                    showCParamColumnTable1
                                      ? "text-[10px]"
                                      : showDateColumnTable1 ||
                                        showCParamColumnTable1
                                      ? "text-xs"
                                      : "text-sm"
                                  }
                                >
                                  {row.date || "-"}
                                </span>
                              </div>
                            </TableCell>
                          )}
                          <TableCell className="text-right">
                            <span className="font-semibold text-muted-foreground">
                              {row.impressions
                                ? parseInt(
                                    String(row.impressions)
                                  ).toLocaleString()
                                : "0"}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <span className="font-semibold">
                                {parseInt(row.clicks).toLocaleString()}
                              </span>
                              <MousePointerClick className="h-3.5 w-3.5 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </TableCell>
                          {showCParamColumnTable1 && (
                            <TableCell className="text-center">
                              <div className="flex items-center justify-center">
                                <span
                                  className={`font-mono ${
                                    showDateColumnTable1 &&
                                    showCParamColumnTable1
                                      ? "text-[10px]"
                                      : showDateColumnTable1 ||
                                        showCParamColumnTable1
                                      ? "text-xs"
                                      : "text-sm"
                                  }`}
                                >
                                  {row.campaign_c || "-"}
                                </span>
                              </div>
                            </TableCell>
                          )}
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <span className="font-semibold">
                                {parseInt(row.installs).toLocaleString()}
                              </span>
                              <Badge
                                variant="outline"
                                className="text-xs px-1.5 py-0"
                              >
                                {parseInt(row.clicks) > 0
                                  ? (
                                      (parseInt(row.installs) /
                                        parseInt(row.clicks)) *
                                      100
                                    ).toFixed(3)
                                  : "0"}
                                %
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {parseInt(row.event).toLocaleString()}
                            <br />
                            <small style={{ fontSize: "10px" }}>
                              {row.payableEvent ? row.payableEvent : "-"}
                            </small>
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
                        <TableCell
                          colSpan={
                            8 +
                            (showDateColumnTable1 ? 1 : 0) +
                            (showCParamColumnTable1 ? 1 : 0)
                          }
                          className="h-32"
                        >
                          <div className="flex items-center justify-center">
                            <p className="text-sm text-muted-foreground">
                              No campaign data available
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Pagination Controls for Table 1 */}
            {(showDateColumnTable1
              ? table1State.datewiseTotalPages
              : table1State.aggregatedTotalPages) > 0 && (
              <div className="flex items-center justify-between px-4 py-4 border-t bg-muted/30 rounded-b-lg">
                <div className="text-sm text-muted-foreground">
                  Page{" "}
                  <span className="font-semibold text-foreground">
                    {table1State.currentPage}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-foreground">
                    {showDateColumnTable1
                      ? table1State.datewiseTotalPages
                      : table1State.aggregatedTotalPages}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePreviousPageTable1}
                    disabled={
                      table1State.currentPage === 1 || table1State.loading
                    }
                    className="gap-2"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextPageTable1}
                    disabled={
                      table1State.currentPage ===
                        (showDateColumnTable1
                          ? table1State.datewiseTotalPages
                          : table1State.aggregatedTotalPages) ||
                      table1State.loading
                    }
                    className="gap-2"
                  >
                    Next
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
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
                <CardTitle className="text-xl">
                  Campaign Details by Source
                </CardTitle>
                <CardDescription className="mt-0">
                  Drill down into specific campaign sources and performance
                </CardDescription>
              </div>
              <div className="flex items-center gap-3">
                {/* 3 Toggle Buttons with Text */}
                <div className="flex items-center gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() =>
                          setShowDateColumnTable2(!showDateColumnTable2)
                        }
                        className={`px-3 py-2 rounded-md transition-colors flex items-center gap-2 text-sm font-medium ${
                          showDateColumnTable2
                            ? "bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                      >
                        <CalendarDays className="h-4 w-4" />
                        <span>Date</span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Show Date Column</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() =>
                          setShowCParamColumnTable2(!showCParamColumnTable2)
                        }
                        className={`px-3 py-2 rounded-md transition-colors flex items-center gap-2 text-sm font-medium ${
                          showCParamColumnTable2
                            ? "bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                      >
                        <Settings2 className="h-4 w-4" />
                        <span>C Param</span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Show C Parameter Column</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => setShowPidColumn(!showPidColumn)}
                        disabled={
                          selectedCampaign === "all" || selectedCampaign === ""
                        }
                        className={`px-3 py-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm font-medium ${
                          showPidColumn
                            ? "bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                      >
                        <Lock className="h-4 w-4" />
                        <span>PID</span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {selectedCampaign === "all" || selectedCampaign === ""
                        ? "Select a specific campaign to enable PID"
                        : "Show PID Column"}
                    </TooltipContent>
                  </Tooltip>
                </div>

                <Badge variant="outline" className="gap-1">
                  <Filter className="h-3 w-3" />
                  {filteredDetailedData.length} Records (Page{" "}
                  {table2State.currentPage} of {table2State.totalPages})
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 -mt-6">
            {/* Enhanced Filters */}
            <div className="p-4 rounded-lg border bg-muted/50">
              {/* Single Row: Campaign (40%) | Source (40%) | Buttons (20%) */}
              <div className="flex items-start gap-3">
                {/* Campaign Filter - 40% */}
                <div
                  className="flex-[0_0_40%] space-y-2"
                  ref={campaignDropdownRef}
                >
                  <Label
                    htmlFor="campaign-select"
                    className="text-sm font-semibold flex items-center gap-2"
                  >
                    <BarChart3 className="h-4 w-4" />
                    Campaign
                  </Label>
                  <div className="relative">
                    <button
                      onClick={() =>
                        setIsCampaignDropdownOpen(!isCampaignDropdownOpen)
                      }
                      disabled={isCampaignListLoading}
                      className="w-full flex items-center justify-between px-3 py-2 border rounded-md bg-background hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-left"
                    >
                      <span className="text-sm">
                        {selectedCampaign
                          ? campaignList.find(
                              (c) => c.campaign === selectedCampaign
                            )?.campaign || "Select a campaign..."
                          : isCampaignListLoading
                          ? "Loading campaigns..."
                          : "Select a campaign..."}
                      </span>
                      <svg
                        className={`w-4 h-4 transition-transform ${
                          isCampaignDropdownOpen ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 14l-7 7m0 0l-7-7m7 7V3"
                        />
                      </svg>
                    </button>

                    {isCampaignDropdownOpen && (
                      <div className="absolute top-full left-0 right-0 mt-1 border rounded-lg bg-background shadow-lg z-[99999] min-w-max">
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
                                className={`flex items-center gap-2 p-3 hover:bg-muted border-b cursor-pointer ${
                                  selectedCampaign === "all" ? "bg-muted" : ""
                                }`}
                              >
                                <Target className="h-4 w-4" />
                                <span className="font-medium text-sm">
                                  All Campaigns
                                </span>
                              </div>
                              {filteredCampaignList.length > 0 ? (
                                filteredCampaignList.map((item) => (
                                  <div
                                    key={item.id + item.campaign}
                                    onClick={() => {
                                      handleCampaignChange(item.campaign);
                                      setIsCampaignDropdownOpen(false);
                                      setCampaignSearch("");
                                    }}
                                    className={`flex items-center gap-3 p-3 hover:bg-muted border-b cursor-pointer ${
                                      selectedCampaign === item.campaign
                                        ? "bg-muted"
                                        : ""
                                    }`}
                                  >
                                    <span className="font-medium text-sm">
                                      {item.campaign}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      ({item.id})
                                    </span>
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
                <div
                  className="flex-[0_0_40%] space-y-2"
                  ref={sourceDropdownRef}
                >
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Sources ({selectedSources.length} selected)
                  </Label>
                  <div className="relative">
                    <button
                      onClick={() =>
                        setIsSourceDropdownOpen(!isSourceDropdownOpen)
                      }
                      disabled={!selectedCampaign || isSourceListLoading}
                      className="w-full flex items-center justify-between px-3 py-2 border rounded-md bg-background hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <span className="text-sm">
                        {selectedSources.length > 0
                          ? `${selectedSources.length} source${
                              selectedSources.length !== 1 ? "s" : ""
                            } selected`
                          : isSourceListLoading
                          ? "Loading sources..."
                          : "Select sources..."}
                      </span>
                      <svg
                        className={`w-4 h-4 transition-transform ${
                          isSourceDropdownOpen ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 14l-7 7m0 0l-7-7m7 7V3"
                        />
                      </svg>
                    </button>

                    {isSourceDropdownOpen && selectedCampaign && (
                      <div className="absolute top-full left-0 right-0 mt-1 border rounded-lg bg-background shadow-lg z-[99999] min-w-max">
                        <div className="p-2 border-b sticky top-0 bg-background">
                          <Input
                            placeholder="Search sources..."
                            value={sourceSearchInput}
                            onChange={(e) =>
                              setSourceSearchInput(e.target.value)
                            }
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
                                  if (
                                    selectedSources.length === sourceList.length
                                  ) {
                                    setSelectedSources([]);
                                  } else {
                                    setSelectedSources(
                                      sourceList.map((s) => s.source)
                                    );
                                  }
                                }}
                                className="flex items-center gap-3 p-3 hover:bg-muted border-b cursor-pointer bg-muted/50"
                              >
                                <input
                                  type="checkbox"
                                  checked={
                                    selectedSources.length ===
                                      sourceList.length && sourceList.length > 0
                                  }
                                  readOnly
                                  className="w-4 h-4 rounded cursor-pointer"
                                />
                                <label className="flex-1 font-medium text-sm cursor-pointer">
                                  Select All Sources
                                </label>
                              </div>
                              {filteredSourceList.map((item) => {
                                const isChecked = selectedSources.includes(
                                  item.source
                                );
                                return (
                                  <div
                                    key={item.source}
                                    className="flex items-center gap-3 p-3 hover:bg-muted border-b last:border-b-0"
                                  >
                                    <input
                                      type="checkbox"
                                      id={`source-${item.source}`}
                                      checked={isChecked}
                                      onChange={() =>
                                        handleSourceToggle(item.source)
                                      }
                                      className="w-4 h-4 rounded cursor-pointer"
                                    />
                                    <label
                                      htmlFor={`source-${item.source}`}
                                      className="flex-1 flex items-center gap-2 cursor-pointer"
                                    >
                                      <span className="font-medium text-sm">
                                        {item.source}
                                      </span>
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
                      style={{
                        width:
                          sourceDropdownWidth > 0
                            ? `${sourceDropdownWidth}px`
                            : "auto",
                      }}
                      className="flex gap-2 overflow-x-auto pb-2 mt-2 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-blue-100/20 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gradient-to-r [&::-webkit-scrollbar-thumb]:from-blue-400 [&::-webkit-scrollbar-thumb]:to-blue-600 [&::-webkit-scrollbar-thumb]:rounded-full"
                    >
                      {selectedSources.map((sourceName) => {
                        const source = sourceList.find(
                          (s) => s.source === sourceName
                        );
                        return source ? (
                          <Badge
                            key={sourceName}
                            variant="secondary"
                            className="gap-2 flex-shrink-0 whitespace-nowrap"
                          >
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

                {/* Apply Filter Button - 20% */}
                <div className="flex-[0_0_20%] flex items-end justify-center">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={handleSearch}
                        className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
                        title="Apply Filters"
                      >
                        <Search className="h-4 w-4" /> Apply Filter
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Apply Filters</TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="rounded-lg border overflow-hidden">
              <div className="overflow-x-auto max-h-[600px] overflow-y-auto relative [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-blue-100/20 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gradient-to-b [&::-webkit-scrollbar-thumb]:from-blue-400 [&::-webkit-scrollbar-thumb]:to-blue-600 [&::-webkit-scrollbar-thumb]:rounded-full">
                <Table>
                  <TableHeader className="sticky top-0 z-[5] bg-background shadow-sm">
                    <TableRow className="border-b-2 border-green-500/20">
                      <TableHead
                        className={`text-center cursor-pointer select-none hover:bg-muted/80 transition-colors bg-background ${
                          showDateColumnTable2 && showCParamColumnTable2
                            ? "text-[10px] px-1.5 py-0.5"
                            : showDateColumnTable2 || showCParamColumnTable2
                            ? "text-xs px-2 py-1"
                            : "text-sm px-3 py-2"
                        }`}
                        onClick={() => handleSortDetail("campaignName")}
                      >
                        <div className="flex items-center justify-center font-semibold">
                          Campaign
                          {getSortIcon("campaignName", sortConfigDetail)}
                        </div>
                      </TableHead>
                      <TableHead
                        className={`text-center cursor-pointer select-none hover:bg-muted/80 transition-colors bg-background ${
                          showDateColumnTable2 && showCParamColumnTable2
                            ? "text-[10px] px-1.5 py-0.5"
                            : showDateColumnTable2 || showCParamColumnTable2
                            ? "text-xs px-2 py-1"
                            : "text-sm px-3 py-2"
                        }`}
                        onClick={() => handleSortDetail("source")}
                      >
                        <div className="flex items-center justify-center font-semibold">
                          Source
                          {getSortIcon("source", sortConfigDetail)}
                        </div>
                      </TableHead>
                      {showDateColumnTable2 && (
                        <TableHead
                          className={`text-center cursor-pointer select-none hover:bg-muted/80 transition-colors bg-background ${
                            showCParamColumnTable2
                              ? "text-[10px] px-1.5 py-0.5"
                              : "text-xs px-2 py-1"
                          }`}
                          onClick={() => handleSortDetail("date")}
                        >
                          <div className="flex items-center justify-center font-semibold">
                            Date
                            {getSortIcon("date", sortConfigDetail)}
                          </div>
                        </TableHead>
                      )}
                      {showPidColumn &&
                        selectedCampaign !== "all" &&
                        selectedCampaign !== "" && (
                          <TableHead
                            className={`text-center font-semibold bg-background ${
                              showDateColumnTable2 && showCParamColumnTable2
                                ? "text-[10px] px-1.5 py-0.5"
                                : showDateColumnTable2 || showCParamColumnTable2
                                ? "text-xs px-2 py-1"
                                : "text-sm px-3 py-2"
                            }`}
                          >
                            PID
                          </TableHead>
                        )}
                      <TableHead
                        className={`text-center cursor-pointer select-none hover:bg-muted/80 transition-colors bg-background ${
                          showDateColumnTable2 && showCParamColumnTable2
                            ? "text-[10px] px-1.5 py-0.5"
                            : showDateColumnTable2 || showCParamColumnTable2
                            ? "text-xs px-2 py-1"
                            : "text-sm px-3 py-2"
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
                          showDateColumnTable2 && showCParamColumnTable2
                            ? "text-[10px] px-1.5 py-0.5"
                            : showDateColumnTable2 || showCParamColumnTable2
                            ? "text-xs px-2 py-1"
                            : "text-sm px-3 py-2"
                        }`}
                        onClick={() => handleSortDetail("clicks")}
                      >
                        <div className="flex items-center justify-center font-semibold">
                          Clicks
                          {getSortIcon("clicks", sortConfigDetail)}
                        </div>
                      </TableHead>
                      {showCParamColumnTable2 && (
                        <TableHead
                          className={`text-center cursor-pointer select-none hover:bg-muted/80 transition-colors bg-background ${
                            showDateColumnTable2
                              ? "text-[10px] px-1.5 py-0.5"
                              : "text-xs px-2 py-1"
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
                          showDateColumnTable2 && showCParamColumnTable2
                            ? "text-[10px] px-1.5 py-0.5"
                            : showDateColumnTable2 || showCParamColumnTable2
                            ? "text-xs px-2 py-1"
                            : "text-sm px-3 py-2"
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
                          showDateColumnTable2 && showCParamColumnTable2
                            ? "text-[10px] px-1.5 py-0.5"
                            : showDateColumnTable2 || showCParamColumnTable2
                            ? "text-xs px-2 py-1"
                            : "text-sm px-3 py-2"
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
                          showDateColumnTable2 && showCParamColumnTable2
                            ? "text-[10px] px-1.5 py-0.5"
                            : showDateColumnTable2 || showCParamColumnTable2
                            ? "text-xs px-2 py-1"
                            : "text-sm px-3 py-2"
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
                          showDateColumnTable2 && showCParamColumnTable2
                            ? "text-[10px] px-1.5 py-0.5"
                            : showDateColumnTable2 || showCParamColumnTable2
                            ? "text-xs px-2 py-1"
                            : "text-sm px-3 py-2"
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
                    {table2State.loading ? (
                      <>
                        {[...Array(10)].map((_, i) => (
                          <TableRow key={i}>
                            <TableCell>
                              <Skeleton className="h-8 w-24" />
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-8 w-24" />
                            </TableCell>
                            {showDateColumnTable2 && (
                              <TableCell>
                                <Skeleton className="h-8 w-24" />
                              </TableCell>
                            )}
                            {showPidColumn &&
                              selectedCampaign !== "all" &&
                              selectedCampaign !== "" && (
                                <TableCell>
                                  <Skeleton className="h-8 w-32" />
                                </TableCell>
                              )}
                            <TableCell>
                              <Skeleton className="h-8 w-24" />
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-8 w-24" />
                            </TableCell>
                            {showCParamColumnTable2 && (
                              <TableCell>
                                <Skeleton className="h-8 w-24" />
                              </TableCell>
                            )}
                            <TableCell>
                              <Skeleton className="h-8 w-24" />
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-8 w-24" />
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-8 w-24" />
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-8 w-24" />
                            </TableCell>
                          </TableRow>
                        ))}
                      </>
                    ) : filteredDetailedData.length > 0 ? (
                      filteredDetailedData.map((row) => (
                        <TableRow
                          key={row.id}
                          className={`hover:bg-muted/50 transition-colors group ${
                            showDateColumnTable2 && showCParamColumnTable2
                              ? "text-[10px]"
                              : showDateColumnTable2 || showCParamColumnTable2
                              ? "text-xs"
                              : "text-sm"
                          }`}
                        >
                          <TableCell>
                            <div className="font-medium group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                              <div>{row.campaignName}</div>
                              <div className="text-[10px] text-muted-foreground font-normal mt-0.5">
                                {row.bundleid || "-"}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <span
                              className={`font-medium ${
                                showDateColumnTable2 && showCParamColumnTable2
                                  ? "text-[10px]"
                                  : showDateColumnTable2 ||
                                    showCParamColumnTable2
                                  ? "text-xs"
                                  : "text-sm"
                              }`}
                            >
                              {row.source || "-"}
                            </span>
                          </TableCell>
                          {showDateColumnTable2 && (
                            <TableCell className="text-center">
                              <span
                                className={
                                  showDateColumnTable2 && showCParamColumnTable2
                                    ? "text-[10px]"
                                    : showDateColumnTable2 ||
                                      showCParamColumnTable2
                                    ? "text-xs"
                                    : "text-sm"
                                }
                              >
                                {row.date || "-"}
                              </span>
                            </TableCell>
                          )}
                          {showPidColumn &&
                            selectedCampaign !== "all" &&
                            selectedCampaign !== "" && (
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
                                  <TooltipContent>
                                    Click to copy PID
                                  </TooltipContent>
                                </Tooltip>
                              </TableCell>
                            )}
                          <TableCell className="text-right">
                            <span className="font-semibold text-muted-foreground">
                              {row.impressions
                                ? row.impressions.toLocaleString()
                                : "0"}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <span className="font-semibold">
                                {row.clicks.toLocaleString()}
                              </span>
                              <MousePointerClick className="h-3.5 w-3.5 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </TableCell>
                          {showCParamColumnTable2 && (
                            <TableCell className="text-center">
                              <span
                                className={`font-mono ${
                                  showDateColumnTable2 && showCParamColumnTable2
                                    ? "text-[10px]"
                                    : showDateColumnTable2 ||
                                      showCParamColumnTable2
                                    ? "text-xs"
                                    : "text-sm"
                                }`}
                              >
                                {row.campaign_c || "-"}
                              </span>
                            </TableCell>
                          )}
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <span className="font-semibold">
                                {row.installs.toLocaleString()}
                              </span>
                              <Badge
                                variant="outline"
                                className="text-xs px-1.5 py-0"
                              >
                                {row.clicks > 0
                                  ? ((row.installs / row.clicks) * 100).toFixed(
                                      3
                                    )
                                  : "0"}
                                %
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
                        <TableCell
                          colSpan={
                            8 +
                            (showDateColumnTable2 ? 1 : 0) +
                            (showCParamColumnTable2 ? 1 : 0) +
                            (showPidColumn ? 1 : 0)
                          }
                          className="h-32"
                        >
                          <div className="flex flex-col items-center justify-center text-center space-y-3">
                            <div className="p-3 rounded-full bg-muted">
                              <Filter className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <div>
                              <p className="font-medium text-muted-foreground">
                                No data found
                              </p>
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
            {table2State.totalPages > 0 && (
              <div className="flex items-center justify-between px-4 py-4 border-t bg-muted/30 rounded-b-lg">
                <div className="text-sm text-muted-foreground">
                  Page{" "}
                  <span className="font-semibold text-foreground">
                    {table2State.currentPage}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-foreground">
                    {table2State.totalPages}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePreviousPageTable2}
                    disabled={
                      table2State.currentPage === 1 || table2State.loading
                    }
                    className="gap-2"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextPageTable2}
                    disabled={
                      table2State.currentPage === table2State.totalPages ||
                      table2State.loading
                    }
                    className="gap-2"
                  >
                    Next
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
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
