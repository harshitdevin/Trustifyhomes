import React, { useState } from 'react';
import { X, Building2, Check, Send, Phone, Mail, MapPin, Sparkles, ShieldCheck } from 'lucide-react';
import { CITIES_DATA } from '../data/citiesAndLocalities';
import { dbService } from '../services/dbService';

export default function ListYourPropertyModal({ onClose }) {
  const [ownerName, setOwnerName] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [propertyType, setPropertyType] = useState('apartment');
  const [listingType, setListingType] = useState('sale');
  const [city, setCity] = useState('Jammu');
  const [locality, setLocality] = useState('');
  const [approxPrice, setApproxPrice] = useState('');
  const [message, setMessage] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      dbService.addListingRequest({
        ownerName,
        ownerPhone,
        ownerEmail,
        propertyType,
        listingType,
        city,
        locality,
        approxPriceDisplay: approxPrice || '₹50 Lac',
        message
      });

      setSubmitted(true);
    } catch (err) {
      alert('Failed to submit property request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 relative my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="bg-amber-500 text-slate-950 p-2 rounded-lg font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">List Your Property with Trustify</h3>
              <p className="text-xs text-slate-500">Submit your property for Trustify verification & direct buyer matching</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-7 h-7 stroke-[3]" />
            </div>
            <h4 className="text-lg font-extrabold text-slate-900">Listing Request Received!</h4>
            <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
              Thank you, <strong className="text-slate-900">{ownerName}</strong>! Your property details for <strong className="text-slate-900">{locality}, {city}</strong> have been submitted to our Trustify Operations team.
            </p>
            <div className="bg-emerald-50 text-emerald-900 text-xs p-3 rounded-lg border border-emerald-200 text-left font-medium space-y-1">
              <div className="font-bold flex items-center gap-1 text-emerald-950">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> What happens next?
              </div>
              <p>1. Our operations manager will contact you at <strong className="font-mono">{ownerPhone}</strong> within 24 hours.</p>
              <p>2. We verify legal ownership & RERA documents.</p>
              <p>3. Your listing is published directly to verified buyers & students.</p>
            </div>
            <button 
              onClick={onClose} 
              className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs px-6 py-2.5 rounded mt-2"
            >
              Done & Return to Portal
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold text-slate-700">
            
            <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg text-xs text-amber-900 font-medium">
              <strong>Direct Owner Service:</strong> Trustify manages listing verification, photo shoot, and buyer lead matching. No public account creation needed.
            </div>

            {/* Owner Name & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-500 uppercase tracking-wider mb-1 text-[10px]">Your Full Name *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Lt. Col. Jasbir Jamwal"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-xs text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-500 uppercase tracking-wider mb-1 text-[10px]">Mobile Phone Number *</label>
                <input 
                  type="tel" 
                  required
                  placeholder="+91 94191 00000"
                  value={ownerPhone}
                  onChange={(e) => setOwnerPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-xs text-slate-900 focus:outline-none"
                />
              </div>
            </div>

            {/* Owner Email & City */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-500 uppercase tracking-wider mb-1 text-[10px]">Email Address</label>
                <input 
                  type="email" 
                  placeholder="name@example.com"
                  value={ownerEmail}
                  onChange={(e) => setOwnerEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-xs text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-500 uppercase tracking-wider mb-1 text-[10px]">City</label>
                <select 
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none"
                >
                  {CITIES_DATA.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Property Purpose & Type */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-500 uppercase tracking-wider mb-1 text-[10px]">Listing Purpose</label>
                <select 
                  value={listingType}
                  onChange={(e) => setListingType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none"
                >
                  <option value="sale">Sell Property</option>
                  <option value="rent">Rent / Lease Out</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-500 uppercase tracking-wider mb-1 text-[10px]">Property Category</label>
                <select 
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none"
                >
                  <option value="apartment">Apartment / Flat</option>
                  <option value="villa">Independent Villa / Kothi</option>
                  <option value="house">Builder Floor / House</option>
                  <option value="plot">Plot / Land (Kanal)</option>
                  <option value="pg">PG / Student Hostel</option>
                </select>
              </div>
            </div>

            {/* Locality & Expected Price */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-500 uppercase tracking-wider mb-1 text-[10px]">Locality / Sector Name *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Gandhi Nagar Sector 1"
                  value={locality}
                  onChange={(e) => setLocality(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-xs text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-500 uppercase tracking-wider mb-1 text-[10px]">Expected Price / Rent</label>
                <input 
                  type="text" 
                  placeholder="e.g. ₹85 Lac or ₹20,000/mo"
                  value={approxPrice}
                  onChange={(e) => setApproxPrice(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-xs text-slate-900 focus:outline-none"
                />
              </div>
            </div>

            {/* Additional Description / Message */}
            <div>
              <label className="block text-slate-500 uppercase tracking-wider mb-1 text-[10px]">Property Details & Special Notes</label>
              <textarea 
                rows={3}
                placeholder="Specify BHK, carpet area, facing direction, RERA status, or preferred contact time..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs text-slate-900 focus:outline-none"
              />
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs py-3 rounded transition-colors uppercase tracking-wider shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Submitting Request...' : 'Submit Listing Request to Trustify'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
