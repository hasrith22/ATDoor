import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, Phone, User, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";

export default function Login() {
  const { login, register, isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("CUSTOMER");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const redirectByRole = (userRole) => {
    switch (userRole) {
      case "ADMIN":
        navigate("/admin");
        break;
      case "OPERATIONS_MANAGER":
        navigate("/manager");
        break;
      case "SUPPORT_AGENT":
        navigate("/support");
        break;
      case "PROVIDER":
        navigate("/provider");
        break;
      default:
        navigate("/");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isRegister) {
        if (!name || !email || !phone || !password) {
          setError("Please fill in all required fields.");
          setLoading(false);
          return;
        }

        const res = await register({ name, email, phone, password, role });
        if (res.success && res.user) {
          redirectByRole(res.user.role);
        } else {
          setError(res.message || "Registration failed. Please try again.");
        }
      } else {
        if (!email || !password) {
          setError("Please enter your email and password.");
          setLoading(false);
          return;
        }

        const res = await login(email, password);
        if (res.success && res.user) {
          redirectByRole(res.user.role);
        } else {
          setError(res.message || "Invalid email or password.");
        }
      }
    } catch (err) {
      setError(err.message || "An unexpected error occurred. Please check backend server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-muted/40 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center">
          <span className="inline-flex size-14 items-center justify-center rounded-2xl bg-primary text-2xl font-black text-primary-foreground shadow-md">
            A
          </span>
          <h1 className="mt-4 text-3xl font-black tracking-tight text-foreground">
            {isRegister ? "Create AtDoor Account" : "Sign In to AtDoor"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {isRegister
              ? "Join as a Customer or verified Service Professional."
              : "Enter your credentials to access your role workspace."}
          </p>
        </div>

        {/* If already authenticated */}
        {isAuthenticated && user && (
          <div className="mt-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-center">
            <CheckCircle2 className="mx-auto size-8 text-emerald-600 mb-2" />
            <p className="font-bold text-foreground">Currently logged in as:</p>
            <p className="text-sm font-black text-emerald-700 mt-1">
              {user.name} ({user.role?.replace("_", " ")})
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">{user.email}</p>
            <div className="mt-4 flex justify-center gap-2">
              <Button size="sm" onClick={() => redirectByRole(user.role)}>
                Go to My Dashboard
              </Button>
              <Button size="sm" variant="outline" onClick={logout}>
                Sign Out
              </Button>
            </div>
          </div>
        )}

        {/* Login / Register Card */}
        <div className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
          {/* Tab Switcher */}
          <div className="flex border-b border-border pb-3 mb-6">
            <button
              type="button"
              onClick={() => {
                setIsRegister(false);
                setError("");
              }}
              className={`flex-1 text-center font-bold text-sm pb-2 border-b-2 transition-colors ${
                !isRegister ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setIsRegister(true);
                setError("");
              }}
              className={`flex-1 text-center font-bold text-sm pb-2 border-b-2 transition-colors ${
                isRegister ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-xs font-bold text-destructive">
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Full Name <span className="text-destructive">*</span>
                  </label>
                  <div className="relative mt-1">
                    <User className="absolute left-3 top-3 size-4 text-muted-foreground" />
                    <Input
                      required
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Hasrith Rao"
                      className="pl-9 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Phone Number <span className="text-destructive">*</span>
                  </label>
                  <div className="relative mt-1">
                    <Phone className="absolute left-3 top-3 size-4 text-muted-foreground" />
                    <Input
                      required
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="pl-9 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Account Type <span className="text-destructive">*</span>
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="mt-1 w-full rounded-md border border-input bg-background p-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="CUSTOMER">Customer (Book Home Services)</option>
                    <option value="PROVIDER">Service Provider (Provide Services)</option>
                  </select>
                </div>
              </>
            )}

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Email Address <span className="text-destructive">*</span>
              </label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-3 size-4 text-muted-foreground" />
                <Input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="pl-9 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Password <span className="text-destructive">*</span>
              </label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-3 size-4 text-muted-foreground" />
                <Input
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-9 font-medium"
                />
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full font-bold shadow-sm mt-2"
              disabled={loading}
            >
              {loading ? "Authenticating..." : isRegister ? "Create Account" : "Sign In"}
            </Button>
          </form>

          {/* Credentials Reference Helper */}
          <div className="mt-6 border-t border-border pt-4 text-center">
            <p className="text-xs text-muted-foreground font-medium mb-2">
              Registered platform credentials (click to auto-fill):
            </p>
            <div className="space-y-1.5 text-[11px] text-muted-foreground text-left">
              {[
                { role: "Admin", email: "admin@atdoor.com", pass: "Admin@123" },
                { role: "Provider", email: "provider1@atdoor.com", pass: "Provider@123" },
                { role: "Manager", email: "operations@atdoor.com", pass: "Ops@123" },
                { role: "Support", email: "support@atdoor.com", pass: "Support@123" },
                { role: "Customer", email: "customer@atdoor.com", pass: "Customer@123" },
              ].map((c) => (
                <button
                  key={c.role}
                  type="button"
                  onClick={() => {
                    setIsRegister(false);
                    setEmail(c.email);
                    setPassword(c.pass);
                  }}
                  className="w-full flex items-center justify-between p-2 rounded-lg bg-muted/40 hover:bg-primary/10 border border-border hover:border-primary/30 transition text-left cursor-pointer group"
                >
                  <div>
                    <strong className="text-foreground group-hover:text-primary font-bold">{c.role}:</strong>{" "}
                    <span className="font-mono text-muted-foreground">{c.email}</span>
                  </div>
                  <div className="text-xs font-mono font-semibold text-primary/80">
                    {c.pass}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
