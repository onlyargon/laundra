'use client';

import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
	Package,
	Shirt,
	DollarSign,
	TrendingUp,
	Calendar,
	Loader2,
} from 'lucide-react';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';
import {
	format,
	subDays,
	startOfWeek,
	endOfWeek,
	startOfMonth,
	endOfMonth,
} from 'date-fns';
import { cn } from '@/lib/utils';
import { getOrders } from '../orders/services';
import type { Order } from '../orders/types';

type DateRange =
	| 'today'
	| 'this_week'
	| 'last_week'
	| 'this_month'
	| 'last_month'
	| 'custom';

export default function Dashboard() {
	const [isLoading, setIsLoading] = useState(true);
	const [orders, setOrders] = useState<Order[]>([]);
	const [dateRange, setDateRange] = useState<DateRange>('today');
	const [customDateRange, setCustomDateRange] = useState<{
		from: Date;
		to: Date | undefined;
	}>({
		from: new Date(),
		to: new Date(),
	});

	// Get date range based on selection
	const getDateRange = () => {
		const today = new Date();
		switch (dateRange) {
			case 'today':
				return { from: today, to: today };
			case 'this_week':
				return {
					from: startOfWeek(today),
					to: endOfWeek(today),
				};
			case 'last_week':
				const lastWeekStart = subDays(startOfWeek(today), 7);
				return {
					from: lastWeekStart,
					to: endOfWeek(lastWeekStart),
				};
			case 'this_month':
				return {
					from: startOfMonth(today),
					to: endOfMonth(today),
				};
			case 'last_month':
				const lastMonthStart = startOfMonth(subDays(startOfMonth(today), 1));
				return {
					from: lastMonthStart,
					to: endOfMonth(lastMonthStart),
				};
			case 'custom':
				return customDateRange;
			default:
				return { from: today, to: today };
		}
	};

	// Filter orders based on date range
	const getFilteredOrders = () => {
		const { from, to } = getDateRange();
		if (!to) return orders;

		return orders.filter((order) => {
			const orderDate = new Date(order.created_at);
			return orderDate >= from && orderDate <= to;
		});
	};

	// Calculate statistics
	const calculateStats = () => {
		const filteredOrders = getFilteredOrders();
		const totalOrders = filteredOrders.length;
		const processingItems = filteredOrders.filter(
			(order) => order.status === 'cleaning'
		).length;
		const revenue = filteredOrders.reduce(
			(sum, order) => sum + order.total_amount,
			0
		);

		// Calculate growth (compared to previous period)
		const currentPeriodRevenue = revenue;
		const previousPeriodRevenue = calculatePreviousPeriodRevenue();
		const growth =
			previousPeriodRevenue === 0
				? 0
				: ((currentPeriodRevenue - previousPeriodRevenue) /
						previousPeriodRevenue) *
				  100;

		return {
			totalOrders,
			processingItems,
			revenue,
			growth,
		};
	};

	// Calculate revenue for the previous period
	const calculatePreviousPeriodRevenue = () => {
		const { from, to } = getDateRange();
		if (!to) return 0;

		const periodLength = to.getTime() - from.getTime();
		const previousFrom = new Date(from.getTime() - periodLength);
		const previousTo = new Date(to.getTime() - periodLength);

		return orders
			.filter(
				(order) =>
					new Date(order.created_at) >= previousFrom &&
					new Date(order.created_at) <= previousTo
			)
			.reduce((sum, order) => sum + order.total_amount, 0);
	};

	// Load orders
	useEffect(() => {
		const loadOrders = async () => {
			try {
				const ordersData = await getOrders();
				setOrders(ordersData);
			} catch (error) {
				console.error('Error loading orders:', error);
			} finally {
				setIsLoading(false);
			}
		};

		loadOrders();
	}, []);

	const stats = calculateStats();

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
					<div>
						<h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
						<p className="text-gray-600 mt-2">
							Welcome to your laundry management system
						</p>
					</div>

					<div className="flex items-center space-x-4">
						<Select
							value={dateRange}
							onValueChange={(value: DateRange) => setDateRange(value)}
						>
							<SelectTrigger className="w-[180px]">
								<SelectValue placeholder="Select date range" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="today">Today</SelectItem>
								<SelectItem value="this_week">This Week</SelectItem>
								<SelectItem value="last_week">Last Week</SelectItem>
								<SelectItem value="this_month">This Month</SelectItem>
								<SelectItem value="last_month">Last Month</SelectItem>
								<SelectItem value="custom">Custom Range</SelectItem>
							</SelectContent>
						</Select>

						{dateRange === 'custom' && (
							<Popover>
								<PopoverTrigger asChild>
									<Button
										variant="outline"
										className={cn(
											'justify-start text-left font-normal',
											!customDateRange && 'text-muted-foreground'
										)}
									>
										<Calendar className="mr-2 h-4 w-4" />
										{customDateRange?.from ? (
											customDateRange.to ? (
												<>
													{format(customDateRange.from, 'LLL dd, y')} -{' '}
													{format(customDateRange.to, 'LLL dd, y')}
												</>
											) : (
												format(customDateRange.from, 'LLL dd, y')
											)
										) : (
											<span>Pick a date</span>
										)}
									</Button>
								</PopoverTrigger>
								<PopoverContent className="w-auto p-0" align="end">
									<CalendarComponent
										initialFocus
										mode="range"
										defaultMonth={customDateRange?.from}
										selected={{
											from: customDateRange?.from,
											to: customDateRange?.to,
										}}
										onSelect={(range) => {
											if (range?.from && range?.to) {
												setCustomDateRange({
													from: range.from,
													to: range.to,
												});
											}
										}}
										numberOfMonths={2}
									/>
								</PopoverContent>
							</Popover>
						)}
					</div>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
					<Card>
						<CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
							<CardTitle className="text-sm font-medium">
								Total Orders
							</CardTitle>
							<Package className="h-4 w-4 text-gray-500" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{stats.totalOrders}</div>
							<p className="text-xs text-gray-500">
								{dateRange === 'today'
									? 'Orders today'
									: `Orders in selected period`}
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
							<CardTitle className="text-sm font-medium">
								Items Processing
							</CardTitle>
							<Shirt className="h-4 w-4 text-gray-500" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{stats.processingItems}</div>
							<p className="text-xs text-gray-500">Active items in process</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
							<CardTitle className="text-sm font-medium">Revenue</CardTitle>
							<DollarSign className="h-4 w-4 text-gray-500" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">
								£{stats.revenue.toFixed(2)}
							</div>
							<p className="text-xs text-gray-500">
								{stats.growth > 0 ? '+' : ''}
								{stats.growth.toFixed(1)}% from previous period
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
							<CardTitle className="text-sm font-medium">
								Average Order Value
							</CardTitle>
							<TrendingUp className="h-4 w-4 text-gray-500" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">
								£
								{stats.totalOrders > 0
									? (stats.revenue / stats.totalOrders).toFixed(2)
									: '0.00'}
							</div>
							<p className="text-xs text-gray-500">Per order in period</p>
						</CardContent>
					</Card>
				</div>

				{/* Order List */}
				<Card>
					<CardHeader>
						<CardTitle>Recent Orders</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="rounded-md border">
							<table className="min-w-full divide-y divide-gray-200">
								<thead className="bg-gray-50">
									<tr>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Order #
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Customer
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Date
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Status
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Total
										</th>
									</tr>
								</thead>
								<tbody className="bg-white divide-y divide-gray-200">
									{getFilteredOrders()
										.sort(
											(a, b) =>
												new Date(b.created_at).getTime() -
												new Date(a.created_at).getTime()
										)
										.map((order) => (
											<tr key={order.id}>
												<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
													#{order.order_number}
												</td>
												<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
													{order.customer?.name}
												</td>
												<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
													{format(
														new Date(order.created_at),
														'MMM d, yyyy HH:mm'
													)}
												</td>
												<td className="px-6 py-4 whitespace-nowrap">
													<span
														className={cn(
															'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
															{
																'bg-yellow-100 text-yellow-800':
																	order.status === 'cleaning',
																'bg-blue-100 text-blue-800':
																	order.status === 'ready',
																'bg-green-100 text-green-800':
																	order.status === 'completed',
															}
														)}
													>
														{order.status.charAt(0).toUpperCase() +
															order.status.slice(1)}
													</span>
												</td>
												<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
													£{order.total_amount.toFixed(2)}
												</td>
											</tr>
										))}
									{getFilteredOrders().length === 0 && (
										<tr>
											<td
												colSpan={5}
												className="px-6 py-4 text-sm text-gray-500 text-center"
											>
												No orders found in the selected date range
											</td>
										</tr>
									)}
								</tbody>
							</table>
						</div>
					</CardContent>
				</Card>
			</div>
		</AppLayout>
	);
}
