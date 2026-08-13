import React from 'react';
import { ShieldCheck, UserCheck, Key, Compass, SlidersHorizontal, RotateCcw } from 'lucide-react';

export default function FilterBar({ 
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
  onResetFilters
}) {
  return (
    <div className="bg-white border-b border-slate-200 py-3 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        {/* Left Side: Filter Pill Chips */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 mr-1">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-700" />
            Quick Filters:
          </span>

          {/* RERA Verified Filter */}
          <button 
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

          {/* East Facing Vaastu */}
          <button 
            onClick={() => setFilterEastFacing(!filterEastFacing)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 border ${
              filterEastFacing 
                ? 'bg-purple-100 text-purple-900 border-purple-400' 
                : 'bg-slate-50 text-slate-700 border-slate-300 hover:border-slate-400'
            }`}
          >
            <Compass className={`w-3.5 h-3.5 ${filterEastFacing ? 'text-purple-700' : 'text-slate-500'}`} />
            <span>East/Vaastu Facing</span>
          </button>

          {(filterReraOnly || filterOwnerOnly || filterReadyToMove || filterEastFacing) && (
            <button 
              onClick={onResetFilters}
              className="text-xs text-slate-500 hover:text-slate-800 font-semibold underline flex items-center gap-1 ml-1"
            >
              <RotateCcw className="w-3 h-3" />
              Reset All
            </button>
          )}
        </div>

        {/* Right Side: Total Count & Sort By */}
        <div className="flex items-center gap-4 text-xs font-medium text-slate-700">
          <div>
            Showing <span className="font-bold text-slate-900">{totalResults}</span> Verified Listings
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-semibold">Sort By:</span>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-slate-100 border border-slate-300 rounded px-2.5 py-1 text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-600 cursor-pointer"
            >
              <option value="relevance">Relevance</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="area-high">Area: Largest First</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
