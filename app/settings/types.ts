export interface Category {
	id: string;
	name: string;
	description?: string;
}

export interface Product {
	id: string;
	name: string;
	category: string;
	price: number;
	description?: string;
}

export interface StainType {
	id: string;
	name: string;
	description?: string;
	price: number;
}

export interface StoreSettings {
	name: string;
	phone: string;
	address: {
		line1: string;
		line2?: string;
		city: string;
		postcode: string;
	};
	vatNumber: string;
	vatRate: number;
}
