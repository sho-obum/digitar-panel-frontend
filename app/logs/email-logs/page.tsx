"use client"

import { useState, useMemo } from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import AppSidebar from "@/app/components/sidebar"
import Header from "@/app/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { Calendar } from "@/components/calendar-with-presets"
import { format, subDays, subMonths, startOfMonth, endOfMonth } from "date-fns"
import { CalendarDays, ChevronLeft, ChevronRight, Eye, Download, ArrowUpDown, ArrowUp, ArrowDown, Check, ChevronsUpDown } from "lucide-react"
import type { DateRange } from "react-day-picker"

type EmailLog = {
  id: string
  campaign: string
  sender: string
  receiver: string
  subject: string
  status: string
  sentDate: Date
}

type SortConfig = {
  key: keyof EmailLog | null
  direction: "asc" | "desc"
}

// Mock data generator
const generateMockEmailLogs = () => {
  const campaigns = ["Summer Sale 2025", "Product Launch", "Newsletter Q1", "Black Friday", "Welcome Series", "Re-engagement Campaign"]
  const statuses = ["Delivered", "Opened", "Bounced", "Failed", "Pending"]
  const domains = ["gmail.com", "yahoo.com", "outlook.com", "company.com", "business.org"]
  const subjects = [
    "Exclusive Offer Inside!",
    "Your Weekly Newsletter",
    "Don't Miss Out - Limited Time",
    "Welcome to Our Platform",
    "Account Update Required",
    "Special Promotion Just For You"
  ]

  return Array.from({ length: 120 }, (_, i) => {
    const id = String(i + 1).padStart(4, "0")
    const campaign = campaigns[Math.floor(Math.random() * campaigns.length)]
    const status = statuses[Math.floor(Math.random() * statuses.length)]
    const senderName = `sender${Math.floor(Math.random() * 20) + 1}`
    const receiverName = `user${Math.floor(Math.random() * 100) + 1}`
    const senderDomain = domains[Math.floor(Math.random() * domains.length)]
    const receiverDomain = domains[Math.floor(Math.random() * domains.length)]
    const subject = subjects[Math.floor(Math.random() * subjects.length)]
    const daysAgo = Math.floor(Math.random() * 30)
    const date = new Date()
    date.setDate(date.getDate() - daysAgo)

    return {
      id,
      campaign,
      sender: `${senderName}@${senderDomain}`,
      receiver: `${receiverName}@${receiverDomain}`,
      subject,
      status,
      sentDate: date,
    }
  })
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "Delivered":
      return "bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/20"
    case "Opened":
      return "bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20"
    case "Bounced":
    case "Failed":
      return "bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20"
    case "Pending":
      return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-500/20"
    default:
      return "bg-gray-500/10 text-gray-600 dark:text-gray-400 hover:bg-gray-500/20"
  }
}

