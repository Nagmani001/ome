"use client"
import OmegleChat from "@/components/chat";
import Spinner from "@/components/spinner";
import { onMount } from "@/lib/webrtc";
import { useEffect, useRef, useState } from "react";
import { sockett } from "../socket.js";

export default function Room() {
  const myVideo = useRef<HTMLVideoElement | null>(null);
  const strangerVideo = useRef<HTMLVideoElement | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (sockett.connected) {
      onMount(myVideo);
    }

  }, []);

  return <div className="flex h-screen ">
    <div className="flex flex-col gap-1 h-full w-2/5 ">
      <div className="h-1/2 ">
        {isConnected ?
          <video className="w-[770px] h-[480px] object-cover transform scale-x-[-1]" ref={strangerVideo} id="strangerVideo" autoPlay />
          : <Spinner />
        }
      </div>
      <div className="h-1/2 ">
        <video className="transform scale-x-[-1]" ref={myVideo} id="myVideo" autoPlay />
      </div>
    </div>

    <div className="w-3/5 h-screen ">
      <div className="h-full">
        <OmegleChat myVideo={myVideo as unknown as HTMLVideoElement | null} strangerVideo={strangerVideo as unknown as HTMLVideoElement | null} setIsCon={setIsConnected} />
      </div>
    </div>
  </div>
}
