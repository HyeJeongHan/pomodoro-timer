import { del } from "@vercel/blob";
import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { blobUrl } = req.body as { blobUrl: string };
  if (!blobUrl) return res.status(400).json({ error: "missing blobUrl" });

  try {
    await del(blobUrl);
  } catch {}

  res.json({ ok: true });
}
