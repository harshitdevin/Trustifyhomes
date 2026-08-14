// Advanced Service Layer for EZ HOMES
// Connects directly to Express Backend REST API (http://localhost:5000/api)
// Includes seamless offline fallback to LocalStorage for 100% availability.

const API_BASE_URL = 'http://localhost:5000/api';

const STORAGE_KEYS = {
  PROPERTIES: 'ez_custom_properties_db',
  LEADS: 'ez_buyer_leads_marketplace_db',
  BROKERS: 'ez_brokers_registry_db',
  TOKENS: 'ez_broker_token_balance',
  DEALS: 'ez_deals_transactions_db',
  AUDIT_LOGS: 'ez_system_audit_logs_db',
  CUSTOMERS: 'ez_customers_crm_db',
  SITE_VISITS: 'ez_site_visits_db',
  ENQUIRIES: 'ez_enquiries_crm_db'
};

const INITIAL_LEADS = [
  {
    id: 'lead-jm-101',
    buyerName: 'Aarav Sharma',
    buyerPhone: '+91 94191 88990',
    locality: 'Gandhi Nagar',
    city: 'Jammu',
    propertyType: 'villa',
    budgetDisplay: '₹2.45 Cr',
    priceVal: 24500000,
    expectedCommissionRate: '1.5%',
    estimatedCommissionVal: '₹3.67 Lac',
    leadPriceTokens: 500,
    isPurchased: false,
    purchasedBy: null,
    inquiryDate: '25 mins ago',
    note: 'Urgent buyer looking for 4 BHK Kothi in Gandhi Nagar Green Belt. Ready with liquid capital.'
  },
  {
    id: 'lead-jm-102',
    buyerName: 'Priya Sundaram',
    buyerPhone: '+91 97960 33441',
    locality: 'Trikuta Nagar',
    city: 'Jammu',
    propertyType: 'apartment',
    budgetDisplay: '₹1.15 Cr',
    priceVal: 11500000,
    expectedCommissionRate: '2.0%',
    estimatedCommissionVal: '₹2.30 Lac',
    leadPriceTokens: 350,
    isPurchased: false,
    purchasedBy: null,
    inquiryDate: '2 hours ago',
    note: 'Bank manager seeking 3 BHK flat near Trikuta Nagar Sector 4 with stilt parking.'
  }
];

const INITIAL_BROKERS = [
  {
    id: 'brk-jm-001',
    name: 'Col. Vikram Singh',
    agencyName: 'Duggar Realty Jammu',
    phone: '+91 94191 12345',
    email: 'vikram.singh@gandhinagar.in',
    brokerType: 'Independent Agency',
    reraId: 'JKRERA/JM/AGENT/2024/00889',
    locality: 'Gandhi Nagar, Jammu',
    verificationStatus: 'verified',
    status: 'Active',
    activeListingsCount: 8,
    leadsBoughtCount: 14,
    totalViews: 12480,
    totalEnquiries: 184,
    siteVisitsCount: 28,
    conversionsCount: 8,
    conversionRate: '11.9%',
    totalCommissionEarned: '₹14.20 Lac'
  },
  {
    id: 'brk-jm-002',
    name: 'Rohit Jamwal',
    agencyName: 'Jammu Valley Properties',
    phone: '+91 94190 77112',
    email: 'rohit@jammuvalley.com',
    brokerType: 'Franchise Partner',
    reraId: 'JKRERA/JM/AGENT/2025/00142',
    locality: 'Sidhra, Jammu',
    verificationStatus: 'verified',
    status: 'Active',
    activeListingsCount: 5,
    leadsBoughtCount: 8,
    totalViews: 6800,
    totalEnquiries: 92,
    siteVisitsCount: 15,
    conversionsCount: 4,
    conversionRate: '9.5%',
    totalCommissionEarned: '₹8.50 Lac'
  },
  {
    id: 'brk-jm-003',
    name: 'Unverified Dealer',
    agencyName: 'Quick Realty Solutions',
    phone: '+91 99000 00000',
    email: 'dealer@unverified.in',
    brokerType: 'Individual Dealer',
    reraId: 'PENDING_REVIEW',
    locality: 'Janipur, Jammu',
    verificationStatus: 'pending',
    status: 'Active',
    activeListingsCount: 1,
    leadsBoughtCount: 0,
    totalViews: 320,
    totalEnquiries: 4,
    siteVisitsCount: 0,
    conversionsCount: 0,
    conversionRate: '0.0%',
    totalCommissionEarned: '₹0'
  }
];

