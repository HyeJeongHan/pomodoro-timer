import webpush from "web-push";
import { list } from "@vercel/blob";
import type { VercelRequest, VercelResponse } from "@vercel/node";

webpush.setVapidDetails(
  `mailto:${process.env.VAPID_EMAIL}`,
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.headers["authorization"] !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).end();
  }

  const { blobs } = await list({ prefix: "subscriptions/" });

  const payload = JSON.stringify({
    title: "🍅 오늘 뽀모도로 했나요?",
    body: "집중 한 세션으로 하루를 마무리해보세요!",
  });

  const results = await Promise.allSettled(
    blobs.map(async (blob) => {
      const r = await fetch(blob.url);
      const sub = await r.json();
      return webpush.sendNotification(sub, payload);
    })
  );

  const sent = results.filter((r) => r.status === "fulfilled").length;
  res.json({ sent, total: blobs.length });
}
