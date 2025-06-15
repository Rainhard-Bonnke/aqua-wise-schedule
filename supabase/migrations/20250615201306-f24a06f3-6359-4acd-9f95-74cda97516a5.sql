
-- Enable Row Level Security on the farms table
ALTER TABLE public.farms ENABLE ROW LEVEL SECURITY;

-- Policy for SELECT: Farmers can see their own farms, while extension officers can see all farms.
CREATE POLICY "Users can view their own farms, officers can view all"
ON public.farms
FOR SELECT
USING (
  (SELECT public.get_current_user_role()) = 'extension_officer' OR farmer_id = auth.uid()
);

-- Policy for INSERT: Farmers can create farms for themselves.
CREATE POLICY "Users can create their own farms"
ON public.farms
FOR INSERT
WITH CHECK (farmer_id = auth.uid());

-- Policy for UPDATE: Farmers can update their own farms.
CREATE POLICY "Users can update their own farms"
ON public.farms
FOR UPDATE
USING (farmer_id = auth.uid())
WITH CHECK (farmer_id = auth.uid());

-- Policy for DELETE: Farmers can delete their own farms.
CREATE POLICY "Users can delete their own farms"
ON public.farms
FOR DELETE
USING (farmer_id = auth.uid());
