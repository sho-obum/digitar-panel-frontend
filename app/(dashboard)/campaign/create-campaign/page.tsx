"use client";

import { useState } from "react";
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
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

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
  name: string;
  mail: string;
  phone: string;
  email: string;
  linkedin?: string;
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
      {/* Calming message bar */}
      <div
        className={`p-3 rounded-lg transition-all duration-500 ${
          isScanning
            ? "bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200/40"
            : "bg-gradient-to-r from-green-50 to-emerald-50 border border-green-300/40"
        }`}
      >
        <p
          className={`text-sm font-medium flex items-center gap-2 bg-transparent ${
            isScanning ? "text-blue-700" : "text-green-700"
          }`}
        >
          {isScanning ? (
            <>
              <span className="animate-pulse">⏳</span>✓ Approved — Sit tight!
              We're scanning for contacts...
            </>
          ) : (
            <>
              <span>✓</span>
              All done! {total} contacts found — Ready to compose email
            </>
          )}
        </p>
      </div>

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

      <div
        className={`overflow-hidden rounded-lg border transition-all duration-500 ${
          isScanning
            ? "border-gray-200/30 bg-gray-100/40"
            : "border-border/50 bg-muted/30"
        }`}
      >
        <table className="w-full text-sm">
          <thead
            className={`text-xs uppercase transition-all duration-500 ${
              isScanning
                ? "bg-gray-100/40 text-gray-300"
                : "bg-muted/50 text-muted-foreground"
            }`}
          >
            <tr>
              <th className="p-3 text-left w-[28%]">Name</th>
              <th className="p-3 text-left w-[28%]">Mail</th>
              <th className="p-3 text-left w-[22%]">Phone</th>
              <th className="p-3 text-left w-[22%]">LinkedIn</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((c, i) =>
              c ? (
                <tr
                  key={i}
                  className={`border-t border-border/30 animate-[scanIn_0.4s_ease-out_1] transition-all duration-500 ${
                    isScanning ? "text-gray-300" : ""
                  }`}
                  style={{ animationDelay: `${i * 120}ms` }}
                >
                  <td className="p-3">{c.name}</td>
                  <td className="p-3 truncate">{c.mail}</td>
                  <td className="p-3 md:whitespace-nowrap">{c.phone}</td>
                  <td className="p-3 truncate">
                    {
                      // always show a link; if no linkedin provided, fallback to a buzz search
                    }
                    <a
                      href={
                        c.linkedin
                          ? c.linkedin
                          : `https://www.bing.com/search?q=${encodeURIComponent(
                              `${c.name} linkedin`
                            )}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-blue-600 ml-2"
                    >
                      <FaLinkedin className="w-4 h-4 text-blue-600" />
                      View
                    </a>
                  </td>
                </tr>
              ) : null
            )}

            {placeholderRows.map((_, i) => (
              <tr key={`ph-${i}`} className="border-t border-border/30">
                {Array.from({ length: 4 }).map((__, j) => (
                  <td key={j} className="p-3">
                    <div
                      className={`h-4 w-full overflow-hidden rounded transition-all duration-500 ${
                        isScanning ? "bg-gray-200/30" : "bg-border/40"
                      }`}
                    >
                      <div
                        className={`h-full w-1/3 animate-[shimmer_1.2s_infinite] ${
                          isScanning ? "bg-gray-200/40" : "bg-border/60"
                        }`}
                      />
                    </div>
                  </td>
                ))}
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
              0%, 100% { box-shadow: 0 0 12px rgba(74, 222, 128, 0.5); }
              50% { box-shadow: 0 0 24px rgba(74, 222, 128, 0.9); }
            }
            @keyframes glowPurple {
              0%, 100% { box-shadow: 0 0 12px rgba(168, 85, 247, 0.5); }
              50% { box-shadow: 0 0 24px rgba(168, 85, 247, 0.9); }
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

export default function CreateCampaignPage() {
  const [appUrl, setAppUrl] = useState("");
  const [isFetchingApp, setIsFetchingApp] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const [isApproved, setIsApproved] = useState(false);
  const [isApproving, setIsApproving] = useState(false); // center approve animation
  const [isScanning, setIsScanning] = useState(false); // table scan animation

  const [showWrongInput, setShowWrongInput] = useState(false);
  const [wrongContactLink, setWrongContactLink] = useState("");

  const [displayedContacts, setDisplayedContacts] = useState<Contact[]>([]);
  const totalToScan = 8;
  const [scanComplete, setScanComplete] = useState(false);

  const [emailSubject, setEmailSubject] = useState("");
  const [emailContent, setEmailContent] = useState("");

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

  /* Step-1 fetch simulation */
  const handleFetch = () => {
    if (!appUrl.trim()) return;
    setIsFetchingApp(true);
    setTimeout(() => {
      setIsFetchingApp(false);
      setShowDetails(true);
      // after details are shown, scroll to confirm details and focus the approve button
      setTimeout(() => {
        const el = document.getElementById("confirm-details");
        if (el && typeof window !== "undefined") {
          // compute a top that centers the element in the viewport
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
        // focus after a short delay so user sees the scroll animation first
        if (btn) setTimeout(() => btn.focus(), 600);
      }, 120);
    }, 1800);
  };

  /* Contacts and statuses */
  const contactsPool: Contact[] = [
    {
      name: "Ananya Sharma",
      mail: "ananya.sharma@swiggy.com",
      phone: "+91 98765 43121",
      email: "ananya.s@swiggy.com",
      linkedin: "https://www.linkedin.com/in/ananya-sharma",
    },
    {
      name: "Rohit Gupta",
      mail: "rohit.gupta@swiggy.com",
      phone: "+91 98111 23456",
      email: "r.gupta@swiggy.com",
      linkedin: "https://www.linkedin.com/in/rohit-gupta",
    },
    {
      name: "Priya Iyer",
      mail: "priya.iyer@swiggy.com",
      phone: "+91 99220 99881",
      email: "p.iyer@swiggy.com",
      linkedin: "https://www.linkedin.com/in/priya-iyer",
    },
    {
      name: "Karan Mehta",
      mail: "karan.mehta@swiggy.com",
      phone: "+91 98100 44112",
      email: "k.mehta@swiggy.com",
      linkedin: "https://www.linkedin.com/in/karan-mehta",
    },
    {
      name: "Meera Nair",
      mail: "meera.nair@swiggy.com",
      phone: "+91 98677 55342",
      email: "m.nair@swiggy.com",
      linkedin: "https://www.linkedin.com/in/meera-nair",
    },
    {
      name: "Aakash Verma",
      mail: "aakash.verma@swiggy.com",
      phone: "+91 98999 11003",
      email: "a.verma@swiggy.com",
      linkedin: "https://www.linkedin.com/in/aakash-verma",
    },
    {
      name: "Sanya Malhotra",
      mail: "sanya.malhotra@swiggy.com",
      phone: "+91 99588 77001",
      email: "s.malhotra@swiggy.com",
      linkedin: "https://www.linkedin.com/in/sanya-malhotra",
    },
    {
      name: "Vikram Rao",
      mail: "vikram.rao@swiggy.com",
      phone: "+91 98222 66880",
      email: "v.rao@swiggy.com",
      linkedin: "https://www.linkedin.com/in/vikram-rao",
    },
  ];

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
  const startScanning = () => {
    setIsApproved(true); // unlock step 3
    setIsScanning(true);
    setScanComplete(false);
    setDisplayedContacts([]);
    let i = 0;
    const intv = setInterval(() => {
      setDisplayedContacts((prev) => {
        const next = contactsPool[i];
        return next ? [...prev, next] : prev; // guard
      });
      i += 1;
      if (i >= totalToScan) {
        clearInterval(intv);
        setTimeout(() => {
          setIsScanning(false);
          setScanComplete(true);
          // reset complete animation after 3 seconds
          setTimeout(() => setScanComplete(false), 3000);
        }, 700);
      }
    }, 480);
  };

  /* Approve flow: show approving animation then scan */
  const handleApprove = () => {
    setShowWrongInput(false);
    setIsApproving(true);
    setTimeout(() => {
      setIsApproving(false);
      startScanning();
    }, 900);
  };

  /* Wrong flow */
  const handleWrong = () => {
    setShowWrongInput(true); // show input row, hide buttons
  };

  const handleWrongSubmit = () => {
    if (!wrongContactLink.trim()) return;
    // could store/use wrongContactLink here
    setIsApproving(true);
    setShowWrongInput(false);
    setTimeout(() => {
      setIsApproving(false);
      startScanning();
    }, 900);
  };

  const handleWrongCancel = () => {
    setShowWrongInput(false);
    setWrongContactLink("");
  };

  /* UI                                                   */

  const appData = {
    app: {
      logo: "🍔",
      name: "Swiggy – Food Delivery",
      bundleId: "in.swiggy.android",
      storeLink:
        "https://play.google.com/store/apps/details?id=in.swiggy.android",
    },
    org: {
      logo: "🏢",
      name: "Bundl Technologies Pvt Ltd",
      website: "https://swiggy.com",
      linkedin: "https://linkedin.com/company/swiggy",
    },
  };

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
              <CardTitle>App Details</CardTitle>
              <CardDescription>
                Enter the app store URL to fetch details
              </CardDescription>
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
                <CardTitle className="flex items-center gap-2">
                  Confirm Details
                  {isApproved && (
                    <span className="text-green-600 text-sm">✓ Approved</span>
                  )}
                </CardTitle>
                <CardDescription>
                  {isApproved
                    ? "Contacts identified and ready below."
                    : "Review the app & org details."}
                </CardDescription>
              </CardHeader>
            )}

            <CardContent>
              {/* A) fetching app */}
              {isFetchingApp && (
                <div className="flex justify-center py-10">
                  <LottieLoader size={120} />
                </div>
              )}

              {/* B) approving animation (center) */}
              {showDetails && isApproving && !isScanning && (
                <div className="flex flex-col items-center justify-center py-10 gap-3">
                  <LottieLoader size={120} />
                  <p className="text-sm text-muted-foreground">
                    Finalizing approval…
                  </p>
                </div>
              )}

              {/* C) scanning table (replaces comparison, persists) */}
              {showDetails && isApproved && (
                <ContactScanner
                  contacts={displayedContacts}
                  progress={displayedContacts.length}
                  total={totalToScan}
                  status={statusFor(displayedContacts.length)}
                  isScanning={isScanning}
                />
              )}

              {/* D) comparison + actions (default) */}
              {showDetails && !isApproved && !isApproving && !isScanning && (
                <div className="space-y-6">
                  <div className="relative grid grid-cols-2 gap-8">
                    <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border/50 transform -translate-x-1/2" />
                    {/* App */}
                    <div className="space-y-4 pr-4">
                      <h3 className="font-semibold text-lg text-center">
                        App Details
                      </h3>
                      <div className="flex flex-col items-center space-y-4">
                        <span className="text-6xl">{appData.app.logo}</span>
                        <div className="text-center space-y-3">
                          <p className="font-medium text-lg">
                            {appData.app.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Bundle ID: {appData.app.bundleId}
                          </p>
                          <div className="flex items-center justify-center gap-2">
                            <ExternalLink className="w-4 h-4 text-muted-foreground" />
                            <a
                              href={appData.app.storeLink}
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
                        <span className="text-6xl">{appData.org.logo}</span>
                        <div className="text-center space-y-3">
                          <p className="font-medium text-lg">
                            {appData.org.name}
                          </p>
                          <div className="flex items-center justify-center gap-2">
                            <Globe className="w-4 h-4 text-muted-foreground" />
                            <a
                              href={appData.org.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                            >
                              {appData.org.website}
                            </a>
                          </div>
                          <div className="flex items-center justify-center gap-2">
                            <Linkedin className="w-4 h-4 text-blue-600" />
                            <a
                              href={appData.org.linkedin}
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
            className={`relative h-full flex flex-col transition-all duration-500 ${
              !isApproved
                ? "bg-muted/30 animate-[glowRed_2s_ease-in-out_infinite]"
                : "shadow-[0_0_12px_rgba(74,222,128,0.4)]"
            }`}
          >
            {!isApproved && (
              <div className="absolute inset-0 z-10 bg-background/80 backdrop-blur-[1px] flex items-center justify-center rounded-lg">
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 mx-auto rounded-full bg-muted flex items-center justify-center">
                    <span className="text-2xl">✉️</span>
                  </div>
                  <p className="text-sm text-muted-foreground font-medium">
                    Approve details to compose email
                  </p>
                </div>
              </div>
            )}

            <CardHeader>
              <CardTitle>Email Composition</CardTitle>
              <CardDescription>Compose your outreach email</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col space-y-4">
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  placeholder="Partnership Opportunity with Swiggy"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                />
              </div>

              <div className="flex-1 flex flex-col min-h-0">
                <Label htmlFor="content" className="mb-2">
                  Email Content
                </Label>
                <textarea
                  id="content"
                  className="w-full flex-1 p-3 border rounded-md resize-none min-h-[120px]"
                  placeholder={`Dear Swiggy Team,

I hope this email finds you well. I'm reaching out to explore potential partnership opportunities between our organizations...`}
                  value={emailContent}
                  onChange={(e) => setEmailContent(e.target.value)}
                />
              </div>

              {/* AI Suggestions */}
              <div>
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
              </div>

              <Button
                className="w-full"
                disabled={!emailSubject.trim() || !emailContent.trim()}
              >
                Send Email
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
