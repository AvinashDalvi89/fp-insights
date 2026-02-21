'use client';

const KEY = 'fp_completed';

export function getCompleted(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
}

export function markDone(id: string): void {
  const list = getCompleted();
  if (!list.includes(id)) {
    localStorage.setItem(KEY, JSON.stringify([...list, id]));
  }
}

export function isDone(id: string): boolean {
  return getCompleted().includes(id);
}
