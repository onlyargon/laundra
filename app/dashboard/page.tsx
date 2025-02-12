'use client';

import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Shirt, DollarSign, TrendingUp } from 'lucide-react';

export default function Dashboard() {
	return (
		<AppLayout>
			<div className="space-y-8">
				<div>
					<h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
					<p className="text-gray-600 mt-2">
						Welcome to your laundry management system
					</p>
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
							<div className="text-2xl font-bold">0</div>
							<p className="text-xs text-gray-500">+0% from last month</p>
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
							<div className="text-2xl font-bold">0</div>
							<p className="text-xs text-gray-500">Active items in process</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
							<CardTitle className="text-sm font-medium">
								Today&apos;s Revenue
							</CardTitle>
							<DollarSign className="h-4 w-4 text-gray-500" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">$0.00</div>
							<p className="text-xs text-gray-500">+0% from yesterday</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
							<CardTitle className="text-sm font-medium">
								Monthly Growth
							</CardTitle>
							<TrendingUp className="h-4 w-4 text-gray-500" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">0%</div>
							<p className="text-xs text-gray-500">Compared to last month</p>
						</CardContent>
					</Card>
				</div>
			</div>
		</AppLayout>
	);
}
