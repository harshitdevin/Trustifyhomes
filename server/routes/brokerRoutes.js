import express from 'express';

const router = express.Router();

let BROKERS_STORE = [
  {
    id: 'brk-jm-001',
    name: 'Col. Vikram Singh',
    agencyName: 'Duggar Realty Jammu',
    phone: '+91 94191 12345',
    email: 'vikram.singh@gandhinagar.in',
    brokerType: 'Independent Agency',
    reraId: 'JKRERA/JM/AGENT/2024/00889',
    locality: 'Gandhi Nagar, Jammu',
    status: 'Active',
    activeListingsCount: 3,
    leadsBoughtCount: 1,
    totalCommissionEarned: '₹4.20 Lac'
  },
  {
    id: 'brk-jm-002',
    name: 'Rohit Jamwal',
    agencyName: 'Jammu Valley Properties',
    phone: '+91 94190 77112',
    email: 'rohit@jammuvalley.com',
    brokerType: 'Franchise Partner',
    reraId: 'JKRERA/JM/AGENT/2025/00142',
    locality: 'Sidhra, Jammu',
    status: 'Active',
    activeListingsCount: 2,
    leadsBoughtCount: 2,
    totalCommissionEarned: '₹3.50 Lac'
  },
  {
    id: 'brk-jm-003',
    name: 'Fake Property Dealer',
    agencyName: 'Unverified Realty Solutions',
    phone: '+91 99000 00000',
    email: 'fake.dealer@gmail.com',
    brokerType: 'Individual Dealer',
    reraId: 'PENDING_EXPIRED',
    locality: 'Janipur, Jammu',
    status: 'Blacklisted',
    activeListingsCount: 0,
    leadsBoughtCount: 0,
    totalCommissionEarned: '₹0'
  }
];

let TOKEN_BALANCES = {
  'brk-jm-001': 1200
};

// GET /api/brokers
router.get('/', (req, res) => {
  res.json(BROKERS_STORE);
});

// PUT /api/brokers/:id/blacklist (Admin toggles blacklist status)
router.put('/:id/blacklist', (req, res) => {
  const broker = BROKERS_STORE.find(b => b.id === req.params.id);
  if (!broker) return res.status(404).json({ error: 'Broker not found' });
  broker.status = broker.status === 'Active' ? 'Blacklisted' : 'Active';
  res.json(broker);
});

// GET /api/brokers/wallet/balance
router.get('/wallet/balance', (req, res) => {
  res.json({ tokenBalance: TOKEN_BALANCES['brk-jm-001'] || 1200 });
});

// POST /api/brokers/wallet/recharge
router.post('/wallet/recharge', (req, res) => {
  const { tokens } = req.body;
  const current = TOKEN_BALANCES['brk-jm-001'] || 1200;
  TOKEN_BALANCES['brk-jm-001'] = current + Number(tokens || 500);
  res.json({ tokenBalance: TOKEN_BALANCES['brk-jm-001'] });
});

export default router;
