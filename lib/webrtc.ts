import { sockett } from "../app/socket.js"

let socket: any;
let stream: null | MediaStream;
let type: any;
let remoteSocketId: any;
let peer: RTCPeerConnection | null;
let roomId: any;


export const onMount = async (myVideo: any) => {
  const connSocket = sockett;
  const connStream = await navigator.mediaDevices.getUserMedia({
    audio: true, video: {
      width: { ideal: 770 },
      height: { ideal: 480 }
    }
  });
  const videoTrack = connStream.getVideoTracks()[0];
  const videoStream = new MediaStream([videoTrack]);
  socket = connSocket;
  stream = connStream;
  if (myVideo.current) {
    myVideo.current.srcObject = videoStream;
  }
}

export function handleStart(strangerVideo: any, setIsCon: any) {
  setIsCon(false);
  socket?.off('roomId');
  socket?.off('remote-socket');
  socket?.off('sdp:reply');
  socket?.off('ice:reply');
  socket?.off('disconnected');

  if (!socket) {
    console.log("socket did not exist")
    return;
  }
  socket.emit("start", (person: any) => {
    type = person;
    console.log("i got type assigned to me")
  });

  socket.on("roomId", (id: any) => {
    console.log("i got the roomId")
    roomId = id
  })
  socket.on("remote-socket", (id: number) => {
    remoteSocketId = id;

    peer = new RTCPeerConnection();
    peer.onnegotiationneeded = () => {
      console.log("negotiotion needed");
      webRTC(type, peer);
    }
    peer.onicecandidate = (e: any) => {
      console.log("ice candidate found");
      if (e.candidate) {
        socket?.emit("ice:send", { candidate: e.candidate, to: remoteSocketId })
      }
    }
    start(peer, strangerVideo);
    console.log("started");
    setIsCon(true);
  });

  socket.on("sdp:reply", async ({ sdp }: { sdp: any }) => {
    await peer?.setRemoteDescription(new RTCSessionDescription(sdp));
    console.log("sdp reply came and remote description set")
    if (type == "p2") {
      const ans = await peer?.createAnswer();
      await peer?.setLocalDescription(ans);
      socket?.emit("sdp:send", { sdp: peer?.localDescription });
    }
  });
  socket.on("ice:reply", async ({ candidate }: { candidate: any }) => {
    console.log("ice reply came");
    await peer?.addIceCandidate(candidate);
  });

  socket.on("disconnected", () => {
    console.log("disconnected");
    setIsCon(false);
  })
}

async function webRTC(type: any, peer: any) {
  if (type == "p1") {
    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    socket?.emit("sdp:send", { sdp: peer.localDescription });
  }
}

async function start(peer: any, strangerVideo: any) {
  try {
    if (peer) {
      if (!stream) { return; }
      stream.getTracks().forEach(track => peer.addTrack(track, stream));

      peer.ontrack = async (e: any) => {
        console.log("track came ");
        if (strangerVideo.current) {
          strangerVideo.current.srcObject = e.streams[0];
          try {
            await strangerVideo.current.play();
            console.log("video playback started");
          } catch (err) {
            console.log("error occured");
            console.log(err);
          }
        }
      }
    }
  } catch (ex) {
    console.log(ex);
  }
}

export function handleStop(strangerVideo: any, setIsCon: any) {
  if (peer) {
    peer.close();
  }
  socket?.off("roomId");
  socket?.off("remote-socket");
  socket?.off("sdp:reply");
  socket?.off("ice:reply");

  roomId = null;
  remoteSocketId = null;
  peer = null;
  type = null
  socket.emit("stop");

  if (strangerVideo.current) {
    strangerVideo.current.srcObject = null;
  }
  setIsCon(false);
}

export function handleRestart(strangerVideo: any, setIsCon: any) {
  handleStop(strangerVideo, setIsCon);
  handleStart(strangerVideo, setIsCon);
}

export function handleSendMessage(input: any, setMessages: any) {
  setMessages((prevMessages: any) => [...prevMessages, { sender: "You", content: input }])
  socket.emit("message-send", { input, type, roomId });
}

export function handleReplyMessage(setMessages: any) {
  socket?.on("message-reply", (reply: any) => {
    setMessages((prevMessages: any) => [...prevMessages, { sender: "Stranger", content: reply }])
  })
}

export function offSocket() {
  socket?.off("message-reply")
}

