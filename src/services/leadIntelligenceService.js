import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { dbService } from './dbService';

const STORAGE_KEYS = {
  ACTIVITIES: 'ez_user_activities_db',
  INTENT_SCORES: 'ez_intent_scores_db',
  BROKER_LEADS: 'ez_assigned_broker_leads_db',
  ADMIN_ACTIONS: 'ez_admin_audit_actions_db'
};

// Initial Seed Data for Demo Customer Activity & Intent Scoring
const INITIAL_DEMO_CUSTOMERS = [
  {
    userId: 'cust-101',
    fullName: 'Rahul Sharma',
    email: 'rahul.sharma@jammu.in',
    phone: '+91 94191 88990',
    role: 'buyer',
    city: 'Jammu',
    locality: 'Gandhi Nagar',
    propertyType: 'apartment',
    listingType: 'rent',
    budgetMin: 15000,
    budgetMax: 22000,
    budgetDisplay: '₹15,000 – ₹22,000/mo',
    score: 87,
    intentLevel: 'hot',
    lastActivityAt: '10 mins ago',
    viewedCount: 8,
    savedCount: 4,
    enquirySubmitted: true,
    siteVisitRequested: true,
    reasons: [
      '+25 Requested explicit site visit',
      '+20 Submitted callback enquiry',
      '+15 Clicked seller contact details',
      '+16 Saved 2 rental properties in Gandhi Nagar',
      '+10 Viewed rental properties 5 times'
    ]
  },
  {
    userId: 'cust-102',
    fullName: 'Priya Sundaram',
    email: 'priya.s@gmail.com',
    phone: '+91 97960 33441',
    role: 'buyer',
    city: 'Jammu',
    locality: 'Trikuta Nagar',
    propertyType: 'villa',
    listingType: 'buy',
    budgetMin: 12000000,
    budgetMax: 25000000,
    budgetDisplay: '₹1.20 Cr – ₹2.50 Cr',
    score: 74,
    intentLevel: 'high',
    lastActivityAt: '1 hour ago',
    viewedCount: 6,
    savedCount: 3,
    enquirySubmitted: true,
    siteVisitRequested: false,
    reasons: [
      '+20 Submitted callback enquiry for 3 BHK Kothi',
      '+15 Clicked direct phone contact button',
      '+24 Saved 3 luxury villas in Trikuta Nagar',
      '+15 Repeated search for Trikuta Nagar'
    ]
  },
  {
    userId: 'cust-103',
    fullName: 'Ananya Mahajan (Student)',
    email: 'ananya.m@jammuuniv.edu',
    phone: '+91 94192 11002',
    role: 'student',
    city: 'Jammu',
    locality: 'Channi Himmat',
    propertyType: 'pg',
    listingType: 'rent',
    budgetMin: 6000,
    budgetMax: 9000,
    budgetDisplay: '₹6,000 – ₹9,000/mo',
    score: 68,
    intentLevel: 'high',
    lastActivityAt: '3 hours ago',
    viewedCount: 5,
    savedCount: 2,
    enquirySubmitted: false,
    siteVisitRequested: true,
    reasons: [
      '+25 Requested PG site visit near Jammu University',
      '+15 Clicked owner contact details',
      '+16 Saved 2 girls PGs in Channi Himmat',
      '+12 Filtered by wifi & food facilities'
    ]
  },
  {
    userId: 'cust-104',
    fullName: 'Vikram Mehta (NRI Buyer)',
    email: 'v.mehta@dubai.com',
    phone: '+971 50 1234567',
    role: 'buyer',
    city: 'Jammu',
    locality: 'Sidhra',
    propertyType: 'plot',
    listingType: 'buy',
    budgetMin: 40000000,
    budgetMax: 80000000,
    budgetDisplay: '₹4.00 Cr – ₹8.00 Cr',
    score: 45,
    intentLevel: 'warm',
    lastActivityAt: '1 day ago',
    viewedCount: 4,
    savedCount: 1,
    enquirySubmitted: false,
    siteVisitRequested: false,
    reasons: [
      '+8 Saved 2 Kanal Sidhra Plot listing',
      '+15 Searched Sidhra Golf Course locality',
      '+12 Applied Kanal unit converter filter',
      '+10 Viewed plot details 5 times'
    ]
  }
];

