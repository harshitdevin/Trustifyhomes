-- =========================================================
-- TRUSTIFY HOMES (EZ HOMES) MVP - PHASE 2 SUPABASE MIGRATION
-- Core Database Schema, Auth Profile Triggers, RLS Policies & Storage
-- =========================================================

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'buyer' CHECK (role IN ('buyer', 'owner', 'broker', 'student', 'admin')),
  city TEXT DEFAULT 'Jammu',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. PROPERTIES TABLE
CREATE TABLE IF NOT EXISTS public.properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  broker_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  listing_type TEXT NOT NULL CHECK (listing_type IN ('sale', 'rent')),
  property_type TEXT NOT NULL CHECK (property_type IN (
    'apartment', 'independent_house', 'villa', 'plot', 'shop', 'office', 
    'commercial', 'pg', 'hostel', 'room', 'shared_flat', 'co_living', 'other'
  )),
  price NUMERIC NOT NULL CHECK (price >= 0),
  area_sqft NUMERIC,
  bedrooms INT DEFAULT 0,
  bathrooms INT DEFAULT 0,
  floor TEXT,
  total_floors INT,
  furnishing TEXT DEFAULT 'unfurnished',
  parking TEXT DEFAULT 'none',
  address TEXT,
  locality TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT 'Jammu',
  latitude NUMERIC,
  longitude NUMERIC,
  status TEXT NOT NULL DEFAULT 'pending_review' CHECK (status IN (
    'draft', 'pending_review', 'approved', 'rejected', 'suspended', 'sold', 'rented', 'expired'
  )),
  verification_status TEXT NOT NULL DEFAULT 'unverified' CHECK (verification_status IN (
    'unverified', 'submitted', 'verified'
  )),
  is_featured BOOLEAN DEFAULT false,
  posted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. PROPERTY IMAGES TABLE
CREATE TABLE IF NOT EXISTS public.property_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  public_url TEXT NOT NULL,
  display_order INT DEFAULT 0,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. PROPERTY AMENITIES TABLE
CREATE TABLE IF NOT EXISTS public.property_amenities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  amenity_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. FAVORITES TABLE
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_user_property UNIQUE (user_id, property_id)
);

-- 6. ENQUIRIES TABLE
CREATE TABLE IF NOT EXISTS public.enquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  buyer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  message TEXT,
  budget NUMERIC,
  preferred_contact TEXT DEFAULT 'phone',
  timeline TEXT DEFAULT 'immediate',
  consent_given BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. BROKERS TABLE
CREATE TABLE IF NOT EXISTS public.brokers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  agency_name TEXT,
  office_address TEXT,
  city TEXT DEFAULT 'Jammu',
  rera_number TEXT,
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'submitted', 'verified', 'rejected')),
  verification_notes TEXT,
  business_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. COLLEGES TABLE
CREATE TABLE IF NOT EXISTS public.colleges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  short_name TEXT,
  city TEXT NOT NULL DEFAULT 'Jammu',
  locality TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  website_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_properties_city_status ON public.properties(city, status);
