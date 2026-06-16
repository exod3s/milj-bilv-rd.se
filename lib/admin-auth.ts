export const adminCookieName = "miljo_admin_session";

export function getAdminSessionToken() {
  return process.env.ADMIN_SESSION_TOKEN ?? "dev-admin-session";
}

export function isAdminSession(value: string | undefined) {
  return value === getAdminSessionToken();
}

export function getAdminCredentials() {
  return {
    username: process.env.ADMIN_USERNAME ?? "admin",
    password: process.env.ADMIN_PASSWORD ?? "admin"
  };
}
