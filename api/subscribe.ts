import { put } from "@vercel/blob";
import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const subscription = req.body as { endpoint: string };
  if (!subscription?.endpoint) return res.status(400).json({ error: "invalid subscription" });

  const id = Buffer.from(subscription.endpoint).toString("base64url").slice(0, 20);

  await put(`subscriptions/${id}.json`, JSON.stringify(subscription), {
    access: "public",
    contentType: "application/json",
    allowOverwrite: true,
  });

  res.status(201).json({ ok: true });
}
