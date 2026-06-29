const MAINTENANCE_FLAG = "maintenance_mode";
const CACHE_TTL_MS = 30_000;

type FeatureFlagPayload = {
  key?: string;
  Key?: string;
  isEnabled?: boolean;
  IsEnabled?: boolean;
};

let maintenanceCache: { enabled: boolean; expiresAt: number } | null = null;

function parseMaintenanceEnabled(data: unknown): boolean {
  if (!Array.isArray(data)) return false;
  const flag = (data as FeatureFlagPayload[]).find(
    (item) => (item.key ?? item.Key) === MAINTENANCE_FLAG
  );
  return flag?.isEnabled === true || flag?.IsEnabled === true;
}

export async function isMaintenanceModeEnabled(requestUrl: string): Promise<boolean> {
  const now = Date.now();
  if (maintenanceCache && maintenanceCache.expiresAt > now) {
    return maintenanceCache.enabled;
  }

  try {
    const backendUrl = process.env.BACKEND_URL;
    const featuresUrl = backendUrl
      ? `${backendUrl.replace(/\/$/, "")}/api/cms/features`
      : new URL("/api/cms/features", requestUrl).toString();

    const response = await fetch(featuresUrl, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    if (!response.ok) return false;

    const body = (await response.json()) as { data?: unknown; success?: boolean };
    const enabled = parseMaintenanceEnabled(body.data);
    maintenanceCache = { enabled, expiresAt: now + CACHE_TTL_MS };
    return enabled;
  } catch {
    return false;
  }
}

export function isMaintenanceBypassPath(pathname: string): boolean {
  return (
    pathname === "/maintenance" ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next")
  );
}
