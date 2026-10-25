// An obscure route reduces casual discovery; authorization is enforced by the API.
export const ADMIN_PATH = (import.meta.env.VITE_ADMIN_PATH || '/control-8sian-4d9c7a2e7f').replace(
  /\/$/,
  '',
);
