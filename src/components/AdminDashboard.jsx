import React, { useState } from 'react';
import { 
  ShieldAlert, 
  CheckCircle, 
  XCircle, 
  Building2, 
  Users, 
  ShieldCheck, 
  PlusCircle, 
  Eye, 
  Trash2,
  Check,
  Ban,
  RotateCcw,
  Send,
  FileText,
  Clock,
  Briefcase,
  TrendingUp,
  Activity,
  Flame,
  ArrowRight,
  Info,
  X,
  User,
  LayoutDashboard,
  BarChart3,
  Building,
  Home,
  MessageSquare,
  Calendar,
  CreditCard,
  Bell,
  Settings,
  AlertTriangle,
  CheckSquare,
  FileCheck,
  Search,
  Filter,
  UserX,
  UserCheck,
  Sparkles
} from 'lucide-react';
import { dbService } from '../services/dbService';
import { leadIntelligenceService } from '../services/leadIntelligenceService';

export default function AdminDashboard({ 
  properties, 
  onSelectProperty, 
  onOpenPostProperty,
  activeTab: externalActiveTab,
  setActiveTab: externalSetActiveTab 
}) {
  const [internalActiveTab, setInternalActiveTab] = useState('home'); // home | statistics | customers | properties | pg | brokers | leads | enquiries | site_visits | verification | reports | payments | notifications | settings

  const activeTab = externalActiveTab !== undefined ? externalActiveTab : internalActiveTab;
  const setActiveTab = externalSetActiveTab !== undefined ? externalSetActiveTab : setInternalActiveTab;

  // State Stores
  const [brokersList, setBrokersList] = useState(() => dbService.getBrokersList());
  const [propertyList, setPropertyList] = useState(properties);
  const [leadList, setLeadList] = useState(() => dbService.getLeadMarketplace());
  const [dealsList, setDealsList] = useState(() => dbService.getDeals());
  const [auditLogs, setAuditLogs] = useState(() => dbService.getAuditLogs());
  const [customersList, setCustomersList] = useState(() => dbService.getCustomers());
  const [potentialCustomers, setPotentialCustomers] = useState(() => leadIntelligenceService.getPotentialCustomers());
  const [assignedLeads, setAssignedLeads] = useState(() => leadIntelligenceService.getAssignedBrokerLeads());
  const [siteVisits, setSiteVisits] = useState(() => dbService.getSiteVisits());
  const [enquiriesList, setEnquiriesList] = useState(() => dbService.getEnquiriesList());

  const [statusMessage, setStatusMessage] = useState('');

  // Filtering States
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [customerRoleFilter, setCustomerRoleFilter] = useState('all'); // all | buyer | owner | broker | student
  const [propertyStatusFilter, setPropertyStatusFilter] = useState('all'); // all | pending | approved | rejected | suspended

  // Modal States
  const [selectedScoreCustomer, setSelectedScoreCustomer] = useState(null);
  const [assigningCustomer, setAssigningCustomer] = useState(null);
  const [recommendedBrokers, setRecommendedBrokers] = useState([]);
  const [selectedBrokerId, setSelectedBrokerId] = useState('');
  const [assignAdminNote, setAssignAdminNote] = useState('');
  const [assignPriority, setAssignPriority] = useState('high');

  // Customer Detail Modal
  const [selectedCustomerDetail, setSelectedCustomerDetail] = useState(null);

  // Broker Detail Modal
  const [selectedBrokerDetail, setSelectedBrokerDetail] = useState(null);

  // Action Handlers
  const handleToggleBlacklist = (brokerId) => {
    const updated = dbService.toggleBrokerBlacklist(brokerId);
    setBrokersList(updated);
    setAuditLogs(dbService.getAuditLogs());
    setStatusMessage('Broker account status updated!');
    setTimeout(() => setStatusMessage(''), 2500);
  };

  const handleVerifyBrokerRera = (brokerId, isVerified) => {
    const updated = dbService.verifyBrokerRera(brokerId, isVerified);
    setBrokersList(updated);
    setAuditLogs(dbService.getAuditLogs());
    setStatusMessage(isVerified ? 'Broker RERA verified successfully!' : 'Broker verification rejected');
    setTimeout(() => setStatusMessage(''), 2500);
  };

  const handleUpdateCustomerAccountStatus = (customerId, newStatus) => {
    const updated = dbService.updateCustomerAccountStatus(customerId, newStatus);
    setCustomersList(updated);
    if (selectedCustomerDetail) setSelectedCustomerDetail({ ...selectedCustomerDetail, accountStatus: newStatus });
    setStatusMessage(`Customer account status updated to ${newStatus}`);
    setTimeout(() => setStatusMessage(''), 2500);
  };

  const handleUpdatePropertyApproval = (propId, newStatus) => {
    const updated = propertyList.map(p => p.id === propId ? { ...p, status: newStatus } : p);
    setPropertyList(updated);
    dbService.addAuditLog('PROPERTY_STATUS_CHANGED', 'Admin', `Property ID ${propId} set to ${newStatus}`);
    setAuditLogs(dbService.getAuditLogs());
    setStatusMessage(`Property status set to ${newStatus}`);
    setTimeout(() => setStatusMessage(''), 2500);
  };

  const handleOpenAssignModal = (customer) => {
    if (!customer) return;
    setAssigningCustomer(customer);
    const recs = leadIntelligenceService.recommendBrokersForLead({
      city: customer.city || 'Jammu',
      locality: customer.locality || 'Gandhi Nagar',
      propertyType: customer.propertyType || 'apartment'
    });
    const safeRecs = Array.isArray(recs) ? recs : [];
    setRecommendedBrokers(safeRecs);
    if (safeRecs.length > 0) setSelectedBrokerId(safeRecs[0].id);
    setAssignAdminNote(`Potential customer for ${customer.locality || 'Jammu'} ${customer.propertyType || 'property'} (${customer.budgetDisplay || 'Standard'}). Intent score: ${customer.score || 75}/100.`);
  };

  const handleConfirmAssignLead = (e) => {
    e.preventDefault();
    if (!assigningCustomer || !selectedBrokerId) return;

    const updatedAssigned = leadIntelligenceService.assignLeadToBroker({
      customerId: assigningCustomer.userId,
      brokerId: selectedBrokerId,
      propertyTitle: `${assigningCustomer.locality} ${assigningCustomer.propertyType}`,
      adminNote: assignAdminNote,
      priority: assignPriority
    });

    setAssignedLeads(updatedAssigned);
    setAuditLogs(dbService.getAuditLogs());
    setAssigningCustomer(null);
    setStatusMessage(`Successfully assigned ${assigningCustomer.fullName} to selected broker!`);
    setTimeout(() => setStatusMessage(''), 2500);
  };

  // Filtered Lists
  const filteredCustomers = customersList.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(customerSearchTerm.toLowerCase()) || 
                          c.email.toLowerCase().includes(customerSearchTerm.toLowerCase()) || 
                          c.phone.includes(customerSearchTerm);
    const matchesRole = customerRoleFilter === 'all' || c.role === customerRoleFilter;
    return matchesSearch && matchesRole;
  });

  const filteredProperties = propertyList.filter(p => {
    if (propertyStatusFilter === 'all') return true;
    if (propertyStatusFilter === 'pending') return p.status === 'Pending';
    if (propertyStatusFilter === 'approved') return p.status === 'Approved' || !p.status;
    if (propertyStatusFilter === 'rejected') return p.status === 'Rejected';
    if (propertyStatusFilter === 'suspended') return p.status === 'Suspended';
    return true;
  });

  const pendingVerificationItems = [
    ...brokersList.filter(b => b.verificationStatus === 'pending').map(b => ({ type: 'broker', title: b.agencyName, subtitle: `RERA: ${b.reraId}`, id: b.id })),
    ...propertyList.filter(p => p.status === 'Pending').map(p => ({ type: 'property', title: p.title, subtitle: `${p.locality}, ${p.city}`, id: p.id }))
  ];

  const handleSendLeadToMarketplace = (customer, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const newMarketplaceLead = {
      id: `lead-mk-${Date.now()}`,
      buyerName: customer.fullName,
      buyerPhone: customer.phone || '+91 94191 88990',
      locality: customer.locality,
      city: customer.city || 'Jammu',
      propertyType: customer.propertyType,
      budgetDisplay: customer.budgetDisplay,
      priceVal: customer.budgetMax || 15000000,
      expectedCommissionRate: '1.5%',
      estimatedCommissionVal: '₹2.50 Lac',
      leadPriceTokens: customer.score >= 80 ? 500 : 350,
      isPurchased: false,
      purchasedBy: null,
      inquiryDate: 'Just now',
      note: `High-intent customer (${customer.score}/100 intent score) seeking ${customer.locality} ${customer.propertyType}.`
    };

    dbService.adminPostLead(newMarketplaceLead);
    dbService.addAuditLog('LEAD_POSTED_TO_MARKETPLACE', 'Admin', `Published lead for ${customer.fullName} to open Marketplace`);
    setAuditLogs(dbService.getAuditLogs());
    setStatusMessage(`Published ${customer.fullName}'s lead to the open Broker Lead Marketplace!`);
    setTimeout(() => setStatusMessage(''), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Admin Master Header Banner */}
      <div className="bg-purple-950 text-white rounded-xl p-5 shadow-md border border-purple-900 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-purple-600 text-white p-3 rounded-xl">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">Trustify Homes Platform Control Center</h2>
              <span className="bg-purple-600 text-white text-xs font-bold px-2 py-0.5 rounded">
                Master Admin
              </span>
            </div>
            <p className="text-xs text-purple-200 mt-1">
              Complete Business Operations • Statistics • Customers • Moderation • Verification Queue • Audits
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={onOpenPostProperty}
            className="ez-btn-outline border-purple-400 text-white hover:bg-purple-900 font-bold text-xs py-2 px-3"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post Admin Listing</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="bg-emerald-50 text-emerald-800 border border-emerald-300 px-4 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}



      {/* MODULE 1: ADMIN HOME OVERVIEW */}
      {activeTab === 'home' && (
        <div className="space-y-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Customers</span>
              <div className="text-2xl font-extrabold text-slate-900 mt-1">4,820</div>
              <span className="text-[10px] text-emerald-600 font-semibold mt-1 block">+124 this week</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">Properties</span>
              <div className="text-2xl font-extrabold text-emerald-700 mt-1">{propertyList.length + 1200}</div>
              <span className="text-[10px] text-slate-500 mt-1 block">1,180 Approved</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider block">Brokers</span>
              <div className="text-2xl font-extrabold text-purple-800 mt-1">{brokersList.length + 80}</div>
              <span className="text-[10px] text-purple-600 font-semibold mt-1 block">88% RERA Verified</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider block">PG Listings</span>
              <div className="text-2xl font-extrabold text-rose-700 mt-1">412</div>
              <span className="text-[10px] text-slate-500 mt-1 block">Students & Girls PGs</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider block flex items-center gap-1">
                <Flame className="w-3 h-3 text-red-600 fill-red-600" /> Hot Leads
              </span>
              <div className="text-2xl font-extrabold text-red-600 mt-1">{potentialCustomers.filter(c => c.score >= 80).length + 60}</div>
              <span className="text-[10px] text-slate-500 mt-1 block">Ready Homebuyers</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block">Pending Review</span>
              <div className="text-2xl font-extrabold text-amber-700 mt-1">{pendingVerificationItems.length + 22}</div>
              <span className="text-[10px] text-amber-600 font-semibold mt-1 block">Requires Admin Moderation</span>
            </div>
          </div>

          {/* Activity Feeds */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
              <h4 className="text-sm font-extrabold text-slate-900 pb-2 border-b border-slate-200">
                Recent System Activity
              </h4>
              <div className="space-y-2 text-xs">
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded flex justify-between">
                  <span>New Broker Registration: <strong>Col. Vikram Singh (Duggar Realty)</strong></span>
                  <span className="text-[10px] text-slate-400">10 mins ago</span>
                </div>
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded flex justify-between">
                  <span>High-Intent Lead Identified: <strong>Rahul Sharma (Gandhi Nagar)</strong></span>
                  <span className="text-[10px] text-slate-400">25 mins ago</span>
                </div>
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded flex justify-between">
                  <span>Site Visit Requested: <strong>Girls PG Channi Himmat</strong></span>
                  <span className="text-[10px] text-slate-400">1 hour ago</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
              <h4 className="text-sm font-extrabold text-slate-900 pb-2 border-b border-slate-200">
                Pending Verification Queue
              </h4>
              <div className="space-y-2 text-xs">
                {pendingVerificationItems.map((item, idx) => (
                  <div key={idx} className="p-2.5 bg-amber-50/60 border border-amber-200 rounded flex items-center justify-between">
                    <div>
                      <div className="font-extrabold text-slate-900">{item.title}</div>
                      <div className="text-[11px] text-slate-600">{item.subtitle}</div>
                    </div>
                    <button 
                      onClick={() => setActiveTab('verification')}
                      className="px-2.5 py-1 bg-purple-950 text-white rounded text-[10px] font-bold"
                    >
                      Review
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODULE 2: PLATFORM STATISTICS (/admin/statistics) */}
      {activeTab === 'statistics' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-6">
            <h3 className="text-base font-extrabold text-slate-900 pb-3 border-b border-slate-200">
              Platform Analytics & User Statistics
            </h3>

            {/* User Statistics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs font-semibold">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <span className="text-slate-400 uppercase text-[10px] block">Buyers & Tenants</span>
                <span className="text-2xl font-extrabold text-brand-700">3,420 Users</span>
                <span className="text-[10px] text-slate-500 mt-1 block">71% of total user base</span>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <span className="text-slate-400 uppercase text-[10px] block">Students (PG Seekers)</span>
                <span className="text-2xl font-extrabold text-emerald-700">890 Students</span>
                <span className="text-[10px] text-slate-500 mt-1 block">18% of total user base</span>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <span className="text-slate-400 uppercase text-[10px] block">Property Owners</span>
                <span className="text-2xl font-extrabold text-amber-700">427 Owners</span>
                <span className="text-[10px] text-slate-500 mt-1 block">Direct zero-fee listings</span>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <span className="text-slate-400 uppercase text-[10px] block">Verified Brokers</span>
                <span className="text-2xl font-extrabold text-purple-800">83 Agencies</span>
                <span className="text-[10px] text-slate-500 mt-1 block">88% RERA Verified</span>
              </div>
            </div>

            {/* Lead Funnel Statistics */}
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Overall Platform Lead Funnel</h4>
              <div className="space-y-2 text-xs font-bold">
                <div className="flex items-center gap-3">
                  <span className="w-32 text-slate-600">Potential Customers</span>
                  <div className="flex-1 bg-slate-200 h-5 rounded overflow-hidden">
                    <div className="bg-slate-800 h-full text-white text-[10px] px-2 flex items-center" style={{ width: '100%' }}>126 Customers</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-32 text-slate-600">Assigned Leads</span>
                  <div className="flex-1 bg-slate-200 h-5 rounded overflow-hidden">
                    <div className="bg-blue-600 h-full text-white text-[10px] px-2 flex items-center" style={{ width: '65%' }}>82 Leads</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-32 text-slate-600">Site Visits</span>
                  <div className="flex-1 bg-slate-200 h-5 rounded overflow-hidden">
                    <div className="bg-purple-600 h-full text-white text-[10px] px-2 flex items-center" style={{ width: '38%' }}>48 Visits</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-32 text-slate-600">Converted Deals</span>
                  <div className="flex-1 bg-slate-200 h-5 rounded overflow-hidden">
                    <div className="bg-emerald-600 h-full text-white text-[10px] px-2 flex items-center" style={{ width: '22%' }}>28 Deals (22.2%)</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Revenue Analytics Placeholder */}
            <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 text-amber-900 text-xs font-semibold">
              <strong>Revenue Analytics Note:</strong> Financial and transaction revenue statistics will automatically activate when platform monetization features (featured listings & lead packs) are launched.
            </div>
          </div>
        </div>
      )}

      {/* MODULE 3: CUSTOMER MANAGEMENT (/admin/customers) */}
      {activeTab === 'customers' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-200">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Customer & Account Directory</h3>
              <p className="text-xs text-slate-500">Manage buyers, tenants, and verified real estate brokers</p>
            </div>

            {/* Search & Role Filters */}
            <div className="flex flex-wrap gap-2 text-xs">
              <input 
                type="text" 
                placeholder="Search name, phone, email..."
                value={customerSearchTerm}
                onChange={(e) => setCustomerSearchTerm(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded px-3 py-1.5 font-semibold text-slate-900 text-xs"
              />
              <select
                value={customerRoleFilter}
                onChange={(e) => setCustomerRoleFilter(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded px-3 py-1.5 font-bold text-slate-900 text-xs"
              >
                <option value="all">All Roles</option>
                <option value="buyer">Buyers / Tenants</option>
                <option value="broker">Brokers / Agencies</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="pb-3 font-bold">Customer Name</th>
                  <th className="pb-3 font-bold">Role & City</th>
                  <th className="pb-3 font-bold">Contact Details</th>
                  <th className="pb-3 font-bold">Intent Score</th>
                  <th className="pb-3 font-bold">Account Status</th>
                  <th className="pb-3 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                {filteredCustomers.map((cust) => (
                  <tr key={cust.id} className="hover:bg-slate-50">
                    <td className="py-3">
                      <div className="font-extrabold text-slate-900">{cust.name}</div>
                      <div className="text-[11px] text-slate-500">Last active {cust.lastActive}</div>
                    </td>
                    <td className="py-3">
                      <span className="uppercase text-[10px] font-extrabold bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                        {cust.role}
                      </span>
                      <div className="text-[11px] text-slate-500 mt-0.5">{cust.city}</div>
                    </td>
                    <td className="py-3">
                      <div>{cust.phone}</div>
                      <div className="text-[11px] text-slate-500">{cust.email}</div>
                    </td>
                    <td className="py-3">
                      <span className="bg-red-100 text-red-800 text-[10px] font-extrabold px-2 py-0.5 rounded">
                        Score: {cust.intentScore || 75}/100
                      </span>
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        cust.accountStatus === 'Suspended' ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {cust.accountStatus || 'Active'}
                      </span>
                    </td>
                    <td className="py-3 text-right space-x-1">
                      <button
                        onClick={() => setSelectedCustomerDetail(cust)}
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-bold"
                      >
                        Details
                      </button>
                      <button
                        onClick={() => handleUpdateCustomerAccountStatus(cust.id, cust.accountStatus === 'Suspended' ? 'Active' : 'Suspended')}
                        className={`px-2 py-1 rounded font-bold ${
                          cust.accountStatus === 'Suspended' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                        }`}
                      >
                        {cust.accountStatus === 'Suspended' ? 'Unsuspend' : 'Suspend'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CUSTOMER DETAIL MODAL */}
      {selectedCustomerDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <h3 className="text-base font-extrabold text-slate-900">Customer Profile — {selectedCustomerDetail.name}</h3>
              <button onClick={() => setSelectedCustomerDetail(null)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 font-semibold text-slate-700">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-400 text-[10px] block uppercase">Role</span>
                  <span className="font-extrabold uppercase text-brand-700">{selectedCustomerDetail.role}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block uppercase">Account Status</span>
                  <span className="font-extrabold text-emerald-700">{selectedCustomerDetail.accountStatus || 'Active'}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block uppercase">Phone</span>
                  <span>{selectedCustomerDetail.phone}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block uppercase">Email</span>
                  <span>{selectedCustomerDetail.email}</span>
                </div>
              </div>

              <div className="bg-red-50 p-3 rounded-lg border border-red-200 flex justify-between items-center">
                <div>
                  <span className="text-red-900 font-extrabold text-sm block">Customer Intent Score</span>
                  <span className="text-slate-600 text-[11px]">Calculated from first-party in-app activity</span>
                </div>
                <span className="text-xl font-extrabold text-red-600">{selectedCustomerDetail.intentScore || 87}/100</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODULE 4: PROPERTY MODERATION (/admin/properties) */}
      {activeTab === 'properties' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-200">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Platform Property Moderation ({filteredProperties.length})</h3>
              <p className="text-xs text-slate-500">Approve, reject, feature, or suspend real estate listings</p>
            </div>

            <div className="flex gap-1.5 text-xs font-bold">
              {['all', 'pending', 'approved', 'rejected', 'suspended'].map(filterKey => (
                <button
                  key={filterKey}
                  onClick={() => setPropertyStatusFilter(filterKey)}
                  className={`px-3 py-1 rounded text-[10px] uppercase ${
                    propertyStatusFilter === filterKey ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {filterKey}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {filteredProperties.map(prop => (
              <div key={prop.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-wrap items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3">
                  <img src={prop.image} alt={prop.title} className="w-14 h-14 rounded object-cover border border-slate-200" />
                  <div>
                    <h4 className="font-extrabold text-slate-900">{prop.title}</h4>
                    <p className="text-slate-600">{prop.locality}, Jammu • <strong className="text-emerald-700">{prop.price || prop.priceDisplay}</strong></p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                    prop.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                    prop.status === 'Rejected' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-900'
                  }`}>
                    {prop.status || 'Approved'}
                  </span>

                  <button 
                    onClick={() => handleUpdatePropertyApproval(prop.id, 'Approved')}
                    className="px-2.5 py-1 bg-emerald-600 text-white rounded font-bold text-[11px]"
                  >
                    Approve
                  </button>
                  <button 
                    onClick={() => handleUpdatePropertyApproval(prop.id, 'Rejected')}
                    className="px-2.5 py-1 bg-red-600 text-white rounded font-bold text-[11px]"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODULE 5: BROKER MANAGEMENT & VERIFICATION (/admin/brokers) */}
      {activeTab === 'brokers' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h3 className="text-base font-extrabold text-slate-900">Broker & Agency Registry</h3>
            <span className="text-xs font-bold text-slate-500">{brokersList.length} Registered Agencies</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="pb-3 font-bold">Broker Agency</th>
                  <th className="pb-3 font-bold">RERA Number</th>
                  <th className="pb-3 font-bold">RERA Status</th>
                  <th className="pb-3 font-bold">Account Status</th>
                  <th className="pb-3 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                {brokersList.map(b => (
                  <tr key={b.id}>
                    <td className="py-3">
                      <div className="font-extrabold text-slate-900">{b.name}</div>
                      <div className="text-[11px] text-slate-500">{b.agencyName} ({b.locality})</div>
                    </td>
                    <td className="py-3 font-mono text-emerald-800">{b.reraId}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                        b.verificationStatus === 'verified' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                      }`}>
                        {b.verificationStatus || 'verified'}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                        b.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3 text-right space-x-1">
                      <button
                        onClick={() => handleVerifyBrokerRera(b.id, b.verificationStatus !== 'verified')}
                        className="px-2 py-1 bg-emerald-50 text-emerald-800 rounded font-bold"
                      >
                        {b.verificationStatus === 'verified' ? 'Revoke RERA' : 'Verify RERA'}
                      </button>
                      <button
                        onClick={() => handleToggleBlacklist(b.id)}
                        className={`px-2 py-1 rounded font-bold ${
                          b.status === 'Active' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        {b.status === 'Active' ? 'Blacklist' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODULE 6: LEAD INTELLIGENCE (/admin/leads) */}
      {activeTab === 'leads' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200 mb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Flame className="w-5 h-5 text-red-600 fill-red-600" />
                  First-Party Customer Intent Leaderboard
                </h3>
                <p className="text-xs text-slate-500">Recency-weighted 0-100 score calculated from in-app search, view & save events</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[10px]">
                    <th className="pb-3 font-bold">Potential Customer</th>
                    <th className="pb-3 font-bold">Intent Score & Level</th>
                    <th className="pb-3 font-bold">Requirement</th>
                    <th className="pb-3 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                  {potentialCustomers && potentialCustomers.map((cust) => (
                    <tr key={cust.userId || cust.id || Math.random()} className="hover:bg-slate-50">
                      <td className="py-3">
                        <div className="font-extrabold text-slate-900">{cust.fullName || cust.name || 'Customer'} ({cust.role || 'buyer'})</div>
                        <div className="text-[11px] text-slate-500">{cust.city || 'Jammu'} • Last active {cust.lastActivityAt || 'Recently'}</div>
                      </td>
                      <td className="py-3">
                        <span className="bg-red-100 text-red-800 text-xs font-extrabold px-2.5 py-1 rounded">
                          Score: {cust.score !== undefined ? cust.score : 75}/100
                        </span>
                      </td>
                      <td className="py-3">
                        <div>{cust.locality || 'Jammu'} ({(cust.propertyType || 'property').toUpperCase()})</div>
                        <div className="text-[11px] text-slate-500">{cust.budgetDisplay || 'Standard Budget'}</div>
                      </td>
                      <td className="py-3 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleOpenAssignModal(cust);
                          }}
                          className="px-2.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded font-bold text-[11px] inline-flex items-center gap-1 shadow-xs"
                          title="Assign lead directly to a specific verified broker"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Send to Specified Broker</span>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleSendLeadToMarketplace(cust, e);
                          }}
                          className="px-2.5 py-1.5 bg-purple-950 hover:bg-purple-900 text-white rounded font-bold text-[11px] inline-flex items-center gap-1 shadow-xs"
                          title="Publish lead to the open Marketplace for all brokers to unlock"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-purple-300" />
                          <span>Send to Marketplace</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODULE 7: VERIFICATION QUEUE (/admin/verification) */}
      {activeTab === 'verification' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <h3 className="text-base font-extrabold text-slate-900 pb-3 border-b border-slate-200">
            Pending Verification Center ({pendingVerificationItems.length})
          </h3>
          <div className="space-y-3">
            {pendingVerificationItems.map((item, idx) => (
              <div key={idx} className="p-4 bg-amber-50/60 border border-amber-200 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] font-extrabold uppercase bg-amber-200 text-amber-900 px-2 py-0.5 rounded">
                    {item.type} verification
                  </span>
                  <h4 className="font-extrabold text-slate-900 text-sm mt-1">{item.title}</h4>
                  <p className="text-slate-600">{item.subtitle}</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      if (item.type === 'broker') handleVerifyBrokerRera(item.id, true);
                      else handleUpdatePropertyApproval(item.id, 'Approved');
                    }}
                    className="px-3 py-1.5 bg-emerald-600 text-white rounded font-bold"
                  >
                    Approve
                  </button>
                  <button 
                    onClick={() => {
                      if (item.type === 'broker') handleVerifyBrokerRera(item.id, false);
                      else handleUpdatePropertyApproval(item.id, 'Rejected');
                    }}
                    className="px-3 py-1.5 bg-red-600 text-white rounded font-bold"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODULE 8: PAYMENTS ARCHITECTURE (/admin/payments) */}
      {activeTab === 'payments' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4 text-xs font-semibold text-slate-700 max-w-2xl">
          <h3 className="text-base font-extrabold text-slate-900 pb-3 border-b border-slate-200 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-amber-600" />
            Monetization & Payments Architecture
          </h3>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <p className="text-slate-700">
              Revenue analytics and transaction ledger will activate when public monetization features are enabled.
            </p>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <div className="bg-white p-2.5 rounded border border-slate-200">
                <span className="font-bold text-slate-900 block">Broker Lead Packs</span>
                <span className="text-[11px] text-slate-500">₹2,500 – ₹10,000</span>
              </div>
              <div className="bg-white p-2.5 rounded border border-slate-200">
                <span className="font-bold text-slate-900 block">Featured Listing Slots</span>
                <span className="text-[11px] text-slate-500">₹999 / listing</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODULE 9: SETTINGS & AUDIT LOGS (/admin/settings) */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <h3 className="text-base font-extrabold text-slate-900 pb-3 border-b border-slate-200">
            System Action Audit Logs
          </h3>
          <div className="space-y-2">
            {auditLogs.map(log => (
              <div key={log.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs flex justify-between items-start gap-4">
                <div>
                  <div className="font-extrabold text-slate-900">{log.action} — <span className="text-slate-600 font-normal">{log.actor}</span></div>
                  <div className="text-slate-600 mt-0.5">{log.details}</div>
                </div>
                <span className="text-[10px] text-slate-400 shrink-0">{log.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SEND LEAD TO BROKER MODAL */}
      {assigningCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative text-xs font-semibold text-slate-700">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <h3 className="text-base font-extrabold text-slate-900">Assign Lead to Verified Broker</h3>
              <button onClick={() => setAssigningCustomer(null)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmAssignLead} className="space-y-4">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div className="font-extrabold text-slate-900">{assigningCustomer?.fullName || assigningCustomer?.name || 'Customer'}</div>
                <div className="text-[11px] text-slate-600">
                  {assigningCustomer?.locality || 'Jammu'} ({(assigningCustomer?.propertyType || 'property').toUpperCase()}) • Budget: {assigningCustomer?.budgetDisplay || 'Standard'}
                </div>
              </div>

              <div>
                <label className="block text-slate-500 uppercase tracking-wider mb-1 text-[10px]">Select Broker</label>
                <select
                  value={selectedBrokerId}
                  onChange={(e) => setSelectedBrokerId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded p-2 font-bold text-slate-900"
                >
                  {recommendedBrokers.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.agencyName}) — {b.locality}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs py-3 rounded uppercase"
                >
                  Confirm Direct Assignment
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleSendLeadToMarketplace(assigningCustomer);
                    setAssigningCustomer(null);
                  }}
                  className="flex-1 bg-purple-950 hover:bg-purple-900 text-white font-extrabold text-xs py-3 rounded uppercase flex items-center justify-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-300" />
                  <span>Send to Marketplace</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
