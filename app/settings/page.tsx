'use client';

import { AppLayout } from '@/components/layout/app-layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StoreSettingsTab } from './components/store-settings-tab';
import { CategoriesTab } from './components/categories-tab';
import { ProductsTab } from './components/products-tab';
import { StainsTab } from './components/stains-tab';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import type { Category, Product, StainType, StoreSettings } from './types';
import {
	getCategories,
	getProducts,
	getStainTypes,
	getStoreSettings,
	createCategory,
	updateCategory,
	deleteCategory,
	createProduct,
	updateProduct,
	deleteProduct,
	createStainType,
	updateStainType,
	deleteStainType,
	upsertStoreSettings,
} from './services';

export default function SettingsPage() {
	const { toast } = useToast();
	const [isLoading, setIsLoading] = useState(true);
	const [categories, setCategories] = useState<Category[]>([]);
	const [products, setProducts] = useState<Product[]>([]);
	const [stains, setStains] = useState<StainType[]>([]);
	const [storeSettings, setStoreSettings] = useState<StoreSettings | null>(
		null
	);

	useEffect(() => {
		const loadData = async () => {
			try {
				const [categoriesData, productsData, stainsData, settingsData] =
					await Promise.all([
						getCategories(),
						getProducts(),
						getStainTypes(),
						getStoreSettings(),
					]);

				setCategories(categoriesData);
				setProducts(productsData);
				setStains(stainsData);
				setStoreSettings(settingsData);
			} catch (error) {
				console.error('Error loading settings data:', error);
				toast({
					variant: 'destructive',
					title: 'Error',
					description: 'Failed to load settings. Please try again.',
				});
			} finally {
				setIsLoading(false);
			}
		};

		loadData();
	}, [toast]);

	const handleAddCategory = async (category: Omit<Category, 'id'>) => {
		try {
			const newCategory = await createCategory(category);
			setCategories([...categories, newCategory]);
			toast({
				title: 'Success',
				description: 'Category added successfully.',
			});
		} catch (error) {
			console.error('Error adding category:', error);
			toast({
				variant: 'destructive',
				title: 'Error',
				description: 'Failed to add category. Please try again.',
			});
		}
	};

	const handleUpdateCategory = async (
		id: string,
		category: Omit<Category, 'id'>
	) => {
		try {
			const updatedCategory = await updateCategory(id, category);
			setCategories(categories.map((c) => (c.id === id ? updatedCategory : c)));
			toast({
				title: 'Success',
				description: 'Category updated successfully.',
			});
		} catch (error) {
			console.error('Error updating category:', error);
			toast({
				variant: 'destructive',
				title: 'Error',
				description: 'Failed to update category. Please try again.',
			});
		}
	};

	const handleDeleteCategory = async (id: string) => {
		try {
			await deleteCategory(id);
			setCategories(categories.filter((c) => c.id !== id));
			toast({
				title: 'Success',
				description: 'Category deleted successfully.',
			});
		} catch (error) {
			console.error('Error deleting category:', error);
			toast({
				variant: 'destructive',
				title: 'Error',
				description: 'Failed to delete category. Please try again.',
			});
		}
	};

	const handleAddProduct = async (product: Omit<Product, 'id'>) => {
		try {
			const newProduct = await createProduct(product);
			setProducts([...products, newProduct]);
			toast({
				title: 'Success',
				description: 'Product added successfully.',
			});
		} catch (error) {
			console.error('Error adding product:', error);
			toast({
				variant: 'destructive',
				title: 'Error',
				description: 'Failed to add product. Please try again.',
			});
		}
	};

	const handleUpdateProduct = async (
		id: string,
		product: Omit<Product, 'id'>
	) => {
		try {
			const updatedProduct = await updateProduct(id, product);
			setProducts(products.map((p) => (p.id === id ? updatedProduct : p)));
			toast({
				title: 'Success',
				description: 'Product updated successfully.',
			});
		} catch (error) {
			console.error('Error updating product:', error);
			toast({
				variant: 'destructive',
				title: 'Error',
				description: 'Failed to update product. Please try again.',
			});
		}
	};

	const handleDeleteProduct = async (id: string) => {
		try {
			await deleteProduct(id);
			setProducts(products.filter((p) => p.id !== id));
			toast({
				title: 'Success',
				description: 'Product deleted successfully.',
			});
		} catch (error) {
			console.error('Error deleting product:', error);
			toast({
				variant: 'destructive',
				title: 'Error',
				description: 'Failed to delete product. Please try again.',
			});
		}
	};

	const handleAddStain = async (stain: Omit<StainType, 'id'>) => {
		try {
			const newStain = await createStainType(stain);
			setStains([...stains, newStain]);
			toast({
				title: 'Success',
				description: 'Stain type added successfully.',
			});
		} catch (error) {
			console.error('Error adding stain type:', error);
			toast({
				variant: 'destructive',
				title: 'Error',
				description: 'Failed to add stain type. Please try again.',
			});
		}
	};

	const handleUpdateStain = async (
		id: string,
		stain: Omit<StainType, 'id'>
	) => {
		try {
			const updatedStain = await updateStainType(id, stain);
			setStains(stains.map((s) => (s.id === id ? updatedStain : s)));
			toast({
				title: 'Success',
				description: 'Stain type updated successfully.',
			});
		} catch (error) {
			console.error('Error updating stain type:', error);
			toast({
				variant: 'destructive',
				title: 'Error',
				description: 'Failed to update stain type. Please try again.',
			});
		}
	};

	const handleDeleteStain = async (id: string) => {
		try {
			await deleteStainType(id);
			setStains(stains.filter((s) => s.id !== id));
			toast({
				title: 'Success',
				description: 'Stain type deleted successfully.',
			});
		} catch (error) {
			console.error('Error deleting stain type:', error);
			toast({
				variant: 'destructive',
				title: 'Error',
				description: 'Failed to delete stain type. Please try again.',
			});
		}
	};

	const handleUpdateStoreSettings = async (settings: StoreSettings) => {
		try {
			const newSettings: Omit<
				StoreSettings,
				'id' | 'created_at' | 'updated_at' | 'user_id'
			> = {
				name: settings.name,
				phone: settings.phone,
				address_line1: settings.address_line1,
				address_line2: settings.address_line2,
				address_city: settings.address_city,
				address_postcode: settings.address_postcode,
				vat_number: settings.vat_number,
				vat_rate: settings.vat_rate,
			};
			const updatedSettings = await upsertStoreSettings(newSettings);
			setStoreSettings(updatedSettings);
			toast({
				title: 'Success',
				description: 'Store settings updated successfully.',
			});
		} catch (error) {
			console.error('Error updating store settings:', error);
			toast({
				variant: 'destructive',
				title: 'Error',
				description: 'Failed to update store settings. Please try again.',
			});
		}
	};

	if (isLoading) {
		return (
			<AppLayout>
				<div className="flex items-center justify-center min-h-[60vh]">
					<Loader2 className="h-8 w-8 animate-spin text-primary" />
				</div>
			</AppLayout>
		);
	}

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
								settings={
									storeSettings || {
										id: '',
										name: '',
										phone: '',
										address_line1: '',
										address_line2: '',
										address_city: '',
										address_postcode: '',
										vat_number: '',
										vat_rate: 20,
										created_at: new Date(),
										updated_at: new Date(),
										user_id: '',
									}
								}
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
