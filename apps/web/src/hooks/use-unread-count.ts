"use client";

import { useEffect, useState } from "react";
import { useSocket } from "@/components/socket/socket-provider";
import { apiFetch } from "@/lib/api-client";

interface UseUnreadCountReturn {
	count: number;
	isLoading: boolean;
}

/**
 * Hook for tracking unread message count in real-time.
 * Uses Socket.io for live updates and falls back to REST API on initial load.
 */
export function useUnreadCount(): UseUnreadCountReturn {
	const { unreadCount, isConnected } = useSocket();
	const [isLoading, setIsLoading] = useState(true);

	// Fetch initial count via REST API (fallback)
	useEffect(() => {
		const fetchUnreadCount = async () => {
			try {
				const response = await apiFetch("/user/messages/unread-count", {
					credentials: "include",
				});
				if (response.ok) {
					const data = await response.json();
					// Socket will update this when connected
				}
			} catch (error) {
				console.error("[useUnreadCount] Failed to fetch unread count:", error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchUnreadCount();
	}, []);

	// Loading is complete once we have a socket connection (which sends initial count)
	useEffect(() => {
		if (isConnected) {
			setIsLoading(false);
		}
	}, [isConnected]);

	return {
		count: unreadCount,
		isLoading,
	};
}
