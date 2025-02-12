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
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Plus, Search, ArrowRight, ArrowLeft, X } from 'lucide-react';
import { useState } from 'react';

// Types
type OrderStatus = 'new' | 'cleaning' | 'ready' | 'completed' | 'picked-up';

type OrderItem = {
	id: string;
	productId: string;
	quantity: number;
	stainTypeId?: string;
	specialInstructions?: string;
	basePrice: number;
	stainCharge: number;
};

type Order = {
	id: string;
	customerId: string;
	customerName: string; // For display purposes
	status: OrderStatus;
	items: OrderItem[];
	isExpress: boolean;
	expressFee: number;
	totalAmount: number;
	createdAt: Date;
	updatedAt: Date;
};

type Customer = {
	id: string;
	name: string;
	email: string;
	phone: string;
	address: string;
};

type Product = {
	id: string;
	name: string;
	category: string;
	price: number;
};

type StainType = {
	id: string;
	name: string;
	additionalCharge: number;
};

export default function Orders() {
	// Sample data
	const [customers] = useState<Customer[]>([
		{
			id: '1',
			name: 'John Doe',
			email: 'john@example.com',
			phone: '+1234567890',
			address: '123 Main St',
		},
	]);

	const [products] = useState<Product[]>([
		{
			id: '1',
			name: 'Wash & Fold',
			category: '1',
			price: 15.0,
		},
		{
			id: '2',
			name: 'Dry Clean Shirt',
			category: '2',
			price: 8.0,
		},
	]);

	const [stainTypes] = useState<StainType[]>([
		{
			id: '1',
			name: 'Oil',
			additionalCharge: 5.0,
		},
		{
			id: '2',
			name: 'Wine',
			additionalCharge: 7.5,
		},
	]);

	// Orders state
	const [orders, setOrders] = useState<Order[]>([
		{
			id: '1',
			customerId: '1',
			customerName: 'John Doe',
			status: 'new',
			items: [
				{
					id: '1',
					productId: '1',
					quantity: 2,
					basePrice: 15.0,
					stainCharge: 0,
				},
			],
			isExpress: false,
			expressFee: 0,
			totalAmount: 30.0,
			createdAt: new Date(),
			updatedAt: new Date(),
		},
	]);

	// UI state
	const [selectedStatus, setSelectedStatus] = useState<OrderStatus>('new');
	const [searchQuery, setSearchQuery] = useState('');
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

	// New state for order creation
	const [newCustomer, setNewCustomer] = useState({
		name: '',
		email: '',
		phone: '',
		address: '',
	});
	const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
	const [isNewCustomer, setIsNewCustomer] = useState(false);
	const [orderItems, setOrderItems] = useState<
		(OrderItem & { productName: string })[]
	>([]);
	const [isExpress, setIsExpress] = useState(false);
	const EXPRESS_FEE = 15.0; // $15 express fee

	// Add new state for viewing order details
	const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
	const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

	// Filter orders based on status and search query
	const filteredOrders = orders.filter(
		(order) =>
			order.status === selectedStatus &&
			(order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
				order.id.includes(searchQuery))
	);

	// Status management
	const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
		setOrders(
			orders.map((order) =>
				order.id === orderId
					? {
							...order,
							status: newStatus,
							updatedAt: new Date(),
					  }
					: order
			)
		);
	};

	const canMoveToStatus = (
		currentStatus: OrderStatus,
		targetStatus: OrderStatus
	) => {
		const statusOrder: OrderStatus[] = [
			'new',
			'cleaning',
			'ready',
			'completed',
			'picked-up',
		];
		const currentIndex = statusOrder.indexOf(currentStatus);
		const targetIndex = statusOrder.indexOf(targetStatus);
		return Math.abs(currentIndex - targetIndex) === 1;
	};

	// Calculate total amount
	const calculateTotalAmount = () => {
		const itemsTotal = orderItems.reduce(
			(sum, item) => sum + (item.basePrice + item.stainCharge) * item.quantity,
			0
		);
		return itemsTotal + (isExpress ? EXPRESS_FEE : 0);
	};

	// Handle adding new item to order
	const handleAddItem = () => {
		const newItem: OrderItem & { productName: string } = {
			id: Date.now().toString(),
			productId: '',
			productName: '',
			quantity: 1,
			basePrice: 0,
			stainCharge: 0,
		};
		setOrderItems([...orderItems, newItem]);
	};

	// Handle updating item
	const handleUpdateItem = (
		index: number,
		updates: Partial<OrderItem & { productName: string }>
	) => {
		const newItems = [...orderItems];
		newItems[index] = { ...newItems[index], ...updates };

		// Update base price if product changed
		if (updates.productId) {
			const product = products.find((p) => p.id === updates.productId);
			if (product) {
				newItems[index].basePrice = product.price;
				newItems[index].productName = product.name;
			}
		}

		// Update stain charge if stain type changed
		if (updates.stainTypeId) {
			const stainType = stainTypes.find((s) => s.id === updates.stainTypeId);
			newItems[index].stainCharge = stainType?.additionalCharge || 0;
		}

		setOrderItems(newItems);
	};

	// Handle removing item
	const handleRemoveItem = (index: number) => {
		setOrderItems(orderItems.filter((_, i) => i !== index));
	};

	// Handle order creation
	const handleCreateOrder = () => {
		const customer = isNewCustomer
			? {
					id: Date.now().toString(),
					...newCustomer,
			  }
			: customers.find((c) => c.id === selectedCustomerId);

		if (!customer) return;

		const newOrder: Order = {
			id: Date.now().toString(),
			customerId: customer.id,
			customerName: customer.name,
			status: 'new',
			items: orderItems.map(({ productName, ...item }) => item),
			isExpress,
			expressFee: isExpress ? EXPRESS_FEE : 0,
			totalAmount: calculateTotalAmount(),
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		setOrders([...orders, newOrder]);
		setIsCreateDialogOpen(false);
		resetOrderForm();
	};

	// Reset order form
	const resetOrderForm = () => {
		setSelectedCustomerId('');
		setIsNewCustomer(false);
		setNewCustomer({ name: '', email: '', phone: '', address: '' });
		setOrderItems([]);
		setIsExpress(false);
	};

	// Add handler to open order details
	const handleViewOrder = (order: Order) => {
		setSelectedOrder(order);
		setIsViewDialogOpen(true);
	};

	return (
		<AppLayout>
			<div className="space-y-8">
				<div className="flex justify-between items-center">
					<h1 className="text-3xl font-bold text-gray-900">Orders</h1>
					<div className="flex items-center space-x-4">
						<div className="relative w-96">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
							<Input
								placeholder="Search orders..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="pl-10"
							/>
						</div>
						<Button onClick={() => setIsCreateDialogOpen(true)}>
							<Plus className="h-4 w-4 mr-2" />
							New Order
						</Button>
					</div>
				</div>

				<Tabs
					value={selectedStatus}
					onValueChange={(value) => setSelectedStatus(value as OrderStatus)}
				>
					<TabsList>
						<TabsTrigger value="new">New</TabsTrigger>
						<TabsTrigger value="cleaning">Cleaning</TabsTrigger>
						<TabsTrigger value="ready">Ready</TabsTrigger>
						<TabsTrigger value="completed">Completed</TabsTrigger>
						<TabsTrigger value="picked-up">Picked Up</TabsTrigger>
					</TabsList>

					<TabsContent value={selectedStatus}>
						<Card>
							<CardHeader>
								<CardTitle>
									{selectedStatus.charAt(0).toUpperCase() +
										selectedStatus.slice(1)}{' '}
									Orders
								</CardTitle>
							</CardHeader>
							<CardContent>
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Order ID</TableHead>
											<TableHead>Customer</TableHead>
											<TableHead>Items</TableHead>
											<TableHead>Total Amount</TableHead>
											<TableHead>Created At</TableHead>
											<TableHead>Actions</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{filteredOrders.map((order) => (
											<TableRow key={order.id}>
												<TableCell>{order.id}</TableCell>
												<TableCell>{order.customerName}</TableCell>
												<TableCell>{order.items.length} items</TableCell>
												<TableCell>${order.totalAmount.toFixed(2)}</TableCell>
												<TableCell>
													{order.createdAt.toLocaleDateString()}
												</TableCell>
												<TableCell>
													<div className="flex space-x-2">
														<Button
															variant="ghost"
															size="icon"
															onClick={() => handleViewOrder(order)}
														>
															<svg
																xmlns="http://www.w3.org/2000/svg"
																viewBox="0 0 24 24"
																fill="none"
																stroke="currentColor"
																strokeWidth="2"
																strokeLinecap="round"
																strokeLinejoin="round"
																className="h-4 w-4"
															>
																<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
																<circle cx="12" cy="12" r="3" />
															</svg>
														</Button>
														{canMoveToStatus(
															order.status,
															statusOrder[statusOrder.indexOf(order.status) - 1]
														) && (
															<Button
																variant="ghost"
																size="icon"
																onClick={() =>
																	handleStatusChange(
																		order.id,
																		statusOrder[
																			statusOrder.indexOf(order.status) - 1
																		]
																	)
																}
															>
																<ArrowLeft className="h-4 w-4" />
															</Button>
														)}
														{canMoveToStatus(
															order.status,
															statusOrder[statusOrder.indexOf(order.status) + 1]
														) && (
															<Button
																variant="ghost"
																size="icon"
																onClick={() =>
																	handleStatusChange(
																		order.id,
																		statusOrder[
																			statusOrder.indexOf(order.status) + 1
																		]
																	)
																}
															>
																<ArrowRight className="h-4 w-4" />
															</Button>
														)}
													</div>
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>
			</div>

			{/* Create Order Dialog */}
			<Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
				<DialogContent className="max-w-4xl">
					<DialogHeader>
						<DialogTitle>Create New Order</DialogTitle>
						<DialogDescription>
							Create a new order by selecting a customer and adding items.
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-6">
						{/* Customer Selection */}
						<div className="space-y-4">
							<div className="flex items-center space-x-4">
								<Button
									variant={isNewCustomer ? 'ghost' : 'default'}
									onClick={() => setIsNewCustomer(false)}
								>
									Existing Customer
								</Button>
								<Button
									variant={isNewCustomer ? 'default' : 'ghost'}
									onClick={() => setIsNewCustomer(true)}
								>
									New Customer
								</Button>
							</div>

							{isNewCustomer ? (
								<div className="grid grid-cols-2 gap-4">
									<Input
										placeholder="Customer Name"
										value={newCustomer.name}
										onChange={(e) =>
											setNewCustomer({
												...newCustomer,
												name: e.target.value,
											})
										}
									/>
									<Input
										placeholder="Email"
										type="email"
										value={newCustomer.email}
										onChange={(e) =>
											setNewCustomer({
												...newCustomer,
												email: e.target.value,
											})
										}
									/>
									<Input
										placeholder="Phone"
										value={newCustomer.phone}
										onChange={(e) =>
											setNewCustomer({
												...newCustomer,
												phone: e.target.value,
											})
										}
									/>
									<Input
										placeholder="Address"
										value={newCustomer.address}
										onChange={(e) =>
											setNewCustomer({
												...newCustomer,
												address: e.target.value,
											})
										}
									/>
								</div>
							) : (
								<Select
									value={selectedCustomerId}
									onValueChange={setSelectedCustomerId}
								>
									<SelectTrigger>
										<SelectValue placeholder="Select a customer" />
									</SelectTrigger>
									<SelectContent>
										{customers.map((customer) => (
											<SelectItem key={customer.id} value={customer.id}>
												{customer.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
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
								<div
									key={item.id}
									className="grid grid-cols-6 gap-4 items-start"
								>
									<div className="col-span-2">
										<Select
											value={item.productId}
											onValueChange={(value) =>
												handleUpdateItem(index, { productId: value })
											}
										>
											<SelectTrigger>
												<SelectValue placeholder="Select a product" />
											</SelectTrigger>
											<SelectContent>
												{products.map((product) => (
													<SelectItem key={product.id} value={product.id}>
														{product.name} - ${product.price.toFixed(2)}
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
											value={item.stainTypeId || 'none'}
											onValueChange={(value) =>
												handleUpdateItem(index, {
													stainTypeId: value === 'none' ? undefined : value,
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
														{stain.name} (+${stain.additionalCharge.toFixed(2)})
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
								Express Service (+${EXPRESS_FEE.toFixed(2)})
							</label>
						</div>

						{/* Order Summary */}
						<div className="bg-gray-50 p-4 rounded-lg">
							<h3 className="font-semibold mb-2">Order Summary</h3>
							<div className="space-y-1 text-sm">
								{orderItems.map((item) => (
									<div
										key={item.id}
										className="flex justify-between text-gray-600"
									>
										<span>
											{item.quantity}x {item.productName}
											{item.stainTypeId &&
												` (+ ${
													stainTypes.find((s) => s.id === item.stainTypeId)
														?.name
												} treatment)`}
										</span>
										<span>
											$
											{(
												(item.basePrice + item.stainCharge) *
												item.quantity
											).toFixed(2)}
										</span>
									</div>
								))}
								{isExpress && (
									<div className="flex justify-between text-gray-600">
										<span>Express Service Fee</span>
										<span>${EXPRESS_FEE.toFixed(2)}</span>
									</div>
								)}
								<div className="flex justify-between font-semibold pt-2 border-t">
									<span>Total</span>
									<span>${calculateTotalAmount().toFixed(2)}</span>
								</div>
							</div>
						</div>
					</div>

					<DialogFooter>
						<Button
							variant="ghost"
							onClick={() => setIsCreateDialogOpen(false)}
						>
							Cancel
						</Button>
						<Button
							onClick={handleCreateOrder}
							disabled={
								(!isNewCustomer && !selectedCustomerId) ||
								(isNewCustomer &&
									(!newCustomer.name ||
										!newCustomer.phone ||
										!newCustomer.email)) ||
								orderItems.length === 0 ||
								orderItems.some((item) => !item.productId)
							}
						>
							Create Order
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* View Order Details Dialog */}
			<Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
				<DialogContent className="max-w-4xl">
					<DialogHeader>
						<DialogTitle>Order Details</DialogTitle>
						<DialogDescription>
							Order #{selectedOrder?.id} - Created on{' '}
							{selectedOrder?.createdAt.toLocaleDateString()}
						</DialogDescription>
					</DialogHeader>

					{selectedOrder && (
						<div className="space-y-6">
							{/* Customer Information */}
							<div>
								<h3 className="text-lg font-semibold mb-2">
									Customer Information
								</h3>
								<div className="grid grid-cols-2 gap-4 text-sm">
									<div>
										<span className="font-medium">Name:</span>{' '}
										{selectedOrder.customerName}
									</div>
									<div>
										<span className="font-medium">Customer ID:</span>{' '}
										{selectedOrder.customerId}
									</div>
								</div>
							</div>

							{/* Order Status */}
							<div>
								<h3 className="text-lg font-semibold mb-2">Order Status</h3>
								<div className="flex items-center space-x-2">
									<span
										className={`px-2 py-1 rounded-full text-xs font-medium ${
											selectedOrder.status === 'new'
												? 'bg-blue-100 text-blue-800'
												: selectedOrder.status === 'cleaning'
												? 'bg-yellow-100 text-yellow-800'
												: selectedOrder.status === 'ready'
												? 'bg-green-100 text-green-800'
												: selectedOrder.status === 'completed'
												? 'bg-purple-100 text-purple-800'
												: 'bg-gray-100 text-gray-800'
										}`}
									>
										{selectedOrder.status.charAt(0).toUpperCase() +
											selectedOrder.status.slice(1)}
									</span>
									<span className="text-sm text-gray-500">
										Last updated: {selectedOrder.updatedAt.toLocaleDateString()}
									</span>
								</div>
							</div>

							{/* Order Items */}
							<div>
								<h3 className="text-lg font-semibold mb-2">Order Items</h3>
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Item</TableHead>
											<TableHead>Quantity</TableHead>
											<TableHead>Base Price</TableHead>
											<TableHead>Stain Treatment</TableHead>
											<TableHead>Total</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{selectedOrder.items.map((item) => {
											const product = products.find(
												(p) => p.id === item.productId
											);
											const stain = item.stainTypeId
												? stainTypes.find((s) => s.id === item.stainTypeId)
												: null;

											return (
												<TableRow key={item.id}>
													<TableCell>{product?.name}</TableCell>
													<TableCell>{item.quantity}</TableCell>
													<TableCell>${item.basePrice.toFixed(2)}</TableCell>
													<TableCell>
														{stain
															? `${
																	stain.name
															  } (+$${stain.additionalCharge.toFixed(2)})`
															: 'None'}
													</TableCell>
													<TableCell>
														$
														{(
															(item.basePrice + item.stainCharge) *
															item.quantity
														).toFixed(2)}
													</TableCell>
												</TableRow>
											);
										})}
									</TableBody>
								</Table>
							</div>

							{/* Order Summary */}
							<div className="bg-gray-50 p-4 rounded-lg">
								<h3 className="font-semibold mb-2">Order Summary</h3>
								<div className="space-y-1 text-sm">
									<div className="flex justify-between text-gray-600">
										<span>Subtotal</span>
										<span>
											$
											{selectedOrder.items
												.reduce(
													(sum, item) =>
														sum +
														(item.basePrice + item.stainCharge) * item.quantity,
													0
												)
												.toFixed(2)}
										</span>
									</div>
									{selectedOrder.isExpress && (
										<div className="flex justify-between text-gray-600">
											<span>Express Service Fee</span>
											<span>${selectedOrder.expressFee.toFixed(2)}</span>
										</div>
									)}
									<div className="flex justify-between font-semibold pt-2 border-t">
										<span>Total</span>
										<span>${selectedOrder.totalAmount.toFixed(2)}</span>
									</div>
								</div>
							</div>
						</div>
					)}

					<DialogFooter>
						<Button onClick={() => setIsViewDialogOpen(false)}>Close</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</AppLayout>
	);
}

const statusOrder: OrderStatus[] = [
	'new',
	'cleaning',
	'ready',
	'completed',
	'picked-up',
];
