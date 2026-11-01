/**
 * SmartBuild Centralized API Configuration & Client
 */

// Use port 5050 by default to avoid macOS AirPlay Receiver conflict on port 5000
export const API_BASE = "http://localhost:5050";

/**
 * Universal fetch wrapper that handles network errors gracefully
 */
export async function apiRequest(endpoint, options = {}) {
    const url = endpoint.startsWith("http") ? endpoint : `${API_BASE}${endpoint}`;
    const token =
        sessionStorage.getItem("smartbuild_token") ||
        localStorage.getItem("smartbuild_token");

    const headers = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
    };

    try {
        const response = await fetch(url, {
            ...options,
            headers,
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(data.message || `Request failed with status ${response.status}`);
        }

        return data;
    } catch (err) {
        if (err.name === "TypeError" && err.message.includes("fetch")) {
            throw new Error(
                "Cannot connect to the backend server (http://localhost:5050). Please ensure the backend is running by running 'npm run dev' in the backend directory."
            );
        }
        throw err;
    }
}
