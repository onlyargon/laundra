'use client';

import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
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
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
} from '@/components/ui/sheet';
import { Plus, Pencil, Trash2, Search, Loader2, History } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { Customer, NewCustomer } from './types';
import type { Order } from '@/app/orders/types';
import type { Product, StainType } from '@/app/settings/types';
import {
	getCustomers,
	createCustomer,
	updateCustomer,
	deleteCustomer,
} from './services';
import { getOrdersByCustomerId } from '../orders/services';
import { getProducts, getStainTypes } from '@/app/settings/services';
import { CustomerDialog } from './components/customer-dialog';
import { CustomerOrderHistory } from './components/customer-order-history';

export default function Customers() {
	const { toast } = useToast();
	const [isLoading, setIsLoading] = useState(true);
	const [customers, setCustomers] = useState<Customer[]>([]);
	const [products, setProducts] = useState<Product[]>([]);
	const [stainTypes, setStainTypes] = useState<StainType[]>([]);
	const [selectedCustomerOrders, setSelectedCustomerOrders] = useState<Order[]>(
		[]
	);
	const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(
		null
	);
	const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false);
	const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
	const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
	const [searchQuery, setSearchQuery] = useState('');
	const [isOrdersSheetOpen, setIsOrdersSheetOpen] = useState(false);

	// Load initial data
	useEffect(() => {
		const loadData = async () => {
			try {
				const [customersData, productsData, stainTypesData] = await Promise.all(
					[getCustomers(), getProducts(), getStainTypes()]
				);

				setCustomers(customersData);
				setProducts(productsData);
				setStainTypes(stainTypesData);
			} catch (error) {
				console.error('Error loading data:', error);
				toast({
					variant: 'destructive',
					title: 'Error',
					description: 'Failed to load data. Please try again.',
				});
			} finally {
				setIsLoading(false);
			}
		};

		loadData();
	}, [toast]);

	// Load customer orders when a customer is selected
	useEffect(() => {
		const loadCustomerOrders = async () => {
			if (selectedCustomerId) {
				try {
					const orders = await getOrdersByCustomerId(selectedCustomerId);
					setSelectedCustomerOrders(orders);
				} catch (error) {
					console.error('Error loading customer orders:', error);
					toast({
						variant: 'destructive',
						title: 'Error',
						description: 'Failed to load customer orders. Please try again.',
					});
				}
			} else {
				setSelectedCustomerOrders([]);
			}
		};

		loadCustomerOrders();
	}, [selectedCustomerId, toast]);

	const handleSaveCustomer = async (customerData: NewCustomer) => {
		try {
			if (editingCustomer) {
				const updatedCustomer = await updateCustomer(
					editingCustomer.id,
					customerData
				);
				setCustomers(
					customers.map((customer) =>
						customer.id === editingCustomer.id ? updatedCustomer : customer
					)
				);
				toast({
					title: 'Success',
					description: 'Customer updated successfully.',
				});
			} else {
				const savedCustomer = await createCustomer(customerData);
				setCustomers([...customers, savedCustomer]);
				toast({
					title: 'Success',
					description: 'Customer added successfully.',
				});
			}
			setEditingCustomer(null);
		} catch (error) {
			console.error('Error saving customer:', error);
			toast({
				variant: 'destructive',
				title: 'Error',
				description: `Failed to ${
					editingCustomer ? 'update' : 'add'
				} customer. Please try again.`,
			});
		}
	};

	const handleEditCustomer = (customer: Customer) => {
		setEditingCustomer(customer);
		setIsCustomerDialogOpen(true);
	};

	const handleDeleteCustomer = async (id: string) => {
		try {
			await deleteCustomer(id);
			setCustomers(customers.filter((customer) => customer.id !== id));
			setDeleteConfirm(null);
			if (selectedCustomerId === id) {
				setSelectedCustomerId(null);
				setIsOrdersSheetOpen(false);
			}
			toast({
				title: 'Success',
				description: 'Customer deleted successfully.',
			});
		} catch (error) {
			console.error('Error deleting customer:', error);
			toast({
				variant: 'destructive',
				title: 'Error',
				description: 'Failed to delete customer. Please try again.',
			});
		}
	};

	const handleViewOrders = (customerId: string) => {
		setSelectedCustomerId(customerId);
		setIsOrdersSheetOpen(true);
	};

	const filteredCustomers = customers.filter(
		(customer) =>
			customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
			customer.phone.includes(searchQuery)
	);

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
			<div className="space-y-6">
				<div className="flex justify-between items-center">
					<h1 className="text-3xl font-bold text-gray-900">Customers</h1>
					<div className="flex items-center space-x-4">
						<div className="relative w-96">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
							<Input
								placeholder="Search customers..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="pl-10"
							/>
						</div>
						<Button onClick={() => setIsCustomerDialogOpen(true)}>
							<Plus className="h-4 w-4 mr-2" />
							Add Customer
						</Button>
					</div>
				</div>

				<div className="rounded-md border">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Name</TableHead>
								<TableHead>Email</TableHead>
								<TableHead>Phone</TableHead>
								<TableHead>Address</TableHead>
								<TableHead>Created</TableHead>
								<TableHead className="w-[140px]">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{filteredCustomers.map((customer) => (
								<TableRow key={customer.id}>
									<TableCell className="font-medium">{customer.name}</TableCell>
									<TableCell>{customer.email}</TableCell>
									<TableCell>{customer.phone}</TableCell>
									<TableCell>{customer.address}</TableCell>
									<TableCell>
										{customer.created_at.toLocaleDateString()}
									</TableCell>
									<TableCell>
										<div className="flex space-x-2">
											<Button
												variant="ghost"
												size="icon"
												onClick={() => handleViewOrders(customer.id)}
												title="View Orders"
											>
												<History className="h-4 w-4" />
											</Button>
											<Button
												variant="ghost"
												size="icon"
												onClick={() => handleEditCustomer(customer)}
												title="Edit Customer"
											>
												<Pencil className="h-4 w-4" />
											</Button>
											<Button
												variant="ghost"
												size="icon"
												className="text-red-500"
												onClick={() => setDeleteConfirm(customer.id)}
												title="Delete Customer"
											>
												<Trash2 className="h-4 w-4" />
											</Button>
										</div>
									</TableCell>
								</TableRow>
							))}
							{filteredCustomers.length === 0 && (
								<TableRow>
									<TableCell
										colSpan={6}
										className="h-24 text-center text-gray-500"
									>
										No customers found
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</div>
			</div>

			<CustomerDialog
				isOpen={isCustomerDialogOpen}
				onClose={() => {
					setIsCustomerDialogOpen(false);
					setEditingCustomer(null);
				}}
				onSave={handleSaveCustomer}
				editingCustomer={editingCustomer}
			/>

			<Sheet
				open={isOrdersSheetOpen}
				onOpenChange={(open) => {
					setIsOrdersSheetOpen(open);
					if (!open) {
						setSelectedCustomerId(null);
					}
				}}
			>
				<SheetContent className="w-full sm:max-w-3xl">
					<SheetHeader>
						<SheetTitle>
							Order History -{' '}
							{
								customers.find((customer) => customer.id === selectedCustomerId)
									?.name
							}
						</SheetTitle>
					</SheetHeader>
					<div className="mt-6">
						<CustomerOrderHistory
							orders={selectedCustomerOrders}
							products={products}
							stainTypes={stainTypes}
						/>
					</div>
				</SheetContent>
			</Sheet>

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
