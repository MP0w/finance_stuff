import { WebSocketServer } from "ws";
import { verifyToken } from "../endpoints/auth";
import getUuidByString from "uuid-by-string";
import { AIChat, defaultContext } from "./ai-chat";

let wss: WebSocketServer;

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
    const aiChat = new AIChat(defaultContext);

    if (!userId) {
      ws.close(4002, "Invalid authentication token");
      return;
    }

    // console.log(`Client connected: ${userId}`);

    ws.on("message", async (message) => {
      const payload: { message: string } = JSON.parse(message.toString());
      const response = aiChat.onUserMessage(payload.message);

      ws.send("---ai-response-boundary---");
      for await (const delta of response) {
        ws.send(delta);
      }
      ws.send("---ai-response-boundary-end---");
    });

    ws.on("close", () => {
      // console.log(`Client disconnected: ${userId}`);
    });
  });

  console.log("WebSocket server is running on ws://localhost:" + port);
}
