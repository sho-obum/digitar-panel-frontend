"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Check, Circle, Clock, Globe, Building2, Mail, ExternalLink, Sparkles } from "lucide-react";
import { HiOutlineInformationCircle } from "react-icons/hi2";
import { FaLinkedin } from "react-icons/fa";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { EmailComposer } from "@/components/email-composer";

/* Types */
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

type Contact = {
  person: string;
  email: string;
  mobile: string;
  linkedin?: string;
  fetched?: boolean;
};

interface EditCampaignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaign: Campaign | null;
  onSaveAndActivate: (campaignId: string) => void;
}

/* Timeline Component */
function Timeline({ currentStep }: { currentStep: number }) {
  const steps = [
    { number: 1, title: "App Details", description: "Enter app store URL" },
    { number: 2, title: "Confirm Details", description: "Verify app information" },
    { number: 3, title: "Email Composition", description: "Create outreach email" },
  ];

  const getStepState = (n: number) =>
    n < currentStep ? "completed" : n === currentStep ? "active" : "pending";
  
  const getStepIcon = (n: number) => {
    const s = getStepState(n);
    if (s === "completed") return <Check className="w-4 h-4 text-white" />;
    if (s === "active") return <Clock className="w-4 h-4 text-white" />;
    return <Circle className="w-4 h-4 text-muted-foreground" />;
  };
  
  const getStepColor = (n: number) => {
    const s = getStepState(n);
    if (s === "completed") return "bg-green-500";
    if (s === "active") return "bg-blue-500";
    return "bg-muted";
  };

  return (
    <div className="flex items-center justify-center space-x-8 mb-6">
      {steps.map((s, i) => (
        <div key={s.number} className="flex items-center">
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getStepColor(s.number)}`}>
              {getStepIcon(s.number)}
            </div>
            <div className="mt-2 text-center">
              <p className="text-sm font-medium">{s.title}</p>
              <p className="text-xs text-muted-foreground">{s.description}</p>
            </div>
          </div>
          {i < steps.length - 1 && (
            <div className="w-16 h-0.5 bg-muted mx-4 -mt-6" />
          )}
        </div>
      ))}
    </div>
  );
}

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
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="shrink-0">
          <LottieLoader size={32} />
        </div>
        <div>
          <p className="text-sm font-medium">{status}</p>
          <p className="text-xs text-muted-foreground">
            Scanning contacts… {progress}/{total}
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200/30 transition-all duration-500">
        <table className="w-full text-sm text-gray-500">
          <thead className="text-xs uppercase text-gray-400 transition-all duration-500">
            <tr className="border-b border-gray-200/40">
              <th className="p-3 text-center w-[28%] border-r border-gray-200/30">Name</th>
              <th className="p-3 text-center w-[28%] border-r border-gray-200/30">Mail</th>
              <th className="p-3 text-center w-[22%] border-r border-gray-200/30">Phone</th>
              <th className="p-3 text-center w-[22%]">LinkedIn</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((c, i) =>
              c ? (
                <tr
                  key={i}
                  className="animate-[scanIn_0.4s_ease-out_1] transition-all duration-500"
                  style={{ animationDelay: `${i * 120}ms` }}
                >
                  <td className="p-3 border-r border-gray-200/30">{c.person}</td>
                  <td className="p-3 truncate border-r border-gray-200/30">{c.email}</td>
                  <td className="p-3 md:whitespace-nowrap border-r border-gray-200/30">{c.mobile}</td>
                  <td className="p-3 truncate text-center">
                    {c.fetched ? (
                      <a
                        href={c.linkedin || `https://www.bing.com/search?q=${encodeURIComponent(`${c.person} linkedin`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gray-500"
                      >
                        <FaLinkedin className="w-4 h-4 text-gray-400" />
                      </a>
                    ) : (
                      <span className="text-xs text-gray-400">Fetching...</span>
                    )}
                  </td>
                </tr>
              ) : null
            )}

            {placeholderRows.map((_, i) => (
              <tr key={`ph-${i}`}>
                <td className="p-3 border-r border-gray-200/30">
                  <div className="h-4 w-full overflow-hidden rounded transition-all duration-500 bg-gray-200/30">
                    <div className="h-full w-1/3 animate-[shimmer_1.2s_infinite] bg-gray-200/40" />
                  </div>
                </td>
                <td className="p-3 border-r border-gray-200/30">
                  <div className="h-4 w-full overflow-hidden rounded transition-all duration-500 bg-gray-200/30">
                    <div className="h-full w-1/3 animate-[shimmer_1.2s_infinite] bg-gray-200/40" />
                  </div>
                </td>
                <td className="p-3 border-r border-gray-200/30">
                  <div className="h-4 w-full overflow-hidden rounded transition-all duration-500 bg-gray-200/30">
                    <div className="h-full w-1/3 animate-[shimmer_1.2s_infinite] bg-gray-200/40" />
                  </div>
                </td>
                <td className="p-3 text-center">
                  <span className="text-xs text-gray-400">Fetching...</span>
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
            @keyframes glowGreen {
              0%, 100% { box-shadow: 0 0 12px rgba(0,199,255, 0.5); }
              50% { box-shadow: 0 0 24px rgba(0,199,255, 0.9); }
            }
            @keyframes glowPurple {
              0%, 100% { box-shadow: 0 0 12px rgba(0,199,255, 0.5); }
              50% { box-shadow: 0 0 24px rgba(0,199,255, 0.9); }
            }
            @keyframes glowOrange {
              0%, 100% { box-shadow: 0 0 12px rgba(251, 146, 60, 0.5); }
              50% { box-shadow: 0 0 24px rgba(251, 146, 60, 0.9); }
            }
            @keyframes glowRed {
              0%, 100% { box-shadow: 0 0 12px rgba(248, 113, 113, 0.4); }
              50% { box-shadow: 0 0 20px rgba(248, 113, 113, 0.7); }
            }
          `,
        }}
      />
    </div>
  );
}

/* Main Component */
export default function EditCampaignDialog({
  open,
  onOpenChange,
  campaign,
  onSaveAndActivate,
}: EditCampaignDialogProps) {
  // State management
  const [appUrl, setAppUrl] = useState("");
  const [isFetchingApp, setIsFetchingApp] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  
  const [isApproved, setIsApproved] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  
  const [showWrongInput, setShowWrongInput] = useState(false);
  const [wrongContactLink, setWrongContactLink] = useState("");
  
  const [displayedContacts, setDisplayedContacts] = useState<Contact[]>([]);
  const totalToScan = 8;
  const [scanComplete, setScanComplete] = useState(false);
  const [step3Pulse, setStep3Pulse] = useState(false);
  
  const [emailSubject, setEmailSubject] = useState("");
  const [emailContent, setEmailContent] = useState("");
  const [tempEmailContent, setTempEmailContent] = useState("");
  
  const [campaignCategory, setCampaignCategory] = useState("finance");
  const [templateSelection, setTemplateSelection] = useState("initial");
  
  const [appData, setAppData] = useState<any>(null);
  const [orgData, setOrgData] = useState<any>(null);
  const [contactsFromAPI, setContactsFromAPI] = useState<Contact[]>([]);

  // Pre-fill data when campaign changes
  useEffect(() => {
    if (campaign) {
      setAppUrl(campaign.directUrl);
      // TODO: When backend integration is ready, fetch and pre-fill all data
      // For now, we'll just set the URL and let user proceed
    }
  }, [campaign]);

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setAppUrl("");
      setShowDetails(false);
      setIsApproved(false);
      setIsApproving(false);
      setIsScanning(false);
      setShowWrongInput(false);
      setWrongContactLink("");
      setDisplayedContacts([]);
      setScanComplete(false);
      setEmailSubject("");
      setEmailContent("");
      setCampaignCategory("finance");
      setTemplateSelection("initial");
      setAppData(null);
      setOrgData(null);
      setContactsFromAPI([]);
    }
  }, [open]);

  const getCurrentStep = () => {
    if (!appUrl.trim()) return 1;
    if (!showDetails) return 1;
    if (isApproving || isScanning) return 2;
    if (!isApproved) return 2;
    return 3;
  };

  // Status messages for contact scanning
  const statusMessages = [
    "Fetching contact details, numbers, and LinkedIn profiles…",
    "Validating email formats and deduplicating records…",
    "Cross-referencing org chart signals…",
    "Enriching with public sources…",
    "Almost there... finalizing results…",
    "✓ Complete!",
  ];

  const statusFor = (p: number) => {
    if (p < 2) return statusMessages[0];
    if (p < 4) return statusMessages[1];
    if (p < 6) return statusMessages[2];
    if (p < 7) return statusMessages[3];
    if (p < 8) return statusMessages[4];
    return statusMessages[5];
  };

  const handleFetch = async () => {
    if (!appUrl.trim()) return;
    setIsFetchingApp(true);

    try {
      const response = await fetch("/api/app-details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ previewLink: appUrl }),
      });

      if (!response.ok) throw new Error("Failed to fetch app details");

      const data = await response.json();
      setAppData(data.appData);
      setOrgData(data.orgData);
      setIsFetchingApp(false);
      setShowDetails(true);
    } catch (error) {
      console.error("Error fetching app details:", error);
      setIsFetchingApp(false);
      alert("Failed to fetch app details. Please try again.");
    }
  };

  const startScanning = (contactsData?: Contact[]) => {
    setIsApproved(true);
    setIsScanning(true);
    setScanComplete(false);
    setDisplayedContacts([]);

    const contactsToUse = contactsData || contactsFromAPI;
    const scanTotal = Math.min(totalToScan, contactsToUse.length);

    let i = 0;
    const intv = setInterval(() => {
      const contactToAdd = contactsToUse[i];
      if (contactToAdd) {
        const contactWithState: Contact = { ...contactToAdd, fetched: false };
        setDisplayedContacts((prev) => [...prev, contactWithState]);
        setTimeout(() => {
          setDisplayedContacts((prev) => {
            const index = prev.findIndex((p) => p.email === contactWithState.email && !p.fetched);
            if (index === -1) return prev;
            const next = [...prev];
            next[index] = { ...next[index], fetched: true };
            return next;
          });
        }, 3000);
      }
      i += 1;
      if (i >= scanTotal) {
        clearInterval(intv);
        setTimeout(() => {
          setIsScanning(false);
          setScanComplete(true);
          setTimeout(() => setScanComplete(false), 3000);

          // Scroll to Step 3 and pulse border for 5 seconds
          setTimeout(() => {
            const step3El = document.getElementById("email-composition-edit");
            if (step3El && typeof window !== "undefined") {
              step3El.scrollIntoView({ behavior: "smooth", block: "center" });
            }
            // Trigger pulse
            setStep3Pulse(true);
            setTimeout(() => setStep3Pulse(false), 5000);
          }, 500);
        }, 700);
      }
    }, 480);
  };

  const handleApprove = async () => {
    setShowWrongInput(false);
    setIsApproving(true);

    try {
      const response = await fetch("/api/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          previewLink: appUrl,
          appid: appData?.appid || appData?.bundleId,
          orgID: orgData?.orgID,
        }),
      });

      if (!response.ok) throw new Error("Failed to fetch contacts");

      const contacts = await response.json();
      setContactsFromAPI(contacts);

      setTimeout(() => {
        setIsApproving(false);
        startScanning(contacts);
      }, 900);
    } catch (error) {
      console.error("Error fetching contacts:", error);
      setIsApproving(false);
      alert("Failed to fetch contacts. Using fallback data.");
      setTimeout(() => startScanning([]), 900);
    }
  };

  const handleWrong = () => {
    setShowWrongInput(true);
  };

  const handleWrongSubmit = async () => {
    if (!wrongContactLink.trim()) return;

    setIsApproving(true);
    setShowWrongInput(false);

    try {
      const response = await fetch("/api/contact-person", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contactperson: wrongContactLink }),
      });

      if (!response.ok) throw new Error("Failed to fetch contacts");

      const contacts = await response.json();
      setContactsFromAPI(contacts);

      setTimeout(() => {
        setIsApproving(false);
        startScanning(contacts);
      }, 900);
    } catch (error) {
      console.error("Error fetching contacts from LinkedIn:", error);
      setIsApproving(false);
      alert("Failed to fetch contacts. Using fallback data.");
      setTimeout(() => startScanning([]), 900);
    }
  };

  const handleWrongCancel = () => {
    setShowWrongInput(false);
    setWrongContactLink("");
  };

  const handleSaveAndActivate = () => {
    if (campaign) {
      onSaveAndActivate(campaign.id);
      onOpenChange(false);
    }
  };

  console.log("EditCampaignDialog render - open:", open, "campaign:", campaign);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Edit Campaign - {campaign?.appName}</DialogTitle>
          <DialogDescription>
            Resume and complete your draft campaign setup
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <Timeline currentStep={getCurrentStep()} />

          <div className="grid grid-cols-5 gap-6">
            {/* Left: Steps 1 & 2 */}
            <div className="col-span-3 space-y-6">
              {/* Step 1: App Details */}
              <Card
                className={`transition-all duration-500 ${
                  !appUrl.trim()
                    ? "animate-[glowRed_2s_ease-in-out_infinite]"
                    : showDetails
                    ? "shadow-[0_0_12px_rgba(74,222,128,0.4)]"
                    : "animate-[glowOrange_2s_ease-in-out_infinite]"
                }`}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>App Details</CardTitle>
                      <CardDescription>Enter the app store URL to fetch details</CardDescription>
                    </div>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HiOutlineInformationCircle className="w-5 h-5 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="right" className="w-64 bg-white text-black shadow-lg border border-gray-200">
                          <p className="text-sm">
                            Paste your app's Play Store or App Store URL. We'll automatically fetch all necessary details.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-3">
                    <Input
                      placeholder="Enter app store URL (e.g. https://play.google.com/store/apps/details?id=...)"
                      value={appUrl}
                      onChange={(e) => setAppUrl(e.target.value)}
                      disabled={isFetchingApp || showDetails}
                    />
                    <Button onClick={handleFetch} disabled={isFetchingApp || !appUrl.trim() || showDetails}>
                      Fetch
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Step 2: Confirm Details */}
              <Card
                className={`relative transition-all duration-500 ${
                  !showDetails
                    ? "animate-[glowRed_2s_ease-in-out_infinite]"
                    : isScanning
                    ? "animate-[glowPurple_1.5s_ease-in-out_infinite]"
                    : scanComplete
                    ? "animate-[glowGreen_1s_ease-in-out_3]"
                    : isApproved
                    ? "shadow-[0_0_12px_rgba(74,222,128,0.4)]"
                    : "animate-[glowOrange_2s_ease-in-out_infinite]"
                }`}
              >
                {!(isApproving || isScanning || isApproved) && (
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Confirm Details</CardTitle>
                        <CardDescription>Review the fetched information before proceeding</CardDescription>
                      </div>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HiOutlineInformationCircle className="w-5 h-5 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent side="right" className="w-64 bg-white text-black shadow-lg border border-gray-200">
                            <p className="text-sm">
                              Verify that the app and organization details are correct. Click "Approve" to continue or "Wrong" if corrections are needed.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </CardHeader>
                )}

                <CardContent>
                  {/* Skeleton when Step 2 is not active */}
                  {getCurrentStep() < 2 && (
                    <div className="relative">
                      <div className="space-y-6 animate-pulse py-6 opacity-40">
                        <div className="grid grid-cols-2 gap-8">
                          <div className="space-y-3">
                            <div className="h-4 bg-border/60 rounded w-20" />
                            <div className="h-6 bg-border/50 rounded" />
                            <div className="h-4 bg-border/60 rounded w-24" />
                            <div className="h-6 bg-border/50 rounded" />
                          </div>
                          <div className="space-y-3">
                            <div className="h-4 bg-border/60 rounded w-20" />
                            <div className="h-6 bg-border/50 rounded" />
                            <div className="h-4 bg-border/60 rounded w-24" />
                            <div className="h-6 bg-border/50 rounded" />
                          </div>
                        </div>
                        <div className="h-10 bg-border/50 rounded w-32 mx-auto" />
                      </div>
                      {isFetchingApp && (
                        <div className="absolute inset-0 flex justify-center items-center bg-background/60 backdrop-blur-[2px]">
                          <LottieLoader size={120} />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Fetching loader */}
                  {getCurrentStep() >= 2 && isFetchingApp && (
                    <div className="relative">
                      <div className="space-y-6 animate-pulse py-6 opacity-20">
                        <div className="grid grid-cols-2 gap-8">
                          <div className="space-y-3">
                            <div className="h-4 bg-border/60 rounded w-20" />
                            <div className="h-6 bg-border/50 rounded" />
                          </div>
                          <div className="space-y-3">
                            <div className="h-4 bg-border/60 rounded w-20" />
                            <div className="h-6 bg-border/50 rounded" />
                          </div>
                        </div>
                      </div>
                      <div className="absolute inset-0 flex justify-center items-center bg-background/60 backdrop-blur-[2px]">
                        <LottieLoader size={120} />
                      </div>
                    </div>
                  )}

                  {/* Approving animation */}
                  {getCurrentStep() >= 2 && showDetails && isApproving && !isScanning && (
                    <div className="flex flex-col items-center justify-center py-10 gap-3">
                      <LottieLoader size={120} />
                      <p className="text-sm text-muted-foreground">Finalizing approval…</p>
                    </div>
                  )}

                  {/* Contact Scanner */}
                  {getCurrentStep() >= 2 && showDetails && isApproved && (
                    <ContactScanner
                      contacts={displayedContacts}
                      progress={displayedContacts.length}
                      total={totalToScan}
                      status={statusFor(displayedContacts.length)}
                      isScanning={isScanning}
                    />
                  )}

                  {/* Comparison + Actions */}
                  {getCurrentStep() >= 2 && showDetails && !isApproved && !isApproving && !isScanning && (
                    <div className="space-y-6">
                      <div className="relative grid grid-cols-2 gap-8">
                        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border/50 transform -translate-x-1/2" />
                        
                        {/* App Section */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-2">
                            <Globe className="w-5 h-5 text-blue-500" />
                            <h3 className="text-lg font-semibold">App Information</h3>
                          </div>
                          <div className="space-y-3">
                            <div>
                              <Label className="text-xs text-muted-foreground">App Name</Label>
                              <p className="text-sm font-medium">{appData?.appName || "Loading..."}</p>
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">Bundle ID</Label>
                              <p className="text-sm font-medium truncate">{appData?.bundleId || "Loading..."}</p>
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">Category</Label>
                              <p className="text-sm font-medium">{appData?.category || "Loading..."}</p>
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">Store URL</Label>
                              <a
                                href={appUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-500 hover:underline flex items-center gap-1"
                              >
                                View in Store <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          </div>
                        </div>

                        {/* Organization Section */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-purple-500" />
                            <h3 className="text-lg font-semibold">Organization</h3>
                          </div>
                          <div className="space-y-3">
                            <div>
                              <Label className="text-xs text-muted-foreground">Company Name</Label>
                              <p className="text-sm font-medium">{orgData?.companyName || "Loading..."}</p>
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">Organization ID</Label>
                              <p className="text-sm font-medium">{orgData?.orgID || "Loading..."}</p>
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">Website</Label>
                              <a
                                href={orgData?.website || "#"}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-500 hover:underline flex items-center gap-1"
                              >
                                {orgData?.website || "Loading..."} <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Wrong entry input */}
                      {showWrongInput && (
                        <>
                          <Separator />
                          <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
                            <Label className="text-sm font-medium">LinkedIn Profile URL</Label>
                            <p className="text-xs text-muted-foreground">
                              Provide the LinkedIn profile of a key contact person to fetch correct details
                            </p>
                            <div className="flex gap-2">
                              <Input
                                placeholder="https://linkedin.com/in/..."
                                value={wrongContactLink}
                                onChange={(e) => setWrongContactLink(e.target.value)}
                              />
                              <Button onClick={handleWrongSubmit} disabled={!wrongContactLink.trim()}>
                                Submit
                              </Button>
                              <Button variant="outline" onClick={handleWrongCancel}>
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </>
                      )}

                      <Separator />

                      {/* Action Buttons */}
                      {!showWrongInput && (
                        <div className="flex justify-center gap-3">
                          <Button variant="outline" onClick={handleWrong} className="min-w-[120px]">
                            Wrong
                          </Button>
                          <Button onClick={handleApprove} className="min-w-[120px]">
                            Approve
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right: Step 3 - Email Composition */}
            <div className="col-span-2">
              <Card
                id="email-composition-edit"
                className={`h-full flex flex-col transition-all duration-500 ${
                  !isApproved
                    ? "bg-muted/30 animate-[glowRed_2s_ease-in-out_infinite]"
                    : step3Pulse
                    ? "animate-[glowPurple_1s_ease-in-out_5]"
                    : "shadow-[0_0_12px_rgba(74,222,128,0.4)]"
                }`}
              >
                <CardHeader>
                  <div className="relative">
                    <div className="absolute top-0 right-0">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HiOutlineInformationCircle className="w-5 h-5 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent side="left" className="w-64 bg-white text-black shadow-lg border border-gray-200">
                            <p className="text-sm">
                              Compose your outreach email. Use the AI rewrite feature to optimize your message.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>

                    <div className="pr-8">
                      <CardTitle>Email Composition</CardTitle>
                      <CardDescription>Compose your outreach email</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col space-y-4">
                  {getCurrentStep() < 3 ? (
                    <div className="space-y-4 animate-pulse">
                      <div>
                        <div className="h-4 bg-border/60 rounded w-16 mb-2" />
                        <div className="h-10 bg-border/50 rounded" />
                      </div>
                      <div className="flex-1 flex flex-col min-h-0">
                        <div className="h-4 bg-border/60 rounded w-24 mb-2" />
                        <div className="h-32 bg-border/50 rounded" />
                      </div>
                      <div>
                        <div className="h-4 bg-border/60 rounded w-20 mb-2" />
                        <div className="h-10 bg-border/50 rounded" />
                      </div>
                      <div className="h-10 bg-border/50 rounded" />
                    </div>
                  ) : (
                    <>
                      {/* Dropdowns */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-sm mb-2">Category</Label>
                          <Select value={campaignCategory} onValueChange={setCampaignCategory}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="finance">Finance</SelectItem>
                              <SelectItem value="tech">Tech</SelectItem>
                              <SelectItem value="healthcare">Healthcare</SelectItem>
                              <SelectItem value="retail">Retail</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label className="text-sm mb-2">Template</Label>
                          <Select value={templateSelection} onValueChange={setTemplateSelection}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="initial">Initial Outreach</SelectItem>
                              <SelectItem value="followup">Follow-up</SelectItem>
                              <SelectItem value="reminder">Reminder</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <Label className="text-sm mb-2">Subject</Label>
                        <Input
                          placeholder="Partnership Opportunity with..."
                          value={emailSubject}
                          onChange={(e) => setEmailSubject(e.target.value)}
                          className="mt-2"
                        />
                      </div>

                      <div className="flex-1 flex flex-col min-h-0">
                        <Label className="text-sm mb-2">Email Body</Label>
                        <EmailComposer
                          content={emailContent}
                          onChange={(value: string) => setEmailContent(value)}
                          onRewrite={async () => {
                            try {
                              const response = await fetch("/api/rewrite", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ content: emailContent }),
                              });
                              if (!response.ok) throw new Error("Failed to rewrite");
                              const data = await response.json();
                              return data.rewrittenContent || emailContent;
                            } catch (error) {
                              console.error("Rewrite error:", error);
                              return emailContent;
                            }
                          }}
                          placeholder="Dear Team,\n\nI hope this email finds you well..."
                          minHeight="120px"
                          className="flex-1"
                        />
                      </div>

                      {/* Revert and Save Buttons */}
                      <div className="flex justify-end gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (tempEmailContent) {
                              setEmailContent(tempEmailContent);
                            }
                          }}
                          disabled={!emailContent || emailContent === tempEmailContent}
                        >
                          Revert Changes
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => {
                            setTempEmailContent(emailContent);
                            // TODO: Save draft logic
                            console.log("Saving draft...");
                          }}
                        >
                          Save Draft
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveAndActivate}
            disabled={getCurrentStep() < 3}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Save & Activate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
