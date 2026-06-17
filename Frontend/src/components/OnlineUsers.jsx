/**
 * OnlineUsers Component
 * Renders the list of active/online users in the current chat room
 * inside the sidebar panel.
 */
export function OnlineUsers({ onlineUsers }) {
  // Deduplicate online users so we don't render the same person multiple times 
  // (e.g. if they connect from multiple browser tabs)
  const uniqueUsers = [...new Set(onlineUsers)];

  return (
    <section className="panel grow">
      {/* Header showing active user count */}
      <div className="section-heading">
        <span>Online</span>
        <span>{uniqueUsers.length}</span>
      </div>

      {/* Render list of user names */}
      <div className="user-list">
        {uniqueUsers.length ? (
          uniqueUsers.map((name) => (
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
  );
}
