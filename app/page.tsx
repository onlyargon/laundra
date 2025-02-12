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

const loginSchema = z.object({
	email: z.string().email('Invalid email address'),
	password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Home() {
	const router = useRouter();
	const form = useForm<LoginFormValues>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			email: '',
			password: '',
		},
	});

	const onSubmit = async (data: LoginFormValues) => {
		try {
			// TODO: Replace with your actual authentication logic
			if (
				data.email === 'owner@laundra.com' &&
				data.password === 'password123'
			) {
				// Successful login
				router.push('/dashboard');
			} else {
				form.setError('root', {
					message: 'Invalid email or password',
				});
			}
		} catch (error) {
			console.error('Login error:', error);
			form.setError('root', {
				message: 'An error occurred during login',
			});
		}
	};

	return (
		<main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100">
			<div className="w-full max-w-md space-y-8 p-10 bg-white rounded-xl shadow-lg">
				<div className="text-center">
					<h1 className="text-3xl font-bold text-gray-900">
						Welcome to Laundra
					</h1>
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
											<Input placeholder="owner@laundra.com" {...field} />
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
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							{form.formState.errors.root && (
								<p className="text-sm text-red-500 mt-2">
									{form.formState.errors.root.message}
								</p>
							)}
						</div>

						<Button
							className="w-full bg-blue-600 hover:bg-blue-700"
							type="submit"
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
