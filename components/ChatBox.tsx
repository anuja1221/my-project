"use client";

import useWebsocket from "@/hooks/useWebsocket";
import { FormEvent, useState } from "react";

type LocalMessage = {
  id: number;
  text: string;
};

export default function ChatBox() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [localMessages, setLocalMessages] = useState<LocalMessage[]>([]);

  const { messages, sendMessage, isConnected } = useWebsocket("ws://127.0.0.1:8000/ws/chat/", 3);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;

    const didSend = sendMessage(trimmed);
    if (!didSend) return;

    setLocalMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        text: trimmed,
      },
    ]);
    setInput("");
  };

  return (
    <div className="fixed right-4 bottom-4 z-50">
      {isOpen ? (
        <section className="w-[320px] rounded-2xl border border-zinc-200 bg-white shadow-xl">
          <header className="flex items-center justify-between rounded-t-2xl bg-zinc-900 px-4 py-3">
            <div>
              <h2 className="text-sm font-semibold text-white">Chat</h2>
              <p className="text-xs text-zinc-300">{isConnected ? "Connected" : "Connecting..."}</p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded px-2 py-1 text-xs text-zinc-200 transition hover:bg-zinc-700"
            >
              Close
            </button>
          </header>

          <div className="h-64 space-y-2 overflow-y-auto px-3 py-3">
            {localMessages.map((message) => (
              <div
                key={`local-${message.id}`}
                className="ml-auto max-w-[85%] rounded-xl bg-zinc-900 px-3 py-2 text-sm text-white"
              >
                {message.text}
              </div>
            ))}

            {messages.map((message, index) => (
              <div
                key={`server-${index}`}
                className="max-w-[85%] rounded-xl bg-zinc-100 px-3 py-2 text-sm text-zinc-800"
              >
                {message.message}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="border-t border-zinc-200 p-3">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Type a message..."
                className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200"
              />
              <button
                type="submit"
                disabled={!isConnected}
                className="rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-500"
              >
                Send
              </button>
            </div>
          </form>
        </section>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="rounded-full bg-zinc-900 px-4 py-3 text-sm font-medium text-white shadow-lg transition hover:bg-zinc-800"
        >
          Chat
        </button>
      )}
    </div>
  );
}
