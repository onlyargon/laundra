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
import { useState, useEffect } from 'react';
import type { Customer } from '@/app/customers/types';
import type { Product, StainType } from '@/app/settings/types';
import type { Order, NewOrderItem } from '../types';

interface EditOrderProps {
	order: Order;
	isOpen: boolean;
	onClose: () => void;
	onSave: (
		orderId: string,
		data: {
			customer_id: string;
			items: NewOrderItem[];
			is_express: boolean;
			express_fee: number;
			total_amount: number;
		}
	) => void;
	customers: Customer[];
	products: Product[];
	stainTypes: StainType[];
}

export function EditOrder({
	order,
	isOpen,
	onClose,
	onSave,
	customers,
	products,
	stainTypes,
}: EditOrderProps) {
	const EXPRESS_FEE = 15.0;

	// Form state
	const [selectedCustomerId, setSelectedCustomerId] = useState<string>(
		order.customer_id
	);
	const [orderItems, setOrderItems] = useState<
		(NewOrderItem & { productName: string })[]
	>([]);
	const [isExpress, setIsExpress] = useState(order.is_express);

	// Initialize form with existing order data
	useEffect(() => {
		if (order.items) {
			setOrderItems(
				order.items.map((item) => ({
					order_id: item.order_id,
					product_id: item.product_id,
					productName: item.product?.name || '',
					quantity: item.quantity,
					stain_type_id: item.stain_type_id,
					special_instructions: item.special_instructions,
					base_price: item.base_price,
					stain_charge: item.stain_charge,
				}))
			);
		}
	}, [order]);

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
			order_id: order.id,
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
			onSave(order.id, {
				customer_id: selectedCustomerId,
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
				items: orderItems.map(({ productName, ...item }) => item),
				is_express: isExpress,
				express_fee: isExpress ? EXPRESS_FEE : 0,
				total_amount: calculateTotalAmount(),
			});
			onClose();
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="max-w-4xl">
				<DialogHeader>
					<DialogTitle>Edit Order #{order.order_number}</DialogTitle>
					<DialogDescription>Modify the order details below.</DialogDescription>
				</DialogHeader>

				<div className="space-y-6">
					{/* Customer Selection */}
					<div>
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
						Save Changes
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
