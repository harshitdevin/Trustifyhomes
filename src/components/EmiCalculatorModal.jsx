import React, { useState } from 'react';
import { X, Calculator, Building, HelpCircle } from 'lucide-react';

export default function EmiCalculatorModal({ onClose }) {
  const [loanAmountLacs, setLoanAmountLacs] = useState(75); // 75 Lacs default
  const [interestRate, setInterestRate] = useState(8.5); // 8.5% default
  const [tenureYears, setTenureYears] = useState(20); // 20 years default

  // Calculate EMI formula: P * r * (1+r)^n / ((1+r)^n - 1)
  const P = loanAmountLacs * 100000;
  const r = (interestRate / 12) / 100;
  const n = tenureYears * 12;

  const emi = Math.round((P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));
  const totalPayable = emi * n;
  const totalInterest = totalPayable - P;

  const BANK_RATES = [
    { name: 'State Bank of India (SBI)', rate: '8.40%', processing: '₹5,000 max' },
    { name: 'HDFC Bank', rate: '8.50%', processing: '0.50%' },
    { name: 'ICICI Bank', rate: '8.55%', processing: '0.50%' },
    { name: 'Axis Bank', rate: '8.60%', processing: '₹10,000' }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 relative my-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-5">
          <div className="flex items-center gap-2">
            <div className="bg-amber-100 text-amber-900 p-2 rounded-lg">
              <Calculator className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">Home Loan EMI Calculator</h3>
              <p className="text-xs text-slate-500">Calculate monthly instalments & interest for Indian Banks</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sliders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-7 space-y-4 text-xs font-medium">
            {/* Loan Amount Slider */}
            <div>
              <div className="flex justify-between font-bold text-slate-900 mb-1">
                <span>Loan Amount</span>
                <span className="text-brand-700 font-extrabold text-sm">₹{loanAmountLacs} Lacs</span>
              </div>
              <input 
                type="range"
                min="5"
                max="500"
                step="5"
                value={loanAmountLacs}
                onChange={(e) => setLoanAmountLacs(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-700"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>₹5 Lacs</span>
                <span>₹5 Crores</span>
              </div>
            </div>

            {/* Interest Rate Slider */}
            <div>
              <div className="flex justify-between font-bold text-slate-900 mb-1">
                <span>Interest Rate (% p.a.)</span>
                <span className="text-brand-700 font-extrabold text-sm">{interestRate}%</span>
              </div>
              <input 
                type="range"
                min="6.5"
                max="14.0"
                step="0.1"
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-700"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>6.5%</span>
                <span>14.0%</span>
              </div>
            </div>

            {/* Tenure Slider */}
            <div>
              <div className="flex justify-between font-bold text-slate-900 mb-1">
                <span>Loan Tenure (Years)</span>
                <span className="text-brand-700 font-extrabold text-sm">{tenureYears} Years</span>
              </div>
              <input 
                type="range"
                min="1"
                max="30"
                step="1"
                value={tenureYears}
                onChange={(e) => setTenureYears(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-700"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>1 Year</span>
                <span>30 Years</span>
              </div>
            </div>
          </div>

          {/* EMI Result Summary Card */}
          <div className="md:col-span-5 bg-brand-900 text-white p-5 rounded-xl flex flex-col justify-between">
            <div>
              <span className="text-slate-300 text-xs font-bold uppercase tracking-wider block mb-1">
                Monthly EMI Payable
              </span>
              <div className="text-3xl font-extrabold text-amber-400">
                ₹{emi.toLocaleString('en-IN')} <span className="text-xs text-slate-300 font-normal">/ month</span>
              </div>
            </div>

            <div className="space-y-2 my-4 text-xs border-t border-slate-700 pt-3">
              <div className="flex justify-between">
                <span className="text-slate-400">Principal Amount:</span>
                <span className="font-bold">₹{(P / 100000).toFixed(2)} Lacs</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Interest Payable:</span>
                <span className="font-bold text-amber-300">₹{(totalInterest / 100000).toFixed(2)} Lacs</span>
              </div>
              <div className="flex justify-between border-t border-slate-700 pt-1.5 font-bold">
                <span className="text-slate-300">Total Amount Payable:</span>
                <span className="text-white">₹{(totalPayable / 100000).toFixed(2)} Lacs</span>
              </div>
            </div>

            <button 
              onClick={onClose}
              className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs py-2 rounded transition-colors"
            >
              Done & Apply
            </button>
          </div>
        </div>

        {/* Bank Rates Comparison */}
        <div className="mt-5 pt-4 border-t border-slate-200">
          <h4 className="text-xs font-extrabold text-slate-800 uppercase mb-2">Partner Bank Interest Rates</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            {BANK_RATES.map((b, i) => (
              <div key={i} className="bg-slate-50 border border-slate-200 p-2 rounded">
                <div className="font-bold text-slate-900 truncate">{b.name}</div>
                <div className="text-brand-700 font-extrabold text-sm">{b.rate}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
