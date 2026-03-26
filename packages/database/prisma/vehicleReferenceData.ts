export interface VehicleMakeReference {
	name: string;
	logo: string;
	popularity: number;
}

export interface VehicleBodyCategoryReference {
	key: string;
	subtypes: string[];
}

export const VEHICLE_MAKE_REFERENCES: VehicleMakeReference[] = [
	{
		name: "BMW",
		logo: "https://upload.wikimedia.org/wikipedia/commons/4/44/BMW.svg",
		popularity: 100,
	},
	{
		name: "Mercedes-Benz",
		logo: "https://upload.wikimedia.org/wikipedia/commons/9/90/Mercedes-Benz_Logo_2010.svg",
		popularity: 95,
	},
	{
		name: "Audi",
		logo: "https://upload.wikimedia.org/wikipedia/commons/9/92/Audi-Logo_2016.svg",
		popularity: 90,
	},
	{
		name: "Volkswagen",
		logo: "https://upload.wikimedia.org/wikipedia/commons/6/6d/Volkswagen_logo_2019.svg",
		popularity: 85,
	},
	{
		name: "Toyota",
		logo: "https://upload.wikimedia.org/wikipedia/commons/9/9d/Toyota_car_logo.svg",
		popularity: 80,
	},
	{
		name: "Volvo",
		logo: "https://upload.wikimedia.org/wikipedia/commons/b/bb/Volvo_logo.svg",
		popularity: 75,
	},
	{
		name: "Tesla",
		logo: "https://upload.wikimedia.org/wikipedia/commons/b/bd/Tesla_Motors.svg",
		popularity: 70,
	},
	{
		name: "Porsche",
		logo: "https://upload.wikimedia.org/wikipedia/commons/d/df/Porsche_logo.svg",
		popularity: 65,
	},
	{
		name: "Skoda",
		logo: "https://upload.wikimedia.org/wikipedia/commons/8/8f/Skoda_logo_2022.svg",
		popularity: 60,
	},
	{
		name: "Ford",
		logo: "https://upload.wikimedia.org/wikipedia/commons/3/3e/Ford_logo_flat.svg",
		popularity: 55,
	},
	{
		name: "Hyundai",
		logo: "https://upload.wikimedia.org/wikipedia/commons/4/44/Hyundai_Motor_Company_logo.svg",
		popularity: 50,
	},
	{
		name: "Kia",
		logo: "https://upload.wikimedia.org/wikipedia/commons/4/47/Kia_logo_2021.svg",
		popularity: 45,
	},
	{
		name: "Lexus",
		logo: "https://upload.wikimedia.org/wikipedia/commons/4/42/Lexus_logo_2023.svg",
		popularity: 40,
	},
	{
		name: "Nissan",
		logo: "https://upload.wikimedia.org/wikipedia/commons/2/23/Nissan_2020_logo.svg",
		popularity: 35,
	},
	{
		name: "Honda",
		logo: "https://upload.wikimedia.org/wikipedia/commons/3/38/Honda_logo.svg",
		popularity: 30,
	},
];

export const VEHICLE_MODEL_REFERENCES: Record<string, string[]> = {
	BMW: [
		"1 Series",
		"2 Series",
		"3 Series",
		"4 Series",
		"5 Series",
		"7 Series",
		"X1",
		"X3",
		"X5",
		"X6",
	],
	"Mercedes-Benz": [
		"A-Class",
		"C-Class",
		"CLA",
		"E-Class",
		"G-Class",
		"GLA",
		"GLC",
		"GLE",
		"S-Class",
		"V-Class",
	],
	Audi: ["A3", "A4", "A5", "A6", "Q3", "Q5", "Q7", "Q8", "TT", "e-tron"],
	Volkswagen: [
		"Arteon",
		"Golf",
		"ID.4",
		"Jetta",
		"Passat",
		"Polo",
		"T-Roc",
		"Tiguan",
		"Touareg",
		"Transporter",
	],
	Toyota: [
		"C-HR",
		"Camry",
		"Corolla",
		"Highlander",
		"Hilux",
		"Land Cruiser",
		"Prius",
		"RAV4",
		"Supra",
		"Yaris",
	],
	Volvo: ["C40", "EX30", "EX90", "S60", "S90", "V60", "V90", "XC40", "XC60", "XC90"],
	Tesla: ["Cybertruck", "Model 3", "Model S", "Model X", "Model Y"],
	Porsche: ["911", "Boxster", "Cayenne", "Cayman", "Macan", "Panamera", "Taycan"],
	Skoda: ["Enyaq", "Fabia", "Kamiq", "Karoq", "Kodiaq", "Octavia", "Scala", "Superb"],
	Ford: ["Explorer", "Fiesta", "Focus", "Kuga", "Mondeo", "Mustang", "Puma", "Ranger", "Transit"],
	Hyundai: ["Bayon", "IONIQ 5", "Kona", "Santa Fe", "Tucson", "Venue", "i10", "i20", "i30"],
	Kia: ["Ceed", "EV6", "Niro", "Picanto", "Proceed", "Sorento", "Sportage", "Stonic", "XCeed"],
	Lexus: ["ES", "IS", "LC", "LX", "NX", "RC", "RX", "RZ", "UX"],
	Nissan: ["Ariya", "Juke", "Leaf", "Micra", "Navara", "Primera", "Qashqai", "X-Trail"],
	Honda: ["Accord", "CR-V", "Civic", "HR-V", "Jazz", "NSX", "ZRV", "e"],
};