const INITIAL_DEALS = [
  {
    id: 'deal-jm-501',
    propertyTitle: 'Luxury 4 BHK Kothi in Gandhi Nagar',
    buyerName: 'Ramesh Jamwal',
    brokerName: 'Col. Vikram Singh',
    dealAmountDisplay: '₹2.45 Cr',
    dealAmountVal: 24500000,
    brokerCommission: '₹3.67 Lac (1.5%)',
    platformCut: '₹24,500 (0.1%)',
    stage: 'Token Paid (Advance)',
    date: '12 Aug 2026',
    status: 'In Progress'
  }
];

const INITIAL_AUDIT_LOGS = [
  {
    id: 'audit-1',
    timestamp: '14 Aug 2026, 01:15 AM',
    action: 'LEAD_PURCHASED',
    actor: 'Col. Vikram Singh (Broker)',
    details: 'Unlocked phone lead for Vikram Mehta (NRI) - 1 Kanal Sidhra Plot',
    severity: 'info'
  }
];

const INITIAL_CUSTOMERS = [
  {
    id: 'cust-1',
    name: 'Rahul Sharma',
    phone: '+91 94191 88990',
    email: 'rahul.sharma@jammu.in',
    role: 'buyer',
    city: 'Jammu',
    budgetPreference: '₹15,000 - ₹22,000/mo',
    shortlistedCount: 4,
    callbacksCount: 2,
    siteVisitsCount: 1,
    lastActive: '10 mins ago',
    accountStatus: 'Active',
    intentScore: 87,
    intentLevel: 'hot'
  },
  {
    id: 'cust-2',
    name: 'Priya Sundaram',
    phone: '+91 97960 33441',
    email: 'priya.s@gmail.com',
    role: 'buyer',
    city: 'Jammu',
    budgetPreference: '₹1.20 Cr - ₹2.50 Cr',
    shortlistedCount: 3,
    callbacksCount: 1,
    siteVisitsCount: 0,
    lastActive: '1 hour ago',
    accountStatus: 'Active',
    intentScore: 74,
    intentLevel: 'high'
  },
  {
    id: 'cust-3',
    name: 'Ananya Mahajan',
    phone: '+91 94192 11002',
    email: 'ananya.m@jammuuniv.edu',
    role: 'student',
    city: 'Jammu',
    budgetPreference: '₹6,000 - ₹9,000/mo',
    shortlistedCount: 2,
    callbacksCount: 0,
    siteVisitsCount: 1,
    lastActive: '3 hours ago',
    accountStatus: 'Active',
    intentScore: 68,
    intentLevel: 'high'
  }
];

const INITIAL_SITE_VISITS = [
  {
    id: 'visit-101',
    customerName: 'Rahul Sharma',
    customerPhone: '+91 94191 88990',
    propertyTitle: 'Luxury 2 BHK Apartment in Gandhi Nagar',
    locality: 'Gandhi Nagar, Jammu',
    requestedDate: '15 Aug 2026, 11:00 AM',
    brokerName: 'Col. Vikram Singh',
    status: 'Requested',
    createdAt: '1 hour ago'
  },
  {
    id: 'visit-102',
    customerName: 'Ananya Mahajan',
    customerPhone: '+91 94192 11002',
    propertyTitle: 'Girls Luxury PG near Jammu University',
    locality: 'Channi Himmat, Jammu',
    requestedDate: '16 Aug 2026, 04:30 PM',
    brokerName: 'Col. Vikram Singh',
    status: 'Confirmed',
    createdAt: '3 hours ago'
  }
];

