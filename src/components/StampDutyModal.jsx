import React, { useState } from 'react';
import { X, ShieldCheck, Info } from 'lucide-react';
import { CITIES_DATA } from '../data/citiesAndLocalities';

export default function StampDutyModal({ onClose }) {
  const [propValueLacs, setPropValueLacs] = useState(85); // 85 Lacs
  const [selectedState, setSelectedState] = useState('Karnataka');
  const [isFemaleOwner, setIsFemaleOwner] = useState(false);

  // State stamp duty rates map
  const STATE_RATES = {
    Karnataka: { stamp: 0.05, reg: 0.01, femaleConcession: 0.00 },
    Maharashtra: { stamp: 0.06, reg: 0.01, femaleConcession: 0.01 }, // 1% discount for women in MH
    'Haryana/Delhi': { stamp: 0.06, reg: 0.01, femaleConcession: 0.02 }, // 2% discount in Delhi NCR
    Telangana: { stamp: 0.055, reg: 0.005, femaleConcession: 0.00 },
    'Tamil Nadu': { stamp: 0.07, reg: 0.02, femaleConcession: 0.00 }
  };

  const rates = STATE_RATES[selectedState] || STATE_RATES['Karnataka'];
  const effectiveStampRate = isFemaleOwner && rates.femaleConcession > 0 
    ? rates.stamp - rates.femaleConcession 
    : rates.stamp;

  const propertyVal = propValueLacs * 100000;
  const stampDutyAmt = Math.round(propertyVal * effectiveStampRate);
  const regFeeAmt = Math.round(propertyVal * rates.reg);
  const totalTaxAmt = stampDutyAmt + regFeeAmt;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 relative my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-5">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-100 text-emerald-800 p-2 rounded-lg">
              <ShieldCheck className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">Stamp Duty & Registration Calculator</h3>
              <p className="text-xs text-slate-500">Calculate State Govt tax & property registration fees</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Inputs */}
        <div className="space-y-4 text-xs font-semibold text-slate-700">
          <div>
            <label className="block text-slate-500 uppercase tracking-wider mb-1 text-[10px]">Property Agreement Value</label>
            <div className="flex items-center gap-2">
              <input 
                type="number" 
                value={propValueLacs}
                onChange={(e) => setPropValueLacs(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-base font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-600"
              />
              <span className="text-sm font-bold text-slate-900 shrink-0">Lacs (₹{(propertyVal / 100000).toFixed(2)} Lac)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-500 uppercase tracking-wider mb-1 text-[10px]">State Jurisdiction</label>
              <select 
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none"
              >
                <option value="Karnataka">Karnataka (5% Stamp)</option>
                <option value="Maharashtra">Maharashtra (6% Stamp)</option>
                <option value="Haryana/Delhi">Delhi NCR (6% Stamp)</option>
                <option value="Telangana">Telangana (5.5% Stamp)</option>
                <option value="Tamil Nadu">Tamil Nadu (7% Stamp)</option>
              </select>
            </div>

            <div className="flex items-center pt-4">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-900">
                <input 
                  type="checkbox" 
                  checked={isFemaleOwner}
                  onChange={(e) => setIsFemaleOwner(e.target.checked)}
                  className="w-4 h-4 text-brand-700 rounded cursor-pointer"
                />
                <span>Sole Female Ownership Discount</span>
              </label>
            </div>
          </div>

          {/* Breakdown Card */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-600">Stamp Duty Charges ({(effectiveStampRate * 100).toFixed(1)}%):</span>
              <span className="font-extrabold text-slate-900">₹{stampDutyAmt.toLocaleString('en-IN')}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-600">Registration Fee ({(rates.reg * 100).toFixed(1)}%):</span>
              <span className="font-extrabold text-slate-900">₹{regFeeAmt.toLocaleString('en-IN')}</span>
            </div>

            <div className="flex justify-between border-t border-slate-300 pt-2 font-extrabold text-sm text-emerald-800">
              <span>Total Taxes & Government Fees:</span>
              <span>₹{totalTaxAmt.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {isFemaleOwner && rates.femaleConcession > 0 && (
            <div className="bg-emerald-50 text-emerald-800 p-2.5 rounded border border-emerald-200 text-xs flex items-center gap-1.5">
              <Info className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Female concession applied! You saved {(rates.femaleConcession * 100)}% on Stamp Duty.</span>
            </div>
          )}
        </div>

        <button 
          onClick={onClose} 
          className="w-full mt-4 bg-brand-700 hover:bg-brand-800 text-white font-bold text-xs py-2.5 rounded transition-colors"
        >
          Close Calculator
        </button>
      </div>
    </div>
  );
}
