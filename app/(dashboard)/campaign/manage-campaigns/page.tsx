"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { toast } from "sonner";
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
  Download,
  Search,
  ChevronDown,
} from "lucide-react";
import { FiEdit2, FiTrash2, FiEye, FiBarChart2 } from "react-icons/fi";
import { MdOutlineStorefront } from "react-icons/md";
import { Toggle } from "@/components/ui/toggle";
import { format, startOfMonth, endOfMonth, subMonths, subDays } from "date-fns";
import { motion } from "framer-motion";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { FaLinkedin } from "react-icons/fa";
import { CalendarDays } from "lucide-react";
import { Calendar } from "@/components/calendar-with-presets";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

/* Lottie Loader */
function LottieLoader({ size = 42 }: { size?: number }) {
  return (
    <DotLottieReact
      src="https://lottie.host/d767bfb4-1336-477f-b66b-fc4400623846/f9KaIPaI40.lottie"
      loop
      autoplay
      style={{ width: size, height: size }}
    />
  );
}

/* Contact Type */
type Contact = {
  person: string;
  email: string;
  mobile: string;
  linkedin?: string;
  fetched?: boolean;
};

/* Contact Scanner Component */
function ContactScanner({
  contacts,
  progress,
  total,
  status,
  isScanning,
}: {
  contacts: Contact[];
  progress: number;
  total: number;
  status: string;
  isScanning: boolean;
}) {
  const remaining = Math.max(total - contacts.length, 0);
  const placeholderRows = Array.from({ length: remaining });

  return (
    <div className="space-y-4">
      {/* header with loader + text */}
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">
          <LottieLoader size={32} />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">{status}</p>
          <p className="text-xs text-muted-foreground">
            Scanning contacts… {progress}/{total}
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200/30 dark:border-gray-800/30 transition-all duration-500 max-h-[400px] overflow-y-auto">
        <table className="w-full text-sm text-gray-500 dark:text-gray-400">
          <thead className="text-xs uppercase text-gray-400 dark:text-gray-500 transition-all duration-500 sticky top-0 bg-background">
            <tr className="border-b border-gray-200/40 dark:border-gray-800/40">
              <th className="p-3 text-center w-[30%] border-r border-gray-200/30 dark:border-gray-800/30">
                Name
              </th>
              <th className="p-3 text-center w-[35%] border-r border-gray-200/30 dark:border-gray-800/30">
                Mail
              </th>
              <th className="p-3 text-center w-[20%] border-r border-gray-200/30 dark:border-gray-800/30">
                Phone
              </th>
              <th className="p-3 text-center w-[15%]">LinkedIn</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((c, i) =>
              c ? (
                <tr
                  key={i}
                  className="animate-[scanIn_0.4s_ease-out_1] transition-all duration-500 border-b border-gray-200/20 dark:border-gray-800/20"
                  style={{ animationDelay: `${i * 120}ms` }}
                >
                  <td className="p-3 border-r border-gray-200/30 dark:border-gray-800/30 text-foreground">
                    {c.person}
                  </td>
                  <td className="p-3 truncate border-r border-gray-200/30 dark:border-gray-800/30 text-foreground">
                    {c.email}
                  </td>
                  <td className="p-3 md:whitespace-nowrap border-r border-gray-200/30 dark:border-gray-800/30 text-foreground">
                    {c.mobile}
                  </td>
                  <td className="p-3 truncate text-center">
                    {c.fetched ? (
                      <a
                        href={
                          c.linkedin
                            ? c.linkedin
                            : `https://www.bing.com/search?q=${encodeURIComponent(
                                `${c.person} linkedin`
                              )}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                        aria-label={`View ${c.person} on LinkedIn`}
                      >
                        <span className="text-xs text-gray-400 dark:text-gray-500">Fetched</span>
                        <FaLinkedin className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                      </a>
                    ) : (
                      <span className="text-xs text-gray-400 dark:text-gray-500">Fetching...</span>
                    )}
                  </td>
                </tr>
              ) : null
            )}

            {placeholderRows.map((_, i) => (
              <tr key={`ph-${i}`} className="border-b border-gray-200/20 dark:border-gray-800/20">
                <td className="p-3 border-r border-gray-200/30 dark:border-gray-800/30">
                  <div className="h-4 w-full overflow-hidden rounded transition-all duration-500 bg-gray-200/30 dark:bg-gray-800/30">
                    <div className="h-full w-1/3 animate-[shimmer_1.2s_infinite] bg-gray-200/40 dark:bg-gray-700/40" />
                  </div>
                </td>
                <td className="p-3 border-r border-gray-200/30 dark:border-gray-800/30">
                  <div className="h-4 w-full overflow-hidden rounded transition-all duration-500 bg-gray-200/30 dark:bg-gray-800/30">
                    <div className="h-full w-1/3 animate-[shimmer_1.2s_infinite] bg-gray-200/40 dark:bg-gray-700/40" />
                  </div>
                </td>
                <td className="p-3 border-r border-gray-200/30 dark:border-gray-800/30">
                  <div className="h-4 w-full overflow-hidden rounded transition-all duration-500 bg-gray-200/30 dark:bg-gray-800/30">
                    <div className="h-full w-1/3 animate-[shimmer_1.2s_infinite] bg-gray-200/40 dark:bg-gray-700/40" />
                  </div>
                </td>
                <td className="p-3 text-center">
                  <span className="text-xs text-gray-400 dark:text-gray-500">Fetching...</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes shimmer {
              0% { transform: translateX(-100%); }
              100% { transform: translateX(300%); }
            }
            @keyframes scanIn {
              0% { opacity: 0; transform: translateY(6px); }
              100% { opacity: 1; transform: translateY(0); }
            }
          `,
        }}
      />
    </div>
  );
}

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
  
  // autofill filter values
  const [pendingSearchQuery, setPendingSearchQuery] = useState("");
  const [pendingSelectedCategories, setPendingSelectedCategories] = useState<string[]>([]);
  const [pendingSelectedStages, setPendingSelectedStages] = useState<string[]>([]);
  const [pendingDateRange, setPendingDateRange] = useState(() => {
    const today = new Date();
    return {
      from: subDays(today, 7),
      to: today,
      preset: "last7days",
    };
  });
  
  // Active filter values (used for filtering, only updated on Apply)
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedStages, setSelectedStages] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState(() => {
    const today = new Date();
    return {
      from: subDays(today, 7),
      to: today,
      preset: "last7days",
    };
  });
  
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: null,
    direction: "asc",
  });
  
  // Debounced search query for autocomplete
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  
  // waits 300ms after user type nahi krta hai
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(pendingSearchQuery);
    }, 300); 
    
    return () => clearTimeout(timer); // Cleanup
  }, [pendingSearchQuery]);

  // auto suggest + deboucnce
  const searchSuggestions = useMemo(() => {
    // Require at least 3 characters 
    if (!debouncedSearchQuery.trim() || debouncedSearchQuery.trim().length < 3) {
      return [];
    }
    
    const query = debouncedSearchQuery.toLowerCase();
    const suggestions = campaigns
      .filter(campaign => 
        campaign.appName.toLowerCase().includes(query) || 
        campaign.companyName.toLowerCase().includes(query)
      )
      .slice(0, 8) // Limit to 8 suggestions
      .map(campaign => ({
        id: campaign.id,
        appName: campaign.appName,
        companyName: campaign.companyName,
      }));
    
    return suggestions;
  }, [debouncedSearchQuery, campaigns]);
  
  // Handle Apply button click
  const handleApplyFilters = () => {
    setSearchQuery(pendingSearchQuery);
    setSelectedCategories(pendingSelectedCategories);
    setSelectedStages(pendingSelectedStages);
    setDateRange(pendingDateRange);
    setIsPopoverOpen(false);
  };
  
  // Handle Reset button click
  const handleResetFilters = () => {
    const today = new Date();
    const defaultRange = {
      from: subDays(today, 7),
      to: today,
      preset: "last7days",
    };
    setPendingSearchQuery("");
    setPendingSelectedCategories([]);
    setPendingSelectedStages([]);
    setPendingDateRange(defaultRange);
    // Also reset active filters
    setSearchQuery("");
    setSelectedCategories([]);
    setSelectedStages([]);
    setDateRange(defaultRange);
  };

  // Helper functions for removing individual filters
  const removeCategory = (category: string) => {
    const updated = pendingSelectedCategories.filter(c => c !== category);
    setPendingSelectedCategories(updated);
    setSelectedCategories(updated);
  };

  const removeStage = (stage: string) => {
    const updated = pendingSelectedStages.filter(s => s !== stage);
    setPendingSelectedStages(updated);
    setSelectedStages(updated);
  };

  const clearSearchFilter = () => {
    setPendingSearchQuery("");
    setSearchQuery("");
  };

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

  // Dialog states
  const [isLogsDialogOpen, setIsLogsDialogOpen] = useState(false);
  const [isKeywordsDialogOpen, setIsKeywordsDialogOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [selectedLogTab, setSelectedLogTab] = useState("tab1");
  const [campaignLogs, setCampaignLogs] = useState<CampaignLog[]>(generateMockCampaignLogs());
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  
  // Keywords dialog states
  const [newKeywords, setNewKeywords] = useState("");
  const [numberOfEntries, setNumberOfEntries] = useState("50");
  const [usedKeywords, setUsedKeywords] = useState([
    "Affiliate", "Partnership", "Growth", "Expansion", 
    "Marketing", "Sales", "Collaboration", "Integration"
  ]);
  const [isLoadingKeywords, setIsLoadingKeywords] = useState(false);
  const [fetchedKeywords, setFetchedKeywords] = useState<string[]>([]);
  const [suggestedKeywords, setSuggestedKeywords] = useState([
    "Revenue Share", "Commission", "API Integration", "White Label",
    "Joint Venture", "Cross-promotion", "Co-marketing", "Referral Program"
  ]);
  
  // Contact fetching states
  const [isScanningContacts, setIsScanningContacts] = useState(false);
  const [fetchedContacts, setFetchedContacts] = useState<Contact[]>([]);
  const [totalContactsToFetch, setTotalContactsToFetch] = useState(0);

  // Filter and sort campaigns
  const filteredAndSortedCampaigns = useMemo(() => {
    let filtered = campaigns.filter((campaign) => {
      const matchesSearch =
        campaign.appName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        campaign.companyName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategories.length === 0 || selectedCategories.includes(campaign.category);
      const matchesStage =
        selectedStages.length === 0 || selectedStages.includes(campaign.approachStage);

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
  }, [campaigns, searchQuery, selectedCategories, selectedStages, sortConfig]);

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
    const campaign = campaigns.find(c => c.id === campaignId);
    const newStatus = !campaign?.sendPermission;
    setCampaigns(
      campaigns.map((c) =>
        c.id === campaignId ? { ...c, sendPermission: newStatus } : c
      )
    );
    toast.success(newStatus ? "Send permission enabled" : "Send permission disabled", {
      duration: 2000,
    });
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("URL copied to clipboard!", {
      duration: 2000,
    });
  };

  const handleViewLogs = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setIsLogsDialogOpen(true);
  };

  const handleRefetchKeywords = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setIsKeywordsDialogOpen(true);
  };

  const handleRemoveKeyword = (keyword: string) => {
    setUsedKeywords(usedKeywords.filter(k => k !== keyword));
  };

  const handleAddSuggestedKeyword = (keyword: string) => {
    if (!usedKeywords.includes(keyword)) {
      setUsedKeywords([...usedKeywords, keyword]);
      // Add to textarea as well
      setNewKeywords(prev => prev ? `${prev}, ${keyword}` : keyword);
    }
  };

  const handleFetchKeywords = async () => {
    if (!newKeywords.trim()) return;
    
    setIsLoadingKeywords(true);
    setFetchedContacts([]);
    
    // Scroll to contact scanner after a brief delay
    setTimeout(() => {
      const contactScannerElement = document.getElementById('contact-scanner-section');
      if (contactScannerElement) {
        contactScannerElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 2100);
    
    // Simulate AI processing (2 seconds)
    setTimeout(() => {
      // Parse comma-separated keywords
      const newKeywordsList = newKeywords
        .split(",")
        .map(k => k.trim())
        .filter(k => k.length > 0)
        .map(k => k.charAt(0).toUpperCase() + k.slice(1));
      
      // Simulate fetched keywords (in real app, this comes from API)
      const simulatedFetched = [
        "B2B Partnership", "Strategic Alliance", "Lead Generation",
        "Customer Acquisition", "Channel Partner", "Reseller Program"
      ];
      
      // Merge with existing keywords (avoid duplicates)
      const allKeywords = [...usedKeywords];
      newKeywordsList.forEach(kw => {
        if (!allKeywords.includes(kw)) allKeywords.push(kw);
      });
      simulatedFetched.forEach(kw => {
        if (!allKeywords.includes(kw)) allKeywords.push(kw);
      });
      
      setUsedKeywords(allKeywords);
      setFetchedKeywords(simulatedFetched);
      setNewKeywords("");
      setIsLoadingKeywords(false);
      
      // Start contact scanning
      const entriesCount = parseInt(numberOfEntries) || 50;
      setTotalContactsToFetch(entriesCount);
      setIsScanningContacts(true);
      
      // Simulate progressive contact fetching
      const mockContacts: Contact[] = [
        { person: "John Smith", email: "john.smith@company.com", mobile: "+1-555-0101", linkedin: "https://linkedin.com/in/johnsmith" },
        { person: "Sarah Johnson", email: "sarah.j@business.io", mobile: "+1-555-0102", linkedin: "https://linkedin.com/in/sarahj" },
        { person: "Michael Chen", email: "m.chen@startup.co", mobile: "+1-555-0103", linkedin: "https://linkedin.com/in/mchen" },
        { person: "Emily Davis", email: "emily.davis@firm.com", mobile: "+1-555-0104", linkedin: "https://linkedin.com/in/emilyd" },
        { person: "David Wilson", email: "d.wilson@corp.net", mobile: "+1-555-0105", linkedin: "https://linkedin.com/in/davidw" },
        { person: "Lisa Anderson", email: "lisa.a@enterprise.com", mobile: "+1-555-0106", linkedin: "https://linkedin.com/in/lisaa" },
        { person: "James Martinez", email: "james.m@agency.io", mobile: "+1-555-0107", linkedin: "https://linkedin.com/in/jamesm" },
        { person: "Jennifer Taylor", email: "j.taylor@company.org", mobile: "+1-555-0108", linkedin: "https://linkedin.com/in/jtaylor" },
        { person: "Robert Brown", email: "r.brown@business.net", mobile: "+1-555-0109", linkedin: "https://linkedin.com/in/rbrown" },
        { person: "Maria Garcia", email: "maria.g@startup.com", mobile: "+1-555-0110", linkedin: "https://linkedin.com/in/mariag" },
      ];
      
      let currentIndex = 0;
      const interval = setInterval(() => {
        if (currentIndex < Math.min(entriesCount, mockContacts.length)) {
          const contact = { ...mockContacts[currentIndex % mockContacts.length], fetched: false };
          setFetchedContacts(prev => [...prev, contact]);
          
          // Mark as fetched after a short delay
          setTimeout(() => {
            setFetchedContacts(prev => 
              prev.map((c, idx) => 
                idx === currentIndex ? { ...c, fetched: true } : c
              )
            );
          }, 300);
          
          currentIndex++;
        } else {
          clearInterval(interval);
          setIsScanningContacts(false);
        }
      }, 500);
    }, 2000);
  };

  const handleToggleEmailStatus = (logId: string) => {
    setCampaignLogs(
      campaignLogs.map((log) =>
        log.id === logId ? { ...log, emailStatusEnabled: !log.emailStatusEnabled } : log
      )
    );
  };

  // Filter logs by selected tab
  const filteredLogs = useMemo(() => {
    return campaignLogs.filter(log => {
      if (selectedLogTab === "tab1") return log.tab === "Tab 1";
      if (selectedLogTab === "tab2") return log.tab === "Tab 2";
      if (selectedLogTab === "tab3") return log.tab === "Tab 3";
      if (selectedLogTab === "tab4") return log.tab === "Tab 4";
      return true;
    });
  }, [campaignLogs, selectedLogTab]);

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
    <div className="flex flex-1 flex-col gap-6 w-full">
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
      <Card className="bg-gradient-to-br from-background to-muted/20 border-border/50 w-full">
        {/* <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader> */}
        <CardContent>
          <div className="space-y-4 w-full">
            {/* Filters and Buttons Row */}
            <div className="flex flex-col md:flex-row gap-4 w-full items-end">
              {/* Filters Container */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 flex-1">
              {/* Search with Autocomplete */}
              <div className="relative">
                <Label htmlFor="search" className="text-sm mb-2">
                  App / Company Name
                </Label>
                <div className="relative">
                  <Input
                    id="search"
                    placeholder="Search campaigns..."
                    value={pendingSearchQuery}
                    onChange={(e) => {
                      setPendingSearchQuery(e.target.value);
                      setIsSearchDropdownOpen(true);
                    }}
                    onFocus={() => setIsSearchDropdownOpen(true)}
                    onBlur={() => setTimeout(() => setIsSearchDropdownOpen(false), 200)}
                    className="h-9"
                  />
                  
                  {/* Autocomplete Dropdown */}
                  {isSearchDropdownOpen && searchSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                      {searchSuggestions.map((suggestion) => (
                        <button
                          key={suggestion.id}
                          onClick={() => {
                            setPendingSearchQuery(suggestion.appName);
                            setIsSearchDropdownOpen(false);
                          }}
                          className="w-full text-left px-3 py-2.5 hover:bg-muted transition-colors border-b border-border/40 last:border-b-0 flex flex-col gap-0.5"
                        >
                          <span className="text-sm font-medium text-foreground">
                            {suggestion.appName}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {suggestion.companyName}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Category Filter - Multi-Select */}
              <div>
                <Label htmlFor="category" className="text-sm mb-2">
                  Category
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full h-9 justify-between text-foreground hover:bg-muted"
                    >
                      <span className="text-sm">
                        {pendingSelectedCategories.length === 0
                          ? "Select Categories"
                          : `${pendingSelectedCategories.length} selected`}
                      </span>
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-56 p-3" align="start">
                    <div className="space-y-2">
                      {["Finance", "Tech", "Healthcare", "Retail", "Other"].map((category) => (
                        <label key={category} className="flex items-center gap-2 p-2 hover:bg-muted rounded cursor-pointer transition-colors">
                          <input
                            type="checkbox"
                            checked={pendingSelectedCategories.includes(category)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setPendingSelectedCategories([...pendingSelectedCategories, category]);
                              } else {
                                setPendingSelectedCategories(
                                  pendingSelectedCategories.filter((c) => c !== category)
                                );
                              }
                            }}
                            className="rounded border-gray-300 cursor-pointer"
                          />
                          <span className="text-sm text-foreground">{category}</span>
                        </label>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Approach Stage Filter - Multi-Select */}
              <div>
                <Label htmlFor="stage" className="text-sm mb-2">
                  Approach Stage
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full h-9 justify-between text-foreground hover:bg-muted"
                    >
                      <span className="text-sm">
                        {pendingSelectedStages.length === 0
                          ? "Select Stages"
                          : `${pendingSelectedStages.length} selected`}
                      </span>
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-56 p-3" align="start">
                    <div className="space-y-2">
                      {["No Attempt", "No Follow-up", "Follow-up", "Completed"].map((stage) => (
                        <label key={stage} className="flex items-center gap-2 p-2 hover:bg-muted rounded cursor-pointer transition-colors">
                          <input
                            type="checkbox"
                            checked={pendingSelectedStages.includes(stage)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setPendingSelectedStages([...pendingSelectedStages, stage]);
                              } else {
                                setPendingSelectedStages(
                                  pendingSelectedStages.filter((s) => s !== stage)
                                );
                              }
                            }}
                            className="rounded border-gray-300 cursor-pointer"
                          />
                          <span className="text-sm text-foreground">{stage}</span>
                        </label>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Date Range Picker */}
              <div className="flex flex-col gap-2 ">
                <Label htmlFor="date-range" className="text-sm ">
                  Date Range
                </Label>
                <div className="flex gap-2">
                  <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex-1 h-9 bg-transparent border border-input rounded-lg px-3 py-2 text-foreground font-medium justify-between hover:border-muted-foreground transition-colors text-sm"
                    >
                      <div className="flex items-center gap-2 ">
                        <CalendarDays className="h-4 w-4" />
                        {pendingDateRange.from ? (
                          pendingDateRange.preset && pendingDateRange.preset !== "custom" ? (
                            datePresets.find((p) => p.id === pendingDateRange.preset)?.label || "Custom range"
                          ) : (
                            `${format(pendingDateRange.from, "MMM dd")} - ${format(
                              pendingDateRange.to,
                              "MMM dd"
                            )}`
                          )
                        ) : (
                          "Select date range"
                        )}
                      </div>
                      {isPopoverOpen ? (
                        <CalendarDays className="h-4 w-4 rotate-180 text-foreground" />
                      ) : (
                        <CalendarDays className="h-4 w-4 rotate-90 text-muted-foreground" />
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto p-0 bg-background rounded-xl shadow-xl border border-border scale-75 origin-top-left"
                    align="start"
                  >
                    <div className="flex">
                      {/* Presets  */}
                      <div className="border-r border-border p-3 max-w-40">
                        <div className="space-y-1">
                          {datePresets.map((preset) => (
                            <Button
                              key={preset.id}
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const range = preset.getValue();
                                setPendingDateRange({
                                  from: range.from,
                                  to: range.to,
                                  preset: preset.id,
                                });
                              }}
                              className={`w-full justify-start text-right h-8 px-2 text-xs transition-all duration-200 ${
                                pendingDateRange.preset === preset.id
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
                          selected={{ from: pendingDateRange.from, to: pendingDateRange.to }}
                          onSelect={(range) => {
                            if (range?.from) {
                              setPendingDateRange({
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
              </div>

              {/* Apply and Reset Buttons */}
              <div className="flex gap-2 w-auto">
                <Button
                  variant="default"
                  size="sm"
                  className="h-9 px-6 text-xs font-medium"
                  onClick={handleApplyFilters}
                  title="Apply filters"
                >
                  Apply
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 px-6 text-xs font-medium hover:bg-muted"
                  onClick={handleResetFilters}
                  title="Reset to default (Last 7 days)"
                >
                  Reset
                </Button>
              </div>
            </div>

            {/* Active Filter Indicators */}
            {(selectedCategories.length > 0 || selectedStages.length > 0 || searchQuery) && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-wrap items-center gap-2"
              >
                <span className="text-xs text-muted-foreground font-medium">Active filters:</span>
                
                {searchQuery && (
                  <Badge variant="secondary" className="gap-1 pl-2 pr-1 py-1">
                    <span className="text-xs">Search: {searchQuery}</span>
                    <button
                      onClick={clearSearchFilter}
                      className="ml-1 hover:bg-muted rounded-full p-0.5 transition-colors"
                      title="Clear search"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}

                {selectedCategories.map((category) => (
                  <Badge key={category} variant="secondary" className="gap-1 pl-2 pr-1 py-1">
                    <span className="text-xs">{category}</span>
                    <button
                      onClick={() => removeCategory(category)}
                      className="ml-1 hover:bg-muted rounded-full p-0.5 transition-colors"
                      title={`Remove ${category}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}

                {selectedStages.map((stage) => (
                  <Badge key={stage} variant="secondary" className="gap-1 pl-2 pr-1 py-1">
                    <span className="text-xs">{stage}</span>
                    <button
                      onClick={() => removeStage(stage)}
                      className="ml-1 hover:bg-muted rounded-full p-0.5 transition-colors"
                      title={`Remove ${stage}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetFilters}
                  className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                >
                  Clear all
                </Button>
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-border/50 w-full">
        <div className="overflow-x-auto w-full">
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
                  <TableCell colSpan={8} className="h-[400px]">
                    <div className="flex flex-col items-center justify-center py-12">
                      <div className="rounded-full bg-muted p-4 mb-4">
                        <Search className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">
                        {searchQuery || selectedCategories.length > 0 || selectedStages.length > 0
                          ? "No campaigns match your filters"
                          : "No campaigns found"}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4 max-w-sm text-center">
                        {searchQuery || selectedCategories.length > 0 || selectedStages.length > 0
                          ? "Try adjusting your search or filter criteria"
                          : "Get started by adding your first campaign"}
                      </p>
                      <div className="flex gap-2">
                        {(searchQuery || selectedCategories.length > 0 || selectedStages.length > 0) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleResetFilters}
                            className="gap-2"
                          >
                            <X className="h-4 w-4" />
                            Reset Filters
                          </Button>
                        )}
                      </div>
                    </div>
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
                        className="data-[state=on]:bg-green-500/20 data-[state=on]:text-green-700 dark:data-[state=on]:text-green-400 gap-1 px-2"
                        aria-label="Toggle send permission"
                      >
                        {campaign.sendPermission ? (
                          <>
                            <Zap className="w-4 h-4" />
                            <span className="text-xs font-medium">Active</span>
                          </>
                        ) : (
                          <>
                            <Zap className="w-4 h-4 opacity-50" />
                            <span className="text-xs font-medium opacity-50">Inactive</span>
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

                <TabsContent value={selectedLogTab} className="flex-1 mt-4 overflow-hidden">
                  <ScrollArea className="h-[calc(85vh-180px)]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">S.No</TableHead>
                          <TableHead className="min-w-[200px]">Person Info</TableHead>
                          <TableHead className="w-24">Country</TableHead>
                          <TableHead className="min-w-[120px]">Approachable</TableHead>
                          <TableHead className="min-w-[100px]">Status</TableHead>
                          <TableHead className="min-w-[100px]">Sent Time</TableHead>
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
                                <Badge className={getApproachabilityColor(log.approachability)}>
                                  {log.approachability === "Approachable" && (
                                    <>
                                      <Check className="w-3 h-3 mr-1" />
                                      <span className="text-xs">Yes</span>
                                    </>
                                  )}
                                  {log.approachability === "Cautious" && (
                                    <>
                                      <AlertCircle className="w-3 h-3 mr-1" />
                                      <span className="text-xs">Cautious</span>
                                    </>
                                  )}
                                  {log.approachability === "Not Approachable" && (
                                    <>
                                      <X className="w-3 h-3 mr-1" />
                                      <span className="text-xs">No</span>
                                    </>
                                  )}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge className={getEmailStatusColor(log.emailStatus)}>
                                  <span className="text-xs">{log.emailStatus}</span>
                                </Badge>
                              </TableCell>
                              <TableCell className="text-sm">
                                {format(log.sentTime, "MMM dd, HH:mm")}
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
        <DialogContent className="max-w-7xl max-h-[95vh] overflow-hidden p-0">
          {/* Header */}
          <div className="px-6 pt-6 pb-4 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
                <div className="h-8 w-1 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
                Refetch Keywords - {selectedCampaign?.appName}
              </DialogTitle>
              <DialogDescription className="text-base text-muted-foreground mt-1">
                Add keywords and let AI fetch relevant contacts for your campaign
              </DialogDescription>
            </DialogHeader>
          </div>

          {/* Main Content - 60/40 Split */}
          <div className="flex h-[calc(95vh-140px)] overflow-hidden">
            {/* LEFT PANEL - 60% */}
            <div className="flex-[0.6] flex flex-col border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
              {/* Compact Input Section */}
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="p-4 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-950"
              >
                <div className="grid grid-cols-[1fr_160px] gap-3">
                  {/* Left Column - Keywords Input */}
                  <div className="flex flex-col">
                    <Label htmlFor="keywords" className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                      Keywords
                    </Label>
                    <Textarea
                      id="keywords"
                      placeholder="affiliate, partnership, growth, marketing..."
                      value={newKeywords}
                      onChange={(e) => setNewKeywords(e.target.value)}
                      disabled={isLoadingKeywords}
                      className="resize-none border-gray-300 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 rounded-lg text-sm h-[120px] shadow-sm"
                    />
                  </div>

                  {/* Right Column - Entries + Button */}
                  <div className="flex flex-col gap-3">
                    {/* Entries Input */}
                    <div className="flex flex-col">
                      <Label htmlFor="entries" className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                        Entries
                      </Label>
                      <Input
                        id="entries"
                        type="number"
                        placeholder="50"
                        value={numberOfEntries}
                        onChange={(e) => setNumberOfEntries(e.target.value)}
                        disabled={isLoadingKeywords}
                        className="border-gray-300 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 rounded-lg h-[45px] text-sm shadow-sm text-center font-semibold"
                      />
                    </div>

                    {/* Fetch Button */}
                    <Button 
                      onClick={handleFetchKeywords} 
                      disabled={isLoadingKeywords || !newKeywords.trim()}
                      className="h-[56px] w-full bg-gray-900 hover:bg-gray-800 dark:bg-gray-100 dark:hover:bg-gray-200 text-white dark:text-gray-900 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 text-sm"
                    >
                      <RefreshCw className={`w-4 h-4 mr-2 ${isLoadingKeywords ? 'animate-spin' : ''}`} />
                      {isLoadingKeywords ? 'Fetching...' : 'Fetch'}
                    </Button>
                  </div>
                </div>
              </motion.div>

              {/* Contact Scanner - Main Focus */}
              <div className="flex-1 overflow-hidden p-4" id="contact-scanner-section">


                {isLoadingKeywords ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center h-full space-y-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-xl border-2 border-dashed border-blue-300 dark:border-blue-800"
                  >
                    <LottieLoader size={100} />
                    <div className="text-center space-y-2">
                      <p className="text-base font-semibold text-blue-700 dark:text-blue-300">
                        AI is analyzing and fetching keywords...
                      </p>
                      <p className="text-sm text-blue-600 dark:text-blue-400">
                        This may take a few moments
                      </p>
                    </div>
                  </motion.div>
                ) : isScanningContacts || fetchedContacts.length > 0 ? (
                  <div className="h-full overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 shadow-lg">
                    <ContactScanner
                      contacts={fetchedContacts}
                      progress={fetchedContacts.length}
                      total={totalContactsToFetch}
                      status="Fetching contacts..."
                      isScanning={isScanningContacts}
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full space-y-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700">
                    <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                      <Users className="w-10 h-10 text-gray-400 dark:text-gray-600" />
                    </div>
                    <div className="text-center space-y-1">
                      <p className="text-base font-semibold text-gray-700 dark:text-gray-300">
                        No contacts fetched yet
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-500">
                        Add keywords and click "Fetch Contacts" to begin
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT SIDEBAR - 40% */}
            <div className="flex-[0.4] flex flex-col bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 overflow-y-auto">
              {/* Stats Cards */}
              <div className="p-4 space-y-3">
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-3 gap-2"
                >
                  {/* Total Keywords */}
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-3 shadow-md">
                    <p className="text-[10px] font-semibold text-blue-100 uppercase tracking-wide mb-1">Total</p>
                    <p className="text-2xl font-bold text-white">{usedKeywords.length}</p>
                    <p className="text-[9px] text-blue-100 mt-0.5">Keywords</p>
                  </div>

                  {/* Fetched */}
                  <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-3 shadow-md">
                    <p className="text-[10px] font-semibold text-green-100 uppercase tracking-wide mb-1">Fetched</p>
                    <p className="text-2xl font-bold text-white">{fetchedKeywords.length}</p>
                    <p className="text-[9px] text-green-100 mt-0.5">AI Added</p>
                  </div>
 
                  {/* Contacts */}
                  <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-3 shadow-md">
                    <p className="text-[10px] font-semibold text-purple-100 uppercase tracking-wide mb-1">Contacts</p>
                    <p className="text-2xl font-bold text-white">{fetchedContacts.length}</p>
                    <p className="text-[9px] text-purple-100 mt-0.5">Found</p>
                  </div>
                </motion.div>
              </div>

              <Separator className="bg-gray-200 dark:bg-gray-800" />

              {/* All Keywords Section */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="flex-1 p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                    All Keywords
                  </h3>
                  <Badge variant="outline" className="text-xs font-semibold bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400">
                    {usedKeywords.length} total
                  </Badge>
                </div>

                {/* Search Input */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <Input
                    placeholder="Search keywords..."
                    className="pl-9 h-8 text-xs border-gray-300 dark:border-gray-700 rounded-lg"
                  />
                </div>
                
                <ScrollArea className="h-[200px] rounded-lg border border-gray-200 dark:border-gray-800 p-3 bg-white dark:bg-gray-950 shadow-sm">
                  {usedKeywords.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
                      No keywords yet. Add some to get started.
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {usedKeywords.map((keyword, index) => {
                        const isAdded = !fetchedKeywords.includes(keyword);
                        const isFetched = fetchedKeywords.includes(keyword);
                        
                        return (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.02 }}
                            className={`group relative inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border shadow-sm transition-all hover:shadow-md ${
                              isFetched 
                                ? 'bg-green-50 dark:bg-green-950/30 border-green-300 dark:border-green-800 text-green-700 dark:text-green-400'
                                : 'bg-blue-50 dark:bg-blue-950/30 border-blue-300 dark:border-blue-800 text-blue-700 dark:text-blue-400'
                            }`}
                          >
                            <span className="text-xs font-medium">{keyword}</span>
                            <button
                              onClick={() => handleRemoveKeyword(keyword)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-600 dark:hover:text-red-400"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </ScrollArea>
              </motion.div>

              <Separator className="bg-gray-200 dark:bg-gray-800" />

              {/* Suggested Keywords Section */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="flex-1 p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                    Suggested Keywords
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
                    onClick={() => {
                      suggestedKeywords.forEach(kw => {
                        if (!usedKeywords.includes(kw)) {
                          handleAddSuggestedKeyword(kw);
                        }
                      });
                    }}
                  >
                    Add All
                  </Button>
                </div>
                
                <ScrollArea className="h-[200px] rounded-lg border border-gray-200 dark:border-gray-800 p-3 bg-white dark:bg-gray-950 shadow-sm">
                  <div className="flex flex-wrap gap-1.5">
                    {suggestedKeywords.map((keyword, index) => (
                      <motion.button
                        key={index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.04 }}
                        onClick={() => handleAddSuggestedKeyword(keyword)}
                        disabled={usedKeywords.includes(keyword)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all shadow-sm hover:shadow-md ${
                          usedKeywords.includes(keyword)
                            ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed border border-gray-200 dark:border-gray-700'
                            : 'bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/40 border border-purple-300 dark:border-purple-800 cursor-pointer'
                        }`}
                      >
                        {usedKeywords.includes(keyword) ? (
                          <Check className="w-3 h-3" />
                        ) : (
                          <span className="text-xs font-bold">+</span>
                        )}
                        {keyword}
                      </motion.button>
                    ))}
                  </div>
                </ScrollArea>
              </motion.div>
            </div>
          </div>

          {/* Bottom Toolbar */}
          <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-800 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="outline" className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400">
                  <Check className="w-3 h-3 mr-1" />
                  Ready
                </Badge>
                <span>Last fetch: {fetchedKeywords.length > 0 ? 'Just now' : 'Not yet'}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs border-gray-300 dark:border-gray-700"
                  onClick={() => setUsedKeywords([])}
                >
                  <X className="w-3 h-3 mr-1.5" />
                  Clear All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs border-gray-300 dark:border-gray-700"
                  disabled={fetchedContacts.length === 0}
                >
                  <Download className="w-3 h-3 mr-1.5" />
                  Export Contacts
                </Button>
                <Button
                  size="sm"
                  className="h-8 text-xs bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  onClick={() => setIsKeywordsDialogOpen(false)}
                >
                  Done
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
  
    </div>
  );
}