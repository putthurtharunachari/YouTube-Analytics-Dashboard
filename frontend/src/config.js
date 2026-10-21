// Central API base configuration
// In production (Vercel/Render), configure VITE_API_BASE_URL to point to your backend.
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8001").replace(/\/+$/, "");
