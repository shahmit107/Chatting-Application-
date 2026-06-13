import { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";

const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:8080";

function normalizeMessage(data, activeRoom) {
  if (data.type === "chat") {
    return {
      id: crypto.randomUUID(),
      type: "chat",
      roomId: data.roomId || data.payload?.roomId || activeRoom,
      userName: data.userName || data.payload?.userName || "Unknown",
      message: data.message || data.payload?.message || "",
      time: data.payload?.time || formatTime(data.createdAt),
      createdAt: data.createdAt || new Date().toISOString(),
    };
  }

  if (data.type === "system") {
    return {
      id: crypto.randomUUID(),
      type: "system",
      roomId: data.roomId || data.payload?.roomId || activeRoom,
      message: data.payload?.message || data.message || "",
      createdAt: new Date().toISOString(),
    };
  }

  return {
    id: data._id || crypto.randomUUID(),
    type: "chat",
    roomId: data.roomId || activeRoom,
    userName: data.userName || "Unknown",
    message: data.message || "",
    time: formatTime(data.createdAt),
    createdAt: data.createdAt || new Date().toISOString(),
  };
}

function formatTime(value) {
  if (!value) return "";

  return new Date(value).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function App() {
  const [userName, setUserName] = useState("");
  const [joinedUserName, setJoinedUserName] = useState("");
  const [roomId, setRoomId] = useState("");
  const [draftRoomId, setDraftRoomId] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [joinedRooms, setJoinedRooms] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [socketReady, setSocketReady] = useState(false);
  const [notice, setNotice] = useState("");
  const socketRef = useRef(null);
  const roomIdRef = useRef("");
  const messagesEndRef = useRef(null);

  const canJoin = socketReady && userName.trim() && draftRoomId.trim();
  const canSend = socketReady && roomId && message.trim();

  const roomMessages = useMemo(
    () => messages.filter((item) => item.roomId === roomId || item.type === "system"),
    [messages, roomId],
  );

  function sendSocketMessage(type, payload) {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      setNotice("Server is not ready yet.");
      return false;
    }

    socketRef.current.send(JSON.stringify({ type, payload }));
    return true;
  }

  function handleJoin(event) {
    event.preventDefault();
    const nextUserName = userName.trim();
    const nextRoomId = draftRoomId.trim();

    if (!nextUserName || !nextRoomId) return;

    const sent = sendSocketMessage("join", {
      roomId: nextRoomId,
      userName: nextUserName,
    });

    if (sent) {
      setRoomId(nextRoomId);
      setJoinedUserName(nextUserName);
      setDraftRoomId("");
      setNotice("");
    }
  }

  function handleSwitchRoom(nextRoomId) {
    if (!nextRoomId || nextRoomId === roomId) return;

    const sent = sendSocketMessage("switch_Room", { roomId: nextRoomId });
    if (sent) {
      setRoomId(nextRoomId);
      setSidebarOpen(true);
      setNotice("");
    }
  }

  function handleSend(event) {
    event.preventDefault();
    const nextMessage = message.trim();

    if (!nextMessage) return;

    const sent = sendSocketMessage("chat", { message: nextMessage });
    if (sent) {
      setMessage("");
      setNotice("");
    }
  }

  useEffect(() => {
    roomIdRef.current = roomId;
  }, [roomId]);

  useEffect(() => {
    const ws = new WebSocket(WS_URL);
    socketRef.current = ws;

    ws.onopen = () => {
      if (socketRef.current !== ws) return;
      setSocketReady(true);
      setNotice("");
    };

    ws.onmessage = (event) => {
      if (socketRef.current !== ws) return;

      try {
        const data = JSON.parse(event.data);

        if (data.type === "chat" || data.type === "system") {
          setMessages((previous) => [...previous, normalizeMessage(data, roomIdRef.current)]);
        }

        if (data.type === "room-history") {
          const activeRoom = data.payload?.roomId || roomIdRef.current;
          const oldMessages = data.payload?.oldMessages || [];
          setMessages(oldMessages.map((item) => normalizeMessage(item, activeRoom)));
        }

        if (data.type === "onlineUsers") {
          setOnlineUsers(data.payload?.message || []);
        }

        if (data.type === "joined_rooms") {
          setJoinedRooms(data.payload?.message || []);
        }

        if (data.type === "error") {
          setNotice(data.payload?.message || "Something went wrong.");
        }
      } catch {
        setNotice("Received an unreadable message from the server.");
      }
    };

    ws.onerror = () => {
      if (socketRef.current !== ws) return;
      setSocketReady(false);
      setNotice("Backend is not reachable right now.");
    };

    ws.onclose = () => {
      if (socketRef.current !== ws) return;
      setSocketReady(false);
      setOnlineUsers([]);
    };

    return () => {
      ws.close();
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [roomMessages]);

  return (
    <main className={sidebarOpen ? "app-shell sidebar-open" : "app-shell sidebar-closed"}>
      <button
        className="drawer-tab"
        onClick={() => setSidebarOpen(true)}
        type="button"
        aria-label="Show rooms"
      >
        Rooms
      </button>

      <aside className="sidebar" aria-label="Chat navigation">
        <div className="brand">
          <span className="brand-mark">#</span>
          <div>
            <h1>Rooms</h1>
            <p>{joinedUserName || userName || "Pick a name"}</p>
          </div>
          <button
            className="sidebar-close"
            onClick={() => setSidebarOpen(false)}
            type="button"
            aria-label="Hide sidebar"
          >
            x
          </button>
        </div>

        <section className="panel">
          <div className="section-heading">
            <span>Joined</span>
            <span>{joinedRooms.length}</span>
          </div>

          <div className="room-list">
            {joinedRooms.length ? (
              joinedRooms.map((name) => (
                <button
                  className={name === roomId ? "room-button active" : "room-button"}
                  key={name}
                  onClick={() => handleSwitchRoom(name)}
                  type="button"
                >
                  <span>#</span>
                  {name}
                </button>
              ))
            ) : (
              <p className="empty-copy">No rooms yet.</p>
            )}
          </div>
        </section>

        <section className="panel grow">
          <div className="section-heading">
            <span>Online</span>
            <span>{onlineUsers.length}</span>
          </div>

          <div className="user-list">
            {onlineUsers.length ? (
              onlineUsers.map((name) => (
                <div className="user-row" key={name}>
                  <span className="presence-dot" />
                  <span>{name}</span>
                </div>
              ))
            ) : (
              <p className="empty-copy">No one here yet.</p>
            )}
          </div>
        </section>
      </aside>

      <section className="chat-surface" aria-label="Chat room">
        <header className="topbar">
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen((isOpen) => !isOpen)}
            type="button"
            aria-label={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
          >
            {sidebarOpen ? "x" : "Rooms"}
          </button>
          <div>
            <p className="eyebrow">Room</p>
            <h2>{roomId ? `#${roomId}` : "Join a room"}</h2>
          </div>
          <div className="topbar-meta">
            {onlineUsers.length} online
          </div>
        </header>

        <form className="join-strip" onSubmit={handleJoin}>
          <label>
            <span>Username</span>
            <input
              autoComplete="name"
              onChange={(event) => setUserName(event.target.value)}
              placeholder="name"
              type="text"
              value={userName}
            />
          </label>

          <label>
            <span>Room</span>
            <input
              onChange={(event) => setDraftRoomId(event.target.value)}
              placeholder="room name"
              type="text"
              value={draftRoomId}
            />
          </label>

          <button disabled={!canJoin} type="submit">
            Join
          </button>
        </form>

        {notice && <div className="notice">{notice}</div>}

        <div className="message-pane">
          {roomMessages.length ? (
            roomMessages.map((item) =>
              item.type === "system" ? (
                <div className="system-message" key={item.id}>
                  {item.message}
                </div>
              ) : (
                <article
                  className={
                    item.userName.trim().toLowerCase() === joinedUserName.trim().toLowerCase()
                      ? "message own"
                      : "message"
                  }
                  key={item.id}
                >
                  <div className="message-meta">
                    <strong>{item.userName}</strong>
                    <span>{item.time}</span>
                  </div>
                  <p>{item.message}</p>
                </article>
              ),
            )
          ) : (
            <div className="empty-state">
              <h3>Nothing here yet</h3>
              <p>Join a room and send the first message.</p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form className="composer" onSubmit={handleSend}>
          <input
            disabled={!roomId}
            onChange={(event) => setMessage(event.target.value)}
            placeholder={roomId ? "Write a message" : "Join a room first"}
            type="text"
            value={message}
          />
          <button disabled={!canSend} type="submit">
            Send
          </button>
        </form>
      </section>
    </main>
  );
}
