-- Create tables for Laundra

-- Enable RLS
alter table if exists categories enable row level security;
alter table if exists products enable row level security;
alter table if exists stain_types enable row level security;
alter table if exists store_settings enable row level security;
alter table if exists customers enable row level security;
alter table if exists orders enable row level security;
alter table if exists order_items enable row level security;

-- Drop existing policies if any exist
drop policy if exists "Allow authenticated access" on categories;
drop policy if exists "Allow authenticated access" on products;
drop policy if exists "Allow authenticated access" on stain_types;
drop policy if exists "Allow authenticated access" on store_settings;
drop policy if exists "Allow authenticated access" on customers;
drop policy if exists "Allow authenticated access" on orders;
drop policy if exists "Allow authenticated access" on order_items;

-- Create new RLS policies for all tables
create policy "Allow authenticated access" on categories for all using (auth.role() = 'authenticated');

create policy "Allow authenticated access" on products for all using (auth.role() = 'authenticated');

create policy "Allow authenticated access" on stain_types for all using (auth.role() = 'authenticated');

create policy "Allow authenticated access" on store_settings for all using (auth.role() = 'authenticated');

create policy "Allow authenticated access" on customers for all using (auth.role() = 'authenticated');

create policy "Allow authenticated access" on orders for all using (auth.role() = 'authenticated');

create policy "Allow authenticated access" on order_items for all using (auth.role() = 'authenticated');

-- Create tables
create table if not exists customers (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text not null,
  phone text not null,
  address text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users not null
);

create table if not exists categories (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users not null
);

create table if not exists products (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  category_id uuid references categories not null,
  price decimal(10,2) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users not null
);

create table if not exists stain_types (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  price decimal(10,2) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users not null
);

create table if not exists store_settings (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  phone text not null,
  address_line1 text not null,
  address_line2 text,
  address_city text not null,
  address_postcode text not null,
  vat_number text not null,
  vat_rate decimal(5,2) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users not null,
  unique (user_id)
);

-- Create RLS policies
create policy "Users can view their own data" on categories
  for select using (auth.uid() = user_id);

create policy "Users can insert their own data" on categories
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own data" on categories
  for update using (auth.uid() = user_id);

create policy "Users can delete their own data" on categories
  for delete using (auth.uid() = user_id);

create policy "Users can view their own data" on products
  for select using (auth.uid() = user_id);

create policy "Users can insert their own data" on products
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own data" on products
  for update using (auth.uid() = user_id);

create policy "Users can delete their own data" on products
  for delete using (auth.uid() = user_id);

create policy "Users can view their own data" on stain_types
  for select using (auth.uid() = user_id);

create policy "Users can insert their own data" on stain_types
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own data" on stain_types
  for update using (auth.uid() = user_id);

create policy "Users can delete their own data" on stain_types
  for delete using (auth.uid() = user_id);

create policy "Users can view their own data" on store_settings
  for select using (auth.uid() = user_id);

create policy "Users can insert their own data" on store_settings
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own data" on store_settings
  for update using (auth.uid() = user_id);

create policy "Users can delete their own data" on store_settings
  for delete using (auth.uid() = user_id);

-- Create RLS policies for customers
create policy "Users can view their own data" on customers
  for select using (auth.uid() = user_id);

create policy "Users can insert their own data" on customers
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own data" on customers
  for update using (auth.uid() = user_id);

create policy "Users can delete their own data" on customers
  for delete using (auth.uid() = user_id);

-- Create functions for updated_at trigger
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create triggers for updated_at
create trigger update_categories_updated_at
  before update on categories
  for each row
  execute function update_updated_at_column();

create trigger update_products_updated_at
  before update on products
  for each row
  execute function update_updated_at_column();

create trigger update_stain_types_updated_at
  before update on stain_types
  for each row
  execute function update_updated_at_column();

create trigger update_store_settings_updated_at
  before update on store_settings
  for each row
  execute function update_updated_at_column();

create trigger update_customers_updated_at
  before update on customers
  for each row
  execute function update_updated_at_column();

-- Create orders tables
create table if not exists orders (
  id uuid default gen_random_uuid() primary key,
  order_number bigint not null,
  customer_id uuid references customers not null,
  status text not null check (status in ('new', 'cleaning', 'ready', 'completed', 'picked-up')),
  is_express boolean default false not null,
  express_fee decimal(10,2) default 0 not null,
  total_amount decimal(10,2) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users not null
);

create table if not exists order_items (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references orders on delete cascade not null,
  product_id uuid references products not null,
  quantity integer not null check (quantity > 0),
  stain_type_id uuid references stain_types,
  special_instructions text,
  base_price decimal(10,2) not null,
  stain_charge decimal(10,2) default 0 not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table if exists orders enable row level security;
alter table if exists order_items enable row level security;

-- Create RLS policies for orders
create policy "Users can view their own orders" on orders
  for select using (auth.uid() = user_id);

create policy "Users can insert their own orders" on orders
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own orders" on orders
  for update using (auth.uid() = user_id);

create policy "Users can delete their own orders" on orders
  for delete using (auth.uid() = user_id);

-- Create RLS policies for order items
create policy "Users can view their own order items" on order_items
  for select using (
    exists (
      select 1 from orders
      where orders.id = order_items.order_id
      and orders.user_id = auth.uid()
    )
  );

create policy "Users can insert their own order items" on order_items
  for insert with check (
    exists (
      select 1 from orders
      where orders.id = order_items.order_id
      and orders.user_id = auth.uid()
    )
  );

create policy "Users can update their own order items" on order_items
  for update using (
    exists (
      select 1 from orders
      where orders.id = order_items.order_id
      and orders.user_id = auth.uid()
    )
  );

create policy "Users can delete their own order items" on order_items
  for delete using (
    exists (
      select 1 from orders
      where orders.id = order_items.order_id
      and orders.user_id = auth.uid()
    )
  );

-- Create triggers for updated_at
create trigger update_orders_updated_at
  before update on orders
  for each row
  execute function update_updated_at_column();

create trigger update_order_items_updated_at
  before update on order_items
  for each row
  execute function update_updated_at_column(); 