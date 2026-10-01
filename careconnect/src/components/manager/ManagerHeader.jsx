import { useNavigate, useRouterState } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { Bell, ChevronDown, HelpCircle, LogOut, Menu, Search, Settings, User } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useManager } from "./ManagerContext";
import { NotificationPanel } from "./NotificationPanel";
import { ManagerSettingsModal } from "./ManagerSettingsModal";
import { useAuth } from "@/context/AuthContext";

const meta = {
  "/manager": ["Operations Overview", "Monitor today's service activity and resolve issues."],
  "/manager/operations": ["Live Operations", "Track every active service job in one view."],
  "/manager/bookings": ["Bookings", "Search, filter, and manage the booking lifecycle."],
  "/manager/providers": ["Providers", "Monitor capacity, availability, and field performance."],
  "/manager/assignments": ["Assignments", "Match unassigned requests with available professionals."],
  "/manager/schedule": ["Schedule", "Coordinate daily visits and resolve timing conflicts."],
  "/manager/escalations": ["Escalations", "Investigate operational issues and document resolutions."],
  "/manager/quality": ["Service Quality", "Track the standards customers experience every day."],
  "/manager/analytics": ["Operations Analytics", "Understand volume, speed, utilization, and outcomes."],
  "/manager/help": ["Operations Help", "Find guidance for common manager workflows."],
};

export function ManagerHeader({ onMenu }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [panel, setPanel] = useState(null); // null | "notes" | "profile"
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState("profile");
  const [query, setQuery] = useState("");
  const { bookings, providers, setSelectedBooking, setSelectedProvider } = useManager();
  const [title, subtitle] = meta[path] || meta["/manager"];

  const results = useMemo(() => {
    if (query.trim().length < 2) return [];
    const q = query.toLowerCase();
    return [
      ...bookings
        .filter((x) => Object.values(x).some((v) => String(v).toLowerCase().includes(q)))
        .map((x) => ({
          type: "Booking",
          title: x.id,
          sub: `${x.customer} · ${x.service} · ${x.status}`,
          item: x,
        })),
      ...providers
        .filter((x) => `${x.name} ${x.skills.join(" ")}`.toLowerCase().includes(q))
        .map((x) => ({
          type: "Provider",
          title: x.name,
          sub: `${x.skills.join(", ")} · ${x.status}`,
          item: x,
        })),
    ].slice(0, 6);
  }, [query, bookings, providers]);

  const handleDropdownAction = (label) => {
    setPanel(null);
    if (label === "Logout") {
      logout();
      navigate({ to: "/login" });
    } else if (label === "Profile") {
      setSettingsTab("profile");
      setSettingsOpen(true);
    } else if (label === "Account Settings") {
      setSettingsTab("settings");
      setSettingsOpen(true);
    } else if (label === "Notifications") {
      setPanel("notes");
    } else if (label === "Help") {
      navigate({ to: "/manager/help" });
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 px-4 backdrop-blur sm:px-6">
        <div className="flex min-h-18 items-center gap-4">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenu}>
            <Menu />
          </Button>

          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-black">{title}</h1>
            <p className="hidden truncate text-xs text-muted-foreground sm:block">{subtitle}</p>
          </div>

          <div className="relative hidden w-full max-w-sm md:block">
            <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search booking, customer, provider..."
              className="pl-9"
            />
            {results.length > 0 && (
              <div className="absolute top-11 w-full rounded-lg border border-border bg-popover p-2 shadow-panel z-50">
                {results.map((r, i) => (
                  <button
                    key={r.type + r.title + i}
                    onClick={() => {
                      if (r.type === "Booking") setSelectedBooking(r.item);
                      else setSelectedProvider(r.item);
                      setQuery("");
                    }}
                    className="block w-full rounded-md px-3 py-2 text-left hover:bg-accent"
                  >
                    <span className="text-[10px] font-bold uppercase text-muted-foreground">{r.type}</span>
                    <p className="text-sm font-bold">{r.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{r.sub}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notifications Button */}
          <div className="relative">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setPanel(panel === "notes" ? null : "notes")}
              aria-label="Notifications"
            >
              <Bell />
              <span className="absolute right-1.5 top-1.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[9px] font-black text-primary-foreground">
                4
              </span>
            </Button>
            <AnimatePresence>{panel === "notes" && <NotificationPanel />}</AnimatePresence>
          </div>

          {/* Profile Dropdown */}
          <div className="relative">
            <Button
              variant="ghost"
              className="gap-2 px-2"
              onClick={() => setPanel(panel === "profile" ? null : "profile")}
            >
              <span className="flex size-8 items-center justify-center rounded-full bg-primary text-xs font-black text-primary-foreground">
                OM
              </span>
              <span className="hidden text-left xl:block">
                <span className="block text-xs font-black">{user?.name || "Operations Manager"}</span>
                <span className="block text-[10px] text-muted-foreground">AtDoor Operations</span>
              </span>
              <ChevronDown className="size-4" />
            </Button>

            <AnimatePresence>
              {panel === "profile" && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="absolute right-0 top-12 w-64 rounded-xl border border-border bg-popover p-2 shadow-panel z-50"
                >
                  <div className="border-b border-border p-3">
                    <p className="font-black text-foreground">{user?.name || "Operations Manager"}</p>
                    <p className="text-xs text-muted-foreground">{user?.email || "operations@atdoor.com"}</p>
                    <span className="mt-1 inline-block rounded bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary uppercase">
                      Operations Manager
                    </span>
                  </div>

                  <div className="space-y-0.5 py-1">
                    {[
                      [User, "Profile"],
                      [Settings, "Account Settings"],
                      [Bell, "Notifications"],
                      [HelpCircle, "Help"],
                      [LogOut, "Logout"],
                    ].map(([Icon, label]) => (
                      <button
                        key={label}
                        onClick={() => handleDropdownAction(label)}
                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition-colors hover:bg-accent text-foreground ${
                          label === "Logout" ? "text-destructive hover:bg-destructive/10 font-bold" : ""
                        }`}
                      >
                        <Icon className="size-4" />
                        {label}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Global Settings & Profile Modal */}
      <ManagerSettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        defaultTab={settingsTab}
      />
    </>
  );
}
