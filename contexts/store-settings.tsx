'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

export type StoreSettings = {
	name: string;
	address: {
		line1: string;
		line2: string;
		city: string;
		postcode: string;
	};
	phone: string;
	vatNumber: string;
	vatRate: number;
};

interface StoreSettingsContextType {
	settings: StoreSettings;
	updateSettings: (newSettings: StoreSettings) => void;
}

const StoreSettingsContext = createContext<
	StoreSettingsContextType | undefined
>(undefined);

export function StoreSettingsProvider({ children }: { children: ReactNode }) {
	const [settings, setSettings] = useState<StoreSettings>({
		name: 'Laundra',
		address: {
			line1: 'Clifton Down Shopping Centre',
			line2: 'Whiteladies Road, Clifton',
			city: 'Bristol',
			postcode: 'BS8 2NN',
		},
		phone: '01174031831',
		vatNumber: 'GB123456789',
		vatRate: 20,
	});

	const updateSettings = (newSettings: StoreSettings) => {
		setSettings(newSettings);
	};

	return (
		<StoreSettingsContext.Provider value={{ settings, updateSettings }}>
			{children}
		</StoreSettingsContext.Provider>
	);
}

export function useStoreSettings() {
	const context = useContext(StoreSettingsContext);
	if (context === undefined) {
		throw new Error(
			'useStoreSettings must be used within a StoreSettingsProvider'
		);
	}
	return context;
}
