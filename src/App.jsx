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
import BrokerDashboard from './components/BrokerDashboard';
import ProfilePage from './components/ProfilePage';
import AdminDashboard from './components/AdminDashboard';
import Footer from './components/Footer';

import { CITIES_DATA } from './data/citiesAndLocalities';
import { MOCK_PROPERTIES } from './data/mockProperties';
import { dbService } from './services/dbService';
import { Building2, Heart, Search, ShieldCheck } from 'lucide-react';

export default function App() {
  // App State
  const [properties, setProperties] = useState(() => {
    const saved = dbService.getCustomProperties();
    if (saved && saved.length > 0) {
      return [...saved, ...MOCK_PROPERTIES];
    }
    return MOCK_PROPERTIES;
  });

  const [selectedCity, setSelectedCity] = useState(CITIES_DATA[0]); // Default Jammu
  const [activeTab, setActiveTab] = useState('buy'); // buy | rent | plot | saved
  const [searchLocality, setSearchLocality] = useState('');
  const [selectedBhk, setSelectedBhk] = useState([]);
  const [selectedBudget, setSelectedBudget] = useState('all');
  const [selectedPropertyType, setSelectedPropertyType] = useState('all');

  // Role Management State (Customer | Broker | Admin)
  const [userRole, setUserRole] = useState('customer');
  const [activeView, setActiveView] = useState('marketplace'); // marketplace | profile | broker | admin

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

  useEffect(() => {
    localStorage.setItem('ez_shortlisted', JSON.stringify(shortlistedIds));
  }, [shortlistedIds]);

  const handleToggleShortlist = (propId) => {
    if (shortlistedIds.includes(propId)) {
      setShortlistedIds(shortlistedIds.filter(id => id !== propId));
    } else {
      setShortlistedIds([...shortlistedIds, propId]);
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
    const updated = dbService.saveProperty(newProp);
    setProperties([...updated, ...MOCK_PROPERTIES]);
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
      />

      {/* Main View Router: Profile vs Admin vs Broker vs Marketplace */}
      {activeView === 'profile' ? (
        <ProfilePage 
          userRole={userRole} 
          setUserRole={setUserRole}
          shortlistCount={shortlistedIds.length}
        />
      ) : activeView === 'admin' ? (
        <AdminDashboard 
          properties={properties.filter(p => p.city.toLowerCase() === selectedCity.name.toLowerCase())}
          onSelectProperty={(prop) => setSelectedPropertyDetail(prop)}
          onOpenPostProperty={() => setIsPostPropertyOpen(true)}
        />
      ) : activeView === 'broker' ? (
        <BrokerDashboard 
          properties={properties.filter(p => p.city.toLowerCase() === selectedCity.name.toLowerCase())}
          onOpenPostProperty={() => setIsPostPropertyOpen(true)}
          onSelectProperty={(prop) => setSelectedPropertyDetail(prop)}
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
                <p className="text-xs sm:text-sm text-slate-600">
                  Showing {sortedProperties.length} genuine property listings matching your filters in {selectedCity.name}
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
      {selectedPropertyDetail && (
        <PropertyDetailModal 
          property={selectedPropertyDetail}
          onClose={() => setSelectedPropertyDetail(null)}
          isShortlisted={shortlistedIds.includes(selectedPropertyDetail.id)}
          onToggleShortlist={handleToggleShortlist}
          onOpenEmi={() => setIsEmiOpen(true)}
          onOpenStampDuty={() => setIsStampDutyOpen(true)}
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
        />
      )}
    </div>
  );
}
