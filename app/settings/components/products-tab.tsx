'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import type { Product, Category } from '../types';

interface ProductsTabProps {
	products: Product[];
	categories: Category[];
	onAdd: (product: Omit<Product, 'id'>) => void;
	onUpdate: (id: string, product: Omit<Product, 'id'>) => void;
	onDelete: (id: string) => void;
}

export function ProductsTab({
	products,
	categories,
	onAdd,
	onUpdate,
	onDelete,
}: ProductsTabProps) {
	const [newProduct, setNewProduct] = useState({
		name: '',
		category: '',
		price: 0,
		description: '',
	});
	const [editingProduct, setEditingProduct] = useState<Product | null>(null);

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
			onUpdate(editingProduct.id, newProduct);
			setEditingProduct(null);
			setNewProduct({ name: '', category: '', price: 0, description: '' });
		}
	};

	const handleSaveProduct = () => {
		if (newProduct.name && newProduct.category) {
			onAdd(newProduct);
			setNewProduct({ name: '', category: '', price: 0, description: '' });
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
							onClick={editingProduct ? handleUpdateProduct : handleSaveProduct}
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
										{categories.find((c) => c.id === product.category)?.name}
									</TableCell>
									<TableCell>£{product.price.toFixed(2)}</TableCell>
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
												onClick={() => onDelete(product.id)}
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
	);
}
