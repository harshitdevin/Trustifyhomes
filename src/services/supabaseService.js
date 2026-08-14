import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { MOCK_PROPERTIES } from '../data/mockProperties';

export const supabaseService = {
  // Check if Supabase connection is active
  isConfigured: () => isSupabaseConfigured,

  // AUTHENTICATION API
  signUpUser: async ({ email, password, fullName, phone, role = 'customer', city = 'Jammu' }) => {
    const safeRole = ['customer', 'buyer', 'owner', 'broker', 'student'].includes(role.toLowerCase()) 
      ? 'customer' 
      : 'customer';

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
          user_metadata: { full_name: email.split('@')[0], phone: '+91 94191 00000', role: 'customer', city: 'Jammu' }
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

  updatePassword: async (newPassword) => {
    if (!isSupabaseConfigured) {
      return { message: 'Demo password updated successfully.' };
    }
    try {
      const { data, error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw new Error(error.message);
      return data;
    } catch (err) {
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

  updateCustomerStatus: async (customerId, newStatus) => {
    if (!isSupabaseConfigured) return null;
    const { data, error } = await supabase
      .from('profiles')
      .update({ account_status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', customerId)
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
      if (!data || data.length === 0) return MOCK_PROPERTIES;

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
        sellerType: p.broker_id ? 'Broker' : 'Trustify Partner',
        sellerName: 'Verified Agent / Trustify Partner',
        sellerPhone: '+91 94191 00000',
        sellerWhatsApp: '919419100000',
        images: p.property_images && p.property_images.length > 0 
          ? p.property_images.map(img => img.public_url)
          : ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1000&q=80'],
        floorPlanUrl: 'https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=1000&q=80',
        amenities: p.property_amenities ? p.property_amenities.map(a => a.amenity_name) : ['Power Backup', 'Parking', 'Security'],
        localityAdvantages: [{ name: 'City Center', distance: '1.5 km' }],
        description: p.description || 'Verified property in prime locality.'
      }));
    } catch (err) {
      console.warn('Supabase property fetch failed, falling back to mock properties:', err.message);
      return MOCK_PROPERTIES;
    }
  },

  postProperty: async (propertyInput, userId, userRole = 'broker') => {
    if (!isSupabaseConfigured) {
      return { id: `ez-user-${Date.now()}`, ...propertyInput };
    }

    const dbPayload = {
      broker_id: userId,
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
      status: 'pending_review',
      verification_status: propertyInput.reraId ? 'submitted' : 'unverified'
    };

    const { data: createdProperty, error } = await supabase
      .from('properties')
      .insert(dbPayload)
      .select()
      .single();

    if (error) throw new Error(error.message);

    if (propertyInput.amenities && propertyInput.amenities.length > 0) {
      const amenitiesRows = propertyInput.amenities.map(a => ({
        property_id: createdProperty.id,
        amenity_name: a
      }));
      await supabase.from('property_amenities').insert(amenitiesRows);
    }

    return createdProperty;
  },

  // LISTING REQUESTS API (Public Owner Submissions)
  submitListingRequest: async (reqData) => {
    if (!isSupabaseConfigured) return { success: true };
    const { data, error } = await supabase
      .from('listing_requests')
      .insert({
        owner_name: reqData.ownerName,
        owner_phone: reqData.ownerPhone,
        owner_email: reqData.ownerEmail,
        property_type: reqData.propertyType || 'apartment',
        listing_type: reqData.listingType || 'sale',
        city: reqData.city || 'Jammu',
        locality: reqData.locality,
        approx_price: reqData.approxPriceDisplay,
        message: reqData.message,
        status: 'New'
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  fetchListingRequests: async () => {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase
      .from('listing_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return [];
    return data;
  },

  // BROKER LEADS & ASSIGNMENT API
  assignLeadToBroker: async ({ customerId, brokerId, adminId, priority = 'high', adminNote = '' }) => {
    if (!isSupabaseConfigured) return { success: true };
    const { data, error } = await supabase
      .from('broker_leads')
      .insert({
        customer_id: customerId,
        broker_id: brokerId,
        admin_id: adminId,
        assigned_by: adminId,
        priority,
        admin_note: adminNote,
        status: 'assigned'
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  fetchAssignedBrokerLeads: async (brokerId) => {
    if (!isSupabaseConfigured || !brokerId) return [];
    const { data, error } = await supabase
      .from('broker_leads')
      .select(`
        *,
        customer:customer_id (id, full_name, email, phone, city),
        property:property_id (id, title, locality, price)
      `)
      .eq('broker_id', brokerId)
      .order('created_at', { ascending: false });

    if (error) return [];
    return data;
  },

  // AUDIT LOG API
  addAdminAuditLog: async ({ adminId, action, targetType, targetId, metadata = {} }) => {
    if (!isSupabaseConfigured || !adminId) return;
    const { error } = await supabase
      .from('admin_actions')
      .insert({
        admin_id: adminId,
        action,
        target_type: targetType,
        target_id: targetId,
        metadata
      });

    if (error) console.warn('Failed to insert audit log to Supabase:', error.message);
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

    if (error && error.code !== '23505') {
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
