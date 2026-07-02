import { useState } from "react";
import { Login } from "./Login";
import { Register } from "./Register";

/**
 * AuthPage Component
 * Serves as the outer container for authentication, allowing users
 * to toggle between the Login and Register sub-forms.
 */
export function AuthPage({ onLoginSuccess }) {
  // Local state to toggle between Login (true) and Register (false) views
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="auth-container">
      {/* Decorative ambient background glows */}
      <div className="auth-background">
        <div className="auth-glow auth-glow-1"></div>
        <div className="auth-glow auth-glow-2"></div>
      </div>
      
      {/* App brand header */}
      <div className="auth-header">
        <img 
          src="/echo_logo.png" 
          alt="Echo Logo" 
          className="auth-brand-logo" 
          style={{ width: "3.5rem", height: "3.5rem", borderRadius: "50%", objectFit: "cover", border: "1px solid #303030" }} 
        />
        <h1>Echo</h1>
      </div>

      {/* Render the appropriate form based on toggled state */}
      <div className="auth-content">
        {isLogin ? (
          <Login
            onLoginSuccess={onLoginSuccess}
            onToggleMode={() => setIsLogin(false)}
          />
        ) : (
          <Register
            onRegisterSuccess={() => setIsLogin(true)}
            onToggleMode={() => setIsLogin(true)}
          />
        )}
      </div>
    </div>
  );
}
