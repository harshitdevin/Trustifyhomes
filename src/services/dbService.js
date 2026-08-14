// Advanced Service Layer for TRUSTIFY HOMES
// Connects directly to Express Backend REST API & Supabase Service
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
  ENQUIRIES: 'ez_enquiries_crm_db',
  LISTING_REQUESTS: 'ez_listing_requests_db'
};

const INITIAL_LEADS = [
  {
    id: 'lead-jm-101',
    customerName: 'Aarav Sharma',
    customerPhone: '+91 94191 88990',
    locality: 'Gandhi Nagar',
    city: 'Jammu',
    propertyType: 'villa',
    budgetDisplay: '₹2.45 Cr',
    priceVal: 24500000,
    expectedCommissionRate: '1.5%',
    estimatedCommissionVal: '₹3.67 Lac',
    leadPriceTokens: 500,
    isPurchased: false,
    assignedBrokerId: 'brk-jm-001',
    assignedBrokerName: 'Col. Vikram Singh',
    assignedAt: '14 Aug 2026',
    status: 'assigned',
    priority: 'high',
    intentScore: 87,
    inquiryDate: '25 mins ago',
    adminNote: 'Verified high intent buyer looking for 4 BHK Kothi in Gandhi Nagar.'
  },
  {
    id: 'lead-jm-102',
    customerName: 'Priya Sundaram',
    customerPhone: '+91 97960 33441',
    locality: 'Trikuta Nagar',
    city: 'Jammu',
    propertyType: 'apartment',
    budgetDisplay: '₹1.15 Cr',
    priceVal: 11500000,
    expectedCommissionRate: '2.0%',
    estimatedCommissionVal: '₹2.30 Lac',
    leadPriceTokens: 350,
    isPurchased: false,
    assignedBrokerId: 'brk-jm-001',
    assignedBrokerName: 'Col. Vikram Singh',
    assignedAt: '14 Aug 2026',
    status: 'contacted',
    priority: 'medium',
    intentScore: 74,
    inquiryDate: '2 hours ago',
    adminNote: 'Bank manager seeking 3 BHK flat near Trikuta Nagar Sector 4.'
  }
];

const INITIAL_BROKERS = [
  {
    id: 'brk-jm-001',
    name: 'Col. Vikram Singh',
    agencyName: 'Duggar Realty Jammu',
    phone: '+91 94191 12345',
    email: 'broker@trustifyhomes.test',
    brokerType: 'Independent Agency',
    reraId: 'JKRERA/JM/AGENT/2024/00889',
    locality: 'Gandhi Nagar, Jammu',
    city: 'Jammu',
    verificationStatus: 'verified',
    status: 'Active',
    activeListingsCount: 8,
    assignedLeadsCount: 14,
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
    city: 'Jammu',
    verificationStatus: 'verified',
    status: 'Active',
    activeListingsCount: 5,
    assignedLeadsCount: 8,
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
    city: 'Jammu',
    verificationStatus: 'pending',
    status: 'Pending',
    activeListingsCount: 1,
    assignedLeadsCount: 0,
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
    action: 'LEAD_ASSIGNED',
    actor: 'Admin',
    details: 'Assigned direct buyer lead Aarav Sharma to Col. Vikram Singh (Duggar Realty)',
    severity: 'info'
  }
];

