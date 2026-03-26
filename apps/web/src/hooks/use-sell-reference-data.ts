"use client";

import { useEffect, useState } from "react";

import {
	EMPTY_SELL_REFERENCE_DATA,
	SellReferenceData,
	loadSellModels,
	loadSellReferenceData,
} from "@/lib/sell-reference-data";

interface UseSellReferenceDataOptions {
	make?: string;
}

export function useSellReferenceData({ make }: UseSellReferenceDataOptions) {
	const [referenceData, setReferenceData] = useState<SellReferenceData>(
		EMPTY_SELL_REFERENCE_DATA
	);
	const [models, setModels] = useState<string[]>([]);
	const [isLoadingReferenceData, setIsLoadingReferenceData] = useState(true);
	const [isLoadingModels, setIsLoadingModels] = useState(false);
	const [referenceError, setReferenceError] = useState<Error | null>(null);
	const [modelError, setModelError] = useState<Error | null>(null);
	const [referenceReloadKey, setReferenceReloadKey] = useState(0);
	const [modelReloadKey, setModelReloadKey] = useState(0);

	useEffect(() => {
		let cancelled = false;

		setIsLoadingReferenceData(true);
		setReferenceError(null);

		loadSellReferenceData()
			.then((data) => {
				if (!cancelled) {
					setReferenceData(data);
				}
			})
			.catch((error) => {
				console.error("[SellReferenceData] Failed to load sell reference data", {
					error,
				});
				if (!cancelled) {
					setReferenceData(EMPTY_SELL_REFERENCE_DATA);
					setReferenceError(
						error instanceof Error
							? error
							: new Error("Sell reference data request failed")
					);
				}
			})
			.finally(() => {
				if (!cancelled) {
					setIsLoadingReferenceData(false);
				}
			});

		return () => {
			cancelled = true;
		};
	}, [referenceReloadKey]);

	useEffect(() => {
		const normalizedMake =
			make && make !== "all" && make !== "none" ? make : "";

		if (!normalizedMake) {
			setModels([]);
			setModelError(null);
			setIsLoadingModels(false);
			return;
		}

		let cancelled = false;

		setIsLoadingModels(true);
		setModelError(null);

		loadSellModels(normalizedMake)
			.then((data) => {
				if (!cancelled) {
					setModels(data);
				}
			})
			.catch((error) => {
				console.error("[SellReferenceData] Failed to load sell models", {
					make: normalizedMake,
					error,
				});
				if (!cancelled) {
					setModels([]);
					setModelError(
						error instanceof Error
							? error
							: new Error("Sell model request failed")
					);
				}
			})
			.finally(() => {
				if (!cancelled) {
					setIsLoadingModels(false);
				}
			});

		return () => {
			cancelled = true;
		};
	}, [make, modelReloadKey]);

	return {
		referenceData,
		models,
		isLoadingReferenceData,
		isLoadingModels,
		referenceError,
		modelError,
		retryReferenceData: () => setReferenceReloadKey((value) => value + 1),
		retryModels: () => setModelReloadKey((value) => value + 1),
	};
}
