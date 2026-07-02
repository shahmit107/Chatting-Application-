/**
 * Composer Component
 * The bottom text input bar that lets authenticated users draft and send
 * chat messages into the active room.
 */
export function Composer({ canSend, message, roomId, onMessageChange, onSend, onMediaSend, isUploading }) {
  return (
    <form className="composer" onSubmit={onSend}>
      <div className="composer-actions">
        {/* Image upload */}
        <label className="media-upload-btn" title="Send Image">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21 15 16 10 5 21"/>
          </svg>
          <input
            type="file"
            accept="image/jpeg, image/png, image/webp"
            disabled={!roomId || isUploading}
            onChange={(e) => onMediaSend(e, "image")}
            style={{ display: "none" }}
          />
        </label>

        {/* Video upload */}
        <label className="media-upload-btn" title="Send Video">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="23 7 16 12 23 17 23 7"/>
            <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
          </svg>
          <input
            type="file"
            accept="video/mp4, video/webm, video/quicktime"
            disabled={!roomId || isUploading}
            onChange={(e) => onMediaSend(e, "video")}
            style={{ display: "none" }}
          />
        </label>

        {/* Document upload */}
        <label className="media-upload-btn" title="Send Document">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
          </svg>
          <input
            type="file"
            accept="application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            disabled={!roomId || isUploading}
            onChange={(e) => onMediaSend(e, "document")}
            style={{ display: "none" }}
          />
        </label>

        {/* Audio upload */}
        <label className="media-upload-btn" title="Send Audio">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18V5l12-2v13"/>
            <circle cx="6" cy="18" r="3"/>
            <circle cx="18" cy="16" r="3"/>
          </svg>
          <input
            type="file"
            accept="audio/mpeg, audio/ogg, audio/wav, audio/webm, audio/x-m4a, audio/mp4"
            disabled={!roomId || isUploading}
            onChange={(e) => onMediaSend(e, "audio")}
            style={{ display: "none" }}
          />
        </label>
      </div>

      {/* Message input field */}
      <input
        disabled={!roomId || isUploading} // Locked until user enters a room or upload completes
        onChange={(event) => onMessageChange(event.target.value)}
        placeholder={
          isUploading 
            ? "Uploading file..." 
            : roomId 
              ? "Write a message" 
              : "Join a room first"
        }
        type="text"
        value={message}
      />
      {/* Send button */}
      <button disabled={!canSend || isUploading} type="submit">
        Send
      </button>
    </form>
  );
}
