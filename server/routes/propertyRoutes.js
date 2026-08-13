import express from 'express';

const router = express.Router();

// Initial Jammu Properties Dataset for REST API
let PROPERTIES_STORE = [
  {
    id: 'ez-jm-101',
    title: 'Luxury 4 BHK Independent Kothi in Gandhi Nagar',
    listingType: 'buy',
    propertyType: 'villa',
    city: 'Jammu',
    locality: 'Gandhi Nagar',
    address: 'Near Apsara Multiplex, Green Belt Park, Gandhi Nagar, Jammu',
    priceVal: 24500000,
    priceDisplay: '₹2.45 Cr',
    pricePerSqFt: 6805,
    bhk: 4,
    bathrooms: 4,
    balconies: 3,
    carpetArea: 3600,
    builtUpArea: 4100,
    floor: 'Independent G+2 House',
    facing: 'East (Vaastu Compliant)',
    possessionStatus: 'Ready to Move',
    ageOfProperty: '2 Years',
    maintenanceMonthly: 2000,
    reraId: 'JKRERA/JM/2026/00101',
    isReraVerified: true,
    sellerType: 'Owner',
    sellerName: 'Col. Vikram Singh (Direct Owner)',
    sellerPhone: '+91 94191 12345',
    sellerWhatsApp: '919419112345',
    images: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80'
    ],
    floorPlanUrl: 'https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=1000&q=80',
    amenities: ['Private Lawns', 'Covered Car Parking (3 Cars)', '24x7 Water Supply', 'Power Backup'],
    localityAdvantages: [{ name: 'Gandhi Nagar Main Market', distance: '0.4 km' }],
    aiFairPriceEstimate: { min: '₹2.35 Cr', max: '₹2.55 Cr', valuationStatus: 'Fair Price', localityGrowth5Yr: '+22.4%' },
    description: 'Prime 4 BHK Independent Luxury Kothi in Gandhi Nagar Green Belt locality.'
  },
  {
    id: 'ez-jm-102',
    title: 'Trikuta Heights - 3 BHK Premium Gated Flat',
    listingType: 'buy',
    propertyType: 'apartment',
    city: 'Jammu',
    locality: 'Trikuta Nagar',
    address: 'Sector 4, Near Easyday, Trikuta Nagar, Jammu',
    priceVal: 11500000,
    priceDisplay: '₹1.15 Cr',
    pricePerSqFt: 6216,
    bhk: 3,
    bathrooms: 3,
    balconies: 2,
    carpetArea: 1850,
    builtUpArea: 2050,
    floor: '5th of 10 Floors',
    facing: 'North-East',
    possessionStatus: 'Ready to Move',
    ageOfProperty: '1 Year',
    maintenanceMonthly: 3500,
    reraId: 'JKRERA/JM/2026/00102',
    isReraVerified: true,
    sellerType: 'Broker',
    sellerName: 'Duggar Realty Jammu (Verified Dealer)',
    sellerPhone: '+91 97960 88776',
    sellerWhatsApp: '919796088776',
    images: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1000&q=80'
    ],
    floorPlanUrl: 'https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=1000&q=80',
    amenities: ['Gated 24x7 Security', 'Elevator', 'Clubhouse & Gym'],
    localityAdvantages: [{ name: 'Railway Station Jammu', distance: '1.8 km' }],
    aiFairPriceEstimate: { min: '₹1.10 Cr', max: '₹1.20 Cr', valuationStatus: 'Good Deal', localityGrowth5Yr: '+26.0%' },
    description: 'Modern 3 BHK apartment in gated complex in Trikuta Nagar Sector 4.'
  }
];

// GET /api/properties
router.get('/', (req, res) => {
  const { city, locality, bhk, propertyType } = req.query;
  let result = [...PROPERTIES_STORE];
  if (city) result = result.filter(p => p.city.toLowerCase() === city.toLowerCase());
  if (locality) result = result.filter(p => p.locality.toLowerCase().includes(locality.toLowerCase()));
  if (bhk) result = result.filter(p => p.bhk === Number(bhk));
  if (propertyType && propertyType !== 'all') result = result.filter(p => p.propertyType === propertyType);
  res.json(result);
});

// POST /api/properties (Broker/Admin post property)
router.post('/', (req, res) => {
  const newProp = {
    id: `ez-jm-${Date.now()}`,
    ...req.body,
    isReraVerified: req.body.isReraVerified || true
  };
  PROPERTIES_STORE.unshift(newProp);
  res.status(201).json(newProp);
});

// PUT /api/properties/:id/approve
router.put('/:id/approve', (req, res) => {
  const prop = PROPERTIES_STORE.find(p => p.id === req.params.id);
  if (!prop) return res.status(404).json({ error: 'Property not found' });
  prop.isReraVerified = true;
  res.json(prop);
});

// DELETE /api/properties/:id
router.delete('/:id', (req, res) => {
  PROPERTIES_STORE = PROPERTIES_STORE.filter(p => p.id !== req.params.id);
  res.json({ message: 'Property deleted successfully' });
});

export default router;
