import { io, Socket } from "socket.io-client";
import { PersonQueue } from "../types/QueueTypes";
import { showChatMessage } from "../Chat";

var socket: Socket;
var connectedUserId: string;
export function connectToServerAndEnterQueue(personObj: PersonQueue) {

  const SERVER_URL = process.env.SERVER_URL || "http://localhost:8000";

  socket = io(SERVER_URL, { autoConnect: false });

  socket.on("connection", () => {
    console.log(
      `you connected to the server at ${SERVER_URL} with id ${socket.id}`
    );
  });

  socket.connect();
  // TODO: combine to same channel
  console.log("personObj: ", personObj);
  socket.emit("setup info for queue", personObj);
  //catch all listener for debugging
  socket.onAny((event, ...args) => {
    console.log(event, args);
  });

  socket.on("test", (req, res) => {
      console.log("received req", req);
  })

  const matchedPerson = new Promise<any>((resolve, reject) => {
    socket.on("waiting for queue", (req, res) => {
      console.log("response from match: ", req);
        console.log("you have connected with: ", req.displayName);
        connectedUserId = req.socketId;
        listenForMessages();
        resolve(req)
    });
  })

  return matchedPerson

}

function listenForMessages() {
  socket.on("private message", (req, res) => {
    console.log("received message: ", req);
    showChatMessage(req);
  });
}

export function sendMsg(msg: string) {
  socket.emit("private message", {
    content: msg,
    to: connectedUserId,
  });
}
