/**
 * EDUGAMI - Asset Constants
 * Centralized management of all external asset URLs and local paths
 * Compliant with "Visual Peace" Protocol: No hardcoded URLs
 */

export const ASSET_URLS = {
  // Auth Module
  AUTH_BG_PATTERN:
    "linear-gradient(135deg, rgba(79, 70, 229, 0.07), transparent 34%), linear-gradient(315deg, rgba(207, 63, 142, 0.06), transparent 30%)",

  // User Avatars
  DEFAULT_AVATAR:
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHJ4PSIxNiIgZmlsbD0iIzRGNDZFNSIvPjxjaXJjbGUgY3g9IjE2IiBjeT0iMTAiIHI9IjQiIGZpbGw9IiNGN0ZCRkYiLz48cGF0aCBkPSJNMTAgMjBDMTAgMTYuNzMgMTMuNTggMTQgMTYgMTRDMTguNDIgMTQgMjIgMTYuNzMgMjIgMjBWMjJIMTBWMjAiIGZpbGw9IiNGN0ZCRkYiLz48L3N2Zz4=",

  // Logos
  LOGO: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDQiIGhlaWdodD0iNDQiIHZpZXdCb3g9IjAgMCA0NCA0NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDQiIGhlaWdodD0iNDQiIHJ4PSI4IiBmaWxsPSIjNEY0NkU1Ii8+PHBhdGggZD0iTTEyIDEySDE4VjI0SDEyVjEyWk0yMCAxMkgyNlYyNEgyMFYxMloiIGZpbGw9IiNGN0ZCRkYiIGZpbGwtcnVsZT0iZXZlbm9kZCIvPjwvc3ZnPg==",

  // Default Status Icons (SVG Base64)
  STATUS_ONLINE:
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOCIgaGVpZ2h0PSI4IiB2aWV3Qm94PSIwIDAgOCA4IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxjaXJjbGUgY3g9IjQiIGN5PSI0IiByPSI0IiBmaWxsPSIjMTBBOTc2Ii8+PC9zdmc+",
};

export const APP_CONFIG = {
  // Version (must sync with package.json)
  VERSION: "2.4.0",

  // Build metadata
  BUILD_DATE: new Date().toISOString(),
  BUILD_ENV: import.meta.env.MODE,
};

/**
 * Get avatar URL with fallback
 * Supports: URL | initials | default
 */
export function getAvatarURL(userEmail, userInitials = "U") {
  if (!userEmail) return ASSET_URLS.DEFAULT_AVATAR;

  // Gravatar fallback (optional)
  const hash = Array.from(userEmail.toLowerCase())
    .reduce((h, char) => (h << 5) - h + char.charCodeAt(0), 0)
    .toString(16);

  return `https://ui-avatars.com/api/?name=${userInitials}&background=4F46E5&color=fff&size=32&rounded=true`;
}

/**
 * Get application status display
 */
export function getSystemStatus(metrics = {}) {
  if (!metrics.cpu && !metrics.ram) return "UNKNOWN";

  const cpu = metrics.cpu || 0;
  const ram = metrics.ram || 0;

  if (cpu > 80 || ram > 90) return "CRITICAL";
  if (cpu > 60 || ram > 75) return "HIGH";
  return "OPTIMAL";
}
