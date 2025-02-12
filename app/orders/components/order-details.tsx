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
import { Printer, Trash, Edit } from 'lucide-react';
import { Order } from '../types';
import type { Product, StainType } from '@/app/settings/types';
import { useStoreSettings } from '@/contexts/store-settings';
import { useState } from 'react';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { format } from 'date-fns';

export interface OrderDetailsProps {
	order: Order | null;
	products: Product[];
	stainTypes: StainType[];
	isOpen: boolean;
	onClose: () => void;
	onDelete: (orderId: string) => void;
	onEdit: (order: Order) => void;
}

export function OrderDetails({
	order,
	products,
	stainTypes,
	isOpen,
	onClose,
	onDelete,
	onEdit,
}: OrderDetailsProps) {
	const { settings: storeSettings } = useStoreSettings();
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);

	const handleDelete = () => {
		if (order) {
			onDelete(order.id);
			setShowDeleteDialog(false);
			onClose();
		}
	};

	const handleEdit = () => {
		if (order) {
			onEdit(order);
		}
	};

	if (!order) return null;

	const handlePrint = () => {
		// Create a new window
		const printWindow = window.open('', '_blank', 'width=600,height=600');
		if (!printWindow) {
			alert('Please allow popups for this website');
			return;
		}

		// Calculate totals
		const subtotal =
			order.items?.reduce(
				(sum, item) =>
					sum + (item.base_price + item.stain_charge) * item.quantity,
				0
			) || 0;
		const vat = (subtotal * storeSettings.vatRate) / 100;
		const total = subtotal + vat + (order.is_express ? order.express_fee : 0);

		// Write the receipt content
		printWindow.document.write(`
			<!DOCTYPE html>
			<html>
				<head>
					<title>Order Receipt #${order.order_number}</title>
					<meta charset="UTF-8">
					<style>
						@page {
							size: 80mm 297mm;
							margin: 0;
						}
						body {
							font-family: 'Courier New', monospace;
							padding: 20px;
							max-width: 80mm;
							margin: 0 auto;
							font-size: 12px;
							line-height: 1.4;
						}
						.receipt {
							text-align: left;
						}
						.header {
							text-align: center;
							margin-bottom: 20px;
						}
						.header h2 {
							margin: 0;
							font-size: 16px;
						}
						.header p {
							margin: 5px 0;
						}
						.divider {
							border-top: 1px dashed #000;
							margin: 10px 0;
						}
						.item-row {
							display: flex;
							justify-content: space-between;
							margin: 5px 0;
						}
						.total-row {
							display: flex;
							justify-content: space-between;
							margin: 5px 0;
							font-weight: bold;
						}
						.barcode {
							text-align: center;
							margin-top: 20px;
							padding: 10px;
							border: 1px solid #000;
							font-family: 'Courier New', monospace;
							font-weight: bold;
						}
					</style>
				</head>
				<body>
					<div class="receipt">
						<div class="header">
							<h2>${storeSettings.name}</h2>
							<p>${storeSettings.address.line1}</p>
							${storeSettings.address.line2 ? `<p>${storeSettings.address.line2}</p>` : ''}
							<p>${storeSettings.address.city}, ${storeSettings.address.postcode}</p>
							<p>Tel: ${storeSettings.phone}</p>
							<p>VAT: ${storeSettings.vatNumber}</p>
						</div>
						
						<div class="divider"></div>
						
						<p><strong>Order #${order.order_number}</strong></p>
						<p>Items: ${
							order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0
						} pieces</p>
						<p>Customer: ${order.customer?.name}</p>
						
						<div class="divider"></div>
						
						${
							order.items
								?.map((item) => {
									const product = products.find(
										(p) => p.id === item.product_id
									);
									const stain = item.stain_type_id
										? stainTypes.find((s) => s.id === item.stain_type_id)
										: null;
									return `
							<div class="item-row">
								<span>${item.quantity}x ${product?.name}${
										stain ? ` (${stain.name})` : ''
									}</span>
								<span>£${((item.base_price + item.stain_charge) * item.quantity).toFixed(
									2
								)}</span>
							</div>
						`;
								})
								.join('') || ''
						}
						
						<div class="divider"></div>
						
						<div class="item-row">
							<span>Subtotal:</span>
							<span>£${subtotal.toFixed(2)}</span>
						</div>
						${
							order.is_express
								? `
							<div class="item-row">
								<span>Express Fee:</span>
								<span>£${order.express_fee.toFixed(2)}</span>
							</div>
						`
								: ''
						}
						<div class="item-row">
							<span>VAT (${storeSettings.vatRate}%):</span>
							<span>£${vat.toFixed(2)}</span>
						</div>
						<div class="total-row">
							<span>Total:</span>
							<span>£${total.toFixed(2)}</span>
						</div>
						
						<div class="divider"></div>
						
						<p>Dropped Off: ${order.created_at.toLocaleDateString()}</p>
						<p>Ready By: ${new Date(
							order.created_at.getTime() + 24 * 60 * 60 * 1000
						).toLocaleDateString()}</p>
						
						<div class="barcode">
							*${order.order_number}*
						</div>
						
						<div class="divider"></div>
						
						<div style="text-align: center; margin-top: 20px;">
							<p>Thank you for choosing ${storeSettings.name}!</p>
							<p>Please retain this receipt</p>
						</div>
					</div>
				</body>
			</html>
		`);

		// Ensure the content is fully loaded before printing
		printWindow.document.close();
		printWindow.focus();

		// Add a small delay to ensure styles are applied
		setTimeout(() => {
			printWindow.print();
			// Close the window after printing (or if printing is cancelled)
			printWindow.onafterprint = () => {
				printWindow.close();
			};
		}, 250);
	};

	return (
		<>
			<Dialog open={isOpen} onOpenChange={onClose}>
				<DialogContent className="max-w-3xl">
					<DialogHeader>
						<div className="flex items-center justify-between">
							<DialogTitle>Order Receipt #{order.order_number}</DialogTitle>
							<div className="flex gap-2">
								<Button
									variant="outline"
									size="icon"
									onClick={handleEdit}
									className="h-8 w-8"
								>
									<Edit className="h-4 w-4" />
								</Button>
								<Button
									variant="destructive"
									size="icon"
									onClick={() => setShowDeleteDialog(true)}
									className="h-8 w-8"
								>
									<Trash className="h-4 w-4" />
								</Button>
							</div>
						</div>
						<DialogDescription>
							Order #{order.order_number} - Created on{' '}
							{format(new Date(order.created_at), 'PPP')}
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-6">
						{/* Customer Information */}
						<div>
							<h3 className="text-lg font-semibold mb-2">
								Customer Information
							</h3>
							<div className="grid grid-cols-2 gap-4 text-sm">
								<div>
									<span className="font-medium">Name:</span>{' '}
									{order.customer?.name}
								</div>
								<div>
									<span className="font-medium">Customer ID:</span>{' '}
									{order.customer_id}
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
									Last updated: {order.updated_at.toLocaleDateString()}
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
									{order.items?.map((item) => {
										const product = products.find(
											(p) => p.id === item.product_id
										);
										const stain = item.stain_type_id
											? stainTypes.find((s) => s.id === item.stain_type_id)
											: null;

										return (
											<TableRow key={item.id}>
												<TableCell>{product?.name}</TableCell>
												<TableCell>{item.quantity}</TableCell>
												<TableCell>£{item.base_price.toFixed(2)}</TableCell>
												<TableCell>
													{stain
														? `${stain.name} (+£${item.stain_charge.toFixed(
																2
														  )})`
														: 'None'}
												</TableCell>
												<TableCell>
													£
													{(
														(item.base_price + item.stain_charge) *
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
										£
										{order.items
											?.reduce(
												(sum, item) =>
													sum +
													(item.base_price + item.stain_charge) * item.quantity,
												0
											)
											.toFixed(2) || '0.00'}
									</span>
								</div>
								{order.is_express && (
									<div className="flex justify-between text-gray-600">
										<span>Express Service Fee</span>
										<span>£{order.express_fee.toFixed(2)}</span>
									</div>
								)}
								<div className="flex justify-between text-gray-600">
									<span>VAT ({storeSettings.vatRate}%)</span>
									<span>
										£
										{(
											(order.total_amount * storeSettings.vatRate) /
											100
										).toFixed(2)}
									</span>
								</div>
								<div className="flex justify-between font-semibold pt-2 border-t">
									<span>Total</span>
									<span>£{order.total_amount.toFixed(2)}</span>
								</div>
							</div>
						</div>
					</div>

					<DialogFooter className="flex justify-between items-center">
						<div className="flex space-x-2">
							<Button variant="outline" onClick={handlePrint}>
								<Printer className="h-4 w-4 mr-2" />
								Print Receipt
							</Button>
						</div>
						<Button variant="outline" onClick={onClose}>
							Close
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete Order</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to delete order #{order.order_number}? This
							action cannot be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction onClick={handleDelete} className="bg-red-500">
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
