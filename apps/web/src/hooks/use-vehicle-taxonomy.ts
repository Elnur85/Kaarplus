"use client";

import { useEffect, useState } from "react";

import {
	EMPTY_VEHICLE_TAXONOMY,
	TaxonomyScope,
	VehicleTaxonomy,
	loadVehicleModels,
	loadVehicleTaxonomy,
} from "@/lib/vehicle-taxonomy";

interface UseVehicleTaxonomyOptions {
	scope: TaxonomyScope;
	make?: string;
}

export function useVehicleTaxonomy({
	scope,
	make,
}: UseVehicleTaxonomyOptions) {
	const [taxonomy, setTaxonomy] = useState<VehicleTaxonomy>(
		EMPTY_VEHICLE_TAXONOMY
	);
	const [models, setModels] = useState<string[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isLoadingModels, setIsLoadingModels] = useState(false);
	const [error, setError] = useState<Error | null>(null);
	const [modelError, setModelError] = useState<Error | null>(null);
	const [reloadKey, setReloadKey] = useState(0);

	useEffect(() => {
		let cancelled = false;

		setIsLoading(true);
		setError(null);

		loadVehicleTaxonomy(scope)
			.then((data) => {
				if (!cancelled) {
					setTaxonomy(data);
				}
			})
			.catch((err) => {
				console.error("Failed to load vehicle taxonomy", err);
				if (!cancelled) {
					setTaxonomy(EMPTY_VEHICLE_TAXONOMY);
					setError(
						err instanceof Error
							? err
							: new Error("Vehicle taxonomy request failed")
					);
				}
			})
			.finally(() => {
				if (!cancelled) {
					setIsLoading(false);
				}
			});

		return () => {
			cancelled = true;
		};
	}, [scope, reloadKey]);

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

		loadVehicleModels(normalizedMake, scope)
			.then((data) => {
				if (!cancelled) {
					setModels(data);
				}
			})
			.catch((err) => {
				console.error("Failed to load vehicle models", err);
				if (!cancelled) {
					setModels([]);
					setModelError(
						err instanceof Error
							? err
							: new Error("Vehicle model request failed")
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
	}, [make, scope, reloadKey]);

	return {
		taxonomy,
		models,
		isLoading,
		isLoadingModels,
		error,
		modelError,
		retry: () => setReloadKey((value) => value + 1),
	};
}
