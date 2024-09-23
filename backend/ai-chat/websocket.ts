import { WebSocketServer } from "ws";
import { verifyToken } from "../endpoints/auth";
import getUuidByString from "uuid-by-string";
import { AIChat } from "./ai-chat";
import { generateUUID } from "../dbConnection";
import NodeCache from "node-cache";

let wss: WebSocketServer;
const chatCache = new NodeCache({ stdTTL: 60 * 60 });

async function auth(token: string): Promise<string | undefined> {
  const user = await verifyToken(token);
  const userId = getUuidByString(user.uid);

  return userId;
}

export function startWebsocketServer() {
  const port = Number(process.env.WS_PORT ?? 4152);
  wss = new WebSocketServer({ port });

  wss.on("connection", async (ws, _) => {
    const token = ws.protocol;

    if (!token) {
      ws.close(4001, "Authentication token missing");
      return;
    }

    const userId = await auth(token);
    const id = generateUUID();

    if (!userId) {
      ws.close(4002, "Invalid authentication token");
      return;
    }

    const cachedChat = chatCache.get(userId) as AIChat | undefined;
    cachedChat?.refreshContext();

    const aiChat = cachedChat ?? (await AIChat.createChat(id, userId));
    chatCache.set(userId, aiChat);

    function sendChatState() {
      ws.send(
        JSON.stringify({
          type: "chat-state",
          chatId: id,
          messages: aiChat.messages,
        })
      );
    }

    sendChatState();

    ws.on("message", async (message) => {
      const payload: { message?: string; clear?: boolean } = JSON.parse(
        message.toString()
      );

      if (payload.clear ?? false) {
        aiChat.clear();
        sendChatState();
      }

      if (!payload.message) {
        return;
      }

      try {
        const response = aiChat.onUserMessage(payload.message);

        ws.send(JSON.stringify({ type: "message", start: true }));
        for await (const delta of response) {
          ws.send(JSON.stringify({ type: "message", chunk: delta }));
        }
        ws.send(JSON.stringify({ type: "message", end: true }));
      } catch (error) {
        console.error(error);
      }
    });

    ws.on("close", () => {
      chatCache.set(userId, aiChat);
    });
  });

  console.log("WebSocket server is running on ws://localhost:" + port);
}
