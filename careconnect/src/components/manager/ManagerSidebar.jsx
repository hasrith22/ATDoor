import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  BookOpen,
  CalendarRange,
  ChartNoAxesCombined,
  CircleHelp,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  PanelsTopLeft,
  ShieldAlert,
  Star,
  UsersRound,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RoleSwitcher } from "./RoleSwitcher";
import { useAuth } from "@/context/AuthContext";
import { ManagerSettingsModal } from "./ManagerSettingsModal";

export const managerNav = [
  { to: "/manager", label: "Overview", icon: LayoutDashboard },
  { to: "/manager/operations", label: "Operations", icon: PanelsTopLeft },
  { to: "/manager/bookings", label: "Bookings", icon: BookOpen },
  { to: "/manager/providers", label: "Providers", icon: UsersRound },
  { to: "/manager/assignments", label: "Assignments", icon: ClipboardList },
  { to: "/manager/schedule", label: "Schedule", icon: CalendarRange },
  { to: "/manager/escalations", label: "Escalations", icon: ShieldAlert },
  { to: "/manager/quality", label: "Service Quality", icon: Star },
  { to: "/manager/analytics", label: "Analytics", icon: ChartNoAxesCombined },
];

function SidebarContent({ close, onOpenSettings }) {
  const location = useLocation();
  const path = location.pathname;
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    if (close) close();
    logout();
    navigate("/login");
  };

  return (
    <div className="flex h-full flex-col bg-sidebar">
      <div className="flex h-18 items-center justify-between border-b border-sidebar-border px-5">
        <Link to="/manager" className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-md bg-primary text-sm font-black text-primary-foreground">
            A
          </span>
          <div>
            <span className="block text-lg font-black text-foreground">AtDoor</span>
            <span className="block text-[10px] font-bold uppercase text-muted-foreground">Operations</span>
          </div>
        </Link>
        {close && (
          <Button variant="ghost" size="icon" onClick={close}>
            <X />
          </Button>
        )}
      </div>

      <div className="px-3 py-4">
        <RoleSwitcher compact />
      </div>

      <nav className="flex-1 overflow-y-auto px-3">
        {managerNav.map((item) => {
          const active = item.to === "/manager" ? path === "/manager" : path.startsWith(item.to);
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={close}
              className={`relative mb-1 flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-bold transition-colors ${
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
              }`}
            >
              {active && (
                <motion.span
                  layoutId="manager-nav-indicator"
                  className="absolute -left-1 h-5 w-0.5 rounded-full bg-primary-foreground"
                />
              )}
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-1 border-t border-sidebar-border p-3">
        <Link
          to="/manager/help"
          onClick={close}
          className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-bold text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
        >
          <CircleHelp className="size-4" />
          Help
        </Link>

        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-bold text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="size-4" />
          Logout
        </button>

        <div
          onClick={onOpenSettings}
          className="mt-2 flex cursor-pointer items-center gap-3 rounded-xl bg-sidebar-accent p-3 transition hover:opacity-90"
          title="Click to view Account Settings"
        >
          <span className="flex size-9 items-center justify-center rounded-full bg-primary text-xs font-black text-primary-foreground">
            OM
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-black text-foreground">{user?.name || "Operations Manager"}</p>
            <p className="truncate text-xs text-muted-foreground">{user?.email || "AtDoor Operations"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ManagerSidebar({ mobileOpen, onClose }) {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-64 border-r border-sidebar-border lg:block">
        <SidebarContent onOpenSettings={() => setSettingsOpen(true)} />
      </aside>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-[65] bg-backdrop/60 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={(e) => e.target === e.currentTarget && onClose()}
          >
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              className="h-full w-[min(19rem,88vw)]"
            >
              <SidebarContent close={onClose} onOpenSettings={() => setSettingsOpen(true)} />
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      <ManagerSettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        defaultTab="profile"
      />
    </>
  );
}
