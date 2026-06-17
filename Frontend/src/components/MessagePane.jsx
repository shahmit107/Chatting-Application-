import { isOwnMessage } from "../utils/messages";

/**
 * MessagePane Component
 * Renders the main chat message area containing historical and incoming chat bubbles.
 */
export function MessagePane({ joinedUserName, messages, messagesEndRef }) {
  return (
    <div className="message-pane">
      {/* Centered linear column container for messages */}
      <div className="message-stream">
        {messages.length ? (
          messages.map((item) =>
            item.type === "system" ? (
              <SystemMessage key={item.id} message={item.message} />
            ) : (
              <ChatMessage
                isOwn={isOwnMessage(item.userName, joinedUserName)}
                key={item.id}
                message={item}
              />
            )
          )
        ) : (
          <EmptyMessages />
        )}
        {/* Invisible anchor element to scroll down to */}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}

/**
 * SystemMessage Component
 * Displays system logs/notices (e.g. "User joined", "User disconnected").
 */
function SystemMessage({ message }) {
  return <div className="system-message">{message}</div>;
}

/**
 * ChatMessage Component
 * Displays individual chat cards, aligned to the right (own messages) or left (others).
 */
function ChatMessage({ isOwn, message }) {
  return (
    <article className={isOwn ? "message own" : "message"}>
      <div className="message-meta">
        <strong>{message.userName}</strong>
        <span>{message.time}</span>
      </div>
      <p>{message.message}</p>
    </article>
  );
}

/**
 * EmptyMessages Component
 * Displays placeholder instructions when room messages are empty.
 */
function EmptyMessages() {
  return (
    <div className="empty-state">
      <h3>Nothing here yet</h3>
      <p>Join a room and send the first message.</p>
    </div>
  );
}