CREATE INDEX IF NOT EXISTS idx_properties_listing_type ON public.properties(listing_type);
CREATE INDEX IF NOT EXISTS idx_properties_owner ON public.properties(owner_id);
CREATE INDEX IF NOT EXISTS idx_properties_broker ON public.properties(broker_id);
CREATE INDEX IF NOT EXISTS idx_property_images_prop ON public.property_images(property_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_enquiries_prop ON public.enquiries(property_id);

-- AUTOMATIC PROFILE CREATION TRIGGER ON AUTH.USERS INSERT
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  requested_role TEXT;
BEGIN
  requested_role := NEW.raw_user_meta_data->>'role';
  
  -- Prevent self-elevation to admin via signup metadata
  IF requested_role IS NULL OR requested_role NOT IN ('buyer', 'owner', 'broker', 'student') THEN
    requested_role := 'buyer';
  END IF;

  INSERT INTO public.profiles (id, full_name, email, phone, avatar_url, role, city)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'avatar_url',
    requested_role,
    COALESCE(NEW.raw_user_meta_data->>'city', 'Jammu')
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    updated_at = NOW();

  -- If registered as broker, auto-create broker record in pending state
  IF requested_role = 'broker' THEN
    INSERT INTO public.brokers (profile_id, agency_name, city, rera_number, verification_status)
    VALUES (
      NEW.id,
      NEW.raw_user_meta_data->>'agency_name',
      COALESCE(NEW.raw_user_meta_data->>'city', 'Jammu'),
      NEW.raw_user_meta_data->>'rera_number',
      'pending'
    )
    ON CONFLICT (profile_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brokers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.colleges ENABLE ROW LEVEL SECURITY;

-- 1. Profiles Policies
CREATE POLICY "Profiles readable by authenticated or public" 
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id) 
  WITH CHECK (
    auth.uid() = id AND 
    role = (SELECT role FROM public.profiles WHERE id = auth.uid()) -- prevents changing role to admin
  );

-- 2. Properties Policies
CREATE POLICY "Public users can read approved properties" 
  ON public.properties FOR SELECT 
  USING (
    status = 'approved' OR 
    auth.uid() = owner_id OR 
    auth.uid() = broker_id OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Owners and brokers can insert properties" 
  ON public.properties FOR INSERT 
  WITH CHECK (
    auth.uid() IS NOT NULL AND (
      auth.uid() = owner_id OR 
      auth.uid() = broker_id OR 
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    )
  );

CREATE POLICY "Owners and brokers can update own properties" 
  ON public.properties FOR UPDATE 
  USING (
    auth.uid() = owner_id OR 
    auth.uid() = broker_id OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Owners and brokers can delete own properties" 
  ON public.properties FOR DELETE 
  USING (
    auth.uid() = owner_id OR 
    auth.uid() = broker_id OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 3. Property Images & Amenities Policies
CREATE POLICY "Public read property images" 
  ON public.property_images FOR SELECT USING (true);

CREATE POLICY "Manage images for owned properties" 
  ON public.property_images FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.properties 
      WHERE properties.id = property_images.property_id 
      AND (properties.owner_id = auth.uid() OR properties.broker_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
    )
  );

CREATE POLICY "Public read property amenities" 
  ON public.property_amenities FOR SELECT USING (true);

CREATE POLICY "Manage amenities for owned properties" 
  ON public.property_amenities FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.properties 
      WHERE properties.id = property_amenities.property_id 
      AND (properties.owner_id = auth.uid() OR properties.broker_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
    )
  );

-- 4. Favorites Policies
CREATE POLICY "Users view own favorites" 
  ON public.favorites FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users insert own favorites" 
  ON public.favorites FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own favorites" 
  ON public.favorites FOR DELETE USING (auth.uid() = user_id);

-- 5. Enquiries Policies
CREATE POLICY "Users insert enquiries" 
  ON public.enquiries FOR INSERT WITH CHECK (buyer_id IS NULL OR auth.uid() = buyer_id);

CREATE POLICY "Users or owners view related enquiries" 
  ON public.enquiries FOR SELECT USING (
    auth.uid() = buyer_id OR 
    EXISTS (
      SELECT 1 FROM public.properties 
      WHERE properties.id = enquiries.property_id 
      AND (properties.owner_id = auth.uid() OR properties.broker_id = auth.uid())
    ) OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 6. Brokers Policies
CREATE POLICY "Public read verified brokers" 
  ON public.brokers FOR SELECT USING (
    verification_status = 'verified' OR 
    auth.uid() = profile_id OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Brokers manage own profile" 
  ON public.brokers FOR ALL USING (
    auth.uid() = profile_id OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 7. Colleges Policies
CREATE POLICY "Public read active colleges" 
  ON public.colleges FOR SELECT USING (is_active = true);

CREATE POLICY "Admins manage colleges" 
  ON public.colleges FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- SUPABASE STORAGE BUCKET CONFIGURATION FOR PROPERTY IMAGES
INSERT INTO storage.buckets (id, name, public) 
VALUES ('property-images', 'property-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read property images storage"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'property-images');

CREATE POLICY "Authenticated users upload property images storage"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'property-images' AND auth.role() = 'authenticated');
