export interface BodyTypeSelection {
	category: string;
	subtypes: string[];
}

export interface ParsedStoredBodyType {
	category: string;
	subtype?: string;
}

export function serializeBodyType(selections: BodyTypeSelection[]): string {
	return selections
		.map((selection) =>
			selection.subtypes.length === 0
				? selection.category
				: `${selection.category}:${selection.subtypes.join(",")}`
		)
		.join("|");
}

export function deserializeBodyType(value: string): BodyTypeSelection[] {
	if (!value) return [];

	return value
		.split("|")
		.map((part) => {
			if (!part) return null;

			if (part.includes(":")) {
				const [category, subtypeList] = part.split(":", 2);
				if (!category) return null;

				return {
					category,
					subtypes: subtypeList
						.split(",")
						.map((subtype) => subtype.trim())
						.filter(Boolean),
				};
			}

			return {
				category: part,
				subtypes: [],
			};
		})
		.filter((selection): selection is BodyTypeSelection => Boolean(selection));
}

export function parseStoredBodyType(
	value: string
): ParsedStoredBodyType | null {
	if (!value) return null;

	const [category, subtype] = value.split(":", 2);
	if (!category) return null;

	return subtype
		? {
				category,
				subtype,
		  }
		: {
				category,
		  };
}
