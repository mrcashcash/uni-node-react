// app/page.tsx
import { connection } from "next/server";

type ApiResponse = Record<string, unknown> & {
  server?: unknown;
  database?: unknown;
};

function normalizeBaseUrl(value: string | undefined): string | null {
  const trimmed = (value ?? "").trim().replace(/\/+$/, "");
  return trimmed || null;
}

export default async function Home() {
  // Force dynamic rendering so process.env.API_BASE_URL is read at request
  // time (not frozen at build time). See node_modules/next/dist/docs/01-app/
  // 02-guides/self-hosting.md § Environment Variables.
  await connection();

  const baseUrl = normalizeBaseUrl(process.env.API_BASE_URL);
  const healthEndpoint = baseUrl ? `${baseUrl}/health` : null;

  let apiResponse: ApiResponse | null = null;
  let connectionFailed = false;
  let misconfigured = false;

  if (!healthEndpoint) {
    misconfigured = true;
    apiResponse = {
      error: "API_BASE_URL is not configured for this deployment.",
      details:
        "Set API_BASE_URL in the runtime environment (e.g. deployment secrets) before starting the server.",
    };
  } else {
    try {
      const res = await fetch(healthEndpoint, { cache: "no-store" });
      apiResponse = (await res.json()) as ApiResponse;
    } catch (error) {
      connectionFailed = true;
      apiResponse = {
        error: "API Server is offline",
        attempted_url: healthEndpoint,
        details: error instanceof Error ? error.message : String(error),
      };
    }
  }

  const isApiUp = !misconfigured && !connectionFailed && apiResponse?.server === "up";
  const isDbConnected = !misconfigured && apiResponse?.database === "connected";

  const apiBadge = misconfigured
    ? { label: "MISCONFIGURED", cls: "bg-yellow-100 text-yellow-700" }
    : isApiUp
      ? { label: "ONLINE", cls: "bg-green-100 text-green-700" }
      : { label: "OFFLINE", cls: "bg-red-100 text-red-700" };

  const dbBadge = misconfigured
    ? { label: "UNKNOWN", cls: "bg-gray-100 text-gray-700" }
    : isDbConnected
      ? { label: "CONNECTED", cls: "bg-green-100 text-green-700" }
      : { label: "DISCONNECTED", cls: "bg-red-100 text-red-700" };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          System Status Dashboard V2
        </h1>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
            <span className="font-medium text-gray-700">API Server</span>
            <span className={`px-3 py-1 ${apiBadge.cls} rounded-full text-sm font-bold shadow-sm`}>
              {apiBadge.label}
            </span>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
            <span className="font-medium text-gray-700">Database</span>
            <span className={`px-3 py-1 ${dbBadge.cls} rounded-full text-sm font-bold shadow-sm`}>
              {dbBadge.label}
            </span>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-gray-400">
          Checking endpoint:{" "}
          <span className="font-mono">{healthEndpoint ?? "not configured"}</span>
        </div>

        <div className="mt-4">
          <p className="text-xs text-gray-500 mb-2 uppercase font-semibold">Raw API Response:</p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-xs overflow-x-auto shadow-inner">
            {JSON.stringify(apiResponse, null, 2)}
          </pre>
        </div>
      </div>
    </main>
  );
}
