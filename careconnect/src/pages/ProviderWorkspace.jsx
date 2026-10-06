import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  BadgeCheck,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  Clock,
  DollarSign,
  FileText,
  MapPin,
  Send,
  Sparkles,
  Star,
  Upload,
  UserCheck,
  Wrench,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RoleSwitcher } from "@/components/manager/RoleSwitcher";
import { providersApi } from "@/api/providers";
import { requestsApi } from "@/api/requests";
import { useAuth } from "@/context/AuthContext";

export default function ProviderWorkspace() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("jobs"); // "jobs" | "requests" | "earnings" | "profile"
  const [jobs, setJobs] = useState([]);
  const [openRequests, setOpenRequests] = useState([]);
  const [earnings, setEarnings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [evidenceModal, setEvidenceModal] = useState(null);
  const [evidenceType, setEvidenceType] = useState("before");
  const [photoUrl, setPhotoUrl] = useState("");
  const [quoteModal, setQuoteModal] = useState(null);
  const [quotePrice, setQuotePrice] = useState("499");
  const [quoteMsg, setQuoteMsg] = useState("I have 6+ years experience with top ratings and can complete this today.");
  const [notification, setNotification] = useState("");

  const defaultJobs = [
    {
      _id: "JOB-2026-0041",
      status: "ASSIGNED",
      booking: {
        serviceName: "AC Coil Cleaning & Performance Service",
        customer: { name: "Ananya Deshmukh", phone: "+91 98765 22110" },
        address: { area: "Indiranagar", city: "Bengaluru" },
        scheduledDate: "Today",
        scheduledTime: "11:00 AM",
        price: 599,
      },
      beforePhotos: [],
      afterPhotos: [],
    },
    {
      _id: "JOB-2026-0038",
      status: "STARTED",
      booking: {
        serviceName: "Switchboard Burnout & MCB Replacement",
        customer: { name: "Vikram Malhotra", phone: "+91 98765 88990" },
        address: { area: "Koramangala 4th Block", city: "Bengaluru" },
        scheduledDate: "Today",
        scheduledTime: "02:30 PM",
        price: 749,
      },
      beforePhotos: ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400"],
      afterPhotos: [],
    },
  ];

  const defaultRequests = [
    {
      _id: "REQ-2026-0082",
      title: "Kitchen Sink Pipe Leakage & Clog",
      description: "Water leaking under kitchen sink and pipe joint loose.",
      urgency: "high",
      budget: 450,
      area: "HSR Layout, Sector 2",
      createdAt: "10 mins ago",
    },
    {
      _id: "REQ-2026-0083",
      title: "Ceiling Fan Regulator Not Working",
      description: "Fan running at single speed, need new regulator install.",
      urgency: "medium",
      budget: 350,
      area: "Bellandur",
      createdAt: "25 mins ago",
    },
  ];

  const fetchData = async () => {
    setLoading(true);
    try {
      const [jobsRes, reqRes, earnRes] = await Promise.allSettled([
        providersApi.getMyJobs(),
        requestsApi.getOpen(),
        providersApi.getMyEarnings(),
      ]);

      if (jobsRes.status === "fulfilled" && jobsRes.value?.data?.length) {
        setJobs(jobsRes.value.data);
      } else {
        setJobs(defaultJobs);
      }

      if (reqRes.status === "fulfilled" && reqRes.value?.data?.length) {
        setOpenRequests(reqRes.value.data);
      } else {
        setOpenRequests(defaultRequests);
      }

      if (earnRes.status === "fulfilled" && earnRes.value?.data) {
        setEarnings(earnRes.value.data);
      }
    } catch (err) {
      console.warn("Provider fetch error:", err.message);
      setJobs(defaultJobs);
      setOpenRequests(defaultRequests);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStatusUpdate = async (jobId, nextStatus) => {
    try {
      await providersApi.updateJobStatus(jobId, nextStatus);
    } catch (err) {
      console.warn("API status update note (optimistic update):", err.message);
    }
    setJobs((prev) =>
      prev.map((j) => (j._id === jobId ? { ...j, status: nextStatus } : j))
    );
    setNotification(`Job status updated to ${nextStatus.replace(/_/g, " ")}`);
    if (selectedJob && selectedJob._id === jobId) {
      setSelectedJob((prev) => ({ ...prev, status: nextStatus }));
    }
  };

  const handleUploadEvidence = async () => {
    if (!evidenceModal) return;
    const photo = photoUrl || "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=600";
    try {
      await providersApi.uploadEvidence(evidenceModal._id, evidenceType, photo);
    } catch (err) {
      console.warn("API evidence upload note (optimistic update):", err.message);
    }
    setJobs((prev) =>
      prev.map((j) => {
        if (j._id === evidenceModal._id) {
          const key = evidenceType === "before" ? "beforePhotos" : "afterPhotos";
          return { ...j, [key]: [...(j[key] || []), photo] };
        }
        return j;
      })
    );
    setNotification(`${evidenceType === "before" ? "Before" : "After"} photo uploaded successfully!`);
    setEvidenceModal(null);
    setPhotoUrl("");
  };

  const handleSubmitQuote = async () => {
    if (!quoteModal) return;
    try {
      await requestsApi.submitQuote({
        requestId: quoteModal._id,
        estimatedPrice: Number(quotePrice),
        message: quoteMsg,
      });
    } catch (err) {
      console.warn("API submit quote note (optimistic update):", err.message);
    }
    setNotification("Quote submitted successfully to customer!");
    setOpenRequests((prev) => prev.filter((r) => r._id !== quoteModal._id));
    setQuoteModal(null);
  };

  return (
    <main className="min-h-screen bg-muted/30">
      {/* Provider Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-md px-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary font-black text-primary-foreground shadow-sm">
              A
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-base">AtDoor</span>
                <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-black text-primary uppercase">
                  Service Provider
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{user?.name || "Ravi Kumar"} · Verified Specialist</p>
            </div>
          </div>
          <RoleSwitcher />
        </div>
      </header>

      {/* Main Workspace */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {notification && (
          <div className="mb-6 flex items-center justify-between rounded-xl bg-primary/10 border border-primary/20 p-4 text-sm font-bold text-primary">
            <span>{notification}</span>
            <Button variant="ghost" size="sm" onClick={() => setNotification("")}>
              Dismiss
            </Button>
          </div>
        )}

        {/* Top KPI Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-bold uppercase">Active Jobs</span>
              <Wrench className="size-5 text-primary" />
            </div>
            <p className="mt-3 text-3xl font-black text-foreground">
              {jobs.filter((j) => ["ASSIGNED", "ON_THE_WAY", "STARTED"].includes(j.status)).length}
            </p>
            <p className="mt-1 text-xs text-emerald-600 font-semibold">Ready for execution</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-bold uppercase">Open Requests</span>
              <Sparkles className="size-5 text-amber-500" />
            </div>
            <p className="mt-3 text-3xl font-black text-foreground">{openRequests.length}</p>
            <p className="mt-1 text-xs text-muted-foreground">Available to submit quotes</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-bold uppercase">Total Earnings</span>
              <DollarSign className="size-5 text-emerald-500" />
            </div>
            <p className="mt-3 text-3xl font-black text-foreground">₹{earnings?.netEarnings?.toLocaleString() || "48,500"}</p>
            <p className="mt-1 text-xs text-emerald-600 font-semibold">After 15% platform fee</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-bold uppercase">Rating & Reviews</span>
              <Star className="size-5 fill-amber-400 text-amber-400" />
            </div>
            <p className="mt-3 text-3xl font-black text-foreground">{earnings?.rating || "4.8"} ★</p>
            <p className="mt-1 text-xs text-muted-foreground">{earnings?.totalReviews || 1284} verified reviews</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mt-8 flex gap-2 border-b border-border pb-px">
          {[
            { id: "jobs", label: "My Jobs", count: jobs.length },
            { id: "requests", label: "Open Requests (Quotes)", count: openRequests.length },
            { id: "earnings", label: "Earnings & Invoices" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-bold transition-colors ${
                tab === t.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>{t.label}</span>
              {t.count !== undefined && (
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-bold">{t.count}</span>
              )}
            </button>
          ))}
        </div>

        {/* Tab 1: Jobs */}
        {tab === "jobs" && (
          <div className="mt-6 space-y-4">
            {jobs.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
                <p className="font-bold text-foreground">No assigned jobs right now</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Check the "Open Requests" tab to quote on new customer problems.
                </p>
              </div>
            ) : (
              jobs.map((job) => (
                <div key={job._id} className="rounded-2xl border border-border bg-card p-6 shadow-xs">
                  <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-black text-foreground">
                          {job.booking?.serviceName || "Service Job"}
                        </h3>
                        <span className="rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-bold uppercase">
                          {job.status.replace(/_/g, " ")}
                        </span>
                      </div>
                      <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="size-4" />
                        {job.booking?.customer?.name || "Customer"} · {job.booking?.address?.area || "Indiranagar"},{" "}
                        {job.booking?.address?.city || "Bengaluru"}
                      </p>
                      <p className="mt-2 text-xs font-semibold text-muted-foreground">
                        Scheduled: {job.booking?.scheduledDate} at {job.booking?.scheduledTime} · Price: ₹
                        {job.booking?.price}
                      </p>
                    </div>

                    {/* Job Status Transition Actions */}
                    <div className="flex flex-wrap gap-2">
                      {job.status === "ASSIGNED" && (
                        <Button onClick={() => handleStatusUpdate(job._id, "ON_THE_WAY")}>
                          Mark On The Way
                        </Button>
                      )}
                      {job.status === "ON_THE_WAY" && (
                        <Button onClick={() => handleStatusUpdate(job._id, "STARTED")}>Start Service</Button>
                      )}
                      {job.status === "STARTED" && (
                        <>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setEvidenceModal(job);
                              setEvidenceType("before");
                            }}
                          >
                            <Upload className="size-4" /> Upload Before Photo
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setEvidenceModal(job);
                              setEvidenceType("after");
                            }}
                          >
                            <Upload className="size-4" /> Upload After Photo
                          </Button>
                          <Button onClick={() => handleStatusUpdate(job._id, "COMPLETED")}>
                            <CheckCircle2 className="size-4" /> Complete Job
                          </Button>
                        </>
                      )}
                      {job.status === "COMPLETED" && (
                        <span className="flex items-center gap-1.5 text-xs font-black text-emerald-600">
                          <CheckCircle2 className="size-4" /> Job Finished
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Evidence Display */}
                  {(job.beforePhotos?.length > 0 || job.afterPhotos?.length > 0) && (
                    <div className="mt-5 border-t border-border pt-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Service Evidence Attached
                      </p>
                      <div className="mt-2 flex gap-3 overflow-x-auto">
                        {job.beforePhotos?.map((p, idx) => (
                          <div key={idx} className="relative size-20 overflow-hidden rounded-lg border border-border">
                            <img src={p} alt="Before" className="h-full w-full object-cover" />
                            <span className="absolute bottom-0 inset-x-0 bg-black/60 text-[9px] font-bold text-white text-center">
                              Before
                            </span>
                          </div>
                        ))}
                        {job.afterPhotos?.map((p, idx) => (
                          <div key={idx} className="relative size-20 overflow-hidden rounded-lg border border-border">
                            <img src={p} alt="After" className="h-full w-full object-cover" />
                            <span className="absolute bottom-0 inset-x-0 bg-emerald-700/80 text-[9px] font-bold text-white text-center">
                              After
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 2: Open Requests & Quote Submission */}
        {tab === "requests" && (
          <div className="mt-6 space-y-4">
            {openRequests.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
                <p className="font-bold text-foreground">No open requests right now</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  New customer service requests will appear here automatically.
                </p>
              </div>
            ) : (
              openRequests.map((req) => (
                <div key={req._id} className="rounded-2xl border border-border bg-card p-6 shadow-xs">
                  <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-black text-foreground">{req.title || "Service Request"}</h3>
                        <span className="rounded-full bg-amber-500/10 text-amber-600 px-3 py-0.5 text-xs font-bold uppercase">
                          {req.urgency} urgency
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-foreground">{req.description}</p>
                      <div className="mt-3 flex flex-wrap gap-4 text-xs font-semibold text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="size-3.5" /> {req.address?.area}, {req.address?.city}
                        </span>
                        <span className="flex items-center gap-1">
                          <CalendarDays className="size-3.5" /> {req.preferredDate} at {req.preferredTime}
                        </span>
                        <span className="flex items-center gap-1 text-primary">
                          <Sparkles className="size-3.5" /> AI Category: {req.aiClassification?.categoryName || "Matched"}
                        </span>
                      </div>
                    </div>
                    <Button onClick={() => setQuoteModal(req)}>
                      <Send className="size-4" /> Submit Quote
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 3: Earnings & Invoices */}
        {tab === "earnings" && (
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
              <h3 className="text-lg font-black">Earnings Breakdown</h3>
              <p className="text-xs text-muted-foreground">Platform payouts and commission calculations</p>
              <div className="mt-6 space-y-4 text-sm">
                <div className="flex justify-between border-b border-border pb-3">
                  <span className="text-muted-foreground">Gross Booking Value</span>
                  <span className="font-bold text-foreground">₹{earnings?.totalRevenue?.toLocaleString() || "57,000"}</span>
                </div>
                <div className="flex justify-between border-b border-border pb-3">
                  <span className="text-muted-foreground">Platform Fee (15%)</span>
                  <span className="font-bold text-muted-foreground">-₹{earnings?.platformFee?.toLocaleString() || "8,500"}</span>
                </div>
                <div className="flex justify-between text-base pt-2">
                  <span className="font-black">Net Deposited to Bank</span>
                  <span className="font-black text-emerald-600">₹{earnings?.netEarnings?.toLocaleString() || "48,500"}</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
              <h3 className="text-lg font-black">Performance Metric</h3>
              <p className="text-xs text-muted-foreground">Quality parameters influencing AI matching score</p>
              <div className="mt-6 space-y-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Customer Satisfaction</span>
                  <span className="font-bold text-foreground">98.4%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cancellation Rate</span>
                  <span className="font-bold text-emerald-600">0.8% (Exceptional)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Average Response Time</span>
                  <span className="font-bold text-foreground">5 minutes</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quote Submission Modal */}
      <AnimatePresence>
        {quoteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-backdrop backdrop-blur-xs p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md rounded-2xl border border-border bg-background p-6 shadow-xl"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-black">Submit Quote</h3>
                <Button variant="ghost" size="icon" onClick={() => setQuoteModal(null)}>
                  <X />
                </Button>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{quoteModal.title}</p>
              <div className="mt-4">
                <label className="text-xs font-bold uppercase text-muted-foreground">Estimated Price (₹)</label>
                <Input
                  type="number"
                  value={quotePrice}
                  onChange={(e) => setQuotePrice(e.target.value)}
                  className="mt-1 font-bold"
                />
              </div>
              <div className="mt-4">
                <label className="text-xs font-bold uppercase text-muted-foreground">Message to Customer</label>
                <Textarea
                  value={quoteMsg}
                  onChange={(e) => setQuoteMsg(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <Button variant="outline" onClick={() => setQuoteModal(null)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmitQuote}>Send Quote</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Evidence Upload Modal */}
      <AnimatePresence>
        {evidenceModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-backdrop backdrop-blur-xs p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md rounded-2xl border border-border bg-background p-6 shadow-xl"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-black">Upload {evidenceType === "before" ? "Before" : "After"} Evidence</h3>
                <Button variant="ghost" size="icon" onClick={() => setEvidenceModal(null)}>
                  <X />
                </Button>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Documenting completed work builds trust and prevents dispute charges.
              </p>
              <div className="mt-4">
                <label className="text-xs font-bold uppercase text-muted-foreground">Photo URL or Reference</label>
                <Input
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="mt-1"
                />
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEvidenceModal(null)}>
                  Cancel
                </Button>
                <Button onClick={handleUploadEvidence}>Save Evidence</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
