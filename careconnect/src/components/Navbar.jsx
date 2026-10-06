import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Bell,
  Bookmark,
  ChevronDown,
  CircleHelp,
  CreditCard,
  Headphones,
  History,
  LogIn,
  LogOut,
  Menu,
  User,
  X,
} from "lucide-react";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { BiSolidDashboard } from "react-icons/bi";
import { FaCalendarCheck, FaHandsHelping, FaTools } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { FluidTabs } from "@/components/ui/fluid-tabs";
import { RoleSwitcher } from "@/components/manager/RoleSwitcher";
import { notifications } from "@/data/mockData";
import { useAuth } from "@/context/AuthContext";

const nav = [
  { id: "/", to: "/", label: "Dashboard", icon: <BiSolidDashboard size={19} /> },
  { id: "/bookings", to: "/bookings", label: "My Bookings", icon: <FaCalendarCheck size={17} /> },
  { id: "/services", to: "/services", label: "Services", icon: <FaTools size={17} /> },
  { id: "/help", to: "/help", label: "Help", icon: <FaHandsHelping size={18} /> },
];

export function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const path = location.pathname;
  const navigate = useNavigate();
  const [mobile, setMobile] = useState(false);
  const [panel, setPanel] = useState(null);

  const getInitials = (name) => {
    if (!name) return "HR";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const handleAction = (label) => {
    setPanel(null);
    if (label === "Logout") {
      logout();
      navigate("/login");
    } else if (label === "My Bookings") {
      navigate("/bookings");
    } else if (label === "Help & Support") {
      navigate("/help");
    } else if (label === "Sign In / Switch") {
      navigate("/login");
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2" aria-label="AtDoor dashboard">
          <span className="flex size-9 items-center justify-center rounded-md bg-primary text-sm font-black text-primary-foreground">
            A
          </span>
          <span className="text-xl font-black tracking-normal">AtDoor</span>
        </Link>
        <nav className="hidden md:block" aria-label="Primary navigation">
          <FluidTabs tabs={nav} active={path} onChange={(to) => navigate(to)} layoutId="navbar-active-pill" />
        </nav>
        <div className="flex items-center gap-2">
          <div className="hidden lg:block">
            <RoleSwitcher />
          </div>
          <div className="relative">
            <Button
              size="icon"
              variant="ghost"
              aria-label="Notifications"
              onClick={() => setPanel(panel === "notifications" ? null : "notifications")}
            >
              <Bell />
              <span className="absolute right-2 top-2 size-2 rounded-full bg-status" />
            </Button>
            <AnimatePresence>
              {panel === "notifications" && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="absolute right-0 top-12 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-border bg-popover shadow-panel z-50"
                >
                  <div className="flex items-center justify-between border-b border-border p-4">
                    <h3 className="font-bold">Notifications</h3>
                    <span className="text-xs text-muted-foreground">Real-time alerts</span>
                  </div>
                  {notifications.map((item, index) => (
                    <div key={index} className="flex gap-3 border-b border-border p-4 last:border-0">
                      <span className={`mt-1.5 size-2 shrink-0 rounded-full ${item.unread ? "bg-primary" : "bg-border"}`} />
                      <div>
                        <p className="text-sm font-medium">{item.text}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{item.time}</p>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="relative hidden sm:block">
            {user ? (
              <>
                <Button
                  variant="ghost"
                  className="h-11 gap-2 px-2"
                  onClick={() => setPanel(panel === "profile" ? null : "profile")}
                >
                  <span className="flex size-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {getInitials(user.name)}
                  </span>
                  <span className="hidden text-left lg:block">
                    <span className="block text-sm font-bold">{user.name}</span>
                    <span className="block text-[11px] text-muted-foreground capitalize">
                      {user.role?.toLowerCase().replace("_", " ")}
                    </span>
                  </span>
                  <ChevronDown className="size-4 opacity-50" />
                </Button>
                <AnimatePresence>
                  {panel === "profile" && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="absolute right-0 top-13 w-64 rounded-xl border border-border bg-popover p-2 shadow-panel z-50"
                    >
                      <div className="border-b border-border px-3 py-3">
                        <p className="font-bold text-foreground">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                        <span className="mt-1.5 inline-block rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary uppercase">
                          {user.role}
                        </span>
                      </div>
                      {[
                        [Bookmark, "My Bookings"],
                        [Headphones, "Help & Support"],
                        [LogOut, "Logout"],
                      ].map(([Icon, label]) => (
                        <button
                          key={label}
                          onClick={() => handleAction(label)}
                          className={`flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm font-medium hover:bg-accent ${
                            label === "Logout" ? "text-destructive hover:bg-destructive/10 font-bold" : ""
                          }`}
                        >
                          <Icon className="size-4" />
                          {label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            ) : (
              <Button onClick={() => navigate("/login")} className="font-bold shadow-xs">
                <LogIn className="size-4" /> Sign In
              </Button>
            )}
          </div>
          <Button
            className="md:hidden"
            size="icon"
            variant="ghost"
            onClick={() => setMobile(!mobile)}
            aria-label="Toggle menu"
          >
            {mobile ? <X /> : <Menu />}
          </Button>
        </div>
      </div>
      <AnimatePresence>
        {mobile && (
          <motion.nav
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            className="overflow-hidden border-t border-border bg-background md:hidden"
          >
            <div className="space-y-1 p-4">
              {nav.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobile(false)}
                  className={`block rounded-md px-4 py-3 font-semibold ${
                    path === item.to ? "bg-primary text-primary-foreground" : "hover:bg-accent"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <div className="pt-3">
                <RoleSwitcher compact />
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
