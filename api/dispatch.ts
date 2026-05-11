import webpush from "web-push";
import { list, del } from "@vercel/blob";
import type { VercelRequest, VercelResponse } from "@vercel/node";

webpush.setVapidDetails(
  "mailto:noreply@pomodoro-timer.app",
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

type Scheduled = {
  subscription: webpush.PushSubscription;
  fireAt: number;
  title: string;
  body: string;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.headers["authorization"] !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).end();
  }

  const { blobs } = await list({ prefix: "scheduled/" });
  const now = Date.now();

  const results = await Promise.allSettled(
    blobs.map(async (blob) => {
      const r = await fetch(blob.url);
      const data = (await r.json()) as Scheduled;
      if (data.fireAt > now) return;

      const payload = JSON.stringify({ title: data.title, body: data.body });
      await webpush.sendNotification(data.subscription, payload);
      await del(blob.url);
    })
  );

  const sent = results.filter((r) => r.status === "fulfilled").length;
  res.json({ sent, total: blobs.length });
}
