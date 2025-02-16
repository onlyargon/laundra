'use client';

import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Plus, Search, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { CreateOrder } from './components/create-order';
import { OrderDetails } from './components/order-details';
import { EditOrder } from './components/edit-order';
import { OrderList } from './components/order-list';
import {
	Order,
	OrderStatus,
	NewOrder,
	NewOrderItem,
	DeliveryType,
} from './types';
import { useToast } from '@/hooks/use-toast';
import {
	getOrders,
	createOrder,
	updateOrderStatus,
	updateOrder,
	deleteOrder,
} from './services';
import { getCustomers } from '../customers/services';
import {
	getProducts,
	getStainTypes,
	getCategories,
} from '../settings/services';
import type { Customer } from '../customers/types';
import type { Product, StainType, Category } from '../settings/types';

const statusOrder: OrderStatus[] = ['cleaning', 'ready', 'completed'];
type TabValue = OrderStatus | 'all';

export default function Orders() {
	const { toast } = useToast();
	const [isLoading, setIsLoading] = useState(true);
	const [orders, setOrders] = useState<Order[]>([]);
	const [customers, setCustomers] = useState<Customer[]>([]);
	const [products, setProducts] = useState<Product[]>([]);
	const [stainTypes, setStainTypes] = useState<StainType[]>([]);
	const [categories, setCategories] = useState<Category[]>([]);

	// UI state
	const [selectedStatus, setSelectedStatus] = useState<TabValue>('cleaning');
	const [searchQuery, setSearchQuery] = useState('');
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
	const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

	// Load data
	useEffect(() => {
		const loadData = async () => {
			try {
				const [
					ordersData,
					customersData,
					productsData,
					stainTypesData,
					categoriesData,
				] = await Promise.all([
					getOrders(),
					getCustomers(),
					getProducts(),
					getStainTypes(),
					getCategories(),
				]);

				setOrders(ordersData);
				setCustomers(customersData);
				setProducts(productsData);
				setStainTypes(stainTypesData);
				setCategories(categoriesData);
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
			(order.customer?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				order.id.includes(searchQuery))
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
		setIsEditDialogOpen(false);
	};

	const generateOrderNumber = () => {
		const now = new Date();
		const yearPart = now.getFullYear().toString().slice(-2);
		const monthPart = String(now.getMonth() + 1).padStart(2, '0');
		const dayPart = String(now.getDate()).padStart(2, '0');
		const baseNumberString = `${yearPart}${monthPart}${dayPart}`;
		const todayOrdersCount = orders.filter((order) => {
			const orderDate = new Date(order.created_at);
			return (
				orderDate.getFullYear() === now.getFullYear() &&
				orderDate.getMonth() === now.getMonth() &&
				orderDate.getDate() === now.getDate()
			);
		}).length;
		const sequentialNumber = String(todayOrdersCount + 1).padStart(3, '0');
		return parseInt(`${baseNumberString}${sequentialNumber}`, 10);
	};

	// Create new order
	const handleCreateOrder = async (orderData: {
		customer_id: string;
		items: NewOrderItem[];
		delivery_type: DeliveryType;
		is_express: boolean;
		express_fee: number;
		total_amount: number;
	}) => {
		try {
			const newOrder: NewOrder = {
				...orderData,
				status: 'cleaning',
				order_number: generateOrderNumber(),
			};

			const createdOrder = await createOrder(newOrder, orderData.items);
			setOrders([createdOrder, ...orders]);
			setIsCreateDialogOpen(false);
			toast({
				title: 'Success',
				description: 'Order created successfully.',
			});
		} catch (error) {
			console.error('Error creating order:', error);
			toast({
				variant: 'destructive',
				title: 'Error',
				description: 'Failed to create order. Please try again.',
			});
		}
	};

	// Handle edit order
	const handleEditOrder = (order: Order) => {
		setSelectedOrder(order);
		setIsEditDialogOpen(true);
	};

	// Handle save edited order
	const handleSaveOrder = async (
		orderId: string,
		data: {
			customer_id: string;
			items: NewOrderItem[];
			delivery_type: DeliveryType;
			is_express: boolean;
			express_fee: number;
			total_amount: number;
		}
	) => {
		try {
			const updatedOrder = await updateOrder(orderId, data, data.items);
			setOrders(
				orders.map((order) => (order.id === orderId ? updatedOrder : order))
			);
			setIsEditDialogOpen(false);
			setSelectedOrder(updatedOrder);
			toast({
				title: 'Success',
				description: 'Order updated successfully.',
			});
		} catch (error) {
			console.error('Error updating order:', error);
			toast({
				variant: 'destructive',
				title: 'Error',
				description: 'Failed to update order. Please try again.',
			});
		}
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

	// Handle new customer creation
	const handleCustomerCreated = (newCustomer: Customer) => {
		setCustomers((prevCustomers) => [...prevCustomers, newCustomer]);
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

			<CreateOrder
				isOpen={isCreateDialogOpen}
				onClose={() => setIsCreateDialogOpen(false)}
				onCreateOrder={handleCreateOrder}
				onCustomerCreated={handleCustomerCreated}
				customers={customers}
				products={products}
				stainTypes={stainTypes}
				categories={categories}
			/>

			<OrderDetails
				order={selectedOrder}
				products={products}
				stainTypes={stainTypes}
				isOpen={isViewDialogOpen && !isEditDialogOpen}
				onClose={() => {
					setIsViewDialogOpen(false);
					if (!isEditDialogOpen) {
						setSelectedOrder(null);
					}
				}}
				onDelete={handleDeleteOrder}
				onEdit={handleEditOrder}
				onStatusChange={handleStatusChange}
			/>

			{selectedOrder && (
				<EditOrder
					order={selectedOrder}
					isOpen={isEditDialogOpen}
					onClose={() => {
						setIsEditDialogOpen(false);
						if (!isViewDialogOpen) {
							setSelectedOrder(null);
						}
					}}
					onSave={handleSaveOrder}
					customers={customers}
					products={products}
					stainTypes={stainTypes}
				/>
			)}
		</AppLayout>
	);
}
