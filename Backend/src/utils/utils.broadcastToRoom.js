export default function broadcaster(roomId, message, users) { // here the roomID and the users are for the identification of the user which is to be sent the data 
    const targetedRooms = users?.get(roomId);
    targetedRooms.forEach((element) => {
      if (element.readyState === 1) {
        // Guard ensuring the socket connection is open
        element.send(JSON.stringify(message));
      }
    });
}
// it have the logic => which decides whom to sent