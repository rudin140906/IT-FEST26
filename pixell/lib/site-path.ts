const rawBasePath = process.env.NEXT_PUBLIC_SITE_BASE_PATH || "";

export const SITE_BASE_PATH = rawBasePath.replace(/\/+$/, "");

function isExternalPath(path: string) {
  return /^(?:https?:\/\/|data:|mailto:|tel:)/i.test(path);
}

function normalizeLeadingSlash(path: string) {
  return path.startsWith("/") ? path : `/${path}`;
}

export function withBasePath(path: string) {
  if (!path || isExternalPath(path) || path.startsWith("#") || path.startsWith("?")) {
    return path;
  }

  const normalized = normalizeLeadingSlash(path);
  if (!SITE_BASE_PATH) {
    return normalized;
  }

  if (normalized === SITE_BASE_PATH || normalized.startsWith(`${SITE_BASE_PATH}/`)) {
    return normalized;
  }

  return `${SITE_BASE_PATH}${normalized}`;
}

export function apiPath(path: string) {
  const normalized = normalizeLeadingSlash(path.replace(/^\/+/, ""));
  const parts = normalized.split("?");
  const pathPart = parts[0].replace(/\.php$/, "");
  const queryPart = parts[1] ? `?${parts[1]}` : "";

  return withBasePath(`/api${pathPart}${queryPart}`);
}

export async function fetchApi(endpoint: string, options?: RequestInit): Promise<Response> {
  const primaryUrl = apiPath(endpoint);
  return fetch(primaryUrl, options);
}

export function stripBasePath(pathname: string) {
  if (!SITE_BASE_PATH) {
    return pathname || "/";
  }

  if (pathname === SITE_BASE_PATH) {
    return "/";
  }

  if (pathname.startsWith(`${SITE_BASE_PATH}/`)) {
    return pathname.slice(SITE_BASE_PATH.length) || "/";
  }

  return pathname || "/";
}
