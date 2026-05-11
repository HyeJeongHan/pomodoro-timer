self.addEventListener("push", (event) => {
  const data = event.data?.json() ?? {};
  event.waitUntil(
    self.registration.showNotification(data.title ?? "🍅 뽀모도로", {
      body: data.body ?? "",
      icon: "/favicon.svg",
      badge: "/favicon.svg",
      data: { url: "/" },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((list) => {
        const existing = list.find((c) => c.url === "/" && "focus" in c);
        if (existing) return existing.focus();
        return clients.openWindow("/");
      })
  );
});
