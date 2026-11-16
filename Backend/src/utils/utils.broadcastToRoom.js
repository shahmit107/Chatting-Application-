export default function broadcaster(roomId, message, users) { // here the roomID and the users are for the identification of the user which is to be sent the data 
    const targetedRooms = users?.get(roomId);
    if (!targetedRooms) return;

    const serializedMessage = JSON.stringify(message); // Serialize ONCE outside the loop

    targetedRooms?.forEach((element) => {
      if (element.readyState === 1) {
        // Guard ensuring the socket connection is open
        element.send(serializedMessage);
      }
    });
}
// it have the logic => which decides whom to sent