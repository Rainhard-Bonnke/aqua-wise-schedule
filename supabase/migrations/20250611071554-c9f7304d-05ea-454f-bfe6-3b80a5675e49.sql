
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create enum types
create type public.app_role as enum ('admin', 'farmer', 'extension_officer');
create type public.water_requirement as enum ('low', 'medium', 'high');
create type public.soil_type as enum ('clay', 'sandy', 'loamy', 'silty');
create type public.irrigation_method as enum ('drip', 'sprinkler', 'flood', 'manual');

-- Create user profiles table
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  name text not null,
  email text unique not null,
  phone text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create user roles table
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  role app_role not null default 'farmer',
  unique (user_id, role)
);

-- Create farms table
create table public.farms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  location text not null,
  size numeric not null check (size > 0),
  soil_type soil_type not null,
  farmer_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create crops table
create table public.crops (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  farm_id uuid references public.farms(id) on delete cascade not null,
  planted_date date not null,
  expected_harvest date not null,
  water_requirement water_requirement not null,
  area numeric not null check (area > 0),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create irrigation schedules table
create table public.irrigation_schedules (
  id uuid primary key default gen_random_uuid(),
  farm_id uuid references public.farms(id) on delete cascade not null,
  crop_id uuid references public.crops(id) on delete cascade not null,
  frequency integer not null check (frequency > 0), -- days
  duration integer not null check (duration > 0), -- minutes
  best_time time not null,
  is_active boolean default true,
  next_irrigation timestamp with time zone not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create irrigation logs table
create table public.irrigation_logs (
  id uuid primary key default gen_random_uuid(),
  schedule_id uuid references public.irrigation_schedules(id) on delete cascade not null,
  farm_id uuid references public.farms(id) on delete cascade not null,
  irrigation_date timestamp with time zone not null,
  duration integer not null check (duration > 0), -- minutes
  water_used numeric not null check (water_used >= 0), -- liters
  completed boolean default false,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create security definer function to check user roles
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  )
$$;

-- Create function to get current user's role
create or replace function public.get_current_user_role()
returns app_role
language sql
stable
security definer
as $$
  select role from public.user_roles where user_id = auth.uid() limit 1;
$$;

-- Create function to check if user owns farm
create or replace function public.user_owns_farm(_farm_id uuid)
returns boolean
language sql
stable
security definer
as $$
  select exists (
    select 1
    from public.farms
    where id = _farm_id
      and farmer_id = auth.uid()
  )
$$;

-- Function to handle new user registration
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, name, email, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', new.email),
    new.email,
    new.raw_user_meta_data ->> 'phone'
  );
  
  -- Assign default farmer role
  insert into public.user_roles (user_id, role)
  values (new.id, 'farmer');
  
  return new;
end;
$$;

-- Create trigger for new user registration
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.farms enable row level security;
alter table public.crops enable row level security;
alter table public.irrigation_schedules enable row level security;
alter table public.irrigation_logs enable row level security;

-- Profiles policies
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Admins can view all profiles"
  on public.profiles for select
  using (public.has_role(auth.uid(), 'admin'));

-- User roles policies
create policy "Users can view their own roles"
  on public.user_roles for select
  using (auth.uid() = user_id);

create policy "Admins can manage all roles"
  on public.user_roles for all
  using (public.has_role(auth.uid(), 'admin'));

-- Farms policies
create policy "Farmers can view their own farms"
  on public.farms for select
  using (auth.uid() = farmer_id);

create policy "Farmers can insert their own farms"
  on public.farms for insert
  with check (auth.uid() = farmer_id);

create policy "Farmers can update their own farms"
  on public.farms for update
  using (auth.uid() = farmer_id);

create policy "Farmers can delete their own farms"
  on public.farms for delete
  using (auth.uid() = farmer_id);

create policy "Admins and extension officers can view all farms"
  on public.farms for select
  using (
    public.has_role(auth.uid(), 'admin') or 
    public.has_role(auth.uid(), 'extension_officer')
  );

-- Crops policies
create policy "Farmers can manage crops on their farms"
  on public.crops for all
  using (public.user_owns_farm(farm_id));

create policy "Admins and extension officers can view all crops"
  on public.crops for select
  using (
    public.has_role(auth.uid(), 'admin') or 
    public.has_role(auth.uid(), 'extension_officer')
  );

-- Irrigation schedules policies
create policy "Farmers can manage schedules for their farms"
  on public.irrigation_schedules for all
  using (public.user_owns_farm(farm_id));

create policy "Admins and extension officers can view all schedules"
  on public.irrigation_schedules for select
  using (
    public.has_role(auth.uid(), 'admin') or 
    public.has_role(auth.uid(), 'extension_officer')
  );

-- Irrigation logs policies
create policy "Farmers can manage logs for their farms"
  on public.irrigation_logs for all
  using (public.user_owns_farm(farm_id));

create policy "Admins and extension officers can view all logs"
  on public.irrigation_logs for select
  using (
    public.has_role(auth.uid(), 'admin') or 
    public.has_role(auth.uid(), 'extension_officer')
  );

-- Create indexes for better performance
create index idx_farms_farmer_id on public.farms(farmer_id);
create index idx_crops_farm_id on public.crops(farm_id);
create index idx_irrigation_schedules_farm_id on public.irrigation_schedules(farm_id);
create index idx_irrigation_schedules_crop_id on public.irrigation_schedules(crop_id);
create index idx_irrigation_logs_farm_id on public.irrigation_logs(farm_id);
create index idx_irrigation_logs_schedule_id on public.irrigation_logs(schedule_id);
create index idx_user_roles_user_id on public.user_roles(user_id);
