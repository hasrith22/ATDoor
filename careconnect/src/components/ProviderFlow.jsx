import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, BadgeCheck, Check, CheckCircle2, Clock3, Search, ShieldCheck, Sparkles, Star, Wrench, X, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProviderCarousel } from "@/components/ui/provider-carousel";
import { providers as fallbackProviders } from "@/data/mockData";
import { providersApi } from "@/api/providers";
import { bookingsApi } from "@/api/bookings";
import { useAuth } from "@/context/AuthContext";
import arjunImage from "@/assets/providers/provider-arjun.jpg";
import raviImage from "@/assets/providers/provider-ravi.jpg";
import sureshImage from "@/assets/providers/provider-suresh.jpg";

// Curated verified specialists for instant matching
const verifiedSpecialists = [
  {
    id: "PR-ARJUN-01",
    name: "Arjun Services",
    service: "Senior Licensed Electrician & Rewiring Expert",
    categorySlug: "electrical",
    skills: ["Electrician", "Wiring Specialist", "Appliance Technician"],
    rating: 4.9,
    reviews: 1542,
    availability: "Available now",
    price: 449,
    response: "Responds in 5 min",
    experience: "8+ years",
    image: arjunImage,
    matchScore: 99,
    reasons: [
      "Government-licensed electrical contractor with 8+ years experience",
      "Specialized in switchboard burnout, MCB replacement & short circuit repairs",
      "Emergency response equipped with certified circuit testers",
    ],
  },
  {
    id: "PR-IMRAN-02",
    name: "Imran Shaikh",
    service: "Certified Electrical & Hazard Specialist",
    categorySlug: "electrical",
    skills: ["Electrician", "Wiring Specialist"],
    rating: 4.8,
    reviews: 984,
    availability: "Available now",
    price: 499,
    response: "Responds in 10 min",
    experience: "6+ years",
    image: raviImage,
    matchScore: 95,
    reasons: [
      "Top-rated professional for domestic wiring & power surges",
      "Carries genuine high-load switches, sockets and breakers",
      "100% on-time completion record in Bengaluru",
    ],
  },
  {
    id: "PR-RAVI-03",
    name: "Ravi Kumar",
    service: "Plumbing Specialist",
    categorySlug: "plumbing",
    skills: ["Plumber", "Pipe & Fitting Expert"],
    rating: 4.8,
    reviews: 1284,
    availability: "Available now",
    price: 499,
    response: "Responds in 5 min",
    experience: "6+ years",
    image: raviImage,
    matchScore: 92,
    reasons: ["Certified master plumber", "Prompt leak detection and piping overhaul"],
  },
  {
    id: "PR-SURESH-04",
    name: "Suresh Reddy",
    service: "Home Cooling Expert",
    categorySlug: "ac-cooling",
    skills: ["AC Technician", "HVAC Specialist"],
    rating: 4.7,
    reviews: 923,
    availability: "Next day",
    price: 599,
    response: "Responds in 8 min",
    experience: "5+ years",
    image: sureshImage,
    matchScore: 90,
    reasons: ["Inverter AC specialist", "Coil cleaning and compressor check"],
  },
];

