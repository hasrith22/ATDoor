import { useNavigate, useRouterState } from "@tanstack/react-router";
import {
  BriefcaseBusiness,
  ChevronDown,
  Headphones,
  LogIn,
  LogOut,
  ShieldAlert,
  UserCheck,
  UserRound,
  Wrench,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

const workspaces = [
  { id: "customer", role: "CUSTOMER", label: "Customer Experience", icon: UserRound, to: "/" },
  { id: "provider", role: "PROVIDER", label: "Service Provider", icon: Wrench, to: "/provider" },
  { id: "manager", role: "OPERATIONS_MANAGER", label: "Operations Manager", icon: BriefcaseBusiness, to: "/manager" },
  { id: "support", role: "SUPPORT_AGENT", label: "Support Agent", icon: Headphones, to: "/support" },
  { id: "admin", role: "ADMIN", label: "Platform Admin", icon: ShieldAlert, to: "/admin" },
];

const roleCredentials = {
  ADMIN: { email: "admin@atdoor.com", pass: "Admin@123" },
  OPERATIONS_MANAGER: { email: "operations@atdoor.com", pass: "Ops@123" },
  PROVIDER: { email: "provider1@atdoor.com", pass: "Provider@123" },
  SUPPORT_AGENT: { email: "support@atdoor.com", pass: "Support@123" },
  CUSTOMER: { email: "customer@atdoor.com", pass: "Customer@123" },
};

export function RoleSwitcher({ compact = false }) {
  const navigate = useNavigate();
  const { user, isAuthenticated, login, logout } = useAuth();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const [switching, setSwitching] = useState(false);

  const currentWorkspace =
    workspaces.find((w) => (w.to === "/" ? path === "/" : path.startsWith(w.to))) || workspaces[0];
  const Icon = currentWorkspace.icon;

  const handleNavigate = async (ws) => {
    setOpen(false);
    // If current authenticated session does not match target workspace role, switch session
    if (!user || user.role !== ws.role) {
      const cred = roleCredentials[ws.role];
      if (cred) {
        setSwitching(true);
        try {
          await login(cred.email, cred.pass);
        } catch (e) {
          console.warn("Session auto-sync note:", e);
        } finally {
          setSwitching(false);
        }
      }
    }
    navigate({ to: ws.to });
  };

  const handleLogout = () => {
    setOpen(false);
    logout();
    navigate({ to: "/login" });
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        className={`justify-between ${compact ? "w-full" : "min-w-48"} bg-background font-bold shadow-xs`}
        onClick={() => setOpen(!open)}
        disabled={switching}
      >
        <span className="flex items-center gap-2">
          <Icon className="size-4 text-primary" />
          <span>{switching ? "Switching role..." : currentWorkspace.label}</span>
        </span>
        <ChevronDown className="size-4 opacity-50" />
      </Button>

      {open && (
        <div className="absolute right-0 z-[70] mt-2 w-72 rounded-xl border border-border bg-popover p-2 shadow-xl animate-in fade-in zoom-in-95 duration-100">
          <div className="px-3 py-2 border-b border-border mb-1">
            <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Active Session</p>
            {isAuthenticated && user ? (
              <div className="mt-1">
                <p className="text-xs font-bold text-foreground truncate">{user.name}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-black text-primary uppercase">
                    {user.role?.replace("_", " ")}
                  </span>
                  <span className="text-[11px] text-muted-foreground truncate">{user.email}</span>
                </div>
              </div>
            ) : (
              <p className="text-xs font-semibold text-muted-foreground mt-0.5">Not Signed In</p>
            )}
          </div>

          <p className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-muted-foreground">
            Role Workspaces & Quick Switch
          </p>
          <div className="space-y-1">
            {workspaces.map((ws) => {
              const ItemIcon = ws.icon;
              const isActive = currentWorkspace.id === ws.id;
              const isUserRole = user?.role === ws.role;

              return (
                <button
                  key={ws.id}
                  onClick={() => handleNavigate(ws)}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm font-semibold transition-colors ${
                    isActive ? "bg-primary text-primary-foreground font-bold" : "hover:bg-accent text-foreground"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <ItemIcon className="size-4 shrink-0" />
                    <span>{ws.label}</span>
                  </span>
                  <div className="flex items-center gap-1.5">
                    {isUserRole && (
                      <span
                        className={`text-[10px] font-bold rounded px-1.5 py-0.2 ${
                          isActive ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"
                        }`}
                      >
                        Active
                      </span>
                    )}
                    {isActive && <span className="size-1.5 rounded-full bg-primary-foreground" />}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-2 border-t border-border pt-1">
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-bold text-destructive hover:bg-destructive/10 transition-colors"
              >
                <LogOut className="size-3.5" />
                Sign Out ({user?.email})
              </button>
            ) : (
              <button
                onClick={() => {
                  setOpen(false);
                  navigate({ to: "/login" });
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-bold text-primary hover:bg-primary/10 transition-colors"
              >
                <LogIn className="size-3.5" />
                Sign In to Account
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
