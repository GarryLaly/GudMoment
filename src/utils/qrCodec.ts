export interface QRPayload {
  v: number;
  title: string;
  date: string;
  time?: string;
  timezone: string;
  icon: string;
  color: string;
}

const CURRENT_VERSION = 1;
const MAX_TITLE_LENGTH = 100;

export function encodeMomentForQR(payload: QRPayload): string {
  const truncated = {
    ...payload,
    title: payload.title.slice(0, MAX_TITLE_LENGTH),
    v: CURRENT_VERSION,
  };
  if (!truncated.time) {
    delete truncated.time;
  }
  return JSON.stringify(truncated);
}

export function decodeMomentFromQR(data: string): QRPayload | null {
  try {
    const parsed = JSON.parse(data);
    if (parsed.v !== CURRENT_VERSION) return null;
    if (!parsed.title || !parsed.date || !parsed.timezone || !parsed.icon || !parsed.color) return null;

    return {
      v: parsed.v,
      title: String(parsed.title).slice(0, MAX_TITLE_LENGTH),
      date: parsed.date,
      time: parsed.time || undefined,
      timezone: parsed.timezone,
      icon: parsed.icon,
      color: parsed.color,
    };
  } catch {
    return null;
  }
}
