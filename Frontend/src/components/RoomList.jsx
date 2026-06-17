/**
 * RoomList Component
 * Displays the list of rooms the user has joined and allows them
 * to switch between them.
 */
export function RoomList({ joinedRooms, roomId, onSwitchRoom }) {
  return (
    <section className="panel">
      {/* List Header */}
      <div className="section-heading">
        <span>Joined</span>
        <span>{joinedRooms.length}</span>
      </div>

      {/* List of room trigger buttons */}
      <div className="room-list">
        {joinedRooms.length ? (
          joinedRooms.map((name) => (
            <button
              className={name === roomId ? "room-button active" : "room-button"}
              key={name}
              onClick={() => onSwitchRoom(name)}
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
  );
}
