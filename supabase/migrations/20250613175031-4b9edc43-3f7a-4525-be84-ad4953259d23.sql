
-- First, drop all existing policies that depend on the old enum
DROP POLICY IF EXISTS "Extension officers and admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Extension officers can view roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins and extension officers can view all farms" ON public.farms;
DROP POLICY IF EXISTS "Admins and extension officers can view all crops" ON public.crops;
DROP POLICY IF EXISTS "Admins and extension officers can view all schedules" ON public.irrigation_schedules;
DROP POLICY IF EXISTS "Admins and extension officers can view all logs" ON public.irrigation_logs;
DROP POLICY IF EXISTS "Only admins can manage email templates" ON public.email_templates;

-- Drop all other existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Farmers can view their own farms" ON public.farms;
DROP POLICY IF EXISTS "Farmers can insert their own farms" ON public.farms;
DROP POLICY IF EXISTS "Farmers can update their own farms" ON public.farms;
DROP POLICY IF EXISTS "Farmers can delete their own farms" ON public.farms;
DROP POLICY IF EXISTS "Farmers can manage crops on their farms" ON public.crops;
DROP POLICY IF EXISTS "Farmers can manage schedules for their farms" ON public.irrigation_schedules;
DROP POLICY IF EXISTS "Farmers can manage logs for their farms" ON public.irrigation_logs;

-- Drop existing functions that depend on the old enum
DROP FUNCTION IF EXISTS public.has_role(uuid, app_role);
DROP FUNCTION IF EXISTS public.get_current_user_role();

-- Remove the default value from the role column
ALTER TABLE public.user_roles ALTER COLUMN role DROP DEFAULT;

-- Update any existing 'farmer' roles to 'extension_officer'
UPDATE public.user_roles SET role = 'extension_officer' WHERE role = 'farmer';

-- Update the user roles enum to remove farmer role
ALTER TYPE public.app_role RENAME TO app_role_old;
CREATE TYPE public.app_role AS ENUM ('extension_officer', 'admin');

-- Update existing user_roles table to use new enum
ALTER TABLE public.user_roles ALTER COLUMN role TYPE public.app_role USING role::text::public.app_role;

-- Set new default value
ALTER TABLE public.user_roles ALTER COLUMN role SET DEFAULT 'extension_officer'::public.app_role;

-- Drop old enum with CASCADE to remove all dependencies
DROP TYPE public.app_role_old CASCADE;

-- Recreate the functions with the new enum
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $function$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  )
$function$;

CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS app_role
LANGUAGE sql
STABLE SECURITY DEFINER
AS $function$
  select role from public.user_roles where user_id = auth.uid() limit 1;
$function$;

-- Update the handle_new_user function to assign extension_officer role by default
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  user_role public.app_role;
BEGIN
  -- Insert into profiles table
  INSERT INTO public.profiles (id, name, email, phone)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data ->> 'name', new.email),
    new.email,
    new.raw_user_meta_data ->> 'phone'
  );
  
  -- Determine role from signup metadata, default to extension_officer
  user_role := COALESCE(
    (new.raw_user_meta_data ->> 'role')::public.app_role, 
    'extension_officer'::public.app_role
  );
  
  -- Assign the role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, user_role);
  
  RETURN new;
END;
$function$;

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.irrigation_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.irrigation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- Create new RLS policies that only allow extension officers and admins
CREATE POLICY "Only extension officers and admins can access profiles" ON public.profiles
FOR ALL USING (
  public.has_role(auth.uid(), 'extension_officer') OR 
  public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Only extension officers and admins can manage farms" ON public.farms
FOR ALL USING (
  public.has_role(auth.uid(), 'extension_officer') OR 
  public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Only extension officers and admins can manage crops" ON public.crops
FOR ALL USING (
  public.has_role(auth.uid(), 'extension_officer') OR 
  public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Only extension officers and admins can manage irrigation schedules" ON public.irrigation_schedules
FOR ALL USING (
  public.has_role(auth.uid(), 'extension_officer') OR 
  public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Only extension officers and admins can manage irrigation logs" ON public.irrigation_logs
FOR ALL USING (
  public.has_role(auth.uid(), 'extension_officer') OR 
  public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Users can view their own roles" ON public.user_roles
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles" ON public.user_roles
FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Extension officers can view roles" ON public.user_roles
FOR SELECT USING (public.has_role(auth.uid(), 'extension_officer'));

CREATE POLICY "Only admins can manage email templates" ON public.email_templates
FOR ALL USING (public.has_role(auth.uid(), 'admin'));
