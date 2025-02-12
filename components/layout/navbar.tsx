'use client';

import { Button } from '@/components/ui/button';
import {
	LogOut,
	Settings,
	Users,
	LayoutDashboard,
	ClipboardList,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export function Navbar() {
	const router = useRouter();
	const pathname = usePathname();

	const handleSignOut = () => {
		// TODO: Add proper sign out logic here
		router.push('/');
	};

	const isActive = (path: string) => {
		return pathname === path;
	};

	return (
		<nav className="border-b bg-white">
			<div className="mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between items-center h-16">
					<div className="flex items-center space-x-8">
						<Link href="/dashboard">
							<Image src="/logo.png" alt="Laundra" width={200} height={100} />
						</Link>
						<div className="hidden md:flex items-center space-x-4">
							<Link href="/dashboard">
								<Button
									variant={isActive('/dashboard') ? 'default' : 'ghost'}
									className="text-sm"
								>
									<LayoutDashboard className="h-4 w-4 mr-2" />
									Dashboard
								</Button>
							</Link>
							<Link href="/orders">
								<Button
									variant={isActive('/orders') ? 'default' : 'ghost'}
									className="text-sm"
								>
									<ClipboardList className="h-4 w-4 mr-2" />
									Orders
								</Button>
							</Link>
							<Link href="/customers">
								<Button
									variant={isActive('/customers') ? 'default' : 'ghost'}
									className="text-sm"
								>
									<Users className="h-4 w-4 mr-2" />
									Customers
								</Button>
							</Link>
						</div>
					</div>
					<div className="flex items-center space-x-4">
						<Link href="/settings">
							<Button
								variant={isActive('/settings') ? 'default' : 'ghost'}
								className="flex items-center text-sm"
							>
								<Settings className="h-4 w-4 mr-2" />
								Settings
							</Button>
						</Link>
						<Button
							variant="ghost"
							className="flex items-center text-sm"
							onClick={handleSignOut}
						>
							<LogOut className="h-4 w-4 mr-2" />
							Sign out
						</Button>
					</div>
				</div>
			</div>
		</nav>
	);
}
