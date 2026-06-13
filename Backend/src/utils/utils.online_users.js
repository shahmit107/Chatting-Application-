// it should return the users array, when the the user join and should be broadcasted to everyone 
export default function getOnlineUsers(users, roomId) {
    let room = users?.get(roomId)

    if(!room) {
        return []
    } else {
        let arr = [...room]
        return arr.map(element => (element.userName))
    }
}// returns an array 