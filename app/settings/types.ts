export interface Category {
	id: string;
	name: string;
	description?: string;
	created_at: Date;
	updated_at: Date;
	user_id: string;
}

export interface Product {
	id: string;
	name: string;
	description?: string;
	category_id: string;
	price: number;
	created_at: Date;
	updated_at: Date;
	user_id: string;
}

export interface StainType {
	id: string;
	name: string;
	description?: string;
	price: number;
	created_at: Date;
	updated_at: Date;
	user_id: string;
}

export interface StoreSettings {
	id: string;
	name: string;
	phone: string;
	address_line1: string;
	address_line2?: string;
	address_city: string;
	address_postcode: string;
	vat_number: string;
	vat_rate: number;
	created_at: Date;
	updated_at: Date;
	user_id: string;
}

// Helper type for creating new records
export type NewCategory = Omit<
	Category,
	'id' | 'created_at' | 'updated_at' | 'user_id'
>;
export type NewProduct = Omit<
	Product,
	'id' | 'created_at' | 'updated_at' | 'user_id'
>;
export type NewStainType = Omit<
	StainType,
	'id' | 'created_at' | 'updated_at' | 'user_id'
>;
export type NewStoreSettings = Omit<
	StoreSettings,
	'id' | 'created_at' | 'updated_at' | 'user_id'
>;
