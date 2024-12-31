import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import { checkSocket, handleStart, handleStop } from "./lib.js";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

const httpServer = createServer(handler);
app.prepare().then(() => {

  const io = new Server(httpServer);

  let roomArr = [];
  io.on("connection", (socket) => {
    console.log("client connected");
    socket.on("start", cb => {
      handleStart(socket, cb, io, roomArr);
      console.log("roomAssigned to client");
    })
    socket.on("disconnect", () => {
      handleStop(socket, io, roomArr);
      console.log("client disconnected");
    })
    socket.on("stop", () => {
      handleStop(socket, io, roomArr);
      console.log("cilent disconnected");
    })


    socket.on("sdp:send", ({ sdp }) => {
      if (sdp) {
        let res = checkSocket(socket, roomArr);
        if (res) {
          if (res.type == "p1") {
            res.p2Id && io.to(res.p2Id).emit("sdp:reply", { sdp, from: socket.id })
            console.log("sdp sent to p2");
          } else if (res.type == "p2") {
            res.p1Id && io.to(res.p1Id).emit("sdp:reply", { sdp, from: socket.id })
            console.log("sdp sent to p1");
          }
        }
      }
    });

    socket.on("ice:send", ({ candidate }) => {
      if (candidate) {
        let res = checkSocket(socket, roomArr);
        if (res) {
          if (res.type == "p1") {
            res.p2Id && io.to(res.p2Id).emit("ice:reply", { candidate, from: socket.id })
            console.log("ice sent to p2");
          } else if (res.type == "p2") {
            res.p1Id && io.to(res.p1Id).emit("ice:reply", { candidate, from: socket.id })
            console.log("ice sent to p1");
          }
        }
      }
    });

    socket.on("message-send", ({ input, type, roomId }) => {
      socket.emit("room-connected");
      roomArr.forEach(room => {
        if (room.roomId == roomId) {
          if (type == "p1") {
            if (room.p2.id) {
              io.to(room.p2.id).emit("message-reply", input);
            }
          } else if (type == "p2") {
            if (room.p1.id) {
              io.to(room.p1.id).emit("message-reply", input);
            }
          }
        }
      })
    });
  });

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
