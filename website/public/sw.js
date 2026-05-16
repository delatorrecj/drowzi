const ALARMS = new Map();

self.addEventListener("message", (event) => {
  const data = event.data;
  if (!data || data.type !== "SCHEDULE_ALARM") return;
  const { alarmId, fireAt } = data;
  const existing = ALARMS.get(alarmId);
  if (existing) clearTimeout(existing);
  const delay = Math.max(0, fireAt - Date.now());
  const timer = setTimeout(() => {
    ALARMS.delete(alarmId);
    void fireAlarm(alarmId);
  }, delay);
  ALARMS.set(alarmId, timer);
});

async function fireAlarm(alarmId) {
  const clients = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
  const path = `/demo/gate?alarmId=${encodeURIComponent(alarmId)}&fired=1`;
  const url = new URL(path, self.location.origin).href;

  if (clients.length > 0) {
    for (const client of clients) {
      client.postMessage({ type: "ALARM_FIRE", alarmId });
      if ("focus" in client) await client.focus();
    }
  } else if (self.clients.openWindow) {
    await self.clients.openWindow(url);
  }

  if (self.registration.showNotification) {
    await self.registration.showNotification("Drowzi — time to wake up!", {
      body: "Complete your habit to turn off the alarm.",
      tag: `drowzi-alarm-${alarmId}`,
      data: { alarmId, url },
    });
  }
}

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const alarmId = event.notification.data?.alarmId;
  const url =
    event.notification.data?.url ??
    new URL(`/demo/gate?alarmId=${encodeURIComponent(alarmId ?? "")}`, self.location.origin).href;
  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((list) => {
      for (const client of list) {
        if ("focus" in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    }),
  );
});
