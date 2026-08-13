import express from 'express';

const router = express.Router();

let LEADS_STORE = [
  {
    id: 'lead-jm-101',
    buyerName: 'Aarav Sharma',
    buyerPhone: '+91 94191 88990',
    locality: 'Gandhi Nagar',
    city: 'Jammu',
    propertyType: 'villa',
    budgetDisplay: '₹2.45 Cr',
    priceVal: 24500000,
    expectedCommissionRate: '1.5%',
    estimatedCommissionVal: '₹3.67 Lac',
    leadPriceTokens: 500,
    isPurchased: false,
    purchasedBy: null,
    inquiryDate: '25 mins ago',
    note: 'Urgent buyer looking for 4 BHK Kothi in Gandhi Nagar Green Belt.'
  },
  {
    id: 'lead-jm-102',
    buyerName: 'Priya Sundaram',
    buyerPhone: '+91 97960 33441',
    locality: 'Trikuta Nagar',
    city: 'Jammu',
    propertyType: 'apartment',
    budgetDisplay: '₹1.15 Cr',
    priceVal: 11500000,
    expectedCommissionRate: '2.0%',
    estimatedCommissionVal: '₹2.30 Lac',
    leadPriceTokens: 350,
    isPurchased: false,
    purchasedBy: null,
    inquiryDate: '2 hours ago',
    note: 'Bank manager seeking 3 BHK flat near Trikuta Nagar Sector 4.'
  }
];

// GET /api/leads
router.get('/', (req, res) => {
  res.json(LEADS_STORE);
});

// POST /api/leads/:id/buy (Broker buys lead)
router.post('/:id/buy', (req, res) => {
  const { brokerName } = req.body;
  const lead = LEADS_STORE.find(l => l.id === req.params.id);
  if (!lead) return res.status(404).json({ error: 'Lead not found' });
  lead.isPurchased = true;
  lead.purchasedBy = brokerName || 'Col. Vikram Singh (Broker)';
  res.json(lead);
});

// POST /api/leads (Admin posts lead to Marketplace)
router.post('/', (req, res) => {
  const newLead = {
    id: `lead-admin-${Date.now()}`,
    ...req.body,
    isPurchased: false,
    purchasedBy: null,
    inquiryDate: 'Just now (Admin Posted)'
  };
  LEADS_STORE.unshift(newLead);
  res.status(201).json(newLead);
});

export default router;
