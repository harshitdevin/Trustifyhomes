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
  AlertCircle,
  GraduationCap,
  Home,
  Users,
  Utensils,
  Clock,
  CheckCircle,
  Lock
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

  // Callback / Enquiry Form state
  const [inquirySubmitted, setInquirySubmitted] = useState(false);
  const [buyerName, setBuyerName] = useState(currentUser?.email ? currentUser.email.split('@')[0] : '');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [isSubmittingEnquiry, setIsSubmittingEnquiry] = useState(false);
  const [enquiryError, setEnquiryError] = useState('');

  // Site Visit Booking Modal state
  const [isVisitModalOpen, setIsVisitModalOpen] = useState(false);
  const [visitDate, setVisitDate] = useState(() => new Date(Date.now() + 86400000).toISOString().split('T')[0]);
  const [visitTimeSlot, setVisitTimeSlot] = useState('11:00 AM');
  const [visitMessage, setVisitMessage] = useState('');
  const [isSubmittingVisit, setIsSubmittingVisit] = useState(false);
  const [visitSubmitted, setVisitSubmitted] = useState(false);

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

  const isPg = property.listingType === 'pg' || property.propertyType === 'pg';
  const images = property.images && property.images.length > 0 
    ? property.images 
    : ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1000&q=80'];

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
        eventType: isPg ? 'pg_enquiry_created' : 'enquiry_created',
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

  const handleSiteVisitSubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingVisit(true);

    try {
      await supabaseService.submitSiteVisit({
        propertyId: property.id,
        customerId: currentUser?.id || null,
        customerName: buyerName || 'Guest User',
        customerPhone: buyerPhone || '+91 94191 00000',
        requestedDate: visitDate,
        requestedTime: visitTimeSlot,
        message: visitMessage
      });

      leadIntelligenceService.trackActivityEvent({
        userId: currentUser?.id || 'cust-101',
        eventType: 'site_visit_requested',
        propertyId: property.id,
        locality: property.locality,
        propertyType: property.propertyType
      });

      setVisitSubmitted(true);
    } catch (err) {
      alert(err.message || 'Failed to request site visit slot.');
    } finally {
      setIsSubmittingVisit(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 flex flex-col my-auto">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-start justify-between gap-4 sticky top-0 bg-white z-20 shadow-xs">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded border uppercase ${
                isPg ? 'bg-purple-100 text-purple-900 border-purple-300' : 'bg-brand-50 text-brand-800 border-blue-200'
              }`}>
                {isPg ? `${property.roomType || 'Student PG'} • ${property.pgGender || 'Co-living'}` : `${property.bhk} BHK ${property.propertyType}`}
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
              <span>{property.address || `${property.locality}, ${property.city}`}</span>
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
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                <button 
                  onClick={() => setActiveTab('photos')}
                  className={`text-xs font-bold px-3 py-1 rounded transition-colors ${
                    activeTab === 'photos' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  Listing Photos ({images.length})
                </button>
                {!isPg && property.floorPlanUrl && (
                  <button 
                    onClick={() => setActiveTab('floorplan')}
                    className={`text-xs font-bold px-3 py-1 rounded transition-colors ${
                      activeTab === 'floorplan' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    Floor Plan
                  </button>
                )}
              </div>

              {/* Main Image View */}
              <div className="relative bg-slate-900 rounded-lg overflow-hidden h-64 sm:h-80 border border-slate-300">
                {activeTab === 'photos' ? (
                  <img 
                    src={images[activeImgIndex]} 
                    alt="Listing Preview" 
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
              {activeTab === 'photos' && images.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {images.map((img, idx) => (
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

            {/* Price & Action Sidebar Box */}
            <div className="md:col-span-5 bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5 flex flex-col justify-between">
              <div>
                <div className="border-b border-slate-200 pb-3 mb-4">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {isPg ? 'Monthly Rent' : 'Total Price'}
                  </span>
                  <div className="text-3xl font-extrabold text-slate-900">{property.priceDisplay}</div>
                  <div className="text-xs text-slate-600 font-semibold mt-0.5">
                    {isPg ? (property.depositDisplay || '₹5,000 Security Deposit') : `₹${(property.pricePerSqFt || 5000).toLocaleString('en-IN')} per sq.ft`}
                  </div>
                </div>

                {/* Seller / Warden Profile */}
                <div className="bg-white p-3 rounded-lg border border-slate-200 mb-4">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    {isPg ? 'PG Owner / Warden' : 'Listed By'}
                  </div>
                  <div className="font-bold text-sm text-slate-900">{property.sellerName}</div>
                  <div className="text-xs text-emerald-700 font-semibold flex items-center gap-1 mt-0.5">
                    <ShieldCheck className="w-3.5 h-3.5" /> Verified Real Estate Listing
                  </div>
                </div>

                {/* Direct Actions */}
                <div className="space-y-2.5">
                  <button 
                    onClick={() => setIsVisitModalOpen(true)}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs py-3 rounded transition-colors flex items-center justify-center gap-2 uppercase tracking-wider shadow-sm"
                  >
                    <Calendar className="w-4 h-4 text-amber-400" />
                    <span>Request Site Visit Slot</span>
                  </button>

                  <a 
                    href={`https://wa.me/${property.sellerWhatsApp}?text=Hi,%20I%20want%20to%20inquire%20about%20${encodeURIComponent(property.title)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="ez-btn-whatsapp w-full text-center py-2 text-xs"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>WhatsApp Inquiry</span>
                  </a>

                  <a 
                    href={`tel:${property.sellerPhone}`}
                    className="ez-btn-outline w-full text-center py-2 text-xs border-blue-400 text-brand-700 bg-blue-50/50 hover:bg-blue-100"
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
                      className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-900 focus:outline-none"
                    />
                    <input 
                      type="tel"
                      required
                      placeholder="Your Mobile Number"
                      value={buyerPhone}
                      onChange={(e) => setBuyerPhone(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-900 focus:outline-none"
                    />
                    <button 
                      type="submit"
                      disabled={isSubmittingEnquiry}
                      className="w-full bg-brand-700 hover:bg-brand-800 text-white font-bold text-xs py-2 rounded transition-colors"
                    >
                      {isSubmittingEnquiry ? 'Submitting...' : 'Request Callback'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>

          {/* Specifications & Features */}
          {isPg ? (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-purple-700" />
                PG Facilities & College Proximity
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-purple-50 p-4 rounded-xl border border-purple-200 text-xs">
                <div>
                  <span className="text-purple-800 font-semibold block">Room Type</span>
                  <span className="text-sm font-extrabold text-slate-900">{property.roomType || '2 Sharing'}</span>
                </div>
                <div>
                  <span className="text-purple-800 font-semibold block">Gender Category</span>
                  <span className="text-sm font-extrabold text-slate-900">{property.pgGender || 'Co-living'}</span>
                </div>
                <div>
                  <span className="text-purple-800 font-semibold block">Available Beds</span>
                  <span className="text-sm font-extrabold text-emerald-700">{property.availableBeds ? `${property.availableBeds} beds available` : 'Beds Available'}</span>
                </div>
                <div>
                  <span className="text-purple-800 font-semibold block">College Distance</span>
                  <span className="text-sm font-extrabold text-slate-900">
                    {property.collegeDistanceKm !== undefined ? `⚡ ${property.collegeDistanceKm} km (${property.collegeName || 'College'})` : 'Distance unavailable'}
                  </span>
                </div>
              </div>

              {/* PG Rules & Food Menu */}
              {property.rules && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
                  <h4 className="font-extrabold text-slate-900 uppercase">PG House Rules & Security</h4>
                  <ul className="list-disc list-inside space-y-1 text-slate-700 font-medium">
                    {property.rules.map((rule, idx) => (
                      <li key={idx}>{rule}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
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
                  <span className="text-slate-500 font-semibold block">Bathrooms</span>
                  <span className="text-sm font-extrabold text-slate-900">{property.bathrooms} Baths</span>
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
          )}

          {/* Amenities Grid */}
          {property.amenities && property.amenities.length > 0 && (
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-3">Amenities Included</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {property.amenities.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-slate-50 border border-slate-200 p-2 rounded-lg text-xs font-semibold text-slate-800">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-2">About Listing</h3>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-200">
              {property.description}
            </p>
          </div>
        </div>
      </div>

      {/* SITE VISIT BOOKING MODAL */}
      {isVisitModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative text-xs font-semibold text-slate-700">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-700" />
                Schedule Physical Site Visit Slot
              </h3>
              <button onClick={() => setIsVisitModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {visitSubmitted ? (
              <div className="text-center py-6 space-y-3">
                <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto" />
                <h4 className="text-base font-extrabold text-slate-900">Site Visit Requested!</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Your request for <strong className="text-slate-900">{visitDate} at {visitTimeSlot}</strong> has been logged with status <strong className="text-purple-800 uppercase font-extrabold">Requested</strong>.
                </p>
                <div className="bg-amber-50 text-amber-900 text-[11px] p-2.5 rounded border border-amber-200 font-medium">
                  <strong>Notice:</strong> Owner/Broker must confirm the visit slot. You will receive an update once confirmed.
                </div>
                <button 
                  onClick={() => { setIsVisitModalOpen(false); setVisitSubmitted(false); }}
                  className="bg-slate-900 text-white font-bold text-xs py-2 px-4 rounded mt-3"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleSiteVisitSubmit} className="space-y-4">
                <div>
                  <label className="block text-slate-500 uppercase tracking-wider mb-1 text-[10px]">Preferred Date</label>
                  <input 
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={visitDate}
                    onChange={(e) => setVisitDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 uppercase tracking-wider mb-1 text-[10px]">Preferred Time Slot</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['10:00 AM', '01:30 PM', '04:00 PM', '06:00 PM'].map(slot => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setVisitTimeSlot(slot)}
                        className={`p-2 rounded text-xs font-bold border transition-all ${
                          visitTimeSlot === slot ? 'bg-purple-900 text-white border-purple-900' : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-slate-500 uppercase tracking-wider mb-1 text-[10px]">Your Name & Contact</label>
                  <div className="space-y-2">
                    <input 
                      type="text"
                      required
                      placeholder="Your Full Name"
                      value={buyerName}
                      onChange={(e) => setBuyerName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs font-bold text-slate-900"
                    />
                    <input 
                      type="tel"
                      required
                      placeholder="Your Mobile Number"
                      value={buyerPhone}
                      onChange={(e) => setBuyerPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs font-bold text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-500 uppercase tracking-wider mb-1 text-[10px]">Optional Message / Instructions</label>
                  <textarea 
                    rows={2}
                    placeholder="e.g. Please bring floor plan documents..."
                    value={visitMessage}
                    onChange={(e) => setVisitMessage(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs text-slate-900"
                  />
                </div>

                <button 
                  type="submit"
                  disabled={isSubmittingVisit}
                  className="w-full bg-purple-900 hover:bg-purple-950 text-white font-extrabold text-xs py-3 rounded transition-colors uppercase tracking-wider shadow-sm"
                >
                  {isSubmittingVisit ? 'Submitting Slot Request...' : 'Confirm Request Slot'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
