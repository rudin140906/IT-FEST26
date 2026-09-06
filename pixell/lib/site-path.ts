const rawBasePath = process.env.NEXT_PUBLIC_SITE_BASE_PATH || (process.env.NODE_ENV === "production" ? "/IT-Fest" : "");

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
  const pathPart = parts[0];
  const queryPart = parts[1] ? `?${parts[1]}` : "";

  // In development (next dev), call Next.js API routes directly without .php
  if (process.env.NODE_ENV !== "production") {
    const cleanPath = pathPart.replace(/\.php$/, "");
    return withBasePath(`/api${cleanPath}${queryPart}`);
  }

  // In production (cPanel static export), target PHP backend scripts with .php
  if (!pathPart.endsWith(".php")) {
    return withBasePath(`/api${pathPart}.php${queryPart}`);
  }
  return withBasePath(`/api${normalized}`);
}

export async function fetchApi(endpoint: string, options?: RequestInit): Promise<Response> {
  const primaryUrl = apiPath(endpoint);
  try {
    const res = await fetch(primaryUrl, options);
    const contentType = res.headers.get("content-type") || "";
    
    // If response is JSON (OK or 401/400 API response), return it immediately
    if (contentType.includes("application/json")) {
      return res;
    }

    // Fallback URL if primaryUrl didn't return JSON
    const parts = endpoint.split("?");
    const pathPart = parts[0].replace(/\.php$/, "");
    const queryPart = parts[1] ? `?${parts[1]}` : "";
    const altPath = process.env.NODE_ENV !== "production"
      ? `/api${pathPart}.php${queryPart}`
      : `/api${pathPart}${queryPart}`;

    const altUrl = withBasePath(altPath);
    const resAlt = await fetch(altUrl, options);
    const altContentType = resAlt.headers.get("content-type") || "";
    if (altContentType.includes("application/json") || resAlt.ok) {
      return resAlt;
    }

    return res;
  } catch (err) {
    throw err;
  }
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
