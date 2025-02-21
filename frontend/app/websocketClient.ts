import { useCallback, useEffect, useRef, useState } from "react";
import { useUserState } from "./UserState";
import { useTranslation } from "react-i18next";

export type ChatMessage = {
  role: "user" | "assistant" | "error";
  content: string;
  default?: boolean;
};

export function useAIChat() {
  return useWebSocket(process.env.NEXT_PUBLIC_WS_URL!);
}

function useWebSocket(url: string) {
  const { t } = useTranslation();

  const defaultMessages: ChatMessage[] = [
    {
      role: "assistant",
      content: t("chatTab.defaultMessages.1"),
      default: true,
    },
    {
      role: "assistant",
      content: t("chatTab.defaultMessages.2"),
      default: true,
    },
  ];

  const { user } = useUserState();
  const [token, setToken] = useState<string | undefined>(undefined);
  const [liveMessage, setLiveMessage] = useState<ChatMessage | undefined>(
    undefined
  );
  const liveMessageRef = useRef<ChatMessage | undefined>(undefined);
  const [messages, setMessages] = useState<ChatMessage[]>(defaultMessages);
  const [isConnected, setIsConnected] = useState<boolean | undefined>(
    undefined
  );
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);
  const retryAttempts = useRef(0);

  useEffect(() => {
    if (!user) {
      return;
    }

    user.idToken().then((token) => {
      setToken(token);
    });
  }, [user]);

  const connectWebSocket = useCallback(() => {
    if (!token) {
      return;
    }

    setIsConnected(undefined);

    ws.current = new WebSocket(url, token);

    ws.current.onopen = () => {
      console.log("Connected to WebSocket server");
      setIsConnected(true);
      retryAttempts.current = 0;
      setMessages((prevMessages) =>
        prevMessages.filter((msg) => msg.role !== "error")
      );
    };

    ws.current.onmessage = (event) => {
      const eventString = event.data.toString();
      const payload:
        | { type: "chat-state"; chatId: string; messages: ChatMessage[] }
        | { type: "message"; start?: boolean; end?: boolean; chunk?: string } =
        JSON.parse(eventString);

      if (payload.type === "message") {
        if (payload.start) {
          liveMessageRef.current = {
            role: "assistant",
            content: "",
          };
          setLiveMessage(liveMessageRef.current);
        } else if (payload.end) {
          if (liveMessageRef.current) {
            const liveMessage = {
              role: liveMessageRef.current.role,
              content: liveMessageRef.current.content,
            };

            setMessages((prevMessages) => [...prevMessages, liveMessage]);
          }
          liveMessageRef.current = undefined;
          setLiveMessage(undefined);
        } else if (liveMessageRef.current && payload.chunk) {
          liveMessageRef.current = {
            ...liveMessageRef.current,
            content: (liveMessageRef.current?.content || "") + payload.chunk,
          };
          setLiveMessage(liveMessageRef.current);
        }
      } else if (payload.type === "chat-state") {
        setMessages(() => {
          if (!payload.messages.length) {
            return defaultMessages;
          }

          return payload.messages;
        });
      }
    };

    ws.current.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.current.onclose = (e) => {
      console.log("Disconnected from WebSocket server", e);
      setIsConnected(false);
      setMessages((prevMessages) => {
        if (
          prevMessages.length > 0 &&
          prevMessages[prevMessages.length - 1].role === "error"
        ) {
          return prevMessages;
        }

        return [
          ...prevMessages,
          {
            role: "error",
            content: "Disconnected, we will try to recconect",
          },
        ];
      });
    };
  }, [url, token]);

  useEffect(() => {
    if (isConnected === false) {
      retryAttempts.current += 1;
      console.log("Attempts: " + retryAttempts.current);

      const delay = Math.min(retryAttempts.current * 15_000, 600_000);
      reconnectTimeout.current = setTimeout(() => {
        console.log("Attempting to reconnect websocket...");
        connectWebSocket();
      }, delay);
    }

    return () => {
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
    };
  }, [isConnected, connectWebSocket]);

  useEffect(() => {
    if (!token) {
      ws.current?.close(1000, "token not set");
      return;
    }

    connectWebSocket();

    return () => {
      ws.current?.close();
    };
  }, [url, token, connectWebSocket]);

  const sendMessage = (message: string) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          role: "user",
          content: message,
        },
      ]);
      ws.current.send(JSON.stringify({ message }));
      return true;
    }

    return false;
  };

  const clear = () => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ clear: true }));
      return true;
    }

    return false;
  };

  return {
    messages,
    sendMessage,
    liveMessage,
    disconnected: isConnected === false,
    isConnecting: isConnected === undefined,
    clear,
  };
}
