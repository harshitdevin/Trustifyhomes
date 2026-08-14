import React, { useState } from 'react';
import { 
  User, 
  ShieldCheck, 
  Briefcase, 
  ShieldAlert, 
  Phone, 
  Mail, 
  MapPin, 
  Check, 
  Building2, 
  Heart, 
  FileText,
  Save,
  RotateCcw
} from 'lucide-react';

import { supabaseService } from '../services/supabaseService';

export default function ProfilePage({ userRole, setUserRole, shortlistCount, currentUser }) {
  const [userName, setUserName] = useState(() => {
    if (currentUser?.user_metadata?.full_name) return currentUser.user_metadata.full_name;
    if (userRole === 'admin') return 'System Administrator';
    if (userRole === 'broker') return 'Col. Vikram Singh (Duggar Realty)';
    return 'Harshit Sharma';
  });

  const [userPhone, setUserPhone] = useState(() => currentUser?.user_metadata?.phone || '+91 94191 55443');
  const [userEmail, setUserEmail] = useState(() => currentUser?.email || 'harshit.sharma@ezhomes.in');
  const [userCity, setUserCity] = useState(() => currentUser?.user_metadata?.city || 'Jammu');
  const [reraLicense, setReraLicense] = useState('JKRERA/JM/AGENT/2024/00889');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (currentUser?.id) {
        await supabaseService.updateProfile(currentUser.id, {
          full_name: userName,
          phone: userPhone,
          city: userCity
        });
      }
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (err) {
      console.error('Failed to update profile:', err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Profile Top Banner Card */}
      <div className="bg-slate-900 text-white rounded-xl p-6 shadow-md border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-brand-600 text-white rounded-full flex items-center justify-center font-extrabold text-2xl border-2 border-brand-400">
            {userRole === 'admin' ? 'AD' : userRole === 'broker' ? 'BR' : 'CU'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-extrabold text-white">{userName}</h2>
              <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded flex items-center gap-1 uppercase ${
                userRole === 'admin' 
                  ? 'bg-purple-600 text-white' 
                  : userRole === 'broker' 
                  ? 'bg-amber-500 text-slate-950 font-bold' 
                  : 'bg-emerald-600 text-white'
              }`}>
                {userRole === 'admin' && <ShieldAlert className="w-3.5 h-3.5" />}
                {userRole === 'broker' && <Briefcase className="w-3.5 h-3.5" />}
                {userRole === 'customer' && <User className="w-3.5 h-3.5" />}
                <span>{userRole} Account</span>
              </span>
            </div>
            <p className="text-xs text-slate-300 flex items-center gap-2 mt-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{userCity}, Jammu & Kashmir</span>
              <span>•</span>
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>{userEmail}</span>
            </p>
          </div>
        </div>

        {/* Static Role Indicator inside Profile */}
        <div className="bg-slate-800 p-2.5 rounded-lg border border-slate-700 space-y-1 text-center">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Account Role:</span>
          <span className="inline-block px-3 py-1 rounded text-xs font-extrabold uppercase bg-emerald-600 text-white tracking-wider">
            {userRole}
          </span>
        </div>
      </div>

      {/* Role-Specific Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {userRole === 'customer' && (
          <>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
              <div className="bg-red-50 text-red-600 p-2.5 rounded-lg">
                <Heart className="w-6 h-6 fill-red-600" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase">Shortlisted Homes</span>
                <div className="text-xl font-extrabold text-slate-900">{shortlistCount} Saved</div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
              <div className="bg-blue-50 text-brand-700 p-2.5 rounded-lg">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase">Site Visit Callbacks</span>
                <div className="text-xl font-extrabold text-slate-900">2 Pending</div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
              <div className="bg-emerald-50 text-emerald-700 p-2.5 rounded-lg">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase">Rent Agreement Drafts</span>
                <div className="text-xl font-extrabold text-slate-900">1 Draft</div>
              </div>
            </div>
          </>
        )}

        {userRole === 'broker' && (
          <>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
              <div className="bg-emerald-50 text-emerald-700 p-2.5 rounded-lg">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase">JK RERA Status</span>
                <div className="text-sm font-extrabold text-emerald-700 flex items-center gap-1">
                  Verified Agent
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
              <div className="bg-amber-50 text-amber-800 p-2.5 rounded-lg">
                <Building2 className="w-6 h-6 text-amber-700" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase">Jammu Listings</span>
                <div className="text-xl font-extrabold text-slate-900">5 Live</div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
              <div className="bg-blue-50 text-brand-700 p-2.5 rounded-lg">
                <User className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase">Buyer Enquiries</span>
                <div className="text-xl font-extrabold text-slate-900">3 Leads</div>
              </div>
            </div>
          </>
        )}

        {userRole === 'admin' && (
          <>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
              <div className="bg-purple-50 text-purple-700 p-2.5 rounded-lg">
                <ShieldAlert className="w-6 h-6 text-purple-700" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase">Superuser Access</span>
                <div className="text-sm font-extrabold text-purple-900">Full Platform Control</div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
              <div className="bg-amber-50 text-amber-800 p-2.5 rounded-lg">
                <Building2 className="w-6 h-6 text-amber-700" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase">Jammu Listings</span>
                <div className="text-xl font-extrabold text-slate-900">5 Approved</div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
              <div className="bg-emerald-50 text-emerald-700 p-2.5 rounded-lg">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase">Pending Approvals</span>
                <div className="text-xl font-extrabold text-emerald-700">0 Queue</div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Editable Profile Form */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-5">
          <h3 className="text-base font-extrabold text-slate-900">
            Edit {userRole.toUpperCase()} Profile Information
          </h3>
          {savedSuccess && (
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200 flex items-center gap-1">
              <Check className="w-3.5 h-3.5 text-emerald-600" /> Profile Updated Successfully
            </span>
          )}
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4 text-xs font-semibold text-slate-700">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-500 uppercase tracking-wider mb-1 text-[10px]">Full Name</label>
              <input 
                type="text" 
                required
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-brand-600"
              />
            </div>

            <div>
              <label className="block text-slate-500 uppercase tracking-wider mb-1 text-[10px]">Phone Number</label>
              <input 
                type="tel" 
                required
                value={userPhone}
                onChange={(e) => setUserPhone(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-brand-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-500 uppercase tracking-wider mb-1 text-[10px]">Email Address</label>
              <input 
                type="email" 
                required
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-brand-600"
              />
            </div>

            <div>
              <label className="block text-slate-500 uppercase tracking-wider mb-1 text-[10px]">Primary City</label>
              <input 
                type="text" 
                required
                value={userCity}
                onChange={(e) => setUserCity(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-brand-600"
              />
            </div>
          </div>

          {userRole === 'broker' && (
            <div>
              <label className="block text-slate-500 uppercase tracking-wider mb-1 text-[10px]">JK RERA Agent License Registration Number</label>
              <input 
                type="text" 
                required
                value={reraLicense}
                onChange={(e) => setReraLicense(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-xs font-extrabold text-emerald-800 font-mono focus:outline-none"
              />
            </div>
          )}

          <div className="pt-2">
            <button 
              type="submit"
              className="ez-btn-primary py-2.5 px-6 text-xs bg-slate-900 hover:bg-slate-800"
            >
              <Save className="w-4 h-4" />
              <span>Save Profile Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
