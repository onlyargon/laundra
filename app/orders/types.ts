export type OrderStatus =
	| 'new'
	| 'cleaning'
	| 'ready'
	| 'completed'
	| 'picked-up';

export type OrderItem = {
	id: string;
	productId: string;
	quantity: number;
	stainTypeId?: string;
	specialInstructions?: string;
	basePrice: number;
	stainCharge: number;
};

export type Order = {
	id: string;
	customerId: string;
	customerName: string;
	status: OrderStatus;
	items: OrderItem[];
	isExpress: boolean;
	expressFee: number;
	totalAmount: number;
	createdAt: Date;
	updatedAt: Date;
};

export type Customer = {
	id: string;
	name: string;
	email: string;
	phone: string;
	address: string;
};

export type Product = {
	id: string;
	name: string;
	category: string;
	price: number;
};

export type StainType = {
	id: string;
	name: string;
	additionalCharge: number;
};
