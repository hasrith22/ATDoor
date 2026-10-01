import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  AlertCircle,
  Bell,
  CheckCircle2,
  KeyRound,
  LogOut,
  Save,
  Shield,
  Sliders,
  User,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { authApi } from "@/api/auth";

export function ManagerSettingsModal({ open, onClose, defaultTab = "profile" }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(defaultTab); // "profile" | "settings" | "security"

  // Profile fields
  const [name, setName] = useState(user?.name || "Prakash Varma");
  const [phone, setPhone] = useState(user?.phone || "+91 98765 00002");
  const [profileMsg, setProfileMsg] = useState("");

  // Settings toggles
  const [soundAlerts, setSoundAlerts] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [criticalPush, setCriticalPush] = useState(true);
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Security password fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passError, setPassError] = useState("");
  const [passSuccess, setPassSuccess] = useState("");
  const [isUpdatingPass, setIsUpdatingPass] = useState(false);

  if (!open) return null;

  const handleLogout = () => {
    onClose();
    logout();
    navigate({ to: "/login" });
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileMsg("Profile details saved successfully.");
    setTimeout(() => setProfileMsg(""), 3000);
  };

  const handleSaveSettings = () => {
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2500);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPassError("");
    setPassSuccess("");

    if (!currentPassword || !newPassword) {
      setPassError("Please provide your current and new password.");
      return;
    }

    if (newPassword.length < 6) {
      setPassError("New password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPassError("New passwords do not match.");
      return;
    }

    setIsUpdatingPass(true);
    try {
      const res = await authApi.updatePassword(currentPassword, newPassword);
      if (res?.success) {
        setPassSuccess("Password updated successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setPassError(res?.message || "Failed to update password.");
      }
    } catch (err) {
      setPassError(err.message || err.response?.data?.message || "Incorrect current password.");
    } finally {
      setIsUpdatingPass(false);
    }
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[80] flex items-center justify-center bg-backdrop/70 p-4 backdrop-blur-sm"
        onMouseDown={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-panel sm:p-8"
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute right-4 top-4"
            aria-label="Close"
          >
            <X className="size-5" />
          </Button>

          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground font-black text-sm">
              OM
            </span>
            <div>
              <h2 className="text-xl font-black text-foreground">Operations Account & Settings</h2>
              <p className="text-xs text-muted-foreground">Manage profile, alerts, and security preferences</p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="mt-6 flex border-b border-border">
            {[
              { id: "profile", label: "Profile", icon: User },
              { id: "settings", label: "Preferences", icon: Sliders },
              { id: "security", label: "Security", icon: KeyRound },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-bold transition-colors ${
                  activeTab === id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="size-4" />
                {label}
              </button>
            ))}
          </div>

          {/* Profile Tab */}
          {activeTab === "profile" && (
            <form onSubmit={handleSaveProfile} className="mt-6 space-y-4">
              {profileMsg && (
                <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs font-bold text-emerald-600">
                  <CheckCircle2 className="size-4" />
                  <span>{profileMsg}</span>
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Full Name
                  </label>
                  <Input
                    className="mt-1 font-semibold"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Role & Authority
                  </label>
                  <Input
                    disabled
                    className="mt-1 font-bold bg-muted text-foreground"
                    value="OPERATIONS_MANAGER (Full Operational Authority)"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Email Address
                  </label>
                  <Input
                    disabled
                    className="mt-1 font-semibold bg-muted"
                    value={user?.email || "operations@atdoor.com"}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Direct Phone Number
                  </label>
                  <Input
                    className="mt-1 font-semibold"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="rounded-xl bg-muted/60 p-4 border border-border mt-4 text-xs space-y-1">
                <p className="font-bold text-foreground">Operational Zone & Shift Information</p>
                <p className="text-muted-foreground">Command Center: Bengaluru Central Operations (Hub #01)</p>
                <p className="text-muted-foreground">Active Shift: 08:00 AM – 08:00 PM IST · Auto-Dispatch Enabled</p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border">
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={handleLogout}
                  className="font-bold"
                >
                  <LogOut className="size-4 mr-1.5" /> Sign Out
                </Button>
                <Button type="submit" size="sm" className="font-bold">
                  <Save className="size-4 mr-1.5" /> Save Changes
                </Button>
              </div>
            </form>
          )}

          {/* Preferences Tab */}
          {activeTab === "settings" && (
            <div className="mt-6 space-y-5">
              {settingsSaved && (
                <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs font-bold text-emerald-600">
                  <CheckCircle2 className="size-4" />
                  <span>Preferences saved successfully.</span>
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-xl border border-border p-4">
                  <div>
                    <p className="font-bold text-sm text-foreground">Critical Escalation Notifications</p>
                    <p className="text-xs text-muted-foreground">
                      Instantly receive notifications when a customer flags safety hazards or unassigned jobs delay past 15 min.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={criticalPush}
                    onChange={(e) => setCriticalPush(e.target.checked)}
                    className="size-5 rounded text-primary focus:ring-primary"
                  />
                </div>

                <div className="flex items-center justify-between rounded-xl border border-border p-4">
                  <div>
                    <p className="font-bold text-sm text-foreground">Audio Alerts for New Urgent Requests</p>
                    <p className="text-xs text-muted-foreground">
                      Play an alert sound when an emergency high-priority request (e.g. electrical fire/flooding) arrives.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={soundAlerts}
                    onChange={(e) => setSoundAlerts(e.target.checked)}
                    className="size-5 rounded text-primary focus:ring-primary"
                  />
                </div>

                <div className="flex items-center justify-between rounded-xl border border-border p-4">
                  <div>
                    <p className="font-bold text-sm text-foreground">Live Operations Auto-Sync</p>
                    <p className="text-xs text-muted-foreground">
                      Automatically refresh dispatch board and technician locations every 30 seconds.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoRefresh}
                    onChange={(e) => setAutoRefresh(e.target.checked)}
                    className="size-5 rounded text-primary focus:ring-primary"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-border">
                <Button size="sm" onClick={handleSaveSettings} className="font-bold">
                  Save Preferences
                </Button>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <form onSubmit={handlePasswordChange} className="mt-6 space-y-4">
              {passError && (
                <div className="flex items-center gap-2 rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-xs font-bold text-destructive">
                  <AlertCircle className="size-4 shrink-0" />
                  <span>{passError}</span>
                </div>
              )}
              {passSuccess && (
                <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs font-bold text-emerald-600">
                  <CheckCircle2 className="size-4" />
                  <span>{passSuccess}</span>
                </div>
              )}

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Current Password
                </label>
                <Input
                  type="password"
                  required
                  placeholder="Enter current password (default: Ops@123)"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  New Password
                </label>
                <Input
                  type="password"
                  required
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Confirm New Password
                </label>
                <Input
                  type="password"
                  required
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-destructive font-bold"
                >
                  <LogOut className="size-4 mr-1.5" /> Sign Out
                </Button>
                <Button type="submit" size="sm" disabled={isUpdatingPass} className="font-bold">
                  {isUpdatingPass ? "Updating..." : "Update Password"}
                </Button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
