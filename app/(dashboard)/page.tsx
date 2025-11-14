"use client";

import {
  Users,
  Building2,
  ArrowRight,
  TrendingUp,
  CalendarDays,
} from "lucide-react";
import { DiAndroid } from "react-icons/di";
import { SiIos } from "react-icons/si";
import { useState } from "react";
import { format, startOfMonth, endOfMonth, subMonths, subDays } from "date-fns";
import { Calendar } from "@/components/calendar-with-presets";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const StatsCard = ({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}) => (
  <div className="group relative col-span-1 flex overflow-hidden rounded-xl bg-white [box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_2px_4px_rgba(0,0,0,.05),0_12px_24px_rgba(0,0,0,.05)] transform-gpu dark:bg-black dark:[border:1px_solid_rgba(255,255,255,.1)] dark:[box-shadow:0_-20px_80px_-20px_#ffffff1f_inset] h-40">
    {/* Background Gradient */}
    <div
      className={`absolute inset-0 ${color} opacity-5 group-hover:opacity-10 transition-opacity duration-300`}
    />

    {/* Left Side - Icon */}
    <div className="flex items-center justify-center w-24 p-4">
      <Icon
        className={`h-12 w-12 ${color
          .replace("bg-", "text-")
          .replace(
            "/50",
            "-600"
          )} transition-all duration-300 ease-in-out group-hover:scale-75`}
      />
    </div>

    {/* Right Side - Content */}
    <div className="flex-1 flex flex-col justify-center p-4 pr-6">
      <h3 className="text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-1">
        {value}
      </h3>
      <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
        {title}
      </p>
    </div>

    {/* View Details Button - Bottom Left Corner */}
    <div className="absolute bottom-4 left-4 translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
      <button className="inline-flex items-center gap-1 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">
        View Details
        <ArrowRight className="h-3 w-3" />
      </button>
    </div>

    {/* Hover Overlay */}
    <div className="pointer-events-none absolute inset-0 transform-gpu transition-all duration-300 group-hover:bg-black/[.03] group-hover:dark:bg-neutral-800/10" />
  </div>
);

