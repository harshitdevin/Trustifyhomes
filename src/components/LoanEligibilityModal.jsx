import React, { useState } from 'react';
import { X, Wallet, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

export default function LoanEligibilityModal({ onClose }) {
  const [monthlySalary, setMonthlySalary] = useState(120000); // ₹1,20,000 / month
  const [existingEmis, setExistingEmis] = useState(15000); // ₹15,000 / month existing
  const [interestRate, setInterestRate] = useState(8.5); // 8.5%
  const [tenureYears, setTenureYears] = useState(20); // 20 years

  // Standard Indian Banking FOIR (Fixed Obligation to Income Ratio) calculation:
  // Usually banks cap total monthly debt obligations at 50% of gross monthly income.
  const maxAllowableTotalEmi = monthlySalary * 0.50;
  const maxHomeLoanEmi = Math.max(0, maxAllowableTotalEmi - existingEmis);

  // Present Value of Loan given EMI: PV = EMI * [ ( (1+r)^n - 1 ) / ( r * (1+r)^n ) ]
  const r = (interestRate / 12) / 100;
  const n = tenureYears * 12;

  const maxLoanEligible = maxHomeLoanEmi > 0
    ? Math.round(maxHomeLoanEmi * ((Math.pow(1 + r, n) - 1) / (r * Math.pow(1 + r, n))))
    : 0;

  // Assuming 80% LTV (Loan to Value), max property budget = Loan Eligible / 0.80
  const maxPropertyBudget = Math.round(maxLoanEligible / 0.80);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 relative my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-5">
          <div className="flex items-center gap-2">
            <div className="bg-blue-100 text-brand-800 p-2 rounded-lg">
              <Wallet className="w-5 h-5 text-brand-700" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">Salary-based Home Loan Eligibility Predictor</h3>
              <p className="text-xs text-slate-500">Calculate maximum bank loan eligibility based on monthly net income</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Inputs & Result Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Inputs Column */}
          <div className="md:col-span-7 space-y-4 text-xs font-semibold text-slate-700">
            <div>
              <label className="block text-slate-500 uppercase tracking-wider mb-1 text-[10px]">Net Monthly Take-home Salary (INR)</label>
              <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  step="5000"
                  value={monthlySalary}
                  onChange={(e) => setMonthlySalary(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-base font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-600"
                />
                <span className="text-xs text-brand-700 font-bold shrink-0 bg-blue-50 px-2 py-1.5 rounded border border-blue-200">
                  ₹{(monthlySalary / 1000).toFixed(0)}k / mo
                </span>
              </div>
            </div>

            <div>
              <label className="block text-slate-500 uppercase tracking-wider mb-1 text-[10px]">Existing Monthly Loans / Car EMIs</label>
              <input 
                type="number" 
                step="1000"
                value={existingEmis}
                onChange={(e) => setExistingEmis(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-sm font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-500 uppercase tracking-wider mb-1 text-[10px]">Interest Rate (% p.a.)</label>
                <select 
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none"
                >
                  <option value={8.4}>8.40% (SBI)</option>
                  <option value={8.5}>8.50% (HDFC)</option>
                  <option value={8.55}>8.55% (ICICI)</option>
                  <option value={9.0}>9.00% (Standard)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-500 uppercase tracking-wider mb-1 text-[10px]">Tenure (Years)</label>
                <select 
                  value={tenureYears}
                  onChange={(e) => setTenureYears(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none"
                >
                  <option value={10}>10 Years</option>
                  <option value={15}>15 Years</option>
                  <option value={20}>20 Years</option>
                  <option value={25}>25 Years</option>
                  <option value={30}>30 Years</option>
                </select>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-[11px] text-slate-600 leading-relaxed">
              <strong className="text-slate-900">Banking FOIR Standard:</strong> Indian banks cap overall debt obligations at 50% of your net monthly income. Lowering existing credit card balance or personal loan EMIs will increase your total property loan eligibility.
            </div>
          </div>

          {/* Results Summary Box */}
          <div className="md:col-span-5 bg-brand-900 text-white p-5 rounded-xl flex flex-col justify-between shadow-md">
            <div>
              <span className="text-slate-300 text-xs font-bold uppercase tracking-wider block mb-1">
                Max Home Loan Eligible
              </span>
              <div className="text-3xl font-extrabold text-amber-400">
                ₹{(maxLoanEligible / 100000).toFixed(2)} Lacs
              </div>
              <div className="text-xs text-slate-300 mt-1 font-medium">
                Max Affordable EMI: ₹{Math.round(maxHomeLoanEmi).toLocaleString('en-IN')} / mo
              </div>
            </div>

            <div className="bg-slate-800/80 p-3 rounded-lg my-4 space-y-2 text-xs border border-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-400">Recommended Property Budget:</span>
                <strong className="text-amber-300">₹{(maxPropertyBudget / 100000).toFixed(2)} Lacs</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Down Payment Needed (20%):</span>
                <strong className="text-white">₹{((maxPropertyBudget - maxLoanEligible) / 100000).toFixed(2)} Lacs</strong>
              </div>
            </div>

            <button 
              onClick={onClose} 
              className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs py-2.5 rounded transition-colors uppercase tracking-wider"
            >
              Close & Search Eligible Homes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
