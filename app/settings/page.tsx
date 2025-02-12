'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { AppLayout } from '@/components/layout/app-layout';

// Types for our master data
type Category = {
	id: string;
	name: string;
	description?: string;
};

type Product = {
	id: string;
	name: string;
	category: string;
	price: number;
	description?: string;
};

type StainType = {
	id: string;
	name: string;
	description: string;
	additionalCharge?: number;
};

export default function Settings() {
	// Sample initial data
	const [categories, setCategories] = useState<Category[]>([
		{ id: '1', name: 'Workwear', description: 'Professional clothing items' },
		{ id: '2', name: 'Laundry', description: 'Regular washing items' },
		{ id: '3', name: 'Bedding', description: 'Bed sheets and covers' },
	]);

	const [products, setProducts] = useState<Product[]>([
		{
			id: '1',
			name: 'Wash & Fold',
			category: '2',
			price: 16.5,
			description: 'Basic wash and fold service',
		},
		{
			id: '2',
			name: 'Shirt',
			category: '1',
			price: 3.5,
			description: 'Professional shirt cleaning',
		},
	]);

	const [stainTypes, setStainTypes] = useState<StainType[]>([
		{
			id: '1',
			name: 'Oil',
			description: 'Oil-based stains',
			additionalCharge: 5.0,
		},
		{
			id: '2',
			name: 'Wine',
			description: 'Wine stains',
			additionalCharge: 7.5,
		},
	]);

	// State for new/editing items
	const [newCategory, setNewCategory] = useState({ name: '', description: '' });
	const [newProduct, setNewProduct] = useState({
		name: '',
		category: '',
		price: 0,
		description: '',
	});
	const [newStainType, setNewStainType] = useState({
		name: '',
		description: '',
		additionalCharge: 0,
	});

	// Edit states
	const [editingCategory, setEditingCategory] = useState<Category | null>(null);
	const [editingProduct, setEditingProduct] = useState<Product | null>(null);
	const [editingStainType, setEditingStainType] = useState<StainType | null>(
		null
	);

	// Delete confirmation state
	const [deleteConfirm, setDeleteConfirm] = useState<{
		type: 'category' | 'product' | 'stain';
		id: string;
	} | null>(null);

	// Category handlers
	const handleEditCategory = (category: Category) => {
		setEditingCategory(category);
		setNewCategory({
			name: category.name,
			description: category.description || '',
		});
	};

	const handleUpdateCategory = () => {
		if (editingCategory && newCategory.name) {
			setCategories(
				categories.map((cat) =>
					cat.id === editingCategory.id
						? {
								...cat,
								name: newCategory.name,
								description: newCategory.description,
						  }
						: cat
				)
			);
			setEditingCategory(null);
			setNewCategory({ name: '', description: '' });
		}
	};

	const handleDeleteCategory = (id: string) => {
		setCategories(categories.filter((cat) => cat.id !== id));
		setDeleteConfirm(null);
	};

	// Product handlers
	const handleEditProduct = (product: Product) => {
		setEditingProduct(product);
		setNewProduct({
			name: product.name,
			category: product.category,
			price: product.price,
			description: product.description || '',
		});
	};

	const handleUpdateProduct = () => {
		if (editingProduct && newProduct.name && newProduct.category) {
			setProducts(
				products.map((prod) =>
					prod.id === editingProduct.id ? { ...prod, ...newProduct } : prod
				)
			);
			setEditingProduct(null);
			setNewProduct({ name: '', category: '', price: 0, description: '' });
		}
	};

	const handleDeleteProduct = (id: string) => {
		setProducts(products.filter((prod) => prod.id !== id));
		setDeleteConfirm(null);
	};

	// Stain type handlers
	const handleEditStainType = (stain: StainType) => {
		setEditingStainType(stain);
		setNewStainType({
			name: stain.name,
			description: stain.description,
			additionalCharge: stain.additionalCharge || 0,
		});
	};

	const handleUpdateStainType = () => {
		if (editingStainType && newStainType.name) {
			setStainTypes(
				stainTypes.map((stain) =>
					stain.id === editingStainType.id
						? { ...stain, ...newStainType }
						: stain
				)
			);
			setEditingStainType(null);
			setNewStainType({ name: '', description: '', additionalCharge: 0 });
		}
	};

	const handleDeleteStainType = (id: string) => {
		setStainTypes(stainTypes.filter((stain) => stain.id !== id));
		setDeleteConfirm(null);
	};

	const handleSaveCategory = () => {
		if (newCategory.name) {
			setCategories([
				...categories,
				{ id: Date.now().toString(), ...newCategory },
			]);
			setNewCategory({ name: '', description: '' });
		}
	};

	const handleSaveProduct = () => {
		if (newProduct.name && newProduct.category) {
			setProducts([...products, { id: Date.now().toString(), ...newProduct }]);
			setNewProduct({ name: '', category: '', price: 0, description: '' });
		}
	};

	const handleSaveStainType = () => {
		if (newStainType.name) {
			setStainTypes([
				...stainTypes,
				{ id: Date.now().toString(), ...newStainType },
			]);
			setNewStainType({ name: '', description: '', additionalCharge: 0 });
		}
	};

	const handleProductPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setNewProduct({
			...newProduct,
			price: value ? parseFloat(value) : 0,
		});
	};

	return (
		<AppLayout>
			<div>
				<h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>

				<Tabs defaultValue="categories" className="space-y-6">
					<TabsList>
						<TabsTrigger value="categories">Categories</TabsTrigger>
						<TabsTrigger value="products">Products</TabsTrigger>
						<TabsTrigger value="stains">Stain Types</TabsTrigger>
					</TabsList>

					{/* Categories Tab */}
					<TabsContent value="categories">
						<Card>
							<CardHeader>
								<CardTitle>Manage Categories</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									<div className="flex gap-4">
										<Input
											placeholder="Category Name"
											value={newCategory.name}
											onChange={(e) =>
												setNewCategory({ ...newCategory, name: e.target.value })
											}
										/>
										<Input
											placeholder="Description"
											value={newCategory.description}
											onChange={(e) =>
												setNewCategory({
													...newCategory,
													description: e.target.value,
												})
											}
										/>
										<Button
											onClick={
												editingCategory
													? handleUpdateCategory
													: handleSaveCategory
											}
										>
											{editingCategory ? (
												'Update Category'
											) : (
												<>
													<Plus className="h-4 w-4 mr-2" />
													Add Category
												</>
											)}
										</Button>
										{editingCategory && (
											<Button
												variant="ghost"
												onClick={() => {
													setEditingCategory(null);
													setNewCategory({ name: '', description: '' });
												}}
											>
												<X className="h-4 w-4 mr-2" />
												Cancel
											</Button>
										)}
									</div>

									<Table>
										<TableHeader>
											<TableRow>
												<TableHead>Name</TableHead>
												<TableHead>Description</TableHead>
												<TableHead className="w-[100px]">Actions</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{categories.map((category) => (
												<TableRow key={category.id}>
													<TableCell>{category.name}</TableCell>
													<TableCell>{category.description}</TableCell>
													<TableCell>
														<div className="flex space-x-2">
															<Button
																variant="ghost"
																size="icon"
																onClick={() => handleEditCategory(category)}
															>
																<Pencil className="h-4 w-4" />
															</Button>
															<Button
																variant="ghost"
																size="icon"
																className="text-red-500"
																onClick={() =>
																	setDeleteConfirm({
																		type: 'category',
																		id: category.id,
																	})
																}
															>
																<Trash2 className="h-4 w-4" />
															</Button>
														</div>
													</TableCell>
												</TableRow>
											))}
										</TableBody>
									</Table>
								</div>
							</CardContent>
						</Card>
					</TabsContent>

					{/* Products Tab */}
					<TabsContent value="products">
						<Card>
							<CardHeader>
								<CardTitle>Manage Products</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									<div className="flex gap-4">
										<Input
											placeholder="Product Name"
											value={newProduct.name}
											onChange={(e) =>
												setNewProduct({ ...newProduct, name: e.target.value })
											}
										/>
										<Select
											value={newProduct.category}
											onValueChange={(value) =>
												setNewProduct({ ...newProduct, category: value })
											}
										>
											<SelectTrigger className="w-full">
												<SelectValue placeholder="Select Category" />
											</SelectTrigger>
											<SelectContent>
												{categories.map((cat) => (
													<SelectItem key={cat.id} value={cat.id}>
														{cat.name}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<Input
											type="number"
											placeholder="Price"
											value={newProduct.price === 0 ? '' : newProduct.price}
											onChange={handleProductPriceChange}
										/>
										<Button
											onClick={
												editingProduct ? handleUpdateProduct : handleSaveProduct
											}
										>
											{editingProduct ? (
												'Update Product'
											) : (
												<>
													<Plus className="h-4 w-4 mr-2" />
													Add Product
												</>
											)}
										</Button>
										{editingProduct && (
											<Button
												variant="ghost"
												onClick={() => {
													setEditingProduct(null);
													setNewProduct({
														name: '',
														category: '',
														price: 0,
														description: '',
													});
												}}
											>
												<X className="h-4 w-4 mr-2" />
												Cancel
											</Button>
										)}
									</div>

									<Table>
										<TableHeader>
											<TableRow>
												<TableHead>Name</TableHead>
												<TableHead>Category</TableHead>
												<TableHead>Price</TableHead>
												<TableHead className="w-[100px]">Actions</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{products.map((product) => (
												<TableRow key={product.id}>
													<TableCell>{product.name}</TableCell>
													<TableCell>
														{
															categories.find((c) => c.id === product.category)
																?.name
														}
													</TableCell>
													<TableCell>${product.price.toFixed(2)}</TableCell>
													<TableCell>
														<div className="flex space-x-2">
															<Button
																variant="ghost"
																size="icon"
																onClick={() => handleEditProduct(product)}
															>
																<Pencil className="h-4 w-4" />
															</Button>
															<Button
																variant="ghost"
																size="icon"
																className="text-red-500"
																onClick={() =>
																	setDeleteConfirm({
																		type: 'product',
																		id: product.id,
																	})
																}
															>
																<Trash2 className="h-4 w-4" />
															</Button>
														</div>
													</TableCell>
												</TableRow>
											))}
										</TableBody>
									</Table>
								</div>
							</CardContent>
						</Card>
					</TabsContent>

					{/* Stain Types Tab */}
					<TabsContent value="stains">
						<Card>
							<CardHeader>
								<CardTitle>Manage Stain Types</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									<div className="flex gap-4">
										<Input
											placeholder="Stain Type"
											value={newStainType.name}
											onChange={(e) =>
												setNewStainType({
													...newStainType,
													name: e.target.value,
												})
											}
										/>
										<Input
											placeholder="Description"
											value={newStainType.description}
											onChange={(e) =>
												setNewStainType({
													...newStainType,
													description: e.target.value,
												})
											}
										/>
										<Input
											type="number"
											placeholder="Additional Charge"
											value={newStainType.additionalCharge || ''}
											onChange={(e) =>
												setNewStainType({
													...newStainType,
													additionalCharge: parseFloat(e.target.value),
												})
											}
										/>
										<Button
											onClick={
												editingStainType
													? handleUpdateStainType
													: handleSaveStainType
											}
										>
											{editingStainType ? (
												'Update Stain Type'
											) : (
												<>
													<Plus className="h-4 w-4 mr-2" />
													Add Stain Type
												</>
											)}
										</Button>
										{editingStainType && (
											<Button
												variant="ghost"
												onClick={() => {
													setEditingStainType(null);
													setNewStainType({
														name: '',
														description: '',
														additionalCharge: 0,
													});
												}}
											>
												<X className="h-4 w-4 mr-2" />
												Cancel
											</Button>
										)}
									</div>

									<Table>
										<TableHeader>
											<TableRow>
												<TableHead>Type</TableHead>
												<TableHead>Description</TableHead>
												<TableHead>Additional Charge</TableHead>
												<TableHead className="w-[100px]">Actions</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{stainTypes.map((stain) => (
												<TableRow key={stain.id}>
													<TableCell>{stain.name}</TableCell>
													<TableCell>{stain.description}</TableCell>
													<TableCell>
														${stain.additionalCharge?.toFixed(2)}
													</TableCell>
													<TableCell>
														<div className="flex space-x-2">
															<Button
																variant="ghost"
																size="icon"
																onClick={() => handleEditStainType(stain)}
															>
																<Pencil className="h-4 w-4" />
															</Button>
															<Button
																variant="ghost"
																size="icon"
																className="text-red-500"
																onClick={() =>
																	setDeleteConfirm({
																		type: 'stain',
																		id: stain.id,
																	})
																}
															>
																<Trash2 className="h-4 w-4" />
															</Button>
														</div>
													</TableCell>
												</TableRow>
											))}
										</TableBody>
									</Table>
								</div>
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>

				{/* Delete Confirmation Dialog */}
				<AlertDialog
					open={!!deleteConfirm}
					onOpenChange={() => setDeleteConfirm(null)}
				>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>Are you sure?</AlertDialogTitle>
							<AlertDialogDescription>
								This action cannot be undone. This will permanently delete the{' '}
								{deleteConfirm?.type}.
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel>Cancel</AlertDialogCancel>
							<AlertDialogAction
								className="bg-red-500 hover:bg-red-600"
								onClick={() => {
									if (deleteConfirm) {
										switch (deleteConfirm.type) {
											case 'category':
												handleDeleteCategory(deleteConfirm.id);
												break;
											case 'product':
												handleDeleteProduct(deleteConfirm.id);
												break;
											case 'stain':
												handleDeleteStainType(deleteConfirm.id);
												break;
										}
									}
								}}
							>
								Delete
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			</div>
		</AppLayout>
	);
}
