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
import type { StainType } from '../types';

interface StainsTabProps {
	stains: StainType[];
	onAdd: (stain: Omit<StainType, 'id'>) => void;
	onUpdate: (id: string, stain: Omit<StainType, 'id'>) => void;
	onDelete: (id: string) => void;
}

export function StainsTab({
	stains,
	onAdd,
	onUpdate,
	onDelete,
}: StainsTabProps) {
	const [newStain, setNewStain] = useState({
		name: '',
		description: '',
		price: 0,
	});
	const [editingStain, setEditingStain] = useState<StainType | null>(null);

	const handleEditStain = (stain: StainType) => {
		setEditingStain(stain);
		setNewStain({
			name: stain.name,
			description: stain.description || '',
			price: stain.price,
		});
	};

	const handleUpdateStain = () => {
		if (editingStain && newStain.name) {
			onUpdate(editingStain.id, {
				...newStain,
				created_at: editingStain.created_at,
				updated_at: editingStain.updated_at,
				user_id: editingStain.user_id,
			});
			setEditingStain(null);
			setNewStain({ name: '', description: '', price: 0 });
		}
	};

	const handleSaveStain = () => {
		if (newStain.name) {
			onAdd({
				...newStain,
				created_at: new Date(),
				updated_at: new Date(),
				user_id: '1',
			});
			setNewStain({ name: '', description: '', price: 0 });
		}
	};

	const handleStainPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setNewStain({
			...newStain,
			price: value ? parseFloat(value) : 0,
		});
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Manage Stain Types</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					<div className="flex gap-4">
						<Input
							placeholder="Stain Type Name"
							value={newStain.name}
							onChange={(e) =>
								setNewStain({ ...newStain, name: e.target.value })
							}
						/>
						<Input
							placeholder="Description"
							value={newStain.description}
							onChange={(e) =>
								setNewStain({ ...newStain, description: e.target.value })
							}
						/>
						<Input
							type="number"
							placeholder="Price"
							value={newStain.price === 0 ? '' : newStain.price}
							onChange={handleStainPriceChange}
						/>
						<Button
							onClick={editingStain ? handleUpdateStain : handleSaveStain}
						>
							{editingStain ? (
								'Update Stain Type'
							) : (
								<>
									<Plus className="h-4 w-4 mr-2" />
									Add Stain Type
								</>
							)}
						</Button>
						{editingStain && (
							<Button
								variant="ghost"
								onClick={() => {
									setEditingStain(null);
									setNewStain({ name: '', description: '', price: 0 });
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
								<TableHead>Price</TableHead>
								<TableHead className="w-[100px]">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{stains.map((stain) => (
								<TableRow key={stain.id}>
									<TableCell>{stain.name}</TableCell>
									<TableCell>{stain.description}</TableCell>
									<TableCell>£{stain.price.toFixed(2)}</TableCell>
									<TableCell>
										<div className="flex space-x-2">
											<Button
												variant="ghost"
												size="icon"
												onClick={() => handleEditStain(stain)}
											>
												<Pencil className="h-4 w-4" />
											</Button>
											<Button
												variant="ghost"
												size="icon"
												className="text-red-500"
												onClick={() => onDelete(stain.id)}
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
