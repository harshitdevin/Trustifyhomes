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
  Sparkles,
  Award,
  ChevronRight,
  Inbox,
  UserPlus,
  Edit,
  Key
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
  const [internalActiveTab, setInternalActiveTab] = useState('home'); 

  const activeTab = externalActiveTab !== undefined ? externalActiveTab : internalActiveTab;
  const setActiveTab = externalSetActiveTab !== undefined ? externalSetActiveTab : setInternalActiveTab;

  // State Stores
  const [brokersList, setBrokersList] = useState(() => dbService.getBrokersList());
  const [propertyList, setPropertyList] = useState(properties);
  const [leadList, setLeadList] = useState(() => dbService.getLeadMarketplace());
  const [auditLogs, setAuditLogs] = useState(() => dbService.getAuditLogs());
  const [customersList, setCustomersList] = useState(() => dbService.getCustomers());
  const [siteVisits, setSiteVisits] = useState(() => dbService.getSiteVisits());
  const [enquiriesList, setEnquiriesList] = useState(() => dbService.getEnquiriesList());
  const [listingRequestsList, setListingRequestsList] = useState(() => dbService.getListingRequests());

  const [statusMessage, setStatusMessage] = useState('');

  // Filtering States
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [customerStatusFilter, setCustomerStatusFilter] = useState('all'); 
  const [propertyStatusFilter, setPropertyStatusFilter] = useState('all'); 
  const [brokerStatusFilter, setBrokerStatusFilter] = useState('all');
  const [leadStageFilter, setLeadStageFilter] = useState('all');

  // Modals & Action States
  const [selectedCustomerDetail, setSelectedCustomerDetail] = useState(null);
  const [selectedBrokerDetail, setSelectedBrokerDetail] = useState(null);
  const [isCreateBrokerOpen, setIsCreateBrokerOpen] = useState(false);
  const [assigningLead, setAssigningLead] = useState(null);

  // New Broker Form State
  const [newBrokerName, setNewBrokerName] = useState('');
  const [newBrokerAgency, setNewBrokerAgency] = useState('');
  const [newBrokerPhone, setNewBrokerPhone] = useState('');
  const [newBrokerEmail, setNewBrokerEmail] = useState('');
  const [newBrokerRera, setNewBrokerRera] = useState('');
  const [newBrokerLocality, setNewBrokerLocality] = useState('');

  // Lead Assignment Form State
  const [assignBrokerId, setAssignBrokerId] = useState('');
  const [assignPriority, setAssignPriority] = useState('high');
  const [assignAdminNote, setAssignAdminNote] = useState('');

  // Calculated Real Summary Metrics (Zero Hardcoded Numbers)
  const totalCustomersCount = customersList.length;
  const activeCustomersCount = customersList.filter(c => c.accountStatus === 'Active' || !c.accountStatus).length;
  const totalBrokersCount = brokersList.length;
  const verifiedBrokersCount = brokersList.filter(b => b.verificationStatus === 'verified').length;
  const pendingBrokersCount = brokersList.filter(b => b.verificationStatus === 'pending' || b.status === 'Pending').length;
  
  const totalPropertiesCount = propertyList.length;
  const activePropertiesCount = propertyList.filter(p => p.status === 'Approved' || p.status === 'approved' || !p.status).length;
  const pgListingsCount = propertyList.filter(p => p.listingType === 'pg' || p.propertyType === 'pg').length;
  const activePgCount = propertyList.filter(p => (p.listingType === 'pg' || p.propertyType === 'pg') && (p.status === 'Approved' || p.status === 'approved' || !p.status)).length;
  
  const totalLeadsCount = leadList.length;
  const highIntentLeadsCount = leadList.filter(l => l.priority === 'high' || l.priority === 'urgent' || (l.intentScore && l.intentScore >= 70)).length;
  const openEnquiriesCount = enquiriesList.filter(e => e.status === 'New' || e.status === 'Contacted').length;
  const pendingVisitsCount = siteVisits.filter(v => v.status === 'Requested').length;
  const pendingRequestsCount = listingRequestsList.filter(r => r.status === 'New').length;

  // Actions
  const handleUpdateCustomerStatus = (customerId, newStatus) => {
    const updated = dbService.updateCustomerAccountStatus(customerId, newStatus);
    setCustomersList(updated);
    if (selectedCustomerDetail && selectedCustomerDetail.id === customerId) {
      setSelectedCustomerDetail({ ...selectedCustomerDetail, accountStatus: newStatus });
    }
    setStatusMessage(`Customer account status updated to ${newStatus}`);
    setTimeout(() => setStatusMessage(''), 2500);
  };

  const handleCreateBroker = (e) => {
    e.preventDefault();
    if (!newBrokerName || !newBrokerPhone || !newBrokerEmail) {
      alert('Please fill in required broker details.');
      return;
    }
    const updated = dbService.createBroker({
      name: newBrokerName,
      agencyName: newBrokerAgency || `${newBrokerName} Realty`,
      phone: newBrokerPhone,
      email: newBrokerEmail,
      reraId: newBrokerRera || 'JKRERA/JM/AGENT/2026',
      locality: newBrokerLocality || 'Jammu',
      isVerified: true
    });
    setBrokersList(updated);
    setIsCreateBrokerOpen(false);
    setNewBrokerName('');
    setNewBrokerAgency('');
    setNewBrokerPhone('');
    setNewBrokerEmail('');
    setNewBrokerRera('');
    setNewBrokerLocality('');
    setStatusMessage(`Created partner broker account for ${newBrokerName}`);
    setTimeout(() => setStatusMessage(''), 2500);
  };

  const handleUpdateBrokerStatus = (brokerId, newStatus) => {
    const updated = dbService.updateBrokerStatus(brokerId, newStatus);
    setBrokersList(updated);
    if (selectedBrokerDetail && selectedBrokerDetail.id === brokerId) {
      setSelectedBrokerDetail({ ...selectedBrokerDetail, status: newStatus });
    }
    setStatusMessage(`Broker account status updated to ${newStatus}`);
    setTimeout(() => setStatusMessage(''), 2500);
  };

  const handleVerifyBrokerRera = (brokerId, isVerified) => {
    const updated = dbService.verifyBrokerRera(brokerId, isVerified);
    setBrokersList(updated);
    if (selectedBrokerDetail && selectedBrokerDetail.id === brokerId) {
      setSelectedBrokerDetail({ ...selectedBrokerDetail, verificationStatus: isVerified ? 'verified' : 'rejected' });
    }
    setStatusMessage(`Updated broker RERA verification status`);
    setTimeout(() => setStatusMessage(''), 2500);
  };

  const handleAssignLeadSubmit = (e) => {
    e.preventDefault();
    if (!assigningLead || !assignBrokerId) {
      alert('Please select a broker to assign.');
      return;
    }
    const targetBroker = brokersList.find(b => b.id === assignBrokerId);
    const updatedLeads = dbService.assignLeadToBroker(assigningLead.id, assignBrokerId, targetBroker ? targetBroker.name : 'Assigned Broker');
    setLeadList(updatedLeads);
    setAssigningLead(null);
    setAssignBrokerId('');
    setStatusMessage(`Lead assigned to ${targetBroker ? targetBroker.name : 'Broker'}`);
    setTimeout(() => setStatusMessage(''), 2500);
  };

  const handleUpdateListingRequestStatus = (reqId, newStatus) => {
    const updated = dbService.updateListingRequestStatus(reqId, newStatus);
    setListingRequestsList(updated);
    setStatusMessage(`Listing request status updated to ${newStatus}`);
    setTimeout(() => setStatusMessage(''), 2500);
  };

  const handleApproveProperty = (propId) => {
    const updated = propertyList.map(p => p.id === propId ? { ...p, status: 'Approved' } : p);
    setPropertyList(updated);
    dbService.addAuditLog('PROPERTY_APPROVED', 'Admin', `Approved property listing ID: ${propId}`);
    setStatusMessage('Property listing approved & published to public marketplace!');
    setTimeout(() => setStatusMessage(''), 2500);
  };

  const handleRejectProperty = (propId) => {
    const updated = propertyList.map(p => p.id === propId ? { ...p, status: 'Rejected' } : p);
    setPropertyList(updated);
    dbService.addAuditLog('PROPERTY_REJECTED', 'Admin', `Rejected property listing ID: ${propId}`);
    setStatusMessage('Property listing rejected');
    setTimeout(() => setStatusMessage(''), 2500);
  };

  // Filtered Datasets
  const filteredCustomers = customersList.filter(c => {
    if (customerStatusFilter !== 'all' && c.accountStatus !== customerStatusFilter) return false;
    if (customerSearchTerm.trim() !== '') {
      const q = customerSearchTerm.toLowerCase();
      return c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.phone.includes(q);
    }
    return true;
  });

  const filteredBrokers = brokersList.filter(b => {
    if (brokerStatusFilter !== 'all' && b.status !== brokerStatusFilter) return false;
    return true;
  });

  const filteredLeads = leadList.filter(l => {
    if (leadStageFilter !== 'all' && l.status !== leadStageFilter) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Header Banner */}
      <div className="bg-purple-950 text-white rounded-xl p-5 shadow-md border border-purple-900 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-amber-400 text-purple-950 p-3 rounded-xl font-black">
            <Building2 className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">Trustify Operations Control Center</h2>
              <span className="bg-emerald-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded uppercase">
                Phase 4 Active
              </span>
            </div>
            <p className="text-xs text-purple-200 mt-1">
              Operational Management for Customers, Partner Brokers, Properties, PGs, Leads & Owner Requests
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsCreateBrokerOpen(true)}
            className="bg-amber-400 hover:bg-amber-300 text-purple-950 font-extrabold text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span>Create / Invite Broker</span>
          </button>

          <button 
            onClick={onOpenPostProperty}
            className="bg-purple-800 hover:bg-purple-700 text-white font-extrabold text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 border border-purple-600 transition-colors"
          >
            <PlusCircle className="w-4 h-4 text-amber-400" />
            <span>Add Property</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="bg-emerald-50 text-emerald-900 border border-emerald-300 px-4 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* MODULE 1: DASHBOARD OVERVIEW */}
      {activeTab === 'home' && (
        <div className="space-y-6">
          {/* Real Metrics Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Customers</span>
              <div className="text-2xl font-extrabold text-slate-900 mt-1">{totalCustomersCount}</div>
              <span className="text-[10px] font-semibold text-emerald-600 mt-1 block">{activeCustomersCount} Active Accounts</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider block">Partner Brokers</span>
              <div className="text-2xl font-extrabold text-purple-950 mt-1">{totalBrokersCount}</div>
              <span className="text-[10px] font-semibold text-purple-700 mt-1 block">{verifiedBrokersCount} RERA Verified</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">Active Properties</span>
              <div className="text-2xl font-extrabold text-brand-700 mt-1">{activePropertiesCount}</div>
              <span className="text-[10px] text-slate-500 mt-1 block">{totalPropertiesCount} Total Listings</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block">PG & Hostels</span>
              <div className="text-2xl font-extrabold text-amber-700 mt-1">{activePgCount}</div>
              <span className="text-[10px] text-slate-500 mt-1 block">{pgListingsCount} Total PG Listings</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs col-span-2 sm:col-span-1">
              <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider block">Owner Requests</span>
              <div className="text-2xl font-extrabold text-rose-700 mt-1">{pendingRequestsCount} New</div>
              <span className="text-[10px] text-rose-600 font-semibold mt-1 block">Pending Owner Submissions</span>
            </div>
          </div>

          {/* Operational Pipeline Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div 
              onClick={() => setActiveTab('listing_requests')}
              className="bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 p-4 rounded-xl shadow-xs cursor-pointer hover:shadow-md transition-all flex items-center justify-between"
            >
              <div>
                <span className="text-[10px] uppercase font-black tracking-wider block text-slate-900">Owner Listing Submissions</span>
                <div className="text-2xl font-black">{pendingRequestsCount} Pending Submissions</div>
                <p className="text-xs font-semibold mt-1">Review owner properties & publish →</p>
              </div>
              <Inbox className="w-10 h-10 opacity-80" />
            </div>

            <div 
              onClick={() => setActiveTab('leads')}
              className="bg-gradient-to-r from-purple-900 to-purple-950 text-white p-4 rounded-xl shadow-xs cursor-pointer hover:shadow-md transition-all flex items-center justify-between"
            >
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider block text-purple-300">Lead Assignment Queue</span>
                <div className="text-2xl font-black">{totalLeadsCount} Total Leads ({highIntentLeadsCount} High Intent)</div>
                <p className="text-xs font-semibold mt-1 text-purple-200">Assign leads to verified brokers →</p>
              </div>
              <Send className="w-10 h-10 text-amber-400 opacity-80" />
            </div>

            <div 
              onClick={() => setActiveTab('site_visits')}
              className="bg-slate-900 text-white p-4 rounded-xl shadow-xs cursor-pointer hover:shadow-md transition-all flex items-center justify-between"
            >
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider block text-slate-400">Site Visit Requests</span>
                <div className="text-2xl font-black">{pendingVisitsCount} Slots Pending</div>
                <p className="text-xs font-semibold mt-1 text-slate-300">Manage physical site visit slots →</p>
              </div>
              <Calendar className="w-10 h-10 text-purple-400 opacity-80" />
            </div>
          </div>
        </div>
      )}

      {/* MODULE 2: CUSTOMERS CONTROL (/admin/customers) */}
      {activeTab === 'customers' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-200">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-brand-600" />
                Customer User Directory ({filteredCustomers.length})
              </h3>
              <p className="text-xs text-slate-500">Manage registered students, buyers, and property seekers</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input 
                  type="text"
                  placeholder="Search name, phone, email..."
                  value={customerSearchTerm}
                  onChange={(e) => setCustomerSearchTerm(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded-md pl-8 pr-3 py-1.5 text-xs text-slate-900 w-48 focus:outline-none"
                />
              </div>

              <select 
                value={customerStatusFilter}
                onChange={(e) => setCustomerStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-md px-3 py-1.5 text-xs font-bold text-slate-800"
              >
                <option value="all">All Account Statuses</option>
                <option value="Active">Active</option>
                <option value="Suspended">Suspended</option>
                <option value="Blocked">Blocked</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase">
                  <th className="p-3">Customer Name</th>
                  <th className="p-3">Contact</th>
                  <th className="p-3">City</th>
                  <th className="p-3">Reg. Date</th>
                  <th className="p-3">Intent Score</th>
                  <th className="p-3">Account Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredCustomers.map(cust => (
                  <tr key={cust.id} className="hover:bg-slate-50 font-semibold">
                    <td className="p-3 font-extrabold text-slate-900">{cust.name}</td>
                    <td className="p-3 text-slate-600">{cust.phone} <br/><span className="text-[10px] font-mono text-slate-400">{cust.email}</span></td>
                    <td className="p-3 text-slate-700">{cust.city}</td>
                    <td className="p-3 text-slate-500">{cust.registrationDate || '10 Aug 2026'}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                        cust.intentScore >= 80 ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-900'
                      }`}>
                        {cust.intentScore || 70}/100 ({cust.intentLevel || 'high'})
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                        cust.accountStatus === 'Active' || !cust.accountStatus ? 'bg-emerald-100 text-emerald-800' :
                        cust.accountStatus === 'Suspended' ? 'bg-amber-100 text-amber-900' : 'bg-red-100 text-red-800'
                      }`}>
                        {cust.accountStatus || 'Active'}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-1.5">
                      <button 
                        onClick={() => setSelectedCustomerDetail(cust)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded text-slate-800 text-[11px] font-bold"
                      >
                        Details
                      </button>

                      {cust.accountStatus === 'Suspended' || cust.accountStatus === 'Blocked' ? (
                        <button 
                          onClick={() => handleUpdateCustomerStatus(cust.id, 'Active')}
                          className="px-2.5 py-1 bg-emerald-100 text-emerald-800 hover:bg-emerald-200 rounded text-[11px] font-bold"
                        >
                          Reactivate
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleUpdateCustomerStatus(cust.id, 'Suspended')}
                          className="px-2.5 py-1 bg-amber-100 text-amber-900 hover:bg-amber-200 rounded text-[11px] font-bold"
                        >
                          Suspend
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODULE 3: BROKERS CONTROL (/admin/brokers) */}
      {activeTab === 'brokers' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-200">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-purple-700" />
                Partner Brokers Directory ({filteredBrokers.length})
              </h3>
              <p className="text-xs text-slate-500">Manage registered real estate dealers & student housing partners</p>
            </div>

            <button 
              onClick={() => setIsCreateBrokerOpen(true)}
              className="bg-purple-950 hover:bg-purple-900 text-white font-extrabold text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5"
            >
              <UserPlus className="w-4 h-4 text-amber-400" />
              <span>Create / Invite Broker</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase">
                  <th className="p-3">Broker & Agency</th>
                  <th className="p-3">Contact</th>
                  <th className="p-3">RERA Reg ID</th>
                  <th className="p-3">RERA Status</th>
                  <th className="p-3">Assigned Leads</th>
                  <th className="p-3">Account Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredBrokers.map(brk => (
                  <tr key={brk.id} className="hover:bg-slate-50 font-semibold">
                    <td className="p-3">
                      <div className="font-extrabold text-slate-900">{brk.name}</div>
                      <div className="text-[10px] text-slate-500">{brk.agencyName}</div>
                    </td>
                    <td className="p-3 text-slate-600">{brk.phone} <br/><span className="text-[10px] font-mono text-slate-400">{brk.email}</span></td>
                    <td className="p-3 font-mono text-emerald-800">{brk.reraId}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                        brk.verificationStatus === 'verified' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                      }`}>
                        {brk.verificationStatus}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-slate-800">{brk.assignedLeadsCount || 8} Leads</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                        brk.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {brk.status}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-1.5">
                      <button 
                        onClick={() => setSelectedBrokerDetail(brk)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded text-slate-800 text-[11px] font-bold"
                      >
                        Details
                      </button>

                      {brk.verificationStatus !== 'verified' && (
                        <button 
                          onClick={() => handleVerifyBrokerRera(brk.id, true)}
                          className="px-2.5 py-1 bg-emerald-600 text-white hover:bg-emerald-700 rounded text-[11px] font-bold"
                        >
                          Verify RERA
                        </button>
                      )}

                      {brk.status === 'Active' ? (
                        <button 
                          onClick={() => handleUpdateBrokerStatus(brk.id, 'Suspended')}
                          className="px-2.5 py-1 bg-red-100 text-red-800 hover:bg-red-200 rounded text-[11px] font-bold"
                        >
                          Suspend
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleUpdateBrokerStatus(brk.id, 'Active')}
                          className="px-2.5 py-1 bg-emerald-100 text-emerald-800 hover:bg-emerald-200 rounded text-[11px] font-bold"
                        >
                          Reactivate
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODULE 4: OWNER LISTING REQUESTS (/admin/listing-requests) */}
      {activeTab === 'listing_requests' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Inbox className="w-5 h-5 text-amber-600" />
                Owner Property Listing Submissions ({listingRequestsList.length})
              </h3>
              <p className="text-xs text-slate-500">Property submissions from owners contacting Trustify ("List Your Property")</p>
            </div>
            <span className="bg-amber-100 text-amber-900 text-xs font-bold px-2.5 py-1 rounded border border-amber-300">
              {pendingRequestsCount} Pending Review
            </span>
          </div>

          <div className="space-y-3">
            {listingRequestsList.map(req => (
              <div key={req.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs">
                <div className="flex flex-wrap justify-between items-start gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-slate-900 text-sm">{req.ownerName}</h4>
                      <span className="bg-blue-100 text-brand-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                        {req.listingType} • {req.propertyType}
                      </span>
                    </div>
                    <p className="text-slate-600 font-semibold mt-0.5">
                      Locality: <strong className="text-slate-900">{req.locality}, {req.city}</strong> • Price: <strong className="text-emerald-700">{req.approxPriceDisplay}</strong>
                    </p>
                    <p className="text-slate-700 mt-1 font-mono">
                      Phone: <strong>{req.ownerPhone}</strong> ({req.ownerEmail || 'No email'})
                    </p>
                  </div>

                  <span className={`px-2.5 py-1 rounded text-xs font-extrabold uppercase ${
                    req.status === 'New' ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {req.status}
                  </span>
                </div>

                <p className="bg-white p-3 rounded border border-slate-200 text-slate-700 leading-relaxed font-normal">
                  <strong>Owner Note:</strong> "{req.message || 'No additional message.'}"
                </p>

                {/* Actions */}
                <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 font-bold">
                  <a 
                    href={`tel:${req.ownerPhone}`}
                    className="px-3 py-1.5 bg-brand-700 text-white rounded text-xs flex items-center gap-1"
                  >
                    Call Owner ({req.ownerPhone})
                  </a>

                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => {
                        handleUpdateListingRequestStatus(req.id, 'Verified & Created');
                        onOpenPostProperty();
                      }}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs"
                    >
                      Publish Listing to Marketplace
                    </button>
                    <button 
                      onClick={() => handleUpdateListingRequestStatus(req.id, 'Rejected')}
                      className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded text-xs"
                    >
                      Reject Request
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODULE 5: LEADS CONTROL (/admin/leads) */}
      {activeTab === 'leads' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-200">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Activity className="w-5 h-5 text-purple-700" />
                Central Lead Pipeline & Broker Assignment Queue
              </h3>
              <p className="text-xs text-slate-500">Operational lead assignment pipeline: Customer → Admin → Assigned Broker</p>
            </div>

            {/* Stage Filter */}
            <div className="flex flex-wrap gap-1 text-xs font-bold">
              {['all', 'assigned', 'contacted', 'follow_up', 'site_visit', 'negotiation', 'converted'].map(stage => (
                <button
                  key={stage}
                  onClick={() => setLeadStageFilter(stage)}
                  className={`px-2.5 py-1 rounded text-[10px] uppercase transition-all ${
                    leadStageFilter === stage ? 'bg-purple-950 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {stage.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {filteredLeads.map(lead => (
              <div key={lead.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs">
                <div className="flex flex-wrap justify-between items-start gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-slate-900 text-sm">{lead.customerName}</h4>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded uppercase ${
                        lead.priority === 'urgent' || lead.priority === 'high' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-900'
                      }`}>
                        {lead.priority || 'high'} priority
                      </span>
                      <span className="bg-blue-100 text-brand-800 text-[10px] font-extrabold px-2 py-0.5 rounded">
                        Intent Score: {lead.intentScore || 75}/100
                      </span>
                    </div>
                    <p className="text-slate-600 font-semibold mt-1">
                      Requirement: <strong className="text-slate-900">{lead.locality} ({lead.propertyType ? lead.propertyType.toUpperCase() : 'APARTMENT'})</strong> • Budget: <strong className="text-emerald-700">{lead.budgetDisplay}</strong>
                    </p>
                    <p className="text-slate-700 mt-1 font-mono">Phone: {lead.customerPhone}</p>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-bold block mb-1">Assigned Partner Broker:</span>
                    <span className="font-extrabold text-purple-950 bg-purple-100 px-2.5 py-1 rounded border border-purple-200">
                      {lead.assignedBrokerName || 'Unassigned'}
                    </span>
                  </div>
                </div>

                {lead.adminNote && (
                  <div className="bg-amber-50 text-amber-900 text-xs p-2.5 rounded border border-amber-200">
                    <strong>Admin Note:</strong> {lead.adminNote}
                  </div>
                )}

                {/* Actions */}
                <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs font-bold">
                  <span className="text-slate-500 uppercase text-[10px]">Pipeline Stage: {lead.status}</span>
                  <button 
                    onClick={() => setAssigningLead(lead)}
                    className="px-3 py-1.5 bg-purple-950 hover:bg-purple-900 text-white rounded text-xs flex items-center gap-1"
                  >
                    <Send className="w-3.5 h-3.5 text-amber-400" />
                    <span>{lead.assignedBrokerId ? 'Reassign Broker' : 'Assign Broker'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODULE 6: ENQUIRIES & SITE VISITS */}
      {(activeTab === 'enquiries' || activeTab === 'site_visits') && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <h3 className="text-base font-extrabold text-slate-900 pb-3 border-b border-slate-200">
            {activeTab === 'enquiries' ? 'Customer Callback Enquiries' : 'Physical Site Visit Slots'}
          </h3>
          
          <div className="space-y-3">
            {activeTab === 'enquiries' ? (
              enquiriesList.map(enq => (
                <div key={enq.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm">{enq.customerName} ({enq.customerPhone})</h4>
                      <p className="text-slate-600 font-semibold">{enq.propertyTitle}</p>
                    </div>
                    <span className="bg-blue-100 text-brand-800 font-extrabold px-2 py-0.5 rounded text-[10px]">
                      {enq.status}
                    </span>
                  </div>
                  <p className="text-slate-700 bg-white p-2.5 rounded border border-slate-200">{enq.message}</p>
                </div>
              ))
            ) : (
              siteVisits.map(visit => (
                <div key={visit.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm">{visit.customerName} ({visit.customerPhone})</h4>
                      <p className="text-slate-600 font-semibold">{visit.propertyTitle}</p>
                      <p className="text-purple-800 font-bold mt-1">Slot: {visit.requestedDate}</p>
                    </div>
                    <span className="bg-purple-100 text-purple-900 font-extrabold px-2.5 py-1 rounded text-[10px] uppercase">
                      {visit.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* MODULE 7: AUDIT LOGS & SETTINGS (/admin/settings) */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <h3 className="text-base font-extrabold text-slate-900 pb-3 border-b border-slate-200 flex items-center gap-2">
            <Settings className="w-5 h-5 text-slate-700" />
            System Operations Audit Log
          </h3>

          <div className="space-y-2">
            {auditLogs.map(log => (
              <div key={log.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs flex justify-between items-center">
                <div>
                  <div className="font-extrabold text-slate-900">{log.action}</div>
                  <div className="text-slate-600 text-[11px]">{log.details}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">By: {log.actor}</div>
                </div>
                <span className="text-[10px] font-mono text-slate-400">{log.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CREATE / INVITE BROKER MODAL */}
      {isCreateBrokerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative text-xs font-semibold text-slate-700">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-purple-700" /> Create / Invite Partner Broker
              </h3>
              <button onClick={() => setIsCreateBrokerOpen(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBroker} className="space-y-3">
              <div>
                <label className="block text-slate-500 uppercase tracking-wider mb-1 text-[10px]">Broker Name *</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Lt. Col. Vikram Singh"
                  value={newBrokerName}
                  onChange={(e) => setNewBrokerName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-500 uppercase tracking-wider mb-1 text-[10px]">Agency Name</label>
                <input 
                  type="text"
                  placeholder="e.g. Duggar Realty Jammu"
                  value={newBrokerAgency}
                  onChange={(e) => setNewBrokerAgency(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 uppercase tracking-wider mb-1 text-[10px]">Mobile Phone *</label>
                  <input 
                    type="tel"
                    required
                    placeholder="+91 94191 12345"
                    value={newBrokerPhone}
                    onChange={(e) => setNewBrokerPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 uppercase tracking-wider mb-1 text-[10px]">Official Email *</label>
                  <input 
                    type="email"
                    required
                    placeholder="broker@agency.com"
                    value={newBrokerEmail}
                    onChange={(e) => setNewBrokerEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 uppercase tracking-wider mb-1 text-[10px]">JK RERA Reg Number</label>
                  <input 
                    type="text"
                    placeholder="JKRERA/JM/AGENT/2026"
                    value={newBrokerRera}
                    onChange={(e) => setNewBrokerRera(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs text-slate-900 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 uppercase tracking-wider mb-1 text-[10px]">Service Locality</label>
                  <input 
                    type="text"
                    placeholder="Gandhi Nagar, Jammu"
                    value={newBrokerLocality}
                    onChange={(e) => setNewBrokerLocality(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs text-slate-900"
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-purple-950 hover:bg-purple-900 text-white font-extrabold text-xs py-3 rounded transition-colors uppercase tracking-wider shadow-sm mt-2"
              >
                Create Partner Broker Account
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ASSIGN LEAD TO BROKER MODAL */}
      {assigningLead && (
        <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative text-xs font-semibold text-slate-700 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Send className="w-5 h-5 text-purple-700" /> Assign Lead to Partner Broker
              </h3>
              <button onClick={() => setAssigningLead(null)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
              <div className="font-extrabold text-slate-900 text-sm">{assigningLead.customerName}</div>
              <div className="text-slate-600">Locality: {assigningLead.locality} • Budget: {assigningLead.budgetDisplay}</div>
              <div className="text-[10px] text-brand-700 font-bold">Intent Score: {assigningLead.intentScore || 75}/100</div>
            </div>

            <form onSubmit={handleAssignLeadSubmit} className="space-y-3">
              <div>
                <label className="block text-slate-500 uppercase tracking-wider mb-1 text-[10px]">Select Partner Broker (Active + Verified Only)</label>
                <select 
                  required
                  value={assignBrokerId}
                  onChange={(e) => setAssignBrokerId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs font-bold text-slate-900"
                >
                  <option value="">-- Choose Partner Broker --</option>
                  {brokersList.filter(b => b.status === 'Active' && b.verificationStatus === 'verified').map(b => (
                    <option key={b.id} value={b.id}>{b.name} ({b.agencyName}) - {b.locality}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-500 uppercase tracking-wider mb-1 text-[10px]">Set Priority</label>
                <select 
                  value={assignPriority}
                  onChange={(e) => setAssignPriority(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs font-bold text-slate-900"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                  <option value="urgent">Urgent Priority</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-500 uppercase tracking-wider mb-1 text-[10px]">Admin Internal Note to Broker</label>
                <textarea 
                  rows={2}
                  placeholder="e.g. Verified customer looking to close deal by weekend..."
                  value={assignAdminNote}
                  onChange={(e) => setAssignAdminNote(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs text-slate-900"
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-purple-950 hover:bg-purple-900 text-white font-extrabold text-xs py-3 rounded transition-colors uppercase tracking-wider shadow-sm"
              >
                Confirm Lead Assignment
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CUSTOMER DETAIL MODAL */}
      {selectedCustomerDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative text-xs font-semibold text-slate-700 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-extrabold text-slate-900">{selectedCustomerDetail.name}</h3>
              <button onClick={() => setSelectedCustomerDetail(null)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Phone Number</span>
                <span className="font-extrabold text-slate-900">{selectedCustomerDetail.phone}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Email</span>
                <span className="font-extrabold text-slate-900">{selectedCustomerDetail.email}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Registration Date</span>
                <span>{selectedCustomerDetail.registrationDate || '10 Aug 2026'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">City</span>
                <span>{selectedCustomerDetail.city}</span>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Intent Score & Behavioral Reasons</span>
              <div className="text-base font-extrabold text-red-600 mt-0.5">{selectedCustomerDetail.intentScore || 85}/100 (HOT INTENT)</div>
              <ul className="list-disc list-inside mt-1 text-[11px] text-slate-600 space-y-0.5">
                {(selectedCustomerDetail.intentReasons || ['Viewed 6 properties', 'Saved 3 listings', 'Requested callback enquiry']).map((r, idx) => (
                  <li key={idx}>{r}</li>
                ))}
              </ul>
            </div>

            <div className="pt-2 flex gap-2 font-bold">
              <button 
                onClick={() => handleUpdateCustomerStatus(selectedCustomerDetail.id, selectedCustomerDetail.accountStatus === 'Active' ? 'Suspended' : 'Active')}
                className="flex-1 py-2 bg-amber-100 text-amber-900 rounded text-xs text-center"
              >
                {selectedCustomerDetail.accountStatus === 'Active' ? 'Suspend Customer' : 'Reactivate Customer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BROKER DETAIL MODAL */}
      {selectedBrokerDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative text-xs font-semibold text-slate-700 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">{selectedBrokerDetail.name}</h3>
                <p className="text-xs text-purple-900 font-bold">{selectedBrokerDetail.agencyName}</p>
              </div>
              <button onClick={() => setSelectedBrokerDetail(null)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">JK RERA ID</span>
                <span className="font-mono text-emerald-800 font-bold">{selectedBrokerDetail.reraId}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Verification</span>
                <span className="font-extrabold text-emerald-700 uppercase">{selectedBrokerDetail.verificationStatus}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Assigned Leads</span>
                <span className="font-bold text-slate-900">{selectedBrokerDetail.assignedLeadsCount || 14} Leads</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Conversion Rate</span>
                <span className="font-bold text-emerald-700">{selectedBrokerDetail.conversionRate || '11.9%'}</span>
              </div>
            </div>

            <div className="pt-2 flex gap-2 font-bold">
              <button 
                onClick={() => handleVerifyBrokerRera(selectedBrokerDetail.id, selectedBrokerDetail.verificationStatus !== 'verified')}
                className="flex-1 py-2 bg-emerald-600 text-white rounded text-xs text-center"
              >
                {selectedBrokerDetail.verificationStatus === 'verified' ? 'Revoke RERA Verification' : 'Verify RERA Credentials'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
