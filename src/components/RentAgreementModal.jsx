import React, { useState } from 'react';
import { X, FileText, CheckCircle2, Copy, Printer, ShieldCheck } from 'lucide-react';

export default function RentAgreementModal({ onClose }) {
  const [activeTab, setActiveTab] = useState('generator'); // generator | kyc
  const [landlordName, setLandlordName] = useState('Rajesh Kumar');
  const [tenantName, setTenantName] = useState('Ananya Sen');
  const [propertyAddress, setPropertyAddress] = useState('Flat 402, Prestige Lakeside Habitat, Whitefield, Bengaluru');
  const [rentAmount, setRentAmount] = useState(45000);
  const [depositAmount, setDepositAmount] = useState(250000);
  const [noticePeriodMonths, setNoticePeriodMonths] = useState(1);
  const [copied, setCopied] = useState(false);

  const agreementText = `RENTAL AGREEMENT DRAFT (11 MONTHS)
--------------------------------------------------
THIS RENT AGREEMENT is executed at Bengaluru on this 14th day of August, 2026.

BETWEEN:
LANDLORD: ${landlordName || '[Landlord Name]'}, residing at ${propertyAddress || '[Address]'}.
AND
TENANT: ${tenantName || '[Tenant Name]'}, holding Aadhaar ID: XXXX-XXXX-4321.

1. PREMISES: Landlord agrees to let out the residential property located at ${propertyAddress} to the Tenant.
2. DURATION: The tenancy shall be for a fixed term of 11 (Eleven) Months starting from August 14, 2026.
3. MONTHLY RENT: Tenant agrees to pay a monthly rent of ₹${rentAmount.toLocaleString('en-IN')} (Rupees ${rentAmount} Only) on or before the 5th day of every calendar month.
4. SECURITY DEPOSIT: Tenant has deposited an interest-free Security Deposit of ₹${depositAmount.toLocaleString('en-IN')} with the Landlord, refundable at the time of vacating.
5. NOTICE PERIOD: Either party may terminate this tenancy agreement by providing ${noticePeriodMonths} Month(s) written advance notice.
6. UTILITIES: Tenant shall pay actual electricity, water, and broadband charges directly to service providers.

IN WITNESS WHEREOF the Landlord and Tenant have set their hands on the day and year first written above.

Landlord Signature: _______________          Tenant Signature: _______________
Witness 1: ________________________          Witness 2: ______________________`;

  const handleCopyText = () => {
    navigator.clipboard.writeText(agreementText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    const win = window.open('', '', 'width=800,height=600');
    win.document.write(`<pre style="font-family: monospace; font-size: 13px; line-height: 1.6; padding: 20px;">${agreementText}</pre>`);
    win.document.close();
    win.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-3xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 relative my-auto max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-4">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-100 text-emerald-800 p-2 rounded-lg">
              <FileText className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">Digital Rent Agreement & Police KYC Checklist</h3>
              <p className="text-xs text-slate-500">Generate standard 11-Month draft agreement under Indian Stamp Act</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3 mb-4">
          <button 
            onClick={() => setActiveTab('generator')}
            className={`text-xs font-bold px-3 py-1.5 rounded transition-colors ${
              activeTab === 'generator' ? 'bg-brand-700 text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            11-Month Rent Agreement Builder
          </button>
          <button 
            onClick={() => setActiveTab('kyc')}
            className={`text-xs font-bold px-3 py-1.5 rounded transition-colors ${
              activeTab === 'kyc' ? 'bg-brand-700 text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            Tenant Police Verification Guide
          </button>
        </div>

        {activeTab === 'generator' ? (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            {/* Input Form Column */}
            <div className="md:col-span-5 space-y-3 text-xs font-semibold text-slate-700">
              <div>
                <label className="block text-slate-500 uppercase tracking-wider mb-1 text-[10px]">Landlord Name</label>
                <input 
                  type="text"
                  value={landlordName}
                  onChange={(e) => setLandlordName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-500 uppercase tracking-wider mb-1 text-[10px]">Tenant Name</label>
                <input 
                  type="text"
                  value={tenantName}
                  onChange={(e) => setTenantName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-500 uppercase tracking-wider mb-1 text-[10px]">Rented Property Address</label>
                <input 
                  type="text"
                  value={propertyAddress}
                  onChange={(e) => setPropertyAddress(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-500 uppercase tracking-wider mb-1 text-[10px]">Monthly Rent (₹)</label>
                  <input 
                    type="number"
                    value={rentAmount}
                    onChange={(e) => setRentAmount(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 uppercase tracking-wider mb-1 text-[10px]">Deposit (₹)</label>
                  <input 
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none font-bold"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button 
                  onClick={handleCopyText}
                  className="ez-btn-primary py-2 px-3 text-xs w-1/2 bg-slate-900 hover:bg-slate-800"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copied ? 'Copied!' : 'Copy Draft'}</span>
                </button>
                <button 
                  onClick={handlePrint}
                  className="ez-btn-outline py-2 px-3 text-xs w-1/2 border-slate-400"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print PDF</span>
                </button>
              </div>
            </div>

            {/* Live Document Preview Box */}
            <div className="md:col-span-7 bg-slate-900 text-emerald-400 p-4 rounded-xl font-mono text-[11px] leading-relaxed overflow-x-auto border border-slate-800 h-80 overflow-y-auto">
              <pre className="whitespace-pre-wrap">{agreementText}</pre>
            </div>
          </div>
        ) : (
          /* Tenant Police Verification Checklist Tab */
          <div className="space-y-4 text-xs">
            <div className="bg-emerald-50 border border-emerald-300 p-4 rounded-xl flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-emerald-700 shrink-0" />
              <div>
                <h4 className="font-extrabold text-emerald-950 text-sm">Mandatory Tenant Police Verification</h4>
                <p className="text-emerald-800">
                  Under state police regulations (Karnataka, Maharashtra, Delhi-NCR), house owners are legally required to register tenant KYC details with the local police station.
                </p>
              </div>
            </div>

            <div className="space-y-2 font-medium text-slate-800">
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Aadhaar & Voter ID Proof:</strong> Both Landlord and Tenant must submit self-attested copies of government photo IDs.
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Employment Offer Letter / Company ID:</strong> Verification of tenant's current workplace or office address.
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Online Police Clearance Form:</strong> Apply on Karnataka Seva Sindhu / Maharashtra Police / Delhi Police online citizen portals.
                </div>
              </div>
            </div>
          </div>
        )}

        <button 
          onClick={onClose} 
          className="w-full mt-4 bg-brand-700 hover:bg-brand-800 text-white font-bold text-xs py-2.5 rounded transition-colors"
        >
          Close Tool
        </button>
      </div>
    </div>
  );
}
