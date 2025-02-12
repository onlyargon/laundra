import { supabase } from '@/lib/supabase';
import type {
	Category,
	NewCategory,
	NewProduct,
	NewStainType,
	Product,
	StainType,
	StoreSettings,
} from './types';

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

// Categories
export async function getCategories() {
	const { data, error } = await supabase
		.from('categories')
		.select('*')
		.order('name');

	if (error) throw error;
	return (data || []).map(parseDates) as Category[];
}

export async function createCategory(category: NewCategory) {
	const { data, error } = await supabase
		.from('categories')
		.insert([
			{ ...category, user_id: (await supabase.auth.getUser()).data.user?.id },
		])
		.select()
		.single();

	if (error) throw error;
	return parseDates(data) as Category;
}

export async function updateCategory(id: string, category: NewCategory) {
	const { data, error } = await supabase
		.from('categories')
		.update(category)
		.eq('id', id)
		.select()
		.single();

	if (error) throw error;
	return parseDates(data) as Category;
}

export async function deleteCategory(id: string) {
	const { error } = await supabase.from('categories').delete().eq('id', id);
	if (error) throw error;
}

// Products
export async function getProducts() {
	const { data, error } = await supabase
		.from('products')
		.select('*')
		.order('name');

	if (error) throw error;
	return (data || []).map(parseDates) as Product[];
}

export async function createProduct(product: NewProduct) {
	const { data, error } = await supabase
		.from('products')
		.insert([
			{ ...product, user_id: (await supabase.auth.getUser()).data.user?.id },
		])
		.select()
		.single();

	if (error) throw error;
	return parseDates(data) as Product;
}

export async function updateProduct(id: string, product: NewProduct) {
	const { data, error } = await supabase
		.from('products')
		.update(product)
		.eq('id', id)
		.select()
		.single();

	if (error) throw error;
	return parseDates(data) as Product;
}

export async function deleteProduct(id: string) {
	const { error } = await supabase.from('products').delete().eq('id', id);
	if (error) throw error;
}

// Stain Types
export async function getStainTypes() {
	const { data, error } = await supabase
		.from('stain_types')
		.select('*')
		.order('name');

	if (error) throw error;
	return (data || []).map(parseDates) as StainType[];
}

export async function createStainType(stainType: NewStainType) {
	const { data, error } = await supabase
		.from('stain_types')
		.insert([
			{ ...stainType, user_id: (await supabase.auth.getUser()).data.user?.id },
		])
		.select()
		.single();

	if (error) throw error;
	return parseDates(data) as StainType;
}

export async function updateStainType(id: string, stainType: NewStainType) {
	const { data, error } = await supabase
		.from('stain_types')
		.update(stainType)
		.eq('id', id)
		.select()
		.single();

	if (error) throw error;
	return parseDates(data) as StainType;
}

export async function deleteStainType(id: string) {
	const { error } = await supabase.from('stain_types').delete().eq('id', id);
	if (error) throw error;
}

// Store Settings
export async function getStoreSettings() {
	const { data, error } = await supabase
		.from('store_settings')
		.select('*')
		.single();

	if (error) throw error;
	return parseDates(data);
}

export async function upsertStoreSettings(
	settings: Omit<StoreSettings, 'id' | 'created_at' | 'updated_at' | 'user_id'>
) {
	const { data: user } = await supabase.auth.getUser();
	if (!user.user?.id) throw new Error('User not authenticated');

	const { data, error } = await supabase
		.from('store_settings')
		.upsert({
			...settings,
			user_id: user.user.id,
		})
		.select()
		.single();

	if (error) throw error;
	return parseDates(data);
}