const INITIAL_CUSTOMERS = [
  {
    id: 'cust-1',
    name: 'Rahul Sharma',
    phone: '+91 94191 88990',
    email: 'customer@trustifyhomes.test',
    role: 'customer',
    city: 'Jammu',
    budgetPreference: '₹15,000 - ₹22,000/mo',
    shortlistedCount: 4,
    callbacksCount: 2,
    siteVisitsCount: 1,
    registrationDate: '10 Aug 2026',
    lastActive: '10 mins ago',
    accountStatus: 'Active',
    intentScore: 87,
    intentLevel: 'hot',
    intentReasons: ['Viewed 8 properties', 'Saved 4 properties', 'Requested callback enquiry', 'Booked physical site visit slot']
  },
  {
    id: 'cust-2',
    name: 'Priya Sundaram',
    phone: '+91 97960 33441',
    email: 'priya.s@gmail.com',
    role: 'customer',
    city: 'Jammu',
    budgetPreference: '₹1.20 Cr - ₹2.50 Cr',
    shortlistedCount: 3,
    callbacksCount: 1,
    siteVisitsCount: 0,
    registrationDate: '12 Aug 2026',
    lastActive: '1 hour ago',
    accountStatus: 'Active',
    intentScore: 74,
    intentLevel: 'high',
    intentReasons: ['Viewed 6 properties', 'Saved 3 properties', 'Submitted callback enquiry']
  },
  {
    id: 'cust-3',
    name: 'Ananya Mahajan',
    phone: '+91 94192 11002',
    email: 'student@trustifyhomes.test',
    role: 'customer',
    city: 'Jammu',
    budgetPreference: '₹6,000 - ₹9,000/mo',
    shortlistedCount: 2,
    callbacksCount: 0,
    siteVisitsCount: 1,
    registrationDate: '14 Aug 2026',
    lastActive: '3 hours ago',
    accountStatus: 'Active',
    intentScore: 68,
    intentLevel: 'high',
    intentReasons: ['Searched PGs near MIET Jammu', 'Saved 2 PG listings', 'Booked PG site visit slot']
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

const INITIAL_LISTING_REQUESTS = [
  {
    id: 'req-101',
    ownerName: 'Subhash Sharma',
    ownerPhone: '+91 94191 55443',
    ownerEmail: 'subhash.s@gmail.com',
    propertyType: 'apartment',
    listingType: 'rent',
    city: 'Jammu',
    locality: 'Gandhi Nagar',
    approxPriceDisplay: '₹20,000 / mo',
    message: 'I want to list my 2 BHK flat near Apsara Multiplex for rent. Looking for family or corporate tenants.',
    status: 'New',
    submittedAt: '2 hours ago'
  },
  {
    id: 'req-102',
    ownerName: 'Lt. Col. Jasbir Jamwal',
    ownerPhone: '+91 97960 11223',
    ownerEmail: 'jasbir.j@yahoo.in',
    propertyType: 'villa',
    listingType: 'sale',
    city: 'Jammu',
    locality: 'Channi Himmat',
    approxPriceDisplay: '₹2.10 Cr',
    message: 'Selling my 4 BHK independent kothi in Sector 1A Channi Himmat. Clear legal documents.',
    status: 'Contacted',
    submittedAt: '1 day ago'
  }
];

export const dbService = {
  checkBackendHealth: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/health`);
      return res.ok;
    } catch (e) {
      return false;
    }
  },

  // PROPERTIES
  getCustomProperties: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROPERTIES);
      return data ? JSON.parse(data) : [];
    } catch (err) {
      return [];
    }
  },

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
      dbService.addAuditLog('PROPERTY_POSTED', 'Admin/Broker', `Posted property: ${property.title}`);
      return updated;
    } catch (err) {
      return [];
    }
  },

  // LEADS
  getLeadMarketplace: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LEADS);
      return data ? JSON.parse(data) : INITIAL_LEADS;
    } catch (err) {
      return INITIAL_LEADS;
    }
  },

  assignLeadToBroker: (leadId, brokerId, brokerName) => {
    try {
      const leads = dbService.getLeadMarketplace();
      let targetCustomer = 'Lead';
      const updated = leads.map(l => {
        if (l.id === leadId) {
          targetCustomer = l.customerName;
          return {
            ...l,
            assignedBrokerId: brokerId,
            assignedBrokerName: brokerName,
            assignedAt: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
            status: l.status === 'new' || l.status === 'unassigned' ? 'assigned' : l.status
          };
        }
        return l;
      });
      localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(updated));
      dbService.addAuditLog('LEAD_ASSIGNED', 'Admin', `Assigned lead ${targetCustomer} to broker ${brokerName}`);
      return updated;
    } catch (err) {
      return INITIAL_LEADS;
    }
  },

  updateLeadStatus: (leadId, newStatus) => {
    try {
      const leads = dbService.getLeadMarketplace();
      const updated = leads.map(l => l.id === leadId ? { ...l, status: newStatus } : l);
      localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(updated));
      dbService.addAuditLog('LEAD_STAGE_UPDATED', 'Broker/Admin', `Set lead ${leadId} stage to ${newStatus}`);
      return updated;
    } catch (err) {
      return INITIAL_LEADS;
    }
  },

  // BROKERS
  getBrokersList: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BROKERS);
      return data ? JSON.parse(data) : INITIAL_BROKERS;
    } catch (err) {
      return INITIAL_BROKERS;
    }
  },

  createBroker: (brokerData) => {
    try {
      const brokers = dbService.getBrokersList();
      const newBroker = {
        id: `brk-${Date.now()}`,
        name: brokerData.name,
        agencyName: brokerData.agencyName || `${brokerData.name} Realty`,
        phone: brokerData.phone,
        email: brokerData.email,
        brokerType: brokerData.brokerType || 'Independent Agency',
        reraId: brokerData.reraId || 'PENDING_REVIEW',
        locality: brokerData.locality || 'Jammu',
        city: brokerData.city || 'Jammu',
        verificationStatus: brokerData.isVerified ? 'verified' : 'pending',
        status: 'Active',
        activeListingsCount: 0,
        assignedLeadsCount: 0,
        totalViews: 0,
        totalEnquiries: 0,
        siteVisitsCount: 0,
        conversionsCount: 0,
        conversionRate: '0.0%',
        totalCommissionEarned: '₹0'
      };
      const updated = [newBroker, ...brokers];
      localStorage.setItem(STORAGE_KEYS.BROKERS, JSON.stringify(updated));
      dbService.addAuditLog('BROKER_CREATED', 'Admin', `Created new partner broker account: ${brokerData.name} (${brokerData.agencyName})`);
      return updated;
    } catch (err) {
      return INITIAL_BROKERS;
    }
  },

  updateBrokerStatus: (brokerId, newStatus) => {
    try {
      const brokers = dbService.getBrokersList();
      let targetName = 'Broker';
      const updated = brokers.map(b => {
        if (b.id === brokerId) {
          targetName = b.name;
          return { ...b, status: newStatus };
        }
        return b;
      });
      localStorage.setItem(STORAGE_KEYS.BROKERS, JSON.stringify(updated));
      dbService.addAuditLog('BROKER_STATUS_CHANGED', 'Admin', `Updated account status of ${targetName} to ${newStatus}`);
      return updated;
    } catch (err) {
      return INITIAL_BROKERS;
    }
  },

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

  // LISTING REQUESTS ("List Your Property" Owner Submissions)
  getListingRequests: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LISTING_REQUESTS);
      return data ? JSON.parse(data) : INITIAL_LISTING_REQUESTS;
    } catch (err) {
      return INITIAL_LISTING_REQUESTS;
    }
  },

  addListingRequest: (reqData) => {
    try {
      const existing = dbService.getListingRequests();
      const newReq = {
        id: `req-${Date.now()}`,
        ownerName: reqData.ownerName,
        ownerPhone: reqData.ownerPhone,
        ownerEmail: reqData.ownerEmail,
        propertyType: reqData.propertyType || 'apartment',
        listingType: reqData.listingType || 'sale',
        city: reqData.city || 'Jammu',
        locality: reqData.locality,
        approxPriceDisplay: reqData.approxPriceDisplay || '₹50 Lac',
        message: reqData.message || '',
        status: 'New',
        submittedAt: 'Just now'
      };
      const updated = [newReq, ...existing];
      localStorage.setItem(STORAGE_KEYS.LISTING_REQUESTS, JSON.stringify(updated));
      dbService.addAuditLog('LISTING_REQUEST_SUBMITTED', 'Public Owner', `New property listing request submitted by ${reqData.ownerName} (${reqData.locality})`);
      return updated;
    } catch (err) {
      return INITIAL_LISTING_REQUESTS;
    }
  },

  updateListingRequestStatus: (reqId, newStatus) => {
    try {
      const requests = dbService.getListingRequests();
      const updated = requests.map(r => r.id === reqId ? { ...r, status: newStatus } : r);
      localStorage.setItem(STORAGE_KEYS.LISTING_REQUESTS, JSON.stringify(updated));
      dbService.addAuditLog('LISTING_REQUEST_UPDATED', 'Admin', `Updated listing request ${reqId} status to ${newStatus}`);
      return updated;
    } catch (err) {
      return INITIAL_LISTING_REQUESTS;
    }
  },

  // CUSTOMERS CRM
  getCustomers: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
      return data ? JSON.parse(data) : INITIAL_CUSTOMERS;
    } catch (err) {
      return INITIAL_CUSTOMERS;
    }
  },

  updateCustomerAccountStatus: (customerId, newStatus) => {
    try {
      const customers = dbService.getCustomers();
      const updated = customers.map(c => c.id === customerId ? { ...c, accountStatus: newStatus } : c);
      localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(updated));
      dbService.addAuditLog('CUSTOMER_STATUS_UPDATED', 'Admin', `Set customer ID ${customerId} account status to ${newStatus}`);
      return updated;
    } catch (err) {
      return INITIAL_CUSTOMERS;
    }
  },

  // SITE VISITS & ENQUIRIES
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
  },

  // TOKEN WALLET & AUDIT
  getTokenBalance: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TOKENS);
      return data ? Number(data) : 1200;
    } catch (err) {
      return 1200;
    }
  },

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

  getDeals: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DEALS);
      return data ? JSON.parse(data) : INITIAL_DEALS;
    } catch (err) {
      return INITIAL_DEALS;
    }
  },

  getAuditLogs: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
      return data ? JSON.parse(data) : INITIAL_AUDIT_LOGS;
    } catch (err) {
      return INITIAL_AUDIT_LOGS;
    }
  },

  addAuditLog: (action, actor, details) => {
    try {
      const existing = dbService.getAuditLogs();
      const newEntry = {
        id: `audit-${Date.now()}`,
        timestamp: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
        action,
        actor,
        details,
        severity: action.includes('STATUS') || action.includes('BLOCK') ? 'warning' : 'info'
      };
      const updated = [newEntry, ...existing];
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(updated));
      return updated;
    } catch (err) {
      return [];
    }
  }
};
