'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { Eye } from 'lucide-react';
import { Order } from '@/app/orders/types';
import { OrderDetails } from '@/app/orders/components/order-details';
import type { Product, StainType } from '@/app/settings/types';

interface CustomerOrderHistoryProps {
	orders: Order[];
	products: Product[];
	stainTypes: StainType[];
}

export function CustomerOrderHistory({
	orders,
	products,
	stainTypes,
}: CustomerOrderHistoryProps) {
	const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
	const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

	const handleViewOrder = (order: Order) => {
		setSelectedOrder(order);
		setIsViewDialogOpen(true);
	};

	return (
		<Card className="h-full flex flex-col">
			<CardHeader className="flex flex-row items-center justify-between">
				<CardTitle>Order History</CardTitle>
				<div className="text-sm text-gray-500">
					{orders.length} {orders.length === 1 ? 'order' : 'orders'} found
				</div>
			</CardHeader>
			<CardContent className="flex-1 overflow-auto p-0">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Order #</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>Items</TableHead>
							<TableHead>Total Amount</TableHead>
							<TableHead>Created At</TableHead>
							<TableHead className="w-[80px]">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{orders.length > 0 ? (
							orders.map((order) => (
								<TableRow key={order.id}>
									<TableCell>#{order.order_number}</TableCell>
									<TableCell>
										<span
											className={`px-2 py-1 rounded-full text-xs font-medium ${
												order.status === 'cleaning'
													? 'bg-yellow-100 text-yellow-800'
													: order.status === 'ready'
													? 'bg-green-100 text-green-800'
													: order.status === 'completed'
													? 'bg-purple-100 text-purple-800'
													: 'bg-gray-100 text-gray-800'
											}`}
										>
											{order.status.charAt(0).toUpperCase() +
												order.status.slice(1)}
										</span>
									</TableCell>
									<TableCell>{order.items?.length || 0} items</TableCell>
									<TableCell>£{order.total_amount.toFixed(2)}</TableCell>
									<TableCell>
										{new Date(order.created_at).toLocaleDateString()}
									</TableCell>
									<TableCell>
										<Button
											variant="ghost"
											size="icon"
											onClick={() => handleViewOrder(order)}
										>
											<Eye className="h-4 w-4" />
										</Button>
									</TableCell>
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell
									colSpan={6}
									className="h-[200px] text-center text-gray-500"
								>
									No orders found for this customer
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</CardContent>

			<OrderDetails
				order={selectedOrder}
				products={products}
				stainTypes={stainTypes}
				isOpen={isViewDialogOpen}
				onClose={() => {
					setIsViewDialogOpen(false);
					setSelectedOrder(null);
				}}
				onDelete={() => {}} // Not needed for view-only mode
				onEdit={() => {}} // Not needed for view-only mode
				onStatusChange={() => {}} // Not needed for view-only mode
			/>
		</Card>
	);
}
