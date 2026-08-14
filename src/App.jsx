import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HeroSearch from './components/HeroSearch';
import FilterBar from './components/FilterBar';
import PropertyCard from './components/PropertyCard';
import PropertyDetailModal from './components/PropertyDetailModal';
import EmiCalculatorModal from './components/EmiCalculatorModal';
import LoanEligibilityModal from './components/LoanEligibilityModal';
import RentAgreementModal from './components/RentAgreementModal';
import UnitConverterModal from './components/UnitConverterModal';
import StampDutyModal from './components/StampDutyModal';
import CompareModal from './components/CompareModal';
import PostPropertyModal from './components/PostPropertyModal';
import AuthModal from './components/AuthModal';
import BrokerDashboard from './components/BrokerDashboard';
import ProfilePage from './components/ProfilePage';
import AdminDashboard from './components/AdminDashboard';
import Footer from './components/Footer';

import { CITIES_DATA } from './data/citiesAndLocalities';
import { MOCK_PROPERTIES } from './data/mockProperties';
import { dbService } from './services/dbService';
import { supabaseService } from './services/supabaseService';
import { leadIntelligenceService } from './services/leadIntelligenceService';
import { supabase } from './lib/supabase';
import { Building2, Heart, Search, ShieldCheck, Loader2 } from 'lucide-react';

