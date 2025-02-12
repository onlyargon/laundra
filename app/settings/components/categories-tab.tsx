'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
import type { Category } from '../types';

interface CategoriesTabProps {
	categories: Category[];
	onAdd: (category: Omit<Category, 'id'>) => void;
	onUpdate: (id: string, category: Omit<Category, 'id'>) => void;
	onDelete: (id: string) => void;
}

export function CategoriesTab({
	categories,
	onAdd,
	onUpdate,
	onDelete,
}: CategoriesTabProps) {
	const [newCategory, setNewCategory] = useState({ name: '', description: '' });
	const [editingCategory, setEditingCategory] = useState<Category | null>(null);

	const handleEditCategory = (category: Category) => {
		setEditingCategory(category);
		setNewCategory({
			name: category.name,
			description: category.description || '',
		});
	};

	const handleUpdateCategory = () => {
		if (editingCategory && newCategory.name) {
			onUpdate(editingCategory.id, {
				...newCategory,
				created_at: editingCategory.created_at,
				updated_at: editingCategory.updated_at,
				user_id: editingCategory.user_id,
			});
			setEditingCategory(null);
			setNewCategory({ name: '', description: '' });
		}
	};

	const handleSaveCategory = () => {
		if (newCategory.name) {
			onAdd({
				...newCategory,
				created_at: new Date(),
				updated_at: new Date(),
				user_id: '1',
			});
			setNewCategory({ name: '', description: '' });
		}
	};

	return (
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
								editingCategory ? handleUpdateCategory : handleSaveCategory
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
												onClick={() => onDelete(category.id)}
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
