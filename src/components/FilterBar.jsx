import React from 'react';
import { ShieldCheck, UserCheck, Key, Compass, SlidersHorizontal, RotateCcw, Home, Utensils, GraduationCap } from 'lucide-react';

export default function FilterBar({ 
  activeTab,
  filterReraOnly, 
  setFilterReraOnly,
  filterOwnerOnly, 
  setFilterOwnerOnly,
  filterReadyToMove, 
  setFilterReadyToMove,
  filterEastFacing, 
  setFilterEastFacing,
  sortBy, 
  setSortBy,
  totalResults,
  onResetFilters,
  pgGender,
  setPgGender,
  pgRoomType,
  setPgRoomType,
  foodIncluded,
  setFoodIncluded
}) {
  const isPg = activeTab === 'pg';

  return (
    <div className="bg-white border-b border-slate-200 py-3 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        
        {/* Left Side: Quick Filter Chips */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 mr-1">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-700" />
            Quick Filters:
          </span>

          {isPg ? (
            <>
              {/* PG Gender Chips */}
              <div className="flex items-center gap-1 bg-purple-50 p-1 rounded-full border border-purple-200 text-xs">
                {['All', 'Boys', 'Girls', 'Co-living'].map(g => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setPgGender && setPgGender(g)}
                    className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] transition-all ${
                      pgGender === g ? 'bg-purple-900 text-white' : 'text-purple-900 hover:bg-purple-100'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>

              {/* Food Included Filter */}
              <button 
                type="button"
                onClick={() => setFoodIncluded && setFoodIncluded(foodIncluded === 'Food Included' ? 'All' : 'Food Included')}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 border ${
                  foodIncluded === 'Food Included'
                    ? 'bg-amber-100 text-amber-900 border-amber-400' 
                    : 'bg-slate-50 text-slate-700 border-slate-300 hover:border-slate-400'
                }`}
              >
                <Utensils className="w-3.5 h-3.5 text-amber-700" />
                <span>Mess / Food Included</span>
              </button>
            </>
          ) : (
            <>
              {/* RERA Verified Filter */}
              <button 
                type="button"
                onClick={() => setFilterReraOnly(!filterReraOnly)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 border ${
                  filterReraOnly 
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-400' 
                    : 'bg-slate-50 text-slate-700 border-slate-300 hover:border-slate-400'
                }`}
              >
                <ShieldCheck className={`w-3.5 h-3.5 ${filterReraOnly ? 'text-emerald-700' : 'text-slate-500'}`} />
                <span>RERA Verified Only</span>
              </button>

              {/* Direct Owner Filter */}
              <button 
                type="button"
                onClick={() => setFilterOwnerOnly(!filterOwnerOnly)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 border ${
                  filterOwnerOnly 
                    ? 'bg-blue-100 text-brand-800 border-blue-400' 
                    : 'bg-slate-50 text-slate-700 border-slate-300 hover:border-slate-400'
                }`}
              >
                <UserCheck className={`w-3.5 h-3.5 ${filterOwnerOnly ? 'text-brand-700' : 'text-slate-500'}`} />
                <span>Direct Owner (0 Brokerage)</span>
              </button>

              {/* Ready to Move Filter */}
              <button 
                type="button"
                onClick={() => setFilterReadyToMove(!filterReadyToMove)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 border ${
                  filterReadyToMove 
                    ? 'bg-amber-100 text-amber-900 border-amber-400' 
                    : 'bg-slate-50 text-slate-700 border-slate-300 hover:border-slate-400'
                }`}
              >
                <Key className={`w-3.5 h-3.5 ${filterReadyToMove ? 'text-amber-700' : 'text-slate-500'}`} />
                <span>Ready to Move</span>
              </button>
            </>
          )}

          <button 
            type="button"
            onClick={onResetFilters}
            className="text-xs text-slate-500 hover:text-slate-800 font-semibold underline flex items-center gap-1 ml-1"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
        </div>

        {/* Right Side: Total Count & Sort By */}
        <div className="flex items-center gap-4 text-xs font-medium text-slate-700">
          <div>
            Showing <span className="font-bold text-slate-900">{totalResults}</span> {isPg ? 'PG Listings' : 'Properties'}
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-semibold">Sort By:</span>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-slate-100 border border-slate-300 rounded px-2.5 py-1 text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-600 cursor-pointer"
            >
              <option value="relevance">Relevance</option>
              <option value="price-low">{isPg ? 'Rent: Low to High' : 'Price: Low to High'}</option>
              <option value="price-high">{isPg ? 'Rent: High to Low' : 'Price: High to Low'}</option>
              {isPg && <option value="nearest">Nearest to Target College</option>}
              {!isPg && <option value="area-high">Area: Largest First</option>}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