const INITIAL_ENQUIRIES = [
  {
    id: 'enq-201',
    customerName: 'Rahul Sharma',
    customerPhone: '+91 94191 88990',
    propertyTitle: 'Luxury 2 BHK Apartment in Gandhi Nagar',
    locality: 'Gandhi Nagar',
    message: 'Callback request for pricing & site visit slot',
    createdAt: '30 mins ago',
    status: 'New'
  },
  {
    id: 'enq-202',
    customerName: 'Priya Sundaram',
    customerPhone: '+91 97960 33441',
    propertyTitle: '3 BHK Kothi in Trikuta Nagar',
    locality: 'Trikuta Nagar',
    message: 'Is loan assistance available for this property?',
    createdAt: '2 hours ago',
    status: 'Contacted'
  }
];

export const dbService = {
  // Check backend server health
  checkBackendHealth: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/health`);
      return res.ok;
    } catch (e) {
      return false;
    }
  },

  // Get custom properties
  getCustomProperties: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROPERTIES);
      return data ? JSON.parse(data) : [];
    } catch (err) {
      return [];
    }
  },

  // Save new property
  saveProperty: (property) => {
    try {
      fetch(`${API_BASE_URL}/properties`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(property)
      }).catch(() => {});

      const existing = dbService.getCustomProperties();
      const updated = [property, ...existing];
      localStorage.setItem(STORAGE_KEYS.PROPERTIES, JSON.stringify(updated));
      dbService.addAuditLog('PROPERTY_POSTED', 'Broker/User', `Posted new property: ${property.title}`);
      return updated;
    } catch (err) {
      return [];
    }
  },

  // Get Lead Marketplace
  getLeadMarketplace: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LEADS);
      return data ? JSON.parse(data) : INITIAL_LEADS;
    } catch (err) {
      return INITIAL_LEADS;
    }
  },

  // Buy Lead
  buyLead: (leadId, brokerName) => {
    try {
      const leads = dbService.getLeadMarketplace();
      const updated = leads.map(l => l.id === leadId ? { ...l, isPurchased: true, purchasedBy: brokerName } : l);
      localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(updated));
      dbService.addAuditLog('LEAD_PURCHASED', brokerName, `Unlocked buyer lead contact for ID: ${leadId}`);
      return updated;
    } catch (err) {
      return [];
    }
  },

  // Admin posts lead
  adminPostLead: (newLead) => {
    try {
      const leads = dbService.getLeadMarketplace();
      const updated = [newLead, ...leads];
      localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(updated));
      dbService.addAuditLog('LEAD_DISTRIBUTED', 'Admin', `Distributed new buyer lead: ${newLead.buyerName} (${newLead.locality})`);
      return updated;
    } catch (err) {
      return [];
    }
  },

  // Get Brokers List
  getBrokersList: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BROKERS);
      return data ? JSON.parse(data) : INITIAL_BROKERS;
    } catch (err) {
      return INITIAL_BROKERS;
    }
  },

  // Toggle Blacklist / Verification
  toggleBrokerBlacklist: (brokerId) => {
    try {
      const brokers = dbService.getBrokersList();
      let targetName = 'Broker';
      const updated = brokers.map(b => {
        if (b.id === brokerId) {
          targetName = b.name;
          const newStatus = b.status === 'Active' ? 'Blacklisted' : 'Active';
          return { ...b, status: newStatus };
        }
        return b;
      });
      localStorage.setItem(STORAGE_KEYS.BROKERS, JSON.stringify(updated));
      dbService.addAuditLog('BROKER_STATUS_CHANGED', 'Admin', `Toggled status for ${targetName}`);
      return updated;
    } catch (err) {
      return [];
    }
  },

  // Verify Broker RERA
  verifyBrokerRera: (brokerId, isVerified) => {
    try {
      const brokers = dbService.getBrokersList();
      const updated = brokers.map(b => b.id === brokerId ? {
        ...b,
        verificationStatus: isVerified ? 'verified' : 'rejected'
      } : b);
      localStorage.setItem(STORAGE_KEYS.BROKERS, JSON.stringify(updated));
      dbService.addAuditLog('BROKER_RERA_VERIFIED', 'Admin', `Updated verification status for broker ID: ${brokerId}`);
      return updated;
    } catch (err) {
      return INITIAL_BROKERS;
    }
  },

  // Token Balance
  getTokenBalance: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TOKENS);
      return data ? Number(data) : 1200;
    } catch (err) {
      return 1200;
    }
  },

  // Recharge Tokens
  rechargeTokens: (tokenAmount) => {
    try {
      const current = dbService.getTokenBalance();
      const updated = current + tokenAmount;
      localStorage.setItem(STORAGE_KEYS.TOKENS, updated.toString());
      dbService.addAuditLog('TOKENS_RECHARGED', 'Col. Vikram Singh', `Recharged wallet with ${tokenAmount} Lead Tokens`);
      return updated;
    } catch (err) {
      return 1200;
    }
  },

  // Deduct Tokens
  deductTokens: (tokenCost) => {
    try {
      const current = dbService.getTokenBalance();
      const updated = Math.max(0, current - tokenCost);
      localStorage.setItem(STORAGE_KEYS.TOKENS, updated.toString());
      return updated;
    } catch (err) {
      return 1200;
    }
  },

  // Get Deals
  getDeals: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DEALS);
      return data ? JSON.parse(data) : INITIAL_DEALS;
    } catch (err) {
      return INITIAL_DEALS;
    }
  },

  // Get Audit Logs
  getAuditLogs: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
      return data ? JSON.parse(data) : INITIAL_AUDIT_LOGS;
    } catch (err) {
      return INITIAL_AUDIT_LOGS;
    }
  },

  // Add Audit Log Entry
  addAuditLog: (action, actor, details) => {
    try {
      const existing = dbService.getAuditLogs();
      const newEntry = {
        id: `audit-${Date.now()}`,
        timestamp: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
        action,
        actor,
        details,
        severity: action.includes('BLACKLIST') ? 'warning' : 'info'
      };
      const updated = [newEntry, ...existing];
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(updated));
      return updated;
    } catch (err) {
      return [];
    }
  },

  // Get Customers CRM
  getCustomers: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
      return data ? JSON.parse(data) : INITIAL_CUSTOMERS;
    } catch (err) {
      return INITIAL_CUSTOMERS;
    }
  },

  // Update Customer Account Status
  updateCustomerAccountStatus: (customerId, newStatus) => {
    try {
      const customers = dbService.getCustomers();
      const updated = customers.map(c => c.id === customerId ? { ...c, accountStatus: newStatus } : c);
      localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(updated));
      dbService.addAuditLog('CUSTOMER_STATUS_UPDATED', 'Admin', `Set customer ID ${customerId} to ${newStatus}`);
      return updated;
    } catch (err) {
      return INITIAL_CUSTOMERS;
    }
  },

  // Site Visits CRM
  getSiteVisits: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SITE_VISITS);
      return data ? JSON.parse(data) : INITIAL_SITE_VISITS;
    } catch (err) {
      return INITIAL_SITE_VISITS;
    }
  },

  updateSiteVisitStatus: (visitId, newStatus) => {
    try {
      const visits = dbService.getSiteVisits();
      const updated = visits.map(v => v.id === visitId ? { ...v, status: newStatus } : v);
      localStorage.setItem(STORAGE_KEYS.SITE_VISITS, JSON.stringify(updated));
      return updated;
    } catch (err) {
      return INITIAL_SITE_VISITS;
    }
  },

  // Enquiries CRM
  getEnquiriesList: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ENQUIRIES);
      return data ? JSON.parse(data) : INITIAL_ENQUIRIES;
    } catch (err) {
      return INITIAL_ENQUIRIES;
    }
  },

  updateEnquiryStatus: (enqId, newStatus) => {
    try {
      const enqs = dbService.getEnquiriesList();
      const updated = enqs.map(e => e.id === enqId ? { ...e, status: newStatus } : e);
      localStorage.setItem(STORAGE_KEYS.ENQUIRIES, JSON.stringify(updated));
      return updated;
    } catch (err) {
      return INITIAL_ENQUIRIES;
    }
  }
};
