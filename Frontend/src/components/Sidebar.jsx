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
  onDeleteAccount,
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
      
      {/* Render Delete Account and Logout options if handlers are provided */}
      {(onDeleteAccount || onLogout) && (
        <div className="logout-btn-container">
          {onDeleteAccount && (
            <button className="delete-btn" onClick={onDeleteAccount} type="button">
              Delete Permanently Account
            </button>
          )}
          {onLogout && (
            <button className="logout-btn" onClick={onLogout} type="button">
              Logout
            </button>
          )}
        </div>
      )}
    </aside>
  );
}
