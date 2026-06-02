export type ScheduledAlarm = {
  alarmId: string;
  fireAt: number;
};

const SW_MESSAGE_TYPE = "SCHEDULE_ALARM";

export function scheduleAlarmInPage(
  fireAt: number,
  onFire: () => void,
): () => void {
  const delay = Math.max(0, fireAt - Date.now());
  const id = window.setTimeout(onFire, delay);
  return () => window.clearTimeout(id);
}

export async function scheduleAlarmInServiceWorker(
  alarmId: string,
  fireAt: number,
): Promise<boolean> {
  if (!("serviceWorker" in navigator)) return false;
  const reg = await navigator.serviceWorker.ready.catch(() => null);
  if (!reg?.active) return false;
  reg.active.postMessage({
    type: SW_MESSAGE_TYPE,
    alarmId,
    fireAt,
  } satisfies ScheduledAlarm & { type: string });
  return true;
}

export function playAlarmSound(): () => void {
  const ctx = new AudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "square";
  osc.frequency.value = 880;
  gain.gain.value = 0.15;
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  const interval = window.setInterval(() => {
    osc.frequency.value = osc.frequency.value === 880 ? 660 : 880;
  }, 400);
  return () => {
    window.clearInterval(interval);
    osc.stop();
    void ctx.close();
  };
}

export const ALARM_FIRED_STORAGE_KEY = "drowzi-demo-alarm-fired";
