import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { MOCK_PROPERTIES } from '../data/mockProperties';

export const supabaseService = {
  // Check if Supabase connection is active
  isConfigured: () => isSupabaseConfigured,

  // AUTHENTICATION API
  signUpUser: async ({ email, password, fullName, phone, role = 'buyer', city = 'Jammu' }) => {
    const safeRole = ['buyer', 'owner', 'broker', 'student'].includes(role.toLowerCase()) 
      ? role.toLowerCase() 
      : 'buyer';

    if (!isSupabaseConfigured) {
      const demoUser = {
        id: `demo-user-${Date.now()}`,
        email,
        user_metadata: { full_name: fullName, phone, role: safeRole, city }
      };
      localStorage.setItem('ez_demo_user', JSON.stringify(demoUser));
      return { user: demoUser, session: { user: demoUser } };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone,
            role: safeRole,
            city
          }
        }
      });

      if (error) throw new Error(error.message);
      return data;
    } catch (err) {
      if (err.message.includes('Failed to fetch')) {
        throw new Error('Unable to connect to Supabase backend. Please check your internet connection or verify your Supabase URL in .env.');
      }
      throw err;
    }
  },

  signInUser: async ({ email, password }) => {
    if (!isSupabaseConfigured) {
      const savedDemo = localStorage.getItem('ez_demo_user');
      let demoUser;
      if (savedDemo) {
        demoUser = JSON.parse(savedDemo);
      } else {
        demoUser = {
          id: `demo-user-${Date.now()}`,
          email,
          user_metadata: { full_name: email.split('@')[0], phone: '+91 94191 00000', role: 'buyer', city: 'Jammu' }
        };
        localStorage.setItem('ez_demo_user', JSON.stringify(demoUser));
      }
      return { user: demoUser, session: { user: demoUser } };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) throw new Error(error.message);
      return data;
    } catch (err) {
      if (err.message.includes('Failed to fetch')) {
        throw new Error('Unable to connect to Supabase backend. Please check your internet connection or verify your Supabase URL in .env.');
      }
      throw err;
    }
  },

  signOutUser: async () => {
    if (!isSupabaseConfigured) {
      localStorage.removeItem('ez_demo_user');
      return;
    }
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw new Error(error.message);
    } catch (err) {
      localStorage.removeItem('ez_demo_user');
    }
  },

  resetPassword: async (email) => {
    if (!isSupabaseConfigured) {
      return { message: 'Password reset link sent to demo user.' };
    }
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw new Error(error.message);
      return data;
    } catch (err) {
      if (err.message.includes('Failed to fetch')) {
        throw new Error('Unable to connect to Supabase backend. Please check your internet connection or verify your Supabase URL in .env.');
      }
      throw err;
    }
  },

  getCurrentSession: async () => {
    if (!isSupabaseConfigured) {
      const savedDemo = localStorage.getItem('ez_demo_user');
      if (savedDemo) {
        const demoUser = JSON.parse(savedDemo);
        return { user: demoUser };
      }
      return null;
    }
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    } catch (err) {
      return null;
    }
  },

  // PROFILES API
  getProfile: async (userId) => {
    if (!isSupabaseConfigured || !userId) return null;
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching profile:', error.message);
    }
    return data;
  },

  updateProfile: async (userId, updates) => {
    if (!isSupabaseConfigured) return null;
    // Don't allow changing role to admin via profile update
    const safeUpdates = { ...updates };
    delete safeUpdates.role;
    safeUpdates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('profiles')
      .update(safeUpdates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  // PROPERTIES API
  fetchApprovedProperties: async ({ 
    city = 'Jammu', 
    listingType = 'sale', 
    propertyType = 'all',
    searchLocality = '',
    limit = 20, 
    offset = 0 
  } = {}) => {
    if (!isSupabaseConfigured) {
      // Fallback to local mock data filtering if DB not configured yet
      let filtered = MOCK_PROPERTIES.filter(p => p.city.toLowerCase() === city.toLowerCase());
      if (listingType === 'rent') {
        filtered = filtered.filter(p => p.listingType === 'rent');
      } else if (listingType === 'plot') {
        filtered = filtered.filter(p => p.propertyType === 'plot');
      } else if (listingType === 'buy' || listingType === 'sale') {
        filtered = filtered.filter(p => p.listingType === 'buy');
      }
      return filtered;
    }

    try {
      let query = supabase
        .from('properties')
        .select(`
          *,
          property_images (id, storage_path, public_url, is_primary, display_order),
          property_amenities (amenity_name)
        `)
        .eq('status', 'approved')
        .ilike('city', `%${city}%`)
        .order('posted_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (listingType === 'rent') {
        query = query.eq('listing_type', 'rent');
      } else if (listingType === 'sale' || listingType === 'buy') {
        query = query.eq('listing_type', 'sale');
      }

      if (propertyType !== 'all') {
        query = query.eq('property_type', propertyType);
      }

      if (searchLocality.trim() !== '') {
        query = query.or(`locality.ilike.%${searchLocality}%,title.ilike.%${searchLocality}%,address.ilike.%${searchLocality}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      if (!data || data.length === 0) return MOCK_PROPERTIES; // Fallback to mock data if empty DB

      // Map Supabase schema to existing MVP UI property shape
      return data.map(p => ({
        id: p.id,
        title: p.title,
        listingType: p.listing_type === 'sale' ? 'buy' : p.listing_type,
        propertyType: p.property_type,
        city: p.city,
        locality: p.locality,
        address: p.address || `${p.locality}, ${p.city}`,
        priceVal: Number(p.price),
        priceDisplay: p.price >= 10000000 
          ? `₹${(p.price / 10000000).toFixed(2)} Cr` 
          : `₹${(p.price / 100000).toFixed(0)} Lac`,
        pricePerSqFt: p.area_sqft ? Math.round(Number(p.price) / Number(p.area_sqft)) : 5000,
        bhk: p.bedrooms || 2,
        bathrooms: p.bathrooms || 2,
        balconies: 1,
        carpetArea: Number(p.area_sqft) || 1000,
        builtUpArea: Math.round((Number(p.area_sqft) || 1000) * 1.15),
        floor: p.floor || '1st Floor',
        facing: 'East Facing',
        possessionStatus: 'Ready to Move',
        ageOfProperty: '1 Year',
        maintenanceMonthly: 2500,
        reraId: 'JKRERA/JM/VERIFIED/2026',
        isReraVerified: p.verification_status === 'verified',
        sellerType: p.broker_id ? 'Broker' : 'Owner',
        sellerName: 'Verified Owner / Agent',
        sellerPhone: '+91 94191 00000',
        sellerWhatsApp: '919419100000',
        images: p.property_images && p.property_images.length > 0 
          ? p.property_images.map(img => img.public_url)
          : ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1000&q=80'],
        floorPlanUrl: 'https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=1000&q=80',
        amenities: p.property_amenities ? p.property_amenities.map(a => a.amenity_name) : ['Power Backup', 'Parking', 'Security'],
        localityAdvantages: [{ name: 'City Center', distance: '1.5 km' }],
        aiFairPriceEstimate: {
          min: `₹${(p.price / 100000).toFixed(0)} Lac`,
          max: `₹${(p.price / 100000).toFixed(0)} Lac`,
          valuationStatus: 'Fair Price',
          localityGrowth5Yr: '+18.5%'
        },
        description: p.description || 'Verified property in prime locality.'
      }));
    } catch (err) {
      console.warn('Supabase property fetch failed, falling back to mock properties:', err.message);
      return MOCK_PROPERTIES;
    }
  },

  fetchPropertyById: async (id) => {
    if (!isSupabaseConfigured) return null;
    const { data, error } = await supabase
      .from('properties')
      .select(`
        *,
        property_images (*),
        property_amenities (*)
      `)
      .eq('id', id)
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  postProperty: async (propertyInput, userId, userRole = 'owner') => {
    if (!isSupabaseConfigured) {
      return { id: `ez-user-${Date.now()}`, ...propertyInput };
    }

    const isOwner = userRole === 'owner' || userRole === 'buyer';
    const dbPayload = {
      owner_id: isOwner ? userId : null,
      broker_id: !isOwner ? userId : null,
      title: propertyInput.title,
      description: propertyInput.description,
      listing_type: propertyInput.listingType === 'buy' ? 'sale' : propertyInput.listingType,
      property_type: propertyInput.propertyType || 'apartment',
      price: propertyInput.priceVal,
      area_sqft: propertyInput.carpetArea,
      bedrooms: propertyInput.bhk,
      bathrooms: propertyInput.bathrooms || propertyInput.bhk,
      floor: propertyInput.floor || '1st Floor',
      furnishing: propertyInput.furnishing || 'unfurnished',
      address: propertyInput.address,
      locality: propertyInput.locality,
      city: propertyInput.city || 'Jammu',
      status: 'pending_review', // Default status per prompt requirement 9
      verification_status: propertyInput.reraId ? 'submitted' : 'unverified'
    };

    const { data: createdProperty, error } = await supabase
      .from('properties')
      .insert(dbPayload)
      .select()
      .single();

    if (error) throw new Error(error.message);

    // Save Amenities if provided
    if (propertyInput.amenities && propertyInput.amenities.length > 0) {
      const amenitiesRows = propertyInput.amenities.map(a => ({
        property_id: createdProperty.id,
        amenity_name: a
      }));
      await supabase.from('property_amenities').insert(amenitiesRows);
    }

    return createdProperty;
  },

  // STORAGE API
  uploadPropertyImage: async (file, propertyId, isPrimary = false) => {
    if (!isSupabaseConfigured || !file) return null;

    const fileExt = file.name.split('.').pop();
    const filePath = `properties/${propertyId}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('property-images')
      .upload(filePath, file, { cacheControl: '3600', upsert: true });

    if (uploadError) throw new Error(uploadError.message);

    const { data: publicUrlData } = supabase.storage
      .from('property-images')
      .getPublicUrl(filePath);

    const publicUrl = publicUrlData.publicUrl;

    const { data: imageRecord, error: imgErr } = await supabase
      .from('property_images')
      .insert({
        property_id: propertyId,
        storage_path: filePath,
        public_url: publicUrl,
        is_primary: isPrimary
      })
      .select()
      .single();

    if (imgErr) throw new Error(imgErr.message);
    return imageRecord;
  },

  // FAVORITES API
  getUserFavorites: async (userId) => {
    if (!isSupabaseConfigured || !userId) return [];
    const { data, error } = await supabase
      .from('favorites')
      .select('property_id')
      .eq('user_id', userId);

    if (error) return [];
    return data.map(f => f.property_id);
  },

  addFavorite: async (userId, propertyId) => {
    if (!isSupabaseConfigured || !userId) return;
    const { error } = await supabase
      .from('favorites')
      .insert({ user_id: userId, property_id: propertyId });

    if (error && error.code !== '23505') { // Ignore unique violation error
      throw new Error(error.message);
    }
  },

  removeFavorite: async (userId, propertyId) => {
    if (!isSupabaseConfigured || !userId) return;
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('property_id', propertyId);

    if (error) throw new Error(error.message);
  },

  // ENQUIRIES API
  submitEnquiry: async ({ propertyId, buyerId, name, phone, email, message, budget }) => {
    if (!isSupabaseConfigured) return { success: true };

    const { data, error } = await supabase
      .from('enquiries')
      .insert({
        property_id: propertyId,
        buyer_id: buyerId || null,
        name,
        phone,
        email,
        message,
        budget,
        preferred_contact: 'phone',
        consent_given: true
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  // COLLEGES API
  fetchColleges: async (city = 'Jammu') => {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase
      .from('colleges')
      .select('*')
      .eq('city', city)
      .eq('is_active', true);

    if (error) return [];
    return data;
  }
};
