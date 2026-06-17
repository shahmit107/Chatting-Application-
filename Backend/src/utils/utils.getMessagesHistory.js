import messageModel from "../model/model.message.js"

export default async function getOldMessages(ws, roomId) {
    const receivedMessages = await messageModel.find({ roomId }).sort({ createdAt: 1 })

    ws.send(JSON.stringify({
      type: "room-history",
      payload: {
        oldMessages: receivedMessages,
        roomId: roomId
      }
    }))
}