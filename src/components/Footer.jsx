import React from 'react';
import { Building2, ShieldCheck, Phone, MessageSquare, Heart } from 'lucide-react';

export default function Footer({ onOpenEmi, onOpenUnitConverter, onOpenStampDuty }) {
  return (
    <footer className="bg-slate-900 text-slate-300 text-xs pt-10 pb-8 border-t border-slate-800 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Top 4 Columns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & About */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="bg-brand-600 text-white p-2 rounded-lg">
                <Building2 className="w-5 h-5" />
              </div>
              <span className="text-lg font-extrabold text-white">EZ HOMES</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              India's simple, transparent, and trustworthy real estate marketplace. Connecting buyers, tenants, owners, and registered brokers with verified property listings.
            </p>
            <div className="text-emerald-400 font-bold flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>RERA Registered Portal</span>
            </div>
          </div>

          {/* Popular Cities */}
          <div>
            <h4 className="text-xs font-extrabold text-white uppercase tracking-wider mb-3">Properties by City</h4>
            <ul className="space-y-2 text-slate-400">
              <li><a href="#buy" className="hover:text-white transition-colors">Flats in Bengaluru (Whitefield, HSR)</a></li>
              <li><a href="#buy" className="hover:text-white transition-colors">Properties in Mumbai (Bandra, Worli)</a></li>
              <li><a href="#buy" className="hover:text-white transition-colors">Apartments in Delhi NCR (Gurgaon)</a></li>
              <li><a href="#buy" className="hover:text-white transition-colors">Flats in Pune (Wakad, Kharadi)</a></li>
              <li><a href="#buy" className="hover:text-white transition-colors">Gated Communities in Hyderabad</a></li>
            </ul>
          </div>

          {/* Tools & Utilities */}
          <div>
            <h4 className="text-xs font-extrabold text-white uppercase tracking-wider mb-3">Real Estate Calculators</h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <button onClick={onOpenEmi} className="hover:text-white transition-colors text-left">
                  Home Loan EMI Calculator
                </button>
              </li>
              <li>
                <button onClick={onOpenUnitConverter} className="hover:text-white transition-colors text-left">
                  Land Unit Converter (Sq.Ft to Acres)
                </button>
              </li>
              <li>
                <button onClick={onOpenStampDuty} className="hover:text-white transition-colors text-left">
                  State Stamp Duty & Tax Estimator
                </button>
              </li>
              <li>
                <a href="#buy" className="hover:text-white transition-colors">
                  Vaastu Direction Guidelines
                </a>
              </li>
            </ul>
          </div>

          {/* Help & Support */}
          <div>
            <h4 className="text-xs font-extrabold text-white uppercase tracking-wider mb-3">Customer Helpline</h4>
            <div className="space-y-2 text-slate-400">
              <p className="flex items-center gap-1.5 text-white font-bold">
                <Phone className="w-3.5 h-3.5 text-brand-500" />
                Toll Free: 1800-420-1234
              </p>
              <p className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <MessageSquare className="w-3.5 h-3.5" />
                WhatsApp: +91 98450 12345
              </p>
              <p className="text-[11px] text-slate-500">
                Mon - Sat: 9:00 AM - 8:00 PM IST
              </p>
            </div>
          </div>
        </div>

        {/* RERA Disclaimer Box */}
        <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-[10px] text-slate-500 leading-relaxed">
          <strong className="text-slate-400">Legal Disclaimer:</strong> EZ HOMES acts solely as an advertising and listing intermediary for real estate buyers, sellers, and agents in India. All property details, RERA registration IDs, and carpet areas are provided by respective project developers, owners, or verified real estate agents. Users are advised to independently verify legal title deeds and RERA registration status on official state RERA portals before entering into purchase agreements.
        </div>

        {/* Copyright */}
        <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
          <div>© {new Date().getFullYear()} EZ HOMES Technologies India Pvt. Ltd. All rights reserved.</div>
          <div className="flex items-center gap-4">
            <a href="#terms" className="hover:text-slate-300">Privacy Policy</a>
            <a href="#terms" className="hover:text-slate-300">Terms of Use</a>
            <a href="#terms" className="hover:text-slate-300">RERA Compliance</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
