export const CITIES_DATA = [
  {
    id: 'jammu',
    name: 'Jammu',
    state: 'Jammu & Kashmir',
    stampDuty: 0.05, // 5%
    registrationFee: 0.01, // 1%
    popularLocalities: ['Gandhi Nagar', 'Trikuta Nagar', 'Channi Himmat', 'Sidhra', 'Sainik Colony', 'Janipur', 'Bantalab', 'Greater Kailash']
  },
  {
    id: 'bengaluru',
    name: 'Bengaluru',
    state: 'Karnataka',
    stampDuty: 0.05,
    registrationFee: 0.01,
    popularLocalities: ['Whitefield', 'HSR Layout', 'Indiranagar', 'Electronic City', 'Koramangala', 'Sarjapur Road']
  },
  {
    id: 'mumbai',
    name: 'Mumbai',
    state: 'Maharashtra',
    stampDuty: 0.06,
    registrationFee: 0.01,
    popularLocalities: ['Bandra West', 'Andheri East', 'Powai', 'Thane West', 'Navi Mumbai']
  },
  {
    id: 'delhi-ncr',
    name: 'Delhi NCR',
    state: 'Haryana/Delhi',
    stampDuty: 0.06,
    registrationFee: 0.01,
    popularLocalities: ['Gurgaon Golf Course Rd', 'Noida Sector 62', 'Dwarka Sector 12']
  }
];

export const PROPERTY_TYPES = [
  { id: 'all', label: 'All Property Types' },
  { id: 'apartment', label: 'Apartment / Flat' },
  { id: 'villa', label: 'Independent Villa / Kothi' },
  { id: 'house', label: 'Builder Floor / House' },
  { id: 'plot', label: 'Residential Plot / Land (Kanal)' }
];

export const BHK_OPTIONS = [
  { value: 1, label: '1 BHK' },
  { value: 2, label: '2 BHK' },
  { value: 3, label: '3 BHK' },
  { value: 4, label: '4+ BHK' }
];