const EmailCampaignCard = ({
  title,
  totalMails,
  stats,
}: {
  title: string;
  totalMails: number;
  stats: { label: string; value: number; color: string }[];
}) => (
  <div className="group relative col-span-1 flex flex-col overflow-hidden rounded-xl bg-white [box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_2px_4px_rgba(0,0,0,.05),0_12px_24px_rgba(0,0,0,.05)] transform-gpu dark:bg-black dark:[border:1px_solid_rgba(255,255,255,.1)] dark:[box-shadow:0_-20px_80px_-20px_#ffffff1f_inset] min-h-fit p-6">
    {/* Background Gradient */}
    <div className="absolute inset-0 bg-orange-500 opacity-5 group-hover:opacity-10 transition-opacity duration-300" />

    {/* Header */}
    <div className="mb-4">
      <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
        {title}
      </h3>
      <div className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
        {totalMails}
      </div>
    </div>

    {/* Stats List */}
    <div className="space-y-2 mb-4">
      {stats.map((stat, index) => (
        <div key={index} className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${stat.color}`} />
            <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
              {stat.label}
            </span>
          </div>
          <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            {stat.value}
          </span>
        </div>
      ))}
    </div>

    {/* View Details Button - Bottom Left Corner */}
    <div className="mt-auto pt-2 translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
      <button className="inline-flex items-center gap-1 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">
        View Details
        <ArrowRight className="h-3 w-3" />
      </button>
    </div>

    {/* Hover Overlay */}
    <div className="pointer-events-none absolute inset-0 transform-gpu transition-all duration-300 group-hover:bg-black/[.03] group-hover:dark:bg-neutral-800/10" />
  </div>
);

const EmailAnalyticsChart = () => {
  const emailData = [
    { month: "Jan", emails: 1250, percentage: 59 },
    { month: "Feb", emails: 1580, percentage: 75 },
    { month: "Mar", emails: 1420, percentage: 68 },
    { month: "Apr", emails: 1680, percentage: 80 },
    { month: "May", emails: 1950, percentage: 93 },
    { month: "Jun", emails: 2100, percentage: 100 },
    { month: "Jul", emails: 1890, percentage: 90 },
    { month: "Aug", emails: 2250, percentage: 107 },
    { month: "Sep", emails: 1760, percentage: 84 },
    { month: "Oct", emails: 2050, percentage: 98 },
    { month: "Nov", emails: 1650, percentage: 79 },
    { month: "Dec", emails: 1980, percentage: 94 },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Email Analytics</CardTitle>
        <CardDescription>
          Monthly email campaigns - Full year 2024
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between gap-2 h-64">
          {emailData.map((item, index) => (
            <div
              key={index}
              className="flex flex-col items-center gap-2 flex-1"
            >
              <div className="flex flex-col items-center justify-end h-48 w-full">
                <div className="text-xs font-medium text-foreground mb-2">
                  {item.emails}
                </div>
                <div
                  className="w-full bg-orange-500 rounded-t-lg transition-all duration-300 ease-out min-h-[4px]"
                  style={{ height: `${item.percentage}%` }}
                />
              </div>
              <div className="text-xs font-medium text-muted-foreground">
                {item.month}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          Trending up by 8.3% this month <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          Total emails sent in the last 12 Months
        </div>
      </CardFooter>
    </Card>
  );
};

const ClientAnalyticsChart = () => {
  const clientData = [
    { month: "Jan", clients: 145, percentage: 43 },
    { month: "Feb", clients: 189, percentage: 57 },
    { month: "Mar", clients: 223, percentage: 67 },
    { month: "Apr", clients: 267, percentage: 80 },
    { month: "May", clients: 302, percentage: 90 },
    { month: "Jun", clients: 334, percentage: 100 },
    { month: "Jul", clients: 298, percentage: 89 },
    { month: "Aug", clients: 356, percentage: 107 },
    { month: "Sep", clients: 278, percentage: 83 },
    { month: "Oct", clients: 312, percentage: 93 },
    { month: "Nov", clients: 289, percentage: 87 },
    { month: "Dec", clients: 325, percentage: 97 },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Client Analytics</CardTitle>
        <CardDescription>
          New client acquisitions - Full year 2024
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between gap-2 h-64">
          {clientData.map((item, index) => (
            <div
              key={index}
              className="flex flex-col items-center gap-2 flex-1"
            >
              <div className="flex flex-col items-center justify-end h-48 w-full">
                <div className="text-xs font-medium text-foreground mb-2">
                  {item.clients}
                </div>
                <div
                  className="w-full bg-blue-500 rounded-t-lg transition-all duration-300 ease-out min-h-[4px]"
                  style={{ height: `${item.percentage}%` }}
                />
              </div>
              <div className="text-xs font-medium text-muted-foreground">
                {item.month}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          Trending up by 12.5% this month <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          New clients acquired in the last 12 months
        </div>
      </CardFooter>
    </Card>
  );
};

export default function Page() {
  const [dateRange, setDateRange] = useState(() => {
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

  const getDateSubtext = () => {
    if (!dateRange.from || !dateRange.to) return "No data selected";

    const days =
      Math.ceil(
        (dateRange.to.getTime() - dateRange.from.getTime()) /
          (1000 * 60 * 60 * 24)
      ) + 1;

    if (dateRange.preset) {
      switch (dateRange.preset) {
        case "today":
          return "Showing today's metrics";
        case "yesterday":
          return "Showing yesterday's metrics";
        case "last7days":
          return "Showing last 7 days of data";
        case "last30days":
          return "Showing last 30 days of data";
        case "thisMonth":
          return "Showing current month's data";
        case "lastMonth":
          return "Showing previous month's data";
        default:
          return `Showing ${days} day${days > 1 ? "s" : ""} of data`;
      }
    }
    return `Showing ${days} day${days > 1 ? "s" : ""} of data`;
  };

  const statsData = [
    {
      title: "Total Clients",
      value: "2,847",
      icon: Users,
      color: "bg-blue-500",
    },
    {
      title: "iOS Users",
      value: "1,234",
      icon: SiIos,
      color: "bg-gray-500",
    },
    {
      title: "Android Users",
      value: "987",
      icon: DiAndroid,
      color: "bg-green-500",
    },
    {
      title: "Agency Partners",
      value: "156",
      icon: Building2,
      color: "bg-purple-500",
    },
  ];

  const emailCampaignData = [
    {
      title: "Total Initial Mails",
      totalMails: 150,
      stats: [
        { label: "Sent", value: 150, color: "bg-orange-500" },
        { label: "Delivered", value: 142, color: "bg-green-500" },
        { label: "Read", value: 89, color: "bg-green-500" },
        { label: "Bounce", value: 8, color: "bg-red-500" },
      ],
    },
    {
      title: "Follow Up 1",
      totalMails: 89,
      stats: [
        { label: "Sent", value: 89, color: "bg-orange-500" },
        { label: "Delivered", value: 85, color: "bg-green-500" },
        { label: "Read", value: 45, color: "bg-green-500" },
        { label: "Bounce", value: 4, color: "bg-red-500" },
      ],
    },
    {
      title: "Follow Up 2",
      totalMails: 45,
      stats: [
        { label: "Sent", value: 45, color: "bg-orange-500" },
        { label: "Delivered", value: 43, color: "bg-green-500" },
        { label: "Read", value: 22, color: "bg-green-500" },
        { label: "Bounce", value: 2, color: "bg-red-500" },
      ],
    },
    {
      title: "Follow Up 3",
      totalMails: 22,
      stats: [
        { label: "Sent", value: 22, color: "bg-orange-500" },
        { label: "Delivered", value: 21, color: "bg-green-500" },
        { label: "Read", value: 12, color: "bg-green-500" },
        { label: "Bounce", value: 1, color: "bg-red-500" },
      ],
    },
    {
      title: "Follow Up 4",
      totalMails: 12,
      stats: [
        { label: "Sent", value: 12, color: "bg-orange-500" },
        { label: "Delivered", value: 12, color: "bg-green-500" },
        { label: "Read", value: 7, color: "bg-green-500" },
        { label: "Bounce", value: 0, color: "bg-red-500" },
      ],
    },
  ];

  return (
    <div className="flex flex-1 flex-col gap-6">
      {/* Filter Section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">{getDateSubtext()}</p>
        </div>
        <div className="flex gap-2">
          <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="bg-transparent border border-border rounded-lg px-4 py-2 text-foreground font-medium min-w-[200px] justify-between hover:border-muted-foreground transition-colors"
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
          
          {/* Reset Button */}
          <Button
            variant="outline"
            size="sm"
            className="h-auto px-3 py-2 text-xs font-medium hover:bg-muted"
            onClick={() => {
              const today = new Date();
              setDateRange({
                from: subDays(today, 7),
                to: today,
                preset: "last7days",
              });
            }}
            title="Reset to default (Last 7 days)"
          >
            Reset
          </Button>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-4">
        {statsData.map((stat, index) => (
          <StatsCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
          />
        ))}
      </div>

      {/* Email Campaign Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {emailCampaignData.map((campaign, index) => (
          <EmailCampaignCard
            key={index}
            title={campaign.title}
            totalMails={campaign.totalMails}
            stats={campaign.stats}
          />
        ))}
      </div>
      <hr />
      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EmailAnalyticsChart />
        <ClientAnalyticsChart />
      </div>

      {/* Rest of Dashboard */}
    </div>
  );
}
