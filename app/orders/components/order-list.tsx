'use client';

import { Button } from '@/components/ui/button';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { Eye, ArrowRight } from 'lucide-react';
import { Order, OrderStatus } from '../types';

interface OrderListProps {
	orders: Order[];
	selectedStatus: OrderStatus | 'all';
	onViewOrder: (order: Order) => void;
	onStatusChange: (orderId: string, status: OrderStatus) => void;
	canMoveToStatus: (current: OrderStatus, target: OrderStatus) => boolean;
	statusOrder: OrderStatus[];
}

export function OrderList({
	orders,
	onViewOrder,
	onStatusChange,
	statusOrder,
}: OrderListProps) {
	const getNextStatus = (currentStatus: OrderStatus): OrderStatus | null => {
		const currentIndex = statusOrder.indexOf(currentStatus);
		return currentIndex < statusOrder.length - 1
			? statusOrder[currentIndex + 1]
			: null;
	};

	return (
		<div className="rounded-md border">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Order #</TableHead>
						<TableHead>Customer</TableHead>
						<TableHead>Status</TableHead>
						<TableHead>Items</TableHead>
						<TableHead>Delivery Type</TableHead>
						<TableHead>Total Amount</TableHead>
						<TableHead>Created At</TableHead>
						<TableHead className="w-[140px]">Actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{orders.length > 0 ? (
						orders.map((order) => {
							const nextStatus = getNextStatus(order.status);
							return (
								<TableRow key={order.id}>
									<TableCell>#{order.order_number}</TableCell>
									<TableCell className="font-medium">
										{order.customer?.name}
									</TableCell>
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
									<TableCell>{order.delivery_type}</TableCell>
									<TableCell>£{order.total_amount.toFixed(2)}</TableCell>
									<TableCell>
										{new Date(order.created_at).toLocaleDateString()}
									</TableCell>
									<TableCell>
										<div className="flex space-x-2">
											<Button
												variant="ghost"
												size="icon"
												onClick={() => onViewOrder(order)}
												title="View Details"
											>
												<Eye className="h-4 w-4" />
											</Button>
											{nextStatus && (
												<Button
													variant="ghost"
													size="icon"
													onClick={() => onStatusChange(order.id, nextStatus)}
													title={`Move to ${
														nextStatus.charAt(0).toUpperCase() +
														nextStatus.slice(1)
													}`}
												>
													<ArrowRight className="h-4 w-4" />
												</Button>
											)}
										</div>
									</TableCell>
								</TableRow>
							);
						})
					) : (
						<TableRow>
							<TableCell colSpan={8} className="h-24 text-center text-gray-500">
								No orders found
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>
		</div>
	);
}
