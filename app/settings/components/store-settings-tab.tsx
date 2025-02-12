'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import type { StoreSettings } from '../types';

interface StoreSettingsTabProps {
	settings: StoreSettings;
	onUpdate: (settings: StoreSettings) => void;
}

export function StoreSettingsTab({
	settings,
	onUpdate,
}: StoreSettingsTabProps) {
	const [localSettings, setLocalSettings] = useState(settings);

	const handleFieldChange = (
		field: keyof Omit<
			StoreSettings,
			'id' | 'created_at' | 'updated_at' | 'user_id'
		>,
		value: string | number
	) => {
		setLocalSettings((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	const handleSave = () => {
		onUpdate(localSettings);
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Store Settings</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="space-y-6">
					<div>
						<h3 className="text-lg font-semibold mb-4">Store Details</h3>
						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<label className="text-sm font-medium">Store Name</label>
								<Input
									value={localSettings.name}
									onChange={(e) => handleFieldChange('name', e.target.value)}
								/>
							</div>
							<div className="space-y-2">
								<label className="text-sm font-medium">Phone</label>
								<Input
									value={localSettings.phone}
									onChange={(e) => handleFieldChange('phone', e.target.value)}
								/>
							</div>
							<div className="space-y-2">
								<label className="text-sm font-medium">Address Line 1</label>
								<Input
									value={localSettings.address_line1}
									onChange={(e) =>
										handleFieldChange('address_line1', e.target.value)
									}
								/>
							</div>
							<div className="space-y-2">
								<label className="text-sm font-medium">Address Line 2</label>
								<Input
									value={localSettings.address_line2 || ''}
									onChange={(e) =>
										handleFieldChange('address_line2', e.target.value)
									}
								/>
							</div>
							<div className="space-y-2">
								<label className="text-sm font-medium">City</label>
								<Input
									value={localSettings.address_city}
									onChange={(e) =>
										handleFieldChange('address_city', e.target.value)
									}
								/>
							</div>
							<div className="space-y-2">
								<label className="text-sm font-medium">Postcode</label>
								<Input
									value={localSettings.address_postcode}
									onChange={(e) =>
										handleFieldChange('address_postcode', e.target.value)
									}
								/>
							</div>
						</div>
					</div>

					<div className="border-t pt-6">
						<h3 className="text-lg font-semibold mb-4">VAT Settings</h3>
						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<label className="text-sm font-medium">VAT Number</label>
								<Input
									value={localSettings.vat_number}
									onChange={(e) =>
										handleFieldChange('vat_number', e.target.value)
									}
								/>
							</div>
							<div className="space-y-2">
								<label className="text-sm font-medium">VAT Rate (%)</label>
								<Input
									type="number"
									value={localSettings.vat_rate}
									onChange={(e) =>
										handleFieldChange(
											'vat_rate',
											parseFloat(e.target.value) || 0
										)
									}
								/>
							</div>
						</div>
					</div>

					<div className="flex justify-end">
						<Button onClick={handleSave}>Save Changes</Button>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
