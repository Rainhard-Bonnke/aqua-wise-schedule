
-- Create enum types first, checking if they already exist
DO $$ BEGIN
    CREATE TYPE public.app_role AS ENUM ('admin', 'farmer', 'extension_officer');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.water_requirement AS ENUM ('low', 'medium', 'high');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.soil_type AS ENUM ('clay', 'sandy', 'loamy', 'silty');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.irrigation_method AS ENUM ('drip', 'sprinkler', 'flood', 'manual');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Update the handle_new_user function to properly assign roles based on signup data
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
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
  
  -- Determine role from signup metadata, default to farmer
  user_role := COALESCE(
    (new.raw_user_meta_data ->> 'role')::public.app_role, 
    'farmer'::public.app_role
  );
  
  -- Assign the role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, user_role);
  
  RETURN new;
END;
$$;

-- Update RLS policies for profiles table to allow proper role-based access
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Extension officers and admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'extension_officer')
  );

-- Update RLS policies for user_roles table
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;

CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Extension officers can view roles"
  ON public.user_roles FOR SELECT
  USING (public.has_role(auth.uid(), 'extension_officer'));

-- Fix the missing RLS policies for farms table
DROP POLICY IF EXISTS "Farmers can view their own farms" ON public.farms;
DROP POLICY IF EXISTS "Farmers can insert their own farms" ON public.farms;
DROP POLICY IF EXISTS "Farmers can update their own farms" ON public.farms;
DROP POLICY IF EXISTS "Farmers can delete their own farms" ON public.farms;
DROP POLICY IF EXISTS "Admins and extension officers can view all farms" ON public.farms;

CREATE POLICY "Farmers can view their own farms"
  ON public.farms FOR SELECT
  USING (auth.uid() = farmer_id);

CREATE POLICY "Farmers can insert their own farms"
  ON public.farms FOR INSERT
  WITH CHECK (auth.uid() = farmer_id);

CREATE POLICY "Farmers can update their own farms"
  ON public.farms FOR UPDATE
  USING (auth.uid() = farmer_id);

CREATE POLICY "Farmers can delete their own farms"
  ON public.farms FOR DELETE
  USING (auth.uid() = farmer_id);

CREATE POLICY "Admins and extension officers can view all farms"
  ON public.farms FOR SELECT
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'extension_officer')
  );

-- Fix the missing RLS policies for crops table
DROP POLICY IF EXISTS "Farmers can manage crops on their farms" ON public.crops;
DROP POLICY IF EXISTS "Admins and extension officers can view all crops" ON public.crops;

CREATE POLICY "Farmers can manage crops on their farms"
  ON public.crops FOR ALL
  USING (public.user_owns_farm(farm_id));

CREATE POLICY "Admins and extension officers can view all crops"
  ON public.crops FOR SELECT
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'extension_officer')
  );

-- Fix the missing RLS policies for irrigation schedules
DROP POLICY IF EXISTS "Farmers can manage schedules for their farms" ON public.irrigation_schedules;
DROP POLICY IF EXISTS "Admins and extension officers can view all schedules" ON public.irrigation_schedules;

CREATE POLICY "Farmers can manage schedules for their farms"
  ON public.irrigation_schedules FOR ALL
  USING (public.user_owns_farm(farm_id));

CREATE POLICY "Admins and extension officers can view all schedules"
  ON public.irrigation_schedules FOR SELECT
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'extension_officer')
  );

-- Fix the missing RLS policies for irrigation logs
DROP POLICY IF EXISTS "Farmers can manage logs for their farms" ON public.irrigation_logs;
DROP POLICY IF EXISTS "Admins and extension officers can view all logs" ON public.irrigation_logs;

CREATE POLICY "Farmers can manage logs for their farms"
  ON public.irrigation_logs FOR ALL
  USING (public.user_owns_farm(farm_id));

CREATE POLICY "Admins and extension officers can view all logs"
  ON public.irrigation_logs FOR SELECT
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'extension_officer')
  );

-- Create a table for email templates and custom email settings
CREATE TABLE IF NOT EXISTS public.email_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_type text NOT NULL CHECK (template_type IN ('welcome', 'reset_password', 'confirm_email', 'magic_link')),
  subject text NOT NULL,
  html_content text NOT NULL,
  text_content text,
  from_name text DEFAULT 'AquaWise Homa Bay County',
  from_email text DEFAULT 'noreply@aquawise.homabay.go.ke',
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for email templates
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- Only admins can manage email templates
CREATE POLICY "Only admins can manage email templates"
  ON public.email_templates FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Insert default email templates (only if they don't exist)
INSERT INTO public.email_templates (template_type, subject, html_content, text_content) 
SELECT 'welcome', 'Welcome to AquaWise - Homa Bay County Smart Irrigation System', 
 '<h1>Welcome to AquaWise!</h1><p>Thank you for joining the Homa Bay County Smart Irrigation System. We are excited to help you optimize your farming practices with our advanced irrigation management tools.</p><p>Get started by setting up your farm profile and creating your first irrigation schedule.</p><p>Best regards,<br>The AquaWise Team<br>Homa Bay County</p>', 
 'Welcome to AquaWise! Thank you for joining the Homa Bay County Smart Irrigation System. We are excited to help you optimize your farming practices with our advanced irrigation management tools. Get started by setting up your farm profile and creating your first irrigation schedule. Best regards, The AquaWise Team, Homa Bay County'
WHERE NOT EXISTS (SELECT 1 FROM public.email_templates WHERE template_type = 'welcome');

INSERT INTO public.email_templates (template_type, subject, html_content, text_content) 
SELECT 'confirm_email', 'Confirm Your Email - AquaWise Homa Bay County', 
 '<h1>Confirm Your Email Address</h1><p>Please click the link below to confirm your email address and complete your registration with AquaWise - Homa Bay County Smart Irrigation System.</p><p>If you did not create an account, please ignore this email.</p><p>Best regards,<br>The AquaWise Team<br>Homa Bay County</p>', 
 'Confirm Your Email Address. Please click the link below to confirm your email address and complete your registration with AquaWise - Homa Bay County Smart Irrigation System. If you did not create an account, please ignore this email. Best regards, The AquaWise Team, Homa Bay County'
WHERE NOT EXISTS (SELECT 1 FROM public.email_templates WHERE template_type = 'confirm_email');

INSERT INTO public.email_templates (template_type, subject, html_content, text_content) 
SELECT 'reset_password', 'Reset Your Password - AquaWise Homa Bay County', 
 '<h1>Reset Your Password</h1><p>You requested a password reset for your AquaWise account. Click the link below to reset your password.</p><p>If you did not request this, please ignore this email.</p><p>Best regards,<br>The AquaWise Team<br>Homa Bay County</p>', 
 'Reset Your Password. You requested a password reset for your AquaWise account. Click the link below to reset your password. If you did not request this, please ignore this email. Best regards, The AquaWise Team, Homa Bay County'
WHERE NOT EXISTS (SELECT 1 FROM public.email_templates WHERE template_type = 'reset_password');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_email_templates_type ON public.email_templates(template_type);
CREATE INDEX IF NOT EXISTS idx_email_templates_active ON public.email_templates(is_active);
