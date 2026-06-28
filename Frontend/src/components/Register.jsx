import { useState } from "react";

/**
 * Register Component
 * Renders the registration form fields (DisplayName, Email, Password)
 * and triggers the POST /api/auth/register request.
 */
export function Register({ onRegisterSuccess, onToggleMode }) {
  // Input fields, notification messages, and loading states
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Form submit handler
  async function handleSubmit(e) {
    e.preventDefault();
    if (!displayName.trim() || !email.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8080/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userName: displayName.trim(),
          email: email.trim(),
          password: password,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setSuccess("Registration successful! Redirecting to login...");
        
        // Cache display name in localStorage in case the server needs a local fallback
        localStorage.setItem(`userName_${email.trim()}`, displayName.trim());
        
        setTimeout(() => {
          onRegisterSuccess();
        }, 1500);
      } else {
        setError(data.payload?.message || "Registration failed.");
      }
    } catch (err) {
      setError("Unable to connect to server. Please try again.");
      console.error("Register error:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-card">
      <h2>Create Account</h2>
      <p className="auth-subtitle">Join the real-time chat application today</p>

      {/* Render notifications if present */}
      {error && <div className="notice auth-error">{error}</div>}
      {success && <div className="notice auth-success">{success}</div>}

      <form onSubmit={handleSubmit} className="auth-form">
        {/* Name field */}
        <label className="auth-field">
          <span>Display Name</span>
          <input
            type="text"
            placeholder="Enter your display name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            disabled={loading}
            required
          />
        </label>

        {/* Email field */}
        <label className="auth-field">
          <span>Email</span>
          <input
            type="email"
            placeholder="Enter your Email Id"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            required
          />
        </label>

        {/* Password field */}
        <label className="auth-field">
          <span>Password</span>
          <input
            type="password"
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            required
          />
        </label>

        {/* Submit button */}
        <button type="submit" disabled={loading} className="auth-btn">
          {loading ? "Registering..." : "Register"}
        </button>
      </form>

      {/* Switch to Login link */}
      <div className="auth-switch">
        <span>Already have an account? </span>
        <button type="button" onClick={onToggleMode} className="switch-link">
          Login
        </button>
      </div>
    </div>
  );
}
