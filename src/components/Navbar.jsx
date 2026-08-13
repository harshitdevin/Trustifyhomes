import React from 'react';
import { 
  Building2, 
  MapPin, 
  PlusCircle, 
  Heart, 
  Layers, 
  Calculator, 
  Compass, 
  ShieldCheck, 
  Briefcase,
  User,
  ShieldAlert
} from 'lucide-react';
import { CITIES_DATA } from '../data/citiesAndLocalities';

export default function Navbar({ 
  selectedCity, 
  setSelectedCity, 
  activeTab, 
  setActiveTab,
  shortlistCount, 
  compareCount, 
  onOpenEmi, 
  onOpenEligibility,
  onOpenRentAgreement,
  onOpenUnitConverter, 
  onOpenStampDuty, 
  onOpenCompare, 
  onOpenPostProperty,
  userRole,
  setUserRole,
  activeView,
  setActiveView
}) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
      {/* Top Strip - RERA Trust & Tools Bar */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-emerald-400 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              100% JK RERA Verified & Govt Registered Platform
            </span>
            <span className="hidden md:inline text-slate-500">•</span>
            <span className="hidden md:inline text-slate-400">Jammu Real Estate Portal</span>
          </div>

          <div className="flex items-center gap-4 text-slate-300">
            <button 
              onClick={onOpenEmi} 
              className="hover:text-white flex items-center gap-1 transition-colors"
            >
              <Calculator className="w-3 h-3 text-amber-400" />
              <span>EMI Calc</span>
            </button>
            <span className="text-slate-600">|</span>
            <button 
              onClick={onOpenEligibility} 
              className="hover:text-white flex items-center gap-1 transition-colors"
            >
              <ShieldCheck className="w-3 h-3 text-blue-400" />
              <span>Loan Eligibility</span>
            </button>
            <span className="text-slate-600">|</span>
            <button 
              onClick={onOpenRentAgreement} 
              className="hover:text-white flex items-center gap-1 transition-colors"
            >
              <Compass className="w-3 h-3 text-emerald-400" />
              <span>Rent Agreement</span>
            </button>
            <span className="text-slate-600">|</span>
            <button 
              onClick={onOpenUnitConverter} 
              className="hover:text-white flex items-center gap-1 transition-colors"
            >
              <span>Area Converter (Kanal)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
        {/* Brand Logo & City Selector */}
        <div className="flex items-center gap-4 lg:gap-6">
          <div 
            onClick={() => { setActiveView('marketplace'); setActiveTab('buy'); }} 
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="bg-brand-700 text-white p-2 rounded-lg group-hover:bg-brand-800 transition-colors">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-extrabold tracking-tight text-slate-900">EZ HOMES</span>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded border border-emerald-300">
                  JAMMU
                </span>
              </div>
              <p className="text-[10px] font-medium text-slate-500 tracking-wide uppercase">Jammu Real Estate Portal</p>
            </div>
          </div>

          {/* City Selection Dropdown */}
          <div className="relative">
            <div className="flex items-center gap-1.5 bg-slate-100 border border-slate-300 px-3 py-1.5 rounded-md hover:border-slate-400 cursor-pointer">
              <MapPin className="w-4 h-4 text-brand-700" />
              <select 
                value={selectedCity.id}
                onChange={(e) => {
                  const c = CITIES_DATA.find(ci => ci.id === e.target.value);
                  if (c) setSelectedCity(c);
                }}
                className="bg-transparent text-sm font-bold text-slate-800 outline-none cursor-pointer pr-1"
                aria-label="Select City"
              >
                {CITIES_DATA.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Primary View Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 font-semibold text-sm">
          <button 
            onClick={() => { setActiveView('marketplace'); setActiveTab('buy'); }}
            className={`px-3.5 py-2 rounded-md transition-colors ${
              activeView === 'marketplace' && activeTab === 'buy' 
                ? 'bg-blue-50 text-brand-700 font-bold border border-blue-200' 
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            Buy Homes
          </button>

          <button 
            onClick={() => { setActiveView('marketplace'); setActiveTab('rent'); }}
            className={`px-3.5 py-2 rounded-md transition-colors ${
              activeView === 'marketplace' && activeTab === 'rent' 
                ? 'bg-blue-50 text-brand-700 font-bold border border-blue-200' 
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            Rent / Lease
          </button>

          <button 
            onClick={() => { setActiveView('marketplace'); setActiveTab('plot'); }}
            className={`px-3.5 py-2 rounded-md transition-colors ${
              activeView === 'marketplace' && activeTab === 'plot' 
                ? 'bg-blue-50 text-brand-700 font-bold border border-blue-200' 
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            Plots (Kanal/Marla)
          </button>

          {/* Role-Specific Portal Button */}
          {userRole === 'admin' && (
            <button 
              onClick={() => setActiveView('admin')}
              className={`px-3.5 py-2 rounded-md transition-colors flex items-center gap-1.5 ${
                activeView === 'admin' 
                  ? 'bg-purple-100 text-purple-900 font-extrabold border border-purple-300' 
                  : 'text-purple-800 hover:bg-purple-50 font-bold'
              }`}
            >
              <ShieldAlert className="w-4 h-4 text-purple-700" />
              Admin Portal
            </button>
          )}

          {userRole === 'broker' && (
            <button 
              onClick={() => setActiveView('broker')}
              className={`px-3.5 py-2 rounded-md transition-colors flex items-center gap-1.5 ${
                activeView === 'broker' 
                  ? 'bg-amber-100 text-amber-950 font-extrabold border border-amber-300' 
                  : 'text-amber-900 hover:bg-amber-50 font-bold'
              }`}
            >
              <Briefcase className="w-4 h-4 text-amber-700" />
              Broker Hub & Leads
            </button>
          )}
        </nav>

        {/* User Role Switcher & Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Role Selection Dropdown */}
          <div className="flex items-center gap-1 bg-slate-100 border border-slate-300 px-2 py-1.5 rounded-md text-xs font-bold">
            <span className="text-slate-400 hidden lg:inline">Role:</span>
            <select 
              value={userRole}
              onChange={(e) => {
                const role = e.target.value;
                setUserRole(role);
                if (role === 'admin') setActiveView('admin');
                else if (role === 'broker') setActiveView('broker');
                else setActiveView('marketplace');
              }}
              className="bg-transparent font-extrabold text-slate-900 outline-none cursor-pointer uppercase text-[11px]"
            >
              <option value="customer">Customer (Buyer)</option>
              <option value="broker">Broker (Agent)</option>
              <option value="admin">Admin (Superuser)</option>
            </select>
          </div>

          {/* Profile Page Link */}
          <button 
            onClick={() => setActiveView('profile')}
            className={`p-2 rounded-md transition-colors flex items-center gap-1 text-xs font-bold ${
              activeView === 'profile' 
                ? 'bg-brand-700 text-white' 
                : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
            }`}
            title="Manage Profile"
          >
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">Profile</span>
          </button>

          {/* Shortlists Button */}
          <button 
            onClick={() => { setActiveView('marketplace'); setActiveTab('saved'); }}
            className={`relative p-2 rounded-md transition-colors flex items-center gap-1 text-sm font-medium ${
              activeView === 'marketplace' && activeTab === 'saved' ? 'bg-red-50 text-red-700' : 'text-slate-700 hover:bg-slate-100'
            }`}
            title="View saved shortlisted properties"
          >
            <Heart className={`w-5 h-5 ${shortlistCount > 0 ? 'text-red-600 fill-red-600' : 'text-slate-600'}`} />
            <span className="hidden sm:inline">Saved</span>
            {shortlistCount > 0 && (
              <span className="bg-red-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {shortlistCount}
              </span>
            )}
          </button>

          {/* Post Property Button (ONLY FOR BROKER AND ADMIN - HIDDEN FOR CUSTOMERS) */}
          {(userRole === 'broker' || userRole === 'admin') && (
            <button 
              onClick={onOpenPostProperty}
              className="ez-btn-primary bg-amber-600 hover:bg-amber-700 text-white shadow-sm text-sm"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Post Property</span>
              <span className="bg-white text-amber-800 text-[10px] font-extrabold px-1.5 py-0.2 rounded uppercase">
                FREE
              </span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
