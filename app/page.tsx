'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import { signIn, getSession } from '@/lib/supabase';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';

const loginSchema = z.object({
	email: z.string().email('Invalid email address'),
	password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Home() {
	const router = useRouter();
	const { toast } = useToast();
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const checkSession = async () => {
			try {
				const session = await getSession();
				if (session) {
					router.push('/dashboard');
				}
			} catch (error) {
				console.error('Session check error:', error);
			} finally {
				setIsLoading(false);
			}
		};

		checkSession();
	}, [router]);

	const form = useForm<LoginFormValues>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			email: '',
			password: '',
		},
	});

	const onSubmit = async (data: LoginFormValues) => {
		try {
			await signIn(data.email, data.password);
			toast({
				title: 'Success',
				description: 'Successfully signed in. Redirecting...',
			});
			router.push('/dashboard');
		} catch (error) {
			console.error('Login error:', error);
			toast({
				variant: 'destructive',
				title: 'Authentication Error',
				description:
					error instanceof Error ? error.message : 'Invalid email or password',
			});
		}
	};

	if (isLoading) {
		return (
			<main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100">
				<div className="text-center">
					<div className="animate-pulse">
						<Image
							src="/logo.png"
							alt="Laundra"
							width={200}
							height={100}
							className="rounded-lg opacity-50"
						/>
					</div>
				</div>
			</main>
		);
	}

	return (
		<main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100">
			<div className="w-full max-w-md space-y-8 p-10 bg-white rounded-xl shadow-lg">
				<div className="text-center">
					<div className="flex justify-center mb-4">
						<Image
							src="/logo.png"
							alt="Laundra"
							width={200}
							height={100}
							className="rounded-lg"
						/>
					</div>
					<p className="mt-2 text-sm text-gray-600">
						Sign in to manage your laundry business
					</p>
				</div>

				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="mt-8 space-y-6"
					>
						<div className="space-y-4">
							<FormField
								control={form.control}
								name="email"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Email address</FormLabel>
										<FormControl>
											<Input
												placeholder="Enter your email"
												autoComplete="email"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="password"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Password</FormLabel>
										<FormControl>
											<Input
												type="password"
												placeholder="Enter your password"
												autoComplete="current-password"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<Button
							className="w-full bg-primary hover:bg-primary/90"
							disabled={form.formState.isSubmitting}
						>
							{form.formState.isSubmitting ? 'Signing in...' : 'Sign in'}
						</Button>
					</form>
				</Form>
			</div>
		</main>
	);
}
