import React, { useState } from 'react';
import { X, Compass, ArrowRightLeft } from 'lucide-react';

const CONVERSION_RATES_TO_SQFT = {
  sqft: 1,
  marla: 272.25, // 1 Marla (J&K) = 272.25 sqft (20 Marla = 1 Kanal)
  kanal: 5445, // 1 Kanal (J&K) = 5,445 sqft
  sqyard: 9, // 1 sq yard = 9 sqft
  gaj: 9, // 1 gaj = 9 sqft
  acre: 43560, // 1 acre = 43,560 sqft (8 Kanals)
  guntha: 1089, // 1 guntha = 1089 sqft
  bigha: 27225 // 1 Bigha = 27,225 sqft
};

export default function UnitConverterModal({ onClose }) {
  const [val, setVal] = useState(1);
  const [fromUnit, setFromUnit] = useState('kanal');
  const [toUnit, setToUnit] = useState('sqft');

  const sqftVal = val * CONVERSION_RATES_TO_SQFT[fromUnit];
  const convertedVal = sqftVal / CONVERSION_RATES_TO_SQFT[toUnit];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 relative my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-5">
          <div className="flex items-center gap-2">
            <div className="bg-blue-100 text-brand-800 p-2 rounded-lg">
              <Compass className="w-5 h-5 text-brand-700" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">Land Unit Converter (J&K Special)</h3>
              <p className="text-xs text-slate-500">Convert Kanal, Marla, Sq.Ft, Sq.Yards & Acres</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input Controls */}
        <div className="space-y-4 text-xs font-semibold text-slate-700">
          <div>
            <label className="block text-slate-500 uppercase tracking-wider mb-1 text-[10px]">Enter Area Value</label>
            <input 
              type="number" 
              value={val}
              onChange={(e) => setVal(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-base font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
            <div>
              <label className="block text-slate-500 uppercase tracking-wider mb-1 text-[10px]">From Unit</label>
              <select 
                value={fromUnit}
                onChange={(e) => setFromUnit(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-600"
              >
                <option value="kanal">Kanal (5,445 sq.ft)</option>
                <option value="marla">Marla (272.25 sq.ft)</option>
                <option value="sqft">Square Feet (sq.ft)</option>
                <option value="sqyard">Square Yards (sq.yd)</option>
                <option value="gaj">Gaj</option>
                <option value="acre">Acres (8 Kanals)</option>
                <option value="guntha">Guntha</option>
                <option value="bigha">Bigha</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-500 uppercase tracking-wider mb-1 text-[10px]">To Unit</label>
              <select 
                value={toUnit}
                onChange={(e) => setToUnit(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-600"
              >
                <option value="sqft">Square Feet (sq.ft)</option>
                <option value="marla">Marla (272.25 sq.ft)</option>
                <option value="kanal">Kanal (5,445 sq.ft)</option>
                <option value="sqyard">Square Yards (sq.yd)</option>
                <option value="gaj">Gaj</option>
                <option value="acre">Acres</option>
                <option value="guntha">Guntha</option>
                <option value="bigha">Bigha</option>
              </select>
            </div>
          </div>

          {/* Result Output Card */}
          <div className="bg-slate-900 text-white p-4 rounded-xl text-center space-y-1">
            <div className="text-xs text-slate-400 font-bold uppercase">Converted Equivalent</div>
            <div className="text-2xl font-extrabold text-amber-400">
              {convertedVal.toLocaleString('en-IN', { maximumFractionDigits: 4 })} <span className="text-sm font-semibold text-slate-300">{toUnit.toUpperCase()}</span>
            </div>
            <div className="text-[11px] text-slate-400 border-t border-slate-800 pt-2 mt-2">
              Standard Base: {sqftVal.toLocaleString('en-IN')} Square Feet (sq.ft) • (20 Marlas = 1 Kanal)
            </div>
          </div>
        </div>

        <button 
          onClick={onClose} 
          className="w-full mt-4 bg-brand-700 hover:bg-brand-800 text-white font-bold text-xs py-2.5 rounded transition-colors"
        >
          Close Converter
        </button>
      </div>
    </div>
  );
}
