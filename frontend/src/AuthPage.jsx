import { useState } from "react";
import "./AuthPage.css";

const ROLES = [
  {
    id: "customer",
    name: "Customer",
    icon: "🏗️",
    desc: "Procure materials & manage projects",
  },
  {
    id: "supplier",
    name: "Supplier",
    icon: "🏭",
    desc: "List materials & fulfill orders",
  },
  {
    id: "engineer",
    name: "Engineer",
    icon: "📐",
    desc: "Verify technical suitability & specs",
  },
  {
    id: "admin",
    name: "Admin",
    icon: "🛡️",
    desc: "Platform governance & analytics",
  },
];

export default function AuthPage({ initialMode = "login", onBack, onSuccess }) {
  const [mode, setMode] = useState(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info"); // 'info' | 'error' | 'success'
  const [showOfflineDemo, setShowOfflineDemo] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "customer",
    companyName: "",
    phone: "",
    specialization: "",
    adminSecretKey: "",
    remember: true,
  });

  function updateField(event) {
    const { name, value, checked, type } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));

    setMessage("");
  }

  function handleRoleSelect(roleId) {
    setForm((prev) => ({ ...prev, role: roleId }));
    setMessage("");
  }

  function switchMode(nextMode) {
    setMode(nextMode);
    setMessage("");
    setShowPassword(false);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (mode === "signup" && !form.name.trim()) {
      setMessage("Please enter your full name.");
      setMessageType("error");
      return;
    }

    if (!form.email.trim()) {
      setMessage("Please enter your email address.");
      setMessageType("error");
      return;
    }

    if (form.password.length < 8) {
      setMessage("Your password must contain at least 8 characters.");
      setMessageType("error");
      return;
    }

    if (mode === "signup" && form.password !== form.confirmPassword) {
      setMessage("Your passwords do not match.");
      setMessageType("error");
      return;
    }

    if (mode === "signup" && form.role === "admin" && !form.adminSecretKey.trim()) {
      setMessage("Admin registration requires an admin invitation secret key.");
      setMessageType("error");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const endpoint = mode === "signup" ? "register" : "login";

      const requestBody =
        mode === "signup"
          ? {
              name: form.name.trim(),
              email: form.email.trim(),
              password: form.password,
              role: form.role,
              phone: form.phone.trim(),
              companyName: form.companyName.trim(),
              specialization: form.specialization.trim(),
              adminSecretKey: form.adminSecretKey.trim(),
            }
          : {
              email: form.email.trim(),
              password: form.password,
            };

      const response = await fetch(
        `http://localhost:5050/api/auth/${endpoint}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Authentication failed.");
      }

      // Save token and user details in session & local storage
      sessionStorage.setItem("smartbuild_token", data.token);
      localStorage.setItem("smartbuild_token", data.token);
      sessionStorage.setItem("smartbuild_user", JSON.stringify(data.user));
      localStorage.setItem("smartbuild_user", JSON.stringify(data.user));

      setMessageType("success");
      setMessage(data.message);

      if (onSuccess) {
        setTimeout(() => {
          onSuccess(data.user);
        }, 400);
      }
    } catch (error) {
      console.error("Authentication error:", error);
      setMessageType("error");

      const isNetworkError =
        (error.name === "TypeError" && error.message.toLowerCase().includes("fetch")) ||
        error.message.includes("Failed to fetch") ||
        error.message.includes("NetworkError");

      if (isNetworkError) {
        setMessage(
          "⚠️ Unable to reach backend on http://localhost:5050. The backend server is not currently running in your terminal."
        );
        setShowOfflineDemo(true);
      } else {
        setMessage(
          error.message || "Unable to connect to the backend server. Please verify it is running."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  function handleDemoLogin(targetRole) {
    const demoUser = {
      id: `demo-${Date.now()}`,
      name:
        form.name.trim() ||
        (targetRole === "supplier"
          ? "Apex Building Supplies"
          : targetRole === "engineer"
          ? "Eng. Kunal Patil"
          : targetRole === "admin"
          ? "Platform Administrator"
          : "Kunal Bachhav"),
      email: form.email.trim() || `demo-${targetRole}@smartbuild.com`,
      role: targetRole || "customer",
      isVerified: true,
      companyName: form.companyName || "Apex Building Supplies",
      phone: form.phone || "+91 98220 11223",
      specialization: form.specialization || "Structural Engineering",
    };

    sessionStorage.setItem("smartbuild_token", "demo-token-bypass-2026");
    localStorage.setItem("smartbuild_token", "demo-token-bypass-2026");
    sessionStorage.setItem("smartbuild_user", JSON.stringify(demoUser));
    localStorage.setItem("smartbuild_user", JSON.stringify(demoUser));

    if (onSuccess) {
      onSuccess(demoUser);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-visual">
        <button className="auth-brand" onClick={onBack} type="button">
          <span className="auth-brand-icon">S</span>
          <span>SmartBuild</span>
        </button>

        <div className="auth-visual-content">
          <span className="auth-eyebrow">
            SMART MATERIAL PROCUREMENT & RECOMMENDATION
          </span>

          <h1>
            Multi-role
            <br />
            construction
            <br />
            <span>collaboration</span>
            <br />
            simplified.
          </h1>

          <p>
            Connect customers, verified suppliers, engineers, and administrators
            on one intelligent platform powered by predictive analytics.
          </p>

          <div className="auth-visual-points">
            <div>
              <span className="auth-check">✓</span>
              <span><strong>Visitors & Customers:</strong> Explore materials & manage projects</span>
            </div>
            <div>
              <span className="auth-check">✓</span>
              <span><strong>Suppliers:</strong> Inventory management & order fulfillment</span>
            </div>
            <div>
              <span className="auth-check">✓</span>
              <span><strong>Engineers:</strong> Recommendation validation & technical reviews</span>
            </div>
            <div>
              <span className="auth-check">✓</span>
              <span><strong>Admins:</strong> Platform governance & data pipeline supervision</span>
            </div>
          </div>
        </div>

        <div className="auth-visual-footer">
          <span>ROLE-BASED ECOSYSTEM</span>
          <span>SMARTBUILD © 2026</span>
        </div>
      </section>

      <section className="auth-form-side">
        <button className="auth-mobile-brand" onClick={onBack} type="button">
          <span className="auth-brand-icon">S</span>
          SmartBuild
        </button>

        <div className="auth-form-wrap">
          <button className="auth-back" onClick={onBack} type="button">
            <span aria-hidden="true">←</span> Back to browsing
          </button>

          <div className="auth-heading">
            <span className="auth-small-label">
              {mode === "login" ? "WELCOME BACK" : "CREATE YOUR SMARTBUILD ACCOUNT"}
            </span>

            <h2>
              {mode === "login" ? "Good to see you." : "Join the Platform."}
            </h2>

            <p>
              {mode === "login"
                ? "Enter your credentials to access your role-specific dashboard."
                : "Select your role to configure your dedicated workspace."}
            </p>
          </div>

          <div className="auth-mode-switch">
            <button
              type="button"
              className={mode === "login" ? "active" : ""}
              onClick={() => switchMode("login")}
            >
              Log in
            </button>

            <button
              type="button"
              className={mode === "signup" ? "active" : ""}
              onClick={() => switchMode("signup")}
            >
              Create account
            </button>
          </div>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            {mode === "signup" && (
              <>
                <div className="auth-field">
                  <label>Select your platform role</label>
                  <div className="auth-role-grid">
                    {ROLES.map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        className={`role-card ${form.role === r.id ? "active" : ""}`}
                        onClick={() => handleRoleSelect(r.id)}
                      >
                        <span className="role-icon">{r.icon}</span>
                        <div className="role-text">
                          <span className="role-title">{r.name}</span>
                          <span className="role-desc">{r.desc}</span>
                        </div>
                        {form.role === r.id && <span className="role-check">✓</span>}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="auth-field">
                  <label htmlFor="auth-name">Full name</label>
                  <input
                    id="auth-name"
                    name="name"
                    type="text"
                    placeholder="e.g. John Doe"
                    autoComplete="name"
                    value={form.name}
                    onChange={updateField}
                    required
                  />
                </div>

                {form.role === "supplier" && (
                  <>
                    <div className="auth-field">
                      <label htmlFor="auth-company">Company / Business Name</label>
                      <input
                        id="auth-company"
                        name="companyName"
                        type="text"
                        placeholder="e.g. Apex Steel & Cement Corp"
                        value={form.companyName}
                        onChange={updateField}
                      />
                    </div>
                    <div className="auth-field">
                      <label htmlFor="auth-phone">Business Contact Number</label>
                      <input
                        id="auth-phone"
                        name="phone"
                        type="tel"
                        placeholder="e.g. +91 98765 43210"
                        value={form.phone}
                        onChange={updateField}
                      />
                    </div>
                  </>
                )}

                {form.role === "engineer" && (
                  <div className="auth-field">
                    <label htmlFor="auth-spec">Technical Specialization</label>
                    <input
                      id="auth-spec"
                      name="specialization"
                      type="text"
                      placeholder="e.g. Structural Engineering / Green Concrete"
                      value={form.specialization}
                      onChange={updateField}
                    />
                  </div>
                )}

                {form.role === "admin" && (
                  <div className="auth-field">
                    <label htmlFor="auth-admin-key">Admin Invitation Secret Key</label>
                    <input
                      id="auth-admin-key"
                      name="adminSecretKey"
                      type="password"
                      placeholder="Enter platform admin key"
                      value={form.adminSecretKey}
                      onChange={updateField}
                    />
                    <small className="auth-hint">
                      Demo secret: <code>smartbuild_admin_2026</code>
                    </small>
                  </div>
                )}
              </>
            )}

            <div className="auth-field">
              <label htmlFor="auth-email">Email address</label>
              <input
                id="auth-email"
                name="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                value={form.email}
                onChange={updateField}
                required
              />
            </div>

            <div className="auth-field">
              <div className="auth-label-row">
                <label htmlFor="auth-password">Password</label>

                {mode === "login" && (
                  <button
                    type="button"
                    className="auth-text-button"
                    onClick={() => {
                      setMessage("Password reset instructions have been sent to your email (Demo).");
                      setMessageType("info");
                    }}
                  >
                    Forgot password?
                  </button>
                )}
              </div>

              <div className="auth-password-wrap">
                <input
                  id="auth-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={
                    mode === "signup"
                      ? "At least 8 characters"
                      : "Enter your password"
                  }
                  autoComplete={
                    mode === "login" ? "current-password" : "new-password"
                  }
                  value={form.password}
                  onChange={updateField}
                  required
                />

                <button
                  type="button"
                  className="auth-show-password"
                  onClick={() => setShowPassword((previous) => !previous)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {mode === "signup" && (
              <div className="auth-field">
                <label htmlFor="auth-confirm-password">
                  Confirm password
                </label>
                <input
                  id="auth-confirm-password"
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Repeat your password"
                  autoComplete="new-password"
                  value={form.confirmPassword}
                  onChange={updateField}
                  required
                />
              </div>
            )}

            {mode === "login" && (
              <label className="auth-remember">
                <input
                  type="checkbox"
                  name="remember"
                  checked={form.remember}
                  onChange={updateField}
                />
                <span>Remember this device</span>
              </label>
            )}

            {message && (
              <div className={`auth-message auth-message-${messageType}`} role="status">
                {message}
              </div>
            )}

            {showOfflineDemo && (
              <div style={{ padding: "14px", background: "#f8fafc", border: "1.5px solid #cbd5e1", borderRadius: "10px", marginTop: "2px" }}>
                <div style={{ fontSize: "12px", color: "#334155", fontWeight: "700", marginBottom: "6px" }}>
                  💡 Two quick ways to continue:
                </div>
                <div style={{ fontSize: "11px", color: "#64748b", lineHeight: 1.5, marginBottom: "10px" }}>
                  1. Run <code>cd backend && npm run dev</code> in a new terminal tab to start the Node.js server on port 5050.<br />
                  2. Or click below for instant access to test all role features right now:
                </div>
                <button
                  type="button"
                  className="table-action-btn btn-success"
                  style={{ width: "100%", padding: "10px 14px", fontSize: "12px", fontWeight: "700" }}
                  onClick={() => handleDemoLogin(form.role)}
                >
                  Enter {form.role.toUpperCase()} Workspace Instantly ➔
                </button>
              </div>
            )}

            <button
              className="auth-submit"
              type="submit"
              disabled={loading}
            >
              {loading
                ? "Processing..."
                : mode === "login"
                ? "Log in to SmartBuild"
                : `Create ${form.role.charAt(0).toUpperCase() + form.role.slice(1)} Account`}

              {!loading && <span aria-hidden="true">→</span>}
            </button>
          </form>

          <p className="auth-switch-text">
            {mode === "login"
              ? "New to SmartBuild?"
              : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={() =>
                switchMode(mode === "login" ? "signup" : "login")
              }
            >
              {mode === "login" ? "Create an account" : "Log in"}
            </button>
          </p>

          <p className="auth-terms">
            By continuing, you agree to SmartBuild terms of service, role governance policies, and privacy protocols.
          </p>
        </div>
      </section>
    </main>
  );
}
