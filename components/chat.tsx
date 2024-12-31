
import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send } from 'lucide-react'
import { handleReplyMessage, handleRestart, handleSendMessage, handleStart, handleStop, offSocket } from '@/lib/webrtc'

interface Message {
  sender: 'Stranger' | 'You'
  content: string
}

export default function OmegleChat({ strangerVideo, setIsCon }: { myVideo: null | HTMLVideoElement, strangerVideo: null | HTMLVideoElement, setIsCon: any }) {
  //just to let the effect run for the first time 
  const [stupidity, setStupidity] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [showFirst, setShowFirst] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null)



  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
    return () => {
      setInputMessage("");
    }
  }, [messages])

  useEffect(() => {
    handleReplyMessage(setMessages);
    return () => {
      offSocket();
    }
  }, [messages, stupidity])
  setTimeout(() => setStupidity(!stupidity), 5000);

  return (
    <Card className="w-full max-w-6xl mx-auto h-[960px] flex flex-col bg-slate-50">
      <CardContent className="flex-grow p-4 bg-slate-100 overflow-hidden">
        <ScrollArea className="h-full pr-4">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.sender === 'You' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${message.sender === 'You'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-800'
                    }`}
                >
                  <p className="font-semibold mb-1">{message.sender}:</p>
                  <p>{message.content}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="p-4 border-t">
        <div className="flex flex-col mr-5 space-y-2">
          <div className="flex gap-3">
            {showFirst ?
              <Button className="h-40 w-40" onClick={() => { setShowFirst(false); handleStart(strangerVideo, setIsCon) }} variant="default">Start</Button>
              :
              <Button className="h-40 w-40" onClick={() => { setShowFirst(false); handleRestart(strangerVideo, setIsCon) }} variant="default">Next</Button>
            }
            <Button className="h-40 w-40" onClick={() => { handleStop(strangerVideo, setIsCon) }} variant="secondary">Stop</Button>
          </div>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSendMessage(inputMessage, setMessages)
          }}
          className="flex w-full mt-3 space-x-2"
        >
          <div className="flex gap-3 w-full">

            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-grow h-12 px-4 w-4/5" // Increased the width to make it look better
            />
            <Button type="submit" className="h-15 flex items-center gap-2">
              Send
              <Send className="h-4 w-4" />
              <span className="sr-only">Send</span>
            </Button>
          </div>
        </form>
      </CardFooter>
    </Card>
  )
}

