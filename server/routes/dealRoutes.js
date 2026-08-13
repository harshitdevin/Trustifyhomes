import express from 'express';

const router = express.Router();

const DEALS_STORE = [
  {
    id: 'deal-jm-501',
    propertyTitle: 'Luxury 4 BHK Kothi in Gandhi Nagar',
    buyerName: 'Ramesh Jamwal',
    brokerName: 'Col. Vikram Singh',
    dealAmountDisplay: '₹2.45 Cr',
    dealAmountVal: 24500000,
    brokerCommission: '₹3.67 Lac (1.5%)',
    platformCut: '₹24,500 (0.1%)',
    stage: 'Token Paid (Advance)',
    date: '12 Aug 2026',
    status: 'In Progress'
  },
  {
    id: 'deal-jm-502',
    propertyTitle: 'Trikuta Heights 3 BHK Flat',
    buyerName: 'Priya Sundaram',
    brokerName: 'Rohit Jamwal',
    dealAmountDisplay: '₹1.15 Cr',
    dealAmountVal: 11500000,
    brokerCommission: '₹2.30 Lac (2.0%)',
    platformCut: '₹11,500 (0.1%)',
    stage: 'Registry Completed',
    date: '08 Aug 2026',
    status: 'Completed'
  }
];

// GET /api/deals
router.get('/', (req, res) => {
  res.json(DEALS_STORE);
});

export default router;
