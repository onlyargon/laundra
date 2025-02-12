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
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { Order, Product, StainType } from '../types';

interface OrderDetailsProps {
	order: Order | null;
	products: Product[];
	stainTypes: StainType[];
	isOpen: boolean;
	onClose: () => void;
}

export function OrderDetails({
	order,
	products,
	stainTypes,
	isOpen,
	onClose,
}: OrderDetailsProps) {
	if (!order) return null;

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="max-w-4xl">
				<DialogHeader>
					<DialogTitle>Order Details</DialogTitle>
					<DialogDescription>
						Order #{order.id} - Created on{' '}
						{order.createdAt.toLocaleDateString()}
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-6">
					{/* Customer Information */}
					<div>
						<h3 className="text-lg font-semibold mb-2">Customer Information</h3>
						<div className="grid grid-cols-2 gap-4 text-sm">
							<div>
								<span className="font-medium">Name:</span> {order.customerName}
							</div>
							<div>
								<span className="font-medium">Customer ID:</span>{' '}
								{order.customerId}
							</div>
						</div>
					</div>

					{/* Order Status */}
					<div>
						<h3 className="text-lg font-semibold mb-2">Order Status</h3>
						<div className="flex items-center space-x-2">
							<span
								className={`px-2 py-1 rounded-full text-xs font-medium ${
									order.status === 'new'
										? 'bg-blue-100 text-blue-800'
										: order.status === 'cleaning'
										? 'bg-yellow-100 text-yellow-800'
										: order.status === 'ready'
										? 'bg-green-100 text-green-800'
										: order.status === 'completed'
										? 'bg-purple-100 text-purple-800'
										: 'bg-gray-100 text-gray-800'
								}`}
							>
								{order.status.charAt(0).toUpperCase() + order.status.slice(1)}
							</span>
							<span className="text-sm text-gray-500">
								Last updated: {order.updatedAt.toLocaleDateString()}
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
								{order.items.map((item) => {
									const product = products.find((p) => p.id === item.productId);
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
													? `${stain.name} (+$${stain.additionalCharge.toFixed(
															2
													  )})`
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
									{order.items
										.reduce(
											(sum, item) =>
												sum +
												(item.basePrice + item.stainCharge) * item.quantity,
											0
										)
										.toFixed(2)}
								</span>
							</div>
							{order.isExpress && (
								<div className="flex justify-between text-gray-600">
									<span>Express Service Fee</span>
									<span>${order.expressFee.toFixed(2)}</span>
								</div>
							)}
							<div className="flex justify-between font-semibold pt-2 border-t">
								<span>Total</span>
								<span>${order.totalAmount.toFixed(2)}</span>
							</div>
						</div>
					</div>
				</div>

				<DialogFooter>
					<Button onClick={onClose}>Close</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
