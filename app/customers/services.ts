import { supabase } from '@/lib/supabase';
import type { Customer, NewCustomer } from './types';

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

export async function getCustomers() {
	const { data, error } = await supabase
		.from('customers')
		.select('*')
		.order('name');

	if (error) throw error;
	return (data || []).map(parseDates) as Customer[];
}

export async function createCustomer(customer: NewCustomer) {
	const { data: user } = await supabase.auth.getUser();
	if (!user.user?.id) throw new Error('User not authenticated');

	const { data, error } = await supabase
		.from('customers')
		.insert([{ ...customer, user_id: user.user.id }])
		.select()
		.single();

	if (error) throw error;
	return parseDates(data) as Customer;
}

export async function updateCustomer(id: string, customer: NewCustomer) {
	const { data, error } = await supabase
		.from('customers')
		.update(customer)
		.eq('id', id)
		.select()
		.single();

	if (error) throw error;
	return parseDates(data) as Customer;
}

export async function deleteCustomer(id: string) {
	const { error } = await supabase.from('customers').delete().eq('id', id);
	if (error) throw error;
}
