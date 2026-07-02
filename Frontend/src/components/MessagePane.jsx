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
  const isImage = message.messageType === "image";
  const isVideo = message.messageType === "video";
  const isDoc = message.messageType === "document";
  const isAudio = message.messageType === "audio";

  const handleDownload = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(message.mediaUrl);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = message.fileName || "downloaded-file";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed:", err);
      window.open(message.mediaUrl, "_blank");
    }
  };

  return (
    <article className={isOwn ? "message own" : "message"}>
      <div className="message-meta">
        <strong>{message.userName}</strong>
        <span>{message.time}</span>
      </div>
      
      {isImage && (
        <div className="chat-image-container">
          <img
            src={message.mediaUrl}
            alt={message.fileName || "Shared image"}
            className="chat-image"
            style={{
              maxWidth: "100%",
              maxHeight: "260px",
              borderRadius: "0.35rem",
              display: "block",
              objectFit: "contain",
            }}
          />
          <button
            className="image-download-action-btn"
            onClick={handleDownload}
            title="Download image"
            type="button"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download
          </button>
        </div>
      )}

      {isVideo && (
        <div className="chat-video-container" style={{ marginTop: "0.35rem" }}>
          <video
            controls
            src={message.mediaUrl}
            className="chat-video"
            style={{
              maxWidth: "100%",
              maxHeight: "300px",
              borderRadius: "0.35rem",
              display: "block",
            }}
          />
        </div>
      )}

      {isDoc && (
        <div className="chat-doc-container" style={{ marginTop: "0.35rem" }}>
          <a
            href={message.mediaUrl}
            target="_blank"
            rel="noreferrer"
            className="chat-doc-link"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.6rem 0.8rem",
              background: isOwn ? "rgba(255, 255, 255, 0.08)" : "#18181a",
              border: "1px solid #222224",
              borderRadius: "0.35rem",
              color: "#eeeeee",
              textDecoration: "none",
              fontSize: "0.88rem",
              fontWeight: "500",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
            <span className="doc-name" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "200px" }}>
              {message.fileName || "Open document"}
            </span>
            {message.fileSize && (
              <span className="doc-size" style={{ fontSize: "0.75rem", color: "#888888" }}>
                ({(message.fileSize / (1024 * 1024)).toFixed(2)} MB)
              </span>
            )}
          </a>
        </div>
      )}

      {isAudio && (
        <div className="chat-audio-container" style={{ marginTop: "0.35rem" }}>
          <audio
            controls
            src={message.mediaUrl}
            className="chat-audio"
            style={{
              maxWidth: "100%",
              display: "block",
            }}
          />
        </div>
      )}

      {!isImage && !isVideo && !isDoc && !isAudio && (
        <p>{message.message}</p>
      )}
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
