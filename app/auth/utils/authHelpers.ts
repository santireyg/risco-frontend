// app/auth/utils/authHelpers.ts

export const getQueryParam = (name: string): string | null => {
  if (typeof window === "undefined") return null;

  const urlParams = new URLSearchParams(window.location.search);

  return urlParams.get(name);
};

export const removeQueryParam = (name: string): void => {
  if (typeof window === "undefined") return;

  const url = new URL(window.location.href);

  url.searchParams.delete(name);
  window.history.replaceState({}, "", url.toString());
};

export const getTokenFromPath = (): string | null => {
  if (typeof window === "undefined") return null;

  const path = window.location.pathname;
  // Para /auth/verify-email/ABC123, extraemos ABC123
  const segments = path.split("/");
  const verifyIndex = segments.findIndex(
    (segment) => segment === "verify-email",
  );

  if (verifyIndex !== -1 && verifyIndex + 1 < segments.length) {
    return segments[verifyIndex + 1];
  }

  return null;
};

export const removeTokenFromPath = (): void => {
  if (typeof window === "undefined") return;

  const path = window.location.pathname;
  const segments = path.split("/");
  const verifyIndex = segments.findIndex(
    (segment) => segment === "verify-email",
  );

  if (verifyIndex !== -1 && verifyIndex + 1 < segments.length) {
    // Reconstruir la URL sin el token
    const newPath = segments.slice(0, verifyIndex + 1).join("/");

    window.history.replaceState({}, "", newPath);
  }
};

export const formatTimeRemaining = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes > 0) {
    return `${minutes} minuto${minutes !== 1 ? "s" : ""}`;
  }

  return `${remainingSeconds} segundo${remainingSeconds !== 1 ? "s" : ""}`;
};

export const getRateLimitRemainingTime = (
  lastAttemptKey: string,
  limitMinutes: number,
): number => {
  if (typeof window === "undefined") return 0;

  const lastAttempt = localStorage.getItem(lastAttemptKey);

  if (!lastAttempt) return 0;

  const lastAttemptTime = new Date(lastAttempt).getTime();
  const now = Date.now();
  const limitMs = limitMinutes * 60 * 1000;
  const timeElapsed = now - lastAttemptTime;

  if (timeElapsed >= limitMs) return 0;

  return Math.ceil((limitMs - timeElapsed) / 1000);
};

export const setRateLimitAttempt = (key: string): void => {
  if (typeof window === "undefined") return;

  localStorage.setItem(key, new Date().toISOString());
};
