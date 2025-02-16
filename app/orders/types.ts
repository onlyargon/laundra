export type OrderStatus = 'cleaning' | 'ready' | 'completed';

export type DeliveryType =
	| 'In-store'
	| 'Pickup and Delivery'
	| 'Pick up'
	| 'Delivery';

export interface Order {
	id: string;
	order_number: number;
	customer_id: string;
	status: OrderStatus;
	delivery_type: DeliveryType;
	is_express: boolean;
	express_fee: number;
	total_amount: number;
	created_at: Date;
	updated_at: Date;
	user_id: string;
	// Joined fields
	customer?: Customer;
	items?: OrderItem[];
}

export interface OrderItem {
	id: string;
	order_id: string;
	product_id: string;
	quantity: number;
	stain_type_id: string | null;
	special_instructions: string | null;
	base_price: number;
	custom_price: number | null;
	stain_charge: number;
	created_at: Date;
	updated_at: Date;
	// Joined fields
	product?: Product;
	stain_type?: StainType;
}

export type NewOrder = Omit<
	Order,
	'id' | 'created_at' | 'updated_at' | 'user_id' | 'customer' | 'items'
>;

export type NewOrderItem = Omit<
	OrderItem,
	'id' | 'created_at' | 'updated_at' | 'product' | 'stain_type'
>;

// Import these from their respective modules
import type { Customer } from '../customers/types';
import type { Product } from '../settings/types';
import type { StainType } from '../settings/types';
