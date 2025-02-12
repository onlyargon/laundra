'use client';

import { AppLayout } from '@/components/layout/app-layout';
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
import { Plus, Pencil, Trash2, X, Search } from 'lucide-react';
import { useState } from 'react';

type Customer = {
	id: string;
	name: string;
	email: string;
	phone: string;
	address: string;
	createdAt: Date;
};

export default function Customers() {
	// Sample initial data
	const [customers, setCustomers] = useState<Customer[]>([
		{
			id: '1',
			name: 'John Doe',
			email: 'john@example.com',
			phone: '+1234567890',
			address: '123 Main St, City',
			createdAt: new Date('2024-01-01'),
		},
	]);

	// State for new/editing customer
	const [newCustomer, setNewCustomer] = useState({
		name: '',
		email: '',
		phone: '',
		address: '',
	});

	const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
	const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
	const [searchQuery, setSearchQuery] = useState('');

	const handleSaveCustomer = () => {
		if (newCustomer.name && newCustomer.phone) {
			setCustomers([
				...customers,
				{
					id: Date.now().toString(),
					...newCustomer,
					createdAt: new Date(),
				},
			]);
			setNewCustomer({ name: '', email: '', phone: '', address: '' });
		}
	};

	const handleUpdateCustomer = () => {
		if (editingCustomer && newCustomer.name && newCustomer.phone) {
			setCustomers(
				customers.map((customer) =>
					customer.id === editingCustomer.id
						? {
								...customer,
								...newCustomer,
						  }
						: customer
				)
			);
			setEditingCustomer(null);
			setNewCustomer({ name: '', email: '', phone: '', address: '' });
		}
	};

	const handleEditCustomer = (customer: Customer) => {
		setEditingCustomer(customer);
		setNewCustomer({
			name: customer.name,
			email: customer.email,
			phone: customer.phone,
			address: customer.address,
		});
	};

	const handleDeleteCustomer = (id: string) => {
		setCustomers(customers.filter((customer) => customer.id !== id));
		setDeleteConfirm(null);
	};

	const filteredCustomers = customers.filter(
		(customer) =>
			customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
			customer.phone.includes(searchQuery)
	);

	return (
		<AppLayout>
			<div className="space-y-8">
				<div className="flex justify-between items-center">
					<h1 className="text-3xl font-bold text-gray-900">Customers</h1>
					<div className="relative w-96">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
						<Input
							placeholder="Search customers..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="pl-10"
						/>
					</div>
				</div>

				<Card>
					<CardHeader>
						<CardTitle>Add New Customer</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-2 gap-4">
							<Input
								placeholder="Full Name"
								value={newCustomer.name}
								onChange={(e) =>
									setNewCustomer({ ...newCustomer, name: e.target.value })
								}
							/>
							<Input
								type="email"
								placeholder="Email"
								value={newCustomer.email}
								onChange={(e) =>
									setNewCustomer({ ...newCustomer, email: e.target.value })
								}
							/>
							<Input
								placeholder="Phone Number"
								value={newCustomer.phone}
								onChange={(e) =>
									setNewCustomer({ ...newCustomer, phone: e.target.value })
								}
							/>
							<Input
								placeholder="Address"
								value={newCustomer.address}
								onChange={(e) =>
									setNewCustomer({ ...newCustomer, address: e.target.value })
								}
							/>
							<div className="col-span-2 flex justify-end space-x-2">
								{editingCustomer && (
									<Button
										variant="ghost"
										onClick={() => {
											setEditingCustomer(null);
											setNewCustomer({
												name: '',
												email: '',
												phone: '',
												address: '',
											});
										}}
									>
										<X className="h-4 w-4 mr-2" />
										Cancel
									</Button>
								)}
								<Button
									onClick={
										editingCustomer ? handleUpdateCustomer : handleSaveCustomer
									}
								>
									{editingCustomer ? (
										'Update Customer'
									) : (
										<>
											<Plus className="h-4 w-4 mr-2" />
											Add Customer
										</>
									)}
								</Button>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Customer List</CardTitle>
					</CardHeader>
					<CardContent>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Name</TableHead>
									<TableHead>Email</TableHead>
									<TableHead>Phone</TableHead>
									<TableHead>Address</TableHead>
									<TableHead>Created</TableHead>
									<TableHead className="w-[100px]">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{filteredCustomers.map((customer) => (
									<TableRow key={customer.id}>
										<TableCell className="font-medium">
											{customer.name}
										</TableCell>
										<TableCell>{customer.email}</TableCell>
										<TableCell>{customer.phone}</TableCell>
										<TableCell>{customer.address}</TableCell>
										<TableCell>
											{customer.createdAt.toLocaleDateString()}
										</TableCell>
										<TableCell>
											<div className="flex space-x-2">
												<Button
													variant="ghost"
													size="icon"
													onClick={() => handleEditCustomer(customer)}
												>
													<Pencil className="h-4 w-4" />
												</Button>
												<Button
													variant="ghost"
													size="icon"
													className="text-red-500"
													onClick={() => setDeleteConfirm(customer.id)}
												>
													<Trash2 className="h-4 w-4" />
												</Button>
											</div>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</CardContent>
				</Card>
			</div>

			{/* Delete Confirmation Dialog */}
			<AlertDialog
				open={!!deleteConfirm}
				onOpenChange={() => setDeleteConfirm(null)}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Are you sure?</AlertDialogTitle>
						<AlertDialogDescription>
							This action cannot be undone. This will permanently delete the
							customer and all associated data.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							className="bg-red-500 hover:bg-red-600"
							onClick={() =>
								deleteConfirm && handleDeleteCustomer(deleteConfirm)
							}
						>
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</AppLayout>
	);
}
