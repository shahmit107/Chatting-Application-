/**
 * Topbar Component
 * The header navigation bar showing room title, drawer toggles,
 * room join button, and active room participant counts.
 */
export function Topbar({
  roomId,
  onlineCount,
  onlineUsers = [],
  sidebarOpen,
  onToggleSidebar,
  onJoinRoomClick,
}) {
  return (
    <header className="topbar">
      {/* Drawer menu trigger button */}
      <button
        className="sidebar-toggle"
        onClick={onToggleSidebar}
        type="button"
        aria-label={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
      >
        {sidebarOpen ? "x" : "Rooms"}
      </button>

      {/* Room Name display */}
      <div>
        <p className="eyebrow">Room</p>
        <h2>{roomId ? `#${roomId}` : "Join a room"}</h2>
      </div>

      {/* Action buttons and online status count indicator */}
      <div className="topbar-actions">
        <button className="join-room-nav-btn" onClick={onJoinRoomClick} type="button">
          + Join Room
        </button>
        
        <div className="topbar-meta">
          <span>{onlineCount} online</span>
          
          {/* Tooltip listing active users inside the current room */}
          {onlineCount > 0 && (
            <div className="info-trigger-container">
              <button className="info-btn" type="button" aria-label="Online users list">
                ⓘ
              </button>
              <div className="info-tooltip">
                <h4>Online Users</h4>
                <ul>
                  {onlineUsers.map((user, idx) => (
                    <li key={idx}>
                      <span className="presence-dot" />
                      <span>{user}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
