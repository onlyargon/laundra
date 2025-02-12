export interface Customer {
	id: string;
	name: string;
	email: string;
	phone: string;
	address: string;
	created_at: Date;
	updated_at: Date;
	user_id: string;
}

export type NewCustomer = Omit<
	Customer,
	'id' | 'created_at' | 'updated_at' | 'user_id'
>;
