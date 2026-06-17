/**
 * JoinRoomModal Component
 * Renders a dialog pop-up prompting the user to type in a room name
 * they want to connect to.
 */
export function JoinRoomModal({ isOpen, onClose, draftRoomId, onDraftRoomIdChange, onSubmit }) {
  // If the modal state is closed, render nothing
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h3>Join a Chat Room</h3>
        <p className="auth-subtitle">Enter a room name to connect</p>
        
        <form onSubmit={onSubmit} className="auth-form">
          {/* Room Name input field */}
          <label className="auth-field">
            <span>Room Name</span>
            <input
              type="text"
              placeholder="e.g. general, lobby"
              value={draftRoomId}
              onChange={onDraftRoomIdChange}
              autoFocus
              required
            />
          </label>
          
          {/* Dialog Action Buttons */}
          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="auth-btn">
              Join
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
