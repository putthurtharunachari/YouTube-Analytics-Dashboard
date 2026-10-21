// Central API base configuration
// Automatically routes to your live Render backend when deployed online,
// and to localhost:8001 when running locally.

const isBrowser = typeof window !== "undefined";
const isLocal = isBrowser && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

const DEFAULT_URL = isLocal 
    ? "http://localhost:8001" 
    : "https://youtube-analytics-dashboard-sxq9.onrender.com";

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || DEFAULT_URL).replace(/\/+$/, "");
