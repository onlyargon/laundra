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
import { Plus, X } from 'lucide-react';
import { useState } from 'react';
import { Customer, OrderItem, Product, StainType } from '@/app/orders/types';

interface CreateOrderProps {
	isOpen: boolean;
	onClose: () => void;
	onCreateOrder: (data: {
		customerId: string;
		customerName: string;
		items: OrderItem[];
		isExpress: boolean;
		expressFee: number;
		totalAmount: number;
	}) => void;
	customers: Customer[];
	products: Product[];
	stainTypes: StainType[];
}

export function CreateOrder({
	isOpen,
	onClose,
	onCreateOrder,
	customers,
	products,
	stainTypes,
}: CreateOrderProps) {
	const EXPRESS_FEE = 15.0;

	// Form state
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

	// Handle form submission
	const handleSubmit = () => {
		const customer = isNewCustomer
			? {
					id: Date.now().toString(),
					...newCustomer,
			  }
			: customers.find((c) => c.id === selectedCustomerId);

		if (!customer) return;

		onCreateOrder({
			customerId: customer.id,
			customerName: customer.name,
			items: orderItems.map(({ productName, ...item }) => item),
			isExpress,
			expressFee: isExpress ? EXPRESS_FEE : 0,
			totalAmount: calculateTotalAmount(),
		});

		// Reset form
		setSelectedCustomerId('');
		setIsNewCustomer(false);
		setNewCustomer({ name: '', email: '', phone: '', address: '' });
		setOrderItems([]);
		setIsExpress(false);
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
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
							<div key={item.id} className="grid grid-cols-6 gap-4 items-start">
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
													{stain.name} (+$
													{stain.additionalCharge.toFixed(2)})
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
												stainTypes.find((s) => s.id === item.stainTypeId)?.name
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
					<Button variant="ghost" onClick={onClose}>
						Cancel
					</Button>
					<Button
						onClick={handleSubmit}
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
	);
}
