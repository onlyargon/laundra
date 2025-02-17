'use client';

import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Plus, Search, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { OrderDetails } from './components/order-details';
import { OrderList } from './components/order-list';
import { Order, OrderStatus } from './types';
import { useToast } from '@/hooks/use-toast';
import { getOrders, updateOrderStatus, deleteOrder } from './services';
import { getProducts, getStainTypes } from '../settings/services';
import type { Product, StainType } from '../settings/types';
import { useRouter } from 'next/navigation';

const statusOrder: OrderStatus[] = ['cleaning', 'ready', 'completed'];
type TabValue = OrderStatus | 'all';

export default function Orders() {
	const router = useRouter();
	const { toast } = useToast();
	const [isLoading, setIsLoading] = useState(true);
	const [orders, setOrders] = useState<Order[]>([]);
	const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
	const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState('');
	const [selectedStatus, setSelectedStatus] = useState<TabValue>('all');
	const [products, setProducts] = useState<Product[]>([]);
	const [stainTypes, setStainTypes] = useState<StainType[]>([]);

	// Load initial data
	useEffect(() => {
		const loadData = async () => {
			try {
				const [ordersData, productsData, stainTypesData] = await Promise.all([
					getOrders(),
					getProducts(),
					getStainTypes(),
				]);

				setOrders(ordersData);
				setProducts(productsData);
				setStainTypes(stainTypesData);
			} catch (error) {
				console.error('Error loading data:', error);
				toast({
					variant: 'destructive',
					title: 'Error',
					description: 'Failed to load data. Please try again.',
				});
			} finally {
				setIsLoading(false);
			}
		};

		loadData();
	}, [toast]);

	// Filter orders based on status and search query
	const filteredOrders = orders.filter(
		(order) =>
			(selectedStatus === 'all' || order.status === selectedStatus) &&
			(searchQuery === '' || // If search is empty, show all
				order.customer?.name
					.toLowerCase()
					.includes(searchQuery.toLowerCase()) ||
				order.customer?.phone.includes(searchQuery) || // Search by phone
				order.order_number.toString().includes(searchQuery)) // Search by order number
	);

	// Status management
	const handleStatusChange = async (
		orderId: string,
		newStatus: OrderStatus
	) => {
		try {
			const updatedOrder = await updateOrderStatus(orderId, newStatus);
			setOrders(
				orders.map((order) => (order.id === orderId ? updatedOrder : order))
			);
			toast({
				title: 'Success',
				description: 'Order status updated successfully.',
			});
		} catch (error) {
			console.error('Error updating order status:', error);
			toast({
				variant: 'destructive',
				title: 'Error',
				description: 'Failed to update order status. Please try again.',
			});
		}
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

	// Handle edit order
	const handleEditOrder = (order: Order) => {
		router.push(`/orders/${order.id}/edit`);
	};

	// Handle delete order
	const handleDeleteOrder = async (orderId: string) => {
		try {
			await deleteOrder(orderId);
			setOrders(orders.filter((order) => order.id !== orderId));
			toast({
				title: 'Success',
				description: 'Order deleted successfully.',
			});
		} catch (error) {
			console.error('Error deleting order:', error);
			toast({
				variant: 'destructive',
				title: 'Error',
				description: 'Failed to delete order. Please try again.',
			});
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
			<div className="space-y-8">
				<div className="flex justify-between items-center">
					<h1 className="text-3xl font-bold text-gray-900">Orders</h1>
					<div className="flex items-center space-x-4">
						<div className="relative w-96">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
							<Input
								placeholder="Search by customer name, phone or order number..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="pl-10"
							/>
						</div>
						<Button onClick={() => router.push('/orders/new')}>
							<Plus className="h-4 w-4 mr-2" />
							New Order
						</Button>
					</div>
				</div>

				<Tabs
					value={selectedStatus}
					onValueChange={(value) => setSelectedStatus(value as TabValue)}
				>
					<TabsList>
						<TabsTrigger value="all">All</TabsTrigger>
						<TabsTrigger value="cleaning">Cleaning</TabsTrigger>
						<TabsTrigger value="ready">Ready</TabsTrigger>
						<TabsTrigger value="completed">Completed</TabsTrigger>
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

			<OrderDetails
				order={selectedOrder}
				products={products}
				stainTypes={stainTypes}
				isOpen={isViewDialogOpen}
				onClose={() => {
					setIsViewDialogOpen(false);
					setSelectedOrder(null);
				}}
				onDelete={handleDeleteOrder}
				onEdit={handleEditOrder}
				onStatusChange={handleStatusChange}
			/>
		</AppLayout>
	);
}
