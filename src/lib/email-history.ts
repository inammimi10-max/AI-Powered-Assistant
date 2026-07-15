export type SavedEmail = {
  id: string;
  createdAt: number;
  title: string;
  purpose: string;
  recipient: string;
  tone: string;
  length: string;
  extra: string;
  output: string;
};

const KEY = "email_history_v1";

export function loadEmails(): SavedEmail[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as SavedEmail[]) : [];
  } catch {
    return [];
  }
}

export function saveEmails(items: SavedEmail[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
}

export function addEmail(item: Omit<SavedEmail, "id" | "createdAt">): SavedEmail[] {
  const items = loadEmails();
  const entry: SavedEmail = {
    ...item,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
  };
  const next = [entry, ...items].slice(0, 50);
  saveEmails(next);
  return next;
}

export function deleteEmail(id: string): SavedEmail[] {
  const next = loadEmails().filter((e) => e.id !== id);
  saveEmails(next);
  return next;
}
