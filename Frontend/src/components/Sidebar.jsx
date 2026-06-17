import { OnlineUsers } from "./OnlineUsers";
import { RoomList } from "./RoomList";

/**
 * Sidebar Component
 * Renders the room navigation list, online users in the room, and logout actions.
 */
export function Sidebar({
  currentUserName,
  joinedRooms,
  onlineUsers,
  roomId,
  onClose,
  onSwitchRoom,
  onLogout,
}) {
  return (
    <aside className="sidebar" aria-label="Chat navigation">
      {/* Brand logo, user details, and mobile drawer close button */}
      <div className="brand">
        <span className="brand-mark">#</span>
        <div>
          <h1>Rooms</h1>
          <p>{currentUserName || "Pick a name"}</p>
        </div>
        <button className="sidebar-close" onClick={onClose} type="button" aria-label="Hide sidebar">
          x
        </button>
      </div>

      {/* Render Room List */}
      <RoomList joinedRooms={joinedRooms} roomId={roomId} onSwitchRoom={onSwitchRoom} />
      
      {/* Render Active Users list */}
      <OnlineUsers onlineUsers={onlineUsers} />
      
      {/* Render Logout option if handler is provided */}
      {onLogout && (
        <div className="logout-btn-container">
          <button className="logout-btn" onClick={onLogout} type="button">
            Logout
          </button>
        </div>
      )}
    </aside>
  );
}
