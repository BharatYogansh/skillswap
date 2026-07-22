import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import api from "../api.js";

export default function Chat() {
  const { matchId } = useParams();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const socketRef = useRef(null);

  useEffect(() => {
    api.get(`/messages/${matchId}`).then((r) => setMessages(r.data));

    const socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000", {
      auth: { token: localStorage.getItem("token") },
    });
    socketRef.current = socket;

    socket.emit("join_match", matchId, (ack) => {
      if (!ack.ok) console.error(ack.error);
    });

    socket.on("new_message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => socket.disconnect();
  }, [matchId]);

  function sendMessage(e) {
    e.preventDefault();
    if (!text.trim()) return;
    socketRef.current.emit("send_message", { matchId, text }, (ack) => {
      if (!ack.ok) console.error(ack.error);
    });
    setText("");
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10 flex flex-col h-[80vh]">
      <h1 className="font-display text-2xl mb-4">Chat</h1>
      <div className="flex-1 overflow-y-auto border border-ink/10 rounded p-4 space-y-2">
        {messages.map((m) => (
          <p key={m._id} className="text-sm">{m.text}</p>
        ))}
      </div>
      <form onSubmit={sendMessage} className="mt-4 flex gap-2">
        <input
          className="flex-1 border border-ink/20 rounded px-3 py-2"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message"
        />
        <button className="bg-ink text-paper rounded px-4" type="submit">Send</button>
      </form>
    </div>
  );
}
