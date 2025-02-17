'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
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
import { Plus, X, Search, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getCustomers, createCustomer } from '@/app/customers/services';
import {
	getProducts,
	getStainTypes,
	getCategories,
} from '@/app/settings/services';
import { createOrder } from '../services';
import type { Customer } from '@/app/customers/types';
import type { Product, StainType, Category } from '@/app/settings/types';
import type { NewOrderItem, DeliveryType } from '../types';

export default function NewOrderPage() {
	const router = useRouter();
	const { toast } = useToast();
	const EXPRESS_FEE = 15.0;

	// Data loading state
	const [isLoading, setIsLoading] = useState(true);
	const [customers, setCustomers] = useState<Customer[]>([]);
	const [products, setProducts] = useState<Product[]>([]);
	const [stainTypes, setStainTypes] = useState<StainType[]>([]);
	const [categories, setCategories] = useState<Category[]>([]);

	// Form state
	const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
	const [orderItems, setOrderItems] = useState<
		(NewOrderItem & {
			productName: string;
			customPrice: number | null;
			category_id: string | null;
		})[]
	>([]);
	const [isExpress, setIsExpress] = useState(false);
	const [deliveryType, setDeliveryType] = useState<DeliveryType>('In-store');

	// Customer search and registration state
	const [phoneSearch, setPhoneSearch] = useState('');
	const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);
	const [newCustomer, setNewCustomer] = useState({
		name: '',
		phone: '',
		email: '',
		address: '',
	});

	useEffect(() => {
		const loadData = async () => {
			try {
				const [customersData, productsData, stainTypesData, categoriesData] =
					await Promise.all([
						getCustomers(),
						getProducts(),
						getStainTypes(),
						getCategories(),
					]);

				setCustomers(customersData);
				setProducts(productsData);
				setStainTypes(stainTypesData);
				setCategories(categoriesData);
			} catch (error) {
				console.error('Error loading data:', error);
				toast({
					variant: 'destructive',
					title: 'Error',
					description: 'Failed to load required data. Please try again.',
				});
			} finally {
				setIsLoading(false);
			}
		};

		loadData();
	}, [toast]);

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
			setCustomers((prev) => [...prev, customer]);
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
		const itemsTotal = orderItems.reduce((sum, item) => {
			const itemPrice =
				item.customPrice !== null ? item.customPrice : item.base_price;
			return sum + (itemPrice + item.stain_charge) * item.quantity;
		}, 0);
		const subtotal = itemsTotal + (isExpress ? EXPRESS_FEE : 0);
		const vat = subtotal * 0.2; // 20% VAT
		return subtotal + vat;
	};

	// Handle adding new item to order
	const handleAddItem = () => {
		const newItem = {
			order_id: '', // This will be set by the server
			product_id: '',
			productName: '',
			quantity: 1,
			stain_type_id: null,
			special_instructions: null,
			base_price: 0,
			custom_price: 0,
			stain_charge: 0,
			customPrice: null,
			category_id: null,
		};
		setOrderItems([...orderItems, newItem]);
	};

	// Handle updating item
	const handleUpdateItem = (
		index: number,
		updates: Partial<
			NewOrderItem & {
				productName: string;
				customPrice: number | null;
				category_id: string | null;
			}
		>
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

	const generateOrderNumber = () => {
		const now = new Date();
		const yearPart = now.getFullYear().toString().slice(-2);
		const monthPart = String(now.getMonth() + 1).padStart(2, '0');
		const dayPart = String(now.getDate()).padStart(2, '0');
		const baseNumberString = `${yearPart}${monthPart}${dayPart}`;
		const sequentialNumber = String(
			Math.floor(Math.random() * 999) + 1
		).padStart(3, '0');
		return parseInt(`${baseNumberString}${sequentialNumber}`, 10);
	};

	// Handle form submission
	const handleSubmit = async () => {
		if (selectedCustomerId && orderItems.length > 0) {
			try {
				const orderData = {
					customer_id: selectedCustomerId,
					items: orderItems.map(({ customPrice, ...item }) => ({
						...item,
						custom_price: customPrice || item.custom_price,
					})),
					delivery_type: deliveryType,
					is_express: isExpress,
					express_fee: isExpress ? EXPRESS_FEE : 0,
					total_amount: calculateTotalAmount(),
					status: 'cleaning' as const,
					order_number: generateOrderNumber(),
				};

				await createOrder(orderData, orderData.items);
				toast({
					title: 'Success',
					description: 'Order created successfully.',
				});
				router.push('/orders');
			} catch (error) {
				console.error('Error creating order:', error);
				toast({
					variant: 'destructive',
					title: 'Error',
					description: 'Failed to create order. Please try again.',
				});
			}
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
			<div className="max-w-6xl mx-auto space-y-8 pb-10">
				<div className="flex justify-between items-center">
					<div>
						<h1 className="text-3xl font-bold text-gray-900">
							Create New Order
						</h1>
						<p className="text-gray-500 mt-1">
							Create a new order by selecting a customer and adding items
						</p>
					</div>
					<div className="flex space-x-3">
						<Button variant="outline" onClick={() => router.push('/orders')}>
							Cancel
						</Button>
						<Button
							onClick={handleSubmit}
							disabled={!selectedCustomerId || orderItems.length === 0}
						>
							Create Order
						</Button>
					</div>
				</div>

				<div className="grid grid-cols-3 gap-6">
					{/* Left Column - Order Details */}
					<div className="col-span-2 space-y-6">
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center space-x-2">
									<span>Customer Details</span>
								</CardTitle>
							</CardHeader>
							<CardContent>
								{selectedCustomer ? (
									<div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
										<div>
											<p className="font-medium">{selectedCustomer.name}</p>
											<p className="text-sm text-gray-500">
												{selectedCustomer.phone}
												{selectedCustomer.email &&
													` • ${selectedCustomer.email}`}
											</p>
											{selectedCustomer.address && (
												<p className="text-sm text-gray-500 mt-1">
													📍 {selectedCustomer.address}
												</p>
											)}
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
									<div className="space-y-4">
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
											<div className="border rounded-lg overflow-hidden">
												{filteredCustomers.length > 0 ? (
													<div className="divide-y">
														{filteredCustomers.map((customer) => (
															<div
																key={customer.id}
																className="px-4 py-3 hover:bg-gray-50 cursor-pointer"
																onClick={() =>
																	handleCustomerSelect(customer.id)
																}
															>
																<div className="font-medium">
																	{customer.name}
																</div>
																<div className="text-sm text-gray-500">
																	{customer.phone}
																	{customer.email && ` • ${customer.email}`}
																</div>
																{customer.address && (
																	<div className="text-sm text-gray-500 mt-1">
																		📍 {customer.address}
																	</div>
																)}
															</div>
														))}
													</div>
												) : (
													<div className="p-4 text-center">
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
											<div className="border rounded-lg p-4 space-y-4">
												<h3 className="font-medium">Register New Customer</h3>
												<div className="grid grid-cols-2 gap-4">
													<div className="space-y-2">
														<label className="text-sm font-medium text-gray-700">
															Name *
														</label>
														<Input
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
														<label className="text-sm font-medium text-gray-700">
															Phone *
														</label>
														<Input
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
														<label className="text-sm font-medium text-gray-700">
															Email
														</label>
														<Input
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
														<label className="text-sm font-medium text-gray-700">
															Address
														</label>
														<Input
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
												<div className="flex justify-end space-x-2 pt-2">
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
										)}
									</div>
								)}
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle className="flex items-center space-x-2">
									<span>Order Items</span>
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-6">
								<div className="flex justify-end">
									<Button onClick={handleAddItem} variant="outline" size="sm">
										<Plus className="h-4 w-4 mr-2" />
										Add Item
									</Button>
								</div>

								<div className="space-y-2">
									{/* Headers */}
									<div className="grid grid-cols-[2fr_2fr_1fr_1.5fr_1fr_auto] gap-4 px-4 py-2 bg-gray-50 rounded-lg text-sm font-medium text-gray-600">
										<div>Category</div>
										<div>Product</div>
										<div>Qty</div>
										<div>Treatment</div>
										<div>Price</div>
										<div></div>
									</div>

									{/* Items */}
									{orderItems.map((item, index) => (
										<div key={index}>
											<div className="grid grid-cols-[2fr_2fr_1fr_1.5fr_1fr_auto] gap-4 items-center bg-white rounded-lg border p-3">
												<div>
													<Select
														value={item.category_id || ''}
														onValueChange={(value) =>
															handleUpdateItem(index, {
																category_id: value,
																product_id: '',
																productName: '',
																base_price: 0,
																customPrice: null,
															})
														}
													>
														<SelectTrigger className="h-9">
															<SelectValue placeholder="Select category" />
														</SelectTrigger>
														<SelectContent>
															{categories.map((category) => (
																<SelectItem
																	key={category.id}
																	value={category.id}
																>
																	{category.name}
																</SelectItem>
															))}
														</SelectContent>
													</Select>
												</div>

												<div>
													<Select
														value={item.product_id}
														onValueChange={(value) =>
															handleUpdateItem(index, { product_id: value })
														}
														disabled={!item.category_id}
													>
														<SelectTrigger className="h-9">
															<SelectValue
																placeholder={
																	item.category_id
																		? 'Select product'
																		: 'Select category first'
																}
															/>
														</SelectTrigger>
														<SelectContent>
															{products
																.filter(
																	(product) =>
																		product.category_id === item.category_id
																)
																.map((product) => (
																	<SelectItem
																		key={product.id}
																		value={product.id}
																	>
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
														className="h-9"
													/>
												</div>

												<div>
													<Select
														value={item.stain_type_id || 'none'}
														onValueChange={(value) =>
															handleUpdateItem(index, {
																stain_type_id: value === 'none' ? null : value,
															})
														}
													>
														<SelectTrigger className="h-9">
															<SelectValue placeholder="None" />
														</SelectTrigger>
														<SelectContent>
															<SelectItem value="none">None</SelectItem>
															{stainTypes.map((stain) => (
																<SelectItem key={stain.id} value={stain.id}>
																	{stain.name} (+£{stain.price.toFixed(2)})
																</SelectItem>
															))}
														</SelectContent>
													</Select>
												</div>

												<div>
													<Input
														type="number"
														min="0"
														step="0.01"
														placeholder="Price..."
														value={
															item.customPrice !== null
																? item.customPrice
																: item.base_price
														}
														onChange={(e) =>
															handleUpdateItem(index, {
																customPrice: e.target.value
																	? parseFloat(e.target.value)
																	: null,
															})
														}
														className="h-9"
													/>
												</div>

												<div className="flex items-center">
													<Button
														variant="ghost"
														size="icon"
														className="h-9 w-9 text-red-500 hover:text-red-600 hover:bg-red-50"
														onClick={() => handleRemoveItem(index)}
													>
														<X className="h-4 w-4" />
													</Button>
												</div>

												{/* Special Instructions (expandable) */}
												<div className="col-span-full mt-2">
													<Input
														placeholder="Add special instructions..."
														value={item.special_instructions || ''}
														onChange={(e) =>
															handleUpdateItem(index, {
																special_instructions: e.target.value,
															})
														}
														className="h-9 text-sm bg-gray-50/50"
													/>
												</div>
											</div>
										</div>
									))}

									{orderItems.length === 0 && (
										<div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed">
											<p>No items added yet</p>
											<Button
												variant="link"
												onClick={handleAddItem}
												className="mt-2"
											>
												Add your first item
											</Button>
										</div>
									)}
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Right Column - Order Options & Summary */}
					<div className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle>Order Options</CardTitle>
							</CardHeader>
							<CardContent className="space-y-6">
								{/* Delivery Type */}
								<div className="space-y-2">
									<label className="text-sm font-medium text-gray-700">
										Delivery Type
									</label>
									<Select
										value={deliveryType}
										onValueChange={(value: DeliveryType) =>
											setDeliveryType(value)
										}
									>
										<SelectTrigger>
											<SelectValue placeholder="Select delivery type" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="In-store">In-store</SelectItem>
											<SelectItem value="Pickup and Delivery">
												Pickup and Delivery
											</SelectItem>
											<SelectItem value="Pick up">Pick up</SelectItem>
											<SelectItem value="Delivery">Delivery</SelectItem>
										</SelectContent>
									</Select>
								</div>

								{/* Express Service */}
								<div className="pt-2">
									<label className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
										<input
											type="checkbox"
											id="express"
											checked={isExpress}
											onChange={(e) => setIsExpress(e.target.checked)}
											className="h-4 w-4 rounded border-gray-300 text-primary"
										/>
										<div>
											<span className="text-sm font-medium block">
												Express Service
											</span>
											<span className="text-sm text-gray-500">
												+£{EXPRESS_FEE.toFixed(2)}
											</span>
										</div>
									</label>
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Order Summary</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									{orderItems.map((item, index) => (
										<div key={index} className="flex justify-between text-sm">
											<div className="space-y-1">
												<span className="font-medium">
													{item.quantity}x {item.productName}
												</span>
												{item.stain_type_id && (
													<span className="block text-gray-500 text-xs">
														+{' '}
														{
															stainTypes.find(
																(s) => s.id === item.stain_type_id
															)?.name
														}{' '}
														treatment
													</span>
												)}
												{item.special_instructions && (
													<span className="block text-gray-500 text-xs">
														Note: {item.special_instructions}
													</span>
												)}
												{item.customPrice && (
													<span className="block text-gray-500 text-xs">
														Custom Price
													</span>
												)}
											</div>
											<span className="font-medium">
												£
												{(
													((item.customPrice !== null
														? item.customPrice
														: item.base_price) +
														item.stain_charge) *
													item.quantity
												).toFixed(2)}
											</span>
										</div>
									))}

									<div className="border-t pt-4 space-y-2">
										{isExpress && (
											<div className="flex justify-between text-sm">
												<span className="text-gray-600">Express Fee</span>
												<span>£{EXPRESS_FEE.toFixed(2)}</span>
											</div>
										)}
										<div className="flex justify-between text-sm">
											<span className="text-gray-600">Subtotal</span>
											<span>
												£
												{(
													orderItems.reduce((sum, item) => {
														const itemPrice =
															item.customPrice !== null
																? item.customPrice
																: item.base_price;
														return (
															sum +
															(itemPrice + item.stain_charge) * item.quantity
														);
													}, 0) + (isExpress ? EXPRESS_FEE : 0)
												).toFixed(2)}
											</span>
										</div>
										<div className="flex justify-between text-sm">
											<span className="text-gray-600">VAT (20%)</span>
											<span>
												£
												{(
													(orderItems.reduce((sum, item) => {
														const itemPrice =
															item.customPrice !== null
																? item.customPrice
																: item.base_price;
														return (
															sum +
															(itemPrice + item.stain_charge) * item.quantity
														);
													}, 0) +
														(isExpress ? EXPRESS_FEE : 0)) *
													0.2
												).toFixed(2)}
											</span>
										</div>
										<div className="flex justify-between text-base font-medium pt-2 border-t">
											<span>Total (inc. VAT)</span>
											<span>£{calculateTotalAmount().toFixed(2)}</span>
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</AppLayout>
	);
}
