-- =========================================================
-- TRUSTIFY HOMES - PHASE 4.1 BACKEND & SECURITY MIGRATION
-- Listing Requests, Customer Account Status, Strict RLS Policies, Audit Trail
-- =========================================================

-- 1. LISTING REQUESTS TABLE (Public Owner Contact Submissions)
CREATE TABLE IF NOT EXISTS public.listing_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_name TEXT NOT NULL,
  owner_phone TEXT NOT NULL,
  owner_email TEXT,
  property_type TEXT NOT NULL DEFAULT 'apartment',
  listing_type TEXT NOT NULL DEFAULT 'sale',
  city TEXT NOT NULL DEFAULT 'Jammu',
  locality TEXT NOT NULL,
  approx_price TEXT,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'New' CHECK (status IN ('New', 'Contacted', 'Verified & Created', 'Rejected', 'Archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. ENHANCE PROFILES WITH ACCOUNT STATUS & CUSTOMER ROLES
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS account_status TEXT NOT NULL DEFAULT 'Active' CHECK (account_status IN ('Active', 'Suspended', 'Blocked')),
  ADD COLUMN IF NOT EXISTS college_name TEXT,
  ADD COLUMN IF NOT EXISTS preferred_locality TEXT;

-- Update role check constraint if existing to allow 'customer'
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('customer', 'buyer', 'owner', 'broker', 'student', 'admin'));

-- 3. ENHANCE BROKER LEADS TABLE FOR REASSIGNMENT & AUDIT
ALTER TABLE public.broker_leads
  ADD COLUMN IF NOT EXISTS assigned_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS admin_note TEXT,
  ADD COLUMN IF NOT EXISTS reassign_count INT DEFAULT 0;

-- 4. ENABLE RLS ON LISTING REQUESTS
ALTER TABLE public.listing_requests ENABLE ROW LEVEL SECURITY;

-- 5. RLS POLICIES FOR LISTING REQUESTS
-- Public/unauthenticated owners can submit listing requests (Insert only)
CREATE POLICY "Public owners can submit listing requests"
  ON public.listing_requests FOR INSERT
  WITH CHECK (true);

-- Only Admins can view, update, or delete listing requests
CREATE POLICY "Admins can view and manage all listing requests"
  ON public.listing_requests FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 6. STRICT CUSTOMER ISOLATION RLS POLICIES
-- Customers can ONLY view and update their own profiles
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND 
    role = (SELECT role FROM public.profiles WHERE id = auth.uid()) AND
    account_status = 'Active'
  );

-- 7. STRICT BROKER ISOLATION RLS POLICIES
-- Brokers can ONLY view leads assigned to them by admin
DROP POLICY IF EXISTS "Brokers view assigned leads or admin manages all" ON public.broker_leads;
CREATE POLICY "Brokers view assigned leads or admin manages all"
  ON public.broker_leads FOR SELECT
  USING (
    auth.uid() = broker_id OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Brokers cannot view other brokers' leads or access full customer profiles
DROP POLICY IF EXISTS "Brokers can update assigned lead status" ON public.broker_leads;
CREATE POLICY "Brokers can update assigned lead status"
  ON public.broker_leads FOR UPDATE
  USING (
    auth.uid() = broker_id OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- INDEXES FOR PERFORMANCE & SECURITY LOOKUPS
CREATE INDEX IF NOT EXISTS idx_listing_requests_status ON public.listing_requests(status);
CREATE INDEX IF NOT EXISTS idx_profiles_account_status ON public.profiles(account_status);
CREATE INDEX IF NOT EXISTS idx_broker_leads_assigned ON public.broker_leads(broker_id, status);