export function ProviderFlow({ visible = true, aiDiagnosis = null, onClearAi, onSuccess }) {
  const { user } = useAuth();
  const [providerList, setProviderList] = useState(verifiedSpecialists);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("recommended");
  const [modal, setModal] = useState(null);
  const [provider, setProvider] = useState(verifiedSpecialists[0]);
  const [agreed, setAgreed] = useState(false);
  const [bookingResult, setBookingResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load providers from backend or AI recommendation
  useEffect(() => {
    let mounted = true;

    if (aiDiagnosis?.categorySlug || aiDiagnosis?.categoryId || aiDiagnosis?.requiredSkills) {
      // Try AI recommended providers API first
      providersApi
        .getRecommended({
          categoryId: aiDiagnosis.categoryId,
          requiredSkills: aiDiagnosis.requiredSkills || [],
        })
        .then((res) => {
          if (mounted && res?.data && res.data.length > 0) {
            const mapped = res.data.map((rec) => {
              const p = rec.provider || rec;
              return {
                id: p.id || p._id,
                name: p.name,
                service: p.title || `${aiDiagnosis.categoryName} Specialist`,
                rating: p.rating || 4.8,
                reviews: p.totalReviews || 120,
                availability: "Available now",
                price: p.basePrice || rec.estimatedPrice || 449,
                response: p.responseTime || "Responds in 5-10 min",
                experience: `${p.experienceYears || 6}+ years`,
                image: p.avatar || arjunImage,
                matchScore: rec.matchScore || 96,
                reasons: rec.reasons || ["Verified specialist with matching certifications"],
                raw: p,
              };
            });
            setProviderList(mapped);
            setProvider(mapped[0]);
            return;
          }
          // If no backend AI providers returned, filter verified specialists
          applyLocalCategoryFilter();
        })
        .catch(() => {
          if (mounted) applyLocalCategoryFilter();
        });
    } else {
      // Load standard providers list
      providersApi
        .getAll({ limit: 12 })
        .then((res) => {
          if (mounted && res?.data && res.data.length > 0) {
            const mapped = res.data.map((p, idx) => {
              const fallback = verifiedSpecialists[idx % verifiedSpecialists.length];
              return {
                id: p.user?._id || p._id || fallback.id,
                name: p.user?.name || fallback.name,
                service: p.title || fallback.service,
                rating: p.rating || fallback.rating,
                reviews: p.totalReviews || fallback.reviews,
                availability: p.isAvailable ? "Available now" : "Next day",
                price: p.basePrice || fallback.price,
                response: p.responseTime || fallback.response,
                experience: `${p.experienceYears || 5}+ years`,
                image: p.user?.avatar || fallback.image,
                matchScore: fallback.matchScore,
                reasons: fallback.reasons,
                raw: p,
              };
            });
            setProviderList(mapped);
            setProvider(mapped[0]);
          } else if (mounted) {
            setProviderList(verifiedSpecialists);
            setProvider(verifiedSpecialists[0]);
          }
        })
        .catch(() => {
          if (mounted) {
            setProviderList(verifiedSpecialists);
            setProvider(verifiedSpecialists[0]);
          }
        });
    }

    function applyLocalCategoryFilter() {
      const cat = (aiDiagnosis?.categorySlug || aiDiagnosis?.categoryName || "").toLowerCase();
      let filtered = verifiedSpecialists.filter(
        (p) =>
          (p.categorySlug && p.categorySlug.includes(cat)) ||
          p.service.toLowerCase().includes(cat) ||
          p.skills.some((s) => s.toLowerCase().includes(cat))
      );
      if (filtered.length === 0) {
        filtered = verifiedSpecialists;
      }
      setProviderList(filtered);
      setProvider(filtered[0]);
    }

    return () => {
      mounted = false;
    };
  }, [aiDiagnosis]);

  const shown = useMemo(() => {
    let rows = providerList.filter(
      (p) =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.service.toLowerCase().includes(query.toLowerCase())
    );
    if (sort === "rating") rows.sort((a, b) => b.rating - a.rating);
    if (sort === "price") rows.sort((a, b) => a.price - b.price);
    if (sort === "recommended") rows.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
    return rows;
  }, [providerList, query, sort]);

  const open = (kind, item) => {
    setProvider(item);
    setModal(kind);
    setAgreed(false);
  };

  const handleConfirmBooking = async () => {
    setIsSubmitting(true);
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
    const serviceName = aiDiagnosis
      ? `${aiDiagnosis.categoryName} Repair: ${aiDiagnosis.possibleIssues?.[0] || "Issue Resolution"}`
      : provider.service || "Home Service Repair";
    const generatedNum = "ATD-" + new Date().getFullYear() + "-" + Math.floor(10000 + Math.random() * 90000);

    let createdBooking = {
      id: generatedNum,
      bookingNumber: generatedNum,
      rawId: "local-" + Date.now(),
      service: serviceName,
      provider: provider.name,
      status: "Confirmed",
      note: "Your appointment is confirmed with " + provider.name,
      date: "Tomorrow",
      scheduledDate: tomorrow,
      time: "10:00 AM",
      scheduledTime: "10:00 AM",
      price: provider.price || 449,
      eta: "Tomorrow at 10:00 AM",
      createdAt: new Date().toISOString(),
    };

    try {
      const res = await bookingsApi.create({
        providerId: provider.id,
        serviceName,
        scheduledDate: tomorrow,
        scheduledTime: "10:00 AM",
        price: provider.price || 449,
        urgency: aiDiagnosis?.urgency || "medium",
        address: {
          addressLine: "Flat 402, Green Glen Layout",
          area: "Bellandur",
          city: "Bengaluru",
          pincode: "560103",
        },
        notes: aiDiagnosis
          ? `Diagnosed by AtDoor AI: ${aiDiagnosis.possibleIssues?.join(", ")}. Urgency: ${aiDiagnosis.urgency}`
          : "Booking created via AtDoor instant match.",
      });

      if (res?.data) {
        createdBooking = {
          ...createdBooking,
          id: res.data.bookingNumber || createdBooking.id,
          bookingNumber: res.data.bookingNumber || createdBooking.bookingNumber,
          rawId: res.data._id || createdBooking.rawId,
        };
      }
    } catch (err) {
      console.warn("Backend booking API note (saved locally):", err.message);
    } finally {
      // Always store locally so user immediately sees their booking in My Bookings
      try {
        const stored = JSON.parse(localStorage.getItem("atdoor_user_bookings") || "[]");
        const updated = [createdBooking, ...stored.filter((b) => b.id !== createdBooking.id)];
        localStorage.setItem("atdoor_user_bookings", JSON.stringify(updated));
      } catch (storageErr) {
        console.warn("Storage write note:", storageErr);
      }

      setBookingResult(createdBooking);
      setModal("success");
      setIsSubmitting(false);
    }
  };

  if (!visible) return null;

  return (
    <section id="providers" className="scroll-mt-24 py-16">
      {/* AI Matched Providers Banner */}
      {aiDiagnosis && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 rounded-2xl border border-primary/40 bg-primary/5 p-5 shadow-sm"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground font-black text-sm shadow-xs">
                <Zap className="size-5" />
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-black text-foreground">
                    Verified {aiDiagnosis.categoryName} Specialists
                  </h3>
                  <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                    {aiDiagnosis.confidence}% Match
                  </span>
                  {aiDiagnosis.urgency === "high" && (
                    <span className="rounded-full bg-destructive/15 px-2.5 py-0.5 text-xs font-bold text-destructive">
                      Emergency High Priority
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  AI Solution: <strong>{aiDiagnosis.possibleIssues?.[0]}</strong> · Required:{" "}
                  {aiDiagnosis.requiredSkills?.join(", ")}
                </p>
              </div>
            </div>
            {onClearAi && (
              <Button variant="outline" size="sm" onClick={onClearAi} className="shrink-0 text-xs font-bold">
                <X className="size-3.5 mr-1" /> View All Services
              </Button>
            )}
          </div>
        </motion.div>
      )}

      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="eyebrow">
            {aiDiagnosis ? "AI RECOMMENDED TECHNICIANS" : "SMART MATCHES"}
          </p>
          <h2 className="section-title">
            {aiDiagnosis ? `Recommended ${aiDiagnosis.categoryName} Providers` : "Recommended Providers"}
          </h2>
          <p className="section-copy">
            {aiDiagnosis
              ? "Verified professionals matched with the exact skills needed to resolve your diagnosed issue safely."
              : "Based on your service, location, availability, ratings and pricing."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="relative min-w-52 flex-1">
            <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search providers or skills"
              className="pl-9"
            />
          </div>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-48 font-semibold">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recommended">Best AI Match</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
              <SelectItem value="price">Price: Low to High</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-8">
        <ProviderCarousel
          providers={shown}
          onDetails={(item) => open("details", item)}
          onBook={(item) => open("booking", item)}
          onSelect={(item) => open("details", item)}
        />
      </div>

      <AnimatePresence>
        {modal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-backdrop p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-panel sm:p-8"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setModal(null)}
                className="absolute right-4 top-4"
                aria-label="Close"
              >
                <X />
              </Button>
              {modal === "details" && (
                <ProviderDetails
                  provider={provider}
                  aiDiagnosis={aiDiagnosis}
                  onBook={() => setModal("booking")}
                />
              )}
              {modal === "booking" && (
                <BookingConfirm
                  provider={provider}
                  aiDiagnosis={aiDiagnosis}
                  agreed={agreed}
                  setAgreed={setAgreed}
                  isSubmitting={isSubmitting}
                  onBack={() => setModal("details")}
                  onConfirm={handleConfirmBooking}
                />
              )}
              {modal === "success" && (
                <BookingSuccess
                  provider={provider}
                  bookingResult={bookingResult}
                  aiDiagnosis={aiDiagnosis}
                  onDone={() => {
                    setModal(null);
                    onSuccess?.();
                  }}
                />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function ProviderDetails({ provider, aiDiagnosis, onBook }) {
  return (
    <div>
      <div className="flex gap-4">
        <img
          src={provider.image}
          alt={provider.name}
          className="size-20 rounded-xl object-cover"
        />
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black">{provider.name}</h2>
            <ShieldCheck className="size-5 text-primary" />
          </div>
          <p className="text-muted-foreground font-semibold text-sm">{provider.service}</p>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
            <span className="flex items-center gap-1 font-bold text-amber-500">
              <Star className="size-4 fill-amber-500" />
              {provider.rating}
            </span>
            <span className="text-muted-foreground">({provider.reviews} reviews)</span>
            <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
              {provider.experience}
            </span>
          </div>
        </div>
      </div>

      {aiDiagnosis && (
        <div className="mt-6 rounded-xl border border-primary/30 bg-primary/5 p-4 text-xs">
          <p className="font-bold text-primary uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="size-3.5" /> AI Recommended Match For
          </p>
          <p className="mt-1 font-extrabold text-foreground text-sm">
            {aiDiagnosis.categoryName}: {aiDiagnosis.possibleIssues?.[0]}
          </p>
          <p className="text-muted-foreground mt-0.5">
            This verified specialist is certified to resolve high-urgency electrical and wiring safety issues.
          </p>
        </div>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl bg-muted p-4">
          <h3 className="font-black text-sm text-foreground">Why this provider?</h3>
          <ul className="mt-3 space-y-2 text-xs">
            {(provider.reasons || [
              "Certified trade license",
              "Top customer rating in your locality",
              "Carries safety-tested genuine components",
              "Rapid dispatch capability",
            ]).map((r) => (
              <li key={r} className="flex items-start gap-2">
                <Check className="size-3.5 shrink-0 text-primary mt-0.5" />
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl bg-muted p-4">
          <h3 className="font-black text-sm text-foreground">Service guarantees</h3>
          <ul className="mt-3 space-y-2 text-xs">
            {[
              "Complete safety inspection & root-cause test",
              "30-day comprehensive rework warranty",
              "Clean-up & debris removal after fix",
              "Clear upfront pricing with no hidden charges",
            ].map((g) => (
              <li key={g} className="flex items-start gap-2">
                <BadgeCheck className="size-3.5 shrink-0 text-primary mt-0.5" />
                <span>{g}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between border-t border-border pt-5">
        <div>
          <p className="text-xs text-muted-foreground uppercase font-bold">Base visit charge</p>
          <p className="text-2xl font-black text-foreground">₹{provider.price}</p>
        </div>
        <Button size="lg" className="font-bold shadow-sm" onClick={onBook}>
          Book This Provider
        </Button>
      </div>
    </div>
  );
}

function BookingConfirm({ provider, aiDiagnosis, agreed, setAgreed, isSubmitting, onBack, onConfirm }) {
  const serviceName = aiDiagnosis
    ? `${aiDiagnosis.categoryName} Repair: ${aiDiagnosis.possibleIssues?.[0] || "Issue Resolution"}`
    : provider.service || "Electrical Repair";

  return (
    <div>
      <Button variant="ghost" size="sm" onClick={onBack} className="mb-4">
        <ArrowLeft className="size-4 mr-1" /> Back
      </Button>
      <h2 className="text-2xl font-black">Confirm Booking</h2>
      <p className="mt-1 text-sm text-muted-foreground">Review visit details before dispatching the technician.</p>

      <dl className="mt-5 grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2">
        {[
          ["Service Requested", serviceName],
          ["Assigned Specialist", provider.name],
          ["Technician Rating", `${provider.rating} ★ (${provider.experience})`],
          ["Date & Time", "Tomorrow · 10:00 AM"],
          ["Service Address", "Flat 402, Green Glen Layout, Bengaluru"],
          ["Base Service Charge", `₹${provider.price}`],
        ].map(([k, v]) => (
          <div className="bg-card p-3.5" key={k}>
            <dt className="text-[11px] font-bold uppercase text-muted-foreground">{k}</dt>
            <dd className="mt-1 text-sm font-black text-foreground">{v}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-5 flex items-start gap-3 rounded-xl border border-border bg-muted/40 p-4">
        <Checkbox id="terms" checked={agreed} onCheckedChange={setAgreed} className="mt-0.5" />
        <label htmlFor="terms" className="text-xs text-muted-foreground cursor-pointer">
          I authorize AtDoor verified technician to inspect the premises. I understand that replacement parts (switchboard, socket, MCB) are billed transparently after agreement on-site.
        </label>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <Button variant="outline" onClick={onBack}>
          Cancel
        </Button>
        <Button
          disabled={!agreed || isSubmitting}
          onClick={onConfirm}
          className="font-bold shadow-sm"
        >
          {isSubmitting ? "Dispatching..." : "Confirm & Book Specialist"}
        </Button>
      </div>
    </div>
  );
}

function BookingSuccess({ provider, bookingResult, aiDiagnosis, onDone }) {
  const navigate = useNavigate();

  return (
    <div className="text-center py-4">
      <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
        <CheckCircle2 className="size-10" />
      </div>
      <h2 className="mt-4 text-2xl font-black">Booking Confirmed!</h2>
      <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
        Your booking <strong>{bookingResult?.bookingNumber || bookingResult?.id || "ATD-2026-9021"}</strong> with{" "}
        <strong>{provider.name}</strong> has been successfully placed.
      </p>

      {aiDiagnosis && (
        <div className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2 text-xs font-bold text-primary">
          <Zap className="size-4" />
          <span>Specialist dispatched for {aiDiagnosis.categoryName} emergency resolution</span>
        </div>
      )}

      <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
        <Button
          size="lg"
          className="font-bold shadow-sm flex-1"
          onClick={() => {
            onDone();
            navigate({ to: "/bookings" });
          }}
        >
          View My Bookings
        </Button>
        <Button size="lg" variant="outline" className="font-bold flex-1" onClick={onDone}>
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
}
