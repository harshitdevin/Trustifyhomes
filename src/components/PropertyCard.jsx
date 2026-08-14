import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  ShieldCheck, 
  Heart, 
  Phone, 
  MessageSquare, 
  ChevronLeft, 
  ChevronRight,
  Maximize2,
  CheckSquare,
  Square,
  Sparkles,
  Compass,
  GraduationCap,
  Home,
  Users,
  Utensils,
  AlertCircle
} from 'lucide-react';

export default function PropertyCard({ 
  property, 
  onSelectProperty, 
  isShortlisted, 
  onToggleShortlist, 
  isCompared, 
  onToggleCompare,
  selectedCollegeObj
}) {
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const [showPhone, setShowPhone] = useState(false);

  const images = property.images && property.images.length > 0 
    ? property.images 
    : ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1000&q=80'];

  const nextImg = (e) => {
    e.stopPropagation();
    setCurrentImgIndex((prev) => (prev + 1) % images.length);
  };

  const prevImg = (e) => {
    e.stopPropagation();
    setCurrentImgIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const isPg = property.listingType === 'pg' || property.propertyType === 'pg';
  const isUnavailable = property.status && property.status !== 'approved' && property.status !== 'Approved' && property.status !== 'Active';

  return (
    <div className={`ez-card flex flex-col sm:flex-row overflow-hidden group border ${
      isUnavailable ? 'border-amber-300 bg-amber-50/20 opacity-90' : 'border-slate-200'
    }`}>
      
      {/* Property Image Container */}
      <div className="sm:w-2/5 relative bg-slate-900 min-h-[220px] sm:min-h-[260px] overflow-hidden shrink-0">
        <img 
          src={images[currentImgIndex]} 
          alt={property.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Top Image Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap items-center gap-1.5 z-10">
          {isPg ? (
            <span className="bg-purple-900 text-white text-[11px] font-extrabold px-2 py-0.5 rounded flex items-center gap-1 shadow-sm uppercase">
              <Home className="w-3.5 h-3.5 text-amber-400" />
              {property.pgGender || 'PG / Hostel'}
            </span>
          ) : (
            property.isReraVerified && (
              <span className="bg-emerald-700 text-white text-[11px] font-bold px-2 py-0.5 rounded flex items-center gap-1 shadow-sm">
                <ShieldCheck className="w-3.5 h-3.5" />
                RERA Verified
              </span>
            )
          )}

          {property.foodIncluded && (
            <span className="bg-amber-600 text-white text-[11px] font-bold px-2 py-0.5 rounded flex items-center gap-1 shadow-sm">
              <Utensils className="w-3.5 h-3.5" />
              Food Included
            </span>
          )}

          {property.sellerType === 'Owner' && !isPg && (
            <span className="bg-blue-600 text-white text-[11px] font-bold px-2 py-0.5 rounded shadow-sm">
              Zero Brokerage
            </span>
          )}

          {isUnavailable && (
            <span className="bg-amber-700 text-white text-[11px] font-bold px-2 py-0.5 rounded flex items-center gap-1 shadow-sm">
              <AlertCircle className="w-3.5 h-3.5" />
              Listing No Longer Available
            </span>
          )}
        </div>

        {/* Shortlist Heart Button */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onToggleShortlist(property.id);
          }}
          className="absolute top-2.5 right-2.5 bg-white/90 hover:bg-white p-2 rounded-full shadow-md z-10 transition-colors"
          title={isShortlisted ? "Remove from shortlist" : "Save property"}
        >
          <Heart className={`w-4 h-4 ${isShortlisted ? 'text-red-600 fill-red-600' : 'text-slate-600'}`} />
        </button>

        {/* Photo Navigation Arrows */}
        {images.length > 1 && (
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-2 pointer-events-none">
            <button 
              onClick={prevImg}
              className="bg-black/50 hover:bg-black/80 text-white p-1 rounded-full pointer-events-auto transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button 
              onClick={nextImg}
              className="bg-black/50 hover:bg-black/80 text-white p-1 rounded-full pointer-events-auto transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Photo Count Indicator */}
        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded">
          {currentImgIndex + 1} / {images.length} Photos
        </div>
      </div>

      {/* Property Details Column */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Title & Price Header */}
          <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
            <div>
              <span className={`text-[11px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded border ${
                isPg ? 'bg-purple-50 text-purple-900 border-purple-200' : 'bg-blue-50 text-brand-700 border-blue-200'
              }`}>
                {isPg ? `${property.roomType || 'Student PG'} • ${property.pgGender || 'Co-living'}` : `${property.bhk} BHK • ${property.propertyType}`}
              </span>
              <h3 
                onClick={() => onSelectProperty(property)}
                className="text-base sm:text-lg font-bold text-slate-900 mt-1 hover:text-brand-700 cursor-pointer line-clamp-1"
              >
                {property.title}
              </h3>
              <p className="text-xs text-slate-600 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{property.locality}, {property.city}</span>
              </p>
            </div>

            {/* Price Box */}
            <div className="text-right">
              <div className="text-xl sm:text-2xl font-extrabold text-slate-900">
                {property.priceDisplay}
              </div>
              <p className="text-xs font-semibold text-slate-500">
                {isPg ? (property.depositDisplay || 'Low Security Deposit') : `₹${(property.pricePerSqFt || 5000).toLocaleString('en-IN')} / sq.ft`}
              </p>
            </div>
          </div>

          {/* Key Specs Grid Bar */}
          <div className="bg-slate-50 border border-slate-200 rounded-md p-2.5 my-3 grid grid-cols-3 gap-2 text-xs">
            {isPg ? (
              <>
                <div>
                  <span className="text-purple-800 text-[10px] uppercase font-bold block">Room Sharing</span>
                  <span className="font-extrabold text-slate-800">{property.roomType || '2 Sharing'}</span>
                </div>
                <div>
                  <span className="text-emerald-700 text-[10px] uppercase font-bold block">Available Beds</span>
                  <span className="font-extrabold text-emerald-800">{property.availableBeds ? `${property.availableBeds} beds available` : 'Beds Available'}</span>
                </div>
                <div>
                  <span className="text-brand-700 text-[10px] uppercase font-bold block">College Proximity</span>
                  <span className="font-extrabold text-slate-800 truncate block">
                    {property.collegeDistanceKm !== undefined ? `⚡ ${property.collegeDistanceKm} km (${property.collegeName || 'College'})` : 'Distance unavailable'}
                  </span>
                </div>
              </>
            ) : (
              <>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Carpet Area</span>
                  <span className="font-extrabold text-slate-800">{property.carpetArea} sq.ft</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Facing</span>
                  <span className="font-extrabold text-slate-800 truncate block">{property.facing}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Possession</span>
                  <span className="font-extrabold text-slate-800">{property.possessionStatus}</span>
                </div>
              </>
            )}
          </div>

          {/* Key Amenities Badges Chips */}
          {property.amenities && property.amenities.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 mb-3">
              {property.amenities.slice(0, 4).map((a, idx) => (
                <span key={idx} className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded border border-slate-200">
                  {a}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons Row */}
        <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
          {/* Compare Checkbox (For standard properties) */}
          {!isPg ? (
            <button 
              onClick={() => onToggleCompare(property.id)}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              {isCompared ? (
                <CheckSquare className="w-4 h-4 text-brand-700" />
              ) : (
                <Square className="w-4 h-4 text-slate-400" />
              )}
              <span>Compare</span>
            </button>
          ) : (
            <div className="text-[10px] font-bold text-purple-900 flex items-center gap-1">
              <GraduationCap className="w-3.5 h-3.5 text-purple-700" />
              Verified Student Housing
            </div>
          )}

          {/* CTAs: WhatsApp, Call, View Details */}
          <div className="flex items-center gap-2">
            <a 
              href={`https://wa.me/${property.sellerWhatsApp}?text=Hi,%20I%20am%20interested%20in%20your%20listing:%20${encodeURIComponent(property.title)}`}
              target="_blank"
              rel="noreferrer"
              className="ez-btn-whatsapp py-1.5 px-3 text-xs"
              title="Chat on WhatsApp"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">WhatsApp</span>
            </a>

            <button 
              onClick={() => setShowPhone(!showPhone)}
              className="ez-btn-outline py-1.5 px-3 text-xs border-blue-300 text-brand-700 bg-blue-50/50 hover:bg-blue-100"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>{showPhone ? property.sellerPhone : (isPg ? 'Call Warden' : 'Call Owner')}</span>
            </button>

            <button 
              onClick={() => onSelectProperty(property)}
              className={`py-1.5 px-3 text-xs font-extrabold rounded text-white transition-all shadow-xs ${
                isPg ? 'bg-purple-900 hover:bg-purple-950' : 'bg-slate-900 hover:bg-slate-800'
              }`}
            >
              <span>{isPg ? 'View PG' : 'View Details'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
