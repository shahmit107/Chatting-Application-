function getUUID() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function formatTime(value) {
  if (!value) return "";

  return new Date(value).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function normalizeMessage(data, activeRoom) {
  if (data.type === "chat") {
    return {
      id: getUUID(),
      type: "chat",
      roomId: data.roomId || data.payload?.roomId || activeRoom,
      userName: data.userName || data.payload?.userName || "Unknown",
      message: data.message || data.payload?.message || "",
      messageType: data.messageType || data.payload?.messageType || "text",
      mediaUrl: data.mediaUrl || data.payload?.mediaUrl || "",
      cloudinaryPublicId: data.cloudinaryPublicId || data.payload?.cloudinaryPublicId || "",
      fileName: data.fileName || data.payload?.fileName || "",
      mimeType: data.mimeType || data.payload?.mimeType || "",
      fileSize: data.fileSize || data.payload?.fileSize || "",
      time: data.payload?.time || formatTime(data.createdAt),
      createdAt: data.createdAt || new Date().toISOString(),
    };
  }

  if (data.type === "system") {
    return {
      id: getUUID(),
      type: "system",
      roomId: data.roomId || data.payload?.roomId || activeRoom,
      message: data.payload?.message || data.message || "",
      createdAt: new Date().toISOString(),
    };
  }

  return {
    id: data._id || getUUID(),
    type: "chat",
    roomId: data.roomId || activeRoom,
    userName: data.userName || "Unknown",
    message: data.message || "",
    messageType: data.messageType || data.payload?.messageType || "text",
    mediaUrl: data.mediaUrl || data.payload?.mediaUrl || "",
    cloudinaryPublicId: data.cloudinaryPublicId || data.payload?.cloudinaryPublicId || "",
    fileName: data.fileName || data.payload?.fileName || "",
    mimeType: data.mimeType || data.payload?.mimeType || "",
    fileSize: data.fileSize || data.payload?.fileSize || "",
    time: formatTime(data.createdAt),
    createdAt: data.createdAt || new Date().toISOString(),
  };
}

export function isOwnMessage(messageUserName, joinedUserName) {
  return messageUserName.trim().toLowerCase() === joinedUserName.trim().toLowerCase();
}
