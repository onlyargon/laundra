'use client';

import { Navbar } from './navbar';

interface AppLayoutProps {
	children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
	return (
		<div className="min-h-screen bg-gray-50">
			<Navbar />
			<main className="p-8">
				<div className="mx-auto">{children}</div>
			</main>
		</div>
	);
}
