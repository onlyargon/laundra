'use client';

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
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Order, OrderStatus } from '@/app/orders/types';

interface OrderListProps {
	orders: Order[];
	selectedStatus: OrderStatus;
	onViewOrder: (order: Order) => void;
	onStatusChange: (orderId: string, newStatus: OrderStatus) => void;
	canMoveToStatus: (
		currentStatus: OrderStatus,
		targetStatus: OrderStatus
	) => boolean;
	statusOrder: OrderStatus[];
}

export function OrderList({
	orders,
	selectedStatus,
	onViewOrder,
	onStatusChange,
	canMoveToStatus,
	statusOrder,
}: OrderListProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>
					{selectedStatus.charAt(0).toUpperCase() + selectedStatus.slice(1)}{' '}
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
						{orders.map((order) => (
							<TableRow key={order.id}>
								<TableCell>{order.id}</TableCell>
								<TableCell>{order.customerName}</TableCell>
								<TableCell>{order.items.length} items</TableCell>
								<TableCell>${order.totalAmount.toFixed(2)}</TableCell>
								<TableCell>{order.createdAt.toLocaleDateString()}</TableCell>
								<TableCell>
									<div className="flex space-x-2">
										<Button
											variant="ghost"
											size="icon"
											onClick={() => onViewOrder(order)}
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
													onStatusChange(
														order.id,
														statusOrder[statusOrder.indexOf(order.status) - 1]
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
													onStatusChange(
														order.id,
														statusOrder[statusOrder.indexOf(order.status) + 1]
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
	);
}
