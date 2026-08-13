import React, { useState } from 'react';
import { Search, MapPin, Sparkles, Filter, Check, X } from 'lucide-react';
import { PROPERTY_TYPES, BHK_OPTIONS } from '../data/citiesAndLocalities';

export default function HeroSearch({ 
  selectedCity, 
  searchLocality, 
  setSearchLocality,
  selectedBhk, 
  setSelectedBhk,
  selectedBudget, 
  setSelectedBudget,
  selectedPropertyType, 
  setSelectedPropertyType,
  activeTab, 
  setActiveTab,
  onResetFilters
}) {
  const [aiQuery, setAiQuery] = useState('');
  const [aiApplied, setAiApplied] = useState(false);

  // Simple, deterministic AI Natural Language parser helper for non-tech-savvy users
  const handleAiSearchParse = (e) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;

    const query = aiQuery.toLowerCase();
    
    // Check BHK
    if (query.includes('1 bhk') || query.includes('1bhk')) setSelectedBhk([1]);
    else if (query.includes('2 bhk') || query.includes('2bhk')) setSelectedBhk([2]);
    else if (query.includes('3 bhk') || query.includes('3bhk')) setSelectedBhk([3]);
    else if (query.includes('4 bhk') || query.includes('4bhk')) setSelectedBhk([4]);

    // Check Rent vs Buy
    if (query.includes('rent') || query.includes('lease')) setActiveTab('rent');
    else if (query.includes('buy') || query.includes('sale') || query.includes('purchase')) setActiveTab('buy');

    // Check Locality matching city localities
    const matchedLocality = selectedCity.popularLocalities.find(loc => 
      query.includes(loc.toLowerCase())
    );
    if (matchedLocality) setSearchLocality(matchedLocality);

    // Check Budget keywords
    if (query.includes('under 50') || query.includes('50 lakh') || query.includes('50l')) setSelectedBudget('under-50l');
    else if (query.includes('1 cr') || query.includes('1crore') || query.includes('100 lakh')) setSelectedBudget('50l-1cr');
    else if (query.includes('2 cr') || query.includes('2crore')) setSelectedBudget('1cr-2cr');

    setAiApplied(true);
  };

  const toggleBhk = (bhkVal) => {
    if (selectedBhk.includes(bhkVal)) {
      setSelectedBhk(selectedBhk.filter(b => b !== bhkVal));
    } else {
      setSelectedBhk([...selectedBhk, bhkVal]);
    }
  };

  return (
    <div className="bg-gradient-to-b from-slate-900 via-brand-900 to-slate-900 text-white py-10 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
      <div className="max-w-5xl mx-auto">
        {/* Main Heading & Trust Statement */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white mb-2">
            Find Your Ideal Home in <span className="text-amber-400 border-b-2 border-amber-400 pb-0.5">{selectedCity.name}</span>
          </h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto">
            100% RERA Verified Properties • Direct Owner Listings • Zero Fake Price Ads
          </p>
        </div>

        {/* Tab Switcher (Buy / Rent / Plot / Commercial) */}
        <div className="bg-white rounded-t-xl p-2 sm:px-4 sm:pt-3 border-t border-x border-slate-200 flex flex-wrap gap-2 justify-center sm:justify-start">
          <button 
            onClick={() => setActiveTab('buy')}
            className={`px-5 py-2 rounded-lg font-bold text-sm transition-all ${
              activeTab === 'buy' 
                ? 'bg-brand-700 text-white shadow-sm' 
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            Buy Properties
          </button>
          <button 
            onClick={() => setActiveTab('rent')}
            className={`px-5 py-2 rounded-lg font-bold text-sm transition-all ${
              activeTab === 'rent' 
                ? 'bg-brand-700 text-white shadow-sm' 
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            Rent / Lease
          </button>
          <button 
            onClick={() => setActiveTab('plot')}
            className={`px-5 py-2 rounded-lg font-bold text-sm transition-all ${
              activeTab === 'plot' 
                ? 'bg-brand-700 text-white shadow-sm' 
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            Plots & Land
          </button>
        </div>

        {/* Search Panel Box */}
        <div className="bg-white text-slate-900 rounded-b-xl rounded-tr-xl sm:rounded-tr-none p-5 shadow-lg border border-slate-200">
          {/* Row 1: Locality & Main Filters */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-4">
            {/* Locality Input */}
            <div className="md:col-span-5 relative">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Locality / Landmark
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-brand-700 absolute left-3 top-3" />
                <input 
                  type="text" 
                  value={searchLocality}
                  onChange={(e) => setSearchLocality(e.target.value)}
                  placeholder={`e.g. ${selectedCity.popularLocalities[0]}, ${selectedCity.popularLocalities[1]}...`}
                  className="w-full bg-slate-50 border border-slate-300 rounded-md pl-9 pr-3 py-2 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:bg-white"
                />
              </div>
            </div>

            {/* Property Type Dropdown */}
            <div className="md:col-span-4">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Property Type
              </label>
              <select 
                value={selectedPropertyType}
                onChange={(e) => setSelectedPropertyType(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-600"
              >
                {PROPERTY_TYPES.map(t => (
                  <option key={t.id} value={t.id}>{t.label}</option>
                ))}
              </select>
            </div>

            {/* Budget Range Dropdown */}
            <div className="md:col-span-3">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Budget Range
              </label>
              <select 
                value={selectedBudget}
                onChange={(e) => setSelectedBudget(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-600"
              >
                <option value="all">Any Budget</option>
                {activeTab === 'rent' ? (
                  <>
                    <option value="under-30k">Under ₹30,000 / mo</option>
                    <option value="30k-50k">₹30,000 - ₹50,000 / mo</option>
                    <option value="50k-plus">Above ₹50,000 / mo</option>
                  </>
                ) : (
                  <>
                    <option value="under-50l">Under ₹50 Lac</option>
                    <option value="50l-1cr">₹50 Lac - ₹1.0 Cr</option>
                    <option value="1cr-2cr">₹1.0 Cr - ₹2.0 Cr</option>
                    <option value="2cr-plus">Above ₹2.0 Cr</option>
                  </>
                )}
              </select>
            </div>
          </div>

          {/* Row 2: BHK Selector & Quick Popular Localities */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-100">
            {/* BHK Selection Buttons */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">BHK:</span>
              <div className="flex items-center gap-1.5">
                {BHK_OPTIONS.map(bhk => {
                  const isSelected = selectedBhk.includes(bhk.value);
                  return (
                    <button 
                      key={bhk.value}
                      onClick={() => toggleBhk(bhk.value)}
                      className={`px-3 py-1 rounded border text-xs font-bold transition-all ${
                        isSelected 
                          ? 'bg-brand-700 text-white border-brand-700' 
                          : 'bg-slate-50 text-slate-700 border-slate-300 hover:border-slate-400'
                      }`}
                    >
                      {bhk.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Popular Localities Chips */}
            <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-500">
              <span className="font-semibold text-slate-600">Popular:</span>
              {selectedCity.popularLocalities.slice(0, 4).map(loc => (
                <button 
                  key={loc}
                  onClick={() => setSearchLocality(loc)}
                  className={`px-2 py-0.5 rounded transition-colors ${
                    searchLocality === loc 
                      ? 'bg-blue-100 text-brand-800 font-bold' 
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {loc}
                </button>
              ))}
            </div>
          </div>

          {/* Row 3: Natural Language AI Assistant Search Bar */}
          <div className="mt-4 pt-4 border-t border-slate-100 bg-slate-50 p-3 rounded-lg border border-slate-200">
            <form onSubmit={handleAiSearchParse} className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 text-brand-700 font-bold text-xs shrink-0">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Smart AI Filter:</span>
              </div>
              <input 
                type="text" 
                value={aiQuery}
                onChange={(e) => {
                  setAiQuery(e.target.value);
                  if (aiApplied) setAiApplied(false);
                }}
                placeholder={`Type in plain language e.g., "3 BHK ready to move in Whitefield under 1 Cr"`}
                className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-600"
              />
              <button 
                type="submit"
                className="bg-brand-700 hover:bg-brand-800 text-white text-xs font-bold px-3 py-1.5 rounded shrink-0 flex items-center gap-1 transition-colors"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Apply</span>
              </button>
            </form>

            {aiApplied && (
              <div className="flex items-center justify-between text-xs text-emerald-800 font-semibold mt-2 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                <span className="flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  Smart AI search matched filters for city locality & price budget!
                </span>
                <button 
                  onClick={() => {
                    setAiQuery('');
                    setAiApplied(false);
                    onResetFilters();
                  }}
                  className="text-slate-500 hover:text-slate-800 underline text-[11px]"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
