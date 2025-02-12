import { supabase } from '@/lib/supabase';
import type { Order, OrderItem, NewOrder, NewOrderItem } from './types';

// Helper function to parse dates
const parseDates = <
	T extends { created_at: string | Date; updated_at: string | Date }
>(
	data: T
): T => ({
	...data,
	created_at: new Date(data.created_at),
	updated_at: new Date(data.updated_at),
});

type RawOrderItem = Omit<OrderItem, 'created_at' | 'updated_at'> & {
	created_at: string;
	updated_at: string;
};

export async function getOrders() {
	// First get all orders with customers
	const { data: orders, error: ordersError } = await supabase
		.from('orders')
		.select('*, customer:customers(*)')
		.order('created_at', { ascending: false });

	if (ordersError) throw ordersError;

	// Then get all order items for these orders
	const orderIds = orders?.map((order) => order.id) || [];
	const { data: items, error: itemsError } = await supabase
		.from('order_items')
		.select('*, product:products(*), stain_type:stain_types(*)')
		.in('order_id', orderIds);

	if (itemsError) throw itemsError;

	// Combine the data
	return (orders || []).map((order) => ({
		...parseDates(order),
		customer: order.customer ? parseDates(order.customer) : undefined,
		items: items
			?.filter((item) => item.order_id === order.id)
			.map((item: RawOrderItem) => ({
				...parseDates(item),
				product: item.product,
				stain_type: item.stain_type,
			})),
	})) as Order[];
}

export async function getOrder(id: string) {
	// Get the order with customer
	const { data: order, error: orderError } = await supabase
		.from('orders')
		.select('*, customer:customers(*)')
		.eq('id', id)
		.single();

	if (orderError) throw orderError;

	// Get the order items
	const { data: items, error: itemsError } = await supabase
		.from('order_items')
		.select('*, product:products(*), stain_type:stain_types(*)')
		.eq('order_id', id);

	if (itemsError) throw itemsError;

	return {
		...parseDates(order),
		customer: order.customer ? parseDates(order.customer) : undefined,
		items: items?.map((item: RawOrderItem) => ({
			...parseDates(item),
			product: item.product,
			stain_type: item.stain_type,
		})),
	} as Order;
}

export async function createOrder(order: NewOrder, items: NewOrderItem[]) {
	const { data: user } = await supabase.auth.getUser();
	if (!user.user?.id) throw new Error('User not authenticated');

	// Create the order first
	const { data: newOrder, error: orderError } = await supabase
		.from('orders')
		.insert([
			{
				customer_id: order.customer_id,
				status: 'new',
				is_express: order.is_express,
				express_fee: order.express_fee,
				total_amount: order.total_amount,
				user_id: user.user.id,
				order_number: order.order_number,
			},
		])
		.select('*')
		.single();

	if (orderError) throw orderError;

	// Insert order items
	const { error: itemsError } = await supabase.from('order_items').insert(
		items.map((item) => ({
			order_id: newOrder.id,
			product_id: item.product_id,
			quantity: item.quantity,
			stain_type_id: item.stain_type_id,
			special_instructions: item.special_instructions,
			base_price: item.base_price,
			stain_charge: item.stain_charge,
		}))
	);

	if (itemsError) {
		// If there's an error with items, delete the order to maintain consistency
		await supabase.from('orders').delete().eq('id', newOrder.id);
		throw itemsError;
	}

	// Fetch the complete order with all relations
	const { data: orderWithCustomer, error: customerError } = await supabase
		.from('orders')
		.select('*, customer:customers(*)')
		.eq('id', newOrder.id)
		.single();

	if (customerError) throw customerError;

	// Fetch the order items with their relations
	const { data: orderItems, error: itemsFetchError } = await supabase
		.from('order_items')
		.select('*, product:products(*), stain_type:stain_types(*)')
		.eq('order_id', newOrder.id);

	if (itemsFetchError) throw itemsFetchError;

	// Combine and return the complete order
	return {
		...parseDates(orderWithCustomer),
		customer: orderWithCustomer.customer
			? parseDates(orderWithCustomer.customer)
			: undefined,
		items: orderItems.map((item: RawOrderItem) => ({
			...parseDates(item),
			product: item.product,
			stain_type: item.stain_type,
		})),
	} as Order;
}

export async function updateOrder(
	id: string,
	order: Partial<NewOrder>,
	items?: NewOrderItem[]
) {
	// Update order
	const { error: orderError } = await supabase
		.from('orders')
		.update({
			customer_id: order.customer_id,
			is_express: order.is_express,
			express_fee: order.express_fee,
			total_amount: order.total_amount,
		})
		.eq('id', id);

	if (orderError) throw orderError;

	// If items are provided, delete existing items and insert new ones
	if (items) {
		const { error: deleteError } = await supabase
			.from('order_items')
			.delete()
			.eq('order_id', id);

		if (deleteError) throw deleteError;

		const { error: itemsError } = await supabase.from('order_items').insert(
			items.map((item) => ({
				order_id: id,
				product_id: item.product_id,
				quantity: item.quantity,
				stain_type_id: item.stain_type_id,
				special_instructions: item.special_instructions,
				base_price: item.base_price,
				stain_charge: item.stain_charge,
			}))
		);

		if (itemsError) throw itemsError;
	}

	return getOrder(id);
}

export async function updateOrderStatus(id: string, status: Order['status']) {
	const { error } = await supabase
		.from('orders')
		.update({ status })
		.eq('id', id);

	if (error) throw error;
	return getOrder(id);
}

export async function deleteOrder(id: string) {
	const { error } = await supabase.from('orders').delete().eq('id', id);
	if (error) throw error;
}
