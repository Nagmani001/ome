
import { v4 as uuidv4 } from 'uuid';

export function handleStart(socket, cb, io, roomArr) {
  const availableRoom = roomArr.find(room => room.isAvailable);
  if (!availableRoom) {
    const roomId = uuidv4();
    socket.join(roomId);
    roomArr.push({
      roomId,
      isAvailable: true,
      p1: {
        id: socket.id
      },
      p2: {
        id: null,
      }
    });
    cb("p1");
    socket.emit("roomId", roomId);
  } else {
    socket.join(availableRoom.roomId);
    cb("p2");
    roomArr.forEach(room => {
      if (room.roomId == availableRoom.roomId) {
        room.isAvailable = false;
        room.p2.id = socket.id;
      }
    });
    io.to(availableRoom.p1.id).emit("remote-socket", socket.id)
    socket.emit("remote-socket", availableRoom.p1.id)
    socket.emit("roomId", availableRoom.roomId)
  }
}

export function handleStop(socket, io, roomArr) {
  roomArr.forEach((room, index) => {
    if (room.p1.id == socket.id) {
      io.to(room.p2.id).emit("disconnected");
    } else if (room.p2.id == socket.id) {
      io.to(room.p1.id).emit("disconnected");
    }
  })
}

export function checkSocket(socket, roomArr) {
  for (const room of roomArr) {
    if (room.p1.id == socket.id) {
      return { type: "p1", p2Id: room.p2.id }
    } else if (room.p2.id == socket.id) {
      return { type: "p2", p1Id: room.p1.id }
    }
  }
  return false
}