export default function App() {
  // Supabase Auth & Session State
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // App State
  const [properties, setProperties] = useState(MOCK_PROPERTIES);
  const [isLoadingProperties, setIsLoadingProperties] = useState(false);

  const [selectedCity, setSelectedCity] = useState(CITIES_DATA[0]); // Default Jammu
  const [activeTab, setActiveTab] = useState('buy'); // buy | rent | plot | saved
  const [searchLocality, setSearchLocality] = useState('');
  const [selectedBhk, setSelectedBhk] = useState([]);
  const [selectedBudget, setSelectedBudget] = useState('all');
  const [selectedPropertyType, setSelectedPropertyType] = useState('all');

  // Role Management State (buyer | owner | broker | student | admin)
  const [userRole, setUserRole] = useState('buyer');
  const [activeView, setActiveView] = useState('marketplace'); // marketplace | profile | broker | owner | admin
  const [adminTab, setAdminTab] = useState('home');
  const [brokerTab, setBrokerTab] = useState('overview');

  // Pill Quick Filters
  const [filterReraOnly, setFilterReraOnly] = useState(false);
  const [filterOwnerOnly, setFilterOwnerOnly] = useState(false);
  const [filterReadyToMove, setFilterReadyToMove] = useState(false);
  const [filterEastFacing, setFilterEastFacing] = useState(false);
  const [sortBy, setSortBy] = useState('relevance');

  // Modals State
  const [selectedPropertyDetail, setSelectedPropertyDetail] = useState(null);
  const [isEmiOpen, setIsEmiOpen] = useState(false);
  const [isEligibilityOpen, setIsEligibilityOpen] = useState(false);
  const [isRentAgreementOpen, setIsRentAgreementOpen] = useState(false);
  const [isUnitConverterOpen, setIsUnitConverterOpen] = useState(false);
  const [isStampDutyOpen, setIsStampDutyOpen] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isPostPropertyOpen, setIsPostPropertyOpen] = useState(false);

  // Shortlists & Compare State
  const [shortlistedIds, setShortlistedIds] = useState(() => {
    const saved = localStorage.getItem('ez_shortlisted');
    return saved ? JSON.parse(saved) : ['ez-jm-101'];
  });

  const [comparedIds, setComparedIds] = useState([]);

  // Supabase Auth State Listener & Initial Role View Sync
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setCurrentUser(session.user);
        const metaRole = (session.user.user_metadata?.role || 'buyer').toLowerCase();
        setUserRole(metaRole);
        if (metaRole === 'admin') {
          setActiveView('admin');
        } else if (metaRole === 'broker' || metaRole === 'owner') {
          setActiveView('broker');
        } else {
          setActiveView('marketplace');
        }
      } else {
        // Automatically prompt for Sign Up / Sign In on first visit
        setIsAuthModalOpen(true);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setCurrentUser(session.user);
        const metaRole = (session.user.user_metadata?.role || 'buyer').toLowerCase();
        setUserRole(metaRole);
        if (metaRole === 'admin') {
          setActiveView('admin');
        } else if (metaRole === 'broker' || metaRole === 'owner') {
          setActiveView('broker');
        } else {
          setActiveView('marketplace');
        }
        
        // Sync favorites from Supabase DB
        try {
          const dbFavorites = await supabaseService.getUserFavorites(session.user.id);
          if (dbFavorites.length > 0) {
            setShortlistedIds(prev => Array.from(new Set([...prev, ...dbFavorites])));
          }
        } catch (e) {
          console.warn('Could not sync user favorites from DB:', e.message);
        }
      } else {
        setCurrentUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch Real Supabase Properties whenever city, activeTab, searchLocality, or propertyType changes
  useEffect(() => {
    let isSubscribed = true;
    setIsLoadingProperties(true);

    supabaseService.fetchApprovedProperties({
      city: selectedCity.name,
      listingType: activeTab,
      propertyType: selectedPropertyType,
      searchLocality,
      limit: 30,
      offset: 0
    }).then(fetchedProps => {
      if (isSubscribed) {
        setProperties(fetchedProps);
        setIsLoadingProperties(false);
      }
    }).catch(err => {
      if (isSubscribed) {
        console.warn('Property fetch error, using local fallback:', err);
        setIsLoadingProperties(false);
      }
    });

    return () => { isSubscribed = false; };
  }, [selectedCity, activeTab, selectedPropertyType, searchLocality]);

  useEffect(() => {
    localStorage.setItem('ez_shortlisted', JSON.stringify(shortlistedIds));
  }, [shortlistedIds]);

  const handleSelectPropertyDetail = (prop) => {
    setSelectedPropertyDetail(prop);
    if (prop) {
      leadIntelligenceService.trackActivityEvent({
        userId: currentUser?.id || 'cust-101',
        eventType: 'property_view',
        propertyId: prop.id,
        locality: prop.locality,
        propertyType: prop.propertyType
      });
    }
  };

  const handleToggleShortlist = async (propId) => {
    const isCurrentlyShortlisted = shortlistedIds.includes(propId);
    let updated;

    if (isCurrentlyShortlisted) {
      updated = shortlistedIds.filter(id => id !== propId);
      setShortlistedIds(updated);
      if (currentUser?.id) {
        try { await supabaseService.removeFavorite(currentUser.id, propId); } catch (e) {}
      }
    } else {
      updated = [...shortlistedIds, propId];
      setShortlistedIds(updated);
      if (currentUser?.id) {
        try { await supabaseService.addFavorite(currentUser.id, propId); } catch (e) {}
      }
      // Track property_save activity event
      leadIntelligenceService.trackActivityEvent({
        userId: currentUser?.id || 'cust-101',
        eventType: 'property_save',
        propertyId: propId
      });
    }
  };

  const handleToggleCompare = (propId) => {
    if (comparedIds.includes(propId)) {
      setComparedIds(comparedIds.filter(id => id !== propId));
    } else {
      if (comparedIds.length >= 3) {
        alert('You can compare a maximum of 3 properties at a time.');
        return;
      }
      setComparedIds([...comparedIds, propId]);
    }
  };

  const handleAddProperty = (newProp) => {
    setProperties(prev => [newProp, ...prev]);
  };

  const handleResetFilters = () => {
    setSearchLocality('');
    setSelectedBhk([]);
    setSelectedBudget('all');
    setSelectedPropertyType('all');
    setFilterReraOnly(false);
    setFilterOwnerOnly(false);
    setFilterReadyToMove(false);
    setFilterEastFacing(false);
    setSortBy('relevance');
  };

  const handleLogout = async () => {
    await supabaseService.signOutUser();
    setCurrentUser(null);
    setUserRole('buyer');
    setActiveView('marketplace');
    setIsAuthModalOpen(true);
  };

  // Filter Computation Engine
  const filteredProperties = properties.filter(p => {
    // City filter
    if (p.city.toLowerCase() !== selectedCity.name.toLowerCase()) return false;

    // Active tab filter (buy vs rent vs plot vs saved)
    if (activeTab === 'saved') {
      if (!shortlistedIds.includes(p.id)) return false;
    } else if (activeTab === 'rent') {
      if (p.listingType !== 'rent') return false;
    } else if (activeTab === 'plot') {
      if (p.propertyType !== 'plot') return false;
    } else if (activeTab === 'buy') {
      if (p.listingType !== 'buy') return false;
    }

    // Locality search
    if (searchLocality.trim() !== '') {
      const locMatch = p.locality.toLowerCase().includes(searchLocality.toLowerCase()) ||
                       p.title.toLowerCase().includes(searchLocality.toLowerCase()) ||
                       p.address.toLowerCase().includes(searchLocality.toLowerCase());
      if (!locMatch) return false;
    }

    // Property Type
    if (selectedPropertyType !== 'all' && p.propertyType !== selectedPropertyType) return false;

    // BHK filter
    if (selectedBhk.length > 0) {
      if (!selectedBhk.includes(p.bhk)) return false;
    }

    // Budget range filter
    if (selectedBudget !== 'all') {
      if (activeTab === 'rent') {
        if (selectedBudget === 'under-30k' && p.priceVal > 30000) return false;
        if (selectedBudget === '30k-50k' && (p.priceVal < 30000 || p.priceVal > 50000)) return false;
        if (selectedBudget === '50k-plus' && p.priceVal < 50000) return false;
      } else {
        if (selectedBudget === 'under-50l' && p.priceVal > 5000000) return false;
        if (selectedBudget === '50l-1cr' && (p.priceVal < 5000000 || p.priceVal > 10000000)) return false;
        if (selectedBudget === '1cr-2cr' && (p.priceVal < 10000000 || p.priceVal > 20000000)) return false;
        if (selectedBudget === '2cr-plus' && p.priceVal < 20000000) return false;
      }
    }

    // Pill Quick Filters
    if (filterReraOnly && !p.isReraVerified) return false;
    if (filterOwnerOnly && p.sellerType !== 'Owner') return false;
    if (filterReadyToMove && p.possessionStatus !== 'Ready to Move') return false;
    if (filterEastFacing && !p.facing.toLowerCase().includes('east')) return false;

    return true;
  });

  // Sorting
  const sortedProperties = [...filteredProperties].sort((a, b) => {
    if (sortBy === 'price-low') return a.priceVal - b.priceVal;
    if (sortBy === 'price-high') return b.priceVal - a.priceVal;
    if (sortBy === 'area-high') return b.carpetArea - a.carpetArea;
    return 0;
  });

  const comparedPropertiesList = properties.filter(p => comparedIds.includes(p.id));

  // Unauthenticated Minimal Portal Entry View (White Theme with Architectural Sketches)
  if (!currentUser && isAuthModalOpen) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between p-4 sm:p-8 relative overflow-hidden font-sans">
        
        {/* Subtle Architectural Blueprint Grid Pattern Background */}
        <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] opacity-60 pointer-events-none" />

        {/* Architectural Building Sketches Line Art */}
        <div className="absolute inset-0 pointer-events-none opacity-25 overflow-hidden flex items-end justify-between">
          {/* Left Building Sketch */}
          <svg className="w-[420px] h-[420px] text-slate-600 stroke-current -ml-10 -mb-6" viewBox="0 0 400 400" fill="none" strokeWidth="1.2">
            <line x1="0" y1="50" x2="400" y2="50" strokeDasharray="4 4" strokeOpacity="0.5" />
            <line x1="0" y1="150" x2="400" y2="150" strokeDasharray="4 4" strokeOpacity="0.5" />
            <line x1="0" y1="250" x2="400" y2="250" strokeDasharray="4 4" strokeOpacity="0.5" />
            <line x1="100" y1="0" x2="100" y2="400" strokeDasharray="4 4" strokeOpacity="0.5" />
            <line x1="250" y1="0" x2="250" y2="400" strokeDasharray="4 4" strokeOpacity="0.5" />
            
            <rect x="60" y="160" width="180" height="180" rx="2" />
            <polygon points="40,160 150,80 260,160" />
            <rect x="90" y="200" width="45" height="55" />
            <line x1="112.5" y1="200" x2="112.5" y2="255" />
            <line x1="90" y1="227.5" x2="135" y2="227.5" />
            
            <rect x="165" y="200" width="45" height="55" />
            <line x1="187.5" y1="200" x2="187.5" y2="255" />
            <line x1="165" y1="227.5" x2="210" y2="227.5" />
            
            <rect x="120" y="280" width="45" height="60" />
            <circle cx="155" cy="310" r="2.5" fill="currentColor" />

            <rect x="260" y="100" width="100" height="240" />
            <line x1="260" y1="140" x2="360" y2="140" />
            <line x1="260" y1="180" x2="360" y2="180" />
            <line x1="260" y1="220" x2="360" y2="220" />
            <line x1="260" y1="260" x2="360" y2="260" />
            <line x1="260" y1="300" x2="360" y2="300" />
            <line x1="310" y1="100" x2="310" y2="340" />
          </svg>

          {/* Right Villa Sketch */}
          <svg className="w-[480px] h-[480px] text-slate-600 stroke-current -mr-12 -mb-8 hidden md:block" viewBox="0 0 500 500" fill="none" strokeWidth="1.2">
            <rect x="100" y="200" width="280" height="220" />
            <polygon points="80,200 240,100 400,200" />
            <rect x="140" y="240" width="60" height="70" />
            <line x1="170" y1="240" x2="170" y2="310" />
            <line x1="140" y1="275" x2="200" y2="275" />

            <rect x="240" y="240" width="60" height="70" />
            <line x1="270" y1="240" x2="270" y2="310" />
            <line x1="240" y1="275" x2="300" y2="275" />

            <rect x="190" y="340" width="60" height="80" />
            <circle cx="238" cy="380" r="3" fill="currentColor" />
            <line x1="100" y1="310" x2="380" y2="310" />
            
            <line x1="80" y1="440" x2="400" y2="440" />
            <line x1="80" y1="435" x2="80" y2="445" />
            <line x1="400" y1="435" x2="400" y2="445" />
            
            <line x1="420" y1="100" x2="420" y2="420" />
            <line x1="415" y1="100" x2="425" y2="100" />
            <line x1="415" y1="420" x2="425" y2="420" />
          </svg>
        </div>

        {/* Header */}
        <header className="relative z-10 flex items-center justify-between max-w-6xl mx-auto w-full">
          <div className="flex items-center gap-2">
            <div className="bg-purple-950 text-white p-2 rounded-xl font-bold shadow-md">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-slate-900 block leading-none">TRUSTIFY HOMES</span>
              <span className="text-[10px] text-purple-700 font-extrabold uppercase tracking-wider">Jammu & Kashmir Portal</span>
            </div>
          </div>

          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="text-xs text-slate-700 hover:text-slate-900 font-extrabold bg-white border border-slate-300 shadow-xs px-3.5 py-2 rounded-lg transition-all hover:bg-slate-100"
          >
            Browse Marketplace as Guest →
          </button>
        </header>

        {/* Centered Auth Card */}
        <main className="relative z-10 flex-1 flex items-center justify-center my-6">
          <AuthModal 
            isOpen={true}
            onClose={() => setIsAuthModalOpen(false)}
            isInline={true}
            onAuthSuccess={(user, roleOverride) => {
              if (user) setCurrentUser(user);
              const userRoleDetected = (roleOverride || user?.user_metadata?.role || user?.role || 'buyer').toLowerCase();
              setUserRole(userRoleDetected);
              if (userRoleDetected === 'admin') {
                setActiveView('admin');
                setAdminTab('home');
              } else if (userRoleDetected === 'broker' || userRoleDetected === 'owner') {
                setActiveView('broker');
                setBrokerTab('overview');
              } else {
                setActiveView('marketplace');
              }
              setIsAuthModalOpen(false);
            }}
          />
        </main>

        {/* Footer */}
        <footer className="relative z-10 text-center text-xs text-slate-500 font-semibold py-2 border-t border-slate-200">
          Trustify Homes • Verifiable Real Estate & Architectural Management Platform for Jammu & Kashmir
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      {/* Navigation Header */}
      <Navbar 
        selectedCity={selectedCity}
        setSelectedCity={setSelectedCity}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        shortlistCount={shortlistedIds.length}
        compareCount={comparedIds.length}
        onOpenEmi={() => setIsEmiOpen(true)}
        onOpenEligibility={() => setIsEligibilityOpen(true)}
        onOpenRentAgreement={() => setIsRentAgreementOpen(true)}
        onOpenUnitConverter={() => setIsUnitConverterOpen(true)}
        onOpenStampDuty={() => setIsStampDutyOpen(true)}
        onOpenCompare={() => setIsCompareOpen(true)}
        onOpenPostProperty={() => setIsPostPropertyOpen(true)}
        userRole={userRole}
        setUserRole={setUserRole}
        activeView={activeView}
        setActiveView={setActiveView}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        adminTab={adminTab}
        setAdminTab={setAdminTab}
        brokerTab={brokerTab}
        setBrokerTab={setBrokerTab}
      />

      {/* Main View Router: Profile vs Admin vs Broker vs Marketplace */}
      {activeView === 'profile' ? (
        <ProfilePage 
          userRole={userRole} 
          setUserRole={setUserRole}
          shortlistCount={shortlistedIds.length}
          currentUser={currentUser}
        />
      ) : activeView === 'admin' ? (
        <AdminDashboard 
          properties={properties.filter(p => p.city.toLowerCase() === selectedCity.name.toLowerCase())}
          onSelectProperty={(prop) => setSelectedPropertyDetail(prop)}
          onOpenPostProperty={() => setIsPostPropertyOpen(true)}
          activeTab={adminTab}
          setActiveTab={setAdminTab}
        />
      ) : activeView === 'broker' ? (
        <BrokerDashboard 
          properties={properties.filter(p => p.city.toLowerCase() === selectedCity.name.toLowerCase())}
          onOpenPostProperty={() => setIsPostPropertyOpen(true)}
          onSelectProperty={(prop) => setSelectedPropertyDetail(prop)}
          activeTab={brokerTab}
          setActiveTab={setBrokerTab}
        />
      ) : (
        <main className="flex-1">
          {/* Main Hero & Search Engine */}
          <HeroSearch 
            selectedCity={selectedCity}
            searchLocality={searchLocality}
            setSearchLocality={setSearchLocality}
            selectedBhk={selectedBhk}
            setSelectedBhk={setSelectedBhk}
            selectedBudget={selectedBudget}
            setSelectedBudget={setSelectedBudget}
            selectedPropertyType={selectedPropertyType}
            setSelectedPropertyType={setSelectedPropertyType}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onResetFilters={handleResetFilters}
          />

          {/* Quick Filter Bar */}
          <FilterBar 
            filterReraOnly={filterReraOnly}
            setFilterReraOnly={setFilterReraOnly}
            filterOwnerOnly={filterOwnerOnly}
            setFilterOwnerOnly={setFilterOwnerOnly}
            filterReadyToMove={filterReadyToMove}
            setFilterReadyToMove={setFilterReadyToMove}
            filterEastFacing={filterEastFacing}
            setFilterEastFacing={setFilterEastFacing}
            sortBy={sortBy}
            setSortBy={setSortBy}
            totalResults={sortedProperties.length}
            onResetFilters={handleResetFilters}
          />

          {/* Main Content Area */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            
            {/* Section Title Banner */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  {activeTab === 'saved' 
                    ? 'Your Saved & Shortlisted Properties' 
                    : activeTab === 'rent' 
                    ? `Rental Properties in ${selectedCity.name}` 
                    : activeTab === 'plot' 
                    ? `Plots & Land for Sale in ${selectedCity.name} (Kanals)` 
                    : `Verified Properties for Sale in ${selectedCity.name}`}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 flex items-center gap-2">
                  <span>Showing {sortedProperties.length} genuine property listings in {selectedCity.name}</span>
                  {isLoadingProperties && <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-600" />}
                </p>
              </div>

              {comparedIds.length > 0 && (
                <button 
                  onClick={() => setIsCompareOpen(true)}
                  className="ez-btn-primary bg-slate-900 hover:bg-slate-800 text-xs py-2 px-3"
                >
                  View Comparison ({comparedIds.length}/3 Selected)
                </button>
              )}
            </div>

            {/* Property Listing Grid */}
            {sortedProperties.length > 0 ? (
              <div className="space-y-4">
                {sortedProperties.map(property => (
                  <PropertyCard 
                    key={property.id}
                    property={property}
                    onSelectProperty={(prop) => setSelectedPropertyDetail(prop)}
                    isShortlisted={shortlistedIds.includes(property.id)}
                    onToggleShortlist={handleToggleShortlist}
                    isCompared={comparedIds.includes(property.id)}
                    onToggleCompare={handleToggleCompare}
                  />
                ))}
              </div>
            ) : (
              /* Empty State Box */
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center max-w-lg mx-auto my-8">
                <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">No Properties Found</h3>
                <p className="text-xs text-slate-500 mb-5 leading-relaxed">
                  We couldn't find any property matching your exact locality or budget criteria in {selectedCity.name}.
                </p>
                <button 
                  onClick={handleResetFilters}
                  className="ez-btn-primary py-2 px-4 text-xs"
                >
                  Reset All Filters & View All Listings
                </button>
              </div>
            )}
          </div>
        </main>
      )}

      {/* Footer */}
      <Footer 
        onOpenEmi={() => setIsEmiOpen(true)}
        onOpenUnitConverter={() => setIsUnitConverterOpen(true)}
        onOpenStampDuty={() => setIsStampDutyOpen(true)}
      />

      {/* Interactive Modals */}
      {isAuthModalOpen && (
        <AuthModal 
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onAuthSuccess={(user, roleOverride) => {
            if (user) setCurrentUser(user);
            const userRoleDetected = (roleOverride || user?.user_metadata?.role || user?.role || 'buyer').toLowerCase();
            setUserRole(userRoleDetected);
            if (userRoleDetected === 'admin') {
              setActiveView('admin');
              setAdminTab('home');
            } else if (userRoleDetected === 'broker' || userRoleDetected === 'owner') {
              setActiveView('broker');
              setBrokerTab('overview');
            } else {
              setActiveView('marketplace');
            }
          }}
        />
      )}

      {selectedPropertyDetail && (
        <PropertyDetailModal 
          property={selectedPropertyDetail}
          onClose={() => setSelectedPropertyDetail(null)}
          isShortlisted={shortlistedIds.includes(selectedPropertyDetail.id)}
          onToggleShortlist={handleToggleShortlist}
          onOpenEmi={() => setIsEmiOpen(true)}
          onOpenStampDuty={() => setIsStampDutyOpen(true)}
          currentUser={currentUser}
        />
      )}

      {isEmiOpen && (
        <EmiCalculatorModal onClose={() => setIsEmiOpen(false)} />
      )}

      {isEligibilityOpen && (
        <LoanEligibilityModal onClose={() => setIsEligibilityOpen(false)} />
      )}

      {isRentAgreementOpen && (
        <RentAgreementModal onClose={() => setIsRentAgreementOpen(false)} />
      )}

      {isUnitConverterOpen && (
        <UnitConverterModal onClose={() => setIsUnitConverterOpen(false)} />
      )}

      {isStampDutyOpen && (
        <StampDutyModal onClose={() => setIsStampDutyOpen(false)} />
      )}

      {isCompareOpen && (
        <CompareModal 
          comparedProperties={comparedPropertiesList}
          onClose={() => setIsCompareOpen(false)}
          onRemoveCompare={(id) => setComparedIds(comparedIds.filter(cId => cId !== id))}
        />
      )}

      {isPostPropertyOpen && (
        <PostPropertyModal 
          onClose={() => setIsPostPropertyOpen(false)}
          onAddProperty={handleAddProperty}
          currentUser={currentUser}
          userRole={userRole}
        />
      )}
    </div>
  );
}
