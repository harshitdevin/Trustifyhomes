export const CITIES_DATA = [
  {
    id: 'jammu',
    name: 'Jammu',
    state: 'Jammu & Kashmir',
    stampDuty: 0.05, // 5%
    registrationFee: 0.01, // 1%
    popularLocalities: ['Gandhi Nagar', 'Trikuta Nagar', 'Channi Himmat', 'Sidhra', 'Sainik Colony', 'Janipur', 'Bantalab', 'Kot Bhalwal', 'Greater Kailash']
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
  { id: 'plot', label: 'Residential Plot / Land (Kanal)' },
  { id: 'pg', label: 'PG / Hostel / Co-Living' },
  { id: 'commercial', label: 'Commercial Shop / Office' }
];

export const BHK_OPTIONS = [
  { value: 1, label: '1 BHK' },
  { value: 2, label: '2 BHK' },
  { value: 3, label: '3 BHK' },
  { value: 4, label: '4+ BHK' }
];

export const JAMMU_COLLEGES = [
  { id: 'miet', name: 'MIET Jammu (Model Institute of Engg)', locality: 'Kot Bhalwal', city: 'Jammu', latitude: 32.793, longitude: 74.835 },
  { id: 'ju', name: 'Jammu University (Main Campus)', locality: 'Baba Saheb Ambedkar Rd', city: 'Jammu', latitude: 32.718, longitude: 74.869 },
  { id: 'ggm', name: 'GGM Science College', locality: 'Canal Road', city: 'Jammu', latitude: 32.729, longitude: 74.851 },
  { id: 'iit', name: 'IIT Jammu', locality: 'Jagti, Nagrota', city: 'Jammu', latitude: 32.812, longitude: 74.896 },
  { id: 'iim', name: 'IIM Jammu', locality: 'Canal Road / Jagti', city: 'Jammu', latitude: 32.730, longitude: 74.850 },
  { id: 'ascoms', name: 'ASCOMS Medical College', locality: 'Sidhra', city: 'Jammu', latitude: 32.755, longitude: 74.901 }
];

export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  if (lat1 === undefined || lon1 === undefined || lat2 === undefined || lon2 === undefined || lat1 === null || lon1 === null || lat2 === null || lon2 === null) {
    return null;
  }
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const dist = R * c;
  return Number(dist.toFixed(1));
}