export const VEHICLE_BODY_CATEGORY_REFERENCES: VehicleBodyCategoryReference[] = [
	{
		key: "passengerCar",
		subtypes: [
			"sedan",
			"hatchback",
			"touring",
			"minivan",
			"coupe",
			"cabriolet",
			"pickup",
			"limousine",
		],
	},
	{
		key: "suv",
		subtypes: ["touring", "coupe", "pickup"],
	},
	{
		key: "commercialVehicle",
		subtypes: ["smallCommercial", "commercial"],
	},
	{
		key: "truck",
		subtypes: ["rigid", "saddle", "chassis"],
	},
	{
		key: "mototechnics",
		subtypes: [
			"classicalMotorcycle",
			"scooter",
			"moped",
			"bike",
			"cruiserChopper",
			"motocross",
			"enduroAdventure",
			"trial",
			"threeWheeler",
			"atvUtv",
			"buggy",
			"mopedCar",
			"snowmobile",
			"other",
		],
	},
	{
		key: "waterVehicle",
		subtypes: ["motorboat", "yachtSailboat", "waterscooter"],
	},
	{
		key: "trailer",
		subtypes: ["lightTrailer", "semiTrailer", "trailer", "boatTrailer"],
	},
	{
		key: "caravan",
		subtypes: ["caravan", "trailerTent"],
	},
	{
		key: "constructionMachinery",
		subtypes: [
			"crane",
			"concreteMixer",
			"excavator",
			"bulldozer",
			"forklift",
			"loader",
			"loaderExcavator",
			"roadConstruction",
		],
	},
	{
		key: "agriculturalMachinery",
		subtypes: ["tractor", "combine", "mower"],
	},
	{
		key: "forestMachinery",
		subtypes: ["harvester", "forwarder"],
	},
	{
		key: "communalMachinery",
		subtypes: ["sweepingMachine", "garbageTruck", "excrementsRemoval"],
	},
];

export const VEHICLE_FUEL_TYPE_REFERENCES = [
	"Petrol",
	"Diesel",
	"Hybrid",
	"Electric",
	"CNG",
	"LPG",
	"Ethanol",
];

export const VEHICLE_TRANSMISSION_REFERENCES = ["Manual", "Automatic"];

export const VEHICLE_DRIVE_TYPE_REFERENCES = ["FWD", "RWD", "AWD", "4WD"];

export const VEHICLE_COLOR_REFERENCES = [
	"Black",
	"White",
	"Silver",
	"Grey",
	"Blue",
	"Red",
	"Green",
	"Brown",
	"Beige",
	"Yellow",
	"Orange",
];

export const VEHICLE_LOCATION_REFERENCES = [
	"Tallinn",
	"Tartu",
	"Pärnu",
	"Narva",
	"Harjumaa",
	"Viljandi",
	"Rakvere",
	"Kuressaare",
	"Jõhvi",
];

export const VEHICLE_CONDITION_REFERENCES = [
	"New",
	"Excellent",
	"Used",
	"Damaged",
];

export const COVERED_VEHICLE_MAKE_REFERENCES = VEHICLE_MAKE_REFERENCES.filter(
	(make) => {
		const models = VEHICLE_MODEL_REFERENCES[make.name];
		return Array.isArray(models) && models.length > 0;
	}
);

export const VEHICLE_BODY_TYPE_VALUES = VEHICLE_BODY_CATEGORY_REFERENCES.flatMap(
	(category) =>
		category.subtypes.length > 0
			? category.subtypes.map((subtype) => `${category.key}:${subtype}`)
			: [category.key]
);
