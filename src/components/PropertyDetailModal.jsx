import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  MapPin, 
  Phone, 
  MessageSquare, 
  Heart, 
  Layers, 
  Sparkles, 
  Building2, 
  Compass, 
  Check, 
  Calendar,
  Share2,
  AlertCircle
} from 'lucide-react';

import { supabaseService } from '../services/supabaseService';
import { leadIntelligenceService } from '../services/leadIntelligenceService';

export default function PropertyDetailModal({ 
  property, 
  onClose, 
  isShortlisted, 
  onToggleShortlist, 
  onOpenEmi,
  onOpenStampDuty,
  currentUser
}) {
  const [activeTab, setActiveTab] = useState('photos'); // photos | floorplan
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [inquirySubmitted, setInquirySubmitted] = useState(false);
  const [buyerName, setBuyerName] = useState(currentUser?.email ? currentUser.email.split('@')[0] : '');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [isSubmittingEnquiry, setIsSubmittingEnquiry] = useState(false);
  const [enquiryError, setEnquiryError] = useState('');

  if (!property) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white rounded-xl p-8 max-w-md w-full text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
          <h3 className="text-lg font-bold text-slate-900">Property Not Found</h3>
          <p className="text-xs text-slate-500">The property listing you are looking for is unavailable or has been removed.</p>
          <button onClick={onClose} className="ez-btn-primary py-2 px-4 text-xs">Close</button>
        </div>
      </div>
    );
  }

  const handleInquirySubmit = async (e) => {
    e.preventDefault();
    setEnquiryError('');
    setIsSubmittingEnquiry(true);

    try {
      await supabaseService.submitEnquiry({
        propertyId: property.id,
        buyerId: currentUser?.id || null,
        name: buyerName,
        phone: buyerPhone,
        email: currentUser?.email || null,
        message: `Callback request for ${property.title}`,
        budget: property.priceVal
      });

      leadIntelligenceService.trackActivityEvent({
        userId: currentUser?.id || 'cust-101',
        eventType: 'enquiry_created',
        propertyId: property.id,
        locality: property.locality,
        propertyType: property.propertyType
      });

      setInquirySubmitted(true);
    } catch (err) {
      setEnquiryError(err.message || 'Failed to submit callback request.');
    } finally {
      setIsSubmittingEnquiry(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 flex flex-col my-auto">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-start justify-between gap-4 sticky top-0 bg-white z-20 shadow-xs">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-brand-50 text-brand-800 text-xs font-bold px-2.5 py-0.5 rounded border border-blue-200 uppercase">
                {property.bhk} BHK {property.propertyType}
              </span>
              {property.isReraVerified && (
                <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-0.5 rounded flex items-center gap-1 border border-emerald-300">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                  RERA Verified
                </span>
              )}
            </div>
            <h2 className="text-lg sm:text-2xl font-extrabold text-slate-900">{property.title}</h2>
            <p className="text-xs sm:text-sm text-slate-600 flex items-center gap-1 mt-1">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{property.address}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => onToggleShortlist(property.id)}
              className="p-2 rounded-lg border border-slate-300 hover:bg-slate-50 transition-colors"
              title="Shortlist Property"
            >
              <Heart className={`w-5 h-5 ${isShortlisted ? 'text-red-600 fill-red-600' : 'text-slate-600'}`} />
            </button>
            <button 
              onClick={onClose}
              className="p-2 rounded-lg border border-slate-300 hover:bg-slate-100 transition-colors text-slate-600 hover:text-slate-900"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-6">
          
          {/* Top Gallery & Price Banner */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Gallery Section */}
            <div className="md:col-span-7 space-y-3">
              {/* Media Switcher Tabs */}
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                <button 
                  onClick={() => setActiveTab('photos')}
                  className={`text-xs font-bold px-3 py-1 rounded transition-colors ${
                    activeTab === 'photos' ? 'bg-brand-700 text-white' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  Property Photos ({property.images.length})
                </button>
                <button 
                  onClick={() => setActiveTab('floorplan')}
                  className={`text-xs font-bold px-3 py-1 rounded transition-colors ${
                    activeTab === 'floorplan' ? 'bg-brand-700 text-white' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  Floor Plan & Layout
                </button>
              </div>

              {/* Main Image View */}
              <div className="relative bg-slate-900 rounded-lg overflow-hidden h-64 sm:h-80 border border-slate-300">
                {activeTab === 'photos' ? (
                  <img 
                    src={property.images[activeImgIndex]} 
                    alt="Property Preview" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-100 p-4 flex flex-col items-center justify-center">
                    <img 
                      src={property.floorPlanUrl} 
                      alt="Floor Plan" 
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                )}
              </div>

              {/* Thumbnail Strip */}
              {activeTab === 'photos' && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {property.images.map((img, idx) => (
                    <button 
                      key={idx}
                      onClick={() => setActiveImgIndex(idx)}
                      className={`w-16 h-12 rounded overflow-hidden shrink-0 border-2 transition-all ${
                        activeImgIndex === idx ? 'border-brand-700 scale-105' : 'border-transparent opacity-70'
                      }`}
                    >
                      <img src={img} alt="thumb" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Price & Contact Form Box */}
            <div className="md:col-span-5 bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5 flex flex-col justify-between">
              <div>
                <div className="border-b border-slate-200 pb-3 mb-4">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Price</span>
                  <div className="text-3xl font-extrabold text-slate-900">{property.priceDisplay}</div>
                  <div className="text-xs text-slate-600 font-semibold mt-0.5">
                    ₹{property.pricePerSqFt.toLocaleString('en-IN')} per sq.ft • Maintenance: ₹{property.maintenanceMonthly}/mo
                  </div>
                </div>

                {/* Seller Quick Profile */}
                <div className="bg-white p-3 rounded-lg border border-slate-200 mb-4">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Listed By</div>
                  <div className="font-bold text-sm text-slate-900">{property.sellerName}</div>
                  <div className="text-xs text-emerald-700 font-semibold flex items-center gap-1 mt-0.5">
                    <ShieldCheck className="w-3.5 h-3.5" /> Verified Real Estate Listing
                  </div>
                </div>

                {/* Direct Action Buttons */}
                <div className="space-y-2.5">
                  <a 
                    href={`https://wa.me/${property.sellerWhatsApp}?text=Hi,%20I%20want%20to%20schedule%20a%20site%20visit%20for%20${encodeURIComponent(property.title)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="ez-btn-whatsapp w-full text-center py-2.5 text-sm"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Instant WhatsApp Inquiry</span>
                  </a>

                  <a 
                    href={`tel:${property.sellerPhone}`}
                    className="ez-btn-outline w-full text-center py-2.5 text-sm border-blue-400 text-brand-700 bg-blue-50/50 hover:bg-blue-100"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Call {property.sellerPhone}</span>
                  </a>
                </div>
              </div>

              {/* Inquiry Form Callback Request */}
              <div className="mt-5 pt-4 border-t border-slate-200">
                <h4 className="text-xs font-bold text-slate-800 uppercase mb-2">Request Instant Callback</h4>
                {inquirySubmitted ? (
                  <div className="bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs p-3 rounded font-medium flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Your request has been sent! The seller will call you back shortly.</span>
                  </div>
                ) : (
                  <form onSubmit={handleInquirySubmit} className="space-y-2">
                    <input 
                      type="text"
                      required
                      placeholder="Your Full Name"
                      value={buyerName}
                      onChange={(e) => setBuyerName(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-brand-600"
                    />
                    <input 
                      type="tel"
                      required
                      placeholder="Your 10-Digit Mobile Number"
                      value={buyerPhone}
                      onChange={(e) => setBuyerPhone(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-brand-600"
                    />
                    <button 
                      type="submit"
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2 rounded transition-colors"
                    >
                      Book Free Site Visit
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>

          {/* RERA Verification Certificate Banner */}
          <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-700 text-white p-2.5 rounded-lg">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-emerald-950">Official RERA Verification Status</h4>
                <p className="text-xs text-emerald-800">
                  Registration Number: <strong className="font-mono">{property.reraId}</strong>
                </p>
              </div>
            </div>
            <span className="bg-emerald-700 text-white text-xs font-bold px-3 py-1 rounded">
              Government Verified
            </span>
          </div>

          {/* Key Overview Specifications Grid */}
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-brand-700" />
              Property Specifications & Features
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-500 font-semibold block">Carpet Area</span>
                <span className="text-sm font-extrabold text-slate-900">{property.carpetArea} sq.ft</span>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block">Built-up Area</span>
                <span className="text-sm font-extrabold text-slate-900">{property.builtUpArea} sq.ft</span>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block">Facing Direction</span>
                <span className="text-sm font-extrabold text-slate-900">{property.facing}</span>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block">Floor Position</span>
                <span className="text-sm font-extrabold text-slate-900">{property.floor}</span>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block">Possession Status</span>
                <span className="text-sm font-extrabold text-slate-900">{property.possessionStatus}</span>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block">Bathrooms / Balconies</span>
                <span className="text-sm font-extrabold text-slate-900">{property.bathrooms} Baths / {property.balconies} Balconies</span>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block">Age of Building</span>
                <span className="text-sm font-extrabold text-slate-900">{property.ageOfProperty}</span>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block">Monthly Maintenance</span>
                <span className="text-sm font-extrabold text-slate-900">₹{property.maintenanceMonthly} / mo</span>
              </div>
            </div>
          </div>

          {/* Locality Advantages & Connectivity */}
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-brand-700" />
              Locality Highlights & Distances
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {property.localityAdvantages.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between bg-white border border-slate-200 p-2.5 rounded-lg text-xs">
                  <span className="font-semibold text-slate-800">{item.name}</span>
                  <span className="bg-slate-100 text-brand-800 font-bold px-2 py-0.5 rounded border border-slate-300">
                    {item.distance}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Fair Market Valuation Card */}
          {property.aiFairPriceEstimate && (
            <div className="bg-gradient-to-r from-blue-50 to-slate-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <h4 className="text-sm font-bold text-slate-900">AI Fair Price Evaluation</h4>
              </div>
              <p className="text-xs text-slate-600 mb-2">
                Based on recent government land registry records in {property.locality}, the fair value for a {property.bhk} BHK property of this size is:
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs">
                <div className="bg-white px-3 py-1.5 rounded border border-slate-300 font-bold text-slate-900">
                  Fair Range: {property.aiFairPriceEstimate.min} – {property.aiFairPriceEstimate.max}
                </div>
                <div className="bg-emerald-100 text-emerald-800 px-3 py-1.5 rounded font-bold border border-emerald-300">
                  Locality Appreciation: {property.aiFairPriceEstimate.localityGrowth5Yr} (5 Years)
                </div>
              </div>
            </div>
          )}

          {/* Detailed Property Description */}
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-2">About Property</h3>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-200">
              {property.description}
            </p>
          </div>

          {/* Quick Tool Links inside Modal */}
          <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="text-slate-500 font-semibold">Need financial assistance?</span>
            <div className="flex items-center gap-2">
              <button 
                onClick={onOpenEmi}
                className="ez-btn-outline py-1.5 px-3 text-xs"
              >
                Calculate EMI
              </button>
              <button 
                onClick={onOpenStampDuty}
                className="ez-btn-outline py-1.5 px-3 text-xs"
              >
                Check Stamp Duty
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
