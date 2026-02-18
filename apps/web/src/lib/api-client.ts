/**
 * API Client with authentication handling
 * 
 * The API uses JWT tokens that are returned in login/register responses.
 * We store the token in memory and localStorage (as backup) for cross-origin requests.
 */

import { API_URL } from "./constants";

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
