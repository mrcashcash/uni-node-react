// app/page.tsx

export default async function Home() {
  let apiResponse = null;
  let connectionFailed = false;

  // 1. Get the base URL from the environment file, with a fallback just in case
  const baseUrl = process.env.API_BASE_URL || "http://127.0.0.1:8000";
  const healthEndpoint = `${baseUrl}/health`;

  try {
    // 2. Fetch using the dynamic endpoint
    const res = await fetch(healthEndpoint, {
      cache: "no-store", // Forces Next.js to fetch fresh data on every refresh
    });
    
    apiResponse = await res.json();

  } catch (error) {
    connectionFailed = true;
    apiResponse = { 
      error: "API Server is offline", 
      attempted_url: healthEndpoint 
    };
  }

  // Determine the status for our UI colors
  const isApiUp = !connectionFailed && apiResponse?.server === "up";
  const isDbConnected = apiResponse?.database === "connected";

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          System Status Dashboard
        </h1>

        <div className="space-y-4">
          {/* API Server Status */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
            <span className="font-medium text-gray-700">API Server</span>
            {isApiUp ? (
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-bold shadow-sm">
                ONLINE
              </span>
            ) : (
              <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-bold shadow-sm">
                OFFLINE
              </span>
            )}
          </div>

          {/* Database Status */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
            <span className="font-medium text-gray-700">Database</span>
            {isDbConnected ? (
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-bold shadow-sm">
                CONNECTED
              </span>
            ) : (
              <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-bold shadow-sm">
                DISCONNECTED
              </span>
            )}
          </div>
        </div>

        {/* Display the Endpoint being called */}
        <div className="mt-6 text-center text-xs text-gray-400">
          Checking endpoint: <span className="font-mono">{healthEndpoint}</span>
        </div>

        {/* Display raw JSON response for debugging */}
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