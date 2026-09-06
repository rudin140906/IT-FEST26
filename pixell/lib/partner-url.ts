const EXTERNAL_URL_PATTERN = /^(?:https?:\/\/|data:|mailto:|tel:)/i;

export function normalizePartnerWebsiteUrl(url?: string | null) {
  if (!url) return "";

  const trimmed = url.trim();
  if (!trimmed) return "";

  if (EXTERNAL_URL_PATTERN.test(trimmed)) {
    return trimmed;
  }

  if (trimmed.startsWith("//")) {
    return `https:${trimmed}`;
  }

  if (trimmed.startsWith("/") || trimmed.startsWith("#") || trimmed.startsWith("?")) {
    return trimmed;
  }

  return `https://${trimmed.replace(/^\/+/, "")}`;
}

export function formatPartnerWebsiteLabel(url: string) {
  return url.replace(/^https?:\/\//i, "");
}
