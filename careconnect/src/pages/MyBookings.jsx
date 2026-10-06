import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  Clock3,
  MapPin,
  MessageCircle,
  ReceiptText,
  RotateCcw,
  Star,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { AtDoorTabs } from "@/components/AtDoorTabs";
import { Button } from "@/components/ui/button";
import { bookings as fallbackBookings } from "@/data/mockData";
import { bookingsApi } from "@/api/bookings";
import { Textarea } from "@/components/ui/textarea";

const tabs = [
  { id: "active", label: "Active", icon: <Clock3 className="size-4" /> },
  { id: "upcoming", label: "Upcoming", icon: <CalendarClock className="size-4" /> },
  { id: "completed", label: "Completed", icon: <CheckCircle2 className="size-4" /> },
];

export default function MyBookings() {
  const [active, setActive] = useState("active");
  const [bookingsData, setBookingsData] = useState(fallbackBookings);
  const [reviewModal, setReviewModal] = useState(null);
  const [disputeModal, setDisputeModal] = useState(null);
  const [invoiceModal, setInvoiceModal] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [disputeReason, setDisputeReason] = useState("Poor Service");
  const [disputeDesc, setDisputeDesc] = useState("");
  const [message, setMessage] = useState("");
  const nav = useNavigate();

  const fetchBookings = async () => {
    let localBookings = [];
    try {
      localBookings = JSON.parse(localStorage.getItem("atdoor_user_bookings") || "[]");
    } catch (e) {
      console.warn("Local storage read note:", e);
    }

    try {
      const res = await bookingsApi.getMy();
      if (res?.data) {
        const mapItem = (b) => ({
          id: b.bookingNumber || b._id,
          rawId: b._id,
          service: b.serviceName,
          provider: b.provider?.name || "Assigned Provider",
          status: (b.status || "CONFIRMED").replace(/_/g, " "),
          note: b.status === "COMPLETED" ? "Service completed successfully" : b.notes || "Professional scheduled",
          date: b.scheduledDate || "Tomorrow",
          time: b.scheduledTime || "10:00 AM",
          price: b.price || 449,
          eta: b.eta || (b.status === "IN_PROGRESS" ? "12 minutes away" : "Scheduled visit"),
        });

        const apiUpcoming = (res.data.upcoming || []).map(mapItem);
        const apiActive = (res.data.active || []).map(mapItem);
        const apiCompleted = (res.data.completed || []).map(mapItem);

        const existingIds = new Set([
          ...apiUpcoming.map((b) => b.id),
          ...apiActive.map((b) => b.id),
          ...apiCompleted.map((b) => b.id),
        ]);
        const uniqueLocals = localBookings.filter((b) => !existingIds.has(b.id));

        const upcomingMerged = [...uniqueLocals, ...apiUpcoming];
        setBookingsData({
          active: apiActive,
          upcoming: upcomingMerged,
          completed: apiCompleted,
        });

        if (apiActive.length === 0 && upcomingMerged.length > 0) {
          setActive("upcoming");
        }
        return;
      }
    } catch (err) {
      console.warn("Using local bookings fallback:", err.message);
    }

    // Fallback when backend is not reached or unauthenticated demo
    const upcomingMerged = [...localBookings, ...fallbackBookings.upcoming];
    setBookingsData({
      active: fallbackBookings.active,
      upcoming: upcomingMerged,
      completed: fallbackBookings.completed,
    });

    if (localBookings.length > 0) {
      setActive("upcoming");
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleReviewSubmit = async () => {
    try {
      await bookingsApi.submitReview({
        bookingId: reviewModal.rawId || reviewModal.id,
        rating,
        review: comment,
      });
      setMessage("Review submitted successfully!");
      setReviewModal(null);
      setComment("");
      fetchBookings();
    } catch (err) {
      setMessage(err.message || "Failed to submit review");
    }
  };

  const handleDisputeSubmit = async () => {
    try {
      await bookingsApi.createDispute({
        bookingId: disputeModal.rawId || disputeModal.id,
        reason: disputeReason,
        description: disputeDesc,
      });
      setMessage("Dispute ticket raised. Support agent assigned.");
      setDisputeModal(null);
      setDisputeDesc("");
      fetchBookings();
    } catch (err) {
      setMessage(err.message || "Failed to raise dispute");
    }
  };

  const currentList = bookingsData[active] || [];

  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <p className="eyebrow">YOUR SERVICES</p>
      <h1 className="page-title">My Bookings</h1>
      <p className="section-copy">Track visits, manage upcoming services, and revisit completed work.</p>

      {message && (
        <div className="mt-4 rounded-lg bg-primary/10 border border-primary/20 p-3 text-sm font-bold text-primary flex justify-between items-center">
          <span>{message}</span>
          <Button variant="ghost" size="sm" onClick={() => setMessage("")}>
            Dismiss
          </Button>
        </div>
      )}

      <div className="mt-8">
        <AtDoorTabs tabs={tabs} active={active} onChange={setActive} />
      </div>

      <motion.div key={active} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-8 space-y-4">
        {currentList.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card/50 p-12 text-center">
            <p className="font-bold text-foreground">No {active} bookings found</p>
            <p className="mt-1 text-sm text-muted-foreground">Book a home service from our dashboard or services catalogue.</p>
            <Button className="mt-4" onClick={() => nav({ to: "/" })}>
              Explore Services
            </Button>
          </div>
        ) : (
          currentList.map((b) => (
            <article key={b.id} className="rounded-xl border border-border bg-card p-5 shadow-xs sm:p-7">
              <div className="flex flex-col justify-between gap-6 sm:flex-row">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-xl font-black">{b.service}</h2>
                    <span className="rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-bold">
                      {b.status}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {b.provider} · {b.id}
                  </p>
                  <p className="mt-4 font-bold">{b.note}</p>
                  {b.eta && (
                    <p className="mt-2 flex items-center gap-2 text-sm text-primary">
                      <MapPin className="size-4" />
                      ETA: <strong>{b.eta}</strong>
                    </p>
                  )}
                  {b.rating && (
                    <p className="mt-2 flex items-center gap-1 font-bold text-amber-500">
                      <Star className="size-4 fill-current" />
                      {b.rating} ★
                    </p>
                  )}
                </div>
                <div className="sm:text-right">
                  <p className="text-sm text-muted-foreground">
                    {b.date} · {b.time}
                  </p>
                  <p className="mt-2 text-2xl font-black">₹{b.price}</p>
                </div>
              </div>
              <div className="mt-6 flex flex-wrap gap-2 border-t border-border pt-5">
                {active === "active" && (
                  <>
                    <Button onClick={() => nav({ to: "/tracking" })}>
                      <MapPin className="size-4" />
                      Live Track
                    </Button>
                    <Button variant="outline" onClick={() => setDisputeModal(b)}>
                      <AlertTriangle className="size-4" />
                      Raise Issue
                    </Button>
                  </>
                )}
                {active === "upcoming" && (
                  <>
                    <Button variant="outline" onClick={() => setInvoiceModal(b)}>
                      <ReceiptText className="size-4" />
                      View Invoice
                    </Button>
                    <Button
                      variant="ghost"
                      className="text-destructive hover:bg-destructive/10"
                      onClick={async () => {
                        if (confirm("Are you sure you want to cancel this booking?")) {
                          try {
                            await bookingsApi.cancel(b.rawId || b.id, "Customer requested cancellation");
                          } catch (e) {
                            console.warn("Cancel API note:", e.message);
                          }
                          try {
                            const stored = JSON.parse(localStorage.getItem("atdoor_user_bookings") || "[]");
                            localStorage.setItem(
                              "atdoor_user_bookings",
                              JSON.stringify(stored.filter((item) => item.id !== b.id))
                            );
                          } catch (e) {}
                          setMessage(`Booking ${b.id} has been cancelled.`);
                          fetchBookings();
                        }
                      }}
                    >
                      Cancel Booking
                    </Button>
                  </>
                )}
                {active === "completed" && (
                  <>
                    <Button variant="outline" onClick={() => setInvoiceModal(b)}>
                      <ReceiptText className="size-4" />
                      View Invoice
                    </Button>
                    <Button variant="outline" onClick={() => setDisputeModal(b)}>
                      <AlertTriangle className="size-4" />
                      Dispute Charge
                    </Button>
                    <Button onClick={() => setReviewModal(b)}>
                      <Star className="size-4" />
                      Review Service
                    </Button>
                  </>
                )}
              </div>
            </article>
          ))
        )}
      </motion.div>

      {/* Review Modal */}
      <AnimatePresence>
        {reviewModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-backdrop backdrop-blur-xs p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md rounded-2xl border border-border bg-background p-6 shadow-xl"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-black">Review Service</h3>
                <Button variant="ghost" size="icon" onClick={() => setReviewModal(null)}>
                  <X />
                </Button>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                How was your experience with {reviewModal.provider}?
              </p>
              <div className="mt-5 flex gap-2 justify-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="p-1 transition-transform hover:scale-110"
                  >
                    <Star
                      className={`size-8 ${
                        star <= rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground"
                      }`}
                    />
                  </button>
                ))}
              </div>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share details of your experience (quality, punctuality, professionalism)..."
                className="mt-5"
              />
              <div className="mt-6 flex justify-end gap-2">
                <Button variant="outline" onClick={() => setReviewModal(null)}>
                  Cancel
                </Button>
                <Button onClick={handleReviewSubmit}>Submit Review</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Dispute Modal */}
      <AnimatePresence>
        {disputeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-backdrop backdrop-blur-xs p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md rounded-2xl border border-border bg-background p-6 shadow-xl"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-black">Raise Dispute</h3>
                <Button variant="ghost" size="icon" onClick={() => setDisputeModal(null)}>
                  <X />
                </Button>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Our support team will investigate and help resolve the issue.
              </p>
              <div className="mt-4">
                <label className="text-xs font-bold uppercase text-muted-foreground">Reason</label>
                <select
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  className="mt-1 w-full rounded-md border border-input bg-background p-2 text-sm font-semibold"
                >
                  <option value="Poor Service">Poor Service</option>
                  <option value="Incomplete Service">Incomplete Service</option>
                  <option value="Incorrect Charge">Incorrect Charge</option>
                  <option value="Provider No-show">Provider No-show</option>
                  <option value="Damaged Property">Damaged Property</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="mt-4">
                <label className="text-xs font-bold uppercase text-muted-foreground">Description</label>
                <Textarea
                  value={disputeDesc}
                  onChange={(e) => setDisputeDesc(e.target.value)}
                  placeholder="Describe what went wrong in detail..."
                  className="mt-1"
                />
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDisputeModal(null)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDisputeSubmit}>
                  Submit Dispute
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Invoice Modal */}
      <AnimatePresence>
        {invoiceModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-backdrop backdrop-blur-xs p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md rounded-2xl border border-border bg-background p-6 shadow-xl"
            >
              <div className="flex justify-between items-center border-b border-border pb-4">
                <div>
                  <h3 className="text-xl font-black">AtDoor Invoice</h3>
                  <p className="text-xs text-muted-foreground">Booking Ref: {invoiceModal.id}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setInvoiceModal(null)}>
                  <X />
                </Button>
              </div>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Service Name</span>
                  <span className="font-bold">{invoiceModal.service}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Provider</span>
                  <span className="font-bold">{invoiceModal.provider}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Service Base Price</span>
                  <span className="font-bold">₹{invoiceModal.price}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Platform / Visit Fee</span>
                  <span className="font-bold">₹0</span>
                </div>
                <div className="flex justify-between border-t border-border pt-3 text-base">
                  <span className="font-black">Total Paid</span>
                  <span className="font-black text-primary">₹{invoiceModal.price}</span>
                </div>
                <div className="rounded-lg bg-muted p-2.5 text-xs text-center text-muted-foreground">
                  Status: <strong className="text-emerald-600">PAID & VERIFIED</strong> via AtDoor Secure Gateway
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <Button onClick={() => setInvoiceModal(null)}>Close</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
