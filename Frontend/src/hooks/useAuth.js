import { useState, useEffect } from "react";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessTokenState] = useState(() => localStorage.getItem("accessToken") || null);
  const [refreshToken, setRefreshToken] = useState(null); // Cookie-based, kept in state as requested
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  // Helper to set access token in state and localStorage
  function setAccessToken(token) {
    if (token) {
      localStorage.setItem("accessToken", token);
      setAccessTokenState(token);
    } else {
      localStorage.removeItem("accessToken");
      setAccessTokenState(null);
    }
  }

  // Fetch User Profile (/me)
  async function fetchUserData(token) {
    if (!token) return false;
    try {
      const res = await fetch("http://localhost:8080/api/auth/me", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("fetchUserData status:", res.status);
      if (res.ok) {
        const data = await res.json();
        console.log("fetchUserData data:", data);
        const userData = data.payload?.user;
        if (userData) {
          setUser(userData);
          setIsAuthenticated(true);
          return true;
        }
      }

      // If the server explicitly rejected the token, we MUST return false
      // to trigger the refresh token flow, instead of falling back to local storage.
      if (res.status === 401 || res.status === 403) {
        console.log("fetchUserData rejected with 401/403 status");
        return false;
      }

      // Fallback to local storage if API returns 500 or invalid user format
      const email = localStorage.getItem("email");
      if (email) {
        const storedName = localStorage.getItem(`userName_${email}`) || `User_${email.slice(-4)}`;
        const fallbackUser = { userName: storedName, email: email };
        setUser(fallbackUser);
        setIsAuthenticated(true);
        return true;
      }

      return false;
    } catch (err) {
      console.error("Fetch profile error:", err);
      // Fallback on network connection errors
      const email = localStorage.getItem("email");
      if (email) {
        const fallbackUser = {
          userName: localStorage.getItem(`userName_${email}`) || `User_${email.slice(-4)}`,
          email: email,
        };
        setUser(fallbackUser);
        setIsAuthenticated(true);
        return true;
      }
      return false;
    }
  }

  // Refresh Access Token
  async function handleTokenRefresh() {
    try {
      const refreshRes = await fetch("http://localhost:8080/api/auth/refresh", {
        method: "POST",
        credentials: "include", // Required to send/receive refresh token cookie
      });

      if (refreshRes.ok) {
        const refreshData = await refreshRes.json();
        const newAccessToken = refreshData.payload?.accessToken;
        if (newAccessToken) {
          setAccessToken(newAccessToken);
          const success = await fetchUserData(newAccessToken);
          if (success) return;
        }
      }
    } catch (err) {
      console.error("Refresh token error:", err);
    }

    handleAuthFailure();
  }

  function handleAuthFailure() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("email");
    setUser(null);
    setAccessTokenState(null);
    setIsAuthenticated(false);
  }

  // Mount Session Restoration
  useEffect(() => {
    async function restoreSession() {
      const token = localStorage.getItem("accessToken");
      if (token) {
        const success = await fetchUserData(token);
        if (!success) {
          await handleTokenRefresh();
        }
      } else {
        setIsAuthenticated(false);
      }
      setAuthLoading(false);
    }

    restoreSession();
  }, []);

  // Handle Login Success callback
  async function handleLoginSuccess(token) {
    setAccessToken(token);
    setAuthLoading(true);
    const success = await fetchUserData(token);
    if (!success) {
      handleAuthFailure();
    }
    setAuthLoading(false);
  }

  // Logout handler
  async function handleLogout() {
    const confirmed = window.confirm("Are you sure you want to logout?")
    if(!confirmed) return;
    const token = localStorage.getItem("accessToken");
    try {
      await fetch("http://localhost:8080/api/auth/logout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout request error:", err);
    }

    handleAuthFailure();
  }

  // Delete account handler
  async function handleDeleteAccount() {
    if (!user || !user.email) {
      alert("No logged in user found to delete.");
      return;
    }
    const confirmed = window.confirm("Are you sure you want to permanently delete your account? This action cannot be undone.");
    if (!confirmed) return;
    const token = localStorage.getItem("accessToken");
    try {
      const res = await fetch("http://localhost:8080/api/auth/deleteAccount", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email: user.email }),
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.type !== "error") {
        alert("Account deleted successfully.");
      } else {
        alert(data.payload?.message || "Failed to delete account.");
      }
    } catch (err) {
      console.error("Delete account request error:", err);
      alert("Unable to connect to server. Please try again.");
    }

    handleAuthFailure();
  }

  return {
    user,
    isAuthenticated,
    authLoading,
    handleLoginSuccess,
    handleLogout,
    handleDeleteAccount,
    handleAuthFailure,
  };
}
