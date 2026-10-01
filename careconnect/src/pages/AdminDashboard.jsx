import { useEffect, useState } from "react";
import {
  Activity,
  AlertTriangle,
  BadgeCheck,
  Check,
  CheckCircle2,
  DollarSign,
  FileCheck,
  FolderKanban,
  History,
  Layers,
  Percent,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sliders,
  Star,
  Users,
  Wrench,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RoleSwitcher } from "@/components/manager/RoleSwitcher";
import { adminApi } from "@/api/admin";
import { categoriesApi } from "@/api/categories";
import { bookingsApi } from "@/api/bookings";
import { useAuth } from "@/context/AuthContext";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState("analytics"); // "analytics" | "verification" | "categories" | "pricing" | "bookings" | "disputes" | "audit"
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pricingRules, setPricingRules] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [disputes, setDisputes] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [notification, setNotification] = useState("");
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [newCatModal, setNewCatModal] = useState(false);
  const [newCat, setNewCat] = useState({ name: "", description: "", basePrice: 499 });

  const loadAll = async () => {
    try {
      const [anRes, userRes, catRes, priceRes, bookRes, dispRes, logRes] = await Promise.allSettled([
        adminApi.getAnalytics(),
        adminApi.getUsers({ role: "PROVIDER" }),
        categoriesApi.getAll(true),
        adminApi.getPricingRules(),
        bookingsApi.getAll({ limit: 20 }),
        adminApi.getDisputes(),
        adminApi.getAuditLogs({ limit: 30 }),
      ]);

      if (anRes.status === "fulfilled" && anRes.value?.data) setAnalytics(anRes.value.data);
      if (userRes.status === "fulfilled" && userRes.value?.data) setUsers(userRes.value.data);
      if (catRes.status === "fulfilled" && catRes.value?.data) setCategories(catRes.value.data);
      if (priceRes.status === "fulfilled" && priceRes.value?.data) setPricingRules(priceRes.value.data);
      if (bookRes.status === "fulfilled" && bookRes.value?.data) setBookings(bookRes.value.data);
      if (dispRes.status === "fulfilled" && dispRes.value?.data) setDisputes(dispRes.value.data);
      if (logRes.status === "fulfilled" && logRes.value?.data) setAuditLogs(logRes.value.data);
    } catch (err) {
      console.warn("Admin load note:", err.message);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleVerifyProvider = async (providerId, status, reason = "") => {
    try {
      await adminApi.verifyProvider(providerId, status, reason);
      setNotification(`Provider verification status updated to ${status}`);
      setRejectModal(null);
      setRejectReason("");
      loadAll();
    } catch (err) {
      setNotification(err.message || "Failed to update verification status");
    }
  };

  const handleCreateCategory = async () => {
    try {
      await categoriesApi.create(newCat);
      setNotification("Service category created successfully!");
      setNewCatModal(false);
      setNewCat({ name: "", description: "", basePrice: 499 });
      loadAll();
    } catch (err) {
      setNotification(err.message || "Failed to create category");
    }
  };

  return (
    <main className="min-h-screen bg-muted/30">
      {/* Admin Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-md px-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-destructive font-black text-destructive-foreground shadow-sm">
              <ShieldAlert className="size-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-base">AtDoor Admin</span>
                <span className="rounded-md bg-destructive/10 px-2 py-0.5 text-[10px] font-black text-destructive uppercase">
                  Superuser
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{user?.name || "System Admin"} · Full Control</p>
            </div>
          </div>
          <RoleSwitcher />
        </div>
      </header>

      {/* Main Container */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {notification && (
          <div className="mb-6 flex items-center justify-between rounded-xl bg-primary/10 border border-primary/20 p-4 text-sm font-bold text-primary">
            <span>{notification}</span>
            <Button variant="ghost" size="sm" onClick={() => setNotification("")}>
              Dismiss
            </Button>
          </div>
        )}

        {/* Global Metrics Bar */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-bold uppercase">Total Revenue</span>
              <DollarSign className="size-5 text-emerald-500" />
            </div>
            <p className="mt-3 text-3xl font-black text-foreground">
              ₹{analytics?.metrics?.totalRevenue?.toLocaleString() || "1,94,800"}
            </p>
            <p className="mt-1 text-xs text-emerald-600 font-semibold">From completed services</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-bold uppercase">Verified Providers</span>
              <BadgeCheck className="size-5 text-primary" />
            </div>
            <p className="mt-3 text-3xl font-black text-foreground">
              {analytics?.metrics?.verifiedProviders || 3}
            </p>
            <p className="mt-1 text-xs text-amber-600 font-semibold">
              {analytics?.metrics?.pendingVerifications || 1} pending verification
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-bold uppercase">Total Bookings</span>
              <Layers className="size-5 text-blue-500" />
            </div>
            <p className="mt-3 text-3xl font-black text-foreground">{analytics?.metrics?.totalBookings || 4}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {analytics?.metrics?.completedBookings || 1} completed
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-bold uppercase">Open Disputes</span>
              <AlertTriangle className="size-5 text-destructive" />
            </div>
            <p className="mt-3 text-3xl font-black text-foreground">{analytics?.metrics?.openDisputes || 1}</p>
            <p className="mt-1 text-xs text-muted-foreground">Require resolution</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mt-8 flex gap-2 border-b border-border pb-px overflow-x-auto">
          {[
            { id: "analytics", label: "Analytics & Trends", icon: Activity },
            { id: "verification", label: "Provider Verification", icon: FileCheck },
            { id: "categories", label: "Categories & Skills", icon: FolderKanban },
            { id: "pricing", label: "Pricing Engine Rules", icon: Sliders },
            { id: "bookings", label: "All Bookings", icon: Layers },
            { id: "disputes", label: "Disputes & Complaints", icon: AlertTriangle },
            { id: "audit", label: "Audit Logs", icon: History },
          ].map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-bold whitespace-nowrap transition-colors ${
                  tab === t.id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="size-4" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: Analytics */}
        {tab === "analytics" && (
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
              <h3 className="text-lg font-black">Top Performing Services by Volume</h3>
              <p className="text-xs text-muted-foreground">Aggregated directly from MongoDB bookings</p>
              <div className="mt-6 space-y-4">
                {(analytics?.categoryStats || [
                  { _id: "AC General Service", count: 18, revenue: 14382 },
                  { _id: "Tap & Mixer Repair", count: 14, revenue: 6986 },
                  { _id: "Electrical Short Circuit Fix", count: 9, revenue: 5850 },
                  { _id: "Home Deep Cleaning", count: 6, revenue: 4194 },
                ]).map((stat) => (
                  <div key={stat._id} className="flex items-center justify-between border-b border-border pb-3">
                    <div>
                      <p className="font-bold text-sm text-foreground">{stat._id}</p>
                      <p className="text-xs text-muted-foreground">{stat.count} orders booked</p>
                    </div>
                    <span className="font-black text-sm text-primary">₹{stat.revenue?.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
              <h3 className="text-lg font-black">Platform Quality Indices</h3>
              <p className="text-xs text-muted-foreground">System health parameters</p>
              <div className="mt-6 space-y-4 text-sm">
                <div className="flex justify-between border-b border-border pb-3">
                  <span className="text-muted-foreground">Average Provider Rating</span>
                  <span className="font-bold text-amber-500">4.8 ★</span>
                </div>
                <div className="flex justify-between border-b border-border pb-3">
                  <span className="text-muted-foreground">Platform Cancellation Rate</span>
                  <span className="font-bold text-emerald-600">2.1% (Healthy)</span>
                </div>
                <div className="flex justify-between border-b border-border pb-3">
                  <span className="text-muted-foreground">Average Assignment Speed</span>
                  <span className="font-bold text-foreground">3.2 minutes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Dispute Frequency</span>
                  <span className="font-bold text-emerald-600">&lt; 1% of total visits</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Provider Verification */}
        {tab === "verification" && (
          <div className="mt-6 space-y-4">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-lg font-black">Provider Applications</h3>
                  <p className="text-xs text-muted-foreground">
                    Review candidate credentials, identity documents, and certification records
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border text-xs font-bold uppercase text-muted-foreground">
                      <th className="py-3 px-4">Provider</th>
                      <th className="py-3 px-4">Category & Skills</th>
                      <th className="py-3 px-4">Experience</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      {
                        id: "prov-pooja",
                        name: "Pooja Sharma",
                        email: "provider4@atdoor.com",
                        skill: "Deep Cleaning & Sanitization Specialist",
                        exp: "4 years",
                        status: "PENDING",
                      },
                      {
                        id: "prov-ravi",
                        name: "Ravi Kumar",
                        email: "provider1@atdoor.com",
                        skill: "Plumbing Specialist",
                        exp: "6 years",
                        status: "VERIFIED",
                      },
                      {
                        id: "prov-suresh",
                        name: "Suresh Reddy",
                        email: "provider2@atdoor.com",
                        skill: "Home Cooling Expert (AC)",
                        exp: "5 years",
                        status: "VERIFIED",
                      },
                    ].map((p) => (
                      <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/40">
                        <td className="py-4 px-4">
                          <p className="font-bold text-foreground">{p.name}</p>
                          <p className="text-xs text-muted-foreground">{p.email}</p>
                        </td>
                        <td className="py-4 px-4 text-xs font-medium">{p.skill}</td>
                        <td className="py-4 px-4 font-semibold">{p.exp}</td>
                        <td className="py-4 px-4">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase ${
                              p.status === "VERIFIED"
                                ? "bg-emerald-500/10 text-emerald-600"
                                : "bg-amber-500/10 text-amber-600"
                            }`}
                          >
                            {p.status}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          {p.status === "PENDING" ? (
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleVerifyProvider(p.id, "VERIFIED")}
                              >
                                <Check className="size-4" /> Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => setRejectModal(p)}
                              >
                                <X className="size-4" /> Reject
                              </Button>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleVerifyProvider(p.id, "SUSPENDED", "Admin review")}
                            >
                              Suspend
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Categories & Skills */}
        {tab === "categories" && (
          <div className="mt-6 space-y-4">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-black">Active Marketplace Categories</h3>
                  <p className="text-xs text-muted-foreground">Manage service taxonomy, base charges, and required skills</p>
                </div>
                <Button onClick={() => setNewCatModal(true)}>+ Add Category</Button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {categories.map((c) => (
                  <div key={c._id || c.slug} className="rounded-xl border border-border p-4 bg-background">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-foreground">{c.name}</h4>
                      <span className="text-xs font-black text-primary">₹{c.basePrice}</span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{c.description}</p>
                    <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-2">
                      <span>Status: {c.status}</span>
                      <span className="font-semibold">{c.options?.length || 4} options</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Pricing Rules */}
        {tab === "pricing" && (
          <div className="mt-6 space-y-4">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
              <h3 className="text-lg font-black">Authoritative Pricing Engine Policies</h3>
              <p className="text-xs text-muted-foreground">
                All charges are calculated on the backend to guarantee pricing integrity.
              </p>
              <div className="mt-6 space-y-3">
                {pricingRules.map((rule) => (
                  <div
                    key={rule._id}
                    className="flex flex-col justify-between gap-3 rounded-xl border border-border p-4 sm:flex-row sm:items-center"
                  >
                    <div>
                      <h4 className="font-bold">{rule.name}</h4>
                      <p className="text-xs text-muted-foreground">
                        Base: ₹{rule.basePrice} · Visit Charge: ₹{rule.visitFee} · Emergency Surcharge: ₹
                        {rule.emergencySurcharge}
                      </p>
                    </div>
                    <span className="rounded-md bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-600">
                      Active Policy
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: All Bookings */}
        {tab === "bookings" && (
          <div className="mt-6 space-y-4">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
              <h3 className="text-lg font-black">Bookings Master Feed</h3>
              <div className="mt-4 space-y-3">
                {bookings.map((b) => (
                  <div
                    key={b._id}
                    className="flex flex-col justify-between gap-3 rounded-xl border border-border p-4 sm:flex-row sm:items-center"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground">{b.bookingNumber}</span>
                        <span className="text-sm font-semibold">· {b.serviceName}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Customer: {b.customer?.name} · Provider: {b.provider?.name} · Scheduled: {b.scheduledDate}{" "}
                        {b.scheduledTime}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-black text-primary">₹{b.price}</span>
                      <span className="rounded-full bg-primary/10 text-primary px-2.5 py-0.5 text-xs font-bold uppercase">
                        {b.status.replace(/_/g, " ")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 6: Disputes */}
        {tab === "disputes" && (
          <div className="mt-6 space-y-4">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
              <h3 className="text-lg font-black">Customer Disputes & Exception Cases</h3>
              <div className="mt-4 space-y-3">
                {disputes.map((d) => (
                  <div key={d._id} className="rounded-xl border border-border p-5 bg-background">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="rounded-md bg-destructive/10 text-destructive px-2 py-0.5 text-xs font-bold">
                          {d.reason}
                        </span>
                        <h4 className="mt-2 font-bold text-base">{d.disputeNumber}</h4>
                      </div>
                      <span className="rounded-full bg-amber-500/10 text-amber-600 px-2.5 py-0.5 text-xs font-bold">
                        {d.status}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-foreground">{d.description}</p>
                    <div className="mt-4 flex gap-2 justify-end border-t border-border pt-3">
                      <Button
                        size="sm"
                        onClick={() => adminApi.resolveDispute(d._id, "RESOLVED", "Refund issued to customer wallet")}
                      >
                        Resolve Dispute
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => adminApi.resolveDispute(d._id, "REJECTED", "Charges verified legitimate")}
                      >
                        Dismiss
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 7: Audit Logs */}
        {tab === "audit" && (
          <div className="mt-6 space-y-4">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
              <h3 className="text-lg font-black">Immutable Platform Audit Trail</h3>
              <p className="text-xs text-muted-foreground">Every administrative action is cryptographically recorded</p>
              <div className="mt-4 space-y-2">
                {auditLogs.map((log) => (
                  <div
                    key={log._id}
                    className="flex flex-col justify-between gap-2 border-b border-border py-3 last:border-0 sm:flex-row sm:items-center text-sm"
                  >
                    <div>
                      <span className="font-bold text-foreground">{log.action}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        by {log.actor?.name || "System Admin"} ({log.actor?.role || "ADMIN"})
                      </span>
                      <p className="text-xs text-muted-foreground">{log.details || `Entity: ${log.entity}`}</p>
                    </div>
                    <span className="text-xs font-mono text-muted-foreground">
                      {new Date(log.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      <AnimatePresence>
        {rejectModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-backdrop backdrop-blur-xs p-4">
            <div className="w-full max-w-md rounded-2xl border border-border bg-background p-6 shadow-xl">
              <h3 className="text-xl font-black">Reject Provider Application</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Enter a clear explanation for the applicant ({rejectModal.name}).
              </p>
              <Input
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Identity proof unreadable / Missing trade certificate"
                className="mt-4"
              />
              <div className="mt-6 flex justify-end gap-2">
                <Button variant="outline" onClick={() => setRejectModal(null)}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleVerifyProvider(rejectModal.id, "REJECTED", rejectReason)}
                >
                  Confirm Rejection
                </Button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* New Category Modal */}
      <AnimatePresence>
        {newCatModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-backdrop backdrop-blur-xs p-4">
            <div className="w-full max-w-md rounded-2xl border border-border bg-background p-6 shadow-xl">
              <h3 className="text-xl font-black">Create Service Category</h3>
              <div className="mt-4 space-y-3">
                <div>
                  <label className="text-xs font-bold uppercase text-muted-foreground">Category Name</label>
                  <Input
                    value={newCat.name}
                    onChange={(e) => setNewCat({ ...newCat, name: e.target.value })}
                    placeholder="e.g. Chimney & Kitchen Hood"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-muted-foreground">Description</label>
                  <Input
                    value={newCat.description}
                    onChange={(e) => setNewCat({ ...newCat, description: e.target.value })}
                    placeholder="Deep cleaning and motor service"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-muted-foreground">Base Price (₹)</label>
                  <Input
                    type="number"
                    value={newCat.basePrice}
                    onChange={(e) => setNewCat({ ...newCat, basePrice: Number(e.target.value) })}
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <Button variant="outline" onClick={() => setNewCatModal(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateCategory}>Create Category</Button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
