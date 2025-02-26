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
import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';

const resetPasswordSchema = z
	.object({
		password: z.string().min(6, 'Password must be at least 6 characters'),
		confirmPassword: z
			.string()
			.min(6, 'Password must be at least 6 characters'),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords don't match",
		path: ['confirmPassword'],
	});

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPassword() {
	const router = useRouter();
	const { toast } = useToast();

	const form = useForm<ResetPasswordFormValues>({
		resolver: zodResolver(resetPasswordSchema),
		defaultValues: {
			password: '',
			confirmPassword: '',
		},
	});

	const onSubmit = async (data: ResetPasswordFormValues) => {
		try {
			const { error } = await supabase.auth.updateUser({
				password: data.password,
			});

			if (error) throw error;

			toast({
				title: 'Success',
				description: 'Your password has been updated. Redirecting to login...',
			});

			// Redirect to login page after successful password reset
			setTimeout(() => {
				router.push('/');
			}, 2000);
		} catch (error) {
			console.error('Password reset error:', error);
			toast({
				variant: 'destructive',
				title: 'Reset Failed',
				description:
					error instanceof Error ? error.message : 'Failed to reset password',
			});
		}
	};

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
					<h2 className="mt-6 text-2xl font-bold text-gray-900">
						Reset Your Password
					</h2>
					<p className="mt-2 text-sm text-gray-600">
						Enter your new password below
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
								name="password"
								render={({ field }) => (
									<FormItem>
										<FormLabel>New Password</FormLabel>
										<FormControl>
											<Input
												type="password"
												placeholder="Enter your new password"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="confirmPassword"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Confirm Password</FormLabel>
										<FormControl>
											<Input
												type="password"
												placeholder="Confirm your new password"
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
							{form.formState.isSubmitting ? 'Resetting...' : 'Reset Password'}
						</Button>
					</form>
				</Form>
			</div>
		</main>
	);
}
