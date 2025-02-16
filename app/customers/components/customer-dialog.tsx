'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import type { Customer, NewCustomer } from '../types';

interface CustomerDialogProps {
	isOpen: boolean;
	onClose: () => void;
	onSave: (customer: NewCustomer) => void;
	editingCustomer: Customer | null;
}

export function CustomerDialog({
	isOpen,
	onClose,
	onSave,
	editingCustomer,
}: CustomerDialogProps) {
	const [customer, setCustomer] = useState<NewCustomer>({
		name: editingCustomer?.name || '',
		email: editingCustomer?.email || '',
		phone: editingCustomer?.phone || '',
		address: editingCustomer?.address || '',
	});

	// Reset form when dialog opens/closes
	useEffect(() => {
		if (isOpen) {
			setCustomer({
				name: editingCustomer?.name || '',
				email: editingCustomer?.email || '',
				phone: editingCustomer?.phone || '',
				address: editingCustomer?.address || '',
			});
		}
	}, [isOpen, editingCustomer]);

	const handleSubmit = () => {
		if (customer.name && customer.phone) {
			onSave(customer);
			onClose();
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						{editingCustomer ? 'Edit Customer' : 'Add New Customer'}
					</DialogTitle>
					<DialogDescription>
						{editingCustomer
							? 'Edit customer details below'
							: 'Fill in the customer details below'}
					</DialogDescription>
				</DialogHeader>

				<div className="grid gap-4 py-4">
					<div className="grid grid-cols-4 items-center gap-4">
						<label htmlFor="name" className="text-right">
							Name *
						</label>
						<Input
							id="name"
							value={customer.name}
							onChange={(e) =>
								setCustomer({ ...customer, name: e.target.value })
							}
							className="col-span-3"
						/>
					</div>
					<div className="grid grid-cols-4 items-center gap-4">
						<label htmlFor="phone" className="text-right">
							Phone *
						</label>
						<Input
							id="phone"
							value={customer.phone}
							onChange={(e) =>
								setCustomer({ ...customer, phone: e.target.value })
							}
							className="col-span-3"
						/>
					</div>
					<div className="grid grid-cols-4 items-center gap-4">
						<label htmlFor="email" className="text-right">
							Email
						</label>
						<Input
							id="email"
							type="email"
							value={customer.email}
							onChange={(e) =>
								setCustomer({ ...customer, email: e.target.value })
							}
							className="col-span-3"
						/>
					</div>
					<div className="grid grid-cols-4 items-center gap-4">
						<label htmlFor="address" className="text-right">
							Address
						</label>
						<Input
							id="address"
							value={customer.address}
							onChange={(e) =>
								setCustomer({ ...customer, address: e.target.value })
							}
							className="col-span-3"
						/>
					</div>
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={onClose}>
						Cancel
					</Button>
					<Button
						onClick={handleSubmit}
						disabled={!customer.name || !customer.phone}
					>
						{editingCustomer ? 'Save Changes' : 'Add Customer'}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
