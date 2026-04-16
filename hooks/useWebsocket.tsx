import { useEffect, useRef, useState } from "react";

export type WebSocketMessage = {
  message: string;
};

type UseWebSocketResult = {
  messages: WebSocketMessage[];
  sendMessage: (message: string) => boolean;
  isConnected: boolean;
};

const RECONNECT_DELAY_MS = 2000;

const useWebsocket = (url: string, maxTries: number): UseWebSocketResult => {
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const shouldReconnectRef = useRef(true);

  const [messages, setMessages] = useState<WebSocketMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    shouldReconnectRef.current = true;

    const connect = () => {
      socketRef.current = new WebSocket(url);

      socketRef.current.onopen = () => {
        reconnectAttemptsRef.current = 0;
        setIsConnected(true);
      };

      socketRef.current.onmessage = (event) => {
        try {
          const parsedMessage = JSON.parse(event.data) as WebSocketMessage;
          setMessages((prev) => [...prev, parsedMessage]);
        } catch {
          setMessages((prev) => [...prev, { message: String(event.data) }]);
        }
      };

      socketRef.current.onclose = () => {
        setIsConnected(false);
        if (!shouldReconnectRef.current) return;

        if (reconnectAttemptsRef.current < maxTries) {
          reconnectAttemptsRef.current += 1;
          reconnectTimeoutRef.current = window.setTimeout(connect, RECONNECT_DELAY_MS);
        }
      };
    };

    connect();

    return () => {
      shouldReconnectRef.current = false;
      if (reconnectTimeoutRef.current !== null) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      socketRef.current?.close();
    };
  }, [url, maxTries]);

  const sendMessage = (message: string): boolean => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage) return false;

    if (socketRef.current?.readyState !== WebSocket.OPEN) {
      return false;
    }

    socketRef.current.send(JSON.stringify({ message: trimmedMessage }));
    return true;
  };

  return { messages, sendMessage, isConnected };
};

export default useWebsocket;