const INITIAL_ASSIGNED_LEADS = [
  {
    id: 'lead-assign-1',
    customerId: 'cust-101',
    customerName: 'Rahul Sharma',
    customerPhone: '+91 94191 88990',
    customerEmail: 'rahul.sharma@jammu.in',
    brokerId: 'brk-jm-001',
    brokerName: 'Col. Vikram Singh (Duggar Realty)',
    propertyTitle: 'Luxury 2 BHK Apartment in Gandhi Nagar',
    locality: 'Gandhi Nagar, Jammu',
    propertyType: 'apartment',
    listingType: 'rent',
    budgetDisplay: '₹15,000 – ₹22,000/mo',
    intentScore: 87,
    priority: 'hot',
    status: 'assigned',
    adminNote: 'Urgent buyer. High intent: requested site visit and saved 4 rental properties.',
    assignedAt: '2 hours ago'
  }
];

export const leadIntelligenceService = {
  // Track First-Party User Activity Event
  trackActivityEvent: async ({
    userId,
    eventType,
    propertyId = null,
    collegeId = null,
    searchQuery = '',
    locality = '',
    propertyType = '',
    metadata = {}
  }) => {
    const eventPayload = {
      user_id: userId || null,
      event_type: eventType,
      property_id: propertyId,
      college_id: collegeId,
      search_query: searchQuery,
      locality,
      property_type: propertyType,
      metadata,
      created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured) {
      try {
        await supabase.from('user_activity_events').insert(eventPayload);
      } catch (err) {
        console.warn('Activity event DB log failed:', err.message);
      }
    } else {
      try {
        const existing = JSON.parse(localStorage.getItem(STORAGE_KEYS.ACTIVITIES) || '[]');
        localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify([eventPayload, ...existing]));
      } catch (e) {}
    }

    // Recalculate Intent Score if user is logged in
    if (userId) {
      leadIntelligenceService.recalculateIntentScore(userId, eventType);
    }
  },

  // Recalculate Intent Score with Recency Weighting
  recalculateIntentScore: (userId, eventType) => {
    try {
      const demoScores = JSON.parse(localStorage.getItem(STORAGE_KEYS.INTENT_SCORES) || 'null') || INITIAL_DEMO_CUSTOMERS;
      const targetUser = demoScores.find(c => c.userId === userId);

      if (!targetUser) return;

      let scoreAdd = 0;
      let reasonText = '';

      if (eventType === 'property_view') { scoreAdd = 2; reasonText = '+2 Viewed property details'; }
      else if (eventType === 'property_revisit') { scoreAdd = 5; reasonText = '+5 Revisited same property multiple times'; }
      else if (eventType === 'property_save') { scoreAdd = 8; reasonText = '+8 Saved property to shortlist'; }
      else if (eventType === 'search_locality_repeat') { scoreAdd = 5; reasonText = '+5 Repeated locality search'; }
      else if (eventType === 'filter_used') { scoreAdd = 3; reasonText = '+3 Applied specific search filters'; }
      else if (eventType === 'contact_click') { scoreAdd = 15; reasonText = '+15 Clicked owner/broker contact details'; }
      else if (eventType === 'enquiry_created') { scoreAdd = 20; reasonText = '+20 Submitted callback enquiry form'; }
      else if (eventType === 'site_visit_requested') { scoreAdd = 25; reasonText = '+25 Requested explicit site visit'; }

      const newScore = Math.min(100, targetUser.score + scoreAdd);
      let newLevel = 'low';
      if (newScore >= 80) newLevel = 'hot';
      else if (newScore >= 60) newLevel = 'high';
      else if (newScore >= 30) newLevel = 'warm';

      const updatedScores = demoScores.map(c => {
        if (c.userId === userId) {
          return {
            ...c,
            score: newScore,
            intentLevel: newLevel,
            lastActivityAt: 'Just now',
            reasons: reasonText ? [reasonText, ...c.reasons] : c.reasons
          };
        }
        return c;
      });

      localStorage.setItem(STORAGE_KEYS.INTENT_SCORES, JSON.stringify(updatedScores));
    } catch (err) {}
  },

  // Get Potential Customers Dashboard List
  getPotentialCustomers: () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.INTENT_SCORES);
      return saved ? JSON.parse(saved) : INITIAL_DEMO_CUSTOMERS;
    } catch (err) {
      return INITIAL_DEMO_CUSTOMERS;
    }
  },

  // Smart Broker Recommendation Engine
  recommendBrokersForLead: (customerRequirement) => {
    const allBrokers = dbService.getBrokersList();
    const city = customerRequirement.city || 'Jammu';
    const locality = customerRequirement.locality || 'Gandhi Nagar';

    // Filter & rank verified active brokers matching city and locality
    const ranked = allBrokers
      .filter(b => b.status === 'Active')
      .map(b => {
        let matchScore = 50;
        if (b.locality.toLowerCase().includes(locality.toLowerCase())) matchScore += 30;
        if (b.reraId && !b.reraId.includes('EXPIRED')) matchScore += 20;
        return { ...b, matchScore };
      })
      .sort((a, b) => b.matchScore - a.matchScore);

    return ranked.length > 0 ? ranked : allBrokers;
  },

  // Assign Customer Lead to Broker
  assignLeadToBroker: ({ customerId, brokerId, propertyTitle, adminNote, priority = 'high' }) => {
    const customers = leadIntelligenceService.getPotentialCustomers();
    const customer = customers.find(c => c.userId === customerId) || customers[0];
    const brokers = dbService.getBrokersList();
    const broker = brokers.find(b => b.id === brokerId) || brokers[0];

    const newAssignedLead = {
      id: `lead-assign-${Date.now()}`,
      customerId: customer.userId,
      customerName: customer.fullName,
      customerPhone: customer.phone,
      customerEmail: customer.email,
      brokerId: broker.id,
      brokerName: broker.name,
      propertyTitle: propertyTitle || `Property in ${customer.locality}`,
      locality: customer.locality,
      propertyType: customer.propertyType,
      listingType: customer.listingType,
      budgetDisplay: customer.budgetDisplay,
      intentScore: customer.score,
      priority,
      status: 'assigned',
      adminNote: adminNote || `Assigned high intent customer (${customer.score} score) for ${customer.locality}`,
      assignedAt: 'Just now'
    };

    try {
      const existing = JSON.parse(localStorage.getItem(STORAGE_KEYS.BROKER_LEADS) || 'null') || INITIAL_ASSIGNED_LEADS;
      const updated = [newAssignedLead, ...existing];
      localStorage.setItem(STORAGE_KEYS.BROKER_LEADS, JSON.stringify(updated));

      // Log Admin Action
      leadIntelligenceService.logAdminAction('LEAD_ASSIGNED_TO_BROKER', 'broker_leads', newAssignedLead.id, {
        customerName: customer.fullName,
        brokerName: broker.name,
        intentScore: customer.score
      });

      return updated;
    } catch (err) {
      return INITIAL_ASSIGNED_LEADS;
    }
  },

  // Get Assigned Broker Leads
  getAssignedBrokerLeads: (brokerId = null) => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BROKER_LEADS);
      const list = saved ? JSON.parse(saved) : INITIAL_ASSIGNED_LEADS;
      if (brokerId) {
        return list.filter(l => l.brokerId === brokerId || l.brokerName.toLowerCase().includes('vikram'));
      }
      return list;
    } catch (err) {
      return INITIAL_ASSIGNED_LEADS;
    }
  },

  // Update Lead Status (Broker Workflow)
  updateLeadStatus: (leadId, newStatus) => {
    try {
      const list = leadIntelligenceService.getAssignedBrokerLeads();
      const updated = list.map(l => l.id === leadId ? { ...l, status: newStatus, updatedAt: 'Just now' } : l);
      localStorage.setItem(STORAGE_KEYS.BROKER_LEADS, JSON.stringify(updated));
      return updated;
    } catch (err) {
      return INITIAL_ASSIGNED_LEADS;
    }
  },

  // Audit Admin Action
  logAdminAction: (action, targetType, targetId, metadata = {}) => {
    try {
      const existing = JSON.parse(localStorage.getItem(STORAGE_KEYS.ADMIN_ACTIONS) || '[]');
      const newAction = {
        id: `action-${Date.now()}`,
        adminId: 'admin-superuser',
        action,
        targetType,
        targetId,
        metadata,
        createdAt: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
      };
      localStorage.setItem(STORAGE_KEYS.ADMIN_ACTIONS, JSON.stringify([newAction, ...existing]));
      dbService.addAuditLog(action, 'Superuser Admin', `Action on ${targetType} ID: ${targetId}`);
    } catch (err) {}
  }
};
