import React from 'react';
import { X, ShieldCheck, Layers, MapPin, Building2 } from 'lucide-react';

export default function CompareModal({ comparedProperties, onClose, onRemoveCompare }) {
  if (!comparedProperties || comparedProperties.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-5xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 relative my-auto max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-5 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            <div className="bg-brand-100 text-brand-800 p-2 rounded-lg">
              <Layers className="w-5 h-5 text-brand-700" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">Side-by-Side Property Comparison</h3>
              <p className="text-xs text-slate-500">Comparing {comparedProperties.length} selected properties</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Matrix Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr>
                <th className="p-3 bg-slate-100 font-extrabold text-slate-700 w-1/4 border border-slate-200">
                  Feature / Parameter
                </th>
                {comparedProperties.map((p) => (
                  <th key={p.id} className="p-3 bg-slate-50 font-bold text-slate-900 w-1/4 border border-slate-200 align-top">
                    <div className="flex justify-between items-start mb-2">
                      <span className="bg-blue-100 text-brand-800 text-[10px] font-extrabold px-1.5 py-0.5 rounded">
                        {p.bhk} BHK
                      </span>
                      <button 
                        onClick={() => onRemoveCompare(p.id)}
                        className="text-slate-400 hover:text-red-600 font-bold"
                        title="Remove from comparison"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="font-extrabold text-sm line-clamp-1">{p.title}</div>
                    <div className="text-[11px] text-slate-500 font-semibold">{p.locality}, {p.city}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium text-slate-800">
              {/* Photo Preview */}
              <tr>
                <td className="p-3 bg-slate-50 font-bold text-slate-700 border border-slate-200">Image</td>
                {comparedProperties.map(p => (
                  <td key={p.id} className="p-3 border border-slate-200">
                    <img src={p.images[0]} alt={p.title} className="w-full h-24 object-cover rounded border border-slate-200" />
                  </td>
                ))}
              </tr>

              {/* Price */}
              <tr>
                <td className="p-3 bg-slate-50 font-bold text-slate-700 border border-slate-200">Price Display</td>
                {comparedProperties.map(p => (
                  <td key={p.id} className="p-3 border border-slate-200 font-extrabold text-sm text-slate-900">
                    {p.priceDisplay}
                  </td>
                ))}
              </tr>

              {/* Rate per Sq.Ft */}
              <tr>
                <td className="p-3 bg-slate-50 font-bold text-slate-700 border border-slate-200">Price / Sq.Ft</td>
                {comparedProperties.map(p => (
                  <td key={p.id} className="p-3 border border-slate-200 font-bold text-brand-700">
                    ₹{p.pricePerSqFt.toLocaleString('en-IN')} / sq.ft
                  </td>
                ))}
              </tr>

              {/* Carpet Area */}
              <tr>
                <td className="p-3 bg-slate-50 font-bold text-slate-700 border border-slate-200">Carpet Area</td>
                {comparedProperties.map(p => (
                  <td key={p.id} className="p-3 border border-slate-200 font-extrabold">
                    {p.carpetArea} sq.ft
                  </td>
                ))}
              </tr>

              {/* RERA Verified Status */}
              <tr>
                <td className="p-3 bg-slate-50 font-bold text-slate-700 border border-slate-200">RERA Status</td>
                {comparedProperties.map(p => (
                  <td key={p.id} className="p-3 border border-slate-200">
                    {p.isReraVerified ? (
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" /> Verified
                      </span>
                    ) : 'Pending'}
                  </td>
                ))}
              </tr>

              {/* Facing Direction */}
              <tr>
                <td className="p-3 bg-slate-50 font-bold text-slate-700 border border-slate-200">Facing (Vaastu)</td>
                {comparedProperties.map(p => (
                  <td key={p.id} className="p-3 border border-slate-200">{p.facing}</td>
                ))}
              </tr>

              {/* Possession */}
              <tr>
                <td className="p-3 bg-slate-50 font-bold text-slate-700 border border-slate-200">Possession Status</td>
                {comparedProperties.map(p => (
                  <td key={p.id} className="p-3 border border-slate-200">{p.possessionStatus}</td>
                ))}
              </tr>

              {/* Seller Type */}
              <tr>
                <td className="p-3 bg-slate-50 font-bold text-slate-700 border border-slate-200">Seller Type</td>
                {comparedProperties.map(p => (
                  <td key={p.id} className="p-3 border border-slate-200 font-bold">{p.sellerType}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        <button 
          onClick={onClose} 
          className="w-full mt-5 bg-brand-700 hover:bg-brand-800 text-white font-bold text-xs py-2.5 rounded transition-colors"
        >
          Close Comparison
        </button>
      </div>
    </div>
  );
}
