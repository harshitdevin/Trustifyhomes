import React from 'react';
import { 
  Building2, 
  MapPin, 
  PlusCircle, 
  Heart, 
  Calculator, 
  Compass, 
  ShieldCheck, 
  Briefcase,
  User,
  ShieldAlert,
  LogOut,
  LogIn,
  LayoutDashboard,
  BarChart3,
  Users,
  Building,
  Home,
  Activity,
  MessageSquare,
  Calendar,
  CreditCard,
  Settings,
  Send,
  Sparkles,
  Search
} from 'lucide-react';
import { CITIES_DATA } from '../data/citiesAndLocalities';

export default function Navbar({ 
  selectedCity, 
  setSelectedCity, 
  activeTab, 
  setActiveTab,
  shortlistCount, 
  onOpenEmi, 
  onOpenEligibility,
  onOpenRentAgreement,
  onOpenUnitConverter, 
  onOpenPostProperty,
  userRole,
  setUserRole,
  activeView,
  setActiveView,
  currentUser,
  onOpenAuth,
  onLogout,
  adminTab,
  setAdminTab,
  brokerTab,
  setBrokerTab
}) {
  const isConsumerView = activeView === 'marketplace' || activeView === 'profile';
  const isAdminView = activeView === 'admin';
  const isBrokerView = activeView === 'broker' || activeView === 'owner';

  const ADMIN_NAV_SECTIONS = [
    { id: 'home', label: 'Overview', icon: LayoutDashboard },
    { id: 'statistics', label: 'Statistics', icon: BarChart3 },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'properties', label: 'Properties', icon: Building },
    { id: 'pg', label: 'PG Listings', icon: Home },
    { id: 'brokers', label: 'Brokers', icon: Briefcase },
    { id: 'leads', label: 'Leads', icon: Activity },
    { id: 'verification', label: 'Verification', icon: ShieldCheck },
    { id: 'enquiries', label: 'Enquiries', icon: MessageSquare },
    { id: 'site_visits', label: 'Site Visits', icon: Calendar },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'settings', label: 'Logs', icon: Settings }
  ];

  const BROKER_NAV_SECTIONS = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'inventory', label: 'My Inventory', icon: Building },
    { id: 'leads', label: 'My Leads', icon: Send },
    { id: 'marketplace', label: 'Marketplace', icon: Sparkles },
    { id: 'enquiries', label: 'Enquiries', icon: MessageSquare },
    { id: 'site_visits', label: 'Site Visits', icon: Calendar },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
        {/* Brand Logo & City Selector */}
        <div className="flex items-center gap-4 lg:gap-6 shrink-0">
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
          <div className="relative hidden sm:block">
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

        {/* Dynamic Navigation Bar Style according to Active View */}
        <nav className="hidden lg:flex items-center gap-1 font-semibold text-xs overflow-x-auto py-1">
          {/* Consumer View Links (Shown ONLY on Marketplace / Consumer view) */}
          {isConsumerView && (
            <>
              <button 
                onClick={() => { setActiveView('marketplace'); setActiveTab('buy'); }}
                className={`px-3 py-2 rounded-md transition-colors ${
                  activeView === 'marketplace' && activeTab === 'buy' 
                    ? 'bg-blue-50 text-brand-700 font-bold border border-blue-200' 
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                Buy Homes
              </button>

              <button 
                onClick={() => { setActiveView('marketplace'); setActiveTab('rent'); }}
                className={`px-3 py-2 rounded-md transition-colors ${
                  activeView === 'marketplace' && activeTab === 'rent' 
                    ? 'bg-blue-50 text-brand-700 font-bold border border-blue-200' 
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                Rent / Lease
              </button>

              <button 
                onClick={() => { setActiveView('marketplace'); setActiveTab('plot'); }}
                className={`px-3 py-2 rounded-md transition-colors ${
                  activeView === 'marketplace' && activeTab === 'plot' 
                    ? 'bg-blue-50 text-brand-700 font-bold border border-blue-200' 
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                Plots (Kanal/Marla)
              </button>
            </>
          )}

          {/* Admin Navigation Bar Sections (Shown ONLY on Admin View) */}
          {isAdminView && (
            <div className="flex items-center gap-1 bg-purple-50 p-1 rounded-lg border border-purple-200">
              {ADMIN_NAV_SECTIONS.map((sec) => {
                const IconComp = sec.icon;
                const isActive = adminTab === sec.id;
                return (
                  <button
                    key={sec.id}
                    onClick={() => setAdminTab(sec.id)}
                    className={`px-2.5 py-1.5 rounded-md transition-all flex items-center gap-1.5 whitespace-nowrap font-bold text-xs ${
                      isActive 
                        ? 'bg-purple-950 text-white shadow-xs' 
                        : 'text-purple-900 hover:bg-purple-100'
                    }`}
                  >
                    <IconComp className={`w-3.5 h-3.5 ${isActive ? 'text-purple-300' : 'text-purple-700'}`} />
                    <span>{sec.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Broker Navigation Bar Sections (Shown ONLY on Broker View) */}
          {isBrokerView && (
            <div className="flex items-center gap-1 bg-amber-50 p-1 rounded-lg border border-amber-200">
              {BROKER_NAV_SECTIONS.map((sec) => {
                const IconComp = sec.icon;
                const isActive = brokerTab === sec.id;
                return (
                  <button
                    key={sec.id}
                    onClick={() => setBrokerTab(sec.id)}
                    className={`px-2.5 py-1.5 rounded-md transition-all flex items-center gap-1.5 whitespace-nowrap font-bold text-xs ${
                      isActive 
                        ? 'bg-slate-900 text-white shadow-xs' 
                        : 'text-amber-950 hover:bg-amber-100'
                    }`}
                  >
                    <IconComp className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : 'text-amber-700'}`} />
                    <span>{sec.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </nav>

        {/* User Role Switcher, Auth & Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          
          {/* Static User Role Badge */}
          <div className="flex items-center gap-1.5 bg-slate-100 border border-slate-300 px-2.5 py-1.5 rounded-md text-xs font-bold">
            <span className="text-slate-500 text-[10px] uppercase tracking-wider hidden sm:inline">Role:</span>
            <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded shadow-2xs ${
              userRole === 'admin' ? 'bg-purple-950 text-white' :
              userRole === 'broker' ? 'bg-amber-500 text-slate-950' :
              userRole === 'owner' ? 'bg-blue-600 text-white' : 'bg-emerald-600 text-white'
            }`}>
              {userRole}
            </span>
          </div>

          {/* Profile & Auth State Button */}
          {currentUser ? (
            <div className="flex items-center gap-1.5">
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
                <span className="hidden sm:inline">{currentUser.email?.split('@')[0]}</span>
              </button>

              <button
                onClick={onLogout}
                className="p-2 rounded-md bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-700 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-3 py-2 rounded-md bg-brand-700 hover:bg-brand-800 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Login / Register</span>
            </button>
          )}

          {/* Shortlists Button (Consumer view only) */}
          {isConsumerView && (
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
          )}

          {/* Post Property Button (Consumer / Owner view only - hidden on broker & admin pages as requested) */}
          {isConsumerView && (userRole === 'owner' || userRole === 'buyer') && (
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

      {/* Secondary Bar for Mobile & Compact Screens displaying active role navigation */}
      {!isConsumerView && (
        <div className="lg:hidden bg-slate-100 border-t border-slate-200 px-4 py-2 overflow-x-auto">
          {isAdminView && (
            <div className="flex items-center gap-1 text-xs font-bold">
              {ADMIN_NAV_SECTIONS.map((sec) => (
                <button
                  key={sec.id}
                  onClick={() => setAdminTab(sec.id)}
                  className={`px-2.5 py-1.5 rounded-md whitespace-nowrap ${
                    adminTab === sec.id ? 'bg-purple-950 text-white' : 'bg-white text-purple-950 border border-slate-200'
                  }`}
                >
                  {sec.label}
                </button>
              ))}
            </div>
          )}

          {isBrokerView && (
            <div className="flex items-center gap-1 text-xs font-bold">
              {BROKER_NAV_SECTIONS.map((sec) => (
                <button
                  key={sec.id}
                  onClick={() => setBrokerTab(sec.id)}
                  className={`px-2.5 py-1.5 rounded-md whitespace-nowrap ${
                    brokerTab === sec.id ? 'bg-slate-900 text-white' : 'bg-white text-slate-800 border border-slate-200'
                  }`}
                >
                  {sec.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </header>
  );
}
