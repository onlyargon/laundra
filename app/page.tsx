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
import { signIn, getSession, supabase } from '@/lib/supabase';
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

			// Provide more specific error messages
			let errorMessage = 'Invalid email or password';

			if (error instanceof Error) {
				if (error.message.includes('Invalid login credentials')) {
					errorMessage =
						'The email or password you entered is incorrect. Please try again.';
				} else if (error.message.includes('Email not confirmed')) {
					errorMessage =
						'Your email has not been confirmed. Please check your inbox.';
				} else if (error.message.includes('rate limit')) {
					errorMessage = 'Too many login attempts. Please try again later.';
				} else {
					errorMessage = error.message;
				}
			}

			toast({
				variant: 'destructive',
				title: 'Authentication Error',
				description: errorMessage,
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

						<div className="text-center mt-4">
							<a
								href="#"
								className="text-sm text-blue-600 hover:text-blue-800"
								onClick={async (e) => {
									e.preventDefault();
									const email = form.getValues('email');
									if (!email) {
										toast({
											variant: 'destructive',
											title: 'Email Required',
											description: 'Please enter your email address first',
										});
										return;
									}

									try {
										const { error } = await supabase.auth.resetPasswordForEmail(
											email,
											{
												redirectTo: `${window.location.origin}/reset-password`,
											}
										);

										if (error) throw error;

										toast({
											title: 'Password Reset Email Sent',
											description: 'Check your email for a password reset link',
										});
									} catch (error) {
										console.error('Password reset error:', error);
										toast({
											variant: 'destructive',
											title: 'Reset Failed',
											description:
												error instanceof Error
													? error.message
													: 'Failed to send reset email',
										});
									}
								}}
							>
								Forgot your password?
							</a>
						</div>
					</form>
				</Form>
			</div>
		</main>
	);
}
