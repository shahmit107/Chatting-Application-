import { useEffect, useRef, useState } from "react";

// Use VITE_WS_URL environment variable if set, otherwise default to local server
const WS_BASE_URL = import.meta.env.VITE_WS_URL || "ws://127.0.0.1:8080";
const RECONNECT_DELAY_MS = 2000;

/**
 * useWebSocket
 * A reusable hook handling raw WebSocket connections, automatic reconnection loops,
 * and passing the authentication token to the backend.
 * 
 * It takes an `isAuthenticated` flag to determine when to open the connection.
 */
export function useWebSocket({ isAuthenticated, onConnect, onMessage, onDisconnect, onError }) {
  const [socketReady, setSocketReady] = useState(false);
  
  const socketRef = useRef(null);
  const reconnectTimerRef = useRef(null);
  
  // Ref-based callbacks to prevent connection cycles during React component re-renders
  const callbacksRef = useRef({ onConnect, onMessage, onDisconnect, onError });

  useEffect(() => {
    callbacksRef.current = { onConnect, onMessage, onDisconnect, onError };
  });

  // Helper to safely send JSON stringified messages to the server
  function sendMessage(type, payload) {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      return false;
    }
    socketRef.current.send(JSON.stringify({ type, payload }));
    return true;
  }

  useEffect(() => {
    // If not authenticated, ensure socket is closed and don't try to connect
    if (!isAuthenticated) {
      if (socketRef.current) {
        socketRef.current.close();
      }
      clearTimeout(reconnectTimerRef.current);
      return;
    }

    let shouldReconnect = true;

    function connect() {
      // Extract the authentication token from local storage
      const token = localStorage.getItem("accessToken");
      if (!token) {
        // If there is no token yet, wait and try again
        reconnectTimerRef.current = setTimeout(connect, RECONNECT_DELAY_MS);
        return;
      }

      // Backend requires ?token=ACCESS_TOKEN query param to accept connections
      const url = `${WS_BASE_URL}/?token=${token}`;
      const ws = new WebSocket(url);
      socketRef.current = ws;

      ws.onopen = () => {
        if (socketRef.current !== ws) return;
        setSocketReady(true);
        if (callbacksRef.current.onConnect) {
          callbacksRef.current.onConnect(ws);
        }
      };

      ws.onmessage = (event) => {
        if (socketRef.current !== ws) return;
        try {
          const data = JSON.parse(event.data);
          if (callbacksRef.current.onMessage) {
            callbacksRef.current.onMessage(data);
          }
        } catch (err) {
          console.error("WebSocket payload parsing error:", err);
        }
      };

      ws.onerror = (err) => {
        if (socketRef.current !== ws) return;
        setSocketReady(false);
        if (callbacksRef.current.onError) {
          callbacksRef.current.onError(err);
        }
      };

      ws.onclose = () => {
        if (socketRef.current !== ws) return;
        setSocketReady(false);
        if (callbacksRef.current.onDisconnect) {
          callbacksRef.current.onDisconnect();
        }

        // Keep trying to reconnect while authenticated
        if (shouldReconnect && !reconnectTimerRef.current) {
          reconnectTimerRef.current = setTimeout(() => {
            reconnectTimerRef.current = null;
            connect();
          }, RECONNECT_DELAY_MS);
        }
      };
    }

    connect();

    return () => {
      shouldReconnect = false;
      clearTimeout(reconnectTimerRef.current);
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [isAuthenticated]);

  return {
    socketReady,
    sendMessage,
  };
}
