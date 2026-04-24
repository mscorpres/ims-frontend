const POST_LOGIN_REDIRECT_KEY = "postLoginRedirectPath";

const isSafeInternalPath = (value) => {
  if (typeof value !== "string") {
    return false;
  }

  if (!value.startsWith("/")) {
    return false;
  }

  if (value.startsWith("//")) {
    return false;
  }

  return true;
};

export const normalizeSafeRedirectPath = (value, fallback = "/") => {
  if (typeof value !== "string" || value.length === 0) {
    return fallback;
  }

  let decodedValue = value;
  try {
    decodedValue = decodeURIComponent(value);
  } catch (error) {
    decodedValue = value;
  }

  if (!isSafeInternalPath(decodedValue) || decodedValue === "/login") {
    return fallback;
  }

  return decodedValue;
};

export const buildRelativePathFromLocation = (location) => {
  if (!location) return "/";

  const pathname = location.pathname || "/";
  const search = location.search || "";
  const hash = location.hash || "";
  return `${pathname}${search}${hash}`;
};

export const savePostLoginRedirect = (path) => {
  const safePath = normalizeSafeRedirectPath(path, null);
  if (!safePath) return;
  localStorage.setItem(POST_LOGIN_REDIRECT_KEY, safePath);
};

export const getPostLoginRedirect = (fallback = "/") => {
  const redirectPath = localStorage.getItem(POST_LOGIN_REDIRECT_KEY);
  return normalizeSafeRedirectPath(redirectPath, fallback);
};

export const consumePostLoginRedirect = (fallback = "/") => {
  const redirectPath = getPostLoginRedirect(fallback);
  localStorage.removeItem(POST_LOGIN_REDIRECT_KEY);
  return redirectPath;
};
