import { put } from "@vercel/blob";
import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { subscription, delaySeconds, title, body } = req.body as {
    subscription: unknown;
    delaySeconds: number;
    title: string;
    body: string;
  };

  if (!subscription || !delaySeconds) return res.status(400).json({ error: "missing fields" });

  const id = crypto.randomUUID();
  const fireAt = Date.now() + delaySeconds * 1000;

  const { url } = await put(
    `scheduled/${id}.json`,
    JSON.stringify({ subscription, fireAt, title, body }),
    { access: "public", contentType: "application/json" }
  );

  res.status(201).json({ blobUrl: url });
}
