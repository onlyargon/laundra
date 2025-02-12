'use client';

import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Plus, Search } from 'lucide-react';
import { useState } from 'react';
import { CreateOrder } from './components/create-order';
import { OrderDetails } from './components/order-details';
import { OrderList } from './components/order-list';
import { Order, OrderStatus } from './types';

const statusOrder: OrderStatus[] = [
	'new',
	'cleaning',
	'ready',
	'completed',
	'picked-up',
];

export default function Orders() {
	// Sample data
	const [customers] = useState([
		{
			id: '1',
			name: 'John Doe',
			email: 'john@example.com',
			phone: '+1234567890',
			address: '123 Main St',
		},
	]);

	const [products] = useState([
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

	const [stainTypes] = useState([
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
		const currentIndex = statusOrder.indexOf(currentStatus);
		const targetIndex = statusOrder.indexOf(targetStatus);
		return Math.abs(currentIndex - targetIndex) === 1;
	};

	// View order details
	const handleViewOrder = (order: Order) => {
		setSelectedOrder(order);
		setIsViewDialogOpen(true);
	};

	// Create new order
	const handleCreateOrder = (orderData: {
		customerId: string;
		customerName: string;
		items: Order['items'];
		isExpress: boolean;
		expressFee: number;
		totalAmount: number;
	}) => {
		const newOrder: Order = {
			id: Date.now().toString(),
			...orderData,
			status: 'new',
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		setOrders([...orders, newOrder]);
		setIsCreateDialogOpen(false);
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
						<OrderList
							orders={filteredOrders}
							selectedStatus={selectedStatus}
							onViewOrder={handleViewOrder}
							onStatusChange={handleStatusChange}
							canMoveToStatus={canMoveToStatus}
							statusOrder={statusOrder}
						/>
					</TabsContent>
				</Tabs>
			</div>

			<CreateOrder
				isOpen={isCreateDialogOpen}
				onClose={() => setIsCreateDialogOpen(false)}
				onCreateOrder={handleCreateOrder}
				customers={customers}
				products={products}
				stainTypes={stainTypes}
			/>

			<OrderDetails
				order={selectedOrder}
				products={products}
				stainTypes={stainTypes}
				isOpen={isViewDialogOpen}
				onClose={() => {
					setIsViewDialogOpen(false);
					setSelectedOrder(null);
				}}
			/>
		</AppLayout>
	);
}
