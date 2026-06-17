/**
 * Composer Component
 * The bottom text input bar that lets authenticated users draft and send
 * chat messages into the active room.
 */
export function Composer({ canSend, message, roomId, onMessageChange, onSend }) {
  return (
    <form className="composer" onSubmit={onSend}>
      {/* Message input field */}
      <input
        disabled={!roomId} // Locked until user enters a room
        onChange={(event) => onMessageChange(event.target.value)}
        placeholder={roomId ? "Write a message" : "Join a room first"}
        type="text"
        value={message}
      />
      {/* Send button */}
      <button disabled={!canSend} type="submit">
        Send
      </button>
    </form>
  );
}
