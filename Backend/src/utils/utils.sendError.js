export default function sendError(ws, err, messageToSend) {
  ws.send(
    JSON.stringify({
      type: "error",
      payload: {
        message: messageToSend + err,
      },
    }),
  );
}