export default function EmailLogsPage() {
  const breadcrumbs = [
    { title: "Logs", href: "/logs", isActive: false },
    { title: "Email Logs", href: "/logs/email-logs", isActive: true },
  ]

  // Mock data
  const allLogs = useMemo(() => generateMockEmailLogs(), [])

  // Filter states (temporary - not applied yet)
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([])
  const [campaignPopoverOpen, setCampaignPopoverOpen] = useState(false)
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  const [datePreset, setDatePreset] = useState<string>("custom")
  const [datePopoverOpen, setDatePopoverOpen] = useState(false)
  const [senderFilter, setSenderFilter] = useState("")
  const [receiverFilter, setReceiverFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  // Applied filter states (actual filters used)
  const [appliedCampaigns, setAppliedCampaigns] = useState<string[]>([])
  const [appliedDateRange, setAppliedDateRange] = useState<DateRange | undefined>(undefined)
  const [appliedSenderFilter, setAppliedSenderFilter] = useState("")
  const [appliedReceiverFilter, setAppliedReceiverFilter] = useState("")
  const [appliedStatusFilter, setAppliedStatusFilter] = useState<string>("all")

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  // Sorting state
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: "asc" })

  // View details state
  const [selectedLog, setSelectedLog] = useState<EmailLog | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  // Autocomplete visibility states
  const [showSenderSuggestions, setShowSenderSuggestions] = useState(false)
  const [showReceiverSuggestions, setShowReceiverSuggestions] = useState(false)

  // Campaign options for Command component
  const campaignOptions = useMemo(() => {
    return Array.from(new Set(allLogs.map(log => log.campaign)))
  }, [allLogs])

  // Date presets
  const datePresets = [
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
        const lastMonth = subMonths(new Date(), 1)
        return {
          from: startOfMonth(lastMonth),
          to: endOfMonth(lastMonth),
        }
      },
    },
  ]

  // Get date range text
  const getDateRangeText = () => {
    if (!dateRange?.from) return "Select date range"
    if (datePreset && datePreset !== "custom") {
      const preset = datePresets.find((p) => p.id === datePreset)
      return preset?.label || "Custom range"
    }
    if (dateRange.from && dateRange.to) {
      return `${format(dateRange.from, "MMM dd")} - ${format(dateRange.to, "MMM dd")}`
    }
    return format(dateRange.from, "MMM dd, yyyy")
  }

  // Sender/Receiver suggestions for autocomplete
  const senderSuggestions = useMemo(() => {
    return Array.from(new Set(allLogs.map(log => log.sender)))
  }, [allLogs])

  const receiverSuggestions = useMemo(() => {
    return Array.from(new Set(allLogs.map(log => log.receiver)))
  }, [allLogs])

  // Filtered suggestions based on input
  const filteredSenderSuggestions = useMemo(() => {
    if (!senderFilter) return []
    return senderSuggestions
      .filter(sender => sender.toLowerCase().includes(senderFilter.toLowerCase()))
      .slice(0, 5)
  }, [senderFilter, senderSuggestions])

  const filteredReceiverSuggestions = useMemo(() => {
    if (!receiverFilter) return []
    return receiverSuggestions
      .filter(receiver => receiver.toLowerCase().includes(receiverFilter.toLowerCase()))
      .slice(0, 5)
  }, [receiverFilter, receiverSuggestions])

  // Apply filters (using APPLIED filter states only)
  const filteredLogs = useMemo(() => {
    return allLogs.filter(log => {
      // Campaign filter
      if (appliedCampaigns.length > 0 && !appliedCampaigns.includes(log.campaign)) {
        return false
      }

      // Date range filter
      if (appliedDateRange?.from && log.sentDate < appliedDateRange.from) {
        return false
      }
      if (appliedDateRange?.to) {
        const endOfDay = new Date(appliedDateRange.to)
        endOfDay.setHours(23, 59, 59, 999)
        if (log.sentDate > endOfDay) {
          return false
        }
      }

      // Sender filter
      if (appliedSenderFilter && !log.sender.toLowerCase().includes(appliedSenderFilter.toLowerCase())) {
        return false
      }

      // Receiver filter
      if (appliedReceiverFilter && !log.receiver.toLowerCase().includes(appliedReceiverFilter.toLowerCase())) {
        return false
      }

      // Status filter
      if (appliedStatusFilter !== "all" && log.status !== appliedStatusFilter) {
        return false
      }

      return true
    })
  }, [allLogs, appliedCampaigns, appliedDateRange, appliedSenderFilter, appliedReceiverFilter, appliedStatusFilter])

  // Apply sorting
  const sortedLogs = useMemo(() => {
    if (!sortConfig.key) return filteredLogs

    const sorted = [...filteredLogs].sort((a, b) => {
      const aValue = a[sortConfig.key!]
      const bValue = b[sortConfig.key!]

      if (aValue instanceof Date && bValue instanceof Date) {
        return sortConfig.direction === "asc" 
          ? aValue.getTime() - bValue.getTime()
          : bValue.getTime() - aValue.getTime()
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortConfig.direction === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      }

      return 0
    })

    return sorted
  }, [filteredLogs, sortConfig])

  // Paginated data
  const paginatedLogs = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage
    const endIndex = startIndex + rowsPerPage
    return sortedLogs.slice(startIndex, endIndex)
  }, [sortedLogs, currentPage, rowsPerPage])

  const totalPages = Math.ceil(sortedLogs.length / rowsPerPage)

  // Apply filters
  const handleApplyFilters = () => {
    setAppliedCampaigns(selectedCampaigns)
    setAppliedDateRange(dateRange)
    setAppliedSenderFilter(senderFilter)
    setAppliedReceiverFilter(receiverFilter)
    setAppliedStatusFilter(statusFilter)
    setCurrentPage(1)
  }

  // Reset filters
  const handleReset = () => {
    // Reset temporary filters
    setSelectedCampaigns([])
    setDateRange(undefined)
    setSenderFilter("")
    setReceiverFilter("")
    setStatusFilter("all")
    
    // Reset applied filters
    setAppliedCampaigns([])
    setAppliedDateRange(undefined)
    setAppliedSenderFilter("")
    setAppliedReceiverFilter("")
    setAppliedStatusFilter("all")
    
    setCurrentPage(1)
    setSortConfig({ key: null, direction: "asc" })
  }

  // Handle sorting
  const handleSort = (key: keyof EmailLog) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc"
    }))
  }

  // Get sort icon
  const getSortIcon = (key: keyof EmailLog) => {
    if (sortConfig.key !== key) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />
    }
    return sortConfig.direction === "asc" 
      ? <ArrowUp className="ml-2 h-4 w-4" />
      : <ArrowDown className="ml-2 h-4 w-4" />
  }

  // Handle view details
  const handleViewDetails = (log: EmailLog) => {
    setSelectedLog(log)
    setIsDetailsOpen(true)
  }

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ["ID", "Campaign", "Sender", "Receiver", "Subject", "Status", "Sent Date"]
    const csvData = sortedLogs.map(log => [
      log.id,
      log.campaign,
      log.sender,
      log.receiver,
      log.subject,
      log.status,
      format(log.sentDate, "MMM dd, yyyy HH:mm")
    ])

    const csvContent = [
      headers.join(","),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `email-logs-${format(new Date(), "yyyy-MM-dd")}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  // Handle rows per page change
  const handleRowsPerPageChange = (value: string) => {
    setRowsPerPage(Number(value))
    setCurrentPage(1)
  }

  // Get page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisiblePages = 5

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i)
        }
        pages.push("...")
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1)
        pages.push("...")
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        pages.push(1)
        pages.push("...")
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i)
        }
        pages.push("...")
        pages.push(totalPages)
      }
    }

    return pages
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header breadcrumbs={breadcrumbs} />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-4 overflow-auto">
          <div className="space-y-4">
            <div>
              <h1 className="text-2xl font-semibold mb-1">Email Logs</h1>
              <p className="text-sm text-muted-foreground">View and filter email campaign logs</p>
            </div>

            {/* Filters Section */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Filters</CardTitle>
                <Button onClick={handleExportCSV} variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  {/* Campaign Multi-Select with Command */}
                  <div className="space-y-2">
                    <Label>Campaign Name</Label>
                    <Popover open={campaignPopoverOpen} onOpenChange={setCampaignPopoverOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={campaignPopoverOpen}
                          className="w-full justify-between font-normal"
                        >
                          <span className="truncate">
                            {selectedCampaigns.length === 0 && "Select campaigns..."}
                            {selectedCampaigns.length === 1 && selectedCampaigns[0]}
                            {selectedCampaigns.length > 1 && `${selectedCampaigns.length} campaigns selected`}
                          </span>
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[300px] p-0" align="start">
                        <Command>
                          <CommandInput placeholder="Search campaigns..." />
                          <CommandList>
                            <CommandEmpty>No campaigns found.</CommandEmpty>
                            <CommandGroup>
                              {selectedCampaigns.length > 0 && (
                                <>
                                  <CommandItem
                                    onSelect={() => {
                                      setSelectedCampaigns([])
                                    }}
                                    className="justify-center text-center font-medium text-destructive"
                                  >
                                    Clear All ({selectedCampaigns.length})
                                  </CommandItem>
                                  <CommandSeparator />
                                </>
                              )}
                              <CommandItem
                                onSelect={() => {
                                  if (selectedCampaigns.length === campaignOptions.length) {
                                    setSelectedCampaigns([])
                                  } else {
                                    setSelectedCampaigns([...campaignOptions])
                                  }
                                }}
                                className="font-medium"
                              >
                                <Check
                                  className={`mr-2 h-4 w-4 ${
                                    selectedCampaigns.length === campaignOptions.length
                                      ? "opacity-100"
                                      : "opacity-0"
                                  }`}
                                />
                                Select All
                              </CommandItem>
                              <CommandSeparator />
                              {campaignOptions.map((campaign) => (
                                <CommandItem
                                  key={campaign}
                                  onSelect={() => {
                                    setSelectedCampaigns((prev) =>
                                      prev.includes(campaign)
                                        ? prev.filter((c) => c !== campaign)
                                        : [...prev, campaign]
                                    )
                                  }}
                                >
                                  <Check
                                    className={`mr-2 h-4 w-4 ${
                                      selectedCampaigns.includes(campaign)
                                        ? "opacity-100"
                                        : "opacity-0"
                                    }`}
                                  />
                                  {campaign}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Date Range Picker with Presets */}
                  <div className="space-y-2">
                    <Label>Date Range</Label>
                    <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarDays className="mr-2 h-4 w-4" />
                          {getDateRangeText()}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-auto p-0 bg-background rounded-xl shadow-xl border border-border"
                        align="start"
                      >
                        <div className="flex">
                          {/* Presets */}
                          <div className="border-r border-border p-3 max-w-[140px]">
                            <div className="space-y-1">
                              {datePresets.map((preset) => (
                                <Button
                                  key={preset.id}
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    const range = preset.getValue()
                                    setDateRange(range)
                                    setDatePreset(preset.id)
                                  }}
                                  className={`w-full justify-start text-left h-8 px-2 text-xs transition-all duration-200 ${
                                    datePreset === preset.id
                                      ? "bg-foreground text-background font-medium"
                                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                                  }`}
                                >
                                  {preset.label}
                                </Button>
                              ))}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setDatePreset("custom")
                                }}
                                className={`w-full justify-start text-left h-8 px-2 text-xs transition-all duration-200 ${
                                  datePreset === "custom"
                                    ? "bg-foreground text-background font-medium"
                                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                                }`}
                              >
                                Custom
                              </Button>
                            </div>
                          </div>
                          {/* Calendar */}
                          <div className="p-4">
                            <Calendar
                              mode="range"
                              selected={dateRange}
                              onSelect={(range) => {
                                setDateRange(range)
                                setDatePreset("custom")
                              }}
                              numberOfMonths={2}
                            />
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Sender Input with Autocomplete */}
                  <div className="space-y-2 relative">
                    <Label htmlFor="sender">Sender Email</Label>
                    <Input
                      id="sender"
                      placeholder="Search sender..."
                      value={senderFilter}
                      onChange={(e) => {
                        setSenderFilter(e.target.value)
                        setShowSenderSuggestions(true)
                      }}
                      onFocus={() => setShowSenderSuggestions(true)}
                      onBlur={() => {
                        // Delay to allow click on suggestion
                        setTimeout(() => setShowSenderSuggestions(false), 200)
                      }}
                      autoComplete="off"
                    />
                    {showSenderSuggestions && filteredSenderSuggestions.length > 0 && (
                      <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-48 overflow-auto">
                        {filteredSenderSuggestions.map((sender, idx) => (
                          <div
                            key={idx}
                            className="px-3 py-2 text-sm cursor-pointer hover:bg-accent transition-colors"
                            onMouseDown={(e) => {
                              e.preventDefault() // Prevent input blur
                              setSenderFilter(sender)
                              setShowSenderSuggestions(false)
                            }}
                          >
                            {sender}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Receiver Input with Autocomplete */}
                  <div className="space-y-2 relative">
                    <Label htmlFor="receiver">Receiver Email</Label>
                    <Input
                      id="receiver"
                      placeholder="Search receiver..."
                      value={receiverFilter}
                      onChange={(e) => {
                        setReceiverFilter(e.target.value)
                        setShowReceiverSuggestions(true)
                      }}
                      onFocus={() => setShowReceiverSuggestions(true)}
                      onBlur={() => {
                        // Delay to allow click on suggestion
                        setTimeout(() => setShowReceiverSuggestions(false), 200)
                      }}
                      autoComplete="off"
                    />
                    {showReceiverSuggestions && filteredReceiverSuggestions.length > 0 && (
                      <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-48 overflow-auto">
                        {filteredReceiverSuggestions.map((receiver, idx) => (
                          <div
                            key={idx}
                            className="px-3 py-2 text-sm cursor-pointer hover:bg-accent transition-colors"
                            onMouseDown={(e) => {
                              e.preventDefault() // Prevent input blur
                              setReceiverFilter(receiver)
                              setShowReceiverSuggestions(false)
                            }}
                          >
                            {receiver}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Status Dropdown */}
                  <div className="space-y-2">
                    <Label>Email Status</Label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="Delivered">Delivered</SelectItem>
                        <SelectItem value="Opened">Opened</SelectItem>
                        <SelectItem value="Bounced">Bounced</SelectItem>
                        <SelectItem value="Failed">Failed</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Filter Actions */}
                <div className="flex justify-end gap-2 mt-4">
                  <Button onClick={handleReset} variant="outline">
                    Reset Filters
                  </Button>
                  <Button onClick={handleApplyFilters}>
                    Apply Filters
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Data Table */}
            <Card>
              <CardContent className="p-0">
                {/* Table Controls */}
                <div className="flex items-center justify-between p-4 border-b">
                  <div className="text-sm text-muted-foreground">
                    Showing {sortedLogs.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1} to{" "}
                    {Math.min(currentPage * rowsPerPage, sortedLogs.length)} of {sortedLogs.length} rows
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-sm">Rows per page:</Label>
                    <Select value={String(rowsPerPage)} onValueChange={handleRowsPerPageChange}>
                      <SelectTrigger className="w-[80px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="25">25</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[80px]">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 p-0 hover:bg-transparent"
                            onClick={() => handleSort("id")}
                          >
                            ID
                            {getSortIcon("id")}
                          </Button>
                        </TableHead>
                        <TableHead>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 p-0 hover:bg-transparent"
                            onClick={() => handleSort("campaign")}
                          >
                            Campaign
                            {getSortIcon("campaign")}
                          </Button>
                        </TableHead>
                        <TableHead>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 p-0 hover:bg-transparent"
                            onClick={() => handleSort("sender")}
                          >
                            Sender
                            {getSortIcon("sender")}
                          </Button>
                        </TableHead>
                        <TableHead>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 p-0 hover:bg-transparent"
                            onClick={() => handleSort("receiver")}
                          >
                            Receiver
                            {getSortIcon("receiver")}
                          </Button>
                        </TableHead>
                        <TableHead>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 p-0 hover:bg-transparent"
                            onClick={() => handleSort("subject")}
                          >
                            Subject
                            {getSortIcon("subject")}
                          </Button>
                        </TableHead>
                        <TableHead>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 p-0 hover:bg-transparent"
                            onClick={() => handleSort("status")}
                          >
                            Status
                            {getSortIcon("status")}
                          </Button>
                        </TableHead>
                        <TableHead>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 p-0 hover:bg-transparent"
                            onClick={() => handleSort("sentDate")}
                          >
                            Sent Date
                            {getSortIcon("sentDate")}
                          </Button>
                        </TableHead>
                        <TableHead className="w-[80px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedLogs.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                            No email logs found. Try adjusting your filters.
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedLogs.map((log) => (
                          <TableRow key={log.id}>
                            <TableCell className="font-medium">{log.id}</TableCell>
                            <TableCell>{log.campaign}</TableCell>
                            <TableCell className="font-mono text-xs">{log.sender}</TableCell>
                            <TableCell className="font-mono text-xs">{log.receiver}</TableCell>
                            <TableCell>{log.subject}</TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(log.status)}>
                                {log.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm">
                              {format(log.sentDate, "MMM dd, yyyy HH:mm")}
                            </TableCell>
                            <TableCell>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8"
                                onClick={() => handleViewDetails(log)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {filteredLogs.length > 0 && (
                  <div className="flex items-center justify-center gap-2 p-4 border-t">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>

                    {getPageNumbers().map((page, index) => (
                      page === "..." ? (
                        <span key={`ellipsis-${index}`} className="px-2">...</span>
                      ) : (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="icon"
                          onClick={() => handlePageChange(page as number)}
                        >
                          {page}
                        </Button>
                      )
                    ))}

                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* View Details Dialog */}
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Email Log Details</DialogTitle>
              <DialogDescription>
                Detailed information about this email log entry
              </DialogDescription>
            </DialogHeader>
            {selectedLog && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Log ID</Label>
                    <p className="text-sm font-mono">{selectedLog.id}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                    <div>
                      <Badge className={getStatusColor(selectedLog.status)}>
                        {selectedLog.status}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Campaign</Label>
                  <p className="text-sm">{selectedLog.campaign}</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Subject</Label>
                  <p className="text-sm">{selectedLog.subject}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Sender</Label>
                    <p className="text-sm font-mono">{selectedLog.sender}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Receiver</Label>
                    <p className="text-sm font-mono">{selectedLog.receiver}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Sent Date</Label>
                  <p className="text-sm">{format(selectedLog.sentDate, "MMMM dd, yyyy 'at' HH:mm:ss")}</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Additional Information</Label>
                  <div className="rounded-lg border p-4 bg-muted/50">
                    <p className="text-sm text-muted-foreground">
                      This email was sent as part of the <span className="font-medium text-foreground">{selectedLog.campaign}</span> campaign.
                      {selectedLog.status === "Delivered" && " The email was successfully delivered to the recipient's inbox."}
                      {selectedLog.status === "Opened" && " The recipient has opened this email."}
                      {selectedLog.status === "Bounced" && " The email bounced and could not be delivered."}
                      {selectedLog.status === "Failed" && " The email failed to send due to an error."}
                      {selectedLog.status === "Pending" && " The email is currently pending delivery."}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </SidebarInset>
    </SidebarProvider>
  )
}
