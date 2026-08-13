import express from 'express';

const router = express.Router();

const AUDIT_LOGS_STORE = [
  {
    id: 'audit-1',
    timestamp: '14 Aug 2026, 01:15 AM',
    action: 'LEAD_PURCHASED',
    actor: 'Col. Vikram Singh (Broker)',
    details: 'Unlocked phone lead for Vikram Mehta (NRI) - 1 Kanal Sidhra Plot',
    severity: 'info'
  },
  {
    id: 'audit-2',
    timestamp: '14 Aug 2026, 12:45 AM',
    action: 'BROKER_BLACKLISTED',
    actor: 'Admin Superuser',
    details: 'Blacklisted Fake Property Dealer (Unverified Realty Solutions)',
    severity: 'warning'
  },
  {
    id: 'audit-3',
    timestamp: '13 Aug 2026, 11:30 PM',
    action: 'PROPERTY_APPROVED',
    actor: 'Admin Superuser',
    details: 'Approved JK RERA ID JKRERA/JM/2026/00101 for Gandhi Nagar Kothi',
    severity: 'success'
  }
];

// GET /api/audit-logs
router.get('/', (req, res) => {
  res.json(AUDIT_LOGS_STORE);
});

export default router;
