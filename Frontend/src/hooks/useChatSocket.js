import { useEffect, useMemo, useRef, useState } from "react";
import { normalizeMessage } from "../utils/messages";
import { useWebSocket } from "./useWebSocket";

/**
 * useChatSocket
 * Manages the high-level application chat state (messages, rooms, users)
 * and leverages the underlying `useWebSocket` hook for connectivity.
 */
export function useChatSocket(isAuthenticated) {
  // 1. Hook State variables
  const [userName, setUserName] = useState("");
  const [joinedUserName, setJoinedUserName] = useState("");
  const [roomId, setRoomId] = useState("");
  const [draftRoomId, setDraftRoomId] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [joinedRooms, setJoinedRooms] = useState([]);
  const [notice, setNotice] = useState("");
  const [mediaUploading, setMediaUploading] = useState(false);

  // Refs for tracking values across renders without re-triggering effects
  const roomIdRef = useRef("");
  const joinedUserNameRef = useRef("");
  const messagesEndRef = useRef(null);

  // Sync state changes with refs so WebSocket callbacks can read fresh values
  useEffect(() => {
    roomIdRef.current = roomId;
  }, [roomId]);

  useEffect(() => {
    joinedUserNameRef.current = joinedUserName;
  }, [joinedUserName]);

  // Merge newly joined room into the list of joined rooms without duplicates
  function mergeJoinedRooms(nextRoom) {
    if (!nextRoom) return;
    setJoinedRooms((prev) => {
      const list = Array.isArray(nextRoom) ? nextRoom : [nextRoom];
      const cleanList = list.map((name) => name.trim()).filter(Boolean);
      return [...new Set([...prev, ...cleanList])];
    });
  }

  // Populate joined rooms directly (used when restoring sessions)
  function setJoinedRoomsList(rooms) {
    if (Array.isArray(rooms)) {
      setJoinedRooms((prev) => [...new Set([...prev, ...rooms])]);
    }
  }

  // Reset chat states (called during logout)
  function clearChatState() {
    setRoomId("");
    setJoinedUserName("");
    setMessages([]);
    setOnlineUsers([]);
    setJoinedRooms([]);
    setDraftRoomId("");
    setMessage("");
    setNotice("");
  }

  // Use our specialized WebSocket hook for low-level connection
  const { socketReady, sendMessage: wsSend } = useWebSocket({
    isAuthenticated,
    onConnect: (ws) => {
      setNotice("");
      // Rejoin active room on reconnect if states are set
      if (roomIdRef.current && joinedUserNameRef.current) {
        ws.send(
          JSON.stringify({
            type: "join",
            payload: { roomId: roomIdRef.current, userName: joinedUserNameRef.current },
          })
        );
      }
    },
    onMessage: (data) => {
      const activeRoom = data.payload?.roomId || roomIdRef.current;

      if (data.type === "chat" || data.type === "system") {
        setMessages((prev) => [...prev, normalizeMessage(data, activeRoom)]);
      } else if (data.type === "room-history") {
        const oldMessages = data.payload?.oldMessages || [];
        setMessages(oldMessages.map((item) => normalizeMessage(item, activeRoom)));
      } else if (data.type === "onlineUsers") {
        setOnlineUsers(data.payload?.message || []);
      } else if (data.type === "joined_rooms") {
        mergeJoinedRooms(data.payload?.message || []);
      } else if (data.type === "error") {
        setNotice(data.payload?.message || "Something went wrong.");
      }
    },
    onDisconnect: () => {
      setOnlineUsers([]);
    },
    onError: () => {
      setNotice("Backend server is not reachable. Retrying...");
    },
  });

  // Derived properties
  const canJoin = socketReady && userName.trim() && draftRoomId.trim();
  const canSend = socketReady && roomId && message.trim();
  const currentUserName = joinedUserName || userName;

  // When the socket becomes ready, check if there's a pending room to join.
  // This closes the race condition where restoreActiveRoom set the refs
  // but the socket wasn't connected yet, AND onConnect fired before the refs were set.
  useEffect(() => {
    if (socketReady && roomIdRef.current && joinedUserNameRef.current) {
      wsSend("join", { roomId: roomIdRef.current, userName: joinedUserNameRef.current });
    }
  }, [socketReady]);

  // Filter messages for the active room or system notices
  const roomMessages = useMemo(
    () => messages.filter((item) => item.roomId === roomId || item.type === "system"),
    [messages, roomId]
  );

  // Smooth scroll message container when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [roomMessages]);

  // Helper to send stringified messages over WebSocket with error feedback
  function sendSocketMessage(type, payload) {
    const sent = wsSend(type, payload);
    if (!sent) {
      setNotice("Server is not ready yet.");
    }
    return sent;
  }

  // User manually joins a room (Form Submit handler)
  function joinRoom(event) {
    event.preventDefault();
    const nextUserName = userName.trim();
    const nextRoomId = draftRoomId.trim();

    if (!nextUserName || !nextRoomId) return;

    if (sendSocketMessage("join", { roomId: nextRoomId, userName: nextUserName })) {
      setRoomId(nextRoomId);
      setJoinedUserName(nextUserName);
      mergeJoinedRooms(nextRoomId);
      setDraftRoomId("");
      setNotice("");
      localStorage.setItem("lastActiveRoom", nextRoomId);
    }
  }

  // Switch between already joined rooms
  function switchRoom(nextRoomId) {
    if (!nextRoomId || nextRoomId === roomId) return false;

    // If the user hasn't joined a room yet, the backend expects a "join" payload
    // instead of a "switch_Room" payload to prevent a null pointer crash.
    const isFirstJoin = !roomId;

    if (isFirstJoin) {
      if (sendSocketMessage("join", { roomId: nextRoomId, userName: currentUserName })) {
        setRoomId(nextRoomId);
        mergeJoinedRooms(nextRoomId);
        setNotice("");
        localStorage.setItem("lastActiveRoom", nextRoomId);
        return true;
      }
    } else {
      if (sendSocketMessage("switch_Room", { roomId: nextRoomId })) {
        setRoomId(nextRoomId);
        mergeJoinedRooms(nextRoomId);
        setNotice("");
        localStorage.setItem("lastActiveRoom", nextRoomId);
        return true;
      }
    }
    
    return false;
  }

  // Send a new chat message (Form Submit handler)
  function sendMessage(event) {
    event.preventDefault();
    const nextMessage = message.trim();

    if (!nextMessage) return;

    if (sendSocketMessage("chat", { messageType: "text", message: nextMessage })) {
      setMessage("");
      setNotice("");
    }
  }

  // Send a media message (image/video/document/audio) via HTTP upload + WebSocket broadcast
  async function handleMediaSend(event, mediaType) {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset the input value so selecting the same file again triggers change event
    event.target.value = "";

    const fieldNames = {
      image: "image",
      video: "video",
      document: "file",
      audio: "audio",
    };

    const fieldName = fieldNames[mediaType];
    if (!fieldName) {
      setNotice("Unsupported media type.");
      return;
    }

    const formData = new FormData();
    formData.append(fieldName, file);

    const token = localStorage.getItem("accessToken");
    const endpoints = {
      image: "http://localhost:8080/api/media/upload/image",
      video: "http://localhost:8080/api/media/upload/video",
      document: "http://localhost:8080/api/media/upload/document",
      audio: "http://localhost:8080/api/media/upload/audio",
    };

    const endpoint = endpoints[mediaType];
    if (!endpoint) {
      setNotice("Unsupported media type.");
      return;
    }

    // Check if the WebSocket is connected before uploading
    if (!socketReady) {
      setNotice("Cannot send files: Chat server is not connected.");
      return;
    }

    try {
      setNotice("");
      setMediaUploading(true);
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok && data.type === "success") {
        sendSocketMessage("chat", {
          messageType: data.payload.messageType,
          mediaUrl: data.payload.mediaUrl,
          cloudinaryPublicId: data.payload.cloudinaryPublicId,
          fileName: data.payload.fileName,
          mimeType: data.payload.mimeType,
          fileSize: data.payload.fileSize,
        });
      } else {
        const errMsg = data.payload?.error || data.payload?.message || "Failed to upload file.";
        setNotice(errMsg);
        console.error(`${mediaType} upload error:`, errMsg);
      }
    } catch (err) {
      setNotice(`Unable to connect to server for ${mediaType} upload.`);
      console.error(`${mediaType} upload connection error:`, err);
    } finally {
      setMediaUploading(false);
    }
  }

  // Restores active room on initial mount or connection reopen
  function restoreActiveRoom(restoredRoomId, restoredUserName) {
    if (!restoredRoomId || !restoredUserName) return;
    setRoomId(restoredRoomId);
    roomIdRef.current = restoredRoomId;
    setJoinedUserName(restoredUserName);
    joinedUserNameRef.current = restoredUserName;
    mergeJoinedRooms(restoredRoomId);

    // Try to send immediately. If the socket is fully connected, it sends.
    // If it's not connected yet, it gracefully returns false and `onConnect` will catch it later!
    sendSocketMessage("join", { roomId: restoredRoomId, userName: restoredUserName });
  }

  return {
    canJoin,
    canSend,
    currentUserName,
    draftRoomId,
    joinedRooms,
    joinedUserName,
    message,
    messagesEndRef,
    notice,
    onlineUsers,
    roomId,
    roomMessages,
    userName,
    joinRoom,
    sendMessage,
    handleMediaSend,
    mediaUploading,
    setDraftRoomId,
    setMessage,
    setUserName,
    switchRoom,
    restoreActiveRoom,
    clearChatState,
    setJoinedRoomsList,
  };
}
