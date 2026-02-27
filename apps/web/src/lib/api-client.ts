/**
 * API Client with authentication handling
 *
 * The API uses JWT tokens that are returned in login/register responses.
 * We store the token in memory and localStorage (as backup) for cross-origin requests.
 */

import { API_URL } from "./constants";

/**
 * Maps HTTP status codes to user-friendly fallback messages (in Estonian).
 * Used when the API response body doesn't contain a message.
 */
function httpStatusMessage(status: number): string {
  const messages: Record<number, string> = {
    400: "Vigane päring — kontrollige sisestatud andmeid",
    401: "Autentimine nõutud — palun logige sisse",
    403: "Teil puudub õigus seda toimingut teha",
    404: "Soovitud ressurss ei leitud",
    409: "Andmete konflikt — kirje on juba olemas",
    422: "Saadetud andmed on vigased",
    429: "Liiga palju päringuid — palun oodake hetk",
    500: "Serveri viga — palun proovige hiljem uuesti",
    502: "Teenus on hetkel kättesaamatu",
    503: "Teenus on ajutiselt peatatud",
  };
  return messages[status] ?? `Ootamatu viga (HTTP ${status})`;
}

/**
 * Extracts a human-readable error message from a non-OK API Response.
 * Parses the JSON body to get the API's `message` or `error` field.
 * Falls back to an HTTP-status description if the body cannot be parsed.
 */
export async function parseApiError(response: Response, fallback?: string): Promise<string> {
  try {
    const body = await response.json();
    // API returns { message, error, code, details }
    // Prefer `message`, then `error`, then details summary for validation errors
    if (body.message && typeof body.message === "string") return body.message;
    if (body.error && typeof body.error === "string") return body.error;
    if (Array.isArray(body.details) && body.details.length > 0) {
      // ValidationError: show first field's message
      const first = body.details[0];
      return first.message ? `${first.field ? first.field + ": " : ""}${first.message}` : httpStatusMessage(response.status);
    }
  } catch {
    // Response body was not JSON
  }
  return fallback ?? httpStatusMessage(response.status);
}

// Check if user is authenticated (can be checked via session on server, or assumed in client)
export function isAuthenticated(): boolean {
	// In cookie-based auth, we don't have a reliable way to check in client JS 
	// without aspecially marked cookie (non-httpOnly) or checking session.
	// For now, we rely on the backend to throw 401.
	return true;
}

// Fetch wrapper with authentication
export async function apiFetch(
	endpoint: string,
	options: RequestInit = {}
): Promise<Response> {
	const headers: Record<string, string> = {
		"Content-Type": "application/json",
		...((options.headers as Record<string, string>) || {}),
	};

	const url = endpoint.startsWith("http") ? endpoint : `${API_URL}${endpoint}`;

	return fetch(url, {
		...options,
		headers,
		credentials: "include", // Essential for sending HttpOnly cookies
	});
}

// Login and store token
export async function loginAndStoreToken(email: string, password: string): Promise<{ success: boolean; user?: any; error?: string }> {
	try {
		const response = await fetch(`${API_URL}/auth/login`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			credentials: "include",
			body: JSON.stringify({ email, password }),
		});

		const data = await response.json();

		if (!response.ok) {
			return { success: false, error: data.message || "Login failed" };
		}

		// Token will be set by the backend via Set-Cookie
		return { success: true, user: data.user };
	} catch (error) {
		return { success: false, error: "Network error" };
	}
}

// Register and store token
export async function registerAndStoreToken(email: string, password: string, name: string): Promise<{ success: boolean; user?: any; error?: string }> {
	try {
		const response = await fetch(`${API_URL}/auth/register`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			credentials: "include",
			body: JSON.stringify({ email, password, name }),
		});

		const data = await response.json();

		if (!response.ok) {
			throw new Error(data.error || data.message || "Registration failed");
		}

		// Token will be set by the backend via Set-Cookie
		return { success: true, user: data.user };
	} catch (error: any) {
		return { success: false, error: error.message || "Network error" };
	}
}

// Logout and clear token
export async function logoutAndClearToken(): Promise<void> {
	// Also call logout endpoint to clear cookies
	try {
		await fetch(`${API_URL}/auth/logout`, {
			method: "POST",
			credentials: "include",
		});
	} catch (error) {
		// Ignore errors
	}
}
