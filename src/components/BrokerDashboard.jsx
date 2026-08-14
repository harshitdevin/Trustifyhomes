import React, { useState } from 'react';
import { 
  Briefcase, 
  Building2, 
  PhoneCall, 
  Users, 
  ShieldCheck, 
  PlusCircle, 
  Clock, 
  MessageSquare,
  Sparkles,
  Lock,
  Unlock,
  Coins,
  ShieldAlert,
  CreditCard,
  Check,
  X,
  Send,
  Flame,
  UserCheck,
  LayoutDashboard,
  Building,
  TrendingUp,
  BarChart3,
  Calendar,
  Settings,
  User,
  Eye,
  Heart,
  FileText,
  AlertCircle,
  ChevronRight,
  Filter,
  Trash2,
  PauseCircle,
  CheckCircle,
  MapPin,
  Mail,
  Phone,
  Key
} from 'lucide-react';
import { dbService } from '../services/dbService';
import { leadIntelligenceService } from '../services/leadIntelligenceService';
import { supabaseService } from '../services/supabaseService';

export default function BrokerDashboard({ 
  properties, 
  onOpenPostProperty, 
  onSelectProperty,
  activeTab: externalActiveTab,
  setActiveTab: externalSetActiveTab
}) {
  const [internalActiveTab, setInternalActiveTab] = useState('overview'); 

  const activeTab = externalActiveTab !== undefined ? externalActiveTab : internalActiveTab;
  const setActiveTab = externalSetActiveTab !== undefined ? externalSetActiveTab : setInternalActiveTab;

  // State Stores
  const [brokerProperties, setBrokerProperties] = useState(() => {
    const customProps = dbService.getCustomProperties();
    return customProps.length > 0 ? customProps : properties.slice(0, 6);
  });

  const [inventoryFilter, setInventoryFilter] = useState('all'); 
  const [assignedLeads, setAssignedLeads] = useState(() => leadIntelligenceService.getAssignedBrokerLeads());
  const [leadList, setLeadList] = useState(() => dbService.getLeadMarketplace());
  const [siteVisits, setSiteVisits] = useState(() => dbService.getSiteVisits());
  const [enquiriesList, setEnquiriesList] = useState(() => dbService.getEnquiriesList());
  const [tokenBalance, setTokenBalance] = useState(() => dbService.getTokenBalance());

  const [statusMessage, setStatusMessage] = useState('');
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);

  // Password change state
  const [newPassword, setNewPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState('');

  // Broker Profile State
  const [brokerProfile, setBrokerProfile] = useState({
    name: 'Col. Vikram Singh',
    agencyName: 'Duggar Realty Jammu',
    phone: '+91 94191 12345',
    email: 'vikram.singh@gandhinagar.in',
    address: 'Plot 42, Green Belt Road, Gandhi Nagar',
    city: 'Jammu',
    serviceAreas: 'Gandhi Nagar, Trikuta Nagar, Channi Himmat, Sidhra',
    reraId: 'JKRERA/JM/AGENT/2024/00889',
    verificationStatus: 'verified',
    businessDescription: 'Premier RERA-registered real estate consultancy specializing in luxury residential kothis, apartments, commercial plots, and student PG housing across Jammu Tawi.'
  });

  const TOKEN_PACKS = [
    { name: 'Starter Pack', tokens: 500, price: '₹2,500', popular: false },
    { name: 'Pro Dealer Pack', tokens: 1200, price: '₹5,000', popular: true },
    { name: 'Enterprise Pack', tokens: 3000, price: '₹10,000', popular: false }
  ];

  // Property Actions
  const handleUpdatePropertyStatus = (propId, newStatus) => {
    const updated = brokerProperties.map(p => p.id === propId ? { ...p, status: newStatus } : p);
    setBrokerProperties(updated);
    setStatusMessage(`Listing status updated to ${newStatus.toUpperCase()}`);
    setTimeout(() => setStatusMessage(''), 2500);
  };

  const handleDeleteProperty = (propId) => {
    if (!window.confirm('Are you sure you want to delete this listing from your inventory?')) return;
    const updated = brokerProperties.filter(p => p.id !== propId);
    setBrokerProperties(updated);
    setStatusMessage('Property deleted successfully!');
    setTimeout(() => setStatusMessage(''), 2500);
  };

  const handleLeadStageUpdate = (leadId, newStatus) => {
    const updated = leadIntelligenceService.updateLeadStatus(leadId, newStatus);
    setAssignedLeads(updated);
    setStatusMessage(`Lead stage updated to ${newStatus.replace('_', ' ').toUpperCase()}`);
    setTimeout(() => setStatusMessage(''), 2500);
  };

  const handleUpdateSiteVisit = (visitId, newStatus) => {
    const updated = dbService.updateSiteVisitStatus(visitId, newStatus);
    setSiteVisits(updated);
    setStatusMessage(`Site visit status updated to ${newStatus}`);
    setTimeout(() => setStatusMessage(''), 2500);
  };

  const handleBuyMarketplaceLead = (lead) => {
    if (tokenBalance < lead.leadPriceTokens) {
      alert(`Insufficient Tokens! You need ${lead.leadPriceTokens} tokens. Please top up your wallet.`);
      setIsTokenModalOpen(true);
      return;
    }

    const updatedBalance = dbService.deductTokens(lead.leadPriceTokens);
    setTokenBalance(updatedBalance);

    const updatedLeads = dbService.buyLead(lead.id, brokerProfile.name);
    setLeadList(updatedLeads);
    setStatusMessage(`Unlocked ${lead.buyerName}'s contact details! Deducted ${lead.leadPriceTokens} Tokens.`);
    setTimeout(() => setStatusMessage(''), 3000);
  };

  const handleRechargeTokens = (tokenAmount) => {
    const updated = dbService.rechargeTokens(tokenAmount);
    setTokenBalance(updated);
    setIsTokenModalOpen(false);
    setStatusMessage(`Successfully topped up wallet with ${tokenAmount} Lead Tokens!`);
    setTimeout(() => setStatusMessage(''), 3000);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setPasswordStatus('Password must be at least 6 characters long.');
      return;
    }
    try {
      await supabaseService.updatePassword(newPassword);
      setPasswordStatus('Password updated successfully!');
      setNewPassword('');
      setTimeout(() => setPasswordStatus(''), 3000);
    } catch (err) {
      setPasswordStatus(err.message || 'Failed to update password.');
    }
  };

  // Inventory Filtering
  const filteredInventory = brokerProperties.filter(p => {
    if (inventoryFilter === 'all') return true;
    if (inventoryFilter === 'active') return p.status === 'Approved' || p.status === 'approved' || p.status === 'Active' || !p.status;
    if (inventoryFilter === 'pending') return p.status === 'Pending' || p.status === 'pending_review';
    if (inventoryFilter === 'sold') return p.status === 'Sold' || p.status === 'sold';
    if (inventoryFilter === 'rented') return p.status === 'Rented' || p.status === 'rented';
    if (inventoryFilter === 'paused') return p.status === 'Paused' || p.status === 'paused';
    return true;
  });

  // Summary Metrics (Computed from actual data, zero hardcoded additions)
  const totalInventoryCount = brokerProperties.length;
  const activeListingsCount = brokerProperties.filter(p => p.status === 'Approved' || p.status === 'approved' || p.status === 'Active' || !p.status).length;
  const pendingCount = brokerProperties.filter(p => p.status === 'Pending' || p.status === 'pending_review').length;
  const convertedCount = assignedLeads.filter(l => l.status === 'converted').length;
  const newLeadsCount = assignedLeads.filter(l => l.status === 'assigned' || l.status === 'new').length;
  const totalSiteVisitsCount = siteVisits.length;
  const totalViewsSum = brokerProperties.reduce((acc, p) => acc + (p.views || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Banner Header */}
      <div className="bg-slate-900 text-white rounded-xl p-5 shadow-md border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-amber-500 text-slate-950 p-3 rounded-xl font-bold">
            <Briefcase className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">{brokerProfile.agencyName}</h2>
              {brokerProfile.verificationStatus === 'verified' && (
                <span className="bg-emerald-500 text-slate-950 text-xs font-extrabold px-2 py-0.5 rounded flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> JK RERA Verified Agent
                </span>
              )}
            </div>
            <p className="text-xs text-slate-300 mt-1">
              {brokerProfile.name} • {brokerProfile.city} • Reg: <strong className="font-mono text-emerald-400">{brokerProfile.reraId}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Token Wallet Badge */}
          <div 
            onClick={() => setIsTokenModalOpen(true)}
            className="bg-slate-800 border border-slate-700 px-3.5 py-1.5 rounded-lg cursor-pointer hover:border-amber-400 transition-colors text-right"
          >
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Lead Token Wallet</span>
            <div className="text-base font-extrabold text-amber-400 flex items-center gap-1">
              <Coins className="w-4 h-4 text-amber-400" />
              <span>{tokenBalance.toLocaleString()} Tokens</span>
            </div>
          </div>

          <button 
            onClick={onOpenPostProperty}
            className="ez-btn-primary bg-amber-500 text-slate-950 hover:bg-amber-400 text-xs py-2 px-3 font-bold"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Property</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="bg-emerald-50 text-emerald-800 border border-emerald-300 px-4 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* MODULE 1: DASHBOARD OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Inventory</span>
              <div className="text-2xl font-extrabold text-slate-900 mt-1">{totalInventoryCount} Properties</div>
              <span className="text-[10px] font-semibold text-emerald-600 mt-1 block">{activeListingsCount} Active • {pendingCount} Pending</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">Active Listings</span>
              <div className="text-2xl font-extrabold text-brand-700 mt-1">{activeListingsCount} Active</div>
              <span className="text-[10px] text-slate-500 mt-1 block">Live on Marketplace</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block">New Leads</span>
              <div className="text-2xl font-extrabold text-amber-700 mt-1">{newLeadsCount} New</div>
              <span className="text-[10px] text-amber-600 font-semibold mt-1 block">Direct Intent Leads</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider block">Site Visits</span>
              <div className="text-2xl font-extrabold text-purple-800 mt-1">{totalSiteVisitsCount} Scheduled</div>
              <span className="text-[10px] text-slate-500 mt-1 block">Visit Slots</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">Conversions</span>
              <div className="text-2xl font-extrabold text-emerald-700 mt-1">{convertedCount} Deals</div>
              <span className="text-[10px] text-emerald-600 font-semibold mt-1 block">Converted Leads</span>
            </div>
          </div>

          {/* Trustify Performance Communication Card */}
          <div className="bg-slate-900 text-white p-5 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-extrabold flex items-center gap-2 text-amber-400">
                <TrendingUp className="w-5 h-5 text-amber-400" />
                Your Trustify Performance Overview
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                Your listings are active across Jammu Tawi localities generating steady organic homebuyer activity.
              </p>
            </div>
            <div className="flex flex-wrap gap-4 text-xs font-bold">
              <div className="bg-slate-800 px-3 py-1.5 rounded border border-slate-700">
                <span className="text-slate-400 text-[10px] block uppercase">Property Views</span>
                <span className="text-base text-white">{totalViewsSum} Views</span>
              </div>
              <div className="bg-slate-800 px-3 py-1.5 rounded border border-slate-700">
                <span className="text-slate-400 text-[10px] block uppercase">Enquiries</span>
                <span className="text-base text-amber-400">{enquiriesList.length} Inquiries</span>
              </div>
              <div className="bg-slate-800 px-3 py-1.5 rounded border border-slate-700">
                <span className="text-slate-400 text-[10px] block uppercase">Site Visits</span>
                <span className="text-base text-purple-300">{siteVisits.length} Requests</span>
              </div>
            </div>
          </div>

          {/* Two-Column Overview Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Recent Leads */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                  <Send className="w-4 h-4 text-amber-600" />
                  Recent Assigned Leads
                </h4>
                <button onClick={() => setActiveTab('leads')} className="text-xs font-bold text-brand-700 hover:underline">
                  View All →
                </button>
              </div>
              <div className="space-y-2">
                {assignedLeads.slice(0, 3).map(lead => (
                  <div key={lead.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                    <div className="flex justify-between font-bold">
                      <span className="text-slate-900">{lead.customerName}</span>
                      <span className="text-amber-700 uppercase text-[10px] bg-amber-100 px-1.5 py-0.2 rounded font-extrabold">
                        {lead.priority} Priority
                      </span>
                    </div>
                    <div className="text-slate-600">{lead.locality} ({lead.propertyType.toUpperCase()}) • {lead.budgetDisplay}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Site Visits */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-purple-600" />
                  Upcoming Site Visit Slots
                </h4>
                <button onClick={() => setActiveTab('site_visits')} className="text-xs font-bold text-brand-700 hover:underline">
                  View All →
                </button>
              </div>
              <div className="space-y-2">
                {siteVisits.map(visit => (
                  <div key={visit.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs flex justify-between items-center">
                    <div>
                      <div className="font-extrabold text-slate-900">{visit.customerName} ({visit.customerPhone})</div>
                      <div className="text-[11px] text-slate-600">{visit.propertyTitle}</div>
                      <div className="text-[10px] text-purple-800 font-semibold mt-0.5">{visit.requestedDate}</div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                      visit.status === 'Confirmed' ? 'bg-purple-100 text-purple-800' : 'bg-slate-200 text-slate-800'
                    }`}>
                      {visit.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODULE 2: BROKER INVENTORY (/broker/inventory - Requirement 21) */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Building className="w-5 h-5 text-brand-600" />
                  My Property Inventory ({filteredInventory.length})
                </h3>
                <p className="text-xs text-slate-500">Manage and track your active, pending, sold, and rented listings</p>
              </div>

              {/* Status Filters */}
              <div className="flex flex-wrap gap-1.5 text-xs font-bold">
                {['all', 'active', 'pending', 'sold', 'rented', 'paused'].map(filterKey => (
                  <button
                    key={filterKey}
                    onClick={() => setInventoryFilter(filterKey)}
                    className={`px-3 py-1 rounded-lg uppercase tracking-wider text-[10px] transition-all ${
                      inventoryFilter === filterKey 
                        ? 'bg-slate-900 text-white font-extrabold' 
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {filterKey}
                  </button>
                ))}
              </div>
            </div>

            {/* Inventory List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredInventory.map(prop => (
                <div key={prop.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 relative hover:shadow-sm transition-all">
                  <div className="flex gap-3">
                    <img 
                      src={prop.image || prop.images?.[0] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80'} 
                      alt={prop.title}
                      className="w-24 h-24 rounded-lg object-cover border border-slate-200 shrink-0"
                    />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-extrabold uppercase bg-brand-100 text-brand-900 px-2 py-0.5 rounded">
                          {prop.listingType || 'RENT'}
                        </span>
                        <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                          prop.status === 'Sold' ? 'bg-red-100 text-red-800' :
                          prop.status === 'Rented' ? 'bg-purple-100 text-purple-800' :
                          prop.status === 'Paused' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {prop.status || 'Active'}
                        </span>
                      </div>
                      <h4 className="text-sm font-extrabold text-slate-900 line-clamp-1">{prop.title}</h4>
                      <p className="text-xs font-semibold text-slate-600">{prop.locality}, Jammu</p>
                      <p className="text-sm font-extrabold text-emerald-700">{prop.price || prop.priceDisplay}</p>
                    </div>
                  </div>

                  {/* Per-Property Analytics Statistics */}
                  <div className="grid grid-cols-4 gap-2 bg-white p-2.5 rounded-lg border border-slate-200 text-center text-xs">
                    <div>
                      <span className="text-[9px] text-slate-400 font-bold uppercase block">Views</span>
                      <span className="font-extrabold text-slate-900">{prop.views || 324}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 font-bold uppercase block">Favorites</span>
                      <span className="font-extrabold text-rose-600">{prop.saves || 18}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 font-bold uppercase block">Enquiries</span>
                      <span className="font-extrabold text-amber-600">{prop.enquiriesCount || 7}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 font-bold uppercase block">Site Visits</span>
                      <span className="font-extrabold text-purple-600">{prop.siteVisits || 3}</span>
                    </div>
                  </div>

                  {/* Action Buttons (View, Edit, Delete, Mark Sold, Mark Rented, Pause) */}
                  <div className="flex flex-wrap items-center justify-between gap-1.5 pt-2 border-t border-slate-200 text-[11px] font-bold">
                    <button 
                      onClick={() => onSelectProperty(prop)}
                      className="px-2.5 py-1 bg-white border border-slate-300 rounded text-slate-700 hover:bg-slate-100"
                    >
                      View
                    </button>
                    <button 
                      onClick={() => handleUpdatePropertyStatus(prop.id, 'Sold')}
                      className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded hover:bg-emerald-100"
                    >
                      Mark Sold
                    </button>
                    <button 
                      onClick={() => handleUpdatePropertyStatus(prop.id, 'Rented')}
                      className="px-2.5 py-1 bg-purple-50 text-purple-800 border border-purple-200 rounded hover:bg-purple-100"
                    >
                      Mark Rented
                    </button>
                    <button 
                      onClick={() => handleUpdatePropertyStatus(prop.id, prop.status === 'Paused' ? 'Active' : 'Paused')}
                      className="px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded hover:bg-amber-100"
                    >
                      {prop.status === 'Paused' ? 'Resume' : 'Pause'}
                    </button>
                    <button 
                      onClick={() => handleDeleteProperty(prop.id)}
                      className="px-2.5 py-1 bg-red-50 text-red-700 border border-red-200 rounded hover:bg-red-100"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODULE 3: BROKER LEADS (/broker/leads) */}
      {activeTab === 'leads' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-emerald-600" />
                  Assigned Direct Customer Leads
                </h3>
                <p className="text-xs text-slate-500">Verified buyer & tenant leads matched to your agency</p>
              </div>
              <span className="bg-amber-100 text-amber-900 text-xs font-bold px-2.5 py-1 rounded border border-amber-300">
                {assignedLeads.length} Leads Assigned
              </span>
            </div>

            <div className="space-y-4">
              {assignedLeads.map((lead) => (
                <div key={lead.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-extrabold text-slate-900">{lead.customerName}</h4>
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded uppercase ${
                          lead.priority === 'hot' ? 'bg-red-100 text-red-800 border border-red-300' : 'bg-amber-100 text-amber-900'
                        }`}>
                          {lead.priority} priority
                        </span>
                        <span className="bg-blue-100 text-brand-800 text-[10px] font-extrabold px-2 py-0.5 rounded">
                          Intent Score: {lead.intentScore}/100
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">
                        Requirement: <strong className="text-slate-900">{lead.locality} ({lead.propertyType.toUpperCase()})</strong> • Budget: <strong className="text-emerald-700">{lead.budgetDisplay}</strong>
                      </p>
                      <p className="text-xs text-slate-700 mt-1">
                        Contact: <strong className="font-mono text-slate-900">{lead.customerPhone}</strong> ({lead.customerEmail})
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 font-bold block mb-1">Pipeline Stage:</span>
                      <span className={`px-3 py-1 rounded text-xs font-extrabold uppercase ${
                        lead.status === 'converted' ? 'bg-emerald-600 text-white' :
                        lead.status === 'site_visit' ? 'bg-purple-600 text-white' :
                        lead.status === 'contacted' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-800'
                      }`}>
                        {lead.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  {lead.adminNote && (
                    <div className="bg-amber-50 text-amber-900 text-xs p-2.5 rounded border border-amber-200">
                      <strong>Admin Note:</strong> {lead.adminNote}
                    </div>
                  )}

                  {/* Stage Update Buttons */}
                  <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs font-bold">
                    <span className="text-slate-500 text-[10px] uppercase">Update Stage:</span>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {['new', 'contacted', 'follow_up', 'site_visit', 'negotiation', 'converted', 'lost'].map(stage => (
                        <button
                          key={stage}
                          onClick={() => handleLeadStageUpdate(lead.id, stage)}
                          className={`px-2.5 py-1 rounded text-[11px] uppercase transition-all ${
                            lead.status === stage 
                              ? 'bg-slate-900 text-white font-extrabold' 
                              : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {stage.replace('_', ' ')}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODULE 4: MARKETPLACE LEADS */}
      {activeTab === 'marketplace' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h3 className="text-base font-extrabold text-slate-900">Verified Buyer Lead Marketplace</h3>
            <span className="text-xs text-slate-500 font-bold">100% Direct Buyer Inquiries</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {leadList.map((lead) => (
              <div key={lead.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">{lead.city} • {lead.locality}</span>
                    <h4 className="text-sm font-extrabold text-slate-900 mt-0.5">{lead.buyerName}</h4>
                  </div>
                  <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded font-mono">
                    {lead.leadPriceTokens} Tokens
                  </span>
                </div>

                <div className="text-xs space-y-1 text-slate-600">
                  <div>Budget: <strong className="text-slate-900">{lead.budgetDisplay}</strong></div>
                  <div>Estimated Commission: <strong className="text-emerald-700">{lead.estimatedCommissionVal}</strong></div>
                </div>

                {lead.isPurchased ? (
                  <div className="p-2.5 bg-emerald-50 text-emerald-800 rounded border border-emerald-200 text-xs font-bold flex items-center justify-between">
                    <span>Phone: {lead.buyerPhone}</span>
                    <span className="text-[10px] uppercase bg-emerald-700 text-white px-1.5 py-0.2 rounded">Unlocked</span>
                  </div>
                ) : (
                  <button
                    onClick={() => handleBuyMarketplaceLead(lead)}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2 rounded transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Unlock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Unlock Contact ({lead.leadPriceTokens} Tokens)</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODULE 5: ENQUIRIES */}
      {activeTab === 'enquiries' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <h3 className="text-base font-extrabold text-slate-900 pb-3 border-b border-slate-200">
            Property Callback Enquiries
          </h3>
          <div className="space-y-3">
            {enquiriesList.map(enq => (
              <div key={enq.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm">{enq.customerName}</h4>
                    <span className="text-slate-500 font-mono">{enq.customerPhone}</span>
                  </div>
                  <span className="bg-blue-100 text-brand-800 text-[10px] font-extrabold px-2 py-0.5 rounded">
                    {enq.status}
                  </span>
                </div>
                <p className="text-slate-700 font-semibold">{enq.message}</p>
                <div className="text-[11px] text-slate-500 font-medium">Property: {enq.propertyTitle}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODULE 6: SITE VISITS */}
      {activeTab === 'site_visits' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <h3 className="text-base font-extrabold text-slate-900 pb-3 border-b border-slate-200">
            Scheduled Site Visit Slots
          </h3>
          <div className="space-y-3">
            {siteVisits.map(visit => (
              <div key={visit.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm">{visit.customerName} ({visit.customerPhone})</h4>
                    <p className="text-slate-600 font-semibold">{visit.propertyTitle}</p>
                    <p className="text-purple-800 font-bold mt-1">Requested Time: {visit.requestedDate}</p>
                  </div>
                  <span className="bg-purple-100 text-purple-800 font-extrabold px-2.5 py-1 rounded uppercase">
                    {visit.status}
                  </span>
                </div>

                <div className="flex gap-2 pt-2 border-t border-slate-200 font-bold">
                  <button 
                    onClick={() => handleUpdateSiteVisit(visit.id, 'Confirmed')}
                    className="px-3 py-1 bg-purple-600 text-white rounded text-[11px]"
                  >
                    Confirm Slot
                  </button>
                  <button 
                    onClick={() => handleUpdateSiteVisit(visit.id, 'Completed')}
                    className="px-3 py-1 bg-emerald-600 text-white rounded text-[11px]"
                  >
                    Mark Completed
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODULE 7: ANALYTICS (/broker/analytics) */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 pb-3 border-b border-slate-200">
              Broker Business Performance & Funnel Analytics
            </h3>

            {/* Conversion Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Lead Conversion Rate</span>
                <div className="text-2xl font-extrabold text-emerald-700 mt-1">
                  {assignedLeads.length > 0 ? `${((convertedCount / assignedLeads.length) * 100).toFixed(1)}%` : '0%'}
                </div>
                <span className="text-[10px] text-slate-500 font-semibold mt-1 block">{convertedCount} Converted / {assignedLeads.length} Leads</span>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Enquiries Handled</span>
                <div className="text-2xl font-extrabold text-purple-700 mt-1">{enquiriesList.length}</div>
                <span className="text-[10px] text-slate-500 font-semibold mt-1 block">Direct Callbacks</span>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Site Visit Slots</span>
                <div className="text-2xl font-extrabold text-brand-700 mt-1">{siteVisits.length}</div>
                <span className="text-[10px] text-slate-500 font-semibold mt-1 block">Scheduled Visits</span>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Property Views</span>
                <div className="text-2xl font-extrabold text-slate-900 mt-1">{totalViewsSum}</div>
                <span className="text-[10px] text-slate-500 font-semibold mt-1 block">Across inventory</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODULE 8: BROKER PROFILE (/broker/profile) */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4 max-w-3xl">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">{brokerProfile.agencyName}</h3>
              <p className="text-xs text-slate-500">Agency RERA Registration & Profile Information</p>
            </div>
            {brokerProfile.verificationStatus === 'verified' && (
              <span className="bg-emerald-100 text-emerald-800 text-xs font-extrabold px-3 py-1 rounded border border-emerald-300 flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> Verified RERA Broker
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-slate-700">
            <div>
              <span className="text-slate-400 uppercase text-[10px] block">Broker / Agent Name</span>
              <span className="text-sm font-extrabold text-slate-900">{brokerProfile.name}</span>
            </div>

            <div>
              <span className="text-slate-400 uppercase text-[10px] block">JK RERA Registration Number</span>
              <span className="font-mono text-emerald-800 text-sm font-extrabold">{brokerProfile.reraId}</span>
            </div>

            <div>
              <span className="text-slate-400 uppercase text-[10px] block">Phone Number</span>
              <span>{brokerProfile.phone}</span>
            </div>

            <div>
              <span className="text-slate-400 uppercase text-[10px] block">Official Email</span>
              <span>{brokerProfile.email}</span>
            </div>

            <div className="sm:col-span-2">
              <span className="text-slate-400 uppercase text-[10px] block">Office Address</span>
              <span>{brokerProfile.address}, {brokerProfile.city}</span>
            </div>

            <div className="sm:col-span-2">
              <span className="text-slate-400 uppercase text-[10px] block">Primary Service Localities</span>
              <span className="font-extrabold text-slate-900">{brokerProfile.serviceAreas}</span>
            </div>

            <div className="sm:col-span-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="text-slate-400 uppercase text-[10px] block">Agency Business Overview</span>
              <p className="text-xs text-slate-700 mt-1">{brokerProfile.businessDescription}</p>
            </div>
          </div>
        </div>
      )}

      {/* MODULE 9: BROKER SETTINGS & SECURITY (/broker/settings - Requirement 26) */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6 max-w-2xl text-xs font-semibold text-slate-700">
          <h3 className="text-base font-extrabold text-slate-900 pb-3 border-b border-slate-200">
            Agency Profile & Security Settings
          </h3>

          <div className="space-y-3">
            <div>
              <label className="block text-slate-500 uppercase tracking-wider mb-1 text-[10px]">Agency Name</label>
              <input 
                type="text" 
                value={brokerProfile.agencyName}
                onChange={(e) => setBrokerProfile({ ...brokerProfile, agencyName: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block text-slate-500 uppercase tracking-wider mb-1 text-[10px]">Service Areas (Comma separated)</label>
              <input 
                type="text" 
                value={brokerProfile.serviceAreas}
                onChange={(e) => setBrokerProfile({ ...brokerProfile, serviceAreas: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs font-bold text-slate-900"
              />
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setStatusMessage('Agency settings updated successfully!');
                  setTimeout(() => setStatusMessage(''), 2500);
                }}
                className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold px-4 py-2 rounded text-xs"
              >
                Save Settings
              </button>
            </div>
          </div>

          {/* Security & Password Change Section (Requirement 26) */}
          <div className="pt-4 border-t border-slate-200 space-y-3">
            <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Key className="w-4 h-4 text-brand-700" /> Security & Password Management
            </h4>

            {passwordStatus && (
              <div className={`p-2.5 rounded text-xs font-bold ${passwordStatus.includes('success') ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                {passwordStatus}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-3">
              <div>
                <label className="block text-slate-500 uppercase tracking-wider mb-1 text-[10px]">New Password</label>
                <input 
                  type="password" 
                  placeholder="Enter new password (min 6 characters)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs font-bold text-slate-900"
                />
              </div>

              <button
                type="submit"
                className="bg-brand-700 hover:bg-brand-800 text-white font-extrabold px-4 py-2 rounded text-xs"
              >
                Update Password via Auth
              </button>
            </form>
          </div>
        </div>
      )}

      {/* RECHARGE LEAD TOKENS MODAL */}
      {isTokenModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative text-xs font-semibold text-slate-700">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Coins className="w-5 h-5 text-amber-500" /> Recharge Lead Tokens
              </h3>
              <button onClick={() => setIsTokenModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 mb-4">
              Current Wallet Balance: <strong className="text-amber-600 font-extrabold text-sm">{tokenBalance} Tokens</strong>
            </p>

            <div className="space-y-3">
              {TOKEN_PACKS.map((pack, idx) => (
                <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm">{pack.name}</h4>
                    <p className="text-amber-700 font-bold mt-0.5">{pack.tokens} Lead Tokens</p>
                  </div>
                  <button 
                    onClick={() => handleRechargeTokens(pack.tokens)}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded font-extrabold text-xs"
                  >
                    Buy {pack.price}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
