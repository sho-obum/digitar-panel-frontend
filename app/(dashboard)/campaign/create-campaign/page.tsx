"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Check,
  Clock,
  Circle,
  ExternalLink,
  Globe,
  Linkedin,
  CircleCheck,
  CircleAlert,
} from "lucide-react";
import { FaLinkedin } from "react-icons/fa";
import { HiOutlineInformationCircle } from "react-icons/hi";
import { RiGeminiLine } from "react-icons/ri";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { TourPopover } from "@/components/ruixen/tour-popover";
import { EmailComposer } from "@/components/email-composer";
import { CheckCircle, Mail } from "lucide-react";

/* Timeline Component                                   */
function Timeline({ currentStep }: { currentStep: number }) {
  const steps = [
    { number: 1, title: "App Details", description: "Enter app store URL" },
    {
      number: 2,
      title: "Confirm Details",
      description: "Verify app information",
    },
    {
      number: 3,
      title: "Email Composition",
      description: "Create outreach email",
    },
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
    <div className="flex items-center justify-center space-x-8 mb-8">
      {steps.map((s, i) => (
        <div key={s.number} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${getStepColor(
                s.number
              )}`}
            >
              {getStepIcon(s.number)}
            </div>
            <div className="mt-2 text-center">
              <p className="text-sm font-medium">{s.title}</p>
              <p className="text-xs text-muted-foreground">{s.description}</p>
            </div>
          </div>
          {i < steps.length - 1 && (
            <div className="w-16 h-0.5 bg-muted mx-4 mt-[-24px]" />
          )}
        </div>
      ))}
    </div>
  );
}

/* Lottie Loader                                        */

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

/* Step-2 Contact Scanning Table                        */

type Contact = {
  person: string;
  email: string;
  mobile: string;
  linkedin?: string;
  fetched?: boolean;
};

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
      {/* header with loader + text */}
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">
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
              <th className="p-3 text-center w-[28%] border-r border-gray-200/30">
                Name
              </th>
              <th className="p-3 text-center w-[28%] border-r border-gray-200/30">
                Mail
              </th>
              <th className="p-3 text-center w-[22%] border-r border-gray-200/30">
                Phone
              </th>
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
                  <td className="p-3 border-r border-gray-200/30">
                    {c.person}
                  </td>
                  <td className="p-3 truncate border-r border-gray-200/30">
                    {c.email}
                  </td>
                  <td className="p-3 md:whitespace-nowrap border-r border-gray-200/30">
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
                        className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gray-500"
                        aria-label={`View ${c.person} on LinkedIn`}
                      >
                        <span className="text-xs text-gray-400">Fetched</span>
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
        // eslint-disable-next-line react/no-danger
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

/* Page Component                                       */

export default function CreateCampaignPage({
  onAIRewrite,
}: {
  onAIRewrite?: (content: string) => Promise<string>;
} = {}) {
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

  // Campaign dropdowns
  const [campaignCategory, setCampaignCategory] = useState("finance");
  const [templateSelection, setTemplateSelection] = useState("initial");

  // Variable to store and console log HTML content
  const [editorHtmlValue, setEditorHtmlValue] = useState("");

  const [hasSeenTour, setHasSeenTour] = useState(false);

  // API data states
  const [appData, setAppData] = useState<any>(null);
  const [orgData, setOrgData] = useState<any>(null);
  const [contactsFromAPI, setContactsFromAPI] = useState<Contact[]>([]);

  // Load email template when step 3 is reached
  useEffect(() => {
    const loadEmailTemplate = async () => {
      if (isApproved && !emailSubject && !emailContent) {
        try {
          const response = await fetch("/api/email-template");
          if (response.ok) {
            const data = await response.json();

            // Decode base64
            const decodedSubject = Buffer.from(data.Subject, "base64").toString(
              "utf-8"
            );
            const decodedBody = Buffer.from(data.body, "base64").toString(
              "utf-8"
            );

            setEmailSubject(decodedSubject);
            setEmailContent(decodedBody);
          }
        } catch (error) {
          console.error("Error loading email template:", error);
        }
      }
    };

    loadEmailTemplate();
  }, [isApproved, emailSubject, emailContent]);

  /* Step calculation */
  const getCurrentStep = () => {
    // If no URL -> step 1
    if (!appUrl.trim()) return 1;
    // If details not shown yet -> still step 1
    if (!showDetails) return 1;
    // While approving or scanning, keep the UI on step 2 (so step 1 is not active)
    if (isApproving || isScanning) return 2;
    // If not approved yet -> step 2
    if (!isApproved) return 2;
    // Otherwise step 3 (email composition)
    return 3;
  };

  /* Step-1 */
  const handleFetch = async () => {
    if (!appUrl.trim()) return;
    setIsFetchingApp(true);

    try {
      // Call preview-link API
      const response = await fetch("/api/preview-link", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ previewLink: appUrl }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch app details");
      }

      const data = await response.json();
      setAppData(data.appData);
      setOrgData(data.orgData);

      setIsFetchingApp(false);
      setShowDetails(true);

      setTimeout(() => {
        const el = document.getElementById("confirm-details");
        if (el && typeof window !== "undefined") {
          const rect = el.getBoundingClientRect();
          const target =
            window.pageYOffset +
            rect.top -
            window.innerHeight / 2 +
            rect.height / 2;
          window.scrollTo({
            top: Math.max(0, Math.floor(target)),
            behavior: "smooth",
          });
        }
        const btn = document.getElementById(
          "approve-btn"
        ) as HTMLButtonElement | null;
        if (btn) setTimeout(() => btn.focus(), 600);
      }, 120);
    } catch (error) {
      console.error("Error fetching app details:", error);
      setIsFetchingApp(false);
      alert("Failed to fetch app details. Please try again.");
    }
  };

  /* Status Messages for Contact Scanning */
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

  /* Shared: start scanning */
  const startScanning = (contactsData?: Contact[]) => {
    setIsApproved(true); // unlock step 3
    setIsScanning(true);
    setScanComplete(false);
    setDisplayedContacts([]);

    // Use contacts from API - should always be available at this point
    const contactsToUse = contactsData || contactsFromAPI;
    console.log("startScanning - contacts received:", contactsData);
    console.log("startScanning - contactsToUse:", contactsToUse);
    const scanTotal = Math.min(totalToScan, contactsToUse.length);
    console.log("startScanning - scanTotal:", scanTotal);

    // Safety check: If no contacts from API, show error
    // TODO: rahul will handle empty contacts case properly
    // if (contactsToUse.length === 0) {
    //   console.error('No contacts available from API');
    //   setIsScanning(false);
    //   alert('No contacts found. Please try again.');
    //   return;
    // }

    let i = 0;
    const intv = setInterval(() => {
      // when we push a contact, mark it as not fetched yet; then mark fetched after 3s
      const contactToAdd = contactsToUse[i];
      if (contactToAdd) {
        const contactWithState: Contact = { ...contactToAdd, fetched: false };
        setDisplayedContacts((prev) => [...prev, contactWithState]);
        // schedule fetched state flip after 3s for this contact
        setTimeout(() => {
          setDisplayedContacts((prev) => {
            const index = prev.findIndex(
              (p) => p.email === contactWithState.email && !p.fetched
            );
            if (index === -1) return prev; // already updated or removed
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
          // reset complete animation after 3 seconds
          setTimeout(() => setScanComplete(false), 3000);

          // Scroll to Step 3 and pulse border for 5 seconds
          setTimeout(() => {
            const step3El = document.getElementById("email-composition");
            if (step3El && typeof window !== "undefined") {
              const rect = step3El.getBoundingClientRect();
              const target =
                window.pageYOffset +
                rect.top -
                window.innerHeight / 2 +
                rect.height / 2;
              window.scrollTo({
                top: Math.max(0, Math.floor(target)),
                behavior: "smooth",
              });
            }
            // Trigger pulse
            setStep3Pulse(true);
            setTimeout(() => setStep3Pulse(false), 5000);
          }, 500);

          // Scroll to top after 2 seconds
          setTimeout(() => {
            if (typeof window !== "undefined") {
              window.scrollTo({ top: 0, behavior: "smooth" });
            }
          }, 2000);
        }, 700);
      }
    }, 480);
  };

  /* Approve flow: show approving animation then scan */
  const handleApprove = async () => {
    setShowWrongInput(false);
    setIsApproving(true);

    try {
      // Call approve API
      const response = await fetch("/api/approve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          previewLink: appUrl,
          appid: appData?.appid || appData?.bundleId,
          orgID: orgData?.orgID,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch contacts");
      }

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
      setTimeout(() => {
        startScanning([]);
      }, 900);
    }
  };

  /* Wrong flow */
  const handleWrong = () => {
    setShowWrongInput(true); // show input row && hide buttons
  };

  const handleWrongSubmit = async () => {
    if (!wrongContactLink.trim()) return;

    setIsApproving(true);
    setShowWrongInput(false);

    try {
      // Call contact-person API
      const response = await fetch("/api/contact-person", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contactperson: wrongContactLink,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch contacts");
      }

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
      setTimeout(() => {
        startScanning([]);
      }, 900);
    }
  };

  const handleWrongCancel = () => {
    setShowWrongInput(false);
    setWrongContactLink("");
  };

  /* UI                                                   */

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Create Campaign</h1>
        <p className="text-muted-foreground mt-2">
          Set up your outreach campaign in 3 simple steps
        </p>
      </div>

      <Timeline currentStep={getCurrentStep()} />

      <div className="grid grid-cols-5 gap-6">
        {/* Left: steps 1 & 2 */}
        <div className="col-span-3 space-y-6">
          {/* Step 1 */}
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
                  <CardDescription>
                    Enter the app store URL to fetch details
                  </CardDescription>
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HiOutlineInformationCircle className="w-5 h-5 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent
                      side="right"
                      className="w-64 bg-white text-black shadow-lg border border-gray-200 [&>div]:before:hidden [&>div]:after:hidden"
                    >
                      <p>
                        Enter the app store URL to automatically fetch app
                        details and organization information.
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
                <Button
                  onClick={handleFetch}
                  disabled={isFetchingApp || !appUrl.trim() || showDetails}
                >
                  Fetch
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Step 2 */}
          <Card
            id="confirm-details"
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
                    <CardTitle className="flex items-center gap-2">
                      Confirm Details
                      {isApproved && (
                        <span className="text-green-600 text-sm">
                          ✓ Approved
                        </span>
                      )}
                    </CardTitle>
                    <CardDescription>
                      {isApproved
                        ? "Contacts identified and ready below."
                        : "Review the app & org details."}
                    </CardDescription>
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HiOutlineInformationCircle className="w-5 h-5 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent
                        side="right"
                        className="w-64 bg-white text-black shadow-lg border border-gray-200 [&>div]:before:hidden [&>div]:after:hidden"
                      >
                        <p>
                          Review and approve the fetched app and organization
                          details. Once approved, we'll scan for contact
                          information.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </CardHeader>
            )}

            <CardContent>
              {/* Skeleton when Step 2 is not active (user at Step 1) */}
              {getCurrentStep() < 2 && (
                <div className="relative">
                  <div className="space-y-6 animate-pulse py-6 opacity-40">
                    <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <div className="h-6 bg-border/60 rounded w-1/2 mx-auto" />
                        <div className="flex flex-col items-center space-y-3">
                          <div className="w-20 h-20 bg-border/60 rounded-full" />
                          <div className="h-5 bg-border/50 rounded w-3/4" />
                          <div className="h-4 bg-border/40 rounded w-1/2" />
                          <div className="h-4 bg-border/40 rounded w-2/3" />
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="h-6 bg-border/60 rounded w-1/2 mx-auto" />
                        <div className="flex flex-col items-center space-y-3">
                          <div className="w-20 h-20 bg-border/60 rounded-full" />
                          <div className="h-5 bg-border/50 rounded w-3/4" />
                          <div className="h-4 bg-border/40 rounded w-2/3" />
                          <div className="h-4 bg-border/40 rounded w-2/3" />
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-center gap-3 pt-4">
                      <div className="h-10 bg-border/50 rounded w-28" />
                      <div className="h-10 bg-border/50 rounded w-28" />
                    </div>
                  </div>
                  {/* Loader overlay when fetching from Step 1 */}
                  {isFetchingApp && (
                    <div className="absolute inset-0 flex justify-center items-center bg-background/60 backdrop-blur-[2px]">
                      <LottieLoader size={120} />
                    </div>
                  )}
                </div>
              )}

              {/* A) fetching app - loader overlay on skeleton */}
              {getCurrentStep() >= 2 && isFetchingApp && (
                <div className="relative">
                  {/* Show skeleton beneath loader */}
                  <div className="space-y-6 animate-pulse py-6 opacity-20">
                    <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <div className="h-6 bg-border/60 rounded w-1/2 mx-auto" />
                        <div className="flex flex-col items-center space-y-3">
                          <div className="w-20 h-20 bg-border/60 rounded-full" />
                          <div className="h-5 bg-border/50 rounded w-3/4" />
                          <div className="h-4 bg-border/40 rounded w-1/2" />
                          <div className="h-4 bg-border/40 rounded w-2/3" />
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="h-6 bg-border/60 rounded w-1/2 mx-auto" />
                        <div className="flex flex-col items-center space-y-3">
                          <div className="w-20 h-20 bg-border/60 rounded-full" />
                          <div className="h-5 bg-border/50 rounded w-3/4" />
                          <div className="h-4 bg-border/40 rounded w-2/3" />
                          <div className="h-4 bg-border/40 rounded w-2/3" />
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-center gap-3 pt-4">
                      <div className="h-10 bg-border/50 rounded w-28" />
                      <div className="h-10 bg-border/50 rounded w-28" />
                    </div>
                  </div>
                  {/* Loader overlay */}
                  <div className="absolute inset-0 flex justify-center items-center bg-background/60 backdrop-blur-[2px]">
                    <LottieLoader size={120} />
                  </div>
                </div>
              )}

              {/* B) approving animation (center) */}
              {getCurrentStep() >= 2 &&
                showDetails &&
                isApproving &&
                !isScanning && (
                  <div className="flex flex-col items-center justify-center py-10 gap-3">
                    <LottieLoader size={120} />
                    <p className="text-sm text-muted-foreground">
                      Finalizing approval…
                    </p>
                  </div>
                )}

              {/* C) scanning table (replaces comparison, persists) */}
              {getCurrentStep() >= 2 && showDetails && isApproved && (
                <ContactScanner
                  contacts={displayedContacts}
                  progress={displayedContacts.length}
                  total={totalToScan}
                  status={statusFor(displayedContacts.length)}
                  isScanning={isScanning}
                />
              )}

              {/* D) comparison + actions (default) */}
              {getCurrentStep() >= 2 &&
                showDetails &&
                !isApproved &&
                !isApproving &&
                !isScanning && (
                  <div className="space-y-6">
                    <div className="relative grid grid-cols-2 gap-8">
                      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border/50 transform -translate-x-1/2" />
                      {/* App */}
                      <div className="space-y-4 pr-4">
                        <h3 className="font-semibold text-lg text-center">
                          App Details
                        </h3>
                        <div className="flex flex-col items-center space-y-4">
                          <span className="text-6xl">
                            {appData?.logo ? (
                              <img
                                src={appData.logo}
                                alt="App Logo"
                                className="w-20 h-20 rounded-2xl"
                              />
                            ) : (
                              "🍔"
                            )}
                          </span>
                          <div className="text-center space-y-3">
                            <p className="font-medium text-lg">
                              {appData?.title || appData?.name || "App Name"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Bundle ID:{" "}
                              {appData?.bundleId || appData?.appid || "N/A"}
                            </p>
                            <div className="flex items-center justify-center gap-2">
                              <ExternalLink className="w-4 h-4 text-muted-foreground" />
                              <a
                                href={appData?.storeLink || appUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                              >
                                View in Store
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                      {/* Org */}
                      <div className="space-y-4 pl-4">
                        <h3 className="font-semibold text-lg text-center">
                          Organisation Details
                        </h3>
                        <div className="flex flex-col items-center space-y-4">
                          <span className="text-6xl">
                            {orgData?.orgLogo ? (
                              <img
                                src={orgData.orgLogo}
                                alt="Org Logo"
                                className="w-20 h-20 rounded-2xl"
                              />
                            ) : (
                              "🏢"
                            )}
                          </span>
                          <div className="text-center space-y-3">
                            <p className="font-medium text-lg">
                              {orgData?.orgName || "Organization Name"}
                            </p>
                            <div className="flex items-center justify-center gap-2">
                              <Globe className="w-4 h-4 text-muted-foreground" />
                              <a
                                href={orgData?.orgWebsite || "#"}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                              >
                                {orgData?.orgWebsite || "Website"}
                              </a>
                            </div>
                            <div className="flex items-center justify-center gap-2">
                              <Linkedin className="w-4 h-4 text-blue-600" />
                              <a
                                href={orgData?.linkedin || "#"}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                              >
                                Company Profile
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Wrong entry row (appears above buttons) */}
                    {showWrongInput && (
                      <>
                        <Separator />
                        <div className="p-4 border rounded-lg bg-muted/50">
                          <Label htmlFor="wrongContact">
                            Enter correct contact link
                          </Label>
                          <div className="flex gap-3 mt-2">
                            <Input
                              id="wrongContact"
                              placeholder="Enter approachable person's contact link"
                              value={wrongContactLink}
                              onChange={(e) =>
                                setWrongContactLink(e.target.value)
                              }
                            />
                            <Button onClick={handleWrongSubmit}>OK</Button>
                            <Button
                              variant="outline"
                              onClick={handleWrongCancel}
                            >
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
                        <Button
                          id="approve-btn"
                          onClick={handleApprove}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Check className="w-4 h-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={handleWrong}
                          className="text-white"
                        >
                          <CircleAlert className="w-4 h-4 mr-2" />
                          Wrong
                        </Button>
                      </div>
                    )}
                  </div>
                )}
            </CardContent>
          </Card>
        </div>

        {/* Right: Step 3 */}
        <div className="col-span-2">
          <Card
            id="email-composition"
            className={`relative h-full flex flex-col transition-all duration-500 ${
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
                      <TooltipContent
                        side="left"
                        className="w-64 bg-white text-black shadow-lg border border-gray-200 [&>div]:before:hidden [&>div]:after:hidden"
                      >
                        <p>
                          Compose and customize your outreach email. Use the AI
                          suggestions to improve your message before sending.
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
              {/* Skeleton when Step 3 is not active */}
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
                    <div className="p-3 bg-border/40 rounded-lg">
                      <div className="space-y-2">
                        <div className="h-4 bg-border/50 rounded w-3/4" />
                        <div className="space-y-1">
                          <div className="h-3 bg-border/40 rounded w-full" />
                          <div className="h-3 bg-border/40 rounded w-5/6" />
                          <div className="h-3 bg-border/40 rounded w-4/5" />
                          <div className="h-3 bg-border/40 rounded w-3/4" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="h-10 bg-border/50 rounded" />
                </div>
              ) : (
                <>
                  {/* Dropdowns */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="category">Campaign Category</Label>
                      <Select
                        value={campaignCategory}
                        onValueChange={setCampaignCategory}
                      >
                        <SelectTrigger id="category" className="mt-2">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="finance">Finance</SelectItem>
                          <SelectItem value="tech">Tech</SelectItem>
                          <SelectItem value="healthcare">Healthcare</SelectItem>
                          <SelectItem value="retail">Retail</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="template">Template Selection</Label>
                      <Select
                        value={templateSelection}
                        onValueChange={setTemplateSelection}
                      >
                        <SelectTrigger id="template" className="mt-2">
                          <SelectValue placeholder="Select template" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="initial">Initial ABC</SelectItem>
                          <SelectItem value="followup">Initial DEF</SelectItem>
                          <SelectItem value="reminder">Initial GHI</SelectItem>
                          <SelectItem value="custom">Initial JKL</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <hr />
                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      placeholder="Partnership Opportunity with Swiggy"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      className="mt-2"
                    />
                  </div>

                  <div className="flex-1 flex flex-col min-h-0">
                    <Label htmlFor="content" className="mb-2">
                      Email Content
                    </Label>
                    <EmailComposer
                      content={emailContent}
                      onChange={(value) => {
                        console.log("Editor HTML value:", value);

                        const editorHtmlContent = value;
                        console.log("Stored HTML content:", editorHtmlContent);

                        setEditorHtmlValue(value);
                        console.log(
                          "Editor HTML state variable:",
                          editorHtmlValue
                        );

                        setEmailContent(value);
                      }}
                      onRewrite={async () => {
                        if (onAIRewrite) {
                          // Store current content as temp before AI rewrite
                          setTempEmailContent(emailContent);
                          try {
                            const rewrittenContent = await onAIRewrite(
                              emailContent
                            );
                            setEmailContent(rewrittenContent);
                          } catch (error) {
                            console.error("AI rewrite failed:", error);
                            // Revert on error
                            setTempEmailContent("");
                          }
                        } else {
                          // Store current content as temp
                          setTempEmailContent(emailContent);
                          console.log(
                            "AI rewrite clicked - no handler provided"
                          );
                        }
                      }}
                      placeholder={`Dear Swiggy Team,

I hope this email finds you well. I'm reaching out to explore potential partnership opportunities between our organizations...`}
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
                        // Revert to temp content
                        if (tempEmailContent) {
                          setEmailContent(tempEmailContent);
                          setTempEmailContent("");
                        }
                      }}
                      disabled={!tempEmailContent}
                    >
                      Revert
                    </Button>
                    <Button
                      className="w-auto"
                      disabled={!emailSubject.trim() || !emailContent.trim()}
                      size="sm"
                    >
                      Save
                    </Button>
                  </div>

                  {/* AI Suggestions */}
                  {/* <div>
                    <Label className="text-sm font-medium">AI Suggestions</Label>
                    <div className="mt-2 p-3 bg-muted/50 rounded-lg">
                      <div className="space-y-2 text-sm">
                        <p className="font-medium">💡 Suggested improvements:</p>
                        <ul className="space-y-1 text-muted-foreground text-xs">
                          <li>• Mention specific Swiggy features you admire</li>
                          <li>• Include your company's relevant metrics</li>
                          <li>• Propose a specific collaboration timeline</li>
                          <li>• Add a clear call-to-action</li>
                        </ul>
                      </div>
                    </div>
                  </div> */}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tour Popover */}
      {!hasSeenTour && (
        <div className="fixed bottom-4 right-4 z-50">
          <TourPopover
            steps={[
              {
                icon: Globe,
                title: "Step 1: App Details",
                description:
                  "Enter the app store URL to fetch details automatically.",
              },
              {
                icon: CheckCircle,
                title: "Step 2: Confirm Details",
                description:
                  "Review and approve the fetched information, then scan for contacts.",
              },
              {
                icon: Mail,
                title: "Step 3: Email Composition",
                description: "Compose your outreach email with AI suggestions.",
              },
            ]}
            triggerLabel="Take Tour"
          />
        </div>
      )}
    </div>
  );
}
