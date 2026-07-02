import { useEffect, useState } from "react";
import { Composer } from "./components/Composer";
import { MessagePane } from "./components/MessagePane";
import { Sidebar } from "./components/Sidebar";
import { Topbar } from "./components/Topbar";
import { AuthPage } from "./components/AuthPage";
import { JoinRoomModal } from "./components/JoinRoomModal";
import { useChatSocket } from "./hooks/useChatSocket";
import { useAuth } from "./hooks/useAuth";
import "./App.css";

const DESKTOP_SIDEBAR_QUERY = "(min-width: 861px)";

function shouldOpenSidebar() {
  return window.matchMedia(DESKTOP_SIDEBAR_QUERY).matches;
}

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(shouldOpenSidebar);
  const [showJoinRoomModal, setShowJoinRoomModal] = useState(false);

  // Authentication State via custom hook
  const {
    user,
    isAuthenticated,
    authLoading,
    handleLoginSuccess,
    handleLogout,
    handleDeleteAccount,
  } = useAuth();

  const chat = useChatSocket(isAuthenticated);

  // Clean up chat state when user is no longer authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      localStorage.removeItem("lastActiveRoom");
      chat.clearChatState();
    }
  }, [isAuthenticated, authLoading]);

  // Synchronize username and restore active room with useChatSocket hook
  useEffect(() => {
    if (user && user.userName) {
      chat.setUserName(user.userName);

      if (user.joinedRooms) {
        chat.setJoinedRoomsList(user.joinedRooms);
      }

      const lastRoom = localStorage.getItem("lastActiveRoom");
      if (lastRoom && !chat.roomId) {
        chat.restoreActiveRoom(lastRoom, user.userName);
      }
    }
  }, [user, chat.roomId]);

  function handleSwitchRoom(nextRoomId) {
    if (chat.switchRoom(nextRoomId)) {
      setSidebarOpen(shouldOpenSidebar());
    }
  }

  useEffect(() => {
    const mediaQuery = window.matchMedia(DESKTOP_SIDEBAR_QUERY);

    function handleViewportChange(event) {
      setSidebarOpen(event.matches);
    }

    mediaQuery.addEventListener("change", handleViewportChange);
    return () => mediaQuery.removeEventListener("change", handleViewportChange);
  }, []);

  // Render Loading Screen
  if (authLoading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading application...</p>
      </div>
    );
  }

  // Render Authentication Page if not authenticated
  if (!isAuthenticated) {
    return <AuthPage onLoginSuccess={handleLoginSuccess} />;
  }

  // Render authenticated chat UI
  return (
    <main className={sidebarOpen ? "app-shell sidebar-open" : "app-shell sidebar-closed"}>
      <Sidebar
        currentUserName={chat.currentUserName}
        joinedRooms={chat.joinedRooms}
        onlineUsers={chat.onlineUsers}
        roomId={chat.roomId}
        onClose={() => setSidebarOpen(false)}
        onSwitchRoom={handleSwitchRoom}
        onLogout={handleLogout}
        onDeleteAccount={handleDeleteAccount}
      />

      {sidebarOpen && <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />}

      <section className="chat-surface" aria-label="Chat room">
        <Topbar
          roomId={chat.roomId}
          onlineCount={chat.onlineUsers.length}
          onlineUsers={chat.onlineUsers}
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen((isOpen) => !isOpen)}
          onJoinRoomClick={() => setShowJoinRoomModal(true)}
        />

        {chat.notice && <div className="notice">{chat.notice}</div>}

        <MessagePane
          joinedUserName={chat.currentUserName}
          messages={chat.roomMessages}
          messagesEndRef={chat.messagesEndRef}
        />

        <Composer
          canSend={chat.canSend}
          message={chat.message}
          roomId={chat.roomId}
          onMessageChange={chat.setMessage}
          onSend={chat.sendMessage}
          onMediaSend={chat.handleMediaSend}
          isUploading={chat.mediaUploading}
        />
      </section>

      <JoinRoomModal
        isOpen={showJoinRoomModal}
        onClose={() => {
          chat.setDraftRoomId("");
          setShowJoinRoomModal(false);
        }}
        draftRoomId={chat.draftRoomId}
        onDraftRoomIdChange={(e) => chat.setDraftRoomId(e.target.value)}
        onSubmit={(e) => {
          chat.joinRoom(e);
          setShowJoinRoomModal(false);
        }}
      />
    </main>
  );
}