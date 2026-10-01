import { useEffect, useState } from "react";
import {
  AlertTriangle,
  BadgeAlert,
  CheckCircle2,
  Headphones,
  LifeBuoy,
  MessageSquare,
  RefreshCw,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RoleSwitcher } from "@/components/manager/RoleSwitcher";
import { adminApi } from "@/api/admin";
import { useAuth } from "@/context/AuthContext";

export default function SupportDashboard() {
  const { user } = useAuth();
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resolveModal, setResolveModal] = useState(null);
  const [resolutionText, setResolutionText] = useState("");
  const [notification, setNotification] = useState("");

  const fetchDisputes = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getDisputes();
      if (res?.data) {
        setDisputes(res.data);
      }
    } catch (err) {
      console.warn("Support fetch error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisputes();
  }, []);

  const handleResolve = async (status) => {
    if (!resolveModal) return;
    try {
      await adminApi.resolveDispute(resolveModal._id, status, resolutionText);
      setNotification(`Dispute marked as ${status}`);
      setResolveModal(null);
      setResolutionText("");
      fetchDisputes();
    } catch (err) {
      setNotification(err.message || "Action failed");
    }
  };

  return (
    <main className="min-h-screen bg-muted/30">
      {/* Support Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-md px-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary font-black text-primary-foreground shadow-sm">
              <Headphones className="size-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-base">AtDoor Support</span>
                <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-black text-primary uppercase">
                  Agent Workspace
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{user?.name || "Sneha Nair"} · Customer Escalations</p>
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

        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="eyebrow">SUPPORT & RESOLUTION</p>
            <h1 className="page-title">Customer Complaints & Disputes</h1>
            <p className="section-copy">Review customer complaints, mediate charges, and issue refunds.</p>
          </div>
          <Button variant="outline" onClick={fetchDisputes}>
            <RefreshCw className="size-4" /> Refresh Tickets
          </Button>
        </div>

        <div className="mt-8 space-y-4">
          {disputes.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
              <CheckCircle2 className="mx-auto size-12 text-emerald-500" />
              <p className="mt-3 font-bold text-foreground">Zero active complaints</p>
              <p className="mt-1 text-sm text-muted-foreground">All customer service tickets are fully resolved.</p>
            </div>
          ) : (
            disputes.map((d) => (
              <div key={d._id} className="rounded-2xl border border-border bg-card p-6 shadow-xs">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="rounded-md bg-destructive/10 text-destructive px-2.5 py-0.5 text-xs font-bold">
                        {d.reason}
                      </span>
                      <h3 className="text-lg font-black">{d.disputeNumber}</h3>
                      <span className="rounded-full bg-amber-500/10 text-amber-600 px-3 py-0.5 text-xs font-bold uppercase">
                        {d.status}
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-foreground">{d.description}</p>
                    <div className="mt-4 flex flex-wrap gap-4 text-xs font-semibold text-muted-foreground border-t border-border pt-3">
                      <span>Customer: {d.customer?.name} ({d.customer?.phone})</span>
                      <span>Provider: {d.provider?.name} ({d.provider?.phone})</span>
                      <span>Booking ID: {d.booking?.bookingNumber || "ATD-2026-00124"}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => setResolveModal(d)}>Investigate & Resolve</Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Resolve Modal */}
      <AnimatePresence>
        {resolveModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-backdrop backdrop-blur-xs p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg rounded-2xl border border-border bg-background p-6 shadow-xl"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-black">Resolve Ticket {resolveModal.disputeNumber}</h3>
                <Button variant="ghost" size="icon" onClick={() => setResolveModal(null)}>
                  <X />
                </Button>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Issue: {resolveModal.reason} · Raised by {resolveModal.customer?.name}
              </p>
              <div className="mt-4">
                <label className="text-xs font-bold uppercase text-muted-foreground">Resolution Notes & Findings</label>
                <Textarea
                  value={resolutionText}
                  onChange={(e) => setResolutionText(e.target.value)}
                  placeholder="e.g. Investigated booking notes and refunded ₹200 back to customer. Provider advised on accurate quoting."
                  className="mt-1"
                />
              </div>
              <div className="mt-6 flex flex-wrap justify-end gap-2">
                <Button variant="outline" onClick={() => setResolveModal(null)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={() => handleResolve("REJECTED")}>
                  Reject Claim
                </Button>
                <Button onClick={() => handleResolve("RESOLVED")}>
                  Grant Resolution / Refund
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
