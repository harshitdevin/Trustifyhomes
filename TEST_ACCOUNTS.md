# Development Test Accounts & Role Permissions Matrix

> [!IMPORTANT]
> These credentials are for **development and testing environments ONLY**.  
> Do **NOT** use these credentials in production environments. Production admin users must be created through secure server-side provisioning.

---

## 1. Development Test Credentials

| Role | Email | Password (Development Only) | Purpose |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@trustifyhomes.test` | `CHANGE_ME_ADMIN_123!` | Master Admin Control, Lead Intelligence, Broker Assignment, Property Approvals |
| **Buyer** | `buyer@trustifyhomes.test` | `CHANGE_ME_BUYER_123!` | Property Search, Viewing, Saving, Enquiries, Site Visit Requests |
| **Owner** | `owner@trustifyhomes.test` | `CHANGE_ME_OWNER_123!` | Free Property Posting, Listing Management, Direct Enquiries |
| **Broker** | `broker@trustifyhomes.test` | `CHANGE_ME_BROKER_123!` | Broker Lead Hub, Assigned Leads Pipeline, Token Wallet, Inventory |
| **Student** | `student@trustifyhomes.test` | `CHANGE_ME_STUDENT_123!` | PG & Hostel Search, College Proximity Filters |

---

## 2. Role Permissions Matrix

| Capability | Buyer | Owner | Broker | Student | Admin |
| :--- | :---: | :---: | :---: | :---: | :---: |
| Search & Filter Properties | ✅ | ✅ | ✅ | ✅ | ✅ |
| View Approved Property Details | ✅ | ✅ | ✅ | ✅ | ✅ |
| Save / Shortlist Properties | ✅ | ✅ | ✅ | ✅ | ✅ |
| Submit Enquiry / Site Visit | ✅ | ❌ | ❌ | ✅ | ❌ |
| Post Free Property | ❌ | ✅ | ✅ | ❌ | ✅ |
| Manage Own Listings | ❌ | ✅ | ✅ | ❌ | ✅ |
| Receive Assigned Leads | ❌ | ❌ | ✅ | ❌ | ❌ |
| Update Assigned Lead Status | ❌ | ❌ | ✅ | ❌ | ❌ |
| View Lead Intelligence Hub | ❌ | ❌ | ❌ | ❌ | ✅ |
| Assign Lead to Broker | ❌ | ❌ | ❌ | ❌ | ✅ |
| Approve / Moderate Listings | ❌ | ❌ | ❌ | ❌ | ✅ |
| Blacklist / Verify Brokers | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## 3. Environment Admin Setup Setup

To initialize an admin user in a new environment, set the following environment variables in `.env`:

```env
ADMIN_SETUP_EMAIL=admin@trustifyhomes.test
ADMIN_SETUP_PASSWORD=YOUR_SECURE_ADMIN_PASSWORD_HERE
```

> **Security Note**: These setup credentials must never be committed to Git or exposed in browser code.
