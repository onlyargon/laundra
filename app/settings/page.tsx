'use client';

import { AppLayout } from '@/components/layout/app-layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';
import { CategoriesTab } from './components/categories-tab';
import { ProductsTab } from './components/products-tab';
import { StainsTab } from './components/stains-tab';
import { StoreSettingsTab } from './components/store-settings-tab';
import type { Category, Product, StainType, StoreSettings } from './types';

export default function SettingsPage() {
	const [categories, setCategories] = useState<Category[]>([
		{
			id: '1',
			name: 'Shirts',
			description: 'All types of shirts',
		},
		{
			id: '2',
			name: 'Pants',
			description: 'All types of pants',
		},
	]);

	const [products, setProducts] = useState<Product[]>([
		{
			id: '1',
			name: 'Regular Shirt',
			category: '1',
			price: 2.5,
			description: 'Regular shirt cleaning',
		},
		{
			id: '2',
			name: 'Dress Shirt',
			category: '1',
			price: 3.5,
			description: 'Dress shirt cleaning',
		},
	]);

	const [stains, setStains] = useState<StainType[]>([
		{
			id: '1',
			name: 'Oil',
			description: 'Oil stains',
			price: 1.5,
		},
		{
			id: '2',
			name: 'Wine',
			description: 'Wine stains',
			price: 2.0,
		},
	]);

	const [storeSettings, setStoreSettings] = useState<StoreSettings>({
		name: 'Laundra',
		phone: '020 1234 5678',
		address: {
			line1: '123 High Street',
			line2: 'Suite 4',
			city: 'London',
			postcode: 'SW1A 1AA',
		},
		vatNumber: 'GB123456789',
		vatRate: 20,
	});

	const handleAddCategory = (category: Omit<Category, 'id'>) => {
		const newCategory = {
			...category,
			id: Math.random().toString(36).substr(2, 9),
		};
		setCategories([...categories, newCategory]);
	};

	const handleUpdateCategory = (id: string, category: Omit<Category, 'id'>) => {
		setCategories(
			categories.map((c) => (c.id === id ? { ...c, ...category } : c))
		);
	};

	const handleDeleteCategory = (id: string) => {
		setCategories(categories.filter((c) => c.id !== id));
	};

	const handleAddProduct = (product: Omit<Product, 'id'>) => {
		const newProduct = {
			...product,
			id: Math.random().toString(36).substr(2, 9),
		};
		setProducts([...products, newProduct]);
	};

	const handleUpdateProduct = (id: string, product: Omit<Product, 'id'>) => {
		setProducts(products.map((p) => (p.id === id ? { ...p, ...product } : p)));
	};

	const handleDeleteProduct = (id: string) => {
		setProducts(products.filter((p) => p.id !== id));
	};

	const handleAddStain = (stain: Omit<StainType, 'id'>) => {
		const newStain = {
			...stain,
			id: Math.random().toString(36).substr(2, 9),
		};
		setStains([...stains, newStain]);
	};

	const handleUpdateStain = (id: string, stain: Omit<StainType, 'id'>) => {
		setStains(stains.map((s) => (s.id === id ? { ...s, ...stain } : s)));
	};

	const handleDeleteStain = (id: string) => {
		setStains(stains.filter((s) => s.id !== id));
	};

	const handleUpdateStoreSettings = (settings: StoreSettings) => {
		setStoreSettings(settings);
	};

	return (
		<AppLayout>
			<div className="space-y-8">
				<h1 className="text-3xl font-bold text-gray-900">Settings</h1>
				<div>
					<Tabs defaultValue="store" className="space-y-4">
						<TabsList>
							<TabsTrigger value="store">Store</TabsTrigger>
							<TabsTrigger value="categories">Categories</TabsTrigger>
							<TabsTrigger value="products">Products</TabsTrigger>
							<TabsTrigger value="stains">Stains</TabsTrigger>
						</TabsList>
						<TabsContent value="store">
							<StoreSettingsTab
								settings={storeSettings}
								onUpdate={handleUpdateStoreSettings}
							/>
						</TabsContent>
						<TabsContent value="categories">
							<CategoriesTab
								categories={categories}
								onAdd={handleAddCategory}
								onUpdate={handleUpdateCategory}
								onDelete={handleDeleteCategory}
							/>
						</TabsContent>
						<TabsContent value="products">
							<ProductsTab
								products={products}
								categories={categories}
								onAdd={handleAddProduct}
								onUpdate={handleUpdateProduct}
								onDelete={handleDeleteProduct}
							/>
						</TabsContent>
						<TabsContent value="stains">
							<StainsTab
								stains={stains}
								onAdd={handleAddStain}
								onUpdate={handleUpdateStain}
								onDelete={handleDeleteStain}
							/>
						</TabsContent>
					</Tabs>
				</div>
			</div>
		</AppLayout>
	);
}
