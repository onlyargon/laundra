'use client';

import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Plus, X, Search } from 'lucide-react';
import { useState } from 'react';
import type { Customer } from '@/app/customers/types';
import type { Product, StainType } from '@/app/settings/types';
import type { NewOrderItem } from '../types';
import { createCustomer } from '@/app/customers/services';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface CreateOrderProps {
	isOpen: boolean;
	onClose: () => void;
	onCreateOrder: (data: {
		customer_id: string;
		items: NewOrderItem[];
		is_express: boolean;
		express_fee: number;
		total_amount: number;
	}) => void;
	onCustomerCreated: (customer: Customer) => void;
	customers: Customer[];
	products: Product[];
	stainTypes: StainType[];
}

export function CreateOrder({
	isOpen,
	onClose,
	onCreateOrder,
	onCustomerCreated,
	customers,
	products,
	stainTypes,
}: CreateOrderProps) {
	const EXPRESS_FEE = 15.0;
	const { toast } = useToast();

	// Form state
	const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
	const [orderItems, setOrderItems] = useState<
		(NewOrderItem & { productName: string })[]
	>([]);
	const [isExpress, setIsExpress] = useState(false);

	// Customer search and registration state
	const [phoneSearch, setPhoneSearch] = useState('');
	const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);
	const [newCustomer, setNewCustomer] = useState({
		name: '',
		phone: '',
		email: '',
		address: '',
	});

	// Filter customers based on phone search
	const filteredCustomers = customers.filter((customer) =>
		customer.phone.includes(phoneSearch)
	);

	// Handle customer selection
	const handleCustomerSelect = (customerId: string) => {
		setSelectedCustomerId(customerId);
		setShowNewCustomerForm(false);
		setPhoneSearch(''); // Clear search field
	};

	// Get selected customer info
	const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

	// Handle new customer registration
	const handleCreateCustomer = async () => {
		try {
			if (!newCustomer.name || !newCustomer.phone) {
				toast({
					variant: 'destructive',
					title: 'Error',
					description: 'Name and phone number are required.',
				});
				return;
			}

			const customer = await createCustomer(newCustomer);
			setSelectedCustomerId(customer.id);
			setShowNewCustomerForm(false);
			setPhoneSearch('');
			onCustomerCreated(customer);
			toast({
				title: 'Success',
				description: 'Customer registered successfully.',
			});
		} catch (error) {
			console.error('Error creating customer:', error);
			toast({
				variant: 'destructive',
				title: 'Error',
				description: 'Failed to register customer. Please try again.',
			});
		}
	};

	// Calculate total amount
	const calculateTotalAmount = () => {
		const itemsTotal = orderItems.reduce(
			(sum, item) =>
				sum + (item.base_price + item.stain_charge) * item.quantity,
			0
		);
		return itemsTotal + (isExpress ? EXPRESS_FEE : 0);
	};

	// Handle adding new item to order
	const handleAddItem = () => {
		const newItem: NewOrderItem & { productName: string } = {
			order_id: '', // This will be set by the server
			product_id: '',
			productName: '',
			quantity: 1,
			stain_type_id: null,
			special_instructions: null,
			base_price: 0,
			stain_charge: 0,
		};
		setOrderItems([...orderItems, newItem]);
	};

	// Handle updating item
	const handleUpdateItem = (
		index: number,
		updates: Partial<NewOrderItem & { productName: string }>
	) => {
		const newItems = [...orderItems];
		newItems[index] = { ...newItems[index], ...updates };

		// Update base price if product changed
		if (updates.product_id) {
			const product = products.find((p) => p.id === updates.product_id);
			if (product) {
				newItems[index].base_price = product.price;
				newItems[index].productName = product.name;
			}
		}

		// Update stain charge if stain type changed
		if ('stain_type_id' in updates) {
			const stainType = updates.stain_type_id
				? stainTypes.find((s) => s.id === updates.stain_type_id)
				: null;
			newItems[index].stain_charge = stainType?.price || 0;
		}

		setOrderItems(newItems);
	};

	// Handle removing item
	const handleRemoveItem = (index: number) => {
		setOrderItems(orderItems.filter((_, i) => i !== index));
	};

	// Handle form submission
	const handleSubmit = () => {
		if (selectedCustomerId && orderItems.length > 0) {
			onCreateOrder({
				customer_id: selectedCustomerId,
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
				items: orderItems.map(({ productName, ...item }) => item),
				is_express: isExpress,
				express_fee: isExpress ? EXPRESS_FEE : 0,
				total_amount: calculateTotalAmount(),
			});

			// Reset form
			setSelectedCustomerId('');
			setOrderItems([]);
			setIsExpress(false);
			setPhoneSearch('');
			setShowNewCustomerForm(false);
			setNewCustomer({
				name: '',
				phone: '',
				email: '',
				address: '',
			});
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="max-w-4xl">
				<DialogHeader>
					<DialogTitle>Create New Order</DialogTitle>
					<DialogDescription>
						Search for a customer by phone number or register a new one.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-6">
					{/* Customer Search and Selection */}
					<div className="space-y-4">
						{selectedCustomer ? (
							<div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
								<div>
									<p className="font-medium">{selectedCustomer.name}</p>
									<p className="text-sm text-gray-500">
										{selectedCustomer.phone}
									</p>
								</div>
								<Button
									variant="ghost"
									size="sm"
									onClick={() => {
										setSelectedCustomerId('');
										setPhoneSearch('');
									}}
								>
									Change Customer
								</Button>
							</div>
						) : (
							<>
								<div className="relative">
									<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
									<Input
										placeholder="Search customer by phone number..."
										value={phoneSearch}
										onChange={(e) => {
											setPhoneSearch(e.target.value);
											setShowNewCustomerForm(false);
										}}
										className="pl-10"
									/>
								</div>

								{phoneSearch && !showNewCustomerForm && (
									<div className="border rounded-md">
										{filteredCustomers.length > 0 ? (
											filteredCustomers.map((customer) => (
												<div
													key={customer.id}
													className="px-3 py-2 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
													onClick={() => handleCustomerSelect(customer.id)}
												>
													<div className="text-sm">
														<div className="font-medium">{customer.name}</div>
														<div className="text-gray-500">
															{customer.phone}{' '}
															{customer.email && `• ${customer.email}`}
														</div>
														{customer.address && (
															<div className="text-gray-400 text-xs">
																📍 {customer.address}
															</div>
														)}
													</div>
												</div>
											))
										) : (
											<div className="p-3 text-center">
												<p className="text-sm text-gray-500 mb-2">
													No customer found with this phone number
												</p>
												<Button
													variant="outline"
													size="sm"
													onClick={() => {
														setShowNewCustomerForm(true);
														setNewCustomer((prev) => ({
															...prev,
															phone: phoneSearch,
														}));
													}}
												>
													Register New Customer
												</Button>
											</div>
										)}
									</div>
								)}

								{showNewCustomerForm && (
									<div className="border rounded-md p-4 space-y-4">
										<h3 className="font-medium">Register New Customer</h3>
										<div className="space-y-4">
											<div className="grid grid-cols-2 gap-4">
												<div className="space-y-2">
													<Label htmlFor="name">Name *</Label>
													<Input
														id="name"
														value={newCustomer.name}
														onChange={(e) =>
															setNewCustomer((prev) => ({
																...prev,
																name: e.target.value,
															}))
														}
														placeholder="Customer name"
													/>
												</div>
												<div className="space-y-2">
													<Label htmlFor="phone">Phone *</Label>
													<Input
														id="phone"
														value={newCustomer.phone}
														onChange={(e) =>
															setNewCustomer((prev) => ({
																...prev,
																phone: e.target.value,
															}))
														}
														placeholder="Phone number"
													/>
												</div>
												<div className="space-y-2">
													<Label htmlFor="email">Email</Label>
													<Input
														id="email"
														type="email"
														value={newCustomer.email}
														onChange={(e) =>
															setNewCustomer((prev) => ({
																...prev,
																email: e.target.value,
															}))
														}
														placeholder="Email address"
													/>
												</div>
												<div className="space-y-2">
													<Label htmlFor="address">Address</Label>
													<Input
														id="address"
														value={newCustomer.address}
														onChange={(e) =>
															setNewCustomer((prev) => ({
																...prev,
																address: e.target.value,
															}))
														}
														placeholder="Address"
													/>
												</div>
											</div>
											<div className="flex justify-end space-x-2">
												<Button
													variant="ghost"
													onClick={() => {
														setShowNewCustomerForm(false);
														setNewCustomer({
															name: '',
															phone: '',
															email: '',
															address: '',
														});
													}}
												>
													Cancel
												</Button>
												<Button onClick={handleCreateCustomer}>
													Register Customer
												</Button>
											</div>
										</div>
									</div>
								)}
							</>
						)}
					</div>

					{/* Order Items */}
					<div className="space-y-4">
						<div className="flex justify-between items-center">
							<h3 className="text-lg font-semibold">Order Items</h3>
							<Button onClick={handleAddItem}>
								<Plus className="h-4 w-4 mr-2" />
								Add Item
							</Button>
						</div>

						{orderItems.map((item, index) => (
							<div key={index} className="grid grid-cols-6 gap-4 items-start">
								<div className="col-span-2">
									<Select
										value={item.product_id}
										onValueChange={(value) =>
											handleUpdateItem(index, { product_id: value })
										}
									>
										<SelectTrigger>
											<SelectValue placeholder="Select a product" />
										</SelectTrigger>
										<SelectContent>
											{products.map((product) => (
												<SelectItem key={product.id} value={product.id}>
													{product.name} - £{product.price.toFixed(2)}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>

								<div>
									<Input
										type="number"
										min="1"
										value={item.quantity}
										onChange={(e) =>
											handleUpdateItem(index, {
												quantity: parseInt(e.target.value) || 1,
											})
										}
									/>
								</div>

								<div className="col-span-2">
									<Select
										value={item.stain_type_id || 'none'}
										onValueChange={(value) =>
											handleUpdateItem(index, {
												stain_type_id: value === 'none' ? null : value,
											})
										}
									>
										<SelectTrigger>
											<SelectValue placeholder="Select stain type (optional)" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="none">No stain treatment</SelectItem>
											{stainTypes.map((stain) => (
												<SelectItem key={stain.id} value={stain.id}>
													{stain.name} (+£{stain.price.toFixed(2)})
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>

								<Button
									variant="ghost"
									size="icon"
									className="text-red-500"
									onClick={() => handleRemoveItem(index)}
								>
									<X className="h-4 w-4" />
								</Button>
							</div>
						))}
					</div>

					{/* Express Service */}
					<div className="flex items-center space-x-2">
						<input
							type="checkbox"
							id="express"
							checked={isExpress}
							onChange={(e) => setIsExpress(e.target.checked)}
							className="h-4 w-4 rounded border-gray-300"
						/>
						<label htmlFor="express" className="text-sm">
							Express Service (+£{EXPRESS_FEE.toFixed(2)})
						</label>
					</div>

					{/* Order Summary */}
					<div className="bg-gray-50 p-4 rounded-lg">
						<h3 className="font-semibold mb-2">Order Summary</h3>
						<div className="space-y-1 text-sm">
							{orderItems.map((item, index) => (
								<div key={index} className="flex justify-between text-gray-600">
									<span>
										{item.quantity}x {item.productName}
										{item.stain_type_id &&
											` (+ ${
												stainTypes.find((s) => s.id === item.stain_type_id)
													?.name
											} treatment)`}
									</span>
									<span>
										£
										{(
											(item.base_price + item.stain_charge) *
											item.quantity
										).toFixed(2)}
									</span>
								</div>
							))}
							{isExpress && (
								<div className="flex justify-between text-gray-600">
									<span>Express Service Fee</span>
									<span>£{EXPRESS_FEE.toFixed(2)}</span>
								</div>
							)}
							<div className="flex justify-between font-semibold pt-2 border-t">
								<span>Total</span>
								<span>£{calculateTotalAmount().toFixed(2)}</span>
							</div>
						</div>
					</div>
				</div>

				<DialogFooter>
					<Button variant="ghost" onClick={onClose}>
						Cancel
					</Button>
					<Button
						onClick={handleSubmit}
						disabled={!selectedCustomerId || orderItems.length === 0}
					>
						Create Order
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
