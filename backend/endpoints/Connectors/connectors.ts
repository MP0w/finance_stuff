import { Application, Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import {
  ConnectorProvider,
  ConnectorProviderConfig,
} from "finance_stuff_connectors";
import { dbConnection, generateUUID } from "../../dbConnection";
import { Connections, Table } from "../../types";
import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const config: ConnectorProviderConfig = {
  debankAPIKey: process.env.DEBANK_API_KEY!,
  currencyAPIKey: process.env.CURRENCY_API_KEY!,
};

export const connectorProvider = new ConnectorProvider(config);

export function encryptAndStringifySettings(settings: Record<string, unknown>) {
  const string = JSON.stringify(settings);
  return encrypt(string);
}

function encrypt(text: string): string {
  const algorithm = "aes-256-cbc";
  const key = process.env.ENCRYPTION_KEY!;
  const iv = randomBytes(16);

  const cipher = createCipheriv(algorithm, Buffer.from(key, "hex"), iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  return iv.toString("hex") + ":" + encrypted;
}

export function decryptSettings(text: string): Record<string, unknown> {
  const algorithm = "aes-256-cbc";
  const key = process.env.ENCRYPTION_KEY!;

  const parts = text.split(":");
  const iv = Buffer.from(parts.shift()!, "hex");
  const encryptedText = parts.join(":");

  const decipher = createDecipheriv(algorithm, Buffer.from(key, "hex"), iv);
  let decrypted = decipher.update(encryptedText, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return JSON.parse(decrypted);
}

export async function getConnectionWithDecryptedSettings(userId: string) {
  return getAllConnections(userId).then((connections) => {
    return connections.map((c) => ({
      ...c,
      settings: decryptSettings(c.settings),
    }));
  });
}

async function getAllConnections(userId: string) {
  return await dbConnection<Connections>(Table.Connections)
    .select()
    .where({ user_id: userId })
    .limit(50);
}

export function connectorsRouter(app: Application) {
  app.get(
    "/connectors-settings",
    expressAsyncHandler(async (_, res) => {
      res.send(connectorProvider.connectorSettings);
    })
  );

  app.get(
    "/connections",
    expressAsyncHandler(async (req, res) => {
      const connections = await getAllConnections(req.userId);

      res.send(
        connections.map((c) => ({
          ...c,
          settings: undefined,
        }))
      );
    })
  );

  app.get(
    "/connections/:id",
    expressAsyncHandler(async (req, res) => {
      const connections = await dbConnection<Connections>(Table.Connections)
        .select()
        .where({ id: req.params.id, user_id: req.userId })
        .limit(1);

      const connection = connections.at(0);

      res.status(connection ? 200 : 401).send({
        ...connection,
        settings: undefined,
      });
    })
  );

  async function upsertConnection(id: string, req: Request, res: Response) {
    const { connector_id, account_id, settings } = req.body;

    if (!connector_id || !account_id || !settings) {
      throw Error("Invalid params");
    }

    await dbConnection<Connections>(Table.Connections)
      .insert({
        id,
        user_id: req.userId,
        connector_id,
        account_id,
        settings: encryptAndStringifySettings(settings),
        updated_at: new Date(),
      })
      .onConflict("id")
      .merge();

    res.send({});
  }

  app.post(
    "/connections",
    expressAsyncHandler(async (req, res) => {
      upsertConnection(generateUUID(), req, res);
    })
  );

  app.put(
    "/connections/:id",
    expressAsyncHandler(async (req, res) => {
      const connection = await dbConnection<Connections>(Table.Connections)
        .select()
        .where({ id: req.params.id, user_id: req.userId })
        .first();

      if (!connection) {
        throw Error("Invalid connection");
      }

      upsertConnection(req.params.id, req, res);
    })
  );

  app.delete(
    "/connections/:id",
    expressAsyncHandler(async (req, res) => {
      await dbConnection<Connections>(Table.Connections)
        .delete()
        .where({ id: req.params.id, user_id: req.userId });

      res.send({});
    })
  );
}
