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
import ListYourPropertyModal from './components/ListYourPropertyModal';
import AuthModal from './components/AuthModal';
import BrokerDashboard from './components/BrokerDashboard';
import ProfilePage from './components/ProfilePage';
import AdminDashboard from './components/AdminDashboard';
import Footer from './components/Footer';

import { CITIES_DATA, JAMMU_COLLEGES, calculateDistanceKm } from './data/citiesAndLocalities';
import { MOCK_PROPERTIES } from './data/mockProperties';
import { dbService } from './services/dbService';
import { supabaseService } from './services/supabaseService';
import { leadIntelligenceService } from './services/leadIntelligenceService';
import { supabase } from './lib/supabase';
import { Building2, Heart, Search, ShieldCheck, Loader2, Home, GraduationCap, ShieldAlert } from 'lucide-react';

export default function App() {
  // Supabase Auth & Session State
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // App Properties State
  const [properties, setProperties] = useState(MOCK_PROPERTIES);
  const [isLoadingProperties, setIsLoadingProperties] = useState(false);

  const [selectedCity, setSelectedCity] = useState(CITIES_DATA[0]); // Default Jammu
  const [activeTab, setActiveTab] = useState('buy'); // buy | rent | pg | plot | saved
  const [searchLocality, setSearchLocality] = useState('');
  const [selectedBhk, setSelectedBhk] = useState([]);
  const [selectedBudget, setSelectedBudget] = useState('all');
  const [selectedPropertyType, setSelectedPropertyType] = useState('all');

  // PG Specific Filters
  const [pgGender, setPgGender] = useState('All');
  const [pgRoomType, setPgRoomType] = useState('All');
  const [selectedCollege, setSelectedCollege] = useState('');
  const [foodIncluded, setFoodIncluded] = useState('All');

  // Phase 4 System Roles: customer | broker | admin
  const [userRole, setUserRole] = useState('customer');
  const [activeView, setActiveView] = useState('marketplace'); // marketplace | profile | broker | admin
  const [adminTab, setAdminTab] = useState('home');
  const [brokerTab, setBrokerTab] = useState('overview');

  // Quick Filters & Sorting
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
  const [isListYourPropertyOpen, setIsListYourPropertyOpen] = useState(false);

  // Shortlists & Compare State
  const [shortlistedIds, setShortlistedIds] = useState(() => {
    const saved = localStorage.getItem('ez_shortlisted');
    return saved ? JSON.parse(saved) : ['ez-jm-101', 'ez-pg-201'];
  });

  const [comparedIds, setComparedIds] = useState([]);

  // Supabase Auth State Listener & Role Sync
  useEffect(() => {
    const fetchVerifiedRole = async (user) => {
      if (!user) return 'customer';
      let r = 'customer';
      try {
        const profile = await supabaseService.getProfile(user.id);
        if (profile?.role) r = profile.role.toLowerCase();
      } catch (e) {
        r = (user.user_metadata?.role || 'customer').toLowerCase();
      }
      // Normalize 3 Phase 4 System Roles: customer | broker | admin
      if (r === 'buyer' || r === 'student' || r === 'owner') return 'customer';
      return r;
    };

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        setCurrentUser(session.user);
        const verifiedRole = await fetchVerifiedRole(session.user);
        setUserRole(verifiedRole);
        if (verifiedRole === 'admin') {
          setActiveView('admin');
        } else if (verifiedRole === 'broker') {
          setActiveView('broker');
        } else {
          setActiveView('marketplace');
        }
      } else {
        setIsAuthModalOpen(true);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setCurrentUser(session.user);
        const verifiedRole = await fetchVerifiedRole(session.user);
        setUserRole(verifiedRole);
        if (verifiedRole === 'admin') {
          setActiveView('admin');
        } else if (verifiedRole === 'broker') {
          setActiveView('broker');
        } else {
          setActiveView('marketplace');
        }
        
        try {
          const dbFavorites = await supabaseService.getUserFavorites(session.user.id);
          if (dbFavorites.length > 0) {
            setShortlistedIds(prev => Array.from(new Set([...prev, ...dbFavorites])));
          }
        } catch (e) {
          console.warn('Could not sync favorites from DB:', e.message);
        }
      } else {
        setCurrentUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch Approved Properties & PGs from Supabase
  useEffect(() => {
    let isSubscribed = true;
    setIsLoadingProperties(true);

    supabaseService.fetchApprovedProperties({
      city: selectedCity.name,
      listingType: activeTab,
      propertyType: selectedPropertyType,
      searchLocality,
      limit: 40,
      offset: 0
    }).then(fetchedProps => {
      if (isSubscribed) {
        const hasPgInFetched = fetchedProps.some(p => p.listingType === 'pg' || p.propertyType === 'pg');
        if (activeTab === 'pg' && !hasPgInFetched) {
          setProperties(MOCK_PROPERTIES);
        } else {
          setProperties(fetchedProps);
        }
        setIsLoadingProperties(false);
      }
    }).catch(err => {
      if (isSubscribed) {
        setProperties(MOCK_PROPERTIES);
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
        eventType: (prop.listingType === 'pg' || prop.propertyType === 'pg') ? 'pg_view' : 'property_view',
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
    setPgGender('All');
    setPgRoomType('All');
    setSelectedCollege('');
    setFoodIncluded('All');
    setFilterReraOnly(false);
    setFilterOwnerOnly(false);
    setFilterReadyToMove(false);
    setFilterEastFacing(false);
    setSortBy('relevance');
  };

  const handleLogout = async () => {
    await supabaseService.signOutUser();
    setCurrentUser(null);
    setUserRole('customer');
    setActiveView('marketplace');
    setIsAuthModalOpen(true);
  };

  // College Distance Calculation
  const enrichedProperties = properties.map(p => {
    let distanceKm = p.collegeDistanceKm;
    let targetCollegeName = p.collegeName;

    if (selectedCollege) {
      const colObj = JAMMU_COLLEGES.find(c => c.id === selectedCollege);
      if (colObj && p.latitude && p.longitude) {
        const computed = calculateDistanceKm(colObj.latitude, colObj.longitude, p.latitude, p.longitude);
        if (computed !== null) {
          distanceKm = computed;
          targetCollegeName = colObj.name;
        }
      }
    }
    return { ...p, collegeDistanceKm: distanceKm, collegeName: targetCollegeName };
  });

  const filteredProperties = enrichedProperties.filter(p => {
    if (p.city.toLowerCase() !== selectedCity.name.toLowerCase()) return false;

    if (activeTab === 'saved') {
      if (!shortlistedIds.includes(p.id)) return false;
    } else if (activeTab === 'pg') {
      if (p.listingType !== 'pg' && p.propertyType !== 'pg') return false;
    } else if (activeTab === 'rent') {
      if (p.listingType !== 'rent') return false;
    } else if (activeTab === 'plot') {
      if (p.propertyType !== 'plot') return false;
    } else if (activeTab === 'buy') {
      if (p.listingType !== 'buy') return false;
    }

    if (searchLocality.trim() !== '') {
      const query = searchLocality.toLowerCase();
      const locMatch = p.locality.toLowerCase().includes(query) ||
                       p.title.toLowerCase().includes(query) ||
                       (p.address && p.address.toLowerCase().includes(query)) ||
                       (p.collegeName && p.collegeName.toLowerCase().includes(query));
      if (!locMatch) return false;
    }

    if (activeTab === 'pg') {
      if (pgGender !== 'All' && p.pgGender && p.pgGender.toLowerCase() !== pgGender.toLowerCase()) return false;
      if (pgRoomType !== 'All' && p.roomType && p.roomType.toLowerCase() !== pgRoomType.toLowerCase()) return false;
      if (foodIncluded === 'Food Included' && !p.foodIncluded) return false;
      if (foodIncluded === 'No Food' && p.foodIncluded) return false;
      
      if (selectedBudget !== 'all') {
        if (selectedBudget === 'under-5k' && p.priceVal > 5000) return false;
        if (selectedBudget === '5k-10k' && (p.priceVal < 5000 || p.priceVal > 10000)) return false;
        if (selectedBudget === '10k-plus' && p.priceVal < 10000) return false;
      }
    } else {
      if (selectedPropertyType !== 'all' && p.propertyType !== selectedPropertyType) return false;
      if (selectedBhk.length > 0 && !selectedBhk.includes(p.bhk)) return false;

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

      if (filterReraOnly && !p.isReraVerified) return false;
      if (filterOwnerOnly && p.sellerType !== 'Owner') return false;
      if (filterReadyToMove && p.possessionStatus !== 'Ready to Move') return false;
      if (filterEastFacing && (!p.facing || !p.facing.toLowerCase().includes('east'))) return false;
    }

    return true;
  });

  const sortedProperties = [...filteredProperties].sort((a, b) => {
    if (sortBy === 'price-low') return a.priceVal - b.priceVal;
    if (sortBy === 'price-high') return b.priceVal - a.priceVal;
    if (sortBy === 'nearest') return (a.collegeDistanceKm || 99) - (b.collegeDistanceKm || 99);
    if (sortBy === 'area-high') return (b.carpetArea || 0) - (a.carpetArea || 0);
    return 0;
  });

  const comparedPropertiesList = properties.filter(p => comparedIds.includes(p.id));

  // Unauthenticated Portal Entry View
  if (!currentUser && isAuthModalOpen) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between p-4 sm:p-8 relative overflow-hidden font-sans">
        <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] opacity-60 pointer-events-none" />

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
            Browse Portal as Guest →
          </button>
        </header>

        <main className="relative z-10 flex-1 flex items-center justify-center my-6">
          <AuthModal 
            isOpen={true}
            onClose={() => setIsAuthModalOpen(false)}
            isInline={true}
            onAuthSuccess={(user, roleOverride) => {
              if (user) setCurrentUser(user);
              const userRoleDetected = (roleOverride || user?.user_metadata?.role || user?.role || 'customer').toLowerCase();
              const safeRole = (userRoleDetected === 'buyer' || userRoleDetected === 'student' || userRoleDetected === 'owner') ? 'customer' : userRoleDetected;
              setUserRole(safeRole);
              if (safeRole === 'admin') {
                setActiveView('admin');
                setAdminTab('home');
              } else if (safeRole === 'broker') {
                setActiveView('broker');
                setBrokerTab('overview');
              } else {
                setActiveView('marketplace');
              }
              setIsAuthModalOpen(false);
            }}
          />
        </main>

        <footer className="relative z-10 text-center text-xs text-slate-500 font-semibold py-2 border-t border-slate-200">
          Trustify Homes • Verifiable Property & Student Housing Portal for Jammu & Kashmir
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
        onOpenListYourProperty={() => setIsListYourPropertyOpen(true)}
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

      {/* Main View Router with Explicit Role Security Guards */}
      {activeView === 'profile' ? (
        <ProfilePage 
          userRole={userRole} 
          setUserRole={setUserRole}
          shortlistCount={shortlistedIds.length}
          currentUser={currentUser}
        />
      ) : activeView === 'admin' ? (
        userRole === 'admin' ? (
          <AdminDashboard 
            properties={properties.filter(p => p.city.toLowerCase() === selectedCity.name.toLowerCase())}
            onSelectProperty={(prop) => setSelectedPropertyDetail(prop)}
            onOpenPostProperty={() => setIsPostPropertyOpen(true)}
            activeTab={adminTab}
            setActiveTab={setAdminTab}
          />
        ) : (
          /* Role Security Denied Card: Customer trying to access Admin */
          <div className="max-w-md mx-auto my-12 bg-white p-6 rounded-xl border border-red-200 text-center space-y-3 shadow-md">
            <ShieldAlert className="w-12 h-12 text-red-600 mx-auto" />
            <h3 className="text-lg font-bold text-slate-900">Access Denied (403)</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Your customer account role (<strong className="font-mono text-red-700">{userRole}</strong>) does not have administrative privileges to access the Trustify Operations Control Center.
            </p>
            <button onClick={() => setActiveView('marketplace')} className="ez-btn-primary py-2 px-4 text-xs font-bold">Return to Marketplace</button>
          </div>
        )
      ) : activeView === 'broker' ? (
        (userRole === 'broker' || userRole === 'admin') ? (
          <BrokerDashboard 
            properties={properties.filter(p => p.city.toLowerCase() === selectedCity.name.toLowerCase())}
            onOpenPostProperty={() => setIsPostPropertyOpen(true)}
            onSelectProperty={(prop) => setSelectedPropertyDetail(prop)}
            activeTab={brokerTab}
            setActiveTab={setBrokerTab}
          />
        ) : (
          /* Role Security Denied Card: Customer trying to access Broker */
          <div className="max-w-md mx-auto my-12 bg-white p-6 rounded-xl border border-red-200 text-center space-y-3 shadow-md">
            <ShieldAlert className="w-12 h-12 text-red-600 mx-auto" />
            <h3 className="text-lg font-bold text-slate-900">Access Denied (403)</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Your account does not have partner broker access. Broker accounts are invited directly by Trustify Admin.
            </p>
            <button onClick={() => setActiveView('marketplace')} className="ez-btn-primary py-2 px-4 text-xs font-bold">Return to Marketplace</button>
          </div>
        )
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
            pgGender={pgGender}
            setPgGender={setPgGender}
            pgRoomType={pgRoomType}
            setPgRoomType={setPgRoomType}
            selectedCollege={selectedCollege}
            setSelectedCollege={setSelectedCollege}
            foodIncluded={foodIncluded}
            setFoodIncluded={setFoodIncluded}
          />

          {/* Quick Filter Bar */}
          <FilterBar 
            activeTab={activeTab}
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
            pgGender={pgGender}
            setPgGender={setPgGender}
            pgRoomType={pgRoomType}
            setPgRoomType={setPgRoomType}
            foodIncluded={foodIncluded}
            setFoodIncluded={setFoodIncluded}
          />

          {/* Main Content Area */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                  {activeTab === 'saved' 
                    ? 'Your Saved & Shortlisted Properties' 
                    : activeTab === 'pg' 
                    ? `Verified Student PG & Hostels in ${selectedCity.name}`
                    : activeTab === 'rent' 
                    ? `Rental Properties in ${selectedCity.name}` 
                    : activeTab === 'plot' 
                    ? `Plots & Land for Sale in ${selectedCity.name} (Kanals)` 
                    : `Verified Properties for Sale in ${selectedCity.name}`}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 flex items-center gap-2">
                  <span>Showing {sortedProperties.length} genuine verified listings in {selectedCity.name}</span>
                  {isLoadingProperties && <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-600" />}
                </p>
              </div>

              {comparedIds.length > 0 && activeTab !== 'pg' && (
                <button 
                  onClick={() => setIsCompareOpen(true)}
                  className="ez-btn-primary bg-slate-900 hover:bg-slate-800 text-xs py-2 px-3"
                >
                  View Comparison ({comparedIds.length}/3 Selected)
                </button>
              )}
            </div>

            {/* Property / PG Listing Grid */}
            {sortedProperties.length > 0 ? (
              <div className="space-y-4">
                {sortedProperties.map(property => (
                  <PropertyCard 
                    key={property.id}
                    property={property}
                    onSelectProperty={(prop) => handleSelectPropertyDetail(prop)}
                    isShortlisted={shortlistedIds.includes(property.id)}
                    onToggleShortlist={handleToggleShortlist}
                    isCompared={comparedIds.includes(property.id)}
                    onToggleCompare={handleToggleCompare}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center max-w-lg mx-auto my-8 space-y-3">
                <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Search className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-extrabold text-slate-900">
                  {activeTab === 'pg' ? 'No Student PGs Found' : 'No Properties Found'}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
                  {activeTab === 'pg' 
                    ? `No PG or hostel matched your criteria in ${selectedCity.name}. Try increasing your rent budget or clearing filters.`
                    : `No properties found in this location. Try increasing your budget or removing a filter.`}
                </p>
                <button 
                  onClick={handleResetFilters}
                  className="ez-btn-primary py-2 px-4 text-xs font-bold"
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
            const userRoleDetected = (roleOverride || user?.user_metadata?.role || user?.role || 'customer').toLowerCase();
            const safeRole = (userRoleDetected === 'buyer' || userRoleDetected === 'student' || userRoleDetected === 'owner') ? 'customer' : userRoleDetected;
            setUserRole(safeRole);
            if (safeRole === 'admin') {
              setActiveView('admin');
              setAdminTab('home');
            } else if (safeRole === 'broker') {
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

      {/* Mandatory Public Owner CTA Modal: List Your Property */}
      {isListYourPropertyOpen && (
        <ListYourPropertyModal 
          onClose={() => setIsListYourPropertyOpen(false)}
        />
      )}
    </div>
  );
}
