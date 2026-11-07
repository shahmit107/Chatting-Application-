import { useState, useRef, useEffect } from "react";

/**
 * Login Component
 * Supports two login modes:
 *   1. Password — email + password → POST /api/auth/login
 *   2. OTP      — email → POST /api/auth/sendOtp → otp → POST /api/auth/verifyOtp
 */
export function Login({ onLoginSuccess, onToggleMode }) {
  // Shared state
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Login mode: "password" | "otp"
  const [mode, setMode] = useState("password");

  // Password mode state
  const [password, setPassword] = useState("");

  // OTP mode state
  const [otpStep, setOtpStep] = useState("email"); // "email" | "verify"
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpSending, setOtpSending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [otpExpiry, setOtpExpiry] = useState(0); // seconds remaining until OTP expires
  const [blocked, setBlocked] = useState(0); // seconds remaining for block timer
  const otpInputRefs = useRef([]);
  const cooldownRef = useRef(null);
  const blockedRef = useRef(null);
  const expiryRef = useRef(null);

  // Cooldown timer (resend button)
  useEffect(() => {
    if (cooldown > 0) {
      cooldownRef.current = setTimeout(() => setCooldown((c) => c - 1), 1000);
    }
    return () => clearTimeout(cooldownRef.current);
  }, [cooldown]);

  // OTP expiry timer (5 minutes)
  useEffect(() => {
    if (otpExpiry > 0) {
      expiryRef.current = setTimeout(() => setOtpExpiry((t) => t - 1), 1000);
    }
    return () => clearTimeout(expiryRef.current);
  }, [otpExpiry]);

  // Block timer (too many attempts — 3 minutes)
  useEffect(() => {
    if (blocked > 0) {
      blockedRef.current = setTimeout(() => setBlocked((b) => b - 1), 1000);
    }
    return () => clearTimeout(blockedRef.current);
  }, [blocked]);

  const otpExpired = otpStep === "verify" && otpExpiry === 0;
  const isBlocked = blocked > 0;

  function formatExpiry(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  // Clean up when switching modes
  function switchMode(nextMode) {
    setMode(nextMode);
    setError("");
    setPassword("");
    setOtp(["", "", "", "", "", ""]);
    setOtpStep("email");
    setOtpExpiry(0);
    setBlocked(0);
  }

  // ──────────── Password Login ────────────
  async function handlePasswordLogin(e) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json().catch(() => ({}));
      console.log("login Response Status:", res.status);
      console.log("login Response Data:", data);

      if (res.ok) {
        const token = data.payload?.accessToken;
        if (token) {
          localStorage.setItem("accessToken", token);
          localStorage.setItem("email", email.trim());
          onLoginSuccess(token);
        } else {
          setError("Invalid response format from server.");
        }
      } else {
        setError(data.payload?.message || "Login failed.");
      }
    } catch (err) {
      setError("Unable to connect to server. Please try again.");
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  }

  // ──────────── OTP: Send ────────────
  async function handleSendOtp(e) {
    e?.preventDefault();
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    setError("");
    setOtpSending(true);

    try {
      const res = await fetch("http://localhost:8080/api/auth/sendOtp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json().catch(() => ({}));
      console.log("sendOtp Response Status:", res.status);
      console.log("sendOtp Response Data:", data);

      if (data.type === "message") {
        setOtpStep("verify");
        setCooldown(60);
        setOtpExpiry(300); // 5 minutes
        setOtp(["", "", "", "", "", ""]);
        setBlocked(0); // Clear any previous block
      } else {
        const errMsg = data.payload?.error || data.payload?.message || "Failed to send OTP.";
        setError(errMsg);
        // If backend says too many attempts, block the UI for 3 minutes
        if (errMsg.toLowerCase().includes("too many attempts")) {
          setBlocked(180);
          // If we're still on the email step, move to verify step so the block UI is visible
          if (otpStep === "email") {
            setOtpStep("verify");
          }
        }
      }
    } catch (err) {
      setError("Unable to connect to server. Please try again.");
      console.error("Send OTP error:", err);
    } finally {
      setOtpSending(false);
    }
  }

  // ──────────── OTP: Verify ────────────
  async function handleVerifyOtp(e) {
    e.preventDefault();
    const otpValue = otp.join("");
    if (otpValue.length !== 6) {
      setError("Please enter the complete 6-digit OTP.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8080/api/auth/verifyOtp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), otp: otpValue }),
      });

      const data = await res.json().catch(() => ({}));
      console.log("verifyOtp Response Status:", res.status);
      console.log("verifyOtp Response Data:", data);

      if (res.ok && data.payload?.accessToken) {
        localStorage.setItem("accessToken", data.payload.accessToken);
        localStorage.setItem("email", email.trim());
        onLoginSuccess(data.payload.accessToken);
      } else {
        const errMsg = data.payload?.error || data.payload?.message || "OTP verification failed.";
        setError(errMsg);
        // If backend says too many attempts, block the UI for 3 minutes
        if (errMsg.toLowerCase().includes("too many attempts")) {
          setBlocked(180); // 3 minutes
        }
      }
    } catch (err) {
      setError("Unable to connect to server. Please try again.");
      console.error("Verify OTP error:", err);
    } finally {
      setLoading(false);
    }
  }

  // ──────────── OTP Input Helpers ────────────
  function handleOtpChange(index, value) {
    if (!/^\d?$/.test(value)) return; // only digits
    const next = [...otp];
    next[index] = value;
    setOtp(next);

    // Auto-focus next input
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  }

  function handleOtpKeyDown(index, e) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  }

  function handleOtpPaste(e) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 0) return;
    const next = [...otp];
    for (let i = 0; i < 6; i++) {
      next[i] = pasted[i] || "";
    }
    setOtp(next);
    const focusIdx = Math.min(pasted.length, 5);
    otpInputRefs.current[focusIdx]?.focus();
  }

  // ──────────── Render ────────────
  return (
    <div className="auth-card">
      <h2>Welcome Back</h2>
      <p className="auth-subtitle">Login to your account to start chatting</p>

      {/* Mode Toggle Tabs */}
      <div className="login-mode-tabs">
        <button
          type="button"
          className={`mode-tab ${mode === "password" ? "mode-tab-active" : ""}`}
          onClick={() => switchMode("password")}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          Password
        </button>
        <button
          type="button"
          className={`mode-tab ${mode === "otp" ? "mode-tab-active" : ""}`}
          onClick={() => switchMode("otp")}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
            <polyline points="22,6 12,13 2,6"/>
          </svg>
          Email OTP
        </button>
      </div>

      {/* Error */}
      {error && !isBlocked && <div className="notice auth-error">{error}</div>}

      {/* ───── Password Mode ───── */}
      {mode === "password" && (
        <form onSubmit={handlePasswordLogin} className="auth-form">
          <label className="auth-field">
            <span>Email</span>
            <input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </label>

          <label className="auth-field">
            <span>Password</span>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </label>

          <button type="submit" disabled={loading} className="auth-btn">
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      )}

      {/* ───── OTP Mode: Step 1 — Enter Email ───── */}
      {mode === "otp" && otpStep === "email" && (
        <form onSubmit={handleSendOtp} className="auth-form">
          <label className="auth-field">
            <span>Email</span>
            <input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={otpSending}
              required
            />
          </label>

          <button type="submit" disabled={otpSending} className="auth-btn">
            {otpSending ? "Sending OTP..." : "Send OTP"}
          </button>
        </form>
      )}

      {/* ───── OTP Mode: Step 2 — Verify OTP ───── */}
      {mode === "otp" && otpStep === "verify" && (
        <form onSubmit={handleVerifyOtp} className="auth-form">
          <div className="otp-sent-info">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#50c878" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            <span>OTP sent to <strong>{email}</strong></span>
            {otpExpiry > 0 && (
              <span className={`otp-timer ${otpExpiry <= 60 ? "otp-timer-warning" : ""}`}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
                {formatExpiry(otpExpiry)}
              </span>
            )}
          </div>

          {otpExpired && !isBlocked && (
            <div className="notice auth-error">OTP has expired. Please resend to get a new code.</div>
          )}

          {isBlocked && (
            <div className="notice auth-error">
              ⛔ Too many attempts. Try again in {formatExpiry(blocked)}
            </div>
          )}

          <label className="auth-field">
            <span>Enter 6-digit OTP</span>
            <div className="otp-inputs" onPaste={handleOtpPaste}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => (otpInputRefs.current[i] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  className="otp-digit"
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  disabled={loading || otpExpired || isBlocked}
                  autoFocus={i === 0}
                />
              ))}
            </div>
          </label>

          <button type="submit" disabled={loading || otpExpired || isBlocked} className="auth-btn">
            {loading ? "Verifying..." : isBlocked ? `Blocked (${formatExpiry(blocked)})` : otpExpired ? "OTP Expired" : "Verify & Login"}
          </button>

          <div className="otp-actions">
            <button
              type="button"
              className="otp-resend-btn"
              disabled={cooldown > 0 || otpSending || isBlocked}
              onClick={handleSendOtp}
            >
              {cooldown > 0 ? `Resend OTP in ${cooldown}s` : "Resend OTP"}
            </button>
            <button
              type="button"
              className="otp-change-email-btn"
              onClick={() => {
                setOtpStep("email");
                setOtp(["", "", "", "", "", ""]);
                setOtpExpiry(0);
                setError("");
              }}
            >
              Change email
            </button>
          </div>
        </form>
      )}

      {/* Switch to Register */}
      <div className="auth-switch">
        <span>Don't have an account? </span>
        <button type="button" onClick={onToggleMode} className="switch-link">
          Register
        </button>
      </div>
    </div>
  );
}
