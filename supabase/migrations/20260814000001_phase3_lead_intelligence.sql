-- =========================================================
-- TRUSTIFY HOMES (EZ HOMES) MVP - PHASE 3 MIGRATION
-- Lead Intelligence, Customer Intent Scores, Broker Leads & Admin Action Audits
-- =========================================================

-- 1. USER ACTIVITY EVENTS TABLE
CREATE TABLE IF NOT EXISTS public.user_activity_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  college_id UUID REFERENCES public.colleges(id) ON DELETE SET NULL,
  search_query TEXT,
  locality TEXT,
  property_type TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. CUSTOMER INTENT SCORES TABLE
CREATE TABLE IF NOT EXISTS public.customer_intent_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  score INT NOT NULL DEFAULT 0 CHECK (score >= 0 AND score <= 100),
  intent_level TEXT NOT NULL DEFAULT 'low' CHECK (intent_level IN ('low', 'warm', 'high', 'hot')),
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  primary_city TEXT DEFAULT 'Jammu',
  primary_locality TEXT,
  preferred_property_type TEXT,
  estimated_budget_min NUMERIC,
  estimated_budget_max NUMERIC,
  preferred_listing_type TEXT DEFAULT 'buy',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. BROKER LEADS TABLE
CREATE TABLE IF NOT EXISTS public.broker_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  broker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  intent_score INT DEFAULT 0,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'hot')),
  status TEXT NOT NULL DEFAULT 'assigned' CHECK (status IN (
    'assigned', 'contacted', 'follow_up', 'site_visit', 'negotiation', 'converted', 'closed', 'lost'
  )),
  admin_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. ADMIN ACTIONS AUDIT LOG TABLE
CREATE TABLE IF NOT EXISTS public.admin_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  target_type TEXT,
  target_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- INDEXES FOR INTENT & LEAD PIPELINE PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_activity_user ON public.user_activity_events(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_event_type ON public.user_activity_events(event_type);
CREATE INDEX IF NOT EXISTS idx_intent_score ON public.customer_intent_scores(score DESC);
CREATE INDEX IF NOT EXISTS idx_intent_level ON public.customer_intent_scores(intent_level);
CREATE INDEX IF NOT EXISTS idx_broker_leads_broker ON public.broker_leads(broker_id);
CREATE INDEX IF NOT EXISTS idx_broker_leads_status ON public.broker_leads(status);

-- ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.user_activity_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_intent_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.broker_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_actions ENABLE ROW LEVEL SECURITY;

-- 1. Activity Events Policies
CREATE POLICY "Users can insert own activity events"
  ON public.user_activity_events FOR INSERT
  WITH CHECK (user_id IS NULL OR auth.uid() = user_id);

CREATE POLICY "Users view own activity or admin views all"
  ON public.user_activity_events FOR SELECT
  USING (
    auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 2. Customer Intent Scores Policies
CREATE POLICY "Users view own intent score or admin manages all"
  ON public.customer_intent_scores FOR SELECT
  USING (
    auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can insert or update intent scores"
  ON public.customer_intent_scores FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 3. Broker Leads Policies
CREATE POLICY "Brokers view assigned leads or admin manages all"
  ON public.broker_leads FOR SELECT
  USING (
    auth.uid() = broker_id OR 
    auth.uid() = customer_id OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can insert broker leads"
  ON public.broker_leads FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Brokers can update assigned lead status"
  ON public.broker_leads FOR UPDATE
  USING (
    auth.uid() = broker_id OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 4. Admin Actions Audit Policies
CREATE POLICY "Only admins can view or insert admin actions"
  ON public.admin_actions FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
