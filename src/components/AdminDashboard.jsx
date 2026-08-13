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
  Coins,
  Send,
  FileText,
  Clock,
  Briefcase,
  TrendingUp,
  UserCheck
} from 'lucide-react';
import { dbService } from '../services/dbService';

export default function AdminDashboard({ properties, onSelectProperty, onOpenPostProperty }) {
  const [activeTab, setActiveTab] = useState('brokers'); // brokers | deals | customers | audit | leads | inventory
  const [brokersList, setBrokersList] = useState(() => dbService.getBrokersList());
  const [propertyList, setPropertyList] = useState(properties);
  const [leadList, setLeadList] = useState(() => dbService.getLeadMarketplace());
  const [dealsList, setDealsList] = useState(() => dbService.getDeals());
  const [auditLogs, setAuditLogs] = useState(() => dbService.getAuditLogs());
  const [customersList, setCustomersList] = useState(() => dbService.getCustomers());
  const [statusMessage, setStatusMessage] = useState('');

  // Form state for posting lead to broker marketplace
  const [isPostLeadModalOpen, setIsPostLeadModalOpen] = useState(false);
  const [newLeadBuyerName, setNewLeadBuyerName] = useState('');
  const [newLeadBuyerPhone, setNewLeadBuyerPhone] = useState('');
  const [newLeadLocality, setNewLeadLocality] = useState('Gandhi Nagar');
  const [newLeadBudgetDisplay, setNewLeadBudgetDisplay] = useState('₹1.50 Cr');
  const [newLeadPriceVal, setNewLeadPriceVal] = useState(15000000);
  const [newLeadCommissionRate, setNewLeadCommissionRate] = useState('1.5%');

  const handleToggleBlacklist = (brokerId) => {
    const updated = dbService.toggleBrokerBlacklist(brokerId);
    setBrokersList(updated);
    setAuditLogs(dbService.getAuditLogs());
    setStatusMessage('Broker status updated (Blacklisted/Active status changed)!');
    setTimeout(() => setStatusMessage(''), 2500);
  };

  const handleApproveProperty = (propId) => {
    setPropertyList(propertyList.map(p => p.id === propId ? { ...p, isReraVerified: true } : p));
    dbService.addAuditLog('PROPERTY_APPROVED', 'Admin', `Approved property ID: ${propId}`);
    setAuditLogs(dbService.getAuditLogs());
    setStatusMessage('Property verified & approved for Jammu feed!');
    setTimeout(() => setStatusMessage(''), 2500);
  };

  const handleDeleteProperty = (propId) => {
    setPropertyList(propertyList.filter(p => p.id !== propId));
    dbService.addAuditLog('PROPERTY_DELETED', 'Admin', `Deleted property ID: ${propId}`);
    setAuditLogs(dbService.getAuditLogs());
    setStatusMessage('Property removed from inventory!');
    setTimeout(() => setStatusMessage(''), 2500);
  };

  const handlePostLeadSubmit = (e) => {
    e.preventDefault();
    const estCommissionVal = `₹${((newLeadPriceVal * parseFloat(newLeadCommissionRate)) / 100 / 100000).toFixed(2)} Lac`;
    const newLeadObj = {
      id: `lead-admin-${Date.now()}`,
      buyerName: newLeadBuyerName || 'Hot Jammu Buyer',
      buyerPhone: newLeadBuyerPhone || '+91 94191 00000',
      locality: newLeadLocality,
      city: 'Jammu',
      propertyType: 'apartment',
      budgetDisplay: newLeadBudgetDisplay,
      priceVal: Number(newLeadPriceVal),
      expectedCommissionRate: newLeadCommissionRate,
      estimatedCommissionVal: estCommissionVal,
      leadPriceTokens: 400,
      isPurchased: false,
      purchasedBy: null,
      inquiryDate: 'Just now (Admin Posted)',
      note: `Direct admin inquiry for ${newLeadLocality} Jammu property.`
    };

    const updatedLeads = dbService.adminPostLead(newLeadObj);
    setLeadList(updatedLeads);
    setAuditLogs(dbService.getAuditLogs());
    setIsPostLeadModalOpen(false);
    setStatusMessage('New buyer lead posted to Broker Lead Marketplace!');
    setTimeout(() => setStatusMessage(''), 2500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Admin Banner Header */}
      <div className="bg-purple-950 text-white rounded-xl p-6 shadow-md border border-purple-900 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-purple-600 text-white p-3 rounded-xl">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">Master Admin Control & Analytics Hub</h2>
              <span className="bg-purple-600 text-white text-xs font-bold px-2 py-0.5 rounded">
                Superuser Control
              </span>
            </div>
            <p className="text-xs sm:text-sm text-purple-200 mt-1">
              Broker Blacklisting • Deals & Commission Hub • Customer CRM • System Audit Logs
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsPostLeadModalOpen(true)}
            className="ez-btn-primary bg-amber-500 text-slate-950 hover:bg-amber-400 font-bold text-xs"
          >
            <Send className="w-4 h-4" />
            <span>Post Lead to Brokers</span>
          </button>

          <button 
            onClick={onOpenPostProperty}
            className="ez-btn-outline border-purple-400 text-white hover:bg-purple-900 font-bold text-xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post Admin Property</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="bg-emerald-50 text-emerald-800 border border-emerald-300 px-4 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Admin System Counter Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Deals Value</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">₹3.60 Cr</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Registered Brokers</span>
          <div className="text-2xl font-extrabold text-purple-700 mt-1">{brokersList.length} Brokers</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Active Customers</span>
          <div className="text-2xl font-extrabold text-brand-700 mt-1">{customersList.length} Accounts</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">System Audit Events</span>
          <div className="text-2xl font-extrabold text-emerald-700 mt-1">{auditLogs.length} Events</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="border-b border-slate-200 px-6 pt-4 flex items-center gap-6 text-sm font-bold overflow-x-auto">
          <button 
            onClick={() => setActiveTab('brokers')}
            className={`pb-3 transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'brokers' 
                ? 'border-purple-700 text-purple-900 font-extrabold' 
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Broker Master & Blacklisting ({brokersList.length})
          </button>
          <button 
            onClick={() => setActiveTab('deals')}
            className={`pb-3 transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'deals' 
                ? 'border-purple-700 text-purple-900 font-extrabold' 
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Deals & Commission Hub ({dealsList.length})
          </button>
          <button 
            onClick={() => setActiveTab('customers')}
            className={`pb-3 transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'customers' 
                ? 'border-purple-700 text-purple-900 font-extrabold' 
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Customer Inventory Controls ({customersList.length})
          </button>
          <button 
            onClick={() => setActiveTab('audit')}
            className={`pb-3 transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'audit' 
                ? 'border-purple-700 text-purple-900 font-extrabold' 
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            System Activity Audit Logs ({auditLogs.length})
          </button>
          <button 
            onClick={() => setActiveTab('inventory')}
            className={`pb-3 transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'inventory' 
                ? 'border-purple-700 text-purple-900 font-extrabold' 
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Property Inventory ({propertyList.length})
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'brokers' ? (
            /* Broker Master & Blacklisting Control Table */
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-extrabold">
                    <th className="p-3 border border-slate-200">Broker Name & Agency</th>
                    <th className="p-3 border border-slate-200">Broker Type</th>
                    <th className="p-3 border border-slate-200">RERA License ID</th>
                    <th className="p-3 border border-slate-200">Locality</th>
                    <th className="p-3 border border-slate-200">Earned Commission</th>
                    <th className="p-3 border border-slate-200">Status</th>
                    <th className="p-3 border border-slate-200 text-right">Blacklist Control</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium">
                  {brokersList.map(b => (
                    <tr key={b.id} className="hover:bg-slate-50">
                      <td className="p-3 border border-slate-200">
                        <div className="font-bold text-slate-900">{b.name}</div>
                        <div className="text-[11px] text-slate-500">{b.agencyName} • {b.phone}</div>
                      </td>
                      <td className="p-3 border border-slate-200 font-bold">{b.brokerType}</td>
                      <td className="p-3 border border-slate-200 font-mono text-[11px] text-slate-700">{b.reraId}</td>
                      <td className="p-3 border border-slate-200">{b.locality}</td>
                      <td className="p-3 border border-slate-200 font-bold text-emerald-700">{b.totalCommissionEarned}</td>
                      <td className="p-3 border border-slate-200">
                        {b.status === 'Active' ? (
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 w-max">
                            <ShieldCheck className="w-3 h-3 text-emerald-700" /> Active Agent
                          </span>
                        ) : (
                          <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 w-max">
                            <Ban className="w-3 h-3 text-red-700" /> Blacklisted
                          </span>
                        )}
                      </td>
                      <td className="p-3 border border-slate-200 text-right">
                        <button 
                          onClick={() => handleToggleBlacklist(b.id)}
                          className={`font-bold px-2.5 py-1 rounded text-[11px] flex items-center gap-1 ml-auto ${
                            b.status === 'Active' 
                              ? 'bg-red-600 hover:bg-red-700 text-white' 
                              : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          }`}
                        >
                          {b.status === 'Active' ? (
                            <>
                              <Ban className="w-3 h-3" /> Blacklist Broker
                            </>
                          ) : (
                            <>
                              <RotateCcw className="w-3 h-3" /> Reactivate Agent
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : activeTab === 'deals' ? (
            /* Deals & Commission Management Tab */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-extrabold text-slate-900">Active & Completed Jammu Property Deals</h4>
                <span className="text-xs text-slate-500 font-semibold">Tracks deal stage, broker commission, and platform share</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-extrabold">
                      <th className="p-3 border border-slate-200">Property Title</th>
                      <th className="p-3 border border-slate-200">Buyer Name</th>
                      <th className="p-3 border border-slate-200">Broker Assigned</th>
                      <th className="p-3 border border-slate-200">Agreed Deal Amount</th>
                      <th className="p-3 border border-slate-200">Broker Commission</th>
                      <th className="p-3 border border-slate-200">Platform Share</th>
                      <th className="p-3 border border-slate-200">Deal Stage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-medium">
                    {dealsList.map(deal => (
                      <tr key={deal.id} className="hover:bg-slate-50">
                        <td className="p-3 border border-slate-200 font-bold text-slate-900">{deal.propertyTitle}</td>
                        <td className="p-3 border border-slate-200">{deal.buyerName}</td>
                        <td className="p-3 border border-slate-200 font-semibold text-slate-800">{deal.brokerName}</td>
                        <td className="p-3 border border-slate-200 font-extrabold text-slate-900">{deal.dealAmountDisplay}</td>
                        <td className="p-3 border border-slate-200 font-bold text-emerald-700">{deal.brokerCommission}</td>
                        <td className="p-3 border border-slate-200 font-bold text-purple-700">{deal.platformCut}</td>
                        <td className="p-3 border border-slate-200">
                          <span className="bg-blue-100 text-brand-800 text-[10px] font-bold px-2 py-0.5 rounded border border-blue-200">
                            {deal.stage}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : activeTab === 'customers' ? (
            /* Customer Controls & CRM Tab */
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-extrabold">
                    <th className="p-3 border border-slate-200">Customer Name & Phone</th>
                    <th className="p-3 border border-slate-200">Email</th>
                    <th className="p-3 border border-slate-200">City</th>
                    <th className="p-3 border border-slate-200">Budget Preference</th>
                    <th className="p-3 border border-slate-200">Saved Shortlists</th>
                    <th className="p-3 border border-slate-200">Callback Enquiries</th>
                    <th className="p-3 border border-slate-200">Account Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium">
                  {customersList.map(c => (
                    <tr key={c.id} className="hover:bg-slate-50">
                      <td className="p-3 border border-slate-200">
                        <div className="font-bold text-slate-900">{c.name}</div>
                        <div className="font-mono text-slate-500 text-[11px]">{c.phone}</div>
                      </td>
                      <td className="p-3 border border-slate-200">{c.email}</td>
                      <td className="p-3 border border-slate-200">{c.city}</td>
                      <td className="p-3 border border-slate-200 font-bold text-slate-800">{c.budgetPreference}</td>
                      <td className="p-3 border border-slate-200 font-extrabold text-red-600">{c.shortlistedCount} Saved</td>
                      <td className="p-3 border border-slate-200 font-bold text-brand-700">{c.callbacksCount} Requests</td>
                      <td className="p-3 border border-slate-200">
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : activeTab === 'audit' ? (
            /* System Activity Audit Logs Tab */
            <div className="space-y-3">
              {auditLogs.map(log => (
                <div key={log.id} className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex items-start justify-between gap-3 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded uppercase ${
                        log.severity === 'warning' ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {log.action}
                      </span>
                      <span className="font-bold text-slate-900">{log.actor}</span>
                    </div>
                    <p className="text-slate-700 mt-1">{log.details}</p>
                  </div>

                  <span className="text-[10px] text-slate-400 font-bold shrink-0 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {log.timestamp}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            /* Property Inventory Master Control */
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-extrabold">
                    <th className="p-3 border border-slate-200">Property Title</th>
                    <th className="p-3 border border-slate-200">Locality</th>
                    <th className="p-3 border border-slate-200">Price</th>
                    <th className="p-3 border border-slate-200">RERA ID</th>
                    <th className="p-3 border border-slate-200">Seller Type</th>
                    <th className="p-3 border border-slate-200">Status</th>
                    <th className="p-3 border border-slate-200 text-right">Master Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium">
                  {propertyList.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="p-3 border border-slate-200 font-bold text-slate-900 max-w-xs truncate">{p.title}</td>
                      <td className="p-3 border border-slate-200">{p.locality}, {p.city}</td>
                      <td className="p-3 border border-slate-200 font-extrabold text-slate-900">{p.priceDisplay}</td>
                      <td className="p-3 border border-slate-200 font-mono text-[11px]">{p.reraId}</td>
                      <td className="p-3 border border-slate-200 font-bold">{p.sellerType}</td>
                      <td className="p-3 border border-slate-200">
                        {p.isReraVerified ? (
                          <span className="text-emerald-700 font-bold">Approved</span>
                        ) : (
                          <span className="text-amber-700 font-bold">Pending</span>
                        )}
                      </td>
                      <td className="p-3 border border-slate-200 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button 
                            onClick={() => onSelectProperty(p)}
                            className="bg-slate-100 hover:bg-slate-200 p-1.5 rounded text-slate-800"
                            title="Inspect"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          {!p.isReraVerified && (
                            <button 
                              onClick={() => handleApproveProperty(p.id)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2 py-1 rounded text-[10px]"
                            >
                              Approve
                            </button>
                          )}
                          <button 
                            onClick={() => handleDeleteProperty(p.id)}
                            className="bg-red-100 hover:bg-red-200 text-red-700 p-1.5 rounded"
                            title="Delete Listing"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Admin Post Lead Modal */}
      {isPostLeadModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-2xl border border-slate-200 relative my-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-sm font-extrabold text-slate-900">Post Buyer Lead to Broker Marketplace</h3>
              <button onClick={() => setIsPostLeadModalOpen(false)} className="p-1 rounded text-slate-400 hover:text-slate-800">
                ✕
              </button>
            </div>

            <form onSubmit={handlePostLeadSubmit} className="space-y-3 text-xs font-semibold text-slate-700">
              <div>
                <label className="block text-slate-500 uppercase text-[10px]">Buyer Name</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Ramesh Jamwal"
                  value={newLeadBuyerName}
                  onChange={(e) => setNewLeadBuyerName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-500 uppercase text-[10px]">Buyer Phone Number</label>
                <input 
                  type="tel"
                  required
                  placeholder="+91 94191 00000"
                  value={newLeadBuyerPhone}
                  onChange={(e) => setNewLeadBuyerPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-500 uppercase text-[10px]">Jammu Locality</label>
                  <input 
                    type="text"
                    required
                    value={newLeadLocality}
                    onChange={(e) => setNewLeadLocality(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 uppercase text-[10px]">Budget Display</label>
                  <input 
                    type="text"
                    required
                    value={newLeadBudgetDisplay}
                    onChange={(e) => setNewLeadBudgetDisplay(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none font-extrabold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-500 uppercase text-[10px]">Expected Broker Commission Rate (%)</label>
                <select 
                  value={newLeadCommissionRate}
                  onChange={(e) => setNewLeadCommissionRate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1.5 text-xs font-bold text-slate-900 focus:outline-none"
                >
                  <option value="1.0%">1.0% Commission</option>
                  <option value="1.5%">1.5% Commission</option>
                  <option value="2.0%">2.0% Commission</option>
                </select>
              </div>

              <button 
                type="submit"
                className="w-full bg-purple-900 hover:bg-purple-950 text-white font-extrabold py-2.5 rounded text-xs transition-colors shadow-sm uppercase tracking-wider"
              >
                Publish Lead to Brokers
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
