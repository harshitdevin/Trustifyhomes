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
  X
} from 'lucide-react';
import { dbService } from '../services/dbService';

export default function BrokerDashboard({ properties, onOpenPostProperty, onSelectProperty }) {
  const [activeTab, setActiveTab] = useState('marketplace'); // marketplace | listings
  const [leadList, setLeadList] = useState(() => dbService.getLeadMarketplace());
  const [tokenBalance, setTokenBalance] = useState(() => dbService.getTokenBalance());
  const [brokerStatus, setBrokerStatus] = useState('Active'); // Active | Blacklisted
  const [leadSuccessMsg, setLeadSuccessMsg] = useState('');
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const TOKEN_PACKS = [
    { name: 'Starter Pack', tokens: 500, price: '₹2,500', popular: false },
    { name: 'Pro Dealer Pack', tokens: 1200, price: '₹5,000', popular: true },
    { name: 'Enterprise Pack', tokens: 3000, price: '₹10,000', popular: false }
  ];

  const handleBuyLead = (lead) => {
    if (brokerStatus === 'Blacklisted') {
      alert('Your broker account is suspended/blacklisted by Admin. You cannot purchase leads.');
      return;
    }

    if (tokenBalance < lead.leadPriceTokens) {
      alert(`Insufficient Tokens! You need ${lead.leadPriceTokens} tokens, but your balance is ${tokenBalance}. Please top up your wallet.`);
      setIsTokenModalOpen(true);
      return;
    }

    // Deduct tokens and unlock lead
    const updatedBalance = dbService.deductTokens(lead.leadPriceTokens);
    setTokenBalance(updatedBalance);

    const updatedLeads = dbService.buyLead(lead.id, 'Col. Vikram Singh (Duggar Realty)');
    setLeadList(updatedLeads);
    setLeadSuccessMsg(`Unlocked ${lead.buyerName}'s contact details! Deducted ${lead.leadPriceTokens} Lead Tokens.`);
    setTimeout(() => setLeadSuccessMsg(''), 3500);
  };

  const handleRechargeTokens = (pack) => {
    const newBal = dbService.rechargeTokens(pack.tokens);
    setTokenBalance(newBal);
    setPaymentSuccess(true);
    setTimeout(() => {
      setPaymentSuccess(false);
      setIsTokenModalOpen(false);
    }, 1500);
  };

  const purchasedLeadsCount = leadList.filter(l => l.isPurchased).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Banner Header */}
      <div className="bg-slate-900 text-white rounded-xl p-6 shadow-md border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-amber-500 text-slate-950 p-3 rounded-xl font-bold">
            <Briefcase className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">Verified Broker Hub & Lead Marketplace</h2>
              {brokerStatus === 'Active' ? (
                <span className="bg-emerald-500 text-slate-950 text-xs font-extrabold px-2.5 py-0.5 rounded flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> JK RERA Verified Agent
                </span>
              ) : (
                <span className="bg-red-600 text-white text-xs font-extrabold px-2.5 py-0.5 rounded flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5" /> Account Suspended
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Duggar Realty Jammu (License: JKRERA/JM/AGENT/2024/00889) • Gandhi Nagar, Jammu
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Token Wallet Display Widget */}
          <div className="bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-lg flex items-center gap-2">
            <Coins className="w-5 h-5 text-amber-400" />
            <div className="text-left">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Token Balance</span>
              <span className="text-sm font-extrabold text-amber-400 font-mono">{tokenBalance.toLocaleString('en-IN')} Tokens</span>
            </div>
            <button 
              onClick={() => setIsTokenModalOpen(true)}
              className="ml-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-[11px] px-2.5 py-1 rounded transition-colors"
            >
              + Buy Tokens
            </button>
          </div>

          <button 
            onClick={onOpenPostProperty}
            className="ez-btn-primary bg-amber-500 text-slate-950 hover:bg-amber-400 font-bold text-xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post Jammu Property</span>
          </button>
        </div>
      </div>

      {leadSuccessMsg && (
        <div className="bg-emerald-50 text-emerald-800 border border-emerald-300 px-4 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{leadSuccessMsg}</span>
        </div>
      )}

      {/* Stats Counter Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Token Wallet Balance</span>
          <div className="text-2xl font-extrabold text-amber-600 mt-1 flex items-center gap-1 font-mono">
            <Coins className="w-5 h-5 text-amber-500" />
            {tokenBalance.toLocaleString('en-IN')}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Hot Jammu Leads</span>
          <div className="text-2xl font-extrabold text-brand-700 mt-1">{leadList.length} Leads</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Leads Purchased</span>
          <div className="text-2xl font-extrabold text-emerald-700 mt-1">{purchasedLeadsCount} Unlocked</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Est. Commission Pool</span>
          <div className="text-2xl font-extrabold text-amber-700 mt-1">₹7.87 Lac</div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="border-b border-slate-200 px-6 pt-4 flex items-center gap-6 text-sm font-bold">
          <button 
            onClick={() => setActiveTab('marketplace')}
            className={`pb-3 transition-colors border-b-2 flex items-center gap-1.5 ${
              activeTab === 'marketplace' 
                ? 'border-brand-700 text-brand-700 font-extrabold' 
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Coins className="w-4 h-4 text-amber-600" />
            Buy Buyer Leads Marketplace ({leadList.length})
          </button>

          <button 
            onClick={() => setActiveTab('listings')}
            className={`pb-3 transition-colors border-b-2 ${
              activeTab === 'listings' 
                ? 'border-brand-700 text-brand-700 font-extrabold' 
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            My Active Properties ({properties.length})
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'marketplace' ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-slate-900">
                  Exclusive High-Intent Buyer Leads in Jammu
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-semibold">
                    Leads filtered by price & commission
                  </span>
                  <button 
                    onClick={() => setIsTokenModalOpen(true)}
                    className="text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded border border-amber-300"
                  >
                    + Top Up Tokens
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {leadList.map(lead => (
                  <div key={lead.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="bg-blue-100 text-brand-800 text-[10px] font-extrabold px-2 py-0.5 rounded border border-blue-200 uppercase">
                          {lead.locality}, Jammu • {lead.propertyType}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold">{lead.inquiryDate}</span>
                      </div>

                      <h4 className="text-base font-extrabold text-slate-900">{lead.buyerName}</h4>
                      
                      {/* Price & Commission Pill Box */}
                      <div className="bg-white p-2.5 rounded-lg border border-slate-200 my-2 grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-slate-400 text-[10px] font-bold block uppercase">Estimated Price Budget</span>
                          <span className="text-sm font-extrabold text-slate-900">{lead.budgetDisplay}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[10px] font-bold block uppercase">Broker Commission ({lead.expectedCommissionRate})</span>
                          <span className="text-sm font-extrabold text-emerald-700">{lead.estimatedCommissionVal}</span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed bg-white/60 p-2 rounded border border-slate-200">
                        "{lead.note}"
                      </p>
                    </div>

                    {/* Unlocked Contact vs Lock CTA */}
                    <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-2">
                      {lead.isPurchased ? (
                        <div className="flex items-center justify-between w-full">
                          <div className="text-xs">
                            <span className="text-emerald-700 font-extrabold flex items-center gap-1">
                              <Unlock className="w-3.5 h-3.5" /> Lead Contact Unlocked
                            </span>
                            <span className="font-mono text-slate-900 font-bold block">{lead.buyerPhone}</span>
                          </div>

                          <div className="flex items-center gap-1">
                            <a 
                              href={`tel:${lead.buyerPhone}`}
                              className="ez-btn-primary py-1.5 px-3 text-xs bg-slate-900 hover:bg-slate-800"
                            >
                              <PhoneCall className="w-3.5 h-3.5" /> Call
                            </a>
                            <a 
                              href={`https://wa.me/${lead.buyerPhone.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="ez-btn-whatsapp py-1.5 px-3 text-xs"
                            >
                              <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
                            </a>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between w-full">
                          <div className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                            <Lock className="w-3.5 h-3.5 text-slate-400" /> Phone number hidden
                          </div>
                          <button 
                            onClick={() => handleBuyLead(lead)}
                            className="ez-btn-primary bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs py-2 px-3"
                          >
                            <Coins className="w-3.5 h-3.5" />
                            <span>Unlock Lead ({lead.leadPriceTokens} Tokens)</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {properties.map(p => (
                  <div key={p.id} className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex gap-4">
                    <img src={p.images[0]} alt={p.title} className="w-24 h-24 object-cover rounded border border-slate-300 shrink-0" />
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] font-bold text-brand-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                            {p.bhk} BHK • {p.city}
                          </span>
                          <span className="text-xs font-extrabold text-slate-900">{p.priceDisplay}</span>
                        </div>
                        <h4 className="font-bold text-sm text-slate-900 mt-1 line-clamp-1">{p.title}</h4>
                        <p className="text-xs text-slate-500">{p.locality}</p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs">
                        <span className="text-emerald-700 font-bold text-[11px] flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5" /> RERA Verified
                        </span>
                        <button 
                          onClick={() => onSelectProperty(p)}
                          className="text-brand-700 font-bold hover:underline"
                        >
                          View Listing →
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Buy Lead Tokens Modal Dialog */}
      {isTokenModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 relative my-auto space-y-4">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="bg-amber-100 text-amber-900 p-2 rounded-lg">
                  <Coins className="w-5 h-5 text-amber-700" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Buy Lead Tokens Wallet Recharge</h3>
                  <p className="text-xs text-slate-500">Current Balance: <strong className="text-amber-700">{tokenBalance} Tokens</strong></p>
                </div>
              </div>
              <button onClick={() => setIsTokenModalOpen(false)} className="p-1 rounded text-slate-400 hover:text-slate-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            {paymentSuccess ? (
              <div className="bg-emerald-50 border border-emerald-300 p-6 rounded-xl text-center space-y-2">
                <div className="w-12 h-12 bg-emerald-700 text-white rounded-full flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6 stroke-[3]" />
                </div>
                <h4 className="text-base font-extrabold text-slate-900">Payment Successful!</h4>
                <p className="text-xs text-slate-600 font-medium">Your Lead Token wallet balance has been updated instantly.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Select Token Recharge Pack</span>
                <div className="space-y-2.5">
                  {TOKEN_PACKS.map((pack, idx) => (
                    <div 
                      key={idx} 
                      className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                        pack.popular 
                          ? 'bg-amber-50/50 border-amber-400 ring-2 ring-amber-400/20' 
                          : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-extrabold text-slate-900">{pack.name}</h4>
                          {pack.popular && (
                            <span className="bg-amber-500 text-slate-950 text-[10px] font-extrabold px-2 py-0.2 rounded uppercase">
                              Best Value
                            </span>
                          )}
                        </div>
                        <span className="text-xs font-extrabold text-amber-700 flex items-center gap-1 mt-0.5">
                          <Coins className="w-3.5 h-3.5" /> +{pack.tokens} Lead Tokens
                        </span>
                      </div>

                      <div className="text-right">
                        <div className="text-base font-extrabold text-slate-900">{pack.price}</div>
                        <button 
                          onClick={() => handleRechargeTokens(pack)}
                          className="mt-1 ez-btn-primary py-1 px-3 text-xs bg-slate-900 hover:bg-slate-800"
                        >
                          Recharge Now
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-[11px] text-slate-500 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Instant UPI / NetBanking payment simulation under Indian banking standards.</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
