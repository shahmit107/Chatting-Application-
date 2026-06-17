import { useState } from "react";

/**
 * Login Component
 * Renders the Login form fields (PhoneNumber, Password) and triggers
 * the POST /api/auth/login authentication request.
 */
export function Login({ onLoginSuccess, onToggleMode }) {
  // Input field and loading states
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Form submit handler
  async function handleSubmit(e) {
    e.preventDefault();
    if (!phoneNumber.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNumber: phoneNumber.trim(),
          password: password,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        const token = data.payload?.accessToken;
        if (token) {
          // Store token and user details inside localStorage cache
          localStorage.setItem("accessToken", token);
          localStorage.setItem("userPhone", phoneNumber.trim());
          
          // Notify parent app of successful authorization
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

  return (
    <div className="auth-card">
      <h2>Welcome Back</h2>
      <p className="auth-subtitle">Login to your account to start chatting</p>

      {/* Display errors if they occur */}
      {error && <div className="notice auth-error">{error}</div>}

      <form onSubmit={handleSubmit} className="auth-form">
        {/* Phone number field */}
        <label className="auth-field">
          <span>Phone Number</span>
          <input
            type="tel"
            placeholder="Enter your phone number"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            disabled={loading}
            required
          />
        </label>

        {/* Password field */}
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

        {/* Submit button */}
        <button type="submit" disabled={loading} className="auth-btn">
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      {/* Switch to Register link */}
      <div className="auth-switch">
        <span>Don't have an account? </span>
        <button type="button" onClick={onToggleMode} className="switch-link">
          Register
        </button>
      </div>
    </div>
  );
}